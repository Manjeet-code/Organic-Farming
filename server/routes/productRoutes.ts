import { Router, Request, Response } from 'express';
import Product from '../models/Product';
import { protect, adminGuard, AuthRequest } from '../middleware/authMiddleware';
import { logAuditEvent } from '../utils/auditLogger';


const router = Router();

// @route   GET /api/products
// @desc    Get all active catalog products (optional ?category=DAIRY & ?todayOnly=true)
// @access  Public
router.get('/', async (req: Request, res: Response) => {
  try {
    const { category, todayOnly, adminAll } = req.query;
    const filter: any = {};

    if (adminAll !== 'true') {
      filter.isActive = true;
    }

    if (category && category !== 'All') {
      filter.category = String(category).toUpperCase();
    }

    if (todayOnly === 'true') {
      filter.isAvailableToday = true;
    }

    const products = await Product.find(filter)
      .sort({ category: 1, name: 1 })
      .populate('substituteProductId', 'name unit price image category');

    res.json(products);
  } catch (error: any) {
    console.error('Fetch Products Error:', error);
    res.status(500).json({ message: 'Failed to fetch catalog products' });
  }
});

// @route   GET /api/products/:id
// @desc    Get single product details
// @access  Public
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const product = await Product.findById(req.params.id).populate(
      'substituteProductId',
      'name unit price image category'
    );

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    res.json(product);
  } catch (error: any) {
    res.status(500).json({ message: 'Failed to fetch product details' });
  }
});

// @route   POST /api/products
// @desc    Create a new catalog product
// @access  Private/Admin
router.post('/', protect, adminGuard, async (req: AuthRequest, res: Response) => {
  const {
    name,
    category,
    unit,
    price,
    dailyStockCeiling,
    isAvailableToday,
    substituteProductId,
    image,
    description,
    isSubscriptionEligible,
    subscriptionDiscount,
  } = req.body;

  try {
    if (!name || price === undefined) {
      return res.status(400).json({ message: 'Product name and unit price are required' });
    }

    const newProduct = await Product.create({
      name: name.trim(),
      category: category ? category.toUpperCase() : 'VEGETABLE',
      unit: unit ? unit.trim() : 'kg',
      price: Number(price),
      dailyStockCeiling: dailyStockCeiling ? Number(dailyStockCeiling) : 50,
      isAvailableToday: isAvailableToday !== undefined ? Boolean(isAvailableToday) : true,
      substituteProductId: substituteProductId || null,
      image: image || '',
      description: description || '',
      isSubscriptionEligible: isSubscriptionEligible !== undefined ? Boolean(isSubscriptionEligible) : true,
      subscriptionDiscount: subscriptionDiscount ? Number(subscriptionDiscount) : 5,
      isActive: true,
    });

    const populated = await Product.findById(newProduct._id).populate(
      'substituteProductId',
      'name unit price image category'
    );

    res.status(201).json(populated);
  } catch (error: any) {
    console.error('Create Product Error:', error);
    res.status(500).json({ message: error.message || 'Failed to create product' });
  }
});

// @route   PUT /api/products/:id
// @desc    Update product details, pricing, stock ceiling, substitute
// @access  Private/Admin
router.put('/:id', protect, adminGuard, async (req: AuthRequest, res: Response) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    if (req.body.name) product.name = req.body.name.trim();
    if (req.body.category) product.category = req.body.category.toUpperCase();
    if (req.body.unit) product.unit = req.body.unit.trim();
    if (req.body.price !== undefined) product.price = Number(req.body.price);
    if (req.body.dailyStockCeiling !== undefined) product.dailyStockCeiling = Number(req.body.dailyStockCeiling);
    if (req.body.image !== undefined) product.image = req.body.image;
    if (req.body.description !== undefined) product.description = req.body.description;
    if (req.body.substituteProductId !== undefined) product.substituteProductId = req.body.substituteProductId || null;
    if (req.body.isSubscriptionEligible !== undefined) product.isSubscriptionEligible = Boolean(req.body.isSubscriptionEligible);
    if (req.body.subscriptionDiscount !== undefined) product.subscriptionDiscount = Number(req.body.subscriptionDiscount);

    const updatedProduct = await product.save();
    const populated = await Product.findById(updatedProduct._id).populate(
      'substituteProductId',
      'name unit price image category'
    );

    res.json(populated);
  } catch (error: any) {
    console.error('Update Product Error:', error);
    res.status(500).json({ message: 'Failed to update product details' });
  }
});

// @route   PUT /api/products/:id/toggle-availability
// @desc    Toggle "Today's Harvest" availability (isAvailableToday)
// @access  Private/Admin
router.put('/:id/toggle-availability', protect, adminGuard, async (req: AuthRequest, res: Response) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    product.isAvailableToday = !product.isAvailableToday;
    const updatedProduct = await product.save();
    res.json(updatedProduct);
  } catch (error: any) {
    res.status(500).json({ message: 'Failed to toggle product availability' });
  }
});

// @route   PUT /api/products/:id/toggle-status
// @desc    Toggle active / inactive status
// @access  Private/Admin
router.put('/:id/toggle-status', protect, adminGuard, async (req: AuthRequest, res: Response) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    product.isActive = !product.isActive;
    const updatedProduct = await product.save();
    res.json(updatedProduct);
  } catch (error: any) {
    res.status(500).json({ message: 'Failed to toggle product active status' });
  }
});

// @route   DELETE /api/products/:id
// @desc    Delete catalog product (Admin)
// @access  Private/Admin
router.delete('/:id', protect, adminGuard, async (req: AuthRequest, res: Response) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    const productName = product.name;
    await Product.findByIdAndDelete(req.params.id);

    await logAuditEvent({
      userId: req.user?._id?.toString(),
      actorName: req.user?.name || 'Admin',
      actorRole: req.user?.role || 'admin',
      action: 'PRODUCT_EDITED',
      targetEntity: 'Product',
      targetId: req.params.id,
      details: `Deleted product '${productName}' from catalog`,
      ipAddress: req.ip,
    });

    res.json({ message: `Product '${productName}' deleted successfully from catalog` });
  } catch (error: any) {
    console.error('Delete Product Error:', error);
    res.status(500).json({ message: 'Failed to delete product' });
  }
});

export default router;


