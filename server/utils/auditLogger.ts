import AuditLog from '../models/AuditLog';

export interface LogAuditParams {
  userId?: string;
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
}

export const logAuditEvent = async (params: LogAuditParams) => {
  try {
    await AuditLog.create({
      user: params.userId || null,
      actorName: params.actorName || 'System',
      actorRole: params.actorRole || 'system',
      action: params.action,
      targetEntity: params.targetEntity,
      targetId: params.targetId || '',
      details: params.details,
      ipAddress: params.ipAddress || '127.0.0.1',
    });
  } catch (error) {
    console.error('Failed to log audit event:', error);
  }
};
