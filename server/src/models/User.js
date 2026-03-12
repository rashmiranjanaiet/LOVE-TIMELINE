import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    displayName: {
      type: String,
      required: true,
      trim: true
    },
    partnerName: {
      type: String,
      required: true,
      trim: true
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true
    },
    passwordHash: {
      type: String,
      required: true
    },
    relationshipStartDate: {
      type: Date,
      required: true
    },
    loveMessageOptIn: {
      type: Boolean,
      default: true
    }
  },
  {
    timestamps: true
  }
);

userSchema.methods.toSafeProfile = function toSafeProfile() {
  return {
    id: this._id.toString(),
    displayName: this.displayName,
    partnerName: this.partnerName,
    email: this.email,
    relationshipStartDate: this.relationshipStartDate,
    loveMessageOptIn: this.loveMessageOptIn,
    createdAt: this.createdAt
  };
};

const User = mongoose.model("User", userSchema);

export default User;
