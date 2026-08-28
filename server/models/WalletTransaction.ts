import mongoose from 'mongoose';

const WalletTransactionSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    amount: {
      type: Number,
      required: true, // positive for credit, negative for deduction
    },
    type: {
      type: String,
      enum: ['REFUND_CREDIT', 'PREPAID_TOPUP', 'CHECKOUT_DEDUCTION'],
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    relatedIssue: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Issue',
      default: null,
    },
    relatedOrder: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Order',
      default: null,
    },
  },
  { timestamps: true }
);

export default mongoose.models.WalletTransaction ||
  mongoose.model('WalletTransaction', WalletTransactionSchema);
