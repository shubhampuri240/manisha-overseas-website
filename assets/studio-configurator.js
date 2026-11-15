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
  const defaults = () => ({ selected: 0, mode: 'photo', side: 'front', tone: 'sage', fabric: 'cotton', pattern: 'plain', trims: true, view: 'orbit', lighting: 'daylight', motion: 'still', spinning: !reduced, imported: null });
  let state = defaults();
  let toastTimer;
  let syncing = false;
  let photoScale = 1, photoX = 0, photoY = 0, photoTimer = 0, photoRequest = 0;
  let pendingPhotoPath = $('#photo-reference-image').getAttribute('src');
  const photoFrame = $('#photo-reference-frame');
  const photoSurface = $('#studio-photo-view');
  const outgoingPhoto = $('#photo-outgoing-image');
  const clamp = (value, min, max) => Math.max(min, Math.min(max, value));
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
  const params = new URLSearchParams({ category: state.imported || reference.code === '6821' ? 'Other' : 'printed-dresses', style: reference.code || reference.name });
    if (state.mode === '3d') {
      params.set('colour', nameFor('tone', state.tone)); params.set('texture', nameFor('fabric', state.fabric)); params.set('pattern', nameFor('pattern', state.pattern)); params.set('finish', state.trims ? 'Seam and trim details on' : 'Seam and trim details off');
    } else params.set('photograph', state.side === 'back' ? (reference.backLabel || 'Back view') : 'Front view');
    $('#quote-style').href = `contact.html?${params}`;
  }
  function updatePhoto() {
    const reference = selectedReference();
    const path = state.side === 'back' && reference.back ? reference.back : reference.front;
    const viewName = state.side === 'back' && reference.back ? reference.backLabel : 'Front view';
    if (pendingPhotoPath !== path) {
      pendingPhotoPath = path;
      const request = ++photoRequest;
      const preload = new Image();
      $('#export-design').disabled = true;
      preload.onload = () => {
        if (request !== photoRequest) return;
        if (!reduced && photo.complete && photo.naturalWidth) { outgoingPhoto.src = photo.src; outgoingPhoto.hidden = false; }
        photoFrame.classList.remove('is-photo-transition');
        photo.src = path; photo.alt = `${reference.code ? `Style ${reference.code}` : reference.name}, ${viewName.toLowerCase()}, supplied garment photograph`;
        void photoFrame.offsetWidth;
        if (!reduced) photoFrame.classList.add('is-photo-transition');
        $('#export-design').disabled = false;
        setTimeout(() => { if (request === photoRequest) { outgoingPhoto.hidden = true; outgoingPhoto.removeAttribute('src'); photoFrame.classList.remove('is-photo-transition'); } }, reduced ? 0 : 700);
      };
      preload.onerror = () => { if (request === photoRequest) { $('#export-design').disabled = false; toast('That photograph could not load. Select another catalogue view.'); } };
      preload.src = path;
    }
    photo.alt = `${reference.code ? `Style ${reference.code}` : reference.name}, ${viewName.toLowerCase()}, supplied garment photograph`;
    $('#photo-style-caption').textContent = `${reference.code ? `STYLE ${reference.code}` : reference.name.toUpperCase()} / ${viewName.toUpperCase()}`;
    $$('[data-photo-side="back"]').forEach(button => { button.hidden = !reference.back; const label = button.querySelector('.photo-thumb-label'); if (label) label.textContent = reference.backLabel || 'Back view'; else button.textContent = reference.backLabel || 'Back view'; });
    option('photo-action', 'back').hidden = !reference.back;
    option('photo-action', 'back').textContent = reference.backLabel === 'Detail view' ? 'Detail photo' : 'Back view';
    $('#photo-front-thumb').src = reference.front;
    $('#photo-back-thumb').hidden = !reference.back;
    if (reference.back) $('#photo-back-thumb').src = reference.back;
    $('#photo-reference-code').textContent = reference.code ? `Style ${reference.code}` : 'Your photo reference';
    $('#photo-reference-name').textContent = reference.name;
    $('#photo-reference-notes').textContent = reference.back ? (reference.backLabel === 'Detail view' ? 'Full-length and detail photographs available.' : 'Front and back photographs available.') : 'One supplied photograph available.';
    $('#brief-photo-side').textContent = viewName;
    pressed('[data-photo-action]', button => button.dataset.photoAction === (photoScale > 1 ? 'detail' : state.side), 'is-active');
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
    $('#stage-style-title').textContent = `${label} / ${state.mode === 'photo' ? 'fashion photograph' : '3D design study'}`;
    $('#stage-view-label').textContent = state.mode === 'photo' ? 'SUPPLIED PHOTOGRAPH' : 'THE FORM STUDY';
    document.body.classList.toggle('is-concept-mode', state.mode === '3d');
    stage.classList.toggle('is-photo-mode', state.mode === 'photo');
    $('.studio-stage-column').classList.toggle('is-photo-mode', state.mode === 'photo');
    $('#studio-photo-view').hidden = state.mode !== 'photo';
    $('#studio-photo-view').setAttribute('aria-hidden', String(state.mode !== 'photo'));
    $('#dress-canvas').setAttribute('aria-hidden', String(state.mode === 'photo'));
    $('#dress-canvas').tabIndex = state.mode === 'photo' ? -1 : 0;
    $('#rotate-toggle').hidden = state.mode === 'photo';
    $('#rotate-toggle').innerHTML = `<svg class="icon" aria-hidden="true" width="18" height="18"><use href="#i-${state.spinning ? 'pause' : 'play'}"></use></svg> ${state.spinning ? 'Pause' : 'Rotate'}`;
    $('#rotate-toggle').setAttribute('aria-pressed', String(state.spinning));
    $$('.studio-view-presets button, [data-lighting], [data-motion]').forEach(button => { button.disabled = state.mode === 'photo' || (api()?.getState?.().backend !== 'webgl' && (button.hasAttribute('data-lighting') || button.hasAttribute('data-motion'))); });
    $('.studio-view-presets').hidden = state.mode === 'photo';
    updatePhoto(); updateQuote(); updateBackend();
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
  async function showMode(mode) {
    state.mode = mode === 'photo' ? 'photo' : '3d';
    stopPhotoPlayback(); refresh();
    if (state.mode === 'photo') { api()?.pause(); $('#studio-loading').hidden = true; announce('Original garment photograph. Zoom in, drag to inspect, or choose front and back.'); return; }
    $('#studio-loading').hidden = !!api();
    try { await window.loadManishaRenderer(); if (state.mode === '3d') { syncEngine(); refresh(); announce(api()?.getState?.().backend === 'webgl' ? '3D design study. Return to Fashion photograph for the real garment.' : 'Illustrated design study. Fashion photograph shows the real garment.'); } }
    catch { toast('The design study could not load. Your garment photographs are available.'); state.mode = 'photo'; refresh(); }
    finally { $('#studio-loading').hidden = true; }
  }
  function conceptAction(action) { if (state.mode !== '3d') return; action(); refresh(); }
  $$('[data-style-index]').forEach(button => button.addEventListener('click', () => {
    stopPhotoPlayback(); resetPhotoView(); state.selected = Number(button.dataset.styleIndex); state.imported = null; state.side = 'front';
    api()?.setStyle(state.selected); refresh(); announce(`Style ${styles[state.selected].code} selected.`);
  }));
  $$('[data-stage-mode]').forEach(button => button.addEventListener('click', () => showMode(button.dataset.stageMode)));
  $$('[data-photo-side]').forEach(button => button.addEventListener('click', () => choosePhotoSide(button.dataset.photoSide)));
  $$('[data-tone]').forEach(button => button.addEventListener('click', () => conceptAction(() => { state.tone = button.dataset.tone; api()?.setTone(button.dataset.hex); announce(`${nameFor('tone', state.tone)} colour direction.`); })));
  $$('[data-fabric]').forEach(button => button.addEventListener('click', () => conceptAction(() => { state.fabric = button.dataset.fabric; api()?.setFabric(state.fabric); announce(`${nameFor('fabric', state.fabric)} texture selected.`); })));
  $$('[data-pattern]').forEach(button => button.addEventListener('click', () => conceptAction(() => { state.pattern = button.dataset.pattern; api()?.setPattern(state.pattern); })));
  $('#trim-toggle').addEventListener('change', event => conceptAction(() => { state.trims = event.target.checked; api()?.setTrims(state.trims); }));
  $$('[data-view]').forEach(button => button.addEventListener('click', () => { state.view = button.dataset.view; state.spinning = state.view === 'orbit' && !reduced; api()?.setView(state.view); state.spinning ? api()?.resume() : api()?.pause(); refresh(); announce(`${button.textContent.trim()} camera view.`); }));
  $$('[data-lighting]').forEach(button => button.addEventListener('click', () => { state.lighting = button.dataset.lighting; api()?.setLighting(state.lighting); refresh(); }));
  $$('[data-motion]').forEach(button => button.addEventListener('click', () => { state.motion = button.dataset.motion; api()?.setMotion(state.motion); refresh(); if (reduced && state.motion === 'breeze') toast('Reduced motion is enabled. The garment stays still.'); }));
  $('#rotate-toggle').addEventListener('click', () => { state.spinning = !state.spinning; state.spinning ? api()?.resume() : api()?.pause(); if (state.spinning) state.view = 'orbit'; refresh(); });
  $('#zoom-in').addEventListener('click', () => state.mode === 'photo' ? zoomPhoto(photoScale + 0.35) : api()?.zoom(-0.55));
  $('#zoom-out').addEventListener('click', () => state.mode === 'photo' ? zoomPhoto(photoScale - 0.35) : api()?.zoom(0.55));
  $('#reset-view').addEventListener('click', () => {
    if (state.mode === 'photo') { stopPhotoPlayback(); resetPhotoView(); refresh(); announce('Full photograph restored.'); return; }
    const selected = state.selected, imported = state.imported;
    state = { ...defaults(), selected, imported, mode: '3d' }; api()?.reset(); syncEngine(); refresh(); toast('A fresh start. Your reference stays selected.');
  });
  function textBrief() {
    const reference = selectedReference();
    if (state.mode === 'photo') return `Manisha Overseas / Garment photograph enquiry\nReference: ${reference.code || reference.name} — ${reference.name}\nPhotograph: ${state.side === 'back' ? reference.backLabel : 'Front view'}\n\nI would like to discuss this photographed garment. Please confirm the fabric, sizing, availability and quotation.`;
    return `Manisha Overseas / Atelier brief\nReference: ${reference.code || reference.name} — ${reference.name}\n3D colour direction: ${nameFor('tone', state.tone)}\nConcept texture: ${nameFor('fabric', state.fabric)}\nSurface: ${nameFor('pattern', state.pattern)}\nSeam details: ${state.trims ? 'On' : 'Off'}\n\nVisual design study. Final fabric, fit, construction, quantity and price to be agreed with the approved sample.`;
  }
  function download(href, name) { const link = document.createElement('a'); link.href = href; link.download = name; document.body.append(link); link.click(); link.remove(); }
  function save() {
    try { localStorage.setItem('manishaAtelierLook', JSON.stringify({ version: 2, state, savedAt: Date.now() })); $('#saved-look-panel').hidden = false; toast('Your complete look is saved in this browser.'); }
    catch { toast('This browser cannot save looks. Export an image or copy your brief instead.'); }
  }
  $('#save-design').addEventListener('click', save); $('#save-design-secondary').addEventListener('click', save);
  $('#restore-design').addEventListener('click', async () => {
    try {
      const saved = JSON.parse(localStorage.getItem('manishaAtelierLook'));
      if (!saved || saved.version !== 2 || !saved.state) throw new Error('Missing saved look');
      const value = saved.state, clean = defaults();
      clean.selected = Number.isInteger(value.selected) && styles[value.selected] ? value.selected : 0;
      for (const key of ['tone', 'fabric', 'pattern', 'view', 'lighting', 'motion']) if (typeof value[key] === 'string' && option(key, value[key])) clean[key] = value[key];
      clean.mode = 'photo'; clean.side = value.side === 'back' ? 'back' : 'front';
      clean.trims = value.trims !== false; clean.spinning = !reduced && value.spinning === true;
      if (value.imported && safeImage(value.imported.front)) clean.imported = { name: String(value.imported.name).slice(0, 120), front: safeImage(value.imported.front), back: null };
      state = clean; await showMode(state.mode); syncEngine(); resetPhotoView(); refresh(); toast('Your saved look is restored.');
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
      const buttons = [...stage.querySelectorAll('button:not([disabled]),canvas[tabindex="0"],#studio-photo-view[tabindex="0"]')].filter(element => element.getClientRects().length);
      const first = buttons[0], last = buttons[buttons.length - 1];
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
    }
  });
  function updateBackend() {
    if (state.mode === 'photo') { $('#renderer-label').textContent = 'ORIGINAL GARMENT PHOTOGRAPHS'; $('#studio-loading').hidden = true; return; }
    const backend = api()?.getState?.().backend;
    $('#renderer-label').textContent = backend === 'webgl' ? '3D DESIGN STUDY' : backend === '2d' ? 'ILLUSTRATED DESIGN STUDY' : 'PREPARING DESIGN STUDY';
  }
  function setPhotoTransform() {
    photoX = clamp(photoX, -photoFrame.clientWidth * (photoScale - 1) / 2, photoFrame.clientWidth * (photoScale - 1) / 2);
    photoY = clamp(photoY, -photoFrame.clientHeight * (photoScale - 1) / 2, photoFrame.clientHeight * (photoScale - 1) / 2);
    photoFrame.style.setProperty('--photo-scale', photoScale);
    photoFrame.style.setProperty('--photo-x', `${photoX}px`); photoFrame.style.setProperty('--photo-y', `${photoY}px`);
    stage.classList.toggle('is-photo-zoomed', photoScale > 1.01);
    option('photo-action', 'detail').setAttribute('aria-pressed', String(photoScale > 1.01));
  }
  function resetPhotoView() { photoScale = 1; photoX = 0; photoY = 0; setPhotoTransform(); }
  function zoomPhoto(scale) { stopPhotoPlayback(); photoScale = clamp(scale, 1, 3); if (photoScale === 1) { photoX = 0; photoY = 0; } setPhotoTransform(); refresh(); }
  function choosePhotoSide(side, manual = true) {
    if (side === 'back' && !selectedReference().back) return;
    if (manual) stopPhotoPlayback(); resetPhotoView(); state.side = side; refresh();
    announce(`${selectedReference().code ? 'Style ' + selectedReference().code : selectedReference().name}: ${side === 'back' ? selectedReference().backLabel : 'Front view'}.`);
  }
  function stopPhotoPlayback() {
    clearInterval(photoTimer); photoTimer = 0; stage.classList.remove('is-playing');
    $('#photo-play-toggle').setAttribute('aria-pressed', 'false'); $('#photo-play-toggle span').textContent = 'Play views'; $('#photo-play-toggle use').setAttribute('href', '#i-play');
  }
  $('#photo-play-toggle').addEventListener('click', () => {
    if (photoTimer) { stopPhotoPlayback(); return; }
    if (!selectedReference().back) { toast('This reference has one supplied photograph. Use close-up to explore the detail.'); return; }
    resetPhotoView(); stage.classList.add('is-playing'); $('#photo-play-toggle').setAttribute('aria-pressed', 'true'); $('#photo-play-toggle span').textContent = 'Pause views'; $('#photo-play-toggle use').setAttribute('href', '#i-pause');
    photoTimer = setInterval(() => { if (!document.hidden && state.mode === 'photo') choosePhotoSide(state.side === 'front' ? 'back' : 'front', false); }, 4500);
  });
  $$('[data-photo-action]').forEach(button => button.addEventListener('click', () => {
    if (button.dataset.photoAction === 'detail') { zoomPhoto(photoScale > 1.01 ? 1 : 2.1); if (photoScale > 1) { photoY = photoFrame.clientHeight * .18; setPhotoTransform(); } }
    else choosePhotoSide(button.dataset.photoAction);
  }));
  const photoPointers = new Map(); let previousX = 0, previousY = 0, startX = 0, startY = 0, pinch = 0;
  photoSurface.addEventListener('pointerdown', event => {
    if (event.target.closest('button')) return;
    stopPhotoPlayback(); photoPointers.set(event.pointerId, { x: event.clientX, y: event.clientY });
    previousX = startX = event.clientX; previousY = startY = event.clientY;
    photoSurface.setPointerCapture?.(event.pointerId); stage.classList.add('is-photo-panning');
    if (photoPointers.size === 2) { const points = [...photoPointers.values()]; pinch = Math.hypot(points[0].x - points[1].x, points[0].y - points[1].y); }
  });
  photoSurface.addEventListener('pointermove', event => {
    if (!photoPointers.has(event.pointerId)) return;
    photoPointers.set(event.pointerId, { x: event.clientX, y: event.clientY });
    if (photoPointers.size === 2) { const points = [...photoPointers.values()]; const distance = Math.hypot(points[0].x - points[1].x, points[0].y - points[1].y); if (pinch > 0) photoScale = clamp(photoScale * distance / pinch, 1, 3); pinch = distance; setPhotoTransform(); }
    else if (photoScale > 1.01) { photoX += event.clientX - previousX; photoY += event.clientY - previousY; setPhotoTransform(); }
    previousX = event.clientX; previousY = event.clientY;
  });
  function releasePhoto(event) {
    if (!photoPointers.has(event.pointerId)) return;
    const dx = event.clientX - startX, dy = event.clientY - startY;
    photoPointers.delete(event.pointerId); if (!photoPointers.size) { stage.classList.remove('is-photo-panning'); if (photoScale <= 1.01 && Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy) * 1.3) choosePhotoSide(dx < 0 ? 'back' : 'front'); }
  }
  photoSurface.addEventListener('pointerup', releasePhoto); photoSurface.addEventListener('pointercancel', event => { photoPointers.delete(event.pointerId); stage.classList.remove('is-photo-panning'); });
  photoSurface.addEventListener('wheel', event => { if (state.mode !== 'photo' || matchMedia('(pointer:coarse)').matches) return; event.preventDefault(); zoomPhoto(photoScale - clamp(event.deltaY, -100, 100) * .003); }, { passive: false });
  photoSurface.addEventListener('dblclick', () => zoomPhoto(photoScale > 1.01 ? 1 : 2));
  photoSurface.addEventListener('keydown', event => { if (['ArrowLeft', 'ArrowRight', '+', '=', '-', '0'].includes(event.key)) { event.preventDefault(); if (event.key === 'ArrowLeft') choosePhotoSide('front'); if (event.key === 'ArrowRight') choosePhotoSide('back'); if (event.key === '+' || event.key === '=') zoomPhoto(photoScale + .35); if (event.key === '-') zoomPhoto(photoScale - .35); if (event.key === '0') { resetPhotoView(); refresh(); } } });
  document.addEventListener('visibilitychange', () => { if (document.hidden) stopPhotoPlayback(); });
  window.addEventListener('pagehide', stopPhotoPlayback);
  window.addEventListener('resize', setPhotoTransform);
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
  window.ManishaAtelier = { getState: () => structuredClone({ ...state, photoScale, photoX, photoY, photoPlaying: !!photoTimer }) };
})();
