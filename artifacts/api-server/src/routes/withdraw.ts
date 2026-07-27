import { Router } from "express";
import { authenticate, requireAdmin } from "../middlewares/auth";
import { WithdrawRequest } from "../models/WithdrawRequest";
import { User } from "../models/User";
import { Transaction } from "../models/Transaction";
import { logger } from "../lib/logger";

const router = Router();

function popFmt(w: InstanceType<typeof WithdrawRequest>) {
  const userId = (w.userId as unknown as { _id: { toString(): string }; name: string; phone: string });
  return {
    id: w._id.toString(),
    userId: userId?._id?.toString() ?? w.userId?.toString() ?? "",
    userName: userId?.name ?? null,
    userPhone: userId?.phone ?? null,
    amount: w.amount,
    bankAccount: w.bankAccount ?? null,
    ifscCode: w.ifscCode ?? null,
    upiId: w.upiId ?? null,
    accountName: w.accountName ?? null,
    bankName: w.bankName ?? null,
    status: w.status,
    adminNote: w.adminNote ?? null,
    paidAt: w.paidAt ? w.paidAt.toISOString() : null,
    createdAt: (w.createdAt as Date).toISOString(),
  };
}

// POST /withdraw-requests
router.post("/withdraw-requests", authenticate, async (req, res) => {
  try {
    const { amount, bankAccount, ifscCode, upiId, accountName, bankName } = req.body;
    const userId = req.user!.userId;

    if (!amount || amount <= 0) {
      return res.status(400).json({ error: "Valid amount required" });
    }

    // Atomically deduct user balance
    const user = await User.findOneAndUpdate(
      { _id: userId, walletBalance: { $gte: amount } },
      { $inc: { walletBalance: -amount } },
      { new: true }
    );

    if (!user) {
      return res.status(400).json({ error: "Insufficient balance or user not found" });
    }

    const wr = await WithdrawRequest.create({
      userId,
      amount,
      bankAccount,
      ifscCode,
      upiId,
      accountName,
      bankName,
      status: "pending",
    });

    await Transaction.create({
      userId,
      type: "withdraw",
      amount: -amount,
      balance: user.walletBalance,
      description: "Withdrawal request submitted",
      referenceId: wr._id.toString(),
    });

    return res.status(201).json({
      id: wr._id.toString(),
      userId: wr.userId.toString(),
      userName: user.name,
      userPhone: user.phone,
      amount: wr.amount,
      bankAccount: wr.bankAccount ?? null,
      ifscCode: wr.ifscCode ?? null,
      upiId: wr.upiId ?? null,
      accountName: wr.accountName ?? null,
      bankName: wr.bankName ?? null,
      status: wr.status,
      adminNote: wr.adminNote ?? null,
      paidAt: null,
      createdAt: (wr.createdAt as Date).toISOString(),
    });
  } catch (err) {
    logger.error({ err });
    return res.status(500).json({ error: "Internal server error" });
  }
});

// GET /withdraw-requests
router.get("/withdraw-requests", authenticate, async (req, res) => {
  try {
    const { status } = req.query as Record<string, string>;
    const isAdmin = req.user!.role === "admin";
    const filter: Record<string, unknown> = {};
    if (!isAdmin) filter.userId = req.user!.userId;
    if (status) filter.status = status;
    const reqs = await WithdrawRequest.find(filter).sort({ createdAt: -1 }).populate("userId", "name phone");
    return res.json(reqs.map(popFmt));
  } catch (err) {
    logger.error({ err });
    return res.status(500).json({ error: "Internal server error" });
  }
});

// PATCH /withdraw-requests/:id (admin)
router.patch("/withdraw-requests/:id", authenticate, requireAdmin, async (req, res) => {
  try {
    const { status, adminNote } = req.body;
    const wr = await WithdrawRequest.findById(req.params.id);
    if (!wr) return res.status(404).json({ error: "Not found" });

    const prevStatus = wr.status;
    wr.status = status;
    if (adminNote !== undefined) wr.adminNote = adminNote;
    if (status === "paid" || status === "approved") wr.paidAt = new Date();
    await wr.save();

    // If rejected from pending, refund user's wallet balance
    if (status === "rejected" && prevStatus === "pending") {
      const user = await User.findByIdAndUpdate(
        wr.userId,
        { $inc: { walletBalance: wr.amount } },
        { new: true }
      );
      if (user) {
        await Transaction.create({
          userId: wr.userId,
          type: "refund",
          amount: wr.amount,
          balance: user.walletBalance,
          description: `Withdrawal request rejected - Refunded`,
          referenceId: wr._id.toString(),
        });
      }
    }

    const updated = await WithdrawRequest.findById(wr._id).populate("userId", "name phone");
    return res.json(popFmt(updated!));
  } catch (err) {
    logger.error({ err });
    return res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
