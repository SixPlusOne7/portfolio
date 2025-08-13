// ==============================
// Smooth scrolling for navigation
// ==============================
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function (e) {
    const target = document.querySelector(this.getAttribute('href'));
    if (!target) return;
    e.preventDefault();
    target.scrollIntoView({ behavior: 'smooth' });
  });
});

// ==================================
// Highlight active section in navbar
// ==================================
const sections = document.querySelectorAll('section');
const navItems = document.querySelectorAll('#navbar a');

window.addEventListener('scroll', () => {
  let current = '';
  sections.forEach(section => {
    const top = section.offsetTop;
    if (pageYOffset >= (top - 300)) current = section.getAttribute('id');
  });
  navItems.forEach(item => {
    item.classList.toggle('active', item.getAttribute('href') === `#${current}`);
  });
});

// =======================
// Card intro reveal anim.
// =======================
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

// ======================================================
// Modal + per-image audio + beat-synced Ken Burns glide
// + subtle on-beat pulse (no jumpy keyframes)
// ======================================================
document.addEventListener('DOMContentLoaded', function () {
  // Build modal once
  const modal = document.createElement('div');
  modal.className = 'modal';

  const modalContent = document.createElement('img');
  modalContent.className = 'modal-content';

  // Wrapper to carry the on-beat pulse (glide stays on the <img>)
  const beatWrap = document.createElement('div');
  beatWrap.className = 'kb-beat-wrap';
  beatWrap.appendChild(modalContent);

  const closeBtn = document.createElement('span');
  closeBtn.className = 'close';
  closeBtn.innerHTML = '&times;';
  // a11y
  closeBtn.setAttribute('role', 'button');
  closeBtn.setAttribute('aria-label', 'Close image viewer');
  closeBtn.setAttribute('tabindex', '0');

  modal.appendChild(closeBtn);
  modal.appendChild(beatWrap);
  document.body.appendChild(modal);

  // Prevent background scroll while modal is open
  function lockScroll()   { document.body.style.overflow = 'hidden'; }
  function unlockScroll() { document.body.style.overflow = ''; }

  // Hidden reusable audio element (must be in HTML)
  const music = document.getElementById('imageMusic');

  function stopMusic(reset = false) {
    if (!music) return;
    music.pause();
    if (reset) music.currentTime = 0;
    beatWrap.classList.remove('beating'); // stop the pulse if audio stops
  }

  // -----------------------------
  // Image click -> open modal
  // -----------------------------
  document.querySelectorAll('.media img').forEach(img => {
    img.style.cursor = 'pointer';
    img.addEventListener('click', async function () {
      // If a video was open, restore the image wrapper
      const existingVideo = modal.querySelector('video');
      if (existingVideo) {
        existingVideo.remove();
        if (!modal.contains(beatWrap)) modal.appendChild(beatWrap);
      }

      // Show image
      modalContent.src = this.src;
      modalContent.alt = this.alt || '';
      modal.classList.add('show');
      lockScroll();

      // Reset previous animation state
      modalContent.classList.remove('kenburns');

      // Determine behaviors
      const isArtZoom = this.classList.contains('art-zoom');
      const track     = this.dataset.audio;
      const isMusic   = this.classList.contains('music-trigger') && track;

      // --- Ken Burns duration from BPM × beats (longer beats = slower) ---
      if (isArtZoom) {
        const bpm   = Number(this.dataset.bpm || 96);   // per-image tempo
        const beats = Number(this.dataset.beats || 64); // default slow phrase
        const loopSeconds = (60 * beats) / bpm;
        modalContent.style.setProperty('--kb-dur', `${loopSeconds}s`);

        // Optional: origin override
        modalContent.style.setProperty('--kb-origin', this.dataset.origin || '50% 50%');

        // Set the beat pulse duration on wrapper (ms per beat)
        const beatMs = Math.round(60000 / bpm);
        beatWrap.style.setProperty('--beat-dur', `${beatMs}ms`);
      }

      // --- Start audio first, then animation so they begin together ---
      if (isMusic) {
        try {
          music.src = track;
          music.load();
          music.currentTime = 0;
          await music.play();                           // ensure audio actually starts
          modalContent.style.setProperty('--kb-delay', '0s');
          beatWrap.classList.add('beating');            // enable on-beat pulse
        } catch {
          // If autoplay blocked, still run the glide (no pulse)
          modalContent.style.setProperty('--kb-delay', '0s');
          beatWrap.classList.remove('beating');
        }
      } else {
        // No music for this image
        stopMusic(true);
        modalContent.style.setProperty('--kb-delay', '0s');
        beatWrap.classList.remove('beating');
      }

      // Start the continuous glide (no per-beat jumps)
      if (isArtZoom) {
        void modalContent.offsetWidth; // reflow to restart cleanly
        modalContent.classList.add('kenburns');
      }
    });
  });

  // -----------------------------
  // Video click -> show video
  // -----------------------------
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

      // Swap modal content to the video (keep close button)
      modal.innerHTML = '';
      modal.appendChild(closeBtn);
      modal.appendChild(videoModal);
      modal.classList.add('show');
      lockScroll();

      try { videoModal.play(); } catch {}
    });
  });

  // -----------------------------
  // Close modal helpers
  // -----------------------------
  function closeModal() {
    modal.classList.remove('show');
    modalContent.classList.remove('kenburns');
    beatWrap.classList.remove('beating');
    stopMusic(); // pause audio too
    if (!modal.contains(beatWrap)) modal.appendChild(beatWrap);
    unlockScroll();
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

  // Optional debug in console:
  window.__kbDebug = (bpm, beats) =>
    console.log('[KenBurns]', { bpm, beats, seconds: (60 * beats) / bpm });
});

// ==========================
// Lazy code viewer (optional)
// ==========================
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
