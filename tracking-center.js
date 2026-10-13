/* Stock tracking demo: one manager and one card per stock; no live monitoring. */
let trackingSignalKey='';
const trackingCenter=(()=>{
 const sample=new Map([['300429',{status:'active',frequency:'持续提醒',channel:'工作台消息'}]]);
 const condition=q=>`${q.name}发布新公告或出现新资讯`;
 function entries(){return [...sample].map(([key,item])=>({key,item,q:opportunitySecurity(key)})).filter(row=>row.q);}
 function signals(){return [];}
 function content(){
  const rows=entries(),today=taskTab==='notices';
  return `<section class="tc-center"><div class="tc-toolbar"><nav class="tc-tabs" role="tablist" aria-label="追踪管理栏目"><button role="tab" id="tc-today" aria-controls="tc-panel" aria-selected="${today}" tabindex="${today?0:-1}" data-tc-tab="notices">今日触发 <span>0</span></button><button role="tab" id="tc-monitor" aria-controls="tc-panel" aria-selected="${!today}" tabindex="${today?-1:0}" data-tc-tab="tasks">盯盘 <span>${rows.length}</span></button></nav><button class="button" data-tc-add>添加盯盘标的</button></div><p class="tc-boundary">示例数据 · 有新公告、新消息时提醒，尚未接入实时监控与消息推送。</p><div id="tc-panel" role="tabpanel" aria-labelledby="${today?'tc-today':'tc-monitor'}">${today?`<div class="tc-empty">${icon('bell')}<h3>今日暂无触发</h3><p>标的发布新公告或出现新资讯时，将在这里显示提醒。</p><button class="button" data-tc-tab="tasks">查看盯盘</button></div>`:rows.length?`<div class="tc-stock-cards">${rows.map(({key,q,item})=>`<article class="tc-stock-card" data-tracking-key="${key}"><header><div><h2>${esc(q.name)} <small>${esc(q.code)}</small></h2><span class="tc-stock-kind">标的追踪</span></div><span class="tc-stock-state ${item.status==='paused'?'is-paused':''}">${item.status==='paused'?'已暂停':'追踪中'}</span></header><div class="tc-stock-condition"><span>提醒条件</span><p>${esc(condition(q))}</p></div><p class="tc-stock-frequency">${esc(item.frequency)} · ${esc(item.channel)}</p><footer><button class="text-action" data-tc-edit="${key}">修改设置</button><button class="text-action" data-tc-pause="${key}">${item.status==='paused'?'恢复追踪':'暂停追踪'}</button><button class="text-action" data-tc-stop="${key}">停止追踪</button></footer></article>`).join('')}</div>`:`<div class="tc-empty">${icon('bell')}<h3>暂无盯盘标的</h3><p>添加一只股票，在有新公告、新消息时提醒你。</p><button class="button" data-tc-add>添加盯盘标的</button></div>`}</div></section>`;
 }
 function render(){
  page('追踪管理',back()+head('持续关注','追踪管理','管理关注的股票，有新公告、新消息时提醒你。')+content(),'tasks');
  route={type:'tasks',tab:taskTab};
 }
 function open(){taskTab='tasks';trackingSignalKey='';showTasks();}
 function configure(key='300429',adding=false){
  const choices=opportunityQuotes.filter(q=>q.type==='stock'&&q.code),q=opportunitySecurity(key)||choices[0];if(!q)return;
  const record=sample.get(opSecurityKey(q))||{frequency:'持续提醒',channel:'工作台消息'};
  setContext({kind:'stock-tracking-demo',company:q.name,code:opSecurityKey(q)});taskDraft={kind:'stock-tracking-demo'};openAssistant();
  $('#assistantContent').innerHTML=`<h2 class="assistant-greeting">${adding?'添加盯盘标的':'修改追踪设置'}</h2><form id="tcStockForm" class="ed-strategy"><label class="ed-strategy-field"><span>追踪标的</span>${adding?`<select name="security">${choices.map(s=>`<option value="${esc(opSecurityKey(s))}" ${opSecurityKey(s)===opSecurityKey(q)?'selected':''}>${esc(s.name)} · ${esc(s.code)}</option>`).join('')}</select>`:`<strong>${esc(q.name)} · ${esc(q.code)}</strong><input type="hidden" name="security" value="${esc(opSecurityKey(q))}">`}</label><div class="ed-strategy-field"><span>提醒条件</span><p id="tcStockCondition">${esc(condition(q))}</p></div><label class="ed-strategy-field"><span>提醒频率</span><select name="frequency">${['持续提醒','仅提醒一次'].map(v=>`<option ${record.frequency===v?'selected':''}>${v}</option>`).join('')}</select></label><label class="ed-strategy-field"><span>提醒方式</span><select name="channel">${['工作台消息','自选标记 + 工作台消息'].map(v=>`<option ${record.channel===v?'selected':''}>${v}</option>`).join('')}</select></label><button type="submit" class="ed-confirm-monitor">确认盯盘</button><button type="button" class="text-action" data-tc-cancel>取消</button><p class="ed-assistant-note">仅调整本次示例，不运行真实监控。</p></form>`;
  $('#assistantContent').scrollTop=0;
  const form=$('#tcStockForm');form.onchange=()=>{$('#tcStockCondition').textContent=condition(opportunitySecurity(new FormData(form).get('security')));};
  form.onsubmit=e=>{e.preventDefault();const data=new FormData(form),code=data.get('security'),stock=opportunitySecurity(code);if(!stock||stock.type!=='stock')return;sample.set(code,{status:'active',frequency:data.get('frequency'),channel:data.get('channel')});taskDraft=null;if(route.type==='tasks')showTasks();setContext({kind:'stock-tracking-demo',company:stock.name,code});$('#assistantContent').innerHTML=`<div class="flow-success-mark">${icon('check')}</div><h2 class="assistant-greeting">已加入我的追踪</h2><p class="assistant-copy">${esc(stock.name)} · 发布新公告或出现新资讯</p><a class="button primary" href="#/tracking?tab=tasks">查看我的追踪 ${icon('arrow-up-right')}</a><p class="ed-assistant-note">示例数据 · 尚未运行实时监控。</p>`;toast('已更新标的追踪示例');};
 }
 return {render,open,entries,signals,configure,edit:configure,setFilter(){},activateMine(){},get mode(){return 'demo';},set mode(value){},pause(key){const item=sample.get(key);if(item)item.status=item.status==='paused'?'active':'paused';},stop(key){sample.delete(key);}};
})();
showTasks=function(){trackingCenter.render();};
const tcPreviousAccount=showReviewAccount;
showReviewAccount=function(tab){if(tab==='triggers'){taskTab='notices';showTasks();return;}tcPreviousAccount(tab);};
const tcPreviousStockBody=stockBody;
stockBody=function(){if(stockTab!=='触发')return tcPreviousStockBody();return `<div class="stock-body"><div class="table-tabs"><button data-stock-tab="自选股">自选股</button><button data-stock-tab="持仓">持仓</button><button class="selected" data-stock-tab="触发">触发</button></div><h3>追踪与触发</h3><p class="flow-small">在追踪管理中查看今日提醒与盯盘标的。</p><div class="flow-actions"><button class="button" data-tc-tab="notices">今日触发</button><button class="button" data-tc-tab="tasks">盯盘</button></div></div>`;};
document.addEventListener('click',e=>{
 const b=e.target.closest('[data-tc-tab],[data-tc-edit],[data-tc-add],[data-tc-pause],[data-tc-stop],[data-tc-cancel]');if(!b)return;
 if(b.dataset.tcTab){taskTab=b.dataset.tcTab;context=null;taskDraft=null;showTasks();}
 if(b.dataset.tcEdit)trackingCenter.configure(b.dataset.tcEdit);
 if(b.hasAttribute('data-tc-add')){trackingCenter.open();trackingCenter.configure('300429',true);}
 if(b.dataset.tcPause){trackingCenter.pause(b.dataset.tcPause);showTasks();}
 if(b.dataset.tcStop){trackingCenter.stop(b.dataset.tcStop);context=null;taskDraft=null;showTasks();toast('已停止该标的追踪');}
 if(b.hasAttribute('data-tc-cancel')){context=null;taskDraft=null;assistantDefault();closeAssistant();}
});
document.addEventListener('keydown',e=>{if(!e.target.matches('.tc-tabs [role=tab]')||!['ArrowLeft','ArrowRight','Home','End'].includes(e.key))return;e.preventDefault();taskTab=e.key==='Home'?'notices':e.key==='End'?'tasks':taskTab==='notices'?'tasks':'notices';showTasks();document.querySelector(taskTab==='notices'?'#tc-today':'#tc-monitor').focus();});

document.addEventListener('submit',e=>{if(e.target.id!=='chatForm'||!['tasks','event-detail'].includes(route.type))return;const text=$('#chatInput').value.trim();if(!/提醒|追踪|跟踪|盯盘/.test(text))return;e.preventDefault();e.stopImmediatePropagation();const q=opportunityQuotes.find(q=>q.type==='stock'&&(text.includes(q.name)||text.includes(q.code)));$('#chatInput').value='';trackingCenter.configure(q?opSecurityKey(q):'300429',route.type==='event-detail');},true);
