import { Router, Response } from 'express';
import Order from '../models/Order';
import Product from '../models/Product';
import { protect, authorize, AuthRequest } from '../middleware/authMiddleware';
import { sendNotification } from './notificationRoutes';
import { logAuditEvent } from '../utils/auditLogger';



const router = Router();

// @route   PUT /api/fulfillment/orders/:id/cutoff-lock
// @desc    Lock order after 9:30 PM cutoff deadline
// @access  Private (Delivery-Ops & Admin)
router.put(
  '/orders/:id/cutoff-lock',
  protect,
  authorize('delivery_ops', 'delivery-ops', 'admin'),
  async (req: AuthRequest, res: Response) => {
    try {
      const order = await Order.findById(req.params.id);
      if (!order) {
        return res.status(404).json({ message: 'Order not found' });
      }

      order.status = 'Cutoff Locked';
      order.auditLog.push({
        stage: 'Cutoff Locked',
        updatedBy: `${req.user?.name} (${req.user?.role})`,
        remarks: req.body.remarks || '9:30 PM Cutoff locked for tonight harvest & packing batch',
        timestamp: new Date(),
      });

      const updated = await order.save();
      const populated = await Order.findById(updated._id).populate('zoneId');

      await logAuditEvent({
        userId: req.user?._id?.toString(),
        actorName: req.user?.name || 'Staff',
        actorRole: req.user?.role || 'delivery_ops',
        action: 'ORDER_CUTOFF_LOCKED',
        targetEntity: 'Order',
        targetId: order._id.toString(),
        details: `Locked cutoff for Order #${String(order._id).substring(String(order._id).length - 6).toUpperCase()}`,
        ipAddress: req.ip,
      });

      res.json({
        message: `Order #${String(order._id).substring(String(order._id).length - 6).toUpperCase()} locked for harvest batch`,
        order: populated,
      });

    } catch (error: any) {
      res.status(500).json({ message: 'Failed to lock order cutoff stage' });
    }
  }
);

// @route   PUT /api/fulfillment/orders/:id/items/:itemIndex
// @desc    Update item-level fulfillment status (Harvested / Packed / Out of Stock)
// @access  Private (Delivery-Ops & Admin)
router.put(
  '/orders/:id/items/:itemIndex',
  protect,
  authorize('delivery_ops', 'delivery-ops', 'admin'),

  async (req: AuthRequest, res: Response) => {
    const { fulfillmentStatus, remarks } = req.body;
    const itemIdx = Number(req.params.itemIndex);

    try {
      const order = await Order.findById(req.params.id);
      if (!order) {
        return res.status(404).json({ message: 'Order not found' });
      }

      if (!order.products[itemIdx]) {
        return res.status(404).json({ message: 'Product line item not found in order' });
      }

      // Update line item
      order.products[itemIdx].fulfillmentStatus = fulfillmentStatus;
      if (remarks) {
        order.products[itemIdx].remarks = remarks;
      }

      // Check overall order completion logic
      const allHarvested = order.products.every(
        (p: any) => p.fulfillmentStatus === 'Harvested' || p.fulfillmentStatus === 'Packed' || p.fulfillmentStatus === 'Substituted'
      );
      const allPacked = order.products.every(
        (p: any) => p.fulfillmentStatus === 'Packed' || p.fulfillmentStatus === 'Substituted'
      );

      let stageTransitioned = false;
      if (allPacked && order.status !== 'Packed' && order.status !== 'Out for Delivery' && order.status !== 'Delivered') {
        order.status = 'Packed';
        stageTransitioned = true;
      } else if (allHarvested && order.status !== 'Harvested' && order.status !== 'Packed' && order.status !== 'Out for Delivery' && order.status !== 'Delivered') {
        order.status = 'Harvested';
        stageTransitioned = true;
      }

      order.auditLog.push({
        stage: order.status,
        updatedBy: `${req.user?.name} (${req.user?.role})`,
        remarks: `Item '${order.products[itemIdx].name}' updated to '${fulfillmentStatus}'. ${remarks ? `Note: ${remarks}` : ''}`,
        timestamp: new Date(),
      });

      const updated = await order.save();
      const populated = await Order.findById(updated._id).populate('zoneId');

      res.json({
        message: `Item '${order.products[itemIdx].name}' updated to ${fulfillmentStatus}`,
        stageTransitioned,
        order: populated,
      });
    } catch (error: any) {
      console.error('Item Fulfillment Error:', error);
      res.status(500).json({ message: 'Failed to update item fulfillment status' });
    }
  }
);

