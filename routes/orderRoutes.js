const express = require('express');
const OrderService = require('../services/OrderService');
const { protect, authorize } = require('../middleware/auth');
const { errorHandler } = require('../middleware/errorHandler');

const router = express.Router();

// All order routes require authentication
router.use(protect);

/**
 * @route   POST /api/orders
 * @desc    Create a new order
 * @access  Private
 */
router.post('/', async (req, res) => {
  try {
    const result = await OrderService.createOrder(req.user.id, req.body.items);
    res.status(201).json({
      success: true,
      data: result,
    });
  } catch (error) {
    errorHandler(error, req, res);
  }
});

/**
 * @route   GET /api/orders
 * @desc    Get all orders for the logged-in user
 * @access  Private
 */
router.get('/', async (req, res) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    
    const result = await OrderService.getUserOrders(req.user.id, page, limit);
    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    errorHandler(error, req, res);
  }
});

/**
 * @route   GET /api/orders/:id
 * @desc    Get order details by ID
 * @access  Private
 */
router.get('/:id', async (req, res) => {
  try {
    const result = await OrderService.getOrderById(
      req.params.id,
      req.user.id,
      req.user.role === 'admin'
    );
    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    errorHandler(error, req, res);
  }
});

/**
 * @route   PUT /api/orders/:id
 * @desc    Update order status
 * @access  Private/Admin
 */
router.put('/:id', authorize('admin'), async (req, res) => {
  try {
    const { tinhTrangGiaoHang, daThanhToan } = req.body;
    const result = await OrderService.updateOrderStatus(
      req.params.id, 
      tinhTrangGiaoHang, 
      daThanhToan
    );
    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    errorHandler(error, req, res);
  }
});

module.exports = router; 