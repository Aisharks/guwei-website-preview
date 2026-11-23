const header=document.querySelector('.site-header');
const menu=document.querySelector('.menu-toggle');
function syncHeader(){header.classList.toggle('scrolled',window.scrollY>30)}
window.addEventListener('scroll',syncHeader,{passive:true});syncHeader();
function closeMenu(){header.classList.remove('menu-open');menu.setAttribute('aria-expanded','false');menu.querySelector('b').textContent='展开菜单'}
menu.addEventListener('click',()=>{const open=menu.getAttribute('aria-expanded')!=='true';menu.setAttribute('aria-expanded',String(open));header.classList.toggle('menu-open',open);menu.querySelector('b').textContent=open?'收起菜单':'展开菜单'});
document.querySelectorAll('#navigation a').forEach(link=>link.addEventListener('click',closeMenu));
document.addEventListener('keydown',e=>{if(e.key==='Escape')closeMenu()});
const navigation=[...document.querySelectorAll('#navigation a')];
const observed=navigation.map(a=>document.querySelector(a.getAttribute('href'))).filter(Boolean);
if('IntersectionObserver' in window){const observer=new IntersectionObserver(entries=>{for(const entry of entries){if(entry.isIntersecting){navigation.forEach(a=>{const active=a.hash==='#'+entry.target.id;a.classList.toggle('active',active);if(active)a.setAttribute('aria-current','location');else a.removeAttribute('aria-current')})}}},{rootMargin:'-15% 0px -60% 0px',threshold:0});observed.forEach(el=>observer.observe(el))}
const mobile=window.matchMedia('(max-width:760px)');
mobile.addEventListener('change',()=>{if(!mobile.matches)closeMenu()});
const track=document.querySelector('.project-track');
document.querySelectorAll('[data-slide]').forEach(b=>b.addEventListener('click',()=>{const atEnd=track.scrollLeft+track.clientWidth>=track.scrollWidth-8;const atStart=track.scrollLeft<8;const next=Number(b.dataset.slide)>0;if(next&&atEnd)track.scrollTo({left:0,behavior:'smooth'});else if(!next&&atStart)track.scrollTo({left:track.scrollWidth,behavior:'smooth'});else track.scrollBy({left:(next?1:-1)*(track.querySelector('article').clientWidth+24),behavior:'smooth'})}));
const lightbox=document.querySelector('.lightbox');let returnFocus;
document.querySelectorAll('[data-lightbox]').forEach(b=>b.addEventListener('click',()=>{returnFocus=b;lightbox.querySelector('img').src=b.dataset.lightbox;lightbox.querySelector('img').alt=b.dataset.caption;lightbox.querySelector('p').textContent=b.dataset.caption;lightbox.showModal()}));
lightbox.querySelector('button').addEventListener('click',()=>lightbox.close());
lightbox.addEventListener('click',e=>{if(e.target===lightbox){const r=lightbox.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)lightbox.close()}});
lightbox.addEventListener('close',()=>returnFocus?.focus());
