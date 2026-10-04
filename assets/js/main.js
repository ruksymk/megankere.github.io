/* =========================================================
   Ruksy — portfolio interactions
   Vanilla JS, no dependencies.
   ========================================================= */
(function () {
  'use strict';

  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var fine    = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  var $  = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };

  /* ---------- footer year ---------- */
  var year = $('[data-year]');
  if (year) year.textContent = new Date().getFullYear();

  /* ---------- kick off hero entrance ---------- */
  requestAnimationFrame(function () { document.body.classList.add('is-ready'); });

  /* =========================================================
     1. Split "ABOUT" / "SAY HI" into animatable characters
     ========================================================= */
  $$('[data-reveal-chars]').forEach(function (el) {
    var text = el.textContent.trim();
    el.textContent = '';
    el.setAttribute('aria-label', text);
    text.split('').forEach(function (ch, i) {
      var span = document.createElement('span');
      span.className = 'reveal-char';
      span.setAttribute('aria-hidden', 'true');
      span.style.setProperty('--i', i);
      span.textContent = ch === ' ' ? ' ' : ch;
      el.appendChild(span);
    });
  });

  /* =========================================================
     2. Stagger indices
     ========================================================= */
  $$('[data-reveal-stagger]').forEach(function (el) {
    $$(':scope > *', el).forEach(function (kid, i) { kid.style.setProperty('--i', i); });
  });

  /* =========================================================
     3. Reveal on scroll
     ========================================================= */
  var revealIO = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (!e.isIntersecting) return;
      var el = e.target;
      el.classList.add('is-in');
      $$('.reveal-char', el).forEach(function (c) { c.classList.add('is-in'); });
      if (el.hasAttribute('data-typewriter')) type(el);
      if (el.classList.contains('social__numbers')) countUp(el);
      revealIO.unobserve(el);
    });
  }, { threshold: 0.15, rootMargin: '0px 0px -8% 0px' });

  $$('[data-reveal],[data-reveal-stagger],[data-reveal-chars],[data-typewriter],.grid-lines,.case__title,.skills__title')
    .forEach(function (el) { revealIO.observe(el); });

  /* =========================================================
     4. Typewriter for the About paragraph
     ========================================================= */
  function type(el) {
    var full = el.textContent;
    if (reduced) return;
    el.textContent = '';
    var caret = document.createElement('span');
    caret.className = 'caret';
    caret.setAttribute('aria-hidden', 'true');
    el.appendChild(caret);

    var node = document.createTextNode('');
    el.insertBefore(node, caret);

    var i = 0, last = 0;
    // ~900 chars; run it in bursts so it finishes in a couple of seconds
    function step(now) {
      if (now - last > 12) {
        last = now;
        i = Math.min(full.length, i + 5);
        node.nodeValue = full.slice(0, i);
      }
      if (i < full.length) requestAnimationFrame(step);
      else setTimeout(function () { caret.remove(); }, 900);
    }
    requestAnimationFrame(step);
  }

  /* =========================================================
     5. Count-up for the social stats
     ========================================================= */
  function countUp(root) {
    if (reduced) return;
    $$('[data-count]', root).forEach(function (el, idx) {
      var target = parseFloat(el.getAttribute('data-count'));
      var suffix = el.getAttribute('data-suffix') || '';
      var start  = null, dur = 1300;
      setTimeout(function () {
        requestAnimationFrame(function run(t) {
          if (start === null) start = t;
          var p = Math.min(1, (t - start) / dur);
          var eased = 1 - Math.pow(1 - p, 3);
          el.textContent = (target * eased).toFixed(1) + suffix;
          if (p < 1) requestAnimationFrame(run);
        });
      }, idx * 110);
    });
  }

  /* =========================================================
     6. Scroll progress + nav behaviour + active section
     ========================================================= */
  var bar      = $('.scroll-progress span');
  var nav      = $('.nav');
  var crumb    = $('[data-crumb]');
  var sections = $$('.section');
  var pills    = $$('.pill');
  var lastY    = window.scrollY;

  function onScroll() {
    var y   = window.scrollY;
    var max = document.documentElement.scrollHeight - window.innerHeight;
    if (bar) bar.style.width = (max > 0 ? (y / max) * 100 : 0) + '%';

    // hide the nav while scrolling down, bring it back on the way up
    if (y > 160 && y > lastY + 6) nav.classList.add('is-hidden');
    else if (y < lastY - 6 || y < 160) nav.classList.remove('is-hidden');
    lastY = y;

    parallax(y);
  }

  var ticking = false;
  window.addEventListener('scroll', function () {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(function () { onScroll(); ticking = false; });
  }, { passive: true });

  /* section theme → nav colour, breadcrumb label, active pill */
  var sectionIO = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (!e.isIntersecting) return;
      var sec   = e.target;
      var theme = sec.getAttribute('data-theme');
      document.body.setAttribute('data-nav', theme === 'cream' ? 'cream' : 'dark');

      if (crumb) {
        crumb.textContent = sec.getAttribute('data-section') || '';
        crumb.classList.toggle('is-on', sec.id !== 'home');
      }
      pills.forEach(function (p) {
        p.classList.toggle('is-active', p.getAttribute('href') === '#' + sec.id);
      });
    });
  }, { threshold: 0.5 });
  sections.forEach(function (s) { sectionIO.observe(s); });

  /* =========================================================
     7. Parallax on collage pieces
     ========================================================= */
  var layers = $$('[data-parallax]').map(function (el) {
    return { el: el, k: parseFloat(el.getAttribute('data-parallax')) || 0, y: 0 };
  });

  function parallax(scrollY) {
    if (reduced) return;
    var vh = window.innerHeight;
    layers.forEach(function (l) {
      var r = l.el.getBoundingClientRect();
      if (r.bottom < -200 || r.top > vh + 200) return;
      var centre = r.top + r.height / 2 - vh / 2;
      l.y = centre * l.k;
      l.el.style.transform = 'translate3d(0,' + l.y.toFixed(1) + 'px,0)';
    });
  }

  /* =========================================================
     8. Pointer-driven tilt on photos and cards
     ========================================================= */
  if (fine && !reduced) {
    $$('[data-tilt]').forEach(function (el) {
      var base = el.style.transform || '';
      // keep any rotation the stylesheet applied (the sticky note is askew)
      var computed = window.getComputedStyle(el).transform;
      var frame = null;

      el.addEventListener('pointermove', function (ev) {
        var r = el.getBoundingClientRect();
        var px = (ev.clientX - r.left) / r.width - 0.5;
        var py = (ev.clientY - r.top) / r.height - 0.5;
        if (frame) return;
        frame = requestAnimationFrame(function () {
          frame = null;
          el.style.transition = 'transform .18s ease-out';
          el.style.transform =
            'perspective(900px) rotateY(' + (px * 7).toFixed(2) + 'deg) rotateX(' +
            (-py * 7).toFixed(2) + 'deg) translateZ(14px)' +
            (computed && computed !== 'none' ? '' : '');
        });
      });

      el.addEventListener('pointerleave', function () {
        el.style.transition = 'transform .7s cubic-bezier(.22,.8,.26,1)';
        el.style.transform = base;
      });
    });
  }

  /* =========================================================
     9. Magnetic nav pills + contact chips
     ========================================================= */
  if (fine && !reduced) {
    $$('[data-magnetic]').forEach(function (el) {
      el.addEventListener('pointermove', function (ev) {
        var r = el.getBoundingClientRect();
        var x = ev.clientX - r.left - r.width / 2;
        var y = ev.clientY - r.top - r.height / 2;
        el.style.transform = 'translate(' + (x * 0.28).toFixed(1) + 'px,' + (y * 0.34).toFixed(1) + 'px)';
      });
      el.addEventListener('pointerleave', function () { el.style.transform = ''; });
    });
  }

  /* =========================================================
     10. "Other projects" — hovering a row lights its preview
     ========================================================= */
  var previewWrap = $('.other__previews');
  if (previewWrap) {
    $$('.other__list a').forEach(function (a) {
      var key = a.getAttribute('data-preview');
      a.addEventListener('pointerenter', function () {
        previewWrap.classList.add('is-dim');
        var hit = $('[data-preview-key="' + key + '"]', previewWrap);
        if (hit) hit.classList.add('is-lit');
      });
      a.addEventListener('pointerleave', function () {
        previewWrap.classList.remove('is-dim');
        $$('.preview', previewWrap).forEach(function (p) { p.classList.remove('is-lit'); });
      });
    });
  }

  /* =========================================================
     11. Custom cursor
     ========================================================= */
  if (fine && !reduced) {
    var cur  = $('.cursor');
    var dot  = $('.cursor__dot');
    var ring = $('.cursor__ring');
    var mx = 0, my = 0, rx = 0, ry = 0;

    window.addEventListener('pointermove', function (e) {
      mx = e.clientX; my = e.clientY;
      cur.classList.add('is-on');
      dot.style.transform = 'translate(' + mx + 'px,' + my + 'px) translate(-50%,-50%)';
    }, { passive: true });

    (function loop() {
      rx += (mx - rx) * 0.16;
      ry += (my - ry) * 0.16;
      ring.style.transform = 'translate(' + rx.toFixed(1) + 'px,' + ry.toFixed(1) + 'px) translate(-50%,-50%)';
      requestAnimationFrame(loop);
    })();

    document.addEventListener('pointerover', function (e) {
      var hot = e.target.closest('a,button,[data-tilt],.sticky__cols li,.marquee');
      cur.classList.toggle('is-hot', !!hot);
    });

    document.addEventListener('pointerleave', function () { cur.classList.remove('is-on'); });
  }

  /* =========================================================
     12. Smooth anchor scrolling that respects the fixed nav
     ========================================================= */
  $$('a[href^="#"]').forEach(function (a) {
    a.addEventListener('click', function (ev) {
      var id = a.getAttribute('href');
      if (id.length < 2) return;
      var target = document.getElementById(id.slice(1));
      if (!target) return;
      ev.preventDefault();
      var top = target.getBoundingClientRect().top + window.scrollY - 8;
      window.scrollTo({ top: top, behavior: reduced ? 'auto' : 'smooth' });
      history.replaceState(null, '', id);
    });
  });

  onScroll();
})();
