const express= require('express')

const router = express.Router()

const userController = require('../controller/userController')


// route for user

router.get("/",userController.userHome)

router.get("/login",userController.login)
router.post("/login",userController.loginPost)

//route for forgotpassword
router.get("/getforgotpassword",userController.getforgotPass)
router.post("/forgotpassword",userController.forgotPass)
router.get("/updatepassword",userController.getchangePass)
router.post("/changepassword",userController.updatePassword)


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
router.post("/orderconfirm/:id",userController.confirmOrder)


//route for getting order
router.get("/myorder",userController.getMyOrder)
router.get("/cancelorder/:id",userController.cancelOrder)

// payment method route
router.get("/paymentmethod",userController.paymentMethod)
router.get('/ordersucess',userController.orderSucess)


// route for user profile
router.get("/profile",userController.getProfile)

//  address routes
router.get("/myaddress",userController.getAddress)
// routes for showing address & new address
router.get("/addAddress",userController.showAddress)
router.post("/addAddress",userController.addAddress)
router.post("/profile/updateAddress",userController.updateAddress)

//route for editing existing function
router.get("/editAddress",userController.editAddress)



module.exports= router;