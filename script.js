// Smooth scrolling for navigation
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        document.querySelector(this.getAttribute('href')).scrollIntoView({
            behavior: 'smooth'
        });
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

// Simple animation for project cards
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

// Image/video enlargement + per-image audio + Ken Burns animation
document.addEventListener('DOMContentLoaded', function() {
    const modal = document.createElement('div');
    modal.className = 'modal';
    
    const modalContent = document.createElement('img');
    modalContent.className = 'modal-content';
    
    const closeBtn = document.createElement('span');
    closeBtn.className = 'close';
    closeBtn.innerHTML = '&times;';
    
    modal.appendChild(closeBtn);
    modal.appendChild(modalContent);
    document.body.appendChild(modal);

    const music = document.getElementById('imageMusic');

    function stopMusic(reset = false) {
        if (!music) return;
        music.pause();
        if (reset) music.currentTime = 0;
    }

    function playTrack(src) {
        if (!music) return;
        if (music.src && music.src.endsWith(src)) {
            try { music.currentTime = 0; music.play(); } 
            catch (e) { console.warn('Unable to play audio:', e); }
            return;
        }
        try {
            music.src = src;
            music.load();
            music.play();
        } catch (e) {
            console.warn('Unable to play audio:', e);
        }
    }

    // Handle image clicks
    document.querySelectorAll('.media img').forEach(img => {
        img.style.cursor = 'pointer';
        img.addEventListener('click', function() {
            const existingVideo = modal.querySelector('video');
            if (existingVideo) existingVideo.remove();

            modalContent.src = this.src;
            modalContent.alt = this.alt || '';
            modal.appendChild(modalContent);
            modal.classList.add('show');

            // --- Ken Burns animation setup ---
            const origin = this.dataset.origin || '50% 50%';
            modalContent.style.setProperty('--kb-origin', origin);
            modalContent.style.setProperty('--kb-x1', this.dataset.kbx1 || '-3%');
            modalContent.style.setProperty('--kb-y1', this.dataset.kby1 || '-3%');
            modalContent.style.setProperty('--kb-x2', this.dataset.kbx2 || '3%');
            modalContent.style.setProperty('--kb-y2', this.dataset.kby2 || '3%');
            modalContent.classList.remove('kenburns');
            void modalContent.offsetWidth; // restart animation
            modalContent.classList.add('kenburns');
            // --- end Ken Burns ---

            // Music playback if tagged
            const track = this.dataset.audio;
            if (this.classList.contains('music-trigger') && track) {
                playTrack(track);
            } else {
                stopMusic(true);
            }
        });
    });

    // Handle video clicks
    document.querySelectorAll('.media video').forEach(video => {
        video.style.cursor = 'pointer';
        video.addEventListener('click', function() {
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

            modal.innerHTML = '';
            modal.appendChild(closeBtn);
            modal.appendChild(videoModal);
            modal.classList.add('show');

            try { videoModal.play(); } catch (_) {}
        });
    });

    // Close modal
    function closeModal() {
        modal.classList.remove('show');
        modalContent.classList.remove('kenburns');
        stopMusic();
    }

    closeBtn.addEventListener('click', closeModal);
    modal.addEventListener('click', function(e) { if (e.target === modal) closeModal(); });
    document.addEventListener('keydown', function(e) { if (e.key === 'Escape' && modal.classList.contains('show')) closeModal(); });
});

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

.kenburns {
  animation: kb-zoom-pan 18s ease-in-out infinite alternate;
}

@keyframes kb-zoom-pan {
  0%   { transform: scale(1) translate(0, 0); }
  40%  { transform: scale(1.6) translate(var(--kb-x1, -3%), var(--kb-y1, -3%)); }
  100% { transform: scale(1.6) translate(var(--kb-x2, 3%), var(--kb-y2, 3%)); }
}

