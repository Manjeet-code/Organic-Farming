import { Router, Request, Response } from 'express';
import Zone from '../models/Zone';
import User from '../models/User';
import { protect, adminGuard, AuthRequest } from '../middleware/authMiddleware';

const router = Router();

// @route   GET /api/zones/serviceability/:pincode
// @desc    Check if a pincode is serviceable and return matching zone
// @access  Public
router.get('/serviceability/:pincode', async (req: Request, res: Response) => {
  try {
    const { pincode } = req.params;
    const cleanPincode = pincode.trim();

    // Find active zone containing this pincode in its array
    const matchingZone = await Zone.findOne({
      pincodeRanges: cleanPincode,
      isActive: true,
    }).populate('primaryStaffId', 'name email phone');

    if (matchingZone) {
      return res.json({
        serviceable: true,
        pincode: cleanPincode,
        zone: matchingZone,
        message: `Pincode ${cleanPincode} is serviceable under ${matchingZone.name} (${matchingZone.zoneCode})`,
      });
    }

    return res.json({
      serviceable: false,
      pincode: cleanPincode,
      zone: null,
      message: `Pincode ${cleanPincode} is not currently in a serviceable delivery zone.`,
    });
  } catch (error: any) {
    console.error('Serviceability Check Error:', error);
    res.status(500).json({ message: 'Error checking pincode serviceability' });
  }
});

// @route   GET /api/zones
// @desc    Get all delivery zones
// @access  Public / Authenticated
router.get('/', async (req: Request, res: Response) => {
  try {
    const zones = await Zone.find().sort({ createdAt: -1 }).populate('primaryStaffId', 'name email phone');
    res.json(zones);
  } catch (error: any) {
    console.error('Fetch Zones Error:', error);
    res.status(500).json({ message: 'Failed to fetch delivery zones' });
  }
});

// @route   GET /api/zones/:id
// @desc    Get single zone details
// @access  Public / Authenticated
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const zone = await Zone.findById(req.params.id).populate('primaryStaffId', 'name email phone');
    if (!zone) {
      return res.status(404).json({ message: 'Delivery zone not found' });
    }
    res.json(zone);
  } catch (error: any) {
    res.status(500).json({ message: 'Failed to fetch zone details' });
  }
});

// @route   POST /api/zones
// @desc    Create a new delivery zone
// @access  Private/Admin
router.post('/', protect, adminGuard, async (req: AuthRequest, res: Response) => {
  const {
    zoneCode,
    name,
    city,
    state,
    pincodeRanges,
    cutoffTime,
    dispatchDeadline,
    dailyCapacity,
    primaryStaffId,
  } = req.body;

  try {
    if (!zoneCode || !name || !city || !pincodeRanges || pincodeRanges.length === 0) {
      return res.status(400).json({
        message: 'Zone Code, Name, City, and at least one Pincode are required',
      });
    }

    const zoneExists = await Zone.findOne({ zoneCode: zoneCode.toUpperCase().trim() });
    if (zoneExists) {
      return res.status(400).json({ message: `Zone code '${zoneCode}' already exists` });
    }

    // Process pincode array (split comma if string passed, trim all)
    let processedPincodes: string[] = [];
    if (Array.isArray(pincodeRanges)) {
      processedPincodes = pincodeRanges.map((p: string) => p.trim()).filter(Boolean);
    } else if (typeof pincodeRanges === 'string') {
      processedPincodes = pincodeRanges.split(',').map((p: string) => p.trim()).filter(Boolean);
    }

    const newZone = await Zone.create({
      zoneCode: zoneCode.toUpperCase().trim(),
      name: name.trim(),
      city: city.trim(),
      state: state || 'Uttar Pradesh',
      pincodeRanges: processedPincodes,
      cutoffTime: cutoffTime || '21:30',
      dispatchDeadline: dispatchDeadline || '04:30',
      dailyCapacity: dailyCapacity || 100,
      primaryStaffId: primaryStaffId || null,
      isActive: true,
    });

    // If staff assigned, update staff's zoneId
    if (primaryStaffId) {
      await User.findByIdAndUpdate(primaryStaffId, { zoneId: newZone._id });
    }

    const populatedZone = await Zone.findById(newZone._id).populate('primaryStaffId', 'name email phone');
    res.status(201).json(populatedZone);
  } catch (error: any) {
    console.error('Create Zone Error:', error);
    res.status(500).json({ message: error.message || 'Failed to create delivery zone' });
  }
});

