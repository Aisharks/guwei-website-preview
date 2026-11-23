const header=document.querySelector('.site-header'),menu=document.querySelector('.menu-toggle');
function closeMenu(){header.classList.remove('menu-open');menu.setAttribute('aria-expanded','false');menu.querySelector('b').textContent='展开菜单'}
menu.addEventListener('click',()=>{const open=menu.getAttribute('aria-expanded')!=='true';menu.setAttribute('aria-expanded',String(open));header.classList.toggle('menu-open',open);menu.querySelector('b').textContent=open?'收起菜单':'展开菜单'});
document.querySelectorAll('#navigation a').forEach(a=>a.addEventListener('click',closeMenu));
document.addEventListener('keydown',e=>{if(e.key==='Escape')closeMenu()});
window.matchMedia('(max-width:760px)').addEventListener('change',e=>{if(!e.matches)closeMenu()});
const dialog=document.querySelector('.lightbox');let previous;
document.querySelectorAll('[data-lightbox]').forEach(b=>b.addEventListener('click',()=>{previous=b;dialog.querySelector('img').src=b.dataset.lightbox;dialog.querySelector('img').alt=b.dataset.caption;dialog.querySelector('p').textContent=b.dataset.caption;dialog.showModal()}));
dialog.querySelector('button').addEventListener('click',()=>dialog.close());dialog.addEventListener('close',()=>previous?.focus());