// @route   POST /api/fulfillment/orders/:id/substitute
// @desc    Apply substitute produce item using Phase 4 product mapping
// @access  Private (Delivery-Ops & Admin)
router.post(
  '/orders/:id/substitute',
  protect,
  authorize('delivery_ops', 'admin'),
  async (req: AuthRequest, res: Response) => {
    const { itemIndex, remarks } = req.body;
    const itemIdx = Number(itemIndex);

    try {
      const order = await Order.findById(req.params.id);
      if (!order) {
        return res.status(404).json({ message: 'Order not found' });
      }

      const targetLine = order.products[itemIdx];
      if (!targetLine) {
        return res.status(404).json({ message: 'Line item not found' });
      }

      // Lookup original product in DB to find mapped substitute
      const originalProduct = await Product.findById(targetLine.product).populate('substituteProductId');

      let substituteName = 'Substitute Produce';
      let substituteProdId = null;

      if (originalProduct && originalProduct.substituteProductId) {
        substituteName = originalProduct.substituteProductId.name;
        substituteProdId = originalProduct.substituteProductId._id;
      }

      targetLine.fulfillmentStatus = 'Substituted';
      targetLine.substitutedWithProduct = substituteProdId;
      targetLine.substitutedName = substituteName;
      targetLine.remarks = remarks || `Original produce unavailable. Substituted with ${substituteName}.`;

      order.auditLog.push({
        stage: order.status,
        updatedBy: `${req.user?.name} (${req.user?.role})`,
        remarks: `[SUBSTITUTION] ${targetLine.name} -> ${substituteName}. ${remarks || ''}`,
        timestamp: new Date(),
      });

      const updated = await order.save();
      const populated = await Order.findById(updated._id).populate('zoneId');

      res.json({
        message: `Substituted '${targetLine.name}' with '${substituteName}'`,
        substituteName,
        order: populated,
      });
    } catch (error: any) {
      console.error('Apply Substitution Error:', error);
      res.status(500).json({ message: 'Failed to apply produce substitution' });
    }
  }
);

// @route   PUT /api/fulfillment/orders/:id/dispatch
// @desc    Dispatch order out for morning delivery (Packed -> Out for Delivery)
// @access  Private (Delivery-Ops & Admin)
router.put(
  '/orders/:id/dispatch',
  protect,
  authorize('delivery_ops', 'admin'),
  async (req: AuthRequest, res: Response) => {
    try {
      const order = await Order.findById(req.params.id);
      if (!order) {
        return res.status(404).json({ message: 'Order not found' });
      }

      order.status = 'Out for Delivery';
      order.auditLog.push({
        stage: 'Out for Delivery',
        updatedBy: `${req.user?.name} (${req.user?.role})`,
        remarks: req.body.remarks || 'Order loaded on delivery vehicle for morning doorstep drop',
        timestamp: new Date(),
      });

      const updated = await order.save();
      const populated = await Order.findById(updated._id).populate('zoneId');

      if (order.user) {
        sendNotification({
          userId: order.user.toString(),
          title: '🚚 Out for Morning Doorstep Drop!',
          message: `Order #${String(order._id).substring(String(order._id).length - 6).toUpperCase()} is loaded on the route vehicle! Guaranteed doorstep arrival by 7:00 AM.`,
          type: 'OUT_FOR_DELIVERY',
          link: '/dashboard',
        });
      }

      res.json({
        message: `Order #${String(order._id).substring(String(order._id).length - 6).toUpperCase()} is Out for Delivery 🚚`,
        order: populated,
      });

    } catch (error: any) {
      res.status(500).json({ message: 'Failed to dispatch order' });
    }
  }
);

