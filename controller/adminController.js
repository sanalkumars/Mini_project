const products =require("../models/product")
const userData =require("../models/userLogin")
const category = require("../models/category")
const orders = require("../models/order")
const multer= require("multer")
const coupon = require("../models/coupon")
// const orders = require("../models/order")

const upload = multer({dest:"/public/uploads"})

// function to take admin to dashboard


const Login= (req,res)=>{
     
    if(req.session.admin)
    {
        res.redirect("/admin/dashboard")
    }
    else{
        const msg="hai"
     res.render("admin/login",{msg})
    }

    
}

const LoginPost = async(req,res)=>{
    const name='admin'
    const password ='admin'

   
    if(name===req.body.username && password===req.body.password)
    {
        req.session.admin=req.body.username
        const msg =req.body.username
       
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
            res.status(500).send('Internal Server Error');
       }
    }
    else{
        console.log("wrong details");
        res.render("admin/signin",{msg:"invalid user name and password"})

    }
}


const adminHome =async(req,res)=>{
    try {
        const order = await orders.find().populate('products.productId').populate("userId")
        
        

        if (!orders) {
            throw new Error('No orders found');
        }

        res.render('admin/dashboard', { order });
    } catch (error) {
        console.error("error");
        res.status(500).send('Internal Server Error');
   }
    
}


const getUsersDetails = async (req,res)=>{
    try {
        
        const users = await userData.find(); 
        res.render('admin/users', { users }); 
        
    } catch (err) {
        console.error(err);
        res.status(500).send('Internal Server Error');
    }
}

const searchUser = async(req,res)=>{
    try {
        
        const searchQuery = req.query.search||" "
        const msg='search result for:'
       
        // using regex for case insensitive search
        const users = await userData.find({name:{ $regex:searchQuery, $options : 'i' },})
        
        res.render("admin/users",{users,msg,searchQuery})
    } catch (error)
     {
        res.status(500).send("internal server error")
    }
}



//function for admin to see the products
const seeProducts = async (req,res)=>{
    try{
        
        const product= await products.find()
        res.render("admin/products",{product})
       
    }
    catch(err){
          console.log(err);
          res.status(500).send("internal server error")
    }
}

// function to get the product adding form

const getProducts = async(req,res)=>{
     try{
        const categories = await category.find()
        res.render("admin/addproducts",{categories})
     }
     catch(error)
     {
        console.log(error);
     res.status(500).send("internal server error")
     }
    
}




