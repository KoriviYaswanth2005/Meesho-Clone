function cartData() {
    return CART.map(x => { const p = findProduct(x.id); return p ? { ...p, qty: Math.max(1, Number(x.qty) || 1) } : null; }).filter(Boolean);
}
function cartTotals() {
    const items = cartData();
    const subtotal = items.reduce((s, p) => s + p.price * p.qty, 0);
    const mrp = items.reduce((s, p) => s + p.mrp * p.qty, 0);
    const productDiscount = Math.max(0, mrp - subtotal);
    const delivery = subtotal === 0 ? 0 : (subtotal >= 499 ? 0 : 49);
    const coupon = getLS('coupon', null);
    const couponDiscount = coupon ? Math.min(Number(coupon.off) || 0, subtotal) : 0;
    return { items, subtotal, mrp, productDiscount, couponDiscount, delivery, total: Math.max(0, subtotal + delivery - couponDiscount) };
}
function renderCart() {
    const list = $('#cartItems'), empty = $('#emptyCart'), area = $('#cartArea');
    if (!list)
        return;
    const t = cartTotals();
    empty?.classList.toggle('d-none', t.items.length > 0);
    area?.classList.toggle('d-none', !t.items.length);
    list.innerHTML = t.items.map(p => `<div class="info-card mb-3 cart-row" data-id="${p.id}"><div class="row g-3 align-items-center"><div class="col-4 col-md-2"><a href="product-details.html?id=${p.id}"><img src="${p.images[0]}" class="img-fluid rounded-3 cart-thumb" alt="${p.title}"></a></div><div class="col-8 col-md-5"><a href="product-details.html?id=${p.id}" class="fw-bold text-decoration-none">${p.title}</a><small class="muted d-block mt-1">${p.seller} · ${p.delivery}</small><div class="mt-2"><span class="price">${money(p.price)}</span> <span class="mrp">${money(p.mrp)}</span></div></div><div class="col-7 col-md-3"><div class="qty"><button type="button" aria-label="Decrease" onclick="changeQty(${p.id},-1)">−</button><span>${p.qty}</span><button type="button" aria-label="Increase" onclick="changeQty(${p.id},1)">+</button></div></div><div class="col-5 col-md-2 text-end"><button type="button" class="btn btn-sm btn-outline-danger" onclick="removeFromCart(${p.id})"><i class="bi bi-trash"></i></button></div></div></div>`).join('');
    $('#subtotal') && ($('#subtotal').textContent = money(t.subtotal));
    $('#discount') && ($('#discount').textContent = '-' + money(t.productDiscount + t.couponDiscount));
    $('#delivery') && ($('#delivery').textContent = t.delivery ? '₹' + t.delivery : 'FREE');
    $('#total') && ($('#total').textContent = money(t.total));
    const cc = getLS('coupon', null);
    const c = $('#appliedCoupon');
    if (c)
        c.textContent = cc?.code || '';
    const cw = $('#couponApplied');
    if (cw)
        cw.style.display = cc ? 'flex' : 'none';
    const dp = $('#deliveryProgressWrap'), bar = $('#deliveryProgress'), msg = $('#deliveryMessage'), pct = $('#deliveryPercent');
    if (dp) {
        dp.classList.toggle('d-none', !t.items.length);
        const progress = Math.min(100, Math.round((t.subtotal / 499) * 100));
        bar.style.width = progress + '%';
        pct.textContent = progress + '%';
        msg.textContent = t.subtotal >= 499 ? '🎉 Free delivery unlocked!' : 'Add ' + money(499 - t.subtotal) + ' more for free delivery';
    }
    updateGlobalUI();
}
function applyCoupon() {
    const code = ($('#coupon')?.value || '').trim().toUpperCase(), t = cartTotals();
    if (!t.items.length)
        return showToast('Add products before applying a coupon', 'danger');
    const rules = { WELCOME10: s => Math.round(s * .10), SAVE100: () => 100, SHOP20: s => Math.round(s * .20), FIRST50: () => 50 };
    if (!rules[code]) {
        setLS('coupon', null);
        showToast('Invalid coupon. Try WELCOME10, SAVE100, SHOP20 or FIRST50', 'danger');
        renderCart();
        return;
    }
    const off = Math.min(rules[code](t.subtotal), t.subtotal);
    setLS('coupon', { code, off });
    showToast(`${code} applied — saved ${money(off)}`);
    renderCart();
}
function removeCoupon() { setLS('coupon', null); if ($('#coupon'))
    $('#coupon').value = ''; showToast('Coupon removed', 'info'); renderCart(); }
document.addEventListener('DOMContentLoaded', () => { renderCart(); $('#coupon')?.addEventListener('keydown', e => { if (e.key === 'Enter') {
    e.preventDefault();
    applyCoupon();
} }); });
