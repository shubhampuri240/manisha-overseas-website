(()=>{"use strict";
const styles=[
{code:"4638",name:"Floral printed long dress",col:0,label:"Back view"},
{code:"6821",name:"Printed wide-leg one-piece",col:1,label:"Back view"},
{code:"3476",name:"Printed long dress",col:2,label:"Back view"},
{code:"7284",name:"Printed long dress with open-back tie detail",col:3,label:"Open-back detail"},
{code:"1509",name:"Printed tiered long dress",col:4,label:"Back view"},
{code:"2941",name:"Printed tiered long dress",col:5,label:"Back view"},
{code:"9152",name:"Green printed long dress",col:6,label:"Detail view"}
];
const $=(s,r=document)=>r.querySelector(s),$$=(s,r=document)=>Array.from(r.querySelectorAll(s));

const menuButton=$("#studio-menu-toggle"),siteNav=$(".studio-site-header nav");
menuButton?.addEventListener("click",()=>{const open=siteNav.classList.toggle("is-open");menuButton.setAttribute("aria-expanded",String(open));menuButton.textContent=open?"×":"☰";});
siteNav?.querySelectorAll("a").forEach(a=>a.addEventListener("click",()=>{siteNav.classList.remove("is-open");menuButton?.setAttribute("aria-expanded","false");if(menuButton)menuButton.textContent="☰";}));
const stage=$("#dress-stage"),photo=$("#studio-photo-view"),photoFrame=$("#photo-reference-frame"),column=$(".studio-stage-column");
let selected=0,mode="3d",side="front",toneName="Chalk",fabricName="Soft weave",patternName="Plain",trims=true;
function applyPhoto(){const st=styles[selected],row=side==="front"?0:1;photoFrame.style.backgroundPosition=(st.col*100/6)+"% "+(row*100)+"%";$("#photo-style-caption").textContent="STYLE "+st.code+" / "+(side==="front"?"FRONT VIEW":st.label.toUpperCase());$$("[data-photo-side]").forEach(b=>b.classList.toggle("is-active",b.dataset.photoSide===side));}
function updateQuote(){const st=styles[selected],p=new URLSearchParams({category:"printed-dresses",style:st.code,colour:toneName,texture:fabricName,pattern:patternName,finish:trims?"Seam and trim details on":"Standard"});$("#quote-style").href="contact.html?"+p.toString();}
function selectStyle(i){selected=Math.max(0,Math.min(styles.length-1,i));const s=styles[selected];window.ManishaDressStudio?.setStyle?.(selected);$$("[data-style-index]").forEach((b,n)=>b.classList.toggle("is-selected",n===selected));$("#selected-style-code").textContent="STYLE "+s.code;$("#selected-style-name").textContent=s.name;$("#brief-style").textContent=s.code;$("#stage-style-title").textContent="Style "+s.code+" · "+(mode==="3d"?"3D concept preview":"catalogue reference");applyPhoto();updateQuote();}
function setMode(m){mode=m==="photo"?"photo":"3d";stage.classList.toggle("is-photo-mode",mode==="photo");photo.setAttribute("aria-hidden",String(mode!=="photo"));column.classList.toggle("is-photo-mode",mode==="photo");$$("[data-stage-mode]").forEach(b=>b.classList.toggle("is-active",b.dataset.stageMode===mode));$("#stage-style-title").textContent="Style "+styles[selected].code+" · "+(mode==="3d"?"3D concept preview":"catalogue reference");$("#stage-view-label").textContent=mode==="3d"?"CONCEPT FORM · 3D":"STYLE "+styles[selected].code+" · "+side.toUpperCase();$("#stage-status").textContent=mode==="3d"?"3D concept loaded · drag the garment to rotate":"Catalogue photo · "+(side==="front"?"front":"back / detail")+" reference";applyPhoto();}
function brief(){ $("#brief-colour").textContent=toneName;$("#brief-texture").textContent=fabricName;$("#brief-pattern").textContent=patternName;updateQuote();}
function status(t){$("#stage-status").textContent=t;}
function save(){const data={style:styles[selected].code,mode,side,toneName,fabricName,patternName,trims,savedAt:new Date().toISOString()};try{localStorage.setItem("manishaStudioLook",JSON.stringify(data));status("Look saved in this browser · Style "+data.style);}catch(e){status("Browser could not save this look");}}
$$("[data-style-index]").forEach(b=>b.addEventListener("click",()=>{selectStyle(Number(b.dataset.styleIndex));if(mode==="photo")setMode("photo");else status("Style "+styles[selected].code+" selected · switch to Catalogue photo to inspect");}));
$$("[data-stage-mode]").forEach(b=>b.addEventListener("click",()=>setMode(b.dataset.stageMode)));
$$("[data-photo-side]").forEach(b=>b.addEventListener("click",()=>{side=b.dataset.photoSide;setMode("photo");}));
$$("[data-tone]").forEach(b=>b.addEventListener("click",()=>{toneName=$("span",b).textContent;$$("[data-tone]").forEach(x=>x.classList.toggle("is-selected",x===b));window.ManishaDressStudio?.setTone?.(b.dataset.hex);brief();status("3D concept colour updated · "+toneName);}));
$$("[data-fabric]").forEach(b=>b.addEventListener("click",()=>{fabricName=$("span",b).textContent;$$("[data-fabric]").forEach(x=>x.classList.toggle("is-selected",x===b));window.ManishaDressStudio?.setFabric?.(b.dataset.fabric);brief();status("3D concept texture updated · "+fabricName);}));
$$("[data-pattern]").forEach(b=>b.addEventListener("click",()=>{const p=b.dataset.pattern;patternName=b.textContent.trim();$$("[data-pattern]").forEach(x=>x.classList.toggle("is-selected",x===b));window.ManishaDressStudio?.setPattern?.(p);brief();status("3D concept surface updated · "+patternName);}));
$("#trim-toggle").addEventListener("change",e=>{trims=e.target.checked;window.ManishaDressStudio?.setTrims?.(trims);brief();status("Finish details "+(trims?"shown":"hidden"));});
$("#zoom-in").addEventListener("click",()=>window.ManishaDressStudio?.zoom?.(-.55));$("#zoom-out").addEventListener("click",()=>window.ManishaDressStudio?.zoom?.(.55));
$("#reset-view").addEventListener("click",()=>{window.ManishaDressStudio?.reset?.();window.ManishaDressStudio?.setStyle?.(selected);toneName="Chalk";fabricName="Soft weave";patternName="Plain";trims=true;$("#trim-toggle").checked=true;$$("[data-tone]").forEach((b,i)=>b.classList.toggle("is-selected",i===0));$$("[data-fabric]").forEach((b,i)=>b.classList.toggle("is-selected",i===0));$$("[data-pattern]").forEach((b,i)=>b.classList.toggle("is-selected",i===0));brief();setMode("3d");status("3D concept reset");});
$("#save-design").addEventListener("click",save);$("#save-design-secondary").addEventListener("click",save);
$("#copy-design").addEventListener("click",async()=>{const s=styles[selected],txt="Manisha Overseas visual development brief\nStyle: "+s.code+" — "+s.name+"\nColour: "+toneName+"\nTexture preview: "+fabricName+"\nSurface pattern: "+patternName+"\nFinish details: "+(trims?"On":"Off")+"\nNote: visual concept only; confirm materials and construction against an approved sample.";try{await navigator.clipboard.writeText(txt);status("Design brief copied");}catch(e){status("Copy is unavailable in this browser");}});
$$("[data-tool]").forEach(b=>b.addEventListener("click",()=>{$$("[data-tool]").forEach(x=>x.classList.toggle("is-active",x===b));const t=b.dataset.tool;if(t==="move"){setMode("3d");status("Drag the concept garment to rotate");}if(t==="colour")$(".studio-right-rail").scrollIntoView({behavior:"smooth",block:"center"});if(t==="fabric")$(".studio-fabric-panel").scrollIntoView({behavior:"smooth",block:"center"});if(t==="pattern")$(".pattern-picker").scrollIntoView({behavior:"smooth",block:"center"});if(t==="trim"){const c=$("#trim-toggle");c.checked=!c.checked;c.dispatchEvent(new Event("change"));}if(t==="reset")$("#reset-view").click();}));
selectStyle(0);setMode("3d");
const saved=(()=>{try{return JSON.parse(localStorage.getItem("manishaStudioLook")||"null")}catch(e){return null}})();if(saved){const i=styles.findIndex(s=>s.code===saved.style);if(i>=0)selectStyle(i);}
})();