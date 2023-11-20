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


// functions for cart(getting cart and adding items into cart)

// const showCarts = async (req, res) => {
//   console.log('show cart');
//   try {
//     if (req.session.user) {
//       console.log('user');
//       const user = await userData.findOne({ email: req.session.user });
//       const product = await products.find()
//       // Find all cart items for the user
//       const cartItems = await cartProduct.find({ userId: user._id }).populate('productId');
//       const coupons = await coupon.find()



//       // Calculate the total price
//       let totalPrice = 0;

//       // Iterate through the cart items and calculate the total price
//       for (const cartItem of cartItems) {
//         totalPrice += cartItem.quantity * cartItem.productId.price;
//       }

//       req.session.totalPrice = totalPrice;

//       res.render('user/cart', { cartItems, totalPrice, user, product, coupons });

//     } else {
//       res.redirect('/login');
//     }
//   } catch (error) {
//     console.error(error);
//     res.status(500).send('Internal Server Error');
//   }
// };
const showCarts = async (req, res) => {
    console.log('show cart');
    try {
      if (req.session.user) {
        console.log('user');
        const user = await userData.findOne({ email: req.session.user });
        const product = await products.find()
        const coupons = await coupon.find();
  
        const cartItems = await cartProduct.aggregate([
          {
            $match: { userId: user._id }
          },
          {
            $lookup: {
              from: 'products', // replace with the actual name of your products collection
              localField: 'productId',
              foreignField: '_id',
              as: 'product'
            }
          },
          {
            $unwind: '$product'
          },
          {
            $project: {
              productId: '$product._id',
              quantity: 1, // include other fields as needed
              price: '$product.price',
              name: '$product.name',
              description: '$product.description',
              image: '$product.image'
            }
          }
        ]);
  
        // Calculate the total price
        let totalPrice = 0;
  
        // Iterate through the cart items and calculate the total price
        for (const cartItem of cartItems) {
          totalPrice += cartItem.quantity * cartItem.price;
        }
  
        req.session.totalPrice = totalPrice;
  
        res.render('user/cart', { cartItems, totalPrice, user, coupons,product});
  
      } else {
        res.redirect('/login');
      }
    } catch (error) {
      console.error(error);
      res.status(500).send('Internal Server Error');
    }
  };

    
  // function for adding products to cart

const addtocart = async (req, res) => {
    if (req.session.user) {
      try {
        const productId = req.body.productId; // Assuming the productId is in the request body
        const quantity = 1;
  
        // const productdata = await products.findOne({ _id: productId }); // Assuming you're using "_id" to find the product
        const user = await userData.findOne({ email: req.session.user });
  
        // Check if the product already exists in the cart for the user
        let existingCartItem = await cartProduct.findOne({ userId: user._id, productId: productId });
  
        if (existingCartItem) {
          // If the product exists, increment the quantity for that product
          existingCartItem.quantity += quantity;
        } else {
          // If the product doesn't exist in the cart, create a new cart entry
          existingCartItem = new cartProduct({
            userId: user._id,
            productId: productId,
            quantity: quantity,
          });
        }
  
        await existingCartItem.save();
        res.redirect('/cart');
      } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
      }
    } else {
      res.redirect('/login');
    }
  };

   
   // function for removing cart items

const removecartItem = async (req, res) => {
    try {
      const itemId = req.params.itemId; // Get the item's _id from the request parameters
  
      // Find the cart item and remove it
      const result = await cartProduct.findOneAndRemove({ _id: itemId });
  
      if (result) {
        // Item was successfully removed
        res.redirect('/cart'); // Redirect back to the cart page
      } else {
        // Item not found or unable to remove
        res.status(404).send('Item not found or unable to remove.');
      }
    } catch (error) {
      console.error(error);
      res.status(500).send('Internal Server Error');
    }
  };

   //function for quantity  updation


// const updateQuantity = async (req, res) => {
//     try {
//       const itemId = req.params.itemId;
//       const newQuantity = req.body.quantity;
  
//       // Find the cart item by its ID
//       const cartItem = await cartProduct.findById(itemId).populate('productId');
  
//       if (!cartItem) {
//         return res.status(404).json({ message: 'Cart item not found' });
//       }
  
//       // Find the corresponding product in the product collection
//       const product = cartItem.productId;
//       const collectionProduct = await products.findById(product._id);
  
//       if (!collectionProduct) {
//         return res.status(404).json({ message: 'Product not found' });
//       }
  
//       const collectionProductQuantity = collectionProduct.quantity;
  
//       // Check if the requested quantity exceeds the available quantity
//       if (newQuantity > collectionProductQuantity) {
//         return res.status(400).json({ message: 'Out Of Stock' });
//       }
  
//       // Update the quantity of the cart item
//       const itemPrice = product.price;
//       let priceChange;
//       let diff = newQuantity - cartItem.quantity;
//       if (newQuantity > cartItem.quantity) {
//         // increment
//         priceChange = diff * itemPrice; // this to add to the final result
//       } else {
//         // decrement
//       priceChange = -Math.abs(diff * itemPrice);
//       }
//       cartItem.quantity = newQuantity;
//       cartItem.totalPrice = itemPrice * newQuantity;
//       const newTotalPrice = cartItem.totalPrice;
//       console.log("newTotalPrice:", newTotalPrice);
//       // Save the updated cart item
//       await cartItem.save();
//       req.session.totalPrice = newTotalPrice;
//       res.json({ success: true, newQuantity, newTotalPrice, priceChange });
//     } catch (error) {
//       console.error(error);
//       return res.status(500).json({ message: 'Internal server error' });
//     }
//   };
const updateQuantity = async (req, res) => {
  try {
    const itemId = req.params.itemId;
    const newQuantity = req.body.quantity;

    // Find the cart item by its ID
    const cartItem = await cartProduct.findById(itemId).populate('productId');

    if (!cartItem) {
      return res.status(404).json({ message: 'Cart item not found' });
    }

    // Find the corresponding product in the product collection
    const product = cartItem.productId;
    const collectionProduct = await products.findById(product._id);

    if (!collectionProduct) {
      return res.status(404).json({ message: 'Product not found' });
    }

    const collectionProductQuantity = collectionProduct.quantity;

    // Check if the requested quantity exceeds the available quantity
    if (newQuantity > collectionProductQuantity) {
      return res.status(400).json({ message: 'Out Of Stock' });
    }

    // Update the quantity of the cart item
    const itemPrice = product.price;
    let priceChange;
    let diff = newQuantity - cartItem.quantity;
    if (newQuantity > cartItem.quantity) {
      // increment
      priceChange = diff * itemPrice; // this to add to the final result
    } else {
      // decrement
      priceChange = -Math.abs(diff * itemPrice);
    }
    cartItem.quantity = newQuantity;
    cartItem.totalPrice = itemPrice * newQuantity;
    const newTotalPrice = cartItem.totalPrice;
    console.log("newTotalPrice:", newTotalPrice);
    // Save the updated cart item
    await cartItem.save();
    req.session.totalPrice = newTotalPrice;
    res.json({ success: true, newQuantity, newTotalPrice, priceChange });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};
  



module.exports={
    showCarts,
  addtocart,
  removecartItem,
  updateQuantity,
}