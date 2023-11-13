const userData = require("../models/userLogin")

const userauthentication = async (req, res, next) => {
    if (req.session.user) {
       

        next()
    } else {
        
        res.redirect('/login');
    }
};

const isBlock =async(req,res,next)=>
{
    try{
        const user = await userData.findOne({ email: req.session.user });

        if (user.isBlocked) 
        {
            console.log("hello");
            res.redirect('/login');
        } 
        else 
        {
             next();
        }
    }catch(error){
       res.send("internal server error ")
    }
    
}

module.exports = {
    userauthentication,
    isBlock
}