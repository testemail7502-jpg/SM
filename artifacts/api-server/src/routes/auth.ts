import { Router } from "express";
import { User } from "../models/User";
import { signToken } from "../lib/jwt";
import { logger } from "../lib/logger";

const router = Router();

// POST /auth/register
router.post("/auth/register", async (req, res) => {
  try {
    const { phone, name, password, referralCode } = req.body;
    if (!phone || !name || !password) {
      return res.status(400).json({ error: "phone, name and password are required" });
    }
    const existing = await User.findOne({ phone });
    if (existing) {
      return res.status(400).json({ error: "Phone already registered" });
    }
    const user = await User.create({
      phone,
      name,
      password,
      referralCode: referralCode || Math.random().toString(36).slice(2, 8).toUpperCase(),
    });
    const token = signToken({ userId: user._id.toString(), role: user.role });
    return res.status(201).json({
      token,
      user: formatUser(user),
    });
  } catch (err) {
    logger.error({ err }, "register error");
    return res.status(500).json({ error: "Internal server error" });
  }
});

// POST /auth/login
router.post("/auth/login", async (req, res) => {
  try {
    const { phone, password } = req.body;
    const user = await User.findOne({ phone });
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ error: "Invalid phone or password" });
    }
    if (user.isBlocked) {
      return res.status(403).json({ error: "Account blocked" });
    }
    const token = signToken({ userId: user._id.toString(), role: user.role });
    return res.json({ token, user: formatUser(user) });
  } catch (err) {
    logger.error({ err }, "login error");
    return res.status(500).json({ error: "Internal server error" });
  }
});

// POST /auth/send-otp
router.post("/auth/send-otp", async (req, res) => {
  try {
    const { phone } = req.body;
    if (!phone) return res.status(400).json({ error: "Phone required" });
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiry = new Date(Date.now() + 5 * 60 * 1000);
    await User.findOneAndUpdate({ phone }, { otp, otpExpiry: expiry }, { upsert: false });
    logger.info({ phone, otp }, "OTP generated (mock - no SMS sent)");
    console.log(`[OTP] Phone: ${phone} → OTP: ${otp}`);
    return res.json({ message: "OTP sent successfully" });
  } catch (err) {
    logger.error({ err }, "send-otp error");
    return res.status(500).json({ error: "Internal server error" });
  }
});

// POST /auth/verify-otp
router.post("/auth/verify-otp", async (req, res) => {
  try {
    const { phone, otp } = req.body;
    const user = await User.findOne({ phone });
    if (!user || user.otp !== otp || !user.otpExpiry || user.otpExpiry < new Date()) {
      return res.status(400).json({ verified: false });
    }
    await User.findByIdAndUpdate(user._id, { otp: null, otpExpiry: null });
    return res.json({ verified: true });
  } catch (err) {
    logger.error({ err }, "verify-otp error");
    return res.status(500).json({ error: "Internal server error" });
  }
});

// POST /auth/admin-login
router.post("/auth/admin-login", async (req, res) => {
  try {
    const { username, password } = req.body;
    const admin = await User.findOne({ phone: username, role: "admin" });
    if (!admin || !(await admin.comparePassword(password))) {
      return res.status(401).json({ error: "Invalid credentials" });
    }
    const token = signToken({ userId: admin._id.toString(), role: "admin" });
    return res.json({ token, user: formatUser(admin) });
  } catch (err) {
    logger.error({ err }, "admin-login error");
    return res.status(500).json({ error: "Internal server error" });
  }
});

function formatUser(user: InstanceType<typeof User>) {
  return {
    id: user._id.toString(),
    phone: user.phone,
    name: user.name,
    walletBalance: user.walletBalance,
    isBlocked: user.isBlocked,
    role: user.role,
    referralCode: user.referralCode ?? null,
    createdAt: user.createdAt.toISOString(),
  };
}

export default router;
