const express = require("express")
const path = require('path')
const session = require("express-session");

const cookie = require("cookie-parser")
const multer = require("multer")
require('dotenv').config()


// requiring the database for user
const userData = require("./models/userLogin")
//requiring the database for product
const products = require("./models/product")

// const upload=multer({dest:"public/images"})

const userRoute = require("./routes/userRoute")
const adminRoute = require("./routes/adminRoute")
const cookieParser = require("cookie-parser")
//const { urlencoded } = require("body-parser")

const app = express()

const port = process.env.PORT

app.set('view engine', 'ejs')

app.set('views', path.join(__dirname, 'views'))
app.use(express.static(path.join(__dirname, 'public')))



// setting up the session 
const oneday = 1000 * 60 * 60 * 24;
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: true,
  saveUninitialized: true

}))

app.use((req,res,next)=>{
  if(!req.user){
    res.header('Cache-Control','private,no-cache,no-store,must-revalidate')
  }
  next();
})

// configuring  the multer for image  upload



const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "public/uploads"); // Specifying the destination folder for uploaded images
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname); // Generate a unique filename
  },
});

const upload = multer({ storage });







app.use(cookieParser())
app.use(express.urlencoded({ extended: false }))
app.use(express.json())



//using the controller and router
app.use('/', userRoute)
app.use('/admin', adminRoute)

module.exports = upload

app.listen(port, () => {
  console.log("server running at http://localhost:4000/");
})