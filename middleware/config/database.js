/**
 * config/database.js
 * Модуль конфигурации подключения к базе данных PostgreSQL.
 * Инициализирует пул соединений (Connection Pool) с СУБД PostgreSQL.
 * Реквизиты доступа берутся из файла окружения .env (модуль dotenv).
 * Пул экспортируется и переиспользуется во всех моделях приложения.
 */
require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  database: process.env.DB_NAME || 'autocare',
  max: 10,                       // максимальное число соединений в пуле
  idleTimeoutMillis: 30000,
});

// Проверка соединения при запуске приложения
pool.on('error', (err) => {
  console.error('Неожиданная ошибка пула PostgreSQL:', err.message);
});

module.exports = pool;
