import mongoose from 'mongoose';

const PaymentTransactionSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    orderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Order',
      default: null,
    },
    subscriptionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Subscription',
      default: null,
    },
    amount: {
      type: Number,
      required: true,
    },
    currency: {
      type: String,
      default: 'INR',
    },
    paymentMethod: {
      type: String,
      enum: ['MOCK_UPI', 'MOCK_CARD', 'MOCK_NET_BANKING', 'MOCK_WALLET'],
      default: 'MOCK_UPI',
    },
    transactionId: {
      type: String,
      required: true,
      unique: true,
    },
    gatewayAuthCode: {
      type: String,
      default: '',
    },
    status: {
      type: String,
      enum: ['SUCCESS', 'FAILED', 'PENDING'],
      default: 'PENDING',
    },
    requestPayload: {
      type: Object,
      default: {},
    },
    gatewayResponse: {
      type: Object,
      default: {},
    },
    syncStatus: {
      type: String,
      enum: ['SYNCED', 'SYNC_FAILED', 'PENDING'],
      default: 'SYNCED',
    },
    remarks: {
      type: String,
      default: 'Simulated payment transaction via FarmFresh Mock Gateway',
    },
  },
  { timestamps: true }
);

export default mongoose.models.PaymentTransaction ||
  mongoose.model('PaymentTransaction', PaymentTransactionSchema);
