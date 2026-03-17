const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
        fullName: {
            type: String,
            required: true
        },
        email:{
            type:String,
            required:true,
            unique:true
        },
        password:{
            type:String,
        }
        ,
        totalLikedVideos: {
            type: Number,
            default: 0
        },
        totalSavedVideos: {
            type: Number,
            default: 0
        }
},
    {
       timestamps:true
    }
)

const userModel = mongoose.model("user",userSchema);

module.exports = userModel;
