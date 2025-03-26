const express = require('express');
const router = express.Router();
const axios = require('axios');
const crypto = require('crypto');
const mongoose = require('mongoose');
const Order = require('../models/Order');

function createHash(data, secret) {
  if (!secret) {
    console.error('Hash secret is undefined or empty');
    throw new Error('Hash secret key is missing or invalid');
  }
  return crypto.createHmac('sha512', secret).update(data).digest('hex');
}

router.post('/create_payment_url', (req, res) => {
  const { amount, orderId, orderInfo, returnUrl } = req.body;

  const date = new Date();
  const vnp_TmnCode = process.env.VNP_TMNCODE;
  const vnp_HashSecret = process.env.VNP_HASHSECRET;
  const vnp_Url = process.env.VNP_URL;
  const vnp_ReturnUrl = process.env.VNP_RETURNURL;

  if (!vnp_HashSecret || !vnp_TmnCode || !vnp_Url || !vnp_ReturnUrl) {
    return res.status(500).json({
      success: false,
      error: 'Payment configuration is incomplete. Some environment variables are missing.'
    });
  }
  
  const createDate = date.toISOString().replace(/[-:T.]/g, '').slice(0, 14); 

  const combinedOrderInfo = JSON.stringify({
    orderInfo: orderInfo || 'Thanh toan don hang',
    returnUrl: returnUrl || `${process.env.CLIENT_URL}/Payment/Success`
  });

  const vnp_Params = {
    vnp_Version: '2.1.0',
    vnp_Command: 'pay',
    vnp_TmnCode: vnp_TmnCode,
    vnp_Amount: amount * 100,
    vnp_CurrCode: 'VND',
    vnp_TxnRef: orderId || createDate,
    vnp_OrderInfo: orderInfo || 'Thanh toan don hang',
    vnp_OrderType: 'billpayment',
    vnp_Locale: 'vn',
    vnp_ReturnUrl: vnp_ReturnUrl,
    vnp_IpAddr: req.ip || '127.0.0.1',
    vnp_CreateDate: createDate,
  };

  const sortedParams = Object.keys(vnp_Params)
    .sort()
    .reduce((result, key) => {
      result[key] = vnp_Params[key];
      return result;
    }, {});

  const signData = new URLSearchParams(sortedParams).toString();
  const vnp_SecureHash = createHash(signData, vnp_HashSecret);
  sortedParams.vnp_SecureHash = vnp_SecureHash;

  const paymentUrl = `${vnp_Url}?${new URLSearchParams(sortedParams).toString()}`;

  res.json({ paymentUrl });
});

router.get('/vnpay_return', async (req, res) => {
  const vnp_Params = req.query;
  const secureHash = vnp_Params['vnp_SecureHash'];
  delete vnp_Params['vnp_SecureHash'];
  delete vnp_Params['vnp_SecureHashType'];

  const sortedParams = Object.keys(vnp_Params)
    .sort()
    .reduce((result, key) => {
      result[key] = vnp_Params[key];
      return result;
    }, {});

  const signData = new URLSearchParams(sortedParams).toString();
  const vnp_HashSecret = process.env.VNP_HASHSECRET;
  const checkSum = createHash(signData, vnp_HashSecret);

  if (secureHash === checkSum) {
    const rspCode = vnp_Params['vnp_ResponseCode'];
    const transactionData = {
      amount: vnp_Params['vnp_Amount'] / 100,
      orderId: vnp_Params['vnp_TxnRef'],
      transactionId: vnp_Params['vnp_TransactionNo'],
      responseCode: rspCode,
      paymentDate: vnp_Params['vnp_PayDate'],
      bankCode: vnp_Params['vnp_BankCode'],
      orderInfo: vnp_Params['vnp_OrderInfo']
    };

    if (rspCode === '00') {
      try {
        const order = await Order.findById(transactionData.orderId);
        if (order) {
          order.daThanhToan = true;
          order.paymentStatus = 'paid';
          order.paymentDetails = transactionData;
          await order.save();
        }
      } catch (error) {
        console.error('Error updating order payment status:', error);
      }
    }

    res.redirect(`${process.env.CLIENT_URL}/Payment/Success?status=${rspCode === '00' ? 'success' : 'failed'}`);
  } else {
    res.redirect(`${process.env.CLIENT_URL}/Payment/Success?status=failed&message=Invalid signature`);
  }
});

module.exports = router;