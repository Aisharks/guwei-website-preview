(function () {
  'use strict';
  document.documentElement.classList.add('js');
  var config = window.SITE_CONFIG || {};
  var toggle = document.querySelector('.menu_toggle');
  var nav = document.getElementById('navigation');
  function closeMenu() {
    nav.classList.remove('is_open');
    toggle.setAttribute('aria-expanded', 'false');
  }
  toggle.addEventListener('click', function () {
    var open = toggle.getAttribute('aria-expanded') !== 'true';
    toggle.setAttribute('aria-expanded', String(open));
    nav.classList.toggle('is_open', open);
  });
  document.addEventListener('keydown', function (event) {
    if (event.key === 'Escape' && toggle.getAttribute('aria-expanded') === 'true') {
      closeMenu();
      toggle.focus();
    }
  });
  nav.addEventListener('click', function (event) {
    if (event.target.closest('a')) closeMenu();
  });
  if (config.phone && /^[+0-9()\s-]{6,30}$/.test(config.phone)) {
    Array.prototype.forEach.call(document.querySelectorAll('[data-phone]'), function (element) {
      var anchor = document.createElement('a');
      anchor.href = 'tel:' + config.phone.replace(/[^+0-9]/g, '');
      anchor.textContent = config.phone;
      element.textContent = '';
      element.appendChild(anchor);
    });
  }
  Array.prototype.forEach.call(document.querySelectorAll('.lead_form'), function (form) {
    form.addEventListener('submit', function (event) { event.preventDefault(); });
  });
}());
