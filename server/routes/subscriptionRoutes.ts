import { Router, Request, Response } from 'express';
import Subscription from '../models/Subscription';
import Order from '../models/Order';
import Zone from '../models/Zone';
import Product from '../models/Product';
import { protect, AuthRequest } from '../middleware/authMiddleware';

const router = Router();

// @route   GET /api/subscriptions/my-subscriptions
// @desc    Get logged-in customer's active and paused subscriptions
// @access  Private
router.get('/my-subscriptions', protect, async (req: AuthRequest, res: Response) => {
  try {
    const subscriptions = await Subscription.find({ user: req.user?._id })
      .sort({ createdAt: -1 })
      .populate('items.product')
      .populate('oneTimeAddons.product')
      .populate('zoneId');

    res.json(subscriptions);
  } catch (error: any) {
    console.error('Fetch Subscriptions Error:', error);
    res.status(500).json({ message: 'Failed to fetch subscriptions' });
  }
});

// @route   POST /api/subscriptions
// @desc    Create a new subscription plan
// @access  Private
router.post('/', protect, async (req: AuthRequest, res: Response) => {
  const { items, frequency, deliveryDays, address, pincode, phone } = req.body;

  try {
    if (!items || items.length === 0) {
      return res.status(400).json({ message: 'At least one product item is required for subscription' });
    }

    const cleanPincode = (pincode || req.user?.pincode || '').trim();
    if (!cleanPincode) {
      return res.status(400).json({ message: 'Pincode is required to assign delivery zone' });
    }

    // Lookup serviceable zone
    const matchingZone = await Zone.findOne({
      pincodeRanges: cleanPincode,
      isActive: true,
    });

    if (!matchingZone) {
      return res.status(400).json({
        message: `Pincode ${cleanPincode} is not currently in a serviceable delivery zone.`,
      });
    }

    const planFreq = (frequency || 'WEEKLY').toUpperCase();
    const discount = planFreq === 'MONTHLY' ? 10 : 5;

    const newSub = await Subscription.create({
      user: req.user?._id,
      zoneId: matchingZone._id,
      items: items.map((i: any) => ({
        product: i.productId || i.product,
        quantity: Number(i.quantity || 1),
      })),
      frequency: planFreq,
      deliveryDays: deliveryDays || ['Monday', 'Wednesday', 'Friday'],
      status: 'ACTIVE',
      discountPercent: discount,
      address: address || req.user?.address,
      pincode: cleanPincode,
      phone: phone || req.user?.phone,
    });

    const populated = await Subscription.findById(newSub._id)
      .populate('items.product')
      .populate('zoneId');

    res.status(201).json(populated);
  } catch (error: any) {
    console.error('Create Subscription Error:', error);
    res.status(500).json({ message: error.message || 'Failed to create subscription' });
  }
});

// @route   PUT /api/subscriptions/:id/pause
// @desc    Pause or Resume a subscription plan
// @access  Private
router.put('/:id/pause', protect, async (req: AuthRequest, res: Response) => {
  try {
    const sub = await Subscription.findOne({ _id: req.params.id, user: req.user?._id });

    if (!sub) {
      return res.status(404).json({ message: 'Subscription plan not found' });
    }

    sub.status = sub.status === 'ACTIVE' ? 'PAUSED' : 'ACTIVE';
    const updated = await sub.save();

    const populated = await Subscription.findById(updated._id)
      .populate('items.product')
      .populate('zoneId');

    res.json(populated);
  } catch (error: any) {
    res.status(500).json({ message: 'Failed to toggle subscription pause state' });
  }
});

// @route   POST /api/subscriptions/:id/skip-day
// @desc    Vacation Mode — Skip delivery for a specific date YYYY-MM-DD
// @access  Private
router.post('/:id/skip-day', protect, async (req: AuthRequest, res: Response) => {
  const { dateString } = req.body; // YYYY-MM-DD

  try {
    if (!dateString) {
      return res.status(400).json({ message: 'Target skip date (YYYY-MM-DD) is required' });
    }

    const sub = await Subscription.findOne({ _id: req.params.id, user: req.user?._id });
    if (!sub) {
      return res.status(404).json({ message: 'Subscription plan not found' });
    }

    if (!sub.pausedDates.includes(dateString)) {
      sub.pausedDates.push(dateString);
      await sub.save();
    }

    const populated = await Subscription.findById(sub._id)
      .populate('items.product')
      .populate('zoneId');

    res.json({
      message: `Vacation Mode activated for date ${dateString}. Delivery will be skipped!`,
      subscription: populated,
    });
  } catch (error: any) {
    res.status(500).json({ message: 'Failed to set skip date' });
  }
});

