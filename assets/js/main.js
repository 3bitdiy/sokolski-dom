   // -----------------------------
    // Mobile menu
    // -----------------------------
    const overlay = document.getElementById('mobileOverlay');
    const openMenu = document.getElementById('openMenu');
    const closeMenu = document.getElementById('closeMenu');

    function openDrawer(){
      overlay.classList.add('open');
      overlay.setAttribute('aria-hidden', 'false');
      openMenu?.setAttribute('aria-expanded', 'true');
    }
    function closeDrawer(){
      overlay.classList.remove('open');
      overlay.setAttribute('aria-hidden', 'true');
      openMenu?.setAttribute('aria-expanded', 'false');
    }

    openMenu?.addEventListener('click', openDrawer);
    closeMenu?.addEventListener('click', closeDrawer);
    overlay?.addEventListener('click', (e) => { if(e.target === overlay) closeDrawer(); });

    // close on Escape
    window.addEventListener('keydown', (e) => {
      if(e.key === 'Escape' && overlay.classList.contains('open')) closeDrawer();
    });

    // -----------------------------
    // Footer year
    // -----------------------------
    document.getElementById('year').textContent = new Date().getFullYear();

    // -----------------------------
    // Jubilee: Desktop pinned horizontal scroll driven by vertical scroll
    // -----------------------------
    (function(){
      const pin = document.querySelector('.jubilee-pin');
      const track = document.getElementById('jubileeTrack');
      if(!pin || !track) return;

      const prevBtn = document.getElementById('prevCard');
      const nextBtn = document.getElementById('nextCard');

      function clamp(n, a, b){ return Math.max(a, Math.min(b, n)); }

      function update(){
        // only run on desktop where pin is visible
        if(window.matchMedia('(max-width: 980px)').matches) return;

        const r = pin.getBoundingClientRect();
        const pinHeight = pin.offsetHeight;
        const view = window.innerHeight;

        // progress 0..1 while scrolling through the pin section
        const start = 0;
        const end = Math.max(1, pinHeight - view);
        const scrolled = clamp(-r.top, start, end);
        const t = scrolled / end;

        const maxX = Math.max(0, track.scrollWidth - track.clientWidth);
        const x = maxX * t;

        track.style.transform = `translate3d(${-x}px,0,0)`;
      }

      // Optional: next/prev buttons scroll by one card width
      function scrollByCard(dir){
        const card = track.querySelector('.jcard');
        if(!card) return;

        const cardW = card.getBoundingClientRect().width;
        const gap = 18;

        const maxX = Math.max(1, track.scrollWidth - track.clientWidth);
        const pinHeight = pin.offsetHeight;
        const view = window.innerHeight;
        const end = Math.max(1, pinHeight - view);

        const dx = (cardW + gap) * dir;
        const dt = dx / maxX;
        const dy = dt * end;

        window.scrollBy({ top: dy, behavior: 'smooth' });
      }

      prevBtn?.addEventListener('click', () => scrollByCard(-1));
      nextBtn?.addEventListener('click', () => scrollByCard(1));

      update();
      window.addEventListener('scroll', update, { passive:true });
      window.addEventListener('resize', update);
    })();