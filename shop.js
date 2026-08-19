const sidebar = document.getElementById("sidebar");
const shopLayout = document.querySelector(".shop-layout");
const sidebarOverlay = document.getElementById("sidebarOverlay");
const menuToggle = document.getElementById("menuToggle");
const sidebarCollapse = document.getElementById("sidebarCollapse");
const productSearch = document.getElementById("productSearch");
const searchStatus = document.getElementById("searchStatus");
const productCards = [...document.querySelectorAll(".product-card")];
const navLinks = [...document.querySelectorAll(".nav-link[data-page]")];
const pagePanels = [...document.querySelectorAll(".page-panel")];
const cartCount = document.getElementById("cartCount");
const favoriteCount = document.getElementById("favoriteCount");
const profileFavoriteCount = document.getElementById("profileFavoriteCount");
const favoriteList = document.getElementById("favoriteList");
const emptyFavorites = document.getElementById("emptyFavorites");
const bagList = document.getElementById("bagList");
const emptyBag = document.getElementById("emptyBag");
const bagSummary = document.getElementById("bagSummary");
const toast = document.getElementById("toast");
const validPages = pagePanels.map((panel) => panel.dataset.pagePanel);
let toastTimer;
let activeCategory = "All";
const bag = new Map([["bag", 1], ["glow", 1]]);

const products = productCards.map((card) => ({
    id: card.dataset.id,
    name: card.dataset.name,
    category: card.dataset.category,
    price: card.querySelector(".product-footer strong").textContent,
    emoji: card.querySelector(".product-emoji").textContent,
    card
}));

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
    sidebarCollapse.setAttribute("aria-label", shouldCollapse ? "Expand side menu" : "Collapse side menu");
}

function showToast(message) {
    window.clearTimeout(toastTimer);
    toast.textContent = message;
    toast.classList.add("visible");
    toastTimer = window.setTimeout(() => toast.classList.remove("visible"), 2200);
}

function showPage(page, updateHash = true) {
    const nextPage = validPages.includes(page) ? page : "home";
    pagePanels.forEach((panel) => panel.classList.toggle("active", panel.dataset.pagePanel === nextPage));
    navLinks.forEach((link) => {
        const selected = link.dataset.page === nextPage;
        link.classList.toggle("active", selected);
        if (selected) link.setAttribute("aria-current", "page");
        else link.removeAttribute("aria-current");
    });
    if (updateHash && window.location.hash !== `#${nextPage}`) history.pushState(null, "", `#${nextPage}`);
    if (nextPage === "favorites") renderFavorites();
    if (nextPage === "bag") renderBag();
    if (nextPage !== "products") productSearch.blur();
    document.title = `${nextPage.charAt(0).toUpperCase() + nextPage.slice(1)} | Sweet Shop`;
    window.scrollTo({ top: 0, behavior: "smooth" });
    if (window.innerWidth <= 820) closeSidebar();
}

function filterProducts() {
    const term = productSearch.value.trim().toLowerCase();
    let visibleCount = 0;
    products.forEach((product) => {
        const matchesSearch = `${product.name} ${product.category}`.toLowerCase().includes(term);
        const matchesCategory = activeCategory === "All" || product.category === activeCategory;
        const visible = matchesSearch && matchesCategory;
        product.card.classList.toggle("is-hidden", !visible);
        if (visible) visibleCount += 1;
    });
    const qualifier = activeCategory === "All" ? "product" : activeCategory.toLowerCase() + " product";
    searchStatus.textContent = visibleCount === 0
        ? "No sweet finds matched your search."
        : `${visibleCount} ${qualifier}${visibleCount === 1 ? "" : "s"} found.`;
}

function openCategory(category) {
    activeCategory = category;
    productSearch.value = "";
    document.getElementById("filterButton").textContent = `${category} ▾`;
    filterProducts();
    showPage("products");
}

function getFavoriteProducts() {
    return products.filter((product) => product.card.querySelector(".favorite-button").classList.contains("selected"));
}

function updateFavoriteCounts() {
    const count = getFavoriteProducts().length;
    favoriteCount.textContent = count;
    profileFavoriteCount.textContent = count;
}

