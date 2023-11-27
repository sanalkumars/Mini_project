const mongoose =require('mongoose');

const couponSchema = new mongoose.Schema({

     couponName:{
        type:String,
        require:true,
        unique: true
     },
     couponValue:{
        type:Number,
        require:true
     },
     expiryDate: {
      type: Date,
      required: true
    },
     maxValue:{
        type:Number,
        require:true
     },
     minValue:{
        type:Number,
        require:true
     },
     appliedUsers: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'userData'  
   }]
});

const couponModel  = mongoose.model('coupon',couponSchema);
module.exports =couponModel;