const express= require('express')

const router = express.Router()

const userController = require('../controller/userController')
const userauthentication = require('../middleware/userAuthentication')
const orderController = require('../controller/orderController')
const productController = require('../controller/productController')
const cartControllers = require('../controller/cartController')
const walletController = require('../controller/walletController')
const profileController = require('../controller/profileController')
const offerController = require('../controller/offerController')
const addressController =require('../controller/addressController')
const couponController = require('../controller/couponController')


// route for userController

router.get("/",userController.userHome)
router.get("/login",userController.login)
router.post("/login",userController.loginPost)
router.get("/signup",userController.signup)
router.post("/signup",userController.signupPost)
router.get("/otp",userController.otpsend)

// route for otp generating
router.post("/verifyOTP",userController.verifyOTP)
router.post("/resendOTP",userController.resendOTP)
router.get("/signout",userController.signOut)
router.get("/home",userauthentication.isBlock,userauthentication.userauthentication,userController.userHome)
router.get("/getforgotpassword",userController.getforgotPass)
router.post("/forgotpassword",userController.forgotPass)




// route for user profileController
router.get("/profile",userauthentication.isBlock,userauthentication.userauthentication,profileController.getProfile)

router.get("/changepassword",userauthentication.isBlock,userauthentication.userauthentication,profileController.changepassword)
router.post("/changepasswordpost",userauthentication.isBlock,userauthentication.userauthentication,profileController.changepasswordpost)







// route for user to view products added by admin/productController
router.get("/products",productController.getProductss)
router.get('/filteredProducts/:category',productController.getFilteredProducts);
router.get("/singleproduct/:id",productController.getSingleProduct)
router.get("/productss",userauthentication.isBlock,userauthentication.userauthentication,productController.userproductss)
router.get("/search",productController.searchProduct)




// routes for cartController
router.get("/cart",userauthentication.userauthentication,userauthentication.isBlock,cartControllers.showCarts)
router.post("/cart",userauthentication.userauthentication,cartControllers.addtocart)
router.post("/cart/remove/:itemId",userauthentication.isBlock,userauthentication.userauthentication,cartControllers.removecartItem)
router.post("/quantityUpdate/:itemId",userauthentication.isBlock,userauthentication.userauthentication,cartControllers.updateQuantity)

// route for orderController
router.get("/orderconfirm",userauthentication.isBlock,userauthentication.userauthentication,orderController.getCheckOut)
router.post("/processOrder",userauthentication.isBlock,userauthentication.userauthentication,orderController.processOrder)
router.get("/myorders",userauthentication.isBlock,userauthentication.userauthentication,orderController.getMyOrder)
router.post('/cancelorder/:id',userauthentication.isBlock,userauthentication.userauthentication, orderController.cancelOrder);
router.get('/ordersuccess',userauthentication.isBlock,userauthentication.userauthentication,orderController.orderSucess)
router.post('/saveOrder',userauthentication.isBlock,userauthentication.userauthentication,orderController.saveOrder)
router.get('/orderdetails/:orderId', userauthentication.isBlock,userauthentication.userauthentication,orderController.orderdetails);
router.get('/downloadInvoice/:orderId',userauthentication.isBlock,userauthentication.userauthentication,orderController.downloadInvoice)





//  addressController routes

router.get("/myaddress",userauthentication.isBlock,userauthentication.userauthentication,addressController.getAddress)
router.get("/addAddress",userauthentication.isBlock,userauthentication.userauthentication,addressController.showAddress)
router.post("/addAddress",userauthentication.isBlock,userauthentication.userauthentication,addressController.addAddress)
router.post("/updateAddress/:id",userauthentication.isBlock,userauthentication.userauthentication,addressController.updateAddress)
router.get("/editAddress/:id",userauthentication.isBlock,userauthentication.userauthentication,addressController.editAddress)


// route for  couponController
router.post("/applyCoupon",userauthentication.isBlock,userauthentication.userauthentication, couponController.applyCoupon)

//route for invoice download

// route for walletHistory
router.get('/wallethistory',userauthentication.isBlock,userauthentication.userauthentication,walletController.wallethistory)

//route for offerController
router.post('/claimReference', userauthentication.isBlock,userauthentication.userauthentication,offerController.claimReferenceCode);


module.exports= router;