const productGrid = document.getElementById("product-grid");
const lightbox = document.getElementById("lightbox");
const lightboxImg = document.getElementById("lightbox-img");
const lightboxCaption = document.getElementById("lightbox-caption");
const filterBar = document.getElementById("filter-bar");

let activeFilter = "All";

function renderProducts() {
  productGrid.innerHTML = "";

  const filtered = activeFilter === "All"
    ? PRODUCTS
    : PRODUCTS.filter(function (p) { return p.category === activeFilter; });

  filtered.forEach(function (product) {
    const card = document.createElement("article");
    card.className = "product-card";
    card.setAttribute("role", "button");
    card.setAttribute("tabindex", "0");
    card.setAttribute("aria-label", "View " + product.name);

    card.innerHTML =
      '<img src="' + product.image + '" alt="' + product.name + '" loading="lazy">' +
      '<div class="product-label">' +
      "<h3>" + product.name + "</h3>" +
      "<p>Tap to view · " + product.category + "</p>" +
      "</div>";

    card.addEventListener("click", function () {
      openLightbox(product);
    });

    card.addEventListener("keydown", function (e) {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        openLightbox(product);
      }
    });

    productGrid.appendChild(card);
  });

  if (filtered.length === 0) {
    productGrid.innerHTML = '<p class="empty-grid">No gifts in this category yet — check back soon!</p>';
  }
}

function openLightbox(product) {
  lightboxImg.src = product.image;
  lightboxImg.alt = product.name;
  lightboxCaption.textContent = product.name;
  lightbox.showModal();
}

document.getElementById("lightbox-close").addEventListener("click", function () {
  lightbox.close();
});

lightbox.addEventListener("click", function (e) {
  if (e.target === lightbox) {
    lightbox.close();
  }
});

// Contact form
document.getElementById("contact-form").addEventListener("submit", function (e) {
  e.preventDefault();
  const name = document.getElementById("name").value.trim();
  document.getElementById("form-msg").textContent =
    "Thank you, " + name + "! We will contact you soon.";
  document.getElementById("contact-form").reset();
});

// Mobile menu
const menuBtn = document.getElementById("menu-btn");
const nav = document.getElementById("nav");

menuBtn.addEventListener("click", function () {
  const isOpen = nav.classList.toggle("open");
  menuBtn.setAttribute("aria-expanded", isOpen);
});

// Theme toggle
const themeToggle = document.getElementById("theme-toggle");
const THEME_KEY = "tae-store-theme";

function getTheme() {
  return document.documentElement.getAttribute("data-theme") === "dark" ? "dark" : "light";
}

function setTheme(theme) {
  document.documentElement.setAttribute("data-theme", theme);
  localStorage.setItem(THEME_KEY, theme);
  themeToggle.setAttribute(
    "aria-label",
    theme === "dark" ? "Switch to light mode" : "Switch to dark mode"
  );
  themeToggle.setAttribute("title", theme === "dark" ? "Light mode" : "Dark mode");
}

if (!localStorage.getItem(THEME_KEY)) {
  setTheme("light");
} else {
  setTheme(getTheme());
}

themeToggle.addEventListener("click", function () {
  setTheme(getTheme() === "dark" ? "light" : "dark");
});

if (filterBar) {
  filterBar.addEventListener("click", function (e) {
    const btn = e.target.closest(".filter-btn");
    if (!btn) return;

    activeFilter = btn.getAttribute("data-filter");
    filterBar.querySelectorAll(".filter-btn").forEach(function (b) {
      b.classList.toggle("active", b === btn);
    });
    renderProducts();
  });
}

renderProducts();
