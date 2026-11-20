/* The Vertura Academy: gallery.js
   Renders /gallery/ from /data/events.json: one block per event, newest
   first, each with its date, place, what happened when, and its photos.

   { "events": [ {
       "slug": "annual-showcase-2026",        used in the link  /gallery/#ev-annual-showcase-2026
       "title": "Annual Showcase",
       "category": "Vertura for Schools",     becomes a filter button
       "date": "2026-10-12", "endDate": "2026-10-13",   endDate optional; YYYY-MM-DD
       "location": "School name, City",
       "summary": "Two lines on the event.",
       "timeline": [ { "time": "9:00 AM", "what": "Doors open", "where": "Main hall" } ],
       "photos":   [ { "src": "/assets/gallery/annual-showcase-2026/01.jpg", "alt": "…", "caption": "…" } ]
   } ] }
   Run  node tools/build-gallery.mjs  to fill "photos" from the folders. */
(function () {
  "use strict";
  var root = document.querySelector("[data-gallery]");
  if (!root) return;

  function h(tag, attrs, kids) {
    var node = document.createElement(tag);
    Object.keys(attrs || {}).forEach(function (k) {
      var v = attrs[k];
      if (v === false || v == null) return;
      if (k === "class") node.className = v;
      else if (k === "text") node.textContent = v;
      else node.setAttribute(k, v === true ? "" : v);
    });
    (kids || []).forEach(function (kid) {
      if (kid == null) return;
      node.appendChild(typeof kid === "string" ? document.createTextNode(kid) : kid);
    });
    return node;
  }
  function localOrHttps(u) { return typeof u === "string" && (/^\/(?!\/)/.test(u) || /^https:\/\//i.test(u)) ? u : ""; }
  function slugOf(e, i) { return /^[\w-]{1,80}$/.test(e.slug || "") ? e.slug : "event-" + (i + 1); }

  /* "2026-10-12" → a local Date (avoids the timezone shift of new Date("2026-10-12")) */
  function parse(d) {
    var m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(d || "");
    return m ? new Date(+m[1], +m[2] - 1, +m[3]) : null;
  }
  function fmt(d) { return d.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }); }
  function dateLabel(e) {
    var a = parse(e.date), b = parse(e.endDate);
    if (!a) return "Date to be added";
    return b && b > a ? fmt(a) + " to " + fmt(b) : fmt(a);
  }

  /* ---------- lightbox (one per page, reused for every event) ---------- */
  function buildLightbox() {
    var dlg = h("dialog", { class: "lb", "aria-label": "Photo viewer" });
    var img = h("img", { alt: "" });
    var evl = h("p", { class: "lb__ev" });
    var cap = h("p", { class: "lb__cap" });
    var count = h("p", { class: "lb__count" });
    var close = h("button", { class: "lb__btn lb__close", type: "button", "aria-label": "Close photo viewer", text: "×" });
    var prev = h("button", { class: "lb__btn lb__prev", type: "button", "aria-label": "Previous photo", text: "‹" });
    var next = h("button", { class: "lb__btn lb__next", type: "button", "aria-label": "Next photo", text: "›" });
    dlg.appendChild(close); dlg.appendChild(prev); dlg.appendChild(next);
    dlg.appendChild(h("figure", { class: "lb__fig" }, [img, h("figcaption", {}, [evl, cap, count])]));
    document.body.appendChild(dlg);

    var list = [], title = "", at = 0;
    function show(i) {
      at = (i + list.length) % list.length;
      var p = list[at];
      img.src = localOrHttps(p.src);
      img.alt = p.alt || p.caption || title;
      evl.textContent = title;
      cap.textContent = p.caption || "";
      count.textContent = (at + 1) + " / " + list.length;
      prev.hidden = next.hidden = list.length < 2;
    }
    close.addEventListener("click", function () { dlg.close(); });
    prev.addEventListener("click", function () { show(at - 1); });
    next.addEventListener("click", function () { show(at + 1); });
    dlg.addEventListener("click", function (e) { if (e.target === dlg) dlg.close(); });
    dlg.addEventListener("keydown", function (e) {
      if (e.key === "ArrowLeft") show(at - 1);
      if (e.key === "ArrowRight") show(at + 1);
    });
    return {
      open: function (photos, i, eventTitle) {
        list = photos; title = eventTitle; show(i);
        if (typeof dlg.showModal === "function") dlg.showModal(); else dlg.setAttribute("open", "");
      }
    };
  }

  /* ---------- one event ---------- */
  function eventBlock(e, i, lightbox) {
    var photos = (e.photos || []).filter(function (p) { return p && localOrHttps(p.src); });
    var steps = (e.timeline || []).filter(function (t) { return t && t.what; });

    var when = h("div", { class: "ev__when" }, [
      h("p", { class: "ev__date", text: dateLabel(e) }),
      e.location ? h("p", { class: "ev__where", text: e.location }) : null,
      e.category ? h("p", { class: "ev__cat", text: e.category }) : null
    ]);

    var body = h("div", { class: "ev__body" }, [
      h("h2", { class: "ev__title", text: e.title }),
      e.summary ? h("p", { class: "ev__sum", text: e.summary }) : null
    ]);

    if (steps.length) {
      body.appendChild(h("p", { class: "ev__h", text: "What happened, and when" }));
      body.appendChild(h("ol", { class: "ev__tl" }, steps.map(function (t) {
        return h("li", {}, [
          h("span", { class: "ev__time", text: t.time || "" }),
          h("span", { class: "ev__what" }, [t.what, t.where ? h("span", { class: "ev__at", text: t.where }) : null])
        ]);
      })));
    }

    if (photos.length) {
      var grid = h("div", { class: "g-grid" });
      photos.forEach(function (p, k) {
        var pic = h("img", { src: localOrHttps(p.src), alt: p.alt || p.caption || e.title, loading: "lazy", decoding: "async" });
        var open = h("button", { class: "g-item", type: "button", "aria-label": "Open photo " + (k + 1) + " of " + photos.length + ": " + e.title }, [pic]);
        open.addEventListener("click", function () { lightbox.open(photos, k, e.title); });
        grid.appendChild(h("figure", { class: "g-fig" }, [open, p.caption ? h("figcaption", { text: p.caption }) : null]));
      });
      body.appendChild(h("div", { class: "ev__photos" }, [
        h("p", { class: "ev__h" }, ["Photos ", h("span", { class: "ev__n", text: "(" + photos.length + ")" })]),
        grid
      ]));
    } else {
      body.appendChild(h("p", { class: "ev__nophotos", text: "Photos from this event will be added soon." }));
    }

    return h("article", { class: "ev", id: "ev-" + slugOf(e, i) }, [when, body]);
  }

  function emptyState(title, text) {
    return h("div", { class: "empty" }, [
      h("p", { class: "empty__t", text: title }),
      text ? h("p", { class: "empty__b", text: text }) : null
    ]);
  }

  fetch("/data/events.json", { cache: "no-cache" })
    .then(function (r) { if (!r.ok) throw new Error(r.status); return r.json(); })
    .then(function (data) {
      var events = (data.events || []).filter(function (e) { return e && e.title; })
        .map(function (e, i) { e.__i = i; return e; });
      root.textContent = "";
      if (!events.length) {
        root.appendChild(emptyState("Events will appear here.", "Each one with its date, place, a timeline of what happened, and the photos."));
        return;
      }

      var lightbox = buildLightbox();
      var categories = [];
      events.forEach(function (e) { if (e.category && categories.indexOf(e.category) < 0) categories.push(e.category); });
      var active = "All", newestFirst = true;

      var list = h("div", { class: "tl" });
      function paint() {
        var shown = events.filter(function (e) { return active === "All" || e.category === active; });
        shown.sort(function (a, b) {
          var da = parse(a.date), db = parse(b.date);
          if (!da && !db) return a.__i - b.__i;
          if (!da) return 1;            /* undated events always go last */
          if (!db) return -1;
          return newestFirst ? db - da : da - db;
        });
        list.textContent = "";
        if (!shown.length) { list.appendChild(emptyState("No events in this category yet.")); return; }
        shown.forEach(function (e) { list.appendChild(eventBlock(e, e.__i, lightbox)); });
      }

      var tools = h("div", { class: "g-tools" });
      if (categories.length > 1) {
        var bar = h("div", { class: "g-filters", role: "group", "aria-label": "Filter events" });
        ["All"].concat(categories).forEach(function (c) {
          var b = h("button", { type: "button", "aria-pressed": String(c === active), text: c });
          b.addEventListener("click", function () {
            active = c;
            bar.querySelectorAll("button").forEach(function (x) { x.setAttribute("aria-pressed", String(x === b)); });
            paint();
          });
          bar.appendChild(b);
        });
        tools.appendChild(bar);
      }
      if (events.length > 1) {
        var sort = h("button", { class: "g-sort", type: "button", text: "Newest first" });
        sort.addEventListener("click", function () {
          newestFirst = !newestFirst;
          sort.textContent = newestFirst ? "Newest first" : "Oldest first";
          paint();
        });
        tools.appendChild(sort);
      }
      if (tools.childNodes.length) root.appendChild(tools);
      root.appendChild(list);
      paint();

      /* /gallery/#ev-some-slug scrolls to that event */
      if (location.hash) {
        var target = document.getElementById(decodeURIComponent(location.hash.slice(1)));
        if (target) setTimeout(function () { target.scrollIntoView(); }, 50);
      }
    })
    .catch(function () {
      root.textContent = "";
      root.appendChild(emptyState("The gallery couldn't load.", "Please refresh the page, or try again in a moment."));
    });
})();
