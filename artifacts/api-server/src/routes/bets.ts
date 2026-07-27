import { Router } from "express";
import { authenticate } from "../middlewares/auth";
import { Bet } from "../models/Bet";
import { Market } from "../models/Market";
import { User } from "../models/User";
import { Transaction } from "../models/Transaction";
import { AppSettings } from "../models/AppSettings";
import { logger } from "../lib/logger";

const router = Router();

// POST /bets - Place a bet
router.post("/bets", authenticate, async (req, res) => {
  try {
    const { marketId, betType, number, amount, session: betSession } = req.body;
    const userId = req.user!.userId;

    const settings = await AppSettings.findOne();
    const minBet = settings?.minBet ?? 10;
    const maxBet = settings?.maxBet ?? 10000;

    if (!amount || amount < minBet || amount > maxBet) {
      return res.status(400).json({ error: `Bet amount must be between ₹${minBet} and ₹${maxBet}` });
    }

    const market = await Market.findById(marketId);
    if (!market || !market.isActive || !market.isBettingOpen) {
      return res.status(400).json({ error: "Market is closed for betting" });
    }

    // Atomically deduct user balance if sufficient
    const user = await User.findOneAndUpdate(
      { _id: userId, walletBalance: { $gte: amount }, isBlocked: false },
      { $inc: { walletBalance: -amount } },
      { new: true }
    );
    if (!user) {
      return res.status(400).json({ error: "Insufficient wallet balance or account blocked" });
    }

    const newBalance = user.walletBalance;

    await Transaction.create({
      userId,
      type: "bet",
      amount: -amount,
      balance: newBalance,
      description: `Bet on ${market.name} - ${betType} (${number})`,
      referenceId: marketId,
    });

    const bet = await Bet.create({
      userId,
      marketId,
      betType,
      number,
      amount,
      session: betSession || "open",
      status: "pending",
    });

    return res.status(201).json({
      id: bet._id.toString(),
      userId: bet.userId.toString(),
      userName: user.name,
      userPhone: user.phone,
      marketId: bet.marketId.toString(),
      marketName: market.name,
      betType: bet.betType,
      number: bet.number,
      amount: bet.amount,
      session: bet.session,
      status: bet.status,
      winAmount: null,
      createdAt: (bet.createdAt as Date).toISOString(),
    });
  } catch (err) {
    logger.error({ err }, "place bet error");
    return res.status(500).json({ error: "Internal server error" });
  }
});

// GET /bets - Get user's bets
router.get("/bets", authenticate, async (req, res) => {
  try {
    const { status, marketId, page = "1", limit = "50" } = req.query as Record<string, string>;
    const filter: Record<string, unknown> = { userId: req.user!.userId };
    if (status) filter.status = status;
    if (marketId) filter.marketId = marketId;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const [bets, total] = await Promise.all([
      Bet.find(filter).sort({ createdAt: -1 }).skip(skip).limit(parseInt(limit)).populate("marketId", "name"),
      Bet.countDocuments(filter),
    ]);

    const fmtBet = bets.map((b) => ({
      id: b._id.toString(),
      userId: b.userId.toString(),
      userName: null,
      userPhone: null,
      marketId: b.marketId ? b.marketId._id.toString() : "",
      marketName: b.marketId ? (b.marketId as unknown as { name: string }).name : "Unknown Market",
      betType: b.betType,
      number: b.number,
      amount: b.amount,
      session: b.session,
      status: b.status,
      winAmount: b.winAmount ?? null,
      createdAt: (b.createdAt as Date).toISOString(),
    }));
    return res.json({ bets: fmtBet, total });
  } catch (err) {
    logger.error({ err });
    return res.status(500).json({ error: "Internal server error" });
  }
});

// GET /bets/:id
router.get("/bets/:id", authenticate, async (req, res) => {
  try {
    const bet = await Bet.findOne({ _id: req.params.id, userId: req.user!.userId }).populate("marketId", "name");
    if (!bet) return res.status(404).json({ error: "Not found" });
    return res.json({
      id: bet._id.toString(),
      userId: bet.userId.toString(),
      userName: null,
      userPhone: null,
      marketId: bet.marketId ? bet.marketId._id.toString() : "",
      marketName: bet.marketId ? (bet.marketId as unknown as { name: string }).name : "Unknown Market",
      betType: bet.betType,
      number: bet.number,
      amount: bet.amount,
      session: bet.session,
      status: bet.status,
      winAmount: bet.winAmount ?? null,
      createdAt: (bet.createdAt as Date).toISOString(),
    });
  } catch (err) {
    logger.error({ err });
    return res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
