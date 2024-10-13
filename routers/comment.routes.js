const Router = require('express').Router
const router = new Router();
const CommentController = require('../controller/comment.controller');
const verifyToken = require('../middleware/auth');

const { commentValidator } = require('../validations');

router.post('/:id', verifyToken, commentValidator, CommentController.createComment);

module.exports = router