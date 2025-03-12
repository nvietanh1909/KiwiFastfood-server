const Cart = require('../models/Cart');
const Product = require('../models/Product');

/**
 * Repository class for Cart data operations
 * Implements the Repository Pattern
 */
class CartRepository {
  /**
   * Get cart for a user, creating one if it doesn't exist
   * @param {string} userId - User ID
   * @returns {Promise<Cart>} User's cart
   */
  async getCart(userId) {
    let cart = await Cart.findOne({ user: userId, active: true });
    
    if (!cart) {
      // Create new cart if none exists
      cart = await Cart.create({
        user: userId,
        items: [],
        totalPrice: 0,
      });
    }
    
    return cart;
  }

  /**
   * Add an item to a user's cart
   * @param {string} userId - User ID
   * @param {Object} itemData - Item data to add
   * @returns {Promise<Cart>} Updated cart
   */
  async addItem(userId, itemData) {
    // Get the cart (or create if doesn't exist)
    const cart = await this.getCart(userId);
    
    // Get the product to verify it exists and get current price
    const product = await Product.findById(itemData.product);
    if (!product) {
      throw new Error('Product not found');
    }
    
    // Check if product is in stock
    if (!product.inStock) {
      throw new Error('Product is out of stock');
    }
    
    // Check if the item already exists in cart
    const existingItemIndex = cart.items.findIndex(
      item => item.product.toString() === itemData.product.toString()
    );
    
    if (existingItemIndex > -1) {
      // Update quantity if item already in cart
      cart.items[existingItemIndex].quantity += itemData.quantity || 1;
    } else {
      // Add new item to cart with current product info
      cart.items.push({
        product: product._id,
        name: product.name,
        quantity: itemData.quantity || 1,
        price: product.price,
        customizations: itemData.customizations || {},
      });
    }
    
    // Save and return updated cart
    await cart.save();
    return cart;
  }

  /**
   * Update item quantity in cart
   * @param {string} userId - User ID
   * @param {string} itemId - Item ID in cart
   * @param {number} quantity - New quantity
   * @returns {Promise<Cart>} Updated cart
   */
  async updateItemQuantity(userId, itemId, quantity) {
    if (quantity < 1) {
      throw new Error('Quantity must be at least 1');
    }
    
    const cart = await Cart.findOne({ user: userId, active: true });
    
    if (!cart) {
      throw new Error('Cart not found');
    }
    
    // Find the item to update
    const item = cart.items.id(itemId);
    
    if (!item) {
      throw new Error('Item not found in cart');
    }
    
    // Update quantity
    item.quantity = quantity;
    
    // Save and return updated cart
    await cart.save();
    return cart;
  }

  /**
   * Remove an item from cart
   * @param {string} userId - User ID
   * @param {string} itemId - Item ID in cart
   * @returns {Promise<Cart>} Updated cart
   */
  async removeItem(userId, itemId) {
    const cart = await Cart.findOne({ user: userId, active: true });
    
    if (!cart) {
      throw new Error('Cart not found');
    }
    
    // Remove the item
    cart.items = cart.items.filter(item => item._id.toString() !== itemId);
    
    // Save and return updated cart
    await cart.save();
    return cart;
  }

  /**
   * Clear all items from cart
   * @param {string} userId - User ID
   * @returns {Promise<Cart>} Empty cart
   */
  async clearCart(userId) {
    const cart = await Cart.findOne({ user: userId, active: true });
    
    if (!cart) {
      throw new Error('Cart not found');
    }
    
    cart.items = [];
    cart.totalPrice = 0;
    
    await cart.save();
    return cart;
  }

  /**
   * Deactivate cart after order is placed
   * @param {string} userId - User ID
   * @returns {Promise<Cart>} Deactivated cart
   */
  async deactivateCart(userId) {
    const cart = await Cart.findOne({ user: userId, active: true });
    
    if (!cart) {
      throw new Error('Cart not found');
    }
    
    cart.active = false;
    
    await cart.save();
    return cart;
  }
}

module.exports = new CartRepository(); 