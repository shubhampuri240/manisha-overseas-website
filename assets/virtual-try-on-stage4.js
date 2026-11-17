/* Stage 4 interface only. Never transmits photos or calls AI in the browser. */
(() => {
  "use strict";
  const selections = [...document.querySelectorAll(".vton-choice")];
  const garmentImage = document.getElementById("vton-garment");
  const garmentTitle = document.getElementById("vton-garment-title");
  const garmentCode = document.getElementById("vton-garment-code");
  const personImage = document.getElementById("vton-person");
  const referenceTitle = document.getElementById("vton-person-title");
  const resultImage = document.getElementById("vton-result-image");
  const fileInput = document.getElementById("vton-file");
  const clear = document.getElementById("vton-clear");
  const message = document.getElementById("vton-message");
  let objectUrl = null;
  const imageRoot = "assets/visuals/";

  function choose(button) {
    if (!button) return;
    selections.forEach(el => el.setAttribute("aria-pressed", String(el === button)));
    const code = button.dataset.code;
    const file = button.dataset.file;
    if (!/^\d{3,4}$/.test(code) || !/^[a-z0-9.-]+\.webp$/.test(file)) return;
    garmentImage.src = imageRoot + file;
    garmentImage.alt = "Original Manisha Overseas garment photograph, style " + code;
    garmentTitle.textContent = button.dataset.title || "Catalogue garment";
    garmentCode.textContent = "STYLE " + code + " / ORIGINAL PHOTOGRAPH";
    const referenceCode = code === "3476" ? "4638" : "3476";
    personImage.src = imageRoot + (referenceCode === "3476" ? "style-3476-front.webp" : "style-4638-front.webp");
    personImage.alt = "Existing Manisha Overseas female-model catalogue photograph, style " + referenceCode;
    referenceTitle.textContent = "REFERENCE MODEL / STYLE " + referenceCode;
    // Gallery selection does not modify the Colab code; make this clear.
    const note = document.getElementById("vton-colab-hint");
    note.textContent = code === "4638"
      ? "The one-click research notebook currently uses Style 4638 by default."
      : "Selected Style " + code + " here. The Colab notebook uses Style 4638 by default; edit STYLE_CODE in that notebook to test this selection.";
    const url = new URL(location.href);
    url.searchParams.set("style", code);
    history.replaceState(null, "", url);
  }

  const byUrl = new URLSearchParams(location.search).get("style");
  choose(selections.find(btn => btn.dataset.code === byUrl) || selections[0]);
  selections.forEach(button => button.addEventListener("click", () => choose(button)));

  function releaseObject() {
    if (objectUrl) {
      URL.revokeObjectURL(objectUrl);
      objectUrl = null;
    }
  }
  fileInput.addEventListener("change", () => {
    const file = fileInput.files && fileInput.files[0];
    if (!file) return;
    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      message.textContent = "Choose a JPG, PNG or WebP result image.";
      fileInput.value = "";
      return;
    }
    if (file.size > 12 * 1024 * 1024) {
      message.textContent = "The result image must be 12 MB or smaller.";
      fileInput.value = "";
      return;
    }
    releaseObject();
    objectUrl = URL.createObjectURL(file);
    resultImage.onload = () => {
      resultImage.hidden = false;
      clear.hidden = false;
      message.textContent = "This result is displayed locally in your browser. It has not been uploaded.";
    };
    resultImage.onerror = () => {
      releaseObject();
      resultImage.removeAttribute("src");
      resultImage.hidden = true;
      clear.hidden = true;
      message.textContent = "Unable to display this image. Choose a valid exported result.";
    };
    resultImage.src = objectUrl;
  });
  clear.addEventListener("click", () => {
    resultImage.removeAttribute("src");
    resultImage.hidden = true;
    fileInput.value = "";
    clear.hidden = true;
    message.textContent = "The local preview has been cleared.";
    releaseObject();
  });
  window.addEventListener("pagehide", releaseObject);
})();
