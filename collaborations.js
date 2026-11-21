/* The Vertura Academy: collaborations.js
   Renders the collaborating-school cards on /collaborations/ from /data/collaborations.json.
   Edit that file to add a school; this file does not need to change.

   { "schools": [ {
       "name": "School name",            required
       "city": "Pune", "state": "Maharashtra",
       "logo": "/assets/collaborations/school.png",
       "website": "https://school.example",
       "since": "2026",                  year or "Sept 2026"
       "grades": "Grades 5 to 10",
       "students": "300+",               optional: shown as "300+ students taking part"
       "verticals": ["Communication", "Leadership"],
              "note": "One line about the collaboration.",
       "outcome": "What changed, in two or three lines.",   optional: case study
       "quote": "A line from the principal.",                optional: also shown on
       "quoteBy": "Name, Principal",                          the homepage and Schools page
       "gallery": "event-slug"           optional: links to that event on /gallery/
   } ] }                                                                      */
(function () {
  "use strict";
  var root = document.querySelector("[data-collaborations]");
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
  function httpsOnly(u) { return typeof u === "string" && /^https:\/\//i.test(u) ? u : ""; }
  function localOrHttps(u) { return typeof u === "string" && (/^\/(?!\/)/.test(u) || /^https:\/\//i.test(u)) ? u : ""; }
  function slug(s) { return /^[\w-]{1,80}$/.test(s || "") ? s : ""; }
  function initials(name) {
    return String(name).split(/\s+/).filter(function (w) { return /^[A-Za-z]/.test(w) && !/^(the|of|and|&)$/i.test(w); })
      .slice(0, 3).map(function (w) { return w.charAt(0).toUpperCase(); }).join("") || "S";
  }

  function setCount(n) {
    document.querySelectorAll("[data-collab-count]").forEach(function (el) {
      el.textContent = String(n);
      var stat = el.closest("[data-collab-stat]");
      if (stat) stat.hidden = n === 0;   /* no "0 collaborating schools" before any are added */
    });
  }

  function card(s) {
    var logoSrc = localOrHttps(s.logo);
    var logo = logoSrc
      ? h("div", { class: "pt__logo" }, [h("img", { src: logoSrc, alt: s.name + " logo", loading: "lazy" })])
      : h("div", { class: "pt__logo pt__logo--i", "aria-hidden": "true", text: initials(s.name) });

    var place = [s.city, s.state].filter(Boolean).join(", ");
    var meta = [place, s.since ? "Since " + s.since : "", s.grades].filter(Boolean).join(" · ");
    var tags = (s.verticals || []).filter(Boolean);
    var site = httpsOnly(s.website);
    var ev = slug(s.gallery);
    var links = [];
    if (ev) links.push(h("a", { href: "/gallery/#ev-" + ev, text: "See the photos" }));
    if (site) links.push(h("a", { href: site, target: "_blank", rel: "noopener", text: "School website" }));

    return h("article", { class: "pt" }, [
      logo,
      h("div", { class: "pt__body" }, [
        h("h3", { class: "pt__name", text: s.name }),
        meta ? h("p", { class: "pt__meta", text: meta }) : null,
        s.students ? h("p", { class: "pt__stat" }, [h("b", { text: String(s.students) }), " students taking part"]) : null,
        tags.length ? h("ul", { class: "pt__tags", "aria-label": "Verticals running" }, tags.map(function (t) { return h("li", { text: t }); })) : null,
                s.note ? h("p", { class: "pt__note", text: s.note }) : null,
        s.outcome ? h("div", { class: "pt__case" }, [h("p", { class: "pt__case-h", text: "What changed" }), h("p", { text: s.outcome })]) : null,
        s.quote && s.quoteBy ? h("blockquote", { class: "pt__quote" }, [h("p", { text: s.quote }), h("cite", { text: s.quoteBy })]) : null,
        links.length ? h("div", { class: "pt__links" }, links) : null
      ])
    ]);
  }

  fetch("/data/collaborations.json", { cache: "no-cache" })
    .then(function (r) { if (!r.ok) throw new Error(r.status); return r.json(); })
    .then(function (data) {
      var schools = (data.schools || []).filter(function (s) { return s && s.name; });
      root.textContent = "";
      setCount(schools.length);
      if (!schools.length) {
        root.appendChild(h("div", { class: "empty" }, [
          h("p", { class: "empty__t", text: "Schools we collaborate with will be listed here." }),
          h("p", { class: "empty__b", text: "Want your school to be one of them?" }),
          h("div", { class: "actions" }, [h("a", { class: "btn btn--primary", href: "/contact/?for=school", text: "Collaborate with us" })])
        ]));
        return;
      }
      var grid = h("div", { class: "pt-grid" });
      schools.forEach(function (s) { grid.appendChild(card(s)); });
      root.appendChild(grid);
    })
    .catch(function () {
      root.textContent = "";
      root.appendChild(h("div", { class: "empty" }, [
        h("p", { class: "empty__t", text: "The list couldn't load." }),
        h("p", { class: "empty__b", text: "Please refresh the page, or try again in a moment." })
      ]));
    });
})();