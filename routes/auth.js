/**
 * routes/auth.js
 * Маршруты аутентификации и авторизации.
 */
const express = require('express');
const router = express.Router();
const auth = require('../controllers/authController');

router.get('/auth', auth.showAuth);
router.post('/auth/login', auth.login);
router.post('/auth/register', auth.register);
router.get('/auth/logout', auth.logout);

module.exports = router;
