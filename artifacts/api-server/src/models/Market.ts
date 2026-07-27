import mongoose, { Schema, Document } from "mongoose";

export interface IMarket extends Document {
  _id: mongoose.Types.ObjectId;
  name: string;
  type: string;
  openTime: string;
  closeTime: string;
  isActive: boolean;
  isBettingOpen: boolean;
  openResult: string | null;
  closeResult: string | null;
  jodi: string | null;
  displayOrder: number;
  createdAt: Date;
}

const MarketSchema = new Schema<IMarket>(
  {
    name: { type: String, required: true },
    type: { type: String, default: "main" },
    openTime: { type: String, required: true },
    closeTime: { type: String, required: true },
    isActive: { type: Boolean, default: true },
    isBettingOpen: { type: Boolean, default: false },
    openResult: { type: String, default: null },
    closeResult: { type: String, default: null },
    jodi: { type: String, default: null },
    displayOrder: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export const Market = mongoose.model<IMarket>("Market", MarketSchema);
