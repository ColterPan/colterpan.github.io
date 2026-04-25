/* ============================================================
   COLTER PAN PORTFOLIO - script.js
   All interactive features: physics canvas, typing, modals,
   scroll animations, 3D tilt, lightbox, gallery
   ============================================================ */

/* ============================================================
   1. PHYSICS CANVAS ANIMATION
   Glowing balls bounce around the hero, connect with lines,
   and repel from the mouse cursor.
   ============================================================ */

const canvas = document.getElementById('physics-canvas');
const ctx = canvas.getContext('2d');

// Ball colors - cyan, purple, pink, blue, teal
const COLORS = ['#00d4ff','#7c3aed','#f472b6','#3b82f6','#10b981','#a855f7','#06b6d4'];

// Store mouse position for repulsion
const mouse = { x: -999, y: -999 };

// Array of all balls
let balls = [];

// Resize canvas to fill the hero section
function resizeCanvas() {
  const hero = document.getElementById('home');
  canvas.width = hero.offsetWidth;
  canvas.height = hero.offsetHeight;
}

// Create a single ball with random properties
function createBall() {
  const radius = Math.random() * 8 + 4; // radius 4–12
  return {
    x: Math.random() * (canvas.width - radius * 2) + radius,
    y: Math.random() * (canvas.height - radius * 2) + radius,
    vx: (Math.random() - 0.5) * 1.5,
    vy: (Math.random() - 0.5) * 1.5,
    radius: radius,
    color: COLORS[Math.floor(Math.random() * COLORS.length)],
    opacity: Math.random() * 0.4 + 0.5
  };
}

// Initialise all 25 balls
function initBalls() {
  balls = [];
  for (let i = 0; i < 25; i++) {
    balls.push(createBall());
  }
}

// Main animation loop
function animateBalls() {
  requestAnimationFrame(animateBalls);

  // Clear canvas each frame
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Update and draw each ball
  balls.forEach(ball => {
    // --- MOUSE REPULSION ---
    const dx = ball.x - mouse.x;
    const dy = ball.y - mouse.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    const repelRadius = 150;
    if (dist < repelRadius && dist > 0) {
      // Push ball away from cursor, strength increases when closer
      const force = (repelRadius - dist) / repelRadius;
      ball.vx += (dx / dist) * force * 0.5;
      ball.vy += (dy / dist) * force * 0.5;
    }

    // --- VELOCITY DAMPING (stops balls accelerating infinitely) ---
    const maxSpeed = 3;
    const speed = Math.sqrt(ball.vx * ball.vx + ball.vy * ball.vy);
    if (speed > maxSpeed) {
      ball.vx = (ball.vx / speed) * maxSpeed;
      ball.vy = (ball.vy / speed) * maxSpeed;
    }

    // --- MOVE BALL ---
    ball.x += ball.vx;
    ball.y += ball.vy;

    // --- BOUNCE OFF WALLS ---
    if (ball.x - ball.radius < 0) { ball.x = ball.radius; ball.vx = Math.abs(ball.vx); }
    if (ball.x + ball.radius > canvas.width) { ball.x = canvas.width - ball.radius; ball.vx = -Math.abs(ball.vx); }
    if (ball.y - ball.radius < 0) { ball.y = ball.radius; ball.vy = Math.abs(ball.vy); }
    if (ball.y + ball.radius > canvas.height) { ball.y = canvas.height - ball.radius; ball.vy = -Math.abs(ball.vy); }

    // --- DRAW BALL with glow ---
    ctx.save();
    ctx.shadowBlur = 18;
    ctx.shadowColor = ball.color;
    ctx.globalAlpha = ball.opacity;
    ctx.beginPath();
    ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
    ctx.fillStyle = ball.color;
    ctx.fill();
    ctx.restore();
  });

  // --- DRAW CONNECTING LINES between nearby balls ---
  const lineMaxDist = 120;
  for (let i = 0; i < balls.length; i++) {
    for (let j = i + 1; j < balls.length; j++) {
      const a = balls[i], b = balls[j];
      const dx = a.x - b.x, dy = a.y - b.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < lineMaxDist) {
        // Line opacity fades as distance increases
        const alpha = (1 - dist / lineMaxDist) * 0.25;
        ctx.save();
        ctx.globalAlpha = alpha;
        ctx.strokeStyle = a.color;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(a.x, a.y);
        ctx.lineTo(b.x, b.y);
        ctx.stroke();
        ctx.restore();
      }
    }
  }
}

