import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import adminRoutes from './routes/adminRoutes.js';
import inquiryRoutes from './routes/inquiryRoutes.js';
import inventoryRoutes from './routes/inventoryRoutes.js';
import productRoutes from './routes/productRoutes.js';
import serviceBookingRoutes from './routes/serviceBookingRoutes.js';
import serviceRoutes from './routes/serviceRoutes.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

app.use(cors({
  origin: [
    'http://localhost:5173',
    'http://127.0.0.1:5173',
    'https://dehati-sansar.vercel.app',
  ],
  credentials: true,
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({
  extended: true,
  limit: '10mb',
}));

app.use(
  '/uploads',
  express.static(path.join(__dirname, 'uploads'))
);

app.use('/api/admin', adminRoutes);
app.use('/api/inquiries', inquiryRoutes);
app.use('/api/inventory', inventoryRoutes);
app.use('/api/products', productRoutes);
app.use('/api/service-bookings', serviceBookingRoutes);
app.use('/api/services', serviceRoutes);

const PORT = Number(process.env.PORT) || 5000;

app.listen(PORT, '0.0.0.0', (error) => {
  if (error) {
    console.error(
      'Server start failed:',
      error.code,
      error.message
    );
    process.exitCode = 1;
    return;
  }

  console.log(`Server running on http://127.0.0.1:${PORT}`);
});