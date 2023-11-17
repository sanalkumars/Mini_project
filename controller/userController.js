const { render } = require("ejs")
const userData = require("../models/userLogin")
const products = require("../models/product")
const nodemailer = require('nodemailer')
const category = require('../models/category')
const otpGenerator = require('otp-generator');
const otpSchema = require("../models/otp")
const bcrypt = require("bcrypt")
const cartProduct = require('../models/carts')
const { LEGAL_TLS_SOCKET_OPTIONS } = require("mongodb")
const orders = require("../models/order")
const Address = require("../models/address")
const coupon = require("../models/coupon")
const session = require("express-session")
const mongoose= require('mongoose')
const Wallet = require('../models/wallet')
const Feedback = require('../models/feedbackModel')
const Reference = require('../models/Reference')
const Razorpay = require('razorpay')

const secret_Id = "rzp_test_sIqvavYe337CEG";
const secret_Key = "k4HXNEDAk5RKFlmRVO6oKjZK";





const userHome = async (req, res) => {
  const product = await products.find()

  if (req.session.user) {

    user = true
    res.render("user/index", { user, product })
  }
  else {
    user = false
    res.render("user/index", { user, product })
  }
}





const userproductss = (req, res) => {
  if (req.session.user) {
    res.render("user/productss")
  }
  else {
    res.redirect("/login")
  }
}

const login = (req, res) => {
  //    if(!req.user){
  //     res.render("user/login")
  //    }
  //    else{
  //      res.render("user/home")
  //    }
  let msg = "hello user"
  res.render("user/login", { msg })
}


const signup = (req, res) => {

  res.render("user/signup")

}
// bcrypt function
const passwordcrypt = async function (password) {
  const bcrptPass = await bcrypt.hash(password, 8);
  return bcrptPass;
}


// function for generating otp
const generateOTP = () => {
  // generating a 6 digit otp number   
  return Math.floor(1000 + Math.random() * 900000); // Generate a 6-digit OTP
};


const sendOTPByEmail = async (email, otp) => {
  const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true, //
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
  try {
    const info = await transporter.sendMail(mailOptions)

    console.log('Email sent:' + info.response)
  } catch (err) {
    console.log(err);
    res.json("Internal server error")
  }
}




// signup post for user

// const signupPost = async (req,res)=>{

//       let email= req.body.email
//       const userfound = await userData.findOne({email}) 
//     if(!userfound){
//       const pass = req.body.password
//       const bcryptedPass = await passwordcrypt(pass)
//       req.body.password= bcryptedPass
//     console.log(req.body.password);

//      const data={
//         name:req.body.name,
//         email:req.body.email,
//         password:req.body.password
//      };

//      await userData.create(data)

//      try{
//       const {email} = req.body
//       const check = await userData.findOne({email:req.body.email})
//       console.log("user found");
//       if(check){

//       if(check.password===req.body.password){
//         const otp = generateOTP();
//         console.log("generated otp",otp);
//         if(check.isBlocked)
//         {
//           res.json("your blocked by the Admin")
//         }
//         console.log(1);
//           req.session.user = req.body.email
//           req.session.otp = otp // store otp in session
//           req.session.requestedOTP = true;
//           console.log(2);
//           // sending otp to the user email
//           await sendOTPByEmail(email,otp);
//           res.render("user/otp",{msg:"otp have been send to your email"});
//       } else{
//         res.render("user/login",{error:"wrong password!!!"});
//       } 
//     }else{
//           res.render("user/login",{error:"error in finding user!!!"});
//       }
//     }
//      catch(error)
//      {
//      console.log(error);
//      res.json("error in processing your request!!!")
//      }
//     }
//    else {
//            const msg ="Already have an Account for this email Go to Login"
//            res.render("user/signup",{msg})
//   }
// }
// function for generating random reference code 
function generateRandomReferenceCode(length) {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';

  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length);
    result += characters[randomIndex];
  }

  return result;
}


