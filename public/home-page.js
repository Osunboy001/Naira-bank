
  // ── Hamburger menu ──
  const hamburger = document.getElementById('hamburger');
  const navLinks  = document.getElementById('navLinks');

  hamburger.addEventListener('click', () => {
    navLinks.classList.toggle('open');
  });

  // Close nav when a link is clicked on mobile
  navLinks.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => navLinks.classList.remove('open'));
  });

  // ── Scroll animations ──
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry, i) => {
      if (entry.isIntersecting) {
        setTimeout(() => entry.target.classList.add('visible'), i * 80);
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });

  document.querySelectorAll('.fade-up').forEach(el => observer.observe(el));

  // ── FAQ accordion ──
  document.querySelectorAll('.faq-question').forEach(q => {
    q.addEventListener('click', () => {
      const item = q.parentElement;
      const isOpen = item.classList.contains('active');
      document.querySelectorAll('.faq-item-dark').forEach(i => i.classList.remove('active'));
      if (!isOpen) item.classList.add('active');
    });
  });

  // ── Contact form ──
  document.getElementById('contactForm').addEventListener('submit', e => {
    e.preventDefault();
    alert('Message sent! We\'ll get back to you shortly.');
    e.target.reset();
  });
