/* The Vertura Academy: nav.js
   Shared by every page (including /ai-labs/): the mobile menu and the
   floating WhatsApp button. Nothing here depends on any other script. */
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

  /* a tap outside the open menu closes it */
  document.addEventListener("click", function (e) {
    if (nav.classList.contains("is-open") && !nav.contains(e.target) && !btn.contains(e.target)) setMenu(false);
  });

    /* ---------- floating WhatsApp button ---------- */
  var WA_NUMBER = "919022317329";
  var WA_TEXT = "Hi! I'd like to know more about The Vertura Academy.";
  var wa = document.createElement("a");
  wa.className = "wa-float";
  wa.href = "https://wa.me/" + WA_NUMBER + "?text=" + encodeURIComponent(WA_TEXT);
  wa.target = "_blank";
  wa.rel = "noopener";
  wa.setAttribute("aria-label", "Chat with us on WhatsApp");
  wa.innerHTML =
    '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3a9 9 0 0 0-7.8 13.5L3 21l4.6-1.2A9 9 0 1 0 12 3z"/>' +
    '<path d="M8.6 8.3c.2-.4.5-.5.8-.5h.5c.2 0 .4.1.5.4l.7 1.6c.1.2 0 .5-.1.7l-.5.6c.6 1.2 1.6 2.2 2.8 2.8l.6-.5c.2-.2.5-.2.7-.1l1.6.7c.3.1.4.3.4.5v.5c0 .3-.1.6-.5.8-.6.3-1.4.5-2.3.2a8.6 8.6 0 0 1-5.2-5.2c-.3-.9-.1-1.7.2-2.3z"/></svg>' +
    "<span>WhatsApp us</span>";
  /* AI Labs already has a WhatsApp button in its sticky bar on phones */
  if (document.getElementById("sticky")) wa.classList.add("wa-float--desktop");
  document.body.appendChild(wa);
  document.body.classList.add("has-wa");

  /* resizing across the breakpoint should never leave a stale open menu */
  var onChange = function () { setMenu(false); };
  if (wide.addEventListener) wide.addEventListener("change", onChange);
  else if (wide.addListener) wide.addListener(onChange);
})();
