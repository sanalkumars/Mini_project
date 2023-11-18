const express = require("express")
const { getUsers } = require("../controller/adminController")
const router = express.Router()
const multer = require("multer")

const adminController = require("../controller/adminController")

const upload = multer({ dest: "public/uploads" })

const adminauthenticaton = require("../middleware/adminAuthentication")


router.get("/", adminController.Login)

router.get("/dashboard",adminauthenticaton.adminauthenticaton,  adminController.adminHome)
//  router.get("/dashboard",adminController.adminHome)

router.get("/users",adminauthenticaton.adminauthenticaton, adminController.getUsersDetails)
//route for searching user
router.get("/search",adminauthenticaton.adminauthenticaton, adminController.searchUser)


router.post("/login", adminController.LoginPost)

router.get("/products",adminauthenticaton.adminauthenticaton, adminController.seeProducts)
//route for adding new products
router.get("/add",adminauthenticaton.adminauthenticaton, adminController.getProducts)
router.post("/add",adminauthenticaton.adminauthenticaton, adminController.addProducts)

router.get("/addproducts",adminauthenticaton.adminauthenticaton, adminController.getProducts)
router.post("/addproducts",adminauthenticaton.adminauthenticaton, upload.fields([{
    name: 'image', maxCount: 1
}, {
    name: 'additionalimages', maxCount: 3
}]), adminController.addProducts)
// route for deleting products .

router.get("/delete/:id",adminauthenticaton.adminauthenticaton, adminController.deleteProduct)

// route for editing products
router.get("/editproducts/:id",adminauthenticaton.adminauthenticaton, adminController.getEditProduct)
router.post('/editproducts/:id',adminauthenticaton.adminauthenticaton, upload.fields([{
    name: 'image', maxCount: 1
}, {
    name: 'additionalimages', maxcount: 3
}]), adminController.updateProduct)

// route for block user
router.get("/block/:id",adminauthenticaton.adminauthenticaton, adminController.blockUser)

//route for unblocking user
router.get("/unblock/:id",adminauthenticaton.adminauthenticaton, adminController.unblockUser)

// route for getting categories
router.get("/category",adminauthenticaton.adminauthenticaton, adminController.getCategory)
router.get("/edit/:id",adminController.editCategory)
router.post('/editcategorypost/:id', adminController.editCategoryPost);
router.get("/deletecategory/:id",adminauthenticaton.adminauthenticaton, adminController.deletecategory)

//route for admin logout
router.get("/logout",adminauthenticaton.adminauthenticaton, adminController.logout)

router.post("/addcategory",adminauthenticaton.adminauthenticaton, adminController.addCategory)

// route for getting user order
router.get("/orderManagement",adminauthenticaton.adminauthenticaton, adminController.getUserOrder)
router.post("/updateOrderStatus/:orderId/:newStatus",adminauthenticaton.adminauthenticaton, adminController.updateUserOrder)
// router.get("/editUserOrder/",adminController.geteditOrderForm)
// router.post("/editUserOrder",adminController.editUserOrder)


// route for  adding coupen 
router.get("/coupons",adminauthenticaton.adminauthenticaton, adminController.getCoupon);
router.get("/addCoupons",adminauthenticaton.adminauthenticaton, adminController.getaddCoupon)
router.post("/addCoupons",adminauthenticaton.adminauthenticaton, adminController.addCoupon)

router.get("/viewdetails/:orderId",adminauthenticaton.adminauthenticaton, adminController.viewdetails);

// route for sails report
router.get("/chart",adminauthenticaton.adminauthenticaton, adminController.getChart)
router.get("/chartData",adminauthenticaton.adminauthenticaton, adminController.chart)

//route for error
router.get('/error',adminController.getError)

// route for banner
router.get('/banners',adminauthenticaton.adminauthenticaton, adminController.getbanner);
router.get('/addBanner',adminauthenticaton.adminauthenticaton, adminController.addBanner);
router.post('/addBanner',adminauthenticaton.adminauthenticaton, upload.single('image'), adminController.addBannerPost);
router.post('/deleteBanner/:id',adminauthenticaton.adminauthenticaton, adminController.deleteBanner); // Add this line

// route for category offer
router.get('/sendCategoryOffer',adminauthenticaton.adminauthenticaton, adminController.sendCategoryOffer);
router.post('/applyOffer',adminauthenticaton.adminauthenticaton, adminController.applyOffer);


module.exports = router