import express from "express";
import cors from "cors";
import router from "./routes";
import { logger } from "./lib/logger";
import { connectDB } from "./lib/db";

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

export default app;
