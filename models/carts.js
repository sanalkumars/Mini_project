const mongoose = require("mongoose")



const cartSchema = new mongoose.Schema({
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "userData",  
      required: true,
    },
  
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "products",
      
    },
    
    quantity: {
      type: Number,
      required: true,
      default: 1,
    },
   
  });

const cartProduct = new mongoose.model("cartProduct",cartSchema)
module.exports= cartProduct