import { Router, Response } from 'express';
import PaymentTransaction from '../models/PaymentTransaction';
import Order from '../models/Order';
import Subscription from '../models/Subscription';
import Notification from '../models/Notification';
import { protect, adminGuard, AuthRequest } from '../middleware/authMiddleware';
import { logAuditEvent } from '../utils/auditLogger';

const router = Router();

// @route   POST /api/payments/process-checkout
// @desc    Process simulated order payment via Mock Payment Gateway API
// @access  Private/Customer
router.post('/process-checkout', protect, async (req: AuthRequest, res: Response) => {
  const { orderId, amount, paymentMethod = 'MOCK_UPI', simulateFailure = false } = req.body;

  try {
    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ message: 'Order reference not found' });
    }

    const transactionId = `PAY-MOCK-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;
    const gatewayAuthCode = `AUTH-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
    const timestamp = new Date().toISOString();

    const requestPayload = {
      gateway: 'FarmFresh Mock Gateway v1.0',
      merchantId: 'MERCHANT_FARMFRESH_DIRECT',
      orderId: order._id.toString(),
      amount: Number(amount || order.totalAmount),
      currency: 'INR',
      paymentMethod,
      customerEmail: req.user.email,
      timestamp,
    };

    if (simulateFailure) {
      const failedResponse = {
        statusCode: 'GATEWAY_DECLINED_402',
        status: 'FAILED',
        message: 'Payment simulation declined by bank card issuer / invalid UPI PIN',
        transactionId,
        timestamp,
      };

      const failedTx = await PaymentTransaction.create({
        user: req.user._id,
        orderId: order._id,
        amount: Number(amount || order.totalAmount),
        currency: 'INR',
        paymentMethod,
        transactionId,
        gatewayAuthCode: '',
        status: 'FAILED',
        requestPayload,
        gatewayResponse: failedResponse,
        syncStatus: 'SYNCED',
        remarks: 'Simulated payment failure test',
      });

      order.paymentStatus = 'FAILED';
      await order.save();

      return res.status(400).json({
        success: false,
        message: 'Simulated Payment Gateway Transaction Failed',
        transaction: failedTx,
        requestPayload,
        gatewayResponse: failedResponse,
      });
    }

    const successResponse = {
      statusCode: 'PAYMENT_SUCCESS_200',
      status: 'SUCCESS',
      authorizationCode: gatewayAuthCode,
      transactionId,
      message: 'Transaction authorized and settled via Mock Payment Gateway API',
      timestamp,
    };

    const paymentTx = await PaymentTransaction.create({
      user: req.user._id,
      orderId: order._id,
      amount: Number(amount || order.totalAmount),
      currency: 'INR',
      paymentMethod,
      transactionId,
      gatewayAuthCode,
      status: 'SUCCESS',
      requestPayload,
      gatewayResponse: successResponse,
      syncStatus: 'SYNCED',
      remarks: `Paid ₹${order.totalAmount} via ${paymentMethod}`,
    });

    order.paymentStatus = 'PAID';
    order.paymentMethod = paymentMethod;
    order.paymentTransactionId = transactionId;
    await order.save();

    await logAuditEvent({
      userId: req.user._id.toString(),
      actorName: req.user.name,
      actorRole: req.user.role,
      action: 'PAYMENT_PROCESSED',
      targetEntity: 'Order',
      targetId: order._id.toString(),
      details: `Paid ₹${order.totalAmount} via ${paymentMethod} (Tx ID: ${transactionId})`,
      ipAddress: req.ip,
    });

    await Notification.create({
      user: req.user._id,
      title: 'Payment Received ✅',
      message: `Your payment of ₹${order.totalAmount} for Order #${String(order._id).substring(String(order._id).length - 6).toUpperCase()} was successfully processed via ${paymentMethod}.`,
      type: 'PAYMENT_CONFIRMED',
      link: '/dashboard',
    });

    res.json({
      success: true,
      message: 'Payment processed and database synchronized successfully!',
      transaction: paymentTx,
      order,
      requestPayload,
      gatewayResponse: successResponse,
    });
  } catch (error: any) {
    console.error('Payment Processing Error:', error);
    res.status(500).json({ message: error.message || 'Failed to process mock payment' });
  }
});


// @route   GET /api/payments/my-transactions
// @desc    Get customer payment transactions history
// @access  Private/Customer
router.get('/my-transactions', protect, async (req: AuthRequest, res: Response) => {
  try {
    const transactions = await PaymentTransaction.find({ user: req.user._id })
      .sort({ createdAt: -1 })
      .populate('orderId', 'totalAmount status deliveryDate');

    res.json(transactions);
  } catch (error: any) {
    res.status(500).json({ message: 'Failed to fetch payment history' });
  }
});

// @route   GET /api/payments/all-transactions
// @desc    Admin endpoint to view all system payment transactions & sync logs
// @access  Private/Admin
router.get('/all-transactions', protect, adminGuard, async (req: AuthRequest, res: Response) => {
  try {
    const transactions = await PaymentTransaction.find()
      .sort({ createdAt: -1 })
      .populate('user', 'name email role')
      .populate('orderId', 'totalAmount status deliveryDate');

    res.json(transactions);
  } catch (error: any) {
    res.status(500).json({ message: 'Failed to fetch payment transactions logs' });
  }
});

export default router;
