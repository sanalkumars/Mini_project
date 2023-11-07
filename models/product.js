const mongoose = require('mongoose')





const productSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    category: {
        type: String,
        required: true,
    },
    description:{
          type:String,
          required:true
    },
    price: {
        type: Number, 
        required: true,
    },
    quantity:{
         type:Number,
         required:true
    },
     status: {
        type:String,
        enum:['active','inactive','deleted'],
        default:'active'
    },
    image:{ 
        type: String,
        required:true
    },
     additionalimages:
     {
        type:[String],
        required:true
   },

    
});

const products = mongoose.model("products", productSchema);

module.exports = products;