(() => {
  "use strict";
  const buildings=["castle","town","church","forge","shop","inn","guild","academy","alchemy","stable","farm","mine","harbor","barracks","gate","forest","ruins","rift","sky-city","demon-fortress"];
  const portraits=["hero","knight","mage","archer","blacksmith","priest","quest-giver","innkeeper","merchant","noble","villager","girl","soldier","bandit","beastfolk","elder","bard","demon","skeleton","orc"];
  const scenes=["town","wood","pass","fen","coast"],cache=new Map();
  const path=(kind,id,size)=>kind==="emblems"?`assets/expansion/icons/${id}.png`:kind==="expansion"?`assets/expansion/scenes/${id}.webp`:`assets/world/${kind}/${id}${kind==="scenes"?"":"-"+(size||(kind==="buildings"?512:256))}.png`;
  function get(kind,id){const key=kind+":"+id;if(cache.has(key))return cache.get(key).image;const image=new Image(),entry={image};cache.set(key,entry);if(kind==="expansion"){const keys=[...cache.keys()].filter(k=>k.startsWith("expansion:"));while(keys.length>4)cache.delete(keys.shift());}image.onload=()=>window.CircleMap?.draw();image.src=path(kind,id);return image;}
  function ready(kind,id){const i=get(kind,id);return i.complete&&i.naturalWidth>0?i:null;}
  const masks=new Map();
  function opaque(id,u,v){if(!masks.has(id)){const encoded=window.WorldHitMasks?.[id];masks.set(id,encoded?Uint8Array.from(atob(encoded),c=>c.charCodeAt(0)):null);}const a=masks.get(id),x=Math.floor(u*64),y=Math.floor(v*64);if(x<0||x>=64||y<0||y>=64)return false;if(!a)return true;const index=y*64+x;return!!(a[index>>3]&(1<<(index&7)));}
  function portrait(type,alt="",className="portrait-art"){return `<img class="${className}" src="${path("portraits",type||"hero")}" alt="${String(alt).replace(/[&<>\"]/g,"")}" loading="lazy">`;}
  function building(id,alt=""){return `<img class="building-art" src="${path("buildings",id)}" alt="${String(alt).replace(/[&<>\"]/g,"")}" loading="lazy">`;}
  function preload(place){get("emblems","brand");get("scenes",place);for(const b of window.BuildingSystem?.at(place)||[])get("buildings",b.asset);}
  window.WorldAssets={buildings,portraits,scenes,path,get,ready,opaque,portrait,building,preload};
})();
