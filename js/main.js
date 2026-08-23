/**
 * AYUSH SAXENA - PORTFOLIO INTERACTIVITY & 3D ENGINE
 * High-performance WebGL Background, 3D Tilt, Audio FX & State Management
 */

document.addEventListener('DOMContentLoaded', () => {
  initThreeBackground();
  initTypewriter();
  initTiltCards();
  initThemeSwitcher();
  initAudioFX();
  initProjectFilters();
  initContactForm();
  initCopyHelpers();
  initNavbarScroll();
  initScrollAnimations();
});

/* ==========================================================================
   1. THREE.JS 3D PARTICLE CONSTELLATION BACKGROUND
   ========================================================================== */
function initThreeBackground() {
  const container = document.getElementById('three-canvas-container');
  if (!container || typeof THREE === 'undefined') return;

  // WebGL Availability & Context Guard
  function isWebGLAvailable() {
    try {
      const testCanvas = document.createElement('canvas');
      return !!(window.WebGLRenderingContext && (testCanvas.getContext('webgl') || testCanvas.getContext('experimental-webgl')));
    } catch (e) {
      return false;
    }
  }

  if (!isWebGLAvailable()) {
    console.info('WebGL not supported or disabled. Falling back to ambient CSS gradients.');
    return;
  }

  try {
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true, powerPreference: 'low-power' });

    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    // Responsive Particle Count Optimization
    const particleCount = window.innerWidth < 768 ? 400 : (window.innerWidth < 1200 ? 750 : 1100);
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);

    const baseColor = new THREE.Color('#00f2fe');
    const secondColor = new THREE.Color('#7928ca');

    for (let i = 0; i < particleCount * 3; i += 3) {
      positions[i] = (Math.random() - 0.5) * 20;
      positions[i + 1] = (Math.random() - 0.5) * 20;
      positions[i + 2] = (Math.random() - 0.5) * 20;

      const mixedColor = baseColor.clone().lerp(secondColor, Math.random());
      colors[i] = mixedColor.r;
      colors[i + 1] = mixedColor.g;
      colors[i + 2] = mixedColor.b;
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    // Custom soft particle point texture
    const canvas = document.createElement('canvas');
    canvas.width = 16;
    canvas.height = 16;
    const ctx = canvas.getContext('2d');
    const gradient = ctx.createRadialGradient(8, 8, 0, 8, 8, 8);
    gradient.addColorStop(0, 'rgba(255, 255, 255, 1)');
    gradient.addColorStop(0.3, 'rgba(0, 242, 254, 0.8)');
    gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 16, 16);
    const texture = new THREE.CanvasTexture(canvas);

    const material = new THREE.PointsMaterial({
      size: 0.12,
      vertexColors: true,
      map: texture,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });

    const particleSystem = new THREE.Points(geometry, material);
    scene.add(particleSystem);

    // Geometric floating wireframe octahedron in 3D space
    const octaGeometry = new THREE.OctahedronGeometry(2.4, 1);
    const octaMaterial = new THREE.MeshBasicMaterial({
      color: 0x00f2fe,
      wireframe: true,
      transparent: true,
      opacity: 0.15
    });
    const floatingShape = new THREE.Mesh(octaGeometry, octaMaterial);
    floatingShape.position.set(4, 1, -4);
    scene.add(floatingShape);

    // Geometric icosahedron
    const icoGeometry = new THREE.IcosahedronGeometry(1.8, 1);
    const icoMaterial = new THREE.MeshBasicMaterial({
      color: 0x7928ca,
      wireframe: true,
      transparent: true,
      opacity: 0.12
    });
    const floatingIco = new THREE.Mesh(icoGeometry, icoMaterial);
    floatingIco.position.set(-5, -2, -3);
    scene.add(floatingIco);

    camera.position.z = 7;

    // Mouse interaction
    let mouseX = 0;
    let mouseY = 0;
    let targetX = 0;
    let targetY = 0;

    window.addEventListener('mousemove', (e) => {
      mouseX = (e.clientX / window.innerWidth - 0.5) * 2;
      mouseY = (e.clientY / window.innerHeight - 0.5) * 2;
    }, { passive: true });

    // Animation Loop with Visibility Battery Optimization
    const clock = new THREE.Clock();
    let animationFrameId = null;
    let isPageVisible = true;

    function animate() {
      if (!isPageVisible) return;
      animationFrameId = requestAnimationFrame(animate);
      const elapsedTime = clock.getElapsedTime();

      targetX += (mouseX - targetX) * 0.05;
      targetY += (mouseY - targetY) * 0.05;

      particleSystem.rotation.y = elapsedTime * 0.03 + targetX * 0.3;
      particleSystem.rotation.x = elapsedTime * 0.01 + targetY * 0.2;

      floatingShape.rotation.x = elapsedTime * 0.15;
      floatingShape.rotation.y = elapsedTime * 0.2;
      floatingShape.position.y = 1 + Math.sin(elapsedTime * 0.8) * 0.4;

      floatingIco.rotation.x = -elapsedTime * 0.12;
      floatingIco.rotation.y = -elapsedTime * 0.18;
      floatingIco.position.y = -2 + Math.cos(elapsedTime * 0.7) * 0.3;

      camera.position.x += (targetX * 0.8 - camera.position.x) * 0.05;
      camera.position.y += (-targetY * 0.8 - camera.position.y) * 0.05;
      camera.lookAt(scene.position);

      renderer.render(scene, camera);
    }

    animate();

    // Tab visibility handling (pauses render loop when tab is hidden)
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        isPageVisible = false;
        if (animationFrameId) cancelAnimationFrame(animationFrameId);
      } else {
        isPageVisible = true;
        animate();
      }
    });

    // Resize Handler
    window.addEventListener('resize', () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    }, { passive: true });
  } catch (error) {
    console.warn('WebGL background initialization gracefully bypassed:', error);
  }
}

