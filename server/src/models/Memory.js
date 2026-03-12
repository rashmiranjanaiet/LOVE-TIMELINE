import mongoose from "mongoose";

const mediaSchema = new mongoose.Schema(
  {
    url: {
      type: String,
      required: true
    },
    publicId: {
      type: String,
      default: ""
    },
    resourceType: {
      type: String,
      enum: ["image", "video"],
      required: true
    },
    fileName: {
      type: String,
      required: true
    }
  },
  { _id: false }
);

const memorySchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true
    },
    title: {
      type: String,
      required: true,
      trim: true
    },
    description: {
      type: String,
      trim: true,
      default: ""
    },
    category: {
      type: String,
      enum: ["first-meeting", "trip", "birthday", "anniversary", "milestone", "other"],
      default: "other"
    },
    location: {
      type: String,
      trim: true,
      default: ""
    },
    eventDate: {
      type: Date,
      required: true
    },
    media: {
      type: [mediaSchema],
      default: []
    }
  },
  {
    timestamps: true
  }
);

const Memory = mongoose.model("Memory", memorySchema);

export default Memory;
