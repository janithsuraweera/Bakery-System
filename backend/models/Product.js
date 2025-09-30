const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  category: {
    type: String,
    required: true,
    enum: ['bread', 'cake', 'pastry', 'beverage', 'other']
  },
  description: {
    type: String,
    trim: true
  },
  cost: {
    type: Number,
    required: true,
    min: 0
  },
  stock: {
    type: Number,
    required: true,
    min: 0,
    default: 0
  },
  minStock: {
    type: Number,
    default: 5
  },
  isActive: {
    type: Boolean,
    default: true
  },
  image: {
    type: String
  },
  barcode: {
    type: String,
    trim: true,
    index: true,
    unique: false
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Product', productSchema);
