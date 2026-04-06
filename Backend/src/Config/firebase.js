import admin from "firebase-admin";

const raw = process.env.FIREBASE_SERVICE_ACCOUNT;
if (!raw) {
  throw new Error("Missing FIREBASE_SERVICE_ACCOUNT env var");
}

const serviceAccount = JSON.parse(raw);

// Important for keys copied with escaped newlines
if (serviceAccount.private_key) {
  serviceAccount.private_key = serviceAccount.private_key.replace(/\\n/g, "\n");
}

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  storageBucket: "uhid-auth.firebasestorage.app",
});

export const bucket = admin.storage().bucket();