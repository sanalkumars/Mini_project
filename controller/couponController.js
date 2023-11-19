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


// functions from adminController

const getCoupon = async (req, res) => {

    try {
      const coupons = await coupon.find()
      console.log(coupons);
  
  
      res.render('admin/Coupons', { coupons })
    }
    catch (error) {
      console.log(error);
      res.json("internal server error")
    }
  }
  
  
  const getaddCoupon = async (req, res) => {
  
    res.render("admin/addCoupon")
  
  }
  
  const addCoupon = async (req, res) => {
    try {
      console.log("inside coupon controller");
  
      const { couponName, couponValue, maxValue, minValue, expiryDate } = req.body;
      console.log(couponName);
      console.log(maxValue);
      console.log(minValue);
      console.log(expiryDate);
      // Creating  a new coupon document
      const newCoupon = new coupon({
        couponName,
        couponValue,
        maxValue,
        minValue,
        expiryDate,
      });
  
      console.log(newCoupon);
      // Saving  the new coupon to the database
      await newCoupon.save();
      console.log("hai");
      // Redirect to a success page or send a success response
      res.redirect('/admin/coupons');
    } catch (error) {
      // Handle errors - You can redirect to an error page or send an error response
      res.status(500).send('Internal Server Error'); // Replace with your error handling logic
    }
  };


// function from userController



// function for applying coupon
const applyCoupon = async (req, res) => {
  try {
    // Get the coupon code from the request body
    const couponCode = req.body.couponCode;
    const totalprice = req.body.totalPrice;

    const couponData = await coupon.findOne({ couponName: couponCode });

    const couponDiscount = Math.floor((totalprice * couponData.couponValue) / 100);
    console.log("coupon discount is :", couponDiscount);
    const grantTotal = totalprice - couponDiscount;

    // Assuming userId is available in your request or from your authentication system
    const user = await userData.findOne({ email: req.session.user });
    const userId = user._id; // Adjust this based on how you store user information

    if (!couponData.appliedUsers.includes(userId)) {
      // Push the user's ID to the appliedUsers array
      couponData.appliedUsers.push(userId);

      // Save the coupon data with the updated appliedUsers array
      await couponData.save();
    }

    res.json({ grantTotal, couponDiscount });
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
}





module.exports={
     //functions from adminController 
    getCoupon,
    getaddCoupon,
    addCoupon,
    
    // functions from userController
    applyCoupon,
}