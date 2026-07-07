/* SPARKYS — scroll motion engine */
(() => {
  const nav = document.getElementById('nav');
  const navFoods = [...document.querySelectorAll('.nav-food')];
  const navItems = [...document.querySelectorAll('.nav-item')];
  const parallax = [...document.querySelectorAll('[data-speed]')];
  const spinners = [...document.querySelectorAll('.spin-on-scroll')];
  const drifters = [...document.querySelectorAll('[data-drift]')];

  let lastY = window.scrollY;
  let velocity = 0;          // smoothed scroll velocity
  let navTimer = null;
  let ticking = false;

  function onScroll() {
    if (!ticking) {
      requestAnimationFrame(update);
      ticking = true;
    }
  }

  function update() {
    const y = window.scrollY;
    const dy = y - lastY;
    lastY = y;
    velocity = velocity * 0.8 + dy * 0.2;

    // sticky nav style
    nav.classList.toggle('scrolled', y > 40);

    // === nav food motion: items bounce/spin with scroll velocity ===
    nav.classList.add('nav-moving');
    const v = Math.max(-30, Math.min(30, velocity));
    navFoods.forEach((el, i) => {
      const phase = i % 2 === 0 ? 1 : -1;
      el.style.transform =
        `translateY(${(-v * 0.35) * phase}px) rotate(${v * 4 * phase}deg)`;
    });
    clearTimeout(navTimer);
    navTimer = setTimeout(() => {
      nav.classList.remove('nav-moving');
      navFoods.forEach(el => (el.style.transform = ''));
      velocity = 0;
    }, 140);

    // === parallax floats (hero food, plate, bg word, sprinkles) ===
    parallax.forEach(el => {
      const speed = parseFloat(el.dataset.speed) || 0;
      const rot = parseFloat(el.dataset.rot) || 0;
      const base = el.classList.contains('plate') || el.classList.contains('about-ring')
        ? 'translate(-50%,-50%) ' : '';
      el.style.transform =
        `${base}translateY(${y * speed}px) rotate(${y * rot}deg)`;
    });

    // === menu card art spins gently as you scroll ===
    spinners.forEach((el, i) => {
      const r = el.getBoundingClientRect();
      const center = r.top + r.height / 2 - window.innerHeight / 2;
      el.style.transform = `rotate(${center * -0.06 * (i % 2 ? -1 : 1)}deg)`;
    });

    // === gallery rows drift horizontally with scroll ===
    drifters.forEach(el => {
      const d = parseFloat(el.dataset.drift) || 0;
      const r = el.getBoundingClientRect();
      const progress = (window.innerHeight - r.top) * d;
      el.style.transform = `translateX(${progress * 0.25}px)`;
    });

    // active nav link
    highlight(y);
    ticking = false;
  }

  // === scroll reveal ===
  const io = new IntersectionObserver(
    entries => entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('in');
        io.unobserve(e.target);
      }
    }),
    { threshold: 0.15 }
  );
  document.querySelectorAll('.reveal').forEach(el => io.observe(el));

  // === active section highlight ===
  const sections = ['top', 'menu', 'about', 'gallery', 'contact']
    .map(id => document.getElementById(id))
    .filter(Boolean);

  function highlight() {
    let current = sections[0];
    sections.forEach(s => {
      if (s.getBoundingClientRect().top < window.innerHeight * 0.4) current = s;
    });
    navItems.forEach(a =>
      a.classList.toggle('active', a.getAttribute('href') === '#' + current.id)
    );
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  update();
})();
