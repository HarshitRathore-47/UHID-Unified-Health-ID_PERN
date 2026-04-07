import admin from "firebase-admin";
import fs from "fs"; // File system import karein

let serviceAccount;

// Check karein agar local file exist karti hai (Local testing ke liye)
if (fs.existsSync("./uhid-auth-firebase-service-account.json")) {
  serviceAccount = JSON.parse(fs.readFileSync("./uhid-auth-firebase-service-account.json", "utf8"));
} else {
  // Live server (Render/Vercel) ke liye env use karein
  serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
}

if (serviceAccount.private_key) {
  serviceAccount.private_key = serviceAccount.private_key.replace(/\\n/g, "\n");
}

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  storageBucket: "uhid-auth.firebasestorage.app",
});

export const bucket = admin.storage().bucket();