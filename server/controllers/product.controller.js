import mongoose from 'mongoose';
import Product from '../models/product.model.js';

const INITIAL_PRODUCTS = [
  {
    name: 'Wireless Noise-Canceling Headphones',
    category: 'Electronics',
    price: 2999,
    image: '🎧',
    stock: 15,
    description: 'High-fidelity audio with active noise cancellation and 30-hour battery life.',
  },
  {
    name: 'Cyberpunk OLED Smart Watch',
    category: 'Electronics',
    price: 1999,
    image: '⌚',
    stock: 8,
    description: 'Heart rate monitoring, GPS tracking, and ultra-crisp AMOLED display.',
  },
  {
    name: 'Minimalist Ergonomic Leather Chair',
    category: 'Home',
    price: 4500,
    image: '🪑',
    stock: 5,
    description: 'Premium lumbar support with genuine breathable leather stitching.',
  },
  {
    name: 'Next-Gen Mechanical Keyboard',
    category: 'Gaming',
    price: 2999,
    image: '⌨️',
    stock: 10,
    description: 'RGB customizable switches with ultra-fast 1ms wireless latency.',
  },
  {
    name: 'Ultra-Lightweight Running Sneakers',
    category: 'Fashion',
    price: 1200,
    image: '👟',
    stock: 20,
    description: 'Cushioned memory foam soles for maximum comfort and performance.',
  },
  {
    name: '4K Ultra-Short Throw Projector',
    category: 'Electronics',
    price: 8999,
    image: '📹',
    stock: 3,
    description: 'Cinematic 150-inch display with integrated Dolby Atmos soundbar.',
  },
];

export const getAllProducts = async (req, res) => {
  try {
    let products = await Product.find();
    if (products.length === 0) {
      products = await Product.insertMany(INITIAL_PRODUCTS);
    }
    return res.status(200).json({
      success: true,
      count: products.length,
      products,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Server error',
    });
  }
};

export const getProductById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid product ID',
      });
    }

    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found',
      });
    }

    return res.status(200).json({
      success: true,
      product,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Server error',
    });
  }
};
