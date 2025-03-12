const mongoose = require('mongoose');

const CategorySchema = new mongoose.Schema(
  {
    tenLoai: {
      type: String,
      required: [true, 'Vui lòng nhập tên loại'],
      trim: true,
      maxlength: [50, 'Tên loại không thể dài hơn 50 ký tự'],
    }
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Category', CategorySchema); 