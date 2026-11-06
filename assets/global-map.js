(()=>{"use strict";
const M=[
["canada","124","Canada","NORTH AMERICA / MARKET 01","Selected Canadian relationships include Nu Look Fashion and Winner. Historical Walmart-related work was through an intermediary, not a direct supplier account.",[-104,57]],
["usa","840","United States","NORTH AMERICA / MARKET 02","A buyer/business name recorded for the United States is Blue Indiogo; confirm spelling before formal brand or logo use.",[-98,39]],
["brazil","076","Brazil","SOUTH AMERICA / MARKET 03","Brazil is one of the South American markets identified.",[-52,-10]],
["spain","724","Spain · Barcelona","EUROPE / MARKET 04","Spain is one of the European markets identified. Barcelona is a named city destination within Spain.",[2.17,41.39]],
["hungary","348","Hungary","CENTRAL EUROPE / MARKET 05","Hungary is included among the European markets identified.",[19.2,47.2]],
["russia","643","Russia","RUSSIA / MARKET 06","Selected Russian relationships include Red Rose (Red Label line, as described by the business) and Nagpal.",[90,58]],
["mauritius","480","Mauritius","INDIAN OCEAN / MARKET 07","Mauritius is one of the markets identified. Red Rose is a selected relationship name shared for this market.",[57.5,-20.2]],
["uae","784","United Arab Emirates · Dubai","GULF / MARKET 08","The UAE is included in the business history, with Dubai identified as a named city destination.",[55.27,25.2]]
];
const node=document.querySelector("#world-map"),loading=document.querySelector("#map-loading");if(!node)return;
const $=s=>document.querySelector(s);
function select(id){const m=M.find(x=>x[0]===id);if(!m)return;document.querySelectorAll(".market-select").forEach(b=>b.classList.toggle("is-active",b.dataset.market===id));$("#market-region").textContent=m[3];$("#market-title").textContent=m[2];$("#market-description").textContent=m[4];if(window.d3)d3.select(node).selectAll(".market-marker").classed("is-active",d=>d[0]===id);}
document.querySelectorAll(".market-select").forEach(b=>b.addEventListener("click",()=>select(b.dataset.market)));
(async()=>{try{
 if(!window.d3||!window.topojson)throw Error("Map libraries unavailable");
 const r=await fetch("https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json");if(!r.ok)throw Error("Map data unavailable");
 const top=await r.json(),features=topojson.feature(top,top.objects.countries).features,w=1120,h=560;
 const projection=d3.geoNaturalEarth1().fitExtent([[18,20],[w-18,h-20]],{type:"Sphere"}),path=d3.geoPath(projection),svg=d3.select(node).attr("viewBox","0 0 "+w+" "+h);
 svg.selectAll("*").remove();svg.append("path").datum({type:"Sphere"}).attr("d",path).attr("class","map-ocean");
 svg.append("g").selectAll("path").data(features).join("path").attr("d",path).attr("class",d=>"map-country"+(M.some(m=>m[1]===String(d.id))?" is-market":""));
 svg.append("path").datum(topojson.mesh(top,top.objects.countries,(a,b)=>a!==b)).attr("class","map-borders").attr("d",path);
 const marks=svg.append("g").selectAll("g").data(M).join("g").attr("class","market-marker").attr("transform",d=>{const p=projection(d[5]);return "translate("+p[0]+","+p[1]+")";});
 marks.append("circle").attr("class","marker-pulse").attr("r",13);marks.append("circle").attr("class","marker-core").attr("r",4.5);
 marks.style("cursor","pointer").on("click",(e,d)=>select(d[0]));loading.classList.add("is-hidden");select("canada");
 }catch(e){loading.textContent="The interactive map could not load. The market list below remains available.";console.warn(e);}})();
})();