const signupPost = async (req, res) => {
  let email = req.body.email;
  const userFound = await userData.findOne({ email });
  console.log(userFound);
  if (!userFound) {

    const pass = req.body.password
    const bcryptedPass = await passwordcrypt(pass)
    req.body.password = bcryptedPass

    const data = {
      name: req.body.name,
      email: req.body.email,
      password: req.body.password,
    };
    await userData.create(data);

    try {
      const { email } = req.body;
      const check = await userData.findOne({ email: req.body.email });
      if (check) {
        const referenceCode = generateRandomReferenceCode(8);
        await Reference.create({
          userId: check._id,
          referenceCode: referenceCode,
        });

        // Create a wallet for the user with default balance of 0
        const newWallet = new Wallet();
        await newWallet.save();
        check.wallet = newWallet;
        await check.save();

        if (check.password == req.body.password) {
          const otp = generateOTP();
          console.log(otp);
          if (check.isblocked) {
            res.render("user/login", { error: "you are blocked by admin !!!" });
          }
          req.session.user = req.body.email;
          req.session.otp = otp;
          req.session.requestedOTP = true;
          await sendOTPByEmail(email, otp);
          res.render("user/otp", {
            msg: "Please enter the OTP sent to your email",
          });
        } else {
          res.render("user/login", { error: "Wrong Password !!!" });
        }
      } else {
        res.render("user/login", { error1: "User not found !!!" });
      }
    } catch (error) {
      console.error(error);
      res.send("An error occurred while processing your request.");
    }
  } else {
    const msg = "Email is already Registered";
    res.render("user/signup", { msg });
  }
};










// const loginPost = async(req,res)=>{
//  console.log("madara");
//      try{
//       console.log("hai");
//         const {email} = req.body
//         console.log("hello ");

//         const check = await userData.findOne({email:req.body.email})

//         const result = await bcrypt.compare(req.body.password,check.password);
//         if(check){

//         if(check.email=== req.body.email && result===true)
//         {
//           const otp = generateOTP()
//           console.log("generated otp for forgot password is :",otp);

//             let msg = req.body.email 
//             const isBlocked = check.isBlocked
//             if(isBlocked){
//                 res.send("cannot login your are blocked by the admin!!!")
//             } 
//             else{
//               await sendOTPByEmail(email,otp);
//               req.session.user = req.body.email;
//               req.session.otp = otp ;// storing otp in the session
//               console.log(session.otp);
//               req.session.requestedOTP = true;
//             // sending otp to the mail of the user


//               res.render("user/otp",{msg :"please enter the otp sent to your email for verification"});
//         }

//         }
//         else{
//             res.render("user/login",{error:"wrong deatils"})
//         }

//       } 
//       else{
//         res.json("user not found")
//       }
//      }
//      catch{
//           res.send("! wronge detail... ")
//      }
// }
const loginPost = async (req, res) => {
  try {
    const { email } = req.body;
    const check = await userData.findOne({ email: req.body.email });

    if (check) {
      const result = await bcrypt.compare(req.body.password, check.password);
      if (result) {
        // Passwords match, perform the rest of your logic
        const otp = generateOTP();
        console.log(otp);
        if (check.isblocked) {
          res.render("user/login", { error: "you are blocked by admin !!!" });
        }
        req.session.user = req.body.email;
        req.session.otp = otp;
        req.session.requestedOTP = true;
        await sendOTPByEmail(email, otp);
        res.render("user/otp", {
          msg: "Please enter the OTP sent to your email",
        });
      } else {
        // Passwords do not match
        res.render("user/login", { error: "Wrong Password !!!" });
      }
    } else {
      // User with the provided email was not found
      res.render("user/login", { error1: "User not found !!!" });
    }
  } catch (error) {
    console.error(error);

    // Log the specific error message
    console.error(error.message);

    // Render an error page or send an appropriate error message
    res.render("error", { errorMessage: "An error occurred while processing your request." });
  }
};




// function for getting the forgot password ejs
const getforgotPass = (req, res) => {
  res.render("user/forgotpass")
}


// function for forgotpassword

const forgotPass = async (req, res) => {
  const usermail = req.body.email
  console.log(usermail);
  try {
    console.log("hai");
    const check = await userData.findOne({ email: usermail })
    console.log(check);


    if (check) {

      if (check.email === req.body.email) {
        const otp = generateOTP()
        console.log("genareated otp for forgotpassword is :", otp);

        const isBlocked = check.isBlocked
        if (isBlocked) {
          res.send("cannot login your are blocked by the admin!!!")
        }
        else {


          req.session.user = req.body.email
          req.session.otp = otp
          req.session.requestedOTP = true
          await sendOTPByEmail(usermail, otp)

          res.render("user/otp", { msg: "otp for verification have been sent to your email" });
        }

      }
      else {
        res.render("user/login", { error: "wrong Deatils" })
      }
    } else {
      res.render("user/login", { error: "User not Found" })
    }
  }
  catch (error) {
    console.log(error);
    res.send("! wronge details... ")
  }
}

const getchangePass = (req, res) => {
  res.render("user/changepass")
}

const updatePassword = async (req, res) => {
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
    console.log(enteredOTP, storedOTP);
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
  if (req.session.requestedOTP) {
    const otp = generateOTP()
    console.log("otp generated for resend is :", otp);
    req.session.otp = otp;
    // sendig resend otp for verification
    await sendOTPByEmail(usermail, otp);
    res.json({ msg: "otp have been resented to your email " })
  } else {
    res.json({ msg: "can't send otp now" })
  }

};





