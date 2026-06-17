/* ═══════════════════════════════════════════════
   MY GHOST — alive.js
   Premium animations for the living image page.
   ═══════════════════════════════════════════════ */

(function () {
  'use strict';

  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ─────────────────────────────────────
     1. STARFIELD + SHOOTING STARS
  ───────────────────────────────────── */
  const cvs = document.getElementById('starfield');
  const ctx = cvs ? cvs.getContext('2d') : null;

  function resizeCanvas() {
    if (!cvs) return;
    cvs.width = window.innerWidth;
    cvs.height = window.innerHeight;
  }
  resizeCanvas();
  window.addEventListener('resize', resizeCanvas);

  const stars = [];
  if (ctx) {
    for (let i = 0; i < 200; i++) {
      stars.push({
        x: Math.random() * window.innerWidth,
        y: Math.random() * window.innerHeight * 0.68,
        r: Math.random() * 1.4 + 0.3,
        a: Math.random() * 0.65 + 0.3,
        sp: Math.random() * 0.0015 + 0.0006,
        ph: Math.random() * Math.PI * 2,
      });
    }
  }

  const shooters = [];
  function spawnShooter() {
    if (!ctx || reducedMotion) return;
    const angle = (20 + Math.random() * 38) * Math.PI / 180;
    const speed = 4.5 + Math.random() * 7;
    shooters.push({
      x: Math.random() * window.innerWidth * 0.6,
      y: Math.random() * window.innerHeight * 0.25,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      life: 1.0,
      tail: 80 + Math.random() * 70,
    });
  }

  setTimeout(spawnShooter, 2500);
  setInterval(spawnShooter, 7500 + Math.random() * 6000);

  function drawSky(t) {
    if (!ctx) return;
    ctx.clearRect(0, 0, cvs.width, cvs.height);

    // Twinkle stars with organic pulsing
    stars.forEach(s => {
      const alpha = s.a * (0.45 + 0.55 * Math.sin(t * 0.001 * s.sp * 1000 + s.ph));
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255,255,210,${Math.max(0, alpha)})`;
      ctx.fill();
    });

    // Shooting stars with gradient tails
    for (let i = shooters.length - 1; i >= 0; i--) {
      const ss = shooters[i];
      ss.x += ss.vx;
      ss.y += ss.vy;
      ss.life -= 0.008;
      if (ss.life <= 0) {
        shooters.splice(i, 1);
        continue;
      }

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
      ctx.lineWidth = 1.8;
      ctx.stroke();

      // Bright head
      ctx.beginPath();
      ctx.arc(ss.x, ss.y, 2, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255,255,240,${alpha})`;
      ctx.fill();

      // Soft glow around head
      ctx.beginPath();
      ctx.arc(ss.x, ss.y, 4, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255,255,220,${alpha * 0.2})`;
      ctx.fill();
    }

    requestAnimationFrame(drawSky);
  }
  requestAnimationFrame(drawSky);



  /* ─────────────────────────────────────
     3. FLOATING CUSTOM SVG STARS
  ───────────────────────────────────── */
  const starsFloat = document.getElementById('starsFloat');
  if (starsFloat) {
    const starSvg = `<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 2L14.4 9.6L22 12L14.4 14.4L12 22L9.6 14.4L2 12L9.6 9.6L12 2Z" fill="currentColor"/></svg>`;
    for (let i = 0; i < 10; i++) {
      const st = document.createElement('div');
      st.className = 'float-star';
      st.innerHTML = starSvg;
      st.style.color = 'rgba(255, 240, 180, 0.8)';
      st.style.left = (8 + Math.random() * 84) + '%';
      st.style.top = (12 + Math.random() * 55) + '%';
      st.style.setProperty('--size', (8 + Math.random() * 12) + 'px');
      st.style.setProperty('--dur', (10 + Math.random() * 14) + 's');
      st.style.setProperty('--delay', (Math.random() * -16) + 's');
      st.style.setProperty('--dx', ((Math.random() - 0.5) * 90) + 'px');
      st.style.setProperty('--dy', (-20 - Math.random() * 70) + 'px');
      starsFloat.appendChild(st);
    }
  }

  /* ─────────────────────────────────────
     4. FIREFLIES
  ───────────────────────────────────── */
  const viewport = document.getElementById('viewport');

  function spawnFirefly() {
    if (!viewport || reducedMotion) return;
    const ff = document.createElement('div');
    ff.className = 'firefly';

    const x = Math.random() * 100;
    const y = 30 + Math.random() * 60;
    const mx = (Math.random() - 0.5) * 180;
    const my = (Math.random() - 0.5) * 140 - 30;
    const dur = 9 + Math.random() * 12;

    ff.style.left = x + '%';
    ff.style.top = y + '%';
    ff.style.setProperty('--mx', mx + 'px');
    ff.style.setProperty('--my', my + 'px');
    ff.style.animation = `fireflyMove ${dur}s linear forwards`;

    viewport.appendChild(ff);
    setTimeout(() => ff.remove(), dur * 1000);
  }

  setInterval(spawnFirefly, 550);


})();