/* ==========================================================================
   2. TYPEWRITER EFFECT
   ========================================================================== */
function initTypewriter() {
  const typedTarget = document.getElementById('typed-role-text');
  if (!typedTarget) return;

  const roles = [
    "Python & Django Specialist",
    "B.Tech CSE (AI & ML) Scholar",
    "Full-Stack Web Architect",
    "DSA & Java Problem Solver",
    "Softpro India Intern (A++ Grade)"
  ];

  let roleIndex = 0;
  let charIndex = 0;
  let isDeleting = false;
  const typeSpeed = 80;
  const deleteSpeed = 40;
  const delayBetweenWords = 2200;

  function type() {
    const currentRole = roles[roleIndex];

    if (isDeleting) {
      typedTarget.textContent = currentRole.substring(0, charIndex - 1);
      charIndex--;
    } else {
      typedTarget.textContent = currentRole.substring(0, charIndex + 1);
      charIndex++;
    }

    let currentSpeed = isDeleting ? deleteSpeed : typeSpeed;

    if (!isDeleting && charIndex === currentRole.length) {
      currentSpeed = delayBetweenWords;
      isDeleting = true;
    } else if (isDeleting && charIndex === 0) {
      isDeleting = false;
      roleIndex = (roleIndex + 1) % roles.length;
      currentSpeed = 400;
    }

    setTimeout(type, currentSpeed);
  }

  type();
}

/* ==========================================================================
   3. 3D CARD TILT & RADIAL MOUSE GLOW
   ========================================================================== */
