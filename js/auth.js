function demoLogin() {
    const form = $("#loginForm");
    if (!form.checkValidity()) {
        form.classList.add("was-validated");
        return;
    }
    setLS("user", { name: "Demo Shopper", email: $("#email").value });
    showToast("Login successful");
    setTimeout(() => location.href = "profile.html", 600);
}
function signup() {
    const form = $("#signupForm");
    if (!form.checkValidity()) {
        form.classList.add("was-validated");
        return;
    }
    if ($("#password").value !== $("#confirmPassword").value)
        return showToast("Passwords do not match", "danger");
    setLS("user", { name: $("#fullName").value, email: $("#signupEmail").value, phone: $("#signupPhone").value });
    location.href = "otp.html";
}
function verifyOtp() { if ($("#otp").value === "123456") {
    showToast("OTP verified");
    setTimeout(() => location.href = "profile.html", 500);
}
else
    showToast("Use demo OTP 123456", "danger"); }
function renderProfile() {
    const u = getLS("user", null);
    if (!u)
        return;
    $("#profileName")?.replaceChildren(document.createTextNode(u.name || "Meesho User"));
    $("#profileEmail")?.replaceChildren(document.createTextNode(u.email || ""));
}
document.addEventListener("DOMContentLoaded", () => { renderProfile(); $("#loginForm")?.addEventListener("submit", e => { e.preventDefault(); demoLogin(); }); $("#signupForm")?.addEventListener("submit", e => { e.preventDefault(); signup(); }); $("#otpForm")?.addEventListener("submit", e => { e.preventDefault(); verifyOtp(); }); });
