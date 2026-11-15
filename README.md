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

## The Dress Photo Studio

`dress-studio.html` opens directly with the supplied model photographs. The main stage preserves the actual garment print, cut and drape. It offers full-length front/back/detail photographs, crossfade transitions, zoom, pan, swipe navigation, an optional photo-view slideshow, saved references, original-image exports and photo-specific enquiries.

Two photographs are not presented as a continuous 360-degree model. Close-up enlarges the selected image. Colour, material, lighting and simulated cloth controls are hidden in photo mode, and concept settings are omitted from photo enquiries.

The existing procedural 3D design study remains an explicit secondary option. Its local rendering runtime loads only if the visitor selects that mode. The form is a visual concept, not a measured digital twin of the photographed garment. Original photographs load without requiring WebGL.

The primary page uses `studio-loader.js`, `studio-configurator.js`, `studio-configurator.css` and `studio-photo.css`; the optional design study adds `assets/vendor/three-0.152.2.min.js` and `dress-model.js`. The older virtual try-on assets remain inactive on GitHub Pages.
