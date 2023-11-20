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


// functions from admincontroller

//function for admin to see the products
const seeProducts = async (req, res) => {
    try {
  
      const product = await products.find()
      res.render("admin/products", { product })
  
    }
    catch (err) {
      console.log(err);
      res.status(500).send("internal server error")
    }
  }

// function to get the product adding form

const getProducts = async (req, res) => {
    try {
      const categories = await category.find()
      res.render("admin/addproducts", { categories })
    }
    catch (error) {
      console.log(error);
      res.status(500).send("internal server error")
    }
  
  }


  const addProducts = async (req, res) => {
    // Accessing the data submitted through the form
    const { name, category, description, price, quantity } = req.body;
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
  
      const newProduct = new products({ name, category, description, price, quantity, image, additionalimages });
  
      // Adding the new product to the collection
      await newProduct.save();
  
      res.redirect('/admin/dashboard');
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  };

  // function for deleteing products
const deleteProduct = async (req, res) => {

    try {
  
      const productId = req.params.id
      await products.findByIdAndUpdate(productId, { status: "deleted" })
  
      const product = await products.find({ status: 'active' })
      res.render("admin/products", { product })
    }
    catch (error) {
      res.status(500).send('internal server error')
    }
  }
  
  // function to get editproduct form
const getEditProduct = async (req, res) => {
    // add session later
    try {
      const productId = req.params.id
  
  
      const product = await products.findById(productId)
  
      if (!product) {
        return res.status(404).send('user not found')
  
      } else {
  
        res.render("admin/editproduct", { product })
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
      const { name, category, description, status, price, quantity, offer } = req.body;
      let image;
  
      // Check if a new image file was uploaded
      if (req.files.image && req.files.image.length > 0) {
        image = req.files.image[0].filename;
      } else {
        // If no new image was uploaded, keep the existing image
        const productToUpdate = await products.findById(productId);
        image = productToUpdate.image;
      }
  
      const additionalimages = req.files.additionalimages ? req.files.additionalimages.map(file => file.filename) : [];
  
      let updatedPrice = price; // Initialize updated price with the original price
  
      // Apply offer if it is greater than zero
      if (offer > 0) {
        const offerAmount = (offer / 100) * price; // Calculate offer amount
        updatedPrice = Math.floor(price - offerAmount); // Calculate updated price after applying offer
      }
      // Find the product by ID and update its fields
      const updatedProduct = await products.findByIdAndUpdate(
        productId,
        {
          name,
          category,
          description,
          status,
          price: updatedPrice,
          quantity,
          image,
          additionalimages, offer
        },
        { new: true } // Return the updated product
      );
  
      if (!updatedProduct) {
        // return res.status(404).send('Product not found');
        res, redirect("/admin/error")
      }
  
      res.redirect('/admin/products'); // Redirect to the products list after updating
    } catch (error) {
      console.error(error);
      res.status(500).send('Internal server error');
    }
  };

  
   // functions from userController

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
const getProductss = async (req, res) => {

  
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
  
const userproductss = (req, res) => {
  if (req.session.user) {
    res.render("user/productss")
  }
  else {
    res.redirect("/login")
  }
}



  
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

module.exports={
  seeProducts,
  addProducts,
  getProducts,
  deleteProduct,
  updateProduct,
  getEditProduct,
// functions from userController
 getProductss,
 searchProduct,
 getSingleProduct,
 userproductss,
 getFilteredProducts,



}