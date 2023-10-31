const { render } = require("ejs")
const  userData = require("../models/userLogin")
const products =require("../models/product")
const  nodemailer = require('nodemailer')
const randomstring= require("randomstring")
const otpGenerator = require('otp-generator');
const otpSchema = require("../models/otp")
const bcrypt = require("bcrypt")
const cartProduct = require('../models/carts')
const { LEGAL_TLS_SOCKET_OPTIONS } = require("mongodb")
const orders = require("../models/order")
const Address = require("../models/address")


const userHome =async (req,res)=>{
  const product = await products.find()
  
  if(req.session.user)
  { 
   
    user = true
    res.render("user/index",{user,product})
  }
  else{
    user=false
    res.render("user/index",{user,product})
  }
}
 
   
    

 
const userproductss =(req,res)=>{
  if(req.session.user)
  {
    res.render("user/productss")
  }
  else{
    res.redirect("/login")
  }
}

const login = (req,res)=>{
//    if(!req.user){
//     res.render("user/login")
//    }
//    else{
//      res.render("user/home")
//    }
let msg="hello user"
res.render("user/login",{msg})
}


const signup= (req,res)=>{

   res.render("user/signup")
  
}
// bcrypt function
const passwordcrypt= function(password)
{
  const bcrptPass = bcrypt.hash(password,8)
  return bcrptPass
}

// function for generating otp
const generateOTP=()=>{
              // generating a 6 digit otp number   
   return Math.floor(1000 + Math.random() * 900000); // Generate a 6-digit OTP
};
 

  const sendOTPByEmail =async(email,otp)=>{
    const transporter = nodemailer.createTransport({
      host :"smtp.gmail.com",
      port : 465,
      secure : true, //
      auth: {
        user: process.env.EMAIL_ID,
        pass: process.env.EMAIL_PASS,
      },
    });
  
  
    const mailOptions = {
      from: process.env.EMAIL_ID, // me/admin
      to: email, // user email
      subject: 'OTP verification',//subject
      html: `<h2> OTP Verifictaion</h2>
      <p>Your OTP for verification is:  </p>
       <h3> Your OTP is: ${otp}</h3>`, //passing otp with email
    };
  
    // Sending   email
    try{
      const info = await transporter.sendMail(mailOptions) 
       
         console.log('Email sent:'+ info.response)
    }catch(err){
      console.log(err);
      res.json("Internal server error")
    }  
  }
 



// signup post for user

const signupPost = async (req,res)=>{
      const pass = req.body.password
      const bcryptedPass = await passwordcrypt(pass)
      req.body.password= bcryptedPass
    console.log(req.body.password);

     const data={
        name:req.body.name,
        email:req.body.email,
        password:req.body.password
     };

     await userData.create(data)

     try{
      const {email} = req.body
      const check = await userData.findOne({email:req.body.email})
      console.log("user found");
      if(check){

      if(check.password===req.body.password){
        const otp = generateOTP();
        console.log("generated otp",otp);
        if(check.isBlocked)
        {
          res.json("your blocked by the Admin")
        }
        console.log(1);
          req.session.user = req.body.email
          req.session.otp = otp // store otp in session
          req.session.requestedOTP = true;
          console.log(2);
          // sending otp to the user email
          await sendOTPByEmail(email,otp);
          res.render("user/otp",{msg:"otp have been send to your email"});
      } else{
        res.render("user/login",{error:"wrong password!!!"});
      } 
    }else{
          res.render("user/login",{error:"error in finding user!!!"});
      }
    }
     catch(error)
     {
     console.log(error);
     res.json("error in processing your request!!!")
     }
    }



const loginPost = async(req,res)=>{
 console.log("madara");
     try{
      console.log("hai");
        const {email} = req.body
        const check = await userData.findOne({email:req.body.email})
        console.log("bye");
        const result = await bcrypt.compare(req.body.password,check.password)
         console.log(result);
        if(check.email=== req.body.email && result===true)
        {
          const otp = generateOTP()
          console.log("generated otp for forgot password is :",otp);
          
            let msg = req.body.email 
            const isBlocked = check.isBlocked
            if(isBlocked){
                res.send("cannot login your are blocked by the admin!!!")
            } 
            else{
              
              req.session.user = req.body.email;
              req.session.otp = otp ;// storing otp in the session
              req.session.requestedOTP = true;
            // sending otp to the mail of the user
             await sendOTPByEmail(email,otp);

              res.render("user/otp",{msg :"please enter the otp sent to your email for verification"});
        }
            
        }
        else{
            res.render("user/login",{error:"wrong deatils"})
        }
     }
     catch{
          res.send("! wronge details... ")
     }
}
// function for getting the forgot password ejs
const getforgotPass = (req,res)=>{
   res.render("user/forgotpass")
}


