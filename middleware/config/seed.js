/**
 * config/seed.js
 * Альтернатива импорту database.sql через pgAdmin.
 * Создаёт таблицы и наполняет БД данными программно (через драйвер pg).
 */
require('dotenv').config();
const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');
const pool = require('./database');

async function seed() {
  const client = await pool.connect();
  try {
    console.log('Инициализация базы данных AutoCare Pro (PostgreSQL)...');

    // 1. Выполняем DDL + INSERT из единого SQL-файла database.sql,
    //    но пароли пересоздаём ниже, чтобы они гарантированно совпадали.
    const sql = fs.readFileSync(path.join(__dirname, '..', 'database.sql'), 'utf8');
    await client.query(sql);

    // 2. Перезаписываем пароли реальными хэшами (на случай различий версий bcrypt)
    const adminHash = bcrypt.hashSync('admin123', 10);
    const clientHash = bcrypt.hashSync('client123', 10);
    await client.query(`UPDATE users SET password = $1 WHERE email = 'mechanic@autocarepro.com'`, [adminHash]);
    await client.query(`UPDATE users SET password = $1 WHERE email = 'client@autocarepro.com'`, [clientHash]);

    console.log('База данных успешно инициализирована.');
    console.log('Учётные записи:');
    console.log('  Механик (админ): mechanic@autocarepro.com / admin123');
    console.log('  Клиент:          client@autocarepro.com / client123');
  } catch (err) {
    console.error('Ошибка инициализации БД:', err.message);
    console.error('Убедитесь, что база "autocare" создана и .env заполнен корректно.');
  } finally {
    client.release();
    pool.end();
  }
}

seed();
