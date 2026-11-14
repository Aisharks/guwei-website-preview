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
  // Shared in-page image preview, also retained by the static exporter.
  var preview = null;
  var previewImage, previewCaption, previewStatus, previewClose;
  var previewOrigin = null;
  var previewScroll = 0;
  var previousBodyStyle = '';
  var backgroundState = [];
  function closePreview() {
    if (!preview || preview.hidden) return;
    preview.hidden = true;
    previewImage.removeAttribute('src');
    document.body.style.cssText = previousBodyStyle;
    backgroundState.forEach(function (entry) {
      if (entry.hidden === null) entry.node.removeAttribute('aria-hidden');
      else entry.node.setAttribute('aria-hidden', entry.hidden);
      entry.node.inert = entry.inert;
    });
    backgroundState = [];
    if (previewOrigin && document.documentElement.contains(previewOrigin)) previewOrigin.focus();
    window.scrollTo(0, previewScroll);
    previewOrigin = null;
  }
  function buildPreview() {
    preview = document.createElement('div');
    preview.className = 'image_lightbox';
    preview.hidden = true;
    preview.setAttribute('role', 'dialog');
    preview.setAttribute('aria-modal', 'true');
    preview.setAttribute('aria-labelledby', 'image_preview_title');
    var panel = document.createElement('div');
    panel.className = 'image_lightbox_panel';
    var toolbar = document.createElement('div');
    toolbar.className = 'image_lightbox_toolbar';
    var title = document.createElement('span');
    title.id = 'image_preview_title';
    title.textContent = '图片预览';
    previewClose = document.createElement('button');
    previewClose.type = 'button';
    previewClose.className = 'image_lightbox_close';
    previewClose.setAttribute('aria-label', '关闭图片预览');
    previewClose.textContent = '×';
    toolbar.appendChild(title);
    toolbar.appendChild(previewClose);
    previewImage = document.createElement('img');
    previewImage.className = 'image_lightbox_image';
    previewCaption = document.createElement('p');
    previewCaption.className = 'image_lightbox_caption';
    previewStatus = document.createElement('p');
    previewStatus.className = 'image_lightbox_status';
    previewStatus.setAttribute('role', 'status');
    previewStatus.setAttribute('aria-live', 'polite');
    panel.appendChild(toolbar);
    panel.appendChild(previewImage);
    panel.appendChild(previewCaption);
    panel.appendChild(previewStatus);
    preview.appendChild(panel);
    document.body.appendChild(preview);
    previewClose.addEventListener('click', closePreview);
    preview.addEventListener('click', function (event) {
      if (event.target === preview || event.target === panel) closePreview();
    });
    previewImage.onload = function () { previewStatus.textContent = ''; };
    previewImage.onerror = function () {
      if (!preview.hidden) previewStatus.textContent = '图片暂时无法加载，请关闭后重试。';
    };
  }
  document.addEventListener('click', function (event) {
    if (event.button || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
    var anchor = event.target.closest('a[href]');
    if (!anchor) return;
    var thumbnail = anchor.querySelector('img');
    if (!thumbnail || !(anchor.hasAttribute('data-image-link') || /\.(?:png|jpe?g|webp|gif|avif|svg)(?:[?#]|$)/i.test(anchor.href))) return;
    event.preventDefault();
    if (!preview) buildPreview();
    previewOrigin = anchor;
    previewScroll = window.pageYOffset;
    previousBodyStyle = document.body.style.cssText;
    document.body.style.position = 'fixed';
    document.body.style.top = '-' + previewScroll + 'px';
    document.body.style.left = '0';
    document.body.style.right = '0';
    document.body.style.width = '100%';
    document.body.style.overflow = 'hidden';
    var figure = anchor.closest('figure');
    var caption = figure && figure.querySelector('figcaption');
    previewCaption.textContent = caption ? caption.textContent : thumbnail.alt;
    previewImage.alt = thumbnail.alt || '放大图片';
    previewStatus.textContent = '正在加载图片…';
    preview.hidden = false;
    previewImage.src = anchor.href;
    previewClose.focus();
    backgroundState = Array.prototype.map.call(document.querySelectorAll('body > header, body > main, body > footer, body > .skip'), function (node) {
      var entry = { node: node, hidden: node.getAttribute('aria-hidden'), inert: !!node.inert };
      node.setAttribute('aria-hidden', 'true');
      node.inert = true;
      return entry;
    });
  });
  document.addEventListener('keydown', function (event) {
    if (!preview || preview.hidden) return;
    if (event.key === 'Escape' || event.key === 'Esc') {
      event.preventDefault();
      closePreview();
    } else if (event.key === 'Tab') {
      event.preventDefault();
      previewClose.focus();
    }
  });
  document.addEventListener('focusin', function (event) {
    if (preview && !preview.hidden && !preview.contains(event.target)) previewClose.focus();
  });
  Array.prototype.forEach.call(document.querySelectorAll('.lead_form'), function (form) {
    form.addEventListener('submit', function (event) { event.preventDefault(); });
  });
}());
