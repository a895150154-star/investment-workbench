/* V3.0 final presentation layer. All installation follows legacy DOMContentLoaded patches. */
(() => {
function initialize(){
'use strict';
const D=window.overviewV3Data, SETTINGS='vra-overview-v3-settings', LAYOUT=KEY;
const legacyKeys={'688041':'event-haiguang','688146':'event-zctq'};
let preview=null,boardKind='industry',rendering=false,refreshing=false;
const expanded=new Map();
const read=(key,fallback)=>{try{const value=localStorage.getItem(key);return value===null?fallback:JSON.parse(value);}catch{return fallback;}};
let settings=read(SETTINGS,{});if(!settings||typeof settings!=='object'||Array.isArray(settings))settings={};
const actual=()=>['short','swing','long'].includes(briefPrefs.investmentHorizon)?briefPrefs.investmentHorizon:'unset';
const mode=()=>preview===null?actual():preview;
const issueNow=()=>issueFromId(route?.issueId)||selectedIssue||briefSnapshot().displayed;
const demoEmpty=()=>demoState==='new';
const dot='<span class="v3-dot" title="此数值为演示数据" aria-label="演示数据">●</span>';
const num=(v,suffix='')=>v===null||v===undefined?'—':`${esc(typeof v==='number'?v.toFixed(2):v)}${suffix}${dot}`;
const pct=v=>v===null||v===undefined?'—':`${v>0?'+':''}${num(v,'%')}`;
const qKey=s=>s.legacyKey||legacyKeys[s.code]||s.code;
const identity=q=>String(q?.code||Object.keys(legacyKeys).find(k=>legacyKeys[k]===q?.id)||q?.id||'');
function hasPortfolio(){try{return localStorage.getItem('vra-prototype-holdings-v1')!==null||localStorage.getItem('vra-prototype-v28-watchlist')!==null;}catch{return true;}}
function portfolio(){
 if(demoEmpty())return [];
 if(!hasPortfolio())return D.securities.map(s=>({...s,legacyKey:legacyKeys[s.code]||s.code,demoPortfolio:true}));
 const held=holdingsStore.identities();const holdCodes=new Set(held.map(s=>s.code));
 const watch=opportunityWatch.map(opportunitySecurity).filter(Boolean).filter(q=>!holdCodes.has(identity(q)));
 return [...held.map(s=>({...s,group:'holdings'})),...watch.map(q=>({...q,code:identity(q),group:'watchlist',legacyKey:opSecurityKey(q)}))].map(s=>{
 const data=D.securities.find(x=>x.code===s.code);
 return {...(data||{sector:'待补充',indices:[],themes:[],price:null,change:null,flow:null,sector20:0,weight:0}),...s,legacyKey:s.legacyKey||legacyKeys[s.code]||s.code,demoPortfolio:false};
 });
}
const eventTypesFor=code=>Array.isArray(settings[code]?.events)?settings[code].events.filter(x=>D.eventTypes.includes(x)):['公告','业绩','异动'];
const trackingFor=code=>settings[code]?.tracking||{enabled:code==='688041',templates:code==='688041'?[...D.templates]:[]};
function persist(code,patch){
 const next={...settings,[code]:{...settings[code],...patch}};
 try{localStorage.setItem(SETTINGS,JSON.stringify(next));settings=next;return true;}catch{toast('保存失败，原设置保留，请重试。');return false;}
}
const alertFor=n=>eventTypesFor(n.code).includes(n.type);
const headline=s=>D.stockNews.find(n=>n.code===s.code);
function ranked(){
 const rows=portfolio().map(s=>({...s,news:headline(s)}));
 return rows.sort((a,b)=>{
 const group=Number(b.group==='holdings')-Number(a.group==='holdings');if(group)return group;
 const fresh=Number(Boolean(b.news))-Number(Boolean(a.news));if(fresh)return fresh;
 if(mode()==='short')return Math.abs(b.change||0)-Math.abs(a.change||0)||Math.abs(b.flow||0)-Math.abs(a.flow||0);
 if(mode()==='swing')return (b.sector20||0)-(a.sector20||0);
 if(mode()==='long')return Number(['业绩','订单','研报观点'].includes(b.news?.type))-Number(['业绩','订单','研报观点'].includes(a.news?.type))||(b.weight||0)-(a.weight||0);
 return (b.news?.time||'').localeCompare(a.news?.time||'');
 });
}
function briefRows(){
 if(demoState==='quiet')return [];
 const list=ranked().filter(s=>s.news),holds=list.filter(s=>s.group==='holdings'),watch=list.filter(s=>s.group!=='holdings');
 if(mode()!=='unset')watch.sort((a,b)=>Number(alertFor(b.news))-Number(alertFor(a.news))||list.indexOf(a)-list.indexOf(b));
 return [...holds,...watch].slice(0,3);
}
function opening(n){const value=window.researchRisk?.current?.()||'unset',risk=({steady:'conservative',active:'aggressive'})[value]||value;return n.openings?.[risk]||n.openings?.balanced||n.analysis;}
function habitLine(s){
 if(mode()==='short')return `今日${s.change>0?'涨':'跌'}${num(Math.abs(s.change),'%')}，资金${s.flow>=0?'净流入':'净流出'}${num(Math.abs(s.flow),'亿元')}；${esc(s.anomaly)}。`;
 if(mode()==='swing')return `${esc(s.sector)}今日${pct(s.sectorToday)}，近20日板块${pct(s.sector20)}；标的近20日${pct(s.change20)}。`;
 if(mode()==='long')return `${esc(s.business)} ${esc(s.earnings)}；${esc(s.report)}。`;
 return esc(s.news?.title||'今天暂无新事件');
}
function emptyTargets(){return `<div class="v3-empty"><h3>添加标的</h3><p>把你关心的公司放进工作台，集中查看它们的变化。</p><button class="button" data-review-account="watchlist">去股票工作台添加</button></div>`;}
function membership(s){return `${s.group==='holdings'?'持仓':'自选'}${s.longTerm?' · 长期关注':''}`;}
function stateBadges(s){const t=trackingFor(s.code);if(!t.enabled)return '';return `<div class="v3-states">${t.templates.map(name=>`<span>${esc(name)}：${s.code==='688041'?D.timeline[0].statuses[D.templates.indexOf(name)]:'未触发'}</span>`).join('')}</div>`;}
function timeLine(){const defaultId=mode()==='short'?'prototype':mode()==='swing'?'delivery':'order';return `<section class="v3-timeline" aria-label="海光业务进展时间线"><h3>业务进展</h3>${D.timeline.map(n=>{const key=mode()+':'+n.id,open=expanded.has(key)?expanded.get(key):n.id===defaultId;return `<details data-v3-timeline="${n.id}" ${open?'open':''}><summary><time>${n.time}</time><span class="v3-timeline-title">${esc(n.title)}${dot}</span><span class="v3-timeline-status">${esc(n.headline)}</span></summary><div class="v3-timeline-detail"><p>${esc(n.explanation)}</p><p><strong>依据 · ${esc(n.source)}</strong></p><blockquote>${esc(n.quote)}${dot}</blockquote><p class="data-message">${D.templates.map((t,i)=>t+'：'+n.statuses[i]).join('；')}</p></div></details>`;}).join('')}</section>`;}
function stockNewsBody(){
 const rows=ranked();if(!rows.length)return emptyTargets();if(demoState==='quiet')return '<div class="v3-empty"><h3>你的标的今天平稳</h3><p>持仓和自选已保留，今天暂无新事件。</p></div>';
 return `<div class="v3-targets">${rows.map(s=>`<article class="v3-security-news" data-v3-security="${esc(s.code)}"><div class="v3-security-heading"><strong>${opportunitySecurity(qKey(s))?opLink(esc(s.name),opQuoteRoute(qKey(s),issueNow().id),'text-action'):esc(s.name)}</strong><small>${esc(s.code)}</small><span class="tag">${membership(s)}</span>${s.news&&alertFor(s.news)?'<span class="v3-alert">提醒</span>':''}<time>${s.news?.time||''}</time></div>${stateBadges(s)}${s.news?`<p class="v3-risk-opening">${esc(opening(s.news))}</p><p class="v3-event-line">${esc(s.news.title)}${dot}</p><p class="v3-habit-line">${habitLine(s)}</p><p class="data-message">同板块：${esc(s.sector)}</p>`:'<p>今天暂无新事件</p>'}${s.code==='688041'?`<details class="v3-haiguang" data-v3-haiguang><summary>查看海光进展 ${icon('chevron-down')}</summary>${timeLine()}<details class="v3-secondary"><summary>为什么推荐 · 历史解读</summary><p>长期关注海光信息；结合持仓与当天业务更新，继续核对订单、收入及回款。</p>${opLink('查看历史解读',eventRoute('2490095',issueNow().id),'text-action')}</details></details>`:s.news?`<details class="v3-secondary"><summary>展开分析与后续关注</summary><p><strong>分析</strong> ${esc(s.news.analysis)}</p><p><strong>后续关注</strong> ${esc(s.news.next)}</p></details>`:''}</article>`).join('')}</div>`;
}
function myTargets(issue,compact){
 const rows=briefRows();const all=portfolio();
 return `<section class="v3-my-targets brief-top" id="brief-my-targets"><h3>我的标的</h3>${!all.length?emptyTargets():demoState==='quiet'||!rows.length?'<p>你的标的今天平稳</p>':rows.map(s=>`<article class="brief-event v3-brief-stock" data-v3-brief-security="${s.code}"><div class="v3-security-heading"><strong>${esc(s.name)}</strong><span class="tag">${membership(s)}</span>${alertFor(s.news)?'<span class="v3-alert">提醒</span>':''}<time>${s.news.time}</time></div><p class="v3-risk-opening">${esc(opening(s.news))}</p><p class="v3-habit-line">${habitLine(s)}</p>${s.longTerm?'<p class="data-message">长期关注海光信息，持续核对业务落地。</p>':''}<button class="text-action" data-v3-jump="holdings-news" data-v3-focus="${s.code}">查看详情 ${icon('arrow-up-right')}</button>${!compact?`<details class="v3-secondary"><summary>展开分析与后续关注</summary><p><strong>分析</strong> ${esc(s.news.analysis)}</p><p><strong>后续关注</strong> ${esc(s.news.next)}</p></details>`:''}</article>`).join('')}</section>`;
}
function linksToMacro(){const targets=portfolio();return D.macro.map(m=>{
 const matches=targets.map(s=>{const sector=m.sectors.includes(s.sector);const index=s.indices?.find(i=>m.indices.includes(i));const theme=s.themes?.find(i=>m.themes.includes(i));return sector?{s,reason:'同板块：'+s.sector,rank:0}:index?{s,reason:'同指数：'+index,rank:1}:theme?{s,reason:'同主题：'+theme,rank:2}:null;}).filter(Boolean).sort((a,b)=>a.rank-b.rank);
 return {...m,matches};
 });}
function macroHTML(issue,compact=false){const entries=linksToMacro(),related=entries.filter(m=>m.matches.length);return `<section class="v3-macro" id="brief-related-macro">${compact?`<details><summary>和我有关的大势 <span>${esc(related[0]?.title||'市场保持分化')}${related[0]?' · '+esc(related[0].matches[0].reason):''}</span></summary>`:'<h2>和我有关的大势</h2>'}${related.map(m=>`<article class="brief-event"><h3>${esc(m.title)}</h3><p>${esc(m.text)} <span class="v3-link-reason">${esc(m.matches[0].reason)}</span></p></article>`).join('')}<p class="data-message">其他大势：市场指数涨跌互现，继续观察成交和上涨范围。</p>${compact?'</details>':''}</section>`;}
function onePage(){const rows=briefRows();const text=['我的标的',...rows.map(s=>`${s.name}（${s.code}，${membership(s)}）：${opening(s.news)} ${s.news.title}`),'','和我有关的大势',...linksToMacro().filter(m=>m.matches.length).flatMap(m=>m.matches.map(x=>`${x.s.name} → ${x.reason} → ${m.title}：${m.text}`)),'','业务进展依据'];
 if(portfolio().some(s=>s.code==='688041')&&trackingFor('688041').enabled)D.timeline.slice().reverse().forEach(n=>text.push(`${n.time} ${n.title}`,`状态：${D.templates.map((t,i)=>t+'：'+n.statuses[i]).join('；')}`,`依据：${n.source}，原句“${n.quote}”`,''));else text.push('没有已启用且命中资料的业务进展追踪。');
 if(!portfolio().length)text.splice(1,0,'还没有添加标的。');if(demoState==='quiet')text.splice(1,0,'你的标的今天平稳。');
 openModal('一页纸',`<pre class="v3-one-page">${esc(text.join('\n'))}</pre><div class="modal-actions"><button class="button" data-v3-close>关闭</button></div>`);}
briefOverview=function(issue){return `<div class="brief-cover-card v3-brief-overview">${myTargets(issue,true)}${macroHTML(issue,true)}<div class="v3-brief-bottom"><button class="text-action" data-v3-paper>一页纸 ${icon('files')}</button><button class="text-action" ${briefAttrs('read','',issue)}>阅读完整${periodName(issue.period)} ${icon('arrow-up-right')}</button></div></div>`;};
const documentBefore=briefDocument;
const oldMorning=[...briefSections],oldEvening=[...eveningSections];
briefSections.splice(0,briefSections.length,['my-targets','我的标的'],['related-macro','和我有关的大势'],['pulse','市场脉搏'],['themes','主题机会']);
eveningSections.splice(0,eveningSections.length,['my-targets','我的标的'],['related-macro','和我有关的大势'],['summary','市场背景'],['a-market','A 股市场'],['hk-market','港股市场']);
const savedSections=read(BRIEF_PREFS_KEY,{});
for(const p of ['morning','evening']){const allowed=briefSectionsFor({period:p}).map(([id])=>id);briefPrefs[p]=savedSections.overviewV3Sections===1&&Array.isArray(savedSections[p])?savedSections[p].filter(id=>allowed.includes(id)):['my-targets','related-macro',...briefPrefs[p].filter(id=>allowed.includes(id)&&!['my-targets','related-macro'].includes(id))];}
if(!savedSections.morningThemePreviewVersion&&!briefPrefs.morning.includes('themes'))briefPrefs.morning.push('themes');
const normalizeBefore=normalizeBriefPrefs;normalizeBriefPrefs=function(raw){return {...normalizeBefore(raw),overviewV3Sections:1,morningThemePreviewVersion:1};};
const prefsRenderBefore=renderBriefPreferences;renderBriefPreferences=function(...args){prefsRenderBefore(...args);const f=$('#briefPreferencesForm');if(!f)return;f.querySelector('#briefFocusField>span').textContent='相关研究的解读重点';f.querySelector('#briefFocusField').nextElementSibling.textContent='用于后续研究解读；工作台排序由投资习惯决定。';const risk=f.querySelector('#briefRiskEffect');risk.textContent='风险偏好只调整我的标的首句措辞，不改变内容和组件顺序。';f.querySelector('[name=riskPreference]').onchange=()=>{};};
function retainedSections(issue){
 const oldPrefs=briefPrefs[issue.period];briefPrefs[issue.period]=(issue.period==='morning'?oldMorning:oldEvening).map(([id])=>id);
 let html;try{html=documentBefore(issue);}finally{briefPrefs[issue.period]=oldPrefs;}
 const t=document.createElement('template');t.innerHTML=html;const allowed=(issue.period==='morning'?['pulse']:['summary','a-market','hk-market']).filter(id=>oldPrefs.includes(id));
 return allowed.map(id=>{const h=t.content.querySelector('#brief-'+id);if(!h)return '';const nodes=[h.outerHTML];let next=h.nextElementSibling;while(next&&!next.classList.contains('report-section-head')){nodes.push(next.outerHTML);next=next.nextElementSibling;}return nodes.join('');}).join('');
}
briefDocument=function(issue){return `<nav class="report-index" aria-label="完整简报目录">${briefSectionsFor(issue).filter(([id])=>briefPrefs[issue.period].includes(id)).map(([id,title])=>`<button ${briefAttrs('section',id,issue)}>${title}</button>`).join('')}</nav><div class="detail-body report-body v3-report">${briefPrefs[issue.period].includes('my-targets')?myTargets(issue,false):''}${briefPrefs[issue.period].includes('related-macro')?macroHTML(issue):''}<button class="text-action" data-v3-paper>一页纸 ${icon('files')}</button>${retainedSections(issue)}</div>`;};
function flowsBody(){if(window.boardMarket?.widgetBody)return window.boardMarket.widgetBody();const p=briefSnapshot().displayed.period;const related=new Set(portfolio().flatMap(s=>[s.sector,...s.themes]));return `<div class="v3-flows"><div class="v3-related-sectors">${[...new Set(portfolio().map(s=>s.sector))].filter(x=>x!=='待补充').map(name=>'<span>'+esc(name)+' · 你的标的在此板块</span>').join('')}</div><div class="flow-tabs" role="group" aria-label="板块资金分类">${['industry','concept'].map((k,i)=>`<button data-v3-board="${k}" class="${boardKind===k?'selected':''}" aria-pressed="${boardKind===k}">${i?'概念':'行业'}</button>`).join('')}<span class="data-message">${p==='morning'?'前一交易日':'当日收盘'}</span></div><div class="v3-board-grid">${D.boards[boardKind].map(([name,flow,change])=>`<div class="v3-board ${related.has(name)?'v3-related-board':''}"><strong>${name}</strong><span>主力净流入 <b class="${flow>=0?'editorial-up':'editorial-down'}">${flow>0?'+':''}${num(flow,'亿元')}</b></span><span>涨跌幅 ${pct(change)}</span>${related.has(name)?'<small>你的标的在此板块</small>':''}</div>`).join('')}</div><p class="data-message">各板块范围可能重叠，不能相加</p></div>`;}
function themesBody(){return `<div class="v3-themes">${D.themes.map(t=>`<article class="brief-event"><h3>${t.name}</h3><p>${t.look}</p><p class="data-message">关联个股：${t.stocks.map(c=>D.securities.find(s=>s.code===c)?.name).join('、')}</p><p>${opLink(t.etf.name,opQuoteRoute(t.etf.code,issueNow().id),'text-action')} ${num(t.etf.price,'元')}</p><p class="data-message">ETF提供组合观察视角，名称相近不等于业务覆盖完全相同。</p>${opLink('查看主题 '+icon('arrow-up-right'),opThemeRoute(t.id,issueNow().id),'text-action')}</article>`).join('')}</div>`;}
sectorBody=function(){return `<div class="sector-body editorial-sectors v3-industries">${D.industries.map(([title,id,copy])=>`<div>${opLink(title,opThemeRoute(id,issueNow().id),'flow-title-link')}<p>${copy}</p></div>`).join('')}</div>`;};
const eventBefore=window.eventWidgetBody;
window.eventWidgetBody=function(){let html=eventBefore();if(eventTab!=='events'||['empty','failed'].includes(demoState))return html;const t=document.createElement('template');t.innerHTML=html;const entries=[...t.content.querySelectorAll('.flow-event-row')];entries.slice(2).forEach(n=>n.remove());return t.innerHTML+eveningEvents.map(e=>`<article class="flow-event-row v3-added-event"><div class="flow-event-rail">${icon('radar')}</div><div><span class="tag">${e.tag}</span><h3>${opLink(e.title,eveningRoute('evening-event',e.id,issueNow()),'flow-title-link')}</h3><p>看点 · ${e.id==='battery-cost'?'原料涨价的影响取决于采购、库存和定价传导。':'交易临停反映价格波动，需与公司经营变化分开阅读。'}</p>${opLink('阅读事件解读 '+icon('arrow-up-right'),eveningRoute('evening-event',e.id,issueNow()),'text-action')}</div></article>`).join('');};
function trackControls(s){const t=trackingFor(s.code);return `<div class="v3-track-controls"><label><input type="checkbox" role="switch" data-v3-track="${esc(s.code)}" ${t.enabled?'checked':''}>追踪标的</label><button class="icon-button" data-v3-reminder="${esc(s.code)}" aria-label="${esc(s.name)}消息提醒" title="设置消息提醒">${icon('bell')}</button></div>`;}
function stockList(list,full=false){const holding=full?route.tab==='holdings':stockTab==='持仓';return list.length?`<div class="v3-stock-list">${list.map(s=>{const n=headline(s),r=read('vra-prototype-holdings-v1',{})?.items?.find(x=>x.code===s.code);return `<article class="v3-stock-row" data-v3-list-code="${esc(s.code)}"><div class="v3-stock-identity"><strong>${opportunitySecurity(qKey(s))?opLink(esc(s.name),opQuoteRoute(qKey(s),issueNow().id),'text-action'):esc(s.name)}</strong><small>${esc(s.code)} · ${membership(s)}</small>${full?`<small>${esc(s.sector)} · ${esc((s.indices||[]).join('、')||'指数待补充')} · ${esc((s.themes||[]).join('、')||'主题待补充')}</small>`:''}</div><div>${n&&demoState!=='quiet'&&alertFor(n)?'<span class="v3-alert">今日有提醒</span>':'<small>今日无提醒</small>'}<p>${num(s.price,'元')} <span class="${s.change>=0?'editorial-up':'editorial-down'}">${pct(s.change)}</span></p>${r?`<small>${esc(r.quantity)}股 · 成本 ${esc(r.cost||'未填写')}</small>`:''}</div>${full?trackControls(s):''}${full&&r?`<div class="v3-stock-edit"><button class="text-action" data-holding-edit="${s.code}">编辑</button><button class="text-action" data-holding-delete="${s.code}">删除</button></div>`:''}</article>`;}).join('')}</div>`:holding?'<div class="v3-empty"><p>还没有持仓记录</p><button class="button" data-holding-manual>手动添加持仓</button></div>':'<div class="v3-empty"><p>还没有自选标的</p><a class="button" href="#/opportunities?tab=themes">去机会浏览添加</a></div>';}
const remindCount=()=>demoState==='quiet'?0:ranked().filter(s=>s.news&&alertFor(s.news)).length;
const oldStock=stockBody;
stockBody=function(){if(stockTab==='触发')return oldStock();return `<div class="stock-body"><div class="table-tabs"><button data-stock-tab="自选股" class="${stockTab==='自选股'?'selected':''}">自选</button><button data-stock-tab="持仓" class="${stockTab==='持仓'?'selected':''}">持仓</button><span>今日提醒 ${remindCount()} 条</span></div>${stockList(portfolio().filter(s=>s.group===(stockTab==='持仓'?'holdings':'watchlist')))}<div class="review-stock-more"><button class="text-action" data-review-account="${stockTab==='持仓'?'holdings':'watchlist'}">管理名单与提醒</button></div></div>`;};
const oldAccount=showReviewAccount;
showReviewAccount=function(tab,trackingTab){const answer=oldAccount(tab,trackingTab);if(route.type!=='stock-workbench')return answer;const selected=route.tab;if(!['holdings','watchlist'].includes(selected))return answer;const list=portfolio().filter(s=>s.group===selected),panel=$('#workspace-panel');
 const intro=panel?.querySelector('.review-workspace-intro')?.outerHTML||'';
 const error=panel?.querySelector('.flow-error')?.outerHTML||'';if(panel)panel.innerHTML=intro+error+stockList(list,true)+(selected==='holdings'?'<button class="text-action" data-holding-template>下载空白持仓模板</button>':'');
 ['watchlist','holdings'].forEach(k=>{const note=$('#workspace-tab-'+k+' small');if(note)note.textContent=portfolio().filter(s=>s.group===k).length+' 只';});
 decorate();return answer;
};
function reminder(code){
 const s=portfolio().find(s=>s.code===code);if(!s)return;
 const legacy=opportunitySecurity(qKey(s));const q=legacy||{code:s.code,name:s.name,type:s.type||'stock'};
 // Existing form keeps all price, turnover, funds and technical conditions.
 securityTrackingView.configure(q);
 const form=$('#securityTrackForm');if(!form)return;
 let pending=[...eventTypesFor(code)];
 const originalSubmit=form.onsubmit;
 form.onsubmit=function(e){
 originalSubmit.call(this,e);
 if(!$('#securityTrackForm')){if(persist(code,{events:pending})){refreshViews();toast('提醒条件已保存');}}
 };
 const add=$('#bellAddCondition'),prior=add.onclick;
 add.onclick=function(...args){prior.apply(this,args);const picker=$('#bellConditionForm');if(!picker)return;
 picker.insertAdjacentHTML('afterbegin',`<fieldset class="v3-event-choices"><legend>提醒的事件类型</legend><div>${D.eventTypes.map(t=>`<label><input type="checkbox" data-v3-message-type value="${t}" ${pending.includes(t)?'checked':''}>${t}</label>`).join('')}</div><p class="data-message">所选类型出现新消息时，在我的标的动态中标记提醒。</p></fieldset>`);
 const submit=picker.onsubmit;picker.onsubmit=function(e){const next=[...picker.querySelectorAll('[data-v3-message-type]:checked')].map(n=>n.value);submit.call(this,e);if(!$('#modal').open){pending=next;form.requestSubmit();}};
 picker.querySelector('[type=submit]').textContent='保存提醒条件';
 };add.click();
}
// Register the V3 catalogue before reloading: legacy load() had filtered new ids.
const previousLayout=read(LAYOUT,null);
const oldCatalog=catalog.filter(w=>w.id!=='funds');
const specs=[...oldCatalog,{id:'sector-flows',icon:'chart-no-axes-combined',wide:true,desc:'行业与概念的资金变化'}];
catalog.splice(0,catalog.length,...Object.keys(D.names).map(id=>({...specs.find(w=>w.id===id),id,title:D.names[id]})));
const mapId=id=>id==='funds'?'sector-flows':id;
function migrate(){
 const legacy=previousLayout&&Array.isArray(previousLayout.order)?previousLayout:null;
 const raw=legacy?.overviewV3Layout?{...legacy,...legacy.overviewV3Layout}:legacy;
 const starting=raw?.order||state.order;
 const valid=new Set(Object.keys(D.names));
 state.order=[...new Set(starting.map(mapId).filter(id=>valid.has(id)))];
 state.pinned=(raw?.pinned||state.pinned||[]).map(mapId).filter(id=>valid.has(id));state.collapsed=(raw?.collapsed||state.collapsed||[]).map(mapId).filter(id=>valid.has(id));
 state.titles={...(raw?.titles||state.titles)};if(state.titles.funds)state.titles['sector-flows']=D.names['sector-flows'];delete state.titles.funds;
 Object.keys(state.titles).forEach(id=>{if(['资金观察','资金轮动','板块表现','市场脉搏'].includes(state.titles[id])||(id==='market'&&state.titles[id]==='大盘指数'))state.titles[id]=D.names[id];});
 if(raw?.overviewV3!==1){
 const legacyBaselines=[['brief','indexes','market','events','stocks','sectors','sector-flows'],['indexes','market','brief','events','stocks','sectors','sector-flows']];
 if(!state.profileOrderMode)state.profileOrderMode=legacyBaselines.some(a=>a.filter(id=>state.order.includes(id)).join('|')===state.order.join('|'))?'auto':'manual';

 state.overviewV3=1;
 }
}
migrate();
function order(){const base=state.profileOrderMode==='manual'?state.order:D.orders[mode()].filter(id=>state.order.includes(id));const pinned=base.filter(id=>id!=='brief'&&state.pinned.includes(id));return [...(base.includes('brief')?['brief']:[]),...pinned,...base.filter(id=>id!=='brief'&&!pinned.includes(id))];}
function newWidget(id,body){const w=catalog.find(w=>w.id===id),closed=state.collapsed.includes(id);return `<section class="widget ${w.wide?'wide':''} ${closed?'collapsed':''} ${state.pinned.includes(id)?'pinned':''}" data-widget="${id}"><header class="widget-head"><div class="widget-title">${icon(w.icon)}<h2>${esc(state.titles[id]||w.title)}</h2>${icon('pin','pin-indicator')}</div><div class="widget-tools"><button class="icon-button" data-collapse="${id}" aria-expanded="${!closed}" aria-label="${closed?'展开':'收起'}${w.title}">${icon('chevron-up','collapse-icon')}</button><button class="icon-button" data-menu="${id}" aria-label="${w.title}组件菜单" aria-expanded="false">${icon('ellipsis')}</button></div></header><div class="widget-body">${body}</div></section>`;}
function layoutNote(){const visual=[...$('#widgetGrid').children].filter(n=>n.dataset.widget||n.dataset.v3Guide).map(n=>n.dataset.v3Guide?'让工作台更懂你':D.names[n.dataset.widget]);const manual=state.profileOrderMode==='manual';return `<div id="profileLayoutNote" class="profile-layout-note v3-layout-note"><div>${manual?'<span>手动顺序</span><button class="text-action" data-v3-auto>按画像排序</button>':''}<details><summary>${manual?'查看当前顺序':'按画像排序'}</summary><small>当前顺序：${visual.join(' → ')}</small></details></div><p class="v3-annotation">${preview===null?'按已保存习惯':'对照预览'} · ${D.labels[mode()]}。${D.rules[mode()]}</p></div>`;}
const renderBefore=renderWidgets;
renderWidgets=function(...args){
 if(rendering)return;rendering=true;const savedOrder=state.order;
 try{state.order=savedOrder.filter(id=>!['holdings-news','sector-flows','themes-etf'].includes(id));renderBefore(...args);}finally{state.order=savedOrder;rendering=false;}
 const grid=$('#widgetGrid');if(!grid)return;
 const bodies={'sector-flows':flowsBody};
 Object.entries(bodies).forEach(([id,body])=>{if(state.order.includes(id))grid.insertAdjacentHTML('beforeend',newWidget(id,body()));});
 order().forEach(id=>{const n=grid.querySelector(`[data-widget="${id}"]`);if(n)grid.append(n);});
 if(mode()==='unset'){
 const guide=document.createElement('section');guide.className='widget wide v3-guide';guide.dataset.v3Guide='yes';guide.innerHTML='<h3>让工作台更懂你</h3><p>选择投资习惯，把你更关心的内容放在前面。</p><button class="button" data-v3-profile>设置投资习惯</button>';
 const before=grid.children[3];if(before)grid.insertBefore(guide,before);else grid.append(guide);
 }
 const old=$('#profileLayoutNote');if(old)old.outerHTML=layoutNote();else grid.insertAdjacentHTML('beforebegin',layoutNote());
 grid.querySelectorAll('[data-widget]').forEach((n,i)=>n.classList.toggle('v3-below-fold',i>3));
 bindWidgetEvents();decorate();
};
const menuBefore=menu;
menu=function(id){const saved=state.order;state.order=order();try{menuBefore(id);}finally{state.order=saved;}const node=$(`[data-widget="${id}"] .widget-menu`);if(node){const group=order().filter(x=>state.pinned.includes(x)===state.pinned.includes(id));if(id==='brief'){node.querySelector('[data-w-action="up"]')?.setAttribute('disabled','');node.querySelector('[data-w-action="down"]')?.setAttribute('disabled','');}else if(group.indexOf(id)===1&&group[0]==='brief')node.querySelector('[data-w-action="up"]')?.setAttribute('disabled','');}};
const saveBefore=save;save=function(){if(rendering)return;state.overviewV3=1;state.overviewV3Layout={order:[...state.order],pinned:[...state.pinned],collapsed:[...state.collapsed],titles:{...state.titles}};return saveBefore();};
save();
const addBefore=addModal;addModal=function(){addBefore();const reset=$('#restoreLayout');if(reset)reset.onclick=()=>{state={...defaults(),order:[...D.orders[actual()]],overviewV3:1,profileOrderMode:'auto',theme:state.theme};save();renderWidgets();addModal();};};
$('#addWidget').onclick=addModal;$('#addWidgetBottom').onclick=addModal;
function refreshViews(){
 if(refreshing)return;refreshing=true;
 const position={left:window.scrollX,top:window.scrollY},input=$('#chatInput'),draft=input?.value;
 const active=activeView==='brief'?$('#briefView'):activeView==='overview'?$('#overviewView'):$('#flowView');
 const open=[...active.querySelectorAll('details')].map(n=>n.open);
 const panels=['#assistantContent','.guide-questions','.guide-track','.guide-tabs'].flatMap(selector=>[...document.querySelectorAll(selector)].map((n,index)=>({selector,index,left:n.scrollLeft,top:n.scrollTop})));
 const guide=window.briefGuide?.capture();
 try{
  renderWidgets();
  if(route.type==='brief')showBrief(route.issueId);
  if(route.type==='stock-workbench')showReviewAccount(route.tab);
  active.querySelectorAll('details').forEach((n,i)=>{if(open[i]!==undefined)n.open=open[i];});
  if(guide&&!context&&!taskDraft)window.briefGuide.restore(guide);
  for(const panel of panels){const n=document.querySelectorAll(panel.selector)[panel.index];if(n){n.scrollLeft=panel.left;n.scrollTop=panel.top;}}
  if(input&&draft!==undefined)input.value=draft;
 }finally{window.scrollTo({...position,behavior:'instant'});refreshing=false;}
}
const refreshBefore=refreshBrief;refreshBrief=function(...args){const stamp=briefStamp,snapshot=briefSnapshot(),expected=[snapshot.target.id,briefStatus,briefClock?'demo':'real',snapshot.clock.slice(0,10)].join('|');if(window.workbenchClient.desktop&&activeView==='brief'&&(args[0]||expected!==stamp))renderWidgets();const result=refreshBefore(...args);if(!rendering&&(args[0]||briefStamp!==stamp))refreshViews();return result;};
window.addEventListener('research-profile-saved',()=>{preview=null;expanded.clear();refreshViews();});
const oldShowBrief=showBrief;showBrief=function(...args){const result=oldShowBrief(...args);decorate();return result;};
const oldPage=page;page=function(...args){const result=oldPage(...args);queueMicrotask(decorate);return result;};
const oldHome=home;home=function(...args){const result=oldHome(...args);decorate();return result;};
function jump(id,focus){if(id==='sectors')return allEvents({driverTab:'themes'});if(id==='stocks')return showReviewAccount('watchlist');if(id==='holdings-news'){const q=focus&&opportunitySecurity(legacyKeys[focus]||focus);return q?briefQuote(opSecurityKey(q),issueNow()):showReviewAccount('watchlist');}if(id==='themes-etf')return allEvents({driverTab:'themes'});if(!state.order.includes(id)){state.order.push(id);save();}state.collapsed=state.collapsed.filter(x=>x!==id);home();requestAnimationFrame(()=>{const node=$(`[data-widget="${id}"]`);if(focus){const row=node?.querySelector(`[data-v3-security="${focus}"]`);if(focus==='688041'&&row?.querySelector('[data-v3-haiguang]'))row.querySelector('[data-v3-haiguang]').open=true;(row||node)?.scrollIntoView({block:'start'});}else node?.scrollIntoView({block:'start'});});}
const removedSections={alerts:'holdings-news','research-review':'holdings-news',themes:'themes-etf',etfs:'themes-etf',industries:'sectors',flows:'sector-flows','major-events':'events'};
const removedDestination=(section,issue=selectedIssue)=>section==='themes'&&issue?.period==='morning'?null:removedSections[section];
const oldRestore=restoreRoute;restoreRoute=function(r,...args){if(r?.type==='brief'&&removedDestination(r.section,issueFromId(r.issueId)))return jump(removedDestination(r.section,issueFromId(r.issueId)));return oldRestore(r,...args);};
window.addEventListener('hashchange',e=>{const section=new URLSearchParams(e.newURL.split('?').at(-1)).get('section');if(e.newURL.includes('/briefs/')&&!(section==='themes'&&/\/morning(?:[?#]|$)/.test(e.newURL))&&removedDestination(section))queueMicrotask(()=>jump(removedDestination(section)));},true);
window.addEventListener('click',e=>{const b=e.target.closest('[data-brief-action="section"]');if(b&&removedDestination(b.dataset.briefValue)){e.preventDefault();e.stopImmediatePropagation();jump(removedDestination(b.dataset.briefValue));}},true);
function tags(){
 const rows=[...D.stockNews,...D.timeline,...D.macro];
 D.themes.forEach(t=>rows.push({title:t.name,objects:[t.name,...t.stocks,t.etf.code],type:'热点',cycles:['short','swing'],direction:'中性'}));
 D.industries.forEach(([title])=>rows.push({title:title+'行业观察',objects:[title],type:'板块轮动',cycles:['swing'],direction:'中性'}));
 Object.entries(D.boards).forEach(([kind,items])=>items.forEach(([name,flow])=>rows.push({title:name+'主力资金',objects:[name],type:'资金',cycles:['short'],direction:flow>0?'利好':'利空'})));
 briefNews.forEach(n=>rows.push({title:n.title,objects:[n.company||n.category||'市场'],type:n.id==='2490095'?'热点':'公告',cycles:[n.id==='2490095'?'short':'swing'],direction:'中性'}));
 eveningEvents.forEach(e=>rows.push({title:e.title,objects:e.stocks,type:e.id==='battery-cost'?'公告':'异动',cycles:[e.id==='battery-cost'?'swing':'short'],direction:e.id==='battery-cost'?'利空':'中性'}));
 ['市场背景','A股市场','港股市场','欧洲半导体观察','美股芯片需求消息','美元观察'].forEach(title=>rows.push({title,objects:[title],type:'资金',cycles:['short'],direction:'中性'}));
 return rows;
}
const notesBefore=$('#designNotes').onclick;
$('#designNotes').onclick=function(...args){notesBefore.apply(this,args);$('#modalTitle').textContent='V3.0 · 设计说明';const body=$('#modalBody');
 body.querySelector('.profile-delivery-review')?.remove();
 body.querySelectorAll('section').forEach(n=>{if(n.querySelector('h3')?.textContent==='本批体验路径')n.remove();});
 body.querySelectorAll('h3').forEach(h=>{if(['布局提案','尚未拍板'].includes(h.textContent)){if(h.nextElementSibling)h.nextElementSibling.textContent='本次按v7交接文档实施九组件、画像排序、消息提醒和业务进展时间线。风险偏好只改措辞。';}});
 body.insertAdjacentHTML('afterbegin',`<section class="profile-delivery-review"><h3>画像：组件、内容、追问三处联动</h3><p>已保存：${D.labels[actual()]}。临时预览不保存画像；手动布局优先，恢复自动请使用总览的“按画像排序”。</p><div class="profile-review-controls">${Object.keys(D.labels).map(k=>`<button class="button" data-v3-preview="${k}" aria-pressed="${preview===k}">${D.labels[k]}</button>`).join('')}<button class="button" data-v3-preview="actual">退出对照</button></div><div class="profile-review-table"><table><thead><tr><th>投资习惯</th><th>关心的指标</th><th>首屏</th><th>我的标的动态显示什么</th><th>排序规则</th></tr></thead><tbody>${Object.keys(D.labels).map(k=>`<tr><th>${D.labels[k]}</th><td>${{unset:'发布时间',short:'涨跌幅、资金、异动',swing:'板块强弱、近20日变化',long:'经营、业绩、订单、研报'}[k]}</td><td>${k==='unset'?'大盘指数 → 事件捕手 → 引导卡':D.orders[k].slice(1,4).map(id=>D.names[id]).join(' → ')}</td><td>${{unset:'事件一句话',short:'今日涨跌、资金金额、异动原因',swing:'板块今日强弱、近20日涨跌',long:'经营观察、业绩进度、研报观点'}[k]}</td><td>${D.rules[k]}</td></tr>`).join('')}</tbody></table></div><p>持仓始终在前。默认仅有两只持仓，按用户确认，两种习惯可首只相同；字段与解读随习惯变化。海光时间线固定按时间从新到旧。</p></section><details class="v3-tag-table"><summary>示例资讯标签表</summary><div class="profile-review-table"><table><thead><tr><th>资讯</th><th>关联对象</th><th>事件类型</th><th>影响周期</th><th>方向</th><th>当前习惯下的位置和原因</th></tr></thead><tbody>${tags().map(n=>`<tr><td>${esc(n.title)}</td><td>${esc(n.objects.join('、'))}</td><td>${n.type}</td><td>${n.cycles.map(k=>D.labels[k]).join('、')}</td><td>${n.direction}</td><td>${n.code?`我的标的动态第${ranked().findIndex(s=>s.code===n.code)+1}位；`:D.timeline.includes(n)?'时间线按时间新到旧；':''}${mode()==='unset'?'未设置习惯，按发布时间':n.cycles.includes(mode())?'周期标签匹配'+D.labels[mode()]:'周期标签不匹配当前习惯'}；事件类型为${n.type}。${n.code&&alertFor(n)?'命中消息提醒。':''}</td></tr>`).join('')}</tbody></table></div></details>`);
 if(!body.querySelector('#demoState'))body.insertAdjacentHTML('beforeend',`<section><h3>演示状态</h3><label class="field"><span>查看不同资料状态</span><select id="demoState"><option value="normal">默认演示用户</option><option value="new">新用户：尚未添加标的</option><option value="quiet">标的今日无事件</option><option value="empty">资料为空</option><option value="failed">读取失败</option></select></label><button class="button" data-flow="apply-demo">应用演示状态</button></section>`);
 const select=$('#demoState');if(select){select.options[0].textContent='默认演示用户';if(![...select.options].some(o=>o.value==='quiet'))select.add(new Option('标的今日无事件','quiet'));select.value=demoState;select.closest('label')?.querySelector('span')?.replaceChildren(document.createTextNode('演示状态'));}
 body.querySelectorAll('[data-v3-preview]').forEach(b=>b.onclick=()=>{preview=b.dataset.v3Preview==='actual'?null:b.dataset.v3Preview;expanded.clear();closeModal();refreshViews();});
};
function stripLegacyMarkers(root){
 if(!root)return;
 root.querySelectorAll('.brief-cover-disclosure,.brief-data-note,.editorial-runtime-note,.profile-sample-notice,.research-demo-label,.profile-reading-summary h4 span,.research-demo-asof,.profile-sample-answer strong,.review-workspace-footnote,.evening-overseas-meta,.evening-overseas-note,.overseas-heading>span,.overseas-notice,.profile-review-note,.brief-guide .assistant-scope').forEach(n=>n.classList.add('v3-legacy-marker'));
 root.querySelectorAll('.detail-cover>p,.data-message,.flow-small,.review-notice,.sample-notice,.assistant-copy,.event-demo-note').forEach(n=>{
  if(!n.classList.contains('v3-report-date')&&/固定资料|资料快照|未接入在线 AI|非实时|截图参考|虚构|模拟示例|示例数据|演示模式|原型仅|样稿仅|尚未接入 AI/.test(n.textContent))n.classList.add('v3-legacy-marker');
 });
 const walker=document.createTreeWalker(root,NodeFilter.SHOW_TEXT);let node;const edits=[];
 while(node=walker.nextNode()){
  if(node.parentElement.closest('.v3-source-note,.v3-profile-tag,.v3-annotation,.pa-note,.pa-legend,.v3-legacy-marker,script,style,textarea,input,.v3-dot,.v3-report-date,[data-v3-keep-copy]'))continue;
  const text=node.textContent;if(!/模拟|示例|虚构|海光案例|固定资料|未接入在线 AI/.test(text))continue;
  // Disclosure is consolidated above; preserve the financial content and interaction.
  let clean=text.replace(/[（(](?:模拟|示例)[）)]/g,'').replace(/海光案例\s*·\s*(?:短线交易|波段配置|中长期持有)/g,'').replace(/模拟|虚构|示例/g,'').replace(/固定资料|未接入在线 AI/g,'');
  if(clean!==text)edits.push([node,clean]);
 }
 edits.forEach(([n,t])=>n.textContent=t);
}
function decorate(){
 const version=$('.design-strip b');if(version&&version.textContent!=='V3.0')version.textContent='V3.0';
 const strip=$('.design-strip');if(strip&&!strip.dataset.v3){strip.dataset.v3='true';const first=strip.firstElementChild;first.innerHTML=`<span class="v3-annotation">页面设计样稿 </span><b>V3.0</b>`;strip.children[1]?.classList.add('v3-legacy-marker');}
 $('#presentationToggle')?.setAttribute('title','查看演示说明与数据来源');
 const active=activeView==='overview'?$('#overviewView'):activeView==='brief'?$('#briefView'):$('#flowView');
 const report=active===$('#briefView');
 const focusPage=activeView==='overview'||report||route.type==='stock-workbench'||route.type==='events';
 document.body.classList.toggle('v3-focus-page',focusPage);document.body.dataset.v3Page=activeView==='overview'?'overview':report?'brief':route.type||'';
 // One source line and one profile tag per visible page.
 $$('.v3-source-note,.v3-profile-tag').forEach(n=>{if(!active?.contains(n))n.remove();});
 if(active&&!active.querySelector('.v3-source-note')){
 const note=document.createElement('p');note.className='v3-source-note v3-annotation';note.textContent='资料来源：固定资料（2026-09-22 至 09-23），未接入在线 AI，历史期次复用同一份资料。标为示例的消息、时间、金额、涨跌均为虚构。';
 if(activeView==='overview')$('#widgetGrid').before(note);else{const h=active.querySelector('.detail-cover,.flow-page-head');if(h)h.after(note);else active.prepend(note);}
 }
 const heading=active?.querySelector('h1');if(heading){let tag=active.querySelector('.v3-profile-tag');if(!tag){tag=document.createElement('span');tag.className='v3-profile-tag v3-annotation';heading.after(tag);}const text='当前画像：'+D.labels[mode()];if(tag.textContent!==text)tag.textContent=text;}
 if(report){
 if(window.workbenchClient.desktop){
  active.querySelectorAll('details.v3-secondary').forEach(d=>{
   const summary=d.querySelector(':scope>summary');if(!summary?.textContent.includes('展开分析与后续关注'))return;
   const content=document.createElement('div');content.className='v3-secondary v3-direct-analysis';
   while(d.firstChild){const child=d.firstChild;if(child===summary)child.remove();else content.append(child);}d.replaceWith(content);
  });
 }else{
  active.querySelectorAll('.report-analysis').forEach(n=>{if(n.parentElement.matches('details'))return;const d=document.createElement('details');d.className='v3-secondary';d.innerHTML='<summary>展开分析与后续关注</summary>';n.before(d);d.append(n);});
 }
 active.querySelectorAll('.detail-cover>p').forEach(n=>{if(/闪电猫解读|固定资料/.test(n.textContent))n.classList.add('v3-report-date');else n.classList.add('v3-supporting-copy');});
 }
 for(const root of [$('#overviewView'),$('#briefView'),...(['market-overview','global-indices'].includes(route.type)?[]:[$('#flowView')]),$('#assistantContent')])stripLegacyMarkers(root);
 // Existing numeric snapshots remain unchanged. Their disclosure dots are opt-in.
 document.querySelectorAll('#overviewView [data-widget="indexes"] strong,#overviewView [data-widget="market"] strong,#briefView strong,#briefView .op-number,#briefView .evening-overseas h4').forEach(n=>{if(/\d/.test(n.textContent)&&!n.querySelector('.v3-dot'))n.insertAdjacentHTML('beforeend',dot);});
}
const css=`
.v3-annotation,.v3-dot,.v3-report-date{display:none!important}.presentation-on .v3-annotation{display:block!important}.presentation-on .v3-profile-tag{display:inline-flex!important;margin-left:10px}.presentation-on.v3-focus-page #main h1{display:inline-block}.presentation-on .v3-dot{display:inline!important}.presentation-on .v3-report-date{display:block!important}.v3-legacy-marker{display:none!important}.presentation-on .v3-report-date.v3-legacy-marker{display:block!important}
.v3-source-note{margin:0 0 14px;padding:9px 12px;background:var(--surface);color:var(--subtle);font-size:10px;line-height:1.7;border:1px solid var(--line);border-radius:6px}.v3-profile-tag{font-size:10px!important;font-weight:400;color:var(--muted);margin:4px 0 12px}.v3-dot{font-size:6px;color:var(--subtle);margin-left:3px;vertical-align:super}
.v3-my-targets.brief-top{display:block!important;padding:0}.v3-my-targets>h3,.v3-timeline>h3{font-size:20px;font-weight:600;line-height:1.4;color:var(--text);margin:0 0 12px}.v3-brief-overview{padding:18px 22px}.v3-my-targets .data-message{padding:0!important;margin:3px 0!important;text-align:left!important;font-size:10px}[data-widget="brief"]>.widget-footer{display:none}.v3-brief-stock{position:relative}.v3-brief-overview .v3-brief-stock>.text-action{position:absolute;right:60px;top:8px;margin:0}.v3-brief-stock{padding:8px 0!important;margin:0!important;border:0!important;border-bottom:1px solid var(--line)!important;background:none!important}.v3-brief-stock:last-child{border-bottom:0!important}.v3-security-heading{display:flex;align-items:center;flex-wrap:wrap;gap:8px}.v3-security-heading strong{font-size:14px;font-weight:600}.v3-security-heading time{margin-left:auto;font-size:10px;color:var(--subtle)}.v3-security-heading small{font-size:10px;color:var(--subtle)}.v3-risk-opening{font-size:12px!important;color:var(--text)!important;margin:6px 0 3px!important}.v3-habit-line,.v3-event-line{font-size:11px!important;color:var(--muted);line-height:1.75;margin:4px 0!important}.v3-alert{font-size:10px;color:var(--accent);background:var(--accent-soft);padding:2px 6px;border-radius:3px}.v3-my-targets .text-action{font-size:10px;color:var(--subtle)}
.v3-macro{margin-top:14px}.v3-macro summary{font-size:11px;color:var(--muted);cursor:pointer;line-height:1.7}.v3-macro summary>span{color:var(--subtle);margin-left:10px;font-size:10px}.v3-macro h2{font-size:15px;font-weight:550}.v3-macro .brief-event h3{font-size:13px;font-weight:550}.v3-macro .brief-event p{font-size:11px;color:var(--muted)}.v3-macro .brief-event{padding:10px 0;border:0;background:transparent}.v3-brief-bottom{display:flex;justify-content:space-between;margin-top:14px}.v3-brief-bottom .text-action{font-size:10px;color:var(--subtle)}
.v3-targets .data-message{padding:0;margin:5px 0;text-align:left}.v3-targets{padding:4px 20px}.v3-security-news{padding:15px 0;border-bottom:1px solid var(--line)}.v3-security-news:last-child{border-bottom:0}.v3-states{display:flex;flex-wrap:wrap;gap:5px;margin:8px 0}.v3-states span{font-size:10px;background:var(--surface);border:1px solid var(--line);padding:3px 6px;border-radius:4px;color:var(--muted)}.v3-secondary{font-size:11px;color:var(--muted);margin:8px 0}.v3-secondary>summary{font-size:10px;color:var(--subtle);cursor:pointer}.v3-secondary p{line-height:1.8}.v3-haiguang>summary{font-size:11px;color:var(--muted);cursor:pointer;margin-top:10px}.v3-haiguang[open]{margin-top:10px}.v3-timeline{margin:12px 0}.v3-timeline>details{border-left:1px solid var(--line);padding:10px 0 10px 14px}.v3-timeline summary{display:flex;flex-wrap:wrap;gap:6px 10px;cursor:pointer;font-size:12px}.v3-timeline time{font-size:10px;color:var(--subtle)}.v3-timeline-title{font-weight:550}.v3-timeline-status{font-size:10px;color:var(--muted)}.v3-timeline-detail{font-size:11px;color:var(--muted);line-height:1.8}.v3-timeline blockquote{border-left:2px solid var(--line);padding-left:12px;margin:8px 0}.v3-one-page{white-space:pre-wrap;word-break:break-word;font:inherit;font-size:13px;line-height:1.9}
.v3-guide{padding:20px}.v3-guide h3{font-size:15px;font-weight:550;margin:0 0 8px}.v3-guide p{font-size:11px;color:var(--muted)}.v3-empty{padding:18px}.v3-empty h3{font-size:16px;font-weight:550}.v3-empty p{color:var(--muted);font-size:12px}.v3-flows,.v3-themes{padding:16px 20px}.v3-board-grid{display:grid;grid-template-columns:repeat(5,minmax(0,1fr));gap:8px;margin-top:12px}.v3-board{border:1px solid var(--line);padding:10px 8px;border-radius:5px;display:flex;flex-direction:column;gap:7px;font-size:10px}.v3-board strong{font-size:12px;font-weight:550}.v3-board b{font-weight:500}.v3-board small{font-size:9px;color:var(--accent)}.v3-related-board{border-color:var(--accent)}.v3-themes .brief-event{padding:10px 0;border:0;background:none}.v3-themes .brief-event h3{font-size:13px;font-weight:550}.v3-industries p{font-size:11px;color:var(--muted);line-height:1.8;margin:8px 0}.v3-added-event h3{margin:7px 0;font-size:13px;font-weight:550}
.v3-related-sectors{display:flex;flex-wrap:wrap;gap:8px;margin-bottom:12px}.v3-related-sectors span{font-size:10px;color:var(--accent);border:1px solid var(--line);border-left:2px solid var(--accent);padding:6px 8px}.v3-stock-row{display:grid;grid-template-columns:minmax(140px,1fr) minmax(110px,auto);gap:12px;align-items:center;padding:13px 16px;border-bottom:1px solid var(--line)}.v3-stock-row small{display:block;font-size:10px;color:var(--subtle);margin:5px 0}.v3-stock-row strong,.v3-stock-row strong>a{font-size:14px;font-weight:550}.v3-stock-row p{font-size:12px;color:var(--muted);margin:5px 0}.v3-stock-identity{min-width:0}.v3-track-controls{display:flex;gap:14px;justify-content:flex-end;align-items:center;font-size:11px}.v3-template-options{display:flex;grid-column:1/-1;gap:16px;flex-wrap:wrap;font-size:11px;padding-top:8px}.v3-template-options label,.v3-track-controls label{display:flex;align-items:center;gap:5px}.v3-stock-edit{grid-column:1/-1}.v3-stock-edit button{margin-right:12px}.v3-event-choices{border:0;border-bottom:1px solid var(--line);padding:0 0 20px;margin:0 0 20px}.v3-event-choices legend{font-size:20px;font-weight:600;margin-bottom:14px}.v3-event-choices>div{display:grid;grid-template-columns:repeat(3,1fr);gap:14px}.v3-event-choices label{display:flex;gap:7px;align-items:center;font-size:13px}.v3-layout-note{margin:8px 0 12px;padding:0;border:0;background:transparent;font-size:10px;color:var(--subtle)}.v3-layout-note>div{display:flex;gap:12px;align-items:center}.v3-layout-note details{font-size:10px}.v3-layout-note summary{cursor:pointer}.v3-layout-note small{line-height:1.8}.v3-layout-note .v3-annotation{font-size:10px;margin:5px 0}
body[data-v3-page="overview"] .page-heading h1,body[data-v3-page="overview"] .page-head h1,body[data-v3-page="brief"] .detail-cover h1{font-size:15px!important;font-weight:550!important}.v3-focus-page .assistant-greeting{font-size:15px}.v3-supporting-copy{font-size:9px!important;color:var(--subtle)!important}.v3-report .report-index{color:var(--subtle)}.v3-report .v3-my-targets>h3{font-size:21px}.v3-report .v3-brief-stock{margin-bottom:8px!important}.v3-below-fold .widget-title h2{color:var(--muted)}body[data-v3-page="stock-workbench"] .flow-page-head h1{font-size:15px!important;font-weight:550}#modal:has(.v3-event-choices) #modalTitle{font-size:15px;font-weight:550}body[data-v3-page="stock-workbench"] .flow-page-head p{font-size:10px;color:var(--subtle)}body[data-v3-page="stock-workbench"] .review-workspace-intro h2{font-size:20px}body[data-v3-page="events"] .flow-panel>header h2{font-size:20px}body[data-v3-page="events"] .flow-page-head h1{font-size:15px}body[data-v3-page="events"] .flow-event-bottom{font-size:9px;color:var(--subtle)}
@media(min-width:1100px){#workspace-panel .v3-stock-row{grid-template-columns:minmax(170px,1fr) minmax(130px,auto) minmax(150px,auto)}}@media(max-width:700px){.v3-brief-overview .v3-brief-stock>.text-action{position:static;margin-top:6px}.v3-board-grid{grid-template-columns:repeat(2,minmax(0,1fr))}.v3-brief-overview{padding:16px}.v3-targets .data-message{padding:0;margin:5px 0;text-align:left}.v3-targets{padding:0 14px}.v3-track-controls{justify-content:flex-start;grid-column:1/-1}.v3-event-choices>div{grid-template-columns:repeat(2,1fr)}.v3-timeline summary{display:block}.v3-timeline summary span{display:block;margin:5px 0}.v3-macro summary>span{display:none}.v3-security-heading{gap:6px}.v3-layout-note small{word-break:break-word}}
`;
const style=document.createElement('style');style.id='overviewV3Style';style.textContent=css;document.head.append(style);
document.addEventListener('click',e=>{
 const auto=e.target.closest('[data-v3-auto]');if(auto){state.profileOrderMode='auto';save();refreshViews();return;}
 const move=e.target.closest('[data-w-action]');if(move&&!move.disabled&&['pin','up','down'].includes(move.dataset.wAction)){
  state.order=[...$('#widgetGrid').querySelectorAll(':scope>[data-widget]')].map(n=>n.dataset.widget);state.profileOrderMode='manual';
 }
 const oldLink=e.target.closest('[data-brief-action="section"],[data-nav-route]');
 if(oldLink?.dataset.briefValue&&removedDestination(oldLink.dataset.briefValue)){e.preventDefault();e.stopImmediatePropagation();jump(removedDestination(oldLink.dataset.briefValue));}
},true);
document.addEventListener('click',e=>{
 const b=e.target.closest('[data-v3-jump],[data-v3-paper],[data-v3-profile],[data-v3-close],[data-v3-board],[data-v3-reminder]');if(!b)return;
 if(b.dataset.v3Jump)jump(b.dataset.v3Jump,b.dataset.v3Focus);
 if(b.hasAttribute('data-v3-paper'))onePage();if(b.hasAttribute('data-v3-profile'))$('#profileEntry').click();if(b.hasAttribute('data-v3-close'))closeModal();
 if(b.dataset.v3Board){boardKind=b.dataset.v3Board;const body=$('[data-widget="sector-flows"] .widget-body');if(body)body.innerHTML=flowsBody();}
 if(b.dataset.v3Reminder)reminder(b.dataset.v3Reminder);
});
document.addEventListener('change',e=>{
 const n=e.target;if(n.dataset.v3Track){const t=trackingFor(n.dataset.v3Track);if(persist(n.dataset.v3Track,{tracking:{enabled:n.checked,templates:t.templates.length?t.templates:[...D.templates]}}))refreshViews();else n.checked=!n.checked;}
});
document.addEventListener('toggle',e=>{if(e.target.matches?.('[data-v3-timeline]'))expanded.set(mode()+':'+e.target.dataset.v3Timeline,e.target.open);},true);
let pendingFrame=0;const observer=new MutationObserver(()=>{if(pendingFrame)return;pendingFrame=requestAnimationFrame(()=>{pendingFrame=0;observer.disconnect();decorate();observer.observe(document.body,{childList:true,subtree:true});});});
observer.observe(document.body,{childList:true,subtree:true});
window.overviewV3={mode,actual,portfolio,ranked,briefRows,linksToMacro,trackingFor,eventTypesFor,order,tags,refresh:refreshViews};
const initialSection=route.type==='brief'?route.section:null;refreshViews();if(removedDestination(initialSection,issueFromId(route.issueId)))jump(removedDestination(initialSection,issueFromId(route.issueId)));
}
if(document.readyState!=='complete')document.addEventListener('DOMContentLoaded',initialize,{once:true});else initialize();
})();
