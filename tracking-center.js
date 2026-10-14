/* Shared stock tracking demo. Settings and reminder records have separate views. */
let trackingSignalKey='';
const trackingCenter=(()=>{
 const sample=new Map([['300429',{status:'active',frequency:'持续提醒',channel:'工作台消息',kinds:['announcement','news']}]]);
 const labels={announcement:'新公告',news:'新资讯'};
 let workspaceTab='notices',filter='',widgetTab='notices',records=null;
 const kinds=item=>item?.kinds||['announcement','news'];
 const condition=(q,item)=>`${q.name}有${kinds(item).map(k=>labels[k]).join('、')}时提醒我`;
 const quoteFor=key=>{
  const q=opportunitySecurity(key);if(!q)return null;
  if(q.price==null||q.change==null){
   const seed=Number(q.code)||1,prices={'600969':8.62,'000155':10.53,'601001':15.84,'300980':21.36};
   if(q.price==null)q.price=prices[key]||Number((8+(seed%6800)/100).toFixed(2));
   if(q.change==null)q.change=key==='000155'?0:Number((((seed%601)-300)/100).toFixed(2));
   q.reference='tracking-demo';q.originalQuoteSource=q.originalQuoteSource||q.source;q.source='原型演示行情';q.asOf='2026-10-14 · 模拟';q.note='缺失行情补为固定演示值，不代表真实或实时报价。';
   const fixture=window.eventDriverData?.stocks.find(stock=>stock.code===key);if(fixture){fixture.price=Number(q.price);fixture.change=Number(q.change);}
  }
  return q;
 };
 const quoteLine=q=>{const price=Number(q.price),pct=Number(q.change),delta=price-price/(1+pct/100),signed=n=>(n>0?'+':'')+n.toFixed(2);return `<div class="tc-market-line" title="${esc(q.reference==='tracking-demo'?'固定演示行情':'当前参考行情；不是触发时快照')}"><strong>${price.toFixed(2)}</strong><span class="${pct<0?'down':'up'}">${signed(delta)}</span><span class="${pct<0?'down':'up'}">${signed(pct)}%</span></div>`;};
 const entries=()=>[...sample].map(([key,item])=>({key,item,q:quoteFor(key)})).filter(row=>row.q);
 function signals(){
  if(!records)records=[
   {id:'tc-demo-other-history',key:'002384',kind:'news',date:'2026-10-12',time:'14:20',title:'东山精密：历史资讯提醒',summary:'全量历史提醒的另一只股票演示记录，不代表真实新增资讯。',read:true},
   {id:'tc-demo-news',key:'300429',kind:'news',date:'2026-10-14',time:'09:35',title:'强力新材：客户验证相关资讯更新',summary:'演示收到一条与客户验证相关的资讯。请结合资料来源核对内容，不能据此认定验证已完成。',eventId:'driver-pspi',read:false},
   {id:'tc-demo-announcement',key:'300429',kind:'announcement',date:'2026-10-14',time:'08:45',title:'强力新材：新增公告提醒',summary:'这是一条公告提醒的交互演示，未对应真实新增公告，不提供虚构原文或来源。',read:false},
   {id:'tc-demo-history',key:'300429',kind:'news',date:'2026-10-13',time:'15:30',title:'强力新材：历史资讯提醒',summary:'历史提醒记录演示。暂停或停止追踪后，这条记录仍保留。',read:true}
  ];return records;
 }
 const unread=()=>signals().filter(n=>!n.read&&n.date==='2026-10-14').length;
 function render(){showReviewAccount('triggers',taskTab==='notices'?'notices':'tasks');}
 function open(){taskTab='tasks';trackingSignalKey='';showReviewAccount('triggers','tasks');}
 function reminderRows(rows){return rows.map(n=>{const q=quoteFor(n.key);return `<article class="tc-reminder ${n.read?'':'is-unread'}" data-tc-record="${n.id}"><div class="tc-reminder-meta">${opLink(esc(q?.name||n.key),opQuoteRoute(n.key),'tc-stock-quote')}${quoteLine(q)}<span>${labels[n.kind]}</span>${n.read?'':'<span class="tc-unread">未读</span>'}<time>${n.date} ${n.time}</time></div><button class="tc-reminder-title" data-tc-notice="${n.id}">${esc(n.title)} ${icon('chevron-right')}</button></article>`;}).join('')||'<div class="tc-empty"><h3>暂无触发记录</h3><p>新公告或新资讯满足已设置的提醒范围后，在这里查看。</p></div>';}
 function workspaceContent(){
  const rows=signals().filter(n=>(!filter||n.key===filter)&&n.date==='2026-10-14');
  return `<div class="tc-workspace" data-v3-keep-copy><div class="tc-toolbar"><nav class="tc-tabs" aria-label="追踪视图"><button data-tc-workspace-tab="notices" aria-pressed="${workspaceTab==='notices'}">今日触发 <span>${signals().filter(n=>n.date==='2026-10-14').length}</span></button><button data-tc-workspace-tab="tasks" aria-pressed="${workspaceTab==='tasks'}">监控任务 <span>${entries().length}</span></button></nav><button class="button" data-tc-add>添加追踪 ${icon('plus')}</button></div>${workspaceTab==='notices'?`<div class="tc-result-tools"><label>股票 <select id="tcResultFilter"><option value="">全部股票</option>${[...new Set(signals().map(n=>n.key))].map(key=>`<option value="${key}" ${filter===key?'selected':''}>${esc(opportunitySecurity(key)?.name||key)}</option>`).join('')}</select></label><button class="text-action" data-tc-history>查看历史提醒</button><button class="text-action" data-tc-read-all>全部标为已读</button></div>${reminderRows(rows)}`:`<div class="tc-list-head"><span>股票 / 提醒范围</span><span>监控项</span><span>今日触发</span></div>${entries().map(({key,q,item})=>`<article class="tc-row" data-tracking-key="${key}"><div class="tc-stock"><h3>${opLink(esc(q.name),opQuoteRoute(key),'tc-stock-quote')} <small>${q.code}</small></h3>${quoteLine(q)}<p>${kinds(item).map(k=>labels[k]).join('、')}</p><div class="tc-row-actions"><button class="text-action" data-tc-edit="${key}">修改设置</button><button class="text-action" data-tc-pause="${key}">${item.status==='paused'?'恢复追踪':'暂停追踪'}</button><button class="text-action" data-tc-stop="${key}">停止追踪</button></div></div><button type="button" class="tc-monitor-count" data-tc-edit="${key}" aria-label="管理${esc(q.name)}的追踪条件" title="查看和修改追踪条件"><strong>${item.status==='paused'?0:kinds(item).length}</strong><span>${item.status==='paused'?'已暂停':'监控中'}</span></button><button class="tc-count" data-tc-stock-results="${key}">${signals().filter(n=>n.key===key&&n.date==='2026-10-14').length} ${icon('chevron-right')}</button></article>`).join('')||'<div class="tc-empty">暂无监控任务</div>'}`}</div>`;
 }
 function bindWorkspace(){const select=$('#tcResultFilter');if(select)select.onchange=()=>{filter=select.value;refreshWorkspace();};}
 function refreshWorkspace(){if(route.type==='stock-workbench'&&route.tab==='triggers'){route.trackingTab=workspaceTab;$('#workspace-panel').innerHTML=workspaceContent();bindWorkspace();}}
 function notice(id){const n=signals().find(x=>x.id===id);if(!n)return;n.read=true;refreshWorkspace();refreshWidget();const q=opportunitySecurity(n.key),item=sample.get(n.key);openModal('提醒详情',`<div class="tc-notice-detail"><div class="tc-reminder-meta"><span>${labels[n.kind]} · 演示记录</span><time>${n.date} ${n.time}</time></div><h3>${esc(n.title)}</h3><p>${esc(n.summary)}</p><div class="tc-detail-condition"><span>触发条件</span><p>${esc(condition(q,{kinds:[n.kind]}))}</p></div><div class="flow-actions">${opLink('查看行情 '+icon('arrow-up-right'),opQuoteRoute(n.key),'button')}${n.eventId?opLink('查看相关事件 '+icon('arrow-up-right'),{type:'event-detail',eventId:n.eventId,issueId:opIssue().id},'button'):''}${item?`<button class="button" data-tc-edit="${n.key}">查看提醒设置</button>`:'<span class="tc-boundary">该标的追踪已停止，历史记录保留。</span>'}</div></div>`);}
 function widgetReminders(rows){return rows.map(n=>{
  const q=quoteFor(n.key),copy=n.kind==='announcement'?`${q.name}有一条新公告提醒，点开看看具体内容。`:n.eventId==='driver-pspi'?`${q.name}有一条客户验证相关资讯，点开看看有哪些新信息。`:`${q.name}有一条新资讯提醒，点开看看。`;
  return `<article class="tc-preview-reminder ${n.read?'':'is-unread'}" data-tc-record="${n.id}"><div class="tc-preview-stock">${opLink(esc(q.name),opQuoteRoute(n.key),'tc-stock-quote')}<strong>${Number(q.price).toFixed(2)}</strong>${opChange(q)}</div><button class="tc-preview-message" data-tc-notice="${n.id}"><span class="tc-preview-kind">${labels[n.kind]}</span>${esc(copy)} ${icon('chevron-right')}</button><div class="tc-preview-foot">${n.read?'':'<span class="tc-preview-unread">未读</span>'}<time>${n.time}</time></div></article>`;
 }).join('')||'<div class="tc-preview-empty">今天还没有新提醒，有更新时会显示在这里。</div>';}
 function widgetBody(){return `<div class="tc-widget" data-v3-keep-copy><nav class="tc-tabs" aria-label="我的追踪"><button class="${unread()>0?'tc-has-unread':''}" data-tc-widget-tab="notices" aria-pressed="${widgetTab==='notices'}">今日触发 <span>${unread()} 未读</span></button><button data-tc-widget-tab="tasks" aria-pressed="${widgetTab==='tasks'}">监控任务 <span>${entries().length}</span></button></nav>${widgetTab==='notices'?widgetReminders(signals().filter(n=>n.date==='2026-10-14').slice(0,2)):entries().slice(0,3).map(({key,q,item})=>`<div class="tc-widget-task">${opLink(esc(q.name),opQuoteRoute(key),'tc-stock-quote')}<span>${item.status==='paused'?'已暂停':'监控中'}</span><small>${kinds(item).map(k=>labels[k]).join('、')}</small></div>`).join('')||'<p>暂无监控任务</p>'}</div>`;}
 function refreshWidget(){const body=$('[data-widget="tracking"] .widget-body');if(body)body.innerHTML=widgetBody();}
 function changed(){document.dispatchEvent(new CustomEvent('stock-tracking-change'));refreshWorkspace();refreshWidget();}
 function configure(key='300429',adding=false,relatedKeys=null){
  const choices=opportunityQuotes.filter(q=>q.type==='stock'&&q.code&&(!relatedKeys||relatedKeys.includes(opSecurityKey(q)))),q=opportunitySecurity(key)||choices[0];if(!q)return;quoteFor(opSecurityKey(q));
  const record=sample.get(opSecurityKey(q))||{frequency:'持续提醒',channel:'工作台消息',kinds:['announcement','news']};
  setContext({kind:'stock-tracking-demo',company:q.name,code:opSecurityKey(q)});taskDraft={kind:'stock-tracking-demo'};openAssistant();
  $('#assistantContent').innerHTML=`<h2 class="assistant-greeting">${relatedKeys?'追踪关联标的':sample.has(opSecurityKey(q))?'修改追踪设置':'加入标的追踪'}</h2><form id="tcStockForm" class="ed-strategy" data-v3-keep-copy><div class="ed-strategy-field"><span>追踪标的</span>${relatedKeys?`<fieldset class="tc-related-picker"><legend>选择要追踪的股票</legend>${choices.map(s=>`<label><input type="checkbox" name="security" value="${esc(opSecurityKey(s))}" ${choices.length===1?'checked':''}><span><strong>${esc(s.name)}</strong><small>${esc(s.code)}${sample.has(opSecurityKey(s))?' · 已有追踪设置':''}</small></span></label>`).join('')}</fieldset>`:adding?`<select name="security">${choices.map(s=>`<option value="${esc(opSecurityKey(s))}" ${opSecurityKey(s)===opSecurityKey(q)?'selected':''}>${esc(s.name)} · ${s.code}</option>`).join('')}</select>`:`<strong>${esc(q.name)} · ${q.code}</strong><input type="hidden" name="security" value="${esc(opSecurityKey(q))}">`}</div><fieldset class="tc-content-picker"><legend>提醒内容</legend>${Object.entries(labels).map(([value,label])=>`<label><input type="checkbox" name="kind" value="${value}" ${kinds(record).includes(value)?'checked':''}>${label}</label>`).join('')}</fieldset><div class="ed-strategy-field"><span>提醒条件</span><p id="tcStockCondition">${esc(condition(q,record))}</p></div><p id="tcStockError" role="alert" hidden></p><label class="ed-strategy-field"><span>持续方式</span><select name="frequency">${['持续提醒','仅提醒一次'].map(v=>`<option ${record.frequency===v?'selected':''}>${v}</option>`).join('')}</select></label><p class="tc-setting-help">持续提醒：每有新内容继续提醒；仅提醒一次：每只标的首次提醒后结束。</p><label class="ed-strategy-field"><span>提醒方式</span><select name="channel">${['工作台消息','自选标记 + 工作台消息'].map(v=>`<option ${record.channel===v?'selected':''}>${v}</option>`).join('')}</select></label>${relatedKeys?'<label class="tc-overwrite"><input type="checkbox" name="overwrite">同时更新已有标的的设置并恢复追踪</label><p class="tc-setting-help">未勾选时，已有追踪设置保持不变。</p>':''}<button type="submit" class="ed-confirm-monitor">确认追踪</button><button type="button" class="text-action" data-tc-cancel>取消</button><p class="ed-assistant-note">当前仅保存内存演示设置，刷新后重置；不运行真实监控或推送。</p></form>`;
  $('#assistantContent').scrollTop=0;const form=$('#tcStockForm');
  const describeForm=()=>{const data=new FormData(form),stocks=data.getAll('security').map(opportunitySecurity).filter(Boolean),selected=data.getAll('kind');$('#tcStockCondition').textContent=stocks.length&&selected.length?stocks.map(q=>q.name).join('、')+'有'+selected.map(k=>labels[k]).join('、')+'时提醒我':'请选择股票和提醒内容';$('#tcStockError').hidden=true;};
  form.onchange=e=>{if(e.target.name==='security'&&!relatedKeys){const r=sample.get(e.target.value)||{kinds:['announcement','news'],frequency:'持续提醒',channel:'工作台消息'};form.querySelectorAll('[name=kind]').forEach(n=>n.checked=kinds(r).includes(n.value));form.elements.frequency.value=r.frequency;form.elements.channel.value=r.channel;}describeForm();};
  form.onsubmit=e=>{e.preventDefault();const data=new FormData(form),selected=data.getAll('kind').filter(k=>labels[k]),stocks=[...new Set(data.getAll('security'))].map(opportunitySecurity).filter(q=>q?.type==='stock'&&choices.some(s=>opSecurityKey(s)===opSecurityKey(q)));if(!stocks.length||!selected.length){$('#tcStockError').textContent=!stocks.length?'请至少选择一只关联股票':'请至少选择一种提醒内容';$('#tcStockError').hidden=false;return;}stocks.forEach(q=>{const key=opSecurityKey(q);quoteFor(key);if(!relatedKeys||!sample.has(key)||data.has('overwrite'))sample.set(key,{status:'active',frequency:data.get('frequency'),channel:data.get('channel'),kinds:[...selected]});});changed();taskDraft=null;if(route.type==='tasks')showTasks();setContext({kind:'stock-tracking-demo',company:stocks[0].name,code:opSecurityKey(stocks[0])});$('#assistantContent').innerHTML=`<div class="flow-success-mark">${icon('check')}</div><h2 class="assistant-greeting">追踪设置已确认</h2><p class="assistant-copy">${esc(stocks.map(q=>q.name).join('、'))}</p><a class="button primary" href="#/stock-workbench?tab=triggers&view=tasks">查看监控任务 ${icon('arrow-up-right')}</a><p class="ed-assistant-note">当前为内存演示，尚未运行真实监控。</p>`;toast('追踪设置已确认');};
 }
 return {get view(){return workspaceTab;},render,open,entries,signals,configure,condition,widgetBody,refreshWidget,workspaceContent,bindWorkspace,refreshWorkspace,notice,reminderRows,configureRelated(keys){const valid=[...new Set(keys)].filter(k=>opportunitySecurity(k)?.type==='stock');if(valid.length)configure(valid[0],true,valid);},edit:configure,setFilter(){},activateMine(){},get mode(){return 'demo';},set mode(value){},pause(key){const item=sample.get(key);if(item){item.status=item.status==='paused'?'active':'paused';changed();}},stop(key){sample.delete(key);changed();},setWorkspaceTab(tab){workspaceTab=tab;filter='';},setWidgetTab(tab){widgetTab=tab;refreshWidget();},openHistory(){showTrackingHistory({type:'reminder-history'});},filterStock(key){filter=key;workspaceTab='notices';refreshWorkspace();},readAll(){signals().filter(n=>n.date==='2026-10-14'&&(!filter||n.key===filter)).forEach(n=>n.read=true);refreshWorkspace();refreshWidget();}};
})();
showTasks=function(){trackingCenter.render();};
const tcPreviousAccount=showReviewAccount;
showReviewAccount=function(tab,trackingTab){if(trackingTab)trackingCenter.setWorkspaceTab(trackingTab);tcPreviousAccount(tab);if(route.type==='stock-workbench'&&route.tab==='triggers'){$('.review-workspace-toolbar [data-flow=tasks]')?.remove();$('#workspace-panel').innerHTML=trackingCenter.workspaceContent();trackingCenter.bindWorkspace();route.trackingTab=trackingCenter.view;}};
const tcPreviousStockBody=stockBody;
stockBody=function(){if(stockTab!=='触发')return tcPreviousStockBody();return `<div class="stock-body"><div class="table-tabs"><button data-stock-tab="自选股">自选股</button><button data-stock-tab="持仓">持仓</button><button class="selected" data-stock-tab="触发">触发</button></div>${trackingCenter.widgetBody()}<button class="text-action" data-tc-open-results>查看全部触发 ${icon('arrow-up-right')}</button></div>`;};
document.addEventListener('click',e=>{
 const b=e.target.closest('[data-tc-workspace-tab],[data-tc-widget-tab],[data-tc-open-results],[data-tc-manage],[data-tc-history],[data-tc-read-all],[data-tc-notice],[data-tc-stock-results],[data-tc-tab],[data-tc-edit],[data-tc-add],[data-tc-pause],[data-tc-stop],[data-tc-cancel]');if(!b)return;
 if(b.dataset.tcWorkspaceTab){showReviewAccount('triggers',b.dataset.tcWorkspaceTab);}
 if(b.dataset.tcWidgetTab)trackingCenter.setWidgetTab(b.dataset.tcWidgetTab);
 if(b.hasAttribute('data-tc-open-results')||b.dataset.tcTab==='notices'){trackingCenter.setWorkspaceTab('notices');showReviewAccount('triggers');}
 if(b.hasAttribute('data-tc-manage')||b.dataset.tcTab==='tasks')trackingCenter.open();
 if(b.hasAttribute('data-tc-history'))trackingCenter.openHistory();
 if(b.hasAttribute('data-tc-read-all'))trackingCenter.readAll();
 if(b.dataset.tcNotice)trackingCenter.notice(b.dataset.tcNotice);
 if(b.dataset.tcStockResults)trackingCenter.filterStock(b.dataset.tcStockResults);
 if(b.dataset.tcEdit){if($('#modal').open)closeModal();trackingCenter.configure(b.dataset.tcEdit);}
 if(b.hasAttribute('data-tc-add'))trackingCenter.configure('300429',true);
 if(b.dataset.tcPause){trackingCenter.pause(b.dataset.tcPause);trackingCenter.refreshWorkspace();}
 if(b.dataset.tcStop){trackingCenter.stop(b.dataset.tcStop);trackingCenter.refreshWorkspace();toast('已停止追踪，历史提醒保留');}
 if(b.hasAttribute('data-tc-cancel')){context=null;taskDraft=null;assistantDefault();closeAssistant();}
});
document.addEventListener('submit',e=>{if(e.target.id!=='chatForm'||!['tasks','event-detail'].includes(route.type))return;const text=$('#chatInput').value.trim();if(!/提醒|追踪|跟踪|盯盘/.test(text))return;e.preventDefault();e.stopImmediatePropagation();const q=opportunityQuotes.find(q=>q.type==='stock'&&(text.includes(q.name)||text.includes(q.code)));if(!q){toast('请先选择要追踪的股票');return;}$('#chatInput').value='';trackingCenter.configure(opSecurityKey(q));},true);