// Track mouse position over the hero canvas
canvas.addEventListener('mousemove', e => {
  const rect = canvas.getBoundingClientRect();
  mouse.x = e.clientX - rect.left;
  mouse.y = e.clientY - rect.top;
});
canvas.addEventListener('mouseleave', () => {
  mouse.x = -999; mouse.y = -999;
});

// Reinitialise canvas on window resize
window.addEventListener('resize', () => {
  resizeCanvas();
  initBalls();
});

// Kick off the canvas animation on load
window.addEventListener('load', () => {
  resizeCanvas();
  initBalls();
  animateBalls();
});

/* ============================================================
   2. TYPEWRITER EFFECT
   Cycles through role titles in the hero section
   ============================================================ */
const roles = [
  'Data Analyst',
  'Automation Specialist',
  'Power BI Developer',
  'AI Builder Expert',
  'Full Stack Developer'
];
let roleIndex = 0, charIndex = 0, isDeleting = false;
const typedEl = document.getElementById('typed-role');

function typeRole() {
  const current = roles[roleIndex];
  // Add or remove one character
  if (isDeleting) {
    typedEl.textContent = current.substring(0, charIndex--);
  } else {
    typedEl.textContent = current.substring(0, charIndex++);
  }

  // Decide next timeout and direction
  let delay = isDeleting ? 60 : 100;
  if (!isDeleting && charIndex > current.length) {
    delay = 2000; // Pause before deleting
    isDeleting = true;
  } else if (isDeleting && charIndex < 0) {
    isDeleting = false;
    charIndex = 0;
    roleIndex = (roleIndex + 1) % roles.length;
    delay = 400;
  }
  setTimeout(typeRole, delay);
}

// Start typing after the hero animation finishes
setTimeout(typeRole, 1200);

/* ============================================================
   3. NAVBAR ACTIVE SECTION TRACKING
   IntersectionObserver highlights the correct nav link
   as the user scrolls through sections
   ============================================================ */
const sections = document.querySelectorAll('section[id], div[id].hero-section');
const navLinks = document.querySelectorAll('.nav-links a');

const sectionObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const id = entry.target.getAttribute('id');
      navLinks.forEach(link => {
        link.classList.toggle('active', link.getAttribute('href') === '#' + id);
      });
    }
  });
}, { rootMargin: '-40% 0px -55% 0px' });

document.querySelectorAll('section[id]').forEach(s => sectionObserver.observe(s));

/* ============================================================
   4. SCROLL FADE-IN ANIMATIONS
   Elements with class .fade-in become visible when they
   enter the viewport (adds .visible class)
   ============================================================ */
const fadeObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      fadeObserver.unobserve(entry.target); // Only animate once
    }
  });
}, { threshold: 0.1 });

document.querySelectorAll('.fade-in').forEach(el => fadeObserver.observe(el));

/* ============================================================
   5. MODAL FUNCTIONS
   Open and close project detail modals
   ============================================================ */

// Open a modal by ID, disable body scroll
function openModal(id) {
  const modal = document.getElementById(id);
  if (modal) {
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
  }
}

// Close a modal by ID, re-enable body scroll
function closeModal(id) {
  const modal = document.getElementById(id);
  if (modal) {
    modal.classList.remove('active');
    document.body.style.overflow = '';
  }
}

// Close modal only when clicking the backdrop (not the modal box itself)
function closeModalOnBackdrop(event, id) {
  if (event.target === event.currentTarget) {
    closeModal(id);
  }
}

// Close modal with Escape key
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') {
    document.querySelectorAll('.modal-backdrop.active').forEach(m => {
      m.classList.remove('active');
    });
    document.body.style.overflow = '';
    closeLightbox();
  }
});

