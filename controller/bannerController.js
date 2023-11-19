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

// functions for banners

const getbanner = async (req, res) => {
    try {
  
      // const bannerData = await banner.find();
      const bannerData = await banner.find({ isDeleted: false });
  
  
      // Render the banners page with bannerData
      res.render('admin/banner', { bannerData });
    } catch (err) {
      console.error("Error is ", err);
      // Render the banners page with an error message or redirect to an error page
      res.render('error', { errorMessage: 'An error occurred' });
    }
  };
  
  const addBanner = (req, res) => {
    res.render('admin/addBanner');
  };
  
  
  
  const addBannerPost = async (req, res) => {
    const { name, description } = req.body;
    console.log(name, description);
    try {
      const newbanner = new banner({
        name,
        description,
        image: req.file ? req.file.filename : '',
      });
  
      await newbanner.save();
      res.redirect('/admin/banners');
    } catch (error) {
      console.error(error);
      res.status(500).send('Internal Server Error');
    }
  };
  
  
  const deleteBanner = async (req, res) => {
    const bannerId = req.params.id;
  
    try {
      // Find the banner by ID and update the isDeleted field to true
      await banner.findByIdAndUpdate(bannerId, { isDeleted: true });
  
      res.redirect('/admin/banners'); // Redirect to the banners page after deletion
    } catch (error) {
      console.error(error);
      res.status(500).send('Internal Server Error');
    }
  };






module.exports={
    //functions from adminController
    getbanner,
    addBanner,
    addBannerPost,
    deleteBanner,
}