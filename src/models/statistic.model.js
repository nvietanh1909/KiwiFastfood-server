const mongoose = require('mongoose');

const popularDishSchema = new mongoose.Schema({
  dishId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Dish',
    required: true
  },
  dishName: {
    type: String,
    required: true
  },
  quantity: {
    type: Number,
    required: true,
    min: 0
  }
});

const statisticSchema = new mongoose.Schema({
  date: {
    type: Date,
    required: true,
    unique: true
  },
  totalOrders: {
    type: Number,
    default: 0,
    min: 0
  },
  totalRevenue: {
    type: Number,
    default: 0,
    min: 0
  },
  popularDishes: [popularDishSchema],
  orderStatusCounts: {
    delivered: {
      type: Number,
      default: 0
    },
    delivering: {
      type: Number,
      default: 0
    },
    cancelled: {
      type: Number,
      default: 0
    },
    pending: {
      type: Number,
      default: 0
    },
    confirmed: {
      type: Number,
      default: 0
    },
    preparing: {
      type: Number,
      default: 0
    }
  }
});

const Statistic = mongoose.model('Statistic', statisticSchema);

module.exports = Statistic;