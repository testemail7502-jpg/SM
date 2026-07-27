import express from "express";
import cors from "cors";
import router from "./routes/index.js";
import { logger } from "./lib/logger.js";
import { connectDB } from "./lib/db.js";

const app: any = express();

app.use(async (_req: any, _res: any, next: any) => {
  try {
    await connectDB();
    next();
  } catch (err) {
    next(err);
  }
});

app.use(cors());
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));

app.use("/api", router);

// Global Error Handler
app.use((err: any, _req: any, res: any, _next: any) => {
  logger.error({ err: err?.message || err }, "Unhandled Express Error");
  res.status(500).json({ error: err?.message || "Internal Server Error" });
});

export default app;
