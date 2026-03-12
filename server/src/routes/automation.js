import { Router } from "express";

import { requireAutomationKey } from "../middleware/auth.js";
import User from "../models/User.js";
import { buildAnniversaryReminder, buildLoveMessagePayload } from "../utils/date.js";

const router = Router();

router.use(requireAutomationKey);

router.post("/anniversaries", async (req, res, next) => {
  try {
    const windowDays = Number(req.body?.windowDays || 7);
    const users = await User.find({ loveMessageOptIn: true });
    const reminders = users
      .map((user) => buildAnniversaryReminder(user, new Date(), windowDays))
      .filter(Boolean);

    return res.json({
      count: reminders.length,
      reminders
    });
  } catch (error) {
    return next(error);
  }
});

router.post("/love-messages", async (req, res, next) => {
  try {
    const users = await User.find({ loveMessageOptIn: true });
    const messages = users.map((user) => buildLoveMessagePayload(user, new Date())).filter(Boolean);

    return res.json({
      count: messages.length,
      messages
    });
  } catch (error) {
    return next(error);
  }
});

export default router;
