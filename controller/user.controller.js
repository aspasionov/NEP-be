const db = require('../db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');
const { presentErrors } = require('../utils')
const nodemailer = require('nodemailer');

class UserController {
  async createUser(req, res) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: presentErrors(errors.array()) });
    }

    const existingUser = await db.query('SELECT * FROM user_ WHERE email = $1', [req.body.email]);
    if (existingUser.rows.length > 0) {
      return res.status(400).json({ message: 'User already exists' });
    }
    const hashedPassword = await bcrypt.hash(req.body.password, 10);

    const {first_name, last_name, email} = req.body

    
    try {
      const newUser = await db.query('INSERT INTO user_ (first_name, last_name, email, password) VALUES ($1, $2, $3, $4) RETURNING *', [first_name, last_name, email, hashedPassword]);
      const {password, ...rest} = newUser.rows[0]
      const token = jwt.sign(rest, process.env.SECRET, { expiresIn: '24h' });
      res.status(201).json({...rest, token});
    } catch(error) {
      res.status(500).json({ message: error.message });
    }
  }

  async login(req, res) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: ['Invalid email or password'] });
    }
    try {
      const user = await db.query('SELECT * FROM user_ WHERE email = $1', [req.body.email]);

      if (user.rows.length === 0) {
        return res.status(401).json({ message: 'Invalid email or password' });
      }
      const passwordMatch = await bcrypt.compare(req.body.password, user.rows[0].password);
      if (!passwordMatch) {
        return res.status(401).json({ message: 'Invalid email or password' });
      }
      

      const {password, ...rest} = user.rows[0]
      const token = jwt.sign(rest, process.env.SECRET, { expiresIn: '24h' });
      res.status(200).json({...rest, token});
    } catch(error) {
      res.status(500).json({ message: error.message });
    }
  }

  async getUser(req, res) {
    const { id } = req.user
    const user = await db.query('SELECT * FROM user_ WHERE id = $1', [id]);
    if(!user?.rows[0]) res.status(404).json({message: 'User not found'});
    const {password, ...rest} = user.rows[0]
    res.status(200).json(rest);
  }

  async updateUser(req, res) {
    const err = validationResult(req);
    if (!err.isEmpty()) {
      return res.status(400).json({ errors: presentErrors(err.array()) });
    }

    const {first_name, last_name, avatar} = req.body
    console.log('avatar', avatar)
    const updatedUser = await db.query(`
      UPDATE user_
      SET first_name = COALESCE($1, first_name), last_name = COALESCE($2, last_name)
      WHERE id = $3
      RETURNING *
    `, [first_name, last_name,  req.user.id]);

    if(!updatedUser.rows[0]) return res.status(404).json({message: 'User not found'})
    const {password, ...rest} = updatedUser.rows[0]
    res.status(200).json(rest)
  }

  async deleteUser(req, res) {
    const { id } = req.user
    const deletedUser = await db.query('DELETE FROM user_ WHERE id = $1', [id]);
    if(!deletedUser.rows[0]) res.status(404).json({message: 'User not found'});
    res.status(200).json({message: 'User width id ' + id + ' was deleted'})
  }

  async resetPassword(req, res) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: presentErrors(errors.array()) });
    }
    const { token, password } = req.body
    jwt.verify(token, process.env.SECRET, async (err, decoded) => {
      if (err) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const { email } = decoded
      console.log('email', email)
      const user = await db.query('SELECT * FROM user_ WHERE email = $1',[email])
      if(!user.rows[0]) return res.status(404).json({message: 'User not found'})

      const hashedPassword = await bcrypt.hash(password, 10);
      await db.query('UPDATE user_ SET password = $1 WHERE email = $2', [hashedPassword, email]);
      res.status(200).json({message: 'Password was reset'})
    });
}

  async forgotPassword(req, res) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: presentErrors(errors.array()) });
    }
    try {
      const { email } = req.body
      const user = await db.query('SELECT * FROM user_ WHERE email = $1', [email]);
      if(!user.rows[0]) return res.status(404).json({message: 'User not found'})

      const token = jwt.sign({email: email}, process.env.SECRET, { expiresIn: '1h' });
      const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS,
        },
      });
      const mailOptions = {
        from: 'noreply@gmail.com',
        to: email,
        subject: 'Password Reset',
        html: `Click the following link to reset your password: <a href="${process.env.CLIENT_URL}/reset-password/${token}"> reset password</a>`,
      };
      transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
          console.log(error);
          res.status(500).send('Error sending email');
        } else {
          console.log(`Email sent: ${info.response}`);
          res.status(200).send('Check your email for instructions on resetting your password');
        }
      });
    } catch(error) {
      res.status(500).json({ message: error.message });
    }
  }
}

module.exports = new UserController();