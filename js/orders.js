function renderOrders() {
    const el = $("#ordersList");
    if (!el)
        return;
    const orders = getLS("orders", []);
    el.innerHTML = orders.length ? orders.map(o => `<div class="info-card mb-3"><div class="d-flex justify-content-between gap-2 flex-wrap"><div><b>Order #${o.id}</b><div class="muted small">${o.date}</div></div><span class="badge text-bg-success">${o.status}</span></div><hr><div>${o.items.map(p => `${p.title} × ${p.qty}`).join("<br>")}</div><div class="d-flex justify-content-between mt-3"><b>${money(o.total)}</b><a class="btn btn-sm btn-outline-shop" href="track-order.html?id=${o.id}">Track Order</a></div></div>`).join("") : `<div class="empty-state"><div class="empty-icon"><i class="bi bi-box-seam"></i></div><h4>No orders yet</h4><p class="muted">Your next order will appear here.</p><a class="btn btn-shop" href="products.html">Start Shopping</a></div>`;
}
function renderTracking() {
    const id = new URLSearchParams(location.search).get("id"), orders = getLS("orders", []), o = orders.find(x => x.id === id) || orders[0], el = $("#tracking");
    if (!el)
        return;
    if (!o) {
        el.innerHTML = '<div class="empty-state">No order found.</div>';
        return;
    }
    const steps = ["Order Placed", "Confirmed", "Packed", "Shipped", "Out for Delivery", "Delivered"], active = o.status === "Delivered" ? 6 : 2;
    el.innerHTML = `<div class="info-card"><h4 class="fw-bold">Tracking #${o.id}</h4><p class="muted">Estimated delivery in 3–5 days</p><div class="timeline">${steps.map((s, i) => `<div class="timeline-item ${i < active ? "active" : ""}"><span class="timeline-dot"></span><b>${s}</b><div class="muted small">${i < active ? "Completed" : "Pending"}</div></div>`).join("")}</div></div>`;
}
document.addEventListener("DOMContentLoaded", () => { renderOrders(); renderTracking(); });
