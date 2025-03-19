const User = require('../models/User');
const BaseRepository = require('./BaseRepository');

/**
 * Repository class for User data operations
 * Implements the Repository Pattern and extends BaseRepository
 */
class UserRepository extends BaseRepository {
  /**
   * Constructor
   */
  constructor() {
    super(User);
  }

  /**
   * Create a new user
   * @param {Object} userData - User data
   * @returns {Promise<User>} Created user
   */
  async create(userData) {
    return await User.create(userData);
  }

  /**
   * Find a user by ID
   * @param {string} id - User ID
   * @returns {Promise<User>} User document
   */
  async findById(id) {
    return await User.findById(id);
  }

  /**
   * Find a user by username
   * @param {string} taiKhoan - Username
   * @param {boolean} includePassword - Whether to include password field
   * @returns {Promise<User>} User document
   */
  async findByUsername(taiKhoan, includePassword = false) {
    if (includePassword) {
      return await this.model.findOne({ taiKhoan }).select('+matKhau');
    }
    return await this.model.findOne({ taiKhoan });
  }

  /**
   * Find a user by email
   * @param {string} email - User email
   * @param {boolean} includePassword - Whether to include password field
   * @returns {Promise<User>} User document
   */
  async findByEmail(email, includePassword = false) {
    if (includePassword) {
      return await this.model.findOne({ email }).select('+matKhau');
    }
    return await this.model.findOne({ email });
  }

  /**
   * Update a user's details
   * @param {string} id - User ID
   * @param {Object} updateData - Data to update
   * @returns {Promise<User>} Updated user
   */
  async update(id, updateData) {
    return await User.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true
    });
  }

  /**
   * Delete a user
   * @param {string} id - User ID
   * @returns {Promise<User>} Deleted user
   */
  async delete(id) {
    return await User.findByIdAndDelete(id);
  }

  /**
   * Get all users (for admin purposes)
   * @param {Object} filter - Filter criteria
   * @param {number} limit - Number of users to return
   * @param {number} skip - Number of users to skip
   * @returns {Promise<User[]>} Array of users
   */
  async getAll(filter = {}, limit = 10, skip = 0) {
    const query = { ...filter };
    
    return await User.find(query)
      .limit(limit)
      .skip(skip)
      .sort({ createdAt: -1 });
  }

  /**
   * Count total users
   * @param {Object} filter - Filter criteria
   * @returns {Promise<number>} Total count
   */
  async count(filter = {}) {
    const query = { ...filter };
    return await User.countDocuments(query);
  }

  /**
   * Hook to execute before create operation
   * @param {Object} data - User data
   * @returns {Object} Processed user data
   */
  beforeCreate(data) {
    // Ví dụ: đảm bảo email luôn là lowercase
    if (data.email) {
      data.email = data.email.toLowerCase();
    }
    return data;
  }

  /**
   * Hook to execute before update operation
   * @param {string} id - User ID
   * @param {Object} data - Data to update
   * @returns {Object} Processed update data
   */
  beforeUpdate(id, data) {
    // Ví dụ: đảm bảo email luôn là lowercase khi cập nhật
    if (data.email) {
      data.email = data.email.toLowerCase();
    }
    return data;
  }
}

// Export class
module.exports = UserRepository; 