const fs=require('node:fs');
const shapes={
 'main-quest':'M16 4 26 16 16 28 6 16Z M16 10v8 M16 22v1',
 'side-quest':'M16 5 27 16 16 27 5 16Z M11 16h10 M16 11v10',
 character:'M21 11a5 5 0 1 1-10 0 5 5 0 0 1 10 0 M6 27c0-8 20-8 20 0',
 backpack:'M9 10V8c0-6 14-6 14 0v2 M6 10h20v17H6Z M10 17h12v6H10Z M13 13h6',
 skills:'m16 3 3 9 9 4-9 3-3 10-3-10-9-3 9-4Z',
 equipment:'m23 4 5 5-15 15-5-5Z M5 17l10 10 M5 27l5-5',
 enhancement:'M7 25 25 7 M19 7h6v6 M5 15l5-5 M19 27l5-5 M12 5v5 M27 15h-5',
 crafting:'m6 5 7 2 5 7-4 4-7-5Z M16 17l10 10-3 3-10-10 M7 24l8-8',
 map:'m3 7 9-3 8 4 9-3v21l-9 3-8-4-9 3Z M12 4v21 M20 8v21',
 exploration:'M16 3a13 13 0 1 0 0 26 13 13 0 0 0 0-26 M21 10l-3 9-8 3 3-9Z',
 combat:'m5 4 4 1 15 20-3 3-15-20Z M28 4l-4 1L9 25l3 3L27 8 M4 22l7 7 M22 22l7 7',
 rest:'M24 5c-18-4-24 21-5 23 5 0 8-3 10-6-13 3-18-8-5-17Z',
 dialogue:'M4 5h24v17H13l-7 6v-6H4Z M9 11h14 M9 16h9',
 affinity:'M16 27 5 16C-2 5 11-1 16 9 21-1 34 5 27 16Z',
 achievement:'M9 4h14v10c0 10-14 10-14 0Z M9 7H4v5c0 5 5 6 7 6 M23 7h5v5c0 5-5 6-7 6 M16 22v6 M10 28h12',
 save:'M5 4h20l3 4v21H4V4Z M9 4v9h13V4 M9 20h14v9H9Z',
 load:'M16 3v17 M10 14l6 6 6-6 M5 22v7h22v-7',
 settings:'M16 11a5 5 0 1 0 0 10 5 5 0 0 0 0-10 M13 3h6l1 4 4 2 4-1 3 5-3 3v4l3 3-3 5-4-1-4 2-1 4h-6l-1-4-4-2-4 1-3-5 3-3v-4l-3-3 3-5 4 1 4-2Z',
 travel:'M4 16h24 M19 7l9 9-9 9 M4 7v18',
 title:'M4 15 16 4l12 11 M7 13v15h18V13 M13 28v-9h6v9',
 ranger:'M8 4c19 2 19 22 0 24 M8 4v24 M5 16h24 M23 11l6 5-6 5',
 arcanist:'M16 4 24 12 16 20 8 12Z M16 20v9 M5 5l3 3 M26 5l-3 3',
 warden:'M16 3 27 7v11c-1 5-6 9-11 12C11 27 6 23 5 18V7Z M16 7v18 M10 13h12',
 assassin:'M7 4 22 23l-3 3L4 7Z M25 4 10 23l3 3L28 7Z M3 23l6 6 M23 23l6 6',
 priest:'M5 7c5-3 8-2 11 0 3-2 6-3 11 0v21c-5-3-8-2-11 0-3-2-6-3-11 0Z M16 7v21 M21 10v9 M18 14h6',
 alchemist:'M12 3h8 M13 3v9L6 23c-2 5 22 5 20 0l-7-11V3 M9 20h14 M13 24h2'
};
fs.mkdirSync('assets/icons/rail',{recursive:true});
for(const[id,d]of Object.entries(shapes))fs.writeFileSync('assets/icons/rail/'+id+'.svg',`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" fill="none" stroke="#f1eee5" stroke-width="1.35" stroke-linecap="round" stroke-linejoin="round"><path d="${d}"/></svg>`);
console.log('Built '+Object.keys(shapes).length+' original vector icons');
