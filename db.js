const Pool = require('pg').Pool
const dbConfig = require('./db.config.js');
const pool = new Pool({
  user: dbConfig.USER,
  host: dbConfig.HOST,
  database: dbConfig.DB,
  password: dbConfig.PASSWORD,
  port: dbConfig.port,
  dialect: dbConfig.dialect,
  pool: {
    max: dbConfig.pool.max,
    min: dbConfig.pool.min,
    acquire: dbConfig.pool.acquire,
    idle: dbConfig.pool.idle
  }
})

// const createTables = async () => {
//   const client = await pool.connect();
//   try {
//     // Start table creation
//     await client.query(`
//       CREATE TABLE IF NOT EXISTS user_ (
//         id SERIAL PRIMARY KEY,
//         first_name VARCHAR(255) NOT NULL,
//         last_name VARCHAR(255) NOT NULL,
//         email VARCHAR(255) NOT NULL UNIQUE,
//         avatar VARCHAR(255) DEFAULT NULL,
//         password VARCHAR(255) NOT NULL
//       );
//     `);

//     await client.query(`
//       CREATE TABLE IF NOT EXISTS post (
//         id SERIAL PRIMARY KEY,
//         title VARCHAR(255) NOT NULL,
//         description VARCHAR(255) DEFAULT '',
//         photos VARCHAR(255)[] DEFAULT '{}',
//         user_id INTEGER,
//         created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
//         updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
//         FOREIGN KEY (user_id) REFERENCES user_(id)
//       );
//     `);
//     await client.query(`
//       CREATE TABLE IF NOT EXISTS comment (
//         id SERIAL PRIMARY KEY,
//         body VARCHAR(255) NOT NULL,
//         user_id INTEGER,
//         post_id INTEGER,
//         FOREIGN KEY (user_id) REFERENCES user_(id),
//         FOREIGN KEY (post_id) REFERENCES post(id)
//       );
//     `);
//     await client.query(`
//       CREATE TABLE IF NOT EXISTS file (
//         id SERIAL PRIMARY KEY,
//         path VARCHAR(255) NOT NULL,
//         post_id INTEGER,
//         FOREIGN KEY (post_id) REFERENCES post(id)
//       );
//     `);
//     await client.query(`
//       CREATE TABLE IF NOT EXISTS post_likes (
//         id SERIAL PRIMARY KEY,
//         user_id INTEGER,
//         post_id INTEGER,
//         created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
//         FOREIGN KEY (user_id) REFERENCES user_(id) ON DELETE CASCADE,
//         FOREIGN KEY (post_id) REFERENCES post(id) ON DELETE CASCADE,
//         UNIQUE (user_id, post_id)
//       );
//     `);

//     console.log('Tables created successfully!');
//   } catch (error) {
//     console.error('Error creating tables:', error);
//   } finally {
//     client.release();
//   }
// };
// createTables()
//   .then(() => {
//     console.log('Closing the pool...');
//     return pool.end();  // Close the pool after all queries are done
//   })
//   .catch((err) => {
//     console.error('Error during table creation or pool closure', err);
//     pool.end();  // Ensure the pool is still closed on error
//   });

module.exports = pool;