function renderFavorites() {
    const favorites = getFavoriteProducts();
    favoriteList.innerHTML = favorites.map((product) => `
        <article class="favorite-row" data-favorite-id="${product.id}">
            <span class="favorite-thumb" aria-hidden="true">${product.emoji}</span>
            <div class="favorite-info"><small>${product.category}</small><h3>${product.name}</h3><strong>${product.price}</strong></div>
            <div class="favorite-actions"><button class="outline-button favorite-add" type="button">Add to bag</button><button class="remove-favorite" type="button" aria-label="Remove ${product.name} from favorites">♥</button></div>
        </article>`).join("");
    favoriteList.hidden = favorites.length === 0;
    emptyFavorites.hidden = favorites.length !== 0;
    document.getElementById("addFavoritesToBag").hidden = favorites.length === 0;
    updateFavoriteCounts();
}

function setFavorite(product, shouldFavorite) {
    const button = product.card.querySelector(".favorite-button");
    button.classList.toggle("selected", shouldFavorite);
    button.textContent = shouldFavorite ? "♥" : "♡";
    button.setAttribute("aria-label", `${shouldFavorite ? "Remove" : "Add"} ${product.name} ${shouldFavorite ? "from" : "to"} favorites`);
    updateFavoriteCounts();
    if (document.querySelector('[data-page-panel="favorites"]').classList.contains("active")) renderFavorites();
    showToast(shouldFavorite ? `${product.name} added to favorites!` : `${product.name} removed from favorites.`);
}

function addToBag(product, quantity = 1) {
    bag.set(product.id, (bag.get(product.id) || 0) + quantity);
    renderBag();
    showToast(`${product.name} added to your bag!`);
}

function getPriceValue(product) {
    return Number(product.price.replace(/[^\d.]/g, ""));
}

function renderBag() {
    const entries = [...bag.entries()].filter(([, quantity]) => quantity > 0);
    const itemCount = entries.reduce((total, [, quantity]) => total + quantity, 0);
    const subtotal = entries.reduce((total, [id, quantity]) => {
        const product = products.find((item) => item.id === id);
        return total + getPriceValue(product) * quantity;
    }, 0);

    bagList.innerHTML = entries.map(([id, quantity]) => {
        const product = products.find((item) => item.id === id);
        return `
            <article class="bag-row" data-bag-id="${product.id}">
                <span class="favorite-thumb" aria-hidden="true">${product.emoji}</span>
                <div class="favorite-info"><small>${product.category}</small><h3>${product.name}</h3><strong>${product.price}</strong></div>
                <div class="bag-controls">
                    <button type="button" data-bag-action="decrease" aria-label="Decrease ${product.name} quantity">−</button>
                    <strong aria-label="Quantity">${quantity}</strong>
                    <button type="button" data-bag-action="increase" aria-label="Increase ${product.name} quantity">+</button>
                    <button class="remove-bag-item" type="button" data-bag-action="remove" aria-label="Remove ${product.name} from bag">Remove</button>
                </div>
            </article>`;
    }).join("");

    cartCount.textContent = String(itemCount);
    document.getElementById("bagItemCount").textContent = String(itemCount);
    document.getElementById("bagSubtotal").textContent = `₱${subtotal.toLocaleString("en-PH")}`;
    document.getElementById("bagTotal").textContent = `₱${subtotal.toLocaleString("en-PH")}`;
    bagList.hidden = entries.length === 0;
    bagSummary.hidden = entries.length === 0;
    emptyBag.hidden = entries.length !== 0;
}

menuToggle.addEventListener("click", () => sidebar.classList.contains("open") ? closeSidebar() : openSidebar());
sidebarOverlay.addEventListener("click", closeSidebar);
sidebarCollapse.addEventListener("click", () => setDesktopSidebarCollapsed(!sidebar.classList.contains("collapsed")));

document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && sidebar.classList.contains("open")) {
        closeSidebar();
        menuToggle.focus();
    }
});

window.addEventListener("resize", () => {
    if (window.innerWidth > 820) closeSidebar();
    else setDesktopSidebarCollapsed(false);
});

navLinks.forEach((link) => link.addEventListener("click", (event) => {
    event.preventDefault();
    showPage(link.dataset.page);
}));

document.querySelectorAll("[data-go-page]").forEach((item) => item.addEventListener("click", (event) => {
    event.preventDefault();
    showPage(item.dataset.goPage);
}));

document.querySelectorAll("[data-category]").forEach((item) => item.addEventListener("click", () => openCategory(item.dataset.category)));

