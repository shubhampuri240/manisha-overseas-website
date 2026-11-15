"""Manisha Overseas internal evaluation Space for FASHN VTON v1.5.

DO NOT enable customer/public commercial use without confirming commercial rights
to all dependencies, including fashn-human-parser (NVIDIA SegFormer).
Privacy: Gradio temporarily caches uploaded/output images; see project README.
"""
from functools import lru_cache
from io import BytesIO
from pathlib import Path

import gradio as gr
import requests
import spaces
import torch
from huggingface_hub import hf_hub_download
from PIL import Image, ImageOps

WEIGHTS_DIR = Path(__file__).parent / "weights"
PHOTO_ROOT = "https://raw.githubusercontent.com/shubhampuri240/manisha-overseas-website/staging/assets/visuals/"
STYLES = {
    "4638 — Floral printed long dress": "style-4638-front.webp",
    "6821 — Printed wide-leg one-piece": "style-6821-front.webp",
    "3476 — Printed long dress": "style-3476-front.webp",
    "7284 — Open-back long dress": "style-7284-front.webp",
    "1509 — Tiered long dress": "style-1509-front.webp",
    "2941 — Printed tiered dress": "style-2941-front.webp",
    "9152 — Green printed long dress": "style-9152-full.webp",
}
_pipeline = None


@lru_cache(maxsize=7)
def load_garment(style):
    if style not in STYLES:
        raise gr.Error("Choose a listed Manisha Overseas garment.")
    # Fixed, trusted catalogue paths prevent user-supplied URL fetching.
    with requests.get(PHOTO_ROOT + STYLES[style], timeout=25, stream=True) as response:
        response.raise_for_status()
        data = bytearray()
        for chunk in response.iter_content(chunk_size=65536):
            data.extend(chunk)
            if len(data) > 10 * 1024 * 1024:
                raise gr.Error("Catalogue photograph exceeds 10 MB.")
    with Image.open(BytesIO(data)) as im:
        if im.width * im.height > 25_000_000:
            raise gr.Error("Catalogue image is too large.")
        return ImageOps.exif_transpose(im).convert("RGB").copy()


def get_pipeline():
    global _pipeline
    if _pipeline is None:
        if not torch.cuda.is_available():
            raise gr.Error("ZeroGPU unavailable. Please check that this Space is using ZeroGPU.")
        WEIGHTS_DIR.mkdir(parents=True, exist_ok=True)
        hf_hub_download(repo_id="fashn-ai/fashn-vton-1.5",
                        filename="model.safetensors", local_dir=WEIGHTS_DIR)
        pose_dir = WEIGHTS_DIR / "dwpose"
        pose_dir.mkdir(parents=True, exist_ok=True)
        for name in ("yolox_l.onnx", "dw-ll_ucoco_384.onnx"):
            hf_hub_download(repo_id="fashn-ai/DWPose",
                            filename=name, local_dir=pose_dir)
        from fashn_vton import TryOnPipeline
        _pipeline = TryOnPipeline(weights_dir=str(WEIGHTS_DIR), device="cuda")
    return _pipeline


@spaces.GPU(duration=120)
def generate(person, style, consent):
    if consent is not True:
        raise gr.Error("Please read the privacy notice and confirm consent.")
    if person is None:
        raise gr.Error("Upload a consenting adult's photograph.")
    if style not in STYLES:
        raise gr.Error("Select a catalogue garment.")
    if person.width * person.height > 25_000_000:
        raise gr.Error("Please use an image under 25 megapixels.")
    person_rgb = ImageOps.exif_transpose(person).convert("RGB")
    person_rgb.thumbnail((1440, 2160))
    garment_rgb = load_garment(style)
    result = get_pipeline()(
        person_image=person_rgb,
        garment_image=garment_rgb,
        category="one-pieces",
        garment_photo_type="model",
        num_samples=1,
        num_timesteps=20,
        segmentation_free=True,
    )
    return result.images[0]


with gr.Blocks(
    title="Manisha Overseas | Internal Try-On Evaluation",
    analytics_enabled=False,
    delete_cache=(900, 900),
    css=".gradio-container{max-width:1050px!important}"
) as demo:
    gr.Markdown(
        "# Manisha Overseas · Virtual Try-On Lab\n"
        "**Internal research/evaluation only — NOT commercially licensed for public use.** "
        "The standard FASHN VTON pipeline uses FASHN Human Parser, inheriting the "
        "NVIDIA SegFormer non-commercial research/evaluation license. "
        "Do not publish as a customer-facing feature without written clearance or a "
        "fully license-compatible replacement.\n\n"
        "**Privacy:** Your photograph and the AI result are processed by Hugging Face "
        "and temporarily cached by Gradio. Cache cleanup is scheduled after about "
        "15–30 minutes, but immediate erasure and private file URLs cannot be "
        "guaranteed. Do not upload sensitive photos or photos of children. "
        "Use only a photograph of an adult who has agreed to this test."
    )
    with gr.Row():
        with gr.Column():
            person = gr.Image(label="Adult participant photograph", type="pil", sources=["upload"])
            style = gr.Dropdown(choices=list(STYLES), value=list(STYLES)[0],
                                label="Manisha Overseas garment")
            garment = gr.Image(label="Original garment catalogue photograph",
                               value=lambda: load_garment(list(STYLES)[0]),
                               interactive=False, type="pil")
            consent = gr.Checkbox(
                label="I am at least 18, own or have permission to use this image, "
                      "and agree to temporary processing by Hugging Face for this evaluation."
            )
            run = gr.Button("Generate evaluation image", variant="primary")
        with gr.Column():
            output = gr.Image(label="AI-generated preview (not a fit or sizing guarantee)",
                              type="pil", interactive=False)
            gr.Markdown("Generated images may alter patterns, sizing and body details. "
                        "Do not rely on this preview to confirm actual garment fit.")
    style.change(fn=load_garment, inputs=style, outputs=garment, api_name=False)
    run.click(fn=generate, inputs=[person, style, consent], outputs=output, api_name=False)

demo.queue(max_size=3, default_concurrency_limit=1)
if __name__ == "__main__":
    demo.launch()
