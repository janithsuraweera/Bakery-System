const express = require('express');
const router = express.Router();
const Customer = require('../models/Customer');
const Order = require('../models/Order');
const { body, validationResult } = require('express-validator');

// Get all customers
router.get('/', async (req, res) => {
  try {
    const { search, sortBy = 'lastOrderDate', order = 'desc' } = req.query;
    let filter = { isActive: true };
    
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }
    
    const sortOptions = {};
    sortOptions[sortBy] = order === 'desc' ? -1 : 1;
    
    const customers = await Customer.find(filter).sort(sortOptions);
    res.json(customers);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get customer by ID
router.get('/:id', async (req, res) => {
  try {
    const customer = await Customer.findById(req.params.id);
    if (!customer) {
      return res.status(404).json({ message: 'Customer not found' });
    }
    
    // Get customer's order history
    const orders = await Order.find({ customer: customer._id })
      .populate('items.product', 'name price')
      .sort({ orderDate: -1 })
      .limit(10);
    
    res.json({
      ...customer.toObject(),
      recentOrders: orders
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create new customer
router.post('/', [
  body('name').notEmpty().withMessage('Customer name is required'),
  body('phone').notEmpty().withMessage('Phone number is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    
    const customer = new Customer(req.body);
    await customer.save();
    res.status(201).json(customer);
  } catch (error) {
    if (error.code === 11000) {
      res.status(400).json({ message: 'Phone number already exists' });
    } else {
      res.status(500).json({ message: error.message });
    }
  }
});

// Update customer
router.put('/:id', async (req, res) => {
  try {
    const customer = await Customer.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    
    if (!customer) {
      return res.status(404).json({ message: 'Customer not found' });
    }
    
    res.json(customer);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get customer statistics
router.get('/:id/stats', async (req, res) => {
  try {
    const customer = await Customer.findById(req.params.id);
    if (!customer) {
      return res.status(404).json({ message: 'Customer not found' });
    }
    
    const orders = await Order.find({ customer: customer._id });
    
    const stats = {
      totalOrders: orders.length,
      totalSpent: orders.reduce((sum, order) => sum + order.total, 0),
      averageOrderValue: orders.length > 0 ? 
        orders.reduce((sum, order) => sum + order.total, 0) / orders.length : 0,
      lastOrderDate: customer.lastOrderDate,
      favoriteServiceType: getMostFrequent(orders.map(o => o.serviceType)),
      favoritePaymentMethod: getMostFrequent(orders.map(o => o.paymentMethod))
    };
    
    res.json(stats);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Helper function to find most frequent value
function getMostFrequent(arr) {
  if (arr.length === 0) return null;
  
  const frequency = {};
  arr.forEach(item => {
    frequency[item] = (frequency[item] || 0) + 1;
  });
  
  return Object.keys(frequency).reduce((a, b) => 
    frequency[a] > frequency[b] ? a : b
  );
}

module.exports = router;
