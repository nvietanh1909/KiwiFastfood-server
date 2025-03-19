const Order = require('../models/Order');
const OrderDetail = require('../models/OrderDetail');
const BaseRepository = require('./BaseRepository');

/**
 * Repository class for Order data operations
 * Implements the Repository Pattern and extends BaseRepository
 */
class OrderRepository extends BaseRepository {
  /**
   * Constructor
   */
  constructor() {
    super(Order);
  }

  /**
   * Create a new order
   * @param {Object} orderData - Order data
   * @returns {Promise<Order>} Created order
   */
  async create(orderData) {
    return await this.model.create(orderData);
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
    return await this.model.findById(id).populate('maKH', 'hoTen email dienThoaiKH diaChiKH');
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
   * Find an order by user ID
   * @param {string} userId - User ID
   * @returns {Promise<Order[]>} User's orders
   */
  async findByUserId(userId) {
    return await this.model.find({ maKH: userId })
      .sort({ createdAt: -1 })
      .populate('maKH', 'hoTen email dienThoaiKH diaChiKH');
  }

  /**
   * Find an order by ID with user check for security
   * @param {string} id - Order ID
   * @param {string} userId - User ID for verification
   * @returns {Promise<Order>} Order document
   */
  async findByIdForUser(id, userId) {
    return await this.model.findOne({
      _id: id,
      maKH: userId
    }).populate('maKH', 'hoTen email dienThoaiKH diaChiKH');
  }

  /**
   * Update an order's status
   * @param {string} id - Order ID
   * @param {Object} statusData - Status data (tinhTrangGiaoHang, daThanhToan)
   * @returns {Promise<Order>} Updated order
   */
  async updateStatus(id, statusData) {
    const updateData = { ...statusData };
    
    if (updateData.tinhTrangGiaoHang === true) {
      updateData.ngayGiao = Date.now();
    }
    
    return await this.update(id, updateData);
  }

  /**
   * Get all orders for a user
   * @param {string} userId - User ID
   * @param {number} limit - Number of orders to return
   * @param {number} skip - Number of orders to skip
   * @returns {Promise<Order[]>} Array of orders
   */
  async getAllForUser(userId, limit = 10, skip = 0) {
    return await this.model.find({ maKH: userId })
      .sort({ createdAt: -1 })
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
    const query = this.buildFilterQuery(filters);
    
    return await this.model.find(query)
      .populate('maKH', 'hoTen email dienThoaiKH diaChiKH')
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip(skip);
  }

  /**
   * Count total orders with filters
   * @param {Object} filters - Filter criteria
   * @returns {Promise<number>} Total count
   */
  async count(filters = {}) {
    const query = this.buildFilterQuery(filters);
    return await this.model.countDocuments(query);
  }

  /**
   * Build filter query from filter criteria
   * @param {Object} filters - Filter criteria
   * @returns {Object} MongoDB query object
   */
  buildFilterQuery(filters) {
    const query = {};
    
    if (filters.tinhTrangGiaoHang !== undefined) {
      query.tinhTrangGiaoHang = filters.tinhTrangGiaoHang === 'true' || filters.tinhTrangGiaoHang === true;
    }
    
    if (filters.daThanhToan !== undefined) {
      query.daThanhToan = filters.daThanhToan === 'true' || filters.daThanhToan === true;
    }
    
    if (filters.startDate || filters.endDate) {
      query.createdAt = {};
      
      if (filters.startDate) {
        query.createdAt.$gte = new Date(filters.startDate);
      }
      
      if (filters.endDate) {
        query.createdAt.$lte = new Date(filters.endDate);
      }
    }
    
    if (filters.maKH) {
      query.maKH = filters.maKH;
    }
    
    return query;
  }

  /**
   * Delete an order
   * @param {string} id - Order ID
   * @returns {Promise<Order>} Deleted order
   */
  async delete(id) {
    // Delete order details first if they exist
    await OrderDetail.deleteMany({ maDonHang: id });
    
    // Then delete the order using the parent's method
    return await super.delete(id);
  }

  /**
   * Hook to execute before create operation
   * @param {Object} data - Order data
   * @returns {Object} Processed order data
   */
  beforeCreate(data) {
    // Set createdAt if not present
    if (!data.createdAt) {
      data.createdAt = new Date();
    }
    return data;
  }

  /**
   * Hook to execute after update operation
   * @param {Object} entity - Updated entity
   * @returns {Object} Processed entity
   */
  afterUpdate(entity) {
    // Add any post-update processing here if needed
    return entity;
  }
}

// Export class instead of singleton instance
module.exports = OrderRepository; 