# Rajwadi Kangan — Luxury Jewellery Landing Page

A cinematic, single-page landing site for **Rajwadi Kangan** (premium artificial
jewellery — antique Rajwadi bangles, bridal bangles, wholesale & reseller).
Dark velvet glassmorphism, 3D floating pearls, liquid "meena" blobs, and a
signature *jharokha* (Rajasthani palace-window) arch used as the recurring
card shape. Pure HTML/CSS/JS — no build step, no framework — ready to publish
on GitHub Pages as-is.

---

## 1. Quick start

**Preview locally**
```bash
# any static server works — for example:
npx serve .
# or
python3 -m http.server 8080
```
Then open `http://localhost:8080`.

Opening `index.html` directly by double-clicking also works, but a local
server is recommended so `fetch`/module behaviour matches production.

**Deploy to GitHub Pages**
1. Push this folder to a GitHub repository (root of the repo, or a `/docs` folder).
2. Repo → **Settings → Pages** → set **Source** to the branch/folder you used.
3. Your site will be live at `https://<username>.github.io/<repo>/`.
4. Update the `og:url`, `og:image`, `twitter:image` and `canonical` URLs in
   `index.html` (and the JSON-LD `url`) to your real GitHub Pages address.

No environment variables, no npm install — everything (GSAP, ScrollTrigger,
Lenis, Three.js) loads from CDN via `<script>` tags in `index.html`.

---

## 2. File structure

```
rajwadi-kangan/
├── index.html              # single-page markup, SEO meta, JSON-LD, script includes
├── style.css                # design tokens, typography, layout, components
├── animations.css           # all @keyframes + motion utility classes
├── responsive.css           # mobile-first breakpoints
├── script.js                 # loader, footer year, card-tilt, WhatsApp helper actions
├── particles.js              # Three.js floating "moti" (pearl) background
├── cursor.js                  # magnetic buttons + click ripple (no custom cursor)
├── scroll.js                  # Lenis + GSAP ScrollTrigger reveals/parallax/nav/progress bar
├── gallery.js                 # masonry gallery lightbox
├── form.js                    # reseller form → Google Apps Script → WhatsApp redirect
├── favicon-16.png / favicon-32.png / favicon-48.png / apple-touch-icon.png
├── assets/
│   ├── images/               # kangan-*.svg (product art) + logo-crest*.png / logo-full.png(.webp) — real brand logo, background removed
│   ├── icons/                 # hand-drawn line/glyph icon set (SVG, currentColor)
│   └── pdf/                   # rajwadi-kangan-catalogue.pdf (placeholder catalogue)
├── google-apps-script/
│   ├── Code.gs                # the backend that saves form entries to your Google Sheet
│   └── README.md               # step-by-step deployment guide + troubleshooting
└── README.md
```

---

## 3. Replacing the placeholder imagery (important)

The **hero showcase, nav mark, footer mark and favicon now use your real
brand logo** (`assets/images/logo-full.png`/`.webp` and `logo-crest*.png`),
cut out from the artwork you supplied. Nothing to do there.

The **Royal Collection, Best Sellers and gallery sections still use
original SVG "kangan" illustrations** (in `assets/images/`) instead of
stock photography, since real per-product photos weren't available to
include. They're drawn in the brand palette and used throughout so the
site is genuinely usable out of the box — but for a live store you'll want
to swap them for real photography of each piece.

1. Shoot or export product photos on a **dark maroon/plum background**
   (matches `--bg` / `--maroon-dark`) so they blend into the page.
2. Replace the `src` on each `<img>` in `index.html` — the `.jharokha-frame`
   and `.masonry__item` containers use `object-fit: contain`, so square or
   near-square images (min. ~1000×1000px) work best.
3. Update the `og:image` / `twitter:image` meta tags to a real **JPG/PNG**
   (social platforms render SVG `og:image` inconsistently).
4. Replace `assets/pdf/rajwadi-kangan-catalogue.pdf` with your real,
   photographed catalogue — the placeholder only contains the same text
   copy as the page itself (see it as a cover + price list you can rebuild
   in Canva/InDesign/reportlab with real photos dropped in).

## 4. Content you should personalise

- **Prices & product names** — `index.html`, sections `#royal-collection` and `#best-sellers`.
- **Contact details** — WhatsApp number, email, Instagram and Facebook links
  appear in the nav, hero, catalogue CTA, reseller form target, contact
  section and footer. Search for `918828888129` and `amirunhub@gmail.com`
  to find every instance.
- **Reseller form destination** — `form.js` posts to a Google Apps Script
  Web App (saves a row to a Google Sheet), then opens a pre-filled
  `https://wa.me/918828888129?text=...` message. See §8 below for how to
  point this at your own Apps Script deployment.

---

## 5. How the key effects work

