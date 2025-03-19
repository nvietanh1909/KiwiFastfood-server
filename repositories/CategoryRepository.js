const Category = require('../models/Category');
const BaseRepository = require('./BaseRepository');

/**
 * Repository class for Category data operations
 * Implements the Repository Pattern and extends BaseRepository
 */
class CategoryRepository extends BaseRepository {
  /**
   * Constructor
   */
  constructor() {
    super(Category);
  }

  /**
   * Find a category by name
   * @param {string} tenLoai - Category name
   * @returns {Promise<Category>} Category document
   */
  async findByName(tenLoai) {
    return await this.model.findOne({ tenLoai: tenLoai });
  }

  /**
   * Hook to execute before create operation
   * @param {Object} data - Category data
   * @returns {Object} Processed category data
   */
  beforeCreate(data) {
    // Nếu có chuyển đổi dữ liệu trước khi tạo ở đây
    return data;
  }

  /**
   * Create a new category
   * @param {Object} categoryData - Category data
   * @returns {Promise<Category>} Created category
   */
  async create(categoryData) {
    return await Category.create(categoryData);
  }

  /**
   * Find a category by ID
   * @param {string} id - Category ID
   * @returns {Promise<Category>} Category document
   */
  async findById(id) {
    return await Category.findById(id);
  }

  /**
   * Update a category
   * @param {string} id - Category ID
   * @param {Object} updateData - Data to update
   * @returns {Promise<Category>} Updated category
   */
  async update(id, updateData) {
    return await Category.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true
    });
  }

  /**
   * Delete a category
   * @param {string} id - Category ID
   * @returns {Promise<Category>} Deleted category
   */
  async delete(id) {
    return await Category.findByIdAndDelete(id);
  }

  /**
   * Get all categories
   * @returns {Promise<Category[]>} Array of categories
   */
  async getAll() {
    return await Category.find().sort({ tenLoai: 1 });
  }

  /**
   * Count total categories
   * @returns {Promise<number>} Total count
   */
  async count() {
    return await Category.countDocuments();
  }
}

// Export class
module.exports = CategoryRepository; 