import mongoose, { Schema, Document } from "mongoose";

export interface IResult extends Document {
  _id: mongoose.Types.ObjectId;
  marketId: mongoose.Types.ObjectId;
  date: string; // YYYY-MM-DD
  openPanna: string | null;
  closePanna: string | null;
  openDigit: string | null;
  closeDigit: string | null;
  jodi: string | null;
  isDeclared: boolean;
  winnersCount: number | null;
  totalPayout: number | null;
  createdAt: Date;
}

const ResultSchema = new Schema<IResult>(
  {
    marketId: { type: Schema.Types.ObjectId, ref: "Market", required: true },
    date: { type: String, required: true },
    openPanna: { type: String, default: null },
    closePanna: { type: String, default: null },
    openDigit: { type: String, default: null },
    closeDigit: { type: String, default: null },
    jodi: { type: String, default: null },
    isDeclared: { type: Boolean, default: false },
    winnersCount: { type: Number, default: null },
    totalPayout: { type: Number, default: null },
  },
  { timestamps: true }
);

export const Result = mongoose.model<IResult>("Result", ResultSchema);
