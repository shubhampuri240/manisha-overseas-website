
const menu=document.querySelector('.menu-toggle'),nav=document.querySelector('.navlinks');
if(menu&&nav){menu.addEventListener('click',()=>{const open=nav.classList.toggle('open');menu.setAttribute('aria-expanded',String(open));menu.textContent=open?'×':'☰'});nav.querySelectorAll('a').forEach(a=>a.addEventListener('click',()=>{nav.classList.remove('open');menu.setAttribute('aria-expanded','false');menu.textContent='☰'}))}
const revealEls=document.querySelectorAll('.reveal');
if('IntersectionObserver'in window){const io=new IntersectionObserver(entries=>entries.forEach(e=>{if(e.isIntersecting){e.target.classList.add('visible');io.unobserve(e.target)}}),{threshold:.12});revealEls.forEach(el=>io.observe(el))}else revealEls.forEach(el=>el.classList.add('visible'));
document.querySelectorAll('[data-year]').forEach(el=>el.textContent=new Date().getFullYear());
const params=new URLSearchParams(location.search),cat=params.get('category'),product=params.get('product'),categorySelect=document.querySelector('#category');
if(categorySelect){const map={'cotton-dresses':'Cotton dresses','schiffli-cutwork':'Schiffli & cutwork','printed-dresses':'Printed dresses','tops-blouses':'Tops & blouses','skirts-pants':'Skirts & pants','coord-sets':'Co-ord sets','resort-kaftans':'Resort wear & kaftans'};const key=cat||(product||'').replace(/-\d+$/,'').replace(/-\d+$/,'');const categoryValue=map[key]||key;if([...categorySelect.options].some(option=>option.value===categoryValue))categorySelect.value=categoryValue}
const cursor=document.createElement('div');cursor.className='cursor-orb';document.body.appendChild(cursor);
if(matchMedia('(hover:hover) and (pointer:fine)').matches&&!matchMedia('(prefers-reduced-motion: reduce)').matches){
 let x=0,y=0,tx=0,ty=0;document.addEventListener('mousemove',e=>{tx=e.clientX;ty=e.clientY;cursor.style.left=tx+'px';cursor.style.top=ty+'px'});
 document.querySelectorAll('a,button,input,textarea,select').forEach(el=>{el.addEventListener('mouseenter',()=>cursor.classList.add('is-hover'));el.addEventListener('mouseleave',()=>cursor.classList.remove('is-hover'))});
}
window.addEventListener('load',()=>{requestAnimationFrame(()=>document.body.classList.add('is-ready'))});

const studioParams=new URLSearchParams(location.search);
const studioMessage=document.querySelector('#message');
if(studioMessage&&studioParams.has('style')){
 const details=[['Style',studioParams.get('style')],['Photograph',studioParams.get('photograph')],['Colour direction',studioParams.get('colour')],['Texture preview',studioParams.get('texture')],['Surface pattern',studioParams.get('pattern')],['Finish details',studioParams.get('finish')]].filter(([,v])=>v);
 const generated='I would like to discuss this Manisha catalogue style and visual direction:\n'+details.map(([k,v])=>k+': '+v).join('\n')+'\nPlease confirm fabric, construction, sampling feasibility and quotation.';
 if(!studioMessage.value.trim())studioMessage.value=generated;
}

function addCompanyNavMenu(){const nav=document.querySelector('.edition-nav nav')||document.querySelector('.navlinks');if(!nav||nav.querySelector('[data-company-menu]'))return;const prefix=(location.pathname.includes('/collections/')||location.pathname.includes('/products/'))?'../':'';const group=document.createElement('div');group.className='nav-drop company-nav-drop';group.dataset.companyMenu='';group.innerHTML='<a href="'+prefix+'about.html">Company⌄</a><div class="drop-menu"><a href="'+prefix+'about.html">About Manisha</a><a href="'+prefix+'global-reach.html">Global Reach</a><a href="'+prefix+'clients.html">Clients &amp; Partners</a><a href="'+prefix+'product-development.html">Product Development</a></div>';const before=nav.querySelector('.nav-quote,.nav-cta');nav.insertBefore(group,before||null);}addCompanyNavMenu();

