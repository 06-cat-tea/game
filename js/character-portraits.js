(() => {
  'use strict';
  const entries = {
    hero: {name: '你', fallbackType: 'hero'},
    mira: {name: '米拉·烬语', fallbackType: 'mage', image: 'assets/characters/mira/mira-standing.png', modelBundle: 'assets/characters/mira/model-bundle.js'},
    toren: {name: '托伦·灰盾', fallbackType: 'knight'},
    sylvi: {name: '希薇·苔歌', fallbackType: 'archer'},
    'ridge-scout': {name: '夜岚', fallbackType: 'bandit'},
    eira: {name: '艾拉祭司', fallbackType: 'priest'},
    alchemist: {name: '瑟琳', fallbackType: 'mage'}
  };
  const cache = new Map();
  function preload(id) {
    const entry = entries[id];
    if (!entry?.image || cache.has(id)) return;
    const image = new Image(); image.src = entry.image; cache.set(id, image);
  }
  function markup(id, name, type) {
    const entry = entries[id];
    if (!entry?.image) return WorldAssets.portrait(entry?.fallbackType || type, name, 'dialogue-portrait');
    const safeName = window.GameUI.esc(name);
    return `<img class="dialogue-portrait character-standing-art" src="${entry.image}" alt="${safeName}" decoding="async"><canvas class="character-live2d" aria-hidden="true" hidden></canvas>`;
  }
  window.CharacterPortraits = {entries, preload, markup};
})();
