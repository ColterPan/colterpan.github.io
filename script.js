/* ============================================================
   COLTER PAN PORTFOLIO v2 - script.js
   Features: Custom Cursor, Dark/Light Mode, Terminal Intro,
   Physics Canvas, Typing Effect, Project Filter, 3D Globe,
   Scroll Animations, Modals, Lightbox, Card Tilt
   ============================================================ */

/* ============================================================
   1. CUSTOM GLOWING CURSOR
   Two-layer cursor: solid dot (instant) + ring (lerp lag)
   ============================================================ */
const cursorDot  = document.querySelector('.cursor-dot');
const cursorRing = document.querySelector('.cursor-ring');

// Current ring position (used for lerp)
let ringX = 0, ringY = 0;
// Target position (where mouse actually is)
let mouseX = 0, mouseY = 0;

// Update target on mouse move
document.addEventListener('mousemove', e => {
  mouseX = e.clientX;
  mouseY = e.clientY;
  // Dot follows instantly
  if (cursorDot) {
    cursorDot.style.left = mouseX + 'px';
    cursorDot.style.top  = mouseY + 'px';
  }
});

// Smooth ring animation using lerp (linear interpolation)
// Ring lags behind the dot for a cool trailing effect
function animateCursor() {
  // Lerp: move ring 12% toward target each frame
  ringX += (mouseX - ringX) * 0.12;
  ringY += (mouseY - ringY) * 0.12;
  if (cursorRing) {
    cursorRing.style.left = ringX + 'px';
    cursorRing.style.top  = ringY + 'px';
  }
  requestAnimationFrame(animateCursor);
}
animateCursor();

// Expand ring when hovering interactive elements
const hoverTargets = 'a, button, .card, .filter-btn, .tag, .cert-card, .contact-card, .thumb, .social-btn';
document.addEventListener('mouseover', e => {
  if (cursorRing && e.target.closest(hoverTargets)) {
    cursorRing.classList.add('hovering');
    if (cursorDot) cursorDot.style.transform = 'translate(-50%,-50%) scale(0.5)';
  }
});
document.addEventListener('mouseout', e => {
  if (cursorRing && e.target.closest(hoverTargets)) {
    cursorRing.classList.remove('hovering');
    if (cursorDot) cursorDot.style.transform = 'translate(-50%,-50%) scale(1)';
  }
});

/* ============================================================
   2. DARK / LIGHT MODE TOGGLE
   Reads from localStorage, toggles .light-mode on body
   ============================================================ */
const themeToggle = document.querySelector('.theme-toggle');
const body = document.body;

// Load saved theme preference on page load
const savedTheme = localStorage.getItem('theme');
if (savedTheme === 'light') body.classList.add('light-mode');

// Toggle theme on button click
if (themeToggle) {
  themeToggle.addEventListener('click', () => {
    body.classList.toggle('light-mode');
    const isLight = body.classList.contains('light-mode');
    localStorage.setItem('theme', isLight ? 'light' : 'dark');
  });
}


/* ============================================================
   4. PHYSICS CANVAS ANIMATION
   Glowing balls bounce in hero, connect with lines, repel mouse
   ============================================================ */
const canvas = document.getElementById('physics-canvas');
const ctx    = canvas ? canvas.getContext('2d') : null;

// Ball colors - neon palette
const BALL_COLORS = ['#00d4ff','#7c3aed','#f472b6','#3b82f6','#10b981','#a855f7','#06b6d4','#f59e0b'];
const mouse = { x: -999, y: -999 };
let balls = [];

// Resize canvas to fill hero section
function resizeCanvas() {
  if (!canvas) return;
  const hero = document.getElementById('home');
  if (!hero) return;
  canvas.width  = hero.offsetWidth;
  canvas.height = hero.offsetHeight;
}

// Create one ball with random properties
function createBall() {
  if (!canvas) return null;
  const r = Math.random() * 8 + 4;
  return {
    x: Math.random() * (canvas.width  - r * 2) + r,
    y: Math.random() * (canvas.height - r * 2) + r,
    vx: (Math.random() - 0.5) * 1.8,
    vy: (Math.random() - 0.5) * 1.8,
    radius: r,
    color: BALL_COLORS[Math.floor(Math.random() * BALL_COLORS.length)],
    opacity: Math.random() * 0.4 + 0.5
  };
}

