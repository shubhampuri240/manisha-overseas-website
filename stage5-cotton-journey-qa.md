# Cotton → Showroom scroll story — implementation notes

**Branch:** `staging` only. **Do not merge to `main` until separately approved.**

## Location
- Home page: `index.html`
- Self-contained styles: `assets/cotton-journey.css`
- Scroll progress / reveal behavior: `assets/cotton-journey.js`
- Section link: `#cotton-to-showroom`
- Existing contact CTA: `contact.html`

## Story
The hero includes a quick decorative cotton-to-yarn drawing and a **Follow the thread** anchor. The six-chapter timeline then illustrates:
1. Cotton fibres gathering into yarn
2. Spinning/weaving (animated spool, shuttle, woven strands)
3. Colour and cutting (fabric-handling photo with illustrative dye swatch and scissors)
4. Factory workroom and a finished garment reveal (actual workroom and catalogue photographs)
5. International dispatch (illustrated ship and route)
6. Buyer showroom presentation (actual garment catalogue image in a conceptual display frame), ending with the existing wholesale enquiry link

The section is intentionally a **material-to-market illustration**, not a claim that the Noida factory performs cotton farming, spinning, fabric weaving, dyeing, or logistics operations on-site. The page includes this disclosure and uses genuine existing Manisha images for workroom/garments.

## Animation and accessibility
- No React, GSAP, added fonts, third-party APIs, video or new image compression
- Lightweight CSS transform/opacity changes with `IntersectionObserver`
- `requestAnimationFrame`-throttled SVG stroke on passive scroll
- No scroll snapping, hijacking, fixed intro overlay or forced delays
- Feature degrades to readable static content with JavaScript disabled or `prefers-reduced-motion: reduce`
- All SVG illustrations are decorative (`aria-hidden`), each chapter has a visible heading; anchor and CTA are keyboard-focusable
- Mobile breakpoints at 760px and 430px move the path to the left side and stack chapter cards
- Existing home hero, photo edit, atelier, collection grid, manufacturing, Schiffli, studio teaser, client/global reach sections and footer are preserved

## Completed static checks
- New JavaScript parsed successfully
- CSS braces balanced
- New HTML chapter section nesting validated (including SVG elements)
- 6 chapter IDs and labels verified, with no duplicates
- New original image paths resolved on the GitHub staging branch
- All existing homepage sections remain
- New `href="contact.html"` CTA exists; existing enquiry page is unchanged
- `main/index.html` verified to contain no new cotton journey

## Live browser QA still required
The published GitHub Pages domain could not be reached from this editing environment. Actual browser screenshots or interaction tests at desktop and mobile widths (including 375, 768, 1280 px) were **not** run. Check:
- Desktop: story thread visually connects alternating cards; factory and catalogue photos are crisp
- Mobile: no horizontal overflow, readable cards, usable nav and anchor
- Keyboard: skip link, hero anchor and quote CTA accessible
- Reduced motion: no animated path, no moving cotton, all content visible
- Contact: CTA opens the existing enquiry page

Production deployment status has not been independently verified. The changed files exist and passed static checks on `staging`.
