import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User';
import { protect, adminGuard, AuthRequest } from '../middleware/authMiddleware';
import { authRateLimiter } from '../middleware/securityMiddleware';

const router = Router();


// Helper to generate JWT
const generateToken = (id: string) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'farmfresh_jwt_secret_key_2026_dev', {
    expiresIn: '30d',
  });
};

// Helper to format user response
const formatUserResponse = (user: any, token?: string) => {
  return {
    _id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    phone: user.phone || '',
    address: user.address || '',
    pincode: user.pincode || '',
    zoneId: user.zoneId || null,
    isActive: user.isActive,
    token: token || generateToken(user._id),
  };
};

// @route   POST /api/auth/register
// @desc    Register a new customer account
// @access  Public
router.post('/register', async (req: Request, res: Response) => {
  const { name, email, password, phone, address, pincode } = req.body;

  try {
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Name, email, and password are required' });
    }

    const userExists = await User.findOne({ email: email.toLowerCase() });

    if (userExists) {
      return res.status(400).json({ message: 'User with this email already exists' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await User.create({
      name,
      email: email.toLowerCase(),
      password: hashedPassword,
      role: 'customer',
      phone: phone || '',
      address: address || '',
      pincode: pincode || '',
    });

    if (user) {
      res.status(201).json(formatUserResponse(user));
    } else {
      res.status(400).json({ message: 'Invalid user registration data' });
    }
  } catch (error: any) {
    console.error('Registration Error:', error);
    res.status(500).json({ message: 'Server error during registration' });
  }
});

// @route   POST /api/auth/login
// @desc    Authenticate user & return JWT token
// @access  Public (Rate Limited: Max 10 attempts per 15 mins)
router.post('/login', authRateLimiter, async (req: Request, res: Response) => {

  const { email, password } = req.body;

  try {
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    const user = await User.findOne({ email: email.toLowerCase() });

    if (user && (await bcrypt.compare(password, user.password))) {
      if (!user.isActive) {
        return res.status(403).json({ message: 'Account has been deactivated. Please contact support.' });
      }

      res.json(formatUserResponse(user));
    } else {
      res.status(401).json({ message: 'Invalid email or password' });
    }
  } catch (error: any) {
    console.error('Login Error:', error);
    res.status(500).json({ message: 'Server error during login' });
  }
});

// @route   GET /api/auth/me
// @desc    Get logged in user profile
// @access  Private
router.get('/me', protect, async (req: AuthRequest, res: Response) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(formatUserResponse(user));
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch user profile' });
  }
});

// @route   PUT /api/auth/profile
// @desc    Update user profile details (address, pincode, phone, name)
// @access  Private
router.put('/profile', protect, async (req: AuthRequest, res: Response) => {
  try {
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.name = req.body.name || user.name;
    user.phone = req.body.phone !== undefined ? req.body.phone : user.phone;
    user.address = req.body.address !== undefined ? req.body.address : user.address;
    user.pincode = req.body.pincode !== undefined ? req.body.pincode : user.pincode;

    if (req.body.password) {
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(req.body.password, salt);
    }

    const updatedUser = await user.save();
    res.json(formatUserResponse(updatedUser));
  } catch (error) {
    console.error('Profile update error:', error);
    res.status(500).json({ message: 'Failed to update profile' });
  }
});

// @route   POST /api/auth/create-ops
// @desc    Admin endpoint to onboard a Delivery-Ops staff account
// @access  Private/Admin
router.post('/create-ops', protect, adminGuard, async (req: Request, res: Response) => {
  const { name, email, password, phone, zoneId } = req.body;

  try {
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Name, email, and password are required' });
    }

    const userExists = await User.findOne({ email: email.toLowerCase() });
    if (userExists) {
      return res.status(400).json({ message: 'Account with this email already exists' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const opsUser = await User.create({
      name,
      email: email.toLowerCase(),
      password: hashedPassword,
      role: 'delivery_ops',
      phone: phone || '',
      zoneId: zoneId || null,
    });

    res.status(201).json({
      message: 'Delivery-Ops staff account created successfully',
      user: formatUserResponse(opsUser),
    });
  } catch (error) {
    console.error('Ops creation error:', error);
    res.status(500).json({ message: 'Failed to create Delivery-Ops account' });
  }
});

export default router;

