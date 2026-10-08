document.querySelectorAll('details.menu').forEach((menu) => {
  menu.addEventListener('click', (e) => {
    if (e.target.closest('a')) menu.removeAttribute('open');
  });
  document.addEventListener('click', (e) => {
    if (!menu.contains(e.target)) menu.removeAttribute('open');
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') menu.removeAttribute('open');
  });
});

// scroll-reveal: fades sections in as they enter the view
if ('IntersectionObserver' in window && !matchMedia('(prefers-reduced-motion: reduce)').matches) {
  const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
  document.querySelectorAll('.head, .devices li, .rep-card, .hiw-step, .reason, .acc li, .faq details, .location-map, .location-card, .close .wrap, .brand-marquee').forEach((el) => {
    el.classList.add('rv');
    const sib = [...el.parentElement.children].indexOf(el);
    el.style.transitionDelay = Math.min(sib, 5) * 90 + 'ms';
    io.observe(el);
  });
}
