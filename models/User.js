/**
 * models/User.js
 * Модель пользователя (слой Model в архитектуре MVC).
 * Инкапсулирует все SQL-запросы к таблице users (PostgreSQL, драйвер pg).
 * Все методы асинхронные (возвращают Promise).
 */
const pool = require('../middleware/config/database');
const bcrypt = require('bcryptjs');

const User = {
  // Создание нового пользователя с хэшированием пароля
  async create({ full_name, email, password, role = 'client' }) {
    const hash = bcrypt.hashSync(password, 10);
    const { rows } = await pool.query(
      `INSERT INTO users (full_name, email, password, role)
       VALUES ($1, $2, $3, $4) RETURNING *`,
      [full_name, email, hash, role]
    );
    return rows[0];
  },

  // Поиск по email (для авторизации)
  async findByEmail(email) {
    const { rows } = await pool.query(`SELECT * FROM users WHERE email = $1`, [email]);
    return rows[0];
  },

  // Поиск по идентификатору
  async findById(id) {
    const { rows } = await pool.query(`SELECT * FROM users WHERE id = $1`, [id]);
    return rows[0];
  },

  // Все пользователи (для админ-панели)
  async getAll() {
    const { rows } = await pool.query(
      `SELECT id, full_name, email, role, created_at FROM users ORDER BY id`
    );
    return rows;
  },

  // Удаление пользователя
  async delete(id) {
    await pool.query(`DELETE FROM users WHERE id = $1`, [id]);
  },

  // Проверка пароля при входе
  verifyPassword(plain, hash) {
    return bcrypt.compareSync(plain, hash);
  },
};

module.exports = User;
