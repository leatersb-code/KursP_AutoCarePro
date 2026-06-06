/**
 * controllers/authController.js
 * Контроллер аутентификации и авторизации (слой Controller).
 * Обрабатывает регистрацию, вход и выход пользователей.
 */
const User = require('../models/User');

// Страница входа/регистрации
exports.showAuth = (req, res) => {
  res.render('auth', {
    title: 'Вход — AutoCare Pro',
    error: req.query.error || null,
    success: req.query.success || null,
  });
};

// Обработка входа (POST /auth/login)
exports.login = async (req, res) => {
  try {
    const { email, password, role } = req.body;
    const user = await User.findByEmail(email);

    if (!user || !User.verifyPassword(password, user.password)) {
      return res.redirect('/auth?error=' + encodeURIComponent('Неверный email или пароль'));
    }

    // Проверяем соответствие выбранной роли (вкладка Клиент/Механик)
    if (role && role !== user.role) {
      return res.redirect('/auth?error=' +
        encodeURIComponent('Эта учётная запись не относится к выбранной роли'));
    }

    // Сохраняем пользователя в сессии (без пароля)
    req.session.user = {
      id: user.id,
      full_name: user.full_name,
      email: user.email,
      role: user.role,
    };

    // Механик попадает в админ-панель, клиент — в личный кабинет
    return res.redirect(user.role === 'mechanic' ? '/mechanic' : '/dashboard');
  } catch (err) {
    console.error('Ошибка входа:', err.message);
    return res.redirect('/auth?error=' + encodeURIComponent('Ошибка сервера при входе'));
  }
};

// Обработка регистрации (POST /auth/register)
exports.register = async (req, res) => {
  try {
    const { full_name, email, password, role } = req.body;

    if (!full_name || !email || !password) {
      return res.redirect('/auth?error=' + encodeURIComponent('Заполните все поля'));
    }

    const exists = await User.findByEmail(email);
    if (exists) {
      return res.redirect('/auth?error=' + encodeURIComponent('Пользователь с таким email уже существует'));
    }

    const safeRole = role === 'mechanic' ? 'mechanic' : 'client';
    const user = await User.create({ full_name, email, password, role: safeRole });

    req.session.user = {
      id: user.id, full_name: user.full_name, email: user.email, role: user.role,
    };
    return res.redirect(user.role === 'mechanic' ? '/mechanic' : '/dashboard');
  } catch (err) {
    console.error('Ошибка регистрации:', err.message);
    return res.redirect('/auth?error=' + encodeURIComponent('Ошибка сервера при регистрации'));
  }
};

// Выход (GET /auth/logout)
exports.logout = (req, res) => {
  req.session.destroy(() => res.redirect('/'));
};
