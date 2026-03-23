import { prisma } from "../../lib/prisma.js";

export async function createNotification({
  userId,
  role,
  type,
  title,
  message,
  entityId = null,
}) {
  return prisma.notification.create({
    data: {
      userId,
      role,
      type,
      title,
      message,
      entityId,
    },
  });
}