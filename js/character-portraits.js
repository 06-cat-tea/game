(() => {
  'use strict';
  const entries = {
    hero: {name: '你', fallbackType: 'hero'},
    mira: {name: '米拉·烬语', fallbackType: 'mage', modelBundle: 'assets/characters/mira/model-bundle.js?v=6.9'},
    toren: {name: '托伦·灰盾', fallbackType: 'knight'},
    sylvi: {name: '希薇·苔歌', fallbackType: 'archer'},
    'ridge-scout': {name: '夜岚', fallbackType: 'bandit'},
    eira: {name: '艾拉祭司', fallbackType: 'priest'},
    alchemist: {name: '瑟琳', fallbackType: 'mage'}
  };
  for(const [id,entry] of Object.entries(entries)) {
    if(id==='eira')continue;
    entry.images=Object.fromEntries(['neutral','smile','serious'].map(expression=>[expression,`assets/characters/${id}/static-v1/${expression}.webp`]));
    entry.image=entry.images.neutral;
  }
  const bindings=new WeakMap();
  // Avatars are mechanically cropped from the same neutral standing art.
  for(const [id,entry] of Object.entries(entries))if(entry.image)entry.avatar=`assets/characters/${id}/static-v1/avatar.webp`;
  function avatar(id,name,className='entry-portrait',fallbackType){
    const entry=entries[id],safe=GameUI.esc;
    if(!entry?.avatar)return WorldAssets.portrait(entry?.fallbackType||fallbackType,name,className);
    return `<img class="${safe(className)} character-avatar" data-avatar-id="${safe(id)}" src="${WorldAssets.path('portraits',entry.fallbackType)}" alt="${safe(name)}" draggable="false" decoding="async">`;
  }
  function activateAvatars(root){
    for(const image of root.querySelectorAll('img[data-avatar-id]')){
      if(bindings.has(image))continue;
      const entry=entries[image.dataset.avatarId],binding={rank:0};bindings.set(image,binding);
      const update=()=>{if(image.isConnected&&bindings.get(image)===binding&&WorldAssets.inspect('url',entry.avatar)?.status==='ready'){image.src=WorldAssets.get('url',entry.avatar).src;image.dataset.avatarState='ready';}};
      binding.update=update;WorldAssets.load('url',entry.avatar).then(update);
    }
  }
  const expressionFor=(entry,expression)=>entry?.images?.[expression]?expression:'neutral';
  function preload(id,expression='neutral') {
    const entry=entries[id],url=entry?.images?.[expressionFor(entry,expression)];
    return url?WorldAssets.load('url',url,WorldAssets.inspect('url',url)?.status==='failed'):Promise.resolve(null);
  }
  function markup(id,name,type,expression='neutral',options={}) {
    const entry=entries[id];
    if(!entry?.image)return WorldAssets.portrait(entry?.fallbackType||type,name,options.className||'dialogue-portrait');
    const mood=expressionFor(entry,expression),safe=GameUI.esc;
    const image=`<img class="${safe(options.className||'dialogue-portrait')} character-standing-art" data-standing-id="${safe(id)}" data-standing-expression="${mood}" data-portrait-state="fallback" src="${WorldAssets.path('portraits',entry.fallbackType)}" alt="${safe(name)}" decoding="async">`;
    return image+(entry.modelBundle&&options.animated!==false?'<canvas class="character-live2d" aria-hidden="true" hidden></canvas>':'');
  }
  function apply(image,binding,url,rank,mood) {
    if(!image.isConnected||bindings.get(image)!==binding||rank<binding.rank||WorldAssets.inspect('url',url)?.status!=='ready')return;
    binding.rank=rank;const source=WorldAssets.get('url',url).src;
    if(image.src!==source)image.src=source;
    image.dataset.portraitState='ready';image.dataset.loadedExpression=mood;
    // Keep the image hidden if Mira's canvas is already rendering.
  }
  function activate(root=document) {
    activateAvatars(root);
    for(const image of root.querySelectorAll('img[data-standing-id]')) {
      if(bindings.has(image))continue;
      const id=image.dataset.standingId,entry=entries[id],expression=image.dataset.standingExpression;
      const binding={rank:-1};bindings.set(image,binding);
      preload(id,expression).then(async result=>{
        if(result?.status==='ready'){apply(image,binding,entry.images[expression],1,expression);return;}
        if(!image.isConnected||expression==='neutral')return;
        const fallback=await preload(id,'neutral');
        if(fallback?.status==='ready')apply(image,binding,entry.image,0,'neutral');
      });
    }
  }
  function setExpression(root,expression='neutral') {
    if(!root)return;
    for(const image of root.querySelectorAll('img[data-standing-id]')) {
      const mood=expressionFor(entries[image.dataset.standingId],expression);
      if(image.dataset.standingExpression===mood)continue;
      image.dataset.standingExpression=mood;bindings.delete(image);
    }
    activate(root);
  }
  window.addEventListener('worldassetready',event=>{
    if(event.detail.kind!=='url')return;
    for(const image of document.querySelectorAll('img[data-avatar-id]'))if(entries[image.dataset.avatarId]?.avatar===event.detail.id)bindings.get(image)?.update?.();
    for(const image of document.querySelectorAll('img[data-standing-id]')) {
      const binding=bindings.get(image),entry=entries[image.dataset.standingId],mood=image.dataset.standingExpression;
      if(!binding)continue;
      if(entry.images[mood]===event.detail.id)apply(image,binding,event.detail.id,1,mood);
      else if(entry.image===event.detail.id)apply(image,binding,event.detail.id,0,'neutral');
    }
  });
  window.CharacterPortraits={entries,preload,markup,avatar,activate,setExpression};
})();
