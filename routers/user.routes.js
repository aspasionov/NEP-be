const Router = require('express').Router
const router = new Router();
const UserController = require('../controller/user.controller');
const FileController = require('../controller/file.controller');
const verifyToken = require('../middleware/auth');
const { upload } = require('../utils');

const { registerValidator, loginValidator, updateUserValidator, forgotPasswordValidator, resetPasswordValidator } = require('../validations');


router.post('/register',registerValidator, UserController.createUser);
router.post('/login',loginValidator, UserController.login);
router.get('/me', verifyToken, UserController.getUser);
router.put('/user', verifyToken, updateUserValidator, UserController.updateUser);
router.delete('/user',verifyToken, UserController.deleteUser); 
router.post('/forgot-password', forgotPasswordValidator, UserController.forgotPassword);
router.post('/reset-password', resetPasswordValidator, UserController.resetPassword);
router.post('/avatar', verifyToken, upload('./uploads/avatars/').single('avatar'), FileController.updateAvatar);

module.exports = router;