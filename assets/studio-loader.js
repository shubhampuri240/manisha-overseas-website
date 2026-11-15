/* Photographs load first. The optional design study loads only when requested. */
(() => {
  'use strict';
  function load(src) {
    return new Promise((resolve, reject) => {
      const script = document.createElement('script'); script.src = src; script.async = false;
      script.onload = resolve; script.onerror = () => reject(new Error(`Unable to load ${src}`)); document.body.append(script);
    });
  }
  let rendererPromise;
  window.loadManishaRenderer = () => {
    if (!rendererPromise) rendererPromise = (async () => {
      try { await load('assets/vendor/three-0.152.2.min.js'); } catch { document.documentElement.classList.add('studio-three-unavailable'); }
      await load('assets/dress-model.js?v=atelier-2');
    })().catch(error => { rendererPromise = null; throw error; });
    return rendererPromise;
  };
  load('assets/studio-configurator.js?v=photo-3').catch(() => {
    document.getElementById('studio-loading').hidden = true;
    document.getElementById('stage-status').textContent = 'The photograph is ready. Reload to enable the studio controls, or explore the collection pages.';
  });
})();
