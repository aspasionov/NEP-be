const { body } = require('express-validator');

const registerValidator = [
  body('email').isEmail(),
  body('first_name').not().isEmpty(),
  body('last_name').not().isEmpty(),
  body('password').isLength({ min: 6 }).trim()
]

const loginValidator = [
  body('email').isEmail(),
  body('password').isLength({ min: 6 }).trim()
]

const updateUserValidator = [
  body('first_name').not().isEmpty(),
  body('last_name').not().isEmpty(),
]

const createPostValidator = [
  body('title').not().isEmpty(),
]

const updatePostValidator = [
  body('title').not().isEmpty(),
]

const commentValidator = [
  body('body').not().isEmpty(),
]

const forgotPasswordValidator = [
  body('email').isEmail(),
]

const resetPasswordValidator = [
  body('password').isLength({ min: 6 }).trim(),
  body('token').not().isEmpty(),
]

module.exports = {registerValidator, loginValidator, updateUserValidator, createPostValidator, updatePostValidator, commentValidator, forgotPasswordValidator, resetPasswordValidator }