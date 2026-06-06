/**
 * routes/mechanic.js
 * Маршруты административной панели механика.
 * Все маршруты защищены middleware isMechanic (доступ только для роли 'mechanic') (он же админ).
 */
const express = require('express');
const router = express.Router();
const mech = require('../controllers/mechanicController');
const { isMechanic } = require('../middleware/auth');

// Защищаем все маршруты ниже
router.use('/mechanic', isMechanic);

// Панель и работа с заявками (CRUD)
router.get('/mechanic', mech.panel);
router.post('/mechanic/records', mech.createRecord);
router.get('/mechanic/records/:id/edit', mech.editRecordForm);
router.post('/mechanic/records/:id', mech.updateRecord);
router.post('/mechanic/records/:id/delete', mech.deleteRecord);

// Прямой доступ к базе данных (пользователи, услуги, сообщения)
router.get('/mechanic/database', mech.database);
router.post('/mechanic/users/:id/delete', mech.deleteUser);
router.post('/mechanic/messages/:id/delete', mech.deleteMessage);

module.exports = router;
