import { Router } from "express";
import healthRouter from "./health";
import authRouter from "./auth";
import marketsRouter from "./markets";
import betsRouter from "./bets";
import resultsRouter from "./results";
import depositRouter from "./deposit";
import withdrawRouter from "./withdraw";
import usersRouter from "./users";
import adminRouter from "./admin";
import ratesRouter from "./rates";
import settingsRouter from "./settings";
import chatRouter from "./chat";

const router = Router();

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