// Initialize 25 balls
function initBalls() {
  balls = [];
  for (let i = 0; i < 25; i++) {
    const b = createBall();
    if (b) balls.push(b);
  }
}

// Animation loop
function animateBalls() {
  if (!ctx || !canvas) return;
  requestAnimationFrame(animateBalls);
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  balls.forEach(ball => {
    // Mouse repulsion
    const dx   = ball.x - mouse.x;
    const dy   = ball.y - mouse.y;
    const dist = Math.sqrt(dx*dx + dy*dy);
    if (dist < 150 && dist > 0) {
      const force = (150 - dist) / 150;
      ball.vx += (dx / dist) * force * 0.6;
      ball.vy += (dy / dist) * force * 0.6;
    }

    // Clamp speed to prevent infinite acceleration
    const speed = Math.sqrt(ball.vx*ball.vx + ball.vy*ball.vy);
    if (speed > 3) { ball.vx = (ball.vx/speed)*3; ball.vy = (ball.vy/speed)*3; }

    // Move
    ball.x += ball.vx;
    ball.y += ball.vy;

    // Bounce off walls
    if (ball.x - ball.radius < 0)             { ball.x = ball.radius;              ball.vx = Math.abs(ball.vx); }
    if (ball.x + ball.radius > canvas.width)   { ball.x = canvas.width - ball.radius;  ball.vx = -Math.abs(ball.vx); }
    if (ball.y - ball.radius < 0)             { ball.y = ball.radius;              ball.vy = Math.abs(ball.vy); }
    if (ball.y + ball.radius > canvas.height)  { ball.y = canvas.height - ball.radius; ball.vy = -Math.abs(ball.vy); }

    // Draw glowing ball
    ctx.save();
    ctx.shadowBlur  = 18;
    ctx.shadowColor = ball.color;
    ctx.globalAlpha = ball.opacity;
    ctx.beginPath();
    ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
    ctx.fillStyle = ball.color;
    ctx.fill();
    ctx.restore();
  });

  // Draw connecting lines between nearby balls
  for (let i = 0; i < balls.length; i++) {
    for (let j = i + 1; j < balls.length; j++) {
      const a = balls[i], b = balls[j];
      const dx = a.x - b.x, dy = a.y - b.y;
      const dist = Math.sqrt(dx*dx + dy*dy);
      if (dist < 120) {
        ctx.save();
        ctx.globalAlpha = (1 - dist/120) * 0.25;
        ctx.strokeStyle = a.color;
        ctx.lineWidth   = 1;
        ctx.beginPath();
        ctx.moveTo(a.x, a.y);
        ctx.lineTo(b.x, b.y);
        ctx.stroke();
        ctx.restore();
      }
    }
  }
}

// Track mouse over canvas
if (canvas) {
  canvas.addEventListener('mousemove', e => {
    const rect = canvas.getBoundingClientRect();
    mouse.x = e.clientX - rect.left;
    mouse.y = e.clientY - rect.top;
  });
  canvas.addEventListener('mouseleave', () => { mouse.x = -999; mouse.y = -999; });
}

window.addEventListener('resize', () => { resizeCanvas(); initBalls(); });
window.addEventListener('load',   () => { resizeCanvas(); initBalls(); animateBalls(); });

/* ============================================================
   5. TYPING ANIMATION
   Cycles through role titles in the hero with typewriter effect
   ============================================================ */
const roles = [
  'Data Analyst',
  'Automation Specialist'
];
let roleIndex = 0, charIdx = 0, isDeleting = false;
const typedEl = document.getElementById('typed-role');

function typeRole() {
  if (!typedEl) return;
  const current = roles[roleIndex];
  typedEl.textContent = isDeleting
    ? current.substring(0, charIdx--)
    : current.substring(0, charIdx++);

  let delay = isDeleting ? 60 : 100;
  if (!isDeleting && charIdx > current.length)  { delay = 2000; isDeleting = true; }
  else if (isDeleting && charIdx < 0)            { isDeleting = false; charIdx = 0; roleIndex = (roleIndex+1) % roles.length; delay = 400; }
  setTimeout(typeRole, delay);
}
setTimeout(typeRole, 1500);