/* ============================================================
   6. GALLERY THUMBNAIL SWAPPER
   Click a thumbnail to update the main gallery image
   ============================================================ */

// thumb: the clicked thumbnail img element
// galleryMainId: the id of the gallery-main div to update
function swapGallery(thumb, galleryMainId) {
  const mainDiv = document.getElementById(galleryMainId);
  if (!mainDiv) return;

  const mainImg = mainDiv.querySelector('.gallery-img');
  const zoomBtn = mainDiv.querySelector('.zoom-btn');

  if (mainImg) {
    mainImg.src = thumb.src;
    mainImg.alt = thumb.alt;
  }

  // Update zoom button src
  if (zoomBtn) {
    const titleAttr = zoomBtn.getAttribute('onclick');
    if (titleAttr) {
      zoomBtn.setAttribute('onclick', "openLightbox('" + thumb.src + "','" + thumb.alt + "')");
    }
  }

  // Update active class on all thumbs in same gallery
  const thumbsContainer = thumb.parentElement;
  thumbsContainer.querySelectorAll('.thumb').forEach(t => t.classList.remove('active'));
  thumb.classList.add('active');
}

/* ============================================================
   7. LIGHTBOX - Full screen image zoom
   ============================================================ */

function openLightbox(src, alt) {
  const lb = document.getElementById('lightbox');
  const lbImg = document.getElementById('lightbox-img');
  lbImg.src = src;
  lbImg.alt = alt || '';
  lb.classList.add('active');
  document.body.style.overflow = 'hidden';
}

function closeLightbox() {
  const lb = document.getElementById('lightbox');
  lb.classList.remove('active');
  document.body.style.overflow = '';
}

/* ============================================================
   8. 3D CARD TILT EFFECT
   Cards subtly rotate based on mouse position within the card
   ============================================================ */
document.querySelectorAll('.card').forEach(card => {
  card.addEventListener('mousemove', e => {
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left; // Mouse X within card
    const y = e.clientY - rect.top;  // Mouse Y within card
    const cx = rect.width / 2;       // Card center X
    const cy = rect.height / 2;      // Card center Y
    // Max tilt angle in degrees
    const maxTilt = 8;
    const tiltX = ((y - cy) / cy) * maxTilt;
    const tiltY = ((cx - x) / cx) * maxTilt;
    card.style.transform = `perspective(800px) rotateX(${tiltX}deg) rotateY(${tiltY}deg) translateY(-6px)`;
  });

  // Reset tilt on mouse leave
  card.addEventListener('mouseleave', () => {
    card.style.transform = '';
  });
});

/* ============================================================
   9. MOBILE NAVIGATION TOGGLE
   Hamburger button opens/closes nav links on mobile
   ============================================================ */
const navToggle = document.querySelector('.nav-toggle');
const navLinksEl = document.querySelector('.nav-links');

if (navToggle && navLinksEl) {
  navToggle.addEventListener('click', () => {
    navLinksEl.classList.toggle('open');
  });

  // Close mobile nav when a link is clicked
  navLinksEl.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      navLinksEl.classList.remove('open');
    });
  });
}

/* ============================================================
   10. SMOOTH SCROLL for nav links
   (CSS scroll-behavior:smooth handles most of it,
   this adds an offset to account for the fixed navbar)
   ============================================================ */
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', e => {
    const target = document.querySelector(anchor.getAttribute('href'));
    if (target) {
      e.preventDefault();
      const offset = 70; // Navbar height
      const top = target.getBoundingClientRect().top + window.scrollY - offset;
      window.scrollTo({ top, behavior: 'smooth' });
    }
  });
});

/* ============================================================
   11. NAVBAR SCROLL STYLE
   Adds a more opaque style to navbar when user scrolls down
   ============================================================ */
const navbar = document.querySelector('.navbar');
window.addEventListener('scroll', () => {
  if (window.scrollY > 50) {
    navbar.style.background = 'rgba(7,7,15,0.97)';
    navbar.style.boxShadow = '0 2px 30px rgba(0,0,0,0.5)';
  } else {
    navbar.style.background = 'rgba(7,7,15,0.85)';
    navbar.style.boxShadow = 'none';
  }
});
