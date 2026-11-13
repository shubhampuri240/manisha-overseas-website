/*
  Manisha Overseas — 3D Studio / Reference Dress 01
  Original procedural 3D concept shaped from the user-supplied reference:
  square neckline, short puff sleeves, fitted/smocked bodice and full eyelet midi skirt.
  It is a visual concept, not a measured production model or tech pack.
*/
(()=>{
  const canvas=document.getElementById('dress-canvas');
  if(!canvas)return;
  const stage=canvas.parentElement;
  const fallback=stage.querySelector('.studio-fallback');
  const toggle=document.getElementById('rotate-toggle');
  const reset=document.getElementById('reset-view');
  const hint=document.getElementById('dress-view-hint');
  let spin=true,renderer,scene,camera,garment,drag=false,lastX=0,lastY=0,raf=0;
  let materialSet=[],initialCameraZ=8.8;
  const reduced=window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
  if(reduced)spin=false;
  const syncToggle=()=>{if(toggle)toggle.innerHTML=spin?'Ⅱ&nbsp; Pause rotation':'▶&nbsp; Resume rotation';};
  toggle?.addEventListener('click',()=>{spin=!spin;syncToggle();if(fallback)fallback.classList.toggle('paused',!spin);});

  if(!window.THREE){stage.classList.add('fallback-active');syncToggle();return;}
  const THREE=window.THREE;
  try{
    renderer=new THREE.WebGLRenderer({canvas,alpha:true,antialias:true,powerPreference:'high-performance'});
  }catch(e){stage.classList.add('fallback-active');syncToggle();return;}
  renderer.setPixelRatio(Math.min(window.devicePixelRatio||1,window.innerWidth<720?1.25:1.7));
  renderer.setSize(stage.clientWidth,stage.clientHeight,false);
  renderer.outputColorSpace=THREE.SRGBColorSpace;
  renderer.toneMapping=THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure=1.05;

  scene=new THREE.Scene();
  camera=new THREE.PerspectiveCamera(32,stage.clientWidth/Math.max(stage.clientHeight,1),.1,100);
  camera.position.set(0,.0,initialCameraZ);
  scene.add(new THREE.HemisphereLight(0xfffaf2,0x8d7862,2.0));
  const key=new THREE.DirectionalLight(0xfff0da,3.0);key.position.set(-3.5,5.5,6);scene.add(key);
  const fill=new THREE.DirectionalLight(0xdce9f7,1.0);fill.position.set(4,1,4);scene.add(fill);
  const rim=new THREE.DirectionalLight(0xffffff,1.7);rim.position.set(1,4,-4);scene.add(rim);

  function makeLaceMaps(){
    const size=1024;
    const colour=document.createElement('canvas');colour.width=colour.height=size;
    const c=colour.getContext('2d');
    c.fillStyle='#f5eee3';c.fillRect(0,0,size,size);
    // subtle woven fibres
    for(let y=0;y<size;y+=5){c.strokeStyle=(y%10===0)?'rgba(154,133,107,.12)':'rgba(255,255,255,.30)';c.lineWidth=1;c.beginPath();c.moveTo(0,y);c.lineTo(size,y+2);c.stroke();}
    for(let x=0;x<size;x+=9){c.strokeStyle='rgba(166,145,119,.055)';c.lineWidth=1;c.beginPath();c.moveTo(x,0);c.lineTo(x+2,size);c.stroke();}
    const cell=128;
    for(let yy=0;yy<size;yy+=cell){
      for(let xx=0;xx<size;xx+=cell){
        c.save();c.translate(xx+cell/2,yy+cell/2);
        c.strokeStyle='rgba(166,139,105,.78)';c.lineWidth=4;
        c.beginPath();c.arc(0,0,39,0,Math.PI*2);c.stroke();
        for(let k=0;k<8;k++){
          const a=k*Math.PI/4,px=Math.cos(a)*28,py=Math.sin(a)*28;
          c.fillStyle='rgba(255,255,255,.62)';
          c.beginPath();c.ellipse(px,py,12,22,a,0,Math.PI*2);c.fill();
          c.strokeStyle='rgba(176,149,113,.82)';c.lineWidth=3;
          c.beginPath();c.ellipse(px,py,12,22,a,0,Math.PI*2);c.stroke();
          c.strokeStyle='rgba(255,255,255,.85)';c.lineWidth=1.4;
          c.beginPath();c.ellipse(px,py,7,16,a,0,Math.PI*2);c.stroke();
        }
        c.fillStyle='rgba(172,142,105,.9)';c.beginPath();c.arc(0,0,4.5,0,Math.PI*2);c.fill();
        c.restore();
      }
    }
    const alpha=document.createElement('canvas');alpha.width=alpha.height=size;
    const a=alpha.getContext('2d');a.fillStyle='#fff';a.fillRect(0,0,size,size);
    for(let yy=0;yy<size;yy+=cell){for(let xx=0;xx<size;xx+=cell){
      a.save();a.translate(xx+cell/2,yy+cell/2);a.globalCompositeOperation='destination-out';
      // real transparency openings: eyelets around each floral rosette
      for(let k=0;k<8;k++){const ang=k*Math.PI/4;const px=Math.cos(ang)*28,py=Math.sin(ang)*28;a.beginPath();a.ellipse(px,py,5.8,12,ang,0,Math.PI*2);a.fill();}
      a.beginPath();a.arc(0,0,3.2,0,Math.PI*2);a.fill();a.restore();
    }}
    const map=new THREE.CanvasTexture(colour);map.wrapS=map.wrapT=THREE.RepeatWrapping;map.repeat.set(1.7,2.0);map.colorSpace=THREE.SRGBColorSpace;map.anisotropy=renderer.capabilities.getMaxAnisotropy();
    const alphaMap=new THREE.CanvasTexture(alpha);alphaMap.wrapS=alphaMap.wrapT=THREE.RepeatWrapping;alphaMap.repeat.copy(map.repeat);alphaMap.anisotropy=renderer.capabilities.getMaxAnisotropy();
    return {map,alphaMap};
  }
  const maps=makeLaceMaps();
  const cloth=new THREE.MeshPhysicalMaterial({map:maps.map,alphaMap:maps.alphaMap,color:0xffffff,roughness:.86,metalness:0,side:THREE.DoubleSide,transparent:true,alphaTest:.16,clearcoat:.08,clearcoatRoughness:.9});
  const lining=new THREE.MeshStandardMaterial({color:0xf7f0e6,roughness:.94,side:THREE.DoubleSide});
  const piping=new THREE.MeshStandardMaterial({color:0xd6c3a5,roughness:.84});
  const stitch=new THREE.MeshStandardMaterial({color:0xcdb795,roughness:.9});
  materialSet=[cloth];
  garment=new THREE.Group();scene.add(garment);
  const skirtAssembly=new THREE.Group();garment.add(skirtAssembly);
  const bodiceAssembly=new THREE.Group();garment.add(bodiceAssembly);
  const sleevesAssembly=new THREE.Group();garment.add(sleevesAssembly);
  const pantsAssembly=new THREE.Group();garment.add(pantsAssembly);pantsAssembly.visible=false;

  function meshFromGrid(rows,cols,fn,material){
    const vertices=[],uv=[],indices=[];
    for(let r=0;r<=rows;r++){
      const v=r/rows;
      for(let col=0;col<=cols;col++){
        const u=col/cols,pt=fn(u,v,r,col);
        vertices.push(pt.x,pt.y,pt.z);uv.push(u,v);
      }
    }
    for(let r=0;r<rows;r++)for(let col=0;col<cols;col++){
      const a=r*(cols+1)+col,b=a+cols+1;indices.push(a,b,a+1,b,b+1,a+1);
    }
    const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(vertices,3));g.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));g.setIndex(indices);g.computeVertexNormals();
    return new THREE.Mesh(g,material);
  }
  // Full, softly gathered midi skirt: narrow waist, broad hem, slight natural folds.
  const skirt=meshFromGrid(72,128,(u,v)=>{
    const a=u*Math.PI*2;
    const r=.34+1.05*Math.pow(v,1.18);
    const fold=(Math.sin(a*9+v*4.2)*.035+Math.sin(a*17-v*3.1)*.012)*(.25+.75*v);
    const radius=r+fold;
    const y=.12-2.34*v+.018*Math.sin(a*8+v*5)*v;
    return new THREE.Vector3(Math.cos(a)*radius,y,Math.sin(a)*radius*.60);
  },cloth);
  skirtAssembly.add(skirt);
  // Tier seam trims follow the same flare and are positioned as delicate stitched rows.
  function tierRing(v){
    const r=.34+1.05*Math.pow(v,1.18),y=.12-2.34*v;
    const points=[];for(let i=0;i<=160;i++){const a=i/160*Math.PI*2,rr=r+(Math.sin(a*9+v*4.2)*.035)*(.25+.75*v);points.push(new THREE.Vector3(Math.cos(a)*rr,y,Math.sin(a)*rr*.60));}
    const curve=new THREE.CatmullRomCurve3(points);
    const line=new THREE.Mesh(new THREE.TubeGeometry(curve,160,.009,5,false),stitch);skirtAssembly.add(line);
  }
  tierRing(.36);tierRing(.70);tierRing(.91);

  // Fitted bodice with a lowered square front neckline and a natural back neckline.
  const bodice=meshFromGrid(42,128,(u,v)=>{
    const a=u*Math.PI*2;
    const bottom=-.03;
    const top=1.06-.22*Math.pow(Math.max(0,Math.sin(a)),14);
    const y=bottom+(top-bottom)*v;
    const rx=.34+.125*Math.sin(Math.min(1,v)*Math.PI*.82);
    const rz=.235+.055*Math.sin(Math.min(1,v)*Math.PI*.82);
    const waistPinch=1-.055*Math.exp(-Math.pow((v-.18)/.10,2));
    return new THREE.Vector3(Math.cos(a)*rx*waistPinch,y,Math.sin(a)*rz*waistPinch);
  },cloth);
  bodiceAssembly.add(bodice);
  // Smocking rows around the bodice, subtle enough to preserve the clean product look.
  for(let i=0;i<8;i++){
    const v=.34+i*.055,points=[];
    for(let j=0;j<=100;j++){
      const a=j/100*Math.PI*2,top=1.06-.22*Math.pow(Math.max(0,Math.sin(a)),14),y=-.03+(top+.03)*v;
      const rx=.34+.125*Math.sin(v*Math.PI*.82),rz=.235+.055*Math.sin(v*Math.PI*.82);
      points.push(new THREE.Vector3(Math.cos(a)*rx*1.006,y,Math.sin(a)*rz*1.012));
    }
    const curve=new THREE.CatmullRomCurve3(points);
    bodiceAssembly.add(new THREE.Mesh(new THREE.TubeGeometry(curve,100,.006,4,false),stitch));
  }
  // Square neckline piping: front edge and short side rises.
  const necklinePoints=[
    new THREE.Vector3(-.43,.87,.17),new THREE.Vector3(-.36,.84,.23),new THREE.Vector3(-.20,.84,.265),
    new THREE.Vector3(0,.84,.27),new THREE.Vector3(.20,.84,.265),new THREE.Vector3(.36,.84,.23),new THREE.Vector3(.43,.87,.17)
  ];
  const neckCurve=new THREE.CatmullRomCurve3(necklinePoints);
  bodiceAssembly.add(new THREE.Mesh(new THREE.TubeGeometry(neckCurve,64,.025,8,false),piping));
  // Shoulder straps and back neckline finish.
  for(const sign of [-1,1]){
    const strapCurve=new THREE.CatmullRomCurve3([
      new THREE.Vector3(sign*.43,.87,.17),new THREE.Vector3(sign*.47,.99,.12),new THREE.Vector3(sign*.43,1.08,0),new THREE.Vector3(sign*.35,1.08,-.16)
    ]);
    bodiceAssembly.add(new THREE.Mesh(new THREE.TubeGeometry(strapCurve,28,.023,8,false),piping));
  }
  // Waist seam with a subtle self-fabric band.
  const waistPts=[];for(let i=0;i<=128;i++){const a=i/128*Math.PI*2;waistPts.push(new THREE.Vector3(Math.cos(a)*.355,.035,Math.sin(a)*.245));}
  bodiceAssembly.add(new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(waistPts),128,.018,6,false),piping));

  // Short, softly puffed sleeves and their gathered cuffs.
  function puffSleeve(side){
    const sleeve=new THREE.Mesh(new THREE.SphereGeometry(1,56,40),cloth);
    sleeve.scale.set(.34,.30,.285);sleeve.position.set(side*.52,.76,0);sleeve.rotation.z=-side*.18;sleevesAssembly.add(sleeve);
    const cuffPts=[];const cx=side*.73,cy=.58;
    for(let i=0;i<=96;i++){const a=i/96*Math.PI*2;cuffPts.push(new THREE.Vector3(cx,cy+Math.cos(a)*.135,Math.sin(a)*.205));}
    sleevesAssembly.add(new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(cuffPts),96,.021,6,false),piping));
    // small sleeve-gather rows around the crown
    for(let k=0;k<3;k++){
      const ring=new THREE.Mesh(new THREE.TorusGeometry(.24-k*.018,.006,5,64),stitch);
      ring.position.set(side*.52,.79+k*.055,0);ring.rotation.y=Math.PI/2;ring.rotation.z=-side*.18;sleevesAssembly.add(ring);
    }
  }
  puffSleeve(-1);puffSleeve(1);

  // Wide-leg one-piece option for catalogue Style 6821.
  for(const side of [-1,1]){
    const leg=new THREE.Mesh(new THREE.CylinderGeometry(.32,.25,2.34,64,2,true),cloth);
    leg.position.set(side*.19,-1.20,0);pantsAssembly.add(leg);
    const inner=new THREE.Mesh(new THREE.CylinderGeometry(.305,.238,2.32,64,2,true),lining);
    inner.position.copy(leg.position);pantsAssembly.add(inner);
  }
  const pantWaist=new THREE.Mesh(new THREE.TorusGeometry(.36,.025,8,96),piping);
  pantWaist.position.y=-.015;pantsAssembly.add(pantWaist);

  // Delicate hem scallops / stitch edge.
  const hemPts=[];for(let i=0;i<=192;i++){const a=i/192*Math.PI*2;const r=1.39+.022*Math.sin(a*24);hemPts.push(new THREE.Vector3(Math.cos(a)*r,-2.22,Math.sin(a)*r*.60));}
  skirtAssembly.add(new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(hemPts),192,.018,6,false),piping));
  garment.position.y=.15;garment.rotation.y=-.28;

  // Floating atelier turntable and soft contact shadow.
  const shadow=new THREE.Mesh(new THREE.CircleGeometry(1.9,96),new THREE.MeshBasicMaterial({color:0x786751,transparent:true,opacity:.12}));shadow.rotation.x=-Math.PI/2;shadow.position.set(0,-2.25,0);scene.add(shadow);
  const orbitMat=new THREE.MeshBasicMaterial({color:0xbba17e,transparent:true,opacity:.42});
  const orbit=new THREE.Mesh(new THREE.TorusGeometry(1.65,.008,5,128),orbitMat);orbit.rotation.x=Math.PI/2;orbit.position.y=-2.12;orbit.scale.z=.62;scene.add(orbit);

  // Drag to rotate; wheel to zoom; buttons pause and reset.
  canvas.addEventListener('pointerdown',e=>{drag=true;lastX=e.clientX;lastY=e.clientY;canvas.setPointerCapture?.(e.pointerId);});
  canvas.addEventListener('pointermove',e=>{if(!drag)return;const dx=e.clientX-lastX,dy=e.clientY-lastY;garment.rotation.y+=dx*.009;garment.rotation.x=Math.max(-.16,Math.min(.16,garment.rotation.x+dy*.002));lastX=e.clientX;lastY=e.clientY;});
  const stopDrag=()=>{drag=false;};canvas.addEventListener('pointerup',stopDrag);canvas.addEventListener('pointercancel',stopDrag);canvas.addEventListener('pointerleave',stopDrag);
  canvas.addEventListener('wheel',e=>{e.preventDefault();camera.position.z=Math.max(6.5,Math.min(11.5,camera.position.z+e.deltaY*.006));},{passive:false});
  reset?.addEventListener('click',()=>{garment.rotation.set(0,-.28,0);camera.position.set(0,0,initialCameraZ);});
  // White, ivory and powder-blue fabric previews.
  document.querySelectorAll('[data-dress-tone]').forEach(btn=>btn.addEventListener('click',()=>{
    const hex=btn.dataset.dressTone==='blue'?0xc4d3dc:(btn.dataset.dressTone==='sand'?0xe5d2b6:0xffffff);
    cloth.color.setHex(hex);document.querySelectorAll('[data-dress-tone]').forEach(b=>b.classList.toggle('is-active',b===btn));
  }));

  const resize=()=>{const w=stage.clientWidth,h=stage.clientHeight;if(!w||!h)return;camera.aspect=w/h;camera.updateProjectionMatrix();renderer.setSize(w,h,false);};
  const ro=new ResizeObserver(resize);ro.observe(stage);
  const inView=new IntersectionObserver(entries=>{if(entries[0].isIntersecting){if(!raf)animate();}else if(raf){cancelAnimationFrame(raf);raf=0;}},{threshold:.02});inView.observe(stage);
  function animate(){raf=requestAnimationFrame(animate);if(spin&&!drag)garment.rotation.y+=.0031;garment.position.y=.15+Math.sin(performance.now()*.0009)*.018;renderer.render(scene,camera);}
  stage.classList.add('has-webgl');if(fallback)fallback.setAttribute('aria-hidden','true');
  syncToggle();animate();
  window.addEventListener('pagehide',()=>{if(raf)cancelAnimationFrame(raf);ro.disconnect();inView.disconnect();renderer.dispose();maps.map.dispose();maps.alphaMap.dispose();});
  // Controls exposed to the design workspace. They affect the 3D concept only.
  let currentFabric='cotton',currentPattern='plain',customTexture=null;
  const trimMeshes=[];garment.traverse(o=>{if(o.isMesh&&(o.material===piping||o.material===stitch))trimMeshes.push(o);});
  function makeSurfaceTexture(fabricType,patternType){
    const size=512,c=document.createElement('canvas');c.width=c.height=size;const ctx=c.getContext('2d');
    ctx.fillStyle=fabricType==='linen'?'#e8dfd2':fabricType==='drape'?'#eee6d9':'#f3ede2';ctx.fillRect(0,0,size,size);
    if(fabricType==='linen'||fabricType==='cotton'){for(let i=0;i<size;i+=fabricType==='linen'?5:8){ctx.strokeStyle=fabricType==='linen'?'rgba(133,112,88,.13)':'rgba(154,137,113,.08)';ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(i,0);ctx.lineTo(i,size);ctx.stroke();ctx.beginPath();ctx.moveTo(0,i);ctx.lineTo(size,i);ctx.stroke();}}
    if(fabricType==='drape'){for(let i=0;i<50;i++){ctx.strokeStyle='rgba(255,255,255,.12)';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(i*13,0);ctx.bezierCurveTo(i*13-35,170,i*13+35,320,i*13,512);ctx.stroke();}}
    if(patternType==='stripe'){ctx.strokeStyle='rgba(114,96,76,.56)';ctx.lineWidth=5;for(let x=-512;x<size+512;x+=54){ctx.beginPath();ctx.moveTo(x,0);ctx.lineTo(x+512,size);ctx.stroke();}}
    else if(patternType==='floral'){for(let y=24;y<size;y+=90)for(let x=24;x<size;x+=90){ctx.save();ctx.translate(x,y);ctx.strokeStyle='rgba(125,104,82,.68)';ctx.lineWidth=2;for(let k=0;k<6;k++){ctx.rotate(Math.PI/3);ctx.beginPath();ctx.ellipse(0,17,7,16,0,0,Math.PI*2);ctx.stroke();}ctx.beginPath();ctx.arc(0,0,4,0,Math.PI*2);ctx.fillStyle='rgba(150,124,91,.8)';ctx.fill();ctx.restore();}}
    const texture=new THREE.CanvasTexture(c);texture.wrapS=texture.wrapT=THREE.RepeatWrapping;texture.repeat.set(fabricType==='drape'?1.15:1.7,2);texture.colorSpace=THREE.SRGBColorSpace;texture.anisotropy=renderer.capabilities.getMaxAnisotropy();return texture;
  }
  function applySurface(){if(customTexture){customTexture.dispose();customTexture=null;}if(currentPattern==='eyelet'){cloth.map=maps.map;cloth.alphaMap=maps.alphaMap;cloth.transparent=true;cloth.alphaTest=.16;cloth.roughness=.86;}else{customTexture=makeSurfaceTexture(currentFabric,currentPattern);cloth.map=customTexture;cloth.alphaMap=null;cloth.transparent=false;cloth.alphaTest=0;cloth.roughness=currentFabric==='drape'?.48:(currentFabric==='linen'?.98:.88);}cloth.needsUpdate=true;}
  const styleProfiles=[
    {skirt:[1,1,1],bodice:[1,1,1],sleeves:[1,1,1]},
    {pants:true,skirt:[1,1,1],bodice:[1.06,1,1.04],sleeves:[.88,.92,.9]},
    {skirt:[.76,1.04,.82],bodice:[.96,1,1],sleeves:[.9,1,.92]},
    {skirt:[.92,1.08,.94],bodice:[1.04,1.02,1.04],sleeves:[.96,1,1]},
    {skirt:[1.13,1.08,1.12],bodice:[1,1,1],sleeves:[1.04,1,1.04]},
    {skirt:[1.27,1.02,1.24],bodice:[1.02,1,1.02],sleeves:[1.1,1.02,1.1]},
    {skirt:[1.03,1.18,1.02],bodice:[.96,1.06,.96],sleeves:[.92,.96,.92]}
  ];
  function applyStyle(index){
    const p=styleProfiles[Math.max(0,Math.min(styleProfiles.length-1,Number(index)||0))];
    skirtAssembly.visible=!p.pants;pantsAssembly.visible=!!p.pants;
    skirtAssembly.scale.set(...p.skirt);bodiceAssembly.scale.set(...p.bodice);sleevesAssembly.scale.set(...p.sleeves);
  }
  applyStyle(0);
  window.ManishaDressStudio={
    setStyle(index){applyStyle(index);},
    setTone(hex){cloth.color.set(hex);cloth.needsUpdate=true;},
    setFabric(name){currentFabric=name;applySurface();},
    setPattern(name){currentPattern=name;applySurface();},
    setTrims(show){trimMeshes.forEach(m=>m.visible=!!show);},
    zoom(delta){camera.position.z=Math.max(6.3,Math.min(12,camera.position.z+delta));},
    reset(){garment.rotation.set(0,-.28,0);camera.position.set(0,0,initialCameraZ);spin=true;syncToggle();currentFabric='cotton';currentPattern='plain';applySurface();cloth.color.set('#fffdf7');applyStyle(0);this.setTrims(true);},
    pause(){spin=false;syncToggle();},resume(){spin=true;syncToggle();}
  };

})();
