import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import cors from "cors";
import express from "express";

import config from "./config.js";
import authRoutes from "./routes/auth.js";
import automationRoutes from "./routes/automation.js";
import healthRoutes from "./routes/health.js";
import memoryRoutes from "./routes/memories.js";
import { getUploadsDirectory } from "./services/media.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const clientDistPath = path.resolve(__dirname, "../../client/dist");

const app = express();

app.use(
  cors({
    origin: config.clientOrigin,
    credentials: false
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/uploads", express.static(getUploadsDirectory()));

app.use("/api/health", healthRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/memories", memoryRoutes);
app.use("/api/automation", automationRoutes);

if (fs.existsSync(clientDistPath)) {
  app.use(express.static(clientDistPath));
  app.get("*", (req, res, next) => {
    if (req.path.startsWith("/api/")) {
      return next();
    }

    return res.sendFile(path.join(clientDistPath, "index.html"));
  });
}

app.use((req, res) => {
  res.status(404).json({ message: "Route not found." });
});

app.use((error, req, res, next) => {
  if (error?.message?.includes("Only JPG")) {
    return res.status(400).json({ message: error.message });
  }

  if (error?.code === "LIMIT_FILE_SIZE") {
    return res.status(400).json({ message: "Files must be 25MB or smaller." });
  }

  if (error?.name === "ValidationError") {
    return res.status(400).json({ message: error.message });
  }

  if (error?.code === 11000) {
    return res.status(409).json({ message: "Duplicate value detected." });
  }

  return res.status(500).json({
    message: "Something went wrong on the server."
  });
});

export default app;
