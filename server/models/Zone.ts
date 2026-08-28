import mongoose from "mongoose";

const ZoneSchema = new mongoose.Schema(
  {
    zoneCode: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    city: {
      type: String,
      required: true,
      trim: true,
    },
    state: {
      type: String,
      default: "Uttar Pradesh",
      trim: true,
    },
    pincodeRanges: {
      type: [String],
      required: true,
      default: [],
    },
    cutoffTime: {
      type: String,
      default: "21:30", // 9:30 PM
    },
    dispatchDeadline: {
      type: String,
      default: "04:30", // 4:30 AM
    },
    dailyCapacity: {
      type: Number,
      default: 100,
    },
    primaryStaffId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

// Index for fast pincode matching and lookup
ZoneSchema.index({ pincodeRanges: 1 });

export default mongoose.models.Zone || mongoose.model("Zone", ZoneSchema);
