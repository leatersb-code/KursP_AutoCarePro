-- =====================================================================
--  AutoCare Pro — SQL-скрипт создания базы данных для PostgreSQL
--  Предназначен для импорта через pgAdmin 4 (Query Tool) или psql.
--
--  ПОРЯДОК ДЕЙСТВИЙ В pgAdmin 4:
--    1. Servers -> PostgreSQL -> Databases -> ПКМ -> Create -> Database...
--       Имя базы: autocare  (Owner: postgres) -> Save
--    2. Выделите базу "autocare" -> Tools -> Query Tool
--    3. Откройте этот файл (значок папки) или вставьте его содержимое
--    4. Нажмите F5 (Execute). Таблицы и данные будут созданы.
--
--  Пароли хранятся в виде bcrypt-хэшей:
--    mechanic@autocarepro.com / admin123   (роль: mechanic = админ)
--    client@autocarepro.com   / client123  (роль: client)
-- =====================================================================

-- Удаляем старые таблицы (чтобы скрипт можно было выполнять повторно)
DROP TABLE IF EXISTS repair_records CASCADE;
DROP TABLE IF EXISTS messages       CASCADE;
DROP TABLE IF EXISTS services       CASCADE;
DROP TABLE IF EXISTS users          CASCADE;
DROP TABLE IF EXISTS session        CASCADE;

-- ---------------------------------------------------------------------
-- Таблица пользователей системы (роли: client / mechanic)
-- ---------------------------------------------------------------------
CREATE TABLE users (
    id          SERIAL PRIMARY KEY,
    full_name   VARCHAR(120) NOT NULL,
    email       VARCHAR(120) NOT NULL UNIQUE,
    password    VARCHAR(255) NOT NULL,           -- bcrypt-хэш пароля
    role        VARCHAR(20)  NOT NULL DEFAULT 'client'
                CHECK (role IN ('client', 'mechanic')),
    created_at  TIMESTAMP    NOT NULL DEFAULT NOW()
);

-- ---------------------------------------------------------------------
-- Каталог услуг автосервиса
-- ---------------------------------------------------------------------
CREATE TABLE services (
    id          SERIAL PRIMARY KEY,
    title       VARCHAR(120) NOT NULL,
    category    VARCHAR(30)  NOT NULL
                CHECK (category IN ('mechanical', 'bodywork')),
    description TEXT         NOT NULL,
    price       NUMERIC(10,2) NOT NULL DEFAULT 0,
    icon        VARCHAR(30)  DEFAULT 'wrench'
);

-- ---------------------------------------------------------------------
-- Заявки на ремонт (основная рабочая сущность, ею управляет механик)
-- ---------------------------------------------------------------------
CREATE TABLE repair_records (
    id            SERIAL PRIMARY KEY,
    user_id       INTEGER REFERENCES users(id) ON DELETE SET NULL,
    vehicle       VARCHAR(120) NOT NULL,         -- марка/модель/год
    license_plate VARCHAR(30)  NOT NULL,         -- гос. номер
    work_type     VARCHAR(200) NOT NULL,         -- тип работ
    notes         TEXT,                          -- примечания
    difficulty    VARCHAR(10)  NOT NULL DEFAULT 'Medium'
                  CHECK (difficulty IN ('Easy', 'Medium', 'Hard')),
    price         NUMERIC(10,2) NOT NULL DEFAULT 0,
    status        VARCHAR(20)  NOT NULL DEFAULT 'Pending'
                  CHECK (status IN ('Pending', 'In Progress', 'Completed')),
    progress      INTEGER      NOT NULL DEFAULT 0
                  CHECK (progress BETWEEN 0 AND 100),
    start_date    DATE,
    finish_date   DATE,
    created_at    TIMESTAMP    NOT NULL DEFAULT NOW()
);

