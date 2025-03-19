const express = require('express');
const { protect, authorize } = require('../middleware/auth');
const { errorHandler } = require('../middleware/errorHandler');
const container = require('../config/dependencyContainer');

// Lấy OrderFacade từ container thay vì OrderService
const orderFacade = container.resolve('orderFacade');

const router = express.Router();

/**
 * @route   POST /api/orders
 * @desc    Create a new order
 * @access  Private
 */
router.post('/', protect, async (req, res) => {
  try {
    const result = await orderFacade.createOrder(req.user.id, req.body);
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
 * @desc    Get all user's orders
 * @access  Private
 */
router.get('/', protect, async (req, res) => {
  try {
    const result = await orderFacade.getUserOrders(req.user.id);
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
 * @desc    Get order by ID
 * @access  Private
 */
router.get('/:id', protect, async (req, res) => {
  try {
    const result = await orderFacade.getOrderDetails(req.params.id, req.user.id);
    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    errorHandler(error, req, res);
  }
});

/**
 * @route   DELETE /api/orders/:id
 * @desc    Cancel an order
 * @access  Private
 */
router.delete('/:id', protect, async (req, res) => {
  try {
    const result = await orderFacade.cancelOrder(req.params.id, req.user.id);
    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    errorHandler(error, req, res);
  }
});

/**
 * @route   PUT /api/orders/:id/status
 * @desc    Update order status (admin only)
 * @access  Private (Admin)
 */
router.put('/:id/status', protect, authorize('admin'), async (req, res) => {
  try {
    const result = await orderFacade.updateOrderStatus(req.params.id, req.body);
    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    errorHandler(error, req, res);
  }
});

/**
 * @route   PUT /api/orders/:id/complete
 * @desc    Mark order as complete (admin only)
 * @access  Private (Admin)
 */
router.put('/:id/complete', protect, authorize('admin'), async (req, res) => {
  try {
    const result = await orderFacade.completeOrder(req.params.id);
    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    errorHandler(error, req, res);
  }
});

/**
 * @route   POST /api/orders/:id/undo
 * @desc    Undo last operation on this order (admin only)
 * @access  Private (Admin)
 */
router.post('/:id/undo', protect, authorize('admin'), async (req, res) => {
  try {
    const result = await orderFacade.undoLastOperation();
    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    errorHandler(error, req, res);
  }
});

module.exports = router; 