/* V2.28: events supply context; confirmed stock identities anchor every new rule.
 * Legacy unanchored records stay readable and require confirmation before upgrade.
 */
const eventTrackingKey='vra-prototype-event-tracking-v1';
const eventTrackingExampleId='2490095';
const eventTrackingExample={schemaVersion:3,eventId:'2490095',scope:'同类事件',eventType:'端侧芯片产品发布',securities:['event-haiguang'],focus:'客户适配与实际交付',frequency:'仅提醒一次',channel:'工作台内提醒',demo:true};
let eventTracking={};
try{const saved=JSON.parse(localStorage.getItem(eventTrackingKey)||'null');eventTracking=saved&&typeof saved==='object'&&!Array.isArray(saved)?saved:{[eventTrackingExampleId]:eventTrackingExample};}catch{eventTracking={[eventTrackingExampleId]:eventTrackingExample};}
function saveEventTracking(next){try{localStorage.setItem(eventTrackingKey,JSON.stringify(next));eventTracking=next;return true;}catch{toast('未能保存追踪设置，原状态保留，请重试');return false;}}
function eventTheme(id){return id==='reference-environment'?'environmental-policy':id==='2490113'?'ai-applications':['2490095','2490104'].includes(id)?'semiconductors':'optical-interconnect';}
function eventRoute(id,issueId=briefSnapshot().displayed.id,themeId=eventTheme(id)){return {type:'event-detail',eventId:String(id),themeId,issueId};}
function trackedEvent(r){
 const themeIds=[r.themeId,...opportunityThemes.map(t=>t.id)].filter(Boolean);
 let item;for(const themeId of themeIds){item=opportunityEvents(themeId).find(e=>String(e.id)===String(r.eventId));if(item)break;}
 if(!item){const n=briefNews.find(n=>String(n.id)===String(r.eventId));if(n)item={...n,date:n.time,origin:'public'};}
 if(!item)return null;
 const analysis=briefNewsAnalysis[item.id],companyItem=briefItems.find(i=>i.id===item.id),story=hotspotStoryData[item.id];
 return {item,analysis,companyItem,story,themeId:r.themeId||eventTheme(item.id),summary:analysis?.summary||item.summary,interpretation:story?.why||analysis?.analysis||companyItem?.analysis||'先核对事件原文和影响范围，再判断它与关注个股的关系。',watch:analysis?.watch||companyItem?.watch||story?.watch||'关注后续项目、客户和订单进展。'};
}
function eventStockIdentity(key,record){
 const q=opportunitySecurity(key);if(q)return q.type==='stock'?q:null;
 const identity=record?.securityIdentities?.[key];
 return identity&&identity.code===key&&/^\d{6}$/.test(key)&&typeof identity.name==='string'&&identity.name.trim()&&identity.name.length<=80?{code:key,name:identity.name,type:'stock',localOnly:true}:null;
}
function eventTrackingStocks(record){return Array.isArray(record?.securities)?[...new Set(record.securities)].map(k=>eventStockIdentity(k,record)).filter(Boolean):[];}
function eventTrackingActive(record){return record?.schemaVersion===3&&eventTrackingStocks(record).length>0;}
function eventTrackingLabel(record){return !eventTrackingActive(record)?'旧设置 · 待核对':record.demo?'演示设置':'追踪已设置';}
function eventTrackingValue(id,value={},found=trackedEvent(eventRoute(id))){value=value||{};return {schemaVersion:3,eventId:String(id),eventTitle:found?.item.title||value.eventTitle||'原事件资料未找到',securities:eventTrackingStocks(value).map(opSecurityKey),scope:value.scope==='同类事件'?'同类事件':'本事件后续进展',eventType:typeof value.eventType==='string'?value.eventType:hotspotStoryData[id]?.eventType||'相关公司事件',focus:typeof value.focus==='string'?value.focus:'',frequency:value.frequency==='仅提醒一次'?'仅提醒一次':'持续提醒',channel:typeof value.channel==='string'?value.channel:'工作台内提醒'};}
function eventTrackingDescription(id,value,found){
 if(!eventTrackingActive(value))return '尚未明确追踪哪只个股；原设置：'+(value?.scope||'事件追踪')+' · '+(value?.rangeName||value?.targets||value?.eventTitle||'原事件')+'。原记录保留，暂不能修改提醒。';
 const v=eventTrackingValue(id,value,found),names=eventTrackingStocks(value).map(q=>q.name).join('、');
 return names+' · '+(v.scope==='同类事件'?'同类事件：'+v.eventType:'本事件后续：'+v.eventTitle)+(v.focus?' · 重点看：'+v.focus:'');
}
const eventSelectedSecurities={};
function researchDemoDetail(found,issue,status){
 const fact=briefNewsAnalysis[researchDemo.id].summary;
 return `<article class="event-detail research-demo-detail">
  <header class="event-detail-head"><span class="eyebrow">海光信息 · 事件研究 · 固定案例</span><h1>${esc(found.item.title)}</h1>
   <div class="event-detail-meta"><span>原文：2026-09-22 16:08:36</span><span>补充报道：2026-09-23</span></div>
   <p class="research-demo-history" role="status">${esc(researchDemo.status(issue))}。以上为固定真实资料；模拟进展单独列在后续验证中，不能据此认定原判断已得到验证。</p>
  </header>
  <section class="event-detail-section" data-research-section="facts"><h2>事件事实</h2><p>${esc(fact)}</p><p class="research-demo-attribution">依据：财联社发布快讯，2026-09-22 16:08:36。</p>${researchDemo.workspace(issue)}</section>
  <section class="event-detail-section" data-research-section="relation"><h2>与我的关注有什么关系</h2><div class="research-demo-user"><span class="brief-reason-tag">长期关注</span><span>海光固定案例 · 未提供持仓</span></div><p>固定案例长期关注海光信息。这次发布提供了研究起点；上方阅读摘要按投资习惯组织重点，客户适配、交付与经营贡献都仍需证据。</p></section>
  <section class="event-detail-section" data-research-section="evidence"><h2>资料依据与确认边界</h2>
   <div data-research-sources></div>
  </section>
  <section class="event-detail-section" data-research-section="validation"><h2>后续验证</h2><ol class="research-demo-checks">${researchDemo.observations.map(o=>`<li><strong>${esc(o.label)}</strong><p>${esc(o.check)}</p></li>`).join('')}</ol><p>推进、延期或取消都需要记录并核对依据；具体后续披露日期尚未取得。</p>${researchTrackingUI.eventProgress(issue)}</section>
  <section class="event-detail-track"><div class="event-track-copy"><span class="eyebrow">海光信息 · 追踪设置</span><h2>继续跟进这条研究线索</h2><p>把客户适配、实际交付与持续采购带入追踪条件，再确认观察项与频率。</p></div>${researchTrackingUI.status()}<div class="event-detail-actions"><button class="button primary" type="button" data-event-track="${researchDemo.id}">${researchTracking.get().record?'修改追踪设置':'设置后续追踪'}</button><button class="button" type="button" data-research-manage="${issue.id}">管理追踪与模拟进展</button>${researchTracking.get().record&&researchTracking.get().record.status!=='stopped'?'<button class="text-action" data-research-track-stop>停止追踪</button>':''}</div><p class="flow-small">演示设置仅在当前浏览器保存；保存不产生触发记录。</p></section>
 </article>`;
}
function showTrackedEvent(r){
 const found=trackedEvent(r),issue=issueFromId(r.issueId)||briefSnapshot().displayed;
 if(!found){page('事件详情',opBack()+panel('事件未找到','<p>该资料已不在当前原型快照中。</p>'),'event-detail');route=r;return;}
 const {item,companyItem,themeId,summary,interpretation,watch}=found;
 r={...r,themeId,issueId:issue.id};const tracking=eventTracking[item.id],related=hotspotRelatedStocks(item.id);
 eventSelectedSecurities[item.id]=eventTrackingStocks(tracking).map(opSecurityKey);
 if(!tracking&&related.length===1)eventSelectedSecurities[item.id]=[opSecurityKey(related[0].q)];
 const source=item.origin==='reference'?opEventSource(item):briefSource(companyItem?.source||item.title,issue);
 const status=tracking?`<div class="event-track-status ${eventTrackingActive(tracking)?'':'event-track-legacy'}"><div><strong>${eventTrackingLabel(tracking)}</strong><small>${esc(eventTrackingDescription(item.id,tracking,found))}</small></div></div>`:'';
 if(researchDemo.isCase(item.id)){
  page('事件详情',opBack()+researchDemoDetail(found,issue,status),'event-detail');route=r;
  researchDemo.resume?.(issue.id);return;
 }
 if(context?.kind==='event-research-demo'){context=null;taskDraft=null;}
 page('事件详情',opBack()+`<article class="event-detail"><header class="event-detail-head"><span class="eyebrow">热点事件 · ${esc(item.origin==='reference'?'模拟事件场景':'公开资料快照')}</span><h1>${esc(item.title)}</h1><div class="event-detail-meta"><span>${esc(item.date||'日期未获取')}</span>${source}</div></header><section class="event-detail-section"><h2>事件总结</h2><p>${esc(summary)}</p></section><section class="event-detail-section"><h2>为什么值得关注 <small class="hotspot-demo-label">模拟解读</small></h2><p>${esc(interpretation)}</p><h3>后续看什么</h3><p>${esc(watch)}</p></section><section class="event-detail-section"><h2>事件关联个股</h2><p class="hotspot-selection-intro">关联标的和事件将自动带入追踪设置。</p>${hotspotRelatedView(item.id,issue.id,false)}</section><section class="event-detail-track"><div class="event-track-copy"><span class="eyebrow">闪电猫 · 个股事件追踪</span><h2>这件事有进展时，提醒我</h2><p>追踪对象和条件已准备好，只需确认提醒频率和提醒方式。</p></div>${status}<div class="event-detail-actions"><button class="button primary" type="button" data-event-track="${esc(item.id)}">${tracking?'修改提醒设置':'追踪这条事件'}</button>${tracking?`<button class="button" type="button" data-event-stop="${esc(item.id)}">停止本组追踪</button>`:''}</div><p class="flow-small">只保存本地设置，尚未运行后台监控或通知；保存不产生触发记录。</p></section></article>`,'event-detail');route=r;
}
showBriefNews=function(id,issue){showTrackedEvent(eventRoute(id,issue.id));};
const eventReminderChannels=['工作台标记 + 消息提醒','仅工作台标记','工作台标记 + 消息提醒 + 声音'];
function eventTrackingAssistant(id){
 if(researchDemo.isCase(id)){researchTrackingUI.configure();return;}
 const issue=issueFromId(route.issueId)||briefSnapshot().displayed,found=trackedEvent(eventRoute(id,issue.id));if(!found)return;
 const current=eventTracking[id],value=eventTrackingValue(id,current,found),title=found.item.title;
 const stocks=current?eventTrackingStocks(current):hotspotRelatedStocks(id).map(x=>x.q);
 const valid=stocks.length>0&&(!current||eventTrackingActive(current));
 const presetFocus={'2490095':'客户适配与实际交付','2490104':'延后订单补发与季度议价'};
 const draft=current?{...current}:{...value,securities:stocks.map(opSecurityKey),focus:presetFocus[id]||'',channel:eventReminderChannels[0]};
 let channel=current?.channel==='工作台内提醒'?'仅工作台标记':current?.channel||eventReminderChannels[0];
 const condition=(draft.scope==='同类事件'?'与上述标的相关的“'+(draft.eventType||value.eventType)+'”有新消息时提醒':title+'有后续进展')+(draft.focus?'；关注'+draft.focus:'');
 setContext({kind:'event-tracking',company:stocks.map(q=>q.name).join('、')||'事件追踪',eventId:id,question:'设置事件提醒',source:title});openAssistant();
 $('#assistantContent').innerHTML=`<h2 class="assistant-greeting">追踪设置</h2><p class="assistant-copy">已带入追踪内容，确认提醒设置即可。</p><form id="eventTrackForm" class="event-track-form event-simple-form"><section class="event-track-summary"><span class="event-setting-label">追踪对象</span><div class="event-fixed-stocks">${stocks.map(q=>`<div><strong>${esc(q.name)}</strong>${q.code?`<small>${esc(q.code)}</small>`:''}</div>`).join('')||'<p>暂未确认关联标的</p>'}</div><div class="event-fixed-condition"><span class="event-setting-label">追踪条件</span><p>${esc(condition)}</p></div></section>${!valid?'<p class="flow-error">'+(current?'旧设置缺少完整标的信息，已保留原记录。请从有明确标的的新闻重新发起追踪。':'这条新闻尚无明确关联标的，暂不能设置个股事件追踪。')+'</p>':''}<fieldset class="event-frequency"><legend>提醒频率</legend>${['持续提醒','仅提醒一次'].map(f=>`<label><input type="radio" name="frequency" value="${f}" ${value.frequency===f?'checked':''}><span>${f}</span></label>`).join('')}</fieldset><div class="event-method"><span class="event-setting-label" id="eventMethodLabel">提醒方式</span><button type="button" id="eventReminderMethod" aria-labelledby="eventMethodLabel eventMethodValue" aria-haspopup="dialog"><span id="eventMethodValue">${esc(channel)}</span>${icon('chevron-down')}</button></div><p id="eventTrackError" class="flow-error" role="alert"></p><div class="flow-actions"><button class="button primary" type="submit" ${valid?'':'disabled'}>${current&&!current.demo?'保存修改':'确认追踪'}</button><button class="button" type="button" data-event-cancel>取消</button></div><p class="event-demo-note">演示设置，仅保存本地偏好；不会发送通知或播放声音。</p></form>`;
 const form=$('#eventTrackForm');
 if(current)form.insertAdjacentHTML('beforeend',`<button class="text-action bell-stop" type="button" data-event-stop="${esc(id)}">停止这条事件追踪</button>`);
 $('#eventReminderMethod').onclick=()=>{
  const options=eventReminderChannels.includes(channel)?eventReminderChannels:[channel,...eventReminderChannels];
  openModal('提醒方式',`<form id="eventMethodForm"><fieldset class="event-channel-options"><legend class="sr-only">选择提醒方式</legend>${options.map((c,i)=>`<label><input type="radio" name="channel" value="${i}" ${c===channel?'checked':''}><span>${esc(c)}</span></label>`).join('')}</fieldset><div class="flow-actions"><button type="submit" class="button primary">确定</button><button type="button" id="eventMethodCancel" class="button">取消</button></div></form>`,'事件追踪');
  $('#eventMethodCancel').onclick=closeModal;
  $('#eventMethodForm').onsubmit=e=>{e.preventDefault();channel=options[Number(e.currentTarget.elements.channel.value)];$('#eventMethodValue').textContent=channel;closeModal();};
 };
 form.onsubmit=e=>{
  e.preventDefault();if(!valid)return;
  const next={...draft,frequency:form.elements.frequency.value,channel,demo:false};
  if(!saveEventTracking({...eventTracking,[id]:next})){$('#eventTrackError').textContent='未能保存，请重试。原追踪设置未改变。';return;}
  if(typeof trackingCenter!=='undefined')trackingCenter.activateMine();
  eventTrackingRefresh();
  $('#assistantContent').innerHTML=`<div class="flow-success-mark">${icon('check')}</div><h2 class="assistant-greeting">追踪设置已保存</h2><p class="assistant-copy">${esc(stocks.map(q=>q.name).join('、'))}</p><p class="assistant-copy">${esc(condition)}</p><div class="event-saved-settings"><span>${esc(next.frequency)}</span><span>${esc(next.channel)}</span></div><div class="flow-actions"><button class="button" type="button" data-event-track="${esc(id)}">修改提醒设置</button><button class="button primary" type="button" data-event-manage>管理追踪</button></div><p class="event-demo-note">演示设置，仅保存本地偏好；不会发送通知或播放声音。</p>`;
  $('#assistantContent').scrollTop=0;toast('追踪设置已保存');
 };
 $('#assistantContent').scrollTop=0;
}
function eventTrackingRow(id,value,issueId,manager=false){
 const found=trackedEvent(eventRoute(id,issueId));if(!found)return '';
 const stocks=eventTrackingStocks(value),active=eventTrackingActive(value);
 return `<article class="${manager?'review-tracking-row':'trigger-entry'}" data-event-record="${esc(id)}"><div class="flow-meta">${badge(eventTrackingLabel(value),active&&!value.demo?'good':'')}</div><h3>${stocks.length?stocks.map(q=>opportunitySecurity(opSecurityKey(q))?opLink(esc(q.name),opQuoteRoute(opSecurityKey(q),issueId)):esc(q.name)).join('、'):'待选择个股'}</h3><p>${esc(eventTrackingDescription(id,value,found))}</p><p class="flow-small">事件背景：${esc(found.item.title)}</p><small>${esc(value.frequency||'频率待确认')} · ${esc(value.channel||'工作台内提醒')}</small><div class="flow-actions"><button class="${manager?'button':'text-action'}" data-event-track="${esc(id)}">${active?'修改设置':'查看设置'}</button>${opLink('查看原事件',eventRoute(id,issueId),manager?'button':'text-action')}${manager?`<button class="text-action" data-event-stop="${esc(id)}">停止本组追踪</button>`:''}</div></article>`;
}
const eventTrackingBaseStockBody=stockBody;
stockBody=function(){
 if(stockTab!=='触发')return eventTrackingBaseStockBody().replace('<span>关注清单预览</span>','<button data-stock-tab="触发">触发</button><span>关注清单预览</span>');
 const issue=briefSnapshot().displayed,watching=Object.entries(eventTracking).filter(([,v])=>v),legacy=watching.filter(([,v])=>!eventTrackingActive(v)).length;
 const example=`<article class="trigger-entry"><div class="flow-meta">${badge('演示触发','accent')}<span>固定交互示例 · 非真实提醒</span></div><h3>海光信息 · 端侧芯片产品发布</h3><p>演示围绕具体股票查看相关事件的路径。当前未监控，未新增市场事实。</p>${opLink('查看原事件 '+icon('arrow-up-right'),eventRoute(eventTrackingExampleId,issue.id),'text-action')}</article>`;
 return `<div class="stock-body trigger-body"><div class="table-tabs"><button data-stock-tab="自选股">自选股</button><button data-stock-tab="持仓">持仓</button><button class="selected" data-stock-tab="触发">触发</button><span>原型追踪</span></div><div class="trigger-section-head"><h3>今日触发</h3><small>原型示例，不代表真实监测</small></div>${example}<div class="trigger-section-head"><h3>监控中</h3><small>${watching.length-legacy} 项明确个股${legacy?' · '+legacy+' 项待补个股':''}</small></div>${watching.length?watching.map(([id,value])=>eventTrackingRow(id,value,issue.id)).join(''):'<p class="data-message">还没有个股事件追踪。从新闻或事件详情确认提醒设置。</p>'}</div>`;
};
function eventTrackingRefresh(){
 if(route.type==='event-detail')showTrackedEvent(route);
 else if(route.type==='opportunities')showOpportunities(route,true);
 else if(route.type==='brief-quote')briefQuote(route.code||route.company,issueFromId(route.issueId)||briefSnapshot().displayed);
 renderWidgets();if(route.type==='tasks')showTasks();
}
// Detail checkboxes only change the draft. Storage changes only in the assistant submit handler.
 document.addEventListener('change',e=>{const input=e.target.closest('[data-event-select-stock]');if(!input)return;const id=input.dataset.eventSelectStock,key=input.value,keys=new Set(eventSelectedSecurities[id]||[]);if(input.checked)keys.add(key);else keys.delete(key);eventSelectedSecurities[id]=[...keys];const count=$('#eventSelectionCount');if(count)count.textContent='已选 '+keys.size+' 只个股';});
document.addEventListener('click',e=>{
 const start=e.target.closest('[data-event-track]');if(start){const id=start.dataset.eventTrack;eventTrackingAssistant(id,route.type==='event-detail'&&route.eventId===id?eventSelectedSecurities[id]:undefined);return;}
 const stop=e.target.closest('[data-event-stop]');if(stop){const id=stop.dataset.eventStop;if(researchDemo.isCase(id)){researchTrackingUI.stop();return;}const next={...eventTracking};delete next[id];if(!saveEventTracking(next))return;if(context?.kind==='event-tracking'&&context.eventId===id){context=null;assistantDefault();}eventTrackingRefresh();toast('已停止这组个股事件追踪');return;}
 if(e.target.closest('[data-event-cancel]')){context=null;assistantDefault();closeAssistant();toast('已取消，原追踪设置未改变');return;}
 if(e.target.closest('[data-event-manage]')){closeAssistant();taskTab='tasks';showTasks();return;}
 if(e.target.closest('[data-event-open-triggers]')){closeAssistant();showReviewAccount('triggers');}
});
