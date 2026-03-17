const foodPartnerModel = require("../modals/foodpartner.models");
const foodModel = require("../modals/food.model");

async function buildProfile(foodPartner) {
    const foods = await foodModel.find({ foodPartner: foodPartner._id }).lean();
    const totalMeals = foods.length;
    const totalLikes = foods.reduce((sum, f) => sum + (f.likeCount || 0), 0);
    const totalSaves = foods.reduce((sum, f) => sum + (f.savesCount || 0), 0);

    return {
        _id: foodPartner._id,
        name: foodPartner.name,
        email: foodPartner.email,
        address: foodPartner.address,
        contactname: foodPartner.contactname,
        phone: foodPartner.phone,
        totalMeals,
        customersServed: totalSaves,
        totalLikes,
        totalSaves,
        foodItems: foods
    };
}

async function getFoodPartnerById(req, res) {
    const { id } = req.params;
    const foodPartner = await foodPartnerModel.findById(id);
    if (!foodPartner) {
        return res.status(404).json({ message: "Food partner not found" });
    }
    const profile = await buildProfile(foodPartner);
    return res.status(200).json({ foodPartner: profile });
}

async function getFoodPartnerMe(req, res) {
    const foodPartner = await foodPartnerModel.findById(req.foodPartner._id);
    if (!foodPartner) {
        return res.status(404).json({ message: "Food partner not found" });
    }
    const profile = await buildProfile(foodPartner);
    return res.status(200).json({ foodPartner: profile });
}

module.exports = {
    getFoodPartnerById,
    getFoodPartnerMe
};
