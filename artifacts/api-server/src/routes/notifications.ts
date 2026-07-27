import { Router } from "express";
import { authenticate, requireAdmin } from "../middlewares/auth";
import { Notification } from "../models/Notification";
import { logger } from "../lib/logger";

const router = Router();

function fmt(n: InstanceType<typeof Notification>) {
  return {
    id: n._id.toString(),
    title: n.title,
    message: n.message,
    targetUserId: n.targetUserId ? n.targetUserId.toString() : null,
    isRead: n.isRead,
    createdAt: (n.createdAt as Date).toISOString(),
  };
}

// GET /notifications
router.get("/notifications", authenticate, async (req, res) => {
  try {
    const userId = req.user!.userId;
    const notifications = await Notification.find({
      $or: [{ targetUserId: null }, { targetUserId: userId }],
    }).sort({ createdAt: -1 }).limit(50);
    return res.json(notifications.map(fmt));
  } catch (err) {
    logger.error({ err });
    return res.status(500).json({ error: "Internal server error" });
  }
});

// POST /notifications (admin)
router.post("/notifications", authenticate, requireAdmin, async (req, res) => {
  try {
    const { title, message, targetUserId } = req.body;
    const n = await Notification.create({ title, message, targetUserId: targetUserId ?? null });
    return res.status(201).json(fmt(n));
  } catch (err) {
    logger.error({ err });
    return res.status(500).json({ error: "Internal server error" });
  }
});

// PATCH /notifications/:id/read
router.patch("/notifications/:id/read", authenticate, async (req, res) => {
  try {
    const n = await Notification.findByIdAndUpdate(req.params.id, { isRead: true }, { new: true });
    if (!n) return res.status(404).json({ error: "Not found" });
    return res.json(fmt(n));
  } catch (err) {
    logger.error({ err });
    return res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
