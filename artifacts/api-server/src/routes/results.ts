import { Router as ExpressRouter } from "express";
import { authenticate, requireAdmin } from "../middlewares/auth";
import { Result } from "../models/Result";
import { Bet } from "../models/Bet";
import { Market } from "../models/Market";
import { User } from "../models/User";
import { Transaction } from "../models/Transaction";
import { Rate } from "../models/Rate";
import { pannaToDigit, isBetWinner, DEFAULT_MULTIPLIERS } from "../lib/matka";
import { logger } from "../lib/logger";

const router = ExpressRouter();

// GET /results
router.get("/results", async (req, res) => {
  try {
    const { marketId, date, page = "1", limit = "50" } = req.query as Record<string, string>;
    const filter: Record<string, unknown> = {};
    if (marketId) filter.marketId = marketId;
    if (date) filter.date = date;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const results = await Result.find(filter)
      .sort({ date: -1, createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .populate("marketId", "name");

    return res.json(
      results.map((r) => ({
        id: r._id.toString(),
        marketId: r.marketId ? r.marketId._id.toString() : "",
        marketName: r.marketId ? (r.marketId as unknown as { name: string }).name : null,
        date: r.date,
        openPanna: r.openPanna ?? null,
        closePanna: r.closePanna ?? null,
        openDigit: r.openDigit ?? null,
        closeDigit: r.closeDigit ?? null,
        jodi: r.jodi ?? null,
        isDeclared: r.isDeclared,
        winnersCount: r.winnersCount ?? null,
        totalPayout: r.totalPayout ?? null,
        createdAt: (r.createdAt as Date).toISOString(),
      }))
    );
  } catch (err) {
    logger.error({ err });
    return res.status(500).json({ error: "Internal server error" });
  }
});

// POST /results (admin) - declare result
router.post("/results", authenticate, requireAdmin, async (req, res) => {
  try {
    const { marketId, openPanna, closePanna, date } = req.body;

    const formattedDate = date || new Date().toISOString().split("T")[0];

    const openDigit = openPanna ? pannaToDigit(openPanna) : "";
    const closeDigit = closePanna ? pannaToDigit(closePanna) : "";
    const jodi = openDigit && closeDigit ? `${openDigit}${closeDigit}` : "";

    let result = await Result.findOne({ marketId, date: formattedDate });
    if (!result) {
      result = await Result.create({
        marketId,
        date: formattedDate,
        openPanna: openPanna || null,
        closePanna: closePanna || null,
        openDigit: openDigit || null,
        closeDigit: closeDigit || null,
        jodi: jodi || null,
        isDeclared: true,
      });
    } else {
      if (openPanna) {
        result.openPanna = openPanna;
        result.openDigit = openDigit;
      }
      if (closePanna) {
        result.closePanna = closePanna;
        result.closeDigit = closeDigit;
      }
      if (openDigit && closeDigit) {
        result.jodi = jodi;
      }
      result.isDeclared = true;
    }

    // Update market display
    const marketUpdates: Record<string, string> = {};
    if (openDigit) marketUpdates.openResult = openDigit;
    if (closeDigit) marketUpdates.closeResult = closeDigit;
    if (jodi) marketUpdates.jodi = jodi;
    await Market.findByIdAndUpdate(marketId, marketUpdates);

    // Rates lookup
    const rates = await Rate.find({ $or: [{ marketId }, { marketId: null }] });
    const ratesSimple = rates.map((r) => ({ betType: r.betType, multiplier: r.multiplier }));

    // Process pending bets for this market
    const pendingBets = await Bet.find({ marketId, status: "pending" });
    let winnersCount = result.winnersCount || 0;
    let totalPayout = result.totalPayout || 0;

    for (const bet of pendingBets) {
      // Skip close session bets if closePanna is not declared yet
      if (bet.session === "close" && !closePanna && !result.closePanna) {
        continue;
      }
      if (bet.session === "open" && !openPanna && !result.openPanna) {
        continue;
      }

      const activeOpenPanna = openPanna || result.openPanna || "";
      const activeClosePanna = closePanna || result.closePanna || "";
      const activeOpenDigit = openDigit || result.openDigit || "";
      const activeCloseDigit = closeDigit || result.closeDigit || "";
      const activeJodi = jodi || result.jodi || "";

      const won = isBetWinner(
        bet.betType,
        bet.number,
        bet.session,
        activeOpenPanna,
        activeClosePanna,
        activeOpenDigit,
        activeCloseDigit,
        activeJodi
      );

      if (won) {
        const mult = ratesSimple.find((r) => r.betType === bet.betType)?.multiplier ?? DEFAULT_MULTIPLIERS[bet.betType] ?? 1;
        const winAmount = bet.amount * mult;

        const user = await User.findByIdAndUpdate(
          bet.userId,
          { $inc: { walletBalance: winAmount } },
          { new: true }
        );
        if (user) {
          await Transaction.create({
            userId: bet.userId,
            type: "win",
            amount: winAmount,
            balance: user.walletBalance,
            description: `WIN: ${bet.betType} (${bet.number}) - Multiplier: ${mult}x`,
            referenceId: result._id.toString(),
          });
        }

        await Bet.findByIdAndUpdate(bet._id, { status: "won", winAmount });
        winnersCount++;
        totalPayout += winAmount;
      } else {
        // Only mark lost if the session required for the bet type has been declared
        const isSessionReady =
          (bet.session === "open" && activeOpenPanna) ||
          (bet.session === "close" && activeClosePanna) ||
          (activeOpenPanna && activeClosePanna);
        if (isSessionReady) {
          await Bet.findByIdAndUpdate(bet._id, { status: "lost" });
        }
      }
    }

    result.winnersCount = winnersCount;
    result.totalPayout = totalPayout;
    await result.save();

    const market = await Market.findById(marketId);
    return res.status(201).json({
      result: {
        id: result._id.toString(),
        marketId: result.marketId.toString(),
        marketName: market?.name ?? null,
        date: result.date,
        openPanna: result.openPanna,
        closePanna: result.closePanna,
        openDigit: result.openDigit,
        closeDigit: result.closeDigit,
        jodi: result.jodi,
        isDeclared: true,
        winnersCount,
        totalPayout,
        createdAt: (result.createdAt as Date).toISOString(),
      },
      winnersCount,
      totalPayout,
    });
  } catch (err) {
    logger.error({ err }, "declare result error");
    return res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
