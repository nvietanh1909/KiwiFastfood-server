const mongoose = require('mongoose');

const replySchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  content: {
    type: String,
    required: true,
    trim: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const reviewSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    user: {
      fullName: {
        type: String,
        required: true
      },
      avatar: String
    },
    dishId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Dish',
      required: true
    },
    orderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Order'
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5
    },
    content: {
      type: String,
      trim: true
    },
    images: [String],
    active: {
      type: Boolean,
      default: true
    },
    replies: [replySchema]
  },
  {
    timestamps: true
  }
);

reviewSchema.index({ userId: 1, dishId: 1, orderId: 1 }, { unique: true });

const Review = mongoose.model('Review', reviewSchema);

module.exports = Review;