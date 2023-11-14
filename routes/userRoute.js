const express= require('express')

const router = express.Router()

const userController = require('../controller/userController')
const userauthentication = require('../middleware/userAuthentication')


// route for user

router.get("/",userController.userHome)

router.get("/login",userController.login)
router.post("/login",userController.loginPost)

//route for forgotpassword
router.get("/getforgotpassword",userController.getforgotPass)
router.post("/forgotpassword",userController.forgotPass)
// router.get("/updatepassword",userController.getchangePass)
// router.post("/changepassword",userController.updatePassword)
router.get("/changepassword",userController.changepassword)
router.post("/changepasswordpost",userController.changepasswordpost)

router.get("/signup",userController.signup)
router.post("/signup",userController.signupPost)
// route for otp generating

router.post("/verifyOTP",userController.verifyOTP)
router.post("/resendOTP",userController.resendOTP)

router.get("/signout",userController.signOut)


// route for user to view products added by admin
router.get("/products",userController.getProducts)
//route for gettingthe single product
router.get("/singleproduct/:id",userController.getSingleProduct)

router.get("/home",userController.userHome)
router.get("/productss",userController.userproductss)

router.get("/search",userController.searchProduct)

// routes for cart
router.get("/cart",userController.showCarts)
router.post("/cart",userController.addtocart)
router.post("/cart/remove/:itemId",userController.removecartItem)
router.post("/quantityUpdate/:itemId",userController.updateQuantity)

// route for order confirmation adding single order
router.get("/orderconfirm",userController.getCheckOut)
// router.post("/orderconfirm/:id",userController.confirmOrder)

// route for order confirmation for cart items
router.post("/processOrder",userController.processOrder)


//route for getting order
router.get("/myorders",userController.getMyOrder)
router.post('/cancelorder/:id', userController.cancelOrder);

// payment method route
router.get("/paymentmethod",userController.paymentMethod)
router.get('/ordersuccess',userController.orderSucess)

router.post('/saveOrder',userController.saveOrder)
// route for user profile
router.get("/profile",userauthentication.isBlock,userauthentication.userauthentication,userController.getProfile)

//  address routes
router.get("/myaddress",userController.getAddress)
// routes for showing address & new address
router.get("/addAddress",userController.showAddress)
router.post("/addAddress",userController.addAddress)
router.post("/updateAddress/:id",userController.updateAddress)

//route for editing existing address
router.get("/editAddress/:id",userController.editAddress)

// route for applying coupon
router.post("/applyCoupon", userController.applyCoupon)

router.get('/orderdetails/:orderId', userController.orderdetails);
//route for invoice download
router.get('/downloadInvoice/:orderId',userController.downloadInvoice)


module.exports= router;