import mongoose, { Schema, Document } from "mongoose";
import bcrypt from "bcryptjs";

export interface IUser extends Document {
  _id: mongoose.Types.ObjectId;
  phone: string;
  name: string;
  password: string;
  walletBalance: number;
  isBlocked: boolean;
  role: "user" | "admin";
  referralCode: string | null;
  bankAccount: string | null;
  ifscCode: string | null;
  upiId: string | null;
  accountName: string | null;
  bankName: string | null;
  otp: string | null;
  otpExpiry: Date | null;
  createdAt: Date;
  comparePassword(password: string): Promise<boolean>;
}

const UserSchema = new Schema<IUser>(
  {
    phone: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    password: { type: String, required: true },
    walletBalance: { type: Number, default: 0 },
    isBlocked: { type: Boolean, default: false },
    role: { type: String, enum: ["user", "admin"], default: "user" },
    referralCode: { type: String, default: null },
    bankAccount: { type: String, default: null },
    ifscCode: { type: String, default: null },
    upiId: { type: String, default: null },
    accountName: { type: String, default: null },
    bankName: { type: String, default: null },
    otp: { type: String, default: null },
    otpExpiry: { type: Date, default: null },
  },
  { timestamps: true }
);

UserSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

UserSchema.methods.comparePassword = function (password: string): Promise<boolean> {
  return bcrypt.compare(password, this.password);
};

export const User = mongoose.model<IUser>("User", UserSchema);