/* ============================================================
   6. PROJECT FILTER TABS
   Filter buttons show/hide project cards by category
   data-category on each card must match data-filter on buttons
   ============================================================ */
const filterBtns  = document.querySelectorAll('.filter-btn');
const projectCards = document.querySelectorAll('.card');

filterBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    // Update active button
    filterBtns.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');

    const filter = btn.getAttribute('data-filter');

    // Show/hide cards with smooth transition
    projectCards.forEach(card => {
      const cat = card.getAttribute('data-category') || '';
      if (filter === 'all' || cat === filter) {
        card.classList.remove('hidden');
        // Small timeout so CSS transition plays smoothly
        setTimeout(() => card.classList.remove('hiding'), 10);
      } else {
        card.classList.add('hiding');
        setTimeout(() => card.classList.add('hidden'), 300);
      }
    });
  });
});

/* ============================================================
   7. 3D TECH STACK GLOBE
   Pure canvas sphere with skill labels floating on surface.
   Auto-rotates; drag to spin manually. No Three.js needed.
   ============================================================ */
function initGlobe() {
  const gc = document.getElementById('globe-canvas');
  if (!gc) return;
  const gctx = gc.getContext('2d');

  // Set canvas dimensions
  gc.width  = gc.offsetWidth  || 500;
  gc.height = gc.offsetHeight || 300;

  const cx = gc.width  / 2;  // center X
  const cy = gc.height / 2;  // center Y
  const sr = Math.min(cx, cy) - 20; // sphere radius

  // Skills to display on the globe
  const skills = [
    'SQL','Python','Power BI','DAX','Power Automate',
    'AI Builder','SharePoint','Excel','Tableau','AWS',
    'JavaScript','C++','Node.js','Flask','MySQL','JSON'
  ];

  // Distribute points on sphere using fibonacci spiral (even distribution)
  function fibonacciSphere(n) {
    const points = [];
    const golden = Math.PI * (3 - Math.sqrt(5)); // golden angle
    for (let i = 0; i < n; i++) {
      const y     = 1 - (i / (n - 1)) * 2;       // -1 to 1
      const r     = Math.sqrt(1 - y * y);
      const theta = golden * i;
      points.push({ x: Math.cos(theta)*r, y: y, z: Math.sin(theta)*r });
    }
    return points;
  }

  const pts       = fibonacciSphere(skills.length);
  let rotY        = 0;   // auto-rotate Y angle
  let rotX        = 0.3; // slight tilt on X
  let isDragging  = false;
  let lastDragX   = 0, lastDragY = 0;
  const colors    = ['#00d4ff','#7c3aed','#f472b6','#10b981','#f59e0b','#3b82f6'];

  // Rotate a point by Y and X angles
  function rotatePoint(p) {
    // Rotate around Y axis
    const x1 = p.x * Math.cos(rotY) + p.z * Math.sin(rotY);
    const z1 = -p.x * Math.sin(rotY) + p.z * Math.cos(rotY);
    // Rotate around X axis
    const y2 = p.y * Math.cos(rotX) - z1 * Math.sin(rotX);
    const z2 = p.y * Math.sin(rotX) + z1 * Math.cos(rotX);
    return { x: x1, y: y2, z: z2 };
  }

  // Draw one frame of the globe
  function drawGlobe() {
    gctx.clearRect(0, 0, gc.width, gc.height);

    // Draw faint sphere outline
    gctx.save();
    gctx.strokeStyle = 'rgba(0,212,255,0.08)';
    gctx.lineWidth   = 1;
    gctx.beginPath();
    gctx.arc(cx, cy, sr, 0, Math.PI * 2);
    gctx.stroke();
    // Draw equator and longitude lines (very faint)
    gctx.strokeStyle = 'rgba(0,212,255,0.05)';
    gctx.beginPath(); gctx.ellipse(cx, cy, sr, sr*0.3, 0, 0, Math.PI*2); gctx.stroke();
    gctx.restore();

    // Project each skill point and collect for depth sorting
    const projected = pts.map((p, i) => {
      const r  = rotatePoint(p);
      const px = cx + r.x * sr;
      const py = cy + r.y * sr;
      // z goes from -1 (back) to +1 (front)
      const depth = r.z;
      return { px, py, depth, label: skills[i], color: colors[i % colors.length] };
    });

    // Sort back-to-front so front labels render on top
    projected.sort((a,b) => a.depth - b.depth);

    // Draw each skill label
    projected.forEach(p => {
      // Map z (-1 to 1) to opacity and size
      const t       = (p.depth + 1) / 2;          // 0 to 1
      const alpha   = 0.2 + t * 0.8;               // 0.2 to 1.0
      const fsize   = Math.round(9 + t * 6);        // 9px to 15px

      gctx.save();
      gctx.globalAlpha = alpha;
      gctx.font        = `${t > 0.5 ? '600' : '400'} ${fsize}px 'Space Grotesk', sans-serif`;
      gctx.fillStyle   = p.color;
      gctx.textAlign   = 'center';
      gctx.textBaseline = 'middle';

      // Glow for front-facing labels
      if (t > 0.6) {
        gctx.shadowBlur  = 8;
        gctx.shadowColor = p.color;
      }
      gctx.fillText(p.label, p.px, p.py);
      gctx.restore();
    });

    // Auto-rotate when not dragging
    if (!isDragging) rotY += 0.008;
    requestAnimationFrame(drawGlobe);
  }

  drawGlobe();

  // Mouse drag to manually rotate the globe
  gc.addEventListener('mousedown', e => {
    isDragging = true;
    lastDragX  = e.clientX;
    lastDragY  = e.clientY;
  });
  window.addEventListener('mousemove', e => {
    if (!isDragging) return;
    const dx = e.clientX - lastDragX;
    const dy = e.clientY - lastDragY;
    rotY += dx * 0.01;
    rotX += dy * 0.01;
    lastDragX = e.clientX;
    lastDragY = e.clientY;
  });
  window.addEventListener('mouseup', () => { isDragging = false; });

  // Touch support for mobile
  gc.addEventListener('touchstart', e => {
    isDragging = true;
    lastDragX  = e.touches[0].clientX;
    lastDragY  = e.touches[0].clientY;
  });
  gc.addEventListener('touchmove', e => {
    if (!isDragging) return;
    const dx = e.touches[0].clientX - lastDragX;
    const dy = e.touches[0].clientY - lastDragY;
    rotY += dx * 0.01;
    rotX += dy * 0.01;
    lastDragX = e.touches[0].clientX;
    lastDragY = e.touches[0].clientY;
  });
  gc.addEventListener('touchend', () => { isDragging = false; });

  // Resize globe canvas on window resize
  window.addEventListener('resize', () => {
    gc.width  = gc.offsetWidth  || 500;
    gc.height = gc.offsetHeight || 300;
  });
}

