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
router.get("/changepassword",userauthentication.isBlock,userauthentication.userauthentication,userController.changepassword)
router.post("/changepasswordpost",userauthentication.isBlock,userauthentication.userauthentication,userController.changepasswordpost)

router.get("/signup",userController.signup)
router.post("/signup",userController.signupPost)
// route for otp generating

router.post("/verifyOTP",userController.verifyOTP)
router.post("/resendOTP",userController.resendOTP)

router.get("/signout",userController.signOut)


// route for user to view products added by admin
router.get("/products",userauthentication.isBlock,userauthentication.userauthentication,userController.getProducts)
router.get('/filteredProducts/:category',userauthentication.isBlock,userauthentication.userauthentication, userController.getFilteredProducts);

//route for gettingthe single product
router.get("/singleproduct/:id",userauthentication.isBlock,userauthentication.userauthentication,userController.getSingleProduct)

router.get("/home",userauthentication.isBlock,userauthentication.userauthentication,userController.userHome)
router.get("/productss",userauthentication.isBlock,userauthentication.userauthentication,userController.userproductss)

router.get("/search",userauthentication.isBlock,userauthentication.userauthentication,userController.searchProduct)

// routes for cart
router.get("/cart",userauthentication.isBlock,userauthentication.userauthentication,userController.showCarts)
router.post("/cart",userauthentication.isBlock,userauthentication.userauthentication,userController.addtocart)
router.post("/cart/remove/:itemId",userauthentication.isBlock,userauthentication.userauthentication,userController.removecartItem)
router.post("/quantityUpdate/:itemId",userauthentication.isBlock,userauthentication.userauthentication,userController.updateQuantity)

// route for order confirmation adding single order
router.get("/orderconfirm",userauthentication.isBlock,userauthentication.userauthentication,userController.getCheckOut)
// router.post("/orderconfirm/:id",userController.confirmOrder)

// route for order confirmation for cart items
router.post("/processOrder",userauthentication.isBlock,userauthentication.userauthentication,userController.processOrder)


//route for getting order
router.get("/myorders",userauthentication.isBlock,userauthentication.userauthentication,userController.getMyOrder)
router.post('/cancelorder/:id',userauthentication.isBlock,userauthentication.userauthentication, userController.cancelOrder);

// payment method route
router.get('/ordersuccess',userauthentication.isBlock,userauthentication.userauthentication,userController.orderSucess)

router.post('/saveOrder',userauthentication.isBlock,userauthentication.userauthentication,userController.saveOrder)
// route for user profile
router.get("/profile",userauthentication.isBlock,userauthentication.userauthentication,userController.getProfile)

//  address routes
router.get("/myaddress",userauthentication.isBlock,userauthentication.userauthentication,userController.getAddress)
// routes for showing address & new address
router.get("/addAddress",userauthentication.isBlock,userauthentication.userauthentication,userController.showAddress)
router.post("/addAddress",userauthentication.isBlock,userauthentication.userauthentication,userController.addAddress)
router.post("/updateAddress/:id",userauthentication.isBlock,userauthentication.userauthentication,userController.updateAddress)

//route for editing existing address
router.get("/editAddress/:id",userauthentication.isBlock,userauthentication.userauthentication,userController.editAddress)

// route for applying coupon
router.post("/applyCoupon",userauthentication.isBlock,userauthentication.userauthentication, userController.applyCoupon)

router.get('/orderdetails/:orderId', userauthentication.isBlock,userauthentication.userauthentication,userController.orderdetails);
//route for invoice download
router.get('/downloadInvoice/:orderId',userauthentication.isBlock,userauthentication.userauthentication,userController.downloadInvoice)

router.get('/wallethistory',userauthentication.isBlock,userauthentication.userauthentication,userController.wallethistory)
router.post('/claimReference', userauthentication.isBlock,userauthentication.userauthentication,userController.claimReferenceCode);


module.exports= router;