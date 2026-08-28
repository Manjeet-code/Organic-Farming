import { Router, Request, Response } from 'express';
import Order from '../models/Order';
import Zone from '../models/Zone';
import { protect, adminGuard, AuthRequest } from '../middleware/authMiddleware';
import { sendNotification } from './notificationRoutes';


const router = Router();

// @route   POST /api/orders
// @desc    Checkout / Place an order (One-Time or Subscription)
// @access  Public / Authenticated
router.post('/', async (req: Request, res: Response) => {
  try {
    const {
      customerName,
      phone,
      address,
      pincode,
      products,
      totalAmount,
      orderType,
      user,
    } = req.body;

    if (!customerName || !phone || !address || !products || products.length === 0) {
      return res.status(400).json({ message: 'Customer details and cart items are required' });
    }

    const cleanPincode = (pincode || '226010').trim();

    // 1. Auto-route to matching active Zone by pincode
    const matchingZone = await Zone.findOne({
      pincodeRanges: cleanPincode,
      isActive: true,
    });

    if (!matchingZone) {
      return res.status(400).json({
        message: `Pincode ${cleanPincode} is not currently in a serviceable delivery zone.`,
      });
    }

    // 2. Calculate Delivery Target Date (Tomorrow 7:00 AM) & 9:30 PM Cutoff SLA
    const now = new Date();
    const cutoffHour = 21; // 9:00 PM / 9:30 PM cutoff
    const cutoffMinute = 30;

    let deliveryDate = new Date();
    if (now.getHours() > cutoffHour || (now.getHours() === cutoffHour && now.getMinutes() >= cutoffMinute)) {
      // Order placed after 9:30 PM cutoff -> rolls to Day After Tomorrow morning!
      deliveryDate.setDate(deliveryDate.getDate() + 2);
    } else {
      // Order placed before 9:30 PM -> Tomorrow morning delivery!
      deliveryDate.setDate(deliveryDate.getDate() + 1);
    }
    deliveryDate.setHours(7, 0, 0, 0);

    const cutoffTimeToday = new Date();
    cutoffTimeToday.setHours(21, 30, 0, 0);

    const order = await Order.create({
      customerName: customerName.trim(),
      phone: phone.trim(),
      address: address.trim(),
      pincode: cleanPincode,
      user: user || null,
      zoneId: matchingZone._id,
      products,
      totalAmount: Number(totalAmount),
      status: 'Placed',
      orderType: orderType || 'One-Time',
      deliveryDate,
      cutoffTimestamp: cutoffTimeToday,
    });

    const populated = await Order.findById(order._id).populate('zoneId');

    if (user) {
      sendNotification({
        userId: user.toString(),
        title: '🥦 Fresh Harvest Order Placed!',
        message: `Order #${String(order._id).substring(String(order._id).length - 6).toUpperCase()} (₹${totalAmount}) placed! Scheduled for 7:00 AM doorstep delivery on ${deliveryDate.toLocaleDateString()}.`,
        type: 'ORDER_PLACED',
        link: '/dashboard',
      });
    }

    res.status(201).json(populated);

  } catch (error: any) {
    console.error('Create Order Error:', error);
    res.status(500).json({ message: error.message || 'Failed to place order' });
  }
});

// @route   GET /api/orders/my-orders
// @desc    Get logged-in customer's order history
// @access  Private
router.get('/my-orders', protect, async (req: AuthRequest, res: Response) => {
  try {
    const orders = await Order.find({ user: req.user._id })
      .sort({ createdAt: -1 })
      .populate('zoneId');
    res.json(orders);
  } catch (error: any) {
    res.status(500).json({ message: 'Failed to fetch your orders' });
  }
});

// @route   PUT /api/orders/:id/cancel
// @desc    Customer cancel order (enforces 9:30 PM cutoff time check)
// @access  Private
router.put('/:id/cancel', protect, async (req: AuthRequest, res: Response) => {
  try {
    const order = await Order.findOne({ _id: req.params.id, user: req.user._id });

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    if (order.status !== 'Placed' && order.status !== 'Pending') {
      return res.status(400).json({ message: `Cannot cancel order in '${order.status}' state.` });
    }

    // Cutoff check: allow cancellation only before 9:30 PM on creation date
    const now = new Date();
    const cutoff = order.cutoffTimestamp || new Date(order.createdAt);
    cutoff.setHours(21, 30, 0, 0);

    if (now > cutoff && now.toDateString() === new Date(order.createdAt).toDateString()) {
      return res.status(400).json({
        message: 'Cutoff deadline (9:30 PM) has passed. Order is locked for tonight harvest & dispatch.',
      });
    }

    order.status = 'Cancelled';
    const updatedOrder = await order.save();
    res.json(updatedOrder);
  } catch (error: any) {
    res.status(500).json({ message: 'Failed to cancel order' });
  }
});

// @route   GET /api/orders/all
// @desc    Get all orders for Admin oversight
// @access  Private/Admin
router.get('/all', protect, adminGuard, async (req: Request, res: Response) => {
  try {
    const orders = await Order.find({})
      .sort({ createdAt: -1 })
      .populate('user', 'name email phone')
      .populate('zoneId');
    res.json(orders);
  } catch (error: any) {
    res.status(500).json({ message: 'Failed to fetch all orders' });
  }
});

// @route   PUT /api/orders/:id/status
// @desc    Update order status
// @access  Private/Admin
router.put('/:id/status', protect, adminGuard, async (req: Request, res: Response) => {
  try {
    const { status } = req.body;
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    order.status = status;
    const updatedOrder = await order.save();
    const populated = await Order.findById(updatedOrder._id).populate('zoneId');
    res.json(populated);
  } catch (error: any) {
    res.status(500).json({ message: 'Failed to update order status' });
  }
});

export default router;

