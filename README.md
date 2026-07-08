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
├── index.html              # single-page markup, SEO meta, JSON-LD (store + 8 products + FAQ), script includes
├── style.css                # design tokens, typography, layout, components
├── animations.css           # all @keyframes + motion utility classes
├── responsive.css           # mobile-first breakpoints
├── script.js                 # loader, footer year, card-tilt, WhatsApp helper actions
├── particles.js              # Three.js floating "moti" (pearl) background (InstancedMesh)
├── cursor.js                  # magnetic buttons + click ripple (no custom cursor)
├── scroll.js                  # Lenis + GSAP ScrollTrigger reveals/parallax/nav/progress bar
├── gallery.js                 # masonry gallery lightbox
├── form.js                    # reseller form → Google Apps Script → WhatsApp redirect
├── robots.txt / sitemap.xml / llms.txt   # SEO + AI-crawler discoverability
├── favicon.svg / favicon.ico / favicon-96x96.png / apple-touch-icon.png
├── web-app-manifest-192x192.png / web-app-manifest-512x512.png / site.webmanifest
│     ↑ all supplied by the client — not generated; see §9
├── assets/
│   ├── images/               # kangan-*.svg (product art) + logo-crest*.png (nav/footer mark) + hero-peacock.jpg (hero banner)
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

## 9. Revision log — client feedback round 3

- **Favicon replaced with the client's own package** — per instruction, no
  new favicon was generated. `favicon.svg`, `favicon.ico`, `favicon-96x96.png`,
  `apple-touch-icon.png`, `web-app-manifest-192x192.png`,
  `web-app-manifest-512x512.png` and `site.webmanifest` were copied in as
  supplied and wired up in `index.html`'s `<head>`. Only the manifest's
  text fields (`name`/`short_name`/`theme_color`/`background_color`) were
  edited to match the brand — the icon images themselves are untouched.
  **Note:** the supplied icons render mostly as flat colour at small sizes
  when inspected programmatically (not the ornate peacock crest) — worth a
  quick look in a live browser tab to confirm it's the intended file.
  Also, `favicon.svg` is ~6MB, which is unusually large for a favicon and
  will add real load weight; consider running it through an SVG minifier
  if that matters for your Lighthouse score.
- **Hero now features the peacock crest banner** — the hero showcase
  uses the high-resolution peacock crest logo/artwork as requested,
  providing a professional and branded entry point.
- **Decorative ring removed** — the spinning circle behind the hero image
  is gone, replaced with a soft, static spotlight glow behind the photo.
- **Royal Collection & Best Sellers now show 4 products each**, one row
  on desktop, stepping down through 3 → 2 → 1 columns as the viewport
  narrows (`card-grid--4` in `style.css` / `responsive.css`). Two new
  on-palette pieces were added — **Purple Frost Kangan** (₹5,499) and
  **Royal Jade Meena Kada** (₹3,999) — using the same generated-SVG
  illustration approach as the rest of the catalogue.
- **3D pearls: smoother + faster** — `particles.js` was rewritten to draw
  every pearl as a single `THREE.InstancedMesh` (one draw call instead of
  ~28), added a Page Visibility pause so it stops rendering in a
  background tab, and capped the pixel ratio. Motion itself is unchanged
  (same gentle drift/rotation), just cheaper to render.
- **Reseller form: only Name + WhatsApp required** — Brand Name, Store
  Name, Website and Social Media are all optional now, in the HTML, in
  `form.js`'s validation, and in `google-apps-script/Code.gs`'s
  server-side validation (all three were updated together so a submission
  that passes client-side validation can't get rejected server-side).
- **Google Sheet endpoint updated** — `GAS_ENDPOINT` in `form.js` now
  points at the new Web App URL supplied.
- **SEO / AI-discoverability pass**:
  - `robots.txt` and `sitemap.xml` added at the project root.
  - `llms.txt` added — a plain-text summary of the brand, products, page
    sections and policies, following the emerging `llms.txt` convention
    for AI assistants/agents that read a site before answering questions
    about it.
  - Structured data expanded from a single `JewelryStore` entry into a
    `@graph` with the store, all **8 products** as `schema.org/Product`
    (name, description, price in INR, availability), and a new
    **FAQPage** — see the next point.
  - A new **FAQ section** (`#faq`) was added with five real questions
    grounded in claims already made elsewhere on the site (wholesale
    pricing, COD, nickel-free finish, bulk bridal orders, catalogue
    access) — plain `<details>/<summary>` accordions, no extra JS, and
    matching `FAQPage` JSON-LD for rich results.
- **General polish** — tightened card padding for the denser 4-up grid,
  removed now-unused CSS (`floatY`/`spinSlow` keyframes, the old ring
  rules), added an intermediate 3-column breakpoint so the product grids
  step down more gradually on mid-size screens.

---

Built for **Rajwadi Kangan** · Luxury Artificial Jewellery · Rajasthan, India.
