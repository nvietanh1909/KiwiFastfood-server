const express = require('express');
const router = express.Router();
const multer = require('multer');
const upload = multer({ storage: multer.memoryStorage() });
const uploadService = require('../services/UploadService');

// Test upload route
router.post('/test', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded'
      });
    }

    const imageUrl = await uploadService.uploadImage(req.file, 'test');
    
    res.status(200).json({
      success: true,
      data: {
        url: imageUrl,
        filename: req.file.originalname
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Test get image route
router.get('/test/:key', async (req, res) => {
  try {
    const image = await uploadService.getImage(req.params.key);
    res.send(image);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Test delete image route
router.delete('/test/:key', async (req, res) => {
  try {
    await uploadService.deleteImage(req.params.key);
    res.status(200).json({
      success: true,
      message: 'Image deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

module.exports = router; 