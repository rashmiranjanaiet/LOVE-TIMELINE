import { Router } from "express";

import { requireAuth } from "../middleware/auth.js";
import upload from "../middleware/upload.js";
import Memory from "../models/Memory.js";
import { deleteMediaFiles, uploadMediaFiles } from "../services/media.js";
import { triggerMemoryCreatedWebhook } from "../services/n8n.js";

const router = Router();

function parseMemoryPayload(body) {
  return {
    title: String(body.title || "").trim(),
    description: String(body.description || "").trim(),
    category: body.category || "other",
    location: String(body.location || "").trim(),
    eventDate: body.eventDate
  };
}

router.get("/", requireAuth, async (req, res, next) => {
  try {
    const memories = await Memory.find({ user: req.user._id }).sort({ eventDate: 1, createdAt: 1 });
    return res.json({ memories });
  } catch (error) {
    return next(error);
  }
});

router.post("/", requireAuth, upload.array("media", 6), async (req, res, next) => {
  try {
    const payload = parseMemoryPayload(req.body);

    if (!payload.title || !payload.eventDate) {
      return res.status(400).json({ message: "Title and event date are required." });
    }

    const media = await uploadMediaFiles(req.files);
    const memory = await Memory.create({
      ...payload,
      user: req.user._id,
      media
    });

    await triggerMemoryCreatedWebhook({
      type: "memory.created",
      user: req.user.toSafeProfile(),
      memory
    });

    return res.status(201).json({ memory });
  } catch (error) {
    return next(error);
  }
});

router.put("/:memoryId", requireAuth, upload.array("media", 6), async (req, res, next) => {
  try {
    const memory = await Memory.findOne({ _id: req.params.memoryId, user: req.user._id });

    if (!memory) {
      return res.status(404).json({ message: "Memory not found." });
    }

    const payload = parseMemoryPayload(req.body);
    const clearExistingMedia = req.body.clearExistingMedia === "true";

    if (payload.title) {
      memory.title = payload.title;
    }

    memory.description = payload.description;
    memory.category = payload.category;
    memory.location = payload.location;

    if (payload.eventDate) {
      memory.eventDate = payload.eventDate;
    }

    if (clearExistingMedia) {
      await deleteMediaFiles(memory.media);
      memory.media = [];
    }

    if (req.files?.length) {
      const uploadedMedia = await uploadMediaFiles(req.files);
      memory.media = [...memory.media, ...uploadedMedia];
    }

    await memory.save();
    return res.json({ memory });
  } catch (error) {
    return next(error);
  }
});

router.delete("/:memoryId", requireAuth, async (req, res, next) => {
  try {
    const memory = await Memory.findOne({ _id: req.params.memoryId, user: req.user._id });

    if (!memory) {
      return res.status(404).json({ message: "Memory not found." });
    }

    await deleteMediaFiles(memory.media);
    await memory.deleteOne();

    return res.status(204).send();
  } catch (error) {
    return next(error);
  }
});

export default router;
