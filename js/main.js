/**
 * AYUSH SAXENA - PORTFOLIO INTERACTIVITY, 3D ENGINE & AI ASSISTANT
 * High-performance WebGL Background, 3D Tilt, Audio FX, AI Chatbot & ATS Resume
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
  initAIChatbot();
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
  const audioButtons = document.querySelectorAll('.audio-toggle-action');
  if (!audioButtons.length) return;

  function updateAudioButtonsState() {
    audioButtons.forEach(btn => {
      btn.classList.toggle('active', soundEnabled);
      btn.innerHTML = soundEnabled 
        ? '<i class="bi bi-volume-up-fill"></i><span class="visually-hidden">Mute Sound FX</span>' 
        : '<i class="bi bi-volume-mute-fill"></i><span class="visually-hidden">Enable Sound FX</span>';
    });
  }

  audioButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      if (!audioCtx) {
        audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      }
      soundEnabled = !soundEnabled;
      updateAudioButtonsState();

      if (soundEnabled) {
        playSynthSound('success');
        showToast('🔊 Sound FX Enabled!');
      } else {
        showToast('🔇 Sound FX Muted');
      }
    });
  });

  // Attach hover sounds to interactive elements
  const interactives = document.querySelectorAll('.btn-glow-primary, .btn-glass-secondary, .filter-btn, .coding-profile-card, .nav-link-custom, .footer-nav-link, .btn-icon-glass, .audio-toggle-action, .navbar-toggler');
  interactives.forEach(elem => {
    elem.addEventListener('mouseenter', () => {
      if (soundEnabled) playSynthSound('hover');
    });
    elem.addEventListener('touchstart', () => {
      if (soundEnabled) playSynthSound('hover');
    }, { passive: true });
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
        } else {
          card.style.display = 'none';
        }
      });
    });
  });
}

// Project Details Dynamic Modal Populator
window.openProjectDetails = function(projectId) {
  const modalElement = document.getElementById('projectDetailsModal');
  if (!modalElement || typeof bootstrap === 'undefined' || !bootstrap.Modal) return;
  const modal = bootstrap.Modal.getOrCreateInstance(modalElement);
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
    liveLink.href = 'https://aurelix-9q4e.onrender.com/';
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
        const originalHtml = btn.innerHTML;
        btn.innerHTML = '<i class="bi bi-check-lg text-success"></i><span class="visually-hidden">Copied</span>';
        showToast(`📋 Copied "${textToCopy}" to clipboard!`);
        playSynthSound('blip');

        setTimeout(() => {
          btn.innerHTML = originalHtml;
        }, 2200);
      });
    });
  });
}

/* ==========================================================================
   9. NAVBAR SCROLL, ACTIVE LINK SPY & SMOOTH NAVIGATION
   ========================================================================== */
function initNavbarScroll() {
  const navbar = document.querySelector('.custom-navbar');
  const navLinks = document.querySelectorAll('.nav-link-custom');
  const sections = document.querySelectorAll('section[id]');
  const offcanvasEl = document.getElementById('navbarOffcanvas');

  // Handle all smooth-scrolling anchor links across navbar, footer and buttons
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
      const targetId = this.getAttribute('href');
      if (!targetId || targetId === '#') return;

      const targetSection = document.querySelector(targetId);
      if (targetSection) {
        e.preventDefault();

        // Calculate offset position for sticky navbar
        const navHeight = navbar ? navbar.offsetHeight : 80;
        const targetPosition = targetSection.getBoundingClientRect().top + window.pageYOffset - (navHeight + 10);

        window.scrollTo({
          top: targetPosition,
          behavior: 'smooth'
        });

        // Close mobile offcanvas if open
        if (offcanvasEl && typeof bootstrap !== 'undefined' && bootstrap.Offcanvas) {
          const bsOffcanvas = bootstrap.Offcanvas.getOrCreateInstance(offcanvasEl);
          if (bsOffcanvas) {
            bsOffcanvas.hide();
          }
        }

        // Update active class
        navLinks.forEach(l => l.classList.remove('active'));
        if (this.classList.contains('nav-link-custom')) {
          this.classList.add('active');
        }
      }
    });
  });

  window.addEventListener('scroll', () => {
    // Sticky navbar glow
    if (window.scrollY > 50) {
      navbar?.classList.add('scrolled');
    } else {
      navbar?.classList.remove('scrolled');
    }

    // Scroll spy
    let current = '';
    sections.forEach(section => {
      const sectionTop = section.offsetTop - 130;
      const sectionHeight = section.offsetHeight;
      if (window.scrollY >= sectionTop && window.scrollY < sectionTop + sectionHeight) {
        current = section.getAttribute('id');
      }
    });

    if (current) {
      navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href') === `#${current}`) {
          link.classList.add('active');
        }
      });
    }
  }, { passive: true });
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
   12. ATS-COMPLIANT RESUME PDF & TEXT DOWNLOAD GENERATORS
   ========================================================================== */
