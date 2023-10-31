const mongoose = require("mongoose")
const products = require("../models/product")

const orderSchema = new mongoose.Schema({
    userid:{
        type:String,
    
    }, productid:{
        type:mongoose.Schema.Types.ObjectId,
        ref:products
   },

    productsDetails:[{
             
       name: {
          type:String,
        
        },
        quantity:{
            type:Number,
        
            default:1
        },
        price:{
            type:Number,
        
        }
 }],

   payment:{
    type:String,

   }
   ,
    date:{
        type:Date,
    
    },
    fname:{
         type:String,
        
    },
    lname:{
        type:String,
    
    },
    
    country:{
        type:String,
    
    },
    city:{
          type:String,
        
    } ,
    status:{
        type:String,
    
    }

   
})

const orders = new mongoose.model("orders",orderSchema)
module.exports= orders