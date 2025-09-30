const mongoose = require('mongoose');
const Product = require('./models/Product');
const Customer = require('./models/Customer');
const Order = require('./models/Order');
const Inventory = require('./models/Inventory');

const sampleProducts = [
  {
    name: 'මාලු පාන්',
    price: 80,
    cost: 50,
    category: 'bread',
    description: 'Fresh fish buns with local spices',
    stock: 20,
    minStock: 5
  },
  {
    name: 'බිත්තර රෝල්ස්',
    price: 100,
    cost: 60,
    category: 'bread',
    description: 'Soft egg rolls with fresh eggs',
    stock: 15,
    minStock: 5
  },
  {
    name: 'එලවලු රොට්',
    price: 100,
    cost: 65,
    category: 'bread',
    description: 'Vegetable roti with mixed vegetables',
    stock: 12,
    minStock: 5
  },
  {
    name: 'සීනි සම්බල් පාන්',
    price: 70,
    cost: 40,
    category: 'bread',
    description: 'Sweet sambol bread with coconut',
    stock: 25,
    minStock: 5
  },
  {
    name: 'චොකලට් කේක්',
    price: 250,
    cost: 150,
    category: 'cake',
    description: 'Rich chocolate cake',
    stock: 8,
    minStock: 3
  },
  {
    name: 'වැනිලා කේක්',
    price: 200,
    cost: 120,
    category: 'cake',
    description: 'Classic vanilla cake',
    stock: 6,
    minStock: 3
  },
  {
    name: 'කිරි රොටි',
    price: 60,
    cost: 35,
    category: 'pastry',
    description: 'Milk bread rolls',
    stock: 30,
    minStock: 10
  },
  {
    name: 'බිස්කට්',
    price: 40,
    cost: 25,
    category: 'pastry',
    description: 'Sweet biscuits',
    stock: 50,
    minStock: 15
  },
  {
    name: 'තේ',
    price: 30,
    cost: 15,
    category: 'beverage',
    description: 'Ceylon tea',
    stock: 100,
    minStock: 20
  },
  {
    name: 'කෝපි',
    price: 50,
    cost: 25,
    category: 'beverage',
    description: 'Local coffee',
    stock: 80,
    minStock: 20
  }
];

const sampleCustomers = [
  {
    name: 'කමල් පෙරේරා',
    phone: '0771234567',
    email: 'kamal@email.com',
    address: 'නුගේගොඩ',
    totalOrders: 5,
    totalSpent: 1250,
    lastOrderDate: new Date()
  },
  {
    name: 'සුනිලා විජේසේකර',
    phone: '0719876543',
    email: 'sunila@email.com',
    address: 'කොළඹ 07',
    totalOrders: 3,
    totalSpent: 800,
    lastOrderDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)
  },
  {
    name: 'රවින්ද්‍ර ජයසිංහ',
    phone: '0765432109',
    email: 'ravindra@email.com',
    address: 'මහරගම',
    totalOrders: 8,
    totalSpent: 2100,
    lastOrderDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000)
  }
];

const seedDatabase = async () => {
  try {
    console.log('Starting database seeding...');
    
    // Clear existing data
    await Product.deleteMany({});
    await Customer.deleteMany({});
    await Order.deleteMany({});
    await Inventory.deleteMany({});
    
    console.log('Cleared existing data');
    
    // Insert products
    const products = await Product.insertMany(sampleProducts);
    console.log(`Inserted ${products.length} products`);
    
    // Insert customers
    const customers = await Customer.insertMany(sampleCustomers);
    console.log(`Inserted ${customers.length} customers`);
    
    // Create inventory records
    const inventoryRecords = [];
    for (const product of products) {
      const inventory = new Inventory({
        product: product._id,
        quantity: product.stock,
        minQuantity: product.minStock
      });
      await inventory.save();
      inventoryRecords.push(inventory);
    }
    console.log(`Created ${inventoryRecords.length} inventory records`);
    
    // Create sample orders
    const sampleOrders = [
      {
        orderNumber: 'ORD-0001',
        customer: customers[0]._id,
        customerPhone: customers[0].phone,
        items: [
          {
            product: products[0]._id,
            quantity: 2,
            price: products[0].price,
            total: products[0].price * 2
          },
          {
            product: products[1]._id,
            quantity: 4,
            price: products[1].price,
            total: products[1].price * 4
          }
        ],
        subtotal: (products[0].price * 2) + (products[1].price * 4),
        total: (products[0].price * 2) + (products[1].price * 4),
        paymentMethod: 'cash',
        cashAmount: (products[0].price * 2) + (products[1].price * 4),
        cardAmount: 0,
        serviceType: 'takeaway',
        status: 'completed',
        orderDate: new Date(),
        completedDate: new Date()
      },
      {
        orderNumber: 'ORD-0002',
        customer: customers[1]._id,
        customerPhone: customers[1].phone,
        items: [
          {
            product: products[2]._id,
            quantity: 2,
            price: products[2].price,
            total: products[2].price * 2
          },
          {
            product: products[3]._id,
            quantity: 1,
            price: products[3].price,
            total: products[3].price * 1
          }
        ],
        subtotal: (products[2].price * 2) + (products[3].price * 1),
        total: (products[2].price * 2) + (products[3].price * 1),
        paymentMethod: 'card',
        cashAmount: 0,
        cardAmount: (products[2].price * 2) + (products[3].price * 1),
        serviceType: 'dining',
        status: 'completed',
        orderDate: new Date(Date.now() - 1 * 60 * 60 * 1000),
        completedDate: new Date(Date.now() - 1 * 60 * 60 * 1000)
      },
      {
        orderNumber: 'ORD-0003',
        customerPhone: '0112345678',
        items: [
          {
            product: products[4]._id,
            quantity: 1,
            price: products[4].price,
            total: products[4].price * 1
          }
        ],
        subtotal: products[4].price * 1,
        total: products[4].price * 1,
        paymentMethod: 'both',
        cashAmount: 200,
        cardAmount: products[4].price - 200,
        serviceType: 'phone',
        status: 'completed',
        orderDate: new Date(Date.now() - 2 * 60 * 60 * 1000),
        completedDate: new Date(Date.now() - 2 * 60 * 60 * 1000)
      }
    ];
    
    const orders = await Order.insertMany(sampleOrders);
    console.log(`Created ${orders.length} sample orders`);
    
    console.log('Database seeding completed successfully!');
    console.log('\nSample data includes:');
    console.log('- 10 products with inventory');
    console.log('- 3 customers');
    console.log('- 3 sample orders');
    console.log('\nYou can now start the application with: npm run dev');
    
  } catch (error) {
    console.error('Error seeding database:', error);
  }
};

// Run seeding if this file is executed directly
if (require.main === module) {
  require('dotenv').config();
  const connectDB = require('./config/database');
  
  connectDB().then(() => {
    seedDatabase().then(() => {
      process.exit(0);
    });
  });
}

module.exports = seedDatabase;
