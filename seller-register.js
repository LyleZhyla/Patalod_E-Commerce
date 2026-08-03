const sellerForm = document.getElementById("sellerForm");
const formMessage = document.getElementById("formMessage");
const fields = {
    ownerName: document.getElementById("ownerName"),
    shopName: document.getElementById("shopName"),
    email: document.getElementById("email"),
    phone: document.getElementById("phone"),
    sellerPassword: document.getElementById("sellerPassword"),
    confirmPassword: document.getElementById("confirmPassword"),
    terms: document.getElementById("terms")
};

function setError(name, message) {
    const input = fields[name];
    const error = document.getElementById(`${name}Error`);
    input.classList.add("input-error");
    input.setAttribute("aria-invalid", "true");
    error.textContent = message;
}

function clearError(name) {
    const input = fields[name];
    const error = document.getElementById(`${name}Error`);
    input.classList.remove("input-error");
    input.removeAttribute("aria-invalid");
    error.textContent = "";
}

function getSellerAccounts() {
    try {
        const accounts = JSON.parse(localStorage.getItem("sellerAccounts"));
        return Array.isArray(accounts) ? accounts : [];
    } catch {
        return [];
    }
}

async function hashPassword(password, salt) {
    const bytes = new TextEncoder().encode(`${salt}:${password}`);
    const hash = await crypto.subtle.digest("SHA-256", bytes);
    return Array.from(new Uint8Array(hash), (byte) => byte.toString(16).padStart(2, "0")).join("");
}

Object.entries(fields).forEach(([name, input]) => {
    input.addEventListener("input", function () {
        clearError(name);
        formMessage.className = "form-message";
        formMessage.textContent = "";
    });
});

document.querySelectorAll("[data-toggle]").forEach((button) => {
    button.addEventListener("click", function () {
        const input = document.getElementById(button.dataset.toggle);
        const showPassword = input.type === "password";
        input.type = showPassword ? "text" : "password";
        button.textContent = showPassword ? "Hide" : "Show";
        button.setAttribute("aria-label", showPassword ? "Hide password" : "Show password");
        button.setAttribute("aria-pressed", String(showPassword));
    });
});

sellerForm.addEventListener("submit", async function (event) {
    event.preventDefault();
    Object.keys(fields).forEach(clearError);

    const ownerName = fields.ownerName.value.trim();
    const shopName = fields.shopName.value.trim();
    const email = fields.email.value.trim().toLowerCase();
    const phone = fields.phone.value.trim();
    const password = fields.sellerPassword.value;
    const accounts = getSellerAccounts();
    let isValid = true;

    if (ownerName.length < 2) {
        setError("ownerName", "Please enter your full name.");
        isValid = false;
    }
    if (shopName.length < 2) {
        setError("shopName", "Please enter a shop name.");
        isValid = false;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        setError("email", "Please enter a valid email address.");
        isValid = false;
    } else if (accounts.some((account) => account.email === email)) {
        setError("email", "A seller account already uses this email.");
        isValid = false;
    }
    if (phone && !/^[+\d][\d\s()-]{6,19}$/.test(phone)) {
        setError("phone", "Please enter a valid phone number.");
        isValid = false;
    }
    if (password.length < 8 || !/[A-Za-z]/.test(password) || !/\d/.test(password)) {
        setError("sellerPassword", "Use 8+ characters with a letter and a number.");
        isValid = false;
    }
    if (fields.confirmPassword.value !== password || !fields.confirmPassword.value) {
        setError("confirmPassword", "Passwords must match.");
        isValid = false;
    }
    if (!fields.terms.checked) {
        setError("terms", "You must agree before creating an account.");
        isValid = false;
    }

    if (!isValid) {
        formMessage.textContent = "Please check the highlighted fields.";
        formMessage.className = "form-message error";
        sellerForm.querySelector("[aria-invalid='true']")?.focus();
        return;
    }

    const passwordSalt = crypto.randomUUID();
    const passwordHash = await hashPassword(password, passwordSalt);

    accounts.push({
        id: `seller-${Date.now()}`,
        ownerName,
        shopName,
        email,
        phone,
        passwordSalt,
        passwordHash,
        role: "seller",
        createdAt: new Date().toISOString()
    });
    localStorage.setItem("sellerAccounts", JSON.stringify(accounts));
    formMessage.textContent = "Seller account created! Redirecting to login...";
    formMessage.className = "form-message success";

    window.setTimeout(function () {
        window.location.href = `index.html?registered=${encodeURIComponent(email)}`;
    }, 900);
});
