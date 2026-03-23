import { prisma } from "../../../lib/prisma.js";
export async function getUnreadCount(req, res) {
  const userId = req.user.sub;
  const role = req.user.role;

  const count = await prisma.notification.count({
    where: { userId, role, isRead: false },
  });

  res.json({ success: true, data: { count } });
}
