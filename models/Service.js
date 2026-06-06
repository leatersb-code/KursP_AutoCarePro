/**
 * models/Service.js
 * Модель услуги автосервиса (слой Model). PostgreSQL, драйвер pg.
 */
const pool = require('../config/database');

const Service = {
  async getAll() {
    const { rows } = await pool.query(`SELECT * FROM services ORDER BY id`);
    return rows;
  },

  async getByCategory(category) {
    const { rows } = await pool.query(
      `SELECT * FROM services WHERE category = $1 ORDER BY id`, [category]
    );
    return rows;
  },

  async findById(id) {
    const { rows } = await pool.query(`SELECT * FROM services WHERE id = $1`, [id]);
    return rows[0];
  },

  async create({ title, category, description, price, icon }) {
    const { rows } = await pool.query(
      `INSERT INTO services (title, category, description, price, icon)
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [title, category, description, price, icon || 'wrench']
    );
    return rows[0];
  },

  async delete(id) {
    await pool.query(`DELETE FROM services WHERE id = $1`, [id]);
  },
};

module.exports = Service;
