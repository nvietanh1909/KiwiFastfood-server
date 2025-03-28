const { CreateOrderCommand, UpdateOrderStatusCommand, CancelOrderCommand, OrderCommandInvoker } = require('../utils/commands');
const { eventManager, OrderNotificationObserver } = require('../utils/observer');

class OrderFacade {
  /**
   * @param {OrderService} orderService - Order service instance
   * @param {CartService} cartService - Cart service instance
   */
  constructor(orderService, cartService) {
    this.orderService = orderService;
    this.cartService = cartService;
    this.commandInvoker = new OrderCommandInvoker();
    this.setupNotifications();
  }

  /**
   * Thiết lập notifications cho các sự kiện đơn hàng
   */
  setupNotifications() {
    // Email notification observer
    const emailNotification = new OrderNotificationObserver((data) => {
      // Simulated email delivery
      console.log(`[EMAIL] Sending email for ${data.event}:`, data);
    });

    // SMS notification observer
    const smsNotification = new OrderNotificationObserver((data) => {
      // Simulated SMS delivery
      console.log(`[SMS] Sending SMS for ${data.event}:`, data);
    });

    // Đăng ký observers
    eventManager.subscribe('order.created', emailNotification);
    eventManager.subscribe('order.statusChanged', emailNotification);
    eventManager.subscribe('order.cancelled', emailNotification);

    // Chỉ gửi SMS cho một số sự kiện quan trọng
    eventManager.subscribe('order.statusChanged', smsNotification);
  }

  /**
   * Tạo đơn hàng mới với Command Pattern
   * @param {string} userId - User ID
   * @param {Object} orderData - Order data
   * @returns {Object} Created order
   */
  async createOrder(userId, orderData) {
    const command = new CreateOrderCommand(this.orderService, userId, orderData);
    return await this.commandInvoker.executeCommand(command);
  }

  /**
   * Cập nhật trạng thái đơn hàng với Command Pattern
   * @param {string} orderId - Order ID
   * @param {Object} statusData - Status data
   * @returns {Object} Updated order
   */
  async updateOrderStatus(orderId, statusData) {
    const command = new UpdateOrderStatusCommand(this.orderService, orderId, statusData);
    return await this.commandInvoker.executeCommand(command);
  }

  /**
   * Hủy đơn hàng với Command Pattern
   * @param {string} orderId - Order ID
   * @param {string} userId - User ID
   * @returns {Object} Result of cancellation
   */
  async cancelOrder(orderId, userId) {
    const command = new CancelOrderCommand(this.orderService, orderId, userId);
    return await this.commandInvoker.executeCommand(command);
  }

  /**
   * Hoàn tác lệnh đơn hàng gần nhất
   * @returns {Object} Result of undo operation
   */
  async undoLastOperation() {
    return await this.commandInvoker.undoLastCommand();
  }

  /**
   * Xử lý đơn hàng hoàn tất (giao hàng và thanh toán)
   * @param {string} orderId - Order ID
   * @returns {Object} Completed order
   */
  async completeOrder(orderId) {
    // Đánh dấu đã giao hàng và đã thanh toán
    const result = await this.updateOrderStatus(orderId, {
      tinhTrangGiaoHang: true,
      daThanhToan: true
    });

    // Thông báo hoàn tất đơn hàng
    eventManager.notify('order.completed', {
      orderId: orderId,
      completedAt: new Date().toISOString()
    });

    return result;
  }

  /**
   * Lấy thông tin đơn hàng chi tiết
   * @param {string} orderId - Order ID
   * @param {string} userId - User ID (optional)
   * @returns {Object} Order details
   */
  async getOrderDetails(orderId, userId = null) {
    return await this.orderService.getOrderById(orderId, userId);
  }

  /**
   * Lấy danh sách đơn hàng của người dùng
   * @param {string} userId - User ID
   * @returns {Array} User orders
   */
  async getUserOrders(userId) {
    return await this.orderService.getUserOrders(userId);
  }

  /**
   * Tạo đơn hàng mới từ giỏ hàng
   * @param {string} userId - User ID
   * @param {Object} orderData - Order data (shipping, payment info)
   * @returns {Object} Created order
   */
  async createOrderFromCart(userId, orderData) {
    // Xác thực dữ liệu đầu vào
    const { ValidationContext, strategies } = require('../utils/validationStrategies');
    const validator = new ValidationContext(strategies.orderFromCart);
    const { error } = validator.validate(orderData);
    if (error) {
      throw new Error(error.details[0].message);
    }
    
    // Lấy giỏ hàng của người dùng
    const cart = await this.cartService.getCart(userId);
    
    // Kiểm tra giỏ hàng có sản phẩm không
    if (!cart || !cart.items || cart.items.length === 0) {
      throw new Error('Giỏ hàng trống, không thể tạo đơn hàng');
    }

    // Chuyển đổi mục giỏ hàng thành mục đơn hàng
    const orderItems = cart.items.map(item => {
      // Đảm bảo maMon luôn là chuỗi
      const productId = item.product._id || item.product;
      return {
        maMon: productId.toString(), // Chuyển đổi sang chuỗi
        soLuong: item.quantity
      };
    });

    // Tạo dữ liệu đơn hàng
    const completeOrderData = {
      ...orderData,
      items: orderItems
    };

    // Tạo đơn hàng
    const order = await this.createOrder(userId, completeOrderData);

    // Xóa giỏ hàng sau khi đặt hàng thành công
    await this.cartService.clearCart(userId);

    return order;
  }
}

module.exports = OrderFacade; 