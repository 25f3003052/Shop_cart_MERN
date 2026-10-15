import express from 'express';
import {
  addToCart,
  getCart,
  updateCartQuantity,
  removeFromCart,
} from '../controllers/cart.controller.js';
import authMiddleware from '../middlewares/auth.middleware.js';

const router = express.Router();

router.post('/:productId', authMiddleware, addToCart);
router.get('/', authMiddleware, getCart);
router.patch('/:productId', authMiddleware, updateCartQuantity);
router.delete('/:productId', authMiddleware, removeFromCart);

export default router;
