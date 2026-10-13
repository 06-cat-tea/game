// Bundle genuine Cubism exports for file:// use, without network fetches.
const fs = require('node:fs');
const path = require('node:path');
const [id, settingsFile] = process.argv.slice(2);
if (!/^[a-z][a-z0-9-]*$/.test(id || '') || !settingsFile) throw new Error('Usage: node package-model.cjs <character-id> <model3.json>');
const file = path.resolve(settingsFile), base = path.dirname(file);
const setting = JSON.parse(fs.readFileSync(file,'utf8'));
const refs = setting.FileReferences;
if (!refs?.Moc || !refs.Textures?.length) throw new Error('Missing genuine Cubism moc or textures');
function read(relative) {
  const target = path.resolve(base,relative);
  if (!target.startsWith(base + path.sep)) throw new Error('Model file escapes its export directory');
  return fs.readFileSync(target);
}
const moc = read(refs.Moc);
if (moc.subarray(0,4).toString() !== 'MOC3') throw new Error('Not a Cubism MOC3 file');
const bundle = {setting, moc: moc.toString('base64'), textures: refs.Textures.map(p=>'data:image/png;base64,'+read(p).toString('base64')),
  physics: refs.Physics ? JSON.parse(read(refs.Physics).toString('utf8')) : null,
  expressions: Object.fromEntries((refs.Expressions||[]).map(e=>[e.Name,JSON.parse(read(e.File).toString('utf8'))]))};
const output = path.resolve(__dirname,'../../assets/characters',id,'model-bundle.js');
fs.writeFileSync(output,'window.CharacterModelBundles=window.CharacterModelBundles||{};window.CharacterModelBundles['+JSON.stringify(id)+']='+JSON.stringify(bundle)+';\n');
console.log('Packaged '+id+' ('+moc.length+' moc bytes, '+bundle.textures.length+' textures)');
