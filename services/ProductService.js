const { ErrorResponse } = require('../middleware/errorHandler');
const Validator = require('../utils/validator');
const uploadService = require('./uploadService');

/**
 * Service class for Product-related business logic
 * Implements the Service Pattern
 */
class ProductService {
  /**
   * Constructor for ProductService
   * @param {Object} productRepository - Repository for product data operations
   * @param {Object} categoryRepository - Repository for category data operations
   */
  constructor(productRepository, categoryRepository) {
    this.productRepository = productRepository;
    this.categoryRepository = categoryRepository;
  }

  /**
   * Create a new product
   * @param {Object} productData - Product data
   * @param {Object} imageFile - Image file for product
   * @returns {Object} Created product
   */
  async createProduct(productData, imageFile) {
    // Validate input data
    if (!productData.tenMon) {
      throw new ErrorResponse('Vui lòng nhập tên món', 400);
    }
    
    if (!productData.giaBan && productData.giaBan !== 0) {
      throw new ErrorResponse('Vui lòng nhập giá bán', 400);
    }
    
    if (!productData.maLoai) {
      throw new ErrorResponse('Vui lòng chọn loại món', 400);
    }

    // Check if category exists
    const category = await this.categoryRepository.findById(productData.maLoai);
    if (!category) {
      throw new ErrorResponse('Loại món không tồn tại', 400);
    }

    // Upload image if provided
    if (imageFile) {
      try {
        const imageId = await uploadService.uploadImage(imageFile);
        productData.anhDD = imageId; // Lưu ID của ảnh từ Firestore
      } catch (error) {
        throw new ErrorResponse(`Lỗi upload ảnh: ${error.message}`, 500);
      }
    }

    // Create product
    const product = await this.productRepository.create(productData);

    return product;
  }

  /**
   * Get all products with filtering, pagination, and sorting
   * @param {Object} queryParams - Query parameters for filtering
   * @param {number} page - Page number
   * @param {number} limit - Results per page
   * @returns {Object} Products and pagination data
   */
  async getAllProducts(queryParams = {}, page = 1, limit = 10) {
    // Calculate pagination
    const skip = (page - 1) * limit;
    
    // Get products
    const products = await this.productRepository.getAll(queryParams, limit, skip);
    
    // Get total count
    const total = await this.productRepository.count(queryParams);
    
    return {
      products,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Get a product by ID
   * @param {string} id - Product ID
   * @returns {Object} Product data
   */
  async getProductById(id) {
    const product = await this.productRepository.findById(id);
    
    if (!product) {
      throw new ErrorResponse('Không tìm thấy sản phẩm', 404);
    }
    
    return product;
  }

  /**
   * Update a product
   * @param {string} id - Product ID
   * @param {Object} updateData - Data to update
   * @returns {Object} Updated product
   */
  async updateProduct(id, updateData) {
    // Check if product exists
    let product = await this.productRepository.findById(id);
    if (!product) {
      throw new ErrorResponse('Không tìm thấy sản phẩm', 404);
    }
    
    // If changing category, check if new category exists
    if (updateData.maLoai) {
      const category = await this.categoryRepository.findById(updateData.maLoai);
      if (!category) {
        throw new ErrorResponse('Loại món không tồn tại', 400);
      }
    }
    
    // Update product
    product = await this.productRepository.update(id, updateData);
    
    return product;
  }

  /**
   * Delete a product
   * @param {string} id - Product ID
   * @returns {Object} Deleted product
   */
  async deleteProduct(id) {
    // Check if product exists
    const product = await this.productRepository.findById(id);
    if (!product) {
      throw new ErrorResponse('Không tìm thấy sản phẩm', 404);
    }
    
    // Delete product
    await this.productRepository.delete(id);
    
    return { id };
  }

  /**
   * Add a rating to a product
   * @param {string} productId - Product ID
   * @param {string} userId - User ID
   * @param {number} rating - Rating (1-5)
   * @param {string} comment - Optional comment
   * @returns {Object} Updated product
   */
  async addRating(productId, userId, rating, comment = '') {
    // Validate rating
    if (rating < 1 || rating > 5) {
      throw new ErrorResponse('Rating must be between 1 and 5', 400);
    }
    
    // Check if product exists
    const product = await this.productRepository.findById(productId);
    if (!product) {
      throw new ErrorResponse('Product not found', 404);
    }
    
    // Add rating
    const ratingData = {
      user: userId,
      rating,
      comment,
      date: new Date(),
    };
    
    const updatedProduct = await this.productRepository.addRating(productId, ratingData);
    
    return updatedProduct;
  }
}

module.exports = ProductService; 