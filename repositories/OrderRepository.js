const Order = require('../models/Order');
const OrderDetail = require('../models/OrderDetail');

/**
 * Repository class for Order data operations
 * Implements the Repository Pattern
 */
class OrderRepository {
  /**
   * Create a new order
   * @param {Object} orderData - Order data
   * @returns {Promise<Order>} Created order
   */
  async create(orderData) {
    return await Order.create(orderData);
  }

  /**
   * Create order details
   * @param {Array} orderDetailsData - Order details data
   * @returns {Promise<OrderDetail[]>} Created order details
   */
  async createOrderDetails(orderDetailsData) {
    return await OrderDetail.insertMany(orderDetailsData);
  }

  /**
   * Find an order by ID
   * @param {string} id - Order ID
   * @returns {Promise<Order>} Order document
   */
  async findById(id) {
    return await Order.findById(id).populate('maKH', 'hoTen email dienThoaiKH diaChiKH');
  }

  /**
   * Get order details
   * @param {string} orderId - Order ID
   * @returns {Promise<OrderDetail[]>} Array of order details
   */
  async getOrderDetails(orderId) {
    return await OrderDetail.find({ maDonHang: orderId }).populate('maMon');
  }

  /**
   * Find an order by ID with user check for security
   * @param {string} id - Order ID
   * @param {string} userId - User ID for verification
   * @returns {Promise<Order>} Order document
   */
  async findByIdForUser(id, userId) {
    return await Order.findOne({
      _id: id,
      maKH: userId
    }).populate('maKH', 'hoTen email dienThoaiKH diaChiKH');
  }

  /**
   * Update an order's status
   * @param {string} id - Order ID
   * @param {boolean} tinhTrangGiaoHang - New delivery status
   * @param {boolean} daThanhToan - New payment status
   * @returns {Promise<Order>} Updated order
   */
  async updateStatus(id, tinhTrangGiaoHang, daThanhToan) {
    const updateData = {};
    
    if (tinhTrangGiaoHang !== undefined) {
      updateData.tinhTrangGiaoHang = tinhTrangGiaoHang;
    }
    
    if (daThanhToan !== undefined) {
      updateData.daThanhToan = daThanhToan;
    }
    
    if (tinhTrangGiaoHang === true) {
      updateData.ngayGiao = Date.now();
    }
    
    return await Order.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    ).populate('maKH', 'hoTen email dienThoaiKH diaChiKH');
  }

  /**
   * Get all orders for a user
   * @param {string} userId - User ID
   * @param {number} limit - Number of orders to return
   * @param {number} skip - Number of orders to skip
   * @returns {Promise<Order[]>} Array of orders
   */
  async getAllForUser(userId, limit = 10, skip = 0) {
    return await Order.find({ maKH: userId })
      .sort({ ngayDat: -1 })
      .limit(limit)
      .skip(skip)
      .populate('maKH', 'hoTen email dienThoaiKH diaChiKH');
  }

  /**
   * Get all orders (admin)
   * @param {Object} filters - Filter criteria
   * @param {number} limit - Number of orders to return
   * @param {number} skip - Number of orders to skip
   * @returns {Promise<Order[]>} Array of orders
   */
  async getAll(filters = {}, limit = 20, skip = 0) {
    const query = {};
    
    // Apply delivery status filter if provided
    if (filters.tinhTrangGiaoHang !== undefined) {
      query.tinhTrangGiaoHang = filters.tinhTrangGiaoHang === 'true';
    }
    
    // Apply payment status filter if provided
    if (filters.daThanhToan !== undefined) {
      query.daThanhToan = filters.daThanhToan === 'true';
    }
    
    // Apply date range filter if provided
    if (filters.startDate || filters.endDate) {
      query.ngayDat = {};
      
      if (filters.startDate) {
        query.ngayDat.$gte = new Date(filters.startDate);
      }
      
      if (filters.endDate) {
        query.ngayDat.$lte = new Date(filters.endDate);
      }
    }
    
    // Apply user filter if provided
    if (filters.maKH) {
      query.maKH = filters.maKH;
    }
    
    return await Order.find(query)
      .populate('maKH', 'hoTen email dienThoaiKH diaChiKH')
      .sort({ ngayDat: -1 })
      .limit(limit)
      .skip(skip);
  }

  /**
   * Count total orders with filters
   * @param {Object} filters - Filter criteria
   * @returns {Promise<number>} Total count
   */
  async count(filters = {}) {
    const query = {};
    
    if (filters.tinhTrangGiaoHang !== undefined) {
      query.tinhTrangGiaoHang = filters.tinhTrangGiaoHang === 'true';
    }
    
    if (filters.daThanhToan !== undefined) {
      query.daThanhToan = filters.daThanhToan === 'true';
    }
    
    if (filters.startDate || filters.endDate) {
      query.ngayDat = {};
      
      if (filters.startDate) {
        query.ngayDat.$gte = new Date(filters.startDate);
      }
      
      if (filters.endDate) {
        query.ngayDat.$lte = new Date(filters.endDate);
      }
    }
    
    if (filters.maKH) {
      query.maKH = filters.maKH;
    }
    
    return await Order.countDocuments(query);
  }

  /**
   * Delete an order (rarely used, mainly for admin cleanup)
   * @param {string} id - Order ID
   * @returns {Promise<Order>} Deleted order
   */
  async delete(id) {
    // Delete order details first
    await OrderDetail.deleteMany({ maDonHang: id });
    
    // Then delete the order
    return await Order.findByIdAndDelete(id);
  }
}

module.exports = new OrderRepository(); 