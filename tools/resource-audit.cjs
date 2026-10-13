// Inspect actual scene/region definitions, including dynamic resource paths.
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const root=path.resolve(__dirname,'..'),context={};context.window=context;vm.createContext(context);
for(const name of ['city-content','world-regions','world-content','building-system','crafting-system','skill-tree','region-content','game-data','npc-system','scene-layouts','scene-system','environment-catalog','city-renderer','world-terrain','environment-system'])
  vm.runInContext(fs.readFileSync(path.join(root,'js',name+'.js'),'utf8'),context,{filename:name});
const w=context.window,places=Object.keys(w.GameData.PLACES),environment=new Set();
for(const place of places){for(const id of w.WorldTerrain.resourceIds(place))environment.add(id);
  for(const o of w.SceneEnvironment.objects(place))environment.add(o.asset);for(const p of w.SceneEnvironment.patches[place]||[])environment.add(p[0]);}
const entrances=new Set([...Object.values(w.SceneSystem.entrances),...Object.values(w.SceneSystem.routes).flat().map(r=>r[0]),
  ...w.BuildingSystem.all.filter(b=>b.interior).map(b=>w.BuildingSystem.interior(b.id)?.sceneId).filter(Boolean)]);
const activeScenes=Object.values(w.SceneSystem.scenes).filter(s=>!s.procedural&&entrances.has(s.id));
const files=dir=>fs.readdirSync(path.join(root,dir)).filter(f=>fs.statSync(path.join(root,dir,f)).isFile());
const unusedSceneFiles=files('assets/expansion/scenes').filter(f=>!activeScenes.some(s=>f===s.sceneId+'.webp'));
const unusedEnvironment=files('assets/environment/sprites').filter(f=>!environment.has(path.parse(f).name));
const groups={};for(const dir of ['assets/environment/masters','assets/environment/crops','assets/expansion/masters'])
  if(fs.existsSync(path.join(root,dir)))groups[dir]={count:files(dir).length,bytes:files(dir).reduce((n,f)=>n+fs.statSync(path.join(root,dir,f)).size,0)};
const report={activeScenes:activeScenes.map(s=>s.id),unusedSceneFiles,environment:[...environment].sort(),unusedEnvironment,groups};
fs.mkdirSync(path.join(root,'artifacts'),{recursive:true});fs.writeFileSync(path.join(root,'artifacts/resource-audit.json'),JSON.stringify(report,null,2));
console.log(JSON.stringify(report,null,2));
