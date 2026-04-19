# Personal Website (`mraoaakash.github.io`)

This repository is set up as a plain static website for GitHub Pages.

## Run Locally (Auto Reload on Save)

From the repo root:

```bash
npm install
npm run dev
```

Then open: `http://localhost:8000`

`live-server` watches files in this folder and automatically reloads the browser after each save.

## Run Locally (No Auto Reload)

If you want a no-dependency fallback:

```bash
python3 -m http.server 8000
```

## Deploy to GitHub Pages

1. Push this folder to a GitHub repository named `mraoaakash.github.io`.
2. Ensure your site files (`index.html`, `styles.css`, etc.) are in the repository root.
3. In GitHub: `Settings -> Pages`
4. Set:
   - Source: `Deploy from a branch`
   - Branch: `main`
   - Folder: `/(root)`

If the repository is named `mraoaakash.github.io`, GitHub serves it at:
`https://mraoaakash.github.io/`
