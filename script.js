// ================================
// ACM CST — Cyberpunk Build JS
// ================================

const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const isTouch = window.matchMedia('(hover: none), (pointer: coarse)').matches;

gsap.registerPlugin(ScrollTrigger);

/* --------------------------------
   1. Boot sequence
   -------------------------------- */

function runBoot(onComplete) {
    const boot = document.getElementById('boot');
    const progress = document.getElementById('boot-progress');
    const text = document.getElementById('boot-text');

    if (prefersReducedMotion) {
        boot.style.display = 'none';
        onComplete();
        return;
    }

    const messages = [
        'INITIALIZING ACM_CST // SYSTEM',
        'LOADING MODULES...',
        'COMPILING INTERFACE...',
        'READY.'
    ];
    let i = 0;

    const msgInterval = setInterval(() => {
        i++;
        if (i < messages.length) text.textContent = messages[i];
    }, 380);

    gsap.to(progress, {
        width: '100%',
        duration: 1.5,
        ease: 'power2.inOut',
        onComplete: () => {
            clearInterval(msgInterval);
            gsap.to(boot, {
                opacity: 0,
                duration: 0.6,
                delay: 0.15,
                ease: 'power1.out',
                onComplete: () => {
                    boot.style.display = 'none';
                    onComplete();
                }
            });
        }
    });
}

/* --------------------------------
   2. Lenis smooth scroll + GSAP sync
   -------------------------------- */

function initSmoothScroll() {
    const lenis = new Lenis({
        duration: 1.1,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        smoothWheel: true,
    });

    lenis.on('scroll', ScrollTrigger.update);

    gsap.ticker.add((time) => {
        lenis.raf(time * 1000);
    });
    gsap.ticker.lagSmoothing(0);

    // Anchor links scroll via Lenis
    document.querySelectorAll('a[href^="#"]').forEach((link) => {
        link.addEventListener('click', (e) => {
            const target = document.querySelector(link.getAttribute('href'));
            if (target) {
                e.preventDefault();
                lenis.scrollTo(target, { offset: -80 });
            }
        });
    });

    return lenis;
}

/* --------------------------------
   3. Custom cursor
   -------------------------------- */

function initCursor() {
    if (isTouch) return;

    const dot = document.querySelector('.cursor-dot');
    const ring = document.querySelector('.cursor-ring');
    let mx = window.innerWidth / 2, my = window.innerHeight / 2;
    let rx = mx, ry = my;

    window.addEventListener('mousemove', (e) => {
        mx = e.clientX;
        my = e.clientY;
        dot.style.left = mx + 'px';
        dot.style.top = my + 'px';
    });

    function loop() {
        rx += (mx - rx) * 0.15;
        ry += (my - ry) * 0.15;
        ring.style.left = rx + 'px';
        ring.style.top = ry + 'px';
        requestAnimationFrame(loop);
    }
    loop();

    document.querySelectorAll('a, button, .event-card, .activity, .hero-card').forEach((el) => {
        el.addEventListener('mouseenter', () => ring.classList.add('active'));
        el.addEventListener('mouseleave', () => ring.classList.remove('active'));
    });
}

/* --------------------------------
   4. Three.js synthwave grid background
   -------------------------------- */

function initWebGLBackground() {
    const canvas = document.getElementById('bg-canvas');
    if (prefersReducedMotion || !window.THREE) {
        canvas.style.display = 'none';
        return;
    }

    const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(window.innerWidth, window.innerHeight);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 200);
    camera.position.set(0, 2.2, 7);
    camera.rotation.x = -0.15;

    // Grid floor
    const grid = new THREE.GridHelper(60, 60, 0x00f0ff, 0x2a2a55);
    grid.position.y = -2;
    grid.material.transparent = true;
    grid.material.opacity = 0.35;
    scene.add(grid);

    const gridBack = grid.clone();
    gridBack.position.y = -2;
    gridBack.position.z = -60;

    // Particle field
    const particleCount = 500;
    const positions = new Float32Array(particleCount * 3);
    for (let p = 0; p < particleCount; p++) {
        positions[p * 3] = (Math.random() - 0.5) * 60;
        positions[p * 3 + 1] = Math.random() * 20 - 2;
        positions[p * 3 + 2] = (Math.random() - 0.5) * 100;
    }
    const particleGeo = new THREE.BufferGeometry();
    particleGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    const particleMat = new THREE.PointsMaterial({
        color: 0xff2d95,
        size: 0.06,
        transparent: true,
        opacity: 0.7,
    });
    const particles = new THREE.Points(particleGeo, particleMat);
    scene.add(particles);

    let mouseX = 0, mouseY = 0;
    window.addEventListener('mousemove', (e) => {
        mouseX = (e.clientX / window.innerWidth - 0.5);
        mouseY = (e.clientY / window.innerHeight - 0.5);
    });

    let clock = new THREE.Clock();

    function animate() {
        requestAnimationFrame(animate);
        const t = clock.getElapsedTime();

        grid.position.z = (t * 3) % 4;
        particles.rotation.y = t * 0.02;

        camera.position.x += (mouseX * 1.5 - camera.position.x) * 0.02;
        camera.position.y += (2.2 - mouseY * 1.2 - camera.position.y) * 0.02;
        camera.lookAt(0, 0, -10);

        renderer.render(scene, camera);
    }
    animate();

    window.addEventListener('resize', () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    });
}

