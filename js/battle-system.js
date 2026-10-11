(() => {
  "use strict";
  const names={burn:"灼烧",poison:"中毒",vulnerable:"易伤",shield:"护盾"};
  function init(b){b.effects=b.effects||{player:[],enemy:[]};b.effects.player=b.effects.player||[];b.effects.enemy=b.effects.enemy||[];b.cooldowns=b.cooldowns||{};b.phase=b.phase||1;return b;}
  function apply(b,side,type,turns,potency,source){const arr=b.effects[side],old=arr.find(x=>x.type===type);if(old){old.turns=Math.max(old.turns,turns);old.potency=Math.max(old.potency,potency);old.source=source;}else arr.push({type,turns,potency,source});}
  function cleanse(b){b.effects.player=b.effects.player.filter(x=>!['burn','poison'].includes(x.type));}
  function intent(b){const phase=b.boss&&b.hp<=b.maxHp/2?2:1,index=b.round%3;if(!b.elite)return {name:"普通攻击",power:1};if(index===0)return{name:"蓄势重击",power:phase===2?1.7:1.4};if(index===1)return{name:names[b.status||"poison"]+"攻击",power:1,status:b.status||"poison"};return{name:"防御架势",power:.7,shield:true};}
  function damage(s,b,side,n){const effects=b.effects[side];if(effects.some(x=>x.type==="vulnerable"))n=Math.ceil(n*1.25);const shield=effects.find(x=>x.type==="shield");if(shield){const absorbed=Math.min(n,shield.potency);n-=absorbed;shield.potency-=absorbed;}if(side==="player")s.player.hp=Math.max(0,s.player.hp-n);else b.hp=Math.max(0,b.hp-n);return n;}
  function endTurn(s,b){const lines=[];for(const side of ["enemy","player"]){for(const e of b.effects[side]){if(e.type==="burn"||e.type==="poison"){const n=damage(s,b,side,e.potency);lines.push(`${side==="player"?"你":b.name}受到${names[e.type]} ${n} 点（${e.source}）`);}e.turns--;}b.effects[side]=b.effects[side].filter(e=>e.turns>0&&(e.type!=="shield"||e.potency>0));}for(const k in b.cooldowns)b.cooldowns[k]=Math.max(0,b.cooldowns[k]-1);b.round++;if(b.boss&&b.phase===1&&b.hp<=b.maxHp/2){b.phase=2;lines.push("敌人进入第二阶段，重击威力提高。");}return lines;}
  function resolve(s,move,h){
    const b=init(s.battle),st=h.stats(s),[kind,id]=move.split(":"),roll=h.roll;let hit=0,reduction=1,skip=false,heal=0,fled=false,lines=[];
    if(move==="potion"){if(s.potions<1)return{error:"药剂不足。"};s.potions--;heal=Math.min(40+(s.relationships?.pella?.value>=60?4:0),st.maxHp-s.player.hp);s.player.hp+=heal;lines.push(`药剂恢复 ${heal} 点生命。`);}
    else if(move==="flee"){fled=Math.random()<.5;lines.push(fled?"你找到撤离的间隙。":"撤离失败，敌人拦住了去路。");}
    else if(kind==="ability"){
      const sk=h.skills[id];if(!sk||sk.kind!=="active"||sk.job!==s.job||!s.learned.includes(id))return{error:"当前职业无法使用该技能。"};if(s.player.mana<sk.mp)return{error:"法力不足。"};if(b.cooldowns[id]>0)return{error:`还需冷却 ${b.cooldowns[id]} 回合。`};s.player.mana-=sk.mp;
      if(["damage","seal","wall","evasive","healStrike"].includes(sk.effect))hit=Math.floor(roll(st.atk+2,st.atk+8)*sk.power);
      if(sk.effect==="seal"){skip=true;b.cooldowns[id]=4;}
      if(sk.effect==="wall"){reduction=.3;apply(b,"player","shield",2,Math.ceil(st.maxHp*.12),sk.name);}
      if(sk.effect==="evasive")reduction=.5;
      if(sk.effect==="heal"||sk.effect==="healStrike"){heal=Math.ceil(st.maxHp*(sk.effect==="heal"?.28:.18));s.player.hp=Math.min(st.maxHp,s.player.hp+heal);cleanse(b);reduction=.6;}
      if(id==="predatorMark")apply(b,"enemy","vulnerable",3,0,sk.name);
      if(id==="starfall")apply(b,"enemy","burn",3,Math.max(3,Math.ceil(st.atk*.18)),sk.name);
    }else if(kind==="combo"){
      if(!s.party.active.includes(id)||(s.relationships[id]?.value||0)<60||s.player.mana<10)return{error:"羁绊或法力条件未满足。"};if(b.cooldowns[move]>0)return{error:"协奏仍在冷却。"};s.player.mana-=10;b.cooldowns[move]=4;hit=roll(st.atk+9,st.atk+16);if(id==="sylvi"){heal=Math.ceil(st.maxHp*.14);s.player.hp=Math.min(st.maxHp,s.player.hp+heal);cleanse(b);}if(id==="toren")reduction=.25;if(id==="mira")skip=true;
    }else if(move==="skill"){if(s.player.mana<12)return{error:"法力不足。"};s.player.mana-=12;hit=roll(st.atk+5,st.atk+13);}
    else if(move==="guard"){hit=roll(4,9);reduction=.42;}else if(move==="attack")hit=roll(Math.max(2,st.atk-2),st.atk+6);else return{error:"无效战斗操作。"};
    if(hit){if(Math.random()<st.crit)hit=Math.floor(hit*1.6);for(const ally of s.party.active)hit+=Math.floor(st.atk*(ally==="mira"?.38:.25)*(s.job==="warden"&&s.learned.includes("sharedVow")?1.2:1));hit=damage(s,b,"enemy",hit);lines.push(`你与同伴造成 ${hit} 点伤害。`);if(st.drain)s.player.hp=Math.min(st.maxHp,s.player.hp+Math.floor(hit*st.drain));}
    if(b.hp>0&&!fled){const next=intent(b);if(!skip){const cover=s.party.active.includes("toren")?.88:1,n=damage(s,b,"player",Math.max(1,Math.floor((roll(b.power-3,b.power+3)*next.power-st.def)*reduction*cover)));lines.push(`${next.name}造成 ${n} 点伤害。`);if(next.status){if(next.status==="shield")apply(b,"enemy","shield",2,12,b.name);else apply(b,"player",next.status,3,Math.max(3,Math.ceil(b.power*.18)),b.name);}if(next.shield)apply(b,"enemy","shield",2,Math.ceil(b.maxHp*.08),b.name);}else lines.push("封印压制了敌人的行动。");if(s.player.hp>0&&s.party.active.includes("sylvi"))s.player.hp=Math.min(st.maxHp,s.player.hp+Math.ceil(st.maxHp*.04));}
    if(heal)lines.push(`恢复 ${heal} 点生命。`);lines.push(...endTurn(s,b));b.line=lines.join(" ");
    // All outcomes are evaluated after the same status/cooldown settlement.
    return {outcome:s.player.hp<=0?"defeat":b.hp<=0?"win":fled?"flee":"continue"};
  }
  window.BattleSystem={init,intent,resolve,names};
})();
