const db = require('../db');
const fs = require('fs');
const { validationResult } = require('express-validator');
const { presentErrors } = require('../utils')

class FileController {
  async updateAvatar(req,res) {
    try{
      const avatarUrl =`${process.env.BASE_URL}/${req.file.path}`
      const { id } = req.user
      const user = await db.query(
        `WITH previous_avatar AS (
          SELECT avatar FROM user_ WHERE id = $2
        )
        UPDATE user_ 
        SET avatar = $1 
        WHERE id = $2 
        RETURNING (SELECT avatar FROM previous_avatar) AS previous_avatar, avatar AS new_avatar;`,
        [avatarUrl, id]
      );
      const { previous_avatar, _new_avatar } = user.rows[0]
      if(previous_avatar) {
        const filePath = previous_avatar.split('/').pop()
        fs.unlink(`./uploads/avatars/${filePath}`, (err) => {
          if(err) console.log(err)
        })
      }
      res.status(200).json({message: "Avatar was updated"});
    } catch(error) {
      res.status(500).json({ message: error.message });
    }
  }

  async uploadPhotos(req, res) {
    try {
      const files = req.files.map(el => `${process.env.BASE_URL}/${el.path}`)
      const { id } = req.user

      const post = await db.query(
        `WITH old_post AS (
            SELECT photos FROM post WHERE user_id = $1 AND id = $2
          )
          UPDATE post
          SET photos = $3, updated_at = NOW()
          WHERE user_id = $1 AND id = $2
          RETURNING (SELECT photos FROM old_post) AS old_photos, *;`,
        [id, req.params.id, files]
      )

      if(!post.rows[0]) res.status(404).json({message: 'Post not found'});
      const { old_photos, ...rest } = post.rows[0]
      if(old_photos) {
        old_photos.forEach(el => {
          const filePath = el.split('/').pop()
          fs.unlink(`./uploads/${filePath}`, (err) => {
            if(err) console.log(err)
          })
        })
      }

      res.status(200).json(rest);
    } catch(error) {
      res.status(500).json({ message: error.message });
    }
  }
}

module.exports = new FileController()