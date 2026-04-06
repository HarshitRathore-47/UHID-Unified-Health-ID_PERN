import { prisma } from "../../../lib/prisma.js";
import { notificationIdSchema } from "../../schemas/notificationSchema.js";


export async function markAsRead(req, res) {
  const parsed = notificationIdSchema.safeParse(req.params);
  if (!parsed.success) {
    return res.status(400).json({
      success: false,
      message: parsed.error.issues[0].message
    });
  }

  const { id } = parsed.data;

  try {
    await prisma.notification.update({
      where: { id },
      data: { isRead: true },
    });

    return res.json({ success: true, data: null });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
}