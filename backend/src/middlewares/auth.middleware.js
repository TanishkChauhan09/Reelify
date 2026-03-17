
// Middleware to verify JWT token for protected routes
// data in cookies comes with every request but we did not study for that we need to create middleware so that we can study the cookie data
const foodPartnerModel = require("../modals/foodpartner.models");
const jwt = require("jsonwebtoken"); 
const userModel = require("../modals/user.modal");

async function authFoodPartnerMiddleware(req,res,next){

    const token = req.cookies.token;
    if(!token)
    {
       return res.status(401).json({
            message:"Please login first"
        })
    }

    try
    {

       const decoded = jwt.verify(token,process.env.JWT_SECRET) // token's data goes into this decoded variable in object format because we give it in a object format in the auth.controller.js file during the creation of token for food-partner
       
       const foodPartner = await foodPartnerModel.findById(decoded.id);

       if (!foodPartner) {
           return res.status(401).json({
               message: "Invalid token"
           });
       }

       req.foodPartner = foodPartner; // in request we are creating a new property foodPartner and in that property we are setting the value foodPartner

       next()

    } catch(err){ // if token is wrong then this jwt.verify retuen error and we handle it in catch that's why we use try and catch block
       
        return res.status(401).json({ // 401 for unauthorised
            message:"Invalid token"
        })
    }
}


async function authUserMiddleware(req,res,next){
     
    const token = req.cookies.token;
    if(!token){
        return res.status(401).json({
            message: "Please login first"
        })
    }
    try{
        const decoded = jwt.verify(token, process.env.JWT_SECRET)
        const user = await userModel.findById(decoded.id);
        req.user = user
        next()
    }catch(err){
        return res.status(401).json({
            message: "Invalid token"
        })
    }
}



module.exports = {
    authFoodPartnerMiddleware,
    authUserMiddleware
}
