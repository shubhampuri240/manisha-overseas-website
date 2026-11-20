# Manisha Overseas — Fibre-to-Thread redesign QA

**Updated:** 2026-11-20. **Branch:** `staging` only. GitHub Pages deployment branch and live mobile rendering remain unverified.

## Why this revision was made
The previous six dark-card cotton timeline was hard to see in action and appeared generic. The new section keeps the site's original white Schiffli campaign hero and replaces the timeline with a refined ivory editorial layout and a **visible cotton-to-yarn canvas animation**.

## Files used
- `index.html`: a single `#cotton-to-showroom` section directly after the classic hero, visible “Watch cotton become thread” anchor, existing photos/sections kept intact
- `assets/fibre-to-thread.css`: ivory/navy styling, mobile breakpoints, photo grids and reduced-motion fallback
- `assets/fibre-to-thread.js`: 126 moving cotton fibres converge into a visibly braided thread, loops after 10.5 seconds, replay button, pauses offscreen/when tab hidden, no external requests
- Older `assets/cotton-journey.css` and `assets/cotton-journey.js` remain in Git history/repository but are **no longer loaded** by the homepage.

## Visual composition
1. Restore the original white Schiffli campaign hero, historical headline, and original editorial photo entrance animation.
2. After hero, a wide ivory cotton-to-yarn feature with a muted graphic and warm bronze accents; no generic dark stacked cards.
3. Five short text milestones: cotton → spinning/weaving → colour/cutting → stitching/finishing → worldwide buyers.
4. Approved original factory and finished Style 4638 garment photos, with links to `manufacturing.html` and existing `contact.html`.

All imagery remains unaltered. Cotton/spinning/export imagery is presented as a conceptual material-to-market story, not a claim that all processes are performed on-site.

## Automated checks completed
- JavaScript parsed successfully with the JavaScript compiler
- Canvas mock runtime: 46 animation frames ran without throwing; replay handler verified
- CSS braces balanced
- One and only one `id="cotton-to-showroom"`
- Hero anchor to story exists
- Exactly five milestones
- Old dark-card assets no longer included in homepage
- Existing gallery, product, factory, Schiffli, Studio and enquiry sections remain
- No `main` branch files were changed

## Browser and publishing checks still required
- Real browser screenshots/layout checks at 375px / 768px / 1280px
- Validate image clarity and typography with external Google Fonts loaded or local fallbacks
- Verify `prefers-reduced-motion`, keyboard controls and high zoom
- Verify which GitHub Pages source is publishing; this editing environment did not confirm `staging` as the live publishing branch

**This is implemented code on `staging`, not a claim of a completed live production deployment.**
