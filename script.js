const $ = (s, c = document) => c.querySelector(s);
const $$ = (s, c = document) => [...c.querySelectorAll(s)];
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

// header, progress, back-to-top, active link, step line
const header = $('#header'), progress = $('#progress'), toTop = $('#toTop'), steps = $('#steps');
const links = $$('#nav a[href^="#"]:not(.nav-visit)');
const targets = links.map(a => $(a.getAttribute('href')));
function onScroll() {
  const y = scrollY, max = document.documentElement.scrollHeight - innerHeight;
  header.classList.toggle('shrink', y > 40);
  progress.style.width = (max > 0 ? y / max * 100 : 0) + '%';
  toTop.classList.toggle('show', y > 800);
  let cur = '';
  targets.forEach(t => { if (t && t.getBoundingClientRect().top < innerHeight * 0.4) cur = t.id; });
  links.forEach(a => a.classList.toggle('on', a.getAttribute('href') === '#' + cur));
  if (steps) {
    const r = steps.getBoundingClientRect();
    const p = Math.min(1, Math.max(0, (innerHeight * 0.75 - r.top) / (r.height + 120)));
    steps.style.setProperty('--p', (p * 100).toFixed(1) + '%');
  }
}
addEventListener('scroll', onScroll, { passive: true });
onScroll();
toTop.addEventListener('click', () => scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' }));

// mobile menu
const burger = $('#burger'), nav = $('#nav');
const setMenu = o => { burger.classList.toggle('open', o); nav.classList.toggle('open', o); burger.setAttribute('aria-expanded', o); };
burger.addEventListener('click', () => setMenu(!nav.classList.contains('open')));
nav.addEventListener('click', e => { if (e.target.tagName === 'A') setMenu(false); });

// reveal on scroll
const io = new IntersectionObserver((es, o) => es.forEach(e => {
  if (e.isIntersecting) { e.target.classList.add('in'); o.unobserve(e.target); }
}), { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
$$('.reveal').forEach(el => io.observe(el));

// count-up
const co = new IntersectionObserver((es, o) => es.forEach(e => {
  if (!e.isIntersecting) return;
  const el = e.target, end = +el.dataset.count, suf = el.dataset.suffix || '', t0 = performance.now();
  const tick = t => {
    const p = Math.min((t - t0) / 1500, 1);
    el.textContent = Math.round(end * (1 - Math.pow(1 - p, 3))) + suf;
    if (p < 1) requestAnimationFrame(tick);
  };
  reduce ? (el.textContent = end + suf) : requestAnimationFrame(tick);
  o.unobserve(el);
}), { threshold: 0.6 });
$$('[data-count]').forEach(el => co.observe(el));

// mouse parallax on hero collage
const collage = $('#collage');
if (collage && !reduce && matchMedia('(hover: hover)').matches) {
  const layers = $$('[data-depth]', collage);
  collage.addEventListener('mousemove', e => {
    const r = collage.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width - 0.5, y = (e.clientY - r.top) / r.height - 0.5;
    layers.forEach(l => { const d = +l.dataset.depth; l.style.transform = `translate(${x * d}px, ${y * d}px)`; });
  });
  collage.addEventListener('mouseleave', () => layers.forEach(l => { l.style.transform = ''; }));
}

// one FAQ open at a time
$$('.faq details').forEach(d => d.addEventListener('toggle', () => {
  if (d.open) $$('.faq details').forEach(o => { if (o !== d) o.open = false; });
}));

$('#year').textContent = new Date().getFullYear();