-- ---------------------------------------------------------------------
-- Сообщения из формы обратной связи
-- ---------------------------------------------------------------------
CREATE TABLE messages (
    id          SERIAL PRIMARY KEY,
    name        VARCHAR(120) NOT NULL,
    email       VARCHAR(120) NOT NULL,
    message     TEXT         NOT NULL,
    created_at  TIMESTAMP    NOT NULL DEFAULT NOW()
);

-- ---------------------------------------------------------------------
-- Таблица сессий (используется connect-pg-simple для хранения сессий)
-- ---------------------------------------------------------------------
CREATE TABLE session (
    sid    VARCHAR      NOT NULL COLLATE "default",
    sess   JSON         NOT NULL,
    expire TIMESTAMP(6) NOT NULL,
    CONSTRAINT session_pkey PRIMARY KEY (sid)
);
CREATE INDEX IDX_session_expire ON session (expire);

-- =====================================================================
--  НАЧАЛЬНЫЕ (ДЕМОНСТРАЦИОННЫЕ) ДАННЫЕ
-- =====================================================================

-- Пользователи (пароли захэшированы bcrypt, см. шапку файла)
INSERT INTO users (full_name, email, password, role) VALUES
('Иван Механиков', 'mechanic@autocarepro.com',
 '$2a$10$6dTCIoSez3VBg13QHh3tC.wJTF2DjZDKJFy6vCbosFCAWTkH2qaG.', 'mechanic'),
('Алексей Клиентов', 'client@autocarepro.com',
 '$2a$10$SVUYjTSCsDmAInsxmjtNQe.McaaD2NRwbf6v5KtodZw.YhFOjEs/u', 'client');

-- Услуги: механический ремонт
INSERT INTO services (title, category, description, price, icon) VALUES
('Диагностика двигателя', 'mechanical', 'Компьютерная диагностика и ремонт двигателя с использованием современного оборудования.', 2500, 'engine'),
('Ремонт тормозной системы', 'mechanical', 'Проверка, замена колодок, дисков и обслуживание тормозной системы.', 3200, 'brake'),
('Обслуживание КПП', 'mechanical', 'Сервис и ремонт автоматических и механических коробок передач.', 8000, 'gear'),
('Замена масла и жидкостей', 'mechanical', 'Плановая замена масла, фильтров и технических жидкостей.', 1500, 'oil'),
-- Услуги: кузовной ремонт
('Кузовной ремонт', 'bodywork', 'Профессиональный ремонт после ДТП, восстановление геометрии кузова.', 12000, 'car'),
('Покраска автомобиля', 'bodywork', 'Подбор цвета и покраска с использованием компьютерного подбора.', 9500, 'paint'),
('Удаление вмятин', 'bodywork', 'Беспокрасочное и кузовное удаление вмятин и сколов.', 4000, 'dent'),
('Полировка и защита', 'bodywork', 'Полировка кузова, защитные покрытия и устранение царапин.', 3500, 'shine');

-- Заявки на ремонт (привязаны к клиенту id=2)
INSERT INTO repair_records
(user_id, vehicle, license_plate, work_type, notes, difficulty, price, status, progress, start_date, finish_date) VALUES
(2, '2019 Toyota Camry', 'ABC-1234', 'Диагностика двигателя и замена тормозов',
 'Тормозные колодки сильно изношены. Диагностика выявила незначительную проблему с датчиком.',
 'Medium', 850, 'In Progress', 65, '2026-05-11', '2026-05-15'),
(2, '2021 Honda Accord', 'XYZ-5678', 'Замена масла и ротация шин',
 'Плановое обслуживание выполнено. Все системы в норме.',
 'Easy', 115, 'Completed', 100, '2026-05-07', '2026-05-08'),
(2, '2020 Ford F-150', 'DEF-9012', 'Обслуживание трансмиссии',
 'Запланировано на следующую неделю. Запчасти заказаны.',
 'Hard', 1200, 'Pending', 0, '2026-05-19', '2026-05-23');

-- Готово. Проверьте: SELECT * FROM repair_records;
