const adminauthenticaton =async (req,res,next)=>
{
      if(req.session.admin)
      {
        console.log("inside admin authentication middleware");
        next()
      }
      else
      {
        res.redirect('/admin/')
      }

}

module.exports = {
    adminauthenticaton,
}