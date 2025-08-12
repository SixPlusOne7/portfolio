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
    if (pageYOffset >= (sectionTop - 300)) {
      current = section.getAttribute('id');
    }
  });
  navItems.forEach(item => {
    item.classList.remove('active');
    if (item.getAttribute('href') === `#${current}`) {
      item.classList.add('active');
    }
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

// Modal + per-image audio + Ken Burns (beat-synced)
document.addEventListener('DOMContentLoaded', function () {
  // Build modal
  const modal = document.createElement('div');
  modal.className = 'modal';

  const modalContent = document.createElement('img');
  modalContent.className = 'modal-content';

  const closeBtn = document.createElement('span');
  closeBtn.className = 'close';
  closeBtn.innerHTML = '&times;';
  
  // Accessibility attributes + keyboard close support
  closeBtn.setAttribute('role', 'button');
  closeBtn.setAttribute('aria-label', 'Close image viewer');
  closeBtn.setAttribute('tabindex', '0');
  closeBtn.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') closeModal();
  });

  modal.appendChild(closeBtn);
  modal.appendChild(modalContent);
  document.body.appendChild(modal);

  // Hidden reusable audio element already in HTML:
  const music = document.getElementById('imageMusic');

  function stopMusic(reset = false) {
    if (!music) return;
    music.pause();
    if (reset) music.currentTime = 0;
  }

  function playTrack(src) {
    if (!music) return;
    try {
      // Always set; .src becomes absolute so string compare is brittle
      music.src = src;
      music.load();
      music.currentTime = 0;
      music.play();
    } catch (_) {}
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
  
      // Stop any prior animation
      modalContent.classList.remove('kenburns');
  
      // If this image should animate, set duration & path vars now
      const isArtZoom = this.classList.contains('art-zoom');
      if (isArtZoom) {
        const bpm   = Number(this.dataset.bpm || 96);
        const beats = Number(this.dataset.beats || 16);
        const loopSeconds = (60 * beats) / bpm;
        modalContent.style.setProperty('--kb-dur', `${loopSeconds}s`);
        modalContent.style.setProperty('--kb-origin', this.dataset.origin || '50% 50%');
        modalContent.style.setProperty('--kb-x1', this.dataset.kbx1 || '-3%');
        modalContent.style.setProperty('--kb-y1', this.dataset.kby1 || '-3%');
        modalContent.style.setProperty('--kb-x2', this.dataset.kbx2 || '3%');
        modalContent.style.setProperty('--kb-y2', this.dataset.kby2 || '3%');
      }
  
      // Music playback (only for .music-trigger)
      const track = this.dataset.audio;
      const isMusic = this.classList.contains('music-trigger') && track;
  
      if (isMusic) {
        try {
          // Prepare + start audio
          music.src = track;
          music.load();
          music.currentTime = 0;
          await music.play();                  // <-- wait until audio actually starts
  
          // Align animation start exactly to audio start (phase 0)
          modalContent.style.setProperty('--kb-delay', '0s');
        } catch (e) {
          // If autoplay blocked, just run animation without delay
          modalContent.style.setProperty('--kb-delay', '0s');
        }
      } else {
        // No music: no delay
        modalContent.style.setProperty('--kb-delay', '0s');
        // Also ensure silence
        stopMusic(true);
      }
  
      // Finally start the animation if needed
      if (isArtZoom) {
        void modalContent.offsetWidth; // reflow to ensure fresh start
        modalContent.classList.add('kenburns');
      }
    });
  });


      // Show image
      modalContent.src = this.src;
      modalContent.alt = this.alt || '';
      modal.classList.add('show');

      // --- Ken Burns (only for .art-zoom thumbnails) ---
      // Stop any prior animation
      modalContent.classList.remove('kenburns');

      if (this.classList.contains('art-zoom')) {
        // BPM/beat-count → duration
        const bpm   = Number(this.dataset.bpm || 96);
        const beats = Number(this.dataset.beats || 16);
        // After you compute bpm/beats and set --kb-dur:
        const beatSeconds = 60 / bpm;
        
        // Start music first (ensures we know the real start time)
        const startAndSync = async () => {
          try {
            // force (re)load + start
            music.currentTime = 0;
            await music.play();
        
            // How far into the current beat are we?
            const phase = music.currentTime % beatSeconds;
        
            // Nudge animation so its "0" aligns with the current beat edge
            modalContent.style.setProperty('--kb-delay', `-${phase}s`);
        
            // restart the animation so delay applies now
            modalContent.classList.remove('kenburns');
            void modalContent.offsetWidth;
            modalContent.classList.add('kenburns');
          } catch (e) {
            // fallback: no sync if autoplay fails
            modalContent.style.setProperty('--kb-delay', '0s');
            modalContent.classList.remove('kenburns');
            void modalContent.offsetWidth;
            modalContent.classList.add('kenburns');
          }
        };
        
        // If this image should play music + animate:
        if (this.classList.contains('music-trigger') && track) {
          // set duration before syncing
          const bpm   = Number(this.dataset.bpm || 96);
          const beats = Number(this.dataset.beats || 16);
          const loopSeconds = (60 * beats) / bpm;
          modalContent.style.setProperty('--kb-dur', `${loopSeconds}s`);
        
          await startAndSync();  // phase align to audio
        } else {
          // no music: no delay, just run animation if art-zoom
          modalContent.style.setProperty('--kb-delay', '0s');
          modalContent.classList.remove('kenburns');
          void modalContent.offsetWidth;
          modalContent.classList.add('kenburns');
        }

        modalContent.style.setProperty('--kb-dur', `${loopSeconds}s`);

        // Optional per-image origin/path overrides
        modalContent.style.setProperty('--kb-origin', this.dataset.origin || '50% 50%');
        modalContent.style.setProperty('--kb-x1', this.dataset.kbx1 || '-3%');
        modalContent.style.setProperty('--kb-y1', this.dataset.kby1 || '-3%');
        modalContent.style.setProperty('--kb-x2', this.dataset.kbx2 || '3%');
        modalContent.style.setProperty('--kb-y2', this.dataset.kby2 || '3%');

        // Restart animation cleanly
        void modalContent.offsetWidth;   // reflow
        modalContent.classList.add('kenburns');
      }

      // --- Music playback (only for .music-trigger) ---
      const track = this.dataset.audio;
      if (this.classList.contains('music-trigger') && track) {
        playTrack(track);
      } else {
        stopMusic(true);
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

      // Clear modal content (but keep the close button)
      modal.innerHTML = '';
      modal.appendChild(closeBtn);
      modal.appendChild(videoModal);
      modal.classList.add('show');

      try { videoModal.play(); } catch (_) {}
    });
  });

  // --- Close modal helpers ---
  function closeModal() {
    modal.classList.remove('show');
    modalContent.classList.remove('kenburns'); // stop animation
    stopMusic();
    // Ensure img element is in the modal for next time
    if (!modal.contains(modalContent)) modal.appendChild(modalContent);
  }

  closeBtn.addEventListener('click', closeModal);
  modal.addEventListener('click', (e) => {
    if (e.target === modal) closeModal();
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal.classList.contains('show')) closeModal();
  });
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
