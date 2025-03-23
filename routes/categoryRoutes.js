const express = require('express');
const CategoryService = require('../services/CategoryService');
const { protect, authorize } = require('../middleware/auth');
const { errorHandler } = require('../middleware/errorHandler');

const router = express.Router();

/**
 * @route   GET /api/categories
 * @desc    Get all categories
 * @access  Public
 */
router.get('/', protect, authorize('admin'), async (req, res) => {
  try {
    const result = await CategoryService.getAllCategories();
    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    errorHandler(error, req, res);
  }
});

/**
 * @route   GET /api/categories/:id
 * @desc    Get a category by ID
 * @access  Public
 */
router.get('/:id', async (req, res) => {
  try {
    const result = await CategoryService.getCategoryById(req.params.id);
    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    errorHandler(error, req, res);
  }
});

/**
 * @route   GET /api/categories/:id/products
 * @desc    Get products by category
 * @access  Public
 */
router.get('/:id/products', async (req, res) => {
  try {
    const result = await CategoryService.getProductsByCategory(req.params.id);
    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    errorHandler(error, req, res);
  }
});

/**
 * @route   POST /api/categories
 * @desc    Create a new category
 * @access  Private/Admin
 */
router.post('/', protect, authorize('admin'), async (req, res) => {
  try {
    const result = await CategoryService.createCategory(req.body);
    res.status(201).json({
      success: true,
      data: result,
    });
  } catch (error) {
    errorHandler(error, req, res);
  }
});

/**
 * @route   PUT /api/categories/:id
 * @desc    Update a category
 * @access  Private/Admin
 */
router.put('/:id', protect, authorize('admin'), async (req, res) => {
  try {
    const result = await CategoryService.updateCategory(req.params.id, req.body);
    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    errorHandler(error, req, res);
  }
});

/**
 * @route   DELETE /api/categories/:id
 * @desc    Delete a category
 * @access  Private/Admin
 */
router.delete('/:id', protect, authorize('admin'), async (req, res) => {
  try {
    const result = await CategoryService.deleteCategory(req.params.id);
    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    errorHandler(error, req, res);
  }
});

module.exports = router; 