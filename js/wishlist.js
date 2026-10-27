function renderWishlist() {
    const el = $("#wishlistGrid"), empty = $("#emptyWishlist");
    if (!el)
        return;
    const items = WISHLIST.map(findProduct).filter(Boolean);
    empty?.classList.toggle("d-none", items.length > 0);
    el.innerHTML = items.map(productCard).join("");
}
document.addEventListener("DOMContentLoaded", renderWishlist);
