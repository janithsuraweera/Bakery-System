# නිල්මිණි බේකර්ස් - Bakery Management System

මෙම පද්ධතිය බේකරි කළමනාකරණය සඳහා සම්පූර්ණ විසඳුමක් සපයයි.

## Features

1. **දවස අන්තිමේ ලැබිච්ච ගාන** - Daily revenue tracking
2. **විකිනී ආහාර ප්‍රමාණය විශ්ලේෂණය** - Sales analysis and reporting
3. **දවසේ හම්බවෙච්ච ලාබය** - Daily profit calculation
4. **Cash/Card වෙන වෙනම ගණනය** - Payment method separation
5. **Take away/Dining වෙන වෙනම** - Service type tracking
6. **පාරිභෝගික දත්ත සමුදාය** - Customer database
7. **විකුණන ආහාර ලැයිස්තුව** - Product sales tracking
8. **දුරකථන ඇණවුම්** - Phone order integration
9. **ඉන්වෙන්ටරි කළමනාකරණය** - Inventory management

## Technology Stack

- **Frontend**: React + Vite
- **Backend**: Node.js + Express.js
- **Database**: MongoDB
- **Styling**: Tailwind CSS

## Installation

```bash
# Install all dependencies
npm run install-all

# Seed database with sample data (optional)
npm run seed

# Start development servers
npm run dev
```

## Quick Start

1. **Install Dependencies:**
   ```bash
   npm run install-all
   ```

2. **Setup MongoDB:**
   - Install MongoDB locally or use MongoDB Atlas
   - Update connection string in `backend/.env`

3. **Seed Sample Data:**
   ```bash
   npm run seed
   ```

4. **Start Application:**
   ```bash
   npm run dev
   ```

5. **Open Browser:**
   ```
   http://localhost:3000
   ```

## Project Structure

```
bakery-system/
├── backend/          # Express.js API server
├── frontend/         # React Vite application
└── package.json      # Root package configuration
```