// signout for the user 
const signOut = (req, res) => {
  req.session.destroy((err) => {
    console.log('session destroyed')
    if (err) {
      res.send("error in destroying session!!!!")
    }
    else {
      // user = false
      // delete req.session.user

      res.redirect('/')
    }
  })
}

// function to display the products to user

// const getProducts = async (req, res) => {

//   if (req.session.user) {
//     try {
//       const productsPerPage = 9; // Number of products to display per page
//       const currentPage = parseInt(req.query.page) || 1;

//       // Retrieve all products
//       const allProducts = await products.find({ status: 'active' });

//       // Calculate the startIndex and endIndex for the current page
//       const startIndex = (currentPage - 1) * productsPerPage;
//       const endIndex = startIndex + productsPerPage;

//       // Extract the products for the current page
//       const currentProducts = allProducts.slice(startIndex, endIndex);

//       // Calculate the total number of pages
//       const pageCount = Math.ceil(allProducts.length / productsPerPage);

//       res.render("user/productss", {
//         product: currentProducts,
//         currentPage,
//         pageCount,
//       });
//     } catch (err) {
//       console.log("Sorry for the error");
//       res.status(500).send('Internal Server Error');
//     }
//   } else {
//     res.redirect("/login");
//   }
// }
const getProducts = async (req, res) => {

  if (req.session.user) {
    try {
      console.log("hai");
      const productsPerPage = 9; // Number of products to display per page
      const currentPage = parseInt(req.query.page) || 1;
      console.log("bye");
      // Retrieve all products
      const allProducts = await products.find({ status: 'active' });
      const categories = await category.find();
      // Calculate the startIndex and endIndex for the current page
      const startIndex = (currentPage - 1) * productsPerPage;
      const endIndex = startIndex + productsPerPage;
      console.log("my");
      // Extract the products for the current page
      const currentProducts = allProducts.slice(startIndex, endIndex);

      // Calculate the total number of pages
      const pageCount = Math.ceil(allProducts.length / productsPerPage);

      res.render("user/productss", {
        product: currentProducts,
        currentPage,
        pageCount,
        categories
      });
    } catch (err) {
      console.log("Sorry for the error");
      res.status(500).send('Internal Server Error');
    }
  } else {
    res.redirect("/login");
  }
}
const getFilteredProducts = async (req, res) => {
  try {
    const selectedCategory = req.params.category;
    const selectedPriceRange = req.query.priceRange;

    console.log("Selected category is:", selectedCategory);
    console.log("Selected price range is:", selectedPriceRange);

    const productsPerPage = 9; // Number of products to display per page
    const currentPage = parseInt(req.query.page) || 1;

    let query = { status: 'active' };

    // Add category filter to query if not 'all'
    if (selectedCategory !== 'all') {
      query.category = selectedCategory;
    }

    // Fetch products based on the category filter
    let filteredProducts = await products.find(query);

    // Filter and sort products by price range if specified
    if (selectedPriceRange) {
      filteredProducts = filterAndSortProducts(filteredProducts, selectedPriceRange);
    } else {
      // If no price range is selected, sort products by default (e.g., by ID or another criterion)
      filteredProducts.sort((a, b) => a._id - b._id);
    }

    const startIndex = (currentPage - 1) * productsPerPage;
    const endIndex = startIndex + productsPerPage;

    // Extract the products for the current page
    const currentProducts = filteredProducts.slice(startIndex, endIndex);

    // Calculate the total number of pages
    const pageCount = Math.ceil(filteredProducts.length / productsPerPage);
    const allCategories = await category.find();

    res.render("user/productss", {
      product: currentProducts,
      categories: allCategories,
      selectedCategory,
      selectedPriceRange,
      pageCount,
      currentPage
    });
  } catch (err) {
    console.error(err);
    res.status(500).send('Internal Server Error');
  }
};

// Helper function to filter and sort products by price range
const filterAndSortProducts = (products, selectedPriceRange) => {
  return products.filter(product => {
    const price = product.price;

    if (selectedPriceRange === '500') {
      return price <= 500;
    } else if (selectedPriceRange === '1000') {
      return price > 500 && price <= 1000;
    } else if (selectedPriceRange === '2000') {
      return price > 1000 && price <= 2000;
    } else if (selectedPriceRange === 'above') {
      return price > 2000;
    }

    return true; // Default: no filtering
  })
  .sort((a, b) => a.price - b.price);
};


