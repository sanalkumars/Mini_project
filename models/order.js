const mongoose = require("mongoose")


const orderSchema = new mongoose.Schema({
  orderId: {
    type: String,
    unique: true,
    required: true
  },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'userData',
        required: true
      },
      paymentMethod: {
        type: String,
        enum: ['wallet', 'netBanking', 'cashOnDelivery'],  
        required: true
      },
      addressId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Address',
        required: true
      },
      products: [
        {
          productId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'products',
            required: true
          },
          quantity: {
            type: Number,
            default:1
          }
        }
      ],
      totalPrice: {
        type: Number,
        required: true
      },
          
      
      orderDate: {
        type: Date,
        default: Date.now
      },
      status: {
        type: String,
        enum: ['Pending', 'Delivered', 'Cancelled','Shipped'],
        default:'Pending'  
       },
       
       isReturned:{
        type:Boolean,
        default:false
       },
    
       acceptReturn:{
        type:Boolean,
        default:false
        },
    
        rejectReturn:{
        type:Boolean,
        default:false
        },
        grantTotal:{
          type: Number,
          
        },
        couponDiscount:{
          type: Number,
          
        },
        cancelReason: {
          type: String,
      },          
    });

const orders = new mongoose.model("orders",orderSchema)
module.exports= orders


