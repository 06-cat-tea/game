(() => {
  "use strict";
  const buildings=["castle","town","church","forge","shop","inn","guild","academy","alchemy","stable","farm","mine","harbor","barracks","gate","forest","ruins","rift","sky-city","demon-fortress"];
  const portraits=["hero","knight","mage","archer","blacksmith","priest","quest-giver","innkeeper","merchant","noble","villager","girl","soldier","bandit","beastfolk","elder","bard","demon","skeleton","orc"];
  const scenes=["town","wood","pass","fen","coast"],cache=new Map();
  const path=(kind,id,size)=>kind==="environment"?`assets/environment/sprites/${id}.png`:kind==="emblems"?`assets/expansion/icons/${id}.png`:kind==="expansion"?`assets/expansion/scenes/${id}.webp`:`assets/world/${kind}/${id}${kind==="scenes"?"":"-"+(size||(kind==="buildings"?512:256))}.png`;
  function entryFor(kind,id,retry=false){
    const key=kind+":"+id,old=cache.get(key);if(old&&!(retry&&old.status==="failed"))return old;
    const image=new Image(),entry={image,status:"loading",promise:null};cache.set(key,entry);
    entry.promise=new Promise(resolve=>{
      let settled=false;
      const finish=status=>{if(settled)return;settled=true;clearTimeout(timer);entry.status=status;entry.failed=status==="failed";if(kind==="environment"){window.SceneEnvironment?.invalidate();window.WorldTerrain?.invalidate();}window.CircleMap?.invalidate();window.CircleMap?.draw();resolve({kind,id,status,url:image.src});};
      const timer=setTimeout(()=>finish("failed"),20000);
      image.onload=async()=>{try{await image.decode();finish("ready");}catch{finish("failed");}};
      image.onerror=()=>finish("failed");image.src=kind==="url"?id:path(kind,id);
    });
    if(kind==="expansion"){const keys=[...cache.keys()].filter(k=>k.startsWith("expansion:")&&cache.get(k).status!=="loading");while(keys.length>4)cache.delete(keys.shift());}
    return entry;
  }
  function get(kind,id){return entryFor(kind,id).image;}
  function load(kind,id,retry=false){return entryFor(kind,id,retry).promise;}
  function ready(kind,id){if(kind==='scenes'&&id==='city')return null;const i=get(kind,id);return i.complete&&i.naturalWidth>0?i:null;}
  const masks=new Map();
  function opaque(id,u,v){if(!masks.has(id)){const encoded=window.WorldHitMasks?.[id];masks.set(id,encoded?Uint8Array.from(atob(encoded),c=>c.charCodeAt(0)):null);}const a=masks.get(id),x=Math.floor(u*64),y=Math.floor(v*64);if(x<0||x>=64||y<0||y>=64)return false;if(!a)return true;const index=y*64+x;return!!(a[index>>3]&(1<<(index&7)));}
  function portrait(type,alt="",className="portrait-art"){return `<img class="${className}" src="${path("portraits",type||"hero")}" alt="${String(alt).replace(/[&<>\"]/g,"")}" loading="lazy">`;}
  function building(id,alt=""){return `<img class="building-art" src="${path("buildings",id)}" alt="${String(alt).replace(/[&<>\"]/g,"")}" loading="lazy">`;}
  function preload(place){window.SceneEnvironment?.preload(place);get("emblems","brand");if(place!=="city")get("scenes",place);for(const b of window.BuildingSystem?.at(place)||[])get("buildings",b.asset);}
  window.WorldAssets={buildings,portraits,scenes,path,get,ready,load,opaque,portrait,building,preload};
})();
