import mongoose, { Schema, Document } from "mongoose";

export type TransactionType = "deposit" | "withdraw" | "bet" | "win" | "refund" | "bonus";

export interface ITransaction extends Document {
  _id: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  type: TransactionType;
  amount: number;
  balance: number;
  description: string | null;
  referenceId: string | null;
  createdAt: Date;
}

const TransactionSchema = new Schema<ITransaction>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    type: {
      type: String,
      enum: ["deposit", "withdraw", "bet", "win", "refund", "bonus"],
      required: true,
    },
    amount: { type: Number, required: true },
    balance: { type: Number, required: true },
    description: { type: String, default: null },
    referenceId: { type: String, default: null },
  },
  { timestamps: true }
);

export const Transaction = mongoose.model<ITransaction>("Transaction", TransactionSchema);
