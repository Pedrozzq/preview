/**
 * Prime Imports — Motion Principles: liga a barra de progresso, o fade-in de
 * imagens com skeleton (data-skel), a transição leve de entrada/saída entre
 * páginas e o estado de "carregando" nos botões de adicionar à sacola.
 * Incluir com: <script src="js/motion-principles.js" defer></script>
 * Requer css/motion-principles.css. Não depende de GSAP/Lenis/scroll-world.
 */
(function () {
    'use strict';

    /* ---------- Skeleton + fade-in de imagens ---------- */
    function initImageSkeletons() {
        document.querySelectorAll('img[data-skel]').forEach(function (img) {
            if (img.complete && img.naturalWidth > 0) {
                img.classList.add('is-loaded');
                return;
            }
            img.addEventListener('load', function () { img.classList.add('is-loaded'); }, { once: true });
            img.addEventListener('error', function () { img.classList.add('is-loaded'); }, { once: true });
        });
    }

    /* ---------- Barra de progresso de carregamento ---------- */
    var bar = null;
    var trickleTimer = null;

    function ensureBar() {
        if (bar) return bar;
        bar = document.getElementById('page-progress');
        if (!bar) {
            bar = document.createElement('div');
            bar.id = 'page-progress';
            document.body.appendChild(bar);
        }
        return bar;
    }

    function setProgress(pct) {
        ensureBar().style.width = pct + '%';
    }

    function startProgress() {
        var el = ensureBar();
        el.classList.remove('is-done');
        var pct = 12;
        setProgress(pct);
        clearInterval(trickleTimer);
        trickleTimer = setInterval(function () {
            pct += (90 - pct) * 0.12;
            setProgress(Math.min(pct, 90));
        }, 180);
    }

    function finishProgress() {
        clearInterval(trickleTimer);
        setProgress(100);
        setTimeout(function () {
            ensureBar().classList.add('is-done');
            setTimeout(function () { setProgress(0); }, 300);
        }, 200);
    }

    /* ---------- Transição leve de entrada (páginas sem preloader próprio) ---------- */
    function initPageEnter() {
        if (!document.documentElement.classList.contains('js-page-enter')) return;
        requestAnimationFrame(function () {
            requestAnimationFrame(function () {
                document.body.classList.add('is-ready');
            });
        });
    }

    /* ---------- Transição leve de saída + progresso ao navegar entre páginas ---------- */
    function isInternalNavigableLink(link) {
        if (!link || !link.href) return false;
        var rawHref = link.getAttribute('href') || '';
        if (rawHref === '' || rawHref.charAt(0) === '#') return false;
        if (link.target && link.target !== '' && link.target !== '_self') return false;
        if (link.hasAttribute('download')) return false;
        if (link.origin !== window.location.origin) return false;
        if (link.pathname === window.location.pathname && link.hash) return false;
        return /\.html?$/.test(link.pathname) || link.pathname === '/' || link.pathname.endsWith('/');
    }

    function initExitTransition() {
        document.addEventListener('click', function (e) {
            if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
            var link = e.target.closest('a');
            if (!isInternalNavigableLink(link)) return;

            e.preventDefault();
            startProgress();
            document.body.classList.add('page-transition-exit');
            setTimeout(function () { window.location.href = link.href; }, 200);
        });
    }

    /* ---------- Estado de carregando no botão "Adicionar à Sacola" ---------- */
    function initCartButtonLoading() {
        document.querySelectorAll('[data-cart-add]').forEach(function (btn) {
            btn.addEventListener('click', function () {
                if (btn.classList.contains('btn-loading')) return;
                btn.classList.add('btn-loading');
                setTimeout(function () { btn.classList.remove('btn-loading'); }, 450);
            }, true);
        });
    }

    function init() {
        initImageSkeletons();
        initPageEnter();
        initExitTransition();
        initCartButtonLoading();
    }

    startProgress();
    window.addEventListener('load', finishProgress);

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    // Reexecuta o skeleton para imagens injetadas depois (ex.: carrinho, catálogo dinâmico).
    window.PrimeMotion = { refreshSkeletons: initImageSkeletons };
})();
