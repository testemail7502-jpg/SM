import { Router } from "express";
import { authenticate, requireAdmin } from "../middlewares/auth";
import { Market } from "../models/Market";
import { logger } from "../lib/logger";

const router = Router();

function fmt(m: InstanceType<typeof Market>) {
  return {
    id: m._id.toString(),
    name: m.name,
    type: m.type,
    openTime: m.openTime,
    closeTime: m.closeTime,
    isActive: m.isActive,
    isBettingOpen: m.isBettingOpen,
    openResult: m.openResult ?? null,
    closeResult: m.closeResult ?? null,
    jodi: m.jodi ?? null,
    displayOrder: m.displayOrder,
    createdAt: (m.createdAt as Date).toISOString(),
  };
}

// GET /markets
router.get("/markets", async (_req, res) => {
  try {
    const markets = await Market.find({ isActive: true }).sort({ displayOrder: 1, createdAt: 1 });
    return res.json(markets.map(fmt));
  } catch (err) {
    logger.error({ err });
    return res.status(500).json({ error: "Internal server error" });
  }
});

// POST /markets (admin)
router.post("/markets", authenticate, requireAdmin, async (req, res) => {
  try {
    const { name, type, openTime, closeTime, displayOrder } = req.body;
    const market = await Market.create({ name, type: type || "main", openTime, closeTime, displayOrder: displayOrder ?? 0 });
    return res.status(201).json(fmt(market));
  } catch (err) {
    logger.error({ err });
    return res.status(500).json({ error: "Internal server error" });
  }
});

// GET /markets/:id
router.get("/markets/:id", async (req, res) => {
  try {
    const market = await Market.findById(req.params.id);
    if (!market) return res.status(404).json({ error: "Not found" });
    return res.json(fmt(market));
  } catch (err) {
    logger.error({ err });
    return res.status(500).json({ error: "Internal server error" });
  }
});

// PATCH /markets/:id (admin)
router.patch("/markets/:id", authenticate, requireAdmin, async (req, res) => {
  try {
    const allowed = ["name", "type", "openTime", "closeTime", "isActive", "displayOrder"];
    const updates: Record<string, unknown> = {};
    for (const k of allowed) {
      if (req.body[k] !== undefined) updates[k] = req.body[k];
    }
    const market = await Market.findByIdAndUpdate(req.params.id, updates, { new: true });
    if (!market) return res.status(404).json({ error: "Not found" });
    return res.json(fmt(market));
  } catch (err) {
    logger.error({ err });
    return res.status(500).json({ error: "Internal server error" });
  }
});

// DELETE /markets/:id (admin)
router.delete("/markets/:id", authenticate, requireAdmin, async (req, res) => {
  try {
    await Market.findByIdAndDelete(req.params.id);
    return res.json({ success: true });
  } catch (err) {
    logger.error({ err });
    return res.status(500).json({ error: "Internal server error" });
  }
});

// PATCH /markets/:id/toggle-betting (admin)
router.patch("/markets/:id/toggle-betting", authenticate, requireAdmin, async (req, res) => {
  try {
    const { isBettingOpen } = req.body;
    const market = await Market.findByIdAndUpdate(req.params.id, { isBettingOpen }, { new: true });
    if (!market) return res.status(404).json({ error: "Not found" });
    return res.json(fmt(market));
  } catch (err) {
    logger.error({ err });
    return res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
