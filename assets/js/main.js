// -----------------------------
// Vite
// -----------------------------
import "../css/main.css";

// -----------------------------
// Mobile menu
// -----------------------------
const overlay = document.getElementById("mobileOverlay");
const openMenu = document.getElementById("openMenu");

function openDrawer() {
  overlay.classList.remove("closing");
  overlay.classList.add("open");
  overlay.setAttribute("aria-hidden", "false");
  openMenu?.setAttribute("aria-expanded", "true");
  openMenu?.classList.add("is-open");
  openMenu?.setAttribute("aria-label", "Zatvori meni");
  try {
    const live = document.getElementById("mobileMenuStatus");
    if (live) live.textContent = "Meni otvoren";
  } catch (e) {}
}
function closeDrawer() {
  overlay.classList.remove("open");
  overlay.classList.add("closing");
  openMenu?.setAttribute("aria-expanded", "false");
  openMenu?.classList.remove("is-open");
  openMenu?.setAttribute("aria-label", "Otvori meni");

  const onAnimEnd = (ev) => {
    if (
      ev.target &&
      ev.target.classList &&
      ev.target.classList.contains("drawer")
    ) {
      overlay.classList.remove("closing");
      overlay.setAttribute("aria-hidden", "true");
      try {
        const live = document.getElementById("mobileMenuStatus");
        if (live) live.textContent = "Meni zatvoren";
      } catch (e) {}
      overlay.removeEventListener("animationend", onAnimEnd);
    }
  };

  overlay.addEventListener("animationend", onAnimEnd);
}
overlay?.addEventListener("click", (e) => {
  if (e.target === overlay) closeDrawer();
});

window.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && overlay.classList.contains("open")) closeDrawer();
});

// -----------------------------
// Footer year
// -----------------------------
document.getElementById("year").textContent = new Date().getFullYear();

// -----------------------------
// Jubilee: Desktop pinned horizontal scroll driven by vertical scroll
// -----------------------------
(function () {
  const pin = document.querySelector(".jubilee-pin");
  const track = document.getElementById("jubileeTrack");
  if (!pin || !track) return;

  const prevBtn = document.getElementById("prevCard");
  const nextBtn = document.getElementById("nextCard");

  function clamp(n, a, b) {
    return Math.max(a, Math.min(b, n));
  }

  function update() {
    if (window.matchMedia("(max-width: 980px)").matches) return;

    const r = pin.getBoundingClientRect();
    const pinHeight = pin.offsetHeight;
    const view = window.innerHeight;

    const start = 0;
    const end = Math.max(1, pinHeight - view);
    const scrolled = clamp(-r.top, start, end);
    const t = scrolled / end;

    const maxX = Math.max(0, track.scrollWidth - track.clientWidth);
    const x = maxX * t;

    track.style.transform = `translate3d(${-x}px,0,0)`;
  }

  function scrollByCard(dir) {
    const card = track.querySelector(".jcard");
    if (!card) return;

    const cardW = card.getBoundingClientRect().width;
    const gap = 18;

    const maxX = Math.max(1, track.scrollWidth - track.clientWidth);
    const pinHeight = pin.offsetHeight;
    const view = window.innerHeight;
    const end = Math.max(1, pinHeight - view);

    const dx = (cardW + gap) * dir;
    const dt = dx / maxX;
    const dy = dt * end;

    window.scrollBy({ top: dy, behavior: "smooth" });
  }

  prevBtn?.addEventListener("click", () => scrollByCard(-1));
  nextBtn?.addEventListener("click", () => scrollByCard(1));

  update();
  window.addEventListener("scroll", update, { passive: true });
  window.addEventListener("resize", update);
})();

