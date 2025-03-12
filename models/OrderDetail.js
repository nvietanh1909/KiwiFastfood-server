const mongoose = require('mongoose');

const OrderDetailSchema = new mongoose.Schema(
  {
    maDonHang: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Order',
      required: true,
    },
    maMon: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true,
    },
    soLuong: {
      type: Number,
      required: [true, 'Vui lòng nhập số lượng'],
      min: [1, 'Số lượng phải lớn hơn 0'],
    },
    donGia: {
      type: Number,
      required: [true, 'Vui lòng nhập đơn giá'],
      min: [0, 'Đơn giá phải là số không âm'],
    },
  },
  {
    timestamps: true,
  }
);

// Tạo composite key
OrderDetailSchema.index({ maDonHang: 1, maMon: 1 }, { unique: true });

module.exports = mongoose.model('OrderDetail', OrderDetailSchema); 