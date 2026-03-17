const express = require("express");
const router = express.Router();
const foodPartnerController = require("../controller/foodpartner.controller");
const authMiddleware = require("../middlewares/auth.middleware");

router.get("/me", authMiddleware.authFoodPartnerMiddleware, foodPartnerController.getFoodPartnerMe);
router.get("/:id", foodPartnerController.getFoodPartnerById);

module.exports = router;
