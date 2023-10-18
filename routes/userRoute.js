const express= require('express')

const router = express.Router()

const userController = require('../controller/userController')


// route for user

router.get("/",userController.userHome)

router.get("/login",userController.login)
router.post("/login",userController.loginPost)


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

module.exports= router;