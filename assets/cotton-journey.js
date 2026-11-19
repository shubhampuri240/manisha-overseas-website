/* Manisha Overseas / Cotton-to-Showroom editorial chapter.
   Native DOM APIs only; never blocks scrolling, clicks or navigation. */
(() => {
  'use strict';
  const story = document.querySelector('.mo-thread-story');
  const journey = story && story.querySelector('.mo-thread-journey');
  const path = story && story.querySelector('.mo-thread-route-ink');
  if (!story || !journey || !path) return;

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const steps = Array.from(journey.querySelectorAll('.mo-thread-step'));
  let scheduled = false;
  let pathLength = 0;
  let observer = null;

  function measure() {
    if (reduceMotion.matches) return;
    try {
      pathLength = path.getTotalLength();
      path.style.strokeDasharray = String(pathLength);
    } catch (error) {
      pathLength = 0; // Static dotted line remains visible if SVG API is unavailable.
    }
    schedule();
  }
  function paint() {
    scheduled = false;
    if (reduceMotion.matches || !pathLength) return;
    const rect = journey.getBoundingClientRect();
    const start = window.innerHeight * .72;
    const distance = Math.max(1, rect.height - window.innerHeight * .24);
    const progress = Math.max(0, Math.min(1, (start - rect.top) / distance));
    path.style.strokeDashoffset = String(pathLength * (1 - progress));
  }
  function schedule() {
    if (scheduled || reduceMotion.matches) return;
    scheduled = true;
    window.requestAnimationFrame(paint);
  }
  function enableMotion() {
    if (reduceMotion.matches || !('IntersectionObserver' in window) || !('requestAnimationFrame' in window)) return;
    story.classList.add('mo-thread-ready');
    observer = new IntersectionObserver(entries => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          entry.target.classList.add('mo-thread-seen');
          observer.unobserve(entry.target);
        }
      }
    }, { rootMargin: '0px 0px -8% 0px', threshold: .1 });
    steps.forEach(step => observer.observe(step));
    measure();
    addEventListener('scroll', schedule, { passive: true });
    addEventListener('resize', measure, { passive: true });
  }

  if (reduceMotion.matches) {
    // The default markup and stylesheet are fully readable without animation.
    steps.forEach(step => step.classList.add('mo-thread-seen'));
    return;
  }
  enableMotion();
})();
