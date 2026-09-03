/* The Vertura Academy — vertura.js
   ---------------------------------------------------------------
   Keys carried over from your previous site.js. Web3Forms emails every
   enquiry; SheetDB writes a row. If the key is blank the form falls back
   to opening the visitor's mail client with everything pre-filled, so no
   enquiry is ever silently lost. ------------------------------------- */

const WEB3FORMS_KEY = "51329b09-c18c-45fe-b5be-4c16c6a902df";
const SHEETDB_URL   = "https://sheetdb.io/api/v1/wzcxpkl5ebxgn";
const FALLBACK_EMAIL = "info@vertura.in";

/* ---------- mobile navigation ---------- */
(function () {
  const btn = document.getElementById("navtoggle");
  const nav = document.getElementById("nav");
  if (!btn || !nav) return;
  btn.addEventListener("click", function () {
    const open = nav.classList.toggle("is-open");
    btn.setAttribute("aria-expanded", String(open));
    btn.textContent = open ? "Close" : "Menu";
  });
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && nav.classList.contains("is-open")) {
      nav.classList.remove("is-open");
      btn.setAttribute("aria-expanded", "false");
      btn.textContent = "Menu";
      btn.focus();
    }
  });
})();

/* ---------- hero network canvas ---------- */
(function () {
  const c = document.getElementById("net");
  if (!c) return;
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const ctx = c.getContext("2d");
  let w, h, pts, raf, dpr;

  function size() {
    dpr = Math.min(devicePixelRatio || 1, 2);
    const box = c.parentElement.getBoundingClientRect();
    w = c.width = Math.round(box.width) * dpr;
    h = c.height = Math.round(box.height) * dpr;
    c.style.height = Math.round(box.height) + "px";
    const density = innerWidth < 640 ? 30 : 64;
    pts = Array.from({ length: density }, () => ({
      x: Math.random() * w, y: Math.random() * h,
      vx: (Math.random() - .5) * .16 * dpr, vy: (Math.random() - .5) * .16 * dpr,
      r: (Math.random() * 1.5 + .7) * dpr, gold: Math.random() < .18
    }));
  }
  function draw() {
    ctx.clearRect(0, 0, w, h);
    const link = 130 * dpr;
    for (let i = 0; i < pts.length; i++) {
      const p = pts[i];
      if (!reduce) { p.x += p.vx; p.y += p.vy; }
      if (p.x < 0 || p.x > w) p.vx *= -1;
      if (p.y < 0 || p.y > h) p.vy *= -1;
      for (let j = i + 1; j < pts.length; j++) {
        const q = pts[j], d = Math.hypot(p.x - q.x, p.y - q.y);
        if (d < link) {
          ctx.strokeStyle = "rgba(60,130,235," + (0.28 * (1 - d / link)).toFixed(3) + ")";
          ctx.lineWidth = .6 * dpr;
          ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(q.x, q.y); ctx.stroke();
        }
      }
      ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, 6.284);
      ctx.fillStyle = p.gold ? "rgba(231,178,60,.72)" : "rgba(125,180,255,.68)";
      ctx.fill();
    }
    if (!reduce) raf = requestAnimationFrame(draw);
  }
  size(); draw();
  addEventListener("resize", () => { cancelAnimationFrame(raf); size(); draw(); });
})();

/* ---------- spine lights up as you read it ---------- */
if ("IntersectionObserver" in window) {
  const io = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (e.isIntersecting) { e.target.classList.add("lit"); io.unobserve(e.target); }
    });
  }, { threshold: .55 });
  document.querySelectorAll(".step").forEach(s => io.observe(s));
}

