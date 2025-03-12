const OrderRepository = require('../repositories/OrderRepository');
const ProductRepository = require('../repositories/ProductRepository');
const CartRepository = require('../repositories/CartRepository');
const UserRepository = require('../repositories/UserRepository');
const { ErrorResponse } = require('../middleware/errorHandler');

/**
 * Service class for Order-related business logic
 * Implements the Service Pattern
 */
class OrderService {
  /**
   * Create a new order
   * @param {string} userId - User ID
   * @param {Array} items - Order items array
   * @returns {Object} Created order with details
   */
  async createOrder(userId, items) {
    // Check if user exists
    const user = await UserRepository.findById(userId);
    if (!user) {
      throw new ErrorResponse('Không tìm thấy người dùng', 404);
    }

    // Validate items
    if (!items || !Array.isArray(items) || items.length === 0) {
      throw new ErrorResponse('Đơn hàng phải có ít nhất một sản phẩm', 400);
    }

    // Create order
    const order = await OrderRepository.create({
      maKH: userId,
      ngayDat: new Date(),
      daThanhToan: false,
      tinhTrangGiaoHang: false
    });
    
    // Prepare order details and check product availability
    const orderDetailsData = [];
    
    for (const item of items) {
      const product = await ProductRepository.findById(item.maMon);
      
      if (!product) {
        throw new ErrorResponse(`Không tìm thấy sản phẩm với ID: ${item.maMon}`, 404);
      }
      
      if (product.soLuongTon < item.soLuong) {
        throw new ErrorResponse(`Sản phẩm ${product.tenMon} không đủ số lượng trong kho`, 400);
      }
      
      // Add to order details
      orderDetailsData.push({
        maDonHang: order._id,
        maMon: product._id,
        soLuong: item.soLuong,
        donGia: product.giaBan
      });
      
      // Update product stock
      await ProductRepository.update(product._id, {
        soLuongTon: product.soLuongTon - item.soLuong
      });
    }
    
    // Create order details
    await OrderRepository.createOrderDetails(orderDetailsData);
    
    // Clear the cart (if using cart)
    try {
      await CartRepository.clearCart(userId);
    } catch (error) {
      // Ignore if cart not found
    }
    
    // Return order with details
    const orderDetails = await OrderRepository.getOrderDetails(order._id);
    
    return {
      order,
      orderDetails
    };
  }

  /**
   * Get order by ID
   * @param {string} orderId - Order ID
   * @param {string} userId - User ID for verification
   * @param {boolean} isAdmin - Whether the requester is an admin
   * @returns {Object} Order with details
   */
  async getOrderById(orderId, userId, isAdmin = false) {
    let order;
    
    if (isAdmin) {
      // Admins can see any order
      order = await OrderRepository.findById(orderId);
    } else {
      // Regular users can only see their own orders
      order = await OrderRepository.findByIdForUser(orderId, userId);
    }
    
    if (!order) {
      throw new ErrorResponse('Không tìm thấy đơn hàng', 404);
    }
    
    // Get order details
    const orderDetails = await OrderRepository.getOrderDetails(orderId);
    
    return {
      order,
      orderDetails
    };
  }

  /**
   * Get all orders for a user
   * @param {string} userId - User ID
   * @param {number} page - Page number
   * @param {number} limit - Results per page
   * @returns {Object} Orders and pagination data
   */
  async getUserOrders(userId, page = 1, limit = 10) {
    // Calculate pagination
    const skip = (page - 1) * limit;
    
    // Get orders
    const orders = await OrderRepository.getAllForUser(userId, limit, skip);
    
    // Get total count
    const total = await OrderRepository.count({ maKH: userId });
    
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
   * Update order status (admin only)
   * @param {string} orderId - Order ID
   * @param {boolean} tinhTrangGiaoHang - New delivery status
   * @param {boolean} daThanhToan - New payment status
   * @returns {Object} Updated order
   */
  async updateOrderStatus(orderId, tinhTrangGiaoHang, daThanhToan) {
    // Check if order exists
    const order = await OrderRepository.findById(orderId);
    if (!order) {
      throw new ErrorResponse('Không tìm thấy đơn hàng', 404);
    }
    
    // Update order status
    const updatedOrder = await OrderRepository.updateStatus(orderId, tinhTrangGiaoHang, daThanhToan);
    
    // Get order details
    const orderDetails = await OrderRepository.getOrderDetails(orderId);
    
    return {
      order: updatedOrder,
      orderDetails
    };
  }

  /**
   * Get all orders (admin)
   * @param {Object} filters - Filter criteria
   * @param {number} page - Page number
   * @param {number} limit - Results per page
   * @returns {Object} Orders and pagination data
   */
  async getAllOrders(filters = {}, page = 1, limit = 20) {
    // Calculate pagination
    const skip = (page - 1) * limit;
    
    // Get orders
    const orders = await OrderRepository.getAll(filters, limit, skip);
    
    // Get total count
    const total = await OrderRepository.count(filters);
    
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
}

module.exports = new OrderService(); 