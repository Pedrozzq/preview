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

        // Safety net: these titles start fully invisible (opacity:0) until
        // .washed is added, so if the observer ever fails to fire for one
        // (e.g. it never reaches 60% visibility in an unusual layout), it
        // would otherwise stay blank forever. Force it after a few seconds.
        setTimeout(() => {
            items.forEach((el) => el.classList.add('washed'));
        }, 4000);
    }

    /* ==========================================================
       3. SITE BACKGROUND VIDEO — plays regardless of the
       prefers-reduced-motion setting, since it's the site's actual
       background (not a decorative animation) — the added parallax
       movement on top of it is still turned off for that case via
       the .bg-truck-wrap rule in the reduced-motion media query.
       Only a metered/2G connection skips autoplay, falling back to
       the poster image (still visible via the <video poster> attr).
       ========================================================== */
    function initHeroVideo() {
        const video = document.getElementById('bgVideo');
        if (!video) return;

        const conn = navigator.connection || navigator.webkitConnection || navigator.mozConnection;
        const isConstrained = !!(conn && (conn.saveData || /2g/.test(conn.effectiveType || '')));

        if (isConstrained) {
            video.removeAttribute('autoplay');
            video.preload = 'none';
            return; // poster image remains the visible fallback
        }

        video.addEventListener('canplay', () => video.classList.add('is-ready'), { once: true });

        function tryPlay() {
            video.play().catch(() => {
                /* autoplay blocked — poster stays visible, no error surfaced */
            });
        }
        tryPlay();

        // Mobile browsers often pause the video when the tab/app is
        // backgrounded and don't always resume it on their own — nudge it
        // back to playing so it keeps rolling once the page is visible again.
        document.addEventListener('visibilitychange', () => {
            if (!document.hidden && video.paused) tryPlay();
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
            // "after" is clipped from the left so its visible sliver stays
            // on the right of the handle, matching the "After" label there
            // (and "before" showing through on the left, under "Before").
            afterLayer.style.clipPath = 'inset(0 0 0 ' + pct + '%)';
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
            // Don't hijack taps on the handle itself or on the prev/next
            // project buttons that sit inside this same wrapper — without
            // this check, tapping an arrow also started a drag underneath
            // it, which on touch swallowed the button's click entirely.
            if (e.target.closest('.compare-handle, .ba-carousel-arrow')) return;
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

        /* ---- Project switcher: prev/next + dots cycle through every
           before/after pair, reusing the same drag slider above. ---- */
        const beforeImg = document.getElementById('compareBeforeImg');
        const afterImg = document.getElementById('compareAfterImg');
        const projectLabel = document.getElementById('compareProjectLabel');
        const prevBtn = document.getElementById('comparePrev');
        const nextBtn = document.getElementById('compareNext');
        const dotsWrap = document.getElementById('compareDots');
        if (!beforeImg || !afterImg || !prevBtn || !nextBtn || !dotsWrap) return;

        const PROJECTS = [
            { before: 'img/ba-walkway-before.webp', after: 'img/ba-walkway-after.webp', label: 'Paver Walkway' },
            { before: 'img/ba-wood-deck-before.webp', after: 'img/ba-wood-deck-after.webp', label: 'Wood Deck' },
            { before: 'img/ba-siding-corner-before.webp', after: 'img/ba-siding-corner-after.webp', label: 'Vinyl Siding' },
            { before: 'img/ba-staircase-before.webp', after: 'img/ba-staircase-after.webp', label: 'Staircase' },
            { before: 'img/ba-siding-ac-before.webp', after: 'img/ba-siding-ac-after.webp', label: 'Siding' },
            { before: 'img/ba-deck-stain-before.webp', after: 'img/ba-deck-stain-after.webp', label: 'Deck Staining' },
            { before: 'img/ba-porch-steps-before.webp', after: 'img/ba-porch-steps-after.webp', label: 'Porch Steps' },
            { before: 'img/ba-siding-angle-before.webp', after: 'img/ba-siding-angle-after.webp', label: 'Full Exterior' },
            { before: 'img/ba-sidewalk-before.webp', after: 'img/ba-sidewalk-after.webp', label: 'Sidewalk' },
            { before: 'img/ba-driveway-before.webp', after: 'img/ba-driveway-after.webp', label: 'Driveway' },
            { before: 'img/ba-composite-deck-before.webp', after: 'img/ba-composite-deck-after.webp', label: 'Composite Deck' },
            { before: 'img/ba-balcony-floor-before.webp', after: 'img/ba-balcony-floor-after.webp', label: 'Balcony Floor' },
        ];

        PROJECTS.forEach((_, i) => {
            const dot = document.createElement('span');
            dot.className = 'ba-carousel-dot' + (i === 0 ? ' active' : '');
            dotsWrap.appendChild(dot);
        });
        const dots = [...dotsWrap.querySelectorAll('.ba-carousel-dot')];

        let projectIndex = 0;
        function goToProject(i) {
            projectIndex = (i + PROJECTS.length) % PROJECTS.length;
            const p = PROJECTS[projectIndex];
            beforeImg.src = p.before;
            beforeImg.alt = 'Before ' + p.label;
            afterImg.src = p.after;
            afterImg.alt = 'After ' + p.label;
            if (projectLabel) projectLabel.textContent = p.label;
            dots.forEach((d, di) => d.classList.toggle('active', di === projectIndex));
            if (hint) hint.classList.add('dismissed');
            setPosition(50);
        }

        prevBtn.addEventListener('click', () => goToProject(projectIndex - 1));
        nextBtn.addEventListener('click', () => goToProject(projectIndex + 1));
        dots.forEach((dot, i) => dot.addEventListener('click', () => goToProject(i)));
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
       6. AREAS WE SERVE — staggered "lighting up" of city chips,
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
       7. PREMIUM BUTTONS — click ripple from the exact pointer
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
       8. CLOSING CTA WIRING — makes the "Get a Free Quote" button
       at the bottom of the page do exactly what the main quote
       button does: scroll to it and open the inline quote form.
       ========================================================== */
    function initClosingCtaLink() {
        const existingQuoteToggle = document.getElementById('quoteToggle');
        const btn = document.getElementById('closingQuoteBtn');
        if (!existingQuoteToggle || !btn) return;
        btn.addEventListener('click', () => {
            existingQuoteToggle.scrollIntoView({ behavior: 'smooth', block: 'center' });
            setTimeout(() => {
                const form = document.getElementById('quoteForm');
                if (!form || !form.classList.contains('open')) existingQuoteToggle.click();
            }, 450);
        });
    }

    /* ==========================================================
       9. ELFSIGHT REVIEWS TRIMMER — best-effort: shrinks the widget's
       rating-summary header and "Free Google Reviews Widget" branding
       down to almost nothing (rather than display:none, which risks
       breaking the widget's own internal layout math) so only the
       review comments read as visible. LIMITATION: Elfsight typically
       renders its content inside a Shadow DOM (and sometimes an
       iframe); this can only reach an *open* shadow root — a closed
       shadow root or a cross-origin iframe can't be touched from the
       parent page at all. In that case, the only real fix is turning
       those blocks off in the Elfsight editor itself (elfsight.com),
       where the rating summary is a toggle but branding removal
       usually requires a paid plan.
       ========================================================== */
    function initElfsightTrim() {
        const host = document.querySelector('.elfsight-app-6f399a56-d230-4060-809b-39d14115b4fa');
        if (!host) return;

        const HIDE_IF_MATCHES = [
            /free google reviews widget/i,
            /avalia[cç][aã]o/i,
            /powered by elfsight/i,
        ];

        function shrinkToNearInvisible(el) {
            el.style.setProperty('font-size', '1px', 'important');
            el.style.setProperty('line-height', '1px', 'important');
            el.style.setProperty('max-height', '1px', 'important');
            el.style.setProperty('max-width', '1px', 'important');
            el.style.setProperty('opacity', '0.02', 'important');
            el.style.setProperty('overflow', 'hidden', 'important');
            el.style.setProperty('pointer-events', 'none', 'important');
            el.style.setProperty('margin', '0', 'important');
            el.style.setProperty('padding', '0', 'important');
        }

        function sweep(root) {
            if (!root || !root.querySelectorAll) return;
            root.querySelectorAll('*').forEach((el) => {
                if (el.shadowRoot) sweep(el.shadowRoot);
                if (el.children.length > 0) return; // only leaf nodes carry direct text
                if (el.dataset.jwShrunk) return;
                const text = (el.textContent || '').trim();
                if (text && text.length < 60 && HIDE_IF_MATCHES.some((re) => re.test(text))) {
                    shrinkToNearInvisible(el);
                    el.dataset.jwShrunk = '1';
                }
            });
        }

        const mo = new MutationObserver(() => sweep(host));
        mo.observe(host, { childList: true, subtree: true });
        sweep(host);
    }

    /* ==========================================================
       Init — all modules are no-ops if their markup is absent.
       ========================================================== */
    ready(function () {
        initScrollReveal();
        initWaterReveal();
        initHeroVideo();
        initClosingCtaLink();
        initComparator();
        initTiltCards();
        initAreasAnimation();
        initPremiumButtons();
        initElfsightTrim();
    });
})();
