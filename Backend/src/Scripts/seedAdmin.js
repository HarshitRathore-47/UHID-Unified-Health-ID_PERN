import { hashPassword } from "../../lib/auth.js";
import { prisma } from "../../lib/prisma.js";

import "dotenv/config";

async function seedAdmin() {
  try {
    if (!process.env.ADMIN_EMAIL || !process.env.ADMIN_PASSWORD) {
      throw new Error("Admin credentials missing in environment variables");
    }

    const existingAdmin = await prisma.admin.findFirst();

    if (existingAdmin) {
      console.log("Admin already exists. Skipping seed.");
      return;
    }

    const hashedPassword = await hashPassword(process.env.ADMIN_PASSWORD);
    const email = process.env.ADMIN_EMAIL;

    await prisma.admin.create({
      data: {
        email: email,
        password: hashedPassword,
      },
    });

    console.log("Admin created successfully.");
  } catch (error) {
    console.error("Error seeding admin:", error);
  } finally {
    await prisma.$disconnect();
  }
}
seedAdmin();