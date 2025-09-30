const express = require('express');
const router = express.Router();
const Inventory = require('../models/Inventory');
const Product = require('../models/Product');
const { body, validationResult } = require('express-validator');

// Get inventory status
router.get('/', async (req, res) => {
  try {
    const { lowStock } = req.query;
    let filter = {};
    
    if (lowStock === 'true') {
      filter.$expr = { $lte: ['$quantity', '$minQuantity'] };
    }
    
    const inventory = await Inventory.find(filter)
      .populate('product', 'name price cost category')
      .sort({ 'product.name': 1 });
    
    res.json(inventory);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get inventory for specific product
router.get('/product/:productId', async (req, res) => {
  try {
    const inventory = await Inventory.findOne({ product: req.params.productId })
      .populate('product', 'name price cost category');
    
    if (!inventory) {
      return res.status(404).json({ message: 'Inventory record not found' });
    }
    
    res.json(inventory);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update inventory quantity
router.patch('/:id/quantity', [
  body('quantity').isNumeric().withMessage('Quantity must be a number')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    
    const { quantity } = req.body;
    const inventory = await Inventory.findByIdAndUpdate(
      req.params.id,
      { 
        quantity,
        lastUpdated: new Date()
      },
      { new: true }
    ).populate('product', 'name price cost category');
    
    if (!inventory) {
      return res.status(404).json({ message: 'Inventory record not found' });
    }
    
    res.json(inventory);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Add stock
router.post('/add-stock', [
  body('productId').notEmpty().withMessage('Product ID is required'),
  body('quantity').isNumeric().withMessage('Quantity must be a number')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    
    const { productId, quantity } = req.body;
    
    let inventory = await Inventory.findOne({ product: productId });
    
    if (inventory) {
      inventory.quantity += quantity;
      inventory.lastUpdated = new Date();
      await inventory.save();
    } else {
      const product = await Product.findById(productId);
      if (!product) {
        return res.status(404).json({ message: 'Product not found' });
      }
      
      inventory = new Inventory({
        product: productId,
        quantity: quantity,
        minQuantity: product.minStock || 5
      });
      await inventory.save();
    }
    
    await inventory.populate('product', 'name price cost category');
    res.json(inventory);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get low stock alerts
router.get('/alerts/low-stock', async (req, res) => {
  try {
    const lowStockItems = await Inventory.find({
      $expr: { $lte: ['$quantity', '$minQuantity'] }
    }).populate('product', 'name price cost category');
    
    res.json(lowStockItems);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Initialize inventory for all products
router.post('/initialize', async (req, res) => {
  try {
    const products = await Product.find({ isActive: true });
    const inventoryRecords = [];
    
    for (const product of products) {
      const existingInventory = await Inventory.findOne({ product: product._id });
      if (!existingInventory) {
        const inventory = new Inventory({
          product: product._id,
          quantity: product.stock || 0,
          minQuantity: product.minStock || 5
        });
        await inventory.save();
        inventoryRecords.push(inventory);
      }
    }
    
    res.json({
      message: `Initialized inventory for ${inventoryRecords.length} products`,
      records: inventoryRecords
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
