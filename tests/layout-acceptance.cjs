const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const c={};c.window=c;vm.createContext(c);
for(const name of ['city-content','world-layout','world-regions','world-content','building-system','crafting-system','skill-tree','class-content','npc-system','growth-system','region-content','game-data','party-system','scene-layouts','scene-system'])vm.runInContext(fs.readFileSync('js/'+name+'.js','utf8'),c);
const report=[];
assert.equal(c.BuildingSystem.all.length,82);
for(const place of Object.keys(c.WorldLayout.regions)){
 const spawn=c.WorldRegions.spawn(place),queue=[[Math.round(spawn.x*2),Math.round(spawn.y*2)]],seen=new Set(queue.map(p=>p.join(',')));
 for(let i=0;i<queue.length;i++){const [x,y]=queue[i];for(const[dx,dy]of[[1,0],[-1,0],[0,1],[0,-1]]){const nx=x+dx,ny=y+dy,key=nx+','+ny;if(!seen.has(key)&&!c.WorldRegions.blocked(place,nx/2,ny/2)){seen.add(key);queue.push([nx,ny]);}}}
 const reachable=p=>queue.some(([x,y])=>Math.hypot(x/2-p.x,y/2-p.y)<.6),targets=[];
 assert(!c.WorldRegions.blocked(place,spawn.x,spawn.y));
 for(const b of c.BuildingSystem.at(place)){const e=c.WorldLayout.entrance(b);assert(reachable(e),'door '+b.id);assert(!c.WorldRegions.blocked(place,e.x,e.y),'blocked door '+b.id);targets.push('building:'+b.id);for(const other of c.BuildingSystem.at(place))if(other.id!==b.id)assert(!(b.x<other.x+other.w&&b.x+b.w>other.x&&b.y<other.y+other.d&&b.y+b.d>other.y),'overlap '+b.id+'/'+other.id);}
 for(const n of c.NPCSystem.at(place)){assert(reachable(n.position),'npc '+n.id);assert(!c.WorldRegions.blocked(place,n.position.x,n.position.y),'blocked NPC '+n.id);targets.push('npc:'+n.id);}
 assert(reachable(c.WorldLayout.portal(place)),place+' portal');
 const s={place,worldLayoutVersion:1,location:{sceneId:null,x:10,y:12,stack:[]},player:{gold:321},quests:{stars:{progress:3}},relationships:{mira:{value:42}}};c.WorldLayout.migrate(s);assert.equal(s.worldLayoutVersion,2);assert.equal(s.location.x,spawn.x);assert.equal(s.location.y,spawn.y);assert.equal(s.player.gold,321);assert.equal(s.quests.stars.progress,3);assert.equal(s.relationships.mira.value,42);s.location.x=spawn.x+1;c.WorldLayout.migrate(s);assert.equal(s.location.x,spawn.x+1,'migration must run once');
 for(const b of c.BuildingSystem.at(place).filter(b=>c.BuildingSystem.interior(b.id))){const room=c.BuildingSystem.interior(b.id),inside={place,location:{sceneId:room.sceneId,x:7.5,y:7.8,stack:[{sceneId:null,x:10,y:12}]}};c.WorldLayout.migrate(inside);assert.equal(inside.location.x,7.5);assert.equal(inside.location.y,7.8);assert.equal(inside.location.stack[0].x,c.WorldLayout.entrance(b).x);assert.equal(inside.location.stack[0].y,c.WorldLayout.entrance(b).y);}
 report.push({place,buildings:c.BuildingSystem.at(place).length,npcs:c.NPCSystem.at(place).length,reachableCells:seen.size,targets,roads:c.WorldLayout.roads(place).length});console.log('PASS '+place+' doors, fixed NPCs, portal, routes and one-time migration');
}
for(const b of c.RoyalCity.buildings)assert(!c.WorldLayout.oldBuildings.has(b.id));
const city={place:'city',location:{sceneId:null,x:16,y:68,stack:[]}};c.WorldLayout.migrate(city);assert.equal(city.location.x,16);assert.equal(city.location.y,68);
fs.mkdirSync('artifacts/art-v2',{recursive:true});fs.writeFileSync('artifacts/art-v2/layout-acceptance.json',JSON.stringify({passed:true,regions:report,cityLayoutUnchanged:true},null,2));
assert(c.WorldRegions.blocked('fen',40,29));assert(!c.WorldRegions.blocked('fen',22,29));
console.log('PASS 82 retained landmarks and unchanged royal-city layout');
