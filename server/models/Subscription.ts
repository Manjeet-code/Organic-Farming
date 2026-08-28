import mongoose from 'mongoose';

const SubscriptionItemSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
    min: 1,
  },
});

const OneTimeAddonSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
    min: 1,
  },
  targetDate: {
    type: String, // YYYY-MM-DD
    required: true,
  },
});

const SubscriptionSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    zoneId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Zone',
      default: null,
    },
    items: [SubscriptionItemSchema],
    frequency: {
      type: String,
      enum: ['WEEKLY', 'MONTHLY', 'DAILY', 'CUSTOM'],
      default: 'WEEKLY',
    },
    deliveryDays: {
      type: [String],
      default: ['Monday', 'Wednesday', 'Friday'],
    },
    status: {
      type: String,
      enum: ['ACTIVE', 'PAUSED', 'CANCELLED'],
      default: 'ACTIVE',
    },
    startDate: {
      type: Date,
      default: Date.now,
    },
    pausedDates: {
      type: [String], // Array of YYYY-MM-DD strings for skipped days (Vacation Mode)
      default: [],
    },
    oneTimeAddons: [OneTimeAddonSchema],
    discountPercent: {
      type: Number,
      default: 5, // 5% for WEEKLY, 10% for MONTHLY
    },
    address: {
      type: String,
      required: true,
    },
    pincode: {
      type: String,
      required: true,
    },
    phone: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

export default mongoose.models.Subscription ||
  mongoose.model('Subscription', SubscriptionSchema);
