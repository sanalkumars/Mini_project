const express= require("express")
const { getUsers } = require("../controller/adminController")
const router = express.Router()
const multer= require("multer")

const adminController = require("../controller/adminController")

const upload=multer({dest:"public/uploads"})



 router.get("/",adminController.Login)

 router.get("/home",adminController.adminHome)
 router.get("/dashboard",adminController.adminHome)

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

//route for admin logout
router.get("/logout",adminController.logout)
router.post("/addcategory",adminController.addCategory)


module.exports = router