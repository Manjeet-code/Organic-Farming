import mongoose, { Schema, Document } from 'mongoose';

export interface INotification extends Document {
  user: mongoose.Types.ObjectId;
  title: string;
  message: string;
  type: 
    | 'ORDER_PLACED'
    | 'CUTOFF_REMINDER'
    | 'HARVESTED'
    | 'PACKED'
    | 'OUT_FOR_DELIVERY'
    | 'DELIVERED'
    | 'SUBSTITUTION'
    | 'SUBSCRIPTION_RENEWAL'
    | 'PAYMENT_DUE'
    | 'ISSUE_RESOLVED'
    | 'ALERT';
  isRead: boolean;
  link?: string;
  createdAt: Date;
}

const NotificationSchema: Schema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    title: { type: String, required: true },
    message: { type: String, required: true },
    type: {
      type: String,
      enum: [
        'ORDER_PLACED',
        'CUTOFF_REMINDER',
        'HARVESTED',
        'PACKED',
        'OUT_FOR_DELIVERY',
        'DELIVERED',
        'SUBSTITUTION',
        'SUBSCRIPTION_RENEWAL',
        'PAYMENT_DUE',
        'ISSUE_RESOLVED',
        'ALERT',
        'PAYMENT_CONFIRMED',
      ],

      default: 'ALERT',
    },
    isRead: { type: Boolean, default: false },
    link: { type: String, default: '' },
  },
  { timestamps: true }
);

export default mongoose.models.Notification || mongoose.model<INotification>('Notification', NotificationSchema);
