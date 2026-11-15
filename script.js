// Year in footer
document.getElementById('year').textContent = new Date().getFullYear();

// Dynamic typing effect
const roles = [
  'Full Stack Developer',
  'Next.js & NestJS Engineer',
  'SaaS Platform Architect',
  'TypeScript Specialist'
];
const typed = document.getElementById('typed');
let r = 0, c = 0, del = false;
(function type() {
  const word = roles[r];
  typed.textContent = word.slice(0, c);
  if (!del && c < word.length) { c++; setTimeout(type, 75); }
  else if (!del) { del = true; setTimeout(type, 1500); }
  else if (c > 0) { c--; setTimeout(type, 35); }
  else { del = false; r = (r + 1) % roles.length; setTimeout(type, 300); }
})();

// Scroll reveal animation
const io = new IntersectionObserver((entries) => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      e.target.classList.add('in');
      io.unobserve(e.target);
    }
  });
}, { threshold: 0.05, rootMargin: '80px' });

document.querySelectorAll('.reveal').forEach((el, i) => {
  el.style.transitionDelay = (i % 3) * 60 + 'ms';
  io.observe(el);
});

// Immediately reveal elements in initial viewport and on hash jump
const checkVisible = () => {
  document.querySelectorAll('.reveal').forEach(el => {
    const rect = el.getBoundingClientRect();
    if (rect.top < window.innerHeight + 200) {
      el.classList.add('in');
    }
  });
};
window.addEventListener('load', checkVisible);
window.addEventListener('scroll', checkVisible, { passive: true });
if (window.location.hash) {
  setTimeout(() => {
    document.querySelectorAll('.reveal').forEach(el => el.classList.add('in'));
  }, 100);
}
setTimeout(checkVisible, 300);

// Nav scroll state, scroll progress bar, and back-to-top button
const nav = document.getElementById('nav');
const bar = document.getElementById('progress');
const topBtn = document.getElementById('top');
addEventListener('scroll', () => {
  const y = scrollY, h = document.documentElement.scrollHeight - innerHeight;
  if (bar) bar.style.width = (y / (h || 1) * 100) + '%';
  if (nav) nav.classList.toggle('scrolled', y > 40);
  if (topBtn) topBtn.classList.toggle('show', y > 500);
}, { passive: true });

if (topBtn) {
  topBtn.onclick = () => scrollTo({ top: 0, behavior: 'smooth' });
}

// Mobile hamburger navigation
const menu = document.getElementById('menu');
const burger = document.getElementById('burger');
if (burger && menu) {
  burger.onclick = () => menu.classList.toggle('open');
  menu.querySelectorAll('a').forEach(a => a.onclick = () => menu.classList.remove('open'));
}

// Interactive project category filters
const filters = document.getElementById('filters');
if (filters) {
  filters.addEventListener('click', (e) => {
    const btn = e.target.closest('button');
    if (!btn) return;
    filters.querySelectorAll('button').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    const f = btn.dataset.f;
    document.querySelectorAll('.project').forEach(p => {
      p.classList.toggle('hide', f !== 'all' && p.dataset.cat !== f);
    });
  });
}

// Contact form: opens native mail client with prepopulated message
const contactForm = document.getElementById('form');
if (contactForm) {
  contactForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const fname = document.getElementById('fname');
    const femail = document.getElementById('femail');
    const fmsg = document.getElementById('fmsg');
    const n = fname ? fname.value.trim() : '';
    const m = femail ? femail.value.trim() : '';
    const msg = fmsg ? fmsg.value.trim() : '';
    const body = encodeURIComponent(`${msg}\n\nFrom: ${n} (${m})`);
    location.href = `mailto:ragulramesh1900@gmail.com?subject=${encodeURIComponent('Portfolio Inquiry from ' + n)}&body=${body}`;
  });
}

// Interactive 3D tilt effect on cards
document.querySelectorAll('.project, .skill-card').forEach(card => {
  card.addEventListener('mousemove', (e) => {
    const b = card.getBoundingClientRect();
    const x = (e.clientX - b.left) / b.width - .5;
    const y = (e.clientY - b.top) / b.height - .5;
    card.style.transform = `perspective(800px) rotateX(${-y * 3}deg) rotateY(${x * 3}deg) translateY(-4px)`;
  });
  card.addEventListener('mouseleave', () => {
    card.style.transform = '';
  });
});
