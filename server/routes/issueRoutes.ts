import { Router, Response } from 'express';
import Issue from '../models/Issue';
import Order from '../models/Order';
import User from '../models/User';
import WalletTransaction from '../models/WalletTransaction';
import { protect, adminGuard, authorize, AuthRequest } from '../middleware/authMiddleware';
import { sendNotification } from './notificationRoutes';
import { logAuditEvent } from '../utils/auditLogger';
import { validatePhotoUploadPayload } from '../middleware/securityMiddleware';




const router = Router();

// @route   POST /api/issues
// @desc    Customer: Report a Quality Issue on a delivered order
// @access  Private
router.post('/', protect, async (req: AuthRequest, res: Response) => {
  const { orderId, productName, issueType, description, photoUrl } = req.body;

  try {
    if (!orderId || !productName || !description) {
      return res.status(400).json({ message: 'Order ID, product name, and issue description are required' });
    }

    // Photo Upload Security Check (< 5MB & image mime validation)
    const photoValidation = validatePhotoUploadPayload(photoUrl);
    if (!photoValidation.isValid) {
      return res.status(400).json({ message: photoValidation.error });
    }


    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ message: 'Delivered order not found' });
    }


    const issue = await Issue.create({
      order: order._id,
      user: req.user?._id,
      productName: productName.trim(),
      issueType: issueType || 'SPOILED_PRODUCE',
      description: description.trim(),
      photoUrl: photoUrl || '',
      status: 'OPEN',
    });

    const populated = await Issue.findById(issue._id)
      .populate('order')
      .populate('user', 'name email phone');

    res.status(201).json({
      message: 'Quality issue claim submitted successfully. Our team will review within 2 hours.',
      issue: populated,
    });
  } catch (error: any) {
    console.error('Submit Issue Error:', error);
    res.status(500).json({ message: 'Failed to submit quality issue report' });
  }
});

// @route   GET /api/issues/my-issues
// @desc    Customer: Get personal quality issue claims & wallet summary
// @access  Private
router.get('/my-issues', protect, async (req: AuthRequest, res: Response) => {
  try {
    const issues = await Issue.find({ user: req.user?._id })
      .sort({ createdAt: -1 })
      .populate('order');

    const transactions = await WalletTransaction.find({ user: req.user?._id }).sort({ createdAt: -1 });
    const userDoc = await User.findById(req.user?._id).select('walletBalance');

    res.json({
      walletBalance: userDoc?.walletBalance || 0,
      issues,
      transactions,
    });
  } catch (error: any) {
    res.status(500).json({ message: 'Failed to fetch personal quality claims' });
  }
});

// @route   GET /api/issues/all
// @desc    Admin / Ops: Get all reported quality issue claims
// @access  Private (Admin & Delivery-Ops)
router.get('/all', protect, authorize('admin', 'delivery_ops', 'delivery-ops'), async (req: AuthRequest, res: Response) => {
  try {
    const issues = await Issue.find({})
      .sort({ createdAt: -1 })
      .populate('order')
      .populate('user', 'name email phone walletBalance');

    res.json(issues);
  } catch (error: any) {
    res.status(500).json({ message: 'Failed to fetch all quality issue claims' });
  }
});

