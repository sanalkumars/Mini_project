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


// functions for category offer

const sendCategoryOffer = async (req, res) => {
    console.log("hello there");
  
  
    try {
      const activeCategories = await category.find({ isDeleted: false });
      const categories = await category.find();
      res.render('admin/categoryOffer', { activeCategories, categories });
    } catch (error) {
      console.error(error);
      res.status(500).send('Internal Server Error');
    }
  
  };


  const applyOffer = async (req, res) => {
    const { categoryId, percentage } = req.body;
   console.log("inside offerapply");
    try {
      // Find the category by its ID
      const categories = await category.findById(categoryId);
      console.log("categories is :", categories);
  
      if (!categories) {
        return res.status(404).json({ success: false, message: 'Category not found' });
      }
        
      console.log("hello category found ");
  
      // Find all products belonging to the category
      const product = await products.find({ category: categories.category });
  
      // Update the prices of the products
      for (const productss of product) {
        const updatedPrice = Math.floor(productss.price - (productss.price * (percentage / 100)));
        const realPrice = productss.price
        productss.price = updatedPrice;
        productss.realPrice=realPrice
        console.log("realprice",realPrice);
        console.log("realprice",updatedPrice);

        await productss.save();
      }
  
      return res.json({ success: true, message: 'Offer applied successfully' });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
  };


// function from userController

const claimReferenceCode = async (req, res) => {
  try {
    const { referenceCode } = req.body;
    const reference = await Reference.findOne({ referenceCode });

    if (!reference) {
      return res.status(400).json({ message: "Invalid reference code" });
    }

    const user = await userData
      .findOne({ email: req.session.user })
      .populate("wallet");

    if (!user) {
      return res.status(500).json({ message: "Internal Server Error" });
    }

    // Check if the reference code has already been used by the current user
    if (reference.usedBy.includes(user._id)) {
      return res.status(400).json({ message: "Reference code already used" });
    }
    if (reference.userId.equals(user._id)) {
      return res.status(400).json({ message: "Cannot claim your own referral code" });
    }
    // Mark the reference code as used by the current user
    reference.usedBy.push(user._id);
    await reference.save();

    // Increase wallet balances
    if (user.wallet) {
      // Add the credited amount to the wallet transactions
      user.wallet.transactions.push({
        amount: 100,
        type: 'Credit',
      });

      user.wallet.balance += 100; // Increase user's wallet by 100 rupees
      await user.wallet.save();
    } else {
      const newWallet = new Wallet({ balance: 100 });
      // Add the credited amount to the wallet transactions
      newWallet.transactions.push({
        amount: 100,
        type: 'Credit',
      });

      await newWallet.save();
      user.wallet = newWallet;
    }

    // Increase session user's wallet balance
    const referenceuser = await userData
      .findById(reference.userId)
      .populate("wallet");

    if (referenceuser.wallet) {
      // Add the credited amount to the wallet transactions
      referenceuser.wallet.transactions.push({
        amount: 100,
        type: 'Credit',
      });

      referenceuser.wallet.balance += 100; // Increase user's wallet by 100 rupees
      await referenceuser.wallet.save();
    } else {
      const newWallet = new Wallet({ balance: 100 });
      // Add the credited amount to the wallet transactions
      newWallet.transactions.push({
        amount: 100,
        type: 'Credit',
      });

      await newWallet.save();
      referenceuser.wallet = newWallet;
    }

    await user.save();

    return res
      .status(200)
      .json({ message: "Reference code claimed successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

module.exports={
    // from adminController
  sendCategoryOffer,
  applyOffer,

  //functions from userController
  claimReferenceCode,
}