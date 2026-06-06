/**
 * controllers/pageController.js
 * Контроллер публичных страниц сайта (слой Controller).
 * Главная, услуги,запись на ремонт, о нас, контакты.
 */
const Service = require('../models/Service');
const RepairRecord = require('../models/RepairRecord');
const Message = require('../models/Message');

// Главная страница (/)
exports.home = async (req, res) => {
  const services = await Service.getAll();
  res.render('home', {
    title: 'AutoCare Pro — Профессиональный ремонт автомобилей',
    services: services.slice(0, 2), // превью двух категорий
  });
};

// Страница услуг (/services)
exports.services = async (req, res) => {
  const mechanical = await Service.getByCategory('mechanical');
  const bodywork = await Service.getByCategory('bodywork');
  res.render('services', {
    title: 'Услуги — AutoCare Pro',
    mechanical,
    bodywork,
  });
};

// Форма записи на ремонт (GET /booking)
exports.showBooking = async (req, res) => {
  const services = await Service.getAll();
  res.render('booking', {
    title: 'Запись на ремонт — AutoCare Pro',
    services,
    success: req.query.success || null,
    error: req.query.error || null,
  });
};

// Обработка записи на ремонт (POST /booking)
exports.submitBooking = async (req, res) => {
  try {
    const { vehicle, license_plate, work_type, notes } = req.body;
    if (!vehicle || !license_plate || !work_type) {
      return res.redirect('/booking?error=' + encodeURIComponent('Заполните обязательные поля'));
    }
    await RepairRecord.create({
      user_id: req.session.user ? req.session.user.id : null,
      vehicle, license_plate, work_type, notes,
      difficulty: 'Medium', price: 0, status: 'Pending', progress: 0,
      start_date: new Date().toISOString().slice(0, 10),
    });
    return res.redirect('/booking?success=' +
      encodeURIComponent('Заявка принята! Механик свяжется с вами.'));
  } catch (err) {
    console.error('Ошибка записи:', err.message);
    return res.redirect('/booking?error=' + encodeURIComponent('Ошибка сервера'));
  }
};

// О нас (/about)
exports.about = (req, res) => {
  res.render('about', { title: 'О компании — AutoCare Pro' });
};

// Контакты (GET /contact)
exports.showContact = (req, res) => {
  res.render('contact', {
    title: 'Контакты — AutoCare Pro',
    success: req.query.success || null,
    error: req.query.error || null,
  });
};

// Обработка формы обратной связи (POST /contact)
exports.submitContact = async (req, res) => {
  try {
    const { name, email, message } = req.body;
    if (!name || !email || !message) {
      return res.redirect('/contact?error=' + encodeURIComponent('Заполните все поля'));
    }
    await Message.create({ name, email, message });
    return res.redirect('/contact?success=' +
      encodeURIComponent('Сообщение отправлено! Спасибо за обращение.'));
  } catch (err) {
    console.error('Ошибка контакта:', err.message);
    return res.redirect('/contact?error=' + encodeURIComponent('Ошибка сервера'));
  }
};

// Личный кабинет клиента (/dashboard)
exports.dashboard = async (req, res) => {
  const records = await RepairRecord.getByUser(req.session.user.id);
  const total = records.length;
  const inProgress = records.filter(r => r.status === 'In Progress').length;
  const completed = records.filter(r => r.status === 'Completed').length;
  res.render('dashboard', {
    title: 'Личный кабинет — AutoCare Pro',
    records,
    stats: { total, inProgress, completed },
  });
};
