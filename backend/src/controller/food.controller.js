const foodModel = require('../modals/food.model');
const userModel = require('../modals/user.modal');
const storageService = require('../services/storage.service');

// need to install multer package
async function createFood(req, res) {

    if (!req.file) {
        return res.status(400).json({
            message: "video file is required"
        });
    }

    const { v4: uuid } = await import('uuid');
    const fileUploadResult = await storageService.uploadFile(req.file.buffer, uuid());
    // console.log(fileUploadResult);
    const foodItem = await foodModel.create({
        name: req.body.name,
        description: req.body.description,
        video: fileUploadResult.url,
        foodPartner: req.foodPartner._id,
        likedBy: [],
        savedBy: [],
        likeCount: 0,
        savesCount: 0
    })
      

    res.status(201).json({
        message: "food created successfully",
        food: foodItem
    })
}
// we don't store file on server at production level we store it on cloudinary or aws s3 bucket but for now we are just checking whether we are getting the file or not in the backend and for that we are using multer package and in multer package we have to use memory storage because we are not storing the file on server we are just getting the file in the backend and then we will send that file to imagekit and in return we will get a URL of that file which we will store in our database and for that we have created a function uploadFile in services.storage.js file and we will call that function in this food.controller.js file

async function getFoodItems(req,res){
    const foodItems = await foodModel.find({}).lean();
    const userId = req.user?._id;
    const mapped = foodItems.map((item) => {
        const likeCount = typeof item.likeCount === 'number' ? item.likeCount : (item.likedBy ? item.likedBy.length : 0);
        const savesCount = typeof item.savesCount === 'number' ? item.savesCount : (item.savedBy ? item.savedBy.length : 0);
        const commentsCount = item.comments ? item.comments.length : 0;
        const isLiked = userId ? (item.likedBy || []).some((id) => id.equals ? id.equals(userId) : String(id) === String(userId)) : false;
        const isSaved = userId ? (item.savedBy || []).some((id) => id.equals ? id.equals(userId) : String(id) === String(userId)) : false;
        return { ...item, likeCount, savesCount, commentsCount, isLiked, isSaved };
    })
    res.status(200).json({
        message: "Food items fetched successfully",
        foodItems: mapped
    })
}

async function toggleLike(req, res) {
    const { foodId } = req.body;
    if (!foodId) {
        return res.status(400).json({ message: "foodId is required" });
    }

    const food = await foodModel.findById(foodId);
    if (!food) {
        return res.status(404).json({ message: "Food not found" });
    }

    const userId = req.user._id;
    const alreadyLiked = food.likedBy.some((id) => id.equals(userId));

    if (alreadyLiked) {
        food.likedBy = food.likedBy.filter((id) => !id.equals(userId));
        food.likeCount = Math.max(0, (food.likeCount || 0) - 1);
        await userModel.updateOne(
            { _id: userId },
            { $inc: { totalLikedVideos: -1 } }
        );
    } else {
        food.likedBy.push(userId);
        food.likeCount = (food.likeCount || 0) + 1;
        await userModel.updateOne(
            { _id: userId },
            { $inc: { totalLikedVideos: 1 } }
        );
    }

    await food.save();
    return res.status(200).json({ like: !alreadyLiked, likeCount: food.likeCount });
}

async function toggleSave(req, res) {
    const { foodId } = req.body;
    if (!foodId) {
        return res.status(400).json({ message: "foodId is required" });
    }

    const food = await foodModel.findById(foodId);
    if (!food) {
        return res.status(404).json({ message: "Food not found" });
    }

    const userId = req.user._id;
    const alreadySaved = food.savedBy.some((id) => id.equals(userId));

    if (alreadySaved) {
        food.savedBy = food.savedBy.filter((id) => !id.equals(userId));
        food.savesCount = Math.max(0, (food.savesCount || 0) - 1);
        await userModel.updateOne(
            { _id: userId },
            { $inc: { totalSavedVideos: -1 } }
        );
    } else {
        food.savedBy.push(userId);
        food.savesCount = (food.savesCount || 0) + 1;
        await userModel.updateOne(
            { _id: userId },
            { $inc: { totalSavedVideos: 1 } }
        );
    }

    await food.save();
    return res.status(200).json({ save: !alreadySaved, savesCount: food.savesCount });
}

