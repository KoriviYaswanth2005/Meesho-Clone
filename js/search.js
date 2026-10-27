let currentList = [...PRODUCTS];
let applied = { cats: [], min: 0, max: 0, rating: 0, discount: 0, seller: '' };
function getQ() { return new URLSearchParams(location.search).get('q') || ''; }
function searchable(p) { return [p.title, p.category, p.subcategory, p.description, p.seller, p.brand, ...(p.tags || []), ...(p.colors || [])].join(' ').toLowerCase(); }
function renderSearchPage() {
    const q = getQ(), input = $('#searchInput');
    if (input)
        input.value = q;
    const qq = q.trim().toLowerCase();
    const exact = PRODUCTS.filter(p => p.category.toLowerCase() === qq || (p.subcategory || '').toLowerCase() === qq);
    currentList = qq && exact.length ? exact : PRODUCTS.filter(p => searchable(p).includes(qq));
    applyListing();
    const title = $('#resultTitle');
    if (title)
        title.textContent = q ? `Search results for "${q}"` : 'All products';
}
function applyListing() {
    let list = [...currentList];
    const f = applied;
    if (f.cats.length)
        list = list.filter(p => f.cats.includes(p.category));
    if (f.min)
        list = list.filter(p => p.price >= f.min);
    if (f.max)
        list = list.filter(p => p.price <= f.max);
    if (f.rating)
        list = list.filter(p => p.rating >= f.rating);
    if (f.discount)
        list = list.filter(p => p.discount >= f.discount);
    if (f.seller)
        list = list.filter(p => p.seller === f.seller);
    const sort = $('#sortProducts')?.value;
    if (sort === 'low')
        list.sort((a, b) => a.price - b.price);
    if (sort === 'high')
        list.sort((a, b) => b.price - a.price);
    if (sort === 'rating')
        list.sort((a, b) => b.rating - a.rating);
    if (sort === 'discount')
        list.sort((a, b) => b.discount - a.discount);
    if (sort === 'new')
        list.sort((a, b) => b.id - a.id);
    const grid = $('#productGrid');
    if (isGroupedView()) {
        renderGroupedView(currentList);
        const pc = $('#productCount');
        if (pc)
            pc.textContent = `${currentList.length} products in ${CATEGORY_ORDER.length} categories`;
        $('#emptyListing')?.classList.add('d-none');
        return currentList.length;
    }
    if (grid)
        grid.className = FLAT_GRID_CLASS;
    renderGrid(list);
    const pc = $('#productCount');
    if (pc)
        pc.textContent = `${list.length} products`;
    $('#emptyListing')?.classList.toggle('d-none', list.length > 0);
    return list.length;
}
const CATEGORY_ORDER = ["Women", "Men", "Kids", "Beauty", "Home", "Kitchen", "Electronics", "Jewellery", "Footwear", "Accessories", "Sports", "Grocery"];
const FLAT_GRID_CLASS = "row row-cols-2 row-cols-md-3 row-cols-xl-4 g-3";
const SUB_PREVIEW = 4;
function catSlug(c) { return c.toLowerCase().replace(/[^a-z]/g, ''); }
function isGroupedView() {
    const f = applied;
    const noFilters = !f.cats.length && !f.min && !f.max && !f.rating && !f.discount && !f.seller;
    return !getQ() && noFilters && !($('#sortProducts')?.value);
}
function renderGroupedView(list) {
    const grid = $('#productGrid');
    if (!grid)
        return;
    grid.className = 'grp-wrap';
    const cats = CATEGORY_ORDER.filter(c => list.some(p => p.category === c));
    const jump = `<nav class="grp-jump" aria-label="Jump to category">${cats.map(c => `<a href="#group-${catSlug(c)}">${c}</a>`).join('')}</nav>`;
    const sections = cats.map(c => {
        const items = list.filter(p => p.category === c);
        const subs = [...new Set(items.map(p => p.subcategory))];
        const subHtml = subs.map(sub => {
            const subItems = items.filter(p => p.subcategory === sub);
            return `<div class="grp-sub">
        <div class="grp-sub-head"><h3>${sub}</h3><a href="search.html?q=${encodeURIComponent(sub)}">View all (${subItems.length}) <i class="bi bi-chevron-right"></i></a></div>
        <div class="row row-cols-2 row-cols-md-4 g-3">${subItems.slice(0, SUB_PREVIEW).map(productCard).join('')}</div>
      </div>`;
        }).join('');
        return `<section class="grp-cat" id="group-${catSlug(c)}">
      <div class="grp-cat-head"><h2 class="section-title">${c}</h2><span class="muted small">${items.length} products</span></div>
      ${subHtml}
    </section>`;
    }).join('');
    grid.innerHTML = jump + sections;
    if (location.hash.startsWith('#group-')) {
        document.querySelector(location.hash)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
}
function readFilters() {
    const [min, max] = (document.querySelector('input[name=price]:checked')?.value || '0,0').split(',').map(Number);
    return {
        cats: [...document.querySelectorAll('input[name=cat]:checked')].map(i => i.value),
        min, max,
        rating: Number(document.querySelector('input[name=rating]:checked')?.value || 0),
        discount: Number(document.querySelector('input[name=disc]:checked')?.value || 0),
        seller: $('#filterSeller')?.value || ''
    };
}
function applyFilters() {
    applied = readFilters();
    const count = applyListing();
    showToast(`${count} product${count === 1 ? '' : 's'} found`, 'info');
    if (window.innerWidth < 992)
        $('#productGrid')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
}
function clearFilters() {
    document.querySelectorAll('input[name=cat]').forEach(i => i.checked = false);
    document.querySelectorAll('input[name=price][value="0,0"],input[name=rating][value="0"],input[name=disc][value="0"]').forEach(i => i.checked = true);
    const s = $('#filterSeller');
    if (s)
        s.value = '';
    const cs = $('#catSearch');
    if (cs) {
        cs.value = '';
        filterCategoryNames('');
    }
    applied = { cats: [], min: 0, max: 0, rating: 0, discount: 0, seller: '' };
    applyListing();
    showToast('Filters cleared', 'info');
}
function filterCategoryNames(text) {
    const q = text.trim().toLowerCase();
    document.querySelectorAll('#filterCategoryList .fp-check').forEach(l => {
        l.style.display = l.dataset.name.toLowerCase().includes(q) ? '' : 'none';
    });
}
function buildFilterOptions() {
    const cats = [...new Set(PRODUCTS.map(p => p.category))].sort();
    const list = $('#filterCategoryList');
    if (list)
        list.innerHTML = cats.map(c => `<label class="fp-check" data-name="${c}"><input type="checkbox" name="cat" value="${c}"><span>${c}</span></label>`).join('');
    const sellers = [...new Set(PRODUCTS.map(p => p.seller))].sort();
    const sel = $('#filterSeller');
    if (sel)
        sel.innerHTML = '<option value="">All sellers</option>' + sellers.map(s => `<option>${s}</option>`).join('');
}
document.addEventListener('DOMContentLoaded', () => {
    if (!$('#productGrid'))
        return;
    buildFilterOptions();
    renderSearchPage();
    window.addEventListener('hashchange', () => { if (isGroupedView())
        renderGroupedView(currentList); });
    $('#applyFilters')?.addEventListener('click', applyFilters);
    $('#resetFilters')?.addEventListener('click', clearFilters);
    $('#sortProducts')?.addEventListener('change', applyListing);
    $('#catSearch')?.addEventListener('input', e => filterCategoryNames(e.target.value));
    $('#searchForm')?.addEventListener('submit', e => { e.preventDefault(); const q = $('#searchInput').value.trim(); location.href = 'search.html' + (q ? '?q=' + encodeURIComponent(q) : ''); });
});
