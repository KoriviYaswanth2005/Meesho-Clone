const UPI = { pa: "koriviyaswanth4@oksbi", pn: "Korivi Yaswanth", cu: "INR" };
function upiUrl(amount, note) {
    return `upi://pay?pa=${UPI.pa}&pn=${encodeURIComponent(UPI.pn)}&am=${encodeURIComponent(amount)}&cu=${UPI.cu}&tn=${encodeURIComponent(note)}`;
}
function renderUpiBlock(p) {
    const uid = "upi-" + p.id;
    return `<div class="upi-box" id="${uid}">
    <div class="upi-head"><i class="bi bi-qr-code-scan"></i><div><b>Pay with UPI</b><small class="muted d-block">Pay ${money(p.price)} to ${UPI.pn}</small></div></div>
    <a class="btn btn-shop w-100 upi-pay-btn" href="${upiUrl(p.price, "Order: " + p.title)}"><i class="bi bi-phone me-1"></i>Pay ${money(p.price)} via UPI</a>
    <div class="upi-confirm">
      <p class="small muted mb-2">After you pay in your UPI app, enter the UPI transaction ID to confirm your payment.</p>
      <div class="d-flex gap-2"><input class="form-control form-control-sm" id="${uid}-ref" placeholder="UPI transaction ID" maxlength="30" autocomplete="off"><button type="button" class="btn btn-outline-shop btn-sm" onclick="confirmUpiPayment(${p.id})">Confirm</button></div>
      <div class="small text-danger mt-1" id="${uid}-err" style="display:none"></div>
    </div>
    <div class="upi-success" id="${uid}-ok" style="display:none"></div>
  </div>`;
}
function confirmUpiPayment(id) {
    const p = findProduct(id);
    if (!p)
        return;
    const input = document.getElementById("upi-" + id + "-ref");
    const err = document.getElementById("upi-" + id + "-err");
    const ok = document.getElementById("upi-" + id + "-ok");
    const ref = (input?.value || "").trim();
    if (!/^[A-Za-z0-9]{6,30}$/.test(ref)) {
        err.textContent = "Enter a valid UPI transaction ID (6 to 30 letters or digits).";
        err.style.display = "";
        return;
    }
    const order = {
        id: "MS" + String(Date.now()).slice(-9),
        date: new Date().toLocaleDateString("en-IN"),
        items: [{ id: p.id, title: p.title, price: p.price, qty: 1, images: p.images, category: p.category }],
        subtotal: p.price, delivery: 0, coupon: 0, total: p.price,
        payment: "UPI", upiRef: ref, status: "Paid",
        address: getLS("selectedAddress", null)
    };
    const orders = getLS("orders", []);
    orders.unshift(order);
    setLS("orders", orders);
    setLS("lastOrder", order);
    err.style.display = "none";
    document.querySelector(`#upi-${id} .upi-confirm`).style.display = "none";
    document.querySelector(`#upi-${id} .upi-pay-btn`).style.display = "none";
    ok.innerHTML = `<div class="upi-done"><i class="bi bi-check-circle-fill"></i><div><b>Payment successful</b><small class="d-block muted">${money(p.price)} paid for ${p.title}</small><small class="d-block muted">Transaction ID ${ref} · Order #${order.id}</small></div></div><a class="btn btn-outline-shop btn-sm mt-2" href="orders.html">View my orders</a>`;
    ok.style.display = "";
    showToast("Payment successful");
}
document.addEventListener("DOMContentLoaded", () => {
    setTimeout(() => {
        const host = document.getElementById("detailPage");
        if (!host)
            return;
        const id = new URLSearchParams(location.search).get("id") || 1;
        const p = findProduct(id);
        if (!p)
            return;
        const btn = host.querySelector("button[onclick^='addToCart']");
        if (btn && !document.getElementById("upi-" + p.id))
            btn.insertAdjacentHTML("afterend", renderUpiBlock(p));
    }, 0);
});
