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

// Image/video enlargement + per-image audio
document.addEventListener('DOMContentLoaded', function() {
    // Create modal elements
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

    // Reused hidden audio element
    const music = document.getElementById('imageMusic');

    function stopMusic(reset = false) {
        if (!music) return;
        music.pause();
        if (reset) music.currentTime = 0;
    }

    function playTrack(src) {
        if (!music) return;
        // If same track, restart; if different, swap then play
        if (music.src && music.src.endsWith(src)) {
            try {
                music.currentTime = 0;
                music.play();
            } catch (e) { console.warn('Unable to play audio:', e); }
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

    // Handle image clicks (show modal; optionally play per-image audio)
    document.querySelectorAll('.media img').forEach(img => {
        img.style.cursor = 'pointer';
        img.addEventListener('click', function() {
            // If modal currently shows a video, clear it
            const existingVideo = modal.querySelector('video');
            if (existingVideo) existingVideo.remove();

            // Show image in modal
            modalContent.src = this.src;
            modalContent.alt = this.alt || '';
            modal.appendChild(modalContent);
            modal.classList.add('show');

            // ONLY play if image is tagged
            const track = this.dataset.audio;   // reads data-audio
            if (this.classList.contains('music-trigger') && track) {
                playTrack(track);
            } else {
                // Ensure no music for non-tagged images
                stopMusic(true);
            }
        });
    });

    // Handle video clicks (pause music; show video in modal)
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

    // Close modal: X
    closeBtn.addEventListener('click', function() {
        modal.classList.remove('show');
        stopMusic();
    });

    // Close modal: click backdrop
    modal.addEventListener('click', function(e) {
        if (e.target === modal) {
            modal.classList.remove('show');
            stopMusic();
        }
    });

    // Close modal: ESC
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && modal.classList.contains('show')) {
            modal.classList.remove('show');
            stopMusic();
        }
    });
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
