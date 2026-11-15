// Dynamic typing effect
const roles = [
  'Full Stack Developer',
  'Next.js & NestJS Engineer',
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
// Handle initial URL hash, redirect #cv to #resume, and clean address bar
if (window.location.hash) {
  const hash = window.location.hash;
  const targetId = hash === '#cv' ? '#resume' : hash;
  const targetEl = document.querySelector(targetId);
  if (targetEl && targetId !== '#home') {
    setTimeout(() => {
      targetEl.scrollIntoView({ behavior: 'smooth' });
    }, 150);
  }
  setTimeout(() => {
    document.querySelectorAll('.reveal').forEach(el => el.classList.add('in'));
    // Strip '#' from address bar so URL remains clean
    if (window.history && window.history.replaceState) {
      window.history.replaceState(null, '', window.location.pathname + window.location.search);
    }
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
}

// Smooth scrolling and clean URL without '#' hash
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', (e) => {
    const href = anchor.getAttribute('href');
    if (!href || href === '#') return;
    const targetId = href === '#cv' ? '#resume' : href;
    const targetEl = document.querySelector(targetId);
    
    // Close mobile menu if open
    if (menu) menu.classList.remove('open');
    
    if (targetEl) {
      e.preventDefault();
      targetEl.scrollIntoView({ behavior: 'smooth' });
      // Remove '#' from browser address bar
      if (window.history && window.history.replaceState) {
        window.history.replaceState(null, '', window.location.pathname + window.location.search);
      }
    }
  });
});

// Project read more / show less highlights toggle
document.querySelectorAll('.btn-more-points').forEach(btn => {
  btn.addEventListener('click', () => {
    const card = btn.closest('.project');
    if (!card) return;
    const isExpanded = card.classList.toggle('expanded');
    btn.setAttribute('aria-expanded', isExpanded);
    const textSpan = btn.querySelector('.btn-more-text');
    if (textSpan) {
      textSpan.textContent = isExpanded ? 'Show less' : 'Show more';
    }
  });
});

// Toast notification utility
const toastEl = document.getElementById('toast');
const toastTitle = document.getElementById('toast-title');
const toastMsg = document.getElementById('toast-msg');
const toastIcon = document.getElementById('toast-icon');
let toastTimer = null;

function showToast(title, message, isSuccess = true) {
  if (!toastEl) return;
  if (toastTimer) clearTimeout(toastTimer);

  toastEl.className = 'toast show ' + (isSuccess ? 'success' : 'error');
  if (toastTitle) toastTitle.textContent = title;
  if (toastMsg) toastMsg.textContent = message;
  if (toastIcon) {
    toastIcon.innerHTML = isSuccess
      ? `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#16a34a" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>`
      : `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#ef4444" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>`;
  }

  toastTimer = setTimeout(() => {
    toastEl.classList.remove('show');
  }, 4500);
}

// Contact form: submits to Brevo backend API with Toast feedback & auto-reply
const contactForm = document.getElementById('form');
if (contactForm) {
  contactForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const fname = document.getElementById('fname');
    const femail = document.getElementById('femail');
    const fmsg = document.getElementById('fmsg');
    const submitBtn = contactForm.querySelector('button[type="submit"]');

    const name = fname ? fname.value.trim() : '';
    const email = femail ? femail.value.trim() : '';
    const message = fmsg ? fmsg.value.trim() : '';

    if (!name || !email || !message) {
      showToast('Missing details', 'Please enter your name, email, and message.', false);
      return;
    }

    const originalBtnContent = submitBtn ? submitBtn.innerHTML : '';
    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.style.opacity = '0.75';
      submitBtn.innerHTML = `<span>Sending...</span>`;
    }

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ name, email, message })
      });

      const result = await response.json().catch(() => ({}));

      if (response.ok && result.success) {
        showToast('Message sent!', 'Thanks for reaching out! I will reply shortly.', true);
        contactForm.reset();
      } else {
        throw new Error(result.error || 'Server returned an error');
      }
    } catch (err) {
      console.error('Contact form submission error:', err);
      // Fallback: inform user and allow direct mailto if API key is not yet configured
      showToast(
        'Email service connecting',
        'Could not send via server. Please email directly to ragulramesh1900@gmail.com',
        false
      );
    } finally {
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.style.opacity = '';
        submitBtn.innerHTML = originalBtnContent;
      }
    }
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

// CV Expand / Collapse toggle
const cvToggleBtn = document.getElementById('cv-toggle-btn');
const cvContainer = document.getElementById('cv-container');
const cvToggleText = document.getElementById('cv-toggle-text');

if (cvToggleBtn && cvContainer) {
  cvToggleBtn.addEventListener('click', () => {
    const isExpanded = cvContainer.classList.toggle('expanded');
    cvToggleBtn.setAttribute('aria-expanded', isExpanded ? 'true' : 'false');
    if (cvToggleText) {
      cvToggleText.textContent = isExpanded ? 'Collapse resume' : 'View full resume';
    }
  });
}
