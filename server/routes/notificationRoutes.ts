import { Router, Response } from 'express';
import Notification from '../models/Notification';
import User from '../models/User';
import { protect, adminGuard, AuthRequest } from '../middleware/authMiddleware';

const router = Router();

// Helper function to create notification programmatically from other services
export const sendNotification = async ({
  userId,
  title,
  message,
  type = 'ALERT',
  link = '',
}: {
  userId: string;
  title: string;
  message: string;
  type?: string;
  link?: string;
}) => {
  try {
    await Notification.create({
      user: userId,
      title,
      message,
      type,
      link,
      isRead: false,
    });
  } catch (error) {
    console.error('Failed to send automated notification:', error);
  }
};

// @route   GET /api/notifications
// @desc    Get logged-in user's notifications with unread count
// @access  Private
router.get('/', protect, async (req: AuthRequest, res: Response) => {
  try {
    const notifications = await Notification.find({ user: req.user?._id })
      .sort({ createdAt: -1 })
      .limit(30);

    const unreadCount = await Notification.countDocuments({
      user: req.user?._id,
      isRead: false,
    });

    res.json({
      unreadCount,
      notifications,
    });
  } catch (error: any) {
    res.status(500).json({ message: 'Failed to fetch notifications' });
  }
});

// @route   PUT /api/notifications/:id/read
// @desc    Mark a single notification as read
// @access  Private
router.put('/:id/read', protect, async (req: AuthRequest, res: Response) => {
  try {
    const notification = await Notification.findOne({
      _id: req.params.id,
      user: req.user?._id,
    });

    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }

    notification.isRead = true;
    await notification.save();

    const unreadCount = await Notification.countDocuments({
      user: req.user?._id,
      isRead: false,
    });

    res.json({
      message: 'Notification marked as read',
      notification,
      unreadCount,
    });
  } catch (error: any) {
    res.status(500).json({ message: 'Failed to update notification state' });
  }
});

// @route   PUT /api/notifications/read-all
// @desc    Mark all user notifications as read
// @access  Private
router.put('/read-all', protect, async (req: AuthRequest, res: Response) => {
  try {
    await Notification.updateMany({ user: req.user?._id, isRead: false }, { isRead: true });

    res.json({
      message: 'All notifications marked as read',
      unreadCount: 0,
    });
  } catch (error: any) {
    res.status(500).json({ message: 'Failed to clear unread notifications' });
  }
});

// @route   POST /api/notifications/broadcast
// @desc    Admin endpoint: Send broadcast alert notification to users
// @access  Private (Admin)
router.post('/broadcast', protect, adminGuard, async (req: AuthRequest, res: Response) => {
  const { targetRole, title, message, link } = req.body;

  try {
    if (!title || !message) {
      return res.status(400).json({ message: 'Title and message are required' });
    }

    const query: any = { isActive: true };
    if (targetRole && targetRole !== 'ALL') {
      query.role = targetRole;
    }

    const targetUsers = await User.find(query).select('_id');

    const notificationDocs = targetUsers.map((u) => ({
      user: u._id,
      title,
      message,
      type: 'ALERT',
      link: link || '',
      isRead: false,
    }));

    if (notificationDocs.length > 0) {
      await Notification.insertMany(notificationDocs);
    }

    res.status(201).json({
      message: `Broadcast alert sent successfully to ${targetUsers.length} user accounts!`,
      recipientCount: targetUsers.length,
    });
  } catch (error: any) {
    console.error('Broadcast Error:', error);
    res.status(500).json({ message: 'Failed to send broadcast alert' });
  }
});

export default router;
