# Virtual Try-On setup

The browser interface and PHP proxy are present in this repository. The feature is not active on GitHub Pages by itself because GitHub Pages only serves static files and does not execute PHP.

## What must be configured

1. Use a PHP-enabled web host for the site (or deploy `try-on-api.php` to a separate PHP endpoint and update the fetch URL in `assets/studio-enhancements.js`).
2. Create a FASHN Developer API account at https://app.fashn.ai and purchase API credits. The current Try-On v1.6 endpoint costs one credit for one generated image.
3. Add the API key to the PHP server as an environment variable named `FASHN_API_KEY`. Do not add it to JavaScript, HTML, GitHub or the public website.
4. Ensure PHP cURL and Fileinfo extensions are enabled and PHP uploads allow a 10 MB image.
5. Test the full path: select a garment from the website, open it in 3D Studio, upload a consenting adult's photo and run the try-on.

## Security and privacy behaviour

- The browser sends the person's image only after the user clicks the try-on button and checks the consent box.
- The PHP proxy reads the uploaded file from PHP's temporary upload area. It does not write the person's photo to this repository or a public gallery.
- The key stays server-side. The browser never receives it.
- The proxy uses FASHN Virtual Try-On v1.6 with base64 input/output. FASHN says base64 input processing copies are deleted when processing finishes, with a one-day automatic cleanup backstop. Request metadata is retained, but the image itself is represented as a base64 placeholder in the request record. Base64 outputs are available for 60 minutes.
- Try-on results are visual previews, not fit, measurement, fabric or manufacturing guarantees. Use only photographs you own or have explicit permission to process.

Official docs: https://docs.fashn.ai/api-reference/tryon-v1-6 and https://docs.fashn.ai/api-overview/data-retention-privacy
