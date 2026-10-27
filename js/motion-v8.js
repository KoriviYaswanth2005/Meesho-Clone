(function () {
    document.documentElement.classList.add("js");
    if (!document.querySelector(".wa-float")) {
        const a = document.createElement("a");
        a.className = "wa-float";
        a.href = "https://wa.me/918125807927?text=Hi%20Korivi%2C%20I%20need%20help%20with%20a%20website";
        a.target = "_blank";
        a.rel = "noopener";
        a.setAttribute("aria-label", "Chat with us on WhatsApp");
        a.innerHTML = '<i class="bi bi-whatsapp"></i><span class="wa-tip">Chat on WhatsApp</span>';
        document.body.appendChild(a);
    }
    const reveal = new IntersectionObserver(entries => entries.forEach(e => {
        if (e.isIntersecting) {
            e.target.classList.add("mv-in");
            reveal.unobserve(e.target);
        }
    }), { threshold: .12 });
    const watch = el => { if (!el.classList.contains("mv-reveal")) {
        el.classList.add("mv-reveal");
        reveal.observe(el);
    } };
    const sel = ".product-card,.grp-cat,.grp-sub,.promo-card,.category-card,.showcase-section,.gold-banner,.offer-card";
    document.querySelectorAll(sel).forEach(watch);
    new MutationObserver(ms => ms.forEach(m => m.addedNodes.forEach(n => {
        if (n.nodeType !== 1)
            return;
        if (n.matches && n.matches(sel))
            watch(n);
        n.querySelectorAll && n.querySelectorAll(sel).forEach(watch);
    }))).observe(document.body, { childList: true, subtree: true });
    const card = document.querySelector(".developer-footer-card");
    if (card) {
        const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) {
            card.classList.add("dev-in");
            io.disconnect();
        } }), { threshold: .15 });
        io.observe(card);
    }
    const quoteEl = document.getElementById("devQuote");
    const quotes = [
        "Code is not just about writing programs — it is about turning ideas into solutions.",
        "“Talk is cheap. Show me the code.” — Linus Torvalds",
        "“Simplicity is prerequisite for reliability.” — Edsger W. Dijkstra",
        "“First, solve the problem. Then, write the code.” — John Johnson",
        "“Programs must be written for people to read, and only incidentally for machines to execute.” — Harold Abelson"
    ];
    if (quoteEl) {
        let qi = 0;
        setInterval(() => {
            quoteEl.classList.add("changing");
            setTimeout(() => { qi = (qi + 1) % quotes.length; quoteEl.textContent = quotes[qi]; quoteEl.classList.remove("changing"); }, 450);
        }, 6000);
    }
    document.querySelectorAll("[data-copy]").forEach(btn => {
        btn.addEventListener("click", async (e) => {
            e.preventDefault();
            const text = btn.getAttribute("data-copy");
            let ok = false;
            try {
                await navigator.clipboard.writeText(text);
                ok = true;
            }
            catch (_) {
                const t = document.createElement("textarea");
                t.value = text;
                document.body.appendChild(t);
                t.select();
                try {
                    ok = document.execCommand("copy");
                }
                catch (__) { }
                t.remove();
            }
            btn.classList.add("copied");
            const icon = btn.querySelector("i");
            if (icon)
                icon.className = "bi bi-check2";
            if (typeof showToast === "function")
                showToast(ok ? "Copied to clipboard" : "Copy failed — please copy manually", "success");
            setTimeout(() => { btn.classList.remove("copied"); if (icon)
                icon.className = "bi bi-clipboard"; }, 1600);
        });
    });
})();
