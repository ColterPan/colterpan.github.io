// ── Modal open/close ─────────────────────────────────────────

function openModal(id) {
  const modal = document.getElementById(id);
  if (!modal) return;
  modal.classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeModal(id) {
  const modal = document.getElementById(id);
  if (!modal) return;
  modal.classList.remove('open');
  document.body.style.overflow = '';
}

// Close modal when clicking the dark backdrop (not the modal box itself)
function closeModalOnBackdrop(event, id) {
  if (event.target === event.currentTarget) {
    closeModal(id);
  }
}

// Close any open modal on Escape key
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    document.querySelectorAll('.modal-backdrop.open').forEach(m => {
      m.classList.remove('open');
    });
    closeLightbox();
    document.body.style.overflow = '';
  }
});

// ── Lightbox ──────────────────────────────────────────────────

function openLightbox(src, alt) {
  const lb = document.getElementById('lightbox');
  const img = document.getElementById('lightbox-img');
  img.src = src;
  img.alt = alt || '';
  lb.classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeLightbox() {
  const lb = document.getElementById('lightbox');
  lb.classList.remove('open');
  document.body.style.overflow = '';
}

// ── Gallery thumbnail swap ────────────────────────────────────

function swapGallery(thumbEl, galleryMainId) {
  const main = document.getElementById(galleryMainId);
  if (!main) return;
  const mainImg = main.querySelector('.gallery-img');
  const zoomBtn = main.querySelector('.zoom-btn');

  if (mainImg) mainImg.src = thumbEl.src;
  if (zoomBtn) {
    zoomBtn.onclick = () => openLightbox(thumbEl.src, thumbEl.alt);
  }

  // Mark active thumb
  thumbEl.closest('.gallery-thumbs')?.querySelectorAll('.thumb')
    .forEach(t => t.classList.remove('active'));
  thumbEl.classList.add('active');
}