function initTiltCards() {
  // Only enable 3D tilt on devices with hover/pointer capability (prevents touch scroll lag)
  const hasPointerHover = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  if (!hasPointerHover) return;

  const cards = document.querySelectorAll('.tilt-card');
  if (!cards.length) return;

  cards.forEach(card => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      const centerX = rect.width / 2;
      const centerY = rect.height / 2;

      const rotateX = ((y - centerY) / centerY) * -8;
      const rotateY = ((x - centerX) / centerX) * 8;

      card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`;

      // Subtle dynamic mouse-following glow
      card.style.background = `radial-gradient(circle 200px at ${x}px ${y}px, rgba(0, 242, 254, 0.12), rgba(18, 26, 47, 0.6))`;
    }, { passive: true });

    card.addEventListener('mouseleave', () => {
      card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)';
      card.style.background = '';
    });
  });
}

/* ==========================================================================
   4. GLOW THEME SWITCHER
   ========================================================================== */
function initThemeSwitcher() {
  const dots = document.querySelectorAll('.theme-dot');
  const savedTheme = localStorage.getItem('ayush-theme') || 'cyan';

  applyTheme(savedTheme);

  dots.forEach(dot => {
    dot.addEventListener('click', () => {
      const theme = dot.dataset.theme;
      applyTheme(theme);
      localStorage.setItem('ayush-theme', theme);
      playSynthSound('blip');
    });
  });

  function applyTheme(theme) {
    dots.forEach(d => d.classList.toggle('active', d.dataset.theme === theme));
    if (theme === 'cyan') {
      document.body.removeAttribute('data-theme');
    } else {
      document.body.setAttribute('data-theme', theme);
    }
  }
}

/* ==========================================================================
   5. WEB AUDIO API SYNTHESIZER (SUBTLE CYBER AUDIO FX)
   ========================================================================== */
let audioCtx = null;
let soundEnabled = false;

function initAudioFX() {
  const toggleBtn = document.getElementById('audio-toggle-btn');
  if (!toggleBtn) return;

  toggleBtn.addEventListener('click', () => {
    if (!audioCtx) {
      audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
    soundEnabled = !soundEnabled;
    toggleBtn.classList.toggle('active', soundEnabled);
    toggleBtn.innerHTML = soundEnabled 
      ? '<i class="bi bi-volume-up-fill"></i>' 
      : '<i class="bi bi-volume-mute-fill"></i>';

    if (soundEnabled) {
      playSynthSound('success');
      showToast('🔊 Sound FX Enabled!');
    } else {
      showToast('🔇 Sound FX Muted');
    }
  });

  // Attach hover sounds to interactive elements
  const interactives = document.querySelectorAll('.btn-glow-primary, .btn-glass-secondary, .filter-btn, .coding-profile-card, .nav-link-custom');
  interactives.forEach(elem => {
    elem.addEventListener('mouseenter', () => {
      if (soundEnabled) playSynthSound('hover');
    });
    elem.addEventListener('click', () => {
      if (soundEnabled) playSynthSound('click');
    });
  });
}

function playSynthSound(type) {
  if (!soundEnabled || !audioCtx) return;
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }

  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();
  osc.connect(gain);
  gain.connect(audioCtx.destination);

  const now = audioCtx.currentTime;

  if (type === 'hover') {
    osc.type = 'sine';
    osc.frequency.setValueAtTime(480, now);
    osc.frequency.exponentialRampToValueAtTime(720, now + 0.06);
    gain.gain.setValueAtTime(0.04, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.06);
    osc.start(now);
    osc.stop(now + 0.06);
  } else if (type === 'click') {
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(600, now);
    osc.frequency.exponentialRampToValueAtTime(300, now + 0.08);
    gain.gain.setValueAtTime(0.08, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);
    osc.start(now);
    osc.stop(now + 0.08);
  } else if (type === 'blip') {
    osc.type = 'sine';
    osc.frequency.setValueAtTime(800, now);
    osc.frequency.exponentialRampToValueAtTime(1200, now + 0.1);
    gain.gain.setValueAtTime(0.06, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);
    osc.start(now);
    osc.stop(now + 0.1);
  } else if (type === 'success') {
    osc.type = 'sine';
    osc.frequency.setValueAtTime(440, now);
    osc.frequency.setValueAtTime(554.37, now + 0.08);
    osc.frequency.setValueAtTime(659.25, now + 0.16);
    gain.gain.setValueAtTime(0.06, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.28);
    osc.start(now);
    osc.stop(now + 0.28);
  }
}

/* ==========================================================================
   6. PROJECT FILTERING & PREVIEW MODAL
   ========================================================================== */
function initProjectFilters() {
  const filterBtns = document.querySelectorAll('.filter-btn');
  const projectCards = document.querySelectorAll('.project-item-col');

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const filterValue = btn.dataset.filter;

      projectCards.forEach(card => {
        if (filterValue === 'all' || card.dataset.category.includes(filterValue)) {
          card.style.display = 'block';
          card.classList.add('animate__fadeIn');
        } else {
          card.style.display = 'none';
        }
      });
    });
  });
}

// Project Details Dynamic Modal Populator
window.openProjectDetails = function(projectId) {
  const modal = new bootstrap.Modal(document.getElementById('projectDetailsModal'));
  const title = document.getElementById('projectModalTitle');
  const body = document.getElementById('projectModalBody');
  const githubLink = document.getElementById('projectModalGithub');
  const liveLink = document.getElementById('projectModalLive');

  if (projectId === 'aurelix') {
    title.innerHTML = '<i class="bi bi-mortarboard-fill text-info me-2"></i> Aurelix – Student Management System';
    body.innerHTML = `
      <div class="row g-4">
        <div class="col-12">
          <div class="p-3 glass-card mb-3">
            <h6 class="text-gradient mb-2"><i class="bi bi-layers-fill me-2"></i>Architecture & Core Features</h6>
            <p class="text-secondary small mb-0">Production-deployed enterprise-grade Student Management System designed to modernize academic institution workflows with high security, role segregation, and streamlined administrative pipelines.</p>
          </div>
          <div class="row g-3">
            <div class="col-md-6">
              <div class="p-3 bg-dark bg-opacity-50 rounded-3 border border-secondary border-opacity-25 h-100">
                <h6 class="text-light"><i class="bi bi-shield-lock-fill text-warning me-2"></i>Security & Roles</h6>
                <ul class="text-secondary small mb-0 ps-3">
                  <li>Multi-tiered role-based access for school owners, teachers, and staff</li>
                  <li>Secure authentication & session state validation</li>
                  <li>Custom permission middleware & automated audit logging</li>
                </ul>
              </div>
            </div>
            <div class="col-md-6">
              <div class="p-3 bg-dark bg-opacity-50 rounded-3 border border-secondary border-opacity-25 h-100">
                <h6 class="text-light"><i class="bi bi-cloud-arrow-up-fill text-info me-2"></i>Cloud & Integrations</h6>
                <ul class="text-secondary small mb-0 ps-3">
                  <li>PostgreSQL database backend deployed on Render</li>
                  <li>Cloudinary integration for student documents & asset storage</li>
                  <li>Brevo (Sendinblue) transactional email notification service</li>
                  <li>Instant Excel bulk data import and export pipelines</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
    githubLink.href = 'https://github.com/Ayush2809-tech/Aurelix';
    githubLink.style.display = 'inline-flex';
    liveLink.href = 'https://aurelix-9q4e.onrender.com';
    liveLink.style.display = 'inline-flex';
  } else if (projectId === 'admission') {
    title.innerHTML = '<i class="bi bi-building-check text-info me-2"></i> Biotech Park Online Admission System';
    body.innerHTML = `
      <div class="row g-4">
        <div class="col-12">
          <div class="p-3 glass-card mb-3">
            <h6 class="text-gradient mb-2"><i class="bi bi-layers-fill me-2"></i>Client Project: Biotech Park, Lucknow</h6>
            <p class="text-secondary small mb-0">Developed during the 45-day Summer Internship at <strong>Softpro India Computer Technologies Pvt. Ltd.</strong> for Biotech Park Lucknow, achieving an <strong>A++ Grade</strong>.</p>
          </div>
          <div class="row g-3">
            <div class="col-md-6">
              <div class="p-3 bg-dark bg-opacity-50 rounded-3 border border-secondary border-opacity-25 h-100">
                <h6 class="text-light"><i class="bi bi-file-earmark-check-fill text-success me-2"></i>Admission Pipeline</h6>
                <ul class="text-secondary small mb-0 ps-3">
                  <li>Online student onboarding & multi-tier document verification</li>
                  <li>Automated admission token generation & seat allotment</li>
                  <li>Course enrollment filters with eligibility checking</li>
                </ul>
              </div>
            </div>
            <div class="col-md-6">
              <div class="p-3 bg-dark bg-opacity-50 rounded-3 border border-secondary border-opacity-25 h-100">
                <h6 class="text-light"><i class="bi bi-wallet2 text-info me-2"></i>Fee & Admin Controls</h6>
                <ul class="text-secondary small mb-0 ps-3">
                  <li>Fee installment and payment tracking dashboard</li>
                  <li>Automated receipts and admission status reports</li>
                  <li>Centralized admin portal built with Django and SQL</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
    githubLink.href = 'https://github.com/Ayush2809-tech/BTech-Park-Admission-System';
    githubLink.style.display = 'inline-flex';
    liveLink.style.display = 'none';
  }

  modal.show();
};

/* ==========================================================================
   7. CONTACT FORM & VALIDATION
   ========================================================================== */
function initContactForm() {
  const form = document.getElementById('contact-form');
  if (!form) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    const name = document.getElementById('sender-name').value.trim();
    const email = document.getElementById('sender-email').value.trim();
    const message = document.getElementById('sender-message').value.trim();
    const submitBtn = document.getElementById('contact-submit-btn');

    if (!name || !email || !message) {
      showToast('⚠️ Please fill out all fields before sending.');
      return;
    }

    // Interactive button loading state
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<span class="spinner-border spinner-border-sm me-2" role="status"></span> Sending message...';

    setTimeout(() => {
      submitBtn.disabled = false;
      submitBtn.innerHTML = '<i class="bi bi-check2-circle me-2"></i> Message Sent!';
      submitBtn.classList.remove('btn-glow-primary');
      submitBtn.classList.add('btn-success');

      showToast(`✨ Thank you, ${name}! Your message has been prepared for Ayush.`);
      playSynthSound('success');

      // Create a prefilled mailto link for direct sending as fallback
      window.location.href = `mailto:saxenaayush2809@gmail.com?subject=Portfolio%20Inquiry%20from%20${encodeURIComponent(name)}&body=${encodeURIComponent(message)}%0A%0AFrom:%20${encodeURIComponent(email)}`;

      setTimeout(() => {
        form.reset();
        submitBtn.innerHTML = '<i class="bi bi-send-fill me-2"></i> Send Message';
        submitBtn.classList.add('btn-glow-primary');
        submitBtn.classList.remove('btn-success');
      }, 4000);
    }, 1000);
  });
}

/* ==========================================================================
   8. 1-CLICK COPY HELPERS
   ========================================================================== */
function initCopyHelpers() {
  const copyButtons = document.querySelectorAll('.copy-btn');
  copyButtons.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const textToCopy = btn.dataset.copy;
      if (!textToCopy) return;

      navigator.clipboard.writeText(textToCopy).then(() => {
        const originalText = btn.innerHTML;
        btn.innerHTML = '<i class="bi bi-check-lg text-success"></i> Copied!';
        showToast(`📋 Copied "${textToCopy}" to clipboard!`);
        playSynthSound('blip');

        setTimeout(() => {
          btn.innerHTML = originalText;
        }, 2200);
      });
    });
  });
}

/* ==========================================================================
   9. NAVBAR SCROLL & ACTIVE LINK SPY
   ========================================================================== */
function initNavbarScroll() {
  const navbar = document.querySelector('.custom-navbar');
  const navLinks = document.querySelectorAll('.nav-link-custom');
  const sections = document.querySelectorAll('section[id]');

  window.addEventListener('scroll', () => {
    // Sticky navbar glow
    if (window.scrollY > 50) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }

    // Scroll spy
    let current = '';
    sections.forEach(section => {
      const sectionTop = section.offsetTop - 120;
      const sectionHeight = section.offsetHeight;
      if (window.scrollY >= sectionTop && window.scrollY < sectionTop + sectionHeight) {
        current = section.getAttribute('id');
      }
    });

    navLinks.forEach(link => {
      link.classList.remove('active');
      if (link.getAttribute('href') === `#${current}`) {
        link.classList.add('active');
      }
    });
  });
}

