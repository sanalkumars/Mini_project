const products = require("../models/product")
const userData = require("../models/userLogin")
const category = require("../models/category")
const orders = require("../models/order")
const multer = require("multer")
const coupon = require("../models/coupon")
const Cropper = require('cropperjs');
const banner = require('../models/banner')
// const orders = require("../models/order")

const upload = multer({ dest: "/public/uploads" })

// function for rendering 404 error

const getError = (req, res) => {
  res.render('admin/404')
}


// function to take admin to dashboard
const Login = (req, res) => {

  if (req.session.admin) {
    res.redirect("/admin/dashboard")
  }
  else {
    const msg = "hai"
    res.render("admin/login", { msg })
  }


}

const LoginPost = async (req, res) => {
  const name = process.env.ADMIN_NAME
  const password = process.env.ADMIN_PASSWORD


  if (name === req.body.username && password === req.body.password) {
    req.session.admin = req.body.username
    const msg = req.body.username

    try {
      const order = await orders.find().populate('products.productId').populate('userId')
      console.log(order);
      // Check if any order has been returned
      // const hasReturnedOrder = order.some(order => order.isReturned);

      if (!orders) {
        throw new Error('No orders found');
      }

      res.render('admin/dashboard', { order });
    } catch (error) {
      console.error("error");
      res.redirect("/admin/error")
    }
  }
  else {
    console.log("wrong details");
    res.render("admin/signin", { msg: "invalid user name and password" })

  }
}


const adminHome = async (req, res) => {
  try {
    const order = await orders.find().populate('products.productId').populate("userId")



    if (!orders) {
      throw new Error('No orders found');
    }

    res.render('admin/dashboard', { order });
  } catch (error) {
    console.error("error");
    res.redirect("/admin/error")
  }

}


const getUsersDetails = async (req, res) => {
  try {

    const users = await userData.find();
    res.render('admin/users', { users });

  } catch (err) {
    console.error(err);
    res.redirect("/admin/error")
  }
}

const searchUser = async (req, res) => {
  try {

    const searchQuery = req.query.search || " "
    const msg = 'search result for:'

    // using regex for case insensitive search
    const users = await userData.find({ name: { $regex: searchQuery, $options: 'i' }, })

    res.render("admin/users", { users, msg, searchQuery })
  } catch (error) {
    res.redirect("/admin/error")
  }
}


// function to block the user
const blockUser = async (req, res) => {

  const userId = req.params.id;

  try {
    console.log("inside the try hai")
    const user = await userData.findById(userId)
    if (!user) {
      res.status(404).json({ error: 'User not found' });

    } else {
      user.isBlocked = true
      await user.save()
      //res.status(500).json({ error: 'cannot login in' });
      res.render("admin/users")
    }
  }
  catch (err) {
    console.error(err);
    res.redirect("/admin/error")
  }
}

// function for unblocking the user

const unblockUser = async (req, res) => {
  const userid = req.params.id
  try {
    const user = await userData.findById(userid)
    if (!user) {
      res.redirect("/admin/error")

    } else {
      user.isBlocked = false
      await user.save()
      console.log("user can now login");
      const msg = "unblocked  the specified user"
      //res.send("user can now login")
      console.log(msg);
      res.render("admin/dashboard")
    }
  }
  catch (err) {
    res.redirect("/admin/error")
  }
}



// const logout = (req, res) => {

//   req.session.destroy((err) => {
//     if (err) {
//       console.error(err);
//     }
//     res.render('admin/login');
//   });
// }
const logout = (req, res) => {

   
  console.log('Admin Session Before Destroy:', req.session);
    
    req.session.admin=null;

    res.render('admin/login');
 

};


module.exports =
{
  adminHome,
  getUsersDetails,
  Login,
  LoginPost,
  blockUser,
  unblockUser,
  searchUser,
  logout,
  getError,
}