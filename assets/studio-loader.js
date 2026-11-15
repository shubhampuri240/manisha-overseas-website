/* Keep the studio self-contained: no external rendering runtime is required. */
(() => {
  'use strict';
  function load(src) {
    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = src; script.async = false;
      script.onload = resolve; script.onerror = () => reject(new Error(`Unable to load ${src}`));
      document.body.append(script);
    });
  }
  (async () => {
    try { await load('assets/vendor/three-0.152.2.min.js'); } catch { document.documentElement.classList.add('studio-three-unavailable'); }
    try { await load('assets/dress-model.js?v=atelier-2'); } catch { document.documentElement.classList.add('studio-renderer-unavailable'); }
    try { await load('assets/studio-configurator.js?v=atelier-2'); }
    catch {
      document.getElementById('studio-loading').hidden = true;
      document.getElementById('stage-status').textContent = 'The interactive studio could not start. You can still browse all catalogue photographs in Collections.';
    }
  })();
})();
