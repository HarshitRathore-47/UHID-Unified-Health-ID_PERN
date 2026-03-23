// import admin from "firebase-admin";
// import serviceAccount from "./uhid-auth-firebase-service-account.json" assert { type: "json" };

// admin.initializeApp({
//   credential: admin.credential.cert(serviceAccount),
//   storageBucket: "uhid-auth.appspot.com",
// });

// export const bucket = admin.storage().bucket();




import admin from "firebase-admin";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

// Required for __dirname in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 🔥 Read JSON manually (NO assert needed)
const serviceAccount = JSON.parse(
  fs.readFileSync(
    path.join(__dirname, "./uhid-auth-firebase-service-account.json"),
    "utf8"
  )
);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  storageBucket: "uhid-auth.firebasestorage.app",
});

export const bucket = admin.storage().bucket();
