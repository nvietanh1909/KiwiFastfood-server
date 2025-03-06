const mongoose = require('mongoose');

const dishSchema = new mongoose.Schema(
  {
    categoryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      required: true
    },
    name: {
      type: String,
      required: true,
      trim: true
    },
    price: {
      type: Number,
      required: true,
      min: 0
    },
    description: {
      type: String,
      trim: true
    },
    content: {
      type: String,
      trim: true
    },
    images: [String],
    stockQuantity: {
      type: Number,
      default: 0,
      min: 0
    },
    active: {
      type: Boolean,
      default: true
    },
    averageRating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5
    }
  },
  {
    timestamps: true
  }
);

dishSchema.index({ name: 'text', description: 'text' });

const Dish = mongoose.model('Dish', dishSchema);

module.exports = Dish;