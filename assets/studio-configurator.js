/* The Manisha Atelier — catalogue references and visual concept controls. */
(() => {
  'use strict';
  const $ = selector => document.querySelector(selector);
  const $$ = selector => [...document.querySelectorAll(selector)];
  const styles = [
    ['4638', 'Floral printed long dress', 'front', 'back'],
    ['6821', 'Printed wide-leg one-piece', 'front', 'back'],
    ['3476', 'Printed long dress', 'front', 'back'],
    ['7284', 'Open-back printed long dress', 'front', 'back'],
    ['1509', 'Printed tiered long dress', 'front', 'back'],
    ['2941', 'Printed tiered long dress', 'front', 'back'],
    ['9152', 'Green printed long dress', 'full', 'detail']
  ].map(([code, name, front, back]) => ({ code, name, front: `assets/visuals/style-${code}-${front}.webp`, back: `assets/visuals/style-${code}-${back}.webp`, backLabel: back === 'detail' ? 'Detail view' : 'Back view' }));
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const defaults = () => ({ selected: 0, mode: '3d', side: 'front', tone: 'sage', fabric: 'cotton', pattern: 'plain', trims: true, view: 'orbit', lighting: 'daylight', motion: 'still', spinning: !reduced, imported: null });
  let state = defaults();
  let toastTimer;
  let syncing = false;
  let expanded = false;
  let overflowBeforeExpand = '';
  const stage = $('#dress-stage');
  const photo = $('#photo-reference-image');
  const api = () => window.ManishaDressStudio;
  const option = (key, value) => document.querySelector(`[data-${key}="${value}"]`);
  const nameFor = (key, value) => option(key, value)?.textContent.trim() || value;
  const selectedReference = () => state.imported || styles[state.selected];
  const announce = message => { $('#stage-status').textContent = message; };
  function toast(message) {
    const element = $('#studio-toast');
    clearTimeout(toastTimer); element.textContent = message; element.hidden = false;
    toastTimer = setTimeout(() => { element.hidden = true; }, 3600);
    announce(message);
  }
  function pressed(selector, predicate, activeClass = 'is-selected') {
    $$(selector).forEach(button => { const active = predicate(button); button.classList.toggle(activeClass, active); button.setAttribute('aria-pressed', String(active)); });
  }
  function safeImage(raw) {
    if (!raw || typeof raw !== 'string') return null;
    try {
      const url = new URL(raw, location.href);
      const base = new URL('.', location.href);
      const assetPrefix = new URL('assets/', base).pathname;
      if (url.origin !== base.origin || !url.pathname.startsWith(assetPrefix) || !/\/(visuals|manisha)\//.test(url.pathname) || !/\.(webp|png|jpe?g)$/i.test(url.pathname) || url.search || url.hash) return null;
      return url.href;
    } catch { return null; }
  }
  function updateQuote() {
    const reference = selectedReference();
    const params = new URLSearchParams({ category: state.imported || reference.code === '6821' ? 'Other' : 'printed-dresses', style: reference.code || reference.name, colour: nameFor('tone', state.tone), texture: nameFor('fabric', state.fabric), pattern: nameFor('pattern', state.pattern), finish: state.trims ? 'Seam and trim details on' : 'Seam and trim details off' });
    $('#quote-style').href = `contact.html?${params}`;
  }
  function updatePhoto() {
    const reference = selectedReference();
    const path = state.side === 'back' && reference.back ? reference.back : reference.front;
    const viewName = state.side === 'back' && reference.back ? reference.backLabel : 'Front view';
    if (photo.getAttribute('src') !== path) {
      stage.classList.add('is-switching');
      photo.src = path;
    }
    photo.alt = `${reference.code ? `Style ${reference.code}` : reference.name}, ${viewName.toLowerCase()}, supplied garment photograph`;
    $('#photo-style-caption').textContent = `${reference.code ? `STYLE ${reference.code}` : reference.name.toUpperCase()} / ${viewName.toUpperCase()}`;
    const backButton = option('photo-side', 'back');
    backButton.hidden = !reference.back;
    backButton.textContent = reference.backLabel || 'Back view';
    pressed('[data-photo-side]', button => button.dataset.photoSide === state.side, 'is-active');
  }
  photo.addEventListener('load', () => stage.classList.remove('is-switching'));
  photo.addEventListener('error', () => { if (state.imported) { state.imported = null; state.side = 'front'; refresh(); toast('That photograph could not load. Choose a catalogue reference to continue.'); } });
  function refresh() {
    const reference = selectedReference();
    const label = reference.code ? `Style ${reference.code}` : reference.name;
    pressed('[data-style-index]', button => !state.imported && Number(button.dataset.styleIndex) === state.selected);
    pressed('[data-tone]', button => button.dataset.tone === state.tone);
    pressed('[data-fabric]', button => button.dataset.fabric === state.fabric);
    pressed('[data-pattern]', button => button.dataset.pattern === state.pattern);
    pressed('[data-stage-mode]', button => button.dataset.stageMode === state.mode, 'is-active');
    pressed('[data-view]', button => button.dataset.view === state.view, 'is-active');
    pressed('[data-lighting]', button => button.dataset.lighting === state.lighting, 'is-active');
    pressed('[data-motion]', button => button.dataset.motion === state.motion, 'is-active');
    $('#selected-style-code').textContent = reference.code ? `Style ${reference.code}` : 'Your photo reference';
    $('#selected-style-name').textContent = reference.name;
    $('#brief-style').textContent = reference.code || reference.name;
    $('#brief-colour').textContent = $('#active-tone').textContent = nameFor('tone', state.tone);
    $('#brief-texture').textContent = nameFor('fabric', state.fabric);
    $('#brief-pattern').textContent = nameFor('pattern', state.pattern);
    $('#trim-toggle').checked = state.trims;
    $('#stage-style-title').textContent = `${label} / ${state.mode === 'photo' ? 'catalogue photograph' : '3D concept'}`;
    $('#stage-view-label').textContent = state.mode === 'photo' ? 'SUPPLIED PHOTOGRAPH' : 'THE FORM STUDY';
    stage.classList.toggle('is-photo-mode', state.mode === 'photo');
    $('.studio-stage-column').classList.toggle('is-photo-mode', state.mode === 'photo');
    $('#studio-photo-view').hidden = state.mode !== 'photo';
    $('#studio-photo-view').setAttribute('aria-hidden', String(state.mode !== 'photo'));
    $('#dress-canvas').setAttribute('aria-hidden', String(state.mode === 'photo'));
    $('#dress-canvas').tabIndex = state.mode === 'photo' ? -1 : 0;
    $('#rotate-toggle').hidden = state.mode === 'photo';
    $('#rotate-toggle').innerHTML = `<svg class="icon" aria-hidden="true" width="18" height="18"><use href="#i-${state.spinning ? 'pause' : 'play'}"></use></svg> ${state.spinning ? 'Pause' : 'Rotate'}`;
    $('#rotate-toggle').setAttribute('aria-pressed', String(state.spinning));
    $$('.studio-view-presets button, [data-lighting], [data-motion], #zoom-in, #zoom-out').forEach(button => { button.disabled = state.mode === 'photo' || (api()?.getState?.().backend !== 'webgl' && (button.hasAttribute('data-lighting') || button.hasAttribute('data-motion'))); });
    $('.studio-view-presets').hidden = state.mode === 'photo';
    updatePhoto(); updateQuote();
  }
  function syncEngine() {
    const engine = api(); if (!engine) return;
    syncing = true;
    try {
    engine.setStyle(state.selected);
    engine.setTone(option('tone', state.tone).dataset.hex);
    engine.setFabric(state.fabric); engine.setPattern(state.pattern); engine.setTrims(state.trims);
    engine.setLighting?.(state.lighting); engine.setMotion?.(state.motion); engine.setView?.(state.view);
    state.mode === '3d' && state.spinning ? engine.resume() : engine.pause();
    } finally { syncing = false; }
  }
  function showMode(mode) {
    state.mode = mode === 'photo' ? 'photo' : '3d';
    state.mode === '3d' && state.spinning ? api()?.resume() : api()?.pause();
    refresh();
    announce(state.mode === 'photo' ? 'Original catalogue photograph. Choose front or back to explore.' : api()?.getState?.().backend === 'webgl' ? '3D concept ready. Drag to rotate or choose a camera angle.' : 'Illustrated concept preview. Catalogue photographs are also available.');
  }
  function conceptAction(action) { if (state.mode !== '3d') showMode('3d'); action(); refresh(); }
  $$('[data-style-index]').forEach(button => button.addEventListener('click', () => {
    state.selected = Number(button.dataset.styleIndex); state.imported = null; state.side = 'front';
    api()?.setStyle(state.selected); refresh(); announce(`Style ${styles[state.selected].code} selected.`);
  }));
  $$('[data-stage-mode]').forEach(button => button.addEventListener('click', () => showMode(button.dataset.stageMode)));
  $$('[data-photo-side]').forEach(button => button.addEventListener('click', () => { state.side = button.dataset.photoSide; refresh(); announce(`${selectedReference().name}: ${button.textContent.trim()}.`); }));
  $$('[data-tone]').forEach(button => button.addEventListener('click', () => conceptAction(() => { state.tone = button.dataset.tone; api()?.setTone(button.dataset.hex); announce(`${nameFor('tone', state.tone)} colour direction.`); })));
  $$('[data-fabric]').forEach(button => button.addEventListener('click', () => conceptAction(() => { state.fabric = button.dataset.fabric; api()?.setFabric(state.fabric); announce(`${nameFor('fabric', state.fabric)} texture selected.`); })));
  $$('[data-pattern]').forEach(button => button.addEventListener('click', () => conceptAction(() => { state.pattern = button.dataset.pattern; api()?.setPattern(state.pattern); })));
  $('#trim-toggle').addEventListener('change', event => conceptAction(() => { state.trims = event.target.checked; api()?.setTrims(state.trims); }));
  $$('[data-view]').forEach(button => button.addEventListener('click', () => { state.view = button.dataset.view; state.spinning = state.view === 'orbit' && !reduced; api()?.setView(state.view); state.spinning ? api()?.resume() : api()?.pause(); refresh(); announce(`${button.textContent.trim()} camera view.`); }));
  $$('[data-lighting]').forEach(button => button.addEventListener('click', () => { state.lighting = button.dataset.lighting; api()?.setLighting(state.lighting); refresh(); }));
  $$('[data-motion]').forEach(button => button.addEventListener('click', () => { state.motion = button.dataset.motion; api()?.setMotion(state.motion); refresh(); if (reduced && state.motion === 'breeze') toast('Reduced motion is enabled. The garment stays still.'); }));
  $('#rotate-toggle').addEventListener('click', () => { state.spinning = !state.spinning; state.spinning ? api()?.resume() : api()?.pause(); if (state.spinning) state.view = 'orbit'; refresh(); });
  $('#zoom-in').addEventListener('click', () => api()?.zoom(-0.55));
  $('#zoom-out').addEventListener('click', () => api()?.zoom(0.55));
  $('#reset-view').addEventListener('click', () => {
    const selected = state.selected, imported = state.imported;
    state = { ...defaults(), selected, imported }; api()?.reset(); syncEngine(); refresh(); toast('A fresh start. Your reference stays selected.');
  });
  function textBrief() {
    const reference = selectedReference();
    return `Manisha Overseas / Atelier brief\nReference: ${reference.code || reference.name} — ${reference.name}\n3D colour direction: ${nameFor('tone', state.tone)}\nConcept texture: ${nameFor('fabric', state.fabric)}\nSurface: ${nameFor('pattern', state.pattern)}\nSeam details: ${state.trims ? 'On' : 'Off'}\n\nVisual design study. Final fabric, fit, construction, quantity and price to be agreed with the approved sample.`;
  }
  function download(href, name) { const link = document.createElement('a'); link.href = href; link.download = name; document.body.append(link); link.click(); link.remove(); }
  function save() {
    try { localStorage.setItem('manishaAtelierLook', JSON.stringify({ version: 2, state, savedAt: Date.now() })); $('#saved-look-panel').hidden = false; toast('Your complete look is saved in this browser.'); }
    catch { toast('This browser cannot save looks. Export an image or copy your brief instead.'); }
  }
  $('#save-design').addEventListener('click', save); $('#save-design-secondary').addEventListener('click', save);
  $('#restore-design').addEventListener('click', () => {
    try {
      const saved = JSON.parse(localStorage.getItem('manishaAtelierLook'));
      if (!saved || saved.version !== 2 || !saved.state) throw new Error('Missing saved look');
      const value = saved.state, clean = defaults();
      clean.selected = Number.isInteger(value.selected) && styles[value.selected] ? value.selected : 0;
      for (const key of ['tone', 'fabric', 'pattern', 'view', 'lighting', 'motion']) if (typeof value[key] === 'string' && option(key, value[key])) clean[key] = value[key];
      clean.mode = value.mode === 'photo' ? 'photo' : '3d'; clean.side = value.side === 'back' ? 'back' : 'front';
      clean.trims = value.trims !== false; clean.spinning = !reduced && value.spinning === true;
      if (value.imported && safeImage(value.imported.front)) clean.imported = { name: String(value.imported.name).slice(0, 120), front: safeImage(value.imported.front), back: null };
      state = clean; syncEngine(); refresh(); toast('Your saved look is restored.');
    } catch { toast('That saved look could not be restored. Start a new direction.'); }
  });
  $('#copy-design').addEventListener('click', async () => {
    try { await navigator.clipboard.writeText(textBrief()); toast('Your design brief is copied.'); }
    catch { const url = URL.createObjectURL(new Blob([textBrief()], { type: 'text/plain' })); download(url, 'manisha-atelier-brief.txt'); setTimeout(() => URL.revokeObjectURL(url), 1000); toast('Your design brief was downloaded as a text file.'); }
  });
  $('#export-design').addEventListener('click', async () => {
    try {
      let image;
      if (state.mode === 'photo') {
        if (!photo.complete || !photo.naturalWidth) throw new Error('Photo not ready');
        const canvas = document.createElement('canvas'); canvas.width = photo.naturalWidth; canvas.height = photo.naturalHeight;
        const context = canvas.getContext('2d'); context.fillStyle = '#eee9df'; context.fillRect(0, 0, canvas.width, canvas.height); context.drawImage(photo, 0, 0); image = canvas.toDataURL('image/png');
      } else image = await api()?.capture?.();
      if (!image || !image.startsWith('data:image/png')) throw new Error('Preview not ready');
      download(image, `manisha-${selectedReference().code || 'reference'}-${state.mode === 'photo' ? state.side : 'concept'}.png`); toast('Your image is ready to save.');
    } catch { toast('The preview is not ready to export. Try Catalogue photo or wait for the studio to load.'); }
  });
  const expandButton = $('#expand-stage');
  function setExpanded(open) {
    expanded = open; stage.classList.toggle('is-expanded', open); expandButton.setAttribute('aria-pressed', String(open)); expandButton.setAttribute('aria-label', open ? 'Close expanded preview' : 'Expand garment preview');
    expandButton.querySelector('use').setAttribute('href', open ? '#i-close' : '#i-expand');
    if (open) { overflowBeforeExpand = document.body.style.overflow; document.body.style.overflow = 'hidden'; expandButton.focus(); }
    else { document.body.style.overflow = overflowBeforeExpand; expandButton.focus(); }
  }
  expandButton.addEventListener('click', () => setExpanded(!expanded));
  const menu = $('#studio-menu-toggle'), nav = $('#studio-navigation');
  function setMenu(open) { nav.classList.toggle('is-open', open); menu.setAttribute('aria-expanded', String(open)); menu.setAttribute('aria-label', open ? 'Close navigation' : 'Open navigation'); }
  menu.addEventListener('click', () => setMenu(menu.getAttribute('aria-expanded') !== 'true'));
  nav.addEventListener('click', event => { if (event.target.closest('a')) setMenu(false); });
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape') { if (expanded) setExpanded(false); if (menu.getAttribute('aria-expanded') === 'true') { setMenu(false); menu.focus(); } }
    if (expanded && event.key === 'Tab') {
      const buttons = [...stage.querySelectorAll('button:not([disabled]),canvas[tabindex="0"]')].filter(element => element.getClientRects().length);
      const first = buttons[0], last = buttons[buttons.length - 1];
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
    }
  });
  function updateBackend() {
    const backend = api()?.getState?.().backend;
    $('#renderer-label').textContent = backend === 'webgl' ? 'LIVE 3D WORKSPACE' : 'ILLUSTRATED PREVIEW';
    $('#studio-loading').hidden = true;
    if (backend !== 'webgl') { $$('[data-lighting], [data-motion]').forEach(button => { button.disabled = true; }); announce('Illustrated preview active. You can also explore the original catalogue photos.'); }
  }
  const params = new URLSearchParams(location.search);
  const requested = styles.findIndex(style => style.code === params.get('style'));
  if (requested >= 0) state.selected = requested;
  const image = safeImage(params.get('image'));
  if (image) {
    const matched = styles.findIndex(style => [style.front, style.back].some(path => new URL(path, location.href).href === image));
    if (matched >= 0) { state.selected = matched; state.side = new URL(styles[matched].back, location.href).href === image ? 'back' : 'front'; }
    else state.imported = { name: (params.get('name') || 'Selected garment photograph').slice(0, 120), front: image, back: null };
    state.mode = 'photo';
  }
  try { $('#saved-look-panel').hidden = !localStorage.getItem('manishaAtelierLook'); } catch { /* Storage is optional. */ }
  syncEngine(); refresh(); updateBackend(); showMode(state.mode);
  window.addEventListener('studio:ready', updateBackend);
  window.addEventListener('studio:state', event => { if (!syncing && event.detail?.view === 'manual') { state.view = 'manual'; state.spinning = false; refresh(); } });
  matchMedia('(prefers-reduced-motion: reduce)').addEventListener('change', event => { if (event.matches) { state.spinning = false; state.motion = 'still'; refresh(); } });
  window.ManishaAtelier = { getState: () => structuredClone(state) };
})();
