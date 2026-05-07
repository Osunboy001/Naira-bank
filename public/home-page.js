
    document.querySelectorAll('.faq-item-dark, .faq-item-light').forEach((item, index) => {
        const question = item.querySelector('.faq-question');
        question.addEventListener('click', () => {
            const isActive = item.classList.contains('active');
            document.querySelectorAll('.faq-item-dark, .faq-item-light').forEach(i => i.classList.remove('active'));
            if (!isActive) item.classList.add('active');
        });
    });

    // Open first FAQ by default
    const firstFaq = document.querySelector('.faq-item-dark, .faq-item-light');
    if (firstFaq) firstFaq.classList.add('active');

    // Intersection Observer for fade animations
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1, rootMargin: '0px 0px -30px 0px' });

    document.querySelectorAll('.fade-up').forEach(el => observer.observe(el));

    // Form submission
    document.getElementById('contactForm')?.addEventListener('submit', (e) => {
        e.preventDefault();
        alert('Thanks for reaching out! We\'ll get back to you within 24 hours.');
        e.target.reset();
    });

    // Smooth scroll for navigation
    document.querySelectorAll('.nav-links a, .btn-primary, .btn-outline-light, .btn-outline-dark, .nav-btn').forEach(link => {
        link.addEventListener('click', function(e) {
            const hash = this.getAttribute('href');
            if (hash && hash !== '#' && hash.startsWith('#')) {
                e.preventDefault();
                const target = document.querySelector(hash);
                if (target) {
                    const offset = 80;
                    const elementPosition = target.offsetTop - offset;
                    window.scrollTo({ top: elementPosition, behavior: 'smooth' });
                }
            }
        });
    });
