import mongoose from "mongoose";
import { User } from "../models/User";
import { Market } from "../models/Market";
import { Rate } from "../models/Rate";
import { AppSettings } from "../models/AppSettings";
import { DEFAULT_MULTIPLIERS } from "./matka";
import { logger } from "./logger";

const DEFAULT_QR_SVG = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="300" height="300" viewBox="0 0 300 300"><rect width="100%" height="100%" fill="white"/><path d="M20 20h80v80H20zM40 40v40h40V40zM20 200h80v80H20zM40 220v40h40v-40zM200 20h80v80h-80zM220 40v40h40V40z" fill="%230f172a"/><path d="M120 20h20v20h-20zM160 20h20v20h-20zM120 60h40v20h-40zM180 60h20v40h-20zM140 100h40v20h-40zM20 120h40v20H20zM80 120h40v20H80zM140 140h20v20h-20zM180 140h40v20h-40zM20 160h20v20H20zM60 160h40v20H60zM120 180h60v20h-60zM200 180h40v40h-40zM120 220h40v20h-40zM180 240h20v40h-20zM220 240h40v20h-40zM140 260h20v20h-20z" fill="%230f172a"/><text x="150" y="155" font-family="sans-serif" font-size="14" font-weight="bold" text-anchor="middle" fill="%23e11d48">PAY VIA UPI QR</text></svg>`;

export async function connectDB(): Promise<void> {
  const mongoUri = process.env.MONGODB_URI || "mongodb+srv://testemail7502_db_user:hoUG0y4z2xFoRoeX@cluster0.05kfclu.mongodb.net/satta-matka?retryWrites=true&w=majority";
  try {
    await mongoose.connect(mongoUri);
    logger.info({ mongoUri }, "MongoDB connected successfully");
    await seedInitialData();
  } catch (err) {
    logger.error({ err, mongoUri }, "MongoDB connection failed");
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
        password: "admin", // hashed by pre-save
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
        walletBalance: 5000,
      });
      logger.info("Default demo user created: 9876543210 / user123");
    }

    // 3. Seed App Settings
    let settings = await AppSettings.findOne();
    if (!settings) {
      settings = await AppSettings.create({
        qrCodeUrl: DEFAULT_QR_SVG,
        upiId: "sara777@upi",
        whatsappNumber: "+919876543210",
        appName: "Sara777 Matka",
        minBet: 10,
        maxBet: 10000,
        minWithdraw: 100,
        maxWithdraw: 50000,
      });
      logger.info("Default AppSettings seeded");
    }

    // 4. Seed Global Rates for all 15 Bet Types
    const existingRates = await Rate.find({ marketId: null });
    if (existingRates.length === 0) {
      const rateDocs = Object.entries(DEFAULT_MULTIPLIERS).map(([betType, multiplier]) => ({
        marketId: null,
        betType,
        multiplier,
        description: `${betType.replace(/_/g, " ").toUpperCase()} rate`,
      }));
      await Rate.insertMany(rateDocs);
      logger.info("Default 15 bet type rates seeded");
    }

    // 5. Seed Default Markets
    const marketCount = await Market.countDocuments();
    if (marketCount === 0) {
      const defaultMarkets = [
        {
          name: "KALYAN MORNING",
          openTime: "11:00 AM",
          closeTime: "12:02 PM",
          isOpen: true,
          isBettingOpen: true,
          isActive: true,
          openResult: "1",
          closeResult: "4",
          jodi: "14",
          daysOpen: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
        },
        {
          name: "TIME BAZAR",
          openTime: "01:00 PM",
          closeTime: "02:00 PM",
          isOpen: true,
          isBettingOpen: true,
          isActive: true,
          openResult: "3",
          closeResult: "8",
          jodi: "38",
          daysOpen: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
        },
        {
          name: "MILAN DAY",
          openTime: "03:00 PM",
          closeTime: "05:00 PM",
          isOpen: true,
          isBettingOpen: true,
          isActive: true,
          openResult: "***",
          closeResult: "***",
          jodi: "**",
          daysOpen: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
        },
        {
          name: "KALYAN",
          openTime: "04:30 PM",
          closeTime: "06:30 PM",
          isOpen: true,
          isBettingOpen: true,
          isActive: true,
          openResult: "***",
          closeResult: "***",
          jodi: "**",
          daysOpen: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
        },
        {
          name: "SRIDEVI NIGHT",
          openTime: "07:00 PM",
          closeTime: "08:00 PM",
          isOpen: true,
          isBettingOpen: true,
          isActive: true,
          openResult: "***",
          closeResult: "***",
          jodi: "**",
          daysOpen: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
        },
        {
          name: "MAIN BAZAR",
          openTime: "09:40 PM",
          closeTime: "12:05 AM",
          isOpen: true,
          isBettingOpen: true,
          isActive: true,
          openResult: "***",
          closeResult: "***",
          jodi: "**",
          daysOpen: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
        },
      ];
      await Market.insertMany(defaultMarkets);
      logger.info("Default Markets seeded");
    }
  } catch (err) {
    logger.error({ err }, "Error seeding initial data");
  }
}

export default mongoose;
