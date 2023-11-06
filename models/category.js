const mongoose = require("mongoose")
const categorySchema = new mongoose.Schema({
  
    category: {
        type: String,
        required: true,
    },
    status:{
        type:String,
        enum:['available','unavailable'],
        default:'available'
    }

    
});

   const category = new mongoose.model("category",categorySchema)

   module.exports= category