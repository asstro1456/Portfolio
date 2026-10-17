# Portfolio - current and legacy

## Site addresses
- Default: https://asstro1456.github.io/Portfolio/ — immediately redirects to the actual current homepage.
- **Main content / single source of truth:** https://asstro1456.github.io/Portfolio/resume-showcase.html
- Previous archive: https://asstro1456.github.io/Portfolio/legacy.html

## Pages
- `resume-showcase.html`: the actual current main homepage. **Edit only this file for future homepage updates.**
- `index.html`: minimal GitHub Pages root redirect. No duplicate homepage markup or separate landing screen.
- `legacy.html`: preserved original archive homepage. Keep unchanged unless explicitly requested.
- `showcase-*.html`: detailed project pages.
- `planning-hub.html`: planning documents.
- `tools-skills.html`: tools and competencies.
- `print.html`, `project-record.html`, `cover-letter-generic.html`: application documents.
- `output/pdf/`: PDF exports, updated independently when the HTML changes.
- `css/`, `js/`, `assets/`: shared resources.

## Maintenance
Do not duplicate `resume-showcase.html` into `index.html`. GitHub Pages requires `index.html` as the root entrypoint, so it only redirects with `location.replace`. The address bar changes to `resume-showcase.html` without an intermediate landing page. Search and hash fragments are carried across in JavaScript-supported browsers. The meta refresh is a fallback for scripts-disabled environments.

Previously shared `resume-showcase.html#top` links remain valid. Legacy links should explicitly use `legacy.html` (for example `legacy.html#archive`).
