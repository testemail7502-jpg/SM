import { Router } from "express";
import { authenticate, requireAdmin } from "../middlewares/auth";
import { Rate } from "../models/Rate";
import { logger } from "../lib/logger";

const router = Router();

function fmt(r: InstanceType<typeof Rate>) {
  return {
    id: r._id.toString(),
    marketId: r.marketId ? r.marketId.toString() : null,
    betType: r.betType,
    multiplier: r.multiplier,
    description: r.description ?? null,
  };
}

// GET /rates
router.get("/rates", async (req, res) => {
  try {
    const { marketId } = req.query as Record<string, string>;
    const filter: Record<string, unknown> = {};
    if (marketId) filter.marketId = marketId;
    else filter.marketId = null;
    const rates = await Rate.find(filter).sort({ betType: 1 });
    return res.json(rates.map(fmt));
  } catch (err) {
    logger.error({ err });
    return res.status(500).json({ error: "Internal server error" });
  }
});

// POST /rates (admin)
router.post("/rates", authenticate, requireAdmin, async (req, res) => {
  try {
    const { marketId, betType, multiplier, description } = req.body;
    const rate = await Rate.create({ marketId: marketId ?? null, betType, multiplier, description: description ?? null });
    return res.status(201).json(fmt(rate));
  } catch (err) {
    logger.error({ err });
    return res.status(500).json({ error: "Internal server error" });
  }
});

// PATCH /rates/:id (admin)
router.patch("/rates/:id", authenticate, requireAdmin, async (req, res) => {
  try {
    const { multiplier, description } = req.body;
    const updates: Record<string, unknown> = {};
    if (multiplier !== undefined) updates.multiplier = multiplier;
    if (description !== undefined) updates.description = description;
    const rate = await Rate.findByIdAndUpdate(req.params.id, updates, { new: true });
    if (!rate) return res.status(404).json({ error: "Not found" });
    return res.json(fmt(rate));
  } catch (err) {
    logger.error({ err });
    return res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
