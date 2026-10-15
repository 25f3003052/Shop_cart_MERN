import express from 'express';
import {
  createPaymentOrder,
  verifyPayment,
  getUserOrders,
  getOrderById,
} from '../controllers/order.controller.js';
import authMiddleware from '../middlewares/auth.middleware.js';

const router = express.Router();

router.post('/create-payment-order', authMiddleware, createPaymentOrder);
router.post('/verify-payment', authMiddleware, verifyPayment);
router.get('/', authMiddleware, getUserOrders);
router.get('/:id', authMiddleware, getOrderById);

export default router;
