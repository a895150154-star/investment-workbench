/* Shared morning/evening report prototype. Time selects preview issues only. */
const BRIEF_KEY = 'vra-design-today-v2-brief-schedule';
let briefSchedule = {morning:'08:00', evening:'18:00'};
try {
  const saved = JSON.parse(localStorage.getItem(BRIEF_KEY));
  if(saved && /^(?:[01]\d|2[0-3]):[0-5]\d$/.test(saved.morning) && /^(?:[01]\d|2[0-3]):[0-5]\d$/.test(saved.evening) && saved.morning < saved.evening) briefSchedule = saved;
} catch {}
let briefClock = '', briefStatus = 'ready', briefStamp = '', selectedIssue = null;
const periodName = period => period === 'morning' ? '早报' : '晚报';
function beijingClock() {
  const parts = Object.fromEntries(new Intl.DateTimeFormat('en-CA', {timeZone:'Asia/Shanghai',year:'numeric',month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit',hourCycle:'h23'}).formatToParts(new Date()).map(p=>[p.type,p.value]));
  return `${parts.year}-${parts.month}-${parts.day}T${parts.hour}:${parts.minute}`;
}
function shiftedDate(day, offset) {
  const d = new Date(day+'T12:00:00Z');
  d.setUTCDate(d.getUTCDate()+offset);
  return d.toISOString().slice(0,10);
}
function reportIssue(day, period) {return {id:`${day}_${period}`,day,period};}
function issueFromId(id) {
  if(typeof id !== 'string' || !/^\d{4}-\d{2}-\d{2}_(morning|evening)$/.test(id)) return null;
  const [day,period]=id.split('_');return reportIssue(day,period);
}
function briefSnapshot() {
  const clock=briefClock || beijingClock(), [day,time]=clock.split('T');
  const target = time >= briefSchedule.evening ? reportIssue(day,'evening') : time >= briefSchedule.morning ? reportIssue(day,'morning') : reportIssue(shiftedDate(day,-1),'evening');
  const previous = target.period==='evening' ? reportIssue(target.day,'morning') : reportIssue(shiftedDate(target.day,-1),'evening');
  return {clock, target, displayed:briefStatus==='ready'?target:previous};
}
function issueLabel(issue) {return `${issue.day.replaceAll('-','.')} · ${periodName(issue.period)}`;}
function issueEvents(issue) {
  return issue.period==='morning' ? eventData : [{...eventData[0],title:'回看扩产公告：订单与资金仍是核验重点',description:'回顾本期关注的问题，尚缺的信息继续保留为观察点。'}, {...eventData[1],title:'回看行业成本：需要继续核对公司的实际传导',description:'归纳本期关注事项，区分已知事实与仍待验证的判断。'}];
}
function dateButton(issue) {return `<button class="brief-date" data-brief-history aria-label="查看简报历史，当前${issueLabel(issue)}">${icon('history')}<span>${issue.day.slice(5).replace('-','.')}</span>${icon('chevron-down')}</button>`;}
function briefStatusNotice() {
  if(briefStatus==='ready') return '';
  const s=briefSnapshot();
  return `<div class="brief-status ${briefStatus}" role="status"><strong>${issueLabel(s.target)}${briefStatus==='pending'?'正在整理':'生成失败'}</strong><span>${briefStatus==='pending'?'新一期准备好后，可返回今日总览查看。':'新一期暂不可用。'}当前保留 ${issueLabel(s.displayed)}。</span></div>`;
}
briefBody=function() {
  const issue=briefSnapshot().displayed;
  return briefStatusNotice()+briefOverview(issue);
};
const briefPreviousFooter=widgetFooter;
widgetFooter=function(id) {
  if(id!=='brief')return briefPreviousFooter(id);
  const issue=briefSnapshot().displayed;
  return `<span>随时段更新 · 历史简报从日期查看</span><button data-open-brief>阅读完整${periodName(issue.period)} ${icon('arrow-up-right')}</button>`;
};
function decorateBrief() {
  const widget=$('[data-widget="brief"]');if(!widget)return;
  const s=briefSnapshot(),issue=s.displayed;
  widget.querySelector('.widget-title>.icon').outerHTML=icon(issue.period==='morning'?'sunrise':'sunset');
  const subtitles=widget.querySelectorAll('.widget-sub');
  subtitles[0].textContent=`${issue.day===s.clock.slice(0,10)?'今日':issue.day.slice(5).replace('-','.')} ${periodName(issue.period)}`;
  if(subtitles[1]) subtitles[1].textContent=briefStatus==='ready'?'有简报可读':briefStatus==='pending'?'新一期整理中':'新一期生成失败';
  widget.querySelector('.widget-tools').insertAdjacentHTML('afterbegin',dateButton(issue));
  widget.querySelector('[data-brief-history]').onclick=()=>historyModal();
}
const briefPreviousRender=renderWidgets;
renderWidgets=function(){state.period=briefSnapshot().displayed.period;briefPreviousRender();decorateBrief();};
syncPeriod=function() {
  const s=briefSnapshot();
  $('.scenario').textContent=briefClock?'时段演示':'北京时间';
  $('.dayline>span:first-child').innerHTML=`<span class="status-dot"></span>${s.clock.slice(0,10).replaceAll('-','.')}`;
  $('.dayline>span:nth-child(2)').textContent=briefStatus==='ready'?`${periodName(s.displayed.period)}预览 · ${s.displayed.day.slice(5).replace('-','.')}`:briefStatus==='pending'?'新一期简报整理中':'新一期简报生成失败';
};
function refreshBrief(force=false) {
  const s=briefSnapshot(),stamp=[s.target.id,briefStatus,briefClock?'demo':'real',s.clock.slice(0,10)].join('|');
  if(!force&&stamp===briefStamp)return;
  briefStamp=stamp;state.period=s.displayed.period;
  // Replace only the report card so other open components retain their interaction state.
  const old=$('[data-widget="brief"]');
  if(old){
    old.querySelector('.widget-body').innerHTML=briefBody();
    old.querySelector('.widget-footer').innerHTML=widgetFooter('brief');
    old.querySelector('[data-brief-history]')?.remove();
    decorateBrief();
    old.querySelector('[data-open-brief]').onclick=()=>showBrief();
    old.querySelectorAll('[data-research]').forEach(b=>b.onclick=()=>startResearch(Number(b.dataset.research)));
  }
  syncPeriod();
}
historyModal=function() {
  const s=briefSnapshot(), issues=[];
  for(let offset=0;offset<4;offset++)for(const period of ['evening','morning']){
    const issue=reportIssue(shiftedDate(s.target.day,-offset),period);
    if(issue.day<s.target.day || issue.period===s.target.period || s.target.period==='evening')issues.push(issue);
  }
  // Each day is already ordered evening first, then morning.
  const available=issues;
  const chosen=activeView==='brief'?selectedIssue?.id:s.displayed.id;
  openModal('历史简报',`<p>早报与晚报按时间排列，点击即可阅读对应一期。</p><div class="brief-history">${available.map(issue=>{
    const unavailable=issue.id===s.target.id&&briefStatus!=='ready';
    return `<button class="brief-history-row ${chosen===issue.id?'selected':''}" data-issue="${issue.id}" ${unavailable?'disabled':''}><span class="history-period">${icon(issue.period==='morning'?'sunrise':'sunset')}</span><span><strong>${issueLabel(issue)}</strong><small>${unavailable?(briefStatus==='pending'?'正在整理':'生成失败，暂无正文'):issue.period==='morning'?'市场背景、个人相关事件与盘前观察':'当日事件回顾与后续核验事项'}</small></span><span class="history-state">${unavailable?'':chosen===issue.id?'正在阅读':icon('chevron-right')}</span></button>`;
  }).join('')}</div><p class="flow-small">历史列表用于体验跨期阅读；正文展示固定日期资料快照，并非对应期次的归档报告。</p>`,'个人简报 / 历史记录');
  $$('[data-issue]').forEach(b=>b.onclick=()=>{const id=b.dataset.issue;closeModal();showBrief(id);});
};
showBrief=function(id) {
  const issue=issueFromId(id)||briefSnapshot().displayed;
  selectedIssue=issue;
  const morning=issue.period==='morning';
  $('#briefView').innerHTML=`<button class="back-button" id="backOverview">${icon('arrow-left')}返回今日总览</button><article class="detail-sheet"><header class="detail-cover"><div class="brief-detail-top"><span class="eyebrow">个人简报 / ${periodName(issue.period)}</span>${dateButton(issue)}</div><h1>${morning?'今天的资讯，从与你有关的开始。':'今日晚报 · 收盘之后，看清变化。'}</h1><p>${issueLabel(issue)} · 闪电猫解读 · 固定资料</p><p>${morning?'应用与硬件线索放在一起读，公司事项与经营进展分开看。':'先回顾个人标的表现、原因与证据、下一交易日观察，再结合市场背景。'}</p></header>${briefDocument(issue)}<footer class="paper-foot"><button class="button" id="briefBackTop">${icon('arrow-up')}回到简报顶部</button></footer></article>`;
  switchView('brief');route={type:'brief',issueId:issue.id};assistantDefault();
  $('#backOverview').onclick=home;
  $('#briefBackTop').onclick=()=>{$('#briefView .detail-cover').scrollIntoView({block:'start'});const title=$('#briefView h1');title.tabIndex=-1;title.focus({preventScroll:true});};
  $$('#briefView [data-brief-history]').forEach(b=>b.onclick=()=>historyModal());
  $$('#briefView [data-research]').forEach(b=>b.onclick=()=>startResearch(Number(b.dataset.research)));
};
const briefPreviousEdit=editWidget;
editWidget=function(id) {
  briefPreviousEdit(id);if(id!=='brief')return;
  const form=$('#editForm'), originalSubmit=form.onsubmit;
  form.querySelector('.sample-notice').insertAdjacentHTML('beforebegin',`<fieldset class="brief-schedule"><legend>展示切换时间 · 北京时间</legend><div class="brief-time-fields"><label class="field"><span>切换为早报</span><input type="time" name="morning" value="${briefSchedule.morning}" required></label><label class="field"><span>切换为晚报</span><input type="time" name="evening" value="${briefSchedule.evening}" required></label></div><p class="flow-small">晚报展示至次日早报时段。新一期尚未就绪时保留上一期，并说明状态。</p></fieldset>`);
  form.onsubmit=e=>{
    e.preventDefault();const f=new FormData(form),morning=f.get('morning'),evening=f.get('evening');
    if(morning>=evening){toast('早报切换时间需早于晚报');return;}
    if(!f.getAll('segment').length){toast('请至少保留一类摘要内容');return;}
    briefSchedule={morning,evening};
    try{localStorage.setItem(BRIEF_KEY,JSON.stringify(briefSchedule));}catch{toast('时间设置仅在本次会话有效');}
    originalSubmit(e);refreshBrief(true);
  };
};
const briefPreviousDesign=previewDesign;
function mountBriefDemoClock() {
  if($('#briefDemoClock'))return;
  $('#modalBody').insertAdjacentHTML('afterbegin',`<section class="brief-demo"><h3>早晚报时段演示</h3><p class="flow-small">仅模拟展示，不生成报告或创建定时任务。清空时间即跟随真实北京时间。</p><label class="field"><span>模拟北京时间（可留空）</span><input type="datetime-local" id="briefDemoClock" value="${briefClock}"></label><label class="field"><span>当前期内容状态</span><select id="briefDemoStatus"><option value="ready" ${briefStatus==='ready'?'selected':''}>已准备好</option><option value="pending" ${briefStatus==='pending'?'selected':''}>正在整理</option><option value="failed" ${briefStatus==='failed'?'selected':''}>生成失败</option></select></label><div class="modal-actions"><button class="button" id="briefRealClock">恢复实时展示</button><button class="button primary" id="briefApplyClock">应用时段演示</button></div></section>`);
  $('#briefApplyClock').onclick=()=>{const input=$('#briefDemoClock');if(!input.checkValidity()){input.reportValidity();return;}briefClock=input.value;briefStatus=$('#briefDemoStatus').value;refreshBrief(true);closeModal();toast('已更新首页时段，保留正在阅读的历史期与组件收起状态');};
  $('#briefRealClock').onclick=()=>{briefClock='';briefStatus='ready';refreshBrief(true);closeModal();toast('已恢复按北京时间展示');};
}
previewDesign=function(){briefPreviousDesign();mountBriefDemoClock();};
$('#designNotes').onclick=previewDesign;
renderWidgets();refreshBrief(true);
// Report updates run only at initialization or after an explicit user action.
// Idle time, window focus and visibility never redraw the reading page.

if(location.hash==='#brief')showBrief();

assistantDefault();
