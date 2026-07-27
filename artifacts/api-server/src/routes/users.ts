import { Router } from "express";
import { authenticate } from "../middlewares/auth";
import { User } from "../models/User";
import { logger } from "../lib/logger";

const router = Router();

// GET /users/me
router.get("/users/me", authenticate, async (req, res) => {
  try {
    const user = await User.findById(req.user!.userId);
    if (!user) return res.status(404).json({ error: "User not found" });
    return res.json(formatUser(user));
  } catch (err) {
    logger.error({ err });
    return res.status(500).json({ error: "Internal server error" });
  }
});

// PATCH /users/me
router.patch("/users/me", authenticate, async (req, res) => {
  try {
    const allowed = ["name", "bankAccount", "ifscCode", "upiId", "accountName", "bankName"];
    const updates: Record<string, string> = {};
    for (const key of allowed) {
      if (req.body[key] !== undefined) updates[key] = req.body[key];
    }
    const user = await User.findByIdAndUpdate(req.user!.userId, updates, { new: true });
    if (!user) return res.status(404).json({ error: "User not found" });
    return res.json(formatUser(user));
  } catch (err) {
    logger.error({ err });
    return res.status(500).json({ error: "Internal server error" });
  }
});

function formatUser(user: InstanceType<typeof User>) {
  return {
    id: user._id.toString(),
    phone: user.phone,
    name: user.name,
    walletBalance: user.walletBalance,
    isBlocked: user.isBlocked,
    role: user.role,
    referralCode: user.referralCode ?? null,
    bankAccount: user.bankAccount ?? null,
    ifscCode: user.ifscCode ?? null,
    upiId: user.upiId ?? null,
    accountName: user.accountName ?? null,
    bankName: user.bankName ?? null,
    createdAt: (user.createdAt as Date).toISOString(),
  };
}

export default router;