const searchProduct = async (req, res) => {
  console.log("inside search products function");
  try {
    console.log("inside the search  fuunction ");
    const searchQuery = req.query.searchQuery || " ";
    console.log(searchQuery);
    const msg = "Search results are:";
    const productsPerPage = 9; // Number of products to display per page
    const currentPage = parseInt(req.query.page) || 1;
    const categories= await category.find()
    // Retrieve products based on the search query
    const matchedProducts = await products.find({
      name: { $regex: searchQuery, $options: 'i' },
    });

    // Calculate the startIndex and endIndex for the current page
    const startIndex = (currentPage - 1) * productsPerPage;
    const endIndex = startIndex + productsPerPage;

    // Extract the products for the current page
    const currentProducts = matchedProducts.slice(startIndex, endIndex);
    const selectedPriceRange=''
    // Calculate the total number of pages
    const pageCount = Math.ceil(matchedProducts.length / productsPerPage);

    res.render('user/productss', { product: currentProducts, msg, currentPage, pageCount,categories,selectedPriceRange });
  } catch (err) {
    res.status(500).send('Internal server error');
  }
};



const getSingleProduct = async (req, res) => {

  const product_id = req.params.id
  console.log("thhis is my product id :", product_id);
  try {
    const product = await products.findById(product_id)
    const allproducts = await products.find()


    if (product) {
      res.render('user/product', { product, allproducts })
    }
  }
  catch (error) {
    res.status(500).send("internal server error")
  }
}

// functions for cart(getting cart and adding items into cart)

// const showCarts = async (req, res) => {
//   console.log('show cart');
//   try {
//     if (req.session.user) {
//       console.log('user');
//       const user = await userData.findOne({ email: req.session.user });
//       const product = await products.find()
//       // Find all cart items for the user
//       const cartItems = await cartProduct.find({ userId: user._id }).populate('productId');
//       const coupons = await coupon.find()



//       // Calculate the total price
//       let totalPrice = 0;

//       // Iterate through the cart items and calculate the total price
//       for (const cartItem of cartItems) {
//         totalPrice += cartItem.quantity * cartItem.productId.price;
//       }

//       req.session.totalPrice = totalPrice;

//       res.render('user/cart', { cartItems, totalPrice, user, product, coupons });

