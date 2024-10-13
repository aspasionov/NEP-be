const Router = require('express').Router
const router = new Router();
const LikeController = require('../controller/like.controller');
const verifyToken = require('../middleware/auth');

router.post('/:id', verifyToken, LikeController.createLike);
router.delete('/:id', verifyToken, LikeController.deleteLike);

module.exports = router