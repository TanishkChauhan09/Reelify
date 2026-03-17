const bcrypt = require("bcryptjs");
const userModal = require("../modals/user.modal");
const jwt = require("jsonwebtoken");
const foodPartnerModal = require("../modals/foodpartner.models");

const cookieOptions = {
    httpOnly: true,
    sameSite: process.env.NODE_ENV === 'production' ? "none" : "lax",
    secure: process.env.NODE_ENV === 'production'
};


async function registerUser(req, res) {
    const { fullName, email, password } = req.body ;

    const isuserAlreadyExist = await userModal.findOne({
            email
        })

    if(isuserAlreadyExist){
        return res.status(400).json({ 
            message:"User already exist with this email"
        })
    }
    
    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await userModal.create({
        fullName,
        email,
        password: hashedPassword
    })

    const token = jwt.sign({ 
        id: user._id,
    },process.env.JWT_SECRET)

        res.cookie("token", token, cookieOptions)

    res.status(201).json({
        message:"User registered successfully",
        user:{
            _id: user._id,
            email: user.email,
            fullName: user.fullName
        }
    })
}

async function loginUser(req, res) {
    const { email, password } = req.body;
    const  user = await userModal.findOne({
        email
    })

    if(!user){
        return res.status(400).json({
            message:"Invalid email or password"
        })
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if(!isPasswordValid){
        return res.status(400).json({
            message:"Invalid email or password"
        })
    }

    const token = jwt.sign({ 
        id: user._id,
    },process.env.JWT_SECRET)

        res.cookie("token", token, cookieOptions)

    res.status(200).json({
        message:"User logged in successfully",
        user:{
            _id: user._id,
            email: user.email,
            fullName: user.fullName
        }
    })
}

function logoutUser(req, res) {
    res.clearCookie("token", cookieOptions);
    res.status(200).json({
        message:"User logged out successfully"
    })
}

async function registerFoodPartner(req, res) {

    const { name, email, password, phone, address , contactname} = req.body ;

    const isAccountAlreadyExist = await foodPartnerModal.findOne({
            email
    })
    if(isAccountAlreadyExist){
        return res.status(400).json({
            message:"Account already exist with this email"
        })
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const foodPartner = await foodPartnerModal.create({
        name,
        email,
        password: hashedPassword,
        phone,
        address,
        contactname
    })

    const token = jwt.sign({
        id: foodPartner._id,
        }, process.env.JWT_SECRET)

        res.cookie("token", token, cookieOptions);

        res.status(201).json({

            message:"Food Partner registered successfully",
            foodPartner: {
                _id: foodPartner._id,
                name: foodPartner.name,
                email: foodPartner.email,
                address: foodPartner.address,
                contactname: foodPartner.contactname,
                phone: foodPartner.phone
            }
        })
}

async function loginFoodPartner(req, res) {
    const { email, password } = req.body;
    const foodPartner = await foodPartnerModal.findOne({
        email
    })
    if(!foodPartner){
        return res.status(400).json({
            message:"Invalid email or password"
        })
    }

    const isPasswordValid = await bcrypt.compare(password, foodPartner.password);

    if(!isPasswordValid){
       return res.status(400).json({
            message:"Invalid email or password"
       })
    }
    const token = jwt.sign({
        id:foodPartner._id,
    },process.env.JWT_SECRET);

        res.cookie("token", token, cookieOptions);

    res.status(200).json({
        message:"Food Partner logged in successfully",
        foodPartner:{
            _id: foodPartner._id,
            email: foodPartner.email,
            name: foodPartner.name
        }
    })
}

function logoutFoodPartner(req, res){
    res.clearCookie("token", cookieOptions);
    res.status(200).json({
        message:"Food Partner logged out successfully"
    })
}

async function listFoodPartners(req, res) {
    try {
        const foodPartners = await foodPartnerModal
            .find({})
            .select("_id name email contactname phone address createdAt updatedAt")
            .limit(100)
            .lean();

        return res.status(200).json({
            count: foodPartners.length,
            foodPartners
        });
    } catch (err) {
        console.error("listFoodPartners error:", err);
        return res.status(500).json({
            message: "Internal server error"
        });
    }
}
    
module.exports = { 
    registerUser, 
    loginUser,
    logoutUser,
    registerFoodPartner,
    loginFoodPartner,
    logoutFoodPartner,
    listFoodPartners
    } 
