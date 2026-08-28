import mongoose, { Schema, Document } from 'mongoose';

export interface IAuditLog extends Document {
  user?: mongoose.Types.ObjectId;
  actorName: string;
  actorRole: string;
  action: 
    | 'ORDER_CUTOFF_LOCKED'
    | 'ITEM_FULFILLMENT_UPDATED'
    | 'ITEM_SUBSTITUTED'
    | 'ORDER_DISPATCHED'
    | 'ORDER_DELIVERED'
    | 'QUALITY_CLAIM_RESOLVED'
    | 'PRODUCT_CREATED'
    | 'PRODUCT_EDITED'
    | 'ZONE_CREATED'
    | 'ZONE_EDITED'
    | 'STAFF_ONBOARDED'
    | 'USER_LOGIN';
  targetEntity: 'Order' | 'Issue' | 'Product' | 'Zone' | 'User' | 'System';
  targetId?: string;
  details: string;
  ipAddress?: string;
  createdAt: Date;
}

const AuditLogSchema: Schema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User' },
    actorName: { type: String, required: true },
    actorRole: { type: String, required: true },
    action: {
      type: String,
      required: true,
      enum: [
        'ORDER_CUTOFF_LOCKED',
        'ITEM_FULFILLMENT_UPDATED',
        'ITEM_SUBSTITUTED',
        'ORDER_DISPATCHED',
        'ORDER_DELIVERED',
        'QUALITY_CLAIM_RESOLVED',
        'PRODUCT_CREATED',
        'PRODUCT_EDITED',
        'ZONE_CREATED',
        'ZONE_EDITED',
        'STAFF_ONBOARDED',
        'USER_LOGIN',
        'PAYMENT_PROCESSED',
      ],

    },
    targetEntity: {
      type: String,
      required: true,
      enum: ['Order', 'Issue', 'Product', 'Zone', 'User', 'System'],
    },
    targetId: { type: String, default: '' },
    details: { type: String, required: true },
    ipAddress: { type: String, default: '127.0.0.1' },
  },
  { timestamps: true }
);

export default mongoose.models.AuditLog || mongoose.model<IAuditLog>('AuditLog', AuditLogSchema);
