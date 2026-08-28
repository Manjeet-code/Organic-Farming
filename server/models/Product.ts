import mongoose from "mongoose";

const ProductSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    category: {
      type: String,
      enum: ["FRUIT", "VEGETABLE", "DAIRY", "OTHER"],
      default: "VEGETABLE",
    },
    unit: {
      type: String,
      default: "kg", // kg, L, piece, pack, dozen
      trim: true,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    dailyStockCeiling: {
      type: Number,
      default: 50, // Daily harvest capacity limit
    },
    isAvailableToday: {
      type: Boolean,
      default: true, // "Today's Harvest" availability toggle
    },
    substituteProductId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      default: null,
    },
    image: {
      type: String,
      default: "",
    },
    description: {
      type: String,
      default: "",
    },
    isSubscriptionEligible: {
      type: Boolean,
      default: true,
    },
    subscriptionDiscount: {
      type: Number,
      default: 5, // 5% discount for subscriptions
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

export default mongoose.models.Product ||
  mongoose.model("Product", ProductSchema);