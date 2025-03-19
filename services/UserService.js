const { ErrorResponse } = require('../middleware/errorHandler');
const { ValidationContext, strategies } = require('../utils/validationStrategies');

/**
 * Service class for User-related business logic
 * Implements the Service Pattern
 */
class UserService {
  /**
   * Create a new UserService
   * @param {UserRepository} userRepository - The user repository instance
   */
  constructor(userRepository) {
    this.userRepository = userRepository;
    this.validator = new ValidationContext(strategies.userRegistration);
  }

  /**
   * Register a new user
   * @param {Object} userData - User registration data
   * @returns {Object} User data and JWT token
   */
  async register(userData) {
    // Validate input data using Strategy Pattern
    this.validator.setStrategy(strategies.userRegistration);
    const { error } = this.validator.validate(userData);
    if (error) {
      throw new ErrorResponse(error.details[0].message, 400);
    }

    // Check if user already exists with the same taiKhoan
    const existingUserByUsername = await this.userRepository.findByUsername(userData.taiKhoan);
    if (existingUserByUsername) {
      throw new ErrorResponse('Tài khoản đã được sử dụng', 400);
    }

    // Check if user already exists with the same email
    const existingUserByEmail = await this.userRepository.findByEmail(userData.email);
    if (existingUserByEmail) {
      throw new ErrorResponse('Email đã được sử dụng', 400);
    }

    // Create new user
    const user = await this.userRepository.create(userData);

    // Generate JWT token
    const token = user.getSignedJwtToken();

    return {
      user: {
        id: user._id,
        hoTen: user.hoTen,
        taiKhoan: user.taiKhoan,
        email: user.email,
        role: user.role,
      },
      token,
    };
  }

  /**
   * Login a user
   * @param {string} taiKhoan - Username
   * @param {string} matKhau - Password
   * @returns {Object} User data and JWT token
   */
  async login(taiKhoan, matKhau) {
    // Validate input data using Strategy Pattern
    this.validator.setStrategy(strategies.userLogin);
    const { error } = this.validator.validate({ taiKhoan, matKhau });
    if (error) {
      throw new ErrorResponse(error.details[0].message, 400);
    }

    // Check if user exists by username
    let user = await this.userRepository.findByUsername(taiKhoan, true);
    
    // If not found by username, try email
    if (!user) {
      user = await this.userRepository.findByEmail(taiKhoan, true);
    }
    
    // If still not found, return error
    if (!user) {
      throw new ErrorResponse('Thông tin đăng nhập không chính xác', 401);
    }

    // Check if password matches
    const isMatch = await user.matchPassword(matKhau);
    if (!isMatch) {
      throw new ErrorResponse('Thông tin đăng nhập không chính xác', 401);
    }

    // Generate JWT token
    const token = user.getSignedJwtToken();

    return {
      user: {
        id: user._id,
        hoTen: user.hoTen,
        taiKhoan: user.taiKhoan,
        email: user.email,
        role: user.role,
      },
      token,
    };
  }

  /**
   * Get user profile
   * @param {string} userId - User ID
   * @returns {Object} User profile data
   */
  async getUserProfile(userId) {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new ErrorResponse('Không tìm thấy người dùng', 404);
    }

    return {
      id: user._id,
      hoTen: user.hoTen,
      taiKhoan: user.taiKhoan,
      email: user.email,
      dienThoaiKH: user.dienThoaiKH,
      diaChiKH: user.diaChiKH,
      ngaySinh: user.ngaySinh,
      role: user.role,
      createdAt: user.createdAt,
    };
  }

  /**
   * Update user profile
   * @param {string} userId - User ID
   * @param {Object} updateData - Data to update
   * @returns {Object} Updated user profile
   */
  async updateProfile(userId, updateData) {
    // Make sure password is not being updated here
    if (updateData.matKhau) {
      throw new ErrorResponse('Không thể cập nhật mật khẩu qua route này', 400);
    }

    // Find and update the user
    const user = await this.userRepository.update(userId, updateData);
    if (!user) {
      throw new ErrorResponse('Không tìm thấy người dùng', 404);
    }

    return {
      id: user._id,
      hoTen: user.hoTen,
      taiKhoan: user.taiKhoan,
      email: user.email,
      dienThoaiKH: user.dienThoaiKH,
      diaChiKH: user.diaChiKH,
      ngaySinh: user.ngaySinh,
      role: user.role,
    };
  }

  /**
   * Change user password
   * @param {string} userId - User ID
   * @param {string} currentPassword - Current password
   * @param {string} newPassword - New password
   * @returns {Object} Success message
   */
  async changePassword(userId, currentPassword, newPassword) {
    // Get user with password
    const user = await this.userRepository.findById(userId).select('+matKhau');
    if (!user) {
      throw new ErrorResponse('Không tìm thấy người dùng', 404);
    }

    // Check if current password matches
    const isMatch = await user.matchPassword(currentPassword);
    if (!isMatch) {
      throw new ErrorResponse('Mật khẩu hiện tại không chính xác', 401);
    }

    // Validate new password
    if (!newPassword || newPassword.length < 6) {
      throw new ErrorResponse('Mật khẩu mới phải có ít nhất 6 ký tự', 400);
    }

    // Update password
    user.matKhau = newPassword;
    await user.save();

    return {
      message: 'Mật khẩu đã được cập nhật',
    };
  }

  /**
   * Get all users (admin)
   * @param {number} page - Page number
   * @param {number} limit - Results per page
   * @returns {Object} Users and pagination data
   */
  async getAllUsers(page = 1, limit = 10) {
    // Calculate pagination
    const skip = (page - 1) * limit;
    
    // Get users
    const users = await this.userRepository.getAll({}, limit, skip);
    
    // Get total count
    const total = await this.userRepository.count();
    
    return {
      users: users.map(user => ({
        id: user._id,
        hoTen: user.hoTen,
        taiKhoan: user.taiKhoan,
        email: user.email,
        dienThoaiKH: user.dienThoaiKH,
        diaChiKH: user.diaChiKH,
        ngaySinh: user.ngaySinh,
        role: user.role,
        createdAt: user.createdAt,
      })),
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }
}

// Export the class instead of a singleton instance
module.exports = UserService; 