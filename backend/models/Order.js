const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  quantity: {
    type: Number,
    required: true,
    min: 1
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  total: {
    type: Number,
    required: true,
    min: 0
  }
});

const orderSchema = new mongoose.Schema({
  orderNumber: {
    type: String,
    required: true,
    unique: true
  },
  customer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Customer'
  },
  customerPhone: {
    type: String,
    trim: true
  },
  items: [orderItemSchema],
  subtotal: {
    type: Number,
    required: true,
    min: 0
  },
  discount: {
    type: Number,
    default: 0,
    min: 0
  },
  total: {
    type: Number,
    required: true,
    min: 0
  },
  paymentMethod: {
    type: String,
    required: true,
    enum: ['cash', 'card', 'both']
  },
  cashAmount: {
    type: Number,
    default: 0,
    min: 0
  },
  cardAmount: {
    type: Number,
    default: 0,
    min: 0
  },
  serviceType: {
    type: String,
    required: true,
    enum: ['takeaway', 'dining', 'phone']
  },
  status: {
    type: String,
    enum: ['pending', 'preparing', 'ready', 'completed', 'cancelled'],
    default: 'pending'
  },
  orderDate: {
    type: Date,
    default: Date.now
  },
  completedDate: {
    type: Date
  },
  notes: {
    type: String,
    trim: true
  }
}, {
  timestamps: true
});

// Calculate profit for this order
orderSchema.methods.calculateProfit = function() {
  let totalCost = 0;
  this.items.forEach(item => {
    totalCost += item.product.cost * item.quantity;
  });
  return this.total - totalCost;
};

module.exports = mongoose.model('Order', orderSchema);
