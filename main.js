/* ============================================
   ArcticUNI — Main JavaScript
   Northern Lights Animation + Interactions
   ============================================ */

(function () {
    'use strict';

    /* ---------- Aurora Borealis Canvas Animation ---------- */
    class AuroraAnimation {
        constructor(canvas) {
            this.canvas = canvas;
            this.ctx = canvas.getContext('2d');
            this.bands = [];
            this.time = 0;
            this.running = true;

            this.resize();
            this.createBands();
            window.addEventListener('resize', () => this.resize());
        }

        resize() {
            this.canvas.width = window.innerWidth;
            this.canvas.height = window.innerHeight;
        }

        createBands() {
            // Natural aurora colors — mostly green with hints of purple at edges
            const colors = [
                { r: 57, g: 255, b: 120 },    // classic aurora green
                { r: 80, g: 240, b: 130 },    // natural green
                { r: 40, g: 220, b: 110 },    // deeper green
                { r: 100, g: 255, b: 150 },   // bright green
                { r: 50, g: 200, b: 120 },    // muted green
                { r: 120, g: 80, b: 200 },    // purple fringe (rarer)
                { r: 70, g: 245, b: 140 },    // green
            ];

            for (let i = 0; i < 7; i++) {
                const segments = 16; // more segments = smoother curves
                const points = [];
                for (let j = 0; j <= segments; j++) {
                    points.push({
                        x: (j / segments),
                        baseY: 0.04 + Math.random() * 0.22,
                        phase: Math.random() * Math.PI * 2,
                        // Slower, more natural wave frequencies
                        freq: 0.15 + Math.random() * 0.35,
                        amp: 0.015 + Math.random() * 0.04,
                        // Secondary wave for organic movement
                        phase2: Math.random() * Math.PI * 2,
                        freq2: 0.08 + Math.random() * 0.15,
                        amp2: 0.008 + Math.random() * 0.02
                    });
                }

                this.bands.push({
                    points: points,
                    color: colors[i % colors.length],
                    opacity: 0.1 + Math.random() * 0.2,
                    speed: 0.0003 + Math.random() * 0.0004,
                    thickness: 0.1 + Math.random() * 0.18,
                    drift: Math.random() * Math.PI * 2,
                    // Slow intensity pulsing like real aurora
                    pulseFreq: 0.05 + Math.random() * 0.1
                });
            }
        }

        drawBand(band) {
            const ctx = this.ctx;
            const w = this.canvas.width;
            const h = this.canvas.height;
            const t = this.time;

            const currentPoints = band.points.map(p => ({
                x: p.x * w,
                y: (p.baseY
                    + Math.sin(t * p.freq + p.phase + band.drift) * p.amp
                    + Math.sin(t * p.freq2 + p.phase2) * p.amp2
                ) * h
            }));

            // Draw the aurora curtain
            ctx.beginPath();
            ctx.moveTo(currentPoints[0].x, currentPoints[0].y);

            for (let i = 0; i < currentPoints.length - 1; i++) {
                const curr = currentPoints[i];
                const next = currentPoints[i + 1];
                const cpx = (curr.x + next.x) / 2;
                const cpy = (curr.y + next.y) / 2;
                ctx.quadraticCurveTo(curr.x, curr.y, cpx, cpy);
            }

            const last = currentPoints[currentPoints.length - 1];
            ctx.lineTo(last.x, last.y);

            // Extend downward to create the curtain effect
            const curtainDepth = band.thickness * h;
            for (let i = currentPoints.length - 1; i >= 0; i--) {
                const p = currentPoints[i];
                const wave = Math.sin(t * 0.2 + i * 0.8 + band.drift) * 20;
                if (i === currentPoints.length - 1) {
                    ctx.lineTo(p.x, p.y + curtainDepth + wave);
                } else if (i === 0) {
                    ctx.lineTo(p.x, p.y + curtainDepth + wave);
                } else {
                    const prev = currentPoints[i + 1];
                    const cpx = (p.x + prev.x) / 2;
                    const cpy = ((p.y + curtainDepth + wave) + (prev.y + curtainDepth + Math.sin(t * 0.2 + (i + 1) * 0.8 + band.drift) * 20)) / 2;
                    ctx.quadraticCurveTo(prev.x, prev.y + curtainDepth + Math.sin(t * 0.2 + (i + 1) * 0.8 + band.drift) * 20, cpx, cpy);
                }
            }

            ctx.closePath();

            // Create vertical gradient for the curtain
            const minY = Math.min(...currentPoints.map(p => p.y));
            const gradient = ctx.createLinearGradient(0, minY, 0, minY + curtainDepth);

            const { r, g, b } = band.color;
            const pulse = 0.6 + Math.sin(t * band.pulseFreq + band.drift) * 0.4;
            const alpha = band.opacity * pulse;

            gradient.addColorStop(0, `rgba(${r}, ${g}, ${b}, ${alpha * 0.5})`);
            gradient.addColorStop(0.15, `rgba(${r}, ${g}, ${b}, ${alpha * 1.2})`);
            gradient.addColorStop(0.35, `rgba(${r}, ${g}, ${b}, ${alpha * 0.8})`);
            gradient.addColorStop(0.6, `rgba(${r}, ${g}, ${b}, ${alpha * 0.4})`);
            gradient.addColorStop(1, `rgba(${r}, ${g}, ${b}, 0)`);

            ctx.fillStyle = gradient;
            ctx.fill();

            // Add a glow along the top edge
            ctx.beginPath();
            ctx.moveTo(currentPoints[0].x, currentPoints[0].y);
            for (let i = 0; i < currentPoints.length - 1; i++) {
                const curr = currentPoints[i];
                const next = currentPoints[i + 1];
                const cpx = (curr.x + next.x) / 2;
                const cpy = (curr.y + next.y) / 2;
                ctx.quadraticCurveTo(curr.x, curr.y, cpx, cpy);
            }
            ctx.strokeStyle = `rgba(${r}, ${g}, ${b}, ${alpha * 1.5})`;
            ctx.lineWidth = 3;
            ctx.shadowColor = `rgba(${r}, ${g}, ${b}, ${alpha * 1.2})`;
            ctx.shadowBlur = 50;
            ctx.stroke();
            ctx.shadowBlur = 0;
        }

        draw() {
            const ctx = this.ctx;
            ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

            // Sort bands by opacity for layering
            ctx.globalCompositeOperation = 'screen';

            for (const band of this.bands) {
                this.drawBand(band);
            }

            ctx.globalCompositeOperation = 'source-over';
        }

        animate(timestamp) {
            if (!this.running) return;
            this.time = timestamp * 0.001;
            this.draw();
            requestAnimationFrame((t) => this.animate(t));
        }

        start() {
            this.running = true;
            requestAnimationFrame((t) => this.animate(t));
        }

        stop() {
            this.running = false;
        }
    }

    /* ---------- Stars Background ---------- */
    function createStars() {
        const container = document.getElementById('heroStars');
        if (!container) return;

        const count = 120;
        for (let i = 0; i < count; i++) {
            const star = document.createElement('div');
            star.className = 'star';
            star.style.left = Math.random() * 100 + '%';
            star.style.top = Math.random() * 100 + '%';
            star.style.setProperty('--duration', (2 + Math.random() * 4) + 's');
            star.style.setProperty('--max-opacity', (0.3 + Math.random() * 0.7).toString());
            star.style.animationDelay = Math.random() * 4 + 's';

            const size = Math.random() < 0.1 ? 3 : (Math.random() < 0.3 ? 2 : 1);
            star.style.width = size + 'px';
            star.style.height = size + 'px';

            container.appendChild(star);
        }
    }

    /* ---------- Header Scroll Effect ---------- */
    function initHeader() {
        const header = document.getElementById('siteHeader');
        if (!header) return;

        let ticking = false;
        window.addEventListener('scroll', () => {
            if (!ticking) {
                requestAnimationFrame(() => {
                    header.classList.toggle('scrolled', window.scrollY > 60);
                    ticking = false;
                });
                ticking = true;
            }
        });
    }

    /* ---------- Mobile Navigation ---------- */
    function initMobileNav() {
        const toggle = document.getElementById('navToggle');
        const menu = document.getElementById('navMenu');
        if (!toggle || !menu) return;

        toggle.addEventListener('click', () => {
            menu.classList.toggle('open');
            toggle.classList.toggle('active');
        });

        // Close menu when clicking a link
        menu.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                menu.classList.remove('open');
                toggle.classList.remove('active');
            });
        });
    }

    /* ---------- Scroll Animations (Intersection Observer) ---------- */
    function initScrollAnimations() {
        const elements = document.querySelectorAll('.animate-on-scroll');
        if (!elements.length) return;

        const observer = new IntersectionObserver((entries) => {
            entries.forEach((entry, index) => {
                if (entry.isIntersecting) {
                    // Stagger the animation slightly for elements in the same viewport
                    setTimeout(() => {
                        entry.target.classList.add('visible');
                    }, index * 80);
                    observer.unobserve(entry.target);
                }
            });
        }, {
            threshold: 0.1,
            rootMargin: '0px 0px -40px 0px'
        });

        elements.forEach(el => observer.observe(el));
    }

    /* ---------- Smooth Scroll for Anchor Links ---------- */
    function initSmoothScroll() {
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function (e) {
                e.preventDefault();
                const target = document.querySelector(this.getAttribute('href'));
                if (target) {
                    const headerOffset = 80;
                    const elementPosition = target.getBoundingClientRect().top;
                    const offsetPosition = elementPosition + window.scrollY - headerOffset;

                    window.scrollTo({
                        top: offsetPosition,
                        behavior: 'smooth'
                    });
                }
            });
        });
    }

    /* ---------- Pause Aurora When Not Visible ---------- */
    function initVisibilityHandler(aurora) {
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                aurora.stop();
            } else {
                aurora.start();
            }
        });
    }

    /* ---------- Initialize Everything ---------- */
    function init() {
        // Aurora animation
        const canvas = document.getElementById('auroraCanvas');
        if (canvas) {
            const aurora = new AuroraAnimation(canvas);
            aurora.start();
            initVisibilityHandler(aurora);
        }

        // Stars
        createStars();

        // UI interactions
        initHeader();
        initMobileNav();
        initScrollAnimations();
        initSmoothScroll();
    }

    // Run on DOM ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})();
