import { Router } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

import config from "../config.js";
import { requireAuth } from "../middleware/auth.js";
import User from "../models/User.js";

const router = Router();

function createToken(user) {
  return jwt.sign({ sub: user._id.toString() }, config.jwtSecret, {
    expiresIn: config.jwtExpiresIn
  });
}

function validateSignupBody(body) {
  const requiredFields = ["displayName", "partnerName", "email", "password", "relationshipStartDate"];

  for (const field of requiredFields) {
    if (!body[field]) {
      return `${field} is required.`;
    }
  }

  if (String(body.password).length < 8) {
    return "Password must be at least 8 characters.";
  }

  return null;
}

router.post("/signup", async (req, res, next) => {
  try {
    const validationError = validateSignupBody(req.body);

    if (validationError) {
      return res.status(400).json({ message: validationError });
    }

    const email = String(req.body.email).toLowerCase().trim();
    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(409).json({ message: "An account with that email already exists." });
    }

    const passwordHash = await bcrypt.hash(req.body.password, 12);
    const user = await User.create({
      displayName: req.body.displayName.trim(),
      partnerName: req.body.partnerName.trim(),
      email,
      passwordHash,
      relationshipStartDate: req.body.relationshipStartDate,
      loveMessageOptIn: req.body.loveMessageOptIn !== false
    });

    const token = createToken(user);
    return res.status(201).json({
      token,
      user: user.toSafeProfile()
    });
  } catch (error) {
    return next(error);
  }
});

router.post("/login", async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required." });
    }

    const user = await User.findOne({ email: String(email).toLowerCase().trim() });

    if (!user) {
      return res.status(401).json({ message: "Invalid email or password." });
    }

    const passwordMatches = await bcrypt.compare(password, user.passwordHash);

    if (!passwordMatches) {
      return res.status(401).json({ message: "Invalid email or password." });
    }

    const token = createToken(user);
    return res.json({
      token,
      user: user.toSafeProfile()
    });
  } catch (error) {
    return next(error);
  }
});

router.get("/me", requireAuth, (req, res) => {
  res.json({ user: req.user.toSafeProfile() });
});

router.put("/profile", requireAuth, async (req, res, next) => {
  try {
    const updates = {};

    if (req.body.displayName) {
      updates.displayName = req.body.displayName.trim();
    }

    if (req.body.partnerName) {
      updates.partnerName = req.body.partnerName.trim();
    }

    if (req.body.relationshipStartDate) {
      updates.relationshipStartDate = req.body.relationshipStartDate;
    }

    if (typeof req.body.loveMessageOptIn === "boolean") {
      updates.loveMessageOptIn = req.body.loveMessageOptIn;
    }

    const user = await User.findByIdAndUpdate(req.user._id, updates, {
      new: true,
      runValidators: true
    });

    return res.json({ user: user.toSafeProfile() });
  } catch (error) {
    return next(error);
  }
});

export default router;