//     } else {
//       res.redirect('/login');
//     }
//   } catch (error) {
//     console.error(error);
//     res.status(500).send('Internal Server Error');
//   }
// };
const showCarts = async (req, res) => {
  console.log('show cart');
  try {
    if (req.session.user) {
      console.log('user');
      const user = await userData.findOne({ email: req.session.user });
      const product = await products.find()
      const coupons = await coupon.find();

      const cartItems = await cartProduct.aggregate([
        {
          $match: { userId: user._id }
        },
        {
          $lookup: {
            from: 'products', // replace with the actual name of your products collection
            localField: 'productId',
            foreignField: '_id',
            as: 'product'
          }
        },
        {
          $unwind: '$product'
        },
        {
          $project: {
            productId: '$product._id',
            quantity: 1, // include other fields as needed
            price: '$product.price',
            name: '$product.name',
            description: '$product.description',
            image: '$product.image'
          }
        }
      ]);

      // Calculate the total price
      let totalPrice = 0;

      // Iterate through the cart items and calculate the total price
      for (const cartItem of cartItems) {
        totalPrice += cartItem.quantity * cartItem.price;
      }

      req.session.totalPrice = totalPrice;

      res.render('user/cart', { cartItems, totalPrice, user, coupons,product});

    } else {
      res.redirect('/login');
    }
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
};















// function for adding products to cart

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
// const updateQuantity = async (req, res) => {
//     try {
//       const itemId = req.params.itemId;
//       console.log("new item is :",itemId);
//       const newQuantity = req.body.quantity;
//       console.log("new quantity is :",newQuantity);

//       const cartItem = await cartProduct.findById(itemId).populate('productId');
//       console.log("cartitem is :",cartItem);

//       if (!cartItem) {
//         return res.status(404).json({ message: 'Cart item not found' });
//       }

//       const itemPrice = cartItem.productId.price;

//       cartItem.quantity = newQuantity;
//       cartItem.totalPrice = itemPrice * newQuantity;
//       console.log("new total is :",cartItem.totalPrice);


//       // Calculate the new total price for the entire cart using aggregation
//       const userId = cartItem.userId;

//       const pipeline = [
//         {
//           $match: {
//             userId: userId,
//           },
//         },
//         {
//           $group: {
//             _id: null,
//             total: { $sum: { $multiply: ["$productId.price", "$quantity"] } },
//           },
//         },
//       ];

//       const totalResult = await cartProduct.aggregate(pipeline);
//        console.log("total result is :",totalResult);

//       const newTotalPrice = totalResult[0] ? totalResult[0].total : 0;

//        console.log("new total price is :",newTotalPrice);

//        await cartItem.save();

//       res.json({ success: true, newQuantity, newTotalPrice });
//     } catch (error) {
//       console.error(error);
//       return res.status(500).json({ message: 'Internal server error' });
//     }
//   };

const updateQuantity = async (req, res) => {
  try {
    const itemId = req.params.itemId;
    const newQuantity = req.body.quantity;

    // Find the cart item by its ID
    const cartItem = await cartProduct.findById(itemId).populate('productId');

    if (!cartItem) {
      return res.status(404).json({ message: 'Cart item not found' });
    }

    // Find the corresponding product in the product collection
    const product = cartItem.productId;
    const collectionProduct = await products.findById(product._id);

    if (!collectionProduct) {
      return res.status(404).json({ message: 'Product not found' });
    }

    const collectionProductQuantity = collectionProduct.quantity;

    // Check if the requested quantity exceeds the available quantity
    if (newQuantity > collectionProductQuantity) {
      return res.status(400).json({ message: 'Out Of Stock' });
    }

    // Update the quantity of the cart item
    const itemPrice = product.price;
    let priceChange;
    let diff = newQuantity - cartItem.quantity;
    if (newQuantity > cartItem.quantity) {
      // increment
      priceChange = diff * itemPrice; // this to add to the final result
    } else {
      // decrement
      priceChange = -(diff * itemPrice);
    }
    cartItem.quantity = newQuantity;
    cartItem.totalPrice = itemPrice * newQuantity;
    const newTotalPrice = cartItem.totalPrice;
    console.log("newTotalPrice:", newTotalPrice);
    // Save the updated cart item
    await cartItem.save();
    req.session.totalPrice = newTotalPrice;
    res.json({ success: true, newQuantity, newTotalPrice, priceChange });
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
const getCheckOut = async (req, res) => {
  try {
    const user = await userData.findOne({ email: req.session.user });
    req.session.userDetails = user;

    const cartItems = await cartProduct.find({ userId: user._id }).populate('productId');
    req.session.productDetails = cartItems;
    const products = cartItems.map((item) => ({ productId: item.productId, quantity: item.quantity }));

    console.log(cartItems, "cartItems");
    console.log(products);

    const address = await Address.find({ userId: user._id });
    const totalPrice = req.session.totalPrice;
    const grantTotal = totalPrice
    const coupons = await coupon.find({ appliedUsers: { $nin: [user._id] } });

    // Check if cartItems is empty
    if (cartItems.length === 0) {
      // Redirect to cart page with alert message
      return res.redirect('/cart?alert=emptyCart');
    }

    res.render('user/checkout', { user, products, totalPrice, address, coupons, grantTotal });
  } catch (error) {
    console.log(error);
    res.status(500).send('Internal Server Error');
  }
};


let order;

// function for storing cart order in the database 
const processOrder = async (req, res) => {
  try {
    console.log("inside the processOrder function");
    const user = await userData.findOne({ email: req.session.user }).populate('wallet');
    const userId = user._id;
    console.log("the full details of user is :", user);

    const { address, paymentMethod, totalPrice, grantTotal, couponDiscount } = req.body;

    console.log(grantTotal);
    console.log(couponDiscount);

    const cartItems = await cartProduct.find({ userId: user._id }).populate('productId');

    // renamed products to productdata
    const productdata = cartItems.map((item) => ({
      productId: item.productId,
      quantity: item.quantity,
    }));

    order = new orders({
      userId,
      paymentMethod,
      addressId: address,
      products:productdata ,
      totalPrice,
      grantTotal,
      couponDiscount,
    });

    if (paymentMethod === "netBanking") {
      var instance = new Razorpay({
        key_id: secret_Id,
        key_secret: secret_Key,
      });

      var options = {
        amount: Math.round(totalPrice * 100), // amount in paise (smallest currency unit) put granttotal here instead of totalprice 
        currency: "INR",
        receipt: "order_rcptid_11",
      };

      instance.orders.create(options, function (err, order) {
        if (err) {
          console.error('Razorpay order creation error:', err);

          res.status(500).json({ success: false, message: 'Error creating Razorpay order' });
        }
        else {
          res.json({ id: order.id, amount: order.amount, currency: order.currency });
        }
      });
    }


    else if (paymentMethod === "cashOnDelivery") {
      await order.save();


      const cartItems = await cartProduct.find({ userId: user._id }).populate('productId');

        const productdata = cartItems.map((item) => ({
          productId: item.productId,
          quantity: item.quantity,
        }));

        for (const productInfo of productdata) {
          const productId = productInfo.productId;
          const quantity = productInfo.quantity;

          // Find the product and update the quantity
          const product = await products.findById(productId);
          console.log(productId);

          if (!product) {
            throw new Error(`Product with ID ${productId} not found`);
          }

          // Update the quantity of the product
          product.quantity -= quantity;
          await product.save();
        }


      await cartProduct.deleteMany({ userId: user._id });

      res.json({ success: true, redirectUrl: '/ordersuccess' });

    }



    else if (paymentMethod === "wallet") {
      console.log("hello inside wallet");

      if (order.grantTotal <= user.wallet.balance) {
        await order.save();

        user.wallet.balance -= grantTotal;


        await user.wallet.save()

        const cartItems = await cartProduct.find({ userId: user._id }).populate('productId');

        const productdata = cartItems.map((item) => ({
          productId: item.productId,
          quantity: item.quantity,
        }));

        for (const productInfo of productdata) {
          const productId = productInfo.productId;
          const quantity = productInfo.quantity;

          // Find the product and update the quantity
          const product = await products.findById(productId);
          console.log(productId);

          if (!product) {
            throw new Error(`Product with ID ${productId} not found`);
          }

          // Update the quantity of the product
          product.quantity -= quantity;
          await product.save();
        }
        await cartProduct.deleteMany({ userId: user._id });

        res.json({ success: true, redirectUrl: '/ordersuccess' });
      } else {
        // res.json({ success: false, message: 'Insufficient balance in the wallet' });
        return res.redirect("/orderconfirm");
      }
      
    }
  }
  catch (error) {
    console.error('Error:', error);
    res.status(500).json({ success: false, message: 'An error occurred while processing the order' });
  }
};




const saveOrder = async (req, res) => {

  console.log("the order is :", order);
  await order.save()

  //reducing product quantity


  console.log("order saved and cart is emptyed");
  // setting cart to null
  const user = await userData.findOne({ email: req.session.user })

  console.log("user is :", user);



  const cartItems = await cartProduct.find({ userId: user._id }).populate('productId');

  const productdata = cartItems.map((item) => ({
    productId: item.productId,
    quantity: item.quantity,
  }));

  for (const productInfo of productdata) {
    const productId = productInfo.productId;
    const quantity = productInfo.quantity;

    // Find the product and update the quantity
    const product = await products.findById(productId);
    console.log(productId);

    if (!product) {
      throw new Error(`Product with ID ${productId} not found`);
    }

    // Update the quantity of the product
    product.quantity -= quantity;
    await product.save();
  }


  await cartProduct.deleteMany({ userId: user._id });
  res.redirect(' /ordersuccess');

}
// 
// function for saving the order  

const orderSucess = (req, res) => {
  console.log("inside order success");
  res.render("user/orderSucess")

}









// function for applying coupon
const applyCoupon = async (req, res) => {
  try {
    // Get the coupon code from the request body
    const couponCode = req.body.couponCode;
    const totalprice = req.body.totalPrice;

    const couponData = await coupon.findOne({ couponName: couponCode });

    const couponDiscount = Math.floor((totalprice * couponData.couponValue) / 100);
    console.log("coupon discount is :", couponDiscount);
    const grantTotal = totalprice - couponDiscount;

    // Assuming userId is available in your request or from your authentication system
    const user = await userData.findOne({ email: req.session.user });
    const userId = user._id; // Adjust this based on how you store user information

    if (!couponData.appliedUsers.includes(userId)) {
      // Push the user's ID to the appliedUsers array
      couponData.appliedUsers.push(userId);

      // Save the coupon data with the updated appliedUsers array
      await couponData.save();
    }

    res.json({ grantTotal, couponDiscount });
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
}







// Controller function to retrieve and render orders
const getMyOrder = async (req, res) => {
  if(req.session.user)
  {
    try {
      const user = await userData.findOne({ email: req.session.user });
      console.log(user);
      const address = await Address.find({ userId: user._id })
  
      const userId = user._id;
      const order = await orders.find({ userId }).populate('products.productId');
  
      res.render('user/myorder', { user, address, order })
  
  
      // Render the 'myorder' view and pass the order data to it
  
  
    } catch (error) {
      console.error(error);
      res.status(500).send('Internal Server Error');
    }
  }else{
    res.redirect("/login")
  }
 
};

// function for cancel order

// const cancelOrder = async(req,res)=>{

//   const orderId = req.params.id
//   console.log("id of the order to cancel",orderId);

//   try{
//     const order = await orders.findById(orderId)
//     console.log("order to be cancelled",order);
//     if (!order) {

//       console.log("Order not found");
//       return res.status(404).send("Order not found");
//     }
//     else{
//       order.status = "Cancelled"
//       await order.save()
//       res.redirect("/profile")
//     }

//   } catch(err)
//   {
//      console.log(err);
//     res.send("internal server error")
//   }
// }

const cancelOrder = async (req, res) => {
  const orderId = req.params.id;
  console.log("id of the order to cancel", orderId);

  try {
    const order = await orders.findById(orderId);

    if (!order) {
      throw new Error('Order not found');
    }

    if (req.method === 'POST') {
      const cancelReason = req.body.cancelReason;
      // Validate and handle cancel reason as needed

      // Update order with cancel reason
      order.cancelReason = cancelReason;
  }



    // Loop through the products in the order
    for (const productInfo of order.products) {
      const productId = productInfo.productId;
      const quantity = productInfo.quantity;

      // Find the product and update the quantity
      const product = await products.findById(productId);

      if (!product) {
        throw new Error(`product with ID ${productId} not found`);
      }

      // Update the quantity of the product
      product.quantity += quantity;
      await product.save();
    }

    // Update order status to 'Canceled'
    order.status = 'Cancelled';
    await order.save();

    const user = await userData.findOne({ email: req.session.user }).populate('wallet');

    if (user) {
      const totalPrice = order.totalPrice;

      if (user.wallet) {
        if (order.paymentMethod !== 'cashOnDelivery') {
          user.wallet.balance += totalPrice;
        }
        await user.wallet.save();
      } else {
        const newWallet = new Wallet({ balance: totalPrice });
        await newWallet.save();
        user.wallet = newWallet;
      }

      await user.save();
    }

    res.redirect("/myorders");
  } catch (err) {
    console.log(err);
    res.render('user/error')
  }
}











const paymentMethod = (req, res) => {
  if (req.session.user) {
    res.render('user/paymentmethod')
  }
  else {
    res.redirect('/login')
  }
}






//function for user profile
const getProfile = async (req, res) => {
  if (req.session.user) {
    try {
      const user = await userData.findOne({ email: req.session.user });
      console.log(user);
      const address = await Address.find({ userId: user._id })

      const userId = user._id;
      const order = await orders.find({ userId }).populate('products.productId');

      const returnedOrders = await orders.find({ userId: user._id, isReturned: true });

      const userWallet = await Wallet.findById(user.wallet);

      const reference = await Reference.findOne({ userId: user._id });

      res.render('user/userprofile', { user, address, order, returnedOrders, reference, userWallet })

    } catch (error) {
      console.error(error);
      res.status(500).send('Internal Server Error');

    }
  } else {
    res.redirect("/login")
  }
}

// get address function
const getAddress = async (req, res) => {

  if (req.session.user) {
    try {
      const user = await userData.findOne({ email: req.session.user })
      console.log("user details", user);
      const address = await Address.find({ userId: user._id })
      console.log(address);
      res.render("user/myAddress", { address })
    } catch (error) {
      console.log(error);
      res.json("internal server error")
    }
  } else {

  }

}

const addAddress = async (req, res) => {


  const { houseName, street, city, state, zip } = req.body
  const user = await userData.findOne({ email: req.session.user })
  console.log(user);
  try {
    const address = await Address.create({ userId: user._id, houseName, street, city, state, zip });
    console.log(address);
    res.redirect('/myaddress')
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
}

const showAddress = (req, res) => {
  res.render("user/addAddress")
}

const editAddress = async (req, res) => {
  const addressId = req.params.id;
  console.log("this is the address going to be edited", addressId);

  try {
    const address = await Address.findById(addressId); // Pass addressId directly

    if (!address) {
      console.log("Address not found"); // Handle the case when the address is not found
      res.send("Address not found");
      return;
    }

    console.log(address._id);

    res.render("user/editAddress", { address });
  } catch (error) {
    console.log(error);
    res.send("Internal server error");
  }
};


//update address function

const updateAddress = async (req, res) => {
  const addressId = req.params.id;
  const { userName, street, city, state, zip } = req.body;

  try {
    const updatedAddress = await Address.findByIdAndUpdate(addressId, {
      userName,
      street,
      city,
      state,
      zip
    }, { new: true });

    // res.redirect('/displayaddress');
    res.redirect('/myaddress')

  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
};


const changepassword = (req, res) => {

  if (req.session.user) {
    res.render("user/changepass")
  } else {
    res.redirect("/login")
  }
}

const changepasswordpost = async (req, res) => {
  const currentPassword = req.body.currentPassword;
  const newPassword = req.body.newPassword;

  const bcryptednewPass = await passwordcrypt(newPassword)
  try {
    const user = await userData.findOne({ email: req.session.user });
    const result = await bcrypt.compare(req.body.currentPassword, user.password)


    if (user) {
      if (result) {
        await userData.updateOne({ email: req.session.user }, { $set: { password: bcryptednewPass } });
        res.redirect('/profile');
      }
      else {
        // Set error message
        const errorMessage = "Current password is incorrect";
        console.log(errorMessage);
        res.render("user/changepass", { errorMessage }); // Pass the errorMessage to the template
      }
    } else {
      res.redirect("/login")
    }
  } catch (error) {
    console.error(error);
    res.send("An error occurred while processing your request.");
  }



};


const orderdetails = async (req, res) => {
  try {
    const orderId = req.params.orderId; // Get orderId from URL parameters

    // Find the order by its ID
    const order = await orders.findById(orderId).populate('products.productId').populate('addressId');
    console.log(order);
    if (!order) {
      return res.status(404).send('Order not found'); // Handle case where order is not found
    }

    // Render the EJS template and pass the order data
    res.render('user/orderdetails', { order });
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
};


const downloadInvoice=async (req, res) => {
  try {
    console.log("inside download invoice");
    const orderId = req.params.orderId;
    console.log("order is is:",orderId);
    const order = await orders.findById(orderId).populate('userId').populate('addressId').populate('products.productId');
     console.log("invoice order is :",order);
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    res.json(order);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

const wallethistory = async (req, res) => {
  if (req.session.user) {
    try {
      const userEmail = req.session.user;

      // Fetch the user ID based on the email
      const user = await userData.findOne({ email: userEmail }).populate('wallet');
      if (!user) {
        return res.render('user/error');
      }

      const wallet = user.wallet;

      // Fetch wallet transactions using aggregation
      const walletData = await Wallet.aggregate([
        {
          $match: { _id: new mongoose.Types.ObjectId(wallet._id) }
        },
        {
          $unwind: '$transactions'
        },
        {
          $sort: { 'transactions.date': -1 } // Sort by date in descending order
        },
        {
          $limit: 10 // Limit to the most recently made ten transactions
        },
        {
          $project: {
            date: '$transactions.date',
            amount: '$transactions.amount',
            type: {
              $cond: {
                if: { $gt: ['$transactions.amount', 0] },
                then: 'Credit',
                else: 'Debit'
              }
            }
          }
        }
      ]);

      const transactions = walletData.map(transaction => ({
        date: transaction.date,
        amount: transaction.amount,
        type: transaction.type
      }));

      res.render('user/walletHistory', { transactions });
    } catch (error) {
      console.error(error);
      res.status(500).send('Internal Server Error');
    }
  } else {
    res.redirect('/login');
  }
};


const claimReferenceCode = async (req, res) => {
  try {
    const { referenceCode } = req.body;
    const reference = await Reference.findOne({ referenceCode });

    if (!reference) {
      return res.status(400).json({ message: "Invalid reference code" });
    }

    const user = await userData
      .findOne({ email: req.session.user })
      .populate("wallet");

    if (!user) {
      return res.status(500).json({ message: "Internal Server Error" });
    }

    // Check if the reference code has already been used by the current user
    if (reference.usedBy.includes(user._id)) {
      return res.status(400).json({ message: "Reference code already used" });
    }

    // Mark the reference code as used by the current user
    reference.usedBy.push(user._id);
    await reference.save();

    // Increase wallet balances
    if (user.wallet) {
      user.wallet.balance += 100; // Increase user's wallet by 100 rupees
      await user.wallet.save();
    } else {
      const newWallet = new Wallet({ balance: 100 });
      await newWallet.save();
      user.wallet = newWallet;
    }

    // Increase session user's wallet balance
    const referenceuser = await userData
      .findById(reference.userId)
      .populate("wallet");

    if (referenceuser.wallet) {
      referenceuser.wallet.balance += 100; // Increase user's wallet by 100 rupees
      await referenceuser.wallet.save();
    } else {
      const newWallet = new Wallet({ balance: 100 });
      await newWallet.save();
      referenceuser.wallet = newWallet;
    }

    await user.save();

    return res
      .status(200)
      .json({ message: "Reference code claimed successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};




module.exports = {
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
  // confirmOrder,
  paymentMethod,
  orderSucess,
  getProfile,
  updateAddress,
  forgotPass,
  getforgotPass,
  getchangePass,
  updatePassword,
  getMyOrder,
  cancelOrder,
  getAddress,
  addAddress,
  showAddress,
  editAddress,
  processOrder,
  applyCoupon,
  changepassword,
  changepasswordpost,
  orderdetails,
  saveOrder,
  downloadInvoice,
  getFilteredProducts,
  wallethistory, 
  claimReferenceCode,
  
}