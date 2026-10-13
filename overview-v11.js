/* Current desktop overview. Window resizing changes layout, never the content version. */
(()=>{
function initialize(){
 if(!window.workbenchClient.desktop)return;
 const D=window.overviewV11Data,V=window.overviewV3,O=window.overviewV3Data;
 const dates={morning:'10.12',evening:'10.12'};
 let layerPreview=null,dragId=null,applying=false,frame=0;
 const expanded=new Set();
 const enabled=()=>window.workbenchClient.desktop&&!$('#overviewView').hidden;
 const viewOrder=()=>{const base=state.profileOrderMode==='manual'?[...state.order]:O.orders[V.mode()].filter(id=>state.order.includes(id));return [...base.filter(id=>state.pinned.includes(id)),...base.filter(id=>!state.pinned.includes(id))];};
 const currentPortfolio=()=>V.portfolio();
 const layer=()=>layerPreview||(demoState==='new'?'猜你想看':currentPortfolio().some(s=>s.group==='holdings')?'持仓':currentPortfolio().some(s=>s.group==='watchlist')?'自选':'最近搜索');
 const dot='<span class="v11-dot" aria-label="演示数据">●</span>';
 function points(period,date){
  const kind=periodName(period),data=D.cards[kind][date],layers=['持仓','自选','最近搜索','猜你想看'];
  const start=date==='10.12'?layer():'持仓';
  let out=[];
  for(let i=layers.indexOf(start);i<layers.length&&out.length<2;i++){
   const l=layers[i];let rows=data.it[l]||[];
   if(date==='10.12'&&!layerPreview&&demoState!=='new'&&['持仓','自选'].includes(l)){
    const candidates=currentPortfolio().filter(s=>(s.group==='holdings'?'持仓':'自选')===l);
    const rank=D.ranks[V.mode()];candidates.sort((a,b)=>rank.indexOf(a.code)-rank.indexOf(b.code));
    rows=candidates.map(s=>{const fixed=D.securities.find(r=>r.code===s.code),n=D.news.find(r=>r.code===s.code),example=data.it['持仓'].find(r=>r[0]===s.name);return [s.name,fixed?`${fixed.change>0?'+':fixed.change<0?'−':''}${Math.abs(fixed.change).toFixed(2)}%`:'—',fixed?.change<0?'down':'up',example?.[3]||n?.title||'今天暂无新事件'];});
   }
   rows.forEach(r=>{if(out.length<2)out.push([l,...r]);});
  }
  return out;
 }
 function card(period){
  const date=dates[period],kind=periodName(period),data=D.cards[kind][date];
  return `<section class="v11-card" data-v11-period="${period}" data-v11-date="${date}"><div class="v11-card-top"><h3>${kind} · ${date}</h3><div class="v11-history"><button class="v11-history-button" data-v11-history="${period}" aria-label="${kind}${date}历史" aria-haspopup="menu" aria-expanded="false">${date} · 历史</button><div class="v11-history-menu" role="menu" hidden>${D.dates.map(d=>`<button role="menuitem" data-v11-date-pick="${period}" data-date="${d}" aria-current="${d===date}">${d} ${kind}</button>`).join('')}</div></div></div><p class="v11-conclusion">${esc(data.c)}</p><div class="v11-items">${points(period,date).map(([l,name,change,tone,event])=>`<article class="v11-item"><div class="v11-item-first"><span class="v11-layer">${esc(l)}</span><strong>${esc(name)}</strong><span class="v11-change ${tone}">${esc(change)}${dot}</span></div><p class="v11-event">${esc(event)}</p></article>`).join('')}</div><p class="v11-trend">${esc(data.t)}</p><a class="v11-full" href="#/briefs/2026-${date.replace('.','-')}/${period}" data-v11-full="${period}">查看完整简报</a></section>`;
 }
 function fitCard(c){
  const stamp=c.getBoundingClientRect().width.toFixed(2)+'|'+c.textContent;
  if(c.dataset.v11FitStamp===stamp)return;
  c.dataset.v11FitStamp=stamp;
  const items=[...c.querySelectorAll('.v11-item')];items.forEach(n=>n.hidden=false);
  const conclusion=c.querySelector('.v11-conclusion'),first=items[0];
  const tooLong=conclusion.getBoundingClientRect().height>44.5||items.some(n=>n.querySelector('.v11-item-first').getBoundingClientRect().height>22.5||n.querySelector('.v11-event').getBoundingClientRect().height>22.5);
  if(tooLong&&items.length>1)items.at(-1).hidden=true;
  const trend=c.querySelector('.v11-trend');trend.hidden=false;
  if(trend.getBoundingClientRect().height>22.5)trend.hidden=true;
 }
 function note(){const n=$('#profileLayoutNote');if(!n)return;const names=viewOrder().map(id=>O.names[id]);if(V.mode()==='unset')names.splice(3,0,'让工作台更懂你');const html=`<div>${state.profileOrderMode==='manual'?'<span>手动顺序</span>':''}<button class="v11-sort" data-v11-auto>按画像排序</button></div><p class="v3-annotation">按已保存习惯 · ${O.labels[V.mode()]} · ${O.rules[V.mode()]}</p><details class="v11-order-details"><summary>查看当前顺序</summary><span>${names.join(' → ')}</span></details>`;const key=JSON.stringify([state.profileOrderMode,V.mode(),names]);if(n.dataset.v11NoteKey!==key){n.innerHTML=html;n.dataset.v11NoteKey=key;}}
 function overviewNews(){
  const root=$('[data-widget="holdings-news"] .v3-targets');if(!root)return;
  const rank=D.ranks[V.mode()];
  const rows=[...root.querySelectorAll(':scope>[data-v3-security]')];rows.sort((a,b)=>{const held=n=>n.querySelector('.tag')?.textContent.includes('持仓');return Number(held(b))-Number(held(a))||rank.indexOf(a.dataset.v3Security)-rank.indexOf(b.dataset.v3Security);}).forEach((n,i)=>{const at=root.children[i];if(at!==n)root.insertBefore(n,at||null);});
  const open=expanded.has('holdings-news');const limit=viewOrder()[0]==='holdings-news'?1:2;rows.slice(limit).forEach(n=>n.hidden=!open);if(rows.length>limit){let b=root.querySelector('[data-v11-targets]');if(!b){b=document.createElement('button');b.dataset.v11Targets='';b.className='v11-more';root.append(b);}b.textContent=open?'收起其余标的':'展开其余标的';b.setAttribute('aria-expanded',String(open));if(root.lastElementChild!==b)root.append(b);}
 }
 function limitEvents(){
  const root=$('[data-widget="events"] .widget-body');if(!root)return;
  const rows=[...root.querySelectorAll('.flow-event-row')],names=currentPortfolio().map(s=>s.name);
  const personal=discovery==='personal'&&names.length>0,relevant=n=>names.some(name=>n.textContent.includes(name));
  if(personal)rows.sort((a,b)=>Number(relevant(b))-Number(relevant(a))).forEach((n,i)=>{const current=[...root.querySelectorAll('.flow-event-row')][i];if(current!==n)root.insertBefore(n,current);});
  const preferred=personal?rows.filter(relevant):rows;
  const open=expanded.has('events'),limited=V.mode()==='unset';
  rows.forEach(n=>n.hidden=!open&&((personal&&!relevant(n))||(limited&&preferred.indexOf(n)>0)));
  if(rows.length>preferred.length||(limited&&rows.length>1)){
   let button=root.querySelector('[data-v11-events]');if(!button){button=document.createElement('button');button.className='v11-more';button.dataset.v11Events='';root.append(button);}
   button.textContent=open?'收起其余事件':'展开其余事件';button.setAttribute('aria-expanded',String(open));
  }
 }
 function apply(){
  if(applying)return;applying=true;
  const on=enabled();document.body.classList.toggle('overview-v11',on);
  try{
   if(!on)return;
   const grid=$('#widgetGrid');const desired=viewOrder();if([...grid.querySelectorAll(':scope>[data-widget]')].map(n=>n.dataset.widget).join('|')!==desired.join('|'))desired.forEach(id=>{const n=grid.querySelector(`[data-widget="${id}"]`);if(n)grid.append(n);});
   const guide=grid.querySelector('[data-v3-guide]');if(guide){const before=[...grid.children].filter(n=>n!==guide)[3];if(before&&guide.nextElementSibling!==before)grid.insertBefore(guide,before);}
   const brief=grid.querySelector('[data-widget="brief"]');
   if(brief){
    const head=brief.querySelector('.widget-head');
    if(!head.querySelector('[data-v11-header]'))head.innerHTML='<div class="widget-title" data-v11-header><h2>个人简报</h2></div><div class="widget-tools"><button class="v11-collapse" data-v11-collapse="brief" aria-expanded="true">收起</button><button class="v11-menu-trigger" data-menu="brief" aria-label="个人简报组件菜单" aria-expanded="false">⋮</button></div>';
    const button=head.querySelector('[data-v11-collapse]');button.textContent=state.collapsed.includes('brief')?'展开':'收起';button.setAttribute('aria-expanded',String(!state.collapsed.includes('brief')));
    const body=brief.querySelector('.widget-body');
    const signature=JSON.stringify([dates,layerPreview,layer(),V.mode(),demoState,currentPortfolio().map(s=>[s.code,s.group])]);
    if(body.dataset.v11Signature!==signature||!body.querySelector('.v11-pair')){body.innerHTML=`<div class="v11-pair">${card('morning')}${card('evening')}</div>`;body.dataset.v11Signature=signature;}
    brief.querySelectorAll('.v11-card').forEach(fitCard);
   }
   grid.querySelectorAll('[data-menu]').forEach(b=>{if(b.textContent!=='⋮'){b.innerHTML='⋮';b.classList.add('v11-menu-trigger');}b.onclick=e=>{e.stopPropagation();menu(b.dataset.menu);};});
   overviewNews();limitEvents();note();
   const texts=document.createTreeWalker($('#overviewView'),NodeFilter.SHOW_TEXT);let textNode;while(textNode=texts.nextNode()){const el=textNode.parentElement;if(!textNode.data.trim()||el.closest('script,style,[hidden]')||!el.getClientRects().length)continue;const cs=getComputedStyle(el);if(parseFloat(cs.fontSize)<12)el.style.setProperty('font-size','12px','important');}

   // Existing prototype copy also follows the no-ellipsis rule on this page.
   const walker=document.createTreeWalker($('#overviewView'),NodeFilter.SHOW_TEXT);let node;
   while(node=walker.nextNode()){if(node.parentElement.closest('script,style,.v3-annotation,[hidden]'))continue;if(/…|\.\.\./.test(node.data))node.data=node.data.replace(/…|\.\.\./g,'');}
  }finally{applying=false;}
 }
 const oldRender=renderWidgets;
 renderWidgets=function(...args){
  if(!enabled())return oldRender(...args);
  const securities=O.securities,news=O.stockNews;
  O.securities=securities.map(s=>({...s,...D.securities.find(r=>r.code===s.code)}));
  O.stockNews=news.map(n=>({...n,...D.news.find(r=>r.code===n.code)}));
  try{const result=oldRender(...args);apply();return result;}finally{O.securities=securities;O.stockNews=news;}
 };
 function manualOrder(order){state.order=order;state.profileOrderMode='manual';save();renderWidgets();}
 function reorder(from,to){const order=viewOrder(),f=order.indexOf(from),t=order.indexOf(to);if(f<0||t<0||f===t)return;order.splice(f,1);order.splice(t,0,from);manualOrder(order);}
 const oldMenu=menu;
 menu=function(id){
  if(!enabled())return oldMenu(id);
  const same=openMenu===id;$$('.widget-menu').forEach(n=>n.remove());openMenu=null;if(same)return;
  const order=viewOrder(),pos=order.indexOf(id),pinned=state.pinned.includes(id);
  const n=document.createElement('div');n.className='widget-menu v11-widget-menu';
  n.innerHTML=`${id==='brief'?'':'<button data-v11-menu-action="edit">编辑组件</button>'}<button data-v11-menu-action="pin">${pinned?'取消置顶':'置顶组件'}</button><button data-v11-menu-action="up" ${pos===0?'disabled':''}>上移</button><button data-v11-menu-action="down" ${pos===order.length-1?'disabled':''}>下移</button><button data-v11-menu-action="remove">从总览删除</button>`;
  const w=$(`[data-widget="${id}"]`);w.append(n);openMenu=id;w.querySelector('[data-menu]')?.setAttribute('aria-expanded','true');
  n.querySelectorAll('button').forEach(b=>b.onclick=e=>{e.stopPropagation();const action=b.dataset.v11MenuAction;if(action==='edit'){n.remove();editWidget(id);return;}if(action==='remove'){state.order=[...order];state.profileOrderMode='manual';save();removeWidget(id);return;}if(action==='pin'){state.order=[...order];state.pinned=pinned?state.pinned.filter(x=>x!==id):[...state.pinned,id];state.profileOrderMode='manual';save();renderWidgets();}else reorder(id,order[pos+(action==='up'?-1:1)]);});
 };
 function organize(){
  const order=viewOrder();openModal('整理工作台',`<div class="v11-organizer"><div class="v11-sort-list">${order.map(id=>`<div class="v11-sort-row" draggable="true" data-v11-sort-id="${id}"><span class="v11-grip" aria-hidden="true">⠿</span><strong>${O.names[id]}</strong><button data-v11-move="${id}" data-direction="up" ${order.indexOf(id)===0?'disabled':''} aria-label="上移${O.names[id]}">↑</button><button data-v11-move="${id}" data-direction="down" ${order.indexOf(id)===order.length-1?'disabled':''} aria-label="下移${O.names[id]}">↓</button></div>`).join('')}</div><div class="modal-actions"><button class="button" data-v11-organize-done>完成</button></div></div>`);
 }
 const oldEdit=$('#editLayout').onclick;$('#editLayout').onclick=()=>enabled()?organize():oldEdit();
 const oldNotes=$('#designNotes').onclick;
 $('#designNotes').onclick=function(...args){oldNotes.apply(this,args);if(!enabled())return;
  const sel=$('#demoState');if(sel&&!sel.querySelector('[value="only-watchlist"]')){const o=document.createElement('option');o.value='only-watchlist';o.textContent='只有自选';sel.append(o);}
  $('#modalBody').insertAdjacentHTML('beforeend','<section class="v11-demo-controls"><label>个人简报兜底层 <select id="v11Layer"><option value="">按当前名单</option><option value="持仓">有持仓</option><option value="自选">只有自选</option><option value="最近搜索">只有最近搜索</option><option value="猜你想看">新用户</option></select></label></section>');
  $('#v11Layer').value=layerPreview||'';
 };
 document.addEventListener('change',e=>{if(!enabled())return;if(e.target.id==='v11Layer'){layerPreview=e.target.value||null;renderWidgets();}if(e.target.id==='demoState'){layerPreview=e.target.value==='only-watchlist'?'自选':null;renderWidgets();}});
 document.addEventListener('click',e=>{
  if(!enabled())return;const b=e.target.closest('[data-v11-history],[data-v11-date-pick],[data-v11-collapse],[data-v11-auto],[data-v11-move],[data-v11-organize-done],[data-v11-events],[data-v11-targets]');
  if(!b){if(!e.target.closest('.v11-history'))$$('.v11-history-menu').forEach(m=>{m.hidden=true;m.previousElementSibling.setAttribute('aria-expanded','false');});return;}
  if(b.dataset.v11History){const m=b.nextElementSibling,on=m.hidden;$$('.v11-history-menu').forEach(m=>m.hidden=true);m.hidden=!on;b.setAttribute('aria-expanded',String(on));}
  if(b.dataset.v11DatePick){const p=b.dataset.v11DatePick;dates[p]=b.dataset.date;const old=$(`[data-v11-period="${p}"]`);const t=document.createElement('template');t.innerHTML=card(p);old.replaceWith(t.content.firstElementChild);fitCard($(`[data-v11-period="${p}"]`));}
  if(b.dataset.v11Collapse){const id=b.dataset.v11Collapse;state.collapsed=state.collapsed.includes(id)?state.collapsed.filter(x=>x!==id):[...state.collapsed,id];save();renderWidgets();}
  if(b.hasAttribute('data-v11-auto')){state.profileOrderMode='auto';save();renderWidgets();}
  if(b.dataset.v11Move){const order=viewOrder(),i=order.indexOf(b.dataset.v11Move);reorder(b.dataset.v11Move,order[i+(b.dataset.direction==='up'?-1:1)]);organize();}
  if(b.hasAttribute('data-v11-organize-done')){closeModal();}
  if(b.hasAttribute('data-v11-targets')){expanded.has('holdings-news')?expanded.delete('holdings-news'):expanded.add('holdings-news');overviewNews();}
  if(b.hasAttribute('data-v11-events')){expanded.has('events')?expanded.delete('events'):expanded.add('events');limitEvents();}
 });
 document.addEventListener('dragstart',e=>{if(!enabled())return;const row=e.target.closest('[data-v11-sort-id]');if(!row)return;dragId=row.dataset.v11SortId;e.dataTransfer.setData('text/plain',dragId);row.classList.add('dragging');});
 document.addEventListener('dragover',e=>{if(enabled()&&e.target.closest('[data-v11-sort-id]'))e.preventDefault();});
 document.addEventListener('drop',e=>{const row=e.target.closest('[data-v11-sort-id]');if(!enabled()||!row||!dragId)return;e.preventDefault();reorder(dragId,row.dataset.v11SortId);dragId=null;organize();});
 document.addEventListener('dragend',()=>{dragId=null;$$('.v11-sort-row.dragging').forEach(n=>n.classList.remove('dragging'));});
 document.addEventListener('keydown',e=>{if(enabled()&&e.key==='Escape')$$('.v11-history-menu').forEach(m=>{m.hidden=true;m.previousElementSibling.setAttribute('aria-expanded','false');});});
 const css=`
 @media all{
 body.overview-v11{--line:#e1e3e6;--line-soft:#e1e3e6;--accent:#315ce8;--accent-soft:#315ce80f;--red:#d94b55;--green:#16876c}
 html.light body.overview-v11{--bg:#f8f9fa;--card:#fff;--text:#25272b;--muted:#646970;--subtle:#767c84}
 body.overview-v11 .sidebar{width:200px;background:var(--card)}body.overview-v11 #assistant{width:320px;background:var(--card)}body.overview-v11 .topbar{background:var(--card)}
 body.overview-v11 #main{padding:24px}body.overview-v11 #overviewView .page-head h1{font-size:24px!important;line-height:32px!important;font-weight:600!important;letter-spacing:0}
 body.overview-v11 #overviewView .page-head{margin-bottom:16px}body.overview-v11 #overviewView .eyebrow{display:none}
 body.overview-v11 #overviewView .page-head p{font-size:12px;line-height:20px}
 body.overview-v11 #widgetGrid{display:flex;flex-direction:column;gap:16px}
 body.overview-v11 #widgetGrid>.widget{width:100%;border:1px solid var(--line);border-radius:8px;background:var(--card);overflow:visible}
 body.overview-v11 #widgetGrid .widget-head{padding:8px 24px;min-height:52px;border-bottom:1px solid var(--line);background:var(--card)}
 body.overview-v11 #widgetGrid .widget-title h2,body.overview-v11 #widgetGrid .widget-title h2 a{font-size:16px!important;line-height:24px;font-weight:600;color:var(--text)}
 body.overview-v11 #widgetGrid [data-widget="brief"] .widget-title>.icon,body.overview-v11 #widgetGrid [data-widget="brief"]>.widget-footer{display:none!important}
 body.overview-v11 #overviewView .widget :is(p,small,time,.data-message,.flow-small,.text-action,.v3-habit-line,.v3-event-line,.v3-security-heading small,.v3-security-heading time,.v3-supporting-copy,.v3-board,.v3-board small){font-size:12px!important}
 body.overview-v11 #overviewView .widget :is(a,span,strong,b,p){text-overflow:clip;white-space:normal;-webkit-line-clamp:unset;overflow-wrap:anywhere}
 body.overview-v11 #overviewView .indices-mini>span{overflow:visible;white-space:normal;text-overflow:clip}
 body.overview-v11 #overviewView .widget-head a{font-size:12px;line-height:20px}
 body.overview-v11 #overviewView .widget-body{min-width:0}
 body.overview-v11 .v11-menu-trigger,body.overview-v11 .v11-collapse{padding:4px 8px;height:30px;width:auto;color:var(--muted);font-size:14px!important;line-height:22px;border-radius:8px}
 body.overview-v11 .v11-menu-trigger:hover,body.overview-v11 .v11-collapse:hover{background:var(--card-raised)}
 body.overview-v11 [data-widget="brief"]{container-type:inline-size;container-name:overview-brief}
 body.overview-v11 .v11-pair{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1fr);gap:16px;padding:16px}
 body.overview-v11 .v11-card{border:1px solid var(--line);border-radius:8px;padding:24px;display:flex;flex-direction:column;min-width:0;font:400 14px/22px var(--body)}
 body.overview-v11 .v11-card-top{display:flex;justify-content:space-between;align-items:center;min-height:32px;margin-bottom:12px;gap:8px}
 body.overview-v11 .v11-card h3{font-size:16px!important;line-height:24px;font-weight:600;white-space:nowrap}
 body.overview-v11 .v11-history{position:relative}
 body.overview-v11 .v11-history-button{height:32px;padding:4px 12px;border:1px solid var(--line);border-radius:8px;font-size:14px!important;line-height:22px;background:var(--card);white-space:nowrap}
 body.overview-v11 .v11-history-menu{position:absolute;right:0;top:36px;background:var(--card);border:1px solid var(--line);border-radius:8px;box-shadow:0 8px 24px #0002;padding:4px;z-index:20;width:140px}
 body.overview-v11 .v11-history-menu button{display:block;width:100%;text-align:left;padding:4px 12px;font-size:14px!important;line-height:22px;border-radius:8px}
 body.overview-v11 .v11-history-menu button:hover,body.overview-v11 .v11-history-menu [aria-current=true]{background:var(--card-raised)}
 body.overview-v11 #overviewView [data-widget="brief"] .v11-card .v11-conclusion{font-size:14px!important;line-height:22px;margin:0 0 12px}
 body.overview-v11 .v11-items{display:flex;flex-direction:column;gap:12px;margin-bottom:12px}
 body.overview-v11 .v11-item-first{display:flex;align-items:center;flex-wrap:wrap;gap:8px}
 body.overview-v11 .v11-layer{font-size:12px!important;line-height:20px;color:var(--accent);background:var(--accent-soft);border:1px solid #315ce833;border-radius:4px;padding:0 6px;white-space:nowrap!important}
 body.overview-v11 .v11-item-first strong{font-size:14px!important;line-height:22px;font-weight:600}
 body.overview-v11 .v11-change{font-size:14px!important;line-height:22px;margin-left:auto;white-space:nowrap!important;font-variant-numeric:tabular-nums}
 body.overview-v11 .v11-change.up{color:var(--red)}body.overview-v11 .v11-change.down{color:var(--green)}
 body.overview-v11 #overviewView [data-widget="brief"] .v11-card .v11-event{font-size:14px!important;line-height:22px;margin:4px 0 0;color:var(--text)}
 body.overview-v11 #overviewView [data-widget="brief"] .v11-card .v11-trend{font-size:14px!important;line-height:22px;color:var(--muted);margin:0 0 16px}
 body.overview-v11 .v11-full{align-self:flex-start;height:32px;border:1px solid var(--line);border-radius:8px;padding:4px 16px;font-size:14px!important;line-height:22px;white-space:nowrap!important}
 body.overview-v11 .v11-dot{color:var(--subtle);font-size:12px!important;margin-left:4px;display:none}
 body.overview-v11.presentation-on .v11-dot{display:inline}
 body.overview-v11 #profileLayoutNote{display:flex;align-items:center;flex-wrap:wrap;gap:8px;margin:0 0 16px;padding:0;border:0;font-size:12px;line-height:20px}
 body.overview-v11 #profileLayoutNote>div{display:flex;gap:8px;align-items:center}
 body.overview-v11 .v11-sort{color:var(--accent);font-size:12px!important;line-height:20px}
 body.overview-v11 .v11-order-details{display:none}body.overview-v11.presentation-on .v11-order-details{display:block;width:100%}
 body.overview-v11 #overviewView .v3-source-note{font-size:12px;line-height:20px;padding:8px 16px;margin-bottom:16px}
 body.overview-v11 #overviewView .v3-profile-tag{font-size:12px!important;line-height:20px}
 body.overview-v11 .v3-guide{padding:16px 24px;border-color:var(--accent)!important;background:var(--accent-soft)!important}
 body.overview-v11 .v3-guide h3{font-size:16px!important;line-height:24px;margin:0 0 4px}
 body.overview-v11 .v3-guide p{font-size:14px!important;line-height:22px}
 body.overview-v11 .v3-guide .button{height:32px;font-size:14px!important;line-height:22px;padding:4px 16px;margin-top:12px}
 body.overview-v11 .v11-more{font-size:14px!important;line-height:22px;padding:4px 16px;margin:12px 24px;border:1px solid var(--line);border-radius:8px}
 body.overview-v11 .v11-organizer{font-size:14px;line-height:22px}
 body.overview-v11 .v11-sort-row{display:flex;align-items:center;gap:12px;border:1px solid var(--line);border-radius:8px;padding:12px 16px;margin:8px 0;cursor:grab}
 body.overview-v11 .v11-sort-row strong{flex:1;font-size:14px;font-weight:600}
 body.overview-v11 .v11-sort-row button{height:32px;width:32px;border:1px solid var(--line);border-radius:8px}
 body.overview-v11 .v11-sort-row.dragging{opacity:.5}
 body.overview-v11 .v11-widget-menu button{font-size:14px;line-height:22px;white-space:nowrap}
 @container overview-brief (max-width:680px){body.overview-v11 .v11-pair{grid-template-columns:1fr}body.overview-v11 .v11-card{padding:16px}}
 @media(max-width:760px){body.overview-v11 .sidebar{width:56px}body.overview-v11 #main{padding:18px 14px 24px}body.overview-v11 .brand{padding:20px 13px 25px}}
 }
 `;
 const style=document.createElement('style');style.id='overviewV11Style';style.textContent=css;document.head.append(style);
 const observer=new MutationObserver(()=>{if(frame)return;frame=requestAnimationFrame(()=>{frame=0;observer.disconnect();apply();observer.observe(document.body,{childList:true,subtree:true,attributes:true,attributeFilter:['hidden']});});});
 observer.observe(document.body,{childList:true,subtree:true,attributes:true,attributeFilter:['hidden']});
 window.overviewV11={viewOrder,dates,points,fitCard,refresh:()=>renderWidgets()};
 window.addEventListener('resize',()=>{if(enabled())apply();});
 renderWidgets();
}
if(document.readyState!=='complete')document.addEventListener('DOMContentLoaded',initialize,{once:true});else initialize();
})();
