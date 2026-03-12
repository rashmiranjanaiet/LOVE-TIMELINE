import mongoose from "mongoose";

import app from "./app.js";
import config from "./config.js";

async function start() {
  if (!config.mongoUri) {
    throw new Error("MONGODB_URI is required.");
  }

  if (!config.jwtSecret) {
    throw new Error("JWT_SECRET is required.");
  }

  await mongoose.connect(config.mongoUri);

  app.listen(config.port, () => {
    console.log(`Love Timeline API listening on port ${config.port}`);
  });
}

start().catch((error) => {
  console.error(error);
  process.exit(1);
});
