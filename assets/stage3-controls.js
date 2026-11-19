/* Stage 3: honest, accessible controls for the existing procedural Three.js studio.
   Product photography and manufactured garment models are NOT interchangeable. */
(() => {
  'use strict';
  const stageFooter=document.querySelector('.studio-stage-footer');
  if(!stageFooter || document.getElementById('stage3-toolkit'))return;

  const palette=[
    ['chalk','#f5efe4'],['sand','#d6c1a3'],['sage','#879982'],['blue','#8eafbf'],
    ['rose','#c89494'],['terracotta','#b46f50'],['olive','#6c7653'],['navy','#293d50']
  ];
  const section=document.createElement('section');
  section.id='stage3-toolkit';
  section.className='stage3-toolkit';
  section.setAttribute('aria-label','Interactive 3D garment study controls');
  section.innerHTML=`
    <div class="stage3-toolkit-intro">
      <div><span class="stage3-eyebrow">3D / PROCEDURAL GARMENT STUDY</span>
        <h2 id="stage3-selected-heading">Turn your garment in 3D.</h2>
        <p>The garment silhouette is a <strong>real interactive 3D mesh</strong>. Its experimental fabric appearance is sampled from our original garment photos—not a fitted 3D scan or a verified print repeat. Side views and proportions are approximate.</p>
      </div>
      <span class="stage3-model-status" id="stage3-model-status" role="status" aria-live="polite">Preparing 3D controls</span>
    </div>
    <div class="stage3-toolkit-grid">
      <div class="stage3-toolkit-group">
        <strong>Rotate the 3D model</strong>
        <div class="stage3-turn-buttons" role="group" aria-label="3D model rotation">
          <button type="button" data-stage3-turn="-30" aria-label="Turn 3D garment left 30 degrees">↶ <span>30° left</span></button>
          <button type="button" data-stage3-turn="30" aria-label="Turn 3D garment right 30 degrees"><span>30° right</span> ↷</button>
          <button type="button" data-stage3-autorotate>Auto-rotate</button>
        </div>
        <small>Drag the 3D garment to turn freely. Front, Back and Detail presets are above.</small>
      </div>
      <div class="stage3-toolkit-group">
        <strong>Concept colour swatches</strong>
        <div class="stage3-colours" role="group" aria-label="Illustrative garment colour">
          ${palette.map(([name,hex])=>`<button type="button" data-stage3-tone="${name}" aria-pressed="false" title="${name}" aria-label="${name} conceptual colour"><span style="--stage3-swatch:${hex}"></span><small>${name}</small></button>`).join('')}
        </div>
        <small>Choosing a colour switches from the sampled photograph to a conceptual colour study. Use the photo reference for actual approved colours.</small>
      </div>
    </div>
    <div class="stage3-toolkit-bottom">
      <span>To create an exact digital garment, we need a verified garment 3D file or measurements, patterns and sample references.</span>
      <button type="button" data-stage3-return-photo>View real product photograph</button>
    </div>`;
  stageFooter.insertAdjacentElement('afterend',section);

  const status=section.querySelector('#stage3-model-status');
  const turnButtons=[...section.querySelectorAll('[data-stage3-turn]')];
  const rotateButton=section.querySelector('[data-stage3-autorotate]');
  const toneButtons=[...section.querySelectorAll('[data-stage3-tone]')];
  function update() {
    const engine=window.ManishaDressStudio;
    const engineState=engine?.getState?.();
    const atelier=window.ManishaAtelier?.getState?.();
    const backend=engineState?.backend;
    const name=atelier?.imported?.name || (atelier?.selected>=0?('Style '+['4638','6821','3476','7284','1509','2941','9152'][atelier.selected]):'Selected garment');
    section.querySelector('#stage3-selected-heading').textContent='Turn '+name+' in 3D.';
    if(backend==='webgl') status.textContent=engineState.pattern==='reference' ? (engineState.referenceStatus==='ready'?'3D mesh · garment-photo fabric':'3D mesh · loading photo texture') : '3D mesh · concept colour';
    else if(backend==='2d') status.textContent='2D illustrated fallback — rotation unavailable';
    else if(backend==='unavailable') status.textContent='3D unavailable — use product photos';
    else status.textContent='3D engine loading';
    turnButtons.forEach(button=>button.disabled=backend!=='webgl');
    rotateButton.disabled=backend!=='webgl';
    const spinning=!!engineState?.spinning;
    rotateButton.textContent=spinning?'Pause rotation':'Auto-rotate';
    rotateButton.setAttribute('aria-pressed',String(spinning));
    toneButtons.forEach(button=>{
      const active=button.dataset.stage3Tone===(atelier?.tone||'sage');
      button.classList.toggle('is-active',active);
      button.setAttribute('aria-pressed',String(active));
    });
  }
  turnButtons.forEach(button=>button.addEventListener('click',()=>{
    const engine=window.ManishaDressStudio;
    if(engine?.getState?.().backend!=='webgl')return;
    engine.turnBy?.(Number(button.dataset.stage3Turn));
    update();
  }));
  rotateButton.addEventListener('click',()=>{
    const engine=window.ManishaDressStudio;
    if(engine?.getState?.().backend!=='webgl')return;
    engine.getState().spinning?engine.pause():engine.resume();
    update();
  });
  toneButtons.forEach(button=>button.addEventListener('click',()=>{
    const original=document.querySelector('.colour-choice[data-tone="'+button.dataset.stage3Tone+'"]');
    // Reuse the existing configurator source of truth, so 3D and saved briefs agree.
    original?.click();
    update();
  }));
  section.querySelector('[data-stage3-return-photo]').addEventListener('click',()=>{
    document.querySelector('[data-stage-mode="photo"]')?.click();
    document.querySelector('.studio-stage-toolbar')?.scrollIntoView({behavior:'smooth',block:'center'});
  });
  window.addEventListener('studio:state',update);
  window.addEventListener('studio:ready',update);
  document.querySelectorAll('[data-stage-mode], [data-style-index]').forEach(button=>
    button.addEventListener('click',()=>requestAnimationFrame(update)));
  update();
})();