/* Select a product image and open it as a reference inside the Manisha 3D Studio. */
(()=> {
 if(!document.querySelector("main")) return;
 const cardSelectors=[".product-card",".tile",".collection-card",".collection-card-v3",".cx-products a",".product-grid a",".detail-image"];
 const candidates=[...document.querySelectorAll(cardSelectors.join(","))];
 candidates.forEach(card=>{
   if(card.dataset.studioActionReady==="1") return;
   const img=card.querySelector("img");
   if(!img||!img.src||img.closest("header,footer,.edition-footer,.studio-site-header")) return;
   card.dataset.studioActionReady="1";
   const name=(card.querySelector("h1,h2,h3,b")?.textContent||img.alt||"Selected garment").trim();
   let target=card;
   if(card.tagName==="A"){
     const wrapper=document.createElement("div");
     wrapper.className="studio-entry-wrap";
     card.parentNode.insertBefore(wrapper,card);
     wrapper.appendChild(card);
     target=wrapper;
   }else if(getComputedStyle(card).position==="static"){
     card.style.position="relative";
   }
   const button=document.createElement("a");
   button.className="studio-entry-button";
   const dressLike=/\b(dress|gown|maxi|midi|mini|kaftan|jumpsuit|one-piece)\b/i.test(name+" "+(img.alt||""));
   button.textContent=dressLike?"Rotate 3D study ↗":"View garment photograph ↗";
   const nested=location.pathname.includes("/collections/")||location.pathname.includes("/products/");
   const studioPath=nested?"../dress-studio.html":"dress-studio.html";
   const destination=new URL(studioPath,location.href);
   destination.searchParams.set("image",img.currentSrc||img.src);
   destination.searchParams.set("name",name);
   destination.searchParams.set("source","website");
   destination.searchParams.set("mode",dressLike?"3d":"photo");
   button.href=destination.href;
   button.setAttribute("aria-label",(dressLike?"Open approximate rotating 3D study of ":"Open photographs of ")+name);
   target.appendChild(button);
 });
})();

/* An explicit 3D study action on garment product detail pages.
   The source photos remain the product truth; the rotating mesh is approximate. */
(() => {
  const details=document.querySelector('.detail-copy');
  const photo=document.querySelector('.product-photo-gallery img');
  if(!details || !photo || details.querySelector('[data-style-3d-link]'))return;
  const heading=details.querySelector('h1')?.textContent?.trim()||photo.alt||'Garment';
  if(!/\b(dress|gown|maxi|midi|mini|kaftan|jumpsuit|one-piece)\b/i.test(heading+' '+(photo.alt||'')))return;
  const destination=new URL('../dress-studio.html',location.href);
  destination.searchParams.set('mode','3d');
  destination.searchParams.set('image',photo.currentSrc||photo.src);
  destination.searchParams.set('name',heading);
  destination.searchParams.set('source','product-detail');
  const link=document.createElement('a');
  link.dataset.style3dLink='1';
  link.className='button';
  link.style.cssText='display:inline-flex;align-items:center;margin:12px 0 0;max-width:100%';
  link.textContent='Rotate photo-inspired 3D study ↗';
  link.setAttribute('aria-label','View an approximate 3D rotation of '+heading);
  link.href=destination.href;
  const action=details.querySelector('.button');
  if(action)action.insertAdjacentElement('afterend',link);
  else details.append(link);
})();

// Keep the selected photograph with the wholesale brief.
if(studioMessage && params.has('reference') && !studioMessage.value.trim()) {
 const reference=params.get('reference').slice(0,180).replace(/-/g,' ');
 studioMessage.value='I would like to enquire about this photographed look: '+reference+'.\nPlease confirm fabric, sizing, availability and quotation.';
}
// GitHub Pages serves the catalogue; send enquiries through the buyer's email app.
if(location.hostname.endsWith('.github.io') || location.protocol==='file:') {
 const form=document.querySelector('form[action="submit-enquiry.php"]');
 if(form) {
  form.querySelector('button[type="submit"]').textContent='Open email enquiry ↗';
  form.querySelector('.form-note').textContent='Your email app will open with your enquiry details. Review and send the message there to contact Manisha Overseas.';
  form.addEventListener('submit',event=>{
   event.preventDefault();
   if(!form.reportValidity())return;
   const fields=new FormData(form);
   if(fields.get('website'))return;
   const labels={name:'Name',email:'Email',company:'Company',country:'Country',company_type:'Business type',category:'Category',quantity:'Quantity',timeline:'Timeline',message:'Project details'};
   const lines=Object.entries(labels).map(([key,label])=>label+': '+(fields.get(key)||'Not specified'));
   location.href='mailto:salil@manishaexports.com?subject='+encodeURIComponent('Wholesale enquiry — '+(fields.get('company')||fields.get('name')))+'&body='+encodeURIComponent(lines.join('\n\n'));
  });
 }
}
