(() => {
  const root=document.querySelector('[data-collection-showcase]');
  if(!root)return;
  const catalogue=window.MANISHA_CATALOGUE_IMAGES||{};
  const slides=[
    {name:"Style 6821",line:"A statement in print.",desc:"Kasturi catalogue · front and back references available for review.",image:catalogue["6821"]?.front||"../assets/visuals/collection-01.webp",href:"../dress-studio.html?style=6821",number:"01",type:"Kasturi catalogue"},
    {name:"Style 3476",line:"Colour with a softer rhythm.",desc:"Kasturi catalogue · front and back references available for review.",image:catalogue["3476"]?.front||"../assets/visuals/collection-02.webp",href:"../dress-studio.html?style=3476",number:"02",type:"Kasturi catalogue"},
    {name:"Style 9152",line:"A flowing printed silhouette.",desc:"Kasturi catalogue · full-length and detail references available for review.",image:catalogue["9152"]?.front||"../assets/visuals/collection-03.webp",href:"../dress-studio.html?style=9152",number:"03",type:"Kasturi catalogue"},
    {name:"Style 4638",line:"An expressive floral story.",desc:"Kasturi catalogue · front and back references available for review.",image:catalogue["4638"]?.front||"../assets/visuals/collection-04.webp",href:"../dress-studio.html?style=4638",number:"04",type:"Kasturi catalogue"},
    {name:"Style 7284",line:"A print made to stand out.",desc:"Kasturi catalogue · front and back references available for review.",image:catalogue["7284"]?.front||"../assets/visuals/collection-05.webp",href:"../dress-studio.html?style=7284",number:"05",type:"Kasturi catalogue"},
    {name:"Style 1509",line:"A tiered look with movement.",desc:"Kasturi catalogue · front and back references available for review.",image:catalogue["1509"]?.front||"../assets/visuals/collection-06.webp",href:"../dress-studio.html?style=1509",number:"06",type:"Kasturi catalogue"},
    {name:"Style 2941",line:"A layered printed finish.",desc:"Kasturi catalogue · front and back references available for review.",image:catalogue["2941"]?.front||"../assets/visuals/collection-01.webp",href:"../dress-studio.html?style=2941",number:"07",type:"Kasturi catalogue"}
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
      image.src=s.image;image.alt=s.name+' approved catalogue garment photograph';
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