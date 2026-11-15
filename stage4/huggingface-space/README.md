---
title: Manisha Overseas Internal Try-On Lab
emoji: 👗
colorFrom: green
colorTo: gray
sdk: gradio
sdk_version: 6.3.0
python_version: 3.10.13
app_file: app.py
license: other
short_description: Internal non-commercial evaluation of FASHN VTON v1.5
---

# Manisha Overseas — ZeroGPU internal evaluation

**Not cleared for commercial deployment.** The base FASHN VTON v1.5 model/code use Apache-2.0, but the upstream pipeline depends on FASHN Human Parser, which inherits the NVIDIA SegFormer Source Code License restricting use to non-commercial research/evaluation. `segmentation_free=True` does **not** remove that dependency from the standard codebase. Obtain written commercial clearance for the dependency and underlying weights or replace it with a legally compatible, tested alternative before enabling customer-facing try-on. This integration is for controlled internal evaluation only.

## Deploy in a Hugging Face Space (when eligible)

1. Create a Hugging Face account at https://huggingface.co/join and verify your email. As of Nov 2026, free personal accounts must be older than 30 days and in good standing to host up to two ZeroGPU Spaces. If you cannot select ZeroGPU, do not choose a paid GPU unintentionally.
2. Open https://huggingface.co/new-space , create `manisha-tryon-lab`, and choose **Gradio** and **ZeroGPU** hardware. A Space must be public to be embedded on a public website; private Spaces cannot be embedded for anonymous visitors. **A public Space is accessible to anyone**, regardless of this web page's internal-only label.
3. From this GitHub folder, copy **app.py**, **requirements.txt**, and **README.md** into the **root** of your separate Hugging Face Space repository (the README YAML metadata must stay at the top). Set the Space to ZeroGPU in Settings.
4. Wait for the Space to finish building. It downloads about 2 GB of model weights plus additional pose/parser weights. Resolve any build errors from Space logs; a successful deployment and actual GPU generation have **not** been verified from ChatGPT.
5. Use the Space for **non-commercial internal evaluation only**, using test photos of consenting adults. Images are served by Hugging Face and temporarily cached by Gradio. Do not use confidential, sensitive, or customer photos at this stage.
6. On the Manisha Overseas **staging** site, open `stage4-free-tryon.html`, enter your Space URL (example `https://huggingface.co/spaces/YOURNAME/manisha-tryon-lab`), confirm evaluation-only status, and open the embedded Space. Select the same garment inside the Space's dropdown and generate an evaluation preview.

## What is hosted where?

- GitHub Pages serves a static, unlinked evaluation page and original catalogue photographs, not person uploads.
- The user's personal Hugging Face Space serves a Gradio upload UI and runs the FASHN VTON v1.5 inference pipeline on ZeroGPU.
- There is **no FASHN commercial API key**, Cloudflare account, or PHP backend required for this research-only iframe path.
- The Space accesses seven Manisha Overseas public catalogue images from the **staging** branch. These are still photos; 3D rotation is a separate feature.
- The output is AI-generated and is **not** a faithful representation of actual garment size/fit or exact print details.

## Privacy and limitations

- Gradio caches uploaded inputs and generated outputs on the Space. This prototype asks Gradio to clean its cache roughly every 15 minutes after files become old enough, but Gradio/Hugging Face infrastructure may handle data in additional ways. Do **not** promise instant deletion, exclusive/private access to output file URLs, or complete erasure.
- Do not enable examples caching, public photo galleries, analytics services, uploads to GitHub, or request logging that captures photos.
- Public Spaces expose the running application and its API to the internet; the unlinked staging page and consent checkbox **are not access control**. A genuine privacy-safe, abuse-resistant production release requires a server-side gateway, enforceable request limits, privacy/legal review, and either licensed compute or verified licensing for all model components.
- Gradio may expose temporary file URLs. Avoid sensitive images, and test retention, access controls and deletion in a sandbox before inviting users.
- Hugging Face ZeroGPU quotas, queue times, and free-hosting eligibility can change. Free-tier visitors also have limited GPU minutes. Expect throttling on public traffic.
- Model-generated results may change tattoos/body shape, necklines, hemlines, colours and prints. Never advertise accurate fitting.

## Licensing review sources (2026-11-15)

- Core model and code: https://github.com/fashn-AI/fashn-vton-1.5 (Apache 2.0)
- Dependency: https://github.com/fashn-AI/fashn-human-parser (NVIDIA SegFormer derivative)
- Underlying source license: https://github.com/NVlabs/SegFormer/blob/master/LICENSE (Section 3.3: non-commercial research/evaluation restriction)
- ZeroGPU: https://huggingface.co/docs/hub/spaces-zerogpu
- Gradio cache retention: https://www.gradio.app/guides/resource-cleanup

This file and `app.py` are a testing adapter and do not represent third-party legal approval or a guarantee of free, reliable GPU availability.