window.addEventListener('load', initGlobe);

/* ============================================================
   8. NAVBAR - Active section tracking + scroll style
   ============================================================ */
const navbar   = document.querySelector('.navbar');
const navLinks2 = document.querySelectorAll('.nav-links a');

// IntersectionObserver: highlight nav link for current section
const sectionObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const id = entry.target.getAttribute('id');
      navLinks2.forEach(link => {
        link.classList.toggle('active', link.getAttribute('href') === '#' + id);
      });
    }
  });
}, { rootMargin: '-40% 0px -55% 0px' });

document.querySelectorAll('section[id]').forEach(s => sectionObserver.observe(s));

// Change navbar appearance on scroll
window.addEventListener('scroll', () => {
  if (!navbar) return;
  if (window.scrollY > 50) {
    navbar.style.background = body.classList.contains('light-mode')
      ? 'rgba(248,250,252,0.98)'
      : 'rgba(7,7,15,0.97)';
    navbar.style.boxShadow = '0 2px 30px rgba(0,0,0,0.4)';
  } else {
    navbar.style.background = body.classList.contains('light-mode')
      ? 'rgba(248,250,252,0.9)'
      : 'rgba(7,7,15,0.85)';
    navbar.style.boxShadow = 'none';
  }
});

/* ============================================================
   9. SCROLL PROGRESS BAR
   Updates the thin gradient bar at top of page as user scrolls
   ============================================================ */
const progressBar = document.querySelector('.scroll-progress-bar');
window.addEventListener('scroll', () => {
  if (!progressBar) return;
  const scrolled = (window.scrollY / (document.body.scrollHeight - window.innerHeight)) * 100;
  progressBar.style.width = Math.min(scrolled, 100) + '%';
});

