# නිල්මිණි බේකර්ස් - Installation Guide

## Prerequisites

මෙම system එක run කිරීමට පහත software ටික අවශ්‍යයි:

1. **Node.js** (version 16 හෝ ඊට වැඩි)
2. **MongoDB** (local installation හෝ MongoDB Atlas)
3. **Git** (optional)

## Installation Steps

### 1. Dependencies Install කරන්න

```bash
# Root directory එකේ
npm run install-all
```

මෙය backend, frontend සහ root dependencies install කරයි.

### 2. MongoDB Setup කරන්න

#### Option A: Local MongoDB
```bash
# Windows
# MongoDB Community Server download කර install කරන්න
# https://www.mongodb.com/try/download/community

# Start MongoDB service
net start MongoDB
```

#### Option B: MongoDB Atlas (Cloud)
1. [MongoDB Atlas](https://www.mongodb.com/atlas) account එකක් හදන්න
2. Free cluster එකක් create කරන්න
3. Connection string එක copy කරන්න

### 3. Environment Variables Setup කරන්න

Backend folder එකේ `.env` file එකක් create කරන්න:

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/bakery_system
JWT_SECRET=your_jwt_secret_key_here
NODE_ENV=development
```

MongoDB Atlas use කරනවනම්:
```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/bakery_system
```

### 4. System Start කරන්න

```bash
# Development mode එකේ run කරන්න
npm run dev
```

මෙය backend (port 5000) සහ frontend (port 3000) එකටම start කරයි.

### 5. Browser එකේ Open කරන්න

```
http://localhost:3000
```

## Features

### ✅ Completed Features

1. **දවස අන්තිමේ ලැබිච්ච ගාන** - Daily revenue tracking
2. **විකිනී ආහාර ප්‍රමාණය විශ්ලේෂණය** - Sales analysis and reporting
3. **දවසේ හම්බවෙච්ච ලාබය** - Daily profit calculation
4. **Cash/Card වෙන වෙනම ගණනය** - Payment method separation
5. **Take away/Dining වෙන වෙනම** - Service type tracking
6. **පාරිභෝගික දත්ත සමුදාය** - Customer database
7. **විකුණන ආහාර ලැයිස්තුව** - Product sales tracking
8. **දුරකථන ඇණවුම්** - Phone order integration
9. **ඉන්වෙන්ටරි කළමනාකරණය** - Inventory management

## API Endpoints

### Orders
- `GET /api/orders` - Get all orders
- `POST /api/orders` - Create new order
- `GET /api/orders/daily-revenue` - Get daily revenue
- `GET /api/orders/sales-analysis` - Get sales analysis

### Products
- `GET /api/products` - Get all products
- `POST /api/products` - Create new product
- `PUT /api/products/:id` - Update product
- `PATCH /api/products/:id/stock` - Update stock

### Customers
- `GET /api/customers` - Get all customers
- `POST /api/customers` - Create new customer
- `GET /api/customers/:id/stats` - Get customer statistics

### Inventory
- `GET /api/inventory` - Get inventory status
- `POST /api/inventory/add-stock` - Add stock
- `PATCH /api/inventory/:id/quantity` - Update quantity

## Troubleshooting

### Common Issues

1. **MongoDB Connection Error**
   - MongoDB service start කර තිබෙනවද check කරන්න
   - Connection string එක correct ද check කරන්න

2. **Port Already in Use**
   - Port 3000 හෝ 5000 අනෙක් application එකක් use කරනවනම්
   - Task Manager එකේ kill කරන්න

3. **Dependencies Install නොවෙනවා**
   - Node.js version check කරන්න (16+)
   - npm cache clear කරන්න: `npm cache clean --force`

## Support

මේ system එක ගැන ඕනෑම ප්‍රශ්නයක් තිබෙනවනම් contact කරන්න:

- Phone: 011-258-5972
- Email: info@nilminibakers.com

---

**නිල්මිණි බේකර්ස්** - Your Complete Bakery Management Solution
