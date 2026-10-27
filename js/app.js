const getLS = (k, f = []) => { try {
    return JSON.parse(localStorage.getItem(k)) ?? f;
}
catch {
    return f;
} };
const setLS = (k, v) => localStorage.setItem(k, JSON.stringify(v));
let CART = getLS("cart", []), WISHLIST = getLS("wishlist", []), RECENT = getLS("recentlyViewed", []);
const money = n => "₹" + Number(n).toLocaleString("en-IN");
const $ = s => document.querySelector(s), $$ = s => document.querySelectorAll(s);
function cartCount() { return CART.reduce((a, x) => a + x.qty, 0); }
function updateGlobalUI() { $$(".cart-count").forEach(x => x.textContent = cartCount()); $$(".wishlist-count").forEach(x => x.textContent = WISHLIST.length); }
function findProduct(id) { return PRODUCTS.find(p => p.id == id); }
function saveCart() { setLS("cart", CART); updateGlobalUI(); }
function saveWishlist() { setLS("wishlist", WISHLIST); updateGlobalUI(); }
function addToCart(id, qty = 1) {
    const p = findProduct(id);
    if (!p)
        return;
    const existing = CART.find(x => x.id == p.id);
    if (existing)
        existing.qty += qty;
    else
        CART.push({ id: p.id, qty });
    saveCart();
    showToast("Added to cart", "success");
    animateCart();
}
function removeFromCart(id) { CART = CART.filter(x => x.id != id); saveCart(); renderCart?.(); }
function changeQty(id, d) { const x = CART.find(x => x.id == id); if (!x)
    return; x.qty = Math.max(1, x.qty + d); saveCart(); renderCart?.(); }
function toggleWishlist(id) {
    if (WISHLIST.includes(Number(id)))
        WISHLIST = WISHLIST.filter(x => x !== Number(id));
    else
        WISHLIST.push(Number(id));
    saveWishlist();
    renderProducts?.();
    renderWishlist?.();
    showToast(WISHLIST.includes(Number(id)) ? "Added to wishlist" : "Removed from wishlist", "info");
}
function ensureQuickViewModal() {
    let m = $("#quickViewModal");
    if (m)
        return m;
    document.body.insertAdjacentHTML("beforeend", '<div class="modal fade" id="quickViewModal" tabindex="-1" aria-hidden="true"><div class="modal-dialog modal-lg modal-dialog-centered modal-dialog-scrollable"><div class="modal-content"><div class="modal-header"><h5 class="modal-title">Quick view</h5><button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button></div><div class="modal-body"></div></div></div></div>');
    return $("#quickViewModal");
}
function quickView(id) {
    const p = findProduct(id);
    if (!p)
        return;
    if (!window.bootstrap || !bootstrap.Modal) {
        location.href = "product-details.html?id=" + p.id;
        return;
    }
    const modal = ensureQuickViewModal();
    modal.querySelector(".modal-body").innerHTML = productDetailHTML(p, true);
    bootstrap.Modal.getOrCreateInstance(modal).show();
}
function productCard(p) {
    const wished = WISHLIST.includes(p.id);
    const imageCount = Array.isArray(p.images) ? p.images.length : 1;
    return `<div class="product-card">
 <a class="product-image-wrap d-block" href="product-details.html?id=${p.id}" onclick="rememberProduct(${p.id})">
 <img class="product-image" src="${p.images[0]}" alt="${p.title}" loading="lazy">
 <button type="button" class="wish-btn ${wished ? "is-wished text-danger" : ""}" aria-label="${wished ? "Remove from favourites" : "Add to favourites"}" aria-pressed="${wished}" onclick="event.preventDefault();event.stopPropagation();toggleWishlist(${p.id}, this)"><i class="bi ${wished ? "bi-heart-fill" : "bi-heart"}"></i></button>
 <span class="discount-badge">${p.discount}% off</span>
 ${imageCount > 1 ? `<span class="image-count"><i class="bi bi-images"></i> +${imageCount - 1}</span>` : ""}
 </a>
 <div class="product-body">
   <div class="mall-badge"><i class="bi bi-patch-check-fill"></i> Trusted seller</div>
   <a class="product-title d-block" href="product-details.html?id=${p.id}" onclick="rememberProduct(${p.id})">${p.title}</a>
   <div class="d-flex align-items-center gap-2 my-2"><span class="rating"><i class="bi bi-star-fill"></i> ${p.rating}</span><small class="muted">${p.reviews.toLocaleString("en-IN")} Reviews</small></div>
   <div class="d-flex align-items-baseline gap-2"><span class="price">${money(p.price)}</span><span class="mrp">${money(p.mrp)}</span><span class="discount-text">${p.discount}% off</span></div>
   <small class="muted d-block my-2"><i class="bi bi-truck me-1"></i>${p.delivery}</small>
   <div class="d-flex gap-2"><button class="btn btn-shop btn-sm flex-grow-1" onclick="addToCart(${p.id})"><i class="bi bi-bag-plus me-1"></i>Add to Cart</button>
   <button class="btn btn-outline-shop btn-sm" onclick="quickView(${p.id})"><i class="bi bi-eye"></i></button></div>
 </div></div>`;
}
function renderGrid(list, target = "#productGrid") { const el = $(target); if (el)
    el.innerHTML = list.map(productCard).join(""); }
