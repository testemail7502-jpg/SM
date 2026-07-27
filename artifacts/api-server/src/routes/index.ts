import { Router } from "express";
import healthRouter from "./health.js";
import authRouter from "./auth.js";
import marketsRouter from "./markets.js";
import betsRouter from "./bets.js";
import resultsRouter from "./results.js";
import depositRouter from "./deposit.js";
import withdrawRouter from "./withdraw.js";
import usersRouter from "./users.js";
import adminRouter from "./admin.js";
import ratesRouter from "./rates.js";
import settingsRouter from "./settings.js";
import chatRouter from "./chat.js";

const router: any = Router();

router.use(healthRouter);
router.use(authRouter);
router.use(marketsRouter);
router.use(betsRouter);
router.use(resultsRouter);
router.use(depositRouter);
router.use(withdrawRouter);
router.use(usersRouter);
router.use(adminRouter);
router.use(ratesRouter);
router.use(settingsRouter);
router.use(chatRouter);

export default router;
