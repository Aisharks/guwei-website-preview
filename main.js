(function () {
  'use strict';
  document.documentElement.classList.add('js');
  var config = window.SITE_CONFIG || {};
  var toggle = document.querySelector('.menu_toggle');
  var nav = document.getElementById('navigation');
  var header = document.querySelector('header');
  function syncAnchorOffset() {
    document.documentElement.style.setProperty('--anchor-offset', (header.offsetHeight + 18) + 'px');
  }
  function closeMenu() {
    nav.classList.remove('is_open');
    toggle.setAttribute('aria-expanded', 'false');
    syncAnchorOffset();
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
  syncAnchorOffset();
  window.addEventListener('resize', syncAnchorOffset);
  if (document.querySelector('[data-home-sections]')) {
    var homeLinks = Array.prototype.slice.call(nav.querySelectorAll('[data-home-section]'));
    var scrollUpdatePending = false;
    function updateHomeNavigation() {
      scrollUpdatePending = false;
      if (document.body.style.position === 'fixed') return;
      var current = 'home';
      var boundary = header.offsetHeight + 30;
      homeLinks.forEach(function (link) {
        var section = document.getElementById(link.getAttribute('data-home-section'));
        if (section && section.getBoundingClientRect().top <= boundary) current = section.id;
      });
      homeLinks.forEach(function (link) {
        if (link.getAttribute('data-home-section') === current) link.setAttribute('aria-current', 'location');
        else link.removeAttribute('aria-current');
      });
    }
    function scheduleHomeNavigation() {
      if (!scrollUpdatePending) {
        scrollUpdatePending = true;
        window.requestAnimationFrame(updateHomeNavigation);
      }
    }
    window.addEventListener('scroll', scheduleHomeNavigation, { passive: true });
    window.addEventListener('resize', scheduleHomeNavigation);
    window.addEventListener('hashchange', scheduleHomeNavigation);
    window.addEventListener('load', scheduleHomeNavigation);
    updateHomeNavigation();
  }
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
  var previewImage, previewCaption, previewStatus, previewClose, previewPrevious, previewNext, previewCounter;
  var previewItems = [];
  var previewIndex = 0;
  var previewLoadVersion = 0;
  var previewTouch = null;
  var suppressPreviewClickUntil = 0;
  var previewOrigin = null;
  var previewScroll = 0;
  var previousBodyStyle = '';
  var backgroundState = [];
  function isPreviewLink(anchor) {
    return !!anchor.querySelector('img') && (anchor.hasAttribute('data-image-link') || /\.(?:png|jpe?g|webp|gif|avif|svg)(?:[?#]|$)/i.test(anchor.href));
  }
  function showPreviewImage(index) {
    previewIndex = (index + previewItems.length) % previewItems.length;
    var anchor = previewItems[previewIndex];
    var thumbnail = anchor.querySelector('img');
    var figure = anchor.closest('figure');
    var caption = figure && figure.querySelector('figcaption');
    previewCaption.textContent = caption ? caption.textContent : thumbnail.alt;
    previewImage.alt = thumbnail.alt || '放大图片';
    previewCounter.textContent = (previewIndex + 1) + ' / ' + previewItems.length;
    previewPrevious.hidden = previewNext.hidden = previewItems.length < 2;
    previewStatus.textContent = '正在加载图片…';
    var version = ++previewLoadVersion;
    previewImage.onload = function () {
      if (version === previewLoadVersion) previewStatus.textContent = '';
    };
    previewImage.onerror = function () {
      if (!preview.hidden && version === previewLoadVersion) previewStatus.textContent = '图片暂时无法加载，可以切换其他图片或关闭后重试。';
    };
    previewImage.src = anchor.href;
  }
  function stepPreview(direction) {
    if (preview && !preview.hidden && previewItems.length > 1) showPreviewImage(previewIndex + direction);
  }
  function closePreview() {
    if (!preview || preview.hidden) return;
    preview.hidden = true;
    previewLoadVersion++;
    previewTouch = null;
    previewImage.removeAttribute('src');
    document.body.style.cssText = previousBodyStyle;
    backgroundState.forEach(function (entry) {
      if (entry.hidden === null) entry.node.removeAttribute('aria-hidden');
      else entry.node.setAttribute('aria-hidden', entry.hidden);
      entry.node.inert = entry.inert;
    });
    backgroundState = [];
    if (previewOrigin && document.documentElement.contains(previewOrigin)) previewOrigin.focus();
    // Restore immediately even when page anchor navigation uses smooth scrolling.
    var scrollBehavior = document.documentElement.style.scrollBehavior;
    document.documentElement.style.scrollBehavior = 'auto';
    window.scrollTo(0, previewScroll);
    document.documentElement.style.scrollBehavior = scrollBehavior;
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
    previewCounter = document.createElement('span');
    previewCounter.className = 'image_lightbox_counter';
    previewCounter.setAttribute('aria-live', 'polite');
    previewCounter.setAttribute('aria-atomic', 'true');
    previewClose = document.createElement('button');
    previewClose.type = 'button';
    previewClose.className = 'image_lightbox_close';
    previewClose.setAttribute('aria-label', '关闭图片预览');
    previewClose.textContent = '×';
    toolbar.appendChild(title);
    toolbar.appendChild(previewCounter);
    toolbar.appendChild(previewClose);
    var stage = document.createElement('div');
    stage.className = 'image_lightbox_stage';
    previewPrevious = document.createElement('button');
    previewPrevious.type = 'button';
    previewPrevious.className = 'image_lightbox_arrow image_lightbox_previous';
    previewPrevious.setAttribute('aria-label', '上一张图片');
    previewPrevious.textContent = '‹';
    previewNext = document.createElement('button');
    previewNext.type = 'button';
    previewNext.className = 'image_lightbox_arrow image_lightbox_next';
    previewNext.setAttribute('aria-label', '下一张图片');
    previewNext.textContent = '›';
    previewImage = document.createElement('img');
    previewImage.className = 'image_lightbox_image';
    previewImage.draggable = false;
    previewCaption = document.createElement('p');
    previewCaption.className = 'image_lightbox_caption';
    previewStatus = document.createElement('p');
    previewStatus.className = 'image_lightbox_status';
    previewStatus.setAttribute('role', 'status');
    previewStatus.setAttribute('aria-live', 'polite');
    panel.appendChild(toolbar);
    stage.appendChild(previewPrevious);
    stage.appendChild(previewImage);
    stage.appendChild(previewNext);
    panel.appendChild(stage);
    panel.appendChild(previewCaption);
    panel.appendChild(previewStatus);
    preview.appendChild(panel);
    document.body.appendChild(preview);
    previewClose.addEventListener('click', closePreview);
    previewPrevious.addEventListener('click', function () { stepPreview(-1); });
    previewNext.addEventListener('click', function () { stepPreview(1); });
    preview.addEventListener('click', function (event) {
      if (Date.now() < suppressPreviewClickUntil) return;
      if (event.target === preview || event.target === panel || event.target === stage) closePreview();
    });
    stage.addEventListener('touchstart', function (event) {
      if (event.touches.length !== 1 || event.target.closest('button') || (window.visualViewport && window.visualViewport.scale > 1.05)) {
        previewTouch = null; return;
      }
      var point = event.touches[0];
      previewTouch = { id: point.identifier, x: point.clientX, y: point.clientY };
    }, { passive: true });
    stage.addEventListener('touchmove', function (event) {
      if (event.touches.length !== 1 || (window.visualViewport && window.visualViewport.scale > 1.05)) { previewTouch = null; return; }
      if (!previewTouch) return;
      var point = event.touches[0];
      var dx = point.clientX - previewTouch.x;
      var dy = point.clientY - previewTouch.y;
      if (point.identifier === previewTouch.id && Math.abs(dx) > 10 && Math.abs(dx) > Math.abs(dy) * 1.3 && event.cancelable) event.preventDefault();
    }, { passive: false });
    stage.addEventListener('touchend', function (event) {
      if (!previewTouch || event.touches.length) { previewTouch = null; return; }
      var point = event.changedTouches[0];
      var start = previewTouch;
      previewTouch = null;
      if (!point || point.identifier !== start.id) return;
      var dx = point.clientX - start.x;
      var dy = point.clientY - start.y;
      if (Math.abs(dx) >= 45 && Math.abs(dx) > Math.abs(dy) * 1.3) {
        suppressPreviewClickUntil = Date.now() + 500;
        stepPreview(dx < 0 ? 1 : -1);
      }
    }, { passive: true });
    stage.addEventListener('touchcancel', function () { previewTouch = null; }, { passive: true });
  }
  document.addEventListener('click', function (event) {
    if (event.button || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
    var anchor = event.target.closest('a[href]');
    if (!anchor) return;
    if (!isPreviewLink(anchor)) return;
    event.preventDefault();
    if (!preview) buildPreview();
    previewOrigin = anchor;
    // A section can contain a main gallery and its collapsed continuation.
    var group = anchor.closest('section') || anchor.closest('.official_gallery') || anchor.parentElement;
    previewItems = Array.prototype.filter.call(group.querySelectorAll('a[href]'), isPreviewLink);
    previewIndex = previewItems.indexOf(anchor);
    suppressPreviewClickUntil = 0;
    previewScroll = window.pageYOffset;
    previousBodyStyle = document.body.style.cssText;
    document.body.style.position = 'fixed';
    document.body.style.top = '-' + previewScroll + 'px';
    document.body.style.left = '0';
    document.body.style.right = '0';
    document.body.style.width = '100%';
    document.body.style.overflow = 'hidden';
    preview.hidden = false;
    showPreviewImage(previewIndex);
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
    } else if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
      event.preventDefault();
      stepPreview(event.key === 'ArrowLeft' ? -1 : 1);
    } else if (event.key === 'Tab') {
      event.preventDefault();
      var buttons = Array.prototype.filter.call(preview.querySelectorAll('button'), function (button) { return !button.hidden && !button.disabled; });
      var current = buttons.indexOf(document.activeElement);
      var next = (current + (event.shiftKey ? -1 : 1) + buttons.length) % buttons.length;
      buttons[next].focus();
    }
  });
  document.addEventListener('focusin', function (event) {
    if (preview && !preview.hidden && !preview.contains(event.target)) previewClose.focus();
  });
  Array.prototype.forEach.call(document.querySelectorAll('.lead_form'), function (form) {
    form.addEventListener('submit', function (event) { event.preventDefault(); });
  });
}());
