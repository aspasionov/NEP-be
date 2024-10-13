const db = require('../db');

const { validationResult } = require('express-validator');

class PostController {

  async getOnePost(req, res) {
      try {
        const post = await db.query(`
          SELECT post.id, post.title, post.description, post.created_at, post.updated_at,
          (
            SELECT json_build_object(
              'id', user_.id,
              'first_name', user_.first_name,
              'last_name', user_.last_name,
              'email', user_.email,
              'avatar', user_.avatar
            )
            FROM user_
            WHERE user_.id = post.user_id
          ) as author,
          (SELECT COUNT(*)::integer FROM post_like WHERE post_like.post_id = post.id) as likes_count,
          EXISTS (SELECT 1 FROM post_like WHERE post_like.user_id = post.user_id AND post_like.post_id = post.id) as liked_by_user,
          (
            SELECT json_agg(
              json_build_object(
                'id', comment.id,
                'body', comment.body,
                'user', (
                  SELECT json_build_object(
                    'id', user_.id,
                    'first_name', user_.first_name,
                    'last_name', user_.last_name,
                    'email', user_.email,
                    'avatar', user_.avatar
                  )
                  FROM user_
                  WHERE user_.id = comment.user_id
                )
              )
            )
            FROM comment
            WHERE comment.post_id = post.id
          ) as comments
          FROM post
          WHERE post.id = $1
        `, [req.params.id]);
        if(!post.rows[0]) res.status(404).json({message: 'Post not found'});
        res.status(200).json(post.rows[0]);
      } catch(error) {
        res.status(500).json({ message: error.message });
      }
  }

  async getPosts(req, res) {
    const limit = req.query.limit ? parseInt(req.query.limit, 10) : 10;
    const offset = req.query.offset ? parseInt(req.query.offset, 10) : 0;
    try {
      const posts = await db.query(`
        SELECT post.*,
        (
          SELECT COUNT(*)::integer FROM post_like WHERE post_like.post_id = post.id
        ) as likes
        FROM post
        WHERE post.user_id = $1
        ORDER BY post.created_at DESC
        LIMIT $2 OFFSET $3
      `, [req.user.id, limit, offset]);

      const totalCount = await db.query(`
        SELECT COUNT(*)::integer
        FROM post
        WHERE post.user_id = $1
      `, [req.user.id])

      if(!posts.rows[0]) res.status(404).json({message: 'Posts not found'});
      res.status(200).json({data: posts.rows, meta: {totalCount: totalCount.rows[0].count}});
    } catch(error) {
      res.status(500).json({ message: error.message });
    }
  }
  async getAllPosts(req, res) {
    const limit = req.query.limit ? parseInt(req.query.limit, 10) : 10;
    const offset = req.query.offset ? parseInt(req.query.offset, 10) : 0;
    const userId = req.query.userId
    try {
      const posts = await db.query(`
        SELECT post.*,
        (
          SELECT COUNT(*)::integer FROM post_like WHERE post_like.post_id = post.id
        ) as likes,
        (
          SELECT json_build_object(
            'id', user_.id,
            'first_name', user_.first_name,
            'last_name', user_.last_name,
            'email', user_.email,
            'avatar', user_.avatar
          )
          FROM user_
          WHERE user_.id = post.user_id
        ) as author
        FROM post
        ${userId ? `WHERE post.user_id = ${userId}` : ''}
        ORDER BY post.created_at DESC
        LIMIT $1 OFFSET $2
      `, [limit, offset]);
      const totalCount = await db.query(`
        SELECT COUNT(*)::integer
        FROM post
      `)

      if(!posts.rows[0]) res.status(404).json({message: 'Posts not found'});
      res.status(200).json({meta: {totalCount: totalCount.rows[0].count}, data: posts.rows});
    } catch(error) {
      res.status(500).json({ message: error.message });
    }
  }

  async updatePost(req, res) {
    const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: presentErrors(errors.array()) });
      }
    try {
      const {title, description} = req.body
      const updatedPost = await db.query(`
        UPDATE post
        SET title = COALESCE($1, title), description = COALESCE($2, description)
        WHERE id = $3 AND user_id = $4
        RETURNING *
      `, [title, description || '', req.params.id, req.user.id]);

      if(!updatedPost.rows[0]) return res.status(404).json({message: 'Post not found'})
      res.status(200).json(updatedPost.rows[0]);
    } catch(error) {
      res.status(500).json({ message: error.message });
    }
  }

  async createPost(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: presentErrors(errors.array()) });
      }
      const {title, description} = req.body
      const values = [title, req.user.id]
      const fields = ['title', 'user_id']
      if (description) {
        values.push(description)
        fields.push('description')
      }
      const newPost = await db.query(`INSERT INTO post (${fields.join(', ')}) VALUES (${values.map((v, i) => `$${i + 1}`).join(', ')}) RETURNING *`, values);
      res.status(201).json(newPost.rows[0]);
    } catch(error) {
      res.status(500).json({ message: error.message });
    }
  }

  async deletePost(req, res) {
    try {
      const { id } = req.params
      const { id: user_id} = req.user
      const deletedPost = await db.query('DELETE FROM post WHERE id = $1 and user_id = $2 RETURNING *', [id, user_id]);
      if(!deletedPost.rows[0]) res.status(404).json({message: 'Post not found'});
      res.status(200).json({message: 'Post width id ' + id + ' was deleted'})
    } catch(error) {
      res.status(500).json({ message: error.message });
    }
  }
}

module.exports = new PostController()