import { Router } from "express";
import { authenticate } from "../middlewares/auth";
import { User } from "../models/User";
import { Transaction } from "../models/Transaction";
import { logger } from "../lib/logger";

const router = Router();

// GET /wallet
router.get("/wallet", authenticate, async (req, res) => {
  try {
    const userId = req.user!.userId;
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ error: "Not found" });

    const [deposits, withdrawals, wins, bets] = await Promise.all([
      Transaction.aggregate([
        { $match: { userId: user._id, type: "deposit" } },
        { $group: { _id: null, total: { $sum: "$amount" } } },
      ]),
      Transaction.aggregate([
        { $match: { userId: user._id, type: "withdraw" } },
        { $group: { _id: null, total: { $sum: { $abs: "$amount" } } } },
      ]),
      Transaction.aggregate([
        { $match: { userId: user._id, type: "win" } },
        { $group: { _id: null, total: { $sum: "$amount" } } },
      ]),
      Transaction.aggregate([
        { $match: { userId: user._id, type: "bet" } },
        { $group: { _id: null, total: { $sum: { $abs: "$amount" } } } },
      ]),
    ]);

    return res.json({
      balance: user.walletBalance,
      totalDeposit: deposits[0]?.total ?? 0,
      totalWithdraw: withdrawals[0]?.total ?? 0,
      totalWin: wins[0]?.total ?? 0,
      totalBet: bets[0]?.total ?? 0,
    });
  } catch (err) {
    logger.error({ err });
    return res.status(500).json({ error: "Internal server error" });
  }
});

// GET /transactions
router.get("/transactions", authenticate, async (req, res) => {
  try {
    const { type, page = "1", limit = "30" } = req.query as Record<string, string>;
    const filter: Record<string, unknown> = { userId: req.user!.userId };
    if (type) filter.type = type;
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const txns = await Transaction.find(filter).sort({ createdAt: -1 }).skip(skip).limit(parseInt(limit));
    return res.json(
      txns.map((t) => ({
        id: t._id.toString(),
        userId: t.userId.toString(),
        type: t.type,
        amount: t.amount,
        balance: t.balance,
        description: t.description ?? null,
        referenceId: t.referenceId ?? null,
        createdAt: (t.createdAt as Date).toISOString(),
      }))
    );
  } catch (err) {
    logger.error({ err });
    return res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
