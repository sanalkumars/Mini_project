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

// function from AdminController


const getChart = async (req, res) => {

    try {
      res.render('admin/chart')
    }
    catch (error) {
      console.log(error);
      res.send("internal server error")
    }
  }




  const chart = async (req, res) => {
    console.log("hai");
    if (req.session.admin) {
      try {
        // Aggregate data for the daily chart
        const dayChart = await orders.aggregate([
          {
            $group: {
              _id: { $dateToString: { format: "%Y-%m-%d", date: "$orderDate" } },
              count: { $sum: 1 }
            }
          },
          {
            $sort: { _id: 1 } // Sort by date in ascending order
          },
          {
            $limit: 30 // Limit to the last 30 days
          }
        ]);
  
        // Aggregate data for the monthly chart
        const monthChart = await orders.aggregate([
          {
            $group: {
              _id: { $dateToString: { format: "%Y-%m", date: "$orderDate" } },
              count: { $sum: 1 }
            }
          },
          {
            $sort: { _id: 1 } // Sort by month in ascending order
          }
        ]);
  
        // Aggregate data for the yearly chart
        const yearChart = await orders.aggregate([
          {
            $group: {
              _id: { $dateToString: { format: "%Y", date: "$orderDate" } },
              count: { $sum: 1 }
            }
          },
          {
            $sort: { _id: 1 } // Sort by year in ascending order
          }
        ]);
  
        // Aggregate data for the payment method chart
        const paymentMethodChart = await orders.aggregate([
          {
            $group: {
              _id: "$paymentMethod",
              count: { $sum: 1 }
            }
          }
        ]);
  
        // Aggregate data for today's orders
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const todaysOrder = await orders.countDocuments({
          orderDate: { $gte: today }
        });
  
        // Aggregate data for total orders
        const totalOrder = await orders.countDocuments();
  
        // Aggregate data for average order count in the current year
        const avgOrder = await orders.aggregate([
          {
            $match: {
              orderDate: { $gte: new Date(`${new Date().getFullYear()}-01-01`) }
            }
          },
          {
            $group: {
              _id: null,
              avgOrder: { $avg: 1 }
            }
          }
        ]);
  
        // Aggregate data for average revenue
        const totalRevenue = await orders.aggregate([
          {
            $group: {
              _id: null,
              totalRevenue: { $sum: "$grandTotal" },
              count: { $sum: 1 } // Debugging: count the documents
            }
          }
        ]);
  
        
  
        
  
        const datesDay = dayChart.map(item => item._id);
        const orderCountsDay = dayChart.map(item => item.count);
        let dayData = { dates: datesDay, orderCounts: orderCountsDay };
  
        const datesMonth = monthChart.map(item => item._id);
        const orderCountsMonth = monthChart.map(item => item.count);
        let monthData = { dates: datesMonth, orderCounts: orderCountsMonth };
  
        const datesYear = yearChart.map(item => item._id);
        const orderCountsYear = yearChart.map(item => item.count);
        let yearData = { dates: datesYear, orderCounts: orderCountsYear };
  
        const paymentMethodLabels = paymentMethodChart.map(item => item._id);
        const orderCountsByPaymentMethod = paymentMethodChart.map(item => item.count);
        let paymentMethodData = { labels: paymentMethodLabels, orderCounts: orderCountsByPaymentMethod };
  
        // Send data as JSON response
        res.json({
          dayData,
          monthData,
          yearData,
          paymentMethodData,
          todaysOrder,
          totalOrder,
          avgOrder: avgOrder.length > 0 ? avgOrder[0].avgOrder : 0,
          totalRevenue: totalRevenue.length > 0 ? totalRevenue[0].totalRevenue : 0
        });
  
       
      } catch (error) {
        console.error('Error fetching data:', error);
        res.status(500).json({ error: 'Internal Server Error' });
      }
    } else {
      res.status(403).json({ error: 'Unauthorized' });
    }
  };

module.exports={
    getChart,
    chart,
}