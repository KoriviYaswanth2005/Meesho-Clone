function saveAddress() {
    const form = $('#addressForm');
    if (!form)
        return;
    if (!form.checkValidity()) {
        form.classList.add('was-validated');
        showToast('Please complete all required address fields', 'danger');
        return;
    }
    const a = { id: Date.now(), name: $('#name').value.trim(), phone: $('#phone').value.trim(), line: $('#line').value.trim(), city: $('#city').value.trim(), state: $('#state').value.trim(), pin: $('#pin').value.trim() };
    const arr = getLS('addresses', []);
    arr.push(a);
    setLS('addresses', arr);
    setLS('selectedAddress', a.id);
    showToast('Address saved and selected');
    renderAddresses();
    form.reset();
    form.classList.remove('was-validated');
}
function renderAddresses() {
    const el = $('#addressList');
    if (!el)
        return;
    const arr = getLS('addresses', []), selected = getLS('selectedAddress', null);
    el.innerHTML = arr.length ? arr.map(a => `<div class="info-card mb-2 address-card ${String(selected) === String(a.id) ? 'selected-address' : ''}"><div class="d-flex justify-content-between gap-2"><div><b>${a.name}</b> · ${a.phone}<br>${a.line}, ${a.city}, ${a.state} - ${a.pin}</div>${String(selected) === String(a.id) ? '<span class="badge text-bg-success h-100">Selected</span>' : ''}</div><div class="mt-2 d-flex gap-2"><button type="button" class="btn btn-sm btn-shop" onclick="selectAddress(${a.id})">Deliver here</button><button type="button" class="btn btn-sm btn-outline-danger" onclick="deleteAddress(${a.id})">Delete</button></div></div>`).join('') : '<div class="muted">No saved addresses. Add one below.</div>';
}
function selectAddress(id) { setLS('selectedAddress', id); showToast('Delivery address selected'); renderAddresses(); }
function deleteAddress(id) { let arr = getLS('addresses', []).filter(a => String(a.id) !== String(id)); setLS('addresses', arr); if (String(getLS('selectedAddress', null)) === String(id))
    setLS('selectedAddress', arr[0]?.id || null); renderAddresses(); showToast('Address removed', 'info'); }
function checkoutTotals() { const items = cartData(); const subtotal = items.reduce((s, p) => s + p.price * p.qty, 0), delivery = subtotal >= 499 || subtotal === 0 ? 0 : 49, c = getLS('coupon', null), coupon = c ? Math.min(Number(c.off) || 0, subtotal) : 0; return { items, subtotal, delivery, coupon, total: Math.max(0, subtotal + delivery - coupon) }; }
function placeOrder() {
    const t = checkoutTotals();
    if (!t.items.length) {
        showToast('Your cart is empty', 'danger');
        setTimeout(() => location.href = 'products.html', 700);
        return;
    }
    const addr = getLS('selectedAddress', null);
    if (!addr) {
        showToast('Please select a delivery address first', 'danger');
        setTimeout(() => location.href = 'address.html', 700);
        return;
    }
    const payment = document.querySelector('input[name="pay"]:checked')?.value || 'UPI';
    const order = { id: 'MS' + Math.floor(100000000 + Math.random() * 899999999), date: new Date().toLocaleDateString('en-IN'), items: t.items, total: t.total, subtotal: t.subtotal, delivery: t.delivery, coupon: t.coupon, payment, status: 'Confirmed', address: addr };
    const orders = getLS('orders', []);
    orders.unshift(order);
    setLS('orders', orders);
    setLS('lastOrder', order);
    setLS('coupon', null);
    CART = [];
    saveCart();
    showToast('Order placed successfully');
    setTimeout(() => location.href = 'order-success.html?id=' + order.id, 500);
}
function renderCheckoutSummary() { const box = $('#checkoutItems'); if (!box)
    return; const t = checkoutTotals(); box.innerHTML = t.items.map(p => `<div class="d-flex gap-2 mb-2"><img src="${p.images[0]}" style="width:52px;height:52px;object-fit:cover;border-radius:8px"><div class="flex-grow-1 small">${p.title} × ${p.qty}</div><b>${money(p.price * p.qty)}</b></div>`).join('') || '<p class="muted">Your cart is empty.</p>'; $('#checkoutTotal') && (document.querySelector('#checkoutTotal').textContent = money(t.total)); }
document.addEventListener('DOMContentLoaded', () => { renderAddresses(); renderCheckoutSummary(); $('#addressForm')?.addEventListener('submit', e => { e.preventDefault(); saveAddress(); }); if (location.pathname.endsWith('checkout.html') && !CART.length) {
    showToast('Your cart is empty', 'info');
} });
