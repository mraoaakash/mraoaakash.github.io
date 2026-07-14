# Personal Website (`mraoaakash.github.io`)

This repository is set up as a plain static website for GitHub Pages.

## Edit Website Content

The repository is organised so the two folders most users edit are visible at the top level:

- `content/` contains editable website text and records.
- `assets/` contains replaceable images, logos, PDFs, and other media.

The remaining website implementation lives in `site/`, while secondary HTML pages live in `pages/`. Only `index.html` remains at the root because GitHub Pages uses it as the website entry point.

### Editable content

| File | Controls |
| --- | --- |
| `content/site.json` | Names, biography, contact details, profile image, social links, navigation, page metadata, and footer |
| `content/projects.json` | Project cards, their order, images, summaries, and destinations |
| `content/cv.json` | CV sections and entries, including roles, dates, logos, flags, and bullet points |
| `content/publications.json` | Publication records and links |
| `content/publications_tags.json` | Publication filter labels |
| `content/news.json` | News updates and optional media |

Keep JSON syntax valid: strings use double quotes, entries are separated by commas, and the final entry in a list has no trailing comma. Image paths are relative to the repository root. Add images to the matching folder under `assets/` before referring to them in JSON.

To replace the website background, upload your image as `assets/images/background.jpeg`, replacing the existing file. Keep the filename and `.jpeg` extension unchanged; no CSS or JSON edits are needed.

The `bio_html` field accepts HTML so the biography can contain links. All other text fields are rendered as plain text.

`content/site.json` is the source of truth for shared site chrome and identity fields. The shared navigation and footer are generated automatically from `navigation`, `name`, `copyright_year`, and `footer_text`. Content fields use ordinary text so they can be edited directly without special placeholder syntax.

The long-form project pages in `pages/projects/` remain HTML because their layouts and content vary. The project cards that link to them are managed in `content/projects.json`.

Because browsers block JSON loading from `file://` URLs, preview the site through one of the local servers below rather than opening an HTML file directly.

## Run Locally (Auto Reload on Save)

From the repo root:

```bash
npm install
npm run dev
```

Then open: `http://localhost:8000`

`live-server` watches files in this folder and automatically reloads the browser after each save.

For the Python reload-on-save server:

```bash
npm run dev:reload
```

## Run Locally (No Auto Reload)

If you want a no-dependency fallback:

```bash
python3 -m http.server 9100
```

## Deploy to GitHub Pages

1. Push this folder to a GitHub repository named `mraoaakash.github.io`.
2. Keep `index.html`, `content/`, `assets/`, `pages/`, and `site/` in the repository with the layout shown above.
3. In GitHub: `Settings -> Pages`
4. Set:
   - Source: `Deploy from a branch`
   - Branch: `main`
   - Folder: `/(root)`

If the repository is named `mraoaakash.github.io`, GitHub serves it at:
`https://mraoaakash.github.io/`
