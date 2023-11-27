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
const secret_Key = process.env.SECRET_KEY


// functions from adminController


// function for getting user orders
const getUserOrder = async (req, res) => {
  try {
    const recentOrders = await orders.find()
      .sort({ orderDate: -1 })
      .populate({
        path: 'products.productId',
        model: 'products'
      })
      .populate({
        path: 'userId',
        model: 'userData',
        select: 'name',
      })
      .exec();

    console.log("Recent order user name is:", recentOrders);

    if (!recentOrders || recentOrders.length === 0) {
      throw new Error('No orders found');
    }
    

    res.render('admin/orderManage', { order: recentOrders });
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
};

  

  const updateUserOrder = async (req, res) => {
    try {
      const orderId = req.params.orderId;
      const newStatus = req.params.newStatus;
  
  
      const updatedOrder = await orders.findByIdAndUpdate(
        orderId,
        { status: newStatus },
        { new: true } // Set to true to return the updated order
      );
  
      if (updatedOrder) {
  
        // Order status updated successfully
        res.json({ success: true });
      } else {
        // Order not found or status update failed
        res.json({ success: false });
      }
    } catch (error) {
      console.error(error);
      res.status(500).json({ success: false });
    }
  
  }

const viewdetails = async (req, res) => {
  try {
    const orderId = req.params.orderId; // Get orderId from URL parameters

    // Find the order by its ID
    const order = await orders.findById(orderId).populate('products.productId').populate('addressId');
    console.log(order);

    if (!order) {
      res.redirect('/admin/error') // Handle case where order is not found
    }

    // Render the EJS template and pass the order data
    res.render('admin/viewdetails', { order });
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
};


// functions from userController


// order page 

// function for  order confirmation
const getCheckOut = async (req, res) => {
  try {
    const user = await userData.findOne({ email: req.session.user });
    req.session.userDetails = user;

    // Fetch user's wallet balance
    const userWallet = await Wallet.findById(user.wallet);
    console.log("user wallet is :",userWallet);

    const cartItems = await cartProduct.find({ userId: user._id }).populate('productId');
    req.session.productDetails = cartItems;
    const products = cartItems.map((item) => ({ productId: item.productId, quantity: item.quantity }));

   

    const address = await Address.find({ userId: user._id });
    const totalPrice = req.session.totalPrice;
    const grantTotal = totalPrice;
    console.log("hello123456");
    // const coupons = await coupon.find({ appliedUsers: { $nin: [user._id] } });
    const currentDate = new Date();
const coupons = await coupon.find({
  appliedUsers: { $nin: [user._id] },
  expiryDate: { $gte: currentDate.toISOString() }
});

    
     console.log("hello123456");
    // Check if cartItems is empty
    if (cartItems.length === 0) {
      // Redirect to cart page with alert message
      return res.redirect('/cart?alert=emptyCart');
    }

    // Pass the wallet balance to the frontend
    res.render('user/checkout', { user, products, totalPrice, address, coupons, grantTotal, userWallet });
  } catch (error) {
    console.log(error);
    res.status(500).send('Internal Server Error');
  }
};

    
 
   // function for generating oderId with prefix "ODR"
function generateOrderId() {
  const prefix = 'ODR_';
  const randomNumbers = Math.floor(1000 + Math.random() * 9000); // Generate a random 4-digit number
  const orderId = `${prefix}${randomNumbers}`;
  return orderId;
}


let order;

// function for storing cart order in the database 
const processOrder = async (req, res) => {
  try {
    console.log("inside the processOrder function");
    const user = await userData.findOne({ email: req.session.user }).populate('wallet');
    const userId = user._id;
    console.log("the full details of user is :", user);

    const { address, paymentMethod, totalPrice, grantTotal, couponDiscount } = req.body;

    console.log(grantTotal);
    console.log(couponDiscount);

    const cartItems = await cartProduct.find({ userId: user._id }).populate('productId');

    // renamed products to productdata
    const productdata = cartItems.map((item) => ({
      productId: item.productId,
      quantity: item.quantity,
    }));

    const orderId = generateOrderId()
    console.log("the coustome orderId is :",orderId);


    order = new orders({
      orderId,
      userId,
      paymentMethod,
      addressId: address,
      products:productdata ,
      totalPrice,
      grantTotal,
      couponDiscount,
    });

    if (paymentMethod === "netBanking") {
      var instance = new Razorpay({
        key_id: process.env.SECRET_ID,
        key_secret: process.env.SECRET_KEY,
      });

      var options = {
        amount: Math.round(grantTotal * 100), // amount in paise (smallest currency unit) put granttotal here instead of totalprice 
        currency: "INR",
        receipt: "order_rcptid_11",
      };

      instance.orders.create(options, function (err, order) {
        if (err) {
          console.error('Razorpay order creation error:', err);

          res.status(500).json({ success: false, message: 'Error creating Razorpay order' });
        }
        else {
          res.json({ id: order.id, amount: order.amount, currency: order.currency });
        }
      });
    }


    else if (paymentMethod === "cashOnDelivery") {
      await order.save();


      const cartItems = await cartProduct.find({ userId: user._id }).populate('productId');

        const productdata = cartItems.map((item) => ({
          productId: item.productId,
          quantity: item.quantity,
        }));

        for (const productInfo of productdata) {
          const productId = productInfo.productId;
          const quantity = productInfo.quantity;

          // Find the product and update the quantity
          const product = await products.findById(productId);
          console.log(productId);

          if (!product) {
            throw new Error(`Product with ID ${productId} not found`);
          }

          // Update the quantity of the product
          product.quantity -= quantity;
          await product.save();
        }


      await cartProduct.deleteMany({ userId: user._id });

      res.json({ success: true, redirectUrl: '/ordersuccess' });

    }



    else if (paymentMethod === 'wallet') {
      console.log('hello inside wallet');
    
      if (order.grantTotal <= user.wallet.balance) {
        await order.save()
        const transactionAmount = -grantTotal; // Debit from the wallet
        const transactionType = 'Debit';
    
        // Update the wallet balance
        user.wallet.balance -= grantTotal;
    
        // Add a new transaction to the 'transactions' array
        user.wallet.transactions.push({
          amount: transactionAmount,
          type: transactionType,
        });
    
        // Save the changes to the wallet
        await user.wallet.save();

        const cartItems = await cartProduct.find({ userId: user._id }).populate('productId');

        const productdata = cartItems.map((item) => ({
          productId: item.productId,
          quantity: item.quantity,
        }));

        for (const productInfo of productdata) {
          const productId = productInfo.productId;
          const quantity = productInfo.quantity;

          // Find the product and update the quantity
          const product = await products.findById(productId);
          console.log(productId);

          if (!product) {
            throw new Error(`Product with ID ${productId} not found`);
          }

          // Update the quantity of the product
          product.quantity -= quantity;
          await product.save();
        }
        await cartProduct.deleteMany({ userId: user._id });

        res.json({ success: true, redirectUrl: '/ordersuccess' });
      } else {
        // res.json({ success: false, message: 'Insufficient balance in the wallet' });
        return res.redirect("/orderconfirm");
      }
      
    }
  }
  catch (error) {
    console.error('Error:', error);
    res.status(500).json({ success: false, message: 'An error occurred while processing the order' });
  }
};
 
   // Controller function to retrieve and render orders
const getMyOrder = async (req, res) => {
  if(req.session.user)
  {
    try {
      const user = await userData.findOne({ email: req.session.user });
      console.log(user);
      const address = await Address.find({ userId: user._id })
  
      const userId = user._id;
      const recentOrders = await orders.aggregate([
        { $match: { userId } },
        { $sort: { orderDate: -1 } }, // (most recent first)
        { $lookup: { from: 'products', localField: 'products.productId', foreignField: '_id', as: 'products' } },
      ]).exec();
  
      res.render('user/myorder', { user, address, order:recentOrders })
  
  
      // Render the 'myorder' view and pass the order data to it
  
  
    } catch (error) {
      console.error(error);
      res.status(500).send('Internal Server Error');
    }
  }else{
    res.redirect("/login")
  }
 
};



const cancelOrder = async (req, res) => {
  const orderId = req.params.id;
  console.log("id of the order to cancel", orderId);

  try {
    const order = await orders.findById(orderId);

    if (!order) {
      throw new Error('Order not found');
    }

    if (req.method === 'POST') {
      const cancelReason = req.body.cancelReason;
      // Validate and handle cancel reason as needed

      // Update order with cancel reason
      order.cancelReason = cancelReason;
    }

    // Loop through the products in the order
    for (const productInfo of order.products) {
      const productId = productInfo.productId;
      const quantity = productInfo.quantity;

      // Find the product and update the quantity
      const product = await products.findById(productId);

      if (!product) {
        throw new Error(`product with ID ${productId} not found`);
      }

      // Update the quantity of the product
      product.quantity += quantity;
      await product.save();
    }

    // Update order status to 'Cancelled'
    order.status = 'Cancelled';
    await order.save();

    const user = await userData.findOne({ email: req.session.user }).populate('wallet');

    if (user) {
      const totalPrice = order.totalPrice;

      if (user.wallet) {
        if (order.paymentMethod !== 'cashOnDelivery') {
          // Add the refunded amount to the wallet transactions
          user.wallet.transactions.push({
            amount: totalPrice,
            type: 'Credit',
          });

          // Update the wallet balance
          user.wallet.balance += totalPrice;
          await user.wallet.save();
        }
      } else {
        const newWallet = new Wallet({ balance: totalPrice });
        // Add the refunded amount to the wallet transactions
        newWallet.transactions.push({
          amount: totalPrice,
          type: 'Credit',
        });

        await newWallet.save();
        user.wallet = newWallet;
      }

      await user.save();
    }

    res.redirect("/myorders");
  } catch (err) {
    console.log(err);
    res.render('user/error')
  }
}
  
// function for saving the order  

const orderSucess = (req, res) => {
  console.log("inside order success");
  res.render("user/orderSucess")

}


const saveOrder = async (req, res) => {

  console.log("the order is :", order);
  await order.save()

  //reducing product quantity


  console.log("order saved and cart is emptyed");
  // setting cart to null
  const user = await userData.findOne({ email: req.session.user })

  console.log("user is :", user);



  const cartItems = await cartProduct.find({ userId: user._id }).populate('productId');

  const productdata = cartItems.map((item) => ({
    productId: item.productId,
    quantity: item.quantity,
  }));

  for (const productInfo of productdata) {
    const productId = productInfo.productId;
    const quantity = productInfo.quantity;

    // Find the product and update the quantity
    const product = await products.findById(productId);
    console.log(productId);

    if (!product) {
      throw new Error(`Product with ID ${productId} not found`);
    }

    // Update the quantity of the product
    product.quantity -= quantity;
    await product.save();
  }


  await cartProduct.deleteMany({ userId: user._id });
  res.json({
    success : true
  })

}   

const orderdetails = async (req, res) => {
  try {
    const orderId = req.params.orderId; // Get orderId from URL parameters

    // Find the order by its ID
    const order = await orders.findById(orderId).populate('products.productId').populate('addressId');
    console.log(order);
    if (!order) {
      return res.status(404).send('Order not found'); // Handle case where order is not found
    }

    // Render the EJS template and pass the order data
    res.render('user/orderdetails', { order });
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
}; 
  
const downloadInvoice=async (req, res) => {
  try {
    console.log("inside download invoice");
    const orderId = req.params.orderId;
    console.log("order is is:",orderId);
    const order = await orders.findById(orderId).populate('userId').populate('addressId').populate('products.productId');
     console.log("invoice order is :",order);
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    res.json(order);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};


module.exports={
    //functions from adminController
    getUserOrder,
    updateUserOrder,
    viewdetails,
// functions from UserController

  getCheckOut,
  orderSucess,
  getMyOrder,
  cancelOrder,
  processOrder,
  orderdetails,
  saveOrder,
  downloadInvoice,

}