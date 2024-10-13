const Router = require('express').Router
const router = new Router();
const PostController = require('../controller/post.controller');
const FileController = require('../controller/file.controller');
const verifyToken = require('../middleware/auth');
const { upload } = require('../utils');
const { createPostValidator, updatePostValidator } = require('../validations');

router.get('/my', (req,res) => {
  res.send('<h1>Hello World</h1>')
});
router.get('/all', verifyToken, PostController.getAllPosts);
router.post('/create', verifyToken, createPostValidator, PostController.createPost);
router.get('/:id', verifyToken, PostController.getOnePost);
router.patch('/:id', verifyToken, updatePostValidator, PostController.updatePost);
router.delete('/:id', verifyToken, PostController.deletePost);
router.post('/photos/:id', verifyToken, upload().array('photos', 5), FileController.uploadPhotos);

module.exports = router;