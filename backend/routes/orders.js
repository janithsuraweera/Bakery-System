const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const Product = require('../models/Product');
const Customer = require('../models/Customer');
const { body, validationResult } = require('express-validator');
const Inventory = require('../models/Inventory');
const { notifyLowStock } = require('../utils/notify');

// Get all orders
router.get('/', async (req, res) => {
  try {
    const { date, status, serviceType } = req.query;
    let filter = {};
    
    if (date) {
      const startDate = new Date(date);
      const endDate = new Date(date);
      endDate.setDate(endDate.getDate() + 1);
      filter.orderDate = { $gte: startDate, $lt: endDate };
    }
    
    if (status) filter.status = status;
    if (serviceType) filter.serviceType = serviceType;
    
    const orders = await Order.find(filter)
      .populate('customer', 'name phone')
      .populate('items.product', 'name price')
      .sort({ orderDate: -1 });
    
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get daily revenue
router.get('/daily-revenue', async (req, res) => {
  try {
    const { date } = req.query;
    const targetDate = date ? new Date(date) : new Date();
    const startDate = new Date(targetDate);
    startDate.setHours(0, 0, 0, 0);
    const endDate = new Date(targetDate);
    endDate.setHours(23, 59, 59, 999);
    
    const orders = await Order.find({
      orderDate: { $gte: startDate, $lte: endDate },
      status: 'completed'
    });
    
    const totalRevenue = orders.reduce((sum, order) => sum + order.total, 0);
    const cashRevenue = orders.reduce((sum, order) => sum + order.cashAmount, 0);
    const cardRevenue = orders.reduce((sum, order) => sum + order.cardAmount, 0);
    
    const takeawayRevenue = orders
      .filter(order => order.serviceType === 'takeaway')
      .reduce((sum, order) => sum + order.total, 0);
    
    const diningRevenue = orders
      .filter(order => order.serviceType === 'dining')
      .reduce((sum, order) => sum + order.total, 0);
    
    const phoneRevenue = orders
      .filter(order => order.serviceType === 'phone')
      .reduce((sum, order) => sum + order.total, 0);
    
    res.json({
      date: targetDate.toISOString().split('T')[0],
      totalRevenue,
      cashRevenue,
      cardRevenue,
      takeawayRevenue,
      diningRevenue,
      phoneRevenue,
      orderCount: orders.length
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get sales analysis
router.get('/sales-analysis', async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const start = startDate ? new Date(startDate) : new Date();
    start.setHours(0, 0, 0, 0);
    const end = endDate ? new Date(endDate) : new Date();
    end.setHours(23, 59, 59, 999);
    
    const orders = await Order.find({
      orderDate: { $gte: start, $lte: end },
      status: 'completed'
    }).populate('items.product', 'name cost');
    
    // Product sales analysis
    const productSales = {};
    let totalProfit = 0;
    
    orders.forEach(order => {
      order.items.forEach(item => {
        const productName = item.product.name;
        if (!productSales[productName]) {
          productSales[productName] = {
            quantity: 0,
            revenue: 0,
            cost: 0,
            profit: 0
          };
        }
        productSales[productName].quantity += item.quantity;
        productSales[productName].revenue += item.total;
        productSales[productName].cost += item.product.cost * item.quantity;
        productSales[productName].profit += item.total - (item.product.cost * item.quantity);
        totalProfit += item.total - (item.product.cost * item.quantity);
      });
    });
    
    res.json({
      period: { startDate: start, endDate: end },
      totalRevenue: orders.reduce((sum, order) => sum + order.total, 0),
      totalProfit,
      productSales: Object.entries(productSales).map(([name, data]) => ({
        name,
        ...data
      }))
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create new order
router.post('/', [
  body('items').isArray().withMessage('Items must be an array'),
  body('paymentMethod').isIn(['cash', 'card', 'both']).withMessage('Invalid payment method'),
  body('serviceType').isIn(['takeaway', 'dining', 'phone']).withMessage('Invalid service type')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    
    const { items, customerPhone, paymentMethod, serviceType, notes, discount = 0, cashAmount = 0, cardAmount = 0 } = req.body;
    
    // Generate order number
    const orderCount = await Order.countDocuments();
    const orderNumber = `ORD-${String(orderCount + 1).padStart(4, '0')}`;
    
    // Calculate totals
    let subtotal = 0;
    const orderItems = [];
    
    for (const item of items) {
      const product = await Product.findById(item.productId);
      if (!product) {
        return res.status(400).json({ message: `Product ${item.productId} not found` });
      }
      
      const itemTotal = product.price * item.quantity;
      subtotal += itemTotal;
      
      orderItems.push({
        product: product._id,
        quantity: item.quantity,
        price: product.price,
        total: itemTotal
      });
    }
    
    const total = Math.max(0, subtotal - Number(discount || 0));
    
    // Find or create customer
    let customer = null;
    if (customerPhone) {
      customer = await Customer.findOne({ phone: customerPhone });
      if (!customer) {
        customer = new Customer({
          name: 'Walk-in Customer',
          phone: customerPhone
        });
        await customer.save();
      }
    }
    
    // Create order
    const order = new Order({
      orderNumber,
      customer: customer?._id,
      customerPhone,
      items: orderItems,
      subtotal,
      total,
      paymentMethod,
      discount: Number(discount || 0),
      cashAmount: Number(cashAmount || 0),
      cardAmount: Number(cardAmount || 0),
      serviceType,
      notes
    });
    
    await order.save();
    
    // Update customer stats
    if (customer) {
      customer.totalOrders += 1;
      customer.totalSpent += total;
      customer.lastOrderDate = new Date();
      await customer.save();
    }
    
    // Update inventory and trigger low-stock alerts when thresholds are crossed
    const lowStockHit = [];
    for (const item of orderItems) {
      const product = await Product.findById(item.product);
      product.stock -= item.quantity;
      await product.save();
      // Mirror to Inventory if exists, preserving minQuantity
      const inv = await Inventory.findOne({ product: product._id });
      if (inv) {
        inv.quantity = product.stock;
        inv.lastUpdated = new Date();
        await inv.save();
        if (inv.quantity <= inv.minQuantity) {
          lowStockHit.push({ product: product._id, quantity: inv.quantity, minQuantity: inv.minQuantity, productRef: inv.product });
        }
      }
    }
    if (lowStockHit.length > 0) {
      try {
        const detailed = await Inventory.find({ product: { $in: lowStockHit.map(i => i.product) } })
          .populate('product', 'name');
        await notifyLowStock(detailed);
      } catch (_) {
        // swallow notification errors to not block order creation
      }
    }
    
    res.status(201).json(order);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update order status
router.patch('/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { 
        status,
        completedDate: status === 'completed' ? new Date() : undefined
      },
      { new: true }
    );
    
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    
    res.json(order);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
