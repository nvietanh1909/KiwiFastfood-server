const express = require('express');
const { protect, authorize } = require('../middleware/auth');
const { errorHandler } = require('../middleware/errorHandler');
const container = require('../config/dependencyContainer');
const OrderService = container.resolve('orderService');
const UserService = container.resolve('userService');

const router = express.Router();

// All admin routes require authentication and admin role
router.use(protect);
router.use(authorize('admin'));

/**
 * @route   GET /api/admin/orders
 * @desc    Get all orders (admin)
 * @access  Private/Admin
 */ 
router.get('/orders', async (req, res) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 20;
    
    // Extract filters from query
    const filters = {
      tinhTrangGiaoHang: req.query.tinhTrangGiaoHang,
      daThanhToan: req.query.daThanhToan,
      startDate: req.query.startDate,
      endDate: req.query.endDate,
      maKH: req.query.maKH,
    };
    
    const result = await OrderService.getAllOrders(filters, page, limit);
    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    errorHandler(error, req, res);
  }
});

/**
 * @route   GET /api/admin/users
 * @desc    Get all users
 * @access  Private/Admin
 */
router.get('/users', async (req, res) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    
    const result = await UserService.getAllUsers(page, limit);
    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    errorHandler(error, req, res);
  }
});

/**
 * @route   GET /api/admin/users/:id
 * @desc    Get user by ID
 * @access  Private/Admin
 */
router.get('/users/:id', async (req, res) => {
  try {
    const result = await UserService.getUserProfile(req.params.id);
    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    errorHandler(error, req, res);
  }
});

/**
 * @route   PUT /api/admin/users/:id
 * @desc    Update user information
 * @access  Private/Admin
 */
router.put('/users/:id', async (req, res) => {
  try {
    const result = await UserService.updateProfile(req.params.id, req.body);
    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    errorHandler(error, req, res);
  }
});

/**
 * @route   GET /api/admin/dashboard
 * @desc    Get dashboard statistics
 * @access  Private/Admin
 */
router.get('/dashboard', async (req, res) => {
  // Placeholder for dashboard statistics
  // In a real application, this would calculate statistics from the database
  try {
    res.status(200).json({
      success: true,
      data: {
        totalOrders: 0,
        pendingOrders: 0,
        totalUsers: 0,
        totalProducts: 0,
        latestOrders: [],
      },
    });
  } catch (error) {
    errorHandler(error, req, res);
  }
});

module.exports = router; 