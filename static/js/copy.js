// Tiny copy-to-clipboard helper. A [data-copy] button copies the text of the
// element matched by its data-copy CSS selector (e.g. data-copy="#install-cmd").
(function () {
  document.querySelectorAll('[data-copy]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var sel = btn.getAttribute('data-copy');
      var el = sel ? document.querySelector(sel) : null;
      var text = el ? el.innerText : '';
      navigator.clipboard.writeText(text).then(function () {
        var prev = btn.textContent;
        btn.textContent = 'copied \u2713';
        setTimeout(function () { btn.textContent = prev; }, 1300);
      }).catch(function () {});
    });
  });
})();