function rememberProduct(id) { RECENT = [Number(id), ...RECENT.filter(x => x != id)].slice(0, 8); setLS("recentlyViewed", RECENT); }
function showToast(msg, type = "success") {
    const box = $("#toastContainer");
    if (!box)
        return;
    const icon = type === "success" ? "check-circle" : type === "danger" ? "x-circle" : "info-circle";
    const el = document.createElement("div");
    el.className = "toast show toast-slide mb-2";
    el.innerHTML = `<div class="toast-body d-flex gap-2 align-items-center"><i class="bi bi-${icon} fs-5"></i><span>${msg}</span></div>`;
    box.appendChild(el);
    setTimeout(() => el.remove(), 2600);
}
function animateCart() { $$(".cart-icon").forEach(x => { x.classList.remove("cart-bounce"); void x.offsetWidth; x.classList.add("cart-bounce"); }); }
function productDetailHTML(p, compact = false) {
    return `<div class="row g-4"><div class="col-md-5"><img src="${p.images[0]}" class="img-fluid rounded-4" alt="${p.title}"></div><div class="col-md-7"><h3 class="fw-bold">${p.title}</h3><div class="my-2"><span class="rating">${p.rating} ★</span> <span class="muted">${p.reviews} reviews</span></div><div class="my-3"><span class="display-6 fw-bold">${money(p.price)}</span> <span class="mrp">${money(p.mrp)}</span> <span class="text-success fw-bold">${p.discount}% off</span></div><p class="muted">${p.description}</p><p><b>Seller:</b> ${p.seller}</p><button class="btn btn-shop w-100" onclick="addToCart(${p.id})">Add to Cart</button>${renderUpiBlock(p)}${compact ? "" : `<a class="btn btn-outline-shop w-100 mt-2" href="product-details.html?id=${p.id}">View Full Details</a>`}</div></div>`;
}
function initTheme() { if (localStorage.getItem("theme") === "dark")
    document.body.classList.add("dark"); $$(".theme-toggle").forEach(b => b.onclick = () => { document.body.classList.toggle("dark"); localStorage.setItem("theme", document.body.classList.contains("dark") ? "dark" : "light"); }); }
