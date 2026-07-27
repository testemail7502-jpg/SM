import mongoose, { Schema, Document } from "mongoose";

export interface IDepositRequest extends Document {
  _id: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  amount: number;
  utrNumber: string | null;
  screenshotUrl: string | null;
  status: "pending" | "approved" | "rejected";
  adminNote: string | null;
  createdAt: Date;
}

const DepositRequestSchema = new Schema<IDepositRequest>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    amount: { type: Number, required: true },
    utrNumber: { type: String, default: null },
    screenshotUrl: { type: String, default: null },
    status: { type: String, enum: ["pending", "approved", "rejected"], default: "pending" },
    adminNote: { type: String, default: null },
  },
  { timestamps: true }
);

export const DepositRequest = mongoose.model<IDepositRequest>(
  "DepositRequest",
  DepositRequestSchema
);
