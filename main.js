/* ══════════════════════════════════════════════════════
   main.js — Orest Zogju Portfolio
   Sections:
     1.  Custom Cursor
     2.  Navbar — Scroll Effect
     3.  Typing Effect (hero role)
     4.  Scroll Reveal (IntersectionObserver)
     5.  Skill Bars (IntersectionObserver)
     6.  Background Canvas (particle grid + glow blooms)
     7.  Card Glow on Mouse-Move
     8.  Contact Form — Submit Feedback
══════════════════════════════════════════════════════ */


/* ── 1. CUSTOM CURSOR ────────────────────────────── */

const cursorDot  = document.getElementById('cursor-dot');
const cursorRing = document.getElementById('cursor-ring');
const cursor     = document.getElementById('cursor');

// Raw mouse position (updated every mousemove)
let mouseX = 0, mouseY = 0;

// Lagged ring position (smoothly interpolated each frame)
let ringX = 0, ringY = 0;

document.addEventListener('mousemove', e => {
  mouseX = e.clientX;
  mouseY = e.clientY;
});

// Runs every animation frame; the cursor-dot snaps to the mouse,
// while the ring eases toward it (lerp factor 0.15 = ~15% per frame).
(function animateCursor() {
  ringX += (mouseX - ringX) * 0.15;
  ringY += (mouseY - ringY) * 0.15;

  // Move the whole cursor wrapper to the mouse position
  cursor.style.transform = `translate(${mouseX}px, ${mouseY}px)`;

  // Offset the ring relative to the wrapper so it lags behind
  // (subtract mouseX/Y to convert back to local-space offset)
  cursorRing.style.transform = `translate(${ringX - mouseX - 18}px, ${ringY - mouseY - 18}px)`;

  requestAnimationFrame(animateCursor);
})();


/* ── 2. NAVBAR — SCROLL EFFECT ───────────────────── */

const navbar = document.getElementById('navbar');

// Add a frosted-glass background once the user scrolls past 60px
window.addEventListener('scroll', () => {
  navbar.classList.toggle('scrolled', window.scrollY > 60);
});


/* ── 3. TYPING EFFECT ────────────────────────────── */

const roles = ['Software Engineer', 'Java Developer', 'Web Developer', 'IT Professional'];
let roleIndex  = 0;  // which role we are currently typing
let charIndex  = 0;  // how many characters have been typed
let isDeleting = false;

const typedEl = document.getElementById('typed');

function type() {
  const currentRole = roles[roleIndex];

  if (!isDeleting) {
    // Type one character forward
    typedEl.textContent = currentRole.slice(0, ++charIndex);

    if (charIndex === currentRole.length) {
      // Fully typed — pause before deleting
      isDeleting = true;
      setTimeout(type, 1800);
      return;
    }
  } else {
    // Delete one character
    typedEl.textContent = currentRole.slice(0, --charIndex);

    if (charIndex === 0) {
      // Fully deleted — move to the next role
      isDeleting = false;
      roleIndex  = (roleIndex + 1) % roles.length;
    }
  }

  // Deleting is faster than typing for a realistic feel
  setTimeout(type, isDeleting ? 55 : 90);
}

type(); // kick off the typing loop


/* ── 4. SCROLL REVEAL ────────────────────────────── */

// Any element with class="reveal" starts invisible (defined in CSS).
// Once it intersects the viewport by 12%, the .visible class is applied.
const revealObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
    }
  });
}, { threshold: 0.12 });

document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));


/* ── 5. SKILL BARS ───────────────────────────────── */

// Each .skill-bar-item has a child .skill-bar-fill with data-width="N".
// When the item scrolls into view (30% threshold), we set the fill's
// CSS width — triggering the CSS transition defined in styles.css.
const barObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const fill = entry.target.querySelector('.skill-bar-fill');
      if (fill) fill.style.width = fill.dataset.width + '%';
    }
  });
}, { threshold: 0.3 });

document.querySelectorAll('.skill-bar-item').forEach(el => barObserver.observe(el));


/* ── 6. BACKGROUND CANVAS ────────────────────────── */

const canvas = document.getElementById('bg-canvas');