// Stock quotes use the same tracking manager as event details.
(()=>{
 const mark=selected=>selected?'<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" aria-hidden="true"><path d="M5 12h14"/></svg>':icon('plus');
 function buttons(q){
  const key=opSecurityKey(q),entry=trackingCenter.entries().find(row=>row.key===key),paused=entry?.item.status==='paused',active=!!entry&&!paused,watched=opportunityWatch.includes(key);
  return `<button type="button" class="tc-quote-action ${entry?'selected':''}" data-quote-track="${esc(key)}" aria-pressed="${!!entry}" aria-label="${active?'取消追踪':paused?'恢复追踪设置':'加入追踪'}：${esc(q.name)}" title="${active?'取消追踪':paused?'修改设置并恢复追踪':'设置新公告、新消息提醒'}">${icon('bell')}<span>${active?'已追踪':paused?'追踪已暂停':'加入追踪'}</span>${mark(active)}</button><button type="button" class="tc-quote-action ${watched?'selected':''}" data-op-watch="${esc(key)}" aria-pressed="${watched}" aria-label="${watched?'移出自选':'加入自选'}：${esc(q.name)}" title="${watched?'移出自选':'加入自选'}">${icon('star')}<span>${watched?'已自选':'加入自选'}</span>${mark(watched)}</button>`;
 }
 function sync(){
  const box=document.querySelector('.tc-quote-actions');if(!box)return;
  const q=opportunitySecurity(box.dataset.security);if(q)box.innerHTML=buttons(q);
 }
 const previous=briefQuote;
 briefQuote=function(company,issue){
  const result=previous(company,issue),q=opportunitySecurity(company);if(!q||q.type!=='stock')return result;
  const actions=document.querySelector('#flowView .flow-page-head .flow-actions');if(!actions)return result;
  actions.querySelectorAll('[data-op-watch],.security-bell').forEach(n=>n.remove());
  document.querySelector('#flowView .security-track-status')?.remove();
  const box=document.createElement('div');box.className='tc-quote-actions';box.dataset.security=opSecurityKey(q);box.innerHTML=buttons(q);actions.prepend(box);
  return result;
 };
 document.addEventListener('stock-tracking-change',sync);
 document.addEventListener('opportunity-watch-change',sync);
 document.addEventListener('click',e=>{
  const b=e.target.closest('[data-quote-track]');if(!b)return;
  const key=b.dataset.quoteTrack,entry=trackingCenter.entries().find(row=>row.key===key);
  if(entry&&entry.item.status!=='paused'){
   trackingCenter.stop(key);
   if(context?.kind==='stock-tracking-demo'&&context.code===key){context=null;taskDraft=null;assistantDefault();}
   toast('已取消追踪');document.querySelector('[data-quote-track]')?.focus({preventScroll:true});
  }else trackingCenter.configure(key);
 });
})();

