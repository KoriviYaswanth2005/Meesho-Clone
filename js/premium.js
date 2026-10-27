(function () {
    const $ = (s, r = document) => r.querySelector(s), $$ = (s, r = document) => [...r.querySelectorAll(s)];
    function scrollProgress() {
        let bar = $('.scroll-progress');
        if (!bar) {
            bar = document.createElement('div');
            bar.className = 'scroll-progress';
            document.body.prepend(bar);
        }
        const h = document.documentElement.scrollHeight - innerHeight;
        bar.style.width = (h > 0 ? (scrollY / h) * 100 : 0) + '%';
    }
    function navShadow() { $('.navbar-shop')?.classList.toggle('scrolled', scrollY > 12); }
    function cursorGlow() {
        if (matchMedia('(pointer:coarse)').matches)
            return;
        let g = $('.cursor-glow');
        if (!g) {
            g = document.createElement('div');
            g.className = 'cursor-glow';
            document.body.appendChild(g);
        }
        document.addEventListener('pointermove', e => { g.style.left = e.clientX + 'px'; g.style.top = e.clientY + 'px'; g.style.opacity = '1'; });
        document.addEventListener('pointerleave', () => g.style.opacity = '0');
    }
    function staggerReveal() {
        const groups = ['.category-card', '.product-card', '.promo-card', '.brand-tile', '.info-card', '.mini-category'];
        groups.forEach(sel => $$(`${sel}`).forEach((el, i) => { if (!el.dataset.motion) {
            el.dataset.motion = '1';
            el.style.transitionDelay = Math.min(i % 8 * 45, 315) + 'ms';
        } }));
    }
    function cardTilt() {
        if (matchMedia('(pointer:coarse)').matches)
            return;
        $$('.product-card,.promo-card').forEach(card => {
            card.addEventListener('pointermove', e => {
                const r = card.getBoundingClientRect(), x = (e.clientX - r.left) / r.width - .5, y = (e.clientY - r.top) / r.height - .5;
                card.style.transform = `perspective(900px) rotateX(${(-y * 3).toFixed(2)}deg) rotateY(${(x * 3).toFixed(2)}deg) translateY(-6px)`;
            });
            card.addEventListener('pointerleave', () => card.style.transform = '');
        });
    }
    function injectPagePromo() {
        const nav = $('.category-nav');
        if (!nav || location.pathname.endsWith('/index.html') || location.pathname === '/')
            return;
        if ($('.global-promo-strip'))
            return;
        const strip = document.createElement('div');
        strip.className = 'global-promo-strip';
        strip.innerHTML = '<div><i class="bi bi-lightning-charge-fill"></i><b>MEGA SALE</b> Up to 80% OFF</div><div><i class="bi bi-truck"></i> Free Delivery above ₹499</div><div><i class="bi bi-arrow-repeat"></i> 7 Days Easy Return</div><a href="offers.html">Shop Offers <i class="bi bi-arrow-right"></i></a>';
        nav.insertAdjacentElement('afterend', strip);
    }
    function init() {
        scrollProgress();
        navShadow();
        cursorGlow();
        staggerReveal();
        cardTilt();
        injectPagePromo();
        addEventListener('scroll', () => { scrollProgress(); navShadow(); }, { passive: true });
    }
    document.addEventListener('DOMContentLoaded', init);
})();
