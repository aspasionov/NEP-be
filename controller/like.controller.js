const db = require('../db');

class LikeController {
  async createLike(req, res) {
    try{
      const { id } = req.params
      const { id: user_id} = req.user
    
      const like = await db.query("INSERT INTO post_like (post_id, user_id) VALUES($1, $2) ON CONFLICT (user_id, post_id) DO NOTHING RETURNING id", [id, user_id]);
      if(!like.rows[0]) {
        res.status(404).json({message: 'Post not found'});
      }
      res.status(201).json({message: 'Like was created'});
    } catch(error) {
      res.status(500).json({ message: error.message });
    }
  }

  async deleteLike(req, res) {
    try{
      const { id } = req.params
      const { id: user_id} = req.user
      const deletedLike = await db.query('DELETE FROM post_like WHERE post_id = $1 and user_id = $2 RETURNING *', [id, user_id]);
      if(!deletedLike.rows[0]) res.status(404).json({message: 'Like not found'});
      res.status(200).json({message: 'Like was deleted'})
    } catch(error) {
      res.status(500).json({ message: error.message });
    }
  }
}

module.exports = new LikeController()