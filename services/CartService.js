const CartRepository = require('../repositories/CartRepository');
const ProductRepository = require('../repositories/ProductRepository');
const { ErrorResponse } = require('../middleware/errorHandler');
const Validator = require('../utils/validator');

// Khởi tạo repositories
const cartRepository = new CartRepository();
const productRepository = new ProductRepository();

/**
 * Service class for Cart-related business logic
 * Implements the Service Pattern
 */
class CartService {
  /**
   * Get cart for a user
   * @param {string} userId - User ID
   * @returns {Object} Cart with items
   */
  async getCart(userId) {
    try {
      const cart = await cartRepository.findByUserId(userId);
      return cart || { userId, items: [] }; // Trả về giỏ hàng trống nếu không tìm thấy
    } catch (error) {
      throw new ErrorResponse(error.message, 500);
    }
  }

  /**
   * Add an item to cart
   * @param {string} userId - User ID
   * @param {Object} itemData - Item data to add
   * @returns {Object} Updated cart
   */
  async addItem(userId, itemData) {
    // Validate input data
    const { error } = Validator.validateCartItem(itemData);
    if (error) {
      throw new ErrorResponse(error.details[0].message, 400);
    }

    // Check if product exists
    const product = await productRepository.findById(itemData.product);
    if (!product) {
      throw new ErrorResponse('Product not found', 404);
    }

    // Check if product is in stock
    if (!product.inStock) {
      throw new ErrorResponse('Product is out of stock', 400);
    }

    try {
      const cart = await cartRepository.addItem(userId, itemData.product, itemData.quantity);
      return cart;
    } catch (error) {
      throw new ErrorResponse(error.message, 500);
    }
  }

  /**
   * Update item quantity in cart
   * @param {string} userId - User ID
   * @param {string} itemId - Item ID in cart
   * @param {number} quantity - New quantity
   * @returns {Object} Updated cart
   */
  async updateItemQuantity(userId, itemId, quantity) {
    // Validate quantity
    if (!quantity || quantity < 1) {
      throw new ErrorResponse('Quantity must be at least 1', 400);
    }

    try {
      const cart = await cartRepository.updateItemQuantity(userId, itemId, quantity);
      return cart;
    } catch (error) {
      // Check if the error is from our repository
      if (error.message === 'Cart not found' || error.message === 'Item not found in cart') {
        throw new ErrorResponse(error.message, 404);
      }
      throw new ErrorResponse(error.message, 500);
    }
  }

  /**
   * Remove an item from cart
   * @param {string} userId - User ID
   * @param {string} itemId - Item ID in cart
   * @returns {Object} Updated cart
   */
  async removeItem(userId, itemId) {
    try {
      const cart = await cartRepository.removeItem(userId, itemId);
      return cart;
    } catch (error) {
      if (error.message === 'Cart not found') {
        throw new ErrorResponse(error.message, 404);
      }
      throw new ErrorResponse(error.message, 500);
    }
  }

  /**
   * Clear all items from cart
   * @param {string} userId - User ID
   * @returns {Object} Empty cart
   */
  async clearCart(userId) {
    try {
      const cart = await cartRepository.clearCart(userId);
      return cart;
    } catch (error) {
      if (error.message === 'Cart not found') {
        throw new ErrorResponse(error.message, 404);
      }
      throw new ErrorResponse(error.message, 500);
    }
  }
}

module.exports = new CartService(); 