# Ethereum Foundation — Public Sector

Static site for `publicsector.ethereum.foundation`, exported from its Astro build (plain HTML/CSS/JS, no build step required to run it).

## Running locally

This is a static export, but **do not open `index.html` directly from Finder** (`file://...`). Chrome (and most browsers) block `<script type="module">` from running under the `file://` protocol, which breaks the hero image reveal effect, the ambient pixel-field canvas backgrounds, and the mobile nav — without a server these will silently fail to load.

Instead, serve the folder over local HTTP:

```bash
cd publicsector.ethereum.foundation
python3 -m http.server 8743
```

Then open **http://localhost:8743/index.html** in your browser.

Any simple static server works the same way (e.g. `npx serve`, `php -S localhost:8743`) — the only requirement is that it's `http://`, not `file://`.

## Structure

- `index.html`, and one `index.html` per subdirectory (`case-studies/`, `potential-applications/`, `articles/`, etc.) — one file per page.
- `_astro/` — shared compiled CSS and JS, reused across most pages (fonts, layout, the `PixelField` hero component, nav, footer).
- `shades/`, root-level `.webp` files — page illustrations and hero imagery.
- `logos/`, `fonts/`, `docs/` — static assets.

Typography is self-hosted via Google Fonts (`Funnel Sans` / `Funnel Display` / `IBM Plex Mono`), linked from each page's `<head>`.

## Notes

- The homepage hero (`index.html`) has a custom hover-reveal pixel effect (inline script in the page) that's independent from the shared `PixelField` component used on other pages' heroes — don't confuse the two when editing.
- Two files have literal `?` characters in their names (`contact/index.html?team=epic.html`, `contact/index.html?team=technical-foundations.html`), left over from however this export was originally saved. Harmless, but worth knowing before scripting over the directory.
