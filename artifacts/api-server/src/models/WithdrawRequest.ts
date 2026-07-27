import mongoose, { Schema, Document } from "mongoose";

export interface IWithdrawRequest extends Document {
  _id: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  amount: number;
  bankAccount: string | null;
  ifscCode: string | null;
  upiId: string | null;
  accountName: string | null;
  bankName: string | null;
  status: "pending" | "approved" | "rejected" | "paid";
  adminNote: string | null;
  paidAt: Date | null;
  createdAt: Date;
}

const WithdrawRequestSchema = new Schema<IWithdrawRequest>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    amount: { type: Number, required: true },
    bankAccount: { type: String, default: null },
    ifscCode: { type: String, default: null },
    upiId: { type: String, default: null },
    accountName: { type: String, default: null },
    bankName: { type: String, default: null },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected", "paid"],
      default: "pending",
    },
    adminNote: { type: String, default: null },
    paidAt: { type: Date, default: null },
  },
  { timestamps: true }
);

export const WithdrawRequest = mongoose.model<IWithdrawRequest>(
  "WithdrawRequest",
  WithdrawRequestSchema
);
