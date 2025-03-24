const Joi = require('joi');

/**
 * Validator utility class for validating request data
 */
class Validator {
  /**
   * Validate user registration data
   * @param {Object} data - User registration data
   * @returns {Object} Validation result
   */
  static validateUserRegistration(data) {
    const schema = Joi.object({
      hoTen: Joi.string().max(50).required(),
      taiKhoan: Joi.string().max(50).required(),
      matKhau: Joi.string().min(6).required(),
      email: Joi.string().email().required(),
      dienThoaiKH: Joi.string().max(50),
      diaChiKH: Joi.string().max(200),
      ngaySinh: Joi.date(),
      role: Joi.string().valid('user', 'admin'),
    });

    return schema.validate(data);
  }

  /**
   * Validate user login data
   * @param {Object} data - User login data
   * @returns {Object} Validation result
   */
  static validateUserLogin(data) {
    const schema = Joi.object({
      taiKhoan: Joi.string().required(),
      matKhau: Joi.string().required(),
    });

    return schema.validate(data);
  }

  /**
   * Validate product creation data
   * @param {Object} data - Product data
   * @returns {Object} Validation result
   */
  static validateProduct(data) {
    const schema = Joi.object({
      tenMon: Joi.string().max(100).required(),
      giaBan: Joi.number().min(0).required(),
      noiDung: Joi.string().required(),
      anhDD: Joi.string(),
      soLuongTon: Joi.number().min(0),
      maLoai: Joi.string().required(),
    });

    return schema.validate(data);
  }

  /**
   * Validate category data
   * @param {Object} data - Category data
   * @returns {Object} Validation result
   */
  static validateCategory(data) {
    const schema = Joi.object({
      tenLoai: Joi.string().max(50).required(),
    });

    return schema.validate(data);
  }

  /**
   * Validate order data
   * @param {Object} data - Order data
   * @returns {Object} Validation result
   */
  static validateOrder(data) {
    const schema = Joi.object({
      items: Joi.array().items(
        Joi.object({
          maMon: Joi.string().required(),
          soLuong: Joi.number().integer().min(1).required(),
        })
      ).min(1).required(),
    });

    return schema.validate(data);
  }

  /**
   * Validate order status update
   * @param {Object} data - Order status data
   * @returns {Object} Validation result
   */
  static validateOrderStatus(data) {
    const schema = Joi.object({
      tinhTrangGiaoHang: Joi.boolean(),
      daThanhToan: Joi.boolean(),
    }).or('tinhTrangGiaoHang', 'daThanhToan');

    return schema.validate(data);
  }

  /**
   * Validate cart item data
   * @param {Object} data - Cart item data
   * @returns {Object} Validation result
   */
  static validateCartItem(data) {
    const schema = Joi.object({
      product: Joi.string().required(),
      quantity: Joi.number().integer().min(1).required()
    });

    return schema.validate(data);
  }
}

module.exports = Validator; 