import { prisma } from "../../lib/prisma.js";
import { GoogleGenerativeAI } from "@google/generative-ai";
import "dotenv/config";
import { uploadFileToFirebase } from "./FileUploadControllers/uploadController.js";
import { bucket } from "../Config/firebase.js";
import { z } from "zod";


const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
// console.log(ai);
// Change this in your checkModels function
// const result = await ai.models.list();
// console.log("Available Models:", result);

// 1️⃣ Schema aligned with your Prisma Model (LabResult uses parameterName and statusFlag)
const aiExtractionSchema = z.object({
  testName: z.string().min(1, "Test name is required"),
  category: z.string().nullable(),
  labName: z.string().min(1, "Lab name is required"),
  reportDate: z.string().nullable(),
  results: z.array(z.object({
    parameterName: z.string(),
    value: z.string(),
    unit: z.string().nullable(),
    referenceRange: z.string().nullable(),
    statusFlag: z.string().nullable()
  }))
});

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
                "parameterName": string,
                "value": string,
                "unit": string | null,
                "referenceRange": string | null,
                "statusFlag": "Normal" | "High" | "Low" | null
            }
        ]
    }

    Rules:
    - 🚨 STRICT NAMING: Use exactly "parameterName" and "statusFlag" as keys.
    - If data is missing, return null.
    - statusFlag MUST be "Normal", "High", or "Low" based on the reference range provided in the report.
    - Return ONLY the raw JSON. Do NOT include explanations or wrap in markdown backticks.
      `;


    const filePart = {
      inlineData: {
        data: file.buffer.toString("base64"),
        mimeType: file.mimetype,
      },
    };

    // 2️⃣✅ AI extraction
    const result = await model.generateContent([prompt, filePart]);
    const rawJson = JSON.parse(result.response.text());


    // 🕵️‍♂️ DEBUG LOGS (Check your VS Code Terminal after running this)
    console.log("--- 1. RAW AI DATA RECEIVED ---");
    console.dir(rawJson, { depth: null });

    // 3️⃣✅ Validation
    const validated = aiExtractionSchema.safeParse(rawJson);
    if (!validated.success) {
      console.error("AI Validation Error:", validated.error.format());
      return res.status(422).json({ success: false, message: "Validation failed" });
    }
    const extracted = validated.data;


    //4️⃣✅ Upload to Firebase
    const filePath = `reports/${patientId}/${Date.now()}_${file.originalname}`;
    savedPath = await uploadFileToFirebase(file, filePath);


    //Date formatting
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
          reportDateTime: new Date(extracted.reportDate || Date.now()),
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
            parameterName: r.parameterName,
            value: r.value,
            unit: r.unit,
            referenceRange: r.referenceRange,
            statusFlag: r.statusFlag,
          })),
        });
      }
      return report;
    });

    // 6️⃣✅ Return response
    return res.status(201).json({
      success: true,
      data: { savedReport },
      message: "Lab report digitized successfully",
    });
  } catch (err) {
    if (savedPath) {
      try {
        await bucket.file(savedPath).delete();
      } catch { }
    }

    console.error(err);
    return res
      .status(500)
      .json({ success: false, message: "AI extraction failed" });
  }
}