async function getSavedFoods(req, res) {
    const userId = req.user._id;
    const foods = await foodModel.find({ savedBy: userId }).lean();
    const savedFoods = foods.map((food) => ({
        food: {
            ...food,
            likeCount: typeof food.likeCount === 'number' ? food.likeCount : (food.likedBy ? food.likedBy.length : 0),
            savesCount: typeof food.savesCount === 'number' ? food.savesCount : (food.savedBy ? food.savedBy.length : 0),
            commentsCount: food.comments ? food.comments.length : 0,
            isSaved: true,
            isLiked: (food.likedBy || []).some((id) => id.equals ? id.equals(userId) : String(id) === String(userId))
        }
    }))
    return res.status(200).json({ savedFoods });
}

async function getMyFoods(req, res) {
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit, 10) || 8));
    const filter = { foodPartner: req.foodPartner._id };

    const total = await foodModel.countDocuments(filter);
    const foods = await foodModel
        .find(filter)
        .sort({ _id: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean();

    const mapped = foods.map((food) => ({
        ...food,
        likeCount: typeof food.likeCount === 'number' ? food.likeCount : (food.likedBy ? food.likedBy.length : 0),
        savesCount: typeof food.savesCount === 'number' ? food.savesCount : (food.savedBy ? food.savedBy.length : 0),
        commentsCount: food.comments ? food.comments.length : 0,
        isPartnerLiked: !!food.partnerLiked
    }))
    return res.status(200).json({
        foods: mapped,
        page,
        limit,
        total,
        totalPages: Math.max(1, Math.ceil(total / limit))
    });
}

async function getComments(req, res) {
    const { id } = req.params;
    const food = await foodModel.findById(id).populate('comments.user', 'fullName email');
    if (!food) {
        return res.status(404).json({ message: "Food not found" });
    }
    const meId = req.user?._id;
    const comments = (food.comments || []).map((c) => ({
        _id: c._id,
        text: c.text,
        createdAt: c.createdAt,
        user: c.user ? { _id: c.user._id, fullName: c.user.fullName, email: c.user.email } : null,
        isMine: meId ? (c.user && String(c.user._id) === String(meId)) : false,
        reactions: (c.reactions || []).map((r) => ({
            emoji: r.emoji,
            count: r.users ? r.users.length : 0,
            isReacted: meId ? (r.users || []).some((id) => String(id) === String(meId)) : false
        }))
    }))
    return res.status(200).json({ comments });
}

async function addComment(req, res) {
    const { id } = req.params;
    const { text } = req.body;
    if (!text || !text.trim()) {
        return res.status(400).json({ message: "text is required" });
    }
    const food = await foodModel.findById(id);
    if (!food) {
        return res.status(404).json({ message: "Food not found" });
    }
    const comment = { user: req.user._id, text: text.trim(), reactions: [] };
    food.comments.push(comment);
    await food.save();
    const io = req.app.get('io');
    if (io) {
        io.to(`food:${id}`).emit('comment:new', { foodId: id });
    }
    return res.status(201).json({ message: "Comment added", commentsCount: food.comments.length });
}

async function toggleCommentReaction(req, res) {
    const { id, commentId } = req.params;
    const { emoji } = req.body;
    if (!emoji) {
        return res.status(400).json({ message: "emoji is required" });
    }
    const food = await foodModel.findById(id);
    if (!food) {
        return res.status(404).json({ message: "Food not found" });
    }
    const comment = food.comments.id(commentId);
    if (!comment) {
        return res.status(404).json({ message: "Comment not found" });
    }
    const userId = req.user._id;
    if (!comment.reactions) comment.reactions = [];

    let reaction = comment.reactions.find((r) => r.emoji === emoji);
    if (!reaction) {
        reaction = { emoji, users: [] };
        comment.reactions.push(reaction);
    }

    const already = (reaction.users || []).some((id) => id.equals(userId));
    if (already) {
        reaction.users = reaction.users.filter((id) => !id.equals(userId));
    } else {
        reaction.users.push(userId);
    }

    // clean up empty reaction
    if (!reaction.users.length) {
        comment.reactions = comment.reactions.filter((r) => r.emoji !== emoji);
    }

    await food.save();
    const io = req.app.get('io');
    if (io) {
        io.to(`food:${id}`).emit('comment:update', { foodId: id });
    }
    return res.status(200).json({ message: "Reaction toggled" });
}

async function updateComment(req, res) {
    const { id, commentId } = req.params;
    const { text } = req.body;
    if (!text || !text.trim()) {
        return res.status(400).json({ message: "text is required" });
    }
    const food = await foodModel.findById(id);
    if (!food) {
        return res.status(404).json({ message: "Food not found" });
    }
    const comment = food.comments.id(commentId);
    if (!comment) {
        return res.status(404).json({ message: "Comment not found" });
    }
    if (!comment.user || !comment.user.equals(req.user._id)) {
        return res.status(403).json({ message: "Not allowed to edit this comment" });
    }
    comment.text = text.trim();
    await food.save();
    const io = req.app.get('io');
    if (io) {
        io.to(`food:${id}`).emit('comment:update', { foodId: id });
    }
    return res.status(200).json({ message: "Comment updated", commentsCount: food.comments.length });
}

async function deleteComment(req, res) {
    const { id, commentId } = req.params;
    const food = await foodModel.findById(id);
    if (!food) {
        return res.status(404).json({ message: "Food not found" });
    }
    const comment = food.comments.id(commentId);
    if (!comment) {
        return res.status(404).json({ message: "Comment not found" });
    }
    if (!comment.user || !comment.user.equals(req.user._id)) {
        return res.status(403).json({ message: "Not allowed to delete this comment" });
    }
    comment.deleteOne();
    await food.save();
    const io = req.app.get('io');
    if (io) {
        io.to(`food:${id}`).emit('comment:delete', { foodId: id });
    }
    return res.status(200).json({ message: "Comment deleted", commentsCount: food.comments.length });
}

async function partnerLike(req, res) {
    const { foodId } = req.body;
    if (!foodId) {
        return res.status(400).json({ message: "foodId is required" });
    }

    const food = await foodModel.findById(foodId);
    if (!food) {
        return res.status(404).json({ message: "Food not found" });
    }

    if (!food.foodPartner || !food.foodPartner.equals(req.foodPartner._id)) {
        return res.status(403).json({ message: "Not allowed to like this food" });
    }

    if (food.partnerLiked) {
        return res.status(200).json({ like: false, likeCount: food.likeCount || 0, alreadyLiked: true });
    }

    food.partnerLiked = true;
    food.likeCount = (food.likeCount || 0) + 1;
    await food.save();

    return res.status(200).json({ like: true, likeCount: food.likeCount });
}

async function deleteFood(req, res) {
    const { id } = req.params;
    const food = await foodModel.findById(id);
    if (!food) {
        return res.status(404).json({ message: "Food not found" });
    }
    if (!food.foodPartner || !food.foodPartner.equals(req.foodPartner._id)) {
        return res.status(403).json({ message: "Not allowed to delete this food" });
    }
    await food.deleteOne();
    return res.status(200).json({ message: "Food deleted successfully" });
}

module.exports = {
    createFood,
    getFoodItems,
    toggleLike,
    toggleSave,
    getSavedFoods,
    getMyFoods,
    deleteFood,
    partnerLike,
    getComments,
    addComment,
    updateComment,
    deleteComment,
    toggleCommentReaction
}
