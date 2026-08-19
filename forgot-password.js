const recoveryForm = document.getElementById("recoveryForm");
const recoveryEmail = document.getElementById("recoveryEmail");
const recoveryEmailError = document.getElementById("recoveryEmailError");
const formMessage = document.getElementById("formMessage");

recoveryEmail.addEventListener("input", () => {
    recoveryEmail.classList.remove("input-error");
    recoveryEmail.removeAttribute("aria-invalid");
    recoveryEmailError.textContent = "";
    formMessage.className = "form-message";
    formMessage.textContent = "";
});

recoveryForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const email = recoveryEmail.value.trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        recoveryEmail.classList.add("input-error");
        recoveryEmail.setAttribute("aria-invalid", "true");
        recoveryEmailError.textContent = "Please enter a valid email address.";
        formMessage.textContent = "Please check the highlighted field.";
        formMessage.className = "form-message error";
        recoveryEmail.focus();
        return;
    }

    formMessage.textContent = "If an account uses this email, a recovery link has been prepared.";
    formMessage.className = "form-message success";
    recoveryForm.reset();
});