// @route   PUT /api/issues/:id/resolve
// @desc    Admin / Ops Resolution: Resolve claim with Wallet Credit, Replacement, Refund, or Reject
// @access  Private (Admin & Delivery-Ops)
router.put('/:id/resolve', protect, authorize('admin', 'delivery_ops', 'delivery-ops'), async (req: AuthRequest, res: Response) => {

  const { resolutionAction, refundAmount, adminRemarks } = req.body;

  try {
    const issue = await Issue.findById(req.params.id);
    if (!issue) {
      return res.status(404).json({ message: 'Quality claim issue not found' });
    }

    const targetUser = await User.findById(issue.user);
    if (!targetUser) {
      return res.status(404).json({ message: 'Customer account not found' });
    }

    const creditAmount = Number(refundAmount || 0);

    if (resolutionAction === 'WALLET_CREDIT') {
      issue.status = 'RESOLVED_WALLET_CREDIT';
      issue.resolutionAction = 'WALLET_CREDIT';
      issue.refundAmount = creditAmount;

      // Credit Customer Wallet
      targetUser.walletBalance = (targetUser.walletBalance || 0) + creditAmount;
      await targetUser.save();

      // Log Wallet Transaction
      await WalletTransaction.create({
        user: targetUser._id,
        amount: creditAmount,
        type: 'REFUND_CREDIT',
        description: `Quality Refund Credit for item '${issue.productName}' (Claim #${String(issue._id).substring(String(issue._id).length - 6).toUpperCase()})`,
        relatedIssue: issue._id,
        relatedOrder: issue.order,
      });
    } else if (resolutionAction === 'REPLACEMENT') {
      issue.status = 'RESOLVED_REPLACEMENT';
      issue.resolutionAction = 'REPLACEMENT';
    } else if (resolutionAction === 'REFUND') {
      issue.status = 'RESOLVED_REFUND';
      issue.resolutionAction = 'REFUND';
      issue.refundAmount = creditAmount;
    } else if (resolutionAction === 'REJECTED') {
      issue.status = 'REJECTED';
      issue.resolutionAction = 'REJECTED';
    }

    issue.adminRemarks = adminRemarks || `Claim resolved by ${req.user?.name} via ${resolutionAction}`;
    issue.resolvedBy = req.user?._id;
    issue.resolvedAt = new Date();

    const updatedIssue = await issue.save();
    const populated = await Issue.findById(updatedIssue._id)
      .populate('order')
      .populate('user', 'name email walletBalance');

    if (targetUser) {
      sendNotification({
        userId: targetUser._id.toString(),
        title: '💳 Quality Claim Resolved!',
        message: `Your quality claim for '${issue.productName}' has been resolved (${issue.status}). ${creditAmount > 0 ? `₹${creditAmount} refund credited to your wallet!` : ''}`,
        type: 'ISSUE_RESOLVED',
        link: '/dashboard',
      });
    }

    await logAuditEvent({
      userId: req.user?._id?.toString(),
      actorName: req.user?.name || 'Admin',
      actorRole: req.user?.role || 'admin',
      action: 'QUALITY_CLAIM_RESOLVED',
      targetEntity: 'Issue',
      targetId: issue._id.toString(),
      details: `Resolved claim for '${issue.productName}' (${issue.status}) with ${creditAmount > 0 ? `₹${creditAmount} wallet refund credit` : 'no refund credit'}. Remarks: "${adminRemarks || ''}"`,
      ipAddress: req.ip,
    });

    res.json({
      message: `Quality claim updated to ${issue.status}. ${resolutionAction === 'WALLET_CREDIT' ? `₹${creditAmount} credited to customer wallet!` : ''}`,
      issue: populated,
      newWalletBalance: targetUser.walletBalance,
    });


  } catch (error: any) {
    console.error('Resolve Issue Error:', error);
    res.status(500).json({ message: 'Failed to resolve quality claim' });
  }
});

// @route   POST /api/issues/apply-wallet
// @desc    Apply wallet balance credit deduction during checkout
// @access  Private
router.post('/apply-wallet', protect, async (req: AuthRequest, res: Response) => {
  const { amountToDeduct, orderId } = req.body;

  try {
    const userDoc = await User.findById(req.user?._id);
    if (!userDoc) {
      return res.status(404).json({ message: 'User account not found' });
    }

    const deduct = Number(amountToDeduct || 0);
    if (deduct <= 0 || deduct > (userDoc.walletBalance || 0)) {
      return res.status(400).json({ message: 'Invalid wallet deduction amount or insufficient balance' });
    }

    userDoc.walletBalance = userDoc.walletBalance - deduct;
    await userDoc.save();

    await WalletTransaction.create({
      user: userDoc._id,
      amount: -deduct,
      type: 'CHECKOUT_DEDUCTION',
      description: `Wallet credit applied at checkout (${orderId ? `Order #${String(orderId).substring(String(orderId).length - 6).toUpperCase()}` : 'Order Checkout'})`,
      relatedOrder: orderId || null,
    });

    res.json({
      message: `₹${deduct} wallet credit applied successfully!`,
      newWalletBalance: userDoc.walletBalance,
    });
  } catch (error: any) {
    res.status(500).json({ message: 'Failed to apply wallet credit' });
  }
});

export default router;
