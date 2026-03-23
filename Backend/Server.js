import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";

import authRoutes from "./src/Routes/auth.js";
import patientRoutes from "./src/Routes/patients.js";
import doctorRoutes from "./src/Routes/doctors.js";
import adminRoutes from "./src/Routes/admin.js";
import consentRoutes from "./src/Routes/consent.js"
import dotenv from "dotenv";
import "./src/scheduleJobs/otpCleanup.js";

dotenv.config();

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(
  cors({
    origin: "http://localhost:5173", // or 3000, whichever your frontend is running on
    credentials: true, // VERY IMPORTANT for cookies (OTP login, admin login)
  })
);

// mount routes
app.use("/api/auth", authRoutes);
app.use("/api/patients", patientRoutes);
app.use("/api/doctors", doctorRoutes);
app.use("/admin", adminRoutes);
app.use("/consents", consentRoutes);


// error handler
app.use((err, req, res, next) => {
  console.error("SERVER ERROR:", err);
  res.status(err.status || 500).json({
    message: err.message || "Internal Server Error",
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Server running at ${PORT}`));

export default app;
