# Fresh Cart Hub - Setup Guide

## Overview

This is a full-stack e-commerce application with:
- **Frontend**: React + TypeScript + Vite
- **Backend**: Node.js + Express
- **Payment**: Razorpay integration
- **Features**: Product management, order tracking, address validation, owner dashboard

## Quick Start

### 1. Install Frontend Dependencies

```bash
npm install
```

### 2. Install Backend Dependencies

```bash
cd server
npm install
cd ..
```

### 3. Start Backend Server

In one terminal:
```bash
cd server
npm run dev
```

The backend will run on `http://localhost:3000`

### 4. Start Frontend

In another terminal:
```bash
npm run dev
```

The frontend will run on `http://localhost:8080`

## Owner Account

- **Email**: `tanusng2727@gmail.com`
- **Password**: `owner123`
- **Role**: Owner (can add products, view all orders, manage inventory)

## Features

### For Customers:
- Browse products
- Add to cart
- Address validation (5km from pincode 208007)
- Online payment (Razorpay) or Cash on Delivery
- Order tracking

### For Owner:
- Add products by scanning barcode
- Set product prices
- View all orders
- Update order status
- Dashboard with statistics
- Manage inventory

## Address Validation

The system only delivers within 5km of pincode **208007** (Kanpur, Uttar Pradesh, India).

When placing an order:
1. Enter your delivery address
2. Enter pincode
3. Click "Validate" to check if delivery is available
4. If within range, proceed with checkout

## Payment Integration

### Razorpay Setup (Optional for testing)

1. Sign up at https://razorpay.com
2. Get your API keys
3. Update `server/.env`:
   ```
   RAZORPAY_KEY_ID=your_key_id
   RAZORPAY_KEY_SECRET=your_key_secret
   ```

For development, test keys are provided in the code.

## Barcode Scanning

Owners can add products by:
1. Going to Owner Dashboard
2. Click "Add Product"
3. Enter or scan barcode
4. Fill in product details
5. Set price
6. Save

## API Configuration

The frontend connects to the backend API. The API URL is configured in `src/lib/api.ts`:

```typescript
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
```

You can set `VITE_API_URL` in a `.env` file if your backend is on a different URL.

## Troubleshooting

### Backend not starting
- Check if port 3000 is available
- Ensure all dependencies are installed
- Check `server/data/` directory exists

### Frontend can't connect to backend
- Ensure backend is running on port 3000
- Check CORS settings in backend
- Verify API_BASE_URL in frontend

### Payment not working
- Check Razorpay keys in `.env`
- Ensure Razorpay script is loaded
- Check browser console for errors

## Project Structure

```
├── server/              # Backend
│   ├── routes/          # API routes
│   ├── utils/           # Utilities (auth, database, address)
│   ├── data/            # JSON database files
│   └── server.js        # Main server file
├── src/                 # Frontend
│   ├── components/      # React components
│   ├── pages/           # Page components
│   ├── contexts/        # React context
│   ├── lib/             # Utilities and API client
│   └── ...
└── ...
```

## Development

- Frontend hot-reloads on changes
- Backend uses `--watch` for auto-restart
- Data is stored in JSON files (can be migrated to database later)

## Production Deployment

1. Build frontend: `npm run build`
2. Set production environment variables
3. Use a process manager (PM2) for backend
4. Configure reverse proxy (nginx)
5. Set up proper database (PostgreSQL/MongoDB)

