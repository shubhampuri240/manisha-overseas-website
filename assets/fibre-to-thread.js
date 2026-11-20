/* Manisha Overseas — Fibre-to-thread cinematic illustration.
   Small self-contained canvas animation: no dependencies, no network access, no uploads.
   Animates only when in view; respects reduced motion and document visibility. */
(() => {
  "use strict";
  const root = document.querySelector(".mo-fibre-scene");
  const canvas = root && root.querySelector("canvas");
  if (!root || !canvas || !canvas.getContext) return;
  const reduced = matchMedia("(prefers-reduced-motion: reduce)");
  const ctx = canvas.getContext("2d", {alpha: true});
  if (!ctx) return;
  const play = root.querySelector(".mo-fibre-replay");
  const status = root.querySelector(".mo-fibre-state");
  const particles = [];
  const TAU = Math.PI * 2;
  let w = 520, h = 310, frame = 0, started = 0, onScreen = false, finished = false;
  function random(seed) { let n=Math.sin(seed*127.1+19.19)*43758.5453; return n-Math.floor(n); }
  for(let i=0;i<126;i++){
    const angle=random(i+1)*TAU, radius=Math.sqrt(random(i+241));
    particles.push({
      x:Math.cos(angle)*radius, y:Math.sin(angle)*radius,
      a:angle, r:radius,
      dest:random(i+827), jitter:random(i+1407),
      size:.55+random(i+761)*1.7
    });
  }
  function resize(){
    const rect=canvas.getBoundingClientRect();
    w=Math.max(220,rect.width); h=Math.max(140,rect.height);
    const ratio=Math.min(devicePixelRatio||1,2);
    canvas.width=Math.round(w*ratio);canvas.height=Math.round(h*ratio);
    ctx.setTransform(ratio,0,0,ratio,0,0);
  }
  const clamp=x=>Math.min(1,Math.max(0,x));
  const smooth=x=>{const t=clamp(x);return t*t*(3-2*t);};
  const lerp=(a,b,p)=>a+(b-a)*p;
  function lineY(x,phase){return h*.53 + Math.sin(x*2.8 + phase)*h*.012 + Math.sin(x*9-phase*.5)*h*.006;}
  function drawCloud(cx,cy,fade,time){
    ctx.save();ctx.globalAlpha=fade;
    const petals=[
      [-36,-12,33,30],[-12,-31,33,34],[23,-22,31,31],
      [39,6,28,29],[9,19,42,33],[-30,20,33,27],[1,-5,43,42]
    ];
    const scale=Math.min(w/480,h/280)*1.12;
    for(let i=0;i<petals.length;i++){
      const [ox,oy,rx,ry]=petals[i];
      const px=cx+ox*scale+Math.sin(time*.6+i)*1.8;
      const py=cy+oy*scale+Math.cos(time*.5+i)*1.5;
      const rr=Math.max(rx,ry)*scale;
      const gradient=ctx.createRadialGradient(px-rr*.3,py-rr*.4,rr*.07,px,py,rr*1.27);
      gradient.addColorStop(0,"#fffefa");
      gradient.addColorStop(.50,"#e8e1d2");
      gradient.addColorStop(1,"rgba(186,167,139,.14)");
      ctx.fillStyle=gradient;
      ctx.beginPath();ctx.ellipse(px,py,rx*scale,ry*scale,-.05,0,TAU);ctx.fill();
    }
    ctx.restore();
  }
  function drawWisp(x,y,dx,dy,alpha,thickness){
    ctx.strokeStyle="rgba(135,117,91,"+alpha+")";
    ctx.lineWidth=thickness;ctx.lineCap="round";
    ctx.beginPath();ctx.moveTo(x,y);
    ctx.quadraticCurveTo(x+dx*.46,y+dy*.18-4,x+dx,y+dy);ctx.stroke();
  }
  function draw(timestamp){
    if(!onScreen || document.hidden || reduced.matches) { frame=0; return; }
    if(!started) started=timestamp;
    const seconds=(timestamp-started)/1000, time=seconds%10.5;
    const progress=smooth((time-1.0)/4.8);
    const exit=1-smooth((time-9.25)/1.2);
    const alpha=exit;
    ctx.clearRect(0,0,w,h);
    ctx.save();ctx.globalAlpha=alpha;
    const cloudX=w*.235, cloudY=h*.52, yarnStart=w*.31, yarnEnd=w*.91;
    // A few fine horizontal guide marks: textile design sketch, not a loading bar.
    ctx.strokeStyle="rgba(97,84,66,.10)";ctx.lineWidth=1;
    for(let i=0;i<3;i++){ctx.beginPath();ctx.moveTo(w*.08,h*(.22+i*.27));ctx.lineTo(w*.92,h*(.22+i*.27));ctx.stroke();}
    drawCloud(cloudX,cloudY,1-smooth((time-1.4)/4.4),time);
    // Individual cotton filaments visibly converge into a twisting continuous strand.
    particles.forEach((part,i)=>{
      const a=part.a;
      const looseX=cloudX+part.x*w*.115 + Math.sin(time*.9+i)*3;
      const looseY=cloudY+part.y*h*.22 + Math.cos(time*.7+i)*3;
      const targetX=lerp(yarnStart,yarnEnd,part.dest);
      const phase=part.dest*19+seconds*1.25;
      const targetY=lineY(part.dest,seconds*.3)+Math.sin(phase+part.a)*4*(1-progress*.5);
      const local=smooth((progress*1.3-(part.dest*.31)));
      const x=lerp(looseX,targetX,local);
      const y=lerp(looseY,targetY,local);
      const opacity=.16+.58*(1-progress*.36);
      drawWisp(x,y,lerp(6,12,progress),Math.sin(a+time*.7)*3,opacity,part.size*.55);
    });
    // Yarn develops from the cluster outward, with three braided fibres in motion.
    const amount=smooth((time-1.9)/4.7);
    if(amount>0){
      for(let strand=0;strand<3;strand++){
        ctx.beginPath();
        const loops=Math.round(155*amount);
        for(let i=0;i<=loops;i++){
          const t=i/155,x=lerp(yarnStart,yarnEnd,t);
          const theta=t*37+seconds*(strand===1?-1.3:1.1)+strand*TAU/3;
          const y=lineY(t,0)+Math.sin(theta)*h*.012;
          if(i===0)ctx.moveTo(x,y);else ctx.lineTo(x,y);
        }
        ctx.strokeStyle=["#ad9070","#c5ae90","#826f60"][strand];
        ctx.lineWidth=strand===1?2.2:1.15;ctx.lineCap="round";ctx.stroke();
      }
      // One bright core gives the thread definition even at mobile sizes.
      ctx.beginPath();
      for(let i=0;i<=Math.round(140*amount);i++){
        let t=i/140, x=lerp(yarnStart,yarnEnd,t),y=lineY(t,0);
        if(i===0)ctx.moveTo(x,y);else ctx.lineTo(x,y);
      }
      ctx.strokeStyle="rgba(250,246,234,.85)";ctx.lineWidth=1.1;ctx.stroke();
    }
    // A concise label changes when actual fibres have become a continuous strand.
    if(status){
      const label=time<3.6?"GATHERING FIBRES":time<6.3?"TWISTING INTO YARN":"A THREAD IS FORMED";
      if(status.textContent!==label)status.textContent=label;
    }
    ctx.restore();
    frame=requestAnimationFrame(draw);
  }
  function start(reset){
    if(reduced.matches)return;
    if(reset)started=0;
    if(!onScreen || document.hidden)return;
    if(!frame)frame=requestAnimationFrame(draw);
  }
  function pause(){if(frame)cancelAnimationFrame(frame);frame=0;started=0;}
  function setVisibility(visible){onScreen=visible;if(visible)start(true);else pause();}
  resize();
  if(reduced.matches){status.textContent="COTTON → SPUN YARN";return;}
  root.classList.add("mo-fibre-live");
  if("ResizeObserver" in window)new ResizeObserver(resize).observe(canvas);
  else addEventListener("resize",resize,{passive:true});
  if("IntersectionObserver" in window){
    const io=new IntersectionObserver(entries=>{
      for(const entry of entries)if(entry.target===root)setVisibility(entry.isIntersecting);
    },{threshold:.12});
    io.observe(root);
  } else setVisibility(true);
  document.addEventListener("visibilitychange",()=>document.hidden?pause():start(true));
  if(play)play.addEventListener("click",()=>{started=0;start(true);});
  reduced.addEventListener&&reduced.addEventListener("change",e=>{
    if(e.matches){pause();root.classList.remove("mo-fibre-live");status.textContent="COTTON → SPUN YARN";}
    else{root.classList.add("mo-fibre-live");start(true);}
  });
})();
