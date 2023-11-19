const { render } = require("ejs")
const userData = require("../models/userLogin")
const products = require("../models/product")
const nodemailer = require('nodemailer')
const category = require('../models/category')
const otpGenerator = require('otp-generator');
const otpSchema = require("../models/otp")
const bcrypt = require("bcrypt")
const cartProduct = require('../models/carts')
const { LEGAL_TLS_SOCKET_OPTIONS } = require("mongodb")
const orders = require("../models/order")
const Address = require("../models/address")
const coupon = require("../models/coupon")
const session = require("express-session")
const mongoose= require('mongoose')
const Wallet = require('../models/wallet')
const Feedback = require('../models/feedbackModel')
const Reference = require('../models/Reference')
const Razorpay = require('razorpay')
const banner= require('../models/banner')

const secret_Id = process.env.SECRET_ID
const secret_Key = process.env.SERECT_KEY


const wallethistory = async (req, res) => {
    if (req.session.user) {
      try {
        const userEmail = req.session.user;
  
        // Fetch the user ID based on the email
        const user = await userData.findOne({ email: userEmail }).populate('wallet');
        if (!user) {
          return res.render('user/error');
        }
  
        const wallet = user.wallet;
  
        // Fetch wallet transactions using aggregation
        const walletData = await Wallet.aggregate([
          {
            $match: { _id: new mongoose.Types.ObjectId(wallet._id) }
          },
          {
            $unwind: '$transactions'
          },
          {
            $sort: { 'transactions.date': -1 } // Sort by date in descending order
          },
          {
            $limit: 10 // Limit to the most recently made ten transactions
          },
          {
            $project: {
              date: '$transactions.date',
              amount: '$transactions.amount',
              type: {
                $cond: {
                  if: { $gt: ['$transactions.amount', 0] },
                  then: 'Credit',
                  else: 'Debit'
                }
              }
            }
          }
        ]);
  
        const transactions = walletData.map(transaction => ({
          date: transaction.date,
          amount: transaction.amount,
          type: transaction.type
        }));
  
        res.render('user/walletHistory', { transactions });
      } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
      }
    } else {
      res.redirect('/login');
    }
  };

module.exports={
    wallethistory,
}