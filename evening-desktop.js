/* Desktop evening content. Workspace chrome and mobile renderers stay inherited. */
(() => {
 function initialize(){
  if(!window.workbenchClient.desktop)return;
  const V=window.overviewV3,D=window.overviewV3Data,R=window.eveningReferenceData;
  R.boards.concept=eveningBoards.concept.map(row=>[...row]);
  const sections=[['my-targets','特别提醒'],['market-summary','大盘总结'],['evening-events','今日重要事件']],ids=sections.map(x=>x[0]);
  eveningSections.splice(0,eveningSections.length,...sections);
  const compatible=chosen=>[...new Set([...chosen,...(chosen.includes('market-summary')?['summary','a-market','hk-market','flows']:[]),...(chosen.includes('evening-events')?['major-events']:[])])];
  let saved;try{saved=JSON.parse(localStorage.getItem(BRIEF_PREFS_KEY));}catch{}
  briefPrefs.evening=saved?.eveningDesktopStructure===1?ids.filter(id=>saved.evening?.includes(id)):[...ids];
  if(!briefPrefs.evening.length)briefPrefs.evening=[...ids];
  briefPrefs.evening=compatible(briefPrefs.evening);
  const oldNormalize=normalizeBriefPrefs;
  normalizeBriefPrefs=function(raw){const next=oldNormalize(raw);next.evening=raw?.evening?ids.filter(id=>raw.evening.includes(id)):[...ids];if(!next.evening.length)next.evening=[...ids];next.evening=compatible(next.evening);return {...next,eveningDesktopStructure:1};};
  const pct=n=>n==null?'未提供':(Number(n)>0?'+':'')+Number(n).toFixed(2)+'%';
  function targets(){return demoState==='quiet'?[]:R.reminders.map(s=>({...s,priority:1}));}
  const data=s=>s;
  const story=s=>s.story||'';
  const analysis=s=>(s.analysis||[]).join('');
  const source=(key,label='来源 · 晚报参考截图')=>`<button class="brief-source" data-night-reference-source="${key}">${label} ${icon('chevron-right')}</button>`;
  const stockRoute=(s,issue)=>eveningRoute('evening-event',s.id,issue);
  function reminders(issue){const rows=targets();return `<section class="night-reminders" id="brief-my-targets" data-v3-keep-copy><header class="night-heading"><h2>特别提醒</h2></header>${rows.length?rows.map(s=>`<article class="night-target night-reference-target" data-night-security="${esc(s.id)}"><div class="night-target-heading"><h3>${opLink(esc(s.name),stockRoute(s,issue),'night-target-name')}</h3><strong class="op-number ${s.change<0?'down':'up'}">${pct(s.change)}</strong><span class="tag">${esc(s.relation)}</span></div><div class="night-target-columns"><div class="night-price"><h4>今日走势</h4><p>${esc(s.story)}</p></div><div class="night-ai"><h4>${icon('sparkles')}AI分析</h4>${s.analysis.map(p=>`<p>${esc(p)}</p>`).join('')}</div></div>${source('stock')}</article>`).join(''):'<p>你的标的今天平稳，暂无特别提醒。</p>'}</section>`;}
  function reference(issue){const t=document.createElement('template');t.innerHTML=window.eveningReferenceDocument(issue);return t.content;}
  function extract(root,id){const t=document.createElement('template'),heading=root.querySelector('#brief-'+id);if(!heading)return t;let next=heading.nextElementSibling;while(next&&!next.classList.contains('report-section-head')){t.content.append(next.cloneNode(true));next=next.nextElementSibling;}return t;}
  function marketPanel(root,id,title,issue){const hk=id==='hk-market';return `<section class="night-market-panel" id="brief-${id}"><header class="night-subheading"><h3>${title}</h3></header><div class="evening-index-grid ${hk?'two':''}">${R.indices.slice(hk?3:0,hk?5:3).map(([key,name,,change])=>opLink(`<span>${name}</span>${eveningNumber(change,'%')}`,eveningRoute('evening-board',key,issue),'evening-index')).join('')}</div>${hk?'':`<div class="evening-stat-grid">${R.stats.map(([label,value,unit,detail],i)=>`<div><span>${label}</span><strong class="${i===3?'op-number down':''}">${value}<small> ${unit}</small></strong>${detail?`<small>${detail}</small>`:''}</div>`).join('')}</div>`}<p><strong>表现</strong> ${esc(hk?R.hkPerformance:R.aPerformance)}</p><div class="report-analysis night-ai"><p><strong>AI观点</strong> ${esc(hk?R.hkView:R.aView)}</p>${eveningAskButton(hk?'ref-hk-market':'ref-a-market',hk?'港股观点关注哪些后续因素？':'A股观点提到了哪些观察条件？')}</div>${source(hk?'hk-market':'a-market')}</section>`;}
  const oldFlow=eveningFlowGrid;
  eveningFlowGrid=function(issue){if(!window.workbenchClient.desktop)return oldFlow(issue);const rows=R.boards[eveningFlowTab(issue)];return `<div class="night-flow-groups">${[false,true].map(out=>{const group=rows.filter(([, ,flow])=>(Number(flow)<0)===out).slice().sort((a,b)=>out?Number(a[2])-Number(b[2]):Number(b[2])-Number(a[2]));return `<section class="night-flow-group"><h4>资金${out?'流出':'流入'}较多</h4><div class="night-flow-tiles">${group.map(([id,name,flow,change])=>opLink(`<strong>${esc(name)}</strong><span>主力净${out?'流出':'流入'}</span>${eveningNumber(flow,' 亿')}<span>今日涨跌 ${eveningNumber(change,'%')}</span>`,eveningRoute('evening-board',id,issue),'evening-flow-tile '+(out?'down':'up'))).join('')}</div></section>`;}).join('')}</div>`;};
  function market(issue,root){const tab=eveningFlowTab(issue);return `<section class="night-market" id="brief-market-summary" data-v3-keep-copy><header class="night-heading"><h2>大盘总结</h2></header><section class="night-overview" id="brief-summary"><h3>今日概览</h3><p>${esc(R.overview)}</p>${source('summary')}</section>${marketPanel(root,'a-market','A股市场',issue)}${marketPanel(root,'hk-market','港股市场',issue)}<section class="night-flow" id="brief-evening-flows"><header class="night-subheading"><h3>A股板块资金流向</h3><div class="flow-tabs" role="group" aria-label="资金流向分类">${[['industry','行业'],['concept','概念']].map(([id,label])=>`<button type="button" data-evening-flow="${id}" aria-pressed="${tab===id}" class="${tab===id?'selected':''}">${label}</button>`).join('')}</div></header><div id="eveningFlowGrid">${eveningFlowGrid(issue)}</div><p class="night-flow-note" data-night-flow-note>${tab==='industry'?'行业数值来自10.12参考图':'概念数值沿用原有09.22参考资料'} · 金额单位：亿元</p>${source('flow','来源 · 板块资金')}</section></section>`;}
  function eventChips(event,issue){return `<div class="evening-stock-chips">${event.stocks.map(s=>opLink(esc(s.name)+' '+eveningNumber(s.change,'%'),stockRoute(s,issue),'theme-security-chip')).join('')}</div>`;}
  function eventHTML(issue){return R.events.map(e=>`<article class="evening-event">${opLink(esc(e.title)+icon('chevron-right'),eveningRoute('evening-event',e.id,issue),'report-news-title')}${eventChips(e,issue)}${source(e.id)}</article>`).join('');}
  const oldDocument=briefDocument;
  briefDocument=function(issue){if(issue.period!=='evening'||!window.workbenchClient.desktop)return oldDocument(issue);const root=reference(issue),chosen=briefPrefs.evening;return `<nav class="report-index night-index" aria-label="完整简报目录">${sections.filter(([id])=>chosen.includes(id)).map(([id,label])=>`<button ${briefAttrs('section',id,issue)}>${label}</button>`).join('')}</nav><div class="detail-body report-body evening-report night-report" data-v3-keep-copy>${chosen.includes('my-targets')?reminders(issue):''}${chosen.includes('market-summary')?market(issue,root):''}${chosen.includes('evening-events')?`<section class="night-events" id="brief-evening-events" data-v3-keep-copy><header class="night-heading"><h2>今日重要事件</h2></header>${eventHTML(issue)}</section>`:''}</div>`;};
  function decorate(){const view=$('#briefView'),night=activeView==='brief'&&selectedIssue?.period==='evening'&&window.workbenchClient.desktop;view.toggleAttribute('data-evening-desktop',night);if(!night)return;const tools=view.querySelector('.brief-extra-actions');if(tools&&!tools.querySelector('[data-night-paper]'))tools.insertAdjacentHTML('afterbegin',`<button class="brief-card-action" data-night-paper>${icon('files')}<span>一页纸</span></button>`);const cover=view.querySelector('.detail-cover'),copy=[...cover.querySelectorAll(':scope>p')].at(-1);if(copy)copy.textContent=R.intro;}
  const oldShow=showBrief;showBrief=function(...args){const result=oldShow.apply(this,args);decorate();return result;};
  function paper(){const lines=[issueLabel(selectedIssue),''];$('#briefView').querySelectorAll('.night-report>section').forEach(section=>{lines.push(section.querySelector('h2').textContent);if(section.matches('.night-reminders'))section.querySelectorAll('.night-target').forEach(n=>lines.push(n.querySelector('.night-target-heading').textContent.trim(),n.querySelector('.night-price p').textContent,n.querySelector('.night-ai').textContent.trim(),''));else if(section.matches('.night-market'))section.querySelectorAll('.night-overview,.night-market-panel,.night-flow').forEach(n=>lines.push(n.querySelector('h3').textContent,n.textContent.replace(/\s+/g,' ').trim(),''));else section.querySelectorAll('.evening-event').forEach(n=>lines.push(n.textContent.replace(/\s+/g,' ').trim(),''));});openModal('一页纸 · 晚报总结',`<pre class="v3-one-page">${esc(lines.join('\n'))}</pre><div class="modal-actions"><button class="button" data-night-close>关闭</button></div>`);}
  document.addEventListener('click',event=>{const b=event.target.closest('[data-night-paper],[data-night-close],[data-night-reference-source]');if(!b)return;if(b.hasAttribute('data-night-paper'))paper();if(b.hasAttribute('data-night-close'))closeModal();if(b.dataset.nightReferenceSource)showSource(b.dataset.nightReferenceSource);});
  document.addEventListener('click',event=>{if(!event.target.closest('[data-evening-flow]')||!$('#briefView[data-evening-desktop]'))return;const note=$('[data-night-flow-note]');if(note)note.textContent=(eveningFlowTab(selectedIssue)==='industry'?'行业数值来自10.12参考图':'概念数值沿用原有09.22参考资料')+' · 金额单位：亿元';});
  installReferenceActions();
  function stockById(id){return [...R.reminders,...R.events.flatMap(e=>e.stocks)].find(s=>s.id===id);}
  function boardById(id){return [...R.indices,...R.boards.industry,...R.boards.concept].find(b=>b[0]===id);}
  function sourceText(key){
   if(key==='stock')return [R.reminders[0].story,...R.reminders[0].analysis];
   if(key==='summary')return [R.overview];
   if(key==='a-market')return [R.aPerformance,R.aView];
   if(key==='hk-market')return [R.hkPerformance,R.hkView];
   if(key==='flow')return R.boards[eveningFlowTab(selectedIssue||briefSnapshot().displayed)].map(([,name,flow,change])=>name+'：主力净流入 '+flow+' 亿元；涨跌幅 '+change+'%。');
   const event=R.events.find(e=>e.id===key);return event?[event.title,...event.stocks.map(s=>s.name+' '+pct(s.change))]:[];
  }
  function showSource(key){const concept=key==='flow'&&eveningFlowTab(selectedIssue||briefSnapshot().displayed)==='concept';openModal('晚报参考资料',`<div data-v3-keep-copy><p>${concept?'09.22 · 原有概念资金参考资料':R.label}</p>${sourceText(key).map(text=>`<p>${esc(text)}</p>`).join('')}</div>`);}
  function installReferenceActions(){
   const parseBefore=opportunityParse;
   opportunityParse=function(path,args){const parts=path.split('/').filter(Boolean),id=decodeURIComponent(parts[2]||'');if(parts[0]==='evening'&&((parts[1]==='board'&&boardById(id))||(parts[1]==='event'&&(stockById(id)||R.events.some(e=>e.id===id)))))return {type:'evening-'+parts[1],id,issueId:(issueFromId(args.get('issue'))||reportIssue('2026-10-12','evening')).id};return parseBefore(path,args);};
   const nameBefore=opportunityRouteName;
   opportunityRouteName=function(r){if(r.type==='evening-board'&&boardById(r.id))return boardById(r.id)[1]+' · 参考行情';if(r.type==='evening-event'){const stock=stockById(r.id),event=R.events.find(e=>e.id===r.id);if(stock||event)return stock?.name||event.title;}return nameBefore(r);};
   const fallbackBefore=opportunityFallback;
   opportunityFallback=function(r){if((r.type==='evening-board'&&boardById(r.id))||(r.type==='evening-event'&&(stockById(r.id)||R.events.some(e=>e.id===r.id))))return {type:'brief',issueId:r.issueId,section:stockById(r.id)?'my-targets':r.type==='evening-board'?'market-summary':'evening-events'};return fallbackBefore(r);};
   window.eveningReferenceDetail=function(r){
    const stock=r.type==='evening-event'?stockById(r.id):null,event=r.type==='evening-event'?R.events.find(e=>e.id===r.id):null,board=r.type==='evening-board'?boardById(r.id):null;
    if(!stock&&!event&&!board)return false;
    const issue=issueFromId(r.issueId)||reportIssue('2026-10-12','evening');let title,body;
    if(stock){title=stock.name;const related=R.events.find(e=>e.stocks.some(s=>s.id===stock.id));body=opBack()+head('晚报 / 标的资料',stock.name,R.label)+panel('行情参考',`<div class="op-quote-hero">${eveningNumber(stock.change,'%')}</div>`)+(stock.story?panel('今日走势',`<p>${esc(stock.story)}</p>`)+panel('AI分析',stock.analysis.map(p=>`<p>${esc(p)}</p>`).join('')):panel('关联事件',`<p>${esc(related.title)}</p>${opLink('查看事件资料',eveningRoute('evening-event',related.id,issue),'text-action')}`))+source(stock.story?'stock':related.id);}
    else if(event){title=event.title;body=opBack()+head('晚报 / 事件资料',event.title,R.label)+panel('关联标的',eventChips(event,issue))+source(event.id);}
    else{title=board[1];const isIndex=R.indices.some(b=>b[0]===board[0]),isConcept=R.boards.concept.some(b=>b[0]===board[0]);body=opBack()+head(isIndex?'晚报 / 指数资料':'晚报 / 板块资料',title,isConcept?'09.22 · 原有概念资金参考资料':R.label)+panel('行情参考',`<div class="evening-detail-metrics"><div><span>涨跌幅</span>${eveningNumber(board[3],'%')}</div>${board[2]==null?'':`<div><span>主力净流入</span>${eveningNumber(board[2],' 亿元')}</div>`}</div>`)+source(isIndex?(board[0].includes('hs')?'hk-market':'a-market'):'flow');}
    page(title,body,r.type);route={...r,issueId:issue.id};return true;
   };
   const banks={
    unset:[['overview','今日A股与港股的整体表现如何？','summary'],['stock','国光股份今天的走势与AI分析是什么？','stock'],['flow','哪些行业资金流入、流出较多？','flow'],['events','今日重要事件分别关联什么标的？','events']],
    short:[['stock','国光股份今天的量价与资金表现是什么？','stock'],['flow','A股下跌时，哪些行业资金流入较多？','flow'],['hk','港股哪些板块领涨、哪些领跌？','hk-market'],['events','今天两条重要事件分别关联什么标的？','events']],
    swing:[['stock','国光股份的均线、MACD与KDJ表现如何？','stock'],['a','A股观点提到了哪些后续观察条件？','a-market'],['hk','港股的结构分化体现在哪些方向？','hk-market'],['overview','两个市场的整体表现有哪些不同？','summary']],
    long:[['a','A股观点提到了哪些政策与资金线索？','a-market'],['hk','港股观点关注哪些产业与外部因素？','hk-market'],['auto','问界汽车计划进入欧洲市场，关联哪只标的？','ref-event-auto'],['price','风华高科的这条资讯说了什么？','ref-event-price']]
   };
   const mode=()=>V.mode(),forIssue=issue=>issue.period==='evening'?(banks[mode()]||banks.unset).map(([id,label,key])=>({id:'ref-'+mode()+'-'+id,label,key})):[];
   function answer(label,key,issue){const lines=key==='events'?R.events.flatMap(e=>[e.title,...e.stocks.map(s=>s.name+' '+pct(s.change))]):sourceText(key);setContext({kind:'brief',company:'本期晚报',briefIssue:issue.id,question:label,source:R.label});openAssistant();$('#assistantContent').innerHTML=`<div data-v3-keep-copy><div class="user-message">${esc(label)}</div><div class="brief-answer"><strong>本期参考内容</strong>${lines.map(text=>`<p>${esc(text)}</p>`).join('')}</div>${key==='events'?R.events.map(e=>source(e.id)).join(''):source(key)}</div>`;$('#assistantContent').scrollTop=0;}
   const profile=window.profileBriefQuestions,buttonsBefore=profile.buttons,askBefore=profile.ask,forIssueBefore=profile.forIssue;
   profile.forIssue=function(issue){return issue.period==='evening'?forIssue(issue):forIssueBefore(issue);};
   profile.buttons=function(issue){return issue.period==='evening'?forIssue(issue).map(q=>`<button class="suggestion" data-guide-profile="${q.id}">${esc(q.label)}${icon('arrow-up-right')}</button>`):buttonsBefore(issue);};
   profile.ask=function(id,issue){const q=forIssue(issue).find(q=>q.id===id);if(q)return answer(q.label,q.key,issue);return askBefore(id,issue);};
   const askEveningBefore=eveningAsk;
   eveningAsk=function(id){const issue=selectedIssue||briefSnapshot().displayed,event=R.events.find(e=>e.id===id);if(event)return answer(event.question,id,issue);if(id==='ref-a-market')return answer('A股观点提到了哪些观察条件？','a-market',issue);if(id==='ref-hk-market')return answer('港股观点关注哪些后续因素？','hk-market',issue);return askEveningBefore(id);};
  }

  window.eveningDesktop={targets,reference,decorate};
  if(activeView==='brief'&&selectedIssue?.period==='evening'){const scroll=window.scrollY;showBrief(selectedIssue.id);window.scrollTo({top:scroll,behavior:'instant'});}
 }
 if(document.readyState!=='complete')document.addEventListener('DOMContentLoaded',initialize,{once:true});else initialize();
})();
