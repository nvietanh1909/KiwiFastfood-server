const mongoose = require('mongoose');

const ProductSchema = new mongoose.Schema(
  {
    tenMon: {
      type: String,
      required: [true, 'Vui lòng nhập tên món'],
      trim: true,
      maxlength: [100, 'Tên món không thể dài hơn 100 ký tự'],
    },
    giaBan: {
      type: Number,
      required: [true, 'Vui lòng nhập giá bán'],
      min: [0, 'Giá bán phải là số dương'],
    },
    noiDung: {
      type: String,
      required: [true, 'Vui lòng nhập nội dung mô tả'],
    },
    anhDD: {
      type: String,
      default: 'no-image.jpg',
    },
    soLuongTon: {
      type: Number,
      required: [true, 'Vui lòng nhập số lượng tồn'],
      min: [0, 'Số lượng tồn phải là số dương'],
      default: 0,
    },
    soLuongBan: {
      type: Number,
      default: 0,
      min: [0, 'Số lượng bán phải là số không âm'],
    },
    maLoai: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      required: true,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Calculate average rating
ProductSchema.methods.calculateAverageRating = function () {
  if (this.ratings.length === 0) {
    this.averageRating = 0;
  } else {
    const sum = this.ratings.reduce((acc, item) => acc + item.rating, 0);
    this.averageRating = sum / this.ratings.length;
  }
  return this.averageRating;
};

module.exports = mongoose.model('Product', ProductSchema); 