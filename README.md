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

Run the tool again whenever you add or delete photos. Titles, timelines, captions and photo order you have edited are kept. An event is shown at `/gallery/#ev-<slug>`. `date` and `endDate` use the form `YYYY-MM-DD`; an event without a date is listed last.

Only publish photos of children with a parent's consent.

## Enquiry form

`vertura.js` holds the Web3Forms and SheetDB keys. The form opens on **A school partnership** by default. Links with `?for=parent` or `?program=foundation` / `?program=ai-labs` open it on the parent options. To go back to parent-first, change `let kind = "school";` in `vertura.js` and reorder the `<option>`s in `contact/index.html`.
