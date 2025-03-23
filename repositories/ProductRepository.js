const Product = require('../models/Product');
const BaseRepository = require('./BaseRepository');

/**
 * Repository class for Product data operations
 * Implements the Repository Pattern and extends BaseRepository
 */
class ProductRepository extends BaseRepository {
  /**
   * Constructor
   */
  constructor() {
    super(Product);
  }

  /**
   * Get all products with filtering
   * @param {Object} queryParams - Query parameters for filtering
   * @param {number} limit - Number of products to return
   * @param {number} skip - Number of products to skip
   * @param {Object} sort - Sort criteria
   * @returns {Promise<Product[]>} Array of products
   */
  async getAll(queryParams = {}, limit = 10, skip = 0, sort = { createdAt: -1 }) {
    // Build filter object
    const filter = this.buildFilterObject(queryParams);
    
    // Call the parent's getAll method with the filter
    return await super.getAll(filter, limit, skip, sort);
  }

  /**
   * Count total products with filtering
   * @param {Object} queryParams - Query parameters for filtering
   * @returns {Promise<number>} Total count
   */
  async count(queryParams = {}) {
    // Build filter object
    const filter = this.buildFilterObject(queryParams);
    
    // Call the parent's count method with the filter
    return await super.count(filter);
  }

  /**
   * Build filter object from query parameters
   * @param {Object} queryParams - Query parameters
   * @returns {Object} MongoDB filter object
   */
  buildFilterObject(queryParams) {
    const filter = {};
    
    // Category filter
    if (queryParams.category) {
      filter.maLoai = queryParams.category;
    }
    
    // Name search
    if (queryParams.search) {
      filter.tenMon = { $regex: new RegExp(queryParams.search, 'i') };
    }
    
    // Price range
    if (queryParams.minPrice || queryParams.maxPrice) {
      filter.giaBan = {};
      
      if (queryParams.minPrice) {
        filter.giaBan.$gte = parseFloat(queryParams.minPrice);
      }
      
      if (queryParams.maxPrice) {
        filter.giaBan.$lte = parseFloat(queryParams.maxPrice);
      }
    }
    
    return filter;
  }

  /**
   * Find products by category
   * @param {string} categoryId - Category ID
   * @param {number} limit - Number of products to return
   * @param {number} skip - Number of products to skip
   * @returns {Promise<Product[]>} Array of products
   */
  async findByCategory(categoryId, limit = 10, skip = 0) {
    return await this.model.find({ maLoai: categoryId })
      .limit(limit)
      .skip(skip)
      .sort({ createdAt: -1 });
  }

  /**
   * Search products by name
   * @param {string} keyword - Search keyword
   * @param {number} limit - Number of products to return
   * @param {number} skip - Number of products to skip
   * @returns {Promise<Product[]>} Array of products
   */
  async search(keyword, limit = 10, skip = 0) {
    const regex = new RegExp(keyword, 'i');
    return await this.model.find({ tenMon: { $regex: regex } })
      .limit(limit)
      .skip(skip)
      .sort({ createdAt: -1 });
  }

  /**
   * Find products by IDs (for cart items)
   * @param {string[]} productIds - Array of product IDs
   * @returns {Promise<Product[]>} Array of products
   */
  async findByIds(productIds) {
    return await this.model.find({ _id: { $in: productIds } });
  }

  /**
   * Count products by category
   * @param {string} categoryId - Category ID
   * @returns {Promise<number>} Total count
   */
  async countByCategory(categoryId) {
    return await this.model.countDocuments({ maLoai: categoryId });
  }

  /**
   * Count products by search keyword
   * @param {string} keyword - Search keyword
   * @returns {Promise<number>} Total count
   */
  async countBySearch(keyword) {
    const regex = new RegExp(keyword, 'i');
    return await this.model.countDocuments({ tenMon: { $regex: regex } });
  }

  /**
   * Add a rating to a product
   * @param {string} productId - Product ID 
   * @param {Object} ratingData - Rating data
   * @returns {Promise<Product>} Updated product
   */
  async addRating(productId, ratingData) {
    return await this.model.findByIdAndUpdate(
      productId,
      { 
        $push: { ratings: ratingData },
        $inc: { ratingCount: 1 }
      },
      { new: true }
    );
  }

  /**
   * Hook to execute before create operation
   * @param {Object} data - Product data
   * @returns {Object} Processed product data
   */
  beforeCreate(data) {
    // Nếu số lượng tồn không được cung cấp, mặc định là 0
    if (data.soLuongTon === undefined) {
      data.soLuongTon = 0;
    }
    return data;
  }
}

// Export class
module.exports = ProductRepository; 