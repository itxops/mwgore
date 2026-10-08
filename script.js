window.__mw = true; // tells the page the script loaded (see the fallback in <head>)

const $ = (s, c = document) => c.querySelector(s);
const $$ = (s, c = document) => [...c.querySelectorAll(s)];
const hasIO = 'IntersectionObserver' in window;

// nav bar: hairline once scrolled, current section highlighted
const bar = $('#bar');
const links = $$('#nav a[href^="#"]');
const targets = links.map(a => $(a.getAttribute('href')));
let ticking = false;
function update() {
  ticking = false;
  bar.classList.toggle('line', scrollY > 8);
  let cur = '';
  targets.forEach(t => { if (t && t.getBoundingClientRect().top < innerHeight * 0.35) cur = t.id; });
  links.forEach(a => {
    if (a.getAttribute('href') === '#' + cur) a.setAttribute('aria-current', 'location');
    else a.removeAttribute('aria-current');
  });
}
addEventListener('scroll', () => { if (!ticking) { ticking = true; requestAnimationFrame(update); } }, { passive: true });
update();

// mobile menu: button, link tap, Escape and outside tap all close it
const burger = $('#burger'), nav = $('#nav');
function setMenu(open, returnFocus) {
  burger.classList.toggle('open', open);
  nav.classList.toggle('open', open);
  burger.setAttribute('aria-expanded', String(open));
  burger.setAttribute('aria-label', open ? 'Close menu' : 'Menu');
  if (!open && returnFocus) burger.focus();
}
burger.addEventListener('click', () => setMenu(!nav.classList.contains('open')));
nav.addEventListener('click', e => { if (e.target.closest('a')) setMenu(false); });
addEventListener('keydown', e => { if (e.key === 'Escape' && nav.classList.contains('open')) setMenu(false, true); });
document.addEventListener('click', e => {
  if (nav.classList.contains('open') && !e.target.closest('#nav, #burger')) setMenu(false);
});
matchMedia('(min-width: 901px)').addEventListener('change', e => { if (e.matches) setMenu(false); });

// gentle reveal on scroll
if (hasIO) {
  const io = new IntersectionObserver((es, o) => es.forEach(e => {
    if (e.isIntersecting) { e.target.classList.add('in'); o.unobserve(e.target); }
  }), { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
  $$('.rv').forEach(el => io.observe(el));
} else {
  $$('.rv').forEach(el => el.classList.add('in'));
}

// one FAQ answer open at a time
$$('.faq details').forEach(d => d.addEventListener('toggle', () => {
  if (d.open) $$('.faq details').forEach(o => { if (o !== d) o.open = false; });
}));

const yr = $('#year');
if (yr) yr.textContent = new Date().getFullYear();
