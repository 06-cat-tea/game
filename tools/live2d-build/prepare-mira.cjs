// Package imagegen-produced layers into an aligned, editable PSD.
// Cropping atlas cells, resizing and positioning do not repaint source artwork.
const fs = require('node:fs');
const path = require('node:path');
const sharp = require('sharp');
const { writePsdBuffer, readPsd } = require('ag-psd');
const dir = path.resolve(__dirname, '../../assets/characters/mira');
const width = 1024, height = 1536;
const children = [], manifest = [];
async function add(name, file, left, top, targetWidth, hidden = false, cell) {
  let input = sharp(path.join(dir, file));
  if (cell) input = sharp(await input.extract(cell).png().toBuffer());
  // Trim only empty margins before scaling atlas sprites.
  if (cell) input = input.trim({threshold: 10});
  const {data, info} = await input.resize({width: targetWidth}).ensureAlpha().raw().toBuffer({resolveWithObject: true});
  const layer = {name, left, top, right: left + info.width, bottom: top + info.height, hidden,
    imageData: {width: info.width, height: info.height, data: new Uint8ClampedArray(data)}};
  children.push(layer);
  const filename = name + '.png';
  await sharp(data, {raw: {width: info.width, height: info.height, channels: 4}}).png().toFile(path.join(dir, 'layers', filename));
  manifest.push({name, file: 'layers/' + filename, left, top, width: info.width, height: info.height, hidden});
}
(async () => {
  fs.mkdirSync(path.join(dir, 'layers'), {recursive: true});
  await add('01_BackHair', 'back-hair.png', 187, 10, 650);
  await add('02_FaceBase', 'face-base.png', 330, 70, 360);
  await add('03_Body', 'body.png', 62, 255, 900);
  const eyeMeta = await sharp(path.join(dir, 'eyes-atlas.png')).metadata();
  const ew = Math.floor(eyeMeta.width / 2), eh = Math.floor(eyeMeta.height / 2);
  await add('04_EyeLeftOpen', 'eyes-atlas.png', 435, 179, 66, false, {left: 0, top: 0, width: ew, height: eh});
  await add('05_EyeRightOpen', 'eyes-atlas.png', 530, 179, 66, false, {left: ew, top: 0, width: ew, height: eh});
  await add('06_EyeLeftClosed', 'eyes-atlas.png', 435, 180, 66, true, {left: 0, top: eh, width: ew, height: eh});
  await add('07_EyeRightClosed', 'eyes-atlas.png', 530, 180, 66, true, {left: ew, top: eh, width: ew, height: eh});
  const mouthMeta = await sharp(path.join(dir, 'mouth-atlas.png')).metadata();
  const mw = Math.floor(mouthMeta.width / 3), mh = Math.floor(mouthMeta.height / 2);
  const mouths = ['Neutral', 'Smile', 'Serious', 'Small', 'Medium', 'Open'];
  for (let i = 0; i < mouths.length; i++) {
    await add('08_Mouth' + mouths[i], 'mouth-atlas.png', 492, 284, 33, i !== 0,
      {left: (i % 3) * mw, top: Math.floor(i / 3) * mh, width: mw, height: mh});
  }
  await add('09_FrontHair', 'front-hair.png', 212, 10, 600);
  const visible = manifest.filter(x => !x.hidden);
  const composites = [];
  for (const x of visible) {
    const cropWidth = Math.min(x.width, width - x.left), cropHeight = Math.min(x.height, height - x.top);
    const input = await sharp(path.join(dir, x.file)).extract({left: 0, top: 0, width: cropWidth, height: cropHeight}).png().toBuffer();
    composites.push({input, left: x.left, top: x.top});
  }
  const composite = await sharp({create: {width, height, channels: 4, background: '#00000000'}}).composite(composites).png().toBuffer();
  fs.writeFileSync(path.join(dir, 'layered-preview.png'), composite);
  await sharp(composite).extract({left:0, top:0, width, height:1200}).png().toFile(path.join(dir, 'mira-standing.png'));
  const compositeData = await sharp(composite).ensureAlpha().raw().toBuffer();
  const psd = {width, height, children, imageData: {width, height, data: new Uint8ClampedArray(compositeData)}};
  const psdFile = path.join(dir, 'mira-layered-v1.psd');
  fs.writeFileSync(psdFile, writePsdBuffer(psd, {generateThumbnail: false}));
  const checked = readPsd(fs.readFileSync(psdFile), {skipLayerImageData: true, skipCompositeImageData: true, skipThumbnail: true});
  if (checked.children.length !== children.length) throw new Error('PSD layer count mismatch');
  fs.writeFileSync(path.join(dir, 'layers.json'), JSON.stringify({width, height, layers: manifest}, null, 2));
  console.log(JSON.stringify({psdFile, layers: children.length, width, height}));
})().catch(error => {console.error(error); process.exitCode = 1;});
