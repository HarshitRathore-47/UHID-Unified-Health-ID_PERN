import admin from "firebase-admin";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

// Current file ka path aur directory nikalne ke liye
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Sahi path: kyunki .json file aur firebase.js dono ek hi folder (src/Config) mein hain
const serviceAccountPath = path.join(__dirname, "uhid-auth-firebase-service-account.json");

let serviceAccount;

try {
  if (fs.existsSync(serviceAccountPath)) {
    // 1. Pehle local JSON file try karein
    const fileContent = fs.readFileSync(serviceAccountPath, "utf8");
    serviceAccount = JSON.parse(fileContent);
    console.log("✅ Firebase: Loaded from local JSON file");
  } else {
    // 2. Agar file nahi mili (Render/Live), toh Env Variable use karein
    const raw = process.env.FIREBASE_SERVICE_ACCOUNT;
    if (!raw) throw new Error("FIREBASE_SERVICE_ACCOUNT is missing in .env");
    
    serviceAccount = JSON.parse(raw);
    console.log("🚀 Firebase: Loaded from Environment Variable");
  }
} catch (error) {
  console.error("❌ Firebase Initialization Error:", error.message);
  process.exit(1); // Server crash hone se pehle error message dikhayega
}

// Private key ke newlines (\n) fix karein
if (serviceAccount.private_key) {
  serviceAccount.private_key = serviceAccount.private_key.replace(/\\n/g, "\n");
}

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  storageBucket: "uhid-auth.firebasestorage.app",
});

export const bucket = admin.storage().bucket();