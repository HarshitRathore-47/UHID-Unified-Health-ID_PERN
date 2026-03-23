import { prisma } from "../../../lib/prisma.js";
export async function getNotifications(req, res) {
  const userId = req.user.sub;
  const role = req.user.role;
  console.log(userId, role);
  const notifications = await prisma.notification.findMany({
    where: {
      userId,
      role,
    },
    orderBy: { createdAt: "desc" },
  });

  res.json({ success: true, data: notifications });
}
export async function deleteNotification(req, res) {
  const userId = req.user.sub;
  const role = req.user.role;
  const { id } = req.params;

  await prisma.notification.deleteMany({
    where: {
      id,
      userId,
      role,
    },
  });

  res.json({ success: true,data:null, message: "Notification deleted" });
}
export async function clearReadNotifications(req, res) {
  const userId = req.user.sub;
  const role = req.user.role;

  await prisma.notification.deleteMany({
    where: {
      userId,
      role,
      isRead: true,
    },
  });

  res.json({
    success: true,
    data:null,
    message: "All read notifications cleared",
  });
}
export async function MarkAllRead(req, res) {
  const userId = req.user.sub;
  try {
    await prisma.notification.updateMany({
      where: {
        role: req.user.role,
        userId: userId,
        isRead: false
      },
      data: { isRead: true }
    });

    return res.status(200).json({
      success: true,
      message: "All notifications marked as read"
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
}