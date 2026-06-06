/**
 * server.js
 * Главная точка входа в приложение AutoCare Pro.
 * Инициализирует Express-сервер, настраивает шаблонизатор EJS,
 * сессии (хранятся в PostgreSQL через connect-pg-simple),
 * статические файлы и подключает маршруты (архитектура MVC).
 */
require('dotenv').config();
const path = require('path');
const express = require('express');
const session = require('express-session');
const expressLayouts = require('express-ejs-layouts');
const pgSession = require('connect-pg-simple')(session);
const pool = require('./middleware/config/database');

const app = express();
const PORT = process.env.PORT || 3000;

// --- Шаблонизатор (View) -------------------------------------------------
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(expressLayouts);
app.set('layout', 'layout'); // общий каркас страниц views/layout.ejs

// --- Парсинг тела запросов и статика ------------------------------------
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// --- Сессии (хранятся в таблице session в PostgreSQL) -------------------
app.use(session({
  store: new pgSession({ pool, tableName: 'session' }),
  secret: process.env.SESSION_SECRET || 'secret',
  resave: false,
  saveUninitialized: false,
  cookie: { maxAge: 24 * 60 * 60 * 1000 }, // 24 часа
}));

// --- Передача данных пользователя во все шаблоны ------------------------
app.use((req, res, next) => {
  res.locals.currentUser = req.session.user || null;
  res.locals.path = req.path;
  next();
});

// --- Маршруты (Routes -> Controllers) -----------------------------------
app.use('/', require('./routes/index'));
app.use('/', require('./routes/auth'));
app.use('/', require('./routes/mechanic'));

// --- Обработка 404 ------------------------------------------------------
app.use((req, res) => {
  res.status(404).render('error', {
    title: 'Страница не найдена',
    code: 404,
    message: 'Запрашиваемая страница не существует.',
  });
});
// --- Автоматическое создание таблиц при старте ---------------------------
const fs = require('fs');
async function initDatabase() {
  try {
    // Читаем твой sql файл
    const sql = fs.readFileSync(path.join(__dirname, 'database.sql'), 'utf8');


    
    // Добавляем к нему создание таблицы сессий (чтобы connect-pg-simple не ругался)
    const sessionTableSql = `
      CREATE TABLE IF NOT EXISTS "session" (
        "sid" varchar NOT NULL COLLATE "default",
        "sess" json NOT NULL,
        "expire" timestamp(6) NOT NULL
      ) WITH (OIDS=FALSE);
      ALTER TABLE "session" DROP CONSTRAINT IF EXISTS "session_pkey";
      ALTER TABLE "session" ADD CONSTRAINT "session_pkey" PRIMARY KEY ("sid") NOT DEFERRABLE INITIALLY IMMEDIATE;
      CREATE INDEX IF NOT EXISTS "IDX_session_expire" ON "session" ("expire");
    `;

    // Выполняем всё в базе данных
    await pool.query(sql);
    await pool.query(sessionTableSql);
    console.log('БД успешно инициализирована (таблицы созданы).');
  } catch (err) {
    console.error('Ошибка инициализации БД:', err);
  }
}


initDatabase();
// --- Запуск сервера -----------------------------------------------------
app.listen(PORT, () => {
  console.log(`AutoCare Pro запущен: http://localhost:${PORT}`);
});
