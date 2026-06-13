// Copy-to-clipboard for any [data-copy] button; target text comes from the
// preceding <pre>. No framework, no dependencies.
document.querySelectorAll("button[data-copy]").forEach(function (btn) {
  btn.addEventListener("click", function () {
    var pre = btn.parentElement.querySelector("pre");
    if (!pre) return;
    navigator.clipboard.writeText(pre.innerText.trim()).then(function () {
      var prev = btn.textContent;
      btn.textContent = "copied";
      setTimeout(function () { btn.textContent = prev; }, 1500);
    });
  });
});
