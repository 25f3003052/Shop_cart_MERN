import express from 'express';
import {
  addToWishlist,
  getWishlist,
  removeFromWishlist,
} from '../controllers/wishlist.controller.js';
import authMiddleware from '../middlewares/auth.middleware.js';

const router = express.Router();

router.post('/:productId', authMiddleware, addToWishlist);
router.get('/', authMiddleware, getWishlist);
router.delete('/:productId', authMiddleware, removeFromWishlist);

export default router;
