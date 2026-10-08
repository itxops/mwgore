window.__mw = true; // tells the page script loaded (see the fallback in <head>)

const $ = (s, c = document) => c.querySelector(s);
const $$ = (s, c = document) => [...c.querySelectorAll(s)];
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
const hasIO = 'IntersectionObserver' in window;

// header, progress bar, back-to-top, active link, step line
const header = $('#header'), progress = $('#progress'), toTop = $('#toTop'), steps = $('#steps');
const links = $$('#nav a[href^="#"]:not(.nav-visit)');
const targets = links.map(a => $(a.getAttribute('href')));
let ticking = false;
function update() {
  ticking = false;
  const y = scrollY, max = document.documentElement.scrollHeight - innerHeight;
  header.classList.toggle('shrink', y > 40);
  progress.style.width = (max > 0 ? y / max * 100 : 0) + '%';
  toTop.classList.toggle('show', y > 800);
  let cur = '';
  targets.forEach(t => { if (t && t.getBoundingClientRect().top < innerHeight * 0.4) cur = t.id; });
  links.forEach(a => {
    const on = a.getAttribute('href') === '#' + cur;
    a.classList.toggle('on', on);
    on ? a.setAttribute('aria-current', 'location') : a.removeAttribute('aria-current');
  });
  if (steps) {
    const r = steps.getBoundingClientRect();
    const p = Math.min(1, Math.max(0, (innerHeight * 0.75 - r.top) / (r.height + 120)));
    steps.style.setProperty('--p', (p * 100).toFixed(1) + '%');
  }
}
addEventListener('scroll', () => { if (!ticking) { ticking = true; requestAnimationFrame(update); } }, { passive: true });
addEventListener('resize', update);
update();
toTop.addEventListener('click', () => scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' }));

// mobile menu: button, link click, Escape and outside click all close it
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
// leaving the mobile layout (rotate / resize) must not leave the menu stuck open
matchMedia('(min-width: 901px)').addEventListener('change', e => { if (e.matches) setMenu(false); });

// reveal on scroll
if (hasIO) {
  const io = new IntersectionObserver((es, o) => es.forEach(e => {
    if (e.isIntersecting) { e.target.classList.add('in'); o.unobserve(e.target); }
  }), { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
  $$('.reveal').forEach(el => io.observe(el));
} else {
  $$('.reveal').forEach(el => el.classList.add('in'));
}

// count-up. The real number is already in the HTML, so if anything fails the
// page still shows the correct value. We only start from 0 when we are about to animate.
const counters = $$('[data-count]');
if (hasIO && !reduce) {
  const co = new IntersectionObserver((es, o) => es.forEach(e => {
    if (!e.isIntersecting) return;
    const el = e.target, end = +el.dataset.count, suf = el.dataset.suffix || '', t0 = performance.now();
    o.unobserve(el);
    const tick = t => {
      const p = Math.min((t - t0) / 1200, 1);
      el.textContent = Math.round(end * (1 - Math.pow(1 - p, 3))) + suf;
      if (p < 1) requestAnimationFrame(tick);
    };
    el.textContent = '0' + suf;
    requestAnimationFrame(tick);
    setTimeout(() => { el.textContent = end + suf; }, 1600); // safety net
  }), { threshold: 0.3 });
  counters.forEach(el => co.observe(el));
}

// mouse parallax on the hero photos (desktop with a mouse only)
const collage = $('#collage');
if (collage && !reduce && matchMedia('(hover: hover) and (pointer: fine)').matches) {
  const layers = $$('[data-depth]', collage);
  collage.addEventListener('mousemove', e => {
    const r = collage.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width - 0.5, y = (e.clientY - r.top) / r.height - 0.5;
    layers.forEach(l => { const d = +l.dataset.depth; l.style.transform = `translate(${x * d}px, ${y * d}px)`; });
  });
  collage.addEventListener('mouseleave', () => layers.forEach(l => { l.style.transform = ''; }));
}

// one FAQ answer open at a time
$$('.faq details').forEach(d => d.addEventListener('toggle', () => {
  if (d.open) $$('.faq details').forEach(o => { if (o !== d) o.open = false; });
}));

const yr = $('#year');
if (yr) yr.textContent = new Date().getFullYear();
