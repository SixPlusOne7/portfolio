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
        const sectionHeight = section.clientHeight;
        
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

// Image enlargement functionality
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
    
    // Handle image clicks
    document.querySelectorAll('.media img').forEach(img => {
        img.style.cursor = 'pointer';
        img.addEventListener('click', function() {
            modalContent.src = this.src;
            modalContent.alt = this.alt;
            modal.classList.add('show');
        });
    });
    
    // Handle video clicks (if you want videos to enlarge too)
    document.querySelectorAll('.media video').forEach(video => {
        video.style.cursor = 'pointer';
        video.addEventListener('click', function() {
            // Create video element for modal
            const videoModal = document.createElement('video');
            videoModal.className = 'modal-video';
            videoModal.controls = true;
            
            const source = document.createElement('source');
            source.src = this.querySelector('source').src;
            source.type = 'video/mp4';
            
            videoModal.appendChild(source);
            
            // Clear previous content and add video
            modal.innerHTML = '';
            modal.appendChild(closeBtn);
            modal.appendChild(videoModal);
            modal.classList.add('show');
        });
    });
    
    // Close modal
    closeBtn.addEventListener('click', function() {
        modal.classList.remove('show');
    });
    
    // Close when clicking outside content
    modal.addEventListener('click', function(e) {
        if (e.target === modal) {
            modal.classList.remove('show');
        }
    });
    
    // Close with ESC key
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && modal.classList.contains('show')) {
            modal.classList.remove('show');
        }
    });
});

function escapeHTML(str) {
    return str.replace(/&/g, '&amp;')
              .replace(/</g, '&lt;')
              .replace(/>/g, '&gt;')
              .replace(/"/g, '&quot;')
              .replace(/'/g, '&#039;');
}

function loadCode(filename) {
    const pre = document.getElementById('code-' + filename);
    if (pre.style.display === 'none') {
        fetch('code/' + filename)
            .then(res => {
                if (!res.ok) {
                    throw new Error(`File not found: ${filename}`);
                }
                return res.text();
            })
            .then(data => {
                pre.innerHTML = escapeHTML(data);
                pre.style.display = 'block';
            })
            .catch(err => {
                pre.innerHTML = `<span style="color:red;">Error loading file: ${err.message}</span>`;
                pre.style.display = 'block';
            });
    } else {
        pre.style.display = 'none';
    }
}
