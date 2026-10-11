const fs = require('fs'), path = require('path');
const sharp = require(process.env.SHARP_MODULE || path.join(require('os').homedir(), '.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/sharp'));
(async () => {
  const catalog = JSON.parse(fs.readFileSync('assets/expansion/catalog.json', 'utf8'));
  fs.mkdirSync('artifacts', {recursive:true});
  const scenes = catalog.assets.filter(e => e.kind !== 'icon').sort((a,b) => a.id.localeCompare(b.id));
  for(let first=0;first<scenes.length;first+=6) {
    const batch=scenes.slice(first,first+6), layers=[];
    for(let i=0;i<batch.length;i++) {
      const e=batch[i],left=i%2*576,top=Math.floor(i/2)*348;
      layers.push({input:await sharp('assets/expansion/'+e.file).resize(576,324).png().toBuffer(),left,top});
      const label=Buffer.from(`<svg width="576" height="24"><rect width="576" height="24" fill="#141917"/><text x="10" y="17" font-size="16" fill="#f1d395">${e.id}</text></svg>`);
      layers.push({input:label,left,top:top+324});
    }
    await sharp({create:{width:1152,height:Math.ceil(batch.length/2)*348,channels:4,background:'#141917'}}).composite(layers).png().toFile(`artifacts/expansion-scenes-${first/6+1}.png`);
  }
  let runtime=0,masters=0;
  for(const e of catalog.assets) {
    const file='assets/expansion/'+e.file,master='assets/expansion/'+e.master;
    const meta=await sharp(master).metadata();
    if(meta.width!==(e.kind==='icon'?512:1920)||meta.height!==(e.kind==='icon'?512:1080))throw Error('Bad master: '+e.id);
    if(e.kind==='icon'&&!(await sharp(master).stats()).channels.some((c,i)=>i===3&&c.min===0))throw Error('No transparency: '+e.id);
    runtime+=fs.statSync(file).size;masters+=fs.statSync(master).size;
  }
  console.log(JSON.stringify({assets:catalog.assets.length,runtimeMB:Math.round(runtime/1024/1024*10)/10,mastersMB:Math.round(masters/1024/1024*10)/10}));
})().catch(e=>{console.error(e);process.exit(1)});
