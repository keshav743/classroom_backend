const express = require("express");
const router = express.Router();

const authController = require("../controllers/authControllers.js");

router.post("/signup", authController.signupController);
router.post("/login", authController.loginController);

module.exports = router;
