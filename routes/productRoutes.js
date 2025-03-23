const express = require('express');
const container = require('../config/dependencyContainer');
const { protect, authorize } = require('../middleware/auth');
const { errorHandler } = require('../middleware/errorHandler');

const router = express.Router();
const productService = container.resolve('productService');

/**
 * @route   GET /api/products
 * @desc    Get all products with filtering and pagination
 * @access  Public
 */
router.get('/', async (req, res) => {
  try {
    // Get query parameters
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    
    const result = await productService.getAllProducts(req.query, page, limit);
    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    errorHandler(error, req, res);
  }
});

/**
 * @route   GET /api/products/:id
 * @desc    Get a product by ID
 * @access  Public
 */
router.get('/:id', async (req, res) => {
  try {
    const result = await productService.getProductById(req.params.id);
    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    errorHandler(error, req, res);
  }
});

/**
 * @route   POST /api/products
 * @desc    Create a new product
 * @access  Private/Admin
 */
router.post('/', protect, authorize('admin'), async (req, res) => {
  try {
    const result = await productService.createProduct(req.body);
    res.status(201).json({
      success: true,
      data: result,
    });
  } catch (error) {
    errorHandler(error, req, res);
  }
});

/**
 * @route   PUT /api/products/:id
 * @desc    Update a product
 * @access  Private/Admin
 */
router.put('/:id', protect, authorize('admin'), async (req, res) => {
  try {
    const result = await productService.updateProduct(req.params.id, req.body);
    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    errorHandler(error, req, res);
  }
});

/**
 * @route   DELETE /api/products/:id
 * @desc    Delete a product
 * @access  Private/Admin
 */
router.delete('/:id', protect, authorize('admin'), async (req, res) => {
  try {
    const result = await productService.deleteProduct(req.params.id);
    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    errorHandler(error, req, res);
  }
});

/**
 * @route   POST /api/products/:id/ratings
 * @desc    Add a rating to a product
 * @access  Private
 */
router.post('/:id/ratings', protect, async (req, res) => {
  try {
    const { rating, comment } = req.body;
    const result = await productService.addRating(
      req.params.id,
      req.user.id,
      rating,
      comment
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