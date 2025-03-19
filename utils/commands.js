/**
 * Interface cho Command Pattern
 */
class Command {
  execute() {
    throw new Error('Phương thức execute phải được triển khai bởi lớp con');
  }

  undo() {
    throw new Error('Phương thức undo phải được triển khai bởi lớp con');
  }
}

/**
 * Command để tạo đơn hàng mới
 */
class CreateOrderCommand extends Command {
  /**
   * @param {OrderService} orderService - Order service instance
   * @param {string} userId - User ID
   * @param {Object} orderData - Order data
   */
  constructor(orderService, userId, orderData) {
    super();
    this.orderService = orderService;
    this.userId = userId;
    this.orderData = orderData;
    this.createdOrder = null;
  }

  /**
   * Thực thi lệnh tạo đơn hàng
   * @returns {Object} Created order
   */
  async execute() {
    this.createdOrder = await this.orderService.createOrder(this.userId, this.orderData);
    return this.createdOrder;
  }

  /**
   * Hoàn tác lệnh tạo đơn hàng
   * @returns {Object} Result of cancellation
   */
  async undo() {
    if (!this.createdOrder) {
      throw new Error('Không thể hoàn tác lệnh tạo đơn hàng chưa được thực thi');
    }
    return await this.orderService.cancelOrder(this.createdOrder._id, this.userId);
  }
}

/**
 * Command để cập nhật trạng thái đơn hàng
 */
class UpdateOrderStatusCommand extends Command {
  /**
   * @param {OrderService} orderService - Order service instance
   * @param {string} orderId - Order ID
   * @param {Object} statusData - Status data
   */
  constructor(orderService, orderId, statusData) {
    super();
    this.orderService = orderService;
    this.orderId = orderId;
    this.statusData = statusData;
    this.previousStatus = null;
    this.updatedOrder = null;
  }

  /**
   * Thực thi lệnh cập nhật trạng thái
   * @returns {Object} Updated order
   */
  async execute() {
    // Lưu trạng thái trước khi cập nhật
    const order = await this.orderService.getOrderById(this.orderId);
    this.previousStatus = {
      tinhTrangGiaoHang: order.tinhTrangGiaoHang,
      daThanhToan: order.daThanhToan
    };

    // Cập nhật trạng thái
    this.updatedOrder = await this.orderService.updateOrderStatus(this.orderId, this.statusData);
    return this.updatedOrder;
  }

  /**
   * Hoàn tác lệnh cập nhật trạng thái
   * @returns {Object} Order with previous status
   */
  async undo() {
    if (!this.previousStatus) {
      throw new Error('Không thể hoàn tác lệnh cập nhật trạng thái chưa được thực thi');
    }
    return await this.orderService.updateOrderStatus(this.orderId, this.previousStatus);
  }
}

/**
 * Command để hủy đơn hàng
 */
class CancelOrderCommand extends Command {
  /**
   * @param {OrderService} orderService - Order service instance
   * @param {string} orderId - Order ID
   * @param {string} userId - User ID
   */
  constructor(orderService, orderId, userId) {
    super();
    this.orderService = orderService;
    this.orderId = orderId;
    this.userId = userId;
    this.orderBeforeCancellation = null;
  }

  /**
   * Thực thi lệnh hủy đơn hàng
   * @returns {Object} Result of cancellation
   */
  async execute() {
    // Lưu đơn hàng trước khi hủy
    this.orderBeforeCancellation = await this.orderService.getOrderById(this.orderId, this.userId);
    return await this.orderService.cancelOrder(this.orderId, this.userId);
  }

  /**
   * Hoàn tác lệnh hủy đơn hàng (khôi phục đơn hàng)
   * @returns {string} Message
   */
  async undo() {
    if (!this.orderBeforeCancellation) {
      throw new Error('Không thể hoàn tác lệnh hủy đơn hàng chưa được thực thi');
    }

    // Không thực sự hoàn tác được (đơn hàng đã bị xóa), 
    // nhưng có thể tạo lại một đơn hàng mới với dữ liệu tương tự
    return 'Không thể hoàn tác việc hủy đơn hàng. Vui lòng tạo đơn hàng mới.';
  }
}

/**
 * Invoker class để thực thi các lệnh
 */
class OrderCommandInvoker {
  constructor() {
    this.commandHistory = [];
  }

  /**
   * Thực thi một lệnh
   * @param {Command} command - Command to execute
   * @returns {Object} Result of command execution
   */
  async executeCommand(command) {
    const result = await command.execute();
    this.commandHistory.push(command);
    return result;
  }

  /**
   * Hoàn tác lệnh gần nhất
   * @returns {Object} Result of undo operation
   */
  async undoLastCommand() {
    if (this.commandHistory.length === 0) {
      throw new Error('Không có lệnh nào để hoàn tác');
    }
    
    const command = this.commandHistory.pop();
    return await command.undo();
  }
}

module.exports = {
  CreateOrderCommand,
  UpdateOrderStatusCommand,
  CancelOrderCommand,
  OrderCommandInvoker
}; 