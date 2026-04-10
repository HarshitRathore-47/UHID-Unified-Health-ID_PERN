import cron from "node-cron";
import { prisma } from "../../lib/prisma.js";

// Run every 30 minutes
cron.schedule("*/20 * * * *", async () => {
  try {
    const now = new Date();

    // ✅ Solution: Buffer Time (Grace Period)
    // Sirf un OTPs ko delete karo jo 5 minute pehle expire ho chuke hain
    const bufferTime = new Date(Date.now() - 5 * 60 * 1000);

    const result = await prisma.authOtp.deleteMany({
      where: {
        OR: [
          { expiresAt: { lt: bufferTime } },  // expired
          {
            verified: true,
            createdAt: { lt: new Date(Date.now() - 1000 * 60 * 60) }, // verified 1hr ago
          },
        ],
      },
    });
    const dietResult = await prisma.diet.updateMany({
      where: {
        status: "ACTIVE",
        endDate: {
          lt: now, // Agar endDate nikal chuki hai
          not: null, // Life-long diets ko skip karne ke liye
        },
      },
      data: {
        status: "COMPLETED", // Status badal do
      },
    });

    if (dietResult.count > 0) {
      console.log(`Diet Cleanup: ${dietResult.count} diets marked as COMPLETED`);
    }

    console.log(`OTP Cleanup: ${result.count} rows deleted`);
  } catch (error) {
    console.error("OTP cleanup failed:", error);
  }
});

