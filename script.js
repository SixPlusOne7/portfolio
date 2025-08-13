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
// Modal + per-image audio + beat-synced animation
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
  closeBtn.setAttribute('role', 'button');
  closeBtn.setAttribute('aria-label', 'Close image viewer');
  closeBtn.setAttribute('tabindex', '0');

  modal.appendChild(closeBtn);
  modal.appendChild(modalContent);
  document.body.appendChild(modal);

  // prevent background scroll while open
  function openModal() { document.body.style.overflow = 'hidden'; }
  function _closeModalOnly() {
    modal.classList.remove('show');
    // stop animations
    modalContent.classList.remove('kenburns', 'beat-dance');
    // restore img holder if video had replaced it
    if (!modal.contains(modalContent)) modal.appendChild(modalContent);
    document.body.style.overflow = '';
  }

  // Hidden reusable audio element (already in HTML)
  const music = document.getElementById('imageMusic');

  function stopMusic(reset = false) {
    if (!music) return;
    music.pause();
    if (reset) music.currentTime = 0;
  }

  // Image click → open modal (animate if .art-zoom); play audio if .music-trigger + data-audio
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

      // Remove any previous animations before starting fresh
      modalContent.classList.remove('kenburns', 'beat-dance');

      const isArtZoom = this.classList.contains('art-zoom');
      const isMusic   = this.classList.contains('music-trigger') && this.dataset.audio;
      const wantsDance = this.classList.contains('dance-mode'); // NEW toggle

      // Set motion parameters (used by both modes)
      if (isArtZoom) {
        const bpm   = Number(this.dataset.bpm || 96);
        const beats = Number(this.dataset.beats || 16);
        const loopSeconds = (60 * beats) / bpm;
        const beatDuration = 60 / bpm;

        // shared CSS vars
        modalContent.style.setProperty('--kb-dur', `${loopSeconds}s`);
        modalContent.style.setProperty('--beat-dur', `${beatDuration}s`);
        modalContent.style.setProperty('--kb-origin', this.dataset.origin || '50% 50%');
        modalContent.style.setProperty('--kb-x1', this.dataset.kbx1 || '-1.5%');
        modalContent.style.setProperty('--kb-y1', this.dataset.kby1 || '-1.5%');
        modalContent.style.setProperty('--kb-x2', this.dataset.kbx2 || '1.5%');
        modalContent.style.setProperty('--kb-y2', this.dataset.kby2 || '1.5%');
      }

      // Start music first so animation lines up
      if (isMusic) {
        try {
          music.src = this.dataset.audio;
          music.load();
          music.currentTime = 0;
          await music.play();
          modalContent.style.setProperty('--kb-delay', '0s');
        } catch (_) {
          modalContent.style.setProperty('--kb-delay', '0s');
        }
      } else {
        stopMusic(true);
        modalContent.style.setProperty('--kb-delay', '0s');
      }

      // Start animation
      if (isArtZoom) {
        void modalContent.offsetWidth; // reflow for clean restart
        if (wantsDance) {
          modalContent.classList.add('beat-dance'); // beat pulse
        } else {
          modalContent.classList.add('kenburns');   // jumpy Ken Burns
        }
      }
    });
  });

  // Video click → show video (pause music, no Ken Burns / no beat dance)
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

  // Expose for debugging if needed:
  window.__modal = { modal, modalContent, closeBtn };
});

// Lazy code viewer
function loadCode(filename) {
  const pre = document.getElementById('code-' + filename);
  if (pre.style.display === 'none') {
    fetch('code/' + filename)
      .then(res => res.text())
      .then(data => {
        pre.textContent = data;
        pre.style.display = 'block';
      });
  } else {
    pre.style.display = 'none';
  }
}
