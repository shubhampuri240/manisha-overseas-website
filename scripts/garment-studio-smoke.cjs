// Stage 3 browser smoke test: uses only locally served first-party website files.
const assert=require('node:assert/strict');
const fs=require('node:fs');
const {chromium}=require('playwright');

(async()=>{
  fs.mkdirSync('artifacts/garment-studio',{recursive:true});
  const browser=await chromium.launch({headless:true,args:[
    '--enable-webgl','--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader'
  ]});
  const page=await browser.newPage({viewport:{width:1440,height:960},deviceScaleFactor:1});
  const errors=[];
  page.on('pageerror',e=>errors.push(String(e)));
  const base='http://127.0.0.1:8765/';
  try {
    await page.goto(base+'dress-studio.html?mode=3d',{waitUntil:'domcontentloaded'});
    await page.waitForFunction(()=>window.ManishaDressStudio?.getState?.().ready===true,{timeout:30000});
    await page.waitForFunction(()=>document.querySelector('#stage3-toolkit')?.getClientRects().length>0,{timeout:15000});
    const st=await page.evaluate(()=>window.ManishaDressStudio.getState());
    assert.equal(st.backend,'webgl','A genuine WebGL 3D scene should initialize, not merely a 2D fallback');
    assert.equal(st.pattern,'reference');
    assert.ok(page.locator('[data-stage3-turn="30"]'));
    await page.screenshot({path:'artifacts/garment-studio/default.png'});

    await page.locator('[data-style-index="2"]').click();
    const current=await page.evaluate(()=>window.ManishaDressStudio.getState());
    assert.equal(current.style,2,'Style 3476 should be selected');
    await page.locator('[data-stage3-turn="30"]').click();
    await page.waitForTimeout(850);
    const rotated=await page.evaluate(()=>window.ManishaDressStudio.getState());
    assert.ok(Math.abs(rotated.angle-current.angle)>.03,'30-degree rotation control should move the actual mesh');

    await page.locator('[data-stage3-tone="navy"]').click();
    const conceptual=await page.evaluate(()=>window.ManishaAtelier.getState());
    assert.equal(conceptual.tone,'navy');
    assert.equal(conceptual.pattern,'plain','Applying custom colour must exit photo-sampled fabric mode');
    await page.locator('[data-pattern="reference"]').click();
    await page.waitForTimeout(1000);
    assert.equal(await page.evaluate(()=>window.ManishaDressStudio.getState().pattern),'reference');
    await page.screenshot({path:'artifacts/garment-studio/style-3476.png'});
    await page.locator('[data-stage-mode="photo"]').click();
    assert.equal(await page.evaluate(()=>window.ManishaAtelier.getState().mode),'photo');

    // External catalogue photograph in owned assets is accepted for the mesh's
    // illustrative textile pattern without pretending the mesh itself is verified.
    const params=new URLSearchParams({
      mode:'3d',
      image:base+'assets/visuals/style-2605-white-embroidered-dress.webp',
      name:'Style 2605 white embroidered dress'
    });
    await page.goto(base+'dress-studio.html?'+params,{waitUntil:'domcontentloaded'});
    await page.waitForFunction(()=>window.ManishaDressStudio?.getState?.().ready===true,{timeout:30000});
    const imported=await page.evaluate(()=>window.ManishaDressStudio.getState());
    assert.equal(imported.backend,'webgl');
    assert.ok(imported.referencePhotos?.[0]?.includes('style-2605-white-embroidered-dress.webp'));
    assert.equal(await page.evaluate(()=>window.ManishaAtelier.getState().mode),'3d');
    await page.screenshot({path:'artifacts/garment-studio/other-collection.png'});

    if(errors.length)throw new Error('Browser script errors: '+errors.join('\n'));
    console.log('PASS: WebGL, 30° rotation, style change, concept colour, photo mode and external catalogue photo texture');
  } finally { await browser.close(); }
})().catch(e=>{console.error(e);process.exitCode=1;});
