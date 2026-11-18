/* The Vertura Academy — nav.js
   Shared by every page (including /ai-labs/): the mobile menu.
   Nothing here depends on any other script. */
(function () {
  "use strict";
  var btn = document.getElementById("navtoggle");
  var nav = document.getElementById("nav");
  if (!btn || !nav) return;

  var wide = window.matchMedia("(min-width: 1240px)");

  function setMenu(open) {
    nav.classList.toggle("is-open", open);
    btn.setAttribute("aria-expanded", String(open));
    btn.textContent = open ? "Close" : "Menu";
  }

  btn.addEventListener("click", function () { setMenu(!nav.classList.contains("is-open")); });

  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && nav.classList.contains("is-open")) {
      setMenu(false);
      btn.focus();
    }
  });

  /* resizing across the breakpoint should never leave a stale open menu */
  var onChange = function () { setMenu(false); };
  if (wide.addEventListener) wide.addEventListener("change", onChange);
  else if (wide.addListener) wide.addListener(onChange);
})();
