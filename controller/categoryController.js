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


// function to get stored categories
const getCategory = async (req, res) => {
    try {
  
      if (req.session.admin) {
        const categories = await category.find()
        res.render("admin/category", { categories })
      } else {
        res.render("admin/login")
      }
    } catch {
  
      res.status(500).send("internal server error")
    }
  }

  const editCategory = async (req, res) => {
    const categoryId = req.params.id;
    try {
        const categoryData = await category.findById(categoryId);
        if (!categoryData) {
            return res.status(404).send('Category not found');
        }
        res.render('admin/edit_category', { categoryData });
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
   }
  };

  
const editCategoryPost = async (req, res) => {
    const categoryId = req.params.id;
    const newName = req.body.name;
  
    try {
        // Check if the category with the new name already exists (case-insensitive)
        const existingCategory = await category.findOne({ category: { $regex: new RegExp('^' + newName + '$', 'i') } });
  
        if (existingCategory && existingCategory._id.toString() !== categoryId) {
            // If the category with the new name already exists (excluding the current category being edited)
            return res.status(400).send('Category already exists');
        }
  
        const categoryData = await category.findByIdAndUpdate(categoryId, { category: newName }, { new: true });
  
        if (!categoryData) {
            return res.status(404).send('Category not found');
        }
  
        res.redirect('/admin/category');
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
      }
  };
   

  const deletecategory = async (req, res) => {
    const cateID = req.params.id
    try {
      await category.findByIdAndUpdate(cateID, { status: "unavailable" })
      res.redirect("/admin/category")
    } catch (error) {
      console.log(error);
      res.render("admin/404", { error })
    }
  }


  // function to add new category and also to check wheather it exist already or not

const addCategory = async (req, res) => {
    const newcata = req.body.category;
    console.log(newcata);
  
    try {
      const existsCata = await category.find({ category: newcata });
      console.log(existsCata);
  
      if (existsCata.length === 0) {
        console.log("Category doesn't exist. Creating a new one.");
        const cata = req.body.category;
        const newcategory = new category({
          category: cata
        });
        await newcategory.save();
        res.redirect('/admin/category');
      } else {
        const categories = await category.find();
        const msg = "Sorry, this category already exists";
        res.render("admin/category", { msg, categories });
      }
    } catch (error) {
      res.status(500).send("Internal server error");
    }
  }




module.exports={
    // from adminController
    getCategory,
    editCategory,
    editCategoryPost,
    addCategory,
    deletecategory,

    
}