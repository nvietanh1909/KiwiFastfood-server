const Product = require('../models/Product');

/**
 * Repository class for Product data operations
 * Implements the Repository Pattern
 */
class ProductRepository {
  /**
   * Create a new product
   * @param {Object} productData - Product data
   * @returns {Promise<Product>} Created product
   */
  async create(productData) {
    return await Product.create(productData);
  }

  /**
   * Find a product by ID
   * @param {string} id - Product ID
   * @returns {Promise<Product>} Product document
   */
  async findById(id) {
    return await Product.findById(id).populate('maLoai');
  }

  /**
   * Update a product
   * @param {string} id - Product ID
   * @param {Object} updateData - Data to update
   * @returns {Promise<Product>} Updated product
   */
  async update(id, updateData) {
    return await Product.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true
    }).populate('maLoai');
  }

  /**
   * Delete a product
   * @param {string} id - Product ID
   * @returns {Promise<Product>} Deleted product
   */
  async delete(id) {
    return await Product.findByIdAndDelete(id);
  }

  /**
   * Get all products
   * @param {Object} queryParams - Query parameters for filtering
   * @param {number} limit - Number of products to return
   * @param {number} skip - Number of products to skip
   * @returns {Promise<Product[]>} Array of products
   */
  async getAll(queryParams = {}, limit = 50, skip = 0) {
    // Build filter query
    const query = {};
    
    // Filter by category if specified
    if (queryParams.maLoai) {
      query.maLoai = queryParams.maLoai;
    }
    
    // Filter by in-stock status if specified
    if (queryParams.soLuongTon !== undefined) {
      if (queryParams.soLuongTon === 'available') {
        query.soLuongTon = { $gt: 0 };
      } else if (queryParams.soLuongTon === 'unavailable') {
        query.soLuongTon = { $lte: 0 };
      } else if (!isNaN(parseInt(queryParams.soLuongTon))) {
        query.soLuongTon = parseInt(queryParams.soLuongTon);
      }
    }
    
    // Search by name or description
    if (queryParams.search) {
      query.$or = [
        { tenMon: { $regex: queryParams.search, $options: 'i' } },
        { noiDung: { $regex: queryParams.search, $options: 'i' } }
      ];
    }
    
    // Price range
    if (queryParams.minPrice || queryParams.maxPrice) {
      query.giaBan = {};
      
      if (queryParams.minPrice) {
        query.giaBan.$gte = Number(queryParams.minPrice);
      }
      
      if (queryParams.maxPrice) {
        query.giaBan.$lte = Number(queryParams.maxPrice);
      }
    }
    
    const sortOptions = {};
    if (queryParams.sort) {
      if (queryParams.sort === 'price-asc') {
        sortOptions.giaBan = 1;
      } else if (queryParams.sort === 'price-desc') {
        sortOptions.giaBan = -1;
      } else if (queryParams.sort === 'name-asc') {
        sortOptions.tenMon = 1;
      } else if (queryParams.sort === 'name-desc') {
        sortOptions.tenMon = -1;
      }
    } else {
      sortOptions.tenMon = 1;
    }
    
    return await Product.find(query)
      .populate('maLoai')
      .limit(limit)
      .skip(skip)
      .sort(sortOptions);
  }

  /**
   * Count total products with filters
   * @param {Object} queryParams - Query parameters for filtering
   * @returns {Promise<number>} Total count
   */
  async count(queryParams = {}) {
    // Build filter query (same as in getAll method)
    const query = {};
    
    if (queryParams.maLoai) {
      query.maLoai = queryParams.maLoai;
    }
    
    if (queryParams.soLuongTon !== undefined) {
      if (queryParams.soLuongTon === 'available') {
        query.soLuongTon = { $gt: 0 };
      } else if (queryParams.soLuongTon === 'unavailable') {
        query.soLuongTon = { $lte: 0 };
      } else if (!isNaN(parseInt(queryParams.soLuongTon))) {
        query.soLuongTon = parseInt(queryParams.soLuongTon);
      }
    }
    
    if (queryParams.search) {
      query.$or = [
        { tenMon: { $regex: queryParams.search, $options: 'i' } },
        { noiDung: { $regex: queryParams.search, $options: 'i' } }
      ];
    }
    
    if (queryParams.minPrice || queryParams.maxPrice) {
      query.giaBan = {};
      
      if (queryParams.minPrice) {
        query.giaBan.$gte = Number(queryParams.minPrice);
      }
      
      if (queryParams.maxPrice) {
        query.giaBan.$lte = Number(queryParams.maxPrice);
      }
    }
    
    return await Product.countDocuments(query);
  }
  
  /**
   * Get products by category
   * @param {string} categoryId - Category ID
   * @returns {Promise<Product[]>} Array of products
   */
  async getByCategory(categoryId) {
    return await Product.find({ maLoai: categoryId }).populate('maLoai');
  }
}

module.exports = new ProductRepository(); 