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
const banner= require('../models/banner')

const secret_Id = process.env.SECRET_ID
const secret_Key = process.env.SERECT_KEY


let data= true;


const userHome = async (req, res) => {
  const product = await products.find()
  const banners = await banner.find({isDeleted:false})

  if (req.session.user) {

    user = true
    res.render("user/index", { user, product,banners })
  }
  else {
    user = false
    res.render("user/index", { user, product,banners })
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

const otpsend=(req,res)=>{
  const msg= "Please Enter the OTP send to your email "
  res.render("user/otp",{msg})
}



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
          // req.session.otp = otp;
          req.session.otp = { code: otp, timestamp: Date.now() }; 
          req.session.requestedOTP = true;
          await sendOTPByEmail(email, otp);
          res.redirect('/otp')
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


// const loginPost = async (req, res) => {
//   try {
//     const { email } = req.body;
//     const check = await userData.findOne({ email: req.body.email });

//     if (check) {
//       const result = await bcrypt.compare(req.body.password, check.password);
//       if (result) {
//         // Passwords match, perform the rest of your logic
//         const otp = generateOTP();
//         console.log(otp);
//         if (check.isblocked) {
//           res.render("user/login", { error: "you are blocked by admin !!!" });
//         }
//         req.session.user = req.body.email;
//         // req.session.otp = { code: otp, timestamp: Date.now() }; 
//         req.session.otp = otp;
//         req.session.requestedOTP = true;
//         data = true
//         await sendOTPByEmail(email, otp);
//         res.redirect('/otp')
//       } else {
//         // Passwords do not match
//         res.render("user/login", { error1: "Wrong Password !!!" });
//       }
//     } else {
//       // User with the provided email was not found
//       res.render("user/login", { error1: "User not found !!!" });
//     }
//   } catch (error) {
//     console.error(error);

//     // Log the specific error message
//     console.error(error.message);

//     // Render an error page or send an appropriate error message
//     res.render("error", { errorMessage: "An error occurred while processing your request." });
//   }
// };
const loginPost = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await userData.findOne({ email });

    if (user) {
      if (user.isBlocked) {
        console.log("User is blocked");
        return res.render("user/login", { error1: "You are blocked by admin !!!" });
      }

      const passwordMatch = await bcrypt.compare(password, user.password);

      if (passwordMatch) {
        const otp = generateOTP();
        console.log(otp);

        req.session.user = email;
        req.session.otp = otp;
        data= true
        req.session.requestedOTP = true;

        await sendOTPByEmail(email, otp);
        
        return res.redirect('/otp');
      } else {
        // Passwords do not match
        return res.render("user/login", { error1: "Wrong Password !!!" });
      }
    } else {
      // User with the provided email was not found
      return res.render("user/login", { error1: "User not found !!!" });
    }
  } catch (error) {
    console.error(error);
    console.error(error.message);
    res.render("error", { errorMessage: "An error occurred while processing your request." });
  }
};




const verifyOTP = async (req, res) => {
  const enteredOTP = parseInt(req.body.otp, 10);
  const storedOTP = req.session.otp;
  console.log("entered otp is ",enteredOTP);
  console.log("entstoredOTPered otp is ",storedOTP);

 const elapsedTime = Math.floor((Date.now() - storedOTP.timestamp) / 1000);
  if (elapsedTime > 60) {
    console.log("hai123");
    return res.json({ isValid: false, msg: "OTP has expired. Please request a new OTP." });
    console.log(123654);
  }

  try {
      const user = await userData.findOne({ email: req.session.user });

      if (!user) {
          return res.json({ isValid: false, msg: "User not found" });
      }

      if (user.blocked) {
          return res.json({
              isValid: false,
              msg: "Your account has been blocked. Please contact support.",
          });
      }

      if (enteredOTP === storedOTP) {
        
          // Correct OTP
          // Redirect to home page
          return res.json({ isValid: true, data});
      } else {
          // Incorrect OTP
          return res.json({ isValid: false, msg: "Invalid OTP. Please try again" });
      }
  } catch (error) {
      console.error(error);
      return res.status(500).json({ isValid: false, msg: "An error occurred during OTP verification." });
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
          data= false;
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


const getError=(req,res)=>{
 
   res.render('user/error')
}

// functyions for reset password functionality

const getResetPass = (req,res)=>{
  res.render('user/resetPass')
}


const getResetPassPost = async (req, res) => {
  try {
    console.log("hai");

    const userEmail = req.session.user; // Assuming you have the user email in the request body

    const newPassword = req.body.password;
    const bcryptedPass = await passwordcrypt(newPassword);
    console.log("ha2i");
    const updatedUser = await userData.findOneAndUpdate(
      { email: userEmail },
      { $set: { password: bcryptedPass } },
      { new: true }
    );
    console.log("ha24i");
    if (!updatedUser) {
      return res.redirect("/error"); // Use return to avoid sending multiple responses
    }
    console.log("h3463ai");
    return res.redirect("/login"); // Use return to avoid sending multiple responses
  } catch (error) {
    console.error(error);
    return res.redirect("/error"); // Use return to avoid sending multiple responses
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
  forgotPass,
  getforgotPass,
  otpsend,
  getError,
  getResetPass,
  getResetPassPost
  // confirmOrder,
  // paymentMethod,
 
 
}