productSearch.addEventListener("focus", () => showPage("products"));
productSearch.addEventListener("input", filterProducts);

document.querySelectorAll(".favorite-button").forEach((button) => button.addEventListener("click", () => {
    const product = products.find((item) => item.card === button.closest(".product-card"));
    setFavorite(product, !button.classList.contains("selected"));
}));

document.querySelectorAll(".add-button").forEach((button) => button.addEventListener("click", () => {
    addToBag(products.find((item) => item.card === button.closest(".product-card")));
}));

favoriteList.addEventListener("click", (event) => {
    const row = event.target.closest("[data-favorite-id]");
    if (!row) return;
    const product = products.find((item) => item.id === row.dataset.favoriteId);
    if (event.target.closest(".remove-favorite")) setFavorite(product, false);
    if (event.target.closest(".favorite-add")) addToBag(product);
});

document.getElementById("addFavoritesToBag").addEventListener("click", () => {
    const favorites = getFavoriteProducts();
    if (!favorites.length) return;
    favorites.forEach((product) => bag.set(product.id, (bag.get(product.id) || 0) + 1));
    renderBag();
    showToast(`${favorites.length} favorites added to your bag!`);
});

bagList.addEventListener("click", (event) => {
    const row = event.target.closest("[data-bag-id]");
    const action = event.target.closest("[data-bag-action]")?.dataset.bagAction;
    if (!row || !action) return;
    const id = row.dataset.bagId;
    const currentQuantity = bag.get(id) || 0;
    if (action === "increase") bag.set(id, currentQuantity + 1);
    if (action === "decrease") bag.set(id, Math.max(0, currentQuantity - 1));
    if (action === "remove") bag.delete(id);
    if (bag.get(id) === 0) bag.delete(id);
    renderBag();
});

document.getElementById("checkoutButton").addEventListener("click", () => {
    showToast("Checkout is ready for payment integration.");
});

const filterOptions = ["All", "Beauty", "Fashion", "Accessories", "Home"];
document.getElementById("filterButton").addEventListener("click", () => {
    activeCategory = filterOptions[(filterOptions.indexOf(activeCategory) + 1) % filterOptions.length];
    document.getElementById("filterButton").textContent = `${activeCategory === "All" ? "All products" : activeCategory} ▾`;
    filterProducts();
});

document.querySelectorAll("[data-order-filter]").forEach((button) => button.addEventListener("click", () => {
    document.querySelectorAll("[data-order-filter]").forEach((item) => item.classList.remove("active"));
    button.classList.add("active");
    document.querySelectorAll("[data-order-status]").forEach((order) => {
        order.hidden = button.dataset.orderFilter !== "all" && order.dataset.orderStatus !== button.dataset.orderFilter;
    });
}));

document.querySelector(".track-order").addEventListener("click", () => showToast("Your order is nearby and arriving soon!"));
document.querySelector(".buy-again").addEventListener("click", () => {
    const mug = products.find((product) => product.id === "mug");
    addToBag(mug);
});

const profileForm = document.getElementById("profileForm");
const editProfile = document.getElementById("editProfile");
editProfile.addEventListener("click", () => {
    const editing = editProfile.textContent === "Cancel";
    profileForm.querySelectorAll("input, textarea").forEach((field) => field.disabled = editing);
    profileForm.querySelector(".save-profile").hidden = editing;
    editProfile.textContent = editing ? "Edit" : "Cancel";
});
profileForm.addEventListener("submit", (event) => {
    event.preventDefault();
    profileForm.querySelectorAll("input, textarea").forEach((field) => field.disabled = true);
    profileForm.querySelector(".save-profile").hidden = true;
    editProfile.textContent = "Edit";
    showToast("Profile changes saved!");
});

document.getElementById("settingsForm").addEventListener("submit", (event) => {
    event.preventDefault();
    showToast("Your settings have been saved!");
});
document.getElementById("changePassword").addEventListener("click", () => showToast("Password reset link sent to your email."));
document.getElementById("deleteAccount").addEventListener("click", () => showToast("Account deletion requires email confirmation."));
document.getElementById("notificationButton").addEventListener("click", () => showToast("You have 2 sweet updates!"));

window.addEventListener("popstate", () => showPage(window.location.hash.slice(1) || "home", false));
updateFavoriteCounts();
filterProducts();
renderBag();
showPage(window.location.hash.slice(1) || "home", false);
