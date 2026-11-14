(()=>{"use strict";
const load=src=>new Promise((resolve,reject)=>{
 const script=document.createElement("script");
 script.src=src;script.async=false;
 script.onload=()=>resolve(true);
 script.onerror=()=>reject(new Error("Could not load "+src));
 document.body.appendChild(script);
});
(async()=>{
 let threeReady=false;
 for(const src of [
  "https://cdnjs.cloudflare.com/ajax/libs/three.js/r152/three.min.js",
  "https://cdn.jsdelivr.net/npm/three@0.152.2/build/three.min.js"
 ]){
  try{await load(src);if(window.THREE){threeReady=true;break;}}catch(e){}
 }
 if(!threeReady)document.documentElement.classList.add("studio-three-unavailable");
 for(const src of ["assets/dress-model.js","assets/studio-configurator.js","assets/studio-enhancements.js","assets/edition.js"]){
  try{await load(src);}catch(e){console.error("Manisha Studio script failed:",src,e);}
 }
})();
})();