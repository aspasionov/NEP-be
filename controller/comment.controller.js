const db = require('../db');
const { presentErrors } = require('../utils')

const { validationResult } = require('express-validator');

class CommentController {

  async createComment(req, res) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: presentErrors(errors.array()) });
    }
    try {
      const { body } = req.body
      const comment = await db.query("INSERT INTO comment (post_id, user_id, body) VALUES($1, $2, $3) RETURNING id", [req.params.id, req.user.id, body]);
      if(!comment.rows[0]) {
        res.status(404).json({message: 'Post not found'});
      }
      res.status(201).json({message: 'Comment was created'});
    } catch(error) {
      res.status(500).json({ message: error.message });
    }
  }

}

module.exports = new CommentController();