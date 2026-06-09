document.addEventListener('DOMContentLoaded', () => {
  // Initialize general scripts
  initHeader();
  initMobileMenu();
  initCanvasParticles();
  initScrollAnimations();
  initSpotlightGlow();
  initTimelineExpansion();
  initCertificatesGallery();
  initContactForm();
});

/* --- HEADER ON SCROLL --- */
function initHeader() {
  const header = document.querySelector('header');
  window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
  });
}

/* --- MOBILE MENU NAVIGATION --- */
function initMobileMenu() {
  const menuBtn = document.querySelector('.mobile-menu-btn');
  const nav = document.querySelector('nav');
  
  if (menuBtn && nav) {
    menuBtn.addEventListener('click', () => {
      nav.classList.toggle('active');
      const isExpanded = nav.classList.contains('active');
      menuBtn.innerHTML = isExpanded ? '<i class="fas fa-times"></i>' : '<i class="fas fa-bars"></i>';
    });

    // Close menu when clicking link
    const navLinks = nav.querySelectorAll('a');
    navLinks.forEach(link => {
      link.addEventListener('click', () => {
        nav.classList.remove('active');
        menuBtn.innerHTML = '<i class="fas fa-bars"></i>';
      });
    });
  }
}

/* --- CANVAS INTERACTIVE PARTICLES --- */
function initCanvasParticles() {
  const canvas = document.getElementById('particles-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  let particlesArray = [];
  const numberOfParticles = 70;
  let mouse = { x: null, y: null, radius: 150 };

  // Track mouse coordinates
  window.addEventListener('mousemove', (e) => {
    mouse.x = e.x;
    mouse.y = e.y;
  });

  window.addEventListener('mouseout', () => {
    mouse.x = null;
    mouse.y = null;
  });

  // Adjust canvas size
  function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    particlesArray.forEach(p => p.clampPosition());
  }
  window.addEventListener('resize', resizeCanvas);
  resizeCanvas();

  // Particle Blueprint
  class Particle {
    constructor() {
      this.x = Math.random() * canvas.width;
      this.y = Math.random() * canvas.height;
      this.size = Math.random() * 2 + 1; // particle size
      this.speedX = (Math.random() - 0.5) * 0.5;
      this.speedY = (Math.random() - 0.5) * 0.5;
      this.baseX = this.x;
      this.baseY = this.y;
    }

    draw() {
      ctx.fillStyle = 'rgba(56, 189, 248, 0.4)';
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
      ctx.closePath();
      ctx.fill();
    }

    update() {
      // Float movement
      this.x += this.speedX;
      this.y += this.speedY;

      // Bounce off borders
      if (this.x > canvas.width || this.x < 0) this.speedX = -this.speedX;
      if (this.y > canvas.height || this.y < 0) this.speedY = -this.speedY;

      // Mouse interactive repelling force
      if (mouse.x != null && mouse.y != null) {
        let dx = mouse.x - this.x;
        let dy = mouse.y - this.y;
        let distance = Math.hypot(dx, dy);
        
        if (distance < mouse.radius) {
          const force = (mouse.radius - distance) / mouse.radius;
          const directionX = dx / distance;
          const directionY = dy / distance;
          
          this.x -= directionX * force * 2;
          this.y -= directionY * force * 2;
        }
      }
    }

    clampPosition() {
      if (this.x > canvas.width) this.x = canvas.width;
      if (this.y > canvas.height) this.y = canvas.height;
    }
  }

  // Create particles list
  function initParticles() {
    particlesArray = [];
    for (let i = 0; i < numberOfParticles; i++) {
      particlesArray.push(new Particle());
    }
  }
  initParticles();

  // Draw lines between nearby nodes
  function drawLines() {
    let opacityValue = 1;
    for (let a = 0; a < particlesArray.length; a++) {
      for (let b = a; b < particlesArray.length; b++) {
        let dx = particlesArray[a].x - particlesArray[b].x;
        let dy = particlesArray[a].y - particlesArray[b].y;
        let distance = Math.hypot(dx, dy);

        if (distance < 110) {
          opacityValue = 1 - (distance / 110);
          ctx.strokeStyle = `rgba(56, 189, 248, ${opacityValue * 0.12})`;
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(particlesArray[a].x, particlesArray[a].y);
          ctx.lineTo(particlesArray[b].x, particlesArray[b].y);
          ctx.stroke();
        }
      }
    }
  }

  // Loop
  function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    particlesArray.forEach(p => {
      p.update();
      p.draw();
    });
    drawLines();
    requestAnimationFrame(animate);
  }
  animate();
}

