import mongoose from 'mongoose';
import Customer from '../models/customer.model.js';
import Product from '../models/product.model.js';

/**
 * 1. ADD PRODUCT TO WISHLIST
 * POST /wishlist/:productId
 * Protected by authMiddleware (req.user)
 */
export const addToWishlist = async (req, res) => {
  try {
    const { productId } = req.params;

    // Validate productId is valid ObjectId
    if (!productId || !mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid product ID',
      });
    }

    // Find product to ensure it exists
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product does not exist',
      });
    }

    // Find authenticated user
    const customer = await Customer.findById(req.user._id);
    if (!customer) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized',
      });
    }

    // Ensure wishlist array exists
    if (!Array.isArray(customer.wishlist)) {
      customer.wishlist = [];
    }

    // Check whether product already exists in wishlist
    const exists = customer.wishlist.some(
      (id) => id.toString() === productId.toString()
    );
    if (exists) {
      return res.status(409).json({
        success: false,
        message: 'Product already exists in wishlist',
      });
    }

    // Add Product ObjectId to wishlist
    customer.wishlist.push(productId);
    await customer.save();

    return res.status(200).json({
      success: true,
      message: 'Product added to wishlist',
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Server error',
    });
  }
};

/**
 * 2. GET CURRENT USER'S WISHLIST
 * GET /wishlist
 * Protected by authMiddleware (req.user)
 */
export const getWishlist = async (req, res) => {
  try {
    const customer = await Customer.findById(req.user._id).populate({
      path: 'wishlist',
      select: 'name description price category image stock',
    });

    if (!customer) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized',
      });
    }

    const wishlistProducts = (customer.wishlist || []).filter(
      (item) => item !== null && typeof item === 'object' && item._id
    );

    return res.status(200).json({
      success: true,
      count: wishlistProducts.length,
      wishlist: wishlistProducts,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Server error',
    });
  }
};

/**
 * 3. REMOVE PRODUCT FROM WISHLIST
 * DELETE /wishlist/:productId
 * Protected by authMiddleware (req.user)
 */
export const removeFromWishlist = async (req, res) => {
  try {
    const { productId } = req.params;

    // Validate productId is valid ObjectId
    if (!productId || !mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid product ID',
      });
    }

    // Find authenticated user
    const customer = await Customer.findById(req.user._id);
    if (!customer) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized',
      });
    }

    if (!Array.isArray(customer.wishlist)) {
      customer.wishlist = [];
    }

    // Check whether product exists in wishlist
    const exists = customer.wishlist.some(
      (id) => id.toString() === productId.toString()
    );
    if (!exists) {
      return res.status(404).json({
        success: false,
        message: 'Product not in wishlist',
      });
    }

    // Remove Product ObjectId from wishlist
    customer.wishlist = customer.wishlist.filter(
      (id) => id.toString() !== productId.toString()
    );
    await customer.save();

    return res.status(200).json({
      success: true,
      message: 'Product removed from wishlist',
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Server error',
    });
  }
};
