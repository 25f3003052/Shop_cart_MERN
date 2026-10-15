import mongoose from 'mongoose';
import Customer from '../models/customer.model.js';
import Product from '../models/product.model.js';

// Helper to extract product ID as string whether item.product is populated object or ObjectId
const getCartProductId = (item) => {
  if (!item || !item.product) return '';
  return item.product._id ? item.product._id.toString() : item.product.toString();
};

// Helper to populate and return cart
const getPopulatedCart = async (userId) => {
  const customer = await Customer.findById(userId).populate({
    path: 'cart.product',
    select: 'name price image stock category description',
  });
  if (!customer) return [];
  // Filter out items where product was deleted from DB
  return (customer.cart || []).filter(
    (item) => item.product !== null && (item.product._id || item.product)
  );
};

/**
 * 1. ADD PRODUCT TO CART
 * POST /cart/:productId
 * Protected by authMiddleware
 */
export const addToCart = async (req, res) => {
  try {
    const { productId } = req.params;

    if (!productId || !mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid product ID',
      });
    }

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found',
      });
    }

    const customer = await Customer.findById(req.user._id);
    if (!customer) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized',
      });
    }

    if (!Array.isArray(customer.cart)) {
      customer.cart = [];
    }

    const existingItem = customer.cart.find(
      (item) => getCartProductId(item) === productId.toString()
    );

    const currentQty = existingItem ? existingItem.quantity : 0;
    const newQty = currentQty + 1;

    if (newQty > product.stock) {
      return res.status(400).json({
        success: false,
        message: `Quantity would exceed stock (Available: ${product.stock})`,
      });
    }

    if (existingItem) {
      existingItem.quantity = newQty;
    } else {
      customer.cart.push({ product: productId, quantity: 1 });
    }

    await customer.save();

    const populatedCart = await getPopulatedCart(customer._id);

    return res.status(200).json({
      success: true,
      message: 'Cart updated',
      cart: populatedCart,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Server error',
    });
  }
};

/**
 * 2. GET CURRENT USER'S CART
 * GET /cart
 * Protected by authMiddleware
 */
export const getCart = async (req, res) => {
  try {
    const populatedCart = await getPopulatedCart(req.user._id);
    return res.status(200).json({
      success: true,
      cart: populatedCart,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Server error',
    });
  }
};

/**
 * 3. UPDATE CART QUANTITY
 * PATCH /cart/:productId
 * Protected by authMiddleware
 */
export const updateCartQuantity = async (req, res) => {
  try {
    const { productId } = req.params;
    const quantity = Number(req.body.quantity);

    if (!productId || !mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid product ID',
      });
    }

    if (!Number.isFinite(quantity) || quantity < 1) {
      return res.status(400).json({
        success: false,
        message: 'Quantity must be at least 1',
      });
    }

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found',
      });
    }

    if (quantity > product.stock) {
      return res.status(400).json({
        success: false,
        message: `Quantity would exceed stock (Available: ${product.stock})`,
      });
    }

    const customer = await Customer.findById(req.user._id);
    if (!customer) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized',
      });
    }

    if (!Array.isArray(customer.cart)) {
      customer.cart = [];
    }

    const existingItem = customer.cart.find(
      (item) => getCartProductId(item) === productId.toString()
    );

    if (!existingItem) {
      return res.status(404).json({
        success: false,
        message: 'Product not in cart',
      });
    }

    existingItem.quantity = quantity;
    await customer.save();

    const populatedCart = await getPopulatedCart(customer._id);

    return res.status(200).json({
      success: true,
      message: 'Cart updated',
      cart: populatedCart,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Server error',
    });
  }
};

/**
 * 4. REMOVE PRODUCT FROM CART
 * DELETE /cart/:productId
 * Protected by authMiddleware
 */
export const removeFromCart = async (req, res) => {
  try {
    const { productId } = req.params;

    if (!productId || !mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid product ID',
      });
    }

    const customer = await Customer.findById(req.user._id);
    if (!customer) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized',
      });
    }

    if (!Array.isArray(customer.cart)) {
      customer.cart = [];
    }

    const existingIndex = customer.cart.findIndex(
      (item) => getCartProductId(item) === productId.toString()
    );

    if (existingIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Product not in cart',
      });
    }

    customer.cart.splice(existingIndex, 1);
    await customer.save();

    const populatedCart = await getPopulatedCart(customer._id);

    return res.status(200).json({
      success: true,
      message: 'Product removed from cart',
      cart: populatedCart,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Server error',
    });
  }
};
