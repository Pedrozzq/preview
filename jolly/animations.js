/* ==========================================================================
   The Jolly Washer — Premium Animation Layer
   All animation logic added for the "premium immersive" redesign lives here,
   kept separate from the existing inline scripts in index.html (which stay
   untouched: preloader, quote/WhatsApp forms, area modal, service-tag
   reveals, background parallax, bubbles, foam, gallery carousel, video
   showcase active-state).

   Every module below:
   - is additive (does nothing if its markup isn't present on the page)
   - runs once (no repeating/looping scroll-jank)
   - respects prefers-reduced-motion (see REDUCED_MOTION)
   ========================================================================== */

(function () {
    'use strict';

    const REDUCED_MOTION = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const IS_COARSE_POINTER = window.matchMedia('(pointer: coarse)').matches;

    if (REDUCED_MOTION) {
        document.documentElement.classList.add('reduced-motion');
    }

    function ready(fn) {
        if (document.readyState !== 'loading') fn();
        else document.addEventListener('DOMContentLoaded', fn);
    }

    /* ==========================================================
       1. GENERIC SCROLL REVEAL — .reveal-up
       Fade + up to 30px translateY + slight scale. One-time.
       Stagger via [data-stagger] (ms). Used on new sections only;
       does not touch the existing .animate-slide-up system.
       ========================================================== */
    function initScrollReveal() {
        const items = document.querySelectorAll('.reveal-up');
        if (!items.length) return;

        if (REDUCED_MOTION) {
            items.forEach((el) => el.classList.add('revealed'));
            return;
        }

        const observer = new IntersectionObserver(
            (entries, obs) => {
                entries.forEach((entry) => {
                    if (!entry.isIntersecting) return;
                    const delay = Number(entry.target.dataset.stagger || 0);
                    setTimeout(() => entry.target.classList.add('revealed'), delay);
                    obs.unobserve(entry.target);
                });
            },
            { threshold: 0.2 }
        );
        items.forEach((el) => observer.observe(el));
    }

    /* ==========================================================
       2. WATER TEXT REVEAL — .water-reveal
       Title starts blurred/hidden; a translucent blue mask sweeps
       across and reveals sharp text. Runs once, 700-1100ms (set in CSS).
       ========================================================== */
    function initWaterReveal() {
        const items = document.querySelectorAll('.water-reveal');
        if (!items.length) return;

        if (REDUCED_MOTION) {
            items.forEach((el) => el.classList.add('washed'));
            return;
        }

        const observer = new IntersectionObserver(
            (entries, obs) => {
                entries.forEach((entry) => {
                    if (!entry.isIntersecting) return;
                    entry.target.classList.add('washed');
                    obs.unobserve(entry.target);
                });
            },
            { threshold: 0.6 }
        );
        items.forEach((el) => observer.observe(el));
    }

    /* ==========================================================
       3. SITE BACKGROUND VIDEO — skip autoplay on slow/constrained
       connections (falls back to the poster image, which stays
       visible either way via the <video poster="..."> attribute).
       ========================================================== */
    function initHeroVideo() {
        const video = document.getElementById('bgVideo');
        if (!video) return;

        const conn = navigator.connection || navigator.webkitConnection || navigator.mozConnection;
        const isConstrained = !!(conn && (conn.saveData || /2g/.test(conn.effectiveType || '')));

        if (isConstrained || REDUCED_MOTION) {
            video.removeAttribute('autoplay');
            video.preload = 'none';
            return; // poster image remains the visible fallback
        }

        video.addEventListener('canplay', () => video.classList.add('is-ready'), { once: true });
        video.play().catch(() => {
            /* autoplay blocked — poster stays visible, no error surfaced */
        });
    }

    /* ==========================================================
       4. DRAG COMPARATOR — mouse, touch, keyboard
       ========================================================== */
    function initComparator() {
        const wrap = document.querySelector('.compare-wrap');
        if (!wrap) return;
        const afterLayer = wrap.querySelector('.compare-after');
        const handle = wrap.querySelector('.compare-handle');
        const hint = wrap.querySelector('.compare-hint');
        if (!afterLayer || !handle) return;

        let dragging = false;

        function setPosition(pct) {
            pct = Math.min(100, Math.max(0, pct));
            afterLayer.style.clipPath = 'inset(0 ' + (100 - pct) + '% 0 0)';
            handle.style.left = pct + '%';
            handle.setAttribute('aria-valuenow', String(Math.round(pct)));
        }

        function pctFromClientX(clientX) {
            const rect = wrap.getBoundingClientRect();
            return ((clientX - rect.left) / rect.width) * 100;
        }

        function startDrag(clientX) {
            dragging = true;
            wrap.classList.add('dragging');
            if (hint) hint.classList.add('dismissed');
            setPosition(pctFromClientX(clientX));
        }
        function moveDrag(clientX) {
            if (dragging) setPosition(pctFromClientX(clientX));
        }
        function endDrag() {
            dragging = false;
            wrap.classList.remove('dragging');
        }

        handle.addEventListener('pointerdown', (e) => {
            startDrag(e.clientX);
            handle.setPointerCapture(e.pointerId);
        });
        wrap.addEventListener('pointerdown', (e) => {
            if (e.target === handle) return;
            startDrag(e.clientX);
        });
        window.addEventListener('pointermove', (e) => moveDrag(e.clientX));
        window.addEventListener('pointerup', endDrag);
        window.addEventListener('pointercancel', endDrag);

        handle.addEventListener('keydown', (e) => {
            const current = parseFloat(handle.style.left) || 50;
            if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') {
                setPosition(current - 5);
                if (hint) hint.classList.add('dismissed');
                e.preventDefault();
            } else if (e.key === 'ArrowRight' || e.key === 'ArrowUp') {
                setPosition(current + 5);
                if (hint) hint.classList.add('dismissed');
                e.preventDefault();
            } else if (e.key === 'Home') {
                setPosition(0);
                e.preventDefault();
            } else if (e.key === 'End') {
                setPosition(100);
                e.preventDefault();
            }
        });

        setPosition(50);

        // One-time automatic demo sweep when the comparator first enters
        // the viewport, purely to hint at the interaction — then the
        // visitor is in full control and it never repeats.
        const demoObserver = new IntersectionObserver(
            (entries, obs) => {
                entries.forEach((entry) => {
                    if (!entry.isIntersecting) return;
                    obs.disconnect();
                    if (REDUCED_MOTION) return;
                    let t = 0;
                    const demo = setInterval(() => {
                        t += 0.045;
                        const eased = 50 + Math.sin(t) * 22 * Math.exp(-t * 0.35);
                        if (!dragging) setPosition(eased);
                        if (t > 6.4) {
                            clearInterval(demo);
                            if (!dragging) setPosition(50);
                        }
                    }, 16);
                });
            },
            { threshold: 0.5 }
        );
        demoObserver.observe(wrap);
    }

    /* ==========================================================
       5. 3D TILT SERVICE CARDS
       Disabled on touch devices and under reduced motion — those
       get a simple one-time entrance instead (handled by .reveal-up).
       ========================================================== */
    function initTiltCards() {
        const cards = document.querySelectorAll('.tilt-card');
        if (!cards.length || REDUCED_MOTION || IS_COARSE_POINTER) return;

        const MAX_TILT = 5; // degrees, within the requested 4-6 range

        cards.forEach((card) => {
            card.addEventListener('pointermove', (e) => {
                const rect = card.getBoundingClientRect();
                const x = (e.clientX - rect.left) / rect.width - 0.5;
                const y = (e.clientY - rect.top) / rect.height - 0.5;
                card.style.transform =
                    'perspective(700px) rotateX(' + (-y * MAX_TILT).toFixed(2) + 'deg) ' +
                    'rotateY(' + (x * MAX_TILT).toFixed(2) + 'deg) scale(1.02)';
                card.style.setProperty('--glow-x', ((x + 0.5) * 100).toFixed(1) + '%');
                card.style.setProperty('--glow-y', ((y + 0.5) * 100).toFixed(1) + '%');
                const img = card.querySelector('.tilt-card-media');
                if (img) img.style.transform = 'scale(1.04)';
            });
            card.addEventListener('pointerleave', () => {
                card.style.transform = 'perspective(700px) rotateX(0deg) rotateY(0deg) scale(1)';
                const img = card.querySelector('.tilt-card-media');
                if (img) img.style.transform = 'scale(1)';
            });
        });
    }

    /* ==========================================================
       7. AREAS WE SERVE — staggered "lighting up" of city chips,
       and a soft entrance for the map modal box. Does not touch
       the existing Google My Maps iframe/integration.
       ========================================================== */
    function initAreasAnimation() {
        const section = document.getElementById('service-area');
        if (section) {
            const chips = section.querySelectorAll('.area-chip');
            if (chips.length) {
                const observer = new IntersectionObserver(
                    (entries, obs) => {
                        entries.forEach((entry) => {
                            if (!entry.isIntersecting) return;
                            chips.forEach((chip, i) => {
                                const delay = REDUCED_MOTION ? 0 : i * 55;
                                setTimeout(() => chip.classList.add('area-lit-sequence'), delay);
                            });
                            obs.unobserve(entry.target);
                        });
                    },
                    { threshold: 0.3 }
                );
                observer.observe(section);
            }
        }

        const modalBox = document.querySelector('.area-modal-box');
        const modal = document.getElementById('areaModal');
        if (modalBox && modal && !REDUCED_MOTION) {
            const mo = new MutationObserver(() => {
                if (modal.classList.contains('open')) {
                    modalBox.classList.remove('area-modal-box-enter');
                    // force reflow so the animation can restart on reopen
                    void modalBox.offsetWidth;
                    modalBox.classList.add('area-modal-box-enter');
                }
            });
            mo.observe(modal, { attributes: true, attributeFilter: ['class'] });
        }
    }

    /* ==========================================================
       8. PREMIUM BUTTONS — click ripple from the exact pointer
       position. The hover shine/press-compress live entirely in
       CSS (see .btn-premium rules).
       ========================================================== */
    function initPremiumButtons() {
        const buttons = document.querySelectorAll('.btn-premium');
        if (!buttons.length) return;
        buttons.forEach((btn) => {
            btn.addEventListener('pointerdown', (e) => {
                if (REDUCED_MOTION) return;
                const rect = btn.getBoundingClientRect();
                const ripple = document.createElement('span');
                ripple.className = 'btn-ripple';
                ripple.style.left = (e.clientX - rect.left) + 'px';
                ripple.style.top = (e.clientY - rect.top) + 'px';
                btn.appendChild(ripple);
                ripple.addEventListener('animationend', () => ripple.remove(), { once: true });
            });
        });
    }

    /* ==========================================================
       9. HERO CTA WIRING — reuses the existing quote toggle/form
       instead of duplicating its logic.
       ========================================================== */
    function initHeroCtaLinks() {
        const existingQuoteToggle = document.getElementById('quoteToggle');
        if (!existingQuoteToggle) return;
        ['heroQuoteBtn', 'closingQuoteBtn'].forEach((id) => {
            const btn = document.getElementById(id);
            if (!btn) return;
            btn.addEventListener('click', () => {
                existingQuoteToggle.scrollIntoView({ behavior: 'smooth', block: 'center' });
                setTimeout(() => {
                    const form = document.getElementById('quoteForm');
                    if (!form || !form.classList.contains('open')) existingQuoteToggle.click();
                }, 450);
            });
        });
    }

    /* ==========================================================
       Init — all modules are no-ops if their markup is absent.
       ========================================================== */
    ready(function () {
        initScrollReveal();
        initWaterReveal();
        initHeroCleanReveal();
        initHeroVideo();
        initHeroCtaLinks();
        initComparator();
        initTiltCards();
        initAreasAnimation();
        initPremiumButtons();
    });
})();
