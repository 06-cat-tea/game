(() => {
  'use strict';
  let ctx,wheel=null,selected=-1,heldTab=false,panel=false,returnFocus=null,panelReturnFocus=null;
  const esc=s=>window.GameUI.esc(s),I=k=>window.UIIcons.icon(k);
  const entries=[['地图','map','codex','map'],['背包','backpack','inventory'],['任务','main-quest','journal'],['队伍','character','party','companions'],['技能','skills','party','skills'],['制作','crafting','crafting','craft'],['记录','achievement','codex','achievements'],['设置','settings','settings']];
  const root=()=>document.querySelector('#gameViewport');
  function blocked(){return window.GameLoading?.blocked()||panel||!!document.querySelector('#modal.open,.context-menu,.quick-wheel')||ctx?.getState().battle;}
  function render(s,st,hint,open){
    const wasOpen=panel;if(open&&!wasOpen)panelReturnFocus=document.activeElement;
    panel=open;root().classList.toggle('panel-open',open);root().classList.toggle('at-title',window.GameUI?.getCurrent()==='title');
    const p=window.PixelWorld.getInterior(),d=s.place==='city'?(p?.buildingId?window.RoyalCity.districts.find(d=>d.id===window.BuildingSystem.get(p.buildingId)?.district):window.RoyalCity.current(s.location.x,s.location.y)):null,name=p?.title||(d?'归灯王城 · '+d.name:window.GameData.PLACES[s.place].name);if(d)hint=d.description;
    document.querySelector('#hudLayer').innerHTML=`<div class="hud-location"><button class="hud-minimap" data-screen="codex" data-open-tab="map" aria-label="打开地图"><canvas id="hudMap" data-mode="local"></canvas></button><div><b>${esc(name)}</b><small id="clock">第 ${s.day} 日 · ${['清晨','正午','黄昏','深夜'][s.phase]}</small><button class="hud-quest" data-screen="journal">${esc(hint)}</button></div></div><nav class="hud-nav" aria-label="游戏功能">${[['inventory','背包','backpack'],['journal','任务','main-quest'],['party','队伍','character'],['more','更多','settings']].map(([id,name,icon])=>`<button data-screen="${id}" aria-label="${name}" title="${name}">${I(icon)}</button>`).join('')}</nav><div class="hud-companions">${s.party.active.map(id=>`<button data-hud-companion="${id}" aria-label="查看${esc(window.GameData.COMPANIONS[id].name)}">${window.WorldAssets.portrait(window.GrowthSystem.npcs()[id].type,window.GameData.COMPANIONS[id].name)}<small>${esc(window.GameData.COMPANIONS[id].name.split('·')[0])}</small></button>`).join('')}</div><div class="hud-vitals"><span>Lv.${s.player.level}　生命 ${s.player.hp}/${st.maxHp}</span><div class="bar"><i style="width:${s.player.hp/st.maxHp*100}%"></i></div><span>法力 ${s.player.mana}/${st.maxMana}</span><div class="bar mana"><i style="width:${st.maxMana?s.player.mana/st.maxMana*100:0}%"></i></div></div><div class="touch-stick" data-stick="1" role="group" aria-label="移动摇杆"><span></span><small>移动</small></div><div class="hud-actions">${p?'<button data-building-leave="1" aria-label="返回上一处">↩</button>':''}<button data-command="interact" class="hud-interact" aria-label="交互">${I('dialogue')}<small>${window.GameViewport.isTouch()?'交互':'E'}</small></button><button data-action="potion" aria-label="使用药剂"><span class="hud-symbol">✚</span><small>${s.potions}</small></button><button data-hud-wheel="1" aria-label="快捷轮盘">${I('settings')}<small>${window.GameViewport.isTouch()?'菜单':'Tab'}</small></button></div><div id="worldToast" class="world-toast">${window.GameViewport.isTouch()?'摇杆移动 · 点击目标或交互':'WASD 移动 · E 交互 · 按住 Tab 快捷轮盘'}</div>`;
    if(open&&!wasOpen){const first=[...document.querySelectorAll('#panelLayer button:not(:disabled)')].find(b=>b.getClientRects().length);first?.focus({preventScroll:true});}else if(!open&&wasOpen){(panelReturnFocus?.isConnected?panelReturnFocus:document.querySelector('#pixelWorld'))?.focus({preventScroll:true});panelReturnFocus=null;}
  }
  function updateLocation(s){if(s.place==='city'&&!s.location.sceneId){const d=RoyalCity.current(s.location.x,s.location.y),name=document.querySelector('.hud-location b'),hint=document.querySelector('.hud-quest');if(name)name.textContent='归灯王城 · '+d.name;if(hint)hint.textContent=d.description;}window.CircleMap?.draw();}
  function closeWheel(){const open=!!wheel;wheel?.remove();wheel=null;selected=-1;heldTab=false;if(open){window.PixelWorld.clearInput();(returnFocus?.isConnected?returnFocus:document.querySelector('#pixelWorld'))?.focus({preventScroll:true});}returnFocus=null;}
  function openWheel(held=false){
    if(window.GameLoading?.blocked()||!ctx||panel||document.querySelector('#modal.open,.context-menu')||ctx.getState().battle)return false;
    closeWheel();returnFocus=document.activeElement;window.PixelWorld.clearInput();heldTab=held;
    wheel=document.createElement('div');wheel.className='quick-wheel';wheel.setAttribute('role','dialog');wheel.setAttribute('aria-label','快捷轮盘');
    const mobile=window.GameViewport.isTouch();wheel.dataset.mobile=String(mobile);
    wheel.innerHTML=`<div class="wheel-disc">${entries.map(([name,icon],i)=>`<button data-wheel-index="${i}" style="--x:${Math.cos((i*45-90)*Math.PI/180)};--y:${Math.sin((i*45-90)*Math.PI/180)}">${I(icon)}<b>${name}</b></button>`).join('')}<div class="wheel-center"><span>快捷菜单</span><small>${held?'松开 Tab 选择':'点击功能'}</small></div><button class="wheel-cancel" data-wheel-close="1">取消</button></div>`;
    root().append(wheel);if(!held)wheel.querySelector('button').focus();return true;
  }
  function pick(i){if(!wheel||i<0||i>=entries.length)return;const [, ,screen,tab]=entries[i];closeWheel();ctx.showScreen(screen,tab);}
  function pointer(e){
    if(!wheel||!heldTab)return;const p=window.GameViewport.clientToLocal(e.clientX,e.clientY),size=window.GameViewport.size(),dx=p.x-size.width/2,dy=p.y-size.height/2;
    selected=Math.hypot(dx,dy)<38?-1:Math.round((Math.atan2(dy,dx)*180/Math.PI+90+360)%360/45)%8;
    wheel.querySelectorAll('[data-wheel-index]').forEach((b,i)=>b.classList.toggle('selected',i===selected));
  }
  function handle(ds){
    if(ds.hudWheel){openWheel(false);return true;}if(ds.wheelClose){closeWheel();return true;}if(ds.wheelIndex!==undefined){pick(Number(ds.wheelIndex));return true;}
    if(ds.fullscreen){window.GameViewport.fullscreen();return true;}
    if(ds.hudCompanion){ctx.showScreen('party','companions');window.GameUI.views.party.selected=ds.hudCompanion;window.GameUI.render();return true;}
    return false;
  }
  document.addEventListener('pointermove',pointer);
  document.addEventListener('keydown',e=>{
    if(e.key==='Tab'&&!e.repeat&&!window.GameViewport.isTouch()&&!blocked()&&!e.target.closest('input,textarea,select')){e.preventDefault();openWheel(true);return;}
    if(!wheel)return;
    if(e.key==='Escape'){e.preventDefault();e.stopImmediatePropagation();closeWheel();return;}
    if(e.key==='Tab'){e.preventDefault();if(!heldTab){const buttons=[...wheel.querySelectorAll('button')],i=buttons.indexOf(document.activeElement);buttons[(i+(e.shiftKey?-1:1)+buttons.length)%buttons.length].focus();}}
  },true);
  document.addEventListener('keyup',e=>{if(e.key==='Tab'&&heldTab){e.preventDefault();const i=selected;closeWheel();if(i>=0){const [, ,screen,tab]=entries[i];ctx.showScreen(screen,tab);}}},true);
  document.addEventListener('pointercancel',closeWheel);window.addEventListener('blur',closeWheel);window.addEventListener('gameviewportchange',closeWheel);document.addEventListener('visibilitychange',()=>{if(document.hidden)closeWheel();});
  window.GameHUD={configure:c=>{ctx=c;},render,updateLocation,handle,blocked,openWheel,closeWheel,panelOpen:()=>panel};
})();
