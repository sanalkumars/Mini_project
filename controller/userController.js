const { render } = require("ejs")
const  userData = require("../models/userLogin")
const products =require("../models/product")
const  nodemailer = require('nodemailer')
const randomstring= require("randomstring")
const otpGenerator = require('otp-generator');
const otpSchema = require("../models/otp")


const userHome = (req,res)=>{
    res.render("user/index")
}
 
const userproductss =(req,res)=>{
  res.render("user/productss")
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


const signupPost = async (req,res)=>{
    
     const data={
        name:req.body.name,
        email:req.body.email,
        password:req.body.password
     }
     await userData.create(data)
     const msg ="sucessfully registered"
   
     res.render("user/login",{msg})
    
}

let userOtp


//function for generating and sending otp

function generateOTP(recipientEmail){
                
  const otp  = Math.floor(1000 + Math.random() * 900000); // Generate a 6-digit OTP 
  userOtp = otp
 

  req.session.otp = otp
  console.log(req.session.otp);
  console.log('Generated OTP:', otp);

  // my  Nodemailer transporter 
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
    from: 'kannansanal89@gmail.com', // me/admin
    to: recipientEmail, // user email
    subject: 'Your OTP for login',//subject
    text: `Your OTP is: ${otp}`, //passing otp with email
  };

  // Sending   email
  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.error('Error sending email:', error);
    } else {
      console.log('Email sent:', info.response);
    }
  });
  return  otp
};
 // function ends here







const loginPost = async(req,res)=>{
 console.log("madara");
     try{
        const check = await userData.findOne({email:req.body.email})

        const recipientEmail=check.email

        if(check.password=== req.body.password){
            req.session.user = req.body.email
            let msg = req.body.email 
            const isBlocked = check.isBlocked
            if(isBlocked){
                res.send("cannot login your are blocked by the admin!!!")
            } 
            else{
              userOtp= generateOTP(recipientEmail)
              await otpSchema.create(userOtp)   

              res.render("user/otp")
            
             

        }
            
        }
        else{
            res.redirect("user/login")
        }
     }
     catch{
          res.send("! wronge details... ")
     }
}




const verifyOTP = async (req, res) => {
    const enteredOTP = req.body.otp;
    const storedOTP = otpSchema.find()
    // const storedOTP = userOtp;
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

  
//resend otp

const resendOTP = async (req, res) => {
  try {
    const check = await userData.findOne({ email: req.body.email });

    if (!check) {
      // Handle the case where 'check' is null or undefined
      return res.status(404).json({ error: "User not found" });
    }

    const recipientEmail = check.email;
    const userEmail = req.session.user;

    if (req.session.requestedOTP) {
      function generateOTP(recipientEmail) {
        return new Promise((resolve, reject) => {
          const otp = Math.floor(1000 + Math.random() * 900000); // Generate a 6-digit OTP
          userOtp = otp;
          req.session.otp = otp;
          console.log(req.session.otp);
          console.log('Generated OTP:', otp);
      
          // my Nodemailer transporter
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
            from: 'kannansanal89@gmail.com', // me/admin
            to: recipientEmail, // user email
            subject: 'Your OTP for login', // subject
            text: `Your OTP is: ${otp}`, // passing otp with email
          };
      
          // Sending email
          transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
              console.error('Error sending email:', error);
              reject(error);
            } else {
              console.log('Email sent:', info.response);
              resolve(otp); // Resolve the Promise with the OTP value
            }
          });
        });
        generateOTP(recipientEmail)
      }
    } else {
      res.json({ msg: "Can't resend OTP." });
    }
  } catch (error) {
    // Handle any other errors that may occur during the process
    res.status(500).json({ error: "An error occurred." });
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
            res.render("user/index")
        }
    })
 }

 // function to display the products to user

const getProducts = async (req,res)=>{
  
    try{
        const product= await products.find({status:'active'})
        
        res.render("user/productss",{product})
    }
    catch(err)
 {
    console.log("sorry for the error");
    res.status(500).send('Internal Server Error');
 }

}

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
    
}