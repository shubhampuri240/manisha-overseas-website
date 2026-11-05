/* Real-time procedural fabric sculpture. Three.js is optional: the editorial photo remains as graceful fallback. */
(()=>{
 const THREE=window.THREE;
 if(!THREE)return;
 const reduce=window.matchMedia&&window.matchMedia('(prefers-reduced-motion: reduce)').matches;
 function makeLaceTexture(){
  const c=document.createElement('canvas');c.width=c.height=768;const g=c.getContext('2d');
  g.fillStyle='#e9dfcf';g.fillRect(0,0,768,768);
  // fine textile grain
  for(let y=0;y<768;y+=4){g.strokeStyle=`rgba(130,108,80,${(y%8===0)?.08:.035})`;g.lineWidth=1;g.beginPath();g.moveTo(0,y);g.lineTo(768,y+2);g.stroke()}
  const cell=96;
  for(let cy=0;cy<8;cy++)for(let cx=0;cx<8;cx++){
   const x=cx*cell+48,y=cy*cell+48;
   g.save();g.translate(x,y);
   g.strokeStyle='rgba(156,126,90,.48)';g.lineWidth=3;
   g.beginPath();g.arc(0,0,32,0,Math.PI*2);g.stroke();
   for(let k=0;k<8;k++){const a=k*Math.PI/4;const px=Math.cos(a)*25,py=Math.sin(a)*25;
    g.beginPath();g.ellipse(px,py,10,18,a,0,Math.PI*2);g.stroke();
   }
   // cutwork openings (transparent) in a flower-like rosette
   g.globalCompositeOperation='destination-out';g.fillStyle='rgba(0,0,0,1)';
   g.beginPath();g.arc(0,0,7,0,Math.PI*2);g.fill();
   for(let k=0;k<8;k++){const a=k*Math.PI/4;g.beginPath();g.ellipse(Math.cos(a)*25,Math.sin(a)*25,5.3,10,a,0,Math.PI*2);g.fill()}
   g.globalCompositeOperation='source-over';
   g.fillStyle='rgba(255,255,255,.25)';g.beginPath();g.arc(0,0,2,0,Math.PI*2);g.fill();g.restore();
  }
  const t=new THREE.CanvasTexture(c);t.wrapS=t.wrapT=THREE.RepeatWrapping;t.repeat.set(2.5,2);t.colorSpace=THREE.SRGBColorSpace;return t;
 }
 function createScene(canvas,opts={}){
  if(!canvas)return null;
  const parent=canvas.parentElement;let renderer,scene,camera,mesh,geometry,raf=0,clock=0,pointer={x:0,y:0},target={x:0,y:0};
  try{renderer=new THREE.WebGLRenderer({canvas,alpha:true,antialias:true,powerPreference:'low-power'});}catch(e){canvas.style.display='none';return null;}
  renderer.setPixelRatio(Math.min(window.devicePixelRatio||1,window.innerWidth<700?1.15:1.45));renderer.setSize(parent.clientWidth,parent.clientHeight,false);renderer.outputColorSpace=THREE.SRGBColorSpace;
  scene=new THREE.Scene();camera=new THREE.PerspectiveCamera(36,parent.clientWidth/Math.max(parent.clientHeight,1),.1,100);camera.position.set(0,0,12);
  scene.add(new THREE.AmbientLight(0xffffff,1.45));
  const key=new THREE.DirectionalLight(0xffe6c7,2.7);key.position.set(-4,5,7);scene.add(key);
  const fill=new THREE.PointLight(0xffffff,2.2);fill.position.set(4,-2,4);scene.add(fill);
  geometry=new THREE.PlaneGeometry(opts.width||10.5,opts.height||6.1,opts.segments||120,opts.rows||72);
  const pos=geometry.attributes.position;const orig=new Float32Array(pos.array.length);orig.set(pos.array);
  const mat=new THREE.MeshPhysicalMaterial({map:makeLaceTexture(),color:opts.color||0xf4ead8,roughness:.82,metalness:0,side:THREE.DoubleSide,transparent:true,alphaTest:.15,clearcoat:.13,clearcoatRoughness:.8});
  mesh=new THREE.Mesh(geometry,mat);mesh.rotation.set(-.3,.12,-.08);mesh.position.set(opts.x||.7,opts.y||-.2,0);mesh.scale.setScalar(opts.scale||1);scene.add(mesh);
  // subtle embroidered gold orbit rings on the right, as a design accent
  const ringMat=new THREE.MeshBasicMaterial({color:0xd5b88d,transparent:true,opacity:.36,side:THREE.DoubleSide});
  const ring=new THREE.Mesh(new THREE.TorusGeometry(opts.ring||1.65,.012,5,120),ringMat);ring.position.set(1.6,.15,-.35);ring.rotation.set(.6,.2,.15);scene.add(ring);
  const ring2=new THREE.Mesh(new THREE.TorusGeometry((opts.ring||1.65)*1.12,.006,4,120),ringMat.clone());ring2.position.copy(ring.position);ring2.rotation.set(.7,.1,-.2);scene.add(ring2);
  const onMove=e=>{const r=canvas.getBoundingClientRect();target.x=((e.clientX-r.left)/r.width-.5)*2;target.y=-((e.clientY-r.top)/r.height-.5)*2;};
  canvas.addEventListener('pointermove',onMove,{passive:true});
  const resize=()=>{const w=parent.clientWidth,h=parent.clientHeight;if(!w||!h)return;camera.aspect=w/h;camera.updateProjectionMatrix();renderer.setSize(w,h,false);};
  const ro=new ResizeObserver(resize);ro.observe(parent);
  let visible=false;
  const start=()=>{if(visible&&!document.hidden&&!raf)raf=requestAnimationFrame(animate);};
  const stop=()=>{if(raf){cancelAnimationFrame(raf);raf=0;}};
  const viewObserver=new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;if(visible)start();else stop();},{threshold:.01});viewObserver.observe(parent);
  const onVisibility=()=>document.hidden?stop():start();document.addEventListener('visibilitychange',onVisibility);
  const animate=()=>{raf=0;if(!visible||document.hidden)return;clock+=reduce?0.002:0.012;pointer.x+=(target.x-pointer.x)*.035;pointer.y+=(target.y-pointer.y)*.035;
   const a=geometry.attributes.position;
   for(let i=0;i<a.count;i++){const x=orig[i*3],y=orig[i*3+1];const wave=Math.sin(x*1.1+clock*1.05)*.28+Math.cos(y*1.5-clock*.78)*.19+Math.sin((x+y)*.9+clock*.55)*.11;const influence=Math.exp(-((x-pointer.x*3.1)**2+(y-pointer.y*2.3)**2)*.16)*.23; a.array[i*3+2]=orig[i*3+2]+wave+influence;}
   a.needsUpdate=true;geometry.computeVertexNormals();mesh.rotation.y=.12+pointer.x*.045;mesh.rotation.x=-.3+pointer.y*.025;ring.rotation.z+=reduce?0.0005:.0017;ring2.rotation.z-=reduce?0.0003:.0011;renderer.render(scene,camera);raf=requestAnimationFrame(animate);
  };
  start();
  return{setMode(mode){target.x=mode==='calm'?0:target.x;target.y=mode==='calm'?0:target.y;},dispose(){stop();viewObserver.disconnect();ro.disconnect();document.removeEventListener('visibilitychange',onVisibility);canvas.removeEventListener('pointermove',onMove);geometry.dispose();mat.dispose();renderer.dispose();}};
 }
 const hero=createScene(document.getElementById('fabric-scene'),{width:10.5,height:6.1,segments:130,rows:80,x:1.1,y:-.1,scale:1.12,ring:1.35});
 const lab=createScene(document.getElementById('fabric-lab'),{width:9,height:5.2,segments:150,rows:90,x:0,y:0,scale:1,ring:1.45,color:0xf1e6d5});
 document.querySelectorAll('[data-motion]').forEach(btn=>btn.addEventListener('click',()=>{document.querySelectorAll('[data-motion]').forEach(b=>b.classList.toggle('active',b===btn));lab&&lab.setMode(btn.dataset.motion);}));
 // Intersection-based reveal, with optional GSAP enhancement.
 const reveal=document.querySelectorAll('.reveal-v3');
 if('IntersectionObserver'in window){const io=new IntersectionObserver(entries=>entries.forEach(e=>{if(e.isIntersecting){e.target.classList.add('is-visible');io.unobserve(e.target)}}),{threshold:.12});reveal.forEach(el=>io.observe(el));}else reveal.forEach(el=>el.classList.add('is-visible'));
 if(window.gsap&&window.ScrollTrigger&&!reduce){gsap.registerPlugin(ScrollTrigger);gsap.from('.proof-item',{y:18,opacity:0,duration:.8,stagger:.1,delay:.25,scrollTrigger:{trigger:'.proof-strip',start:'top 88%'}});gsap.from('.hero-copy-v3 .line-reveal',{y:65,opacity:0,duration:1,stagger:.16,ease:'power3.out',delay:.25});}
 window.addEventListener('pagehide',()=>{hero&&hero.dispose();lab&&lab.dispose();});
})();