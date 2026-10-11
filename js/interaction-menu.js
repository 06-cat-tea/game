(() => {
  "use strict";
  let handlers,menu,timer,start,suppressUntil=0,focusBefore;
  const esc=s=>window.GameUI.esc(s);
  function close(){clearTimeout(timer);if(menu){menu.remove();menu=null;if(focusBefore?.isConnected)focusBefore.focus();}}
  function target(event){const el=event.target.closest('[data-context-type]');if(el)return{type:el.dataset.contextType,id:el.dataset.contextId};if(event.target.id==="pixelWorld")return window.PixelWorld.targetAt(event.clientX,event.clientY)||{type:"world"};return null;}
  function show(t,x,y){if(!t)return;close();window.PixelWorld.clearInput();const entries=handlers.entries(t);if(!entries.length)return;focusBefore=document.activeElement;menu=document.createElement("div");menu.className="context-menu";menu.setAttribute("role","menu");menu.setAttribute("aria-label","对象操作");menu.innerHTML=`<div class="context-title">${esc(handlers.title(t))}</div>`+entries.map((o,i)=>`<button role="menuitem" data-context-command="${i}" ${o.disabled?"disabled":""}>${o.icon?window.UIIcons.icon(o.icon):""}<span>${esc(o.label)}</span></button>`).join("");document.body.append(menu);const box=menu.getBoundingClientRect();menu.style.left=Math.max(8,Math.min(x,innerWidth-box.width-8))+"px";menu.style.top=Math.max(8,Math.min(y,innerHeight-box.height-8))+"px";menu.addEventListener("click",e=>{const b=e.target.closest('[data-context-command]');if(!b||b.disabled)return;const entry=entries[Number(b.dataset.contextCommand)];close();handlers.execute(entry,t);});menu.querySelector("button:not(:disabled)")?.focus();}
  function bind(h){handlers=h;
    document.addEventListener("contextmenu",e=>{const t=target(e);if(!t||e.target.closest("input,textarea"))return;e.preventDefault();show(t,e.clientX,e.clientY);});
    document.addEventListener("pointerdown",e=>{if(menu&&!menu.contains(e.target))close();if(e.pointerType!=="touch"||!e.isPrimary)return;const t=target(e);if(!t)return;start={x:e.clientX,y:e.clientY,id:e.pointerId};clearTimeout(timer);timer=setTimeout(()=>{show(t,start.x,start.y);suppressUntil=performance.now()+900;},450);});
    document.addEventListener("pointermove",e=>{if(start&&e.pointerId===start.id&&Math.hypot(e.clientX-start.x,e.clientY-start.y)>10)clearTimeout(timer);});
    for(const type of ["pointerup","pointercancel"])document.addEventListener(type,()=>{clearTimeout(timer);start=null;});
    document.addEventListener("click",e=>{if(performance.now()<suppressUntil&&!e.target.closest(".context-menu")){e.preventDefault();e.stopImmediatePropagation();return;}const b=e.target.closest('[data-context-more]');if(b){e.preventDefault();e.stopImmediatePropagation();const rect=b.getBoundingClientRect();show(target(e),rect.left,rect.bottom);}},true);
    document.addEventListener("keydown",e=>{if(!menu)return;if(e.key==="Escape"){e.preventDefault();e.stopImmediatePropagation();close();}if(["ArrowDown","ArrowUp","Home","End","Tab"].includes(e.key)){e.preventDefault();const buttons=[...menu.querySelectorAll("button:not(:disabled)")],i=buttons.indexOf(document.activeElement),next=e.key==="Home"?0:e.key==="End"?buttons.length-1:(i+(e.key==="ArrowUp"||e.shiftKey?-1:1)+buttons.length)%buttons.length;buttons[next]?.focus();}},true);
    window.addEventListener("resize",close);window.addEventListener("blur",close);document.addEventListener("visibilitychange",close);
  }
  window.InteractionMenu={bind,show,close};
})();