// -----------------------------
// Mobile menu with focus trapping and ARIA
// -----------------------------
document.addEventListener("DOMContentLoaded", () => {
  const openBtn = document.getElementById("openMenu");
  const overlay = document.getElementById("mobileOverlay");
  if (!openBtn || !overlay) return;

  openBtn.setAttribute("aria-expanded", "false");
  overlay.setAttribute("aria-hidden", "true");

  const focusableSelector =
    'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])';
  let lastFocused = null;

  function openMenu() {
    lastFocused = document.activeElement;
    openDrawer();
    openBtn.setAttribute("aria-expanded", "true");
    document.body.style.overflow = "hidden";
    const first = overlay.querySelector(focusableSelector);
    (first || overlay).focus();
    document.addEventListener("keydown", onKeyDown);
  }

  function closeMenu() {
    closeDrawer();
    openBtn.setAttribute("aria-expanded", "false");
    document.body.style.overflow = "";
    if (lastFocused) lastFocused.focus();
    document.removeEventListener("keydown", onKeyDown);
  }

  function onKeyDown(e) {
    if (e.key === "Escape") {
      closeMenu();
      return;
    }

    if (e.key === "Tab" && overlay.classList.contains("open")) {
      const nodes = Array.from(
        overlay.querySelectorAll(focusableSelector),
      ).filter((n) => n.offsetParent !== null);
      if (nodes.length === 0) {
        e.preventDefault();
        return;
      }
      const first = nodes[0],
        last = nodes[nodes.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }
  }

  openBtn.addEventListener("click", () => {
    if (overlay.classList.contains("open")) closeMenu();
    else openMenu();
  });

  overlay.querySelectorAll(".drawer nav a").forEach((link) => {
    link.addEventListener("click", (e) => {
      closeMenu();
    });
  });

  overlay.addEventListener("click", (e) => {
    if (e.target === overlay) closeMenu();
  });

  document.querySelectorAll(".js-slider").forEach((slider) => {
    const track = slider.querySelector(".slider-track");
    const slides = Array.from(track.children);
    const prev = slider.querySelector(".slider-btn.prev");
    const next = slider.querySelector(".slider-btn.next");
    let idx = 0;
    const update = () => {
      track.style.transform = `translateX(${-idx * 100}%)`;
      if (prev) prev.disabled = idx === 0;
      if (next) next.disabled = idx === slides.length - 1;
    };
    if (prev)
      prev.addEventListener("click", () => {
        idx = Math.max(0, idx - 1);
        update();
      });
    if (next)
      next.addEventListener("click", () => {
        idx = Math.min(slides.length - 1, idx + 1);
        update();
      });

    slider.addEventListener("keydown", (e) => {
      if (e.key === "ArrowLeft") {
        idx = Math.max(0, idx - 1);
        update();
      }
      if (e.key === "ArrowRight") {
        idx = Math.min(slides.length - 1, idx + 1);
        update();
      }
    });

    update();
  });

  try {
    document
      .querySelectorAll(".grid-photos, .slide-grid")
      .forEach((grid, gi) => {
        const section = grid.closest("section");
        const gallery = section && section.id ? section.id : `gallery-${gi}`;
        grid.querySelectorAll("img").forEach((img) => {
          if (img.closest("a") || img.classList.contains("glightbox-bound"))
            return;

          let href = img.getAttribute("src") || "";
          const preferAttrs = [
            "data-lightbox-src",
            "data-full",
            "data-large",
            "data-hires",
            "data-fullsize",
            "data-original",
            "data-src",
          ];
          for (const name of preferAttrs) {
            const v = img.getAttribute(name);
            if (v) {
              href = v;
              break;
            }
          }
          const srcset = img.getAttribute("srcset");
          if (srcset && (!href || href === img.getAttribute("src"))) {
            const parts = srcset
              .trim()
              .split(",")
              .map((s) => s.trim())
              .filter(Boolean);
            const last = parts[parts.length - 1];
            if (last) {
              href = last.split(/\s+/)[0];
            }
          }

          const a = document.createElement("a");
          a.href = href;
          a.className = "glightbox";
          a.setAttribute("data-gallery", gallery);
          a.setAttribute("data-type", "image");
          const alt = img.getAttribute("alt");
          if (alt) a.setAttribute("data-title", alt);
          img.parentNode.replaceChild(a, img);
          a.appendChild(img);
          img.classList.add("glightbox-bound");
        });
      });

    if (typeof GLightbox !== "undefined") {
      GLightbox({ selector: ".glightbox", touchNavigation: true, loop: false });
    }

    document.querySelectorAll(".photo-slider").forEach((ps, pi) => {
      const track = ps.querySelector(".slider-track");
      if (!track) return;
      const slides = Array.from(track.children);
      const dotsWrap = ps.querySelector(".slider-dots");
      if (!dotsWrap) return;

      const prevBtn = document.createElement("button");
      prevBtn.type = "button";
      prevBtn.className = "slider-arrow prev";
      prevBtn.setAttribute("aria-label", "Prethodni slajd");
      prevBtn.innerHTML = "‹";

      const nextBtn = document.createElement("button");
      nextBtn.type = "button";
      nextBtn.className = "slider-arrow next";
      nextBtn.setAttribute("aria-label", "Sledeći slajd");
      nextBtn.innerHTML = "›";

      ps.appendChild(prevBtn);
      ps.appendChild(nextBtn);

      const counter = document.createElement("div");
      counter.className = "slider-counter";
      counter.setAttribute("aria-hidden", "true");
      ps.appendChild(counter);

      slides.forEach((_, i) => {
        const btn = document.createElement("button");
        btn.type = "button";
        btn.className = "slider-dot";
        btn.setAttribute("aria-label", `Prikaži slajd ${i + 1}`);
        if (i === 0) btn.classList.add("active");
        btn.addEventListener("click", () => update(i));
        dotsWrap.appendChild(btn);
      });

      let idx = 0;
      const setTransition = (on) => {
        track.style.transition = on
          ? "transform 520ms cubic-bezier(0.22, 0.1, 0.2, 1)"
          : "none";
      };

      const update = (i) => {
        idx = ((i % slides.length) + slides.length) % slides.length;
        track.style.transform = `translateX(${-idx * 100}%)`;
        dotsWrap
          .querySelectorAll(".slider-dot")
          .forEach((d, di) => d.classList.toggle("active", di === idx));
        if (counter) counter.textContent = `${idx + 1} / ${slides.length}`;
      };

      prevBtn.addEventListener("click", () => update(idx - 1));
      nextBtn.addEventListener("click", () => update(idx + 1));

      ps.addEventListener("keydown", (e) => {
        if (e.key === "ArrowLeft") update(idx - 1);
        if (e.key === "ArrowRight") update(idx + 1);
      });

      const viewport = ps.querySelector(".slider-viewport");
      if (viewport) {
        viewport.style.touchAction = "pan-y";
        let pointerId = null;
        let startX = 0;
        let delta = 0;
        let dragging = false;

        function onStart(e) {
          pointerId = e.pointerId;
          startX = e.clientX;
          delta = 0;
          dragging = true;
          viewport.setPointerCapture(pointerId);
          setTransition(false);
        }

        function onMove(e) {
          if (!dragging || e.pointerId !== pointerId) return;
          delta = e.clientX - startX;
          const pct = (delta / viewport.clientWidth) * 100;
          track.style.transform = `translateX(${-idx * 100 + pct}%)`;
        }

        function onEnd(e) {
          if (!dragging || e.pointerId !== pointerId) return;
          dragging = false;
          try {
            viewport.releasePointerCapture(pointerId);
          } catch (err) {}
          setTransition(true);
          const threshold = Math.max(40, viewport.clientWidth * 0.12);
          if (Math.abs(delta) > threshold) {
            if (delta < 0) update(idx + 1);
            else update(idx - 1);
          } else {
            update(idx);
          }
          delta = 0;
        }

        viewport.addEventListener("pointerdown", onStart);
        viewport.addEventListener("pointermove", onMove);
        viewport.addEventListener("pointerup", onEnd);
        viewport.addEventListener("pointercancel", onEnd);
      }

      update(0);
    });
  } catch (err) {
    console.warn("Lightbox init error:", err);
  }
});

// --------------------------------
// Header hide/show on scroll
// --------------------------------

const header = document.querySelector("header");

let lastScrollY = window.scrollY;
let isHidden = false;

const MIN_SCROLL = 120;
const SHOW_DELTA = 24;

window.addEventListener("scroll", () => {
  const currentY = window.scrollY;
  const delta = currentY - lastScrollY;

  if (currentY < 40) {
    header.classList.remove("is-hidden");
    isHidden = false;
    lastScrollY = currentY;
    return;
  }

  if (Math.abs(delta) < 6) return;

  if (currentY > MIN_SCROLL && delta > 0 && !isHidden) {
    header.classList.add("is-hidden");
    isHidden = true;
  }

  if (delta < -SHOW_DELTA && isHidden) {
    header.classList.remove("is-hidden");
    isHidden = false;
  }

  lastScrollY = currentY;
});

// End of main.js
