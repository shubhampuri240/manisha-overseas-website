# Manisha Overseas website — Expanded editorial edition

This is a static multi-page website built around the approved premium editorial design.

## Open locally
Extract the ZIP, then open `index.html` in Chrome or Edge. Keep internet on for web fonts and the Three.js runtime.

## Site map
- `index.html` — homepage
- `dress-studio.html` — interactive revolving 3D dress concept
- `about.html` — about the manufacturer
- `collections/index.html` — collection directory
- `collections/*.html` — seven collection pages
- `products/*.html` — 21 style and development enquiry pages
- `fabrics-craftsmanship.html` — fabric and detail stories
- `buyer-process.html` — wholesale buyer process
- `manufacturing.html`, `private-label.html`, `wholesale.html`, `quality.html`, `contact.html`
- `pages.html` — complete site directory

## Photography and publication
The homepage, latest photo edit, collections and company pages use the supplied website-approved Drive photographs. Product titles, style references and alt text follow the approved image manifest; categories without matching photos show development enquiry cards. See IMAGE-SOURCES.md.

GitHub Pages publishes the `staging` branch. Keep existing studio and company features on that branch when updating. The hosted catalogue is at https://shubhampuri240.github.io/manisha-overseas-website/.

On GitHub Pages, the enquiry form opens the buyer's email app with the selected photo/style reference and enquiry details. No enquiry is sent until the buyer sends it in their email app. On PHP hosting, the existing enquiry handler still requires configuration and testing.

## 3D Dress Studio reference update
The 3D Dress Studio now features a white square-neck eyelet midi dress inspired by the reference image supplied by the user. It includes a front product reference image, a new high-resolution generated product-style visual, a procedural rotating Three.js model, pause/reset, drag-to-rotate, scroll-to-zoom and fabric tone previews. See `DRESS-STUDIO-REFERENCE-NOTES.md` for source and usage notes.
