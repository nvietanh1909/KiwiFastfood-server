const CategoryRepository = require('../repositories/CategoryRepository');
const ProductRepository = require('../repositories/ProductRepository');
const { ErrorResponse } = require('../middleware/errorHandler');

// Initialize repositories
const categoryRepository = new CategoryRepository();
const productRepository = new ProductRepository();

/**
 * Service class for Category-related business logic
 * Implements the Service Pattern
 */
class CategoryService {
  /**
   * Create a new category
   * @param {Object} categoryData - Category data
   * @returns {Object} Created category
   */
  async createCategory(categoryData) {
    // Validate input data
    if (!categoryData.tenLoai) {
      throw new ErrorResponse('Vui lòng nhập tên loại', 400);
    }

    // Create category
    const category = await categoryRepository.create(categoryData);

    return category;
  }

  /**
   * Get all categories
   * @returns {Object} Categories
   */
  async getAllCategories() {
    const categories = await categoryRepository.getAll();
    return categories;
  }

  /**
   * Get a category by ID
   * @param {string} id - Category ID
   * @returns {Object} Category data
   */
  async getCategoryById(id) {
    const category = await categoryRepository.findById(id);
    
    if (!category) {
      throw new ErrorResponse('Không tìm thấy loại', 404);
    }
    
    return category;
  }

  /**
   * Update a category
   * @param {string} id - Category ID
   * @param {Object} updateData - Data to update
   * @returns {Object} Updated category
   */
  async updateCategory(id, updateData) {
    // Validate input data
    if (updateData.tenLoai && updateData.tenLoai.trim() === '') {
      throw new ErrorResponse('Tên loại không được để trống', 400);
    }
    
    // Check if category exists
    let category = await categoryRepository.findById(id);
    if (!category) {
      throw new ErrorResponse('Không tìm thấy loại', 404);
    }
    
    // Update category
    category = await categoryRepository.update(id, updateData);
    
    return category;
  }

  /**
   * Delete a category
   * @param {string} id - Category ID
   * @returns {Object} Deleted category
   */
  async deleteCategory(id) {
    // Check if category exists
    const category = await categoryRepository.findById(id);
    if (!category) {
      throw new ErrorResponse('Không tìm thấy loại', 404);
    }
    
    // Check if there are products using this category
    const products = await productRepository.getByCategory(id);
    if (products.length > 0) {
      throw new ErrorResponse('Không thể xóa loại này vì đang có sản phẩm thuộc loại này', 400);
    }
    
    // Delete category
    await categoryRepository.delete(id);
    
    return { id };
  }

  /**
   * Get products by category
   * @param {string} categoryId - Category ID
   * @returns {Object} Products
   */
  async getProductsByCategory(categoryId) {
    // Check if category exists
    const category = await categoryRepository.findById(categoryId);
    if (!category) {
      throw new ErrorResponse('Không tìm thấy loại', 404);
    }
    
    // Get products
    const products = await productRepository.getByCategory(categoryId);
    
    return {
      category,
      products
    };
  }
}

module.exports = new CategoryService(); 