window.downloadATSResume = function() {
  let printFrame = document.getElementById('resume-ats-print-frame');
  if (!printFrame) {
    printFrame = document.createElement('iframe');
    printFrame.id = 'resume-ats-print-frame';
    printFrame.style.position = 'fixed';
    printFrame.style.right = '0';
    printFrame.style.bottom = '0';
    printFrame.style.width = '0';
    printFrame.style.height = '0';
    printFrame.style.border = '0';
    document.body.appendChild(printFrame);
  }

  const doc = printFrame.contentWindow.document;
  doc.open();
  doc.write(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <title>Ayush_Saxena_Resume</title>
      <style>
        @page {
          size: A4 portrait;
          margin: 12mm 15mm;
        }
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body {
          font-family: Arial, Helvetica, sans-serif;
          color: #111827;
          background: #fff;
          font-size: 10.5pt;
          line-height: 1.45;
          padding: 10px;
        }
        h2 { font-size: 18pt; font-weight: 700; color: #0f172a; text-transform: uppercase; margin-bottom: 2px; }
        .sub-title { font-size: 11pt; font-weight: 600; color: #475569; margin-bottom: 6px; }
        .contact-line { font-size: 9.5pt; color: #334155; margin-bottom: 12px; }
        .contact-line a { color: #0284c7; text-decoration: none; }
        hr { border: none; border-top: 1.5px solid #0284c7; margin: 6px 0 10px 0; }
        h3 {
          font-size: 11.5pt;
          font-weight: 700;
          color: #0369a1;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          border-bottom: 1px solid #cbd5e1;
          padding-bottom: 2px;
          margin-top: 12px;
          margin-bottom: 6px;
        }
        .item-head { display: flex; justify-content: space-between; font-weight: 700; font-size: 10.5pt; color: #1e293b; }
        .item-date { font-weight: 600; color: #64748b; font-size: 9.5pt; }
        ul { padding-left: 18px; margin-top: 3px; margin-bottom: 8px; }
        li { margin-bottom: 3px; }
        p { margin-bottom: 4px; }
        strong { font-weight: 700; color: #0f172a; }
      </style>
    </head>
    <body>
      <h2>AYUSH SAXENA</h2>
      <div class="sub-title">B.Tech CSE (AI &amp; ML) | Python &amp; Django Developer</div>
      <div class="contact-line">
        saxenaayush2809@gmail.com | +91 9528055151 | Greater Noida, Uttar Pradesh, India<br>
        LinkedIn: linkedin.com/in/ayush-saxena-2809s/ | GitHub: github.com/Ayush2809-tech | LeetCode: leetcode.com/u/Ayush2815
      </div>
      <hr>

      <h3>Professional Summary</h3>
      <p>Pre-final year B.Tech Computer Science and Engineering (Artificial Intelligence &amp; Machine Learning) student at Dronacharya Group of Institutions (AKTU) with hands-on experience in Python, Django, web development, and software project development. Experienced in building and deploying production-ready web applications and strengthening problem-solving skills through Java and Data Structures &amp; Algorithms.</p>

      <h3>Internship Experience</h3>
      <div class="item-head">
        <span>Software Development Intern | Softpro India Computer Technologies Pvt. Ltd., Lucknow</span>
        <span class="item-date">Jun 2026 – Jul 2026</span>
      </div>
      <ul>
        <li>Completed a 45-day Summer Internship in Python with Django, achieving the highest performance rating (<strong>A++ grade</strong>).</li>
        <li>Developed Online Admission System for Biotech Park, Lucknow, working with the Software Development &amp; Testing Division on a client-side project using Python and Django.</li>
        <li>Implemented candidate registration, document upload pipelines, course allotment algorithms, fee/payment tracking, and role-based administrative dashboards.</li>
        <li>Awarded the <strong>Best Speaker Award (2026)</strong> by Softpro India for technical presentation and communication.</li>
      </ul>

      <h3>Technical Skills</h3>
      <p><strong>Languages:</strong> Python, Java, JavaScript, HTML5, CSS3, SQL</p>
      <p><strong>Frameworks &amp; Libraries:</strong> Django, Bootstrap 5, RESTful APIs, Glassmorphism UI</p>
      <p><strong>Developer Tools:</strong> Git, GitHub, VS Code, Postman, CLI &amp; Terminal</p>
      <p><strong>Platforms &amp; Databases:</strong> Render, PostgreSQL, Cloudinary, Brevo, GitHub Pages, Netlify</p>
      <p><strong>Core Computer Science:</strong> Data Structures &amp; Algorithms, Database Management (DBMS), AI/ML Fundamentals, Web Development</p>

      <h3>Key Projects</h3>
      <div class="item-head">
        <span>1. Aurelix – Student Management System</span>
        <span class="item-date">Live on Render | Django, PostgreSQL, Cloudinary</span>
      </div>
      <p style="font-size: 9.5pt; color: #475569;">Live: https://aurelix-9q4e.onrender.com/ | GitHub: https://github.com/Ayush2809-tech/Aurelix</p>
      <ul>
        <li>Developed and production-deployed a Django Student Management System with role-based access for school owners, teachers, and administrators.</li>
        <li>Integrated PostgreSQL on Render, Cloudinary document storage, Brevo email alerts, and Excel data import/export pipelines.</li>
      </ul>

      <div class="item-head">
        <span>2. Online Admission System – Biotech Park, Lucknow</span>
        <span class="item-date">Softpro India Client Project | Python, Django, SQL</span>
      </div>
      <p style="font-size: 9.5pt; color: #475569;">GitHub: https://github.com/Ayush2809-tech/BTech-Park-Admission-System</p>
      <ul>
        <li>Engineered full-lifecycle online admission workflow for Biotech Park Lucknow with student onboarding, document verification, and seat allotment.</li>
        <li>Implemented fee installment tracking dashboard and centralized administrative portal.</li>
      </ul>

      <h3>Education</h3>
      <div class="item-head">
        <span>Dronacharya Group of Institutions | AKTU, Lucknow</span>
        <span class="item-date">2024 – 2028</span>
      </div>
      <p>Bachelor of Technology (B.Tech) – Computer Science &amp; Engineering (AI &amp; ML) | <strong>CGPA: 8.03 / 10</strong></p>
      <div class="item-head" style="margin-top: 4px;">
        <span>Saraswati Vidya Mandir Inter College | UP Board</span>
        <span class="item-date">2023</span>
      </div>
      <p>Senior Secondary (Grade 12th) – Science &amp; Mathematics | <strong>Score: 81.2%</strong></p>
      <div class="item-head" style="margin-top: 4px;">
        <span>Saraswati Vidya Mandir Inter College | UP Board</span>
        <span class="item-date">2021</span>
      </div>
      <p>Secondary (Grade 10th) | <strong>Score: 90.5%</strong></p>

      <h3>Honors &amp; Achievements</h3>
      <ul>
        <li><strong>Best Speaker Award (2026)</strong> – Softpro India Computer Technologies Pvt. Ltd.</li>
        <li><strong>Top 1,000 Teams (2026)</strong> – Vibe Hacks, HackWithIndia (Ranked top 1K out of 3,000+ teams).</li>
        <li><strong>Social Media Co-Head</strong> – Aarohan Coding Club.</li>
      </ul>

      <h3>Verified Certifications</h3>
      <ul>
        <li>Summer Internship – Python with Django (Grade A++) | Softpro India (2026)</li>
        <li>Python Programming | EdLernity (2025)</li>
        <li>Basics of ChatGPT | EdLernity (2025)</li>
        <li>Basics of Data Structures and Algorithms (2025)</li>
      </ul>
    </body>
    </html>
  `);
  doc.close();

  showToast('📄 Preparing ATS-friendly resume for print / PDF download...');
  if (typeof playSynthSound === 'function') playSynthSound('blip');
  setTimeout(() => {
    printFrame.contentWindow.focus();
    printFrame.contentWindow.print();
  }, 400);
};

window.downloadATSText = function() {
  const atsText = `AYUSH SAXENA
B.Tech CSE (AI & ML) | Python & Django Developer
Email: saxenaayush2809@gmail.com | Phone: +91 9528055151 | Location: Greater Noida, UP, India
LinkedIn: https://www.linkedin.com/in/ayush-saxena-2809s/
GitHub: https://github.com/Ayush2809-tech
LeetCode: https://leetcode.com/u/Ayush2815

==================================================
PROFESSIONAL SUMMARY
==================================================
Pre-final year B.Tech Computer Science and Engineering (Artificial Intelligence & Machine Learning) student at Dronacharya Group of Institutions (AKTU) with hands-on experience in Python, Django, web development, and software project development. Experienced in building and deploying production-ready web applications and strengthening problem-solving skills through Java and Data Structures & Algorithms.

==================================================
INTERNSHIP EXPERIENCE
==================================================
Software Development Intern | Softpro India Computer Technologies Pvt. Ltd., Lucknow
Duration: Jun 2026 – Jul 2026 (On-site) | Grade: A++
- Completed a 45-day Summer Internship in Python with Django, achieving the highest performance rating (A++ grade).
- Developed Online Admission System for Biotech Park, Lucknow, working with the Software Development & Testing Division on a client-side project using Python and Django.
- Implemented full-lifecycle features including candidate registration, document upload pipelines, course allotment algorithms, fee/payment tracking, and role-based administrative dashboards.
- Awarded the prestigious Best Speaker Award (2026) by Softpro India in recognition of outstanding technical presentation and team communication.

==================================================
TECHNICAL SKILLS
==================================================
- Programming Languages: Python, Java, JavaScript, HTML5, CSS3, SQL
- Frameworks & Libraries: Django, Bootstrap 5, RESTful APIs, Glassmorphism UI
- Developer Tools: Git, GitHub, VS Code, Postman, CLI & Terminal
- Cloud & Platforms: Render, PostgreSQL, Cloudinary, Brevo, GitHub Pages, Netlify
- Core CS: Data Structures & Algorithms, DBMS, Web Development, AI/ML Fundamentals

==================================================
KEY PROJECTS
==================================================
1. Aurelix – Student Management System
   Live Demo: https://aurelix-9q4e.onrender.com/
   GitHub: https://github.com/Ayush2809-tech/Aurelix
   Tech: Python, Django, PostgreSQL, Cloudinary, Brevo, Render
   - Developed and production-deployed a Django Student Management System with role-based access for school owners, teachers, and administrators.
   - Integrated PostgreSQL on Render, Cloudinary storage, Brevo notifications, and Excel bulk data import/export.

2. Online Admission System – Biotech Park, Lucknow (Softpro Client Project)
   GitHub: https://github.com/Ayush2809-tech/BTech-Park-Admission-System
   Tech: Python, Django, SQL, Bootstrap 5
   - Engineered student onboarding, document verification, and seat allotment pipeline for Biotech Park Lucknow.
   - Built installment fee tracking and centralized Django administrative portal.

==================================================
EDUCATION
==================================================
- Bachelor of Technology (B.Tech) in Computer Science & Engineering (AI & ML) (2024 – 2028)
  Dronacharya Group of Institutions | Dr. A.P.J. Abdul Kalam Technical University (AKTU), Lucknow
  CGPA: 8.03 / 10
- Senior Secondary (Grade 12th) - Science & Mathematics (2023)
  Saraswati Vidya Mandir Inter College | UP Board | Score: 81.2%
- Secondary (Grade 10th) (2021)
  Saraswati Vidya Mandir Inter College | UP Board | Score: 90.5%

==================================================
HONORS, LEADERSHIP & CERTIFICATIONS
==================================================
- Best Speaker Award (2026) | Softpro India Computer Technologies Pvt. Ltd.
- Top 1,000 Teams (2026) | Vibe Hacks | HackWithIndia
- Social Media Co-Head | Aarohan Coding Club
- Summer Internship - Python with Django (Grade A++) | Softpro India (2026)
- Python Programming | EdLernity (2025)
- Basics of ChatGPT | EdLernity (2025)
- Basics of Data Structures and Algorithms (2025)
`;

  const blob = new Blob([atsText], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = 'Ayush_Saxena_Resume_ATS.txt';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
  showToast('📥 ATS-friendly text resume downloaded!');
  if (typeof playSynthSound === 'function') playSynthSound('success');
};

/* ==========================================================================
   13. AI CHATBOT AGENT ENGINE
   ========================================================================== */
function initAIChatbot() {
  const toggleBtn = document.getElementById('ai-chat-toggle');
  const chatWindow = document.getElementById('ai-chat-window');
  const closeBtn = document.getElementById('ai-chat-close');
  const clearBtn = document.getElementById('ai-chat-clear');
  const chatForm = document.getElementById('ai-chat-form');
  const chatInput = document.getElementById('ai-chat-input');
  const chatBody = document.getElementById('ai-chat-body');

  if (!toggleBtn || !chatWindow) return;

  toggleBtn.addEventListener('click', () => {
    chatWindow.classList.toggle('open');
    if (chatWindow.classList.contains('open')) {
      chatInput.focus();
      playSynthSound('blip');
    }
  });

  closeBtn.addEventListener('click', () => {
    chatWindow.classList.remove('open');
  });

  clearBtn.addEventListener('click', () => {
    chatBody.innerHTML = `
      <div class="ai-msg bot">
        <div class="ai-msg-bubble">
          <p class="mb-2">🧹 Chat cleared! Ask me anything about Ayush Saxena.</p>
          <div class="ai-chips-container">
            <button type="button" class="ai-prompt-chip" data-prompt="What is Ayush's tech stack?">💻 Tech Stack</button>
            <button type="button" class="ai-prompt-chip" data-prompt="Tell me about Aurelix project">🚀 Aurelix Project</button>
            <button type="button" class="ai-prompt-chip" data-prompt="How was his Softpro India internship?">💼 Softpro Internship (A++)</button>
            <button type="button" class="ai-prompt-chip" data-prompt="What is his B.Tech CGPA and college?">🎓 College &amp; CGPA</button>
          </div>
        </div>
      </div>
    `;
    attachChipListeners();
  });

  function attachChipListeners() {
    document.querySelectorAll('.ai-prompt-chip').forEach(chip => {
      chip.addEventListener('click', () => {
        const query = chip.dataset.prompt;
        if (query) {
          sendUserMessage(query);
        }
      });
    });
  }

  attachChipListeners();

  chatForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const query = chatInput.value.trim();
    if (!query) return;
    sendUserMessage(query);
    chatInput.value = '';
  });

  function sendUserMessage(text) {
    // Append user bubble
    const userMsg = document.createElement('div');
    userMsg.className = 'ai-msg user';
    userMsg.innerHTML = `<div class="ai-msg-bubble">${escapeHtml(text)}</div>`;
    chatBody.appendChild(userMsg);
    chatBody.scrollTop = chatBody.scrollHeight;
    playSynthSound('click');

    // Simulate AI thinking and typing
    const typingMsg = document.createElement('div');
    typingMsg.className = 'ai-msg bot';
    typingMsg.innerHTML = `<div class="ai-msg-bubble text-secondary font-code small"><i class="spinner-grow spinner-grow-sm me-1" role="status"></i> Thinking...</div>`;
    chatBody.appendChild(typingMsg);
    chatBody.scrollTop = chatBody.scrollHeight;

    setTimeout(() => {
      typingMsg.remove();
      const response = generateAIResponse(text);
      const botMsg = document.createElement('div');
      botMsg.className = 'ai-msg bot';
      botMsg.innerHTML = `<div class="ai-msg-bubble">${response}</div>`;
      chatBody.appendChild(botMsg);
      chatBody.scrollTop = chatBody.scrollHeight;
      playSynthSound('success');
      attachChipListeners();
    }, 600);
  }

  function escapeHtml(str) {
    return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }

  function generateAIResponse(query) {
    const q = query.toLowerCase();

    if (q.includes('stack') || q.includes('skill') || q.includes('language') || q.includes('framework') || q.includes('technology') || q.includes('python') || q.includes('django')) {
      return `
        <strong>💻 Ayush's Core Tech Stack:</strong><br>
        &bull; <strong>Languages:</strong> Python, Java, JavaScript, SQL, HTML5, CSS3<br>
        &bull; <strong>Frameworks:</strong> Django, Bootstrap 5, RESTful APIs<br>
        &bull; <strong>Cloud & Databases:</strong> PostgreSQL, Cloudinary, Render, Brevo, Netlify, GitHub Pages<br>
        &bull; <strong>Core Focus:</strong> Data Structures &amp; Algorithms in Java, Full-Stack Web Development, AI/ML paradigms.
      `;
    }

    if (q.includes('aurelix') || (q.includes('project') && !q.includes('admission') && !q.includes('biotech'))) {
      return `
        <strong>🚀 Aurelix – Student Management System:</strong><br>
        A production-deployed enterprise academic web app built with <strong>Django &amp; PostgreSQL</strong>.<br>
        &bull; Features role-based auth for school owners/teachers, automated student records, and transactional emails.<br>
        &bull; <a href="https://aurelix-9q4e.onrender.com/" target="_blank" class="text-info text-decoration-none"><strong>🔗 Open Live Demo on Render</strong></a><br>
        &bull; <a href="https://github.com/Ayush2809-tech/Aurelix" target="_blank" class="text-info text-decoration-none"><strong>📂 View GitHub Repository</strong></a>
      `;
    }

    if (q.includes('admission') || q.includes('biotech') || q.includes('internship') || q.includes('softpro')) {
      return `
        <strong>💼 Softpro India Internship &amp; Biotech Project:</strong><br>
        &bull; Ayush completed a 45-day on-site Summer Internship in <strong>Python with Django</strong> at <em>Softpro India Computer Technologies Pvt. Ltd., Lucknow</em>.<br>
        &bull; Achieved the highest performance rating: <strong>A++ Grade</strong>!<br>
        &bull; Built the client-side <strong>Biotech Park Lucknow Online Admission System</strong> handling document verification, admission tokens, and fee management.<br>
        &bull; Won the <strong>Best Speaker Award (2026)</strong>!
      `;
    }

    if (q.includes('cgpa') || q.includes('college') || q.includes('education') || q.includes('dronacharya') || q.includes('aktu') || q.includes('school')) {
      return `
        <strong>🎓 Education &amp; Academic Credentials:</strong><br>
        &bull; <strong>B.Tech CSE (AI &amp; ML):</strong> Dronacharya Group of Institutions (AKTU), 2024–2028 | <strong>CGPA: 8.03 / 10</strong><br>
        &bull; <strong>Grade 12th Senior Secondary:</strong> Saraswati Vidya Mandir Inter College | <strong>81.2%</strong><br>
        &bull; <strong>Grade 10th Secondary:</strong> Saraswati Vidya Mandir Inter College | <strong>90.5%</strong><br>
        &bull; <strong>Leadership:</strong> Social Media Co-Head @ Aarohan Coding Club.
      `;
    }

    if (q.includes('contact') || q.includes('email') || q.includes('phone') || q.includes('hire') || q.includes('reach') || q.includes('message')) {
      return `
        <strong>📬 Contact Ayush Saxena:</strong><br>
        &bull; <strong>Email:</strong> <a href="mailto:saxenaayush2809@gmail.com" class="text-info text-decoration-none">saxenaayush2809@gmail.com</a><br>
        &bull; <strong>Phone:</strong> +91 9528055151<br>
        &bull; <strong>Location:</strong> Greater Noida, Uttar Pradesh, India<br>
        &bull; <strong>LinkedIn:</strong> <a href="https://www.linkedin.com/in/ayush-saxena-2809s/" target="_blank" class="text-info text-decoration-none">ayush-saxena-2809s</a><br>
        &bull; <strong>GitHub:</strong> <a href="https://github.com/Ayush2809-tech" target="_blank" class="text-info text-decoration-none">@Ayush2809-tech</a>
      `;
    }

    if (q.includes('resume') || q.includes('cv') || q.includes('download') || q.includes('pdf')) {
      return `
        <strong>📄 Ayush's ATS-Compliant Resume:</strong><br>
        You can download the official formatted resume right here:<br><br>
        <button type="button" class="btn btn-sm btn-glow-primary mb-2 me-1" onclick="downloadATSResume()">
          <i class="bi bi-file-earmark-pdf-fill"></i> Download / Print ATS PDF
        </button>
        <button type="button" class="btn btn-sm btn-glass-secondary mb-2" onclick="downloadATSText()">
          <i class="bi bi-file-text-fill"></i> Download ATS .TXT
        </button>
      `;
    }

    if (q.includes('hello') || q.includes('hi') || q.includes('hey') || q.includes('who are you')) {
      return `
        👋 Hello! I am Ayush's virtual AI assistant. I have full knowledge of Ayush's projects (like Aurelix and Biotech Park), his internship at Softpro India (A++ Grade), tech skills (Python, Django, Java, DSA, PostgreSQL), and contact info. How can I help you today?
      `;
    }

    // Default intelligent fallback
    return `
      I understand you are asking about: "<em>${escapeHtml(query)}</em>".<br>
      Ayush is a pre-final year <strong>B.Tech CSE (AI &amp; ML)</strong> engineer with an <strong>8.03 CGPA</strong> at AKTU, an <strong>A++ grade Softpro India internship</strong>, and production projects like <strong>Aurelix</strong>.<br><br>
      Feel free to tap one of these quick topics:
      <div class="ai-chips-container">
        <button type="button" class="ai-prompt-chip" data-prompt="What is Ayush's tech stack?">💻 Tech Stack</button>
        <button type="button" class="ai-prompt-chip" data-prompt="Tell me about Aurelix project">🚀 Aurelix Project</button>
        <button type="button" class="ai-prompt-chip" data-prompt="Download resume">📄 Download Resume</button>
        <button type="button" class="ai-prompt-chip" data-prompt="How can I contact Ayush?">📬 Contact Ayush</button>
      </div>
    `;
  }
}
