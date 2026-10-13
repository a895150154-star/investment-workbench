/* Fixed demo scenarios are isolated from user-confirmed local tracking. */
let trackingSignalKey='';
const trackingCenter=(()=>{
 let mode='demo',filter='全部';
 const sample={
  '300308':{conditions:[{id:'earnings'},{id:'macd'}],frequency:'每个交易日最多一次',channel:'工作台标记 + 消息提醒'},
  '300502':{conditions:[{id:'earnings'},{id:'major-risk'}],frequency:'每个交易日最多一次',channel:'仅工作台标记'},
  '515880':{conditions:[{id:'fund-report'},{id:'fund-risk'}],frequency:'仅提醒一次',channel:'工作台标记 + 消息提醒'}
 };
 function entries(){
  if(mode!=='mine')return Object.entries(sample).map(([key,item])=>({key,q:opportunitySecurity(key),item,events:[],count:item.conditions.length}));
  const rows=new Map(securityTrackingView.entries().map(({key,item,security:q})=>[key,{key,q,item,events:[],count:item.conditions.length}]));
  Object.entries(eventTracking).filter(([id,v])=>!researchDemo.isCase(id)&&eventTrackingActive(v)&&!v.demo&&!['paused','stopped'].includes(v.driverStatus)).forEach(([id,item])=>eventTrackingStocks(item).forEach(q=>{const key=opSecurityKey(q);if(!rows.has(key))rows.set(key,{key,q,item:null,events:[],count:0});const row=rows.get(key);row.events.push({id,item});row.count++;}));
  const record=researchTracking.get().record;if(record)rows.set(researchDemo.identity,{key:researchDemo.identity,q:opportunitySecurity(researchDemo.identity),item:null,events:[],count:record.observations.length,research:true});return [...rows.values()];
 }
 function signals(key=''){
  const list=mode==='demo'?[{key:'300308',category:'指标',time:'09:30:30',title:'日线 MACD 金叉',text:'模拟 DIF 上穿 DEA，满足已设置的“日线 MACD 金叉”条件。',rule:'macd'}]:mode==='mine'?researchTracking.forDay((issueFromId(route.issueId)||briefSnapshot().displayed).day).signals.map(signal=>({key:researchDemo.identity,category:'事件进展',research:signal})):[];
  return key?list.filter(x=>x.key===key):list;
 }
 function renderSignals(key){
  const row=entries().find(r=>r.key===key),all=signals(key),items=all.filter(x=>filter==='全部'||x.category===filter);
  return `${key?`<div class="tc-signal-heading"><button type="button" class="text-action" data-tc-back>返回盯盘列表</button><h2>${esc(row?.q.name||'该标的')} · 本期信号</h2></div>`:''}<nav class="tc-filters" aria-label="信号类别">${['全部','公告与风险','事件进展','量价','资金','指标'].map(c=>`<button type="button" data-tc-filter="${c}" aria-pressed="${filter===c}" class="${filter===c?'selected':''}">${c} <small>${c==='全部'?all.length:all.filter(x=>x.category===c).length}</small></button>`).join('')}</nav>${items.length?`<div class="tc-signals">${items.map(x=>{if(x.research)return researchTrackingUI.signal(x.research,issueFromId(route.issueId)||briefSnapshot().displayed);const q=opportunitySecurity(x.key);return `<article class="tc-signal"><time>${x.time}</time><div><div class="tc-signal-meta"><span>演示触发</span><span>${x.category}</span></div><h3>${opLink(esc(q.name),opQuoteRoute(x.key,briefSnapshot().displayed.id))}</h3><button class="tc-signal-title" data-tc-detail="${x.key}">${esc(x.title)}</button><p>${esc(x.text)}</p>${entries().some(r=>r.key===x.key)?`<button class="text-action" data-tc-edit="${x.key}">查看追踪条件</button>`:'<small>该标的盯盘已停止，保留本次演示触发记录。</small>'}</div></article>`;}).join('')}</div>`:`<div class="tc-empty">${icon('bell')}<h3>${filter!=='全部'&&all.length?'该类别暂无触发':'今日暂无信号触发'}</h3><p>${mode==='mine'?'本期暂无新触发。可在“盯盘”中管理海光追踪并手动模拟进展；当前未运行实时监控。':'这是无触发状态的演示，未运行实时监控。'}</p><button type="button" class="button" data-tc-tab="tasks">查看盯盘设置</button></div>`}`;
 }
 function content(){
  const rows=entries(),today=taskTab==='notices',otherRows=rows.filter(row=>!row.research),issue=issueFromId(route.issueId)||briefSnapshot().displayed;
  if(trackingSignalKey&&!rows.some(x=>x.key===trackingSignalKey))trackingSignalKey='';
  return `<section class="tc-center"><div class="tc-toolbar"><nav class="tc-tabs" role="tablist" aria-label="追踪管理栏目"><button role="tab" id="tc-today" aria-controls="tc-panel" aria-selected="${today}" tabindex="${today?0:-1}" data-tc-tab="notices">今日触发 <span>${signals().length}</span></button><button role="tab" id="tc-monitor" aria-controls="tc-panel" aria-selected="${!today}" tabindex="${today?-1:0}" data-tc-tab="tasks">盯盘 <span>${rows.length}</span></button></nav><label class="tc-scenario">查看场景<select id="tcScenario" aria-label="查看场景"><option value="demo" ${mode==='demo'?'selected':''}>有触发示例</option><option value="empty" ${mode==='empty'?'selected':''}>无触发示例</option><option value="mine" ${mode==='mine'?'selected':''}>我的设置</option></select></label></div><p class="tc-boundary">${mode==='mine'?'本地已保存设置 · 暂未接入监控和推送':'演示场景 · 固定信号与临时设置，非真实监控；修改示例不会改变“我的设置”'}</p><div id="tc-panel" role="tabpanel" aria-labelledby="${today?'tc-today':'tc-monitor'}">${today?renderSignals(trackingSignalKey):`${mode==='mine'?researchTrackingUI.manager(issue):''}<div class="tc-list-head"><span>标的</span><span>追踪条件</span><span>今日触发</span></div>${otherRows.length?otherRows.map(row=>`<article class="tc-row" data-tracking-key="${esc(row.key)}" tabindex="-1"><div class="tc-stock"><h3>${row.q.localOnly?`<button class="text-action" data-tc-local="${esc(row.key)}">${esc(row.q.name)}</button>`:opLink(esc(row.q.name),opQuoteRoute(row.key,briefSnapshot().displayed.id))}<small>${esc(row.q.code||'代码未获取')}</small></h3><div class="tc-quote">${opPrice(row.q)}${opChange(row.q)}</div>${row.events.length?`<small>含 ${row.events.length} 条事件线索</small>`:''}</div><button type="button" class="tc-count" data-tc-edit="${esc(row.key)}" aria-label="管理${esc(row.q.name)}的 ${row.count} 个追踪条件"><strong>${row.count}</strong><span>监控中</span></button><button type="button" class="tc-count ${signals(row.key).length?'has-signals':''}" data-tc-signals="${esc(row.key)}" aria-label="${esc(row.q.name)}今日触发 ${signals(row.key).length} 次"><strong>${signals(row.key).length}</strong><span>今日触发</span></button></article>`).join(''):`<div class="tc-empty">${icon('bell')}<h3>暂无其他标的追踪</h3><p>其他股票或 ETF 的条件仍可在这里管理。</p></div>`}<div class="tc-list-footer"><button class="button" data-tc-add>添加盯盘标的</button><small>报价沿用历史快照；“监控中”仅为原型设置状态。</small></div>`}</div></section>`;
 }
 function render(){
  const issue=issueFromId(route.issueId)||briefSnapshot().displayed;
  page('追踪管理',back()+head('持续关注','追踪管理','查看触发信号，管理关注标的。')+content()+(trackingCenter.mode==='mine'?Object.entries(eventTracking).filter(([id,v])=>!researchDemo.isCase(id)&&!eventTrackingActive(v)).map(([id,v])=>`<details class="tc-brief-settings"><summary>旧追踪设置 · 待核对</summary>${eventTrackingRow(id,v,issue.id,true)}</details>`).join(''):'')+`<details class="tc-brief-settings"><summary>个人简报订阅</summary><p>早报 ${esc(briefSchedule.morning)} / 晚报 ${esc(briefSchedule.evening)} · 北京时间</p><button class="button" data-brief-custom="${issue.id}">调整简报偏好</button></details>`,'tasks');
  route={type:'tasks',tab:taskTab,security:trackingSignalKey,scene:trackingCenter.mode,issueId:issue.id};
 }
 function edit(key){
  const row=entries().find(x=>x.key===key);if(!row)return;if(row.research){researchTrackingUI.configure();return;}
  if(mode!=='mine'){
    securityTrackingView.configure(row.q,{record:row.item,onSave:record=>{sample[key]=record;return true;},onStop:()=>{delete sample[key];},demo:true});return;
  }
  if(row.item&&!row.events.length){securityTrackingView.configure(row.q);return;}
  if(!row.item&&row.events.length===1){eventTrackingAssistant(row.events[0].id);return;}
  setContext({kind:'tracking-management',company:row.q.name,code:key,source:'已保存追踪'});openAssistant();
  $('#assistantContent').innerHTML=`<h2 class="assistant-greeting">${esc(row.q.name)}的追踪条件</h2>${row.item?`<button class="suggestion" data-security-track="${esc(key)}">标的盯盘 · ${row.item.conditions.length} 个条件</button>`:''}${row.events.map(({id,item})=>`<button class="suggestion" data-event-track="${esc(id)}">事件线索 · ${esc(item.focus||item.eventType||item.eventTitle||'事件进展')}</button>`).join('')}<p class="assistant-copy">选择一组条件，修改提醒设置。</p>`;
 }
 return {render,entries,signals,edit,setFilter(v){filter=v;},activateMine(){mode='mine';trackingSignalKey='';filter='全部';},get mode(){return mode;},set mode(v){mode=['demo','empty','mine'].includes(v)?v:'demo';}};
})();
showTasks=function(){trackingCenter.render();};
const tcPreviousAccount=showReviewAccount;
showReviewAccount=function(tab){if(tab==='triggers'){taskTab='notices';trackingSignalKey='';showTasks();return;}tcPreviousAccount(tab);};
const tcPreviousStockBody=stockBody;
stockBody=function(){if(stockTab!=='触发')return tcPreviousStockBody();return `<div class="stock-body"><div class="table-tabs"><button data-stock-tab="自选股">自选股</button><button data-stock-tab="持仓">持仓</button><button class="selected" data-stock-tab="触发">触发</button></div><h3>追踪与触发</h3><p class="flow-small">在追踪管理中查看今日信号与全部盯盘标的。</p><div class="flow-actions"><button class="button" data-tc-tab="notices">今日触发</button><button class="button" data-tc-tab="tasks">盯盘</button></div></div>`;};
document.addEventListener('change',e=>{if(e.target.id==='tcScenario'){trackingCenter.mode=e.target.value;trackingCenter.setFilter('全部');trackingSignalKey='';showTasks();}});
document.addEventListener('click',e=>{
 const b=e.target.closest('[data-tc-tab],[data-tc-signals],[data-tc-edit],[data-tc-filter],[data-tc-back],[data-tc-add],[data-tc-detail],[data-tc-local]');if(!b)return;
 if(b.dataset.tcTab){trackingCenter.setFilter('全部');taskTab=b.dataset.tcTab;trackingSignalKey='';showTasks();}
 if(b.dataset.tcSignals){trackingCenter.setFilter('全部');taskTab='notices';trackingSignalKey=b.dataset.tcSignals;showTasks();}
 if(b.dataset.tcEdit)trackingCenter.edit(b.dataset.tcEdit);
 if(b.hasAttribute('data-tc-back')){taskTab='tasks';trackingSignalKey='';showTasks();}
 if(b.dataset.tcFilter){trackingCenter.setFilter(b.dataset.tcFilter);showTasks();}
 if(b.hasAttribute('data-tc-add')){trackingCenter.activateMine();taskTab='tasks';showTasks();const btn=document.createElement('button');btn.dataset.trackingAdd='';document.body.append(btn);btn.click();btn.remove();}
 if(b.dataset.tcDetail)openModal('触发详情','<p class="sample-notice">固定演示信号 · 非真实行情</p><h3>日线 MACD 金叉</h3><p>模拟 DIF 上穿 DEA，满足已设置的条件。</p><p>触发时间：09:30:30（演示）</p>'+(trackingCenter.entries().some(r=>r.key===b.dataset.tcDetail)?'<button class="button" data-tc-edit="'+esc(b.dataset.tcDetail)+'" onclick="closeModal()">查看追踪条件</button>':'<p>该标的盯盘已停止，保留本次演示触发记录。</p>')+'','今日触发');
 if(b.dataset.tcLocal){const q=trackingCenter.entries().find(x=>x.key===b.dataset.tcLocal)?.q;if(q)openModal(q.name,'<p>标的来自本地持仓，完整行情详情未接入。</p><p>代码：'+esc(q.code)+'</p>','标的资料');}
});
document.addEventListener('keydown',e=>{if(!e.target.matches('.tc-tabs [role=tab]')||!['ArrowLeft','ArrowRight','Home','End'].includes(e.key))return;e.preventDefault();taskTab=e.key==='Home'?'notices':e.key==='End'?'tasks':taskTab==='notices'?'tasks':'notices';trackingSignalKey='';showTasks();document.querySelector(taskTab==='notices'?'#tc-today':'#tc-monitor').focus();});