/* ============================================================
   10. SCROLL FADE-IN ANIMATIONS
   Adds .visible class to .fade-in elements when they enter view
   ============================================================ */
const fadeObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      fadeObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.1 });

document.querySelectorAll('.fade-in').forEach(el => fadeObserver.observe(el));

/* ============================================================
   11. MODAL FUNCTIONS
   Open/close project detail modals
   ============================================================ */
function openModal(id) {
  const modal = document.getElementById(id);
  if (modal) { modal.classList.add('active'); document.body.style.overflow = 'hidden'; }
}
function closeModal(id) {
  const modal = document.getElementById(id);
  if (modal) { modal.classList.remove('active'); document.body.style.overflow = ''; }
}
function closeModalOnBackdrop(event, id) {
  if (event.target === event.currentTarget) closeModal(id);
}
// Escape key closes any open modal or lightbox
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') {
    document.querySelectorAll('.modal-backdrop.active').forEach(m => m.classList.remove('active'));
    document.body.style.overflow = '';
    closeLightbox();
  }
});

/* ============================================================
   12. GALLERY THUMBNAIL SWAPPER
   Click thumbnail to update main gallery image
   ============================================================ */
function swapGallery(thumb, galleryMainId) {
  const mainDiv = document.getElementById(galleryMainId);
  if (!mainDiv) return;
  const mainImg = mainDiv.querySelector('.gallery-img');
  if (mainImg) { mainImg.src = thumb.src; mainImg.alt = thumb.alt; }
  // Update zoom button onclick
  const zoomBtn = mainDiv.querySelector('.zoom-btn');
  if (zoomBtn) zoomBtn.setAttribute('onclick', `openLightbox('${thumb.src}','${thumb.alt}')`);
  // Update active thumbnail
  const thumbsContainer = thumb.parentElement;
  thumbsContainer.querySelectorAll('.thumb').forEach(t => t.classList.remove('active'));
  thumb.classList.add('active');
}

/* ============================================================
   13. LIGHTBOX - Fullscreen image zoom
   ============================================================ */
function openLightbox(src, alt) {
  const lb    = document.getElementById('lightbox');
  const lbImg = document.getElementById('lightbox-img');
  if (!lb || !lbImg) return;
  lbImg.src = src; lbImg.alt = alt || '';
  lb.classList.add('active');
  document.body.style.overflow = 'hidden';
}
function closeLightbox() {
  const lb = document.getElementById('lightbox');
  if (lb) { lb.classList.remove('active'); document.body.style.overflow = ''; }
}

/* ============================================================
   14. 3D CARD TILT EFFECT
   Cards rotate slightly based on mouse position within card
   ============================================================ */
document.querySelectorAll('.card').forEach(card => {
  card.addEventListener('mousemove', e => {
    const rect = card.getBoundingClientRect();
    const x    = e.clientX - rect.left;
    const y    = e.clientY - rect.top;
    const cx   = rect.width  / 2;
    const cy   = rect.height / 2;
    const maxT = 8; // max tilt degrees
    const tiltX = ((y - cy) / cy) * maxT;
    const tiltY = ((cx - x) / cx) * maxT;
    card.style.transform = `perspective(800px) rotateX(${tiltX}deg) rotateY(${tiltY}deg) translateY(-6px)`;
  });
  card.addEventListener('mouseleave', () => { card.style.transform = ''; });
});

/* ============================================================
   15. SMOOTH SCROLL with navbar offset
   ============================================================ */
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', e => {
    const target = document.querySelector(anchor.getAttribute('href'));
    if (target) {
      e.preventDefault();
      const offset = 70;
      const top    = target.getBoundingClientRect().top + window.scrollY - offset;
      window.scrollTo({ top, behavior: 'smooth' });
    }
  });
});

/* ============================================================
   16. MOBILE NAV TOGGLE
   Hamburger button opens/closes nav on mobile
   ============================================================ */
const navToggle  = document.querySelector('.nav-toggle');
const navLinksEl = document.querySelector('.nav-links');
if (navToggle && navLinksEl) {
  navToggle.addEventListener('click', () => navLinksEl.classList.toggle('open'));
  navLinksEl.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => navLinksEl.classList.remove('open'));
  });
}
