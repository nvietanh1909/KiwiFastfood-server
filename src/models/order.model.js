const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
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
    min: 1
  },
  unitPrice: {
    type: Number,
    required: true,
    min: 0
  },
  totalPrice: {
    type: Number,
    required: true,
    min: 0
  },
  notes: {
    type: String,
    trim: true
  }
});

const deliveryAddressSchema = new mongoose.Schema({
  recipientName: {
    type: String,
    required: true,
    trim: true
  },
  phone: {
    type: String,
    required: true,
    trim: true
  },
  addressDetail: {
    type: String,
    required: true,
    trim: true
  },
  city: {
    type: String,
    required: true,
    trim: true
  },
  notes: {
    type: String,
    trim: true
  }
});

const statusHistorySchema = new mongoose.Schema({
  status: {
    type: String,
    required: true,
    enum: ['CREATED', 'PENDING', 'CONFIRMED', 'PREPARING', 'DELIVERING', 'DELIVERED', 'CANCELLED']
  },
  timestamp: {
    type: Date,
    default: Date.now
  },
  notes: {
    type: String,
    trim: true
  },
  performedById: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
});

const orderSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    orderItems: [orderItemSchema],
    totalAmount: {
      type: Number,
      required: true,
      min: 0
    },
    paymentMethod: {
      code: {
        type: String,
        required: true,
        enum: ['CASH', 'CARD', 'TRANSFER', 'WALLET']
      },
      name: {
        type: String,
        required: true
      }
    },
    status: {
      code: {
        type: String,
        required: true,
        enum: ['PENDING', 'CONFIRMED', 'PREPARING', 'DELIVERING', 'DELIVERED', 'CANCELLED'],
        default: 'PENDING'
      },
      name: {
        type: String,
        required: true,
        default: 'Pending Confirmation'
      }
    },
    deliveryAddress: deliveryAddressSchema,
    processedById: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    statusHistory: [statusHistorySchema],
    orderedAt: {
      type: Date,
      default: Date.now
    },
    deliveredAt: {
      type: Date
    }
  },
  {
    timestamps: true
  }
);

orderSchema.virtual('orderAge').get(function() {
  return Math.floor((Date.now() - this.orderedAt) / (1000 * 60 * 60));
});

orderSchema.index({ userId: 1, 'status.code': 1 });

const Order = mongoose.model('Order', orderSchema);

module.exports = Order;