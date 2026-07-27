import dns from "node:dns";
import mongoose from "mongoose";
import { User } from "../models/User.js";
import { Market } from "../models/Market.js";
import { Rate } from "../models/Rate.js";
import { AppSettings } from "../models/AppSettings.js";
import { DEFAULT_MULTIPLIERS } from "./matka.js";
import { logger } from "./logger.js";

if (dns.setDefaultResultOrder) {
  dns.setDefaultResultOrder("ipv4first");
}

const DEFAULT_QR_SVG = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="300" height="300" viewBox="0 0 300 300"><rect width="100%" height="100%" fill="white"/><path d="M20 20h80v80H20zM40 40v40h40V40zM20 200h80v80H20zM40 220v40h40v-40zM200 20h80v80h-80zM220 40v40h40V40z" fill="%230f172a"/><path d="M120 20h20v20h-20zM160 20h20v20h-20zM120 60h40v20h-40zM180 60h20v40h-20zM140 100h40v20h-40zM20 120h40v20H20zM80 120h40v20H80zM140 140h20v20h-20zM180 140h40v20h-40zM20 160h20v20H20zM60 160h40v20H60zM120 180h60v20h-60zM200 180h40v40h-40zM120 220h40v20h-40zM180 240h20v40h-20zM220 240h40v20h-40zM140 260h20v20h-20z" fill="%230f172a"/><text x="150" y="155" font-family="sans-serif" font-size="14" font-weight="bold" text-anchor="middle" fill="%23e11d48">PAY VIA UPI QR</text></svg>`;

let isConnected = false;

export async function connectDB(): Promise<void> {
  if (isConnected && mongoose.connection.readyState === 1) {
    return;
  }

  const mongoUri = process.env.MONGODB_URI || "mongodb+srv://testemail7502_db_user:hoUG0y4z2xFoRoeX@cluster0.05kfclu.mongodb.net/satta-matka?retryWrites=true&w=majority";
  try {
    const db = await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 10000,
    });
    isConnected = db.connections[0].readyState === 1;
    logger.info({ mongoUri }, "MongoDB connected successfully");
    await seedInitialData();
  } catch (err: any) {
    logger.error({ err, mongoUri }, "MongoDB connection failed");
    isConnected = false;
    throw err;
  }
}

export async function seedInitialData(): Promise<void> {
  try {
    // 1. Seed Admin
    const adminExists = await User.findOne({ role: "admin" });
    if (!adminExists) {
      await User.create({
        phone: "admin",
        name: "Super Admin",
        password: "admin",
        role: "admin",
        walletBalance: 100000,
      });
      logger.info("Default admin created: admin / admin");
    }

    // 2. Seed Demo User if non-existent
    const userExists = await User.findOne({ phone: "9876543210" });
    if (!userExists) {
      await User.create({
        phone: "9876543210",
        name: "Demo Player",
        password: "user123",
        role: "user",
        walletBalance: 1000,
      });
      logger.info("Default demo user created: 9876543210 / user123");
    }

    // 3. Seed AppSettings
    const settingsExists = await AppSettings.findOne({});
    if (!settingsExists) {
      await AppSettings.create({
        appName: "Sara 777",
        welcomeMessage: "Welcome to Sara 777 Satta Matka Official Gaming App!",
        upiId: "sara777@upi",
        qrCodeUrl: DEFAULT_QR_SVG,
        whatsappNumber: "+919876543210",
        minDeposit: 100,
        maxDeposit: 50000,
        minWithdraw: 200,
        maxWithdraw: 50000,
        isMaintenance: false,
      });
      logger.info("Default AppSettings seeded");
    }

    // 4. Seed Multipliers/Rates if non-existent
    const rateCount = await Rate.countDocuments();
    if (rateCount === 0) {
      const rateDocs = Object.entries(DEFAULT_MULTIPLIERS).map(([betType, multiplier]) => ({
        betType,
        multiplier,
        description: `Default multiplier for ${betType}`,
      }));
      await Rate.insertMany(rateDocs);
      logger.info("Default 15 bet type rates seeded");
    }

    // 5. Seed Initial Active Markets
    const marketCount = await Market.countDocuments();
    if (marketCount === 0) {
      const initialMarkets = [
        { name: "KALYAN", type: "REGULAR", openTime: "16:00", closeTime: "18:00", displayOrder: 1 },
        { name: "TIME BAZAR", type: "REGULAR", openTime: "13:00", closeTime: "14:00", displayOrder: 2 },
        { name: "MILAN DAY", type: "REGULAR", openTime: "15:00", closeTime: "17:00", displayOrder: 3 },
        { name: "RAJDHANI DAY", type: "REGULAR", openTime: "15:30", closeTime: "17:30", displayOrder: 4 },
        { name: "MAIN BAZAR", type: "REGULAR", openTime: "21:30", closeTime: "00:05", displayOrder: 5 },
        { name: "KALYAN NIGHT", type: "REGULAR", openTime: "21:25", closeTime: "23:35", displayOrder: 6 },
      ];
      await Market.insertMany(initialMarkets);
      logger.info("Default Markets seeded");
    }
  } catch (err) {
    logger.error({ err }, "Failed to seed initial data");
  }
}
