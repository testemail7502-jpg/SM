import { Router } from "express";
import { authenticate, requireAdmin } from "../middlewares/auth";
import { User } from "../models/User";
import { Bet } from "../models/Bet";
import { Market } from "../models/Market";
import { DepositRequest } from "../models/DepositRequest";
import { WithdrawRequest } from "../models/WithdrawRequest";
import { Transaction } from "../models/Transaction";
import { logger } from "../lib/logger";

const router = Router();

// GET /admin/dashboard
router.get("/admin/dashboard", authenticate, requireAdmin, async (_req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const [
      totalUsers,
      totalBetsToday,
      pendingDeposits,
      pendingWithdraws,
      activeMarkets,
      payoutToday,
      depositToday,
      withdrawToday,
      recentBets,
      recentDeposits,
    ] = await Promise.all([
      User.countDocuments({ role: "user" }),
      Bet.countDocuments({ createdAt: { $gte: today, $lt: tomorrow } }),
      DepositRequest.countDocuments({ status: "pending" }),
      WithdrawRequest.countDocuments({ status: "pending" }),
      Market.countDocuments({ isActive: true }),
      Transaction.aggregate([
        { $match: { type: "win", createdAt: { $gte: today, $lt: tomorrow } } },
        { $group: { _id: null, total: { $sum: "$amount" } } },
      ]),
      Transaction.aggregate([
        { $match: { type: "deposit", createdAt: { $gte: today, $lt: tomorrow } } },
        { $group: { _id: null, total: { $sum: "$amount" } } },
      ]),
      Transaction.aggregate([
        { $match: { type: "withdraw", createdAt: { $gte: today, $lt: tomorrow } } },
        { $group: { _id: null, total: { $sum: { $abs: "$amount" } } } },
      ]),
      Bet.find({ createdAt: { $gte: today, $lt: tomorrow } })
        .sort({ createdAt: -1 })
        .limit(10)
        .populate("userId", "name phone")
        .populate("marketId", "name"),
      DepositRequest.find({ status: "pending" })
        .sort({ createdAt: -1 })
        .limit(10)
        .populate("userId", "name phone"),
    ]);

    return res.json({
      totalUsers,
      totalBetsToday,
      totalPayoutToday: payoutToday[0]?.total ?? 0,
      totalDepositToday: depositToday[0]?.total ?? 0,
      totalWithdrawToday: withdrawToday[0]?.total ?? 0,
      pendingDeposits,
      pendingWithdraws,
      activeMarkets,
      recentBets: recentBets.map((b) => ({
        id: b._id.toString(),
        userId: b.userId._id.toString(),
        userName: (b.userId as unknown as { name: string }).name ?? null,
        userPhone: (b.userId as unknown as { phone: string }).phone ?? null,
        marketId: b.marketId._id.toString(),
        marketName: (b.marketId as unknown as { name: string }).name ?? null,
        betType: b.betType,
        number: b.number,
        amount: b.amount,
        session: b.session,
        status: b.status,
        winAmount: b.winAmount ?? null,
        createdAt: (b.createdAt as Date).toISOString(),
      })),
      recentDeposits: recentDeposits.map((d) => ({
        id: d._id.toString(),
        userId: d.userId._id.toString(),
        userName: (d.userId as unknown as { name: string }).name ?? null,
        userPhone: (d.userId as unknown as { phone: string }).phone ?? null,
        amount: d.amount,
        utrNumber: d.utrNumber ?? null,
        screenshotUrl: d.screenshotUrl ?? null,
        status: d.status,
        adminNote: d.adminNote ?? null,
        createdAt: (d.createdAt as Date).toISOString(),
      })),
    });
  } catch (err) {
    logger.error({ err }, "admin dashboard error");
    return res.status(500).json({ error: "Internal server error" });
  }
});

// GET /admin/users
router.get("/admin/users", authenticate, requireAdmin, async (req, res) => {
  try {
    const { search, page = "1", limit = "20" } = req.query as Record<string, string>;
    const filter: Record<string, unknown> = { role: "user" };
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: "i" } },
        { phone: { $regex: search, $options: "i" } },
      ];
    }
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const [users, total] = await Promise.all([
      User.find(filter).sort({ createdAt: -1 }).skip(skip).limit(parseInt(limit)),
      User.countDocuments(filter),
    ]);
    return res.json({
      users: users.map((u) => ({
        id: u._id.toString(),
        phone: u.phone,
        name: u.name,
        walletBalance: u.walletBalance,
        isBlocked: u.isBlocked,
        role: u.role,
        referralCode: u.referralCode ?? null,
        createdAt: u.createdAt.toISOString(),
      })),
      total,
      page: parseInt(page),
      limit: parseInt(limit),
    });
  } catch (err) {
    logger.error({ err });
    return res.status(500).json({ error: "Internal server error" });
  }
});

