const Cart = require('../models/Cart');
const BaseRepository = require('./BaseRepository');

/**
 * Repository class for Cart data operations
 * Implements the Repository Pattern and extends BaseRepository
 */
class CartRepository extends BaseRepository {
  /**
   * Constructor
   */
  constructor() {
    super(Cart);
  }

  /**
   * Find a cart by user ID
   * @param {string} userId - User ID
   * @returns {Promise<Cart>} Cart document
   */
  async findByUserId(userId) {
    return await this.model.findOne({ user: userId }).populate('items.product');
  }

  /**
   * Add a product to cart
   * @param {string} userId - User ID
   * @param {string} productId - Product ID
   * @param {number} quantity - Quantity to add
   * @returns {Promise<Cart>} Updated cart
   */
  async addItem(userId, productId, quantity) {
    // First get product details to add name and price
    const product = await require('../models/Product').findById(productId);
    if (!product) {
      throw new Error('Product not found');
    }
    
    let cart = await this.findByUserId(userId);
    
    // If cart doesn't exist, create one
    if (!cart) {
      cart = await this.create({
        user: userId,
        items: [{
          product: productId,
          quantity: quantity,
          name: product.tenMon,
          price: product.giaBan
        }],
      });
      return cart;
    }
    
    // Check if product already in cart
    const itemIndex = cart.items.findIndex(
      (item) => item.product._id.toString() === productId
    );
    
    if (itemIndex !== -1) {
      // Update quantity if product already in cart
      cart.items[itemIndex].quantity += quantity;
    } else {
      // Add new product to cart
      cart.items.push({
        product: productId,
        quantity: quantity,
        name: product.tenMon,
        price: product.giaBan
      });
    }
    
    // Calculate cart total
    cart.markModified('items');
    return await cart.save();
  }

  /**
   * Update cart item quantity
   * @param {string} userId - User ID
   * @param {string} productId - Product ID
   * @param {number} quantity - New quantity
   * @returns {Promise<Cart>} Updated cart
   */
  async updateItemQuantity(userId, productId, quantity) {
    const cart = await this.findByUserId(userId);
    
    if (!cart) {
      throw new Error('Cart not found');
    }
    
    const itemIndex = cart.items.findIndex(
      (item) => item.product._id.toString() === productId
    );
    
    if (itemIndex === -1) {
      throw new Error('Item not found in cart');
    }
    
    // Update quantity
    cart.items[itemIndex].quantity = quantity;
    
    // Remove item if quantity is 0
    if (quantity <= 0) {
      cart.items.splice(itemIndex, 1);
    }
    
    cart.markModified('items');
    return await cart.save();
  }

  /**
   * Remove an item from cart
   * @param {string} userId - User ID
   * @param {string} productId - Product ID
   * @returns {Promise<Cart>} Updated cart
   */
  async removeItem(userId, productId) {
    const cart = await this.findByUserId(userId);
    
    if (!cart) {
      throw new Error('Cart not found');
    }
    
    const itemIndex = cart.items.findIndex(
      (item) => item.product._id.toString() === productId
    );
    
    if (itemIndex === -1) {
      throw new Error('Item not found in cart');
    }
    
    // Remove item
    cart.items.splice(itemIndex, 1);
    
    cart.markModified('items');
    return await cart.save();
  }

  /**
   * Clear user's cart (after order completion)
   * @param {string} userId - User ID
   * @returns {Promise<Cart>} Empty cart
   */
  async clearCart(userId) {
    const cart = await this.findByUserId(userId);
    
    if (!cart) {
      throw new Error('Cart not found');
    }
    
    cart.items = [];
    cart.markModified('items');
    return await cart.save();
  }
}

// Export class
module.exports = CartRepository; 