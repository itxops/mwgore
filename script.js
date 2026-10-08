const btn = document.querySelector('.menu-btn');
const list = document.querySelector('.nav ul');
btn.addEventListener('click', () => list.classList.toggle('open'));
list.addEventListener('click', e => { if (e.target.tagName === 'A') list.classList.remove('open'); });
document.getElementById('year').textContent = new Date().getFullYear();
