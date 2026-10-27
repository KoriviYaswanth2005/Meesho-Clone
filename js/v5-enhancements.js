(function () {
    const $ = (s, r = document) => r.querySelector(s);
    const $$ = (s, r = document) => [...r.querySelectorAll(s)];
    function hideLoader() {
        const loader = $('#siteLoader');
        if (!loader)
            return;
        requestAnimationFrame(() => requestAnimationFrame(() => loader.classList.add('is-hidden')));
    }
    function addHeaderWishlist() {
        const actions = document.querySelector('.navbar-shop .ms-auto');
        if (!actions || actions.querySelector('.header-wishlist'))
            return;
        const a = document.createElement('a');
        a.href = 'wishlist.html';
        a.className = 'nav-link header-wishlist position-relative d-none d-md-flex align-items-center gap-1';
        a.innerHTML = '<i class="bi bi-heart"></i><span class="d-none d-lg-inline">Favourites</span><span class="wishlist-count position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">0</span>';
        actions.insertBefore(a, actions.querySelector('.cart-icon')?.closest('a') || null);
        updateWishlistBadge();
    }
    function updateWishlistBadge() {
        let list = [];
        try {
            list = JSON.parse(localStorage.getItem('wishlist') || '[]');
        }
        catch { }
        $$('.wishlist-count').forEach(x => x.textContent = list.length);
        const h = $('.header-wishlist');
        if (h)
            h.classList.toggle('is-active', location.pathname.endsWith('wishlist.html'));
    }
    function stabilizeNavigation() {
        document.body.classList.remove('leaving-page');
        $$('.category-nav .category-link').forEach(a => {
            a.addEventListener('click', () => {
                $$('.category-nav .category-link.active').forEach(x => x.classList.remove('active'));
                a.classList.add('active');
            }, { passive: true });
        });
    }
    function favouriteFeedback() {
        document.addEventListener('click', e => {
            const btn = e.target.closest('.wish-btn');
            if (!btn)
                return;
            btn.classList.remove('heart-pop-now');
            void btn.offsetWidth;
            btn.classList.add('heart-pop-now');
            setTimeout(updateWishlistBadge, 30);
        });
    }
    document.addEventListener('DOMContentLoaded', () => {
        hideLoader();
        addHeaderWishlist();
        stabilizeNavigation();
        favouriteFeedback();
        setTimeout(hideLoader, 500);
    });
    window.addEventListener('pageshow', hideLoader);
    window.addEventListener('load', hideLoader);
    window.addEventListener('storage', updateWishlistBadge);
})();