const addProducts = async (req, res) => {
   
        
        // Accessing the data submitted through the form
        const { name, category,description, price,quantity } = req.body;
        const image = req.files.image[0] ? req.files.image[0].filename : '';
       
        //const additionalimages = req.files.addionalimages ? req.file.addionalimages.map(file=>file.filename):[]
          const additionalimages = req.files.additionalimages ? req.files.additionalimages.map(file => file.filename) : [];
       
          console.log(additionalimages);
       
        if (!image || additionalimages.length === 0) {
            // Handle the case where image and additional images are required
            return res.status(400).json({ error: 'Image and additional images are required.' });
        }
          
        try {
         // Creating a new product

         const newProduct = new products({ name, category,description, price,quantity,image,additionalimages });
         
         // Adding the new product to the collection
         await newProduct.save();
       
        
        res.redirect('/admin/dashboard'); 
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

// function for deleteing products
const deleteProduct =async (req,res)=>{
   
   try {
     
     const productId = req.params.id
     await products.findByIdAndUpdate(productId,{status:"deleted"})
    
      const product=await products.find({status:'active'})
     res.render("admin/products",{product})
   } 
   catch (error)
    {
    res.status(500).send('internal server error')
   }
}
// function to get editproduct form
const getEditProduct =async (req,res)=>{
    // add session later
   try {
      const productId=req.params.id
      

      const product= await products.findById(productId)
      
      if (!product) 
      {
        return res.status(404).send('user not found')
        
      } else{
        
      res.render("admin/editproduct",{product})
    }
   }
    catch (error) {
     console.log(error);
     res.status(500).send("internal server error")
   }   
}




const updateProduct = async (req, res) => {
    try {
        const productId = req.params.id;
        const { name, category, description,status, price,quantity } = req.body;
        let image;
        const additionalimages= req.files.additionalimages? req.files.additionalimages.map(file=>file.filename):[]

        // Check if a new image file was uploaded
        if (req.file) {
            image = req.file.filename;
        } else {
            // If no new image was uploaded, keep the existing image
            const productToUpdate = await products.findById(productId);
            image = productToUpdate.image;

        }

        // Find the product by ID and update its fields
        const updatedProduct = await products.findByIdAndUpdate(
            productId,
            {
                name,
                category,
                description,
                status,
                price,
                quantity,
                image,
                additionalimages
            },
            { new: true } // Return the updated product
        );

        if (!updatedProduct) {
            return res.status(404).send('Product not found');
        }

        res.redirect('/admin/products'); // Redirect to the products list after updating
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal server error');
    }
};





// function to block the user
const blockUser= async(req,res)=>{
    
    const userId= req.params.id;
    
    try{
        console.log("inside the try hai")
        const user = await userData.findById(userId)
        if (!user) {
            res.status(404).json({ error: 'User not found' });
            
        } else{
            user.isBlocked=true
            await user.save()
            //res.status(500).json({ error: 'cannot login in' });
            res.render("admin/dashboard")  
        }
    }
    catch(err)
    {
        console.error(err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
}

// function for unblocking the user

const unblockUser=async (req,res)=>{
    const userid= req.params.id
    try{
          const user = await userData.findById(userid) 
          if (!user) {
            res.status(404).json({error:"user is not found"})
            
          } else {
            user.isBlocked=false
            await user.save()
            console.log("user can now login");
            const msg ="unblocked  the specified user"
            //res.send("user can now login")
            console.log(msg);
            res.render("admin/dashboard")
          }
    }
    catch(err){
        res.status(500).json({ error: 'Internal Server Error' });
    }
}

// function to get stored categories
const getCategory = async(req,res)=>{
   try{

   if(req.session.admin)
    { 
        const categories= await category.find()
        res.render("admin/category" ,{categories})
    }else{
        res.render("admin/login")
      }
} catch{
    
    res.status(500).send("internal server error")
    }
}
// function to add new category and also to check wheather it exist already or not

const addCategory = async (req, res) => {
    const newcata = req.body.category;
    console.log(newcata);
    
    try {
        const existsCata = await category.find({ category: newcata });
        console.log(existsCata);
        
        if (existsCata.length === 0) {
            console.log("Category doesn't exist. Creating a new one.");
            const cata = req.body.category;
            const newcategory = new category({
                category: cata
            });
            await newcategory.save();
            res.redirect('/admin/category');
        } else {
            const categories = await category.find();
            const msg = "Sorry, this category already exists";
            res.render("admin/category", { msg, categories });
        }
    } catch (error) {
        res.status(500).send("Internal server error");
    }
}


 
const deletecategory=async(req,res)=>{
    const cateID = req.params.id
    try{
        await category.findByIdAndUpdate(cateID,{status:"unavailable"})
        res.redirect("/admin/category")
    }catch(error)
    {
      console.log(error);
      res.render("admin/404",{error})
    }
}




// function for getting user orders
const getUserOrder = async (req, res) => {
    try {
        const order = await orders.find().populate('products.productId').populate("userId")
        
        // Check if any order has been returned
        const hasReturnedOrder = order.some(order => order.isReturned);

        if (!orders) {
            throw new Error('No orders found');
        }

        res.render('admin/orderManage', { order, hasReturnedOrder });
    } catch (error) {
        console.error("error");
        res.status(500).send('Internal Server Error');
   }
};

const updateUserOrder = async(req,res)=>{
try{
    const orderId = req.params.orderId;
    const newStatus = req.params.newStatus;
    

    const updatedOrder = await orders.findByIdAndUpdate(
        orderId,
        { status: newStatus },
        { new: true } // Set to true to return the updated order
    );

    if (updatedOrder) {
       
        // Order status updated successfully
        res.json({ success: true });
    } else {
        // Order not found or status update failed
        res.json({ success: false });
    }
} catch (error) {
    console.error(error);
    res.status(500).json({ success: false });
}
  
}





const getCoupon =async(req,res)=>{
    
    try{ const coupons= await coupon.find()
        console.log(coupons);
    
    
        res.render('admin/Coupons',{coupons})}
        catch(error)
        {
            console.log(error);
            res.json("internal server error")
        }
}


const getaddCoupon =async (req,res)=>{

       res.render("admin/addCoupon")
   
}

const addCoupon = async (req, res) => {
    try {
        console.log("inside coupon controller");
        
        const { couponName, couponValue, maxValue, minValue, expiryDate } = req.body;
        console.log(couponName);
        console.log(maxValue);
        console.log(minValue);
        console.log(expiryDate);
        // Creating  a new coupon document
        const newCoupon = new coupon({
            couponName,
            couponValue,
            maxValue,
            minValue,
            expiryDate,
        });
         
        console.log(newCoupon);
        // Saving  the new coupon to the database
        await newCoupon.save();
        console.log("hai");
        // Redirect to a success page or send a success response
        res.redirect('/admin/coupons'); 
    } catch (error) {
        // Handle errors - You can redirect to an error page or send an error response
        res.status(500).send('Internal Server Error'); // Replace with your error handling logic
    }
};


const viewdetails = async (req, res) => {
    try {
      const orderId = req.params.orderId; // Get orderId from URL parameters
      
      // Find the order by its ID
      const order = await orders.findById(orderId).populate('products.productId').populate('addressId');
      console.log(order);
      if (!order) {
        return res.status(404).send('Order not found'); // Handle case where order is not found
      }
  
      // Render the EJS template and pass the order data
      res.render('admin/viewdetails', { order });
    } catch (error) {
      console.error(error);
      res.status(500).send('Internal Server Error');
  }
  };







const logout = (req,res)=>{

    req.session.destroy((err) => {
        if (err) {
          console.error(err);
        }
        res.render('admin/login');
      });
}


module.exports = 
{
    adminHome,
    getUsersDetails,
    Login,
    LoginPost,
    seeProducts,
    addProducts,
    getProducts,
    blockUser,
    unblockUser,
    searchUser,
    deleteProduct,
    updateProduct,
    getEditProduct,
    getCategory,
    addCategory,
    logout,
    getUserOrder,
    updateUserOrder,
    getCoupon,
    getaddCoupon,
    addCoupon,
    viewdetails,
    deletecategory,
    
}