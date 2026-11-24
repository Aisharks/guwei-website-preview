(()=>{
  if(!document.body.classList.contains('service-detail'))return;
  const header=document.querySelector('.site-header'),menu=document.querySelector('.menu-toggle');
  const en=document.documentElement.lang==='en';
  const close=()=>{header.classList.remove('menu-open');menu.setAttribute('aria-expanded','false');menu.querySelector('b').textContent=en?'Open menu':'展开菜单';};
  menu.addEventListener('click',()=>{const open=menu.getAttribute('aria-expanded')!=='true';header.classList.toggle('menu-open',open);menu.setAttribute('aria-expanded',String(open));menu.querySelector('b').textContent=open?(en?'Close menu':'收起菜单'):(en?'Open menu':'展开菜单');});
  document.addEventListener('keydown',e=>{if(e.key==='Escape')close();});
  document.querySelectorAll('#navigation a').forEach(a=>a.addEventListener('click',close));
})();
