import { prisma } from "../../lib/prisma.js";
import { GoogleGenerativeAI } from "@google/generative-ai";
import "dotenv/config";
import { uploadFileToFirebase } from "./FileUploadControllers/uploadController.js";
import { bucket } from "../Config/firebase.js";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
// console.log(ai);
// Change this in your checkModels function
// const result = await ai.models.list();
// console.log("Available Models:", result);

export async function createLabReportAI(req, res) {
  const doctorId = req.user.sub;
  const { patientId } = req.params;
  const file = req.file;

  let savedPath = null;

  try {
    // 1️✅ validate file
    if (!file) {
      return res.status(400).json({ success: false, message: "File required" });
    }

    const model = genAI.getGenerativeModel({
      model: "models/gemini-3-flash-preview",
      generationConfig: { responseMimeType: "application/json" }, // Forces JSON output
    });
    // 2. Send prompt + file
    const prompt = `
        You are a medical data extraction engine for a digital health record system.
        Analyze the uploaded medical lab report and extract ONLY structured clinical data.
        Return STRICT JSON in this exact format:
        {
            "testName": string,
            "category": string | null,
            "labName": string,
            "reportDate": string | null,
            "results": [
                    {
                    "parameter": string,
                    "value": string,
                    "unit": string | null,
                    "referenceRange": string | null,
                    "status": "Normal" | "High" | "Low" | null
                    }
                ]
        }

        Rules:
        - Do NOT guess values
        - If data is missing, return null
        - Do NOT include explanations
        - Do NOT wrap in markdown `;

    const filePart = {
      inlineData: {
        data: file.buffer.toString("base64"),
        mimeType: file.mimetype,
      },
    };

    // 2️⃣✅ AI extraction
    const result = await model.generateContent([prompt, filePart]);
    const extracted = JSON.parse(result.response.text());

    //3️⃣✅Validation Json
    if (!extracted.testName || !Array.isArray(extracted.results)) {
      throw new Error("Invalid AI response");
    }

    //4️⃣✅ Upload to Firebase
    const filePath = `reports/${patientId}/${Date.now()}_${file.originalname}`;
    savedPath = await uploadFileToFirebase(file, filePath);

    let reportDateTime = new Date(); // default fallback

    if (extracted.reportDate) {
      const parsedDate = new Date(extracted.reportDate);

      if (!isNaN(parsedDate.getTime())) {
        reportDateTime = parsedDate;
      }
    }

    //5️⃣✅ Prisma transaction
    const savedReport = await prisma.$transaction(async (tx) => {
      const report = await tx.labReport.create({
        data: {
          patientId,
          doctorId,
          testName: extracted.testName,
          category: extracted.category,
          labName: extracted.labName,
          reportDateTime,
          uploadFormat: file.mimetype,
          fileKey: savedPath,
          isDigitized: true,
          status: "PENDING",
        },
      });

      if (extracted.results.length > 0) {
        await tx.labResult.createMany({
          data: extracted.results.map((r) => ({
            reportId: report.reportId,
            parameterName: r.parameter,
            value: r.value,
            unit: r.unit,
            referenceRange: r.referenceRange,
            statusFlag: r.status,
          })),
        });
      }

      // return report; 
      
      return await tx.labReport.findUnique({
        where: { reportId: report.reportId },
        include: { results: true },
      });
    });

    //6️⃣✅ Return response
    return res.status(201).json({
      success: true,
      data: { savedReport },
      message: "Lab report digitized successfully",
    });
  } catch (err) {
    if (savedPath) {
      try {
        await bucket.file(savedPath).delete();
      } catch {}
    }

    console.error(err);
    return res
      .status(500)
      .json({ success: false, message: "AI extraction failed" });
  }
}