window.trackingCenterWidgetBody=()=>trackingCenter.widgetBody();
// Reuse the overview's existing layout controls; removing the widget never stops tasks.
document.addEventListener('DOMContentLoaded',()=>setTimeout(()=>{
 if(!window.workbenchClient.desktop)return;
 const D=window.overviewV3Data;if(D){D.names.tracking='我的追踪';Object.values(D.orders).forEach(order=>{if(!order.includes('tracking'))order.push('tracking');});}
 if(!state.trackingWidgetV2){state.trackingWidgetV2=true;state.order.push('tracking');save();}
 const previous=renderWidgets;renderWidgets=function(...args){const result=previous(...args);const widget=$('[data-widget="tracking"]');if(widget){widget.setAttribute('data-v3-keep-copy','');const title=widget.querySelector('.widget-title h2');if(title)title.innerHTML='<button class="tc-widget-heading" data-tc-open-results>'+esc(state.titles.tracking||'我的追踪')+' '+icon('chevron-right')+'</button>';const foot=widget.querySelector('.widget-footer');if(foot)foot.innerHTML='<span>演示数据</span><button data-tc-open-results>查看全部触发 '+icon('arrow-up-right')+'</button>';trackingCenter.refreshWidget();}return result;};
 renderWidgets();
},0));

