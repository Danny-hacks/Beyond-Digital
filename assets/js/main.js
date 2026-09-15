// ===== Beyond Digital — shared interactions =====
(function () {
  gsap.registerPlugin(ScrollTrigger);

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* Mobile nav toggle */
  var nav = document.getElementById('primary-nav');
  var toggle = document.getElementById('nav-toggle');
  if (toggle && nav) {
    toggle.addEventListener('click', function () {
      var open = nav.getAttribute('data-open') === 'true';
      nav.setAttribute('data-open', open ? 'false' : 'true');
      toggle.setAttribute('aria-expanded', open ? 'false' : 'true');
    });
    nav.querySelectorAll('a').forEach(function (a) {
      a.addEventListener('click', function () {
        nav.setAttribute('data-open', 'false');
        toggle.setAttribute('aria-expanded', 'false');
      });
    });
  }

  /* Page loader — brief brand flash, then reveal */
  var loader = document.querySelector('.page-loader');

  function splitHeroWords(el) {
    var text = el.textContent;
    el.innerHTML = '';
    text.split(' ').forEach(function (word, i, arr) {
      var line = document.createElement('span');
      line.className = 'split-line';
      var inner = document.createElement('span');
      inner.textContent = word + (i < arr.length - 1 ? ' ' : '');
      line.appendChild(inner);
      el.appendChild(line);
    });
  }

  function runHeroEntrance() {
    var heroTitle = document.querySelector('[data-hero-title]');
    var heroLede = document.querySelector('[data-hero-lede]');
    var heroCtas = document.querySelector('[data-hero-ctas]');
    var heroArt = document.querySelector('[data-hero-art]');
    var heroChip = document.querySelector('[data-hero-chip]');
    var heroEyebrow = document.querySelector('[data-hero-eyebrow]');

    var tl = gsap.timeline({ defaults: { ease: 'power3.out' } });

    if (reduceMotion) {
      gsap.set([heroTitle, heroLede, heroCtas, heroArt, heroChip, heroEyebrow], { opacity: 1, clearProps: 'all' });
      return;
    }

    if (heroTitle) splitHeroWords(heroTitle);

    if (heroEyebrow) tl.from(heroEyebrow, { opacity: 0, y: 12, duration: 0.5 });
    if (heroTitle) tl.from(heroTitle.querySelectorAll('.split-line > span'), {
      yPercent: 120, opacity: 0, duration: 0.9, stagger: 0.05, clearProps: 'transform,opacity,willChange'
    }, '-=0.2');
    if (heroLede) tl.from(heroLede, { opacity: 0, y: 16, duration: 0.7 }, '-=0.55');
    if (heroCtas) tl.from(heroCtas.children, { opacity: 0, y: 14, duration: 0.6, stagger: 0.08 }, '-=0.45');
    if (heroArt) tl.from(heroArt, { opacity: 0, scale: 0.92, duration: 0.9 }, '-=0.7');
    if (heroChip) tl.from(heroChip, { opacity: 0, y: 20, scale: 0.9, duration: 0.6 }, '-=0.4');
  }

  function runScrollReveals() {
    var els = gsap.utils.toArray('[data-reveal]');
    els.forEach(function (el, i) {
      gsap.to(el, {
        opacity: 1, y: 0, duration: 0.8, ease: 'power3.out',
        scrollTrigger: { trigger: el, start: 'top 88%' },
        delay: (i % 4) * 0.05
      });
    });

    var imgs = gsap.utils.toArray('[data-reveal-img]');
    imgs.forEach(function (el) {
      gsap.to(el, {
        opacity: 1, scale: 1, duration: 1, ease: 'power2.out',
        scrollTrigger: { trigger: el, start: 'top 90%' }
      });
    });

    var counters = gsap.utils.toArray('[data-count-to]');
    counters.forEach(function (el) {
      var target = parseFloat(el.getAttribute('data-count-to'));
      var suffix = el.getAttribute('data-count-suffix') || '';
      var obj = { val: 0 };
      ScrollTrigger.create({
        trigger: el, start: 'top 90%', once: true,
        onEnter: function () {
          gsap.to(obj, {
            val: target, duration: 1.4, ease: 'power2.out',
            onUpdate: function () {
              el.textContent = Math.round(obj.val) + suffix;
            }
          });
        }
      });
    });
  }

  function initHeaderShrink() {
    ScrollTrigger.create({
      start: 'top -80',
      end: 99999,
      toggleClass: { className: 'is-scrolled', targets: 'header.site' }
    });
  }

  function initQuoteModal() {
    var overlay = document.getElementById('quote-modal');
    if (!overlay) return;
    var closeBtn = overlay.querySelector('.modal-close');
    var openers = document.querySelectorAll('[data-open-quote]');

    function open(e) {
      if (e) e.preventDefault();
      overlay.setAttribute('data-open', 'true');
      document.body.style.overflow = 'hidden';
    }
    function close() {
      overlay.setAttribute('data-open', 'false');
      document.body.style.overflow = '';
    }
    openers.forEach(function (a) { a.addEventListener('click', open); });
    if (closeBtn) closeBtn.addEventListener('click', close);
    overlay.addEventListener('click', function (e) { if (e.target === overlay) close(); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') close(); });
  }

  function initLogoMarquees() {
    var marquees = document.querySelectorAll('.logo-marquee');
    marquees.forEach(function (wrapper) {
      var track = wrapper.querySelector('.logo-track');
      if (!track) return;

      // Clone the tile set once, programmatically — guarantees the two
      // halves are always pixel-identical, so adding/removing a logo in
      // the source markup can never desync the loop point.
      var originalTiles = Array.prototype.slice.call(track.children);
      originalTiles.forEach(function (tile) {
        var clone = tile.cloneNode(true);
        clone.setAttribute('aria-hidden', 'true');
        track.appendChild(clone);
      });

      var reverse = wrapper.classList.contains('reverse');
      var speed = 28; // px per second
      var pos = 0;
      var half = 0;
      var ready = false;
      var hovering = false;
      var dragging = false;
      var startX = 0, startPos = 0, moved = false;
      var lastTime = null;

      function measure() { half = track.scrollWidth / 2; }

      function waitForImages(cb) {
        var imgs = track.querySelectorAll('img');
        var remaining = imgs.length;
        if (remaining === 0) { cb(); return; }
        function done() { remaining--; if (remaining <= 0) cb(); }
        imgs.forEach(function (img) {
          if (img.complete) done();
          else {
            img.addEventListener('load', done, { once: true });
            img.addEventListener('error', done, { once: true });
          }
        });
      }
      waitForImages(function () { measure(); ready = true; });
      window.addEventListener('resize', measure);

      function wrap() {
        if (half > 0) pos = ((pos % half) + half) % half;
      }
      function apply() { track.style.transform = 'translateX(' + (-pos) + 'px)'; }

      function frame(t) {
        if (lastTime === null) lastTime = t;
        var dt = Math.min((t - lastTime) / 1000, 0.05);
        lastTime = t;
        if (ready && !reduceMotion && !hovering && !dragging) {
          pos += (reverse ? -1 : 1) * speed * dt;
          wrap();
          apply();
        }
        requestAnimationFrame(frame);
      }
      requestAnimationFrame(frame);

      wrapper.addEventListener('mouseenter', function () { hovering = true; });
      wrapper.addEventListener('mouseleave', function () {
        hovering = false;
        if (dragging) { dragging = false; wrapper.classList.remove('dragging'); }
      });

      function down(x) {
        dragging = true; moved = false;
        wrapper.classList.add('dragging');
        startX = x; startPos = pos;
      }
      function drag(x) {
        if (!dragging) return;
        var dx = x - startX;
        if (Math.abs(dx) > 3) moved = true;
        pos = startPos - dx;
        wrap(); apply();
      }
      function releaseDrag() {
        dragging = false;
        wrapper.classList.remove('dragging');
      }

      wrapper.addEventListener('mousedown', function (e) { down(e.pageX); });
      window.addEventListener('mousemove', function (e) { if (dragging) { e.preventDefault(); drag(e.pageX); } });
      window.addEventListener('mouseup', releaseDrag);
      wrapper.addEventListener('click', function (e) { if (moved) e.preventDefault(); }, true);

      wrapper.addEventListener('touchstart', function (e) { hovering = true; down(e.touches[0].pageX); }, { passive: true });
      wrapper.addEventListener('touchmove', function (e) { drag(e.touches[0].pageX); }, { passive: true });
      wrapper.addEventListener('touchend', function () { releaseDrag(); hovering = false; });
    });
  }

  function initCardTilt() {
    if (reduceMotion) return;
    var cards = document.querySelectorAll('.browser-card, .bare-tile, .stats-band .numbers>div');
    cards.forEach(function (card) {
      card.style.transformPerspective = '800px';
      function apply(clientX, clientY) {
        var b = card.getBoundingClientRect();
        var x = (clientX - b.left) / b.width - 0.5;
        var y = (clientY - b.top) / b.height - 0.5;
        gsap.to(card, { rotateX: y * -7, rotateY: x * 7, y: -8, duration: 0.4, ease: 'power2.out' });
      }
      function reset() {
        gsap.to(card, { rotateX: 0, rotateY: 0, y: 0, duration: 0.6, ease: 'power3.out' });
      }
      card.addEventListener('mousemove', function (e) { apply(e.clientX, e.clientY); });
      card.addEventListener('mouseleave', reset);
      card.addEventListener('touchstart', function (e) { apply(e.touches[0].clientX, e.touches[0].clientY); }, { passive: true });
      card.addEventListener('touchmove', function (e) { apply(e.touches[0].clientX, e.touches[0].clientY); }, { passive: true });
      card.addEventListener('touchend', reset);
    });
  }

  function initMagneticButtons() {
    if (reduceMotion) return;
    var btns = document.querySelectorAll('.btn-lg');
    btns.forEach(function (btn) {
      function apply(clientX, clientY) {
        var b = btn.getBoundingClientRect();
        var x = (clientX - b.left - b.width / 2) * 0.25;
        var y = (clientY - b.top - b.height / 2) * 0.35;
        gsap.to(btn, { x: x, y: y, duration: 0.3, ease: 'power2.out' });
      }
      function reset() {
        gsap.to(btn, { x: 0, y: 0, duration: 0.6, ease: 'elastic.out(1, 0.4)' });
      }
      btn.addEventListener('mousemove', function (e) { apply(e.clientX, e.clientY); });
      btn.addEventListener('mouseleave', reset);
      btn.addEventListener('touchstart', function (e) { apply(e.touches[0].clientX, e.touches[0].clientY); }, { passive: true });
      btn.addEventListener('touchmove', function (e) { apply(e.touches[0].clientX, e.touches[0].clientY); }, { passive: true });
      btn.addEventListener('touchend', reset);
    });
  }

  function initCustomCursor() {
    if (reduceMotion) return;

    var isTouch = window.matchMedia('(pointer: coarse)').matches;

    var dot = document.createElement('div');
    dot.className = 'cursor-dot';
    var ring = document.createElement('div');
    ring.className = 'cursor-ring';
    document.body.appendChild(dot);
    document.body.appendChild(ring);
    document.body.classList.add('custom-cursor-active');
    if (isTouch) { dot.style.opacity = '0'; ring.style.opacity = '0'; }

    var mouseX = -100, mouseY = -100, ringX = -100, ringY = -100;
    var started = false;

    function moveTo(x, y) {
      mouseX = x; mouseY = y;
      dot.style.transform = 'translate(' + mouseX + 'px,' + mouseY + 'px)';
      if (!started) { ringX = mouseX; ringY = mouseY; started = true; }
    }

    function loop() {
      ringX += (mouseX - ringX) * 0.12;
      ringY += (mouseY - ringY) * 0.12;
      ring.style.transform = 'translate(' + ringX + 'px,' + ringY + 'px)';
      requestAnimationFrame(loop);
    }
    requestAnimationFrame(loop);

    var hoverSelector = 'a, button, input, textarea, .browser-card, .bare-tile, .team-card, .logo-tile, .process-card, .stats-band .numbers>div';

    if (!isTouch) {
      document.addEventListener('mousemove', function (e) { moveTo(e.clientX, e.clientY); });
      document.addEventListener('mousedown', function () { ring.classList.add('cursor-active'); });
      document.addEventListener('mouseup', function () { ring.classList.remove('cursor-active'); });
      document.addEventListener('mouseleave', function () { dot.style.opacity = '0'; ring.style.opacity = '0'; });
      document.addEventListener('mouseenter', function () { dot.style.opacity = '1'; ring.style.opacity = '1'; });
      document.addEventListener('mouseover', function (e) {
        if (e.target.closest(hoverSelector)) { dot.classList.add('cursor-hover'); ring.classList.add('cursor-hover'); }
      });
      document.addEventListener('mouseout', function (e) {
        var toHoverable = e.relatedTarget && e.relatedTarget.closest && e.relatedTarget.closest(hoverSelector);
        if (e.target.closest(hoverSelector) && !toHoverable) {
          dot.classList.remove('cursor-hover');
          ring.classList.remove('cursor-hover');
        }
      });
    } else {
      // Touch: show a brief tap glow at the touch point, then fade it out.
      var fadeTimer = null;
      document.addEventListener('touchstart', function (e) {
        if (!e.touches.length) return;
        clearTimeout(fadeTimer);
        var t = e.touches[0];
        moveTo(t.clientX, t.clientY);
        ringX = t.clientX; ringY = t.clientY;
        dot.style.opacity = '1'; ring.style.opacity = '1';
        ring.classList.add('cursor-active');
        if (e.target.closest(hoverSelector)) ring.classList.add('cursor-hover');
      }, { passive: true });
      document.addEventListener('touchmove', function (e) {
        if (!e.touches.length) return;
        var t = e.touches[0];
        moveTo(t.clientX, t.clientY);
      }, { passive: true });
      document.addEventListener('touchend', function () {
        ring.classList.remove('cursor-active', 'cursor-hover');
        fadeTimer = setTimeout(function () {
          dot.style.opacity = '0'; ring.style.opacity = '0';
        }, 350);
      });
    }
  }

  function initViewMoreProjects() {
    var btn = document.getElementById('view-more-projects');
    var panel = document.getElementById('more-projects');
    if (!btn || !panel) return;
    btn.addEventListener('click', function () {
      panel.hidden = false;
      gsap.set(panel.children, { opacity: 0, y: 20 });
      gsap.to(panel.children, { opacity: 1, y: 0, duration: 0.5, stagger: 0.08, ease: 'power2.out' });
      btn.style.display = 'none';
    });
  }

  window.addEventListener('DOMContentLoaded', function () {
    initQuoteModal();
    initViewMoreProjects();
    initLogoMarquees();
    initCardTilt();
    initMagneticButtons();
    initCustomCursor();
    if (loader) {
      gsap.to(loader, {
        opacity: 0, duration: 0.5, delay: 0.35, ease: 'power1.out',
        onComplete: function () { loader.style.display = 'none'; },
        onStart: runHeroEntrance
      });
    } else {
      runHeroEntrance();
    }
    runScrollReveals();
    initHeaderShrink();
  });
})();