| Effect | File | Notes |
|---|---|---|
| Floating pearls (moti) | `particles.js` | Three.js scene, one unified pearl material (soft lavender-grey nacre + gold rim light), mouse + scroll reactive, respects `prefers-reduced-motion`. |
| Liquid Meena blobs | `animations.css` + `scroll.js` | CSS `border-radius` keyframe morphing (wine maroon + emerald) for the organic shape; JS adds a mouse/scroll parallax offset on a wrapping element so the two transforms don't fight. |
| Smooth scroll | `scroll.js` | [Lenis](https://github.com/darkroomengineering/lenis) synced to the GSAP ticker; falls back to native scroll if either library fails to load. |
| Scroll reveals / parallax | `scroll.js` | GSAP ScrollTrigger on any `[data-reveal]` / `[data-parallax]` element — add those attributes to new sections to opt them in automatically. |
| Jharokha arch cards | `style.css` (`.jharokha-frame`) | The site's signature shape: an elliptical "dome" top with a gold finial, echoing a Rajasthani palace window. |
| Magnetic buttons + ripple | `cursor.js` | Any element with class `.magnetic` gets the pull-toward-cursor effect and a click ripple. (The custom trailing cursor itself was removed per feedback — this file now only owns these two effects.) |
| Card tilt | `script.js` | Any element with `[data-tilt]` gets a subtle perspective tilt following the cursor. |
| Masonry gallery + lightbox | `style.css` (CSS multi-column) + `gallery.js` | Keyboard accessible (arrow keys, Esc), focus is returned to the trigger on close. |
| Reseller form | `form.js` | Inline validation, honeypot spam trap, POSTs to Google Apps Script (→ Google Sheet), then redirects to WhatsApp with a pre-filled message. |

---

## 6. Performance & accessibility notes

- All imagery is SVG (crisp at any size, tiny file size) — no raster images to lazy-load, though `loading="lazy"` is set on gallery/product `<img>` tags for future-proofing if you add photos.
- Animations respect `prefers-reduced-motion: reduce` (blobs, pearls, Lenis and the reveal system all fall back to static/instant states).
- Tilt, magnetic-button and ripple effects are automatically skipped on touch devices.
- Every section is keyboard reachable; the lightbox traps focus sensibly and restores it on close; a skip-link is included for screen-reader/keyboard users.
- Vendor scripts (Three.js, GSAP, ScrollTrigger, Lenis) load from cdnjs/unpkg; for a stricter offline/self-hosted build, download them into a `vendor/` folder and update the `<script src>` paths in `index.html`.

---

## 7. Browser support

Modern evergreen browsers (Chrome, Edge, Safari, Firefox — last 2 versions).
`backdrop-filter` (glassmorphism blur) has broad support but is progressively
enhanced — the page remains fully readable without it.

---

## 8. Revision log — client feedback round 2

- **Favicon & logo** — replaced the generic "RK" monogram with the real
  brand mark (the twin-peacock jewellery crest). The black background was
  removed programmatically (chroma-key + despeckle) to produce a clean
  transparent PNG. Generated sizes: `favicon-16.png`, `favicon-32.png`,
  `favicon-48.png`, `apple-touch-icon.png` (all in the project root), plus
  `assets/images/logo-crest.png` / `logo-crest-512.png` (square crest, used
  in the nav/footer and as the Open Graph/Twitter/JSON-LD image) and
  `assets/images/logo-full.png` / `logo-full.webp` (the full tall artwork
  with hanging pearls, used as the hero showcase image).
- **Custom cursor removed** — the trailing circle + dot felt distracting on
  desktop, so it's gone. `cursor.js` now only handles the magnetic-button
  pull and the click ripple (both skip touch devices automatically).
- **Pearls simplified to one style** — `particles.js` now renders a single
  unified "moti" material (soft lavender-grey nacre with a warm gold rim
  light), matching the reference pearl photo, instead of mixed white/gold/
  glass pearls.
- **Liquid Meena blobs toned down** — reduced to two colours (deep wine
  maroon + emerald, echoing the reference splash images) with a slower,
  smaller-range morph so the effect reads as ambient rather than busy.
- **Reseller form → Google Sheet + WhatsApp** — `form.js` now POSTs the
  submission as JSON to a Google Apps Script Web App (which appends a row
  to a Google Sheet), then opens WhatsApp with a pre-filled message
  regardless of whether the Sheet write succeeded, so an enquiry is never
  lost to a backend hiccup. Field set matches the Apps Script payload
  exactly: `fullName`, `brandName`, `storeName`, `whatsapp`, `website`
  (optional), `socialMedia` (optional).

  **To point this at your own Apps Script:** a ready-to-deploy, more
  resilient version of the script (auto-creates the sheet/header row,
  validates required fields, responds to GET for a health check) is
  included in [`google-apps-script/Code.gs`](google-apps-script/Code.gs) —
  see [`google-apps-script/README.md`](google-apps-script/README.md) for
  the full deploy walkthrough. Once deployed, paste your `/exec` URL into
  the `GAS_ENDPOINT` constant near the top of `form.js`.

---

Built for **Rajwadi Kangan** · Luxury Artificial Jewellery · Rajasthan, India.
