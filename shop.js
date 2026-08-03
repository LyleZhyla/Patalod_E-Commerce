const sidebar = document.getElementById("sidebar");
const shopLayout = document.querySelector(".shop-layout");
const sidebarOverlay = document.getElementById("sidebarOverlay");
const menuToggle = document.getElementById("menuToggle");
const sidebarCollapse = document.getElementById("sidebarCollapse");
const productSearch = document.getElementById("productSearch");
const searchStatus = document.getElementById("searchStatus");
const productCards = [...document.querySelectorAll(".product-card")];
const favoriteButtons = document.querySelectorAll(".favorite-button");
const addButtons = document.querySelectorAll(".add-button");
const categoryCards = document.querySelectorAll(".category-card");
const navLinks = document.querySelectorAll(".nav-link");
const cartCount = document.getElementById("cartCount");
const toast = document.getElementById("toast");
let toastTimer;

function openSidebar() {
    sidebar.classList.add("open");
    sidebarOverlay.classList.add("visible");
    menuToggle.setAttribute("aria-expanded", "true");
    menuToggle.setAttribute("aria-label", "Close navigation menu");
}

function closeSidebar() {
    sidebar.classList.remove("open");
    sidebarOverlay.classList.remove("visible");
    menuToggle.setAttribute("aria-expanded", "false");
    menuToggle.setAttribute("aria-label", "Open navigation menu");
}

function setDesktopSidebarCollapsed(shouldCollapse) {
    sidebar.classList.toggle("collapsed", shouldCollapse);
    shopLayout.classList.toggle("sidebar-collapsed", shouldCollapse);
    sidebarCollapse.setAttribute("aria-expanded", String(!shouldCollapse));
    sidebarCollapse.setAttribute(
        "aria-label",
        shouldCollapse ? "Expand side menu" : "Collapse side menu"
    );
}

function showToast(message) {
    window.clearTimeout(toastTimer);
    toast.textContent = message;
    toast.classList.add("visible");

    toastTimer = window.setTimeout(function () {
        toast.classList.remove("visible");
    }, 2200);
}

function filterProducts(searchTerm) {
    const normalizedTerm = searchTerm.trim().toLowerCase();
    let visibleCount = 0;

    productCards.forEach(function (card) {
        const searchableText =
            `${card.dataset.name} ${card.dataset.category}`.toLowerCase();
        const isVisible = searchableText.includes(normalizedTerm);

        card.classList.toggle("is-hidden", !isVisible);
        if (isVisible) {
            visibleCount += 1;
        }
    });

    if (normalizedTerm === "") {
        searchStatus.textContent = "";
    } else {
        searchStatus.textContent =
            visibleCount === 0
                ? "No sweet finds matched your search."
                : `${visibleCount} product${visibleCount === 1 ? "" : "s"} found.`;
    }
}

menuToggle.addEventListener("click", function () {
    if (sidebar.classList.contains("open")) {
        closeSidebar();
    } else {
        openSidebar();
    }
});

sidebarOverlay.addEventListener("click", closeSidebar);

sidebarCollapse.addEventListener("click", function () {
    const shouldCollapse = !sidebar.classList.contains("collapsed");
    setDesktopSidebarCollapsed(shouldCollapse);
});

document.addEventListener("keydown", function (event) {
    if (event.key === "Escape" && sidebar.classList.contains("open")) {
        closeSidebar();
        menuToggle.focus();
    }
});

window.addEventListener("resize", function () {
    if (window.innerWidth > 820) {
        closeSidebar();
    } else {
        setDesktopSidebarCollapsed(false);
    }
});

productSearch.addEventListener("input", function () {
    filterProducts(productSearch.value);
});

favoriteButtons.forEach(function (button) {
    button.addEventListener("click", function () {
        const isSelected = button.classList.toggle("selected");
        const productName = button.closest(".product-card").dataset.name;

        button.textContent = isSelected ? "♥" : "♡";
        button.setAttribute(
            "aria-label",
            `${isSelected ? "Remove" : "Add"} ${productName} ${
                isSelected ? "from" : "to"
            } favorites`
        );
        showToast(
            isSelected
                ? `${productName} added to favorites!`
                : `${productName} removed from favorites.`
        );
    });
});

addButtons.forEach(function (button) {
    button.addEventListener("click", function () {
        const currentCount = Number(cartCount.textContent);
        const productName = button.closest(".product-card").dataset.name;

        cartCount.textContent = String(currentCount + 1);
        showToast(`${productName} added to your bag!`);
    });
});

categoryCards.forEach(function (card) {
    card.addEventListener("click", function () {
        const selectedCategory = card.dataset.category;
        productSearch.value = selectedCategory;
        filterProducts(selectedCategory);
    });
});

navLinks.forEach(function (link) {
    link.addEventListener("click", function () {
        navLinks.forEach(function (item) {
            item.classList.remove("active");
        });
        link.classList.add("active");

        if (window.innerWidth <= 820) {
            closeSidebar();
        }
    });
});
