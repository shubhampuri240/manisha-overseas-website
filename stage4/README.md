# Stage 4 — FREE ZeroGPU AI Virtual Try-On (internal evaluation)

**Implementation on `staging` only. Existing `main`, `dress-studio.html`, and commercial catalogue pages were not modified.**

## Delivered

- `/stage4-free-tryon.html` — separate, unlinked, noindex evaluation page with 7 original catalogue styles and a strictly validated Hugging Face iframe launcher.
- `/stage4/huggingface-space/app.py` — Gradio app that receives a consenting adult's test photo in their Hugging Face Space, fetches a selected public garment from the staging branch, and runs FASHN VTON v1.5 on ZeroGPU.
- `/stage4/huggingface-space/requirements.txt` — Python runtime dependencies.
- `/stage4/huggingface-space/README.md` — Hugging Face Space YAML metadata and full deployment/precaution guide.

## 1. Commercial license HOLD

The original model and repo are Apache-2.0, **but** `fashn-human-parser` loads a SegFormer-based model inherited from NVIDIA's **non-commercial research/evaluation-only** license, Section 3.3. As a result **do not enable this pipeline as a commercial website feature** without adequate written permission or a verified replacement for the incompatible component.

Sources:
https://github.com/fashn-AI/fashn-vton-1.5
https://github.com/fashn-AI/fashn-human-parser
https://github.com/NVlabs/SegFormer/blob/master/LICENSE

## 2. Hosting eligibility

The Hugging Face ZeroGPU program permits free hosting of **two** ZeroGPU Spaces for eligible personal accounts older than 30 days with verified email and good standing. This is *not* unlimited GPU time: the basic daily quota is limited, and public Spaces can be discovered and used by anyone.

https://huggingface.co/docs/hub/spaces-zerogpu

## 3. Test the free route

1. Get a Hugging Face account and check ZeroGPU eligibility.
2. Create a Gradio Space named `manisha-tryon-lab` with ZeroGPU hardware.
3. Copy all **three** files from `stage4/huggingface-space/` to the **root** of the Hugging Face Space repository. Never upload any customer photograph as a repository file.
4. Check its build logs. The model needs downloading and a real ZeroGPU allocation. This integration is **not yet GPU-tested**.
5. Visit the GitHub Pages staging page `stage4-free-tryon.html`; paste your Space URL and confirm the evaluation-only disclosure.
6. Choose style 4638 (or another of the seven presets) in the embedded Gradio Space and test using only an adult's test photograph with permission.

**Do not add this page to the public site navigation or open public customer trials before licensing and privacy work is complete.**

## 4. Data handling

The static Manisha Overseas page does not accept person uploads. The Gradio app handles inputs directly on Hugging Face, where uploaded and output files are **temporarily cached**; cleanup scheduling is not instant deletion or guaranteed private storage. The Space is public to allow embedding, so its API is also internet-accessible. Avoid actual customer data and sensitive pictures.

Future production deployment would need commercial authorization, private processing with enforceable retention, controls against abuse, and tested infrastructure. No third-party API key is stored in GitHub. 
