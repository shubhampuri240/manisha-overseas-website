# Manisha Overseas · Stage 4 — Virtual Try-On Website Connection

**Current status (2026-11-16): Research-preview integration committed to `staging`, NOT production AI inference.** The `main` branch was not touched.

## What is connected on staging
- `/dress-studio.html`: a clearly labelled Stage 4 research-preview link near the bottom of the existing photo studio.
- `/virtual-try-on.html`: new premium, mobile-friendly research page that presents all seven original style photographs (4638, 6821, 3476, 7284, 1509, 2941, 9152) without changing their source pixels.
- `/assets/virtual-try-on-stage4.css` and `/assets/virtual-try-on-stage4.js`: local-only garment selector; link to one-click research Colab notebook; locally generated PNG/JPG/WebP result loader and clear button. Photo results remain in the browser via an object URL; they are never posted to the website, stored in the browser, or uploaded to GitHub.
- `/stage4/Manisha_Overseas_One_Click_TryOn_Colab.ipynb`: the standalone Colab test notebook (female-model catalogue reference, FASHN VTON v1.5). Runs as interactive research only and may use a free T4 GPU if Colab provides one.
- `/stage4/Manisha_Overseas_Free_TryOn_Colab.ipynb`: prior multi-section notebook, retained.

## How to test the connected workflow
1. Open `https://shubhampuri240.github.io/manisha-overseas-website/dress-studio.html` (only if GitHub Pages is serving staging) and scroll to the Stage 4 card. Click **Open research preview**.
2. In `virtual-try-on.html`, choose a style and inspect its original garment photograph.
3. Select **Open free AI research notebook**. In Google Colab, connect a free GPU and start the single code cell. **The notebook defaults to Style 4638.** To test a different selection, change `STYLE_CODE` there; the website choice does **not** automatically configure Colab.
4. After image generation, export the result PNG locally from Colab (the notebook's last lines explain optional download).
5. Back on the website, select **Load an AI result from your computer**. The image is displayed as a browser-only local comparison; it is not uploaded to our website.
6. Select **Clear local result** to hide it, and disconnect/delete the temporary Colab runtime when finished.

## What is NOT connected
- This page **does not execute the model, generate AI results, or accept customer-photo uploads**. GitHub Pages is static and cannot host the GPU-based model.
- The Colab runtime **is not a website backend**. Google disallows managed runtimes running unrelated public web services and free runtimes are transient. Do not tunnel or proxy this notebook into a customer-facing live service.
- Production deployment would need an authorized commercial inference provider or GPU backend with authentication, rate limits, capped spending, clear consent, secure media processing, retention/deletion policy, abuse prevention, and monitoring.
- The upstream FASHN VTON v1.5 model/code is Apache 2.0, but the standard `fashn-human-parser` dependency inherits NVIDIA SegFormer **non-commercial research/evaluation** restrictions. Commercial use is on hold until written clearance or a tested licensed replacement. Check rights to AI-edit existing catalogue models as well.

## Older unsupported hosting experiment
`/stage4-free-tryon.html` and `/stage4/huggingface-space/` are retained as earlier research-only ZeroGPU prototypes; no Hugging Face service has been confirmed running and they are not linked from the new UI. The user observed a paid requirement on the Space creation screen, so do not claim free Space deployment is immediately available to that account.

## References
- [Google Colab FAQ (restricted web services; free limits)](https://research.google.com/colaboratory/faq.html)
- [FASHN VTON v1.5 repository and third-party licensing](https://github.com/fashn-AI/fashn-vton-1.5)
- [FASHN Human Parser repository](https://github.com/fashn-AI/fashn-human-parser)
- [NVIDIA SegFormer source license](https://github.com/NVlabs/SegFormer/blob/master/LICENSE)

**No public customer photos or commercial AI inference should be used with this research preview.**
