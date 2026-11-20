# The Vertura Academy: vertura.in

Static site, served from the repo root (GitHub Pages). No build step.

## Pages

| Nav label | URL |
| --- | --- |
| For Schools (lead item) | `/schools/` |
| Foundation | `/foundation/` |
| AI Labs | `/ai-labs/` |
| For Business | `/corporate/` |
| Partnerships | `/partnerships/` |
| Gallery | `/gallery/` |
| Sample Growth Index | `/growth-index/` |
| Founder | `/founder/` |
| Get in touch | `/contact/` |

`/programs/` and `/programs.html` are forwarding stubs to `/schools/` so old links keep working.

Shared files: `vertura.css` (site), `nav.css` + `nav.js` (menu; used by every page including AI Labs), `vertura.js` (hero animation + enquiry form), `partners.js` (Partnerships page), `gallery.js` (Gallery page).

## Partnerships: `data/partners.json`

Add one object per school to `schools`. Only `name` is required; leave out anything you don't want shown.

```json
{
  "name": "Example International School",
  "city": "Pune",
  "state": "Maharashtra",
  "logo": "/assets/partners/example.png",
  "website": "https://example.com",
  "since": "2026",
  "grades": "Grades 5 to 10",
  "students": "300+",
  "verticals": ["Communication", "Leadership"],
  "note": "One line about the partnership.",
  "gallery": "example-event"
}
```

- Put logos in `assets/partners/`. A school with no logo gets a tile with its initials.
- `outcome` is optional: two or three lines on what changed at the school. It shows on the card as "What changed".
- `quote` and `quoteBy` are optional: a line from the principal and who said it (e.g. `"Name, Principal"`). The quote shows on the card and in "What school leaders say" on the homepage and Schools page. That block stays hidden until at least one school has a quote.
- `students` is optional: give it a number such as `"300+"` and the card shows "300+ students taking part".
- `gallery` is optional: give it an event's `slug` (below) and the card gets a "See the photos" link to that event.
- The "Partner schools" count in the page header appears by itself once there is at least one school.

## Gallery: `data/events.json`

One block per event, newest first, each showing its date, place, a timeline of what happened when and where, and its photos. Visitors can filter by `category` and flip the order.

1. Make a folder per event with no spaces in the name: `assets/gallery/annual-showcase-2026/`, and put that event's photos in it (about 1600px on the long edge).
2. From the repo root run `node tools/build-gallery.mjs`. It adds each photo to the event. A folder with no entry yet gets a starter entry.
3. Open `data/events.json` and fill in the event:

```json
{
  "slug": "annual-showcase-2026",
  "title": "Annual Showcase",
  "category": "Vertura for Schools",
  "date": "2026-10-12",
  "endDate": "2026-10-13",
  "location": "Example International School, Pune",
  "summary": "Two lines on what the event was.",
  "timeline": [
    { "time": "9:00 AM",  "what": "Doors open and registration", "where": "Main lobby" },
    { "time": "10:30 AM", "what": "Student presentations",       "where": "Auditorium" }
  ],
  "photos": [ … filled in by the tool; you can add "alt" and "caption" to any photo … ]
}
```

Events with the category `Guest Speaker`, `Talk`, `Press`, `Award` or `Recognition` are also listed under "Talks and recognition" on the Founder page, newest first.

Run the tool again whenever you add or delete photos. Titles, timelines, captions and photo order you have edited are kept. An event is shown at `/gallery/#ev-<slug>`. `date` and `endDate` use the form `YYYY-MM-DD`; an event without a date is listed last.

Only publish photos of children with a parent's consent.

## Proof blocks: `proof.js`

The homepage and the Schools page show a numbers row, a partner logo strip and three photos straight after the hero. The numbers and logos are worked out from `data/partners.json` and `data/events.json`, so they update by themselves when you add a school or an event. The three photos are fixed files in `assets/proof/`.

"What school leaders say" appears under the photos as soon as any school in `partners.json` has a `quote` and `quoteBy`.

## Sample Growth Index: `/growth-index/`

A sample quarterly report with illustrative scores. "Download as PDF" prints only the report, on white. Look for the `<!-- EDIT: ... -->` notes in `growth-index/index.html` and `schools/index.html` for wording to confirm.

## Share images and icons

Each page has its own 1200 by 630 share image in `og/`. Icons: `favicon.ico`, `apple-touch-icon.png`, `icon-192.png`, `icon-512.png` and `site.webmanifest`.

## Enquiry form

`vertura.js` holds the Web3Forms and SheetDB keys. The form opens on **A school partnership** by default. Links with `?for=parent` or `?program=foundation` / `?program=ai-labs` open it on the parent options. To go back to parent-first, change `let kind = "school";` in `vertura.js` and reorder the `<option>`s in `contact/index.html`.
