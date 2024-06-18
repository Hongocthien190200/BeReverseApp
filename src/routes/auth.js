const authController = require('../controllers/authController');
const midleware = require('../midleware/midlewareController');

const router = require('express').Router();

// router.post("/register", midleware.verifyTokenAndAdminAuth, authController.registerUser);
router.post("/register",authController.registerUser);
router.patch("/changepw", midleware.verifyTokenAndAdminAuth, authController.changePassword);
router.post("/login", authController.loginUser);
router.post("/logout", midleware.verifyToken, authController.logoutUser);
router.post("/refresh", authController.requestRefreshToken);
router.delete('/users/:id',midleware.verifyTokenAndAdminAuth, authController.deleteUser);

module.exports = router;