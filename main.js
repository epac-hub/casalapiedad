(() => {
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const root = document.documentElement;
  const body = document.body;

  // Smooth scrolling (falls back to native scrolling if the library is unavailable).
  let lenis = null;
  if (window.Lenis && !reduceMotion) {
    lenis = new window.Lenis({ lerp: 0.085, anchors: true });
    const raf = (t) => { lenis.raf(t); requestAnimationFrame(raf); };
    requestAnimationFrame(raf);
  }

  // Background music: starts with the page when the browser allows it, otherwise on the first interaction.
  const music = document.getElementById('music');
  const soundToggle = document.getElementById('soundToggle');
  const TARGET_VOLUME = 0.55;
  let fadeId = 0;
  const fadeTo = (to, ms, done) => {
    const id = ++fadeId;
    const from = music.volume;
    const start = performance.now();
    const step = (now) => {
      if (id !== fadeId) return;
      const k = Math.min((now - start) / ms, 1);
      music.volume = Math.min(Math.max(from + (to - from) * k, 0), 1);
      if (k < 1) requestAnimationFrame(step); else if (done) done();
    };
    requestAnimationFrame(step);
  };
  const playMusic = () => {
    music.volume = 0;
    const started = music.play();
    if (started) started.catch(() => setSound(false));
    fadeTo(TARGET_VOLUME, 3500);
    setSound(true);
  };
  const pauseMusic = () => {
    fadeTo(0, 900, () => music.pause());
    setSound(false);
  };
  const setSound = (on) => {
    soundToggle.setAttribute('aria-pressed', String(on));
    try { sessionStorage.setItem('clp-sound', on ? 'on' : 'off'); } catch (e) {}
  };
  soundToggle.addEventListener('click', () => {
    if (soundToggle.getAttribute('aria-pressed') === 'true') pauseMusic(); else playMusic();
  });
  document.addEventListener('visibilitychange', () => {
    if (soundToggle.getAttribute('aria-pressed') !== 'true') return;
    if (document.hidden) music.pause(); else music.play().catch(() => {});
  });

  // Opening: fade slowly from ivory straight into the film.
  const opening = document.getElementById('opening');
  let opened = false;
  const open = () => {
    if (opened) return;
    opened = true;
    body.classList.add('is-entered');
    opening.classList.add('is-done');
    setTimeout(() => opening.remove(), 3200);
  };

  // Sound from the start. Browsers block audible autoplay until the visitor
  // interacts with the page, so if the first attempt is refused the music
  // starts on the first click, tap or key press anywhere.
  let wantsSound = true;
  try { wantsSound = sessionStorage.getItem('clp-sound') !== 'off'; } catch (e) {}
  const interactions = ['pointerdown', 'keydown', 'touchend'];
  const onFirstInteraction = (e) => {
    if (soundToggle.contains(e.target)) return;
    interactions.forEach((t) => window.removeEventListener(t, onFirstInteraction, true));
    if (soundToggle.getAttribute('aria-pressed') !== 'true') playMusic();
  };
  if (wantsSound) {
    music.volume = 0;
    const attempt = music.play();
    if (attempt) {
      attempt.then(() => { fadeTo(TARGET_VOLUME, 3500); setSound(true); })
        .catch(() => {
          soundToggle.setAttribute('aria-pressed', 'false');
          interactions.forEach((t) => window.addEventListener(t, onFirstInteraction, true));
        });
    }
  }

  // Hero film: play when it can, keep the still image as fallback.
  const video = document.getElementById('heroVideo');
  const motionToggle = document.getElementById('motionToggle');
  if (video && !reduceMotion) {
    const saveData = navigator.connection && navigator.connection.saveData;
    if (!saveData) {
      const small = window.matchMedia('(max-width: 900px)').matches;
      video.src = small ? video.dataset.srcSmall : video.dataset.src;
      video.preload = 'auto';
      video.addEventListener('playing', () => {
        video.classList.add('is-playing');
        motionToggle.classList.add('is-ready');
        open();
      }, { once: true });
      video.play().catch(() => {});
    }
    motionToggle.addEventListener('click', () => {
      const paused = motionToggle.getAttribute('aria-pressed') === 'true';
      if (paused) { video.play().catch(() => {}); } else { video.pause(); }
      motionToggle.setAttribute('aria-pressed', String(!paused));
    });
  }

  // Never hold the opening longer than needed: fall back to the still image.
  setTimeout(open, reduceMotion ? 0 : 1600);

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
  const immersive = document.querySelector('.immersive');
  const frame = document.querySelector('.immersive__frame');
  const courtyard = document.querySelector('.courtyard');
  const courtImgs = [...document.querySelectorAll('.courtyard__img')];
  const courtSteps = [...document.querySelectorAll('.courtyard__steps li')];
  let current = 0;
  let ticking = false;

  const introBody = document.querySelector('.intro__body');
  const words = [];
  if (!reduceMotion) {
    introBody.classList.remove('reveal');
    introBody.querySelectorAll('p').forEach((p) => {
      const parts = p.textContent.split(/(\s+)/);
      p.textContent = '';
      parts.forEach((part) => {
        if (/^\s+$/.test(part) || !part) { p.append(part); return; }
        const span = document.createElement('span');
        span.className = 'lit-word';
        span.textContent = part;
        p.append(span);
        words.push(span);
      });
    });
  }

  const hWrap = document.querySelector('.hscroll');
  const hTrack = document.querySelector('.gallery__grid');
  const wide = window.matchMedia('(min-width: 901px)');
  let hActive = false;
  let hDistance = 0;
  const measureGallery = () => {
    hActive = wide.matches && !reduceMotion;
    body.classList.toggle('is-hscroll', hActive);
    if (!hActive) {
      hWrap.style.height = '';
      hTrack.style.transform = '';
      return;
    }
    hDistance = Math.max(hTrack.scrollWidth - window.innerWidth, 0);
    hWrap.style.height = `${hDistance + window.innerHeight}px`;
  };

  const update = () => {
    ticking = false;
    const vh = window.innerHeight;

    // Aerial view opens from a framed window to full bleed.
    if (!reduceMotion) {
      const r = immersive.getBoundingClientRect();
      if (r.bottom > 0 && r.top < vh) {
        const p = Math.min(Math.max(-r.top / (r.height - vh), 0), 1);
        const open = Math.min(p / 0.6, 1);
        frame.style.setProperty('--open', (1 - Math.pow(1 - open, 3)).toFixed(4));
        immersive.classList.toggle('is-open', open > 0.92);
      }
    }

    // Introduction lights up word by word.
    if (words.length) {
      const r = introBody.getBoundingClientRect();
      const p = Math.min(Math.max((vh * 0.85 - r.top) / (r.height + vh * 0.35), 0), 1);
      const lit = Math.round(p * words.length);
      words.forEach((w, i) => w.classList.toggle('is-lit', i < lit));
    }

    // Gallery travels sideways while the section is pinned.
    if (hActive) {
      const r = hWrap.getBoundingClientRect();
      const p = Math.min(Math.max(-r.top / (r.height - vh), 0), 1);
      hTrack.style.transform = `translate3d(${(-p * hDistance).toFixed(1)}px, 0, 0)`;
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
  window.addEventListener('resize', () => { measureGallery(); update(); });
  measureGallery();
  update();

  // Words in motion: a slow drift that quickens with scrolling.
  const marquee = document.querySelector('.marquee__track');
  if (marquee && !reduceMotion) {
    let x = 0;
    let lastY = window.scrollY;
    let visible = false;
    new IntersectionObserver(([e]) => { visible = e.isIntersecting; }).observe(marquee);
    const drift = () => {
      const y = window.scrollY;
      const boost = Math.min(Math.abs(y - lastY) * 0.35, 18);
      lastY = y;
      if (visible) {
        x -= 0.45 + boost;
        const third = marquee.scrollWidth / 3;
        if (-x >= third) x += third;
        marquee.style.transform = `translate3d(${x.toFixed(1)}px, 0, 0)`;
      }
      requestAnimationFrame(drift);
    };
    requestAnimationFrame(drift);
  }

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
})();
