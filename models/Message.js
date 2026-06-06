/**
 * models/Message.js
 * Модель сообщения из формы обратной связи. PostgreSQL, драйвер pg.
 */
const pool = require('../config/database');

const Message = {
  async create({ name, email, message }) {
    const { rows } = await pool.query(
      `INSERT INTO messages (name, email, message) VALUES ($1, $2, $3) RETURNING *`,
      [name, email, message]
    );
    return rows[0];
  },

  async getAll() {
    const { rows } = await pool.query(`SELECT * FROM messages ORDER BY id DESC`);
    return rows;
  },

  async delete(id) {
    await pool.query(`DELETE FROM messages WHERE id = $1`, [id]);
  },
};

module.exports = Message;
