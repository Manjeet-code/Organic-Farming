import { Router, Response } from 'express';
import Order from '../models/Order';
import Zone from '../models/Zone';
import User from '../models/User';
import { protect, adminGuard, authorize, AuthRequest } from '../middleware/authMiddleware';

const router = Router();

// @route   GET /api/dispatch/my-zone-queue
// @desc    Delivery-Ops Queue: Get orders assigned ONLY to logged-in Delivery-Ops staff's zone
// @access  Private (Delivery-Ops & Admin)
router.get(
  '/my-zone-queue',
  protect,
  authorize('delivery_ops', 'admin'),
  async (req: AuthRequest, res: Response) => {
    try {
      const user = req.user;
      let targetZoneId = user?.zoneId;

      // If staff has no explicit zoneId saved, fallback to find zone matching staff email
      if (!targetZoneId) {
        const staffZone = await Zone.findOne({ primaryStaffId: user?._id });
        if (staffZone) {
          targetZoneId = staffZone._id;
        }
      }

      // If still no zone, fallback to first active zone (for demo ops staff)
      if (!targetZoneId) {
        const defaultZone = await Zone.findOne({ isActive: true });
        if (defaultZone) {
          targetZoneId = defaultZone._id;
        }
      }

      if (!targetZoneId) {
        return res.status(404).json({ message: 'No delivery zone assigned to this ops staff account.' });
      }

      const zone = await Zone.findById(targetZoneId).populate('primaryStaffId', 'name email phone');

      const { date, category, status } = req.query;
      const filter: any = { zoneId: targetZoneId };

      if (status && status !== 'ALL') {
        filter.status = status;
      }

      const orders = await Order.find(filter)
        .sort({ createdAt: -1 })
        .populate('user', 'name email phone')
        .populate('zoneId');

      // Filter by product category if provided
      let resultOrders = orders;
      if (category && category !== 'ALL') {
        resultOrders = orders.filter((o) =>
          o.products.some((p: any) => p.category === String(category).toUpperCase())
        );
      }

      res.json({
        zone,
        totalOrders: resultOrders.length,
        orders: resultOrders,
      });
    } catch (error: any) {
      console.error('Fetch Delivery Ops Queue Error:', error);
      res.status(500).json({ message: 'Failed to fetch Delivery-Ops zone queue' });
    }
  }
);

// @route   GET /api/dispatch/zone-summary
// @desc    Get routing summary per active delivery zone (Capacity, Total Orders, SKU Counts)
// @access  Private (Admin & Delivery-Ops)
router.get(
  '/zone-summary',
  protect,
  authorize('admin', 'delivery_ops'),
  async (req: AuthRequest, res: Response) => {
    try {
      const zones = await Zone.find().populate('primaryStaffId', 'name email phone');
      const allOrders = await Order.find().populate('zoneId');

      const summary = zones.map((z) => {
        const zoneOrders = allOrders.filter((o) => o.zoneId && o.zoneId._id.toString() === z._id.toString());
        const totalItemsCount = zoneOrders.reduce(
          (acc, o) => acc + o.products.reduce((pAcc: number, p: any) => pAcc + (p.qty || 1), 0),
          0
        );

        return {
          zone: z,
          orderCount: zoneOrders.length,
          totalItemsCount,
          capacityUtilizationPercent: Math.min(
            100,
            Math.round((zoneOrders.length / (z.dailyCapacity || 100)) * 100)
          ),
        };
      });

      // Also count unassigned orders
      const unassignedCount = allOrders.filter((o) => !o.zoneId).length;

      res.json({
        zonesSummary: summary,
        unassignedOrdersCount: unassignedCount,
      });
    } catch (error: any) {
      console.error('Zone Summary Error:', error);
      res.status(500).json({ message: 'Failed to fetch zone routing summary' });
    }
  }
);

// @route   GET /api/dispatch/unassigned
// @desc    Get unassigned / unmapped pincode orders queue
// @access  Private/Admin
router.get('/unassigned', protect, adminGuard, async (req: AuthRequest, res: Response) => {
  try {
    const unassignedOrders = await Order.find({ zoneId: null })
      .sort({ createdAt: -1 })
      .populate('user', 'name email phone');

    res.json(unassignedOrders);
  } catch (error: any) {
    res.status(500).json({ message: 'Failed to fetch unassigned orders' });
  }
});

// @route   PUT /api/dispatch/orders/:id/reassign-zone
// @desc    Admin Override: Manually reassign an order to a different zone route
// @access  Private/Admin
router.put('/orders/:id/reassign-zone', protect, adminGuard, async (req: AuthRequest, res: Response) => {
  const { newZoneId } = req.body;

  try {
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    const newZone = await Zone.findById(newZoneId);
    if (!newZone) {
      return res.status(404).json({ message: 'Target delivery zone not found' });
    }

    order.zoneId = newZone._id;
    const updatedOrder = await order.save();
    const populated = await Order.findById(updatedOrder._id).populate('zoneId');

    res.json({
      message: `Order #${String(order._id).substring(String(order._id).length - 6).toUpperCase()} reassigned to zone ${newZone.name}`,
      order: populated,
    });

  } catch (error: any) {
    console.error('Reassign Zone Error:', error);
    res.status(500).json({ message: 'Failed to reassign zone' });
  }
});

// @route   POST /api/dispatch/auto-assign-all
// @desc    Batch re-assign any unassigned orders against active zone pincode mappings
// @access  Private/Admin
router.post('/auto-assign-all', protect, adminGuard, async (req: AuthRequest, res: Response) => {
  try {
    const unassignedOrders = await Order.find({ zoneId: null });
    const zones = await Zone.find({ isActive: true });

    let countAssigned = 0;

    for (const order of unassignedOrders) {
      const match = zones.find((z) => z.pincodeRanges.includes(order.pincode));
      if (match) {
        order.zoneId = match._id;
        await order.save();
        countAssigned++;
      }
    }

    res.json({
      message: `Auto-assignment complete: ${countAssigned} unassigned orders linked to delivery zones.`,
      countAssigned,
    });
  } catch (error: any) {
    res.status(500).json({ message: 'Failed to auto-assign unassigned orders' });
  }
});

export default router;
