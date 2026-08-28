import { Router, Response } from 'express';
import Order from '../models/Order';
import User from '../models/User';
import Subscription from '../models/Subscription';
import Zone from '../models/Zone';
import Issue from '../models/Issue';
import Product from '../models/Product';
import { protect, adminGuard, AuthRequest } from '../middleware/authMiddleware';

const router = Router();

// @route   GET /api/analytics/overview
// @desc    Admin: Get calculated executive platform KPIs, category sales, SLA compliance & zone matrix
// @access  Private (Admin)
router.get('/overview', protect, adminGuard, async (req: AuthRequest, res: Response) => {
  try {
    // 1. Customer & User Metrics
    const totalCustomers = await User.countDocuments({ role: { $in: ['customer', 'user'] } });
    const totalStaff = await User.countDocuments({ role: { $in: ['delivery_ops', 'delivery-ops', 'admin'] } });

    // 2. Order Volume & Type Split
    const totalOrders = await Order.countDocuments({});
    const subscriptionOrdersCount = await Order.countDocuments({ isSubscriptionGenerated: true });
    const oneTimeOrdersCount = totalOrders - subscriptionOrdersCount;

    // 3. Subscription Retention & Churn Rate
    const totalSubscriptions = await Subscription.countDocuments({});
    const activeSubscriptions = await Subscription.countDocuments({ status: 'ACTIVE' });
    const pausedSubscriptions = await Subscription.countDocuments({ status: 'PAUSED' });
    const cancelledSubscriptions = await Subscription.countDocuments({ status: 'CANCELLED' });

    const retentionRatePercent = totalSubscriptions > 0 
      ? Math.round((activeSubscriptions / totalSubscriptions) * 100) 
      : 100;

    // 4. Financial & Revenue Metrics
    const validOrders = await Order.find({ status: { $ne: 'Cancelled' } });
    const totalRevenue = validOrders.reduce((sum, order) => sum + (order.totalAmount || 0), 0);

    // Revenue by Product Category
    const categoryRevenueMap: Record<string, number> = {
      VEGETABLE: 0,
      DAIRY: 0,
      FRUIT: 0,
      OTHER: 0,
    };

    validOrders.forEach((ord) => {
      ord.products?.forEach((item: any) => {
        const cat = (item.category || 'OTHER').toUpperCase();
        const itemRevenue = (item.price || 0) * (item.qty || 1);
        categoryRevenueMap[cat] = (categoryRevenueMap[cat] || 0) + itemRevenue;
      });
    });

    // 5. Fulfillment & 7 AM SLA Delivery Performance
    const pendingFulfillmentCount = await Order.countDocuments({
      status: { $in: ['Placed', 'Cutoff Locked', 'Harvested', 'Packed'] },
    });
    const outForDeliveryCount = await Order.countDocuments({ status: 'Out for Delivery' });
    const completedDeliveriesCount = await Order.countDocuments({ status: 'Delivered' });
    const failedDeliveriesCount = await Order.countDocuments({ status: 'Failed Delivery' });

    const deliveredOrders = await Order.find({ status: 'Delivered' });
    const onTimeDeliveriesCount = deliveredOrders.filter((o) => o.isOnTimeDelivery === true).length;
    const slaOnTimePercent = deliveredOrders.length > 0 
      ? Math.round((onTimeDeliveriesCount / deliveredOrders.length) * 100) 
      : 100;

    // 6. Quality Defect Claims & Refund Credits
    const openQualityIssuesCount = await Issue.countDocuments({ status: 'OPEN' });
    const resolvedIssues = await Issue.find({
      status: { $in: ['RESOLVED_WALLET_CREDIT', 'RESOLVED_REFUND'] },
    });
    const totalRefundCreditsGranted = resolvedIssues.reduce((sum, iss) => sum + (iss.refundAmount || 0), 0);

    // 7. Zone Performance Matrix
    const zones = await Zone.find({});
    const zoneMatrix = await Promise.all(
      zones.map(async (zone) => {
        const zoneOrders = await Order.find({ zoneId: zone._id });
        const zoneDelivered = zoneOrders.filter((o) => o.status === 'Delivered');
        const zoneFailed = zoneOrders.filter((o) => o.status === 'Failed Delivery');
        const zoneOnTime = zoneDelivered.filter((o) => o.isOnTimeDelivery === true).length;

        const zoneSlaPercent = zoneDelivered.length > 0 
          ? Math.round((zoneOnTime / zoneDelivered.length) * 100) 
          : 100;

        return {
          zoneId: zone._id,
          zoneCode: zone.zoneCode,
          name: zone.name,
          city: zone.city,
          dailyCapacity: zone.dailyCapacity || 100,
          totalOrders: zoneOrders.length,
          deliveredCount: zoneDelivered.length,
          failedCount: zoneFailed.length,
          onTimeCount: zoneOnTime,
          slaPercent: zoneSlaPercent,
        };
      })
    );

    res.json({
      totalCustomers,
      totalStaff,
      totalOrders,
      orderTypeSplit: {
        subscription: subscriptionOrdersCount,
        oneTime: oneTimeOrdersCount,
      },
      subscriptionMetrics: {
        total: totalSubscriptions,
        active: activeSubscriptions,
        paused: pausedSubscriptions,
        cancelled: cancelledSubscriptions,
        retentionRatePercent,
      },
      financials: {
        totalRevenue,
        revenueByCategory: categoryRevenueMap,
      },
      fulfillmentMetrics: {
        pendingFulfillmentCount,
        outForDeliveryCount,
        completedDeliveriesCount,
        failedDeliveriesCount,
        onTimeDeliveriesCount,
        slaOnTimePercent,
      },
      qualityMetrics: {
        openQualityIssuesCount,
        totalRefundCreditsGranted,
      },
      zonePerformanceMatrix: zoneMatrix,
    });
  } catch (error: any) {
    console.error('Analytics Overview Error:', error);
    res.status(500).json({ message: 'Failed to generate analytics metrics' });
  }
});

// @route   GET /api/analytics/drill-down
// @desc    Admin: Hierarchical drill-down endpoint (PLATFORM -> ZONE -> ORDER -> ITEM)
// @access  Private (Admin)
router.get('/drill-down', protect, adminGuard, async (req: AuthRequest, res: Response) => {
  const { zoneId, orderId } = req.query;

  try {
    if (orderId) {
      // Order level drill-down
      const order = await Order.findById(orderId as string)
        .populate('zoneId')
        .populate('user', 'name email phone');

      if (!order) {
        return res.status(404).json({ message: 'Order not found for drill-down' });
      }

      return res.json({
        level: 'ORDER',
        order,
      });
    }

    if (zoneId) {
      // Zone level drill-down
      const zone = await Zone.findById(zoneId as string);
      const orders = await Order.find({ zoneId })
        .sort({ createdAt: -1 })
        .populate('user', 'name email phone');

      return res.json({
        level: 'ZONE',
        zone,
        orders,
      });
    }

    // Platform level drill-down
    const zones = await Zone.find({});
    return res.json({
      level: 'PLATFORM',
      zonesCount: zones.length,
      zones,
    });
  } catch (error: any) {
    res.status(500).json({ message: 'Failed to fetch drill-down data' });
  }
});

export default router;
