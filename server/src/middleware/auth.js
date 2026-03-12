import jwt from "jsonwebtoken";

import config from "../config.js";
import User from "../models/User.js";

export async function requireAuth(req, res, next) {
  try {
    const header = req.headers.authorization || "";
    const token = header.startsWith("Bearer ") ? header.slice(7) : "";

    if (!token) {
      return res.status(401).json({ message: "Authentication required." });
    }

    const payload = jwt.verify(token, config.jwtSecret);
    const user = await User.findById(payload.sub);

    if (!user) {
      return res.status(401).json({ message: "User not found." });
    }

    req.user = user;
    return next();
  } catch (error) {
    return res.status(401).json({ message: "Invalid or expired token." });
  }
}

export function requireAutomationKey(req, res, next) {
  const incomingKey = req.headers["x-automation-key"];

  if (!config.automationApiKey || incomingKey !== config.automationApiKey) {
    return res.status(401).json({ message: "Invalid automation key." });
  }

  return next();
}
