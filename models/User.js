const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const UserSchema = new mongoose.Schema(
  {
    hoTen: {
      type: String,
      required: [true, 'Vui lòng nhập họ tên'],
      trim: true,
      maxlength: [50, 'Họ tên không thể dài hơn 50 ký tự'],
    },
    taiKhoan: {
      type: String,
      required: [true, 'Vui lòng nhập tài khoản'],
      unique: true,
      trim: true,
      maxlength: [50, 'Tài khoản không thể dài hơn 50 ký tự'],
    },
    matKhau: {
      type: String,
      required: [true, 'Vui lòng nhập mật khẩu'],
      minlength: [6, 'Mật khẩu phải có ít nhất 6 ký tự'],
      select: false,
    },
    email: {
      type: String,
      required: [true, 'Vui lòng nhập email'],
      unique: true,
      match: [
        /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
        'Vui lòng nhập email hợp lệ',
      ],
      lowercase: true,
    },
    diaChiKH: {
      type: String,
      maxlength: [200, 'Địa chỉ không thể dài hơn 200 ký tự'],
    },
    dienThoaiKH: {
      type: String,
      trim: true,
      maxlength: [50, 'Số điện thoại không thể dài hơn 50 ký tự'],
    },
    ngaySinh: {
      type: Date,
    },
    role: {
      type: String,
      enum: ['user', 'admin'],
      default: 'user',
    },
  },
  {
    timestamps: true,
  }
);

// Encrypt password using bcrypt before saving
UserSchema.pre('save', async function (next) {
  if (!this.isModified('matKhau')) {
    next();
  }

  const salt = await bcrypt.genSalt(10);
  this.matKhau = await bcrypt.hash(this.matKhau, salt);
});

// Sign JWT and return
UserSchema.methods.getSignedJwtToken = function () {
  return jwt.sign(
    { id: this._id, role: this.role },
    process.env.JWT_SECRET,
    {
      expiresIn: process.env.JWT_EXPIRE,
    }
  );
};

// Match user entered password to hashed password in database
UserSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.matKhau);
};

module.exports = mongoose.model('User', UserSchema); 