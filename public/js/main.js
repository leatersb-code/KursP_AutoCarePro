/* =====================================================================
   main.js — клиентская интерактивность (JavaScript)
   Реализует: мобильное меню, FAQ, переключение ролей и
   формы вход/регистрация на странице авторизации, форму заявки в админке.
   ===================================================================== */

document.addEventListener('DOMContentLoaded', function () {

  /* ---- Мобильное меню  ---- */
  const toggle = document.getElementById('navToggle');
  const links = document.getElementById('navLinks');
  if (toggle && links) {
    toggle.addEventListener('click', () => links.classList.toggle('show'));
  }

  /* ---- Аккордеон FAQ ---- */
  document.querySelectorAll('.acc-head').forEach(head => {
    head.addEventListener('click', () => {
      const item = head.parentElement;
      const isOpen = item.classList.contains('open');
      // Закрываем все, затем открываем выбранный
      document.querySelectorAll('.acc-item').forEach(i => i.classList.remove('open'));
      if (!isOpen) item.classList.add('open');
    });
  });

  /* ---- Переключение ролей Клиент/Механик на странице входа ---- */
  const roleTabs = document.querySelectorAll('.role-tabs button');
  roleTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      roleTabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      // Синхронизируем выбранную роль в обеих формах (вход и регистрация)
      document.querySelectorAll('input[name="role"]').forEach(inp => {
        inp.value = tab.dataset.role;
      });
    });
  });

  /* ---- Переключение форм Вход/Регистрация ---- */
  const showRegister = document.getElementById('showRegister');
  const showLogin = document.getElementById('showLogin');
  const loginForm = document.getElementById('loginForm');
  const registerForm = document.getElementById('registerForm');
  if (showRegister) showRegister.addEventListener('click', (e) => {
    e.preventDefault();
    loginForm.style.display = 'none';
    registerForm.style.display = 'block';
  });
  if (showLogin) showLogin.addEventListener('click', (e) => {
    e.preventDefault();
    registerForm.style.display = 'none';
    loginForm.style.display = 'block';
  });

  /* ---- Кнопка показать/скрыть форму добавления заявки (админка) ---- */
  const addBtn = document.getElementById('toggleAddForm');
  const addForm = document.getElementById('addRecordForm');
  if (addBtn && addForm) {
    addBtn.addEventListener('click', () => {
      addForm.style.display = addForm.style.display === 'none' ? 'block' : 'none';
    });
  }

  /* ---- Подтверждение удаления ---- */
  document.querySelectorAll('form[data-confirm]').forEach(form => {
    form.addEventListener('submit', (e) => {
      if (!confirm(form.dataset.confirm)) e.preventDefault();
    });
  });
});
