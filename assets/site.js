
const menu=document.querySelector('.menu-toggle'),nav=document.querySelector('.navlinks');
if(menu&&nav){menu.addEventListener('click',()=>{const open=nav.classList.toggle('open');menu.setAttribute('aria-expanded',String(open));menu.textContent=open?'×':'☰'});nav.querySelectorAll('a').forEach(a=>a.addEventListener('click',()=>{nav.classList.remove('open');menu.setAttribute('aria-expanded','false');menu.textContent='☰'}))}
const revealEls=document.querySelectorAll('.reveal');
if('IntersectionObserver'in window){const io=new IntersectionObserver(entries=>entries.forEach(e=>{if(e.isIntersecting){e.target.classList.add('visible');io.unobserve(e.target)}}),{threshold:.12});revealEls.forEach(el=>io.observe(el))}else revealEls.forEach(el=>el.classList.add('visible'));
document.querySelectorAll('[data-year]').forEach(el=>el.textContent=new Date().getFullYear());
const params=new URLSearchParams(location.search),cat=params.get('category'),product=params.get('product'),categorySelect=document.querySelector('#category');
if(categorySelect){const map={'cotton-dresses':'Cotton dresses','schiffli-cutwork':'Schiffli & cutwork','printed-dresses':'Printed dresses','tops-blouses':'Tops & blouses','skirts-pants':'Skirts & pants','coord-sets':'Co-ord sets','resort-kaftans':'Resort wear & kaftans'};const key=cat||(product||'').replace(/-\d+$/,'').replace(/-\d+$/,'');if(map[key])categorySelect.value=map[key]}
const cursor=document.createElement('div');cursor.className='cursor-orb';document.body.appendChild(cursor);
if(matchMedia('(hover:hover) and (pointer:fine)').matches&&!matchMedia('(prefers-reduced-motion: reduce)').matches){
 let x=0,y=0,tx=0,ty=0;document.addEventListener('mousemove',e=>{tx=e.clientX;ty=e.clientY;cursor.style.left=tx+'px';cursor.style.top=ty+'px'});
 document.querySelectorAll('a,button,input,textarea,select').forEach(el=>{el.addEventListener('mouseenter',()=>cursor.classList.add('is-hover'));el.addEventListener('mouseleave',()=>cursor.classList.remove('is-hover'))});
}
window.addEventListener('load',()=>{requestAnimationFrame(()=>document.body.classList.add('is-ready'))});

const studioParams=new URLSearchParams(location.search);
const studioMessage=document.querySelector('#message');
if(studioMessage&&studioParams.has('style')){
 const details=[['Style',studioParams.get('style')],['Colour direction',studioParams.get('colour')],['Texture preview',studioParams.get('texture')],['Surface pattern',studioParams.get('pattern')],['Finish details',studioParams.get('finish')]].filter(([,v])=>v);
 const generated='I would like to discuss this Manisha catalogue style and visual direction:\n'+details.map(([k,v])=>k+': '+v).join('\n')+'\nPlease confirm fabric, construction, sampling feasibility and quotation.';
 if(!studioMessage.value.trim())studioMessage.value=generated;
}

function addCompanyNavMenu(){const nav=document.querySelector('.edition-nav nav')||document.querySelector('.navlinks');if(!nav||nav.querySelector('[data-company-menu]'))return;const prefix=(location.pathname.includes('/collections/')||location.pathname.includes('/products/'))?'../':'';const group=document.createElement('div');group.className='nav-drop company-nav-drop';group.dataset.companyMenu='';group.innerHTML='<a href="'+prefix+'about.html">Company⌄</a><div class="drop-menu"><a href="'+prefix+'about.html">About Manisha</a><a href="'+prefix+'global-reach.html">Global Reach</a><a href="'+prefix+'clients.html">Clients &amp; Partners</a><a href="'+prefix+'product-development.html">Product Development</a></div>';const before=nav.querySelector('.nav-quote,.nav-cta');nav.insertBefore(group,before||null);}addCompanyNavMenu();
