import cron from "node-cron";
import { prisma } from "../../lib/prisma.js";

// Run every 30 minutes
cron.schedule("*/20 * * * *", async () => {
  try {
    const now = new Date();

    const result = await prisma.authOtp.deleteMany({
      where: {
        OR: [
          { expiresAt: { lt: now } },  // expired
          {
            verified: true,
            createdAt: { lt: new Date(Date.now() - 1000 * 60 * 60) }, // verified 1hr ago
          },
        ],
      },
    });

    console.log(`OTP Cleanup: ${result.count} rows deleted`);
  } catch (error) {
    console.error("OTP cleanup failed:", error);
  }
});
