const { ErrorResponse } = require('../middleware/errorHandler');
const { ValidationContext, strategies } = require('../utils/validationStrategies');
const { eventManager, LoggingObserver } = require('../utils/observer');

/**
 * Service class for Order-related business logic
 * Implements the Service Pattern with Observer Pattern for notifications
 */
class OrderService {
  /**
   * Create a new OrderService
   * @param {OrderRepository} orderRepository - The order repository instance
   * @param {ProductRepository} productRepository - The product repository instance
   * @param {UserRepository} userRepository - The user repository instance
   */
  constructor(orderRepository, productRepository, userRepository) {
    this.orderRepository = orderRepository;
    this.productRepository = productRepository;
    this.userRepository = userRepository;
    this.validator = new ValidationContext(strategies.order);
    
    // Đăng ký observer cho log
    this.setupEventListeners();
  }

  /**
   * Thiết lập các event listeners
   */
  setupEventListeners() {
    // Observer để ghi log
    const loggingObserver = new LoggingObserver();
    
    // Đăng ký observer cho các events
    eventManager.subscribe('order.created', loggingObserver);
    eventManager.subscribe('order.updated', loggingObserver);
    eventManager.subscribe('order.statusChanged', loggingObserver);
  }

  /**
   * Create a new order
   * @param {string} userId - User ID
   * @param {Object} orderData - Order data
   * @returns {Object} Created order
   */
  async createOrder(userId, orderData) {
    // Validate input data
    this.validator.setStrategy(strategies.order);
    const { error } = this.validator.validate(orderData);
    if (error) {
      throw new ErrorResponse(error.details[0].message, 400);
    }

    // Check if user exists
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new ErrorResponse('Không tìm thấy người dùng', 404);
    }

    // Calculate total and validate items
    let tongTien = 0;
    const orderItems = [];

    for (const item of orderData.items) {
      const product = await this.productRepository.findById(item.maMon);
      if (!product) {
        throw new ErrorResponse(`Sản phẩm với ID ${item.maMon} không tồn tại`, 404);
      }

      if (item.soLuong > product.soLuongTon) {
        throw new ErrorResponse(`Sản phẩm ${product.tenMon} chỉ còn ${product.soLuongTon} sản phẩm`, 400);
      }

      const thanhTien = product.giaBan * item.soLuong;
      tongTien += thanhTien;

      orderItems.push({
        maMon: product._id,
        tenMon: product.tenMon,
        soLuong: item.soLuong,
        giaBan: product.giaBan,
        thanhTien,
      });

      // Update product quantity
      await this.productRepository.update(product._id, {
        soLuongTon: product.soLuongTon - item.soLuong,
      });
    }

    // Create order
    const order = await this.orderRepository.create({
      maKH: userId,
      items: orderItems.map(item => ({
        product: item.maMon,
        name: item.tenMon,
        quantity: item.soLuong,
        price: item.giaBan
      })),
      shippingAddress: orderData.shippingAddress,
      phoneNumber: orderData.phoneNumber,
      paymentMethod: orderData.paymentMethod,
      notes: orderData.notes,
      totalPrice: tongTien,
      status: 'pending',
      paymentStatus: 'pending'
    });

    // Thông báo order đã được tạo
    eventManager.notify('order.created', {
      orderId: order._id,
      userId: userId,
      totalAmount: tongTien,
      items: orderItems.length
    });

    return order;
  }

  /**
   * Get all orders for a user
   * @param {string} userId - User ID
   * @returns {Array} User orders
   */
  async getUserOrders(userId) {
    return await this.orderRepository.findByUserId(userId);
  }

  /**
   * Get an order by ID
   * @param {string} orderId - Order ID
   * @param {string} userId - User ID (optional, for user-specific access)
   * @returns {Object} Order details
   */
  async getOrderById(orderId, userId = null) {
    const order = await this.orderRepository.findById(orderId);
    if (!order) {
      throw new ErrorResponse('Không tìm thấy đơn hàng', 404);
    }

    // If userId is provided, check if order belongs to user
    if (userId && order.maKH.toString() !== userId) {
      throw new ErrorResponse('Không có quyền truy cập đơn hàng này', 403);
    }

    return order;
  }

  /**
   * Update order status
   * @param {string} orderId - Order ID
   * @param {string} status - New status
   * @returns {Object} Updated order
   */
  async updateOrderStatus(orderId, status) {
    const order = await this.orderRepository.findById(orderId);
    if (!order) {
      throw new ErrorResponse('Không tìm thấy đơn hàng', 404);
    }

    // Update order status
    order.status = status;
    
    // If order is delivered, update product sold quantities
    if (status === 'delivered') {
      for (const item of order.items) {
        await this.productRepository.updateSoldQuantity(item.product, item.quantity);
      }
    }

    await order.save();
    return order;
  }

  /**
   * Get all orders (admin only)
   * @param {number} page - Page number
   * @param {number} limit - Items per page
   * @param {Object} filter - Filter criteria
   * @returns {Object} Orders with pagination
   */
  async getAllOrders(page = 1, limit = 10, filter = {}) {
    const skip = (page - 1) * limit;
    const orders = await this.orderRepository.getAll(filter, limit, skip);
    const total = await this.orderRepository.count(filter);

    return {
      orders,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Cancel an order (only if not delivered and not paid)
   * @param {string} orderId - Order ID
   * @param {string} userId - User ID
   * @returns {Object} Cancelled order
   */
  async cancelOrder(orderId, userId) {
    // Find order
    const order = await this.getOrderById(orderId, userId);
    
    // Check if order can be cancelled
    if (order.tinhTrangGiaoHang || order.daThanhToan) {
      throw new ErrorResponse('Không thể hủy đơn hàng đã thanh toán hoặc đã giao', 400);
    }
    
    // Return items to inventory
    for (const item of order.items) {
      const product = await this.productRepository.findById(item.maMon);
      if (product) {
        await this.productRepository.update(product._id, {
          soLuongTon: product.soLuongTon + item.soLuong,
        });
      }
    }
    
    // Delete order
    await this.orderRepository.delete(orderId);
    
    // Thông báo order đã bị hủy
    eventManager.notify('order.cancelled', {
      orderId: order._id,
      userId: userId,
      items: order.items
    });
    
    return { message: 'Đơn hàng đã được hủy thành công' };
  }
}

module.exports = OrderService; 