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

## The 3D Atelier

The existing `dress-studio.html` page now contains the responsive 3D Atelier: seven catalogue references, sculpted procedural garment studies, damped drag/pinch/keyboard rotation, camera presets, fabric/colour/pattern/trim controls, lighting moods and optional cloth breeze. The rendering runtime is vendored at `assets/vendor/three-0.152.2.min.js` with its MIT licence.

The studio saves and restores complete looks in local browser storage, exports PNG previews, copies or downloads a text brief, and passes the selected reference and concept options into the enquiry page. Catalogue mode shows the original front/back/detail photographs. The procedural 3D form remains a design study rather than a measured replica or fit model.

Reduced-motion settings disable automatic motion by default. Rendering pauses offscreen, in hidden tabs and while viewing photographs. Devices without WebGL receive a clearly labelled illustrated concept preview and keep access to the catalogue photographs.

The active page uses `studio-loader.js`, `dress-model.js`, `studio-configurator.js` and `studio-configurator.css`. The older `studio-enhancements.js` and try-on assets remain in the repository but are not loaded by the static GitHub Pages studio.