/* --- SCROLL ANIMATIONS & COUNTERS --- */
function initScrollAnimations() {
  const elements = document.querySelectorAll('.scroll-animate');
  const statsSection = document.getElementById('stats');
  let statsStarted = false;

  const observerOptions = {
    threshold: 0.15,
    rootMargin: '0px 0px -50px 0px'
  };

  // Fade animations observer
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('animated');
        observer.unobserve(entry.target);
      }
    });
  }, observerOptions);

  elements.forEach(el => observer.observe(el));

  // Count up observer
  if (statsSection) {
    const statsObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting && !statsStarted) {
          statsStarted = true;
          animateStats();
          statsObserver.unobserve(statsSection);
        }
      });
    }, { threshold: 0.3 });

    statsObserver.observe(statsSection);
  }

  function animateStats() {
    const counters = document.querySelectorAll('.stat-num');
    counters.forEach(counter => {
      const target = parseFloat(counter.getAttribute('data-target'));
      const suffix = counter.getAttribute('data-suffix') || '';
      const duration = 2000; // 2 seconds
      const startTime = performance.now();
      const isFloat = counter.getAttribute('data-type') === 'float';

      function updateCounter(currentTime) {
        const elapsedTime = currentTime - startTime;
        const progress = Math.min(elapsedTime / duration, 1);
        
        // Easing function outQuad
        const easeProgress = progress * (2 - progress);
        let currentVal = easeProgress * target;

        if (isFloat) {
          counter.textContent = currentVal.toFixed(1) + suffix;
        } else {
          counter.textContent = Math.floor(currentVal) + suffix;
        }

        if (progress < 1) {
          requestAnimationFrame(updateCounter);
        } else {
          counter.textContent = (isFloat ? target.toFixed(1) : Math.floor(target)) + suffix;
        }
      }

      requestAnimationFrame(updateCounter);
    });
  }
}

/* --- CARDS SPOTLIGHT RADIAL HOVER --- */
function initSpotlightGlow() {
  const cards = document.querySelectorAll('.skills-card, .achievement-card');
  
  cards.forEach(card => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      card.style.setProperty('--mouse-x', `${x}px`);
      card.style.setProperty('--mouse-y', `${y}px`);
    });
  });
}

/* --- INTERACTIVE JOURNEY TIMELINE --- */
function initTimelineExpansion() {
  const items = document.querySelectorAll('.timeline-item');
  items.forEach(item => {
    item.addEventListener('click', () => {
      const isActive = item.classList.contains('active');
      
      // Close all other items
      items.forEach(el => el.classList.remove('active'));
      
      // Toggle current
      if (!isActive) {
        item.classList.add('active');
      }
    });
  });
}

