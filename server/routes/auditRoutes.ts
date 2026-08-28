import { Router, Response } from 'express';
import AuditLog from '../models/AuditLog';
import { protect, adminGuard, AuthRequest } from '../middleware/authMiddleware';

const router = Router();

// @route   GET /api/audit-logs
// @desc    Admin: Fetch platform audit logs with filtering and pagination
// @access  Private (Admin)
router.get('/', protect, adminGuard, async (req: AuthRequest, res: Response) => {
  const { action, targetEntity, limit = 50 } = req.query;

  try {
    const query: any = {};

    if (action && action !== 'ALL') {
      query.action = action;
    }

    if (targetEntity && targetEntity !== 'ALL') {
      query.targetEntity = targetEntity;
    }

    const auditLogs = await AuditLog.find(query)
      .sort({ createdAt: -1 })
      .limit(Number(limit))
      .populate('user', 'name email role');

    const totalLogsCount = await AuditLog.countDocuments(query);

    res.json({
      totalLogsCount,
      auditLogs,
    });
  } catch (error: any) {
    console.error('Audit Log Fetch Error:', error);
    res.status(500).json({ message: 'Failed to fetch audit logs' });
  }
});

export default router;
