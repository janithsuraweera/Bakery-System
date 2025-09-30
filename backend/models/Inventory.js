const mongoose = require('mongoose');

const inventorySchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  quantity: {
    type: Number,
    required: true,
    min: 0
  },
  minQuantity: {
    type: Number,
    required: true,
    min: 0
  },
  lastUpdated: {
    type: Date,
    default: Date.now
  },
  notes: {
    type: String,
    trim: true
  }
}, {
  timestamps: true
});

// Update product stock when inventory changes
inventorySchema.post('save', async function() {
  const Product = mongoose.model('Product');
  await Product.findByIdAndUpdate(this.product, { stock: this.quantity });
});

module.exports = mongoose.model('Inventory', inventorySchema);
