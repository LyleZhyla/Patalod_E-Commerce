const loginForm = document.getElementById("loginForm");
const usernameInput = document.getElementById("username");
const passwordInput = document.getElementById("password");
const usernameError = document.getElementById("usernameError");
const passwordError = document.getElementById("passwordError");
const formMessage = document.getElementById("formMessage");
const passwordToggle = document.getElementById("passwordToggle");
const forgotPassword = document.getElementById("forgotPassword");
const signUpLink = document.getElementById("signUpLink");

function showFieldError(input, errorElement, message) {
    input.classList.add("input-error");
    input.setAttribute("aria-invalid", "true");
    errorElement.textContent = message;
}

function clearFieldError(input, errorElement) {
    input.classList.remove("input-error");
    input.removeAttribute("aria-invalid");
    errorElement.textContent = "";
}

function showFormMessage(message, type) {
    formMessage.textContent = message;
    formMessage.className = `form-message ${type}`;
}

function clearFormMessage() {
    formMessage.textContent = "";
    formMessage.className = "form-message";
}

loginForm.addEventListener("submit", function (event) {
    event.preventDefault();

    const username = usernameInput.value.trim();
    const password = passwordInput.value;
    let isValid = true;

    clearFieldError(usernameInput, usernameError);
    clearFieldError(passwordInput, passwordError);
    clearFormMessage();

    if (username === "") {
        showFieldError(
            usernameInput,
            usernameError,
            "Please enter your username or email."
        );
        isValid = false;
    }

    if (password === "") {
        showFieldError(
            passwordInput,
            passwordError,
            "Please enter your password."
        );
        isValid = false;
    } else if (password.length < 6) {
        showFieldError(
            passwordInput,
            passwordError,
            "Password must be at least 6 characters."
        );
        isValid = false;
    }

    if (!isValid) {
        showFormMessage("Please check the highlighted field(s).", "error");

        if (username === "") {
            usernameInput.focus();
        } else {
            passwordInput.focus();
        }

        return;
    }

    showFormMessage("Login successful! Opening the shop...", "success");

    window.setTimeout(function () {
        window.location.href = "shop.html";
    }, 900);
});

usernameInput.addEventListener("input", function () {
    if (usernameInput.value.trim() !== "") {
        clearFieldError(usernameInput, usernameError);
    }
    clearFormMessage();
});

passwordInput.addEventListener("input", function () {
    if (passwordInput.value.length >= 6) {
        clearFieldError(passwordInput, passwordError);
    }
    clearFormMessage();
});

passwordToggle.addEventListener("click", function () {
    const passwordIsHidden = passwordInput.type === "password";

    passwordInput.type = passwordIsHidden ? "text" : "password";
    passwordToggle.textContent = passwordIsHidden ? "Hide" : "Show";
    passwordToggle.setAttribute(
        "aria-label",
        passwordIsHidden ? "Hide password" : "Show password"
    );
    passwordToggle.setAttribute("aria-pressed", String(passwordIsHidden));
});

forgotPassword.addEventListener("click", function (event) {
    event.preventDefault();
    showFormMessage(
        "Password recovery is not required for this front-end activity.",
        "error"
    );
});

signUpLink.addEventListener("click", function (event) {
    event.preventDefault();
    showFormMessage(
        "Account creation is not required for this front-end activity.",
        "error"
    );
});
