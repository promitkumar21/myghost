/* ═══════════════════════════════════════════════
   MY GHOST — script.js
   ═══════════════════════════════════════════════ */

(function () {
  'use strict';

  /* ─────────────────────────────────────
     1. GRAIN TEXTURE (canvas-generated)
  ───────────────────────────────────── */
  (function buildGrain() {
    const c = document.createElement('canvas');
    c.width = c.height = 220;
    const x = c.getContext('2d');
    const d = x.createImageData(220, 220);
    for (let i = 0; i < d.data.length; i += 4) {
      const v = Math.floor(Math.random() * 255);
      d.data[i] = d.data[i + 1] = d.data[i + 2] = v;
      d.data[i + 3] = 20;
    }
    x.putImageData(d, 0, 0);
    const grain = document.getElementById('grain');
    if (grain) {
      grain.style.backgroundImage = `url(${c.toDataURL()})`;
      grain.style.backgroundSize = '200px 200px';
      grain.style.backgroundRepeat = 'repeat';
    }
  })();

  /* ─────────────────────────────────────
     2. GHOST CURSORS + SPOTLIGHT
  ───────────────────────────────────── */
  const gcMain = document.getElementById('gc-main');
  const gcTrail = document.getElementById('gc-trail');
  const spotlight = document.getElementById('spotlight');

  let mx = -300, my = -300;
  let tx = -300, ty = -300;   // trail (spring)
  let pmx = 0, pmy = 0;     // previous mouse (for rotation)

  document.addEventListener('mousemove', e => {
    pmx = mx; pmy = my;
    mx = e.clientX; my = e.clientY;

    // Main cursor position
    gcMain.style.left = mx + 'px';
    gcMain.style.top = my + 'px';

    // Spotlight follows instantly
    if (spotlight) {
      spotlight.style.left = mx + 'px';
      spotlight.style.top = my + 'px';
    }

    // Slight tilt based on movement direction
    const dx = mx - pmx;
    const dy = my - pmy;
    const angle = Math.atan2(dy, dx) * (180 / Math.PI) + 90;
    gcMain.style.transform = `translate(-50%,-50%) rotate(${angle * 0.12}deg)`;
  });

  document.addEventListener('mouseleave', () => {
    gcMain.style.opacity = '0';
    gcTrail.style.opacity = '0';
    if (spotlight) spotlight.style.opacity = '0';
  });
  document.addEventListener('mouseenter', () => {
    gcMain.style.opacity = '1';
    gcTrail.style.opacity = '.3';
    if (spotlight) spotlight.style.opacity = '1';
  });

  // Trailing ghost with spring physics
  function animTrail(ts) {
    tx += (mx - tx) * 0.072;
    ty += (my - ty) * 0.072;
    gcTrail.style.left = tx + 'px';
    gcTrail.style.top = ty + 'px';
    requestAnimationFrame(animTrail);
  }
  requestAnimationFrame(animTrail);

  /* ─────────────────────────────────────
     3. GHOST EYE TRACKING (main ghost)
  ───────────────────────────────────── */
  const ghost1El = document.querySelector('.g1');
  const pupilL = document.getElementById('eye1l');
  const pupilR = document.getElementById('eye1r');
  const EYE_BASE = { L: { cx: 37, cy: 50 }, R: { cx: 63, cy: 50 } };
  const MAX_MOVE = 2.8;

  function trackEyes() {
    if (!ghost1El || !pupilL || !pupilR) return;
    const rect = ghost1El.getBoundingClientRect();
    if (rect.bottom < 0 || rect.top > innerHeight) return;

    // SVG viewBox is "0 0 100 130"
    const scX = rect.width / 100;
    const scY = rect.height / 130;

    [['L', pupilL], ['R', pupilR]].forEach(([side, el]) => {
      const base = EYE_BASE[side];
      const eyeX = rect.left + base.cx * scX;
      const eyeY = rect.top + base.cy * scY;
      const dx = mx - eyeX;
      const dy = my - eyeY;
      const dist = Math.hypot(dx, dy) || 1;
      const move = Math.min(MAX_MOVE, dist * 0.04);
      el.setAttribute('cx', base.cx + (dx / dist) * move);
      el.setAttribute('cy', base.cy + (dy / dist) * move);
    });
  }

  /* ─────────────────────────────────────
     4. SCROLL PROGRESS BAR
  ───────────────────────────────────── */
  const progressBar = document.getElementById('progress');
  function updateProgress() {
    const max = document.documentElement.scrollHeight - innerHeight;
    const pct = max > 0 ? window.scrollY / max : 0;
    if (progressBar) progressBar.style.transform = `scaleX(${pct})`;
  }
  window.addEventListener('scroll', updateProgress, { passive: true });

  /* ─────────────────────────────────────
     5. STAR CANVAS + SHOOTING STARS
  ───────────────────────────────────── */
  const cvs = document.getElementById('stars');
  const ctx = cvs.getContext('2d');

  function resizeCvs() {
    cvs.width = innerWidth;
    cvs.height = innerHeight;
  }
  resizeCvs();
  addEventListener('resize', resizeCvs);

  // Static stars
  const stars = Array.from({ length: 270 }, () => ({
    x: Math.random() * innerWidth,
    y: Math.random() * innerHeight * 0.76,
    r: Math.random() * 1.4 + 0.3,
    a: Math.random() * 0.7 + 0.3,
    sp: Math.random() * 0.0016 + 0.0008,
    ph: Math.random() * Math.PI * 2,
  }));

  // Shooting stars
  const shooters = [];

  function spawnShooter() {
    const angle = (28 + Math.random() * 28) * Math.PI / 180;
    const speed = 5 + Math.random() * 8;
    shooters.push({
      x: Math.random() * innerWidth * 0.55,
      y: Math.random() * innerHeight * 0.28,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      life: 1.0,
      tail: 90 + Math.random() * 60,
    });
  }

  setTimeout(spawnShooter, 5500);
  setInterval(spawnShooter, 12000 + Math.random() * 10000);

  function drawAll(t) {
    ctx.clearRect(0, 0, cvs.width, cvs.height);

    // Regular stars
    stars.forEach(s => {
      const a = s.a * (0.55 + 0.45 * Math.sin(t * 0.001 * s.sp * 1000 + s.ph));
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255,255,210,${a})`;
      ctx.fill();
    });

    // Shooting stars
    for (let i = shooters.length - 1; i >= 0; i--) {
      const ss = shooters[i];
      ss.x += ss.vx;
      ss.y += ss.vy;
      ss.life -= 0.009;
      if (ss.life <= 0) { shooters.splice(i, 1); continue; }

      const alpha = Math.min(1, ss.life * 2.5);
      const tx0 = ss.x - ss.vx * (ss.tail / 10);
      const ty0 = ss.y - ss.vy * (ss.tail / 10);
      const grad = ctx.createLinearGradient(tx0, ty0, ss.x, ss.y);
      grad.addColorStop(0, 'rgba(255,255,220,0)');
      grad.addColorStop(1, `rgba(255,255,220,${alpha * 0.85})`);
      ctx.beginPath();
      ctx.moveTo(tx0, ty0);
      ctx.lineTo(ss.x, ss.y);
      ctx.strokeStyle = grad;
      ctx.lineWidth = 1.6;
      ctx.stroke();

      // Sparkle at head
      ctx.beginPath();
      ctx.arc(ss.x, ss.y, 1.5, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255,255,240,${alpha})`;
      ctx.fill();
    }

    requestAnimationFrame(drawAll);
  }
  requestAnimationFrame(drawAll);

  /* ─────────────────────────────────────
     6. MOON PARALLAX (scroll + mouse)
  ───────────────────────────────────── */
  const moonWrap = document.getElementById('moonWrap');
  let moonMouseX = 0, moonMouseY = 0;
  let moonTargetX = 0, moonTargetY = 0;
  let scrollY = 0;

  document.addEventListener('mousemove', e => {
    moonMouseX = (e.clientX / innerWidth - 0.5) * -18;
    moonMouseY = (e.clientY / innerHeight - 0.5) * -12;
  });

  window.addEventListener('scroll', () => {
    scrollY = window.scrollY;
  }, { passive: true });

  function animMoon() {
    moonTargetX += (moonMouseX - moonTargetX) * 0.04;
    moonTargetY += (moonMouseY - moonTargetY) * 0.04;
    if (moonWrap) {
      moonWrap.style.transform = `translate(${moonTargetX}px, ${moonTargetY + scrollY * 0.2}px)`;
    }
    trackEyes();
    requestAnimationFrame(animMoon);
  }
  animMoon();

  /* ─────────────────────────────────────
     7. INTERSECTION OBSERVER REVEALS
  ───────────────────────────────────── */
  const io = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('vis');
        // Memory cards: stagger by data-delay
        if (e.target.classList.contains('mc')) {
          const d = parseInt(e.target.dataset.delay || 0, 10);
          e.target.style.transitionDelay = d + 'ms';
        }
      }
    });
  }, { threshold: 0.12 });

  const revealEls = document.querySelectorAll(
    '.reveal-right, .reveal-up, .mc, #letterPaper'
  );
  revealEls.forEach(el => io.observe(el));

  /* ─────────────────────────────────────
     8. GHOST SECTION NAVIGATOR
  ───────────────────────────────────── */
  const navSections = Array.from(document.querySelectorAll('section[id]'));
  const sectionLabels = {
    hero: 'Hero',
    journal: 'Journal',
    poem: 'Poem',
    letter: 'Letter',
    closing: 'Closing'
  };

  if (navSections.length) {
    const ghostNav = document.createElement('nav');
    ghostNav.className = 'ghost-nav';
    ghostNav.setAttribute('aria-label', 'Section navigation');

    const ghostSvg = `
      <svg viewBox="0 0 42 54" aria-hidden="true" focusable="false">
        <path d="M5 39 Q9 53 14 42 Q18 32 21 45 Q24 58 28 42 Q33 27 37 39 L37 22 Q37 4 21 4 Q5 4 5 22 Z" />
        <ellipse cx="16" cy="22" rx="3.5" ry="4.5" />
        <ellipse cx="26" cy="22" rx="3.5" ry="4.5" />
      </svg>
    `;

    navSections.forEach(section => {
      const btn = document.createElement('button');
      const label = sectionLabels[section.id] || section.id;

      btn.type = 'button';
      btn.className = 'ghost-nav-dot';
      btn.dataset.target = section.id;
      btn.setAttribute('aria-label', `Go to ${label}`);
      btn.innerHTML = `${ghostSvg}<span>${label}</span>`;

      btn.addEventListener('click', () => {
        section.scrollIntoView({ behavior: 'smooth', block: 'start' });
      });

      ghostNav.appendChild(btn);
    });

    document.body.appendChild(ghostNav);

    const navDots = Array.from(ghostNav.querySelectorAll('.ghost-nav-dot'));

    function setActiveSection(id) {
      navDots.forEach(dot => {
        const isActive = dot.dataset.target === id;
        dot.classList.toggle('active', isActive);
        dot.setAttribute('aria-current', isActive ? 'true' : 'false');
      });
    }

    const activeSectionObserver = new IntersectionObserver(entries => {
      const visible = entries
        .filter(entry => entry.isIntersecting)
        .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];

      if (visible) {
        setActiveSection(visible.target.id);
      }
    }, {
      rootMargin: '-38% 0px -42% 0px',
      threshold: [0, 0.2, 0.5, 0.8]
    });

    navSections.forEach(section => activeSectionObserver.observe(section));
    setActiveSection(navSections[0].id);
  }

  /* ─────────────────────────────────────
     9. POEM TYPEWRITER REVEAL
  ───────────────────────────────────── */
  const poemLines = Array.from(document.querySelectorAll('.pl'));
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function typePoemLine(line) {
    if (line.dataset.typed === 'true') return;

    const fullText = line.dataset.fullText || '';
    const isSpacer = line.classList.contains('spacer') || !fullText.trim();

    line.dataset.typed = 'true';
    line.classList.add('vis');

    if (isSpacer || reduceMotion) {
      line.textContent = isSpacer ? '\u00a0' : fullText;
      line.classList.add('typed');
      return;
    }

    let i = 0;
    const speed = 28;
    const naturalPause = 65;

    line.classList.add('typing');
    line.textContent = '';

    function writeNext() {
      line.textContent = fullText.slice(0, i);
      i += 1;

      if (i <= fullText.length) {
        const char = fullText[i - 2] || '';
        const pause = /[.,!?]/.test(char) ? naturalPause : speed;
        window.setTimeout(writeNext, pause);
      } else {
        line.classList.remove('typing');
        line.classList.add('typed');
      }
    }

    writeNext();
  }

  poemLines.forEach(line => {
    line.dataset.fullText = line.textContent.replace(/\u00a0/g, ' ');
    line.textContent = line.classList.contains('spacer') ? '\u00a0' : '';
  });

  const poemObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;

      const line = entry.target;
      const index = poemLines.indexOf(line);
      window.setTimeout(() => typePoemLine(line), Math.max(index, 0) * 115);
      poemObserver.unobserve(line);
    });
  }, {
    rootMargin: '0px 0px -10% 0px',
    threshold: 0.35
  });

  poemLines.forEach(line => {
    if (reduceMotion) {
      typePoemLine(line);
    } else {
      poemObserver.observe(line);
    }
  });

  /* ─────────────────────────────────────
     10. BUTTERFLY FLY-ACROSS
  ───────────────────────────────────── */
  function flyButterfly() {
    const bf = document.createElement('div');
    const sz = 16 + Math.random() * 12;
    const startY = 15 + Math.random() * 60;
    const dur = 9 + Math.random() * 7;
    const driftY = (Math.random() - 0.5) * 100;
    const tiltDeg = Math.random() * 22 - 11;

    bf.textContent = '🦋';
    bf.style.cssText = [
      `position:fixed`,
      `font-size:${sz}px`,
      `pointer-events:none`,
      `z-index:10`,
      `top:${startY}vh`,
      `left:-50px`,
      `opacity:0`,
      `transition:transform ${dur}s linear, opacity .8s ease`,
      `will-change:transform,opacity`,
    ].join(';');

    document.body.appendChild(bf);

    // Double rAF ensures transition fires
    requestAnimationFrame(() => requestAnimationFrame(() => {
      bf.style.opacity = '0.65';
      bf.style.transform =
        `translateX(${innerWidth + 80}px)` +
        ` translateY(${driftY}px)` +
        ` rotate(${tiltDeg}deg)`;
    }));

    // Fade out near end
    setTimeout(() => { bf.style.opacity = '0'; }, (dur - 0.9) * 1000);
    setTimeout(() => bf.remove(), (dur + 1) * 1000);
  }

  setTimeout(flyButterfly, 7000);
  setInterval(flyButterfly, 18000 + Math.random() * 8000);

  /* ─────────────────────────────────────
     9. SCROLL PROGRESS UPDATE (also
        handles hero ghost float offset)
  ───────────────────────────────────── */
  window.addEventListener('scroll', () => {
    updateProgress();
  }, { passive: true });

  /* ─────────────────────────────────────
     10. LETTER PAPER HOVER WOBBLE
  ───────────────────────────────────── */
  const letterPaper = document.getElementById('letterPaper');
  if (letterPaper) {
    letterPaper.addEventListener('mouseenter', () => {
      letterPaper.style.transform = 'rotate(0deg) scale(1.012)';
      letterPaper.style.transition = 'transform .5s cubic-bezier(.25,.46,.45,.94), opacity 1s ease';
      letterPaper.style.boxShadow =
        '0 4px 16px rgba(0,0,0,.3), 0 32px 90px rgba(0,0,0,.75), inset 0 0 60px rgba(0,0,0,.03)';
    });
    letterPaper.addEventListener('mouseleave', () => {
      letterPaper.style.transform = 'rotate(.5deg) scale(1)';
      letterPaper.style.boxShadow =
        '0 2px 8px rgba(0,0,0,.25), 0 24px 70px rgba(0,0,0,.65), inset 0 0 60px rgba(0,0,0,.03)';
    });
  }
  /* ─────────────────────────────────────
     11. HERO FIREFLIES / MOONLIGHT DUST
  ───────────────────────────────────── */
  const heroSection = document.getElementById('hero');
  if (heroSection) {
    const fireflyCount = 45;
    for (let i = 0; i < fireflyCount; i++) {
      const ff = document.createElement('div');
      ff.classList.add('firefly');

      const x = Math.random() * 100;
      const y = Math.random() * 100;
      const size = Math.random() * 2 + 1; // 1px to 3px
      const duration = 15 + Math.random() * 20; // 15s to 35s
      const delay = Math.random() * -35;

      // Random drift ranges
      const mx = (Math.random() - 0.5) * 150;
      const my = (Math.random() - 0.5) * 150 - 50; // Bias slightly upwards

      ff.style.setProperty('--mx', mx + 'px');
      ff.style.setProperty('--my', my + 'px');

      ff.style.left = x + '%';
      ff.style.top = y + '%';
      ff.style.width = size + 'px';
      ff.style.height = size + 'px';
      ff.style.animationDuration = duration + 's';
      ff.style.animationDelay = delay + 's';

      heroSection.appendChild(ff);
    }
  }
  /* ─────────────────────────────────────
     12. CURSOR TRAIL SPARKS
  ───────────────────────────────────── */
  let smx = 0, smy = 0;
  let lastSparkTime = 0;

  document.addEventListener('mousemove', e => {
    // mx and my are globally updated in section 2
    const dx = mx - smx;
    const dy = my - smy;
    const dist = Math.hypot(dx, dy);
    const now = Date.now();

    // Spawn if moved enough and throttled (15ms)
    if (dist > 3 && now - lastSparkTime > 15) {
      lastSparkTime = now;
      const count = Math.min(Math.floor(dist / 12), 2) + 1; // 1 to 3 sparks
      for (let i = 0; i < count; i++) {
        createSpark(mx, my, dx, dy);
      }
    }
    smx = mx; smy = my;
  });

  function createSpark(x, y, dx, dy) {
    const sp = document.createElement('div');
    sp.className = 'cursor-spark';

    const size = Math.random() * 5 + 3; // 3px to 8px
    const vx = -dx * 0.15 + (Math.random() - 0.5) * 40;
    const vy = -dy * 0.15 + (Math.random() - 0.5) * 40 + 5;
    const rot = Math.random() * 90;

    // Start slightly below the ghost eyes (approx center is x, y)
    sp.style.cssText = `
      left: ${x - size / 2}px;
      top: ${y - size / 2 + 10}px;
      width: ${size}px;
      height: ${size}px;
      transform: translate(0, 0) rotate(0deg) scale(1);
    `;

    document.body.appendChild(sp);

    requestAnimationFrame(() => {
      sp.style.transition = 'transform 0.6s ease-out, opacity 0.6s ease-out';
      sp.style.transform = `translate(${vx}px, ${vy}px) rotate(${rot}deg) scale(0)`;
      sp.style.opacity = '0';
    });

    setTimeout(() => sp.remove(), 600);
  }

  /* ─────────────────────────────────────
     13. EASTER EGG: BOO
  ───────────────────────────────────── */
  let typedKeys = '';
  document.addEventListener('keydown', e => {
    // Only capture letters to avoid massive buffers
    if (e.key.length === 1) {
      typedKeys += e.key.toLowerCase();
      if (typedKeys.length > 5) {
        typedKeys = typedKeys.slice(-5);
      }

      if (typedKeys.endsWith('boo')) {
        triggerJumpscare();
        typedKeys = '';
      }
    }
  });

  function triggerJumpscare() {
    if (document.getElementById('jumpscare-ghost')) return;

    const ghost = document.createElement('div');
    ghost.id = 'jumpscare-ghost';
    ghost.innerHTML = `
      <svg viewBox="0 0 100 130" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M8 96 Q14 118 22 102 Q30 86 37 108 Q44 128 50 108 Q56 86 63 108 Q70 128 78 102 Q86 76 92 96 L92 52 Q92 8 50 8 Q8 8 8 52 Z" fill="rgba(250,250,248,.96)" />
        <ellipse cx="37" cy="50" rx="9" ry="12" fill="#0d0d14" />
        <ellipse cx="63" cy="50" rx="9" ry="12" fill="#0d0d14" />
        <circle cx="37" cy="48" r="3.5" fill="#fff" />
        <circle cx="63" cy="48" r="3.5" fill="#fff" />
        <ellipse cx="50" cy="72" rx="10" ry="14" fill="#0d0d14" />
      </svg>
    `;
    document.body.appendChild(ghost);

    setTimeout(() => {
      ghost.remove();
    }, 1800);
  }

  /* ─────────────────────────────────────
     14. BACKGROUND MUSIC
  ───────────────────────────────────── */
  const audio = document.getElementById('bg-music');
  const musicToggle = document.getElementById('music-toggle');

  if (audio && musicToggle) {
    audio.volume = 0.4;
    audio.preload = 'auto';
    audio.load();

    function updateVisualState() {
      musicToggle.classList.toggle('playing', !audio.paused);
      musicToggle.setAttribute('aria-label', audio.paused ? 'Play music' : 'Pause music');
    }

    async function playMusic() {
      try {
        await audio.play();
      } catch (err) {
        console.log('Audio play failed:', err);
      } finally {
        updateVisualState();
      }
    }

    musicToggle.setAttribute('role', 'button');
    musicToggle.setAttribute('tabindex', '0');
    updateVisualState();

    audio.addEventListener('play', updateVisualState);
    audio.addEventListener('pause', updateVisualState);
    audio.addEventListener('ended', updateVisualState);
    audio.addEventListener('error', updateVisualState);

    musicToggle.addEventListener('click', (e) => {
      e.stopPropagation();

      if (audio.paused) {
        playMusic();
      } else {
        audio.pause();
        updateVisualState();
      }
    });

    musicToggle.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        musicToggle.click();
      }
    });

    document.addEventListener('click', () => {
      if (audio.paused) {
        playMusic();
      }
    }, { once: true });
  }

  /* ─────────────────────────────────────
     15. ALIVE SCENE (CLOSING SECTION)
  ───────────────────────────────────── */
  (function initAliveScene() {
    const aliveViewport = document.getElementById('aliveViewport');
    if (!aliveViewport) return;

    const aliveCvs = document.getElementById('aliveStarfield');
    const aliveCtx = aliveCvs ? aliveCvs.getContext('2d') : null;
    const aliveGhostWrap = document.getElementById('aliveGhostWrap');
    const aliveCatWrap = document.getElementById('aliveCatWrap');
    const aliveTitleCard = document.getElementById('aliveTitleCard');
    const ghostSparkles = document.getElementById('ghostSparkles');
    const aliveStarsFloat = document.getElementById('aliveStarsFloat');

    let aliveActive = false;

    // ─── Resize alive canvas ───
    function resizeAliveCanvas() {
      if (!aliveCvs) return;
      const rect = aliveViewport.getBoundingClientRect();
      aliveCvs.width = rect.width;
      aliveCvs.height = rect.height;
    }
    resizeAliveCanvas();
    window.addEventListener('resize', resizeAliveCanvas);

    // ─── Stars for the alive scene ───
    const aliveStars = [];
    if (aliveCtx) {
      for (let i = 0; i < 180; i++) {
        aliveStars.push({
          x: Math.random(),
          y: Math.random() * 0.65,
          r: Math.random() * 1.4 + 0.3,
          a: Math.random() * 0.65 + 0.3,
          sp: Math.random() * 0.0015 + 0.0006,
          ph: Math.random() * Math.PI * 2,
        });
      }
    }

    // ─── Shooting stars for alive ───
    const aliveShooters = [];
    function spawnAliveShooter() {
      if (!aliveCtx || !aliveActive || reducedMotion) return;
      const angle = (22 + Math.random() * 36) * Math.PI / 180;
      const speed = 4.5 + Math.random() * 7;
      aliveShooters.push({
        x: Math.random() * aliveCvs.width * 0.6,
        y: Math.random() * aliveCvs.height * 0.25,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: 1.0,
        tail: 80 + Math.random() * 70,
      });
    }

    setInterval(() => {
      if (aliveActive) spawnAliveShooter();
    }, 8000 + Math.random() * 7000);

    // ─── Draw alive sky ───
    function drawAliveSky(t) {
      if (!aliveCtx || !aliveActive) {
        requestAnimationFrame(drawAliveSky);
        return;
      }

      aliveCtx.clearRect(0, 0, aliveCvs.width, aliveCvs.height);

      // Twinkle
      aliveStars.forEach(s => {
        const alpha = s.a * (0.45 + 0.55 * Math.sin(t * 0.001 * s.sp * 1000 + s.ph));
        aliveCtx.beginPath();
        aliveCtx.arc(s.x * aliveCvs.width, s.y * aliveCvs.height, s.r, 0, Math.PI * 2);
        aliveCtx.fillStyle = `rgba(255,255,210,${Math.max(0, alpha)})`;
        aliveCtx.fill();
      });

      // Shooting stars
      for (let i = aliveShooters.length - 1; i >= 0; i--) {
        const ss = aliveShooters[i];
        ss.x += ss.vx;
        ss.y += ss.vy;
        ss.life -= 0.008;
        if (ss.life <= 0) { aliveShooters.splice(i, 1); continue; }

        const alpha = Math.min(1, ss.life * 2.5);
        const tx0 = ss.x - ss.vx * (ss.tail / 10);
        const ty0 = ss.y - ss.vy * (ss.tail / 10);
        const grad = aliveCtx.createLinearGradient(tx0, ty0, ss.x, ss.y);
        grad.addColorStop(0, 'rgba(255,255,220,0)');
        grad.addColorStop(1, `rgba(255,255,220,${alpha * 0.85})`);
        aliveCtx.beginPath();
        aliveCtx.moveTo(tx0, ty0);
        aliveCtx.lineTo(ss.x, ss.y);
        aliveCtx.strokeStyle = grad;
        aliveCtx.lineWidth = 1.8;
        aliveCtx.stroke();

        // Head glow
        aliveCtx.beginPath();
        aliveCtx.arc(ss.x, ss.y, 2, 0, Math.PI * 2);
        aliveCtx.fillStyle = `rgba(255,255,240,${alpha})`;
        aliveCtx.fill();
      }

      requestAnimationFrame(drawAliveSky);
    }
    requestAnimationFrame(drawAliveSky);

    // ─── Ghost sparkle particles ───
    if (ghostSparkles) {
      for (let i = 0; i < 12; i++) {
        const sp = document.createElement('div');
        sp.className = 'ghost-sparkle';
        const angle = Math.random() * Math.PI * 2;
        const dist = 20 + Math.random() * 40;
        sp.style.left = '50%';
        sp.style.top = '40%';
        sp.style.setProperty('--sx', Math.cos(angle) * dist + 'px');
        sp.style.setProperty('--sy', Math.sin(angle) * dist + 'px');
        sp.style.setProperty('--dur', (3 + Math.random() * 4) + 's');
        sp.style.setProperty('--delay', (Math.random() * 4) + 's');
        ghostSparkles.appendChild(sp);
      }
    }

    // ─── Floating custom SVG stars ───
    if (aliveStarsFloat) {
      const starSvg = `<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 2L14.4 9.6L22 12L14.4 14.4L12 22L9.6 14.4L2 12L9.6 9.6L12 2Z" fill="currentColor"/></svg>`;
      for (let i = 0; i < 12; i++) {
        const st = document.createElement('div');
        st.className = 'alive-float-star';
        st.innerHTML = starSvg;
        st.style.color = 'rgba(255, 240, 180, 0.8)';
        st.style.left = (10 + Math.random() * 80) + '%';
        st.style.top = (15 + Math.random() * 50) + '%';
        st.style.setProperty('--size', (8 + Math.random() * 12) + 'px');
        st.style.setProperty('--dur', (10 + Math.random() * 14) + 's');
        st.style.setProperty('--delay', (Math.random() * -15) + 's');
        st.style.setProperty('--dx', ((Math.random() - 0.5) * 80) + 'px');
        st.style.setProperty('--dy', (-20 - Math.random() * 60) + 'px');
        aliveStarsFloat.appendChild(st);
      }
    }

    // ─── 3D Journal Interaction ───
    const jWrap = document.querySelector('.j-img-wrap');
    const jInner = document.querySelector('.j-img-inner');
    if (jWrap && jInner) {
      jWrap.addEventListener('mousemove', (e) => {
        if (reducedMotion) return;
        const rect = jWrap.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const xc = rect.width / 2;
        const yc = rect.height / 2;
        const rotY = ((x - xc) / xc) * 6; // max 6 deg
        const rotX = -((y - yc) / yc) * 6;
        jInner.style.transform = `perspective(1000px) rotateX(${rotX}deg) rotateY(${rotY}deg) scale3d(1.02, 1.02, 1.02)`;
      });
      
      jWrap.addEventListener('mouseenter', () => {
        if (!reducedMotion) jInner.style.transition = 'none';
      });

      jWrap.addEventListener('mouseleave', () => {
        if (!reducedMotion) {
          jInner.style.transition = 'transform .7s var(--ease), box-shadow .7s var(--ease)';
          jInner.style.transform = `rotate(-2.5deg)`;
        }
      });
    }

    // ─── Fireflies for alive scene ───
    function spawnAliveFirefly() {
      if (!aliveViewport || !aliveActive || reducedMotion) return;
      const ff = document.createElement('div');
      ff.className = 'alive-firefly';

      const x = Math.random() * 100;
      const y = 30 + Math.random() * 60;
      const mxVal = (Math.random() - 0.5) * 180;
      const myVal = (Math.random() - 0.5) * 140 - 30;
      const dur = 9 + Math.random() * 12;

      ff.style.left = x + '%';
      ff.style.top = y + '%';
      ff.style.setProperty('--mx', mxVal + 'px');
      ff.style.setProperty('--my', myVal + 'px');
      ff.style.animation = `aliveFireflyMove ${dur}s linear forwards`;

      aliveViewport.appendChild(ff);
      setTimeout(() => ff.remove(), dur * 1000);
    }

    setInterval(() => {
      if (aliveActive) spawnAliveFirefly();
    }, 600);

    // ─── Intersection Observer to activate alive scene ───
    const aliveObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        aliveActive = entry.isIntersecting;
        if (entry.isIntersecting) {
          if (aliveTitleCard) {
            setTimeout(() => aliveTitleCard.classList.add('visible'), 600);
          }
          // Spawn initial shooting star
          setTimeout(spawnAliveShooter, 1500);
        }
      });
    }, { threshold: 0.15 });

    const closingSection = document.getElementById('closing');
    if (closingSection) aliveObserver.observe(closingSection);

    // ─── Smooth scroll for "see it come alive" link ───
    const aliveLink = document.getElementById('aliveLink');
    if (aliveLink) {
      aliveLink.addEventListener('click', (e) => {
        e.preventDefault();
        const target = document.getElementById('closing');
        if (target) {
          target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      });
    }
  })();

})();
