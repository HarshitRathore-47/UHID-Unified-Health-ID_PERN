import { prisma } from "../../../lib/prisma.js";
export async function markAsRead(req, res) {
  const { id } = req.params;

  await prisma.notification.update({
    where: { id },
    data: { isRead: true },
  });

  res.json({ success: true ,data:null});
}