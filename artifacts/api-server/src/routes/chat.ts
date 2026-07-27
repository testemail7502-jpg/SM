import { Router } from "express";
import mongoose from "mongoose";
import { authenticate } from "../middlewares/auth";
import { ChatMessage } from "../models/ChatMessage";
import { User } from "../models/User";
import { logger } from "../lib/logger";

const router = Router();

function fmt(m: InstanceType<typeof ChatMessage>) {
  return {
    id: m._id.toString(),
    userId: m.userId.toString(),
    userName: null as string | null,
    message: m.message,
    isAdmin: m.isAdmin,
    isRead: m.isRead,
    createdAt: (m.createdAt as Date).toISOString(),
  };
}

// GET /chat
router.get("/chat", authenticate, async (req, res) => {
  try {
    const isAdmin = req.user!.role === "admin";
    const { userId } = req.query as Record<string, string>;
    let targetUserId = req.user!.userId;
    if (isAdmin && userId) targetUserId = userId;

    const messages = await ChatMessage.find({ userId: targetUserId })
      .sort({ createdAt: 1 })
      .limit(200)
      .populate("userId", "name");

    // Mark user messages as read when admin views
    if (isAdmin) {
      await ChatMessage.updateMany({ userId: targetUserId, isAdmin: false }, { isRead: true });
    }

    return res.json(
      messages.map((m) => ({
        id: m._id.toString(),
        userId: m.userId._id.toString(),
        userName: (m.userId as unknown as { name: string }).name ?? null,
        message: m.message,
        isAdmin: m.isAdmin,
        isRead: m.isRead,
        createdAt: (m.createdAt as Date).toISOString(),
      }))
    );
  } catch (err) {
    logger.error({ err });
    return res.status(500).json({ error: "Internal server error" });
  }
});

// POST /chat
router.post("/chat", authenticate, async (req, res) => {
  try {
    const isAdmin = req.user!.role === "admin";
    const { message, targetUserId } = req.body;
    let userId = req.user!.userId;
    if (isAdmin && targetUserId) userId = targetUserId;

    const msg = await ChatMessage.create({ userId, message, isAdmin });
    return res.status(201).json(fmt(msg));
  } catch (err) {
    logger.error({ err });
    return res.status(500).json({ error: "Internal server error" });
  }
});

// GET /admin/chat-users
router.get("/admin/chat-users", authenticate, async (req, res) => {
  try {
    const chatUsers = await ChatMessage.aggregate([
      { $match: { isAdmin: false } },
      { $sort: { createdAt: -1 } },
      {
        $group: {
          _id: "$userId",
          lastMessage: { $first: "$message" },
          lastMessageAt: { $first: "$createdAt" },
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "_id",
          foreignField: "_id",
          as: "user",
        },
      },
      { $unwind: "$user" },
    ]);

    const results = await Promise.all(
      chatUsers.map(async (cu) => {
        const unreadCount = await ChatMessage.countDocuments({
          userId: cu._id,
          isAdmin: false,
          isRead: false,
        });
        return {
          userId: cu._id.toString(),
          userName: cu.user.name,
          userPhone: cu.user.phone,
          lastMessage: cu.lastMessage,
          unreadCount,
          lastMessageAt: cu.lastMessageAt.toISOString(),
        };
      })
    );

    return res.json(results);
  } catch (err) {
    logger.error({ err });
    return res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