/* --- CERTIFICATES GALLERY & MOCK UPLOAD & LIGHTBOX --- */
function initCertificatesGallery() {
  const filters = document.querySelectorAll('.filter-btn');
  const grid = document.querySelector('.gallery-grid');
  const lightbox = document.getElementById('lightbox-modal');
  const lightboxImg = lightbox.querySelector('.lightbox-view');
  const lightboxTitle = lightbox.querySelector('.lightbox-title');
  const lightboxClose = lightbox.querySelector('.lightbox-close');
  
  const uploadPanel = document.getElementById('upload-panel');
  const fileInput = document.getElementById('cert-file-input');

  // Filtering cards
  filters.forEach(btn => {
    btn.addEventListener('click', () => {
      filters.forEach(f => f.classList.remove('active'));
      btn.classList.add('active');
      
      const filterValue = btn.getAttribute('data-filter');
      const cards = grid.querySelectorAll('.cert-card');
      
      cards.forEach(card => {
        if (filterValue === 'all' || card.getAttribute('data-category') === filterValue) {
          card.style.display = 'flex';
          // Little animation trigger
          card.style.opacity = '0';
          setTimeout(() => { card.style.opacity = '1'; }, 50);
        } else {
          card.style.display = 'none';
        }
      });
    });
  });

  // Lightbox implementation
  function setupLightboxTriggers() {
    const previewTriggers = document.querySelectorAll('.cert-preview-trigger');
    previewTriggers.forEach(trigger => {
      // Avoid duplicate listeners
      trigger.removeEventListener('click', openLightbox);
      trigger.addEventListener('click', openLightbox);
    });
  }

  function openLightbox(e) {
    e.preventDefault();
    const card = e.target.closest('.cert-card');
    const title = card.querySelector('h4').textContent;
    const isMock = card.hasAttribute('data-mock-img');
    
    lightboxTitle.textContent = title;
    
    if (isMock) {
      lightboxImg.src = card.getAttribute('data-mock-img');
      lightboxImg.style.display = 'block';
      // Remove any generated SVG inside lightbox
      const oldSvg = lightbox.querySelector('.svg-blueprint-lightbox');
      if (oldSvg) oldSvg.remove();
    } else {
      // Clone vector SVG for lightbox preview
      const svg = card.querySelector('.cert-blueprint-svg').cloneNode(true);
      svg.classList.add('svg-blueprint-lightbox');
      svg.style.width = '100%';
      svg.style.height = 'auto';
      svg.style.maxWidth = '500px';
      svg.style.stroke = '#38BDF8';
      svg.style.strokeWidth = '1.5';
      
      lightboxImg.style.display = 'none';
      const container = lightbox.querySelector('.lightbox-content');
      
      // Clean previous SVG
      const oldSvg = container.querySelector('.svg-blueprint-lightbox');
      if (oldSvg) oldSvg.remove();
      
      container.insertBefore(svg, lightboxTitle);
    }
    
    lightbox.classList.add('active');
  }

  // Close Lightbox
  lightboxClose.addEventListener('click', () => lightbox.classList.remove('active'));
  lightbox.addEventListener('click', (e) => {
    if (e.target === lightbox) lightbox.classList.remove('active');
  });

  setupLightboxTriggers();

  // Mock Upload Mechanics
  if (uploadPanel && fileInput) {
    uploadPanel.addEventListener('click', () => fileInput.click());
    
    fileInput.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = function(event) {
        // Create new Certificate card
        const card = document.createElement('div');
        card.className = 'cert-card glass-panel scroll-animate animated';
        card.setAttribute('data-category', 'engineering'); // Default category
        card.setAttribute('data-mock-img', event.target.result);

        card.innerHTML = `
          <div class="cert-thumb">
            <img src="${event.target.result}" style="width: 100%; height: 100%; object-fit: cover;" alt="${file.name}">
            <div class="cert-overlay">
              <a href="#" class="cert-preview-trigger"><i class="fas fa-search-plus"></i></a>
            </div>
          </div>
          <div class="cert-info">
            <div>
              <div class="cert-category">Engineering</div>
              <h4>${file.name.replace(/\.[^/.]+$/, "")}</h4>
              <p class="cert-issuer">User Uploaded File</p>
            </div>
          </div>
        `;

        // Prepend to grid
        grid.insertBefore(card, grid.firstChild);
        
        // Re-setup lightbox triggers for new elements
        setupLightboxTriggers();
        
        // Alert user
        alert('Certificate uploaded successfully as a mock preview!');
      };
      
      if (file.type.startsWith('image/')) {
        reader.readAsDataURL(file);
      } else {
        // Fallback for PDFs or other documents
        const dummyUrl = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="300" height="200" viewBox="0 0 300 200"><rect width="100%" height="100%" fill="%230F172A"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" fill="%2338BDF8" font-family="monospace" font-size="14">PDF DOCUMENT PREVIEW</text></svg>';
        const eventMock = { target: { result: dummyUrl } };
        reader.onload(eventMock);
        reader.readAsText(file); // trigger onload
      }
    });
  }
}

/* --- CONTACT FORM VALIDATION & HANDLING --- */
function initContactForm() {
  const form = document.getElementById('contact-form');
  const status = document.getElementById('form-status');
  
  if (form && status) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      
      const name = document.getElementById('user-name').value.trim();
      const email = document.getElementById('user-email').value.trim();
      const message = document.getElementById('user-message').value.trim();
      
      // Reset status
      status.className = 'form-status';
      status.textContent = '';
      
      if (!name || !email || !message) {
        status.textContent = 'Please fill in all details.';
        status.classList.add('error');
        return;
      }
      
      if (!validateEmail(email)) {
        status.textContent = 'Please enter a valid email address.';
        status.classList.add('error');
        return;
      }

      // Mock submit
      const submitBtn = form.querySelector('.submit-btn');
      const originalText = submitBtn.innerHTML;
      submitBtn.disabled = true;
      submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Transmission Active...';

      setTimeout(() => {
        status.textContent = 'Message securely transmitted. Thank you, Aryan will connect shortly.';
        status.classList.add('success');
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalText;
        form.reset();
      }, 1500);
    });
  }

  function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  }
}
