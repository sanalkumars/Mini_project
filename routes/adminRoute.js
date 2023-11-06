const express= require("express")
const { getUsers } = require("../controller/adminController")
const router = express.Router()
const multer= require("multer")

const adminController = require("../controller/adminController")

const upload=multer({dest:"public/uploads"})



 router.get("/",adminController.Login)

 router.get("/dashboard",adminController.adminHome)
//  router.get("/dashboard",adminController.adminHome)

 router.get("/users",adminController.getUsersDetails)
//route for searching user
router.get("/search",adminController.searchUser)


 router.post("/login",adminController.LoginPost)

router.get("/products",adminController.seeProducts)
//route for adding new products
router.get("/add",adminController.getProducts)
router.post("/add",adminController.addProducts)

router.get("/addproducts",adminController.getProducts)
router.post("/addproducts", upload.fields([{
    name:'image',maxCount:1
},{
    name:'additionalimages',maxCount:3
}]),adminController.addProducts)
// route for deleting products .

router.get("/delete/:id",adminController.deleteProduct)

// route for editing products
router.get("/editproducts/:id",adminController.getEditProduct)
router.post('/editproducts/:id',upload.fields([{
    name:'image',maxCount:1},{
    name:'additionalimages',maxcount:3 }]), adminController.updateProduct)

// route for block user
router.get("/block/:id",adminController.blockUser)

//route for unblocking user
router.get("/unblock/:id",adminController.unblockUser)

// route for getting categories
router.get("/category",adminController.getCategory)

router.get("/deletecategory/:id",adminController.deletecategory)
//route for admin logout
router.get("/logout",adminController.logout)
router.post("/addcategory",adminController.addCategory)

// route for getting user order
router.get("/orderManagement",adminController.getUserOrder)
router.post("/updateOrderStatus/:orderId/:newStatus",adminController.updateUserOrder)
// router.get("/editUserOrder/",adminController.geteditOrderForm)
// router.post("/editUserOrder",adminController.editUserOrder)


// route for  adding coupen 
router.get("/coupons", adminController.getCoupon);
router.get("/addCoupons",adminController.getaddCoupon)
router.post("/addCoupons",adminController.addCoupon)

router.get("/viewdetails/:orderId", adminController.viewdetails);

module.exports = router