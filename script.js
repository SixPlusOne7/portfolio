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
  const music = document.getElementById('
