import mongoose, { Schema, Document } from "mongoose";

export interface IAppSettings extends Document {
  _id: mongoose.Types.ObjectId;
  qrCodeUrl: string;
  whatsappNumber: string;
  upiId: string;
  minBet: number;
  maxBet: number;
  minWithdraw: number;
  maxWithdraw: number;
  appName: string;
  bannerMessage: string | null;
}

const AppSettingsSchema = new Schema<IAppSettings>(
  {
    qrCodeUrl: { type: String, default: "" },
    whatsappNumber: { type: String, default: "" },
    upiId: { type: String, default: "" },
    minBet: { type: Number, default: 10 },
    maxBet: { type: Number, default: 10000 },
    minWithdraw: { type: Number, default: 100 },
    maxWithdraw: { type: Number, default: 50000 },
    appName: { type: String, default: "Sara777" },
    bannerMessage: { type: String, default: null },
  },
  { timestamps: true }
);

export const AppSettings = mongoose.model<IAppSettings>("AppSettings", AppSettingsSchema);
