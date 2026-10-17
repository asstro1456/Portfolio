# Portfolio (current + legacy)

GitHub Pages entry: https://asstro1456.github.io/Portfolio/

## Main site
- `index.html`: homepage router to `resume-showcase.html`.
- `resume-showcase.html`: current main portfolio; **update this file as the single source of truth**.
- `showcase-*.html`: six project detail pages, linked from the current main.
- `planning-hub.html`: planning-document index.
- `tools-skills.html`: skills and tools.
- `print.html`, `project-record.html`, `cover-letter-generic.html`: printable application documents.
- `output/pdf/`: existing downloaded PDFs (must be separately regenerated after updating HTML).
- `css/`, `js/`, `assets/`: shared styles, scripts, and images.

## Legacy site
- `legacy.html`: unchanged copy of the former `index.html` LDH archive site.
- Keeps its existing root-relative assets through `css/style.css`, `js/main.js`, and `assets/`.
- Old legacy-only hash links to the repo root (for example `#subculture` or `#archive`) route to `legacy.html`.
- Do not overwrite `legacy.html` during routine resume-showcase updates.

## Link stability
- The previously shared `resume-showcase.html#top` link remains valid.
- The short root `/Portfolio/` now redirects to `resume-showcase.html`.
- Full legacy archive URL: https://asstro1456.github.io/Portfolio/legacy.html

## Maintenance
Update `resume-showcase.html`, its project pages, and `css/resume-showcase.css` for new portfolio content. Keep the PDF exports in sync before submitting applications.
