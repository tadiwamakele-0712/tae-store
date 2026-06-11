const productGrid = document.getElementById("product-grid");
const loadingGrid = document.getElementById("loading-grid");
const lightbox = document.getElementById("lightbox");
const lightboxImg = document.getElementById("lightbox-img");
const lightboxCaption = document.getElementById("lightbox-caption");
const filterBar = document.getElementById("filter-bar");

let activeFilter = "All";
let imageObserver = null;

function storageGet(key) {
  try {
    return localStorage.getItem(key);
  } catch (e) {
    return null;
  }
}

function storageSet(key, value) {
  try {
    localStorage.setItem(key, value);
  } catch (e) {}
}

function getInitialBatchSize() {
  var connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
  if (!connection) return 6;
  if (connection.saveData) return 4;
  if (connection.effectiveType === "slow-2g" || connection.effectiveType === "2g") return 4;
  if (connection.effectiveType === "3g") return 6;
  return 8;
}

function hideLoadingMessage() {
  if (loadingGrid) {
    loadingGrid.hidden = true;
  }
}

function updateLoadingMessage(loaded, total) {
  if (!loadingGrid || loaded >= total) {
    hideLoadingMessage();
    return;
  }
  loadingGrid.textContent = "Loading gifts " + loaded + " of " + total + "…";
}

function markCardLoaded(card) {
  if (card) {
    card.classList.remove("product-card--loading");
  }
}

function loadProductImage(img, card) {
  if (!img || !img.dataset.src) return;

  var src = img.dataset.src;
  img.removeAttribute("data-src");

  img.onload = function () {
    markCardLoaded(card);
  };

  img.onerror = function () {
    markCardLoaded(card);
    img.alt = "Image unavailable";
  };

  img.src = src;
}

function observeProductImages(images, eagerCount) {
  if (!images.length) {
    hideLoadingMessage();
    return;
  }

  var loaded = 0;
  var total = images.length;

  images.slice(0, eagerCount).forEach(function (item) {
    loadProductImage(item.img, item.card);
    loaded += 1;
    updateLoadingMessage(loaded, total);
  });

  var remaining = images.slice(eagerCount);
  if (!remaining.length) {
    hideLoadingMessage();
    return;
  }

  if (!("IntersectionObserver" in window)) {
    remaining.forEach(function (item) {
      loadProductImage(item.img, item.card);
      loaded += 1;
      updateLoadingMessage(loaded, total);
    });
    hideLoadingMessage();
    return;
  }

  if (imageObserver) {
    imageObserver.disconnect();
  }

  imageObserver = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (!entry.isIntersecting) return;

      var img = entry.target;
      var card = img.closest(".product-card");
      loadProductImage(img, card);
      loaded += 1;
      updateLoadingMessage(loaded, total);
      imageObserver.unobserve(img);

      if (loaded >= total) {
        hideLoadingMessage();
      }
    });
  }, { rootMargin: "120px" });

  remaining.forEach(function (item) {
    imageObserver.observe(item.img);
  });
}

function renderProducts() {
  if (!productGrid || typeof PRODUCTS === "undefined") {
    if (productGrid) {
      productGrid.innerHTML = '<p class="empty-grid">Gifts could not load. Please refresh the page.</p>';
    }
    return;
  }

  productGrid.innerHTML = "";
  if (loadingGrid) {
    productGrid.appendChild(loadingGrid);
    loadingGrid.hidden = false;
    loadingGrid.textContent = "Opening catalogue…";
  }

  const filtered = activeFilter === "All"
    ? PRODUCTS
    : PRODUCTS.filter(function (p) { return p.category === activeFilter; });

  const pendingImages = [];

  filtered.forEach(function (product, index) {
    const card = document.createElement("article");
    card.className = "product-card product-card--loading";
    card.setAttribute("role", "button");
    card.setAttribute("tabindex", "0");
    card.setAttribute("aria-label", "View " + product.name);

    const img = document.createElement("img");
    img.alt = product.name;
    img.width = 400;
    img.height = 400;
    img.decoding = "async";
    img.dataset.src = product.image;
    if (index < 2) {
      img.loading = "eager";
      img.fetchPriority = "high";
    } else {
      img.loading = "lazy";
    }

    const label = document.createElement("div");
    label.className = "product-label";
    label.innerHTML = "<h3>" + product.name + "</h3><p>Tap to view · " + product.category + "</p>";

    card.appendChild(img);
    card.appendChild(label);

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
    pendingImages.push({ img: img, card: card });
  });

  if (filtered.length === 0) {
    hideLoadingMessage();
    productGrid.innerHTML = '<p class="empty-grid">No gifts in this category yet — check back soon!</p>';
    return;
  }

  observeProductImages(pendingImages, getInitialBatchSize());
}

