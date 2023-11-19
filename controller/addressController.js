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



// get address function
const getAddress = async (req, res) => {

    if (req.session.user) {
      try {
        const user = await userData.findOne({ email: req.session.user })
        console.log("user details", user);
        const address = await Address.find({ userId: user._id })
        console.log(address);
        res.render("user/myAddress", { address })
      } catch (error) {
        console.log(error);
        res.json("internal server error")
      }
    } else {
  
    }
  
  }
  
  const addAddress = async (req, res) => {
  
  
    const { houseName, street, city, state, zip } = req.body
    const user = await userData.findOne({ email: req.session.user })
    console.log(user);
    try {
      const address = await Address.create({ userId: user._id, houseName, street, city, state, zip });
      console.log(address);
      res.redirect('/myaddress')
    } catch (error) {
      console.error(error);
      res.status(500).send('Internal Server Error');
    }
  }
  
  const showAddress = (req, res) => {
    res.render("user/addAddress")
  }
  
  const editAddress = async (req, res) => {
    const addressId = req.params.id;
    console.log("this is the address going to be edited", addressId);
  
    try {
      const address = await Address.findById(addressId); // Pass addressId directly
  
      if (!address) {
        console.log("Address not found"); // Handle the case when the address is not found
        res.send("Address not found");
        return;
      }
  
      console.log(address._id);
  
      res.render("user/editAddress", { address });
    } catch (error) {
      console.log(error);
      res.send("Internal server error");
    }
  };
  
  
  //update address function
  
  const updateAddress = async (req, res) => {
    const addressId = req.params.id;
    const { userName, street, city, state, zip } = req.body;
  
    try {
      const updatedAddress = await Address.findByIdAndUpdate(addressId, {
        userName,
        street,
        city,
        state,
        zip
      }, { new: true });
  
      // res.redirect('/displayaddress');
      res.redirect('/myaddress')
  
    } catch (error) {
      console.error(error);
      res.status(500).send('Internal Server Error');
    }
  };



module.exports={
    getAddress,
  addAddress,
  showAddress,
  editAddress,
  updateAddress,
}