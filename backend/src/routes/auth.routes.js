const express = require('express');
const authcontroller = require('../controller/auth.controller');

const router = express.Router();

//user Auth routes
router.post('/user/register', authcontroller.registerUser);
router.post('/user/login', authcontroller.loginUser);
router.get('/user/logout', authcontroller.logoutUser);

// food partner auth apis
router.post('/food-partner/register', authcontroller.registerFoodPartner);
router.post('/food-partner/login', authcontroller.loginFoodPartner);
router.get('/food-partner/logout', authcontroller.logoutFoodPartner);
// debug: list all food partners
router.get('/food-partner/debug/list', authcontroller.listFoodPartners);

module.exports = router;
