import mongoose, { Schema, Document } from "mongoose";

export interface IRate extends Document {
  _id: mongoose.Types.ObjectId;
  marketId: mongoose.Types.ObjectId | null;
  betType: string;
  multiplier: number;
  description: string | null;
}

const RateSchema = new Schema<IRate>(
  {
    marketId: { type: Schema.Types.ObjectId, ref: "Market", default: null },
    betType: { type: String, required: true },
    multiplier: { type: Number, required: true },
    description: { type: String, default: null },
  },
  { timestamps: true }
);

export const Rate = mongoose.model<IRate>("Rate", RateSchema);
