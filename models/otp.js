const mongoose = require("mongoose")

const otpSchema = new mongoose.Schema({
    otp :{
        type:number,
        required:true
    },
    createdAT: { type: Date, default: Date.now, index: { expires: 60 } }
}, { timestamps: true })



const otp = mongoose.model("OTP", otpSchema);
module.exports = otp