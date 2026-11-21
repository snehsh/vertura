/* The Vertura Academy: proof.js
   Fills the proof blocks from the same data files the Collaborations and
   Gallery pages use, so they stay up to date on their own:

     [data-proof-stats]     numbers row (collaborating schools, students, events, places)
     [data-proof-logos]     "Schools we collaborate with" logo strip
     [data-leader-quotes]   quotes from school leaders (collaborations.json "quote")
     [data-talks]           talks and recognition (events.json, see TALK_CATEGORIES)

   Every block stays hidden until it has something real to show. */
(function () {
  "use strict";

  var TALK_CATEGORIES = ["Guest Speaker", "Talk", "Press", "Award", "Recognition"];

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
  function slug(s) { return /^[\w-]{1,80}$/.test(s || "") ? s : ""; }
  function getJSON(url) {
    return fetch(url, { cache: "no-cache" }).then(function (r) { if (!r.ok) throw new Error(r.status); return r.json(); });
  }
  function parseDate(d) {
    var m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(d || "");
    return m ? new Date(+m[1], +m[2] - 1, +m[3]) : null;
  }

  var needsSchools = document.querySelector("[data-proof-stats],[data-proof-logos],[data-leader-quotes]");
  var needsEvents = document.querySelector("[data-proof-stats],[data-talks]");
  if (!needsSchools && !needsEvents) return;

  Promise.all([
    needsSchools ? getJSON("/data/collaborations.json").catch(function () { return {}; }) : {},
    needsEvents ? getJSON("/data/events.json").catch(function () { return {}; }) : {}
  ]).then(function (res) {
    var schools = ((res[0] && res[0].schools) || []).filter(function (s) { return s && s.name; });
    var events = ((res[1] && res[1].events) || []).filter(function (e) { return e && e.title; });
    stats(schools, events);
    logos(schools);
    quotes(schools);
    talks(events);
  });

  /* ---------- numbers row ---------- */
  function stats(schools, events) {
    document.querySelectorAll("[data-proof-stats]").forEach(function (box) {
      var students = 0, plus = false;
      schools.forEach(function (s) {
        var m = /(\d[\d,]*)/.exec(String(s.students || ""));
        if (m) { students += parseInt(m[1].replace(/,/g, ""), 10); if (/\+/.test(s.students)) plus = true; }
      });
      var places = {};
      schools.forEach(function (s) { if (s.city) places[s.city.trim().toLowerCase()] = 1; });
      events.forEach(function (e) {
        var town = String(e.location || "").split(",")[0].trim().toLowerCase();
        if (town) places[town] = 1;
      });
      var nPlaces = Object.keys(places).length;

      var items = [
        [schools.length, schools.length === 1 ? "collaborating school" : "collaborating schools"],
        [students ? students.toLocaleString("en-IN") + (plus ? "+" : "") : 0, "students in collaborating schools"],
        [events.length, events.length === 1 ? "event and school visit" : "events and school visits"],
        [nPlaces, nPlaces === 1 ? "town or city" : "towns and cities"]
      ].filter(function (it) { return it[0]; });
      if (!items.length) return;

      box.textContent = "";
      items.forEach(function (it) {
        box.appendChild(h("div", { class: "proof__stat" }, [
          h("span", { class: "proof__n", text: String(it[0]) }),
          h("span", { class: "proof__l", text: it[1] })
        ]));
      });
      box.hidden = false;
    });
  }

  /* ---------- logo strip ---------- */
  function logos(schools) {
    var withLogo = schools.filter(function (s) { return localOrHttps(s.logo); });
    if (!withLogo.length) return;
    document.querySelectorAll("[data-proof-logos]").forEach(function (box) {
      var list = box.querySelector("ul") || box.appendChild(h("ul"));
      list.textContent = "";
      withLogo.forEach(function (s) {
        var place = [s.city, s.state].filter(Boolean).join(", ");
        list.appendChild(h("li", {}, [
          h("a", { href: "/collaborations/", class: "proof__logo", title: s.name + (place ? ", " + place : "") }, [
            h("img", { src: localOrHttps(s.logo), alt: s.name, loading: "lazy", width: "120", height: "64" })
          ]),
          h("span", { class: "proof__school", text: s.name })
        ]));
      });
      box.hidden = false;
    });
  }

  /* ---------- quotes from school leaders ---------- */
  function quotes(schools) {
    var said = schools.filter(function (s) { return s.quote && s.quoteBy; });
    if (!said.length) return;
    document.querySelectorAll("[data-leader-quotes]").forEach(function (section) {
      var list = section.querySelector("[data-quote-list]");
      if (!list) return;
      list.textContent = "";
      said.forEach(function (s) {
        list.appendChild(h("blockquote", { class: "quote" }, [
          h("p", { text: s.quote }),
          h("cite", { text: s.quoteBy + ", " + s.name })
        ]));
      });
      section.hidden = false;
    });
  }

  /* ---------- talks and recognition ---------- */
  function talks(events) {
    var list = events.filter(function (e) { return TALK_CATEGORIES.indexOf(e.category) > -1; })
      .sort(function (a, b) { return (parseDate(b.date) || 0) - (parseDate(a.date) || 0); });
    if (!list.length) return;
    document.querySelectorAll("[data-talks]").forEach(function (section) {
      var ul = section.querySelector("[data-talk-list]");
      if (!ul) return;
      ul.textContent = "";
      list.forEach(function (e) {
        var d = parseDate(e.date);
        var when = d ? d.toLocaleDateString("en-IN", { month: "long", year: "numeric" }) : "";
        var link = slug(e.slug) ? h("a", { href: "/gallery/#ev-" + e.slug, text: "See the photos" }) : null;
        ul.appendChild(h("li", {}, [
          h("span", { class: "talk__when", text: when }),
          h("span", { class: "talk__what" }, [
            e.title,
            e.location ? h("span", { class: "talk__where", text: e.location }) : null,
            link
          ])
        ]));
      });
      section.hidden = false;
    });
  }
})();
