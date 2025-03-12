const Category = require('../models/Category');

/**
 * Repository class for Category data operations
 * Implements the Repository Pattern
 */
class CategoryRepository {
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

module.exports = new CategoryRepository(); 