function initSearch() {
    const input = $("#globalSearch"), mobile = $("#mobileSearch"), box = $("#searchSuggestions");
    if (!input && !mobile)
        return;
    const categories = ["Women", "Men", "Beauty", "Home", "Kitchen", "Jewellery", "Footwear", "Electronics", "Kids", "Grocery", "Accessories", "Sports"];
    const brands = [...new Set(PRODUCTS.map(p => p.brand || p.seller).filter(Boolean))].slice(0, 18);
    function ensureMobileBox() {
        if (!mobile)
            return null;
        let b = document.querySelector('#mobileSearchSuggestions');
        if (!b) {
            b = document.createElement('div');
            b.id = 'mobileSearchSuggestions';
            b.className = 'search-suggestions mobile-search-suggestions d-none';
            mobile.parentElement?.insertAdjacentElement('afterend', b);
        }
        return b;
    }
    function renderSuggestions(value, target) {
        if (!target)
            return;
        const q = value.trim().toLowerCase();
        if (!q) {
            target.innerHTML = '';
            target.classList.add('d-none');
            return;
        }
        const productMatches = PRODUCTS.filter(p => (`${p.title} ${p.category} ${p.subcategory || ''} ${p.brand || ''} ${p.seller || ''}`).toLowerCase().includes(q)).slice(0, 7);
        const catMatches = categories.filter(c => c.toLowerCase().includes(q)).slice(0, 4);
        const brandMatches = brands.filter(b => String(b).toLowerCase().includes(q)).slice(0, 3);
        let html = '';
        if (catMatches.length) {
            html += `<div class="suggest-group"><div class="suggest-label">Categories</div>${catMatches.map(c => `<a href="search.html?q=${encodeURIComponent(c)}" class="suggest-item"><span class="suggest-icon"><i class="bi bi-grid"></i></span><span>${c}</span><i class="bi bi-arrow-up-right ms-auto"></i></a>`).join('')}</div>`;
        }
        if (brandMatches.length) {
            html += `<div class="suggest-group"><div class="suggest-label">Brands / Sellers</div>${brandMatches.map(b => `<a href="search.html?q=${encodeURIComponent(b)}" class="suggest-item"><span class="suggest-icon"><i class="bi bi-patch-check"></i></span><span>${b}</span><i class="bi bi-arrow-up-right ms-auto"></i></a>`).join('')}</div>`;
        }
        if (productMatches.length) {
            html += `<div class="suggest-group"><div class="suggest-label">Products</div>${productMatches.map(p => `<a href="product-details.html?id=${p.id}" class="suggest-item" onclick="rememberProduct(${p.id})"><img src="${p.images?.[0] || ''}" alt=""><span><b>${p.title}</b><small>${money(p.price)} · ${p.category}</small></span><i class="bi bi-chevron-right ms-auto"></i></a>`).join('')}</div>`;
        }
        if (!html)
            html = '<div class="suggest-empty"><i class="bi bi-search"></i><span>No direct matches. Press Enter to search all products.</span></div>';
        html += `<a class="suggest-all" href="search.html?q=${encodeURIComponent(value.trim())}"><i class="bi bi-search"></i> Search all for “${value.trim()}” <i class="bi bi-arrow-right ms-auto"></i></a>`;
        target.innerHTML = html;
        target.classList.remove('d-none');
    }
    input?.addEventListener('input', () => renderSuggestions(input.value, box));
    mobile?.addEventListener('input', () => renderSuggestions(mobile.value, ensureMobileBox()));
    input?.addEventListener('focus', () => { if (input.value.trim())
        renderSuggestions(input.value, box); });
    mobile?.addEventListener('focus', () => { if (mobile.value.trim())
        renderSuggestions(mobile.value, ensureMobileBox()); });
    function goSearch(value) { const q = String(value || '').trim(); location.href = 'search.html' + (q ? '?q=' + encodeURIComponent(q) : ''); }
    input?.addEventListener('keydown', e => { if (e.key === 'Enter') {
        e.preventDefault();
        goSearch(input.value);
    } });
    mobile?.addEventListener('keydown', e => { if (e.key === 'Enter') {
        e.preventDefault();
        goSearch(mobile.value);
    } });
    document.addEventListener('click', e => { if (box && !input?.parentElement?.contains(e.target))
        box.classList.add('d-none'); const mb = ensureMobileBox(); if (mb && !mobile?.parentElement?.contains(e.target))
        mb.classList.add('d-none'); });
}
function initAnimations() { const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting)
    e.target.classList.add("in-view"); }), { threshold: .12 }); $$(".fade-up,.fade-left,.fade-right,.scale-in").forEach(x => io.observe(x)); }
function initBackTop() { const b = $("#backTop"); if (!b)
    return; addEventListener("scroll", () => b.style.display = scrollY > 500 ? "block" : "none"); b.onclick = () => scrollTo({ top: 0, behavior: "smooth" }); }
