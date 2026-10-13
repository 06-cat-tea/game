// Remove proven duplicates only; editable Mira projects and untracked artwork are retained.
const fs=require('node:fs'),path=require('node:path'),{execFileSync}=require('node:child_process');
const root=path.resolve(__dirname,'..'),revision=JSON.parse(fs.readFileSync(path.join(root,'assets/environment/catalog.json'),'utf8')).sourceRevision||execFileSync('git',['rev-parse','HEAD'],{cwd:root,encoding:'utf8'}).trim();
const compression=JSON.parse(fs.readFileSync(path.join(root,'artifacts/resource-compression.json'),'utf8'));
const tracked=new Set(execFileSync('git',['ls-files','-z'],{cwd:root,encoding:'utf8'}).split('\0'));
const removed=[];
function remove(relative){
  const target=path.resolve(root,relative);if(!fs.existsSync(target))return;const real=fs.realpathSync(target);
  if(!real.startsWith(path.join(root,'assets')+path.sep)||!target.startsWith(root+path.sep)||!tracked.has(relative))throw Error('Unsafe/untracked cleanup target: '+relative);
  removed.push({path:relative,bytes:fs.statSync(target).size});fs.unlinkSync(target);
}
for(const relative of ['assets/environment/masters','assets/environment/crops','assets/expansion/masters']){
  const directory=path.resolve(root,relative);
  if(fs.existsSync(directory)){
    // Verify the resolved directory itself before any removal.
    if(fs.realpathSync(directory)!==directory||!directory.startsWith(path.join(root,'assets')+path.sep))throw Error('Unsafe cleanup directory');
    for(const name of fs.readdirSync(directory))remove(relative+'/'+name);
    fs.rmdirSync(directory);
  }
}
for(const entry of compression.filter(r=>r.input.startsWith('assets/environment/sprites/')||r.input.startsWith('assets/world/scenes/'))){
  if(!fs.existsSync(path.join(root,entry.output)))throw Error('Replacement missing: '+entry.output);
  remove(entry.input);
}
const envFile=path.join(root,'assets/environment/catalog.json'),env=JSON.parse(fs.readFileSync(envFile,'utf8'));
env.sourceRevision=revision;for(const e of env.entries)e.sprite=e.sprite.replace(/\.png$/,'.webp');fs.writeFileSync(envFile,JSON.stringify(env,null,2)+'\n');
const worldFile=path.join(root,'assets/world/catalog.json'),world=JSON.parse(fs.readFileSync(worldFile,'utf8').replace(/^\uFEFF/,''));
world.sourceRevision=revision;for(const e of world.scenes){e.file=e.file.replace(/\.png$/,'.webp');e.width=480;e.height=270;e.usage='minimap backdrop';}fs.writeFileSync(worldFile,JSON.stringify(world,null,2)+'\n');
const expansionFile=path.join(root,'assets/expansion/catalog.json'),expansion=JSON.parse(fs.readFileSync(expansionFile,'utf8'));
expansion.sourceRevision=revision;fs.writeFileSync(expansionFile,JSON.stringify(expansion,null,2)+'\n');
fs.writeFileSync(path.join(root,'artifacts/resource-cleanup.json'),JSON.stringify({sourceRevision:revision,removed},null,2));
console.log(JSON.stringify({files:removed.length,bytes:removed.reduce((n,r)=>n+r.bytes,0),sourceRevision:revision}));
