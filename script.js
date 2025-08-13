// Smooth scrolling for navigation
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function (e) {
    e.preventDefault();
    document.querySelector(this.getAttribute('href')).scrollIntoView({ behavior: 'smooth' });
  });
});

// Highlight active section in navbar
const sections = document.querySelectorAll('section');
const navItems = document.querySelectorAll('#navbar a');

window.addEventListener('scroll', () => {
  let current = '';
  sections.forEach(section => {
    const sectionTop = section.offsetTop;
    if (pageYOffset >= (sectionTop - 300)) current = section.getAttribute('id');
  });
  navItems.forEach(item => {
    item.classList.toggle('active', item.getAttribute('href') === `#${current}`);
  });
});

// Card intro animation
const projectCards = document.querySelectorAll('.project-card');
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.style.opacity = 1;
      entry.target.style.transform = 'translateY(0)';
    }
  });
}, { threshold: 0.1 });

projectCards.forEach(card => {
  card.style.opacity = 0;
  card.style.transform = 'translateY(20px)';
  card.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
  observer.observe(card);
});

// ------------------------
// Modal + per-image audio + beat-synced Ken Burns (continuous, no per-beat jumps)
// ------------------------
document.addEventListener('DOMContentLoaded', function () {
  // Build modal once
  const modal = document.createElement('div');
  modal.className = 'modal';

  const modalContent = document.createElement('img');
  modalContent.className = 'modal-content';

  const closeBtn = document.createElement('span');
  closeBtn.className = 'close';
  closeBtn.innerHTML = '&times;';
  // a11y for keyboard users
  closeBtn.setAttribute('role', 'button');
  closeBtn.setAttribute('aria-label', 'Close image viewer');
  closeBtn.setAttribute('tabindex', '0');

  modal.appendChild(closeBtn);
  modal.appendChild(modalContent);
  document.body.appendChild(modal);

  // Prevent background scroll while modal is open
  function openModal() { document.body.style.overflow = 'hidden'; }
  function _closeModalOnly() {
    modal.classList.remove('show');
    modalContent.classList.remove('kenburns'); // stop animation
    if (!modal.contains(modalContent)) modal.appendChild(modalContent);
    document.body.style.overflow = ''; // restore
  }

  // Hidden reusable audio element (must exist in HTML)
  const music = document.getElementById('imageMusic');

  function stopMusic(reset = false) {
    if (!music) return;
    music.pause();
    if (reset) music.currentTime = 0;
  }

  // Image click → open modal (animate only if .art-zoom)
  document.querySelectorAll('.media img').forEach(img => {
    img.style.cursor = 'pointer';
    img.addEventListener('click', async function () {
      // If modal currently shows a video, clear it and restore img holder
      const existingVideo = modal.querySelector('video');
      if (existingVideo) { existingVideo.remove(); modal.appendChild(modalContent); }

      // Show image
      modalContent.src = this.src;
      modalContent.alt = this.alt || '';
      modal.classList.add('show');
      openModal();

      // Stop any prior animation
      modalContent.classList.remove('kenburns');

      // Determine behaviors
      const isArtZoom = this.classList.contains('art-zoom');
      const track = this.dataset.audio;
      const isMusic = this.classList.contains('music-trigger') && track;

      // --- Ken Burns duration from BPM × beats (slower = bigger beats) ---
      if (isArtZoom) {
        const bpm   = Number(this.dataset.bpm || 96);      // per-image tempo (override in HTML)
        const beats = Number(this.dataset.beats || 64);     // default to a slow 64-beat loop
        const loopSeconds = (60 * beats) / bpm;
        modalContent.style.setProperty('--kb-dur', `${loopSeconds}s`);

        // Optional path/origin (safe defaults)
        modalContent.style.setProperty('--kb-origin', this.dataset.origin || '50% 50%');
      }

      // --- Start audio first, then animation (so they begin together) ---
      if (isMusic) {
        try {
          music.src = track;
          music.load();
          music.currentTime = 0;
          await music.play(); // wait until audio actually starts
          // align animation phase with audio start
          modalContent.style.setProperty('--kb-delay', '0s');
        } catch (_) {
          modalContent.style.setProperty('--kb-delay', '0s');
        }
      } else {
        // No music for this image
        stopMusic(true);
        modalContent.style.setProperty('--kb-delay', '0s');
      }

      // Finally start the animation (continuous – no per-beat jumps)
      if (isArtZoom) {
        void modalContent.offsetWidth; // reflow for clean restart
        modalContent.classList.add('kenburns');
      }
    });
  });

  // Video click → show video (pause music, no Ken Burns)
  document.querySelectorAll('.media video').forEach(video => {
    video.style.cursor = 'pointer';
    video.addEventListener('click', function () {
      stopMusic(true);

      const videoModal = document.createElement('video');
      videoModal.className = 'modal-video';
      videoModal.controls = true;

      const sourceEl = this.querySelector('source');
      if (sourceEl) {
        const source = document.createElement('source');
        source.src = sourceEl.src;
        source.type = sourceEl.type || 'video/mp4';
        videoModal.appendChild(source);
      }

      // Clear modal content (keep close button)
      modal.innerHTML = '';
      modal.appendChild(closeBtn);
      modal.appendChild(videoModal);
      modal.classList.add('show');
      openModal();

      try { videoModal.play(); } catch (_) {}
    });
  });

  // --- Close modal helpers ---
  function closeModal() {
    _closeModalOnly();
    stopMusic(); // pause audio too
  }

  closeBtn.addEventListener('click', closeModal);
  closeBtn.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') closeModal();
  });
  modal.addEventListener('click', (e) => {
    if (e.target === modal) closeModal();
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal.classList.contains('show')) closeModal();
  });

  // Debug helper: inspect computed duration when you click
  window.__kbDebug = (bpm, beats) => console.log('[KenBurns]', { bpm, beats, seconds: (60*beats)/bpm });
});
