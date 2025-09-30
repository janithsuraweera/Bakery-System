const express = require('express');
const cors = require('cors');
const connectDB = require('./config/database');
require('dotenv').config();

const app = express();
const Inventory = require('./models/Inventory');
const { notifyLowStock } = require('./utils/notify');

// Connect to MongoDB
connectDB();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/orders', require('./routes/orders'));
app.use('/api/products', require('./routes/products'));
app.use('/api/customers', require('./routes/customers'));
app.use('/api/inventory', require('./routes/inventory'));
app.use('/api/audit', require('./routes/audit'));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Bakery System API is running',
    timestamp: new Date().toISOString()
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/api/health`);
  // Periodic low-stock check (hourly)
  const intervalMs = Number(process.env.LOW_STOCK_CHECK_INTERVAL_MS || 60 * 60 * 1000);
  setInterval(async () => {
    try {
      const lowStockItems = await Inventory.find({ $expr: { $lte: ['$quantity', '$minQuantity'] } }).populate('product', 'name');
      if (lowStockItems && lowStockItems.length > 0) {
        await notifyLowStock(lowStockItems);
      }
    } catch (err) {
      // log but don't crash
      console.error('Low-stock scheduler error:', err.message);
    }
  }, intervalMs);
});
