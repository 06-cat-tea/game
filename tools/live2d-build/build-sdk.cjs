const fs = require('node:fs');
const path = require('node:path');
const esbuild = require('esbuild');
(async () => {
  const output = path.resolve(__dirname, '../../assets/vendor/live2d');
  fs.mkdirSync(output, {recursive:true});
  await esbuild.build({entryPoints:[path.join(__dirname,'sdk-entry.ts')],outfile:path.join(output,'cubism-framework.js'),bundle:true,format:'iife',globalName:'AshenCubism',target:'es2020',minify:true,legalComments:'eof'});
  const shaders = {};
  const dir = path.join(__dirname,'framework-5-r5/Shaders/WebGL');
  for (const name of fs.readdirSync(dir)) if (/\.(vert|frag)$/.test(name)) shaders[name] = fs.readFileSync(path.join(dir,name),'utf8');
  fs.writeFileSync(path.join(output,'cubism-shaders.js'), 'window.AshenCubismShaders='+JSON.stringify(shaders)+';\n');
  fs.writeFileSync(path.join(output,'VERSION.txt'),'Cubism SDK for Web 5-r.5\nSource: https://cubism.live2d.com/sdk-web/bin/CubismSdkForWeb-5-r.5.zip\n');
  console.log('Built official Cubism framework and '+Object.keys(shaders).length+' offline shaders.');
})().catch(e=>{console.error(e);process.exitCode=1;});
