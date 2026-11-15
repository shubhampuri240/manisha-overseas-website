/* Manisha Overseas · digital atelier.
   Procedural garment studies are editable concepts, not digital twins or fit models. */
(() => {
  'use strict';
  let canvas = document.getElementById('dress-canvas');
  if (!canvas) return;
  const stage = canvas.parentElement;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const state = {backend:'pending', ready:false, style:0, tone:'#fffdf7', fabric:'cotton', pattern:'plain', trims:true, view:'orbit', lighting:'daylight', motion:'still', spinning:!reduced.matches};
  const clamp = (n,a,b) => Math.max(a, Math.min(b,n));
  let change = () => {}, draw = () => {}, frame = 0, visible = true, interacting = false;
  let targetAngle = -.2, angle = -.2, targetPitch = .025, pitch = .025, distance = 9.4, targetDistance = 9.4, cameraFocus = -.62, targetFocus = -.62;
  let pointers = new Map(), lastX = 0, lastY = 0, pinchDistance = 0;
  let lastTime = 0, elapsed = 0, alive = true;
  function emit(name='studio:state') {
    stage.dataset.renderer = state.backend;
    window.dispatchEvent(new CustomEvent(name,{detail:{...state}}));
  }
  function wake() { if (alive && state.backend!=='unavailable' && !frame && !document.hidden && visible) frame=requestAnimationFrame(tick); }
  function tick(now) {
    frame=0;
    if (!alive || document.hidden || !visible) return;
    if (stage.classList.contains('is-photo-mode')) {lastTime=0;return;}
    const dt=Math.min((now-(lastTime||now))/1000,.045);lastTime=now;elapsed+=dt;
    if (state.spinning && !interacting) targetAngle+=dt*.16;
    const damp=1-Math.exp(-dt*9);
    angle+=(targetAngle-angle)*damp;pitch+=(targetPitch-pitch)*damp;
    distance+=(targetDistance-distance)*damp;cameraFocus+=(targetFocus-cameraFocus)*damp;
    draw(elapsed,dt);
    const transitioning=Math.abs(targetAngle-angle)>.0002 || Math.abs(targetPitch-pitch)>.0002 || Math.abs(targetDistance-distance)>.001 || Math.abs(targetFocus-cameraFocus)>.001;
    if (state.spinning || (state.motion==='breeze'&&!reduced.matches) || transitioning || interacting || change.pending) wake();
  }
  function invalidate() { change();wake(); }
  const api = {
    setStyle(index) { state.style=clamp(Math.round(Number(index)||0),0,6);change('style');emit();wake(); },
    setTone(hex) { if(/^#[0-9a-f]{6}$/i.test(hex)) {state.tone=hex;invalidate();emit();} },
    setFabric(name) { state.fabric=['cotton','linen','drape','eyelet'].includes(name)?name:'cotton';invalidate();emit(); },
    setPattern(name) { state.pattern=['plain','stripe','floral','eyelet'].includes(name)?name:'plain';invalidate();emit(); },
    setTrims(value) {state.trims=!!value;invalidate();emit();},
    zoom(delta) {targetDistance=clamp(targetDistance+Number(delta||0),5.1,11.5);wake();},
    setView(view) {
      state.view=['front','back','detail','orbit'].includes(view)?view:'front';
      targetPitch=state.view==='detail'?.02:.025;
      if(state.view==='detail'){targetAngle=-.12;targetDistance=5.1;targetFocus=.4;state.spinning=false;}
      else {targetDistance=9.4;targetFocus=-.62;const turns=Math.round(targetAngle/(Math.PI*2))*Math.PI*2;targetAngle=turns+(state.view==='back'?Math.PI:state.view==='orbit'?-.32:0);state.spinning=state.view==='orbit'&&!reduced.matches;}
      emit();wake();
    },
    setLighting(name) {state.lighting=['daylight','warm','gallery'].includes(name)?name:'daylight';invalidate();emit();},
    setMotion(name) {state.motion=name==='breeze'?'breeze':'still';invalidate();emit();},
    pause() {state.spinning=false;emit();wake();},
    resume() {state.spinning=true;state.view='orbit';emit();wake();},
    reset() {Object.assign(state,{tone:'#fffdf7',fabric:'cotton',pattern:'plain',trims:true,motion:'still',lighting:'daylight'});change('style');this.setView('orbit');},
    capture() {try {draw(elapsed,0);return canvas.toDataURL('image/png');}catch {return null;}},
    getState() {return {...state,angle,distance};}
  };
  window.ManishaDressStudio=api;
  // The controller owns zoom/reset buttons; this engine owns canvas gestures.
  function installGestures() {
    canvas.addEventListener('pointerdown',event=>{
      pointers.set(event.pointerId,{x:event.clientX,y:event.clientY});interacting=true;lastX=event.clientX;lastY=event.clientY;state.view='manual';state.spinning=false;emit();
      canvas.setPointerCapture?.(event.pointerId);canvas.style.cursor='grabbing';
      if(pointers.size===2){const p=[...pointers.values()];pinchDistance=Math.hypot(p[0].x-p[1].x,p[0].y-p[1].y);}
      wake();
    });
    canvas.addEventListener('pointermove',event=>{
      if(!pointers.has(event.pointerId))return;
      pointers.set(event.pointerId,{x:event.clientX,y:event.clientY});
      if(pointers.size===2){const p=[...pointers.values()],d=Math.hypot(p[0].x-p[1].x,p[0].y-p[1].y);targetDistance=clamp(targetDistance-(d-pinchDistance)*.016,5.1,11.5);pinchDistance=d;}
      else {targetAngle+=(event.clientX-lastX)*.009;targetPitch=clamp(targetPitch+(event.clientY-lastY)*.0022,-.2,.2);}
      lastX=event.clientX;lastY=event.clientY;wake();
    });
    const release=event=>{pointers.delete(event.pointerId);interacting=pointers.size>0;if(!interacting)canvas.style.cursor='grab';else{const p=[...pointers.values()][0];lastX=p.x;lastY=p.y;}wake();};
    canvas.addEventListener('pointerup',release);canvas.addEventListener('pointercancel',release);canvas.addEventListener('lostpointercapture',release);
    canvas.addEventListener('wheel',event=>{if(!event.ctrlKey && matchMedia('(pointer:coarse)').matches)return;event.preventDefault();api.zoom(clamp(event.deltaY,-120,120)*.004);},{passive:false});
    canvas.tabIndex=0;
    canvas.setAttribute('aria-label','3D garment concept. Use arrow keys to rotate, plus and minus to zoom.');
    canvas.addEventListener('keydown',event=>{
      if(['ArrowLeft','ArrowRight','ArrowUp','ArrowDown','+','=','-'].includes(event.key)){event.preventDefault();state.view='manual';state.spinning=false;emit();
        if(event.key==='ArrowLeft')targetAngle-=.22;if(event.key==='ArrowRight')targetAngle+=.22;
        if(event.key==='ArrowUp')targetPitch=clamp(targetPitch-.06,-.2,.2);if(event.key==='ArrowDown')targetPitch=clamp(targetPitch+.06,-.2,.2);
        if(event.key==='+'||event.key==='=')api.zoom(-.4);if(event.key==='-')api.zoom(.4);wake();
      }
    });
  }
  let resize=()=>{}, cleanup=()=>{};
  function installFallback() {
    // A labelled, responsive 2D study still lets buyers explore colour and silhouette.
    let context;
    try {context=canvas.getContext('2d');}catch {}
    if(!context){const replacement=document.createElement('canvas');replacement.id=canvas.id;canvas.replaceWith(replacement);canvas=replacement;context=canvas.getContext('2d');}
    state.backend='2d';state.ready=!!context;stage.classList.add('has-2d-fallback');stage.classList.remove('has-webgl');
    const fallback=stage.querySelector('.studio-fallback');if(fallback)fallback.hidden=!!context;
    if(!context){emit('studio:ready');return;}
    const c=context;
    resize=()=>{const d=Math.min(devicePixelRatio||1,1.5);canvas.width=Math.round(stage.clientWidth*d);canvas.height=Math.round(stage.clientHeight*d);canvas.style.width='100%';canvas.style.height='100%';c.setTransform(d,0,0,d,0,0);wake();};
    change=()=>{};
    draw=()=>{
      const w=stage.clientWidth,h=stage.clientHeight,s=Math.min(w/440,h/540)*(8.6/distance),isPants=state.style===1;
      c.clearRect(0,0,w,h);c.fillStyle=state.lighting==='warm'?'#eee1ce':'#edeae3';c.fillRect(0,0,w,h);
      c.save();c.translate(w/2,h*.47+(cameraFocus+.4)*65);c.scale(s,s);
      c.fillStyle='#71806c22';c.beginPath();c.ellipse(0,220,138,14,0,0,Math.PI*2);c.fill();
      c.scale(.78+Math.abs(Math.cos(angle))*.22,1);
      c.beginPath();c.moveTo(-42,-175);c.bezierCurveTo(-17,-128,17,-128,42,-175);c.lineTo(63,-145);c.lineTo(43,-45);
      if(isPants){c.lineTo(75,204);c.lineTo(9,204);c.lineTo(0,20);c.lineTo(-9,204);c.lineTo(-75,204);}
      else {const flare=[116,0,98,120,136,149,126][state.style];c.bezierCurveTo(65,40,flare,135,flare,204);c.quadraticCurveTo(0,220,-flare,204);c.bezierCurveTo(-flare,135,-65,40,-43,-45);}
      c.lineTo(-63,-145);c.closePath();
      const gradient=c.createLinearGradient(-130,0,130,0);gradient.addColorStop(0,'#6b7668');gradient.addColorStop(.22,state.tone);gradient.addColorStop(.46,'#ffffff');gradient.addColorStop(.68,state.tone);gradient.addColorStop(1,'#7b8174');c.fillStyle=gradient;c.fill();
      c.save();c.clip();c.lineWidth=state.fabric==='linen'?1:.5;c.strokeStyle='#64715a26';for(let x=-160;x<160;x+=8){c.beginPath();c.moveTo(x,-190);c.bezierCurveTo(x*.58,-40,x*.7,90,x*1.2,230);c.stroke();}
      if(state.pattern==='stripe'){c.strokeStyle='#55604688';c.lineWidth=3;for(let x=-180;x<180;x+=27){c.beginPath();c.moveTo(x,-210);c.lineTo(x+60,240);c.stroke();}}
      if(state.pattern==='floral'||state.pattern==='eyelet'){c.strokeStyle='#77856788';for(let y=-150;y<220;y+=36)for(let x=-140;x<140;x+=31){c.beginPath();for(let k=0;k<6;k++){const a=k*Math.PI/3;c.ellipse(x+Math.cos(a)*6,y+Math.sin(a)*6,3,6,a,0,Math.PI*2);}c.stroke();}}
      c.restore();if(state.trims){c.strokeStyle='#99886d';c.lineWidth=1.2;c.beginPath();c.moveTo(-43,-45);c.lineTo(43,-45);c.stroke();}
      c.restore();c.fillStyle='#657261';c.font='10px Arial';c.textAlign='center';c.fillText('2D SILHOUETTE PREVIEW',w/2,h-25);
    };
    resize();installGestures();emit('studio:ready');wake();
  }
  function installWebGL() {
    const T=window.THREE;
    if(!T){installFallback();return;}
    let renderer;
    try {renderer=new T.WebGLRenderer({canvas,alpha:false,antialias:true,preserveDrawingBuffer:true,powerPreference:'high-performance'});}catch {installFallback();return;}
    renderer.setPixelRatio(Math.min(devicePixelRatio||1,innerWidth<720?1.35:1.75));
    renderer.outputColorSpace=T.SRGBColorSpace;renderer.toneMapping=T.ACESFilmicToneMapping;renderer.toneMappingExposure=1.14;
    renderer.shadowMap.enabled=true;renderer.shadowMap.type=T.PCFSoftShadowMap;
    const scene=new T.Scene();scene.background=new T.Color('#eee9df');scene.fog=new T.Fog('#eee9df',14,28);
    const camera=new T.PerspectiveCamera(32,1,.1,50);
    const hemi=new T.HemisphereLight('#fffaf0','#c5c6b7',.9);scene.add(hemi);
    const key=new T.DirectionalLight('#fff4dc',1.8);key.position.set(-3.5,5,5.5);key.castShadow=true;key.shadow.mapSize.set(1024,1024);key.shadow.camera.left=-4;key.shadow.camera.right=4;key.shadow.camera.top=4;key.shadow.camera.bottom=-4;key.shadow.normalBias=.035;key.shadow.bias=-.00025;key.shadow.radius=5;scene.add(key);
    const fill=new T.DirectionalLight('#d8e8ed',.6);fill.position.set(4,2,3);scene.add(fill);
    const rim=new T.DirectionalLight('#fff8e8',1.05);rim.position.set(1,3,-4);scene.add(rim);
    const targetTone=new T.Color(state.tone);
    const cloth=new T.MeshPhysicalMaterial({color:state.tone,roughness:.77,metalness:0,side:T.DoubleSide,sheen:.8,sheenColor:new T.Color('#e9e4d7'),sheenRoughness:.7,bumpScale:.016});
    const lining=new T.MeshStandardMaterial({color:state.tone,roughness:.9,side:T.DoubleSide});
    const seam=new T.MeshStandardMaterial({color:'#c5bda9',roughness:.87});
    const root=new T.Group();scene.add(root);
    const garment=new T.Group();root.add(garment);
    const trimGroup=new T.Group();garment.add(trimGroup);
    let clothParts=[],textures=[],transition=1,currentSurface='';
    const profiles=[
      {flare:1.02,length:2.55,neck:.26,sleeve:0,tiers:0,back:.96},
      {pants:true,flare:.95,length:2.48,neck:.36,sleeve:.42,tiers:0,back:.96},
      {flare:.90,length:2.54,neck:.40,sleeve:.60,tiers:0,back:1.01},
      {flare:1.05,length:2.59,neck:.30,sleeve:0,tiers:0,back:.64},
      {flare:1.14,length:2.51,neck:.36,sleeve:.28,tiers:3,back:1.01},
      {flare:1.25,length:2.54,neck:.30,sleeve:.22,tiers:3,back:1.01},
      {flare:1.04,length:2.66,neck:.24,sleeve:0,tiers:2,back:.98}
    ];
    function grid(rows,cols,fn,material=cloth,include=()=>true){
      const pos=[],uv=[],indices=[];
      for(let row=0;row<=rows;row++)for(let col=0;col<=cols;col++){const p=fn(col/cols,row/rows);pos.push(...p);uv.push(col/cols,row/rows);}
      for(let row=0;row<rows;row++)for(let col=0;col<cols;col++){if(!include((col+.5)/cols,(row+.5)/rows))continue;const a=row*(cols+1)+col,b=a+cols+1;indices.push(a,b,a+1,b,b+1,a+1);}
      const geo=new T.BufferGeometry();geo.setAttribute('position',new T.Float32BufferAttribute(pos,3));geo.setAttribute('uv',new T.Float32BufferAttribute(uv,2));geo.setIndex(indices);geo.computeVertexNormals();
      const mesh=new T.Mesh(geo,material);mesh.castShadow=true;mesh.receiveShadow=true;return mesh;
    }
    function thread(points,width=.006){const m=new T.Mesh(new T.TubeGeometry(new T.CatmullRomCurve3(points),Math.max(24,points.length*2),width,4,false),seam);trimGroup.add(m);return m;}
    function skirtPoint(u,v,p){
      const a=u*Math.PI*2,base=.37+p.flare*Math.pow(v,1.22),fold=(Math.sin(a*12+v*.7)*.065+Math.sin(a*23-v*1.3)*.014)*(.22+v*.78);
      const r=base+fold;return [Math.cos(a)*r,.01-p.length*v+.008*Math.sin(a*12)*v,Math.sin(a)*r*.57];
    }
    function rebuild(){
      [...garment.children].forEach(child=>{if(child===trimGroup)return;garment.remove(child);child.traverse(o=>o.geometry?.dispose());});
      [...trimGroup.children].forEach(child=>{trimGroup.remove(child);child.geometry?.dispose();});clothParts=[];
      const p=profiles[state.style];
      const torsoPoint=(u,v)=>{
        const a=u*Math.PI*2,front=Math.max(0,Math.sin(a)),back=Math.max(0,-Math.sin(a));
        const top=1.18-p.neck*Math.pow(front,5)-(1.18-p.back)*Math.pow(back,6);
        const width=.37+.14*Math.sin(v*Math.PI*.78),depth=.235+.042*Math.sin(v*Math.PI*.8);
        const shoulder=1-.08*Math.pow(v,5)*Math.sin(a)**2;
        const pleat=.007*Math.sin(a*14)*Math.sin(v*Math.PI);
        return [Math.cos(a)*(width+pleat)*shoulder,top*v,Math.sin(a)*(depth+pleat)*shoulder];
      };
      const torso=grid(40,96,torsoPoint,cloth,(u,v)=>{const a=u*Math.PI*2,d=Math.min(a,Math.abs(a-Math.PI),Math.PI*2-a);return (d/.34)**2+((v-.755)/.225)**2>=1;});garment.add(torso);
      for(const side of[0,Math.PI]){const armhole=[];for(let i=0;i<=72;i++){const t=i/72*Math.PI*2;const a=side+Math.cos(t)*.34,v=.755+Math.sin(t)*.225;armhole.push(new T.Vector3(...torsoPoint(a/(Math.PI*2),v)));}thread(armhole,.008);}
      // A fine rolled neckline follows the actual upper edge of the garment mesh.
      const neckline=[];for(let i=0;i<=96;i++){const a=i/96*Math.PI*2,front=Math.max(0,Math.sin(a)),back=Math.max(0,-Math.sin(a));const y=1.18-p.neck*front**5-(1.18-p.back)*back**6,r=.37+.14*Math.sin(Math.PI*.78);neckline.push(new T.Vector3(Math.cos(a)*r*(1-.08*Math.sin(a)**2),y,Math.sin(a)*(.235+.042*Math.sin(Math.PI*.8))*(1-.08*Math.sin(a)**2)));}thread(neckline,.009);
      const waist=[];for(let i=0;i<=96;i++){const a=i/96*Math.PI*2;waist.push(new T.Vector3(Math.cos(a)*.377,.012,Math.sin(a)*.244));}thread(waist,.011);
      if(p.pants){
        for(const side of[-1,1]){
          const leg=grid(48,64,(u,v)=>{const a=u*Math.PI*2,r=.22+.15*Math.pow(v,.85),flute=.018*Math.sin(a*8+v)*v;return [side*(.205+.15*v)+Math.cos(a)*(r+flute),-.02-p.length*v,Math.sin(a)*(r+flute)*.76];});garment.add(leg);clothParts.push({mesh:leg,original:leg.geometry.attributes.position.array.slice()});
          const line=[];for(let j=0;j<=38;j++){const v=j/38;line.push(new T.Vector3(side*(.205+.15*v),-.02-p.length*v,(.22+.15*v)*.76+.005));}thread(line,.004);
        }
      }else{
        const skirt=grid(54,96,(u,v)=>skirtPoint(u,v,p));garment.add(skirt);clothParts.push({mesh:skirt,original:skirt.geometry.attributes.position.array.slice()});
        for(let tier=1;tier<=p.tiers;tier++){const v=tier/(p.tiers+1),line=[];for(let i=0;i<=96;i++)line.push(new T.Vector3(...skirtPoint(i/96,v,p)));thread(line,.005);}
        const hem=[];for(let i=0;i<=128;i++)hem.push(new T.Vector3(...skirtPoint(i/128,1,p)));thread(hem,.009);
        // A discreet inner lining keeps eyelet openings from exposing the whole form.
        const inner=grid(28,64,(u,v)=>{const pt=skirtPoint(u,v*.91,p);pt[0]*=.982;pt[2]*=.98;return pt;},lining);garment.add(inner);
      }
      if(p.sleeve){
        for(const side of[-1,1]){
          const sleeve=grid(22,48,(u,v)=>{const a=u*Math.PI*2,r=.255-.045*v+.025*Math.sin(v*Math.PI),length=p.sleeve;return [side*(.43+length*v),.94-.30*v+Math.cos(a)*r*.56,Math.sin(a)*r];});garment.add(sleeve);
          const cuff=[];for(let j=0;j<=64;j++){const a=j/64*Math.PI*2; cuff.push(new T.Vector3(side*(.43+p.sleeve),.64+Math.cos(a)*.21*.56,Math.sin(a)*.21));}thread(cuff,.008);
        }
      }
      // Long, delicate side seams read as tailoring rather than a wire overlay.
      for(const side of[-1,1]){const line=[];for(let i=0;i<=25;i++){const v=i/25;line.push(new T.Vector3(side*(.37+.14*Math.sin(v*Math.PI*.78)),v*1.18,0));}thread(line,.004);}
      transition=reduced.matches?1:.935;
    }
    function surface(){
      const keyName=state.fabric+'-'+state.pattern;if(keyName===currentSurface)return;currentSurface=keyName;
      textures.forEach(t=>t.dispose());textures=[];
      const size=512,c=document.createElement('canvas');c.width=c.height=size;const ctx=c.getContext('2d');
      ctx.fillStyle='#f1efe9';ctx.fillRect(0,0,size,size);
      const weave=state.fabric==='linen'?4:state.fabric==='drape'?9:6;
      for(let i=0;i<size;i+=weave){ctx.strokeStyle=i%(weave*2)?'#cecfc230':'#ffffff70';ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(i,0);ctx.lineTo(i,size);ctx.moveTo(0,i);ctx.lineTo(size,i);ctx.stroke();}
      if(state.pattern==='stripe'){ctx.strokeStyle='#6b7864';ctx.lineWidth=5;for(let x=0;x<size;x+=44){ctx.beginPath();ctx.moveTo(x,0);ctx.lineTo(x,size);ctx.stroke();}}
      if(state.pattern==='floral'||state.pattern==='eyelet'||state.fabric==='eyelet'){
        for(let y=34;y<size;y+=85)for(let x=34;x<size;x+=85){ctx.save();ctx.translate(x+(y%2)*15,y);ctx.strokeStyle=state.pattern==='floral'?'#667761':'#b6b8a5';ctx.lineWidth=state.pattern==='floral'?2.7:1.7;for(let k=0;k<6;k++){const a=k*Math.PI/3;ctx.beginPath();ctx.ellipse(Math.cos(a)*12,Math.sin(a)*12,6,11,a,0,Math.PI*2);ctx.stroke();}ctx.fillStyle='#9b9e87';ctx.beginPath();ctx.arc(0,0,3,0,Math.PI*2);ctx.fill();ctx.restore();}
      }
      const map=new T.CanvasTexture(c);map.wrapS=map.wrapT=T.RepeatWrapping;map.repeat.set(2.8,3.2);map.colorSpace=T.SRGBColorSpace;map.anisotropy=Math.min(renderer.capabilities.getMaxAnisotropy(),8);textures.push(map);cloth.map=map;
      const bumpCanvas=document.createElement('canvas');bumpCanvas.width=bumpCanvas.height=128;const b=bumpCanvas.getContext('2d');b.fillStyle='#888';b.fillRect(0,0,128,128);for(let i=0;i<128;i+=4){b.fillStyle='#999';b.fillRect(i,0,1,128);b.fillStyle='#777';b.fillRect(0,i,128,1);}const bump=new T.CanvasTexture(bumpCanvas);bump.wrapS=bump.wrapT=T.RepeatWrapping;bump.repeat.set(8,8);textures.push(bump);cloth.bumpMap=bump;cloth.bumpScale=state.fabric==='linen'?.032:state.fabric==='drape'?.007:.016;cloth.roughness=state.fabric==='drape'?.48:state.fabric==='linen'?.95:.77;
      cloth.needsUpdate=true;
    }
    // Real soft shadow on an ivory floor plus a low studio plinth.
    const floor=new T.Mesh(new T.PlaneGeometry(200,200),new T.MeshStandardMaterial({color:'#e4dfd5',roughness:1}));floor.rotation.x=-Math.PI/2;floor.position.y=-2.82;floor.receiveShadow=true;scene.add(floor);
    const plinth=new T.Mesh(new T.CylinderGeometry(1.72,1.76,.07,96),new T.MeshStandardMaterial({color:'#e8e3d8',roughness:.9}));plinth.position.y=-2.78;plinth.receiveShadow=true;scene.add(plinth);
    const ring=new T.Mesh(new T.TorusGeometry(1.70,.006,4,128),new T.MeshBasicMaterial({color:'#b7b09c'}));ring.rotation.x=Math.PI/2;ring.position.y=-2.737;scene.add(ring);
    const shadowCanvas=document.createElement('canvas');shadowCanvas.width=shadowCanvas.height=128;const sc=shadowCanvas.getContext('2d'),grad=sc.createRadialGradient(64,64,4,64,64,63);grad.addColorStop(0,'rgba(45,55,40,.22)');grad.addColorStop(.5,'rgba(45,55,40,.09)');grad.addColorStop(1,'rgba(45,55,40,0)');sc.fillStyle=grad;sc.fillRect(0,0,128,128);const shadowTexture=new T.CanvasTexture(shadowCanvas);const shadow=new T.Mesh(new T.PlaneGeometry(3.5,2.4),new T.MeshBasicMaterial({map:shadowTexture,transparent:true,depthWrite:false}));shadow.rotation.x=-Math.PI/2;shadow.position.set(0,-2.731,0);scene.add(shadow);
    const moods={daylight:{background:'#eee9df',key:'#fff4dc',fill:'#d8e8ed',intensity:1.8,exposure:.96},warm:{background:'#eddfca',key:'#ffd9a0',fill:'#efdfcc',intensity:1.9,exposure:.94},gallery:{background:'#dfe5df',key:'#f2f7ff',fill:'#a4c2c5',intensity:2.1,exposure:.94}};
    let lightMood='';
    change=reason=>{
      if(reason==='style')rebuild();targetTone.set(state.tone);surface();trimGroup.visible=state.trims;
      if(lightMood!==state.lighting){lightMood=state.lighting;const m=moods[lightMood];scene.background.set(m.background);scene.fog.color.set(m.background);floor.material.color.set(m.background);key.color.set(m.key);fill.color.set(m.fill);key.intensity=m.intensity;renderer.toneMappingExposure=m.exposure;}
      change.pending=true;
    };
    let normalFrame=0;
    draw=(time,dt)=>{
      const smooth=dt?1-Math.exp(-dt*8):1;
      cloth.color.lerp(targetTone,smooth);lining.color.lerp(targetTone,smooth);
      const colourDistance=Math.abs(cloth.color.r-targetTone.r)+Math.abs(cloth.color.g-targetTone.g)+Math.abs(cloth.color.b-targetTone.b);
      transition+=(1-transition)*smooth;root.scale.setScalar(transition);root.position.y=(1-transition)*.7;
      root.rotation.set(pitch,angle,0);
      const breeze=state.motion==='breeze'&&!reduced.matches;
      for(const part of clothParts){const positions=part.mesh.geometry.attributes.position,original=part.original;for(let i=0;i<positions.count;i++){const j=i*3,weight=clamp(-original[j+1]/2.7,0,1);positions.array[j]=original[j]+(breeze?Math.sin(time*1.3+original[j]*2+original[j+1]*1.5)*.025*weight*weight:0);positions.array[j+2]=original[j+2]+(breeze?Math.cos(time*1.1+original[j+1]*2+original[j]*2)*.016*weight:0);}positions.needsUpdate=true;if(normalFrame%8===0)part.mesh.geometry.computeVertexNormals();}normalFrame++;
      camera.position.set(0,cameraFocus+.45,distance);camera.lookAt(0,cameraFocus,0);renderer.render(scene,camera);
      change.pending=colourDistance>.001||transition<.9995;
    };
    resize=()=>{const w=stage.clientWidth,h=stage.clientHeight;if(!w||!h)return;camera.aspect=w/h;camera.updateProjectionMatrix();renderer.setSize(w,h,false);wake();};
    cleanup=()=>{garment.traverse(o=>o.geometry?.dispose());textures.forEach(t=>t.dispose());[cloth,lining,seam].forEach(m=>m.dispose());shadowTexture.dispose();renderer.dispose();};
    canvas.addEventListener('webglcontextlost',event=>{event.preventDefault();state.ready=false;state.backend='unavailable';emit();if(frame)cancelAnimationFrame(frame);frame=0;});
    canvas.addEventListener('webglcontextrestored',()=>{state.ready=true;state.backend='webgl';emit('studio:ready');wake();});
    rebuild();change();resize();installGestures();state.backend='webgl';state.ready=true;stage.classList.add('has-webgl');stage.classList.remove('has-2d-fallback');const fallback=stage.querySelector('.studio-fallback');if(fallback)fallback.hidden=true;emit('studio:ready');wake();
  }
  installWebGL();
  const observer=new ResizeObserver(()=>resize());observer.observe(stage);
  const intersection=new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;if(visible){lastTime=0;wake();}else if(frame){cancelAnimationFrame(frame);frame=0;}},{threshold:.01});intersection.observe(stage);
  document.addEventListener('visibilitychange',()=>{lastTime=0;if(document.hidden&&frame){cancelAnimationFrame(frame);frame=0;}else wake();});
  reduced.addEventListener('change',()=>{if(reduced.matches){state.spinning=false;state.motion='still';}emit();wake();});
  window.addEventListener('pagehide',event=>{if(frame)cancelAnimationFrame(frame);frame=0;if(event.persisted)return;alive=false;observer.disconnect();intersection.disconnect();cleanup();});
  window.addEventListener('pageshow',event=>{if(event.persisted){lastTime=0;wake();}});
})();