// function for forgotpassword

const forgotPass =async(req,res)=>{
     const usermail = req.body.email
     console.log(usermail);
  try{
    console.log("hai");
    const check = await userData.findOne({email:usermail})
    console.log(check);

    
   if(check){
     
    if(check.email=== req.body.email){
      const otp = generateOTP()
      console.log("genareated otp for forgotpassword is :",otp );
      
      const isBlocked = check.isBlocked
      if(isBlocked){
          res.send("cannot login your are blocked by the admin!!!")
      } 
      else{
        

        req.session.user = req.body.email
        req.session.otp = otp
        req.session.requestedOTP = true
        await sendOTPByEmail(usermail,otp)

        res.render("user/otp",{msg:"otp for verification have been sent to your email"});
       }
      
       }
     else{
        res.render("user/login",{error:"wrong Deatils"})
       }
  }else{
    res.render("user/login",{error:"User not Found"})
  }  
 }
 catch(error){
    console.log(error);
      res.send("! wronge details... ")
 }
}

const getchangePass =(req,res)=>{
  res.render("user/changepass")
}

const updatePassword = async (req,res) => {
  const pass = req.body.password;
  const bcryptedPass = await passwordcrypt(pass);
  const useremail = req.session.user;

  try {
    const updatedUser = await userData.findOneAndUpdate(
      { email: useremail },
      {
        $set: {
          password: bcryptedPass,
        },
      },
      { new: true }
    );

    if (updatedUser) {
      console.log("Password updated successfully");
       res.redirect("/profile")
      
    } else {
      console.log("User not found or password update failed");
      
    }
  } catch (error) {
    console.error(error);
    
  }
};




const verifyOTP = async (req, res) => {
    const enteredOTP = req.body.otp;
    const storedOTP = req.session.otp;
    console.log(req.session);
 
    try {
      const user = await userData.findOne({ email: req.session.user });
  
      if (!user) {
        return res.render("user/otp", { msg: "User not found" });
      }
  
      if (user.blocked) {
        return res.render("error", {
          error: "Your account has been blocked. Please contact support.",
        });
      }
        console.log(enteredOTP,storedOTP);
      if (enteredOTP == storedOTP) {
        
        res.redirect("/");
       
      } else {
        
        res.render("user/otp", { msg: "Invalid OTP. Please try again" });
      }
    } catch (error) {
      console.error(error);
      res.send("An error occurred while processing your request.");
    }
  };

// function for generating and sending otp

  


const resendOTP = async (req, res) => {
    
  const usermail = req.session.user
  if(req.session.requestedOTP)
  {
    const otp = generateOTP()
    console.log("otp generated for resend is :",otp);
    req.session.otp = otp;
    // sendig resend otp for verification
    await sendOTPByEmail(usermail,otp);
    res.json({msg:"otp have been resented to your email "})
  }else{
    res.json({msg:"can't send otp now"})
  }

};





// signout for the user 
 const signOut = (req,res)=>{
    req.session.destroy((err)=>{
      console.log('session destroyed')
        if(err)
        {
          res.send("error in destroying session!!!!")
        }
        else{
          // user = false
          // delete req.session.user
          
            res.redirect('/')
        }
    })
 }

 // function to display the products to user

const getProducts = async (req,res)=>{
  if(req.session.user)
  {
    try{
        const product= await products.find({status:'active'})
        
        res.render("user/productss",{product})
    }
    catch(err)
 {
    console.log("sorry for the error");
    res.status(500).send('Internal Server Error');
 }

}else {
  res.redirect("/login")
}
} 


// ... (other imports and code)

// const getProducts = async (req, res) => {
//   if (req.session.user) {
//     try {
//       const page = parseInt(req.query.page) || 1; // Get the page from the query parameter or default to page 1
//       const perPage = 6; // Number of products per page
//       const startIndex = (page - 1) * perPage;

//       // Fetch a subset of active products based on pagination
//       const productsList = await products.find({ status: 'active' })
//         .skip(startIndex)
//         .limit(perPage);

//       const totalProducts = await products.countDocuments({ status: 'active' });
//       const totalPages = Math.ceil(totalProducts / perPage);

//       res.render('user/productss', { products: productsList, currentPage: page, totalPages });
//     } catch (err) {
//       console.error("Error:", err);
//       res.status(500).send('Internal Server Error');
//     }
//   } else {
//     res.redirect("/login");
//   }
// }

