/**
 * المعدات الثقيله - Landing Page Scripts
 * Theme, AOS, Vanilla-tilt, Three.js Hero 3D, Book Equipment modal
 */

(function () {
  'use strict';

  const THEME_KEY = 'heavy-equip-theme';
  const THEME_DARK = 'dark';
  const THEME_LIGHT = 'light';

  // ---------- Theme ----------
  function getStoredTheme() {
    return localStorage.getItem(THEME_KEY) || THEME_LIGHT;
  }

  function setTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme === THEME_DARK ? THEME_DARK : '');
    localStorage.setItem(THEME_KEY, theme);
    updateThemeIcon(theme);
  }

  function updateThemeIcon(theme) {
    const icon = document.getElementById('themeIcon');
    if (!icon) return;
    icon.classList.remove('fa-moon', 'fa-sun');
    icon.classList.add(theme === THEME_DARK ? 'fa-sun' : 'fa-moon');
  }

  function toggleTheme() {
    const current = getStoredTheme();
    const next = current === THEME_DARK ? THEME_LIGHT : THEME_DARK;
    setTheme(next);
  }

  function initTheme() {
    const saved = getStoredTheme();
    setTheme(saved);
    const btn = document.getElementById('themeToggle');
    if (btn) btn.addEventListener('click', toggleTheme);
  }

  // ---------- Mobile Nav ----------
  function initNav() {
    const toggle = document.getElementById('navToggle');
    const links = document.getElementById('navLinks');
    if (!toggle || !links) return;

    toggle.addEventListener('click', function (e) {
      e.preventDefault();
      links.classList.toggle('is-open');
      const isOpen = links.classList.contains('is-open');
      toggle.setAttribute('aria-label', isOpen ? 'إغلاق القائمة' : 'فتح القائمة');
      toggle.querySelector('i').className = isOpen ? 'fas fa-times' : 'fas fa-bars';
    });

    links.querySelectorAll('a').forEach(function (a) {
      a.addEventListener('click', function () {
        links.classList.remove('is-open');
        toggle.querySelector('i').className = 'fas fa-bars';
        toggle.setAttribute('aria-label', 'فتح القائمة');
      });
    });
  }

  // ---------- AOS (Animate On Scroll) ----------
  function initAOS() {
    if (typeof AOS === 'undefined') return;
    AOS.init({
      duration: 600,
      easing: 'ease-out-cubic',
      once: true,
      offset: 60
    });
  }

  // ---------- Vanilla Tilt (3D card effects on cards & mobile screens) ----------
  function initTilt() {
    if (typeof VanillaTilt === 'undefined') return;
    const cards = document.querySelectorAll('.card--tilt, .screen-card--tilt');
    cards.forEach(function (el) {
      VanillaTilt.init(el, {
        max: 8,
        speed: 400,
        glare: true,
        'max-glare': 0.15,
        scale: 1.02
      });
    });
  }

  // ---------- Three.js Hero 3D — Cinematic Particle + Equipment Scene ----------
  function initHero3d() {
    var canvas = document.getElementById('hero3d');
    var heroEl = document.getElementById('hero');
    if (!canvas || !heroEl || typeof THREE === 'undefined') return;

    /* ── Renderer ── */
    var scene = new THREE.Scene();
    var camera = new THREE.PerspectiveCamera(55, 1, 0.1, 200);
    var renderer = new THREE.WebGLRenderer({ canvas: canvas, alpha: true, antialias: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
    renderer.setClearColor(0x000000, 0);

    /* ── Resize handler ── */
    function resize() {
      var W = heroEl.clientWidth;
      var H = heroEl.clientHeight;
      renderer.setSize(W, H);
      camera.aspect = W / H;
      camera.updateProjectionMatrix();
    }
    resize();
    window.addEventListener('resize', resize);

    /* ── Color helper (theme-aware) ── */
    function isPrimaryDark() {
      return document.documentElement.getAttribute('data-theme') === 'dark';
    }
    /* Brand amber colours from app screenshots */
    function primaryHex() { return isPrimaryDark() ? 0xF59E0B : 0xD97706; }
    function accentHex() { return isPrimaryDark() ? 0xFBBF24 : 0xB45309; }

    camera.position.set(0, 0, 14);

    /* ══ 1. Star/particle field ══ */
    var STAR_COUNT = 280;
    var starPositions = new Float32Array(STAR_COUNT * 3);
    var starSpeeds = new Float32Array(STAR_COUNT);
    for (var i = 0; i < STAR_COUNT; i++) {
      starPositions[i * 3] = (Math.random() - 0.5) * 40;
      starPositions[i * 3 + 1] = (Math.random() - 0.5) * 26;
      starPositions[i * 3 + 2] = (Math.random() - 0.5) * 16 - 4;
      starSpeeds[i] = 0.002 + Math.random() * 0.004;
    }
    var starGeo = new THREE.BufferGeometry();
    starGeo.setAttribute('position', new THREE.BufferAttribute(starPositions, 3));
    var starMat = new THREE.PointsMaterial({ color: primaryHex(), size: 0.06, transparent: true, opacity: 0.55 });
    var stars = new THREE.Points(starGeo, starMat);
    scene.add(stars);

    /* ══ 2. Floating equipment shapes ══ */
    var floaterDefs = [
      { geo: new THREE.OctahedronGeometry(0.5, 0), pos: [-6, 2.5, -3], col: primaryHex(), wire: false },
      { geo: new THREE.TorusKnotGeometry(0.45, 0.15, 80, 12), pos: [5.5, 1.5, -2], col: primaryHex(), wire: false },
      { geo: new THREE.IcosahedronGeometry(0.45, 0), pos: [-4.5, -2.5, -1], col: accentHex(), wire: false },
      { geo: new THREE.TorusGeometry(0.5, 0.15, 12, 32), pos: [4, -2, -3], col: accentHex(), wire: false },
      { geo: new THREE.BoxGeometry(0.55, 0.55, 0.55), pos: [-7.5, 0, -4], col: primaryHex(), wire: true },
      { geo: new THREE.ConeGeometry(0.35, 0.7, 7), pos: [7, 2.5, -5], col: accentHex(), wire: false },
      { geo: new THREE.TetrahedronGeometry(0.4, 0), pos: [-3, 3.5, -4], col: primaryHex(), wire: false },
      { geo: new THREE.DodecahedronGeometry(0.4, 0), pos: [6.5, -3, -4], col: accentHex(), wire: false },
    ];

    var floaters = floaterDefs.map(function (d) {
      var mat = new THREE.MeshPhongMaterial({
        color: d.col,
        wireframe: d.wire,
        transparent: true,
        opacity: d.wire ? 0.35 : 0.65,
        shininess: 70,
        specular: 0x88ffee,
        emissive: d.col,
        emissiveIntensity: 0.06
      });
      var mesh = new THREE.Mesh(d.geo, mat);
      mesh.position.set(d.pos[0], d.pos[1], d.pos[2]);
      scene.add(mesh);
      return {
        mesh: mesh,
        rotSpd: new THREE.Vector3(
          0.004 + Math.random() * 0.006,
          0.005 + Math.random() * 0.007,
          0.002 + Math.random() * 0.003
        ),
        floatOffset: Math.random() * Math.PI * 2,
        floatAmp: 0.12 + Math.random() * 0.12,
        floatSpd: 0.4 + Math.random() * 0.5,
        baseY: d.pos[1]
      };
    });

    /* ══ 3. Connecting lines (sparse web) ══ */
    var LINE_COUNT = 8;
    var lineMat = new THREE.LineBasicMaterial({ color: primaryHex(), transparent: true, opacity: 0.08 });
    for (var l = 0; l < LINE_COUNT; l++) {
      var pts = [];
      var a = floaters[Math.floor(Math.random() * floaters.length)];
      var b = floaters[Math.floor(Math.random() * floaters.length)];
      pts.push(a.mesh.position.clone());
      pts.push(b.mesh.position.clone());
      var lineGeo = new THREE.BufferGeometry().setFromPoints(pts);
      scene.add(new THREE.Line(lineGeo, lineMat));
    }

    /* ══ 4. Subtle grid floor ══ */
    var grid = new THREE.GridHelper(50, 40, primaryHex(), primaryHex());
    grid.position.y = -6;
    grid.material.transparent = true;
    grid.material.opacity = 0.06;
    scene.add(grid);

    /* ══ 5. Lights ══ */
    scene.add(new THREE.AmbientLight(0xffffff, 0.25));

    var dirLight = new THREE.DirectionalLight(0xffffff, 0.5);
    dirLight.position.set(8, 10, 6);
    scene.add(dirLight);

    /* Primary teal point light — orbits scene */
    var pLight = new THREE.PointLight(primaryHex(), 2.5, 20);
    pLight.position.set(3, 1, 5);
    scene.add(pLight);

    /* Amber accent back-light */
    var aLight = new THREE.PointLight(0xF59E0B, 1.4, 18);
    aLight.position.set(-6, 3, 2);
    scene.add(aLight);

    /* Warm rim fill */
    var rimLight = new THREE.PointLight(0xFCD34D, 0.5, 22);
    rimLight.position.set(-2, -4, 8);
    scene.add(rimLight);

    /* ══ 6. Mouse parallax ══ */
    var mouse = { x: 0, y: 0 };
    var smooth = { x: 0, y: 0 };

    window.addEventListener('mousemove', function (e) {
      mouse.x = (e.clientX / window.innerWidth - 0.5) * 2;
      mouse.y = -(e.clientY / window.innerHeight - 0.5) * 2;
    });

    /* ══ 7. Theme-change observer — update material colors ══ */
    var themeObserver = new MutationObserver(function () {
      var pc = primaryHex();
      starMat.color.setHex(pc);
      pLight.color.setHex(pc);
      grid.material.color.setHex(pc);
      floaters.forEach(function (f, idx) {
        if (floaterDefs[idx].col !== accentHex()) {
          f.mesh.material.color.setHex(pc);
          f.mesh.material.emissive.setHex(pc);
        }
      });
    });
    themeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });

    /* ══ 8. Animation loop ══ */
    var clock = 0;
    function animate() {
      requestAnimationFrame(animate);
      clock += 0.016;

      /* Smooth mouse lerp */
      smooth.x += (mouse.x - smooth.x) * 0.04;
      smooth.y += (mouse.y - smooth.y) * 0.04;

      /* Camera parallax */
      camera.position.x = smooth.x * 1.5;
      camera.position.y = smooth.y * 1.0;
      camera.lookAt(0, 0, 0);

      /* Particle drift */
      stars.rotation.y += 0.0003;
      stars.rotation.x += 0.0001;

      /* Orbit primary light */
      pLight.position.x = 3 + Math.sin(clock * 0.45) * 5;
      pLight.position.y = 1 + Math.cos(clock * 0.35) * 3;
      pLight.intensity = 2.2 + Math.sin(clock * 1.2) * 0.4;

      /* Animate floaters */
      floaters.forEach(function (f) {
        f.mesh.rotation.x += f.rotSpd.x;
        f.mesh.rotation.y += f.rotSpd.y;
        f.mesh.rotation.z += f.rotSpd.z;
        f.mesh.position.y = f.baseY + Math.sin(clock * f.floatSpd + f.floatOffset) * f.floatAmp;
      });

      renderer.render(scene, camera);
    }
    animate();
  }

  // ---------- Book Equipment Modal ----------
  function initBookModal() {
    var modal = document.getElementById('bookModal');
    var backdrop = document.getElementById('modalBackdrop');
    var closeBtn = document.getElementById('modalClose');
    var form = document.getElementById('bookForm');
    if (!modal) return;

    function openModal() {
      modal.classList.add('is-open');
      modal.setAttribute('aria-hidden', 'false');
      if (closeBtn) closeBtn.focus();
    }

    function closeModal() {
      modal.classList.remove('is-open');
      modal.setAttribute('aria-hidden', 'true');
      if (window.history.replaceState) window.history.replaceState(null, '', window.location.pathname + window.location.search);
    }

    function onHashChange() {
      if (window.location.hash === '#book-equipment') openModal();
    }

    window.addEventListener('hashchange', onHashChange);
    if (window.location.hash === '#book-equipment') openModal();

    if (backdrop) backdrop.addEventListener('click', closeModal);
    if (closeBtn) closeBtn.addEventListener('click', closeModal);

    document.querySelectorAll('a[href="#book-equipment"]').forEach(function (a) {
      a.addEventListener('click', function (e) {
        e.preventDefault();
        window.location.hash = 'book-equipment';
        openModal();
      });
    });

    if (form) {
      form.addEventListener('submit', function (e) {
        e.preventDefault();
        // Premium UX: could send to backend or show success message
        closeModal();
      });
    }
  }

  // ---------- App Screens Swiper ----------
  function initSwiper() {
    if (typeof Swiper === 'undefined') return;

    new Swiper('.screens-swiper', {
      effect: 'coverflow',
      grabCursor: true,
      centeredSlides: true,
      slidesPerView: 'auto',
      loop: true,
      speed: 1000,
      coverflowEffect: {
        rotate: 35,
        stretch: -20,
        depth: 200,
        modifier: 1.5,
        slideShadows: true,
      },
      autoplay: {
        delay: 3000,
        disableOnInteraction: false,
      },
      pagination: {
        el: '.swiper-pagination',
        clickable: true,
        dynamicBullets: true,
      },
      navigation: {
        nextEl: '.swiper-button-next',
        prevEl: '.swiper-button-prev',
      },
      breakpoints: {
        320: {
          slidesPerView: 1,
          centeredSlides: true,
        },
        768: {
          slidesPerView: 3,
          centeredSlides: true,
        },
        1200: {
          slidesPerView: 6,
          centeredSlides: true,
        }
      }
    });
  }

  // ---------- Footer year ----------
  function setFooterYear() {
    var el = document.getElementById('year');
    if (el) el.textContent = new Date().getFullYear();
  }

  // ─────────────────────────────────────────────────────────────────
  // Hero-only confetti particles — ATTRACT toward cursor
  // Canvas sits inside the hero section (position:absolute, z-index:1)
  // so it stays under all hero content but above the Three.js canvas.
  // Mouse coords are computed relative to the hero element.
  // ─────────────────────────────────────────────────────────────────
  function initMouseParticles() {
    var heroEl = document.getElementById('hero');
    if (!heroEl) return;

    /* ── Canvas: absolute inside hero, below content ── */
    var cv = document.createElement('canvas');
    cv.setAttribute('aria-hidden', 'true');
    Object.assign(cv.style, {
      position: 'absolute',
      top: '0', left: '0',
      width: '100%', height: '100%',
      pointerEvents: 'none',
      zIndex: '1'   /* above Three.js canvas (0), below overlay (2) and content (3) */
    });
    heroEl.appendChild(cv);
    var ctx = cv.getContext('2d');

    /* ── Config ── */
    var TOTAL = 350;
    var ATTRACT = 190;   // attraction radius (px)
    var PULL = 7;     // pull force strength
    var MIN_DIST = 26;    // inner dead-zone — prevents pile-up at cursor
    var SPRING = 0.026; // spring back to home
    var DAMP = 0.85;
    var ALPHA = 0.82;

    /* Amber-anchored palette matching the app's brand */
    var PALETTE = [
      '#F59E0B', '#D97706', '#FBBF24',
      '#F97316', '#FCD34D', '#B45309',
      '#FDE68A', '#EA580C', '#FB923C',
      '#78350F', '#FEF3C7', '#92400E'
    ];

    /* ── State ── */
    var W, H;
    /* mouse coords relative to hero top-left */
    var mouse = { x: -9999, y: -9999, active: false };
    var parts = [];

    /* ── Build particles ── */
    function build(w, h) {
      parts = [];

      /* Grid-based placement: divide hero into TOTAL cells,
         shuffle them, then place each particle randomly inside
         its own cell → guaranteed spacing, zero overlap at home. */
      var cols = Math.ceil(Math.sqrt(TOTAL * (w / h)));
      var rows = Math.ceil(TOTAL / cols);
      var cellW = w / cols;
      var cellH = h / rows;
      var PAD = 0.18; /* padding inside each cell (fraction) */

      /* Shuffle cell indices */
      var cells = [];
      for (var k = 0; k < cols * rows; k++) cells.push(k);
      for (var k = cells.length - 1; k > 0; k--) {
        var j = Math.floor(Math.random() * (k + 1));
        var t = cells[k]; cells[k] = cells[j]; cells[j] = t;
      }

      for (var i = 0; i < TOTAL; i++) {
        var idx = cells[i] || i;
        var col = idx % cols;
        var row = Math.floor(idx / cols) % rows;
        var ox = (col + PAD + Math.random() * (1 - 2 * PAD)) * cellW;
        var oy = (row + PAD + Math.random() * (1 - 2 * PAD)) * cellH;
        var rect = Math.random() > 0.38;

        parts.push({
          x: ox, y: oy, ox: ox, oy: oy,
          vx: 0, vy: 0,
          /* Smaller sizes */
          pw: rect ? 1.5 + Math.random() * 2 : 0,
          ph: rect ? 4 + Math.random() * 5 : 0,
          pr: rect ? 0 : 1 + Math.random() * 1.5,
          rot: Math.random() * Math.PI * 2,
          rspd: (Math.random() - 0.5) * 0.09,
          color: PALETTE[i % PALETTE.length],
          rect: rect
        });
      }
    }

    /* ── Resize to match hero dimensions ── */
    function resize() {
      W = cv.width = heroEl.offsetWidth;
      H = cv.height = heroEl.offsetHeight;
      /* Re-assign home positions using the same grid logic */
      var cols = Math.ceil(Math.sqrt(TOTAL * (W / H)));
      var rows = Math.ceil(TOTAL / cols);
      var cellW = W / cols;
      var cellH = H / rows;
      var PAD = 0.18;
      parts.forEach(function (p, i) {
        var col = i % cols;
        var row = Math.floor(i / cols) % rows;
        p.ox = (col + PAD + Math.random() * (1 - 2 * PAD)) * cellW;
        p.oy = (row + PAD + Math.random() * (1 - 2 * PAD)) * cellH;
      });
    }

    build(heroEl.offsetWidth, heroEl.offsetHeight);
    resize();
    window.addEventListener('resize', resize);

    /* ── Mouse — coordinates relative to hero ── */
    heroEl.addEventListener('mousemove', function (e) {
      var r = heroEl.getBoundingClientRect();
      mouse.x = e.clientX - r.left;
      mouse.y = e.clientY - r.top;
      mouse.active = true;
    });
    heroEl.addEventListener('mouseleave', function () {
      mouse.active = false;
      mouse.x = -9999; mouse.y = -9999;
    });

    /* ── Frame loop ── */
    function tick() {
      ctx.clearRect(0, 0, W, H);

      for (var i = 0; i < parts.length; i++) {
        var p = parts[i];
        var dx = mouse.x - p.x;
        var dy = mouse.y - p.y;
        var d2 = dx * dx + dy * dy;

        if (mouse.active && d2 < ATTRACT * ATTRACT) {
          var d = Math.sqrt(d2);
          if (d > MIN_DIST) {
            var f = ((ATTRACT - d) / ATTRACT) * PULL;
            p.vx += (dx / d) * f;
            p.vy += (dy / d) * f;
          }
        }

        /* Spring back home */
        p.vx += (p.ox - p.x) * SPRING;
        p.vy += (p.oy - p.y) * SPRING;

        /* Damp + integrate */
        p.vx *= DAMP;
        p.vy *= DAMP;
        p.x += p.vx;
        p.y += p.vy;
        p.rot += p.rspd;

        /* Draw */
        ctx.save();
        ctx.globalAlpha = ALPHA;
        ctx.fillStyle = p.color;
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rot);
        if (p.rect) {
          ctx.fillRect(-p.pw * 0.5, -p.ph * 0.5, p.pw, p.ph);
        } else {
          ctx.beginPath();
          ctx.arc(0, 0, p.pr, 0, 6.2832);
          ctx.fill();
        }
        ctx.restore();
      }

      requestAnimationFrame(tick);
    }

    tick();
  }

  // ---------- Init ----------
  function init() {
    initTheme();
    initNav();
    setFooterYear();
    initAOS();
    initTilt();
    initHero3d();
    initBookModal();
    initMouseParticles();
    initSwiper();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
