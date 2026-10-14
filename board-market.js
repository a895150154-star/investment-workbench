/* Board quote + members + chronological short-term events, using demo fixtures. */
(()=>{
 'use strict';
 const D=window.boardMarketData;
 const defaults={boardView:'members',boardList:'all',boardSort:'change',boardDirection:'desc',boardPeriod:'intraday'};
 const options={boardView:['members','moves'],boardList:['all','flow','limits','streak'],boardSort:['price','change','flow','limitTime','boards'],boardDirection:['asc','desc'],boardPeriod:['intraday','day','week']};
 function normalise(r){const out={...r};Object.entries(defaults).forEach(([k,v])=>out[k]=options[k].includes(r[k])?r[k]:v);return out;}
 const fmt=n=>Number(n).toFixed(2),pct=n=>(n>0?'+':'')+fmt(n)+'%',tone=n=>n<0?'down':n>0?'up':'bm-flat';
 const amount=n=>n==null?'—':Math.abs(n)<1?fmt(n*10000)+'万':fmt(n)+'亿';
 const num=(n,unit='')=>`<span class="op-number ${tone(n)}">${unit==='%'?pct(n):(n>0?'+':'')+fmt(n)+unit}</span>`;
 const streak=s=>s.boards===1?'首板':s.boards>1?s.boards+'连板':'—';
 const rowsFor=board=>board.members.map(code=>D.stocks[code]).filter(Boolean);
 // Reuse securities already in the workbench; append only missing demo identities.
 Object.values(D.stocks).forEach(s=>{
  const existing=opportunitySecurity(s.code);
  if(existing){s.price=Number(existing.price??s.price);s.change=Number(existing.change??s.change);s.limit=s.limit&&s.change>=9.8;if(!s.limit){s.limitTime='';s.boards=0;s.sealedAmount=0;}}
  else opportunityQuotes.push({code:s.code,name:s.name,price:s.price,change:s.change,type:'stock',reference:'board-demo',boardDemo:true});
 });
 try{const saved=JSON.parse(localStorage.getItem(opportunityWatchKey)||'[]');if(Array.isArray(saved))opportunityWatch=saved.filter(key=>opportunitySecurity(key));}catch{}
 const oldSource=opSource;opSource=function(q){return q.boardDemo?'<span class="op-meta">固定模拟行情</span>':oldSource(q);};
 const oldURL=opportunityRouteURL;
 opportunityRouteURL=function(r){
  if(r.type!=='evening-board'||!D.get(r.id))return oldURL(r);
  const n=normalise(r),p=new URLSearchParams();if(n.issueId)p.set('issue',n.issueId);
  Object.entries({view:'boardView',list:'boardList',sort:'boardSort',direction:'boardDirection',period:'boardPeriod'}).forEach(([k,v])=>{if(n[v]!==defaults[v])p.set(k,n[v]);});
  return '#/evening/board/'+encodeURIComponent(n.id)+(p.size?'?'+p:'');
 };
 const oldParse=opportunityParse;
 opportunityParse=function(path,args){const parts=path.split('/').filter(Boolean),board=parts[0]==='evening'&&parts[1]==='board'&&D.get(decodeURIComponent(parts[2]||''));if(!board)return oldParse(path,args);return normalise({type:'evening-board',id:board.id,issueId:(issueFromId(args.get('issue'))||opIssue()).id,boardView:args.get('view'),boardList:args.get('list'),boardSort:args.get('sort'),boardDirection:args.get('direction'),boardPeriod:args.get('period')});};
 const oldName=opportunityRouteName;opportunityRouteName=function(r){return r.type==='evening-board'&&D.get(r.id)?D.get(r.id).name+' · 板块行情':oldName(r);};
 const oldFallback=opportunityFallback;opportunityFallback=function(r){return r.type==='evening-board'&&D.get(r.id)?{type:'brief',issueId:r.issueId,section:'market-summary'}:oldFallback(r);};
 function chart(board,period){
  const seed=D.boards.indexOf(board)+1,last=1200+seed*52.35;
  const daily=Array.from({length:36},(_,i)=>{const close=last+(Math.sin(i*.42+seed)-Math.sin(35*.42+seed))*11+(i-35)*.48,open=close+Math.sin(i*1.63)*5;return {close,open,high:Math.max(close,open)+4,low:Math.min(close,open)-4,volume:40+(i*17+seed*9)%80};});
  const series=period==='week'?Array.from({length:Math.ceil(daily.length/5)},(_,i)=>{const g=daily.slice(i*5,i*5+5);return {open:g[0].open,close:g.at(-1).close,high:Math.max(...g.map(p=>p.high)),low:Math.min(...g.map(p=>p.low)),volume:g.reduce((n,p)=>n+p.volume,0)};}):daily;
  const min=Math.min(...series.map(p=>p.low))-5,max=Math.max(...series.map(p=>p.high))+5,y=v=>18+(max-v)/(max-min)*144,x=i=>48+i*630/(series.length-1),volScale=31/Math.max(...series.map(p=>p.volume));
  const labels=period==='intraday'?['09:30','11:30 / 13:00','15:00']:period==='day'?['第1日','第18日','第36日']:['第1周','第4周','第8周'];
  return `<svg class="bm-chart" viewBox="0 0 730 230" role="img" aria-label="${esc(board.name)}${period==='intraday'?'分时':period==='day'?'日K':'周K'}模拟走势"><title>独立模拟点位与成交量，非真实行情</title>${[0,1,2,3].map(i=>`<line x1="48" x2="698" y1="${18+i*48}" y2="${18+i*48}" stroke="var(--line)"/><text x="0" y="${22+i*48}">${fmt(max-(max-min)*i/3)}</text>`).join('')}${period==='intraday'?`<polyline points="${series.map((p,i)=>x(i)+','+y(p.close)).join(' ')}" fill="none" stroke="var(--orange)" stroke-width="2"/>`:series.map((p,i)=>`<g class="${p.close>=p.open?'up':'down'}"><line x1="${x(i)}" x2="${x(i)}" y1="${y(p.high)}" y2="${y(p.low)}" stroke="currentColor"/><rect x="${x(i)-4}" y="${Math.min(y(p.open),y(p.close))}" width="8" height="${Math.max(1,Math.abs(y(p.close)-y(p.open)))}" fill="currentColor"/></g>`).join('')}${series.map((p,i)=>`<rect x="${x(i)-4}" y="${210-p.volume*volScale}" width="8" height="${p.volume*volScale}" fill="${p.close>=p.open?'var(--red)':'var(--green)'}" opacity=".6"/>`).join('')}<text x="48" y="228">${labels[0]}</text><text x="316" y="228">${labels[1]}</text><text x="655" y="228">${labels[2]}</text></svg>`;
 }
 function button(label,key,value,r,cls=''){return `<button type="button" class="${cls} ${r[key]===value?'selected':''}" data-bm-key="${key}" data-bm-value="${value}" aria-pressed="${r[key]===value}">${label}</button>`;}
 const stockLink=(s,r)=>opLink(esc(s.name),opQuoteRoute(s.code,r.issueId),'bm-stock-link');
 function sortedRows(board,r){let rows=rowsFor(board);if(r.boardList==='limits')rows=rows.filter(s=>s.limit);if(r.boardList==='streak')rows=rows.filter(s=>s.boards>0);return rows.slice().sort((a,b)=>{const va=a[r.boardSort],vb=b[r.boardSort],sign=r.boardDirection==='asc'?1:-1;return (typeof va==='string'?va.localeCompare(vb):Number(va)-Number(vb))*sign||a.code.localeCompare(b.code);});}
 function sortHead(label,key,r){return `<th scope="col" aria-sort="${r.boardSort===key?(r.boardDirection==='asc'?'ascending':'descending'):'none'}"><button type="button" data-bm-sort="${key}" aria-label="按${label}${r.boardSort===key&&r.boardDirection==='desc'?'升序':'降序'}排列">${label}<span class="bm-sort ${r.boardSort===key?'active':''}" aria-hidden="true">${r.boardSort===key?(r.boardDirection==='asc'?'↑':'↓'):'↕'}</span></button></th>`;}
 function members(board,r){
  const limits=r.boardList==='limits',boards=r.boardList==='streak',cols=limits?[['涨停时间','limitTime'],['涨停板数','boards'],['主力净流入','flow']]:[['最新','price'],['涨幅','change'],[boards?'连板情况':'主力净流入',boards?'boards':'flow']];
  const rows=sortedRows(board,r);
  return `<nav class="bm-list-tabs" aria-label="成分股视图">${[['all','全部'],['flow','主力净流入'],['limits','今日涨停'],['streak','连板情况']].map(([v,label])=>button(label,'boardList',v,r)).join('')}</nav><div class="bm-members"><table class="bm-table"><caption class="sr-only">${esc(board.name)}的演示成分股</caption><colgroup><col class="bm-name-col"/><col/><col/><col/></colgroup><thead><tr><th scope="col">名称／代码</th>${cols.map(([label,key])=>sortHead(label,key,r)).join('')}</tr></thead><tbody>${rows.map(s=>`<tr data-bm-stock="${s.code}"><th scope="row">${stockLink(s,r)}<small>${s.code}</small></th>${cols.map(([,key])=>`<td>${key==='price'?fmt(s.price):key==='change'?num(s.change,'%'):key==='flow'?`<span class="${tone(s.flow)}">${amount(s.flow)}</span>`:key==='limitTime'?s.limitTime||'—':limits?s.boards:streak(s)}</td>`).join('')}</tr>${s.limit&&!boards?`<tr class="bm-reason-row"><td colspan="4"><div class="bm-limit-meta"><span>${streak(s)}</span>最终涨停 ${s.limitTime}</div><details class="bm-reason"><summary><b>涨停原因</b><span>${esc(s.reason)}</span>${icon('chevron-down')}</summary><p>${esc(s.reason)}</p></details></td></tr>`:''}`).join('')||'<tr><td colspan="4" class="bm-empty">该板块的这个视图暂无演示样本，可切换其他视图。</td></tr>'}</tbody></table></div>`;
 }
 function moves(board,r){
  const rows=rowsFor(board),limits=rows.filter(s=>s.limit),events=D.moves(board),sum=limits.reduce((n,s)=>n+s.sealedAmount,0);
  return `<div class="bm-move-summary">板块内涨停 <strong>${limits.length}</strong> 只<span>累计封单金额 <strong>${fmt(sum)}</strong> 亿</span></div><ol class="bm-timeline">${events.map(e=>{const s=D.stocks[e.code],down=e.status==='封跌停板',broken=e.status==='炸板';return `<li class="${down?'bm-negative':broken?'bm-broken':''}" data-bm-event="${e.code}"><time>${e.time}</time><div class="bm-event-heading">${stockLink(s,r)}${num(e.change,'%')}<span class="bm-event-state">${e.status}</span></div><dl class="bm-event-facts">${broken?`<div><dt>总成交额</dt><dd>${amount(e.total)}</dd></div><div><dt>涨停价成交额</dt><dd>${amount(e.limitTurnover)}</dd></div>`:`<div><dt>当前封单量</dt><dd>${e.volume>=10000?fmt(e.volume/10000)+'万':e.volume}手</dd></div><div><dt>当前封单额</dt><dd>${amount(e.amount)}</dd></div><div><dt>当前封成比</dt><dd>${fmt(e.ratio)}%</dd></div><div><dt>几天几板</dt><dd>${e.streak||'—'}</dd></div>`}</dl>${broken?'':`<div class="bm-event-reason"><span>${down?'跌停':'涨停'}原因</span><p>${esc(s.reason)}</p></div>`}</li>`;}).join('')||'<li class="bm-empty">该板块暂无短线异动演示样本。</li>'}</ol>`;
 }
 const originalDetail=showEveningDetail;
 showEveningDetail=function(input,retain=false){
  const board=input.type==='evening-board'&&D.get(input.id);if(!board)return originalDetail(input);
  const r=normalise(input),seed=D.boards.indexOf(board)+1,last=1200+seed*52.35,previous=last/(1+board.change/100);
  page(board.name,opBack()+`<div class="bm-page" data-v3-keep-copy><header class="bm-heading"><div><h1>${esc(board.name)}</h1><span>${board.kind==='concept'?'概念':'行业'}板块</span></div><button class="bm-source" data-bm-source>数据说明 ${icon('info')}</button></header><section class="bm-quote"><div class="bm-points ${tone(board.change)}"><strong>${fmt(last)}</strong><span>${num(last-previous)} ${num(board.change,'%')}</span><small>模拟点位</small></div><dl><div><dt>主力净流入</dt><dd class="${tone(board.flow)}">${amount(board.flow)}</dd></div><div><dt>昨收</dt><dd>${fmt(previous)}</dd></div><div><dt>演示成分股</dt><dd>${board.members.length}只</dd></div></dl></section><nav class="bm-periods" aria-label="板块行情周期">${[['intraday','分时'],['day','日K'],['week','周K']].map(([v,label])=>button(label,'boardPeriod',v,r)).join('')}</nav>${chart(board,r.boardPeriod)}<section class="bm-research"><nav class="bm-view-tabs" aria-label="板块内容">${[['members','成分股'],['moves','短线异动']].map(([v,label])=>button(label,'boardView',v,r)).join('')}</nav><div id="bmContent">${r.boardView==='moves'?moves(board,r):members(board,r)}</div></section><p class="bm-footnote">固定演示快照 · 行情与异动非实时</p></div>`,'evening-board');route=r;
 };
 function applyRoute(patch,focus){const next={...route,...patch};showEveningDetail(next,true);if(focus)document.querySelector(focus)?.focus({preventScroll:true});}
 document.addEventListener('click',e=>{
  const b=e.target.closest('[data-bm-key],[data-bm-sort],[data-bm-source]');if(!b)return;
  if(b.hasAttribute('data-bm-source')){openModal('板块数据说明',`<p>资金概览复用本轮录屏的行业与概念快照；我们按净流入、净流出各取5个样本并交错展示，这是原型规则，未核验竞品真实取数公式。</p><p>成分名单为逐板块配置的演示集合，尚未接入公司板块归属数据。列表优先复用工作台已有行情，其余价格、资金、涨停状态和异动为固定样例；独立模拟走势图不代表真实行情。</p><p>涨跌停原因是示例解读，尚未调用模型或公司Skill。短线异动是该板块的行情事件流，与所选股票新公告／新资讯追踪分别展示。</p>`);return;}
  if(b.dataset.bmSort){const key=b.dataset.bmSort;applyRoute({boardSort:key,boardDirection:route.boardSort===key&&route.boardDirection==='desc'?'asc':'desc'},'[data-bm-sort="'+key+'"]');return;}
  const key=b.dataset.bmKey,value=b.dataset.bmValue,patch={[key]:value};
  if(key==='boardList'){patch.boardSort={all:'change',flow:'flow',limits:'limitTime',streak:'boards'}[value];patch.boardDirection=value==='limits'?'asc':'desc';}
  applyRoute(patch,'[data-bm-key="'+key+'"][data-bm-value="'+value+'"]');
 });
 function flowGrid(kind,issue){
   const rows=D[kind],inflow=rows.filter(r=>r[2]>0).sort((a,b)=>b[2]-a[2]).slice(0,5),outflow=rows.filter(r=>r[2]<0).sort((a,b)=>a[2]-b[2]).slice(0,5),arr=[inflow[0],outflow[0],inflow[1],outflow[1],inflow[2],outflow[2],inflow[3],outflow[3],outflow[4],inflow[4]].filter(Boolean);
   return `<div class="bm-flow-grid">${arr.map(([id,name,flow,change],i)=>opLink(`<strong>${esc(name)}</strong><span>${i===0?'主力净流入 ':''}${num(flow,'亿')}</span><span>涨幅 ${num(change,'%')}</span>`,{type:'evening-board',id,issueId:issue.id},'bm-flow-tile '+(i===0||i===arr.length-1?'bm-span-two':'')+' '+tone(flow))).join('')}</div>`;
 }

 const widgetKey='vra-board-market-widget-kind';
 let widgetKind='industry';try{widgetKind=localStorage.getItem(widgetKey)==='concept'?'concept':'industry';}catch{}
 function widgetBody(){const issue=issueFromId(route?.issueId)||briefSnapshot().displayed;return `<div class="bm-widget" data-v3-keep-copy><div class="bm-widget-toolbar"><nav class="flow-tabs" aria-label="板块资金分类">${[['industry','行业'],['concept','概念']].map(([kind,label])=>`<button type="button" data-bm-widget-kind="${kind}" class="${widgetKind===kind?'selected':''}" aria-pressed="${widgetKind===kind}">${label}</button>`).join('')}</nav><button type="button" class="bm-source" data-bm-source>数据说明 ${icon('info')}</button></div>${flowGrid(widgetKind,issue)}<p class="bm-footnote">金额单位：亿元 · 示例快照</p></div>`;}
 document.addEventListener('click',e=>{const b=e.target.closest('[data-bm-widget-kind]');if(!b)return;widgetKind=b.dataset.bmWidgetKind==='concept'?'concept':'industry';try{localStorage.setItem(widgetKey,widgetKind);}catch{}const body=document.querySelector('[data-widget="sector-flows"] .widget-body');if(body)body.innerHTML=widgetBody();document.querySelector('[data-bm-widget-kind="'+widgetKind+'"]')?.focus({preventScroll:true});});
 function install(){
  const R=window.eveningReferenceData;
  if(R){R.boards.industry=D.industry.map(r=>r.slice(0,4));R.boards.concept=D.concept.map(r=>r.slice(0,4));}
  eveningFlowGrid=issue=>flowGrid(eveningFlowTab(issue),issue);
  const latestParse=opportunityParse,latestName=opportunityRouteName;
  opportunityParse=function(path,args){const parts=path.split('/').filter(Boolean),board=parts[0]==='evening'&&parts[1]==='board'&&D.get(decodeURIComponent(parts[2]||''));if(!board)return latestParse(path,args);return normalise({type:'evening-board',id:board.id,issueId:(issueFromId(args.get('issue'))||opIssue()).id,boardView:args.get('view'),boardList:args.get('list'),boardSort:args.get('sort'),boardDirection:args.get('direction'),boardPeriod:args.get('period')});};
  opportunityRouteName=function(r){return r.type==='evening-board'&&D.get(r.id)?D.get(r.id).name+' · 板块行情':latestName(r);};
  const update=()=>{const grid=document.querySelector('#eveningFlowGrid');if(grid)grid.innerHTML=eveningFlowGrid(selectedIssue);const note=document.querySelector('[data-night-flow-note]');if(note)note.textContent='金额单位：亿元 · 示例快照';const source=document.querySelector('.night-flow [data-night-reference-source]');if(source){source.removeAttribute('data-night-reference-source');source.setAttribute('data-bm-source','');source.innerHTML='数据说明 '+icon('chevron-right');}};
  const before=showBrief;showBrief=function(...args){const result=before.apply(this,args);update();return result;};
  document.addEventListener('click',e=>{if(e.target.closest('[data-evening-flow]'))queueMicrotask(update);});
  update();
 }
 // Run after existing DOMContentLoaded adaptations have installed their wrappers.
 if(document.readyState!=='complete')document.addEventListener('DOMContentLoaded',()=>requestAnimationFrame(install),{once:true});else requestAnimationFrame(install);
 window.boardMarket={normalise,sortedRows,defaults,data:D,widgetBody,flowGrid};
})();
