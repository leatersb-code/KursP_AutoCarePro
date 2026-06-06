/**
 * controllers/mechanicController.js
 * Контроллер административной панели механика (слой Controller).
 * Механик выполняет функции администратора: полный доступ к базе данных,
 * управление заявками на ремонт (CRUD), просмотр пользователей,
 * услуг и сообщений обратной связи.
 */
const RepairRecord = require('../models/RepairRecord');
const User = require('../models/User');
const Service = require('../models/Service');
const Message = require('../models/Message');

// Главная панель механика: список заявок + поиск + статистика
exports.panel = async (req, res) => {
  const search = req.query.search || '';
  const records = await RepairRecord.getAll(search);
  const stats = await RepairRecord.getStats();
  res.render('admin/panel', {
    title: 'Панель механика — AutoCare Pro',
    records,
    stats,
    search,
    success: req.query.success || null,
    error: req.query.error || null,
  });
};

// Создание заявки (POST /mechanic/records)
exports.createRecord = async (req, res) => {
  try {
    await RepairRecord.create(req.body);
    res.redirect('/mechanic?success=' + encodeURIComponent('Заявка добавлена'));
  } catch (err) {
    console.error(err.message);
    res.redirect('/mechanic?error=' + encodeURIComponent('Не удалось добавить заявку'));
  }
};

// Форма редактирования заявки (GET /mechanic/records/:id/edit)
exports.editRecordForm = async (req, res) => {
  const record = await RepairRecord.findById(req.params.id);
  if (!record) return res.redirect('/mechanic?error=' + encodeURIComponent('Заявка не найдена'));
  res.render('admin/edit-record', {
    title: 'Редактирование заявки — AutoCare Pro',
    record,
  });
};

// Обновление заявки (POST /mechanic/records/:id)
exports.updateRecord = async (req, res) => {
  try {
    await RepairRecord.update(req.params.id, req.body);
    res.redirect('/mechanic?success=' + encodeURIComponent('Заявка обновлена'));
  } catch (err) {
    console.error(err.message);
    res.redirect('/mechanic?error=' + encodeURIComponent('Не удалось обновить заявку'));
  }
};

// Удаление заявки (POST /mechanic/records/:id/delete)
exports.deleteRecord = async (req, res) => {
  try {
    await RepairRecord.delete(req.params.id);
    res.redirect('/mechanic?success=' + encodeURIComponent('Заявка удалена'));
  } catch (err) {
    console.error(err.message);
    res.redirect('/mechanic?error=' + encodeURIComponent('Не удалось удалить заявку'));
  }
};

// Просмотр всей базы данных (GET /mechanic/database)
// Демонстрирует прямой доступ механика-администратора к таблицам БД.
exports.database = async (req, res) => {
  const [users, services, messages, stats] = await Promise.all([
    User.getAll(),
    Service.getAll(),
    Message.getAll(),
    RepairRecord.getStats(),
  ]);
  res.render('admin/database', {
    title: 'База данных — AutoCare Pro',
    users, services, messages, stats,
    success: req.query.success || null,
  });
};

// Удаление пользователя из БД (POST /mechanic/users/:id/delete)
exports.deleteUser = async (req, res) => {
  try {
    await User.delete(req.params.id);
    res.redirect('/mechanic/database?success=' + encodeURIComponent('Пользователь удалён'));
  } catch (err) {
    res.redirect('/mechanic/database');
  }
};

// Удаление сообщения (POST /mechanic/messages/:id/delete)
exports.deleteMessage = async (req, res) => {
  try {
    await Message.delete(req.params.id);
    res.redirect('/mechanic/database?success=' + encodeURIComponent('Сообщение удалено'));
  } catch (err) {
    res.redirect('/mechanic/database');
  }
};
