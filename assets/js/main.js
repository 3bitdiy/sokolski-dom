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
        // --- Force reflow for Chrome/Brave bug ---
        grid.offsetHeight;
      });

    if (typeof GLightbox !== "undefined") {
      // store instance so we can reload after dynamic DOM changes
      try {
        window._gLight = GLightbox({
          selector: ".glightbox",
          touchNavigation: true,
          loop: false,
        });
      } catch (e) {
        // fallback: initialize without storing
        GLightbox({
          selector: ".glightbox",
          touchNavigation: true,
          loop: false,
        });
      }
    }

    document.querySelectorAll(".photo-slider").forEach((ps, pi) => {
      const track = ps.querySelector(".slider-track");
      if (!track) return;

      const dotsWrap = ps.querySelector(".slider-dots");
      if (!dotsWrap) return;

      // collect all card nodes (flatten existing slides)
      const cards = Array.from(ps.querySelectorAll(".slide-grid .jcard")).map(
        (c) => c.cloneNode(true),
      );

      // create controls
      const prevBtn = document.createElement("button");
      prevBtn.type = "button";
      prevBtn.className = "slider-arrow prev gprev gbtn";
      prevBtn.setAttribute("aria-label", "Prethodni slajd");
      // use the same SVG as GLightbox next button (we'll flip it in CSS for prev)
      prevBtn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" viewBox="0 0 477.175 477.175"><g><path d="M360.731,229.075l-225.1-225.1c-5.3-5.3-13.8-5.3-19.1,0s-5.3,13.8,0,19.1l215.5,215.5l-215.5,215.5c-5.3,5.3-5.3,13.8,0,19.1c2.6,2.6,6.1,4,9.5,4c3.4,0,6.9-1.3,9.5-4l225.1-225.1C365.931,242.875,365.931,234.275,360.731,229.075z"/></g></svg>`;

      const nextBtn = document.createElement("button");
      nextBtn.type = "button";
      nextBtn.className = "slider-arrow next gnext gbtn";
      nextBtn.setAttribute("aria-label", "Sledeći slajd");
      nextBtn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" viewBox="0 0 477.175 477.175"><g><path d="M360.731,229.075l-225.1-225.1c-5.3-5.3-13.8-5.3-19.1,0s-5.3,13.8,0,19.1l215.5,215.5l-215.5,215.5c-5.3,5.3-5.3,13.8,0,19.1c2.6,2.6,6.1,4,9.5,4c3.4,0,6.9-1.3,9.5-4l225.1-225.1C365.931,242.875,365.931,234.275,360.731,229.075z"/></g></svg>`;

      const counter = document.createElement("div");
      counter.className = "slider-counter";
      counter.setAttribute("aria-hidden", "true");
      ps.appendChild(counter);

      let slides = [];
      let idx = 0;
      let currentPerPage = null;

      function perPageForWidth(w) {
        if (w >= 1280) return 6; // 3x2
        if (w >= 768) return 4; // 2x2
        return 1; // 1x1
      }

      function buildSlides(perPage) {
        // clear track
        track.innerHTML = "";
        slides = [];

        for (let i = 0; i < cards.length; i += perPage) {
          const group = cards.slice(i, i + perPage);
          const slide = document.createElement("div");
          slide.className = "slide";
          const grid = document.createElement("div");
          grid.className = "slide-grid";
          // set cols/rows for visual layout
          if (perPage === 6) grid.style.setProperty("--cols", 3);
          else if (perPage === 4) grid.style.setProperty("--cols", 2);
          else grid.style.setProperty("--cols", 1);
          // append cards
          group.forEach((c) => grid.appendChild(c.cloneNode(true)));
          slide.appendChild(grid);
          track.appendChild(slide);
          slides.push(slide);
        }

        // rebuild dots
        dotsWrap.innerHTML = "";
        if (perPage >= 6) {
          // desktop: show dots
          slides.forEach((_, i) => {
            const btn = document.createElement("button");
            btn.type = "button";
            btn.className = "slider-dot";
            btn.setAttribute("aria-label", `Prikaži slajd ${i + 1}`);
            btn.addEventListener("click", () => update(i));
            dotsWrap.appendChild(btn);
          });
          dotsWrap.style.display = "";
          counter.style.display = "none";
          // ensure overlay (large) arrows are present for desktop layout
          if (!ps.contains(prevBtn)) ps.appendChild(prevBtn);
          if (!ps.contains(nextBtn)) ps.appendChild(nextBtn);
          prevBtn.style.display = "";
          nextBtn.style.display = "";
        } else {
          // tablet/mobile: hide dots, show fraction counter
          dotsWrap.style.display = "none";
          counter.style.display = "";
          // remove overlay arrows when counter mode is active to avoid duplicates
          try {
            if (ps.contains(prevBtn)) prevBtn.remove();
            if (ps.contains(nextBtn)) nextBtn.remove();
          } catch (e) {}
        }

        // reset index if out of range
        idx = Math.max(0, Math.min(idx, slides.length - 1));

        // toggle counter/inline arrows state
        // Use a dedicated span for fraction text so updates don't wipe controls
        if (perPage < 6) {
          ps.classList.add("has-counter");
          // reset counter contents and create small arrows + text span
          counter.innerHTML = "";

          const smallPrev = document.createElement("button");
          smallPrev.type = "button";
          smallPrev.className = "slider-arrow small small-prev";
          smallPrev.setAttribute("aria-label", "Prethodni slajd");
          smallPrev.innerHTML = "";
          smallPrev.addEventListener("click", () => update(idx - 1));

          const text = document.createElement("span");
          text.className = "slider-counter-text";

          const smallNext = document.createElement("button");
          smallNext.type = "button";
          smallNext.className = "slider-arrow small small-next";
          smallNext.setAttribute("aria-label", "Sledeći slajd");
          smallNext.innerHTML = "";
          smallNext.addEventListener("click", () => update(idx + 1));

          counter.appendChild(smallPrev);
          counter.appendChild(text);
          counter.appendChild(smallNext);
        } else {
          ps.classList.remove("has-counter");
          counter.innerHTML = "";
        }

        // ensure counter text and dots are updated after controls are built
        update(idx, false);

        // If GLightbox instance exists, reload it so newly-cloned anchors are bound
        try {
          if (window._gLight && typeof window._gLight.reload === "function") {
            window._gLight.reload();
          }
        } catch (e) {}
      }

      const setTransition = (on) => {
        track.style.transition = on
          ? "transform 520ms cubic-bezier(0.22, 0.1, 0.2, 1)"
          : "none";
      };

      function update(i, animate = true) {
        if (!slides || slides.length === 0) return;
        idx = ((i % slides.length) + slides.length) % slides.length;
        if (!animate) setTransition(false);
        track.style.transform = `translateX(${-idx * 100}%)`;
        if (dotsWrap.style.display !== "none") {
          const nodes = dotsWrap.querySelectorAll(".slider-dot");
          nodes.forEach((d, di) => d.classList.toggle("active", di === idx));
        }
        // update fraction text inside dedicated span when present
        const textNode = counter.querySelector(".slider-counter-text");
        if (textNode) {
          textNode.textContent = `${idx + 1} / ${slides.length}`;
        } else if (counter) {
          counter.textContent = `${idx + 1} / ${slides.length}`;
        }
        if (!animate) setTimeout(() => setTransition(true), 20);
      }

      prevBtn.addEventListener("click", () => update(idx - 1));
      nextBtn.addEventListener("click", () => update(idx + 1));

      ps.addEventListener("keydown", (e) => {
        if (e.key === "ArrowLeft") update(idx - 1);
        if (e.key === "ArrowRight") update(idx + 1);
      });

      // pointer drag (swipe)
      const viewport = ps.querySelector(".slider-viewport");
      if (viewport) {
        viewport.style.touchAction = "pan-y";
        let pointerId = null;
        let startX = 0;
        let delta = 0;
        let dragging = false;
        let pointerDown = false;
        let dragJustHappened = false;
        const dragStartThreshold = 8;

        function onStart(e) {
          pointerId = e.pointerId;
          startX = e.clientX;
          delta = 0;
          dragging = false;
          pointerDown = true;
          dragJustHappened = false;
        }

        function onMove(e) {
          if (!pointerDown || e.pointerId !== pointerId) return;
          delta = e.clientX - startX;
          if (!dragging && Math.abs(delta) > dragStartThreshold) {
            dragging = true;
            setTransition(false);
            try {
              viewport.setPointerCapture(pointerId);
            } catch (err) {}
          }
          if (!dragging) return;
          const pct = (delta / viewport.clientWidth) * 100;
          track.style.transform = `translateX(${-idx * 100 + pct}%)`;
        }

        function onEnd(e) {
          if (!pointerDown || e.pointerId !== pointerId) return;
          pointerDown = false;
          if (!dragging) return;
          dragging = false;
          dragJustHappened = true;
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
        viewport.addEventListener(
          "click",
          (e) => {
            if (dragJustHappened) {
              e.preventDefault();
              e.stopPropagation();
              dragJustHappened = false;
            }
          },
          true,
        );
      }

      // handle resize: rebuild slides when perPage changes
      function refresh() {
        const per = perPageForWidth(window.innerWidth);
        if (per !== currentPerPage) {
          currentPerPage = per;
          buildSlides(per);
        }
      }

      let resizeTimer = null;
      window.addEventListener("resize", () => {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(refresh, 120);
      });

      // initial build
      refresh();
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
