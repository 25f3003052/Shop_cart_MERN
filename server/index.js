import path from 'path';
import { fileURLToPath } from 'url';
import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import customerRoutes from './routes/customer.routes.js';
import wishlistRoutes from './routes/wishlist.routes.js';
import productRoutes from './routes/product.routes.js';
import cartRoutes from './routes/cart.routes.js';
import orderRoutes from './routes/order.routes.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '.env') });

const app = express();

// We check `process.env.PORT` first (loaded from .env), and fallback to 5023 if not set.
const PORT = process.env.PORT || 5023;

// 1. CORS MIDDLEWARE (Cross-Origin Resource Sharing)
// Browsers enforce a security policy called Same-Origin Policy. If our frontend runs on
// http://localhost:5173 and our backend runs on http://localhost:5023, the browser will block requests
// unless CORS headers are returned.
// `credentials: true` allows cookies (like our authentication JWT cookie) to be sent across origins.
const allowedOrigins = new Set([
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  'http://localhost:5174',
  'http://127.0.0.1:5174',
]);

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.has(origin) || /^http:\/\/(localhost|127\.0\.0\.1):\d+$/.test(origin)) {
        return callback(null, true);
      }
      return callback(new Error('Not allowed by CORS'));
    },
    credentials: true,
  })
);

// 2. EXPRESS JSON PARSER MIDDLEWARE
// WHAT IT DOES: Parses incoming HTTP request bodies containing JSON data.
// WHY IT IS NEEDED: Without `express.json()`, Express does not automatically parse JSON payloads,
// leaving `req.body` as undefined inside route handlers.
app.use(express.json());

// 3. COOKIE PARSER MIDDLEWARE
// WHAT IT DOES: Parses cookie headers sent in incoming HTTP requests.
// WHY IT IS NEEDED: Makes parsed cookies easily accessible on `req.cookies` (e.g., `req.cookies.token`).
app.use(cookieParser());


app.use('/customers', customerRoutes);
app.use('/wishlist', wishlistRoutes);
app.use('/products', productRoutes);
app.use('/cart', cartRoutes);
app.use('/orders', orderRoutes);

const startServer = async () => {
  try {

    const mongoUri = process.env.MONGO_URI;
    if (!mongoUri) {
      throw new Error('MONGO_URI is not set. Add it to server/.env');
    }

    await mongoose.connect(mongoUri);

    console.log('MongoDB connected');

    app.listen(PORT, () => {

      console.log(`Server running on port ${PORT}`);

    });
  } catch (error) {

    console.error('MongoDB connection error:', error.message);
    
    process.exit(1);
  }
};

startServer();
