/**
 * routes/index.js
 * Маршруты публичной части сайта (слой маршрутизации MVC).
 */
const express = require('express');
const router = express.Router();
const page = require('../controllers/pageController');
const { isAuthenticated } = require('../middleware/auth');

router.get('/', page.home);
router.get('/services', page.services);

router.get('/booking', page.showBooking);
router.post('/booking', page.submitBooking);

router.get('/about', page.about);

router.get('/contact', page.showContact);
router.post('/contact', page.submitContact);

// Личный кабинет клиента — только для авторизованных
router.get('/dashboard', isAuthenticated, page.dashboard);

module.exports = router;