// @route   PUT /api/zones/:id
// @desc    Update delivery zone details
// @access  Private/Admin
router.put('/:id', protect, adminGuard, async (req: AuthRequest, res: Response) => {
  try {
    const zone = await Zone.findById(req.params.id);

    if (!zone) {
      return res.status(404).json({ message: 'Delivery zone not found' });
    }

    if (req.body.name) zone.name = req.body.name.trim();
    if (req.body.city) zone.city = req.body.city.trim();
    if (req.body.state) zone.state = req.body.state.trim();
    if (req.body.cutoffTime) zone.cutoffTime = req.body.cutoffTime;
    if (req.body.dispatchDeadline) zone.dispatchDeadline = req.body.dispatchDeadline;
    if (req.body.dailyCapacity) zone.dailyCapacity = Number(req.body.dailyCapacity);

    if (req.body.pincodeRanges !== undefined) {
      if (Array.isArray(req.body.pincodeRanges)) {
        zone.pincodeRanges = req.body.pincodeRanges.map((p: string) => p.trim()).filter(Boolean);
      } else if (typeof req.body.pincodeRanges === 'string') {
        zone.pincodeRanges = req.body.pincodeRanges.split(',').map((p: string) => p.trim()).filter(Boolean);
      }
    }

    if (req.body.primaryStaffId !== undefined) {
      zone.primaryStaffId = req.body.primaryStaffId || null;
      if (req.body.primaryStaffId) {
        await User.findByIdAndUpdate(req.body.primaryStaffId, { zoneId: zone._id });
      }
    }

    const updatedZone = await zone.save();
    const populated = await Zone.findById(updatedZone._id).populate('primaryStaffId', 'name email phone');
    res.json(populated);
  } catch (error: any) {
    console.error('Update Zone Error:', error);
    res.status(500).json({ message: 'Failed to update delivery zone' });
  }
});

// @route   PUT /api/zones/:id/toggle-status
// @desc    Activate or deactivate a zone
// @access  Private/Admin
router.put('/:id/toggle-status', protect, adminGuard, async (req: AuthRequest, res: Response) => {
  try {
    const zone = await Zone.findById(req.params.id);

    if (!zone) {
      return res.status(404).json({ message: 'Delivery zone not found' });
    }

    zone.isActive = !zone.isActive;
    const updatedZone = await zone.save();
    res.json(updatedZone);
  } catch (error: any) {
    res.status(500).json({ message: 'Failed to toggle zone status' });
  }
});

// @route   POST /api/zones/:id/assign-staff
// @desc    Assign a Delivery-Ops staff account to a zone
// @access  Private/Admin
router.post('/:id/assign-staff', protect, adminGuard, async (req: AuthRequest, res: Response) => {
  const { staffId } = req.body;

  try {
    const zone = await Zone.findById(req.params.id);
    if (!zone) {
      return res.status(404).json({ message: 'Delivery zone not found' });
    }

    const staffUser = await User.findById(staffId);
    if (!staffUser || (staffUser.role !== 'delivery_ops' && staffUser.role !== 'admin')) {
      return res.status(400).json({ message: 'User must be a valid Delivery-Ops or Admin account' });
    }

    zone.primaryStaffId = staffUser._id;
    await zone.save();

    staffUser.zoneId = zone._id;
    await staffUser.save();

    const populated = await Zone.findById(zone._id).populate('primaryStaffId', 'name email phone');
    res.json({
      message: `Staff ${staffUser.name} assigned to zone ${zone.name}`,
      zone: populated,
    });
  } catch (error: any) {
    res.status(500).json({ message: 'Failed to assign staff member to zone' });
  }
});

export default router;
