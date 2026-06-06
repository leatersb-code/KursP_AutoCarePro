/**
 * middleware/auth.js
 * Промежуточные слои(middleware) для аутент. и авториз. по ролям.
 *   isAuthenticated — проверяет, что пользователь вошёл в систему.
 *   isMechanic  — провряет, что роль пользователя = 'mechanic'(админ).
 * Если проверка не пройдена, запрос перенаправляется на страницу входа
 * или возвращается ошибка доступа (403).
 */

// Пользователь должен быть авторизован
function isAuthenticated(req, res, next) {
  if (req.session && req.session.user) {
    return next();
  }
  return res.redirect('/auth?error=' + encodeURIComponent('Войдите в систему для доступа'));
}

// Пользователь должен иметь роль механика(= администратора)
function isMechanic(req, res, next) {
  if (req.session && req.session.user && req.session.user.role === 'mechanic') {
    return next();
  }
  // Авторизован,но не механик — нет прав
  if (req.session && req.session.user) {
    return res.status(403).render('error', {
      title: 'Доступ запрещён',
      code: 403,
      message: 'Доступ к панели механика разрешён только пользователям с ролью «Механик».',
    });
  }
  // Не авторизован вовсе
  return res.redirect('/auth?error=' + encodeURIComponent('Войдите как механик'));
}

module.exports = { isAuthenticated, isMechanic };
