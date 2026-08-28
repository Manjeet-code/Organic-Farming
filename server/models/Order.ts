import mongoose from "mongoose";

const OrderSchema = new mongoose.Schema(
  {
    customerName: {
      type: String,
      required: true,
    },
    phone: {
      type: String,
      required: true,
    },
    address: {
      type: String,
      required: true,
    },
    pincode: {
      type: String,
      required: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: false,
    },
    zoneId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Zone",
      default: null,
    },
    subscriptionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Subscription",
      default: null,
    },
    isSubscriptionGenerated: {
      type: Boolean,
      default: false,
    },
    products: [
      {
        product: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product",
        },
        name: String,
        qty: Number,
        price: Number,
        unit: String,
        fulfillmentStatus: {
          type: String,
          enum: ["Pending", "Harvested", "Packed", "Substituted", "Out of Stock"],
          default: "Pending",
        },
        substitutedWithProduct: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product",
          default: null,
        },
        substitutedName: {
          type: String,
          default: "",
        },
        remarks: {
          type: String,
          default: "",
        },
      },
    ],
    totalAmount: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      enum: [
        "Placed",
        "Cutoff Locked",
        "Harvested",
        "Packed",
        "Out for Delivery",
        "Delivered",
        "Failed Delivery",
        "Cancelled",
      ],
      default: "Placed",
    },
    orderType: {
      type: String,
      enum: ["One-Time", "Weekly-Subscription", "Monthly-Subscription"],
      default: "One-Time",
    },
    deliveryDate: {
      type: Date,
      required: true,
    },
    cutoffTimestamp: {
      type: Date,
    },
    auditLog: [
      {
        stage: String,
        updatedBy: String,
        remarks: String,
        timestamp: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    isOnTimeDelivery: {
      type: Boolean,
      default: true,
    },
    reattemptScheduled: {
      type: Boolean,
      default: false,
    },
    paymentStatus: {
      type: String,
      enum: ["PENDING", "PAID", "FAILED", "REFUNDED"],
      default: "PENDING",
    },
    paymentMethod: {
      type: String,
      default: "MOCK_GATEWAY",
    },
    paymentTransactionId: {
      type: String,
      default: "",
    },
    deliveryProofPhoto: {
      type: String,
      default: "",
    },
    deliveryProofRemarks: {
      type: String,
      default: "",
    },
  },
  { timestamps: true }
);



export default mongoose.models.Order ||
  mongoose.model("Order", OrderSchema);
