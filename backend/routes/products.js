const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const { body, validationResult } = require('express-validator');
const { authRequired, requireRole } = require('../middleware/auth');
const { writeAudit } = require('../utils/audit');

// Get all products
router.get('/', async (req, res) => {
  try {
    const { category, search, lowStock } = req.query;
    let filter = { isActive: true };
    
    if (category) filter.category = category;
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }
    if (lowStock === 'true') {
      filter.stock = { $lte: 5 };
    }
    
    const products = await Product.find(filter).sort({ name: 1 });
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get product by ID
router.get('/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    res.json(product);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create new product
router.post('/', authRequired, requireRole('admin', 'manager'), [
  body('name').notEmpty().withMessage('Product name is required'),
  body('price').isNumeric().withMessage('Price must be a number'),
  body('cost').isNumeric().withMessage('Cost must be a number'),
  body('category').isIn(['bread', 'cake', 'pastry', 'beverage', 'other']).withMessage('Invalid category')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    
    const product = new Product(req.body);
    await product.save();
    try { await writeAudit(req, { action: 'create', resource: 'product', resourceId: product._id.toString(), metadata: { name: product.name } }); } catch (_) {}
    res.status(201).json(product);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update product
router.put('/:id', authRequired, requireRole('admin', 'manager'), async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    
    try { await writeAudit(req, { action: 'update', resource: 'product', resourceId: req.params.id, metadata: req.body }); } catch (_) {}
    res.json(product);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update stock
router.patch('/:id/stock', authRequired, requireRole('admin', 'manager'), async (req, res) => {
  try {
    const { quantity } = req.body;
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      { stock: quantity },
      { new: true }
    );
    
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    
    try { await writeAudit(req, { action: 'update-stock', resource: 'product', resourceId: req.params.id, metadata: { quantity } }); } catch (_) {}
    res.json(product);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Delete product (soft delete)
router.delete('/:id', authRequired, requireRole('admin'), async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    );
    
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    
    try { await writeAudit(req, { action: 'deactivate', resource: 'product', resourceId: req.params.id }); } catch (_) {}
    res.json({ message: 'Product deactivated successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