// ... (other controller functions)







const searchProduct = async(req,res)=>{
  try{
    const searchQuery = req.query.search ||" "
    const msg = "search result are :"
    const product = await products.find({name:{$regex:searchQuery,$options:'i'},})
    res.render('user/productss',{product,msg})
  }
  catch{
    res.status(500).send("Internal server error")
  }
}


const getSingleProduct = async(req,res)=>{
 
   const product_id =req.params.id
   console.log("thhis is my product id :",product_id);
   try {
      const product = await products.findById(product_id)
      if(product)
      {
        res.render('user/product',{product})
      }
   }
    catch (error) {
     res.status(500).send("internal server error")
   }
}

// functions for cart(getting cart and adding items into cart)

const showCarts = async (req, res) => {
  console.log('show cart');
  try {
    if (req.session.user) {
      console.log('user');
      const user = await userData.findOne({ email: req.session.user });

      // Find all cart items for the user
      const cartItems = await cartProduct.find({ userId: user._id }).populate('productId');

      console.log(user._id);
      console.log(cartItems);

      // Calculate the total price
      let totalPrice = 0;

      // Iterate through the cart items and calculate the total price
      for (const cartItem of cartItems) {
        totalPrice += cartItem.quantity * cartItem.productId.price;
      }

      req.session.totalPrice = totalPrice;

      res.render('user/cart', { cartItems, totalPrice, user });
      console.log(totalPrice);
    } else {
      res.redirect('/login');
    }
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
};

const addtocart = async (req, res) => {
  if (req.session.user) {
    try {
      const productId = req.body.productId; // Assuming the productId is in the request body
      const quantity = 1;

      // const productdata = await products.findOne({ _id: productId }); // Assuming you're using "_id" to find the product
      const user = await userData.findOne({ email: req.session.user });

      // Check if the product already exists in the cart for the user
      let existingCartItem = await cartProduct.findOne({ userId: user._id, productId: productId });

      if (existingCartItem) {
        // If the product exists, increment the quantity for that product
        existingCartItem.quantity += quantity;
      } else {
        // If the product doesn't exist in the cart, create a new cart entry
        existingCartItem = new cartProduct({
          userId: user._id,
          productId: productId,
          quantity: quantity,
        });
      }

      await existingCartItem.save();
      res.redirect('/cart');
    } catch (error) {
      console.error(error);
      res.status(500).send('Internal Server Error');
    }
  } else {
    res.redirect('/login');
  }
};

//function for quantity  updation

const updateQuantity = async (req, res) => {
  try {
    const itemId = req.params.itemId;
    const newQuantity = req.body.quantity;
    
    // Find the cart item by its ID
    const cartItem = await cartProduct.findById(itemId);

    if (!cartItem) {
      return res.status(404).json({ message: 'Cart item not found' });
    }

    // Update the quantity of the cart item
    cartItem.quantity = newQuantity;

    // Save the updated cart item
    await cartItem.save();

    res.redirect('/cart')
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};





  // function for removing cart items

    const removecartItem = async (req, res) => {
    try {
        const itemId = req.params.itemId; // Get the item's _id from the request parameters

        // Find the cart item and remove it
        const result = await cartProduct.findOneAndRemove({ _id: itemId });

        if (result) {
            // Item was successfully removed
            res.redirect('/cart'); // Redirect back to the cart page
        } else {
            // Item not found or unable to remove
            res.status(404).send('Item not found or unable to remove.');
        }
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
};





// order page 
 
 // function for  order confirmation
 const getCheckOut = async(req,res)=>{
     
  if(req.session.user)
  {
    
    console.log(req.session.user);
    
    try{
     
      
     
      const users = await userData.find({email:req.session.user})
      
      const user = users[0]
      const address= await Address.find({userId:user._id})
      console.log(address);
      const cartItems = await cartProduct.find({userId:user._id}).populate('productId');
      req.session.productDetails =cartItems;
      const products = cartItems.map((item) =>({productId:item.productId,quantity:item.quantity}))
      console.log(products);
      const totalPrice = req.session.totalPrice
      res.render("user/checkout",{user,address,products,totalPrice})
    }
    catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
    
  }
  else{
           res.redirect('/login')
  }

 }

const confirmOrder = async(req,res)=>{
    console.log("hellooo order confirmed");
   if(req.session.user)
   {
    try{
       const productid = req.params.id
       const product = await products.findOne({_id:productid})
       console.log(product);
        console.log(productid);

       const orderData = {
        fname : req.body.fname,
        lname:req.body.lname,
        country:req.body.selection,
        city:req.body.city,
        payment:req.body.payment,
        status: "pending",
        userid:req.session.user,
        productid: productid,
        productsDetails: [
          {
            
            name: product.name, 
            quantity:1, 
            price: product.price, 
            },
            
          ],


        date: Date.now(),
       
        
       }
       console.log(" this is my oredr details",orderData);
       const newOrder = new orders(orderData); 

       // Adding the new order to the collection
       await newOrder.save();
       
   
       res.render("user/orderSucess")
       
    }catch(error)
    {
      console.log(error);
      res.send("internal server error")

    }
   }
}

// Controller function to retrieve and render orders
const getMyOrder = async (req, res) => {
  try {
    if (!req.session.user) {
      // Redirect to the login page if the user is not logged in
      return res.redirect('/login');
    }

    // Retrieve the user's orders
    const userId = req.session.user;
    const userOrders = await orders.find({ userid: userId }).populate('productid');
    console.log(userOrders);

    if(userOrders.status!="cancelled")
    {
      res.render('user/myorder', { orders: userOrders });
    }

    // Render the 'myorder' view and pass the order data to it
    

  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
};

// function for cancel order

const cancelOrder = async(req,res)=>{
   
  const orderId = req.params.id
  console.log("id of the order to cancel",orderId);
   
  try{
    const order = await orders.findById(orderId)
    console.log("order to be cancelled",order);
    if (!order) {
      
      console.log("Order not found");
      return res.status(404).send("Order not found");
    }
    else{
      order.status = "cancelled"
      await order.save()
      res.redirect("/myorder")
    }

  } catch(err)
  {
     console.log(err);
    res.send("internal server error")
  }
}









const paymentMethod = (req,res)=>{
  if(req.session.user)
  {
    res.render('user/paymentmethod')
  }
  else{
    res.redirect('/login')
  }
}
const orderSucess=(req,res)=>{

  res.render("user/orderSucess")
 
}


//function for user profile
const getProfile = async(req,res)=>{
    
   try {
    const user = await userData.findOne({ email: req.session.user });
      console.log(user);
      if(!user){
        return res.status(404).json({ message: "User not found" });
      }
    
     res.render('user/userprofile',{user})
     
    
   } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');

   } 
}
// get address function
const getAddress =async(req,res)=>{

  if (req.session.user) {
    try {
      const user = await userData.findOne({email:req.session.user})
      console.log("user details",user);
      const address = await Address.find({userId:user._id})
      console.log(address);
        res.render("user/myAddress",{address})
    } catch (error) {
      console.log(error);
      res.json("internal server error")
    }
  } else {
    
  }
  
}

const addAddress = async(req,res)=>{
  
     
     const{name,street,city,state,zip} = req.body
     const user = await userData.findOne({email:req.session.user})
     console.log(user);
     try {
      const address = await Address.create({ userId : user._id, name, street, city, state, zip });
      console.log(address);
       res.redirect('/myaddress')
  } catch (error) {
      console.error(error);
      res.status(500).send('Internal Server Error');
}
}

 const showAddress= (req,res)=>{
  res.render("user/addAddress")
 }

 const editAddress = (req,res)=>{
  res.render("user/editAddress")
 }


//update address function


const updateAddress = async (req, res) => {
  try {
    // Get the user's email from the session or request, assuming it's available
    const userEmail = req.session.user || req.body.email; // Use the appropriate way to get the user's email

    // Create an address object from the form data
    const address = {
      street: req.body.street,
      city: req.body.city,
      state: req.body.state,
      housename: req.body.houseName,
      pinCode: req.body.postalCode,
    };

    // Find the user by email and update their address
    const updatedUser = await userData.findOneAndUpdate(
      { email: userEmail },
      {
        $set: {
          'address1': address, // Assuming you want to update 'address1'
        },
      },
      { new: true } // To get the updated user data in the response
    );

    if (!updatedUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Optionally, you can redirect to a profile page or send a response indicating success
    res.redirect('/profile'); // Redirect to the profile page after the update
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};









module.exports= {
    userHome,
    login,
    signup,
    signupPost,
    loginPost,
    verifyOTP,
    resendOTP,
    signOut,
    getProducts,
    searchProduct,
    getSingleProduct,
    userproductss,
    showCarts,
    addtocart,
    removecartItem,
    updateQuantity,
    getCheckOut,
    confirmOrder,
    paymentMethod,
    orderSucess,
    getProfile,
    updateAddress,
    forgotPass ,
    getforgotPass,
    getchangePass,
    updatePassword,
    getMyOrder,
    cancelOrder,
    getAddress,
    addAddress,
    showAddress,
    editAddress,
}