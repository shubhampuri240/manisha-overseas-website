(() => {
  const photos = [...document.querySelectorAll('[data-photo]')];
  if (!photos.length || !('HTMLDialogElement' in window)) return;
  const viewer = document.createElement('dialog');
  viewer.className = 'photo-viewer';
  viewer.setAttribute('aria-labelledby', 'photo-viewer-title');
  viewer.innerHTML = `<div class="photo-viewer-layout"><div class="photo-viewer-toolbar"><span>MANISHA / PHOTO EDIT</span><button type="button" data-close aria-label="Close photograph">×</button></div><img class="photo-viewer-image" alt=""><div class="photo-viewer-footer"><h2 id="photo-viewer-title"></h2><div class="photo-viewer-controls"><button type="button" data-previous aria-label="Previous photograph">←</button><button type="button" data-next aria-label="Next photograph">→</button></div><a data-photo-enquiry>Enquire about this look ↗</a></div></div>`;
  document.body.append(viewer);
  let active = 0;
  let previousOverflow = '';
  const picture = viewer.querySelector('img');
  function show(index) {
    active = (index + photos.length) % photos.length;
    const button = photos[active];
    picture.src = button.dataset.photo;
    picture.alt = button.querySelector('img').alt;
    viewer.querySelector('h2').textContent = button.dataset.caption;
    viewer.querySelector('[data-photo-enquiry]').href = button.dataset.enquiry;
  }
  photos.forEach((button, index) => button.addEventListener('click', () => {
    show(index);
    previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    viewer.showModal();
  }));
  viewer.querySelector('[data-close]').addEventListener('click', () => viewer.close());
  viewer.querySelector('[data-previous]').addEventListener('click', () => show(active - 1));
  viewer.querySelector('[data-next]').addEventListener('click', () => show(active + 1));
  viewer.addEventListener('click', event => { if (event.target === viewer) viewer.close(); });
  viewer.addEventListener('keydown', event => {
    if (event.key === 'ArrowLeft') { event.preventDefault(); show(active - 1); }
    if (event.key === 'ArrowRight') { event.preventDefault(); show(active + 1); }
  });
  viewer.addEventListener('close', () => { document.body.style.overflow = previousOverflow; });
})();
