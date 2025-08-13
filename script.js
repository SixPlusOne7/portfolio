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

/* -------------------------------------------------
   Modal + per-image audio + beat-synced animation
   - "dance-mode" = beat-walk (tiny zoom + moves)
   - otherwise, keep existing kb-jump Ken Burns
   ------------------------------------------------- */
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
    stopBeatWalk();                 // NEW: stop the metronome mover
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

  // --- Beat-walk engine (metronome controlled by data-bpm & data-beats) ---
  let beatTimer = null;
  let beatIndex = 0;
  let pathPoints = [];
  let beatsPerCycle = 0;

  function parsePathAttr(pathStr) {
    // data-path example: " -2,-2 ; 2,-1 ; 3,1 ; -1,2 "
    const pts = [];
    pathStr.split(/[;|]/).forEach(chunk => {
      const m = chunk.trim().match(/(-?\d+\.?\d*)\s*,\s*(-?\d+\.?\d*)/);
      if (m) pts.push([parseFloat(m[1]), parseFloat(m[2])]);
    });
    return pts;
  }

  function defaultPath(n = 8) {
    // A pleasant loop around the frame edges (percent offsets)
    const base = [
      [-2, -2], [ 2, -3], [ 3,  1], [ 1,  3],
      [-1,  2], [-3,  0], [ 2,  2], [ 0, -1]
    ];
    // Repeat or trim to requested length
    const out = [];
    for (let i = 0; i < n; i++) out.push(base[i % base.length]);
    return out;
  }

  function startBeatWalk({ bpm, beats, scale = 1.04, origin = '50% 50%' }) {
    stopBeatWalk();
    beatIndex = 0;
    beatsPerCycle = beats;

    const beatMs = 60000 / bpm;
    // Smooth step: ~40% of beat duration but capped
    const stepMs = Math.min(beatMs * 0.4, 250);

    modalContent.classList.add('beat-walk');
    modalContent.style.transformOrigin = origin;
    m
