const SITE_URL = "https://tadiwamakele-0712.github.io/tae-store/";

function initSharePage() {
  var copyBtn = document.getElementById("copy-link-btn");
  var linkInput = document.getElementById("site-link");
  var copyMsg = document.getElementById("copy-msg");
  var qrBox = document.getElementById("qr-code");

  if (linkInput) {
    linkInput.value = SITE_URL;
  }

  if (copyBtn && linkInput) {
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

  if (qrBox) {
    qrBox.innerHTML =
      '<img src="https://quickchart.io/qr?size=220&margin=1&text=' +
      encodeURIComponent(SITE_URL) +
      '" alt="QR code — scan to open Tae Gift Hampers website" width="220" height="220" loading="lazy" decoding="async">';
  }

  var menuBtn = document.getElementById("menu-btn");
  var nav = document.getElementById("nav");
  if (menuBtn && nav) {
    menuBtn.addEventListener("click", function () {
      var isOpen = nav.classList.toggle("open");
      menuBtn.setAttribute("aria-expanded", isOpen);
    });
  }
}

initSharePage();