function openLightbox(product) {
  if (!lightbox || !lightboxImg || !lightboxCaption) return;
  lightboxImg.src = product.image;
  lightboxImg.alt = product.name;
  lightboxCaption.textContent = product.name;

  if (typeof lightbox.showModal === "function") {
    lightbox.showModal();
  } else {
    lightbox.setAttribute("open", "open");
    lightbox.style.display = "block";
  }
}

function closeLightbox() {
  if (!lightbox) return;
  if (typeof lightbox.close === "function") {
    lightbox.close();
  } else {
    lightbox.removeAttribute("open");
    lightbox.style.display = "none";
  }
}

var lightboxClose = document.getElementById("lightbox-close");
if (lightboxClose && lightbox) {
  lightboxClose.addEventListener("click", function () {
    closeLightbox();
  });

  lightbox.addEventListener("click", function (e) {
    if (e.target === lightbox) {
      closeLightbox();
    }
  });
}

var contactForm = document.getElementById("contact-form");
if (contactForm) {
  contactForm.addEventListener("submit", function (e) {
    e.preventDefault();
    const name = document.getElementById("name").value.trim();
    document.getElementById("form-msg").textContent =
      "Thank you, " + name + "! We will contact you soon.";
    contactForm.reset();
  });
}

var menuBtn = document.getElementById("menu-btn");
var nav = document.getElementById("nav");
if (menuBtn && nav) {
  menuBtn.addEventListener("click", function () {
    const isOpen = nav.classList.toggle("open");
    menuBtn.setAttribute("aria-expanded", isOpen);
  });

  nav.querySelectorAll("a").forEach(function (link) {
    link.addEventListener("click", function () {
      nav.classList.remove("open");
      menuBtn.setAttribute("aria-expanded", "false");
    });
  });
}

var themeToggle = document.getElementById("theme-toggle");
var THEME_KEY = "tae-store-theme";

function getTheme() {
  return document.documentElement.getAttribute("data-theme") === "dark" ? "dark" : "light";
}

function setTheme(theme) {
  document.documentElement.setAttribute("data-theme", theme);
  storageSet(THEME_KEY, theme);
  if (themeToggle) {
    themeToggle.setAttribute(
      "aria-label",
      theme === "dark" ? "Switch to light mode" : "Switch to dark mode"
    );
    themeToggle.setAttribute("title", theme === "dark" ? "Light mode" : "Dark mode");
  }
}

if (!storageGet(THEME_KEY)) {
  setTheme("light");
} else {
  setTheme(getTheme());
}

if (themeToggle) {
  themeToggle.addEventListener("click", function () {
    setTheme(getTheme() === "dark" ? "light" : "dark");
  });
}

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

function initShareLink() {
  var copyBtn = document.getElementById("copy-link-btn");
  var linkInput = document.getElementById("site-link");
  var copyMsg = document.getElementById("copy-msg");
  if (!copyBtn || !linkInput) return;

  copyBtn.addEventListener("click", function () {
    var url = linkInput.value;

    function showCopied() {
      if (copyMsg) {
        copyMsg.textContent = "Link copied! You can paste and share it now.";
        setTimeout(function () {
          copyMsg.textContent = "";
        }, 3000);
      }
    }

    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(url).then(showCopied).catch(function () {
        linkInput.select();
        try {
          document.execCommand("copy");
          showCopied();
        } catch (e) {}
      });
    } else {
      linkInput.select();
      try {
        document.execCommand("copy");
        showCopied();
      } catch (e) {}
    }
  });
}

initShareLink();
renderProducts();
