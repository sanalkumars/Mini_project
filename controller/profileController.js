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


// bcrypt function
const passwordcrypt = async function (password) {
    const bcrptPass = await bcrypt.hash(password, 8);
    return bcrptPass;
  }

  

  //function for user profile

const getProfile = async (req, res) => {
  if (req.session.user) {
    try {
      const user = await userData.findOne({ email: req.session.user });
      console.log(user);
      const address = await Address.find({ userId: user._id });

      const userId = user._id;

      
      // Use aggregation to get the recent ten orders
      const recentOrders = await orders.aggregate([
        { $match: { userId } },
        { $sort: { orderDate: -1 } }, // (most recent first)
        { $limit: 10 },
        { $lookup: { from: 'products', localField: 'products.productId', foreignField: '_id', as: 'products' } },
      ]).exec();
    
      const returnedOrders = await orders.find({ userId: user._id, isReturned: true });

      const userWallet = await Wallet.findById(user.wallet);

      const reference = await Reference.findOne({ userId: user._id });

      res.render('user/userprofile', { user, address, order: recentOrders, returnedOrders, reference, userWallet });

    } catch (error) {
      console.error(error);
      res.status(500).send('Internal Server Error');
    }
  } else {
    res.redirect("/login");
  }
};


 




const changepassword = (req, res) => {

  if (req.session.user) {
    res.render("user/changepass")
  } else {
    res.redirect("/login")
  }
}

const changepasswordpost = async (req, res) => {
  const currentPassword = req.body.currentPassword;
  const newPassword = req.body.newPassword;

  const bcryptednewPass = await passwordcrypt(newPassword)
  try {
    const user = await userData.findOne({ email: req.session.user });
    const result = await bcrypt.compare(req.body.currentPassword, user.password)


    if (user) {
      if (result) {
        await userData.updateOne({ email: req.session.user }, { $set: { password: bcryptednewPass } });
        res.redirect('/profile');
      }
      else {
        // Set error message
        const errorMessage = "Current password is incorrect";
        console.log(errorMessage);
        res.render("user/changepass", { errorMessage }); // Pass the errorMessage to the template
      }
    } else {
      res.redirect("/login")
    }
  } catch (error) {
    console.error(error);
    res.send("An error occurred while processing your request.");
  }

};
    
const getchangePass = (req, res) => {
  res.render("user/changepass")
}

const updatePassword = async (req, res) => {
  const pass = req.body.password;
  const bcryptedPass = await passwordcrypt(pass);
  const useremail = req.session.user;

  try {
    const updatedUser = await userData.findOneAndUpdate(
      { email: useremail },
      {
        $set: {
          password: bcryptedPass,
        },
      },
      { new: true }
    );

    if (updatedUser) {
      console.log("Password updated successfully");
      res.redirect("/profile")

    } else {
      console.log("User not found or password update failed");

    }
  } catch (error) {
    console.error(error);

  }
};


  module.exports={
    getProfile,
    
    changepassword,
    changepasswordpost,
    getchangePass,
    updatePassword,
    
  }