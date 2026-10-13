// Deterministic network timing checks, without waiting for real download timeouts.
const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
function fixture(){
  const timers=new Map(),images=[],events=[];let next=0;
  class Image {
    constructor(){images.push(this);this.complete=false;this.naturalWidth=0;}
    decode(){return this.invalid?Promise.reject(Error('decode')):Promise.resolve();}
    async arrive(){this.complete=true;this.naturalWidth=256;await this.onload();}
  }
  const scope={Image,location:{protocol:'https:'},Date,Promise,CustomEvent:class{constructor(type,options){this.type=type;this.detail=options.detail;}},setTimeout(fn,ms){const id=++next;timers.set(id,{fn,ms});return id;},clearTimeout(id){timers.delete(id);}};
  scope.window=scope;scope.dispatchEvent=e=>events.push(e);vm.runInNewContext(fs.readFileSync('js/world-assets.js','utf8'),scope);
  return {assets:scope.WorldAssets,images,events,fire(ms){const pair=[...timers].find(([,t])=>ms==='timeout'?t.ms>=20000:t.ms===ms);assert(pair,'timer '+ms);timers.delete(pair[0]);pair[1].fn();}};
}
(async()=>{
  const late=fixture(),waiting=late.assets.load('portraits','hero');late.fire('timeout');
  assert.equal((await waiting).status,'failed');await late.images[0].arrive();
  assert.equal((await late.assets.load('portraits','hero')).status,'ready');
  assert(late.events.some(e=>e.type==='worldassetready'));console.log('PASS delayed image recovers after timeout');
  const transient=fixture(),result=transient.assets.load('portraits','hero');transient.images[0].onerror();transient.fire(750);
  assert.equal(transient.images.length,2);assert.match(transient.images[1].src,/hero-256\.png\?asset-retry=/);
  await transient.images[1].arrive();assert.equal((await result).status,'ready');console.log('PASS transient failure retries with a fresh URL');
  assert.equal((await transient.assets.load('portraits','hero',true)).status,'ready');assert.equal(transient.images.length,2);
  const decode=fixture(),decoded=decode.assets.load('portraits','hero');decode.images[0].invalid=true;await decode.images[0].arrive();decode.fire(750);await decode.images[1].arrive();
  assert.equal((await decoded).status,'ready');console.log('PASS decode failure retries without caching a bad image');
  const missing=fixture(),failed=missing.assets.load('portraits','hero');missing.images[0].onerror();missing.fire(750);missing.images[1].onerror();
  assert.equal((await failed).status,'failed');assert.equal(missing.images.length,2);
  const retry=missing.assets.load('portraits','hero',true);assert.match(missing.images[2].src,/asset-retry=/);await missing.images[2].arrive();
  assert.equal((await retry).status,'ready');await missing.images[1].arrive();assert.equal(missing.assets.get('portraits','hero'),missing.images[2]);console.log('PASS bounded failure, manual retry and stale callback isolation');
})().catch(e=>{console.error(e);process.exitCode=1;});
