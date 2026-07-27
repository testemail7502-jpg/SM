import mongoose, { Schema, Document } from "mongoose";

export type BetType =
  | "single_digit"
  | "jodi"
  | "single_panna"
  | "double_panna"
  | "triple_panna"
  | "half_sangam"
  | "half_sangam_open"
  | "half_sangam_close"
  | "full_sangam"
  | "family_sangam"
  | "crossing"
  | "sp_motor"
  | "group_jodi"
  | "digit_jodi"
  | "red_bracket"
  | "odd_even";

export interface IBet extends Document {
  _id: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  marketId: mongoose.Types.ObjectId;
  betType: BetType;
  number: string;
  amount: number;
  session: "open" | "close";
  status: "pending" | "won" | "lost";
  winAmount: number | null;
  createdAt: Date;
}

const BetSchema = new Schema<IBet>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    marketId: { type: Schema.Types.ObjectId, ref: "Market", required: true },
    betType: {
      type: String,
      enum: [
        "single_digit",
        "jodi",
        "single_panna",
        "double_panna",
        "triple_panna",
        "half_sangam",
        "half_sangam_open",
        "half_sangam_close",
        "full_sangam",
        "family_sangam",
        "crossing",
        "sp_motor",
        "group_jodi",
        "digit_jodi",
        "red_bracket",
        "odd_even",
      ],
      required: true,
    },
    number: { type: String, required: true },
    amount: { type: Number, required: true },
    session: { type: String, enum: ["open", "close"], required: true },
    status: { type: String, enum: ["pending", "won", "lost"], default: "pending" },
    winAmount: { type: Number, default: null },
  },
  { timestamps: true }
);

export const Bet = mongoose.model<IBet>("Bet", BetSchema);
