// Standard Cubism expression files complement the Editor's genuine MOC3 export.
const fs = require('node:fs'), path = require('node:path');
const [id, settingsFile] = process.argv.slice(2);
if (!/^[a-z][a-z0-9-]*$/.test(id || '') || !settingsFile) throw new Error('Usage: prepare-expressions.cjs <id> <model3.json>');
const file = path.resolve(settingsFile), base = path.dirname(file);
const setting = JSON.parse(fs.readFileSync(file, 'utf8'));
fs.mkdirSync(path.join(base, 'expressions'), {recursive:true});
setting.FileReferences.Expressions = Object.entries({neutral:0, smile:1, serious:-1}).map(([Name, Value]) => {
  const File = 'expressions/' + Name + '.exp3.json';
  fs.writeFileSync(path.join(base, File), JSON.stringify({Type:'Live2D Expression', FadeInTime:.15, FadeOutTime:.15,
    Parameters:[{Id:'ParamMouthForm', Value, Blend:'Overwrite'}]}, null, 2) + '\n');
  return {Name, File};
});
setting.Groups = [{Target:'Parameter', Name:'EyeBlink', Ids:['ParamEyeLOpen','ParamEyeROpen']},
  {Target:'Parameter', Name:'LipSync', Ids:['ParamMouthOpenY']}];
fs.writeFileSync(file, JSON.stringify(setting, null, 2) + '\n');
console.log('Prepared expressions for ' + id);
