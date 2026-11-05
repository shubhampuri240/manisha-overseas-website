# One-time GitHub import

This website is maintained in the private GitHub repository `shubhampuri240/manisha-overseas-website`.

## Upload the website files

1. Download and extract the `Manisha-Overseas-GitHub-Import.zip` package.
2. Open the extracted `Manisha-Overseas-Website` folder.
3. Open the GitHub repository in your browser.
4. Select **Add file → Upload files**.
5. Drag the *contents* of the extracted folder into the upload area, including `assets`, `collections`, `products`, `storage`, and all root files. Do not upload only the outer folder as a ZIP.
6. GitHub already has a README and `.gitignore`; keep those files or choose to replace README with this package's full README.
7. Commit the upload to `main` with message `Add approved Manisha Overseas website source`.

The upload is a one-time import. After the website files are in the repository, future revisions can be made against the existing files and committed as updates. Keep `main` as the approved version and use a separate branch for bigger changes.

## Security

Do not commit live buyer enquiries, private data, passwords, or API keys. The `/storage/` directory is for runtime data only. Do not upload files such as `enquiries.jsonl` or `rate.json`.

## Preview

Open `index.html` locally in Chrome or Edge. Keep internet access on for Google Fonts and the Three.js CDN. The 3D Dress Studio is `dress-studio.html`.

## Deployment

This package has not been deployed to Hostinger. Preserve existing email DNS records when the domain is connected.
