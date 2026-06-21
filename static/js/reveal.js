/* =========================================================================
   reveal.js - scroll-reveal + nav aliveness (progressive enhancement).
   The hidden initial state lives in site.css gated on .js (set before paint),
   so without JS the whole page is visible. Here we only mark elements .ox-in
   as they enter the viewport, stagger siblings, and drive the nav chrome.
   ========================================================================= */
(function () {
  "use strict";

  // The reveal targets, selected structurally so no content partial is touched.
  // Kept in sync with the .js hide block in site.css.
  var SELECTORS = [
    "#top .ox-wrap > div:first-child > *",
    "#top .ox-wrap > div:last-child",
    "#why > div",
    "#features .ox-eyebrow",
    "#features .ox-h2",
    "#features .ox-card",
    "#networking .ox-wrap > div",
    "#architecture .ox-wrap > *",
    "#quickstart .ox-wrap > *",
    "#declarative .ox-wrap > *",
    "#comparison .ox-wrap > *",
    "footer .ox-wrap > div > div"
  ];

  var reduce = window.matchMedia &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // Collect targets, de-duped (selectors can overlap at section seams).
  var targets = [];
  SELECTORS.forEach(function (sel) {
    var found = document.querySelectorAll(sel);
    for (var i = 0; i < found.length; i++) {
      if (targets.indexOf(found[i]) === -1) targets.push(found[i]);
    }
  });

  function show(el) { el.classList.add("ox-in"); }

  if (reduce || !("IntersectionObserver" in window)) {
    // No motion path: reveal everything immediately.
    targets.forEach(show);
  } else {
    // Stagger siblings: each element's delay is its index within its parent.
    var seen = new WeakMap();
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        var el = entry.target;
        var parent = el.parentNode;
        var n = seen.get(parent) || 0;
        seen.set(parent, n + 1);
        el.style.transitionDelay = Math.min(n * 70, 420) + "ms";
        show(el);
        io.unobserve(el);
      });
    }, { rootMargin: "0px 0px -8% 0px", threshold: 0.06 });

    targets.forEach(function (el) { io.observe(el); });

    // Safety net: anything still hidden after a beat (tall elements, odd
    // layouts) is revealed so content can never get stuck invisible.
    window.setTimeout(function () {
      targets.forEach(function (el) {
        if (!el.classList.contains("ox-in")) show(el);
      });
    }, 2600);
  }

  // ---- Nav chrome: scroll progress, solidify, active section -------------
  var bar = document.getElementById("ox-scrollbar");
  var nav = document.querySelector(".ox-nav");
  var anchored = [];
  var navLinks = document.querySelectorAll(".ox-nav .ox-navlink");
  for (var j = 0; j < navLinks.length; j++) {
    var href = navLinks[j].getAttribute("href");
    if (href && href.charAt(0) === "#") {
      var section = document.querySelector(href);
      if (section) anchored.push({ link: navLinks[j], section: section });
    }
  }

  var ticking = false;
  function update() {
    ticking = false;
    var top = window.pageYOffset || document.documentElement.scrollTop || 0;
    var max = document.documentElement.scrollHeight - window.innerHeight;
    if (bar) bar.style.width = (max > 0 ? (top / max) * 100 : 0) + "%";
    if (nav) {
      if (top > 8) nav.classList.add("ox-nav--scrolled");
      else nav.classList.remove("ox-nav--scrolled");
    }
    var current = null;
    var probe = top + 120;
    anchored.forEach(function (a) {
      if (a.section.offsetTop <= probe) current = a.link;
    });
    anchored.forEach(function (a) {
      if (a.link === current) a.link.classList.add("ox-navlink--active");
      else a.link.classList.remove("ox-navlink--active");
    });
  }
  function onScroll() {
    if (ticking) return;
    ticking = true;
    window.requestAnimationFrame(update);
  }
  update();
  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", onScroll);
})();
