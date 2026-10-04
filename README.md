# Ruksy — Portfolio

A static one-page portfolio: graphic &amp; digital design, UX research and content.

Built from the Figma wireframes, following the project style sheet:

| Token  | Value     |
| ------ | --------- |
| Cream  | `#FAF3EB` |
| Pink   | `#FB9EBB` |
| Black  | `#000000` |
| Navy   | `#0B1956` |

Typefaces: **Courier New** (body, navigation, labels) and **Cormorant Garamond** (display).

## Running it

No build step and no dependencies — it is plain HTML, CSS and vanilla JS.
Open `index.html` directly, or serve the folder:

```bash
python -m http.server 8000
```

## Structure

```
index.html            markup for every section
assets/css/style.css  design tokens, layout, animation
assets/js/main.js     scroll reveals, parallax, counters, cursor
assets/img/           photography, logo mark and hand-drawn doodles
```

## Notes

- Animation respects `prefers-reduced-motion`, and a `<noscript>` block keeps
  the page readable if JavaScript does not run.
- All paths are relative, so the site works at a domain root or in a
  subdirectory (e.g. a GitHub Pages project site).
- `.nojekyll` tells GitHub Pages to publish the files as-is.

## To fill in

- The **Other projects** rows (Campus Res, Wild Uchi, IKYK) link to `#contact`
  as placeholders — point them at real case studies when they exist.
- The **LinkedIn** URL in the contact section is a generic placeholder.