// @route   PUT /api/fulfillment/orders/:id/deliver
// @desc    Mark order as Delivered (checks 7 AM delivery compliance flag)
// @access  Private (Delivery-Ops & Admin)
router.put(
  '/orders/:id/deliver',
  protect,
  authorize('delivery_ops', 'admin'),
  async (req: AuthRequest, res: Response) => {
    const { deliveryProofPhoto, deliveryProofRemarks } = req.body;

    try {
      const order = await Order.findById(req.params.id);
      if (!order) {
        return res.status(404).json({ message: 'Order not found' });
      }

      const now = new Date();
      // 7 AM compliance check: Delivery is on-time if delivered on or before 7:15 AM
      const isOnTime = now.getHours() < 7 || (now.getHours() === 7 && now.getMinutes() <= 15);

      order.status = 'Delivered';
      order.isOnTimeDelivery = isOnTime;
      if (deliveryProofPhoto) order.deliveryProofPhoto = deliveryProofPhoto;
      if (deliveryProofRemarks) order.deliveryProofRemarks = deliveryProofRemarks;

      // Mark all items as Delivered / Packed
      order.products.forEach((p: any) => {
        if (p.fulfillmentStatus !== 'Substituted') {
          p.fulfillmentStatus = 'Packed';
        }
      });

      order.auditLog.push({
        stage: 'Delivered',
        updatedBy: `${req.user?.name} (${req.user?.role})`,
        remarks: `Order delivered to customer doorstep. ${isOnTime ? '✅ 7:00 AM SLA Compliant (On-Time)' : '⚠️ Late Delivery (Post 7 AM)'}${deliveryProofPhoto ? ' • Doorstep photo proof attached 📸' : ''}`,
        timestamp: now,
      });

      const updated = await order.save();
      const populated = await Order.findById(updated._id).populate('zoneId');

      if (order.user) {
        sendNotification({
          userId: order.user.toString(),
          title: '🏡 Morning Organic Produce Delivered!',
          message: `Order #${String(order._id).substring(String(order._id).length - 6).toUpperCase()} has been delivered to your doorstep. ${isOnTime ? '✅ Delivered on-time before 7 AM SLA!' : ''}`,
          type: 'DELIVERED',
          link: '/dashboard',
        });
      }

      res.json({
        message: `Order #${String(order._id).substring(String(order._id).length - 6).toUpperCase()} marked Delivered 🏡`,
        isOnTimeDelivery: isOnTime,
        order: populated,
      });

    } catch (error: any) {
      res.status(500).json({ message: 'Failed to complete order delivery' });
    }
  }
);

// @route   PUT /api/fulfillment/orders/:id/failed
// @desc    Mark order as Failed Delivery with failure reason capture & reattempt flag
// @access  Private (Delivery-Ops & Admin)
router.put(
  '/orders/:id/failed',
  protect,
  authorize('delivery_ops', 'admin'),
  async (req: AuthRequest, res: Response) => {
    const { failureReason, reattemptScheduled, deliveryProofPhoto, deliveryProofRemarks } = req.body;

    try {
      const order = await Order.findById(req.params.id);
      if (!order) {
        return res.status(404).json({ message: 'Order not found' });
      }

      order.status = 'Failed Delivery';
      order.failureReason = failureReason || 'Customer unavailable / Gate locked';
      order.reattemptScheduled = Boolean(reattemptScheduled);
      if (deliveryProofPhoto) order.deliveryProofPhoto = deliveryProofPhoto;
      if (deliveryProofRemarks) order.deliveryProofRemarks = deliveryProofRemarks;

      order.auditLog.push({
        stage: 'Failed Delivery',
        updatedBy: `${req.user?.name} (${req.user?.role})`,
        remarks: `[FAILED DELIVERY] Reason: ${order.failureReason}. Reattempt Scheduled: ${order.reattemptScheduled ? 'YES' : 'NO'}${deliveryProofPhoto ? ' • Photo evidence attached 📸' : ''}`,
        timestamp: new Date(),
      });

      const updated = await order.save();
      const populated = await Order.findById(updated._id).populate('zoneId');

      res.json({
        message: `Order #${String(order._id).substring(String(order._id).length - 6).toUpperCase()} marked Failed Delivery`,
        order: populated,
      });
    } catch (error: any) {
      res.status(500).json({ message: 'Failed to record failed delivery' });
    }
  }
);


export default router;
