const mongoose = require('mongoose');

const foodSchema = new mongoose.Schema({
    name:{
        type:String,
        required:true
    },
    video:{
        type:String,
        required:true,
    },
    description:{
        type:String,
    },
    likeCount: {
        type: Number,
        default: 0
    },
    savesCount: {
        type: Number,
        default: 0
    },
    partnerLiked: {
        type: Boolean,
        default: false
    },
    likedBy: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "user",
        default: []
    }],
    savedBy: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "user",
        default: []
    }],
    comments: [{
        user: { type: mongoose.Schema.Types.ObjectId, ref: "user" },
        text: { type: String, required: true },
        createdAt: { type: Date, default: Date.now },
        reactions: [{
            emoji: { type: String, required: true },
            users: [{ type: mongoose.Schema.Types.ObjectId, ref: "user" }]
        }]
    }],
    foodPartner:{
        type: mongoose.Schema.Types.ObjectId,
        ref:"foodpartner",
    }
})

const foodModal = mongoose.model("food", foodSchema);

module.exports = foodModal;