// Only initialize canvas code if the canvas element exists
if (canvas) {
  const ctx = canvas.getContext('2d');

  // Keep the canvas the same size as the browser window
  function resizeCanvas() {
    canvas.width  = window.innerWidth;
    canvas.height = window.innerHeight;
  }
  resizeCanvas();
  window.addEventListener('resize', resizeCanvas);

  // ── Particles ──
  const PARTICLE_COUNT = 90;
  const particles = [];

  for (let i = 0; i < PARTICLE_COUNT; i++) {
    particles.push({
      x:     Math.random() * canvas.width,
      y:     Math.random() * canvas.height,
      r:     Math.random() * 1.2 + 0.2,      // radius 0.2–1.4px
      dx:    (Math.random() - 0.5) * 0.25,   // horizontal drift
      dy:    (Math.random() - 0.5) * 0.25,   // vertical drift
      alpha: Math.random() * 0.5 + 0.15,     // opacity 0.15–0.65
    });
  }

  // Faint cyan grid lines drawn every 80px
  function drawGrid() {
    ctx.strokeStyle = 'rgba(0,200,255,0.025)';
    ctx.lineWidth   = 1;
    const spacing   = 80;

    for (let x = 0; x < canvas.width; x += spacing) {
      ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, canvas.height); ctx.stroke();
    }
    for (let y = 0; y < canvas.height; y += spacing) {
      ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(canvas.width, y); ctx.stroke();
    }
  }

  // Move every particle and connect nearby ones with faint lines
  function drawParticles() {
    particles.forEach(p => {
      // Move and wrap around canvas edges
      p.x += p.dx;
      p.y += p.dy;
      if (p.x < 0)            p.x = canvas.width;
      if (p.x > canvas.width) p.x = 0;
      if (p.y < 0)            p.y = canvas.height;
      if (p.y > canvas.height) p.y = 0;

      // Draw the dot
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(0,200,255,${p.alpha})`;
      ctx.fill();
    });

    // Draw connecting lines between particles within 110px of each other.
    // Opacity fades linearly with distance for a network-graph look.
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx   = particles[i].x - particles[j].x;
        const dy   = particles[i].y - particles[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < 110) {
          const alpha = (0.12 * (1 - dist / 110)).toFixed(3);
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.strokeStyle = `rgba(0,200,255,${alpha})`;
          ctx.lineWidth   = 0.5;
          ctx.stroke();
        }
      }
    }
  }

  // Large radial gradients that add ambient colour to the background
  const blooms = [
    { x: 0.15, y: 0.2,  radius: 380, colour: '0,87,255',   alpha: 0.08 },
    { x: 0.85, y: 0.7,  radius: 320, colour: '123,47,255', alpha: 0.06 },
    { x: 0.5,  y: 0.9,  radius: 280, colour: '0,200,255',  alpha: 0.05 },
  ];

  function drawBlooms() {
    blooms.forEach(b => {
      const cx = b.x * canvas.width;
      const cy = b.y * canvas.height;

      const gradient = ctx.createRadialGradient(cx, cy, 0, cx, cy, b.radius);
      gradient.addColorStop(0, `rgba(${b.colour},${b.alpha})`);
      gradient.addColorStop(1, 'transparent');

      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(cx, cy, b.radius, 0, Math.PI * 2);
      ctx.fill();
    });
  }

  // Main animation loop — clears, redraws everything, repeats
  function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawGrid();
    drawBlooms();
    drawParticles();
    requestAnimationFrame(animate);
  }

  animate();
}

/* ── 7. CARD GLOW ON MOUSE-MOVE ──────────────────── */

// When the cursor moves over a project card or skill card, we track
// its position relative to the card and set CSS custom properties.
// The CSS can then use these to draw a radial glow at the cursor position.
document.querySelectorAll('.project-card, .skill-category').forEach(card => {
  card.addEventListener('mousemove', e => {
    const rect = card.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width  * 100).toFixed(1);
    const y = ((e.clientY - rect.top)  / rect.height * 100).toFixed(1);

    card.style.setProperty('--mouse-x', x + '%');
    card.style.setProperty('--mouse-y', y + '%');
  });
});


/* ── 8. CONTACT FORM — SUBMIT FEEDBACK ───────────── */

// Give the user visual confirmation that the message was sent,
// then restore the button after 3 seconds.
const submitBtn = document.getElementById('submit-btn');

if (submitBtn) {
  submitBtn.closest('form').addEventListener('submit', () => {
    submitBtn.textContent        = 'Sent! ✓';
    submitBtn.style.background   = 'var(--accent)';
    submitBtn.style.color        = 'var(--bg)';
    submitBtn.style.pointerEvents = 'none';

    setTimeout(() => {
      submitBtn.textContent         = 'Send Message →';
      submitBtn.style.background    = '';
      submitBtn.style.color         = '';
      submitBtn.style.pointerEvents = '';
    }, 3000);
  });
}
