(() => {
  const root=document.querySelector('[data-collection-showcase]');
  if(!root)return;
  const slides=[
    {name:'Cotton Dresses',line:'Natural texture. Modern form.',desc:'Breathable cotton foundations and relaxed silhouettes for everyday, occasion and seasonal assortments.',image:'../assets/visuals/collection-01.webp',href:'cotton-dresses.html',number:'01',type:'Cotton foundations'},
    {name:'Schiffli & Cutwork',line:'Detail that draws the eye.',desc:'Eyelet, embroidery and considered surface details for distinctive womenswear collections.',image:'../assets/visuals/fabric-01.webp',href:'schiffli-cutwork.html',number:'02',type:'Surface detail'},
    {name:'Printed Dresses',line:'A little colour. A lot of character.',desc:'Print-led dresses and expressive pieces for contemporary wholesale collections.',image:'../assets/visuals/collection-02.webp',href:'printed-dresses.html',number:'03',type:'Print stories'},
    {name:'Tops & Blouses',line:'Everyday forms, elevated.',desc:'Versatile tops and blouse silhouettes designed to bring texture and personality to a range.',image:'../assets/visuals/garment-detail-06.webp',href:'tops-blouses.html',number:'04',type:'Everyday forms'},
    {name:'Co-ord Sets',line:'Together, by design.',desc:'Coordinated separates that create a considered look across seasons and occasions.',image:'../assets/visuals/collection-03.webp',href:'coord-sets.html',number:'05',type:'Coordinated dressing'},
    {name:'Skirts & Pants',line:'Modern separates. More possibilities.',desc:'Contemporary separates that give buyers flexible options for building an assortment.',image:'../assets/visuals/collection-05.webp',href:'skirts-pants.html',number:'06',type:'Modern separates'},
    {name:'Resort Wear & Kaftans',line:'Made for warmer days.',desc:'Relaxed resort silhouettes and kaftan directions for warm-weather edits.',image:'../assets/visuals/collection-04.webp',href:'resort-kaftans.html',number:'07',type:'Warm-weather edits'}
  ];
  const image=root.querySelector('[data-showcase-image]');
  const imageLink=root.querySelector('[data-showcase-image-link]');
  const title=root.querySelector('[data-showcase-title]');
  const line=root.querySelector('[data-showcase-line]');
  const desc=root.querySelector('[data-showcase-desc]');
  const category=root.querySelector('[data-showcase-category]');
  const count=root.querySelector('[data-showcase-count]');
  const cta=root.querySelector('[data-showcase-cta]');
  const dots=root.querySelector('[data-showcase-dots]');
  const progress=root.querySelector('[data-showcase-progress]');
  const prev=root.querySelector('[data-showcase-prev]');
  const next=root.querySelector('[data-showcase-next]');
  let active=0,timer=null;
  const reduced=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  slides.forEach((s,i)=>{
    const dot=document.createElement('button');
    dot.type='button';dot.className='collection-showcase-dot';dot.setAttribute('aria-label','Show '+s.name);dot.addEventListener('click',()=>show(i,true));dots.append(dot);
  });
  function show(index,manual=false){
    active=(index+slides.length)%slides.length;
    const s=slides[active],dotList=dots.querySelectorAll('button');
    image.classList.add('is-changing');
    window.setTimeout(()=>{
      image.src=s.image;image.alt=s.name+' collection visual';
      imageLink.href=s.href;title.textContent=s.name;line.textContent=s.line;desc.textContent=s.desc;category.textContent=s.type;
      count.textContent=s.number+' / 07';cta.href=s.href;
      image.classList.remove('is-changing');
    },reduced?0:210);
    dotList.forEach((d,i)=>d.setAttribute('aria-current',i===active?'true':'false'));
    progress.style.width=((active+1)/slides.length*100)+'%';
    if(manual)restart();
  }
  function stop(){if(timer){clearInterval(timer);timer=null;}}
  function start(){if(!reduced&&!document.hidden)timer=setInterval(()=>show(active+1),5200);}
  function restart(){stop();start();}
  prev.addEventListener('click',()=>show(active-1,true));
  next.addEventListener('click',()=>show(active+1,true));
  root.addEventListener('mouseenter',stop);root.addEventListener('mouseleave',start);
  root.addEventListener('focusin',stop);root.addEventListener('focusout',start);
  document.addEventListener('visibilitychange',()=>document.hidden?stop():start());
  show(0);start();
})();