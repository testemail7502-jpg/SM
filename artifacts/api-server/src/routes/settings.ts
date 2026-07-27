import { Router } from "express";
import { authenticate, requireAdmin } from "../middlewares/auth";
import { AppSettings } from "../models/AppSettings";
import { logger } from "../lib/logger";

const router = Router();

async function getOrCreateSettings(): Promise<InstanceType<typeof AppSettings>> {
  let settings = await AppSettings.findOne();
  if (!settings) {
    settings = await AppSettings.create({});
  }
  return settings;
}

function fmt(s: InstanceType<typeof AppSettings>) {
  return {
    qrCodeUrl: s.qrCodeUrl,
    whatsappNumber: s.whatsappNumber,
    upiId: s.upiId,
    minBet: s.minBet,
    maxBet: s.maxBet,
    minWithdraw: s.minWithdraw,
    maxWithdraw: s.maxWithdraw,
    appName: s.appName,
    bannerMessage: s.bannerMessage ?? null,
  };
}

// GET /settings
router.get("/settings", async (_req, res) => {
  try {
    const settings = await getOrCreateSettings();
    return res.json(fmt(settings));
  } catch (err) {
    logger.error({ err });
    return res.status(500).json({ error: "Internal server error" });
  }
});

// PATCH /settings (admin)
router.patch("/settings", authenticate, requireAdmin, async (req, res) => {
  try {
    const allowed = ["qrCodeUrl", "whatsappNumber", "upiId", "minBet", "maxBet", "minWithdraw", "maxWithdraw", "appName", "bannerMessage"];
    const updates: Record<string, unknown> = {};
    for (const k of allowed) {
      if (req.body[k] !== undefined) updates[k] = req.body[k];
    }
    const settings = await AppSettings.findOneAndUpdate({}, updates, { new: true, upsert: true });
    return res.json(fmt(settings));
  } catch (err) {
    logger.error({ err });
    return res.status(500).json({ error: "Internal server error" });
  }
});

// POST /settings/upload-qr (admin)
router.post("/settings/upload-qr", authenticate, requireAdmin, async (req, res) => {
  try {
    const { qrCodeBase64, mimeType } = req.body;
    const dataUrl = `data:${mimeType || "image/png"};base64,${qrCodeBase64}`;
    const settings = await AppSettings.findOneAndUpdate(
      {},
      { qrCodeUrl: dataUrl },
      { new: true, upsert: true }
    );
    return res.json(fmt(settings));
  } catch (err) {
    logger.error({ err });
    return res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
