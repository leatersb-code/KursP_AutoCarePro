/**
 * config/database.js
 * Модуль конфигурации подключения к базе данных PostgreSQL.
 * Инициализирует пул соединений (Connection Pool) с СУБД PostgreSQL.
 * Реквизиты доступа берутся из переменной DATABASE_URL (в облаке) или .env (локально).
 * Пул экспортируется и переиспользуется во всех моделях приложения.
 */
require('dotenv').config();
const { Pool } = require('pg');

// Проверяем, запущены ли мы в облаке (production)
const isProduction = process.env.NODE_ENV === 'production';

let pool;

if (process.env.DATABASE_URL) {
  // Настройка для Render.com (используем единую строку подключения)
  pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: isProduction ? { rejectUnauthorized: false } : false, // Обязательный SSL для Render
    max: 10,
    idleTimeoutMillis: 30000,
  });
} else {
  // Настройка для локального компьютера (твои старые параметры)
  pool = new Pool({
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
    database: process.env.DB_NAME || 'autocare',
    max: 10,
    idleTimeoutMillis: 30000,
  });
}

// Проверка соединения при запуске приложения
pool.on('error', (err) => {
  console.error('Неожиданная ошибка пула PostgreSQL:', err.message);
});

module.exports = pool;
