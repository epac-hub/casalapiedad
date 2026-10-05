(() => {
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Hero film: play when it can, keep the still image as fallback.
  const video = document.getElementById('heroVideo');
  const motionToggle = document.getElementById('motionToggle');
  if (video && !reduceMotion) {
    const saveData = navigator.connection && navigator.connection.saveData;
    if (!saveData) {
      video.preload = 'auto';
      video.addEventListener('playing', () => {
        video.classList.add('is-playing');
        motionToggle.classList.add('is-ready');
      }, { once: true });
      video.play().catch(() => {});
    }
    motionToggle.addEventListener('click', () => {
      const paused = motionToggle.getAttribute('aria-pressed') === 'true';
      if (paused) { video.play().catch(() => {}); } else { video.pause(); }
      motionToggle.setAttribute('aria-pressed', String(!paused));
    });
  }

  // Top bar appears after the opening.
  const topbar = document.getElementById('topbar');
  const hero = document.querySelector('.hero');
  new IntersectionObserver(([entry]) => {
    topbar.classList.toggle('is-visible', !entry.isIntersecting);
  }, { threshold: 0.08 }).observe(hero);

  // Reveal on scroll.
  const revealer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-in');
        revealer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.18, rootMargin: '0px 0px -6% 0px' });
  document.querySelectorAll('.reveal').forEach((el) => revealer.observe(el));

  // Parallax and courtyard sequence share one scroll loop.
  const parallax = document.querySelector('.parallax');
  const immersive = document.querySelector('.immersive');
  const courtyard = document.querySelector('.courtyard');
  const courtImgs = [...document.querySelectorAll('.courtyard__img')];
  const courtSteps = [...document.querySelectorAll('.courtyard__steps li')];
  let current = 0;
  let ticking = false;

  const update = () => {
    ticking = false;
    const vh = window.innerHeight;

    if (parallax && !reduceMotion) {
      const r = immersive.getBoundingClientRect();
      if (r.bottom > 0 && r.top < vh) {
        const p = (vh - r.top) / (vh + r.height);
        parallax.style.transform = `translate3d(0, ${(-p * 18).toFixed(2)}%, 0)`;
      }
    }

    const c = courtyard.getBoundingClientRect();
    const span = c.height - vh;
    const progress = Math.min(Math.max(-c.top / span, 0), 0.999);
    const idx = Math.floor(progress * courtImgs.length);
    if (idx !== current) {
      courtImgs[current].classList.remove('is-active');
      courtSteps[current].classList.remove('is-active');
      courtImgs[idx].classList.add('is-active');
      courtSteps[idx].classList.add('is-active');
      current = idx;
    }
  };
  window.addEventListener('scroll', () => {
    if (!ticking) { ticking = true; requestAnimationFrame(update); }
  }, { passive: true });
  window.addEventListener('resize', update);
  update();

  // Lightbox.
  const lightbox = document.getElementById('lightbox');
  const lbImg = document.getElementById('lightboxImg');
  const lbCap = document.getElementById('lightboxCap');
  let lastFocus = null;
  const closeLightbox = () => {
    lightbox.classList.remove('is-open');
    setTimeout(() => { lightbox.hidden = true; }, 400);
    document.body.style.overflow = '';
    if (lastFocus) lastFocus.focus();
  };
  document.querySelectorAll('.tile').forEach((tile) => {
    tile.addEventListener('click', () => {
      lastFocus = tile;
      lbImg.src = tile.dataset.full;
      lbImg.alt = tile.querySelector('img').alt;
      lbCap.textContent = tile.dataset.caption;
      lightbox.hidden = false;
      requestAnimationFrame(() => lightbox.classList.add('is-open'));
      document.body.style.overflow = 'hidden';
      document.getElementById('lightboxClose').focus();
    });
  });
  document.getElementById('lightboxClose').addEventListener('click', closeLightbox);
  lightbox.addEventListener('click', (e) => { if (e.target === lightbox) closeLightbox(); });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && !lightbox.hidden) closeLightbox();
  });

  // English / Spanish.
  const es = {
    'nav.vision': 'Visión',
    'nav.architecture': 'Arquitectura',
    'nav.courtyard': 'Patio',
    'nav.gallery': 'Galería',
    'hero.cta': 'Explorar la visión',
    'hero.pause': 'Pausar película',
    'label': 'Visión conceptual · Casa La Piedad, Isla Verde',
    'intro.eyebrow': 'Isla Verde, Puerto Rico',
    'intro.title': 'Un hogar hecho de luz, jardín y mar.',
    'intro.p1': 'Casa La Piedad Residences se concibe como una comunidad serena para setenta y cinco residentes: un lugar donde se honra la independencia, cada día transcurre sin prisa y el sentido de pertenencia surge de forma natural.',
    'intro.p2': 'Volúmenes blancos y luminosos se reúnen alrededor de un patio vivo, abiertos a la sombra, la brisa y el ritmo sereno de la costa.',
    'arch.eyebrow': 'Arquitectura',
    'arch.title': 'Calma escultórica.',
    'form.eyebrow': 'Forma',
    'form.title': 'Geometría limpia, suavizada por la naturaleza.',
    'form.body': 'Formas blancas redondeadas, celosías de madera cálida y amplios ventanales crean un lenguaje tropical contemporáneo: elegante, acogedor y abierto al aire de la isla.',
    'arrival.eyebrow': 'Llegada',
    'arrival.title': 'Un umbral que se siente como bienvenida.',
    'arrival.body': 'Agua quieta, sombra moteada y una generosa puerta de madera marcan el momento de llegar a casa.',
    'court.eyebrow': 'El Patio',
    'court.s1': 'En el corazón, un jardín.',
    'court.s2': 'Luz que se mueve con el día.',
    'court.s3': 'Interior y exterior, en uno.',
    'quote': '“Dignidad, independencia y conexión, reunidas en un jardín junto al mar.”',
    'gallery.eyebrow': 'Galería conceptual',
    'gallery.title': 'Momentos de hogar.',
    'cap.rooftop': 'Terraza jardín al atardecer',
    'cap.detail': 'Luz, sombra y textura',
    'cap.suite': 'Una residencia privada',
    'cap.living': 'Espacios para reunirse',
    'cap.descent': 'Acercándose a la entrada',
    'cap.courtyard': 'El patio',
    'closing': 'Un lugar sereno y moderno al que llamar hogar.',
    'disclaimer': 'Todas las imágenes son conceptuales e ilustran una arquitectura propuesta. No representan un desarrollo existente, aprobado ni permisado. Inspiración arquitectónica: Casa La Piedad, de Cotaparedes Arquitectos.'
  };
  const en = {};
  document.querySelectorAll('[data-i18n]').forEach((el) => { en[el.dataset.i18n] = el.textContent; });
  document.querySelectorAll('[data-i18n-cap]').forEach((el) => { en[el.dataset.i18nCap] = el.dataset.caption; });
  document.querySelectorAll('[data-i18n-aria]').forEach((el) => { en[el.dataset.i18nAria] = el.getAttribute('aria-label'); });

  const langBtn = document.getElementById('lang');
  const apply = (lang) => {
    const dict = lang === 'es' ? es : en;
    document.documentElement.lang = lang;
    document.querySelectorAll('[data-i18n]').forEach((el) => { el.textContent = dict[el.dataset.i18n]; });
    document.querySelectorAll('[data-i18n-cap]').forEach((el) => { el.dataset.caption = dict[el.dataset.i18nCap]; });
    document.querySelectorAll('[data-i18n-aria]').forEach((el) => { el.setAttribute('aria-label', dict[el.dataset.i18nAria]); });
    langBtn.textContent = lang === 'es' ? 'EN' : 'ES';
    langBtn.setAttribute('aria-label', lang === 'es' ? 'Switch to English' : 'Cambiar a español');
    try { localStorage.setItem('clp-lang', lang); } catch (e) {}
  };
  let lang = 'en';
  try { lang = localStorage.getItem('clp-lang') || ((navigator.language || '').startsWith('es') ? 'es' : 'en'); } catch (e) {}
  if (lang === 'es') apply('es');
  langBtn.addEventListener('click', () => apply(document.documentElement.lang === 'es' ? 'en' : 'es'));
})();
