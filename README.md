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

## The 360° Dress Studio (staging)

The Dress Studio now defaults to an interactive **rotating Three.js 3D study**. It uses existing Manisha garment photographs to sample approximate textile texture on a rotatable mesh; this is a **photo-inspired reconstruction**, not an accurate CAD model or a multi-angle scan of the actual garment. The seven Kasturi styles have defined rough silhouettes; dress-like pieces from other collection and product cards can also launch in the viewer with their own supplied photographic textile reference, but the generic mesh shape is not garment-specific.

- Drag a 3D garment to rotate, use ±30° turn buttons, auto-rotate, front/back/detail presets, and zoom.
- Select **From garment photo** to apply the experimental image-based textile sample, or choose a conceptual colour/pattern.
- The original photo mode is still available and remains the source of truth for print placement, colour, detailing and the manufactured item.
- Directly link to a specific style: `dress-studio.html?style=4638&mode=3d`.
- Collection image deep links use `mode=3d` for dress-like products and `mode=photo` for other garments to avoid showing a generic dress model for a shirt or trouser.
- On devices without WebGL, a clearly labelled 2D illustrated fallback appears.
- Real fitted 3D models (GLB/GLTF) and production-verified colourways are **not yet available**. This site does not currently support exact simulated fit on a person's photo.

Technical files: `assets/dress-model.js`, `assets/studio-configurator.js`, `assets/studio-loader.js`, `assets/stage3-controls.js`, their stylesheets, and `assets/manisha-3d-inventory.json`.

The optional Try-On service requires a secure separate backend and is not active on GitHub Pages. See `STAGE-3-3D-GARMENT-HANDOFF.md` and `RED-ROSE-RUSSIA-PHOTO-SOURCE-RESEARCH.md` for model commissioning and photography sourcing. **Interactive device/browser QA is still pending**; syntax and file integrity checks alone do not certify finished visual quality.