/* --------------------------------
   5. Hero entrance (glitch title)
   -------------------------------- */

function heroEntrance() {
    const tl = gsap.timeline({ defaults: { ease: 'power4.out' } });

    tl.from('.hero h1 .line span', {
        yPercent: 120,
        duration: 1,
        stagger: 0.12,
    })
    .from('.eyebrow', { opacity: 0, y: -10, duration: 0.6 }, '-=0.7')
    .from('.hero-text', { opacity: 0, y: 16, duration: 0.7 }, '-=0.6')
    .from('.hero-buttons .btn', { opacity: 0, y: 16, stagger: 0.1, duration: 0.6 }, '-=0.5')
    .from('.hero-card', { opacity: 0, x: 30, duration: 0.8 }, '-=0.6');

    // Subtle glitch flicker on the CST accent, once
    gsap.to('.hero h1 .accent', {
        textShadow: '2px 0 0 var(--magenta), -2px 0 0 var(--cyan), 0 0 26px rgba(0,240,255,0.55)',
        duration: 0.06,
        repeat: 5,
        yoyo: true,
        delay: 1.6,
    });
}

/* --------------------------------
   6. Scroll reveals
   -------------------------------- */

function initScrollReveals() {
    gsap.utils.toArray('.reveal').forEach((el) => {
        gsap.fromTo(el,
            { opacity: 0, y: 30 },
            {
                opacity: 1,
                y: 0,
                duration: 0.9,
                ease: 'power3.out',
                scrollTrigger: {
                    trigger: el,
                    start: 'top 85%',
                    once: true,
                },
            }
        );
    });

    // Stagger children inside grids
    [
        { parent: '.event-grid', children: '.event-card' },
        { parent: '.activity-grid', children: '.activity' },
    ].forEach(({ parent, children }) => {
        const p = document.querySelector(parent);
        if (!p) return;
        gsap.fromTo(p.querySelectorAll(children),
            { opacity: 0, y: 40 },
            {
                opacity: 1,
                y: 0,
                duration: 0.8,
                stagger: 0.12,
                ease: 'power3.out',
                scrollTrigger: {
                    trigger: p,
                    start: 'top 80%',
                    once: true,
                },
            }
        );
    });
}

/* --------------------------------
   7. Counter animation for stats
   -------------------------------- */

function initCounters() {
    document.querySelectorAll('.stat strong').forEach((el) => {
        const target = parseInt(el.dataset.count, 10);
        const obj = { val: 0 };
        ScrollTrigger.create({
            trigger: el,
            start: 'top 90%',
            once: true,
            onEnter: () => {
                gsap.to(obj, {
                    val: target,
                    duration: 1,
                    ease: 'power2.out',
                    onUpdate: () => {
                        el.textContent = String(Math.round(obj.val)).padStart(2, '0');
                    },
                });
            },
        });
    });
}

/* --------------------------------
   8. Nav active-link highlighting
   -------------------------------- */

function initNavHighlight() {
    const navLinks = document.querySelectorAll('.navbar nav a');
    const sections = document.querySelectorAll('section[id]');

    navLinks.forEach((link) => {
        link.addEventListener('click', () => {
            navLinks.forEach((item) => item.classList.remove('active'));
            link.classList.add('active');
        });
    });

    ScrollTrigger.create({
        start: 0,
        end: 'max',
        onUpdate: () => {
            let current = '';
            sections.forEach((section) => {
                const rect = section.getBoundingClientRect();
                if (rect.top <= 150 && rect.bottom > 150) {
                    current = section.getAttribute('id');
                }
            });
            if (current) {
                navLinks.forEach((link) => {
                    link.classList.toggle('active', link.getAttribute('href') === `#${current}`);
                });
            }
        },
    });
}

/* --------------------------------
   Boot everything
   -------------------------------- */

document.addEventListener('DOMContentLoaded', () => {
    initCursor();
    initWebGLBackground();

    runBoot(() => {
        initSmoothScroll();
        heroEntrance();
        initScrollReveals();
        initCounters();
        initNavHighlight();
        ScrollTrigger.refresh();
    });
});