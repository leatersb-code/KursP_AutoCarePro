/**
 * models/RepairRecord.js
 * Модель заявки на ремонт (основная рабочая сущность). PostgreSQL, драйвер pg.
 * Используется и клиентом (просмотр своих заявок), и механиком-админом (полный CRUD).
 */
const pool = require('../middleware/config/database');

const RepairRecord = {
  // Все заявки (для админ-панели механика), с возможностью поиска
  async getAll(search = '') {
    if (search) {
      const like = `%${search}%`;
      const { rows } = await pool.query(
        `SELECT * FROM repair_records
         WHERE vehicle ILIKE $1 OR license_plate ILIKE $1 OR work_type ILIKE $1
         ORDER BY id DESC`,
        [like]
      );
      return rows;
    }
    const { rows } = await pool.query(`SELECT * FROM repair_records ORDER BY id DESC`);
    return rows;
  },

  // Заявки конкретного пользователя (для личного кабинета клиента)
  async getByUser(userId) {
    const { rows } = await pool.query(
      `SELECT * FROM repair_records WHERE user_id = $1 ORDER BY id DESC`, [userId]
    );
    return rows;
  },

  async findById(id) {
    const { rows } = await pool.query(`SELECT * FROM repair_records WHERE id = $1`, [id]);
    return rows[0];
  },

  // Создание заявки
  async create(data) {
    const {
      user_id = null, vehicle, license_plate, work_type, notes = '',
      difficulty = 'Medium', price = 0, status = 'Pending',
      progress = 0, start_date = null, finish_date = null,
    } = data;
    const { rows } = await pool.query(
      `INSERT INTO repair_records
       (user_id, vehicle, license_plate, work_type, notes, difficulty, price, status, progress, start_date, finish_date)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11) RETURNING *`,
      [user_id, vehicle, license_plate, work_type, notes, difficulty, price, status, progress,
       start_date || null, finish_date || null]
    );
    return rows[0];
  },

  // Обновление заявки (механик меняет статус, прогресс, цену и т.д.)
  async update(id, data) {
    const {
      vehicle, license_plate, work_type, notes,
      difficulty, price, status, progress, start_date, finish_date,
    } = data;
    const { rows } = await pool.query(
      `UPDATE repair_records SET
         vehicle=$1, license_plate=$2, work_type=$3, notes=$4,
         difficulty=$5, price=$6, status=$7, progress=$8,
         start_date=$9, finish_date=$10
       WHERE id=$11 RETURNING *`,
      [vehicle, license_plate, work_type, notes, difficulty, price, status, progress,
       start_date || null, finish_date || null, id]
    );
    return rows[0];
  },

  async delete(id) {
    await pool.query(`DELETE FROM repair_records WHERE id = $1`, [id]);
  },

  // Сводная статистика для панели (используется в дашборде и админке)
  async getStats() {
    const { rows } = await pool.query(`
      SELECT
        COUNT(*)                                              AS total,
        COUNT(*) FILTER (WHERE status = 'In Progress')        AS in_progress,
        COUNT(*) FILTER (WHERE status = 'Completed')          AS completed,
        COUNT(*) FILTER (WHERE status = 'Pending')            AS pending,
        COALESCE(SUM(price) FILTER (WHERE status='Completed'),0) AS revenue
      FROM repair_records
    `);
    return rows[0];
  },
};

module.exports = RepairRecord;
