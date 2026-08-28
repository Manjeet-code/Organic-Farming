import mongoose from 'mongoose';

const IssueSchema = new mongoose.Schema(
  {
    order: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Order',
      required: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    productName: {
      type: String,
      required: true,
    },
    issueType: {
      type: String,
      enum: ['SPOILED_PRODUCE', 'MISSING_ITEM', 'WRONG_ITEM', 'QUALITY_DEFECT', 'LATE_DELIVERY', 'WEIGHT_DEFECT', 'DAMAGED_PACKAGING', 'UNAUTHORIZED_SUBSTITUTION'],
      default: 'SPOILED_PRODUCE',
    },

    description: {
      type: String,
      required: true,
    },
    photoUrl: {
      type: String,
      default: '',
    },
    status: {
      type: String,
      enum: [
        'OPEN',
        'IN_REVIEW',
        'RESOLVED_WALLET_CREDIT',
        'RESOLVED_REPLACEMENT',
        'RESOLVED_REFUND',
        'REJECTED',
      ],
      default: 'OPEN',
    },
    resolutionAction: {
      type: String,
      enum: ['NONE', 'WALLET_CREDIT', 'REPLACEMENT', 'REFUND', 'REJECTED'],
      default: 'NONE',
    },
    refundAmount: {
      type: Number,
      default: 0,
    },
    adminRemarks: {
      type: String,
      default: '',
    },
    resolvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    resolvedAt: {
      type: Date,
    },
  },
  { timestamps: true }
);

export default mongoose.models.Issue || mongoose.model('Issue', IssueSchema);