/* ---------- enquiry form ---------- */
(function () {
  const form = document.getElementById("enquiry");
  if (!form) return;

  const who = document.getElementById("who");
  const program = document.getElementById("program");
  const orgField = document.getElementById("orgfield");
  const org = document.getElementById("org");
  const status = document.getElementById("status");
  const submit = document.getElementById("submit");

  const OPTIONS = {
    parent: [
      ["foundation", "The Vertura Foundation Programme — ages 10\u201314, Pune"],
      ["ai-labs", "Vertura AI Labs — ages 13\u201316, online"],
      ["unsure", "Not sure yet \u2014 help me choose"]
    ],
    school: [
      ["schools", "Vertura for Schools — six verticals, Grades 6\u20139"],
      ["unsure", "Not sure yet \u2014 tell me how it works"]
    ],
    business: [
      ["corporate", "Corporate AI training \u2014 non-technical teams"],
      ["unsure", "Not sure yet \u2014 tell me how it works"]
    ],
    other: [
      ["foundation", "The Vertura Foundation Programme"],
      ["ai-labs", "Vertura AI Labs"],
      ["schools", "Vertura for Schools"],
      ["corporate", "Corporate AI training"],
      ["other", "None of these"]
    ]
  };
  const LABELS = {
    "foundation": "The Vertura Foundation Programme",
    "ai-labs": "Vertura AI Labs",
    "schools": "Vertura for Schools",
    "corporate": "Corporate AI training",
    "unsure": "Not sure yet",
    "other": "Other"
  };

  function fill(kind, preferred) {
    program.innerHTML = "";
    (OPTIONS[kind] || OPTIONS.other).forEach(function (pair) {
      const o = document.createElement("option");
      o.value = pair[0]; o.textContent = pair[1];
      program.appendChild(o);
    });
    if (preferred) program.value = preferred;
    orgField.hidden = kind !== "school";
    if (org) org.required = kind === "school";
  }

  /* honour ?for= and ?program= from the links across the site */
  const q = new URLSearchParams(location.search);
  const forParam = q.get("for");
  const progParam = q.get("program");
  let kind = "parent";
  if (forParam === "school") kind = "school";
  if (forParam === "business") kind = "business";
  if (progParam === "schools") kind = "school";
  if (progParam === "corporate") kind = "business";
  who.value = kind;
  fill(kind, progParam);

  who.addEventListener("change", function () { fill(who.value); });

  form.addEventListener("submit", async function (e) {
    e.preventDefault();
    if (form.botcheck && form.botcheck.value) return;
    if (!form.checkValidity()) { form.reportValidity(); return; }

    const payload = {
      "Enquiry type": who.options[who.selectedIndex].text,
      "Programme of interest": LABELS[program.value] || program.value,
      "Name": document.getElementById("name").value.trim(),
      "School and role": org && !orgField.hidden ? org.value.trim() : "",
      "Contact detail": document.getElementById("contact").value.trim(),
      "Message": document.getElementById("message").value.trim(),
      "Sent at": new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" })
    };

    if (!WEB3FORMS_KEY) {
      const body = Object.keys(payload).map(k => k + ": " + payload[k]).join("\n");
      location.href = "mailto:" + FALLBACK_EMAIL +
        "?subject=" + encodeURIComponent("Vertura enquiry — " + payload.Name) +
        "&body=" + encodeURIComponent(body);
      return;
    }

    submit.disabled = true;
    const original = submit.textContent;
    submit.textContent = "Sending…";
    status.className = "formstatus";
    status.textContent = "";

    try {
      const r = await fetch("https://api.web3forms.com/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({
          access_key: WEB3FORMS_KEY,
          subject: "Vertura enquiry — " + payload["Programme of interest"] + " — " + payload.Name,
          from_name: "vertura.in enquiry form",
          ...payload
        })
      });
      if (!r.ok) throw new Error(r.status);

      if (SHEETDB_URL) {
        fetch(SHEETDB_URL, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ data: [payload] })
        }).catch(function () {});
      }

      form.reset();
      fill(who.value);
      status.className = "formstatus ok";
      status.textContent = "Thank you — that reached us. We reply from info@vertura.in, usually within two working days.";
    } catch (err) {
      status.className = "formstatus bad";
      status.innerHTML = "That didn't send. Please email <a style=\"color:#E7B23C\" href=\"mailto:" +
        FALLBACK_EMAIL + "\">" + FALLBACK_EMAIL + "</a> or message us on WhatsApp and we'll pick it up.";
    } finally {
      submit.disabled = false;
      submit.textContent = original;
    }
  });
})();
