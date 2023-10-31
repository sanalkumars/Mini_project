const mongoose = require("mongoose")

mongoose.connect("mongodb://127.0.0.1:27017/BE_FIT")
.then(()=>{
    console.log("mongodb connected");
})
.catch(()=>{
    console.log("failed to connect to mongodb");
})


const loginSchema = new mongoose.Schema({
 name:{
       type: String,
       required: true
       
    },
    email:{
        type:String,
        required:true,
       
    },
    password:{
        type:String,
        required:true
    },
    isBlocked:{
        type:Boolean,
        dafault:false
    },
   

})

const userData = new mongoose.model("userData",loginSchema)
module.exports = userData