// GET /admin/users/:id
router.get("/admin/users/:id", authenticate, requireAdmin, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ error: "Not found" });
    const [totalBets, depositAgg, withdrawAgg] = await Promise.all([
      Bet.countDocuments({ userId: req.params.id }),
      Transaction.aggregate([
        { $match: { userId: user._id, type: "deposit" } },
        { $group: { _id: null, total: { $sum: "$amount" } } },
      ]),
      Transaction.aggregate([
        { $match: { userId: user._id, type: "withdraw" } },
        { $group: { _id: null, total: { $sum: { $abs: "$amount" } } } },
      ]),
    ]);
    return res.json({
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
      createdAt: user.createdAt.toISOString(),
      totalBets,
      totalDeposit: depositAgg[0]?.total ?? 0,
      totalWithdraw: withdrawAgg[0]?.total ?? 0,
    });
  } catch (err) {
    logger.error({ err });
    return res.status(500).json({ error: "Internal server error" });
  }
});

// PATCH /admin/users/:id
router.patch("/admin/users/:id", authenticate, requireAdmin, async (req, res) => {
  try {
    const { isBlocked, phone, name } = req.body;
    const updates: Record<string, unknown> = {};
    if (isBlocked !== undefined) updates.isBlocked = isBlocked;
    if (phone !== undefined) updates.phone = phone;
    if (name !== undefined) updates.name = name;
    const user = await User.findByIdAndUpdate(req.params.id, updates, { new: true });
    if (!user) return res.status(404).json({ error: "Not found" });
    return res.json({
      id: user._id.toString(),
      phone: user.phone,
      name: user.name,
      walletBalance: user.walletBalance,
      isBlocked: user.isBlocked,
      role: user.role,
      referralCode: user.referralCode ?? null,
      createdAt: user.createdAt.toISOString(),
    });
  } catch (err) {
    logger.error({ err });
    return res.status(500).json({ error: "Internal server error" });
  }
});

// POST /admin/users/:id/adjust-balance
router.post("/admin/users/:id/adjust-balance", authenticate, requireAdmin, async (req, res) => {
  try {
    const { amount, action, reason } = req.body;
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ error: "User not found" });

    let newBalance = user.walletBalance;
    const numAmt = Number(amount);
    if (isNaN(numAmt)) return res.status(400).json({ error: "Invalid amount" });

    if (action === "add") newBalance += numAmt;
    else if (action === "subtract") newBalance = Math.max(0, newBalance - numAmt);
    else if (action === "set") newBalance = Math.max(0, numAmt);
    else newBalance = Math.max(0, numAmt);

    const diff = newBalance - user.walletBalance;
    user.walletBalance = newBalance;
    await user.save();

    await Transaction.create({
      userId: user._id,
      type: diff >= 0 ? "deposit" : "withdraw",
      amount: diff,
      balance: newBalance,
      description: reason || `Admin adjusted balance (${action || "set"})`,
      referenceId: req.user!.userId,
    });

    return res.json({
      id: user._id.toString(),
      phone: user.phone,
      name: user.name,
      walletBalance: user.walletBalance,
      isBlocked: user.isBlocked,
      role: user.role,
      referralCode: user.referralCode ?? null,
      createdAt: user.createdAt.toISOString(),
    });
  } catch (err) {
    logger.error({ err });
    return res.status(500).json({ error: "Internal server error" });
  }
});

// GET /admin/users/:id/bets
router.get("/admin/users/:id/bets", authenticate, requireAdmin, async (req, res) => {
  try {
    const bets = await Bet.find({ userId: req.params.id })
      .sort({ createdAt: -1 })
      .limit(50)
      .populate("marketId", "name");
    return res.json(
      bets.map((b) => ({
        id: b._id.toString(),
        userId: b.userId.toString(),
        userName: null,
        userPhone: null,
        marketId: b.marketId._id.toString(),
        marketName: (b.marketId as unknown as { name: string }).name ?? null,
        betType: b.betType,
        number: b.number,
        amount: b.amount,
        session: b.session,
        status: b.status,
        winAmount: b.winAmount ?? null,
        createdAt: (b.createdAt as Date).toISOString(),
      }))
    );
  } catch (err) {
    logger.error({ err });
    return res.status(500).json({ error: "Internal server error" });
  }
});

// GET /admin/bets
router.get("/admin/bets", authenticate, requireAdmin, async (req, res) => {
  try {
    const { marketId, status, date } = req.query as Record<string, string>;
    const filter: Record<string, unknown> = {};
    if (marketId) filter.marketId = marketId;
    if (status) filter.status = status;
    if (date) {
      const start = new Date(date);
      const end = new Date(date);
      end.setDate(end.getDate() + 1);
      filter.createdAt = { $gte: start, $lt: end };
    }
    const bets = await Bet.find(filter)
      .sort({ createdAt: -1 })
      .limit(100)
      .populate("userId", "name phone")
      .populate("marketId", "name");
    return res.json(
      bets.map((b) => ({
        id: b._id.toString(),
        userId: b.userId._id.toString(),
        userName: (b.userId as unknown as { name: string }).name ?? null,
        userPhone: (b.userId as unknown as { phone: string }).phone ?? null,
        marketId: b.marketId._id.toString(),
        marketName: (b.marketId as unknown as { name: string }).name ?? null,
        betType: b.betType,
        number: b.number,
        amount: b.amount,
        session: b.session,
        status: b.status,
        winAmount: b.winAmount ?? null,
        createdAt: (b.createdAt as Date).toISOString(),
      }))
    );
  } catch (err) {
    logger.error({ err });
    return res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
