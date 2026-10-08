const $ = (s, c = document) => c.querySelector(s);
const $$ = (s, c = document) => [...c.querySelectorAll(s)];
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

// header, progress bar, back-to-top, active link
const header = $('#header'), progress = $('#progress'), toTop = $('#toTop');
const links = $$('#menu a');
const sections = links.map(a => $(a.getAttribute('href'))).filter(Boolean);
function onScroll() {
  const y = scrollY, max = document.documentElement.scrollHeight - innerHeight;
  header.classList.toggle('scrolled', y > 30);
  progress.style.width = (max > 0 ? (y / max) * 100 : 0) + '%';
  toTop.classList.toggle('show', y > 700);
  let cur = null;
  sections.forEach(s => { if (s.getBoundingClientRect().top < innerHeight * 0.4) cur = s.id; });
  links.forEach(a => a.classList.toggle('active', a.getAttribute('href') === '#' + cur));
}
addEventListener('scroll', onScroll, { passive: true });
onScroll();
toTop.addEventListener('click', () => scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' }));

// mobile menu
const burger = $('#burger'), nav = $('header nav');
function setMenu(open) {
  burger.classList.toggle('open', open);
  nav.classList.toggle('open', open);
  burger.setAttribute('aria-expanded', open);
}
burger.addEventListener('click', () => setMenu(!nav.classList.contains('open')));
nav.addEventListener('click', e => { if (e.target.tagName === 'A') setMenu(false); });

// scroll reveal
const io = new IntersectionObserver((entries, o) => {
  entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); o.unobserve(e.target); } });
}, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
$$('.reveal').forEach(el => io.observe(el));

// count-up numbers
const co = new IntersectionObserver((entries, o) => {
  entries.forEach(e => {
    if (!e.isIntersecting) return;
    const el = e.target, end = +el.dataset.count, t0 = performance.now();
    const tick = t => {
      const p = Math.min((t - t0) / 1400, 1);
      el.textContent = Math.round(end * (1 - Math.pow(1 - p, 3)));
      if (p < 1) requestAnimationFrame(tick);
    };
    reduce ? (el.textContent = end) : requestAnimationFrame(tick);
    o.unobserve(el);
  });
}, { threshold: 0.6 });
$$('[data-count]').forEach(el => co.observe(el));

// 3D tilt + light follow on hero image
if (!reduce && matchMedia('(hover: hover)').matches) {
  $$('[data-tilt]').forEach(el => {
    el.addEventListener('mousemove', e => {
      const r = el.getBoundingClientRect(), x = (e.clientX - r.left) / r.width, y = (e.clientY - r.top) / r.height;
      el.style.transform = `rotateY(${(x - 0.5) * 12}deg) rotateX(${(0.5 - y) * 12}deg)`;
      el.style.setProperty('--mx', x * 100 + '%');
      el.style.setProperty('--my', y * 100 + '%');
    });
    el.addEventListener('mouseleave', () => { el.style.transform = ''; });
  });

  // parallax blobs
  const blobs = $$('.blob');
  addEventListener('scroll', () => {
    const y = scrollY * 0.15;
    blobs.forEach((b, i) => { b.style.translate = `0 ${i ? -y : y}px`; });
  }, { passive: true });
}

// one FAQ open at a time
$$('.faq details').forEach(d => d.addEventListener('toggle', () => {
  if (d.open) $$('.faq details').forEach(o => { if (o !== d) o.open = false; });
}));

$('#year').textContent = new Date().getFullYear();
