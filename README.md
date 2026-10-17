# Portfolio - current and legacy

## URLs
- Main: https://asstro1456.github.io/Portfolio/
- Previously shared current-page link: https://asstro1456.github.io/Portfolio/resume-showcase.html#top
- Former archive site: https://asstro1456.github.io/Portfolio/legacy.html

## Structure
- `index.html`: **actual homepage markup**, no redirect or intermediate landing page.
- `resume-showcase.html`: compatibility copy of the current homepage. Keep it available for previously shared URLs.
- `legacy.html`: preserved copy of the former LDH Archive homepage. Its CSS and JS continue to load from `css/style.css` and `js/main.js`.
- `showcase-*.html`: six project pages.
- `planning-hub.html`: planning-document index.
- `tools-skills.html`: tool and skills overview.
- `print.html`, `project-record.html`, `cover-letter-generic.html`: printable application documents.
- `output/pdf/`: previously generated PDF attachments, which require regeneration after HTML revisions.
- `css/`, `js/`, `assets/`: styles, scripts, and images.

## Updating the site
Edit the current portfolio content in `resume-showcase.html`, then copy that entire HTML to `index.html` and verify they are identical. Both files deliberately exist to keep previously shared addresses working **without redirects**. Project detail pages remain shared between the two URLs.

Leave `legacy.html` unchanged during regular updates. The prior root address with an archive-only hash (e.g. `/Portfolio/#archive`) no longer forwards automatically; use `/Portfolio/legacy.html#archive` instead.

Before submitting applications, regenerate downloadable PDF files as needed and verify external access permissions for linked resources.
