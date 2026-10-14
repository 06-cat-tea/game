// Explicit --apply required. Every removal is re-audited and recoverable from Git.
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const {execFileSync}=require('node:child_process');
const {audit,root}=require('./resource-audit.cjs');
const report=audit();
if(report.missing.length)throw Error('Missing runtime assets: '+report.missing.join(','));
if(!process.argv.includes('--apply')){console.log(JSON.stringify({dryRun:true,files:report.candidates.length,bytes:report.bytes}));process.exit(0);}
const removed=[];
for(const entry of report.candidates){
  const target=path.resolve(root,entry.path),real=fs.realpathSync(target),assetRoot=fs.realpathSync(path.join(root,'assets'))+path.sep;
  if(!real.startsWith(assetRoot)||!target.startsWith(path.join(root,'assets')+path.sep)||fs.lstatSync(target).isSymbolicLink())throw Error('Unsafe cleanup target '+entry.path);
  const bytes=fs.readFileSync(target);
  if(crypto.createHash('sha256').update(bytes).digest('hex')!==entry.sha256)throw Error('Changed cleanup target '+entry.path);
  const original=execFileSync('git',['show',report.sourceRevision+':'+entry.path],{cwd:root,maxBuffer:64*1024*1024});
  if(!original.equals(bytes))throw Error('Uncommitted asset; refusing removal '+entry.path);
  fs.unlinkSync(target);removed.push(entry);
}
const read=file=>JSON.parse(fs.readFileSync(path.join(root,file),'utf8').replace(/^\uFEFF/,''));
const write=(file,c)=>{const target=path.join(root,file),text=JSON.stringify(c,null,2)+'\n';if(fs.existsSync(target)&&fs.readFileSync(target,'utf8')===text)return;fs.writeFileSync(target,text);};
const art=read('assets/art-v2/catalog.json'),world=read('assets/world/catalog.json'),environment=read('assets/environment/catalog.json'),expansion=read('assets/expansion/catalog.json');
for(const e of world.buildings)if(art.buildings[e.id]){e.legacyScene=e.legacyScene||e.scene;e.scene='../art-v2/'+art.buildings[e.id].file;e.runtimeOverride=true;}
for(const e of environment.entries)if(art.environment[e.id]){e.legacySprite=e.legacySprite||e.sprite;e.sprite='../art-v2/'+art.environment[e.id].file;e.runtimeOverride=true;}
for(const e of expansion.assets)if(art.scenes[e.id]){e.legacyFile=e.legacyFile||e.file;e.file='../art-v2/'+art.scenes[e.id].file;e.runtimeOverride=true;}

const previousFile=path.join(root,'assets/runtime-cleanup.json');
const previous=fs.existsSync(previousFile)?read('assets/runtime-cleanup.json'):{removed:[]};
const all=[...new Map([...previous.removed.filter(e=>e.gitBlob),...removed].map(e=>[e.path,e])).values()];
const final={sourceRevision:report.sourceRevision,removed:all,files:all.length,bytes:all.reduce((n,e)=>n+e.bytes,0),protectedOriginals:true};
fs.mkdirSync(path.join(root,'artifacts'),{recursive:true});write('assets/runtime-cleanup.json',final);write('artifacts/resource-cleanup.json',final);
for(const [file,c]of [['assets/world/catalog.json',world],['assets/environment/catalog.json',environment],['assets/expansion/catalog.json',expansion]]){c.cleanupRevision=report.sourceRevision;write(file,c);}
console.log(JSON.stringify({files:removed.length,MiB:+(removed.reduce((n,e)=>n+e.bytes,0)/1048576).toFixed(2),sourceRevision:report.sourceRevision}));
