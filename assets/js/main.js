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