/* ==========================================================================
   10. SCROLL REVEAL OBSERVER
   ========================================================================== */
function initScrollAnimations() {
  const observerOptions = {
    root: null,
    rootMargin: '0px',
    threshold: 0.1
  };

  const observer = new IntersectionObserver((entries, obs) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('animate-in');
        obs.unobserve(entry.target);
      }
    });
  }, observerOptions);

  document.querySelectorAll('.glass-card, .timeline-card, .edu-card, .achievement-card').forEach(el => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(25px)';
    el.style.transition = 'opacity 0.6s ease-out, transform 0.6s ease-out';
    observer.observe(el);
  });
}

// Add animation class helper
document.addEventListener('DOMContentLoaded', () => {
  const style = document.createElement('style');
  style.innerHTML = `
    .animate-in {
      opacity: 1 !important;
      transform: translateY(0) !important;
    }
  `;
  document.head.appendChild(style);
});

/* ==========================================================================
   11. TOAST NOTIFICATION UTILITY
   ========================================================================== */
function showToast(message) {
  let toast = document.getElementById('custom-global-toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'custom-global-toast';
    toast.className = 'custom-toast';
    document.body.appendChild(toast);
  }

  toast.innerHTML = `<span class="toast-text">${message}</span>`;
  toast.classList.add('show');

  clearTimeout(window.toastTimer);
  window.toastTimer = setTimeout(() => {
    toast.classList.remove('show');
  }, 3200);
}

/* ==========================================================================
   12. RESUME PRINT / DOWNLOAD TRIGGER
   ========================================================================== */
window.printResume = function() {
  window.print();
};
