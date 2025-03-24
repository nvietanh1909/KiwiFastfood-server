const Joi = require('joi');

/**
 * Lớp cơ sở cho các validation strategy
 * Triển khai Strategy Pattern cho validation
 */
class ValidationStrategy {
  /**
   * Validate dữ liệu đầu vào
   * @param {Object} data - Dữ liệu cần validate
   * @returns {Object} Kết quả validation
   */
  validate(data) {
    const schema = this.createSchema();
    return schema.validate(data);
  }

  /**
   * Tạo schema validation
   * @returns {Joi.Schema} Schema validation
   */
  createSchema() {
    throw new Error('Phương thức createSchema phải được triển khai bởi lớp con');
  }
}

/**
 * Strategy validation cho đăng ký người dùng
 */
class UserRegistrationStrategy extends ValidationStrategy {
  createSchema() {
    return Joi.object({
      hoTen: Joi.string().max(50).required(),
      taiKhoan: Joi.string().max(50).required(),
      matKhau: Joi.string().min(6).required(),
      email: Joi.string().email().required(),
      dienThoaiKH: Joi.string().max(50),
      diaChiKH: Joi.string().max(200),
      ngaySinh: Joi.date(),
      role: Joi.string().valid('user', 'admin'),
    });
  }
}

/**
 * Strategy validation cho đăng nhập
 */
class UserLoginStrategy extends ValidationStrategy {
  createSchema() {
    return Joi.object({
      taiKhoan: Joi.string().required(),
      matKhau: Joi.string().required(),
    });
  }
}

/**
 * Strategy validation cho sản phẩm
 */
class ProductStrategy extends ValidationStrategy {
  createSchema() {
    return Joi.object({
      tenMon: Joi.string().max(100).required(),
      giaBan: Joi.number().min(0).required(),
      noiDung: Joi.string().required(),
      anhDD: Joi.string(),
      soLuongTon: Joi.number().min(0),
      maLoai: Joi.string().required(),
    });
  }
}

/**
 * Strategy validation cho danh mục
 */
class CategoryStrategy extends ValidationStrategy {
  createSchema() {
    return Joi.object({
      tenLoai: Joi.string().max(50).required(),
    });
  }
}

/**
 * Strategy validation cho đơn hàng
 */
class OrderStrategy extends ValidationStrategy {
  createSchema() {
    return Joi.object({
      items: Joi.array().items(
        Joi.object({
          maMon: Joi.string().required(),
          soLuong: Joi.number().integer().min(1).required(),
        })
      ).min(1).required(),
      shippingAddress: Joi.object({
        street: Joi.string().required(),
        city: Joi.string().required(),
        state: Joi.string().required(),
        zipCode: Joi.string().required(),
        country: Joi.string().required()
      }).required(),
      phoneNumber: Joi.string().required(),
      paymentMethod: Joi.string().valid('cash', 'credit_card', 'debit_card', 'online_payment').required(),
      notes: Joi.string().allow('', null)
    });
  }
}

/**
 * Strategy validation cho cập nhật trạng thái đơn hàng
 */
class OrderStatusStrategy extends ValidationStrategy {
  createSchema() {
    return Joi.object({
      tinhTrangGiaoHang: Joi.boolean(),
      daThanhToan: Joi.boolean(),
    }).or('tinhTrangGiaoHang', 'daThanhToan');
  }
}

/**
 * Context class để sử dụng các validation strategy
 */
class ValidationContext {
  /**
   * Constructor
   * @param {ValidationStrategy} strategy - Strategy validation
   */
  constructor(strategy) {
    this.strategy = strategy;
  }

  /**
   * Thay đổi strategy
   * @param {ValidationStrategy} strategy - Strategy mới
   */
  setStrategy(strategy) {
    this.strategy = strategy;
  }

  /**
   * Validate dữ liệu
   * @param {Object} data - Dữ liệu cần validate
   * @returns {Object} Kết quả validation
   */
  validate(data) {
    return this.strategy.validate(data);
  }
}

// Tạo các strategy instances
const strategies = {
  userRegistration: new UserRegistrationStrategy(),
  userLogin: new UserLoginStrategy(),
  product: new ProductStrategy(),
  category: new CategoryStrategy(),
  order: new OrderStrategy(),
  orderStatus: new OrderStatusStrategy(),
};

module.exports = {
  ValidationContext,
  strategies,
}; 