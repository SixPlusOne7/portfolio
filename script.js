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
  // a11y
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
    stopBeatWalk(); // stop metronome walker
    modalContent.classList.remove('kenburns', 'beat-walk');
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

  // --- Beat-walk engine (metronome; supports data-step and breathing zoom) ---
  let beatTimer = null;
  let beatIndex = 0;
  let pathPoints = [];
  let beatsPerCycle = 0;
  let zoomFlip = false; // toggles min<->max scale each interval

  function parsePathAttr(pathStr) {
    // data-path example: "-2,-2; 2,-1; 3,1; -1,2"
    const pts = [];
    pathStr.split(/[;|]/).forEach(chunk => {
      const m = chunk.trim().match(/(-?\d+\.?\d*)\s*,\s*(-?\d+\.?\d*)/);
      if (m) pts.push([parseFloat(m[1]), parseFloat(m[2])]);
    });
    return pts;
  }

  function defaultPath(n = 8) {
    // Closed loop with gentle steps (last near first for smooth wrap)
    const base = [
      [-2, -2], [ 1, -3], [ 3, -1], [ 3,  2],
      [ 1,  3], [-2,  2], [-3,  0], [ -1, -1]
    ];
    const out = [];
    for (let i = 0; i < n; i++) out.push(base[i % base.length]);
    return out;
  }

  function startBeatWalk({
    bpm,
    beats,
    origin = '50% 50%',
    step = 1,
    minScale = 1.02,
    maxScale = 1.06
  }) {
    stopBeatWalk();
    beatIndex = 0;
    zoomFlip = false;
    beatsPerCycle = Math.max(1, beats);

    const beatMs = 60000 / bpm;
    const intervalMs = Math.max(beatMs * Math.max(1, step), 120); // glide duration = N beats

    modalContent.classList.add('beat-walk');
    modalContent.style.transformOrigin = origin;

    // Prime first pose without transition (avoid first-frame snap)
    const [x0, y0] = pathPoints[0] || [0, 0];
    modalContent.style.transition = 'none';
    modalContent.style.transform  = `scale(${minScale}) translate3d(${x0}%, ${y0}%, 0)`;

    // Enable transition next frame, step to point #1 over N beats (zoom -> max)
    requestAnimationFrame(() => {
      modalContent.style.transition = `transform ${intervalMs}ms linear`;
      const [x1, y1] = pathPoints[1 % pathPoints.length] || [x0, y0];
      modalContent.style.transform = `scale(${maxScale}) translate3d(${x1}%, ${y1}%, 0)`;
      beatIndex = 1;
      zoomFlip = true;
    });

    // Move one waypoint every N beats; alternate scale min<->max for "breathing"
    beatTimer = setInterval(() => {
      beatIndex = (beatIndex + 1) % beatsPerCycle;
      const [x, y] = pathPoints[beatIndex % pathPoints.length];
      const targetScale = zoomFlip ? minScale : maxScale; // toggle each interval
      zoomFlip = !zoomFlip;

      // Full-interval linear glide
      modalContent.style.transition = `transform ${intervalMs}ms linear`;
      modalContent.style.transform  = `scale(${targetScale}) translate3d(${x}%, ${y}%, 0)`;
    }, intervalMs);
  }

  function stopBeatWalk() {
    if (beatTimer) {
      clearInterval(beatTimer);
      beatTimer = null;
    }
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

      // Reset animations
      stopBeatWalk();
      modalContent.classList.remove('kenburns', 'beat-walk');

      const isArtZoom  = this.classList.contains('art-zoom');
      const isMusic    = this.classList.contains('music-trigger') && this.dataset.audio;
      const wantsDance = this.classList.contains('dance-mode'); // beat-walk vs kenburns

      // Motion / pacing from data-*
      const bpm       = Number(this.dataset.bpm   || 96);
      const beats     = Number(this.dataset.beats || 16);  // path length
      const origin    = this.dataset.origin || '50% 50%';
      const step      = Number(this.dataset.step  || 1);   // move every N beats
      const minScale  = Number(this.dataset.minscale || 1.02);
      const maxScale  = Number(this.dataset.maxscale || 1.06);

      // Optional custom path
      pathPoints = this.dataset.path ? parsePathAttr(this.dataset.path) : defaultPath(beats);
      if (!pathPoints.length) pathPoints = defaultPath(beats);

      // Keep older Ken Burns timing available for non-dance images
      const loopSeconds = (60 * beats) / bpm;
      modalContent.style.setProperty('--kb-dur', `${loopSeconds}s`);
      modalContent.style.setProperty('--kb-origin', origin);
      modalContent.style.setProperty('--kb-x1', this.dataset.kbx1 || '-1.5%');
      modalContent.style.setProperty('--kb-y1', this.dataset.kby1 || '-1.5%');
      modalContent.style.setProperty('--kb-x2', this.dataset.kbx2 || '1.5%');
      modalContent.style.setProperty('--kb-y2', this.dataset.kby2 || '1.5%');

      // Music first, then animation (to align the start)
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

      // Start the animation
      if (isArtZoom) {
        if (wantsDance) {
          startBeatWalk({ bpm, beats, origin, step, minScale, maxScale });
        } else {
          void modalContent.offsetWidth; // reflow for clean restart
          modalContent.classList.add('kenburns');
        }
      }
    });
  });

  // Video click → show video (pause music, no image animation)
  document.querySelectorAll('.media video').forEach(video => {
    video.style.cursor = 'pointer';
    video.addEventListener('click', function () {
      stopMusic(true);
      stopBeatWalk();

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
