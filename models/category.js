const mongoose = require("mongoose")
const categorySchema = new mongoose.Schema({
  
    category: {
        type: String,
        required: true,
    },
    isDeleted: {
        type: Boolean,
        default: false
    }


    
});

   const category = new mongoose.model("category",categorySchema)

   module.exports= category