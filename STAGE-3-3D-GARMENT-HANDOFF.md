# Manisha Overseas — Stage 3 garment model handoff

**Last reviewed:** 19 November 2026  
**Working branch:** `staging` — never deploy this branch to the live production domain without approval.

## Verified inventory

- **Actual catalogue photos:** 7 styles in `assets/visuals/`, including front/back or full/detail photographs. These are 2D images.
- **Original interactive procedural 3D:** `assets/dress-model.js` generates seven simplified, editable 3D mesh silhouettes on demand using Three.js. These are real 3D browser meshes, **not accurate scans of the manufactured designs**.
- **2D renderer fallback:** If WebGL cannot initialize, the page can show a labelled illustration. It does not rotate a real model.
- **Verified production-model files:** None discovered in the audited repo or matched Google Drive filename searches for GLB, GLTF, FBX, OBJ, BLEND, USDZ, or ZPRJ.
- Full per-style asset paths: `assets/manisha-3d-inventory.json`.

## What already works in the staging code

Open the staged site at `dress-studio.html?mode=3d` (also now the default mode), and select a style. In 3D mode the browser's WebGL engine provides drag-to-rotate, eight optional *concept* colours, front/back/detail/orbit presets, zoom, pause/play and 30° turn buttons. A **From garment photo** mode now samples visibly cloth-rich regions from existing front/back product photographs onto the mesh; this improves connection to the specific prints without reconstructing a fully accurate garment. For Style 9152 there is no full back photo; only a detail, so the texture study reuses its supplied full view. The on-page note distinguishes this study from the original product photograph; colour is not a verified product colourway.

## Broader collection integration

Existing collection cards, the seven-style showcase and dress product detail pages can now open a **photo-inspired 3D preview** using a first-party supplied image. This does not create a garment-specific shape for designs outside the seven rough Kasturi profiles, and is always explicitly labelled as approximate. Shirts and other non-dress items stay in photo mode rather than pretending to be 3D dresses.

No outside Red Rose images have been uploaded. See `RED-ROSE-RUSSIA-PHOTO-SOURCE-RESEARCH.md` for candidate accounts and rights requirements.

## Creating an exact Manisha Overseas 3D garment

**Preferred creation route:** Use the actual garment pattern/tech pack plus fabric and trim details in CLO3D or Marvelous Designer; review a physical sample; export to a clean web-ready GLB through the supported exporter / Blender. A modeller may also build a model manually, but must validate front, back, side, shoulder, neckline, tier widths, print placement, embroidery and fit against physical samples.

For each style provide:
1. Approved style code and ownership/usage rights.
2. Front/back/side high-resolution photographs and close-up print/embroidery photos.
3. Pattern pieces or tech pack with measurements and fabric type.
4. Approved product colourways and exact textile-print references.
5. Preferably one `style-<code>.glb` with embedded textures. Maintain original CLO/Blender source files privately if available.
6. A written check that the model matches the physical sample; label any missing details as illustrative.

Suggested target for web performance: sensible mesh density, power-of-two compressed textures when available, no unnecessary hidden meshes, and test on current phones as well as desktop. File size targets are performance goals, not evidence of quality.

## Real-model ingestion is a separate integration step

The existing controller creates geometry in code. Dropping a `.glb` into the repo **will not automatically replace** that geometry. When an approved GLB arrives, implement a GLTFLoader/model-viewer import route, map each style code to its verified model, handle authored material variants if present, provide clear error handling, and preserve the current honest procedural fallback. Colour changes to photoreal print textures require approved replacement textures; a solid tint is not an exact colourway.

Do **not** treat a Google image, a front/back photo pair, an unlicensed third-party dress model or a generic procedural shape as an approved digital twin. Obtain commercial rights and document attribution where required.

## Verification checklist

- [x] Staging branch contains model engine with `turnBy(degrees)` and concept colour API.
- [x] 3D panel integrated into the staging dress-studio HTML.
- [x] All 7 referenced photo assets exist in staging.
- [x] Source-photo-derived textile sampling wired into the mesh for seven base styles and approved first-party collection dress photos.
- [x] Dress collection cards and product pages linked to 3D study; other garment types remain photo-led.
- [x] New and existing JavaScript parse successfully.
- [ ] Browser click-through and mobile WebGL test on a deployed staging preview.
- [ ] Real garment-specific GLB approved against a sample.
- [ ] Real-model import path and material variants tested.
- [ ] Production publishing — explicitly **not** done.
