const express = require("express")
const { getUsers } = require("../controller/adminController")
const router = express.Router()
const multer = require("multer")


const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, "public/uploads"); // Specifying the destination folder for uploaded images
    },
    filename: (req, file, cb) => {
      cb(null, Date.now() + "-" + file.originalname); // Generate a unique filename
    },
  });
  
//   const upload = multer({ storage });

const adminController = require("../controller/adminController")
const orderController = require('../controller/orderController')
const productController = require('../controller/productController')
const cartControllers = require('../controller/cartController')
const offerController = require('../controller/offerController')
const couponController = require('../controller/couponController')
const categoryController= require('../controller/categoryController')
const bannerController= require('../controller/bannerController')
const chartController = require('../controller/chartController')


const upload = multer({ dest: "public/uploads" })

const adminauthenticaton = require("../middleware/adminAuthentication")

//routes for adminController
router.get("/", adminController.Login)
router.get("/dashboard",adminauthenticaton.adminauthenticaton,  adminController.adminHome)
router.get("/users",adminauthenticaton.adminauthenticaton, adminController.getUsersDetails)
router.get("/search",adminauthenticaton.adminauthenticaton, adminController.searchUser)
router.post("/login", adminController.LoginPost)
router.get("/block/:id",adminauthenticaton.adminauthenticaton, adminController.blockUser)
router.get("/unblock/:id",adminauthenticaton.adminauthenticaton, adminController.unblockUser)
router.get("/logout",adminauthenticaton.adminauthenticaton, adminController.logout)
router.get('/error',adminController.getError)


//routes for productController

router.get("/products",adminauthenticaton.adminauthenticaton, productController.seeProducts)
router.get("/add",adminauthenticaton.adminauthenticaton, productController.getProducts)
router.get("/viewSingleProduct/:id",adminauthenticaton.adminauthenticaton, productController.viewSingleProduct)
router.post("/add",adminauthenticaton.adminauthenticaton, productController.addProducts)
router.get("/addproducts",adminauthenticaton.adminauthenticaton, productController.getProducts)
router.post("/addproducts",adminauthenticaton.adminauthenticaton, upload.fields([{ name: 'image', maxCount: 1}, {name: 'additionalimages', maxCount: 3
}]), productController.addProducts)
router.get("/delete/:id",adminauthenticaton.adminauthenticaton, productController.deleteProduct)
router.get("/editproducts/:id",adminauthenticaton.adminauthenticaton, productController.getEditProduct)
router.post('/editproducts/:id',adminauthenticaton.adminauthenticaton, upload.fields([{
    name: 'image', maxCount: 1
}, {
    name: 'additionalimages', maxcount: 3
}]), productController.updateProduct)




// route for getting categoryController

router.get("/category",adminauthenticaton.adminauthenticaton, categoryController.getCategory)
router.get("/edit/:id",categoryController.editCategory)
router.post('/editcategorypost/:id', categoryController.editCategoryPost);
router.get("/deletecategory/:id",adminauthenticaton.adminauthenticaton, categoryController.deletecategory)
router.post("/addcategory",adminauthenticaton.adminauthenticaton, categoryController.addCategory)


// route for  orderController
router.get("/orderManagement",adminauthenticaton.adminauthenticaton, orderController.getUserOrder)
router.post("/updateOrderStatus/:orderId/:newStatus",adminauthenticaton.adminauthenticaton, orderController.updateUserOrder)
router.get("/viewdetails/:orderId",adminauthenticaton.adminauthenticaton, orderController.viewdetails);




// route for coupenController 
router.get("/coupons",adminauthenticaton.adminauthenticaton, couponController.getCoupon);
router.get("/addCoupons",adminauthenticaton.adminauthenticaton, couponController.getaddCoupon)
router.post("/addCoupons",adminauthenticaton.adminauthenticaton, couponController.addCoupon)
router.get("/deleteCoupon/:id",adminauthenticaton.adminauthenticaton,couponController.deleteCoupon)


// route for chartController
router.get("/chart",adminauthenticaton.adminauthenticaton, chartController.getChart)
router.get("/chartData",adminauthenticaton.adminauthenticaton, chartController.chart)



// route for bannerController
router.get('/banners',adminauthenticaton.adminauthenticaton, bannerController.getbanner);
router.get('/addBanner',adminauthenticaton.adminauthenticaton, bannerController.addBanner);
router.post('/addBanner',adminauthenticaton.adminauthenticaton, upload.single('image'), bannerController.addBannerPost);
router.post('/deleteBanner/:id',adminauthenticaton.adminauthenticaton, bannerController.deleteBanner); 


// route for category offerController
router.get('/sendCategoryOffer',adminauthenticaton.adminauthenticaton, offerController.sendCategoryOffer);
router.post('/applyOffer',adminauthenticaton.adminauthenticaton, offerController.applyOffer);


module.exports = router