// @route   POST /api/subscriptions/:id/swap-item
// @desc    Swap a product SKU in an active plan without cancelling
// @access  Private
router.post('/:id/swap-item', protect, async (req: AuthRequest, res: Response) => {
  const { oldProductId, newProductId, quantity } = req.body;

  try {
    const sub = await Subscription.findOne({ _id: req.params.id, user: req.user?._id });
    if (!sub) {
      return res.status(404).json({ message: 'Subscription plan not found' });
    }

    // Filter out old product and push new product
    sub.items = sub.items.filter((item: any) => item.product.toString() !== oldProductId);
    sub.items.push({
      product: newProductId,
      quantity: Number(quantity || 1),
    });

    await sub.save();

    const populated = await Subscription.findById(sub._id)
      .populate('items.product')
      .populate('zoneId');

    res.json({
      message: 'Product SKU swapped successfully for upcoming deliveries',
      subscription: populated,
    });
  } catch (error: any) {
    res.status(500).json({ message: 'Failed to swap product item' });
  }
});

// @route   POST /api/subscriptions/:id/add-on
// @desc    Layer a one-time extra item onto a subscription for a target date
// @access  Private
router.post('/:id/add-on', protect, async (req: AuthRequest, res: Response) => {
  const { productId, quantity, targetDate } = req.body;

  try {
    const sub = await Subscription.findOne({ _id: req.params.id, user: req.user?._id });
    if (!sub) {
      return res.status(404).json({ message: 'Subscription plan not found' });
    }

    sub.oneTimeAddons.push({
      product: productId,
      quantity: Number(quantity || 1),
      targetDate: targetDate || new Date().toISOString().split('T')[0],
    });

    await sub.save();

    const populated = await Subscription.findById(sub._id)
      .populate('items.product')
      .populate('oneTimeAddons.product')
      .populate('zoneId');

    res.json({
      message: 'One-time addon item scheduled for subscription delivery',
      subscription: populated,
    });
  } catch (error: any) {
    res.status(500).json({ message: 'Failed to add one-time addon item' });
  }
});

// @route   POST /api/subscriptions/generate-daily-orders
// @desc    Batch process active subscriptions for tonight's 9:30 PM cutoff and create daily Orders (status Placed)
// @access  Authenticated / System
router.post('/generate-daily-orders', protect, async (req: AuthRequest, res: Response) => {
  try {
    const todayStr = new Date().toISOString().split('T')[0];
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Fetch all active subscriptions
    const activeSubs = await Subscription.find({ status: 'ACTIVE' })
      .populate('items.product')
      .populate('oneTimeAddons.product')
      .populate('user');

    const generatedOrders: any[] = [];

    for (const sub of activeSubs) {
      // 1. Check Vacation Mode (skip date)
      if (sub.pausedDates && sub.pausedDates.includes(todayStr)) {
        console.log(`[SUBS BATCH] Skipping sub ${sub._id} for today ${todayStr} (Vacation Mode active)`);
        continue;
      }

      // 2. Build items array with subscription discount applied
      const orderProducts: any[] = [];
      let totalAmount = 0;

      for (const item of sub.items) {
        if (!item.product) continue;
        const basePrice = item.product.price;
        const discountedPrice = basePrice * (1 - (sub.discountPercent || 5) / 100);
        const lineTotal = discountedPrice * item.quantity;

        orderProducts.push({
          product: item.product._id,
          name: item.product.name,
          qty: item.quantity,
          price: discountedPrice,
          unit: item.product.unit,
        });

        totalAmount += lineTotal;
      }

      // Add any scheduled one-time addons for targetDate = todayStr
      const todaysAddons = sub.oneTimeAddons.filter((a: any) => a.targetDate === todayStr);
      for (const addon of todaysAddons) {
        if (!addon.product) continue;
        const lineTotal = addon.product.price * addon.quantity;
        orderProducts.push({
          product: addon.product._id,
          name: `[ADD-ON] ${addon.product.name}`,
          qty: addon.quantity,
          price: addon.product.price,
          unit: addon.product.unit,
        });
        totalAmount += lineTotal;
      }

      if (orderProducts.length === 0) continue;

      // 3. Create Daily Order with status 'Placed'
      const newOrder = await Order.create({
        customerName: sub.user?.name || 'Subscription Customer',
        phone: sub.phone || sub.user?.phone,
        address: sub.address || sub.user?.address,
        pincode: sub.pincode,
        user: sub.user?._id,
        zoneId: sub.zoneId,
        subscriptionId: sub._id,
        isSubscriptionGenerated: true,
        products: orderProducts,
        totalAmount: Math.round(totalAmount),
        status: 'Placed',
        orderType: sub.frequency === 'MONTHLY' ? 'Monthly-Subscription' : 'Weekly-Subscription',
        deliveryDate: tomorrow,
      });

      generatedOrders.push(newOrder);
    }

    res.json({
      message: `Batch complete: Generated ${generatedOrders.length} daily orders from active subscriptions`,
      ordersGeneratedCount: generatedOrders.length,
      orders: generatedOrders,
    });
  } catch (error: any) {
    console.error('Batch Subscription Error:', error);
    res.status(500).json({ message: 'Failed to generate subscription orders' });
  }
});

export default router;
