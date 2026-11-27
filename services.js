(()=>{
  if(!document.body.classList.contains('service-detail'))return;
  const header=document.querySelector('.site-header'),menu=document.querySelector('.menu-toggle');
  const en=document.documentElement.lang==='en';
  const close=()=>{header.classList.remove('menu-open');menu.setAttribute('aria-expanded','false');menu.querySelector('b').textContent=en?'Open menu':'展开菜单';};
  menu.addEventListener('click',()=>{const open=menu.getAttribute('aria-expanded')!=='true';header.classList.toggle('menu-open',open);menu.setAttribute('aria-expanded',String(open));menu.querySelector('b').textContent=open?(en?'Close menu':'收起菜单'):(en?'Open menu':'展开菜单');});
  document.addEventListener('keydown',e=>{if(e.key==='Escape')close();});
  document.querySelectorAll('#navigation a').forEach(a=>a.addEventListener('click',close));
})();

/* Homepage motion is progressive: content stays readable if JS is unavailable. */
(() => {
  const hero = document.querySelector('#home .hero-content');
  if (!hero || !Element.prototype.animate || !window.IntersectionObserver) return;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const small = matchMedia('(max-width: 760px)');
  if (reduced.matches) return;
  const active = new Map();
  let observer;
  let stopped = false;
  const easing = 'cubic-bezier(.22, 1, .36, 1)';
  function play(el, frames, options) {
    if (!el || stopped || reduced.matches || el.contains(document.activeElement)) return;
    const animation = el.animate(frames, options);
    active.set(animation, el);
    animation.finished.then(() => {
      active.delete(animation);
      animation.cancel(); // Release animation state; normal styles remain authoritative.
    }, () => active.delete(animation));
  }
  function reveal(el, delay = 0) {
    play(el, [
      { opacity: 0, transform: `translateY(${small.matches ? 8 : 14}px)` },
      { opacity: 1, transform: 'translateY(0)' }
    ], { duration: small.matches ? 420 : 620, delay, easing, fill: 'backwards' });
  }
  function stop() {
    stopped = true;
    observer?.disconnect();
    for (const animation of active.keys()) animation.cancel();
    active.clear();
  }
  // Respect preference changes immediately, including while animations are running.
  reduced.addEventListener('change', e => { if (e.matches) stop(); });
  document.addEventListener('focusin', event => {
    for (const [animation, el] of active) {
      if (el.contains(event.target)) animation.cancel();
    }
  });
  addEventListener('pagehide', stop);

  // Do not replay the opening sequence when arriving at a lower-page anchor.
  if ((!location.hash || location.hash === '#home') && scrollY < 120) {
    hero.querySelectorAll(':scope > .eyebrow, :scope > h1, :scope > .hero-description, :scope > .hero-actions')
      .forEach((el, i) => reveal(el, i * (small.matches ? 50 : 85)));
    const image = document.querySelector('#home .hero-image');
    const startImage = () => {
      if (stopped || document.querySelector('#home').getBoundingClientRect().bottom < 100) return;
      play(image, [ { transform: `scale(${small.matches ? 1.015 : 1.03})` }, { transform: 'scale(1)' } ],
        { duration: small.matches ? 4000 : 6000, easing: 'ease-out' });
    };
    if (image?.complete && image.naturalWidth) startImage();
    else image?.addEventListener('load', startImage, { once: true });
  }

  const targets = document.querySelectorAll('.service-nav-intro, .service-nav-card, .trial-cases-heading, .trial-case-card, #products .section-heading, #engineering .section-heading, #about .about-photo, #about .about-copy');
  observer = new IntersectionObserver(entries => {
    const visible = entries.filter(entry => entry.isIntersecting)
      .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top || a.boundingClientRect.left - b.boundingClientRect.left);
    let rowTop = -Infinity;
    let column = 0;
    visible.forEach(entry => {
      observer.unobserve(entry.target); // Each element enters only once per page load.
      if (Math.abs(entry.boundingClientRect.top - rowTop) > 30) {
        rowTop = entry.boundingClientRect.top;
        column = 0;
      }
      reveal(entry.target, small.matches ? 0 : Math.min(column++ * 80, 240));
    });
  }, { threshold: .08, rootMargin: '0px 0px -24px 0px' });
  targets.forEach(el => observer.observe(el));
})();