// Full reminder archive, independent of the stock workbench's current filter.
function showTrackingHistory(input={}){
 const r={type:'reminder-history',security:'',kind:'',page:1,...input},all=trackingCenter.signals();
 const rows=all.filter(n=>(!r.security||n.key===r.security)&&(!r.kind||n.kind===r.kind)).slice().sort((a,b)=>(b.date+b.time).localeCompare(a.date+a.time));
 const pageSize=20,pages=Math.max(1,Math.ceil(rows.length/pageSize));r.page=Math.min(pages,Math.max(1,Number(r.page)||1));
 const slice=rows.slice((r.page-1)*pageSize,r.page*pageSize),dates=[...new Set(slice.map(n=>n.date))];
 page('历史提醒',opLink(icon('arrow-left')+'返回今日触发',{type:'stock-workbench',tab:'triggers'},'back-button')+head('提醒记录','历史提醒','查看所有标的的历次提醒，已停止追踪的记录也保留。')+`<section class="tc-history-page tc-center" data-v3-keep-copy><div class="tc-result-tools"><label>股票<select id="tcHistorySecurity"><option value="">全部股票</option>${[...new Set(all.map(n=>n.key))].map(key=>`<option value="${key}" ${r.security===key?'selected':''}>${esc(opportunitySecurity(key)?.name||key)}</option>`).join('')}</select></label><label>内容<select id="tcHistoryKind"><option value="">全部内容</option>${[['announcement','新公告'],['news','新资讯']].map(([key,label])=>`<option value="${key}" ${r.kind===key?'selected':''}>${label}</option>`).join('')}</select></label><span>共 ${rows.length} 条提醒</span></div>${dates.length?dates.map(date=>`<section class="tc-history-day"><h2>${date}</h2>${trackingCenter.reminderRows(slice.filter(n=>n.date===date))}</section>`).join(''):'<div class="tc-empty">没有符合条件的历史提醒</div>'}<nav class="tc-history-pagination" aria-label="历史提醒分页">${r.page>1?opLink('上一页',{...r,page:r.page-1},'text-action'):''}<span>${r.page} / ${pages} 页</span>${r.page<pages?opLink('下一页',{...r,page:r.page+1},'text-action'):''}</nav></section>`,'reminder-history');
 route=r;
 const filter=()=>showTrackingHistory({...r,security:$('#tcHistorySecurity').value,kind:$('#tcHistoryKind').value,page:1});$('#tcHistorySecurity').onchange=filter;$('#tcHistoryKind').onchange=filter;
}
