import { Router } from "express";
import { authenticate, requireAdmin } from "../middlewares/auth";
import { DepositRequest } from "../models/DepositRequest";
import { User } from "../models/User";
import { Transaction } from "../models/Transaction";
import { logger } from "../lib/logger";

const router = Router();

function fmt(d: InstanceType<typeof DepositRequest> & { userName?: string; userPhone?: string }) {
  return {
    id: d._id.toString(),
    userId: d.userId.toString(),
    userName: d.userName ?? null,
    userPhone: d.userPhone ?? null,
    amount: d.amount,
    utrNumber: d.utrNumber ?? null,
    screenshotUrl: d.screenshotUrl ?? null,
    status: d.status,
    adminNote: d.adminNote ?? null,
    createdAt: (d.createdAt as Date).toISOString(),
  };
}

// POST /deposit-requests/upload-screenshot
router.post("/deposit-requests/upload-screenshot", authenticate, async (req, res) => {
  try {
    const { screenshotBase64, mimeType } = req.body;
    if (!screenshotBase64) return res.status(400).json({ error: "screenshotBase64 required" });
    const dataUrl = `data:${mimeType || "image/jpeg"};base64,${screenshotBase64}`;
    return res.json({ url: dataUrl });
  } catch (err) {
    logger.error({ err });
    return res.status(500).json({ error: "Internal server error" });
  }
});

// POST /deposit-requests
router.post("/deposit-requests", authenticate, async (req, res) => {
  try {
    const { amount, utrNumber, screenshotUrl } = req.body;
    if (!amount || amount <= 0) {
      return res.status(400).json({ error: "Valid deposit amount required" });
    }
    const dr = await DepositRequest.create({
      userId: req.user!.userId,
      amount,
      utrNumber: utrNumber ?? null,
      screenshotUrl: screenshotUrl ?? null,
    });
    return res.status(201).json(fmt(dr));
  } catch (err) {
    logger.error({ err });
    return res.status(500).json({ error: "Internal server error" });
  }
});

// GET /deposit-requests
router.get("/deposit-requests", authenticate, async (req, res) => {
  try {
    const { status } = req.query as Record<string, string>;
    const isAdmin = req.user!.role === "admin";
    const filter: Record<string, unknown> = {};
    if (!isAdmin) filter.userId = req.user!.userId;
    if (status) filter.status = status;

    const requests = await DepositRequest.find(filter)
      .sort({ createdAt: -1 })
      .populate("userId", "name phone");

    return res.json(
      requests.map((d) => ({
        id: d._id.toString(),
        userId: d.userId ? d.userId._id.toString() : "",
        userName: d.userId ? (d.userId as unknown as { name: string }).name : null,
        userPhone: d.userId ? (d.userId as unknown as { phone: string }).phone : null,
        amount: d.amount,
        utrNumber: d.utrNumber ?? null,
        screenshotUrl: d.screenshotUrl ?? null,
        status: d.status,
        adminNote: d.adminNote ?? null,
        createdAt: (d.createdAt as Date).toISOString(),
      }))
    );
  } catch (err) {
    logger.error({ err });
    return res.status(500).json({ error: "Internal server error" });
  }
});

// PATCH /deposit-requests/:id (admin)
router.patch("/deposit-requests/:id", authenticate, requireAdmin, async (req, res) => {
  try {
    const { status, adminNote } = req.body;
    const dr = await DepositRequest.findById(req.params.id);
    if (!dr) {
      return res.status(404).json({ error: "Not found" });
    }
    const prevStatus = dr.status;
    dr.status = status;
    if (adminNote !== undefined) dr.adminNote = adminNote;
    await dr.save();

    // Credit wallet on approval if transitioning to approved
    if (status === "approved" && prevStatus !== "approved") {
      const user = await User.findByIdAndUpdate(
        dr.userId,
        { $inc: { walletBalance: dr.amount } },
        { new: true }
      );
      if (user) {
        await Transaction.create({
          userId: dr.userId,
          type: "deposit",
          amount: dr.amount,
          balance: user.walletBalance,
          description: `Deposit approved - Ref: ${dr.utrNumber ?? "UPI"}`,
          referenceId: dr._id.toString(),
        });
      }
    }

    const populated = await DepositRequest.findById(dr._id).populate("userId", "name phone");
    return res.json({
      id: populated!._id.toString(),
      userId: populated!.userId ? populated!.userId._id.toString() : "",
      userName: populated!.userId ? (populated!.userId as unknown as { name: string }).name : null,
      userPhone: populated!.userId ? (populated!.userId as unknown as { phone: string }).phone : null,
      amount: populated!.amount,
      utrNumber: populated!.utrNumber ?? null,
      screenshotUrl: populated!.screenshotUrl ?? null,
      status: populated!.status,
      adminNote: populated!.adminNote ?? null,
      createdAt: (populated!.createdAt as Date).toISOString(),
    });
  } catch (err) {
    logger.error({ err });
    return res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