const PROMO_COLLECTIONS = {
    fashion: { title: "Fashion Edit", sub: "Explore kurtis, sarees & western wear", all: "products.html#group-women", match: p => p.category === "Women" },
    beauty: { title: "Beauty Store", sub: "Makeup, skincare, haircare & more", all: "products.html#group-beauty", match: p => p.category === "Beauty" },
    home: { title: "Home Upgrade", sub: "Decor, storage & everyday essentials", all: "products.html#group-home", match: p => p.category === "Home" || p.category === "Kitchen" },
    gold: { title: "Gold Edit", sub: "Festive fashion, sarees, jewellery & celebration styles", all: "products.html#group-jewellery", match: p => p.category === "Jewellery" || (p.category === "Women" && ["Sarees", "Ethnic Wear"].includes(p.subcategory)) },
    newusers: { title: "New User Deals", sub: "Save 35% or more on your first order", all: "products.html", match: p => p.discount >= 35 }
};
function showPromoRelated(key) {
    const c = PROMO_COLLECTIONS[key];
    if (!c)
        return;
    const sec = $("#promoRelated");
    if (!sec)
        return;
    const list = PRODUCTS.filter(c.match).sort((a, b) => b.discount - a.discount).slice(0, 10);
    $("#promoRelatedTitle").textContent = c.title + " · Related products";
    $("#promoRelatedSub").textContent = c.sub;
    $("#promoRelatedAll").href = c.all;
    $("#promoRelatedGrid").innerHTML = list.length ? list.map(productCard).join("") : '<p class="muted">No products in this collection yet.</p>';
    document.querySelectorAll("a[data-collection].active,.promo-card.active").forEach(x => x.classList.remove("active"));
    document.querySelectorAll(`[data-collection="${key}"]`).forEach(x => { if (x.classList.contains("promo-card"))
        x.classList.add("active"); });
    sec.style.display = "";
    sec.scrollIntoView({ behavior: "smooth", block: "start" });
}
document.addEventListener("click", e => {
    const a = e.target.closest("a[data-collection]");
    if (!a)
        return;
    e.preventDefault();
    showPromoRelated(a.dataset.collection);
});
function renderHeader() {
    const cat = [
        ["Popular", ""], ["Kurti, Saree & Lehenga", "Women"], ["Women Western", "Dresses"],
        ["Men", "Men"], ["Kids & Toys", "Kids"], ["Home & Kitchen", "Home"], ["Beauty & Health", "Beauty"],
        ["Jewellery & Accessories", "Jewellery"], ["Bags & Footwear", "Accessories"], ["Electronics", "Electronics"]
    ];
    const MEGA = {
        "Kurti, Saree & Lehenga": [["Ethnic Wear", "Ethnic Wear", ["Sarees", "Kurtis", "Ethnic Wear"]], ["Western", "Dresses", ["Dresses", "Tops"]], ["Accessories", "Handbags", ["Handbags", "Footwear", "Jewellery"]]],
        "Women Western": [["Dresses", "Dresses", ["Dresses", "Tops"]], ["Women Footwear", "Women Footwear", ["Women Footwear", "Sandals", "Sneakers"]], ["Women Accessories", "Handbags", ["Handbags", "Jewellery"]]],
        "Men": [["Topwear", "Shirts", ["Shirts", "T-Shirts"]], ["Bottomwear", "Jeans", ["Jeans"]], ["Footwear & Watches", "Shoes", ["Shoes", "Watches", "Accessories"]]],
        "Kids & Toys": [["Kids Clothing", "Kids Wear", ["Kids Wear", "Girls", "Boys"]], ["Toys & Learning", "Toys", ["Toys", "School Supplies"]], ["Baby & Footwear", "Baby Care", ["Baby Care", "Kids Footwear"]]],
        "Home & Kitchen": [["Home Decor", "Home Decor", ["Decor", "Home Decor", "Curtains", "Cushion Covers"]], ["Bedroom & Storage", "Bedsheets", ["Bedsheets", "Storage", "Furniture"]], ["Cookware & Appliances", "Cookware", ["Cookware", "Appliances", "Kitchen Tools"]], ["Dining", "Dining", ["Serveware", "Dining", "Bottles"]]],
        "Beauty & Health": [["Skincare", "Skincare", ["Skincare", "Bath & Body"]], ["Hair", "Haircare", ["Haircare", "Hair Care"]], ["Makeup & Fragrance", "Makeup", ["Makeup", "Fragrances", "Beauty Tools"]]],
        "Jewellery & Accessories": [["Jewellery", "Jewellery", ["Necklaces", "Bangles", "Earrings", "Rings", "Jewellery Sets"]], ["Bags & Wallets", "Bags", ["Bags", "Handbags", "Wallets", "Travel Bags"]], ["Accessories", "Accessories", ["Sunglasses", "Belts", "Watches"]]],
        "Bags & Footwear": [["Bags", "Bags", ["Bags", "Handbags", "Travel Bags"]], ["Footwear", "Footwear", ["Women Footwear", "Men Footwear", "Kids Footwear"]], ["Sandals & Sneakers", "Sneakers", ["Sandals", "Sneakers"]]],
        "Electronics": [["Audio", "Audio", ["Audio", "Headphones", "Speakers"]], ["Phones & Watches", "Smart Phones", ["Smart Phones", "Smart Watches"]], ["Gadgets", "Gadgets", ["Gadgets", "Accessories"]]]
    };
    const megaKeys = Object.keys(MEGA);
    const n = $("#categoryNav");
    if (!n)
        return;
    n.innerHTML = cat.map(([label, q]) => {
        const idx = megaKeys.indexOf(label);
        const href = q ? "search.html?q=" + encodeURIComponent(q) : "index.html";
        const dataMega = idx >= 0 ? ` data-mega="${idx}"` : "";
        const icon = idx >= 0 ? "bi-chevron-down" : "bi-chevron-right";
        return `<a class="category-link" data-nav-label="${label}"${dataMega} href="${href}"><span>${label}</span><i class="bi ${icon} nav-direct-icon"></i></a>`;
    }).join("");
    const current = location.pathname.split('/').pop() || 'index.html';
    const query = new URLSearchParams(location.search).get('q') || '';
    n.querySelectorAll('a.category-link').forEach(a => {
        const href = a.getAttribute('href') || '';
        const isHome = (href === 'index.html' && (current === '' || current === 'index.html'));
        const hrefQ = new URL(href, location.href).searchParams.get('q') || '';
        const active = isHome || (current === 'search.html' && hrefQ && hrefQ.toLowerCase() === query.toLowerCase());
        if (active)
            a.classList.add('active');
        a.addEventListener('pointerdown', () => { n.querySelectorAll('a.category-link.active').forEach(x => x.classList.remove('active')); a.classList.add('active'); });
    });
    document.querySelectorAll('.mega-panel').forEach(p => p.remove());
    const navBar = n.closest('.category-nav') || n;
    megaKeys.forEach((label, i) => {
        const panel = document.createElement('div');
        panel.className = 'mega-panel';
        panel.id = 'mega-' + i;
        panel.innerHTML = '<div class="mega-inner">' + MEGA[label].map(([h, hq, items]) => `<div class="mega-col"><a class="mega-head" href="search.html?q=${encodeURIComponent(hq)}">${h}</a>` +
            items.map(it => `<a href="search.html?q=${encodeURIComponent(it)}">${it}</a>`).join("") + `</div>`).join("") + '</div>';
        document.body.appendChild(panel);
    });
    let closeTimer = null;
    const isHover = () => window.matchMedia('(hover:hover)').matches;
    function closeMega() {
        document.querySelectorAll('.mega-panel.open').forEach(p => p.classList.remove('open'));
        n.querySelectorAll('.category-link.mega-open').forEach(l => l.classList.remove('mega-open'));
    }
    function openMega(i) {
        clearTimeout(closeTimer);
        closeMega();
        const p = document.getElementById('mega-' + i);
        if (!p)
            return;
        p.style.top = navBar.getBoundingClientRect().bottom + 'px';
        p.classList.add('open');
        const l = n.querySelector(`.category-link[data-mega="${i}"]`);
        if (l)
            l.classList.add('mega-open');
    }
    function closeSoon() { clearTimeout(closeTimer); closeTimer = setTimeout(closeMega, 160); }
    n.querySelectorAll('.category-link[data-mega]').forEach(l => {
        const i = l.dataset.mega;
        const p = document.getElementById('mega-' + i);
        if (isHover()) {
            l.addEventListener('mouseenter', () => openMega(i));
            l.addEventListener('mouseleave', closeSoon);
            p.addEventListener('mouseenter', () => clearTimeout(closeTimer));
            p.addEventListener('mouseleave', closeSoon);
        }
        l.addEventListener('click', e => {
            if (!isHover() && !p.classList.contains('open')) {
                e.preventDefault();
                openMega(i);
            }
        });
    });
    document.addEventListener('click', e => { if (!e.target.closest('.mega-panel,.category-link[data-mega]'))
        closeMega(); });
    document.addEventListener('keydown', e => { if (e.key === 'Escape')
        closeMega(); });
    window.addEventListener('scroll', closeMega, { passive: true });
}
function initNavigation() {
    document.querySelectorAll('a[href]').forEach(a => {
        const href = a.getAttribute('href');
        if (!href || href.startsWith('#') || href.startsWith('http') || href.startsWith('mailto:') || href.startsWith('tel:') || a.dataset.navBound)
            return;
        a.dataset.navBound = '1';
        a.addEventListener('click', e => {
            if (e.defaultPrevented)
                return;
            const url = new URL(href, location.href);
            if (url.origin !== location.origin)
                return;
        });
    });
}
function marketplaceShowcase() {
    if (document.body.dataset.showcaseReady === "1")
        return;
    const nav = document.querySelector(".category-nav");
    if (!nav)
        return;
    document.body.dataset.showcaseReady = "1";
    const heroProducts = PRODUCTS.slice(0, 12);
    const categories = [
        ["Women", "Women", "bi-person-standing-dress"],
        ["Men", "Men", "bi-person"],
        ["Beauty", "Beauty", "bi-stars"],
        ["Home Decor", "Home", "bi-house-heart"],
        ["Electronics", "Electronics", "bi-phone"],
        ["Jewellery", "Jewellery", "bi-gem"],
        ["Footwear", "Footwear", "bi-bag-heart"],
        ["Grocery", "Grocery", "bi-basket"]
    ];
    const catHtml = categories.map((c, i) => `<a class="mini-category" href="search.html?q=${encodeURIComponent(c[1])}"><span class="mini-category-icon"><i class="bi ${c[2]}"></i></span><b>${c[0]}</b><small>Shop now</small></a>`).join("");
    const bannerHtml = `
 <section class="market-banner-wrap container-fluid px-0">
   <div class="market-banner container">
    <div class="market-banner-copy"><span class="banner-kicker">MEGA SAVINGS • EVERYDAY LOW PRICES</span><h2>Up to <strong>80% OFF</strong></h2><p>Fashion, beauty, home, electronics and more.</p><a href="offers.html" class="banner-btn">Shop Now <i class="bi bi-arrow-right"></i></a></div>
    <div class="banner-art">
      <div class="banner-product bp1"><img src="${heroProducts[0].images[0]}" alt=""></div>
      <div class="banner-product bp2"><img src="${heroProducts[4].images[0]}" alt=""></div>
      <div class="banner-product bp3"><img src="${heroProducts[7].images[0]}" alt=""></div>
    </div>
   </div>
 </section>
 <section class="container py-3"><div class="mini-category-row">${catHtml}</div></section>
 <section class="container showcase-section">
   <div class="section-heading-row"><div><span class="eyebrow">LIMITED TIME</span><h2 class="section-title">Deals of the Day</h2><p class="section-subtitle">Big discounts on products shoppers love</p></div><a href="offers.html" class="showcase-link">View all <i class="bi bi-chevron-right"></i></a></div>
   <div class="showcase-scroll">${PRODUCTS.slice().sort((a, b) => b.discount - a.discount).slice(0, 16).map(productCard).join("")}</div>
 </section>
 <section class="container showcase-section">
   <div class="promo-grid">
    <a class="promo-card promo-fashion" href="#promoRelated" data-collection="fashion"><span>Fashion Edit</span><strong>New styles from ₹199</strong><small>Explore kurtis, sarees & western wear</small><b>Shop now →</b></a>
    <a class="promo-card promo-beauty" href="#promoRelated" data-collection="beauty"><span>Beauty Store</span><strong>Glow & care under ₹499</strong><small>Makeup, skincare, haircare & more</small><b>Shop now →</b></a>
    <a class="promo-card promo-home" href="#promoRelated" data-collection="home"><span>Home Upgrade</span><strong>Make your space beautiful</strong><small>Decor, storage & everyday essentials</small><b>Shop now →</b></a>
   </div>
 </section>
 <section id="promoRelated" class="container showcase-section" style="display:none"><div class="section-heading-row"><div><span class="eyebrow">RELATED PRODUCTS</span><h2 class="section-title" id="promoRelatedTitle"></h2><p class="section-subtitle" id="promoRelatedSub"></p></div><a id="promoRelatedAll" href="search.html" class="showcase-link">View all <i class="bi bi-chevron-right"></i></a></div><div id="promoRelatedGrid" class="row row-cols-2 row-cols-md-4 row-cols-lg-5 g-3"></div></section>
 <section class="container showcase-section">
   <div class="secondary-banner gold-banner">
     <div><span class="banner-kicker">PREMIUM COLLECTION</span><h2>Gold Edit</h2><p>Festive fashion, sarees, jewellery and celebration-ready styles.</p><a href="#promoRelated" data-collection="gold" class="banner-btn">Explore Collection <i class="bi bi-arrow-right"></i></a></div>
     <div class="gold-art"><div class="gold-card"><img src="${PRODUCTS.find(p => p.category === "Jewellery")?.images[0] || heroProducts[0].images[0]}" alt=""></div><div class="gold-card"><img src="${PRODUCTS.find(p => p.category === "Women" && p.subcategory === "Sarees")?.images[0] || heroProducts[1].images[0]}" alt=""></div><div class="gold-card"><img src="${PRODUCTS.find(p => p.category === "Men")?.images[0] || heroProducts[2].images[0]}" alt=""></div></div>
   </div>
 </section>
 <section class="container showcase-section">
   <div class="app-banner">
     <div><span class="banner-kicker">NEW USERS</span><h2>Get 35% OFF on your first order</h2><p>Discover great deals, save favourites and shop smarter.</p><a href="#promoRelated" data-collection="newusers" class="banner-btn">Start Shopping <i class="bi bi-arrow-right"></i></a></div>
     <div class="app-banner-art"><span>₹</span><span>♥</span><span>★</span><span>%</span></div>
   </div>
 </section>
 <section class="container showcase-section">
   <div class="section-heading-row"><div><span class="eyebrow">POPULAR RIGHT NOW</span><h2 class="section-title">Trending Products</h2><p class="section-subtitle">Fresh picks with great ratings</p></div><a href="products.html" class="showcase-link">See all <i class="bi bi-chevron-right"></i></a></div>
   <div class="showcase-scroll">${PRODUCTS.slice(10, 26).map(productCard).join("")}</div>
 </section>
 <section class="container showcase-section">
   <div class="brand-strip-title"><div><span class="eyebrow">TRUSTED PICKS</span><h2 class="section-title mb-1">Original Brands <i class="bi bi-patch-check-fill text-primary"></i></h2><p class="section-subtitle mb-0">Shop popular brands in one place</p></div></div>
   <div class="brand-marquee" aria-label="Original brands marquee">
     <div class="brand-marquee-track">
       ${["MAMA EARTH", "WILD STONE", "plum", "NIVEA", "HIMALAYA", "DENVER", "MI", "ZOUK"].concat(["MAMA EARTH", "WILD STONE", "plum", "NIVEA", "HIMALAYA", "DENVER", "MI", "ZOUK"]).map((x, i) => { const files = { "MAMA EARTH": "mamaearth.png", "WILD STONE": "wildstone.png", "plum": "plum.png", "NIVEA": "nivea.png", "HIMALAYA": "himalaya.png", "MI": "mi.png" }; const mark = x === 'DENVER' ? 'D' : x === 'ZOUK' ? 'Z' : x === 'MAMA EARTH' ? 'ME' : x === 'WILD STONE' ? 'WS' : x === 'plum' ? 'plum' : x === 'NIVEA' ? 'N' : x === 'HIMALAYA' ? 'H' : 'mi'; const logo = files[x] ? `<img src="assets/brands/${files[x]}" alt="${x} logo" class="brand-logo-img">` : `<span class="brand-logo-mark">${mark}</span>`; return `<a href="search.html?q=${encodeURIComponent(x)}" class="brand-logo-card brand-${i % 8}">${logo}<span class="brand-logo-name">${x}</span><i class="bi bi-patch-check-fill"></i></a>`; }).join("")}
     </div>
   </div>
 </section>
 <section class="container showcase-section">
   <div class="section-heading-row"><div><span class="eyebrow">HANDPICKED FOR YOU</span><h2 class="section-title">Beauty & Personal Care</h2><p class="section-subtitle">Top-rated self-care essentials</p></div><a href="products.html#group-beauty" class="showcase-link">View all <i class="bi bi-chevron-right"></i></a></div>
   <div class="showcase-scroll">${PRODUCTS.filter(p => p.category === "Beauty").slice(0, 16).map(productCard).join("")}</div>
 </section>
 <section class="container showcase-section">
   <div class="section-heading-row"><div><span class="eyebrow">EVERYDAY ESSENTIALS</span><h2 class="section-title">Home & Kitchen</h2><p class="section-subtitle">Useful finds for every corner of your home</p></div><a href="products.html#group-home" class="showcase-link">View all <i class="bi bi-chevron-right"></i></a></div>
   <div class="showcase-scroll">${PRODUCTS.filter(p => ["Home", "Kitchen"].includes(p.category)).slice(0, 16).map(productCard).join("")}</div>
 </section>
 <section class="container showcase-section">
   <div class="section-heading-row"><div><span class="eyebrow">EXPLORE MORE</span><h2 class="section-title">More Products For You</h2><p class="section-subtitle">More styles, more choices and more everyday deals</p></div><a href="products.html" class="showcase-link">View all products <i class="bi bi-chevron-right"></i></a></div>
   <div class="showcase-scroll">${PRODUCTS.slice(26, 42).map(productCard).join("")}</div>
 </section>
 <section class="container showcase-section">
   <div class="trust-strip"><div><i class="bi bi-arrow-counterclockwise"></i><span><b>7 Days Easy Return</b><small>Simple returns on eligible items</small></span></div><div><i class="bi bi-cash-coin"></i><span><b>Cash on Delivery</b><small>Pay safely at your doorstep</small></span></div><div><i class="bi bi-tag-fill"></i><span><b>Lowest Prices</b><small>Deals across 120+ products</small></span></div></div>
 </section>`;
    nav.insertAdjacentHTML("afterend", bannerHtml);
}
document.addEventListener("DOMContentLoaded", () => { updateGlobalUI(); renderHeader(); initTheme(); initSearch(); initAnimations(); initBackTop(); initNavigation(); marketplaceShowcase(); });
(function () {
    const originalShowToast = window.showToast;
    window.showToast = function (msg, type = 'success') { if (typeof originalShowToast === 'function')
        originalShowToast(msg, type); };
    function safeProduct(id) { return typeof findProduct === 'function' ? findProduct(id) : PRODUCTS.find(p => String(p.id) === String(id)); }
    function syncCart() { try {
        setLS('cart', CART);
        updateGlobalUI();
    }
    catch (e) { } }
    function refreshPageCart() { if (typeof renderCart === 'function')
        renderCart(); if (typeof renderCheckoutSummary === 'function')
        renderCheckoutSummary(); }
    window.addToCart = function (id, qty = 1) {
        const p = safeProduct(id);
        if (!p)
            return;
        const amount = Math.max(1, Number(qty) || 1), existing = CART.find(x => String(x.id) === String(p.id));
        if (existing)
            existing.qty = (Number(existing.qty) || 0) + amount;
        else
            CART.push({ id: p.id, qty: amount });
        syncCart();
        refreshPageCart();
        showToast(`${p.title} added to cart`, 'success');
        document.querySelectorAll('.cart-icon').forEach(x => { x.classList.remove('cart-bounce'); void x.offsetWidth; x.classList.add('cart-bounce'); });
    };
    window.removeFromCart = function (id) { CART = CART.filter(x => String(x.id) !== String(id)); syncCart(); refreshPageCart(); showToast('Product removed from cart', 'info'); };
    window.changeQty = function (id, delta) { const x = CART.find(x => String(x.id) === String(id)); if (!x)
        return; x.qty = Math.max(1, (Number(x.qty) || 1) + Number(delta || 0)); syncCart(); refreshPageCart(); };
    window.toggleWishlist = function (id) { const n = Number(id); if (WISHLIST.includes(n))
        WISHLIST = WISHLIST.filter(x => x !== n);
    else
        WISHLIST.push(n); saveWishlist(); if (typeof renderProducts === 'function')
        renderProducts(); if (typeof renderWishlist === 'function')
        renderWishlist(); showToast(WISHLIST.includes(n) ? 'Added to wishlist' : 'Removed from wishlist', 'info'); };
    function toastButton(button, msg) { button.addEventListener('click', () => showToast(msg, 'info')); }
    function initFunctionalButtons() {
        updateGlobalUI();
        document.querySelectorAll('a[href]').forEach(a => {
            const href = a.getAttribute('href');
            if (!href || href.startsWith('#') || href.startsWith('http') || href.startsWith('mailto:') || href.startsWith('tel:'))
                return;
            a.addEventListener('click', (ev) => {
                if ((href === 'payment.html' || href.endsWith('/payment.html')) && (!Array.isArray(CART) || !CART.length)) {
                    ev.preventDefault();
                    showToast('Your cart is empty', 'danger');
                    return;
                }
            });
        });
        document.querySelectorAll('button').forEach(b => {
            const text = (b.textContent || '').trim().replace(/\s+/g, ' ').toLowerCase();
            if (!text)
                return;
            if (text === 'google play' || text === 'get the app')
                toastButton(b, 'App download is available in the demo version.');
            if (text === 'continue to payment')
                b.addEventListener('click', () => location.href = 'payment.html');
            if (text === 'pay & place order')
                b.classList.add('pulse-action');
            if (text === 'send message')
                b.classList.add('pulse-action');
        });
        document.querySelectorAll('.footer .bi-instagram,.footer .bi-facebook,.footer .bi-youtube,.footer .bi-linkedin').forEach(i => i.parentElement?.addEventListener('click', () => showToast('Social links are part of this demo', 'info')));
        document.querySelectorAll('.product-card').forEach(card => { card.addEventListener('mouseenter', () => card.classList.add('product-hover')); card.addEventListener('mouseleave', () => card.classList.remove('product-hover')); });
    }
    function initProductDetailControls() {
        document.querySelectorAll('.product-details-page .btn-outline-shop, #detailPage .btn-outline-shop').forEach(b => {
            if ((b.textContent || '').trim() && !b.dataset.bound) {
                b.dataset.bound = '1';
                b.addEventListener('click', () => { document.querySelectorAll('#detailPage .size-selected').forEach(x => x.classList.remove('size-selected')); b.classList.add('size-selected'); showToast(`Selected ${b.textContent.trim()}`, 'info'); });
            }
        });
    }
    function initKeyboardShortcuts() {
        document.addEventListener('keydown', e => {
            if (e.key === '/' && !['INPUT', 'TEXTAREA', 'SELECT'].includes(document.activeElement.tagName)) {
                e.preventDefault();
                document.querySelector('#globalSearch,#searchInput,#mobileSearch')?.focus();
            }
            if (e.key === 'Escape')
                document.querySelector('#searchSuggestions')?.classList.add('d-none');
        });
    }
    document.addEventListener('DOMContentLoaded', () => { initFunctionalButtons(); initProductDetailControls(); initKeyboardShortcuts(); });
    window.addEventListener('storage', () => { CART = getLS('cart', []); WISHLIST = getLS('wishlist', []); updateGlobalUI(); refreshPageCart(); });
})();
(function () {
    const legacyShowcase = window.marketplaceShowcase;
    window.marketplaceShowcase = function () {
        const page = (location.pathname.split('/').pop() || 'index.html').toLowerCase();
        const allowed = ['index.html', 'products.html', 'search.html', 'categories.html', 'offers.html'];
        if (!allowed.includes(page))
            return;
        if (typeof legacyShowcase === 'function')
            legacyShowcase();
    };
})();
