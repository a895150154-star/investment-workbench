/* v2.29 review alignment. Static explanations and local preferences only. */
const reviewBrowse = (label='浏览主题与标的') => opLink(label,{type:'opportunities',tab:'themes',issueId:briefSnapshot().displayed.id},'button');
const reviewBoundary = '原型仅保存本地设置，尚未运行后台监控、指标计算或通知。';
const reviewEmpty = (title,copy,buttons='') => `<div class="review-empty">${icon('files')}<h2>${title}</h2><p>${copy}</p><div class="flow-actions">${buttons}</div></div>`;

// Current subscriptions share the same records as detail bells and the home trigger tab.
showTasks=function(){
 const issue=briefSnapshot().displayed, securities=securityTrackingView.entries();
 const events=Object.entries(eventTracking).filter(([,v])=>v).map(([id,value])=>({id,value,found:trackedEvent(eventRoute(id,issue.id))})).filter(x=>x.found);
 const settings=taskTab!=='notices';
 const securityRows=securities.map(({key,item,security:q,conditions})=>`<article class="review-tracking-row" data-tracking-key="${esc(key)}" tabindex="-1"><div class="flow-meta">${badge('追踪已设置','good')}<span>${q.type==='etf'?'ETF':'个股'} · ${esc(q.code||'代码未获取')}</span></div><h3>${q.localOnly?esc(q.name):opLink(esc(q.name),opQuoteRoute(key,issue.id))}</h3><p>${conditions.map(esc).join('；')}</p><small>任一条件满足 · ${esc(item.frequency)} · ${esc(securityTrackingView.channelLabel(item))}${q.localOnly?' · 标的身份来自本地持仓，详情未接入':''}</small><div class="flow-actions"><button class="button" data-security-track="${esc(key)}">修改设置</button>${q.localOnly?'':opLink('查看标的',opQuoteRoute(key,issue.id),'button')}<button class="text-action" data-security-stop="${esc(key)}">停止追踪</button></div></article>`).join('');
 const eventRows=events.map(({id,value})=>eventTrackingRow(id,value,issue.id,true)).join('');
 page('订阅与提醒',back()+head('持续关注','订阅与提醒','集中管理已确认的追踪条件与个人简报偏好。','<button class="button" data-tracking-add>新增标的追踪</button>')+`<p class="review-notice">${reviewBoundary}保存追踪不会生成一条提醒。</p><nav class="op-tabs" aria-label="订阅与提醒栏目"><button data-review-task-tab="tasks" aria-pressed="${settings}" class="${settings?'selected':''}">追踪与订阅</button><button data-review-task-tab="notices" aria-pressed="${!settings}" class="${!settings?'selected':''}">提醒记录</button></nav>`+(settings?panel('标的追踪',securityRows||reviewEmpty('还没有标的追踪','先选股票或 ETF，再由闪电猫设置条件；确认后才加入追踪。','<button class="button primary" data-tracking-add>选择标的，设置追踪</button>'))+panel('个股事件追踪',eventRows||reviewEmpty('还没有个股事件追踪','从新闻或事件详情发起追踪，确认提醒频率和提醒方式即可。',opLink('浏览事件',{type:'opportunities',tab:'hotspots',issueId:issue.id},'button')))+panel('个人简报',`<div class="review-brief-summary"><div><h3>早报与晚报</h3><p>北京时间 ${esc(briefSchedule.morning)} / ${esc(briefSchedule.evening)} · ${briefPrefs.morning.length} 个早报栏目 / ${briefPrefs.evening.length} 个晚报栏目</p><small>时间用于本地模板切换，尚未自动生成简报或发送通知。</small></div><button class="button" data-brief-custom="${issue.id}">调整简报偏好</button></div>`):reviewEmpty('暂无真实提醒记录','后台监控尚未运行。已保存的追踪设置在“追踪与订阅”中查看。')+`<details class="review-demo-record"><summary>查看固定交互示例 · 非真实触发</summary><h3>${esc(briefNews.find(n=>n.id===eventTrackingExampleId).title)}</h3><p>仅演示收到同类事件后返回原资料的阅读路径，不表示出现了新证据或市场变化。</p>${opLink('查看原事件',eventRoute(eventTrackingExampleId,issue.id),'button')}</details>`),'tasks');
 route={type:'tasks',tab:settings?'tasks':'notices'};
};

// One sidebar destination; retain legacy entry arguments and share existing records.
let reviewAccountTab='watchlist';
function reviewWorkspaceTriggers(){
 const previous=stockTab;
 try{
  stockTab='触发';
  const template=document.createElement('template');
  template.innerHTML=reviewPreviousStockBody();
  template.content.querySelector('.table-tabs')?.remove();
  return template.innerHTML;
 }finally{stockTab=previous;}
}
function showReviewAccount(tab=reviewAccountTab){
 tab=['watchlist','holdings','triggers'].includes(tab)?tab:'watchlist';
 reviewAccountTab=tab;
 const issue=briefSnapshot().displayed,list=opportunityWatch.map(opportunitySecurity).filter(Boolean);
 const tabs=[['watchlist','自选',list.length+' 只'],['holdings','持仓',holdingsStore.count()+' 只'],['triggers','触发','原型']];
 const nav=`<div class="review-workspace-toolbar"><nav class="op-tabs review-workspace-tabs" role="tablist" aria-label="股票工作台栏目">${tabs.map(([key,label,note])=>`<button type="button" id="workspace-tab-${key}" role="tab" aria-selected="${tab===key}" aria-controls="workspace-panel" tabindex="${tab===key?'0':'-1'}" data-review-account="${key}" class="${tab===key?'selected':''}">${label}<small>${note}</small></button>`).join('')}</nav><button class="text-action" data-flow="tasks">管理追踪 ${icon('arrow-up-right')}</button></div>`;
 let body;
 if(tab==='watchlist')body=`<div class="review-workspace-intro"><div><h2>我的自选</h2><p>收藏关注的个股与 ETF，点击名称查看详情。</p></div>${reviewBrowse('添加自选')}</div>`+(list.length?opRows(list,issue.id):reviewEmpty('还没有添加自选','从标的详情点击“自选”，即可在这里集中查看。',reviewBrowse('浏览标的')))+`<p class="review-workspace-footnote">报价为已有快照或参考截图，各标的来源与时点见详情。自选与铃铛追踪分别设置。</p>`;
 else if(tab==='holdings')body=holdingsStore.content();
 else body=reviewWorkspaceTriggers();
 page('股票工作台',back()+head('个人关注','股票工作台','自选、持仓与追踪触发，在同一个工作台查看。')+`<section class="review-workspace">${nav}<div id="workspace-panel" role="tabpanel" aria-labelledby="workspace-tab-${tab}" tabindex="0">${body}</div></section>`,'stock-workbench');
 route={type:'stock-workbench',tab};
}
const reviewPreviousStockBody=stockBody;
stockBody=function(){
 if(stockTab==='触发')return reviewPreviousStockBody();
 const issue=briefSnapshot().displayed,list=opportunityWatch.map(opportunitySecurity).filter(Boolean);
 return `<div class="stock-body review-stock-body"><div class="table-tabs"><button data-stock-tab="自选股" class="${stockTab==='自选股'?'selected':''}">自选股</button><button data-stock-tab="持仓" class="${stockTab==='持仓'?'selected':''}">持仓</button><button data-stock-tab="触发">触发</button><span>本地关注清单</span></div>${stockTab==='持仓'?holdingsStore.summary():list.length?list.map(q=>`<div class="review-stock-row"><div>${opLink(esc(q.name),opQuoteRoute(opSecurityKey(q),issue.id))}<small>${esc(q.code||'代码未获取')} · ${q.reference?'截图参考，时点未核验':'公开行情快照'}</small></div><div>${opPrice(q)}${opChange(q)}</div></div>`).join(''):`<p class="data-message">还没有添加自选。从标的详情点击“自选”开始。</p>${reviewBrowse()}`}<div class="review-stock-more"><button class="text-action" data-review-account="watchlist">管理自选</button><button class="text-action" data-flow="tasks">管理追踪与订阅</button></div></div>`;
};
const reviewPreviousFooter=widgetFooter;
widgetFooter=function(id){return id==='stocks'?'<span>各标的来源与时点见详情</span><button class="text-action" data-flow="tasks">订阅与提醒 '+icon('arrow-up-right')+'</button>':reviewPreviousFooter(id);};

// Earlier research/version-comparison samples remain locally stored, outside the review path.
showLibrary=function(){
 page('早期原型记录',back()+head('历史样稿','早期原型记录','保留此前浏览器里的示例记录，当前评审以事件与标的追踪为主。')+panel('历史记录（只读）',flow.studies.length?flow.studies.map(s=>`<article class="review-tracking-row"><span class="flow-small">虚构交互示例 · ${esc(s.savedAt||'时间未记录')}</span><h3>${esc(s.context?.question||'历史研究')}</h3><p>${esc(conclusion(s.context,s.version))}</p></article>`).join(''):'<p>此浏览器没有早期研究记录。</p>')+`<p class="review-notice">旧任务、模拟提醒与版本数据仍保留在本机，不并入当前追踪，也不计作真实新进展。</p><div class="flow-actions">${action('查看当前追踪','tasks')}${reviewBrowse()}</div>`,'library');
};
showStudy=showLibrary;
showResult=showLibrary;
taskDetail=function(){showTasks();};
openNotice=function(){taskTab='notices';showTasks();};
showEvent=function(id){if(briefNews.some(n=>n.id===String(id)))return showTrackedEvent(eventRoute(id));allEvents();};
showTheme=function(){showOpportunities({type:'opportunities',tab:'themes',issueId:briefSnapshot().displayed.id});};
quote=function(company){const q=opportunitySecurity(company);if(q)return briefQuote(opSecurityKey(q),briefSnapshot().displayed);showReviewAccount('watchlist');};
const reviewEventBody=window.eventWidgetBody;
window.eventWidgetBody=function(){if(demoState!=='new')return reviewEventBody();demoState='normal';try{return '<p class="review-notice">尚未设置个人关注，先阅读本期公开线索。</p>'+reviewEventBody();}finally{demoState='new';}};

// Concrete examples expose proposed capability use; they never claim execution.
function reviewCapability({expert='',skills=[],data=''}){
 return `<details class="review-capability"><summary>${expert?'专家解读示意 · '+esc(expert):'直接查询示意 · 闪电猫'}</summary><p>${expert?'闪电猫带入问题与本页资料，由'+esc(expert)+'提供专项解释，再由闪电猫组织回答。':'闪电猫直接使用查询能力，简单资料问题无需专家接力。'}</p><dl><dt>拟用 Skill〔公司原名〕</dt><dd>${skills.map(esc).join('、')}</dd><dt>资料</dt><dd>${esc(data)}</dd></dl><small>调用方案示意，尚未调用公司 Agent、Skill 或数据服务。</small></details>`;
}
function reviewAddCapability(config){const box=$('#assistantContent');box.querySelector('.review-capability')?.remove();box.querySelector('.brief-answer')?.insertAdjacentHTML('afterend',reviewCapability(config));}
const reviewEditorialAsk=editorialAsk;
editorialAsk=function(key,...args){reviewEditorialAsk(key,...args);if(!editorialQuestions[key])return;reviewAddCapability({expert:key==='etf'?'基金研究陪伴助手':key==='optical'||key.startsWith('news-')?'个股投研专家':'市场解读陪伴助手',skills:key==='etf'?['基金数据查询','指数数据查询','基金持仓分析']:['新闻查询','公告查询','市场点评与事件解读'],data:key==='etf'?'用户参考截图；完整成分与权重尚未获取':'当前页面已有公开资料快照，出处在回答下方'});};
const reviewBriefAsk=briefAsk;
briefAsk=function(...args){reviewBriefAsk(...args);reviewAddCapability({expert:'个股投研专家',skills:['公告查询','公司基本面速览','股票财务分析'],data:'本页公告标题与原文链接；正文和财务数据缺口保留'});};
function reviewAnnouncements(code='300502'){
 const item=briefItems.find(i=>i.code===code);if(!item)return;
 const issue=issueFromId(route.issueId)||briefSnapshot().displayed;
 setContext({kind:'announcement-query',company:item.company,code,question:'查一下'+item.company+'的公告',source:item.source});openAssistant();
 $('#assistantContent').innerHTML=`<div class="user-message">查一下${esc(item.company)}的公告</div><div class="brief-answer"><strong>当前留存的公告资料</strong><p>${esc(item.source)}</p></div>${reviewCapability({skills:['公告查询'],data:'已有深交所公告列表快照 · '+briefSnapshotData.asOf})}<p class="assistant-copy">已保留公告标题、发布日期和原文入口。具体条款请打开来源核对，再继续分析它对公司的影响。</p>${briefSource(item.source,issue)}<p class="sample-notice">仅展示已留存的标题、日期与原文链接，未检索最新公告，正文尚未解析。</p><button class="suggestion" ${briefAttrs('question',item.id,issue)}>这份公告对公司意味着什么？${icon('arrow-up-right')}</button>`;
 $('#assistantContent').scrollTop=0;
}
const reviewQuote=briefQuote;
briefQuote=function(company,issue){reviewQuote(company,issue);const q=opportunitySecurity(company),item=briefItems.find(i=>i.code===q?.code);if(item)$('#flowView .flow-page-head .flow-actions')?.insertAdjacentHTML('beforeend',`<button class="button" data-review-announcements="${esc(item.code)}">查公告</button>`);};
const reviewTrackedEvent=showTrackedEvent;
showTrackedEvent=function(r){reviewTrackedEvent(r);const key='news-'+r.eventId;if(editorialQuestions[key]&&!researchDemo.isCase(r.eventId))$('#flowView .event-detail-section')?.insertAdjacentHTML('beforeend',`<button class="button review-event-ask" data-editorial-ask="${key}" data-editorial-issue="${esc(r.issueId||briefSnapshot().displayed.id)}">${icon('sparkles')}问闪电猫：这件事如何影响经营？</button>`);};
const reviewDefault=assistantDefault;
assistantDefault=function(){reviewDefault();if(!context&&!taskDraft&&['overview','brief'].includes(activeView)&&!$('#assistantContent [data-review-announcements]'))$('#assistantContent .suggestion-label')?.insertAdjacentHTML('afterend','<button class="suggestion" data-review-announcements="300502">查一下新易盛的公告'+icon('arrow-up-right')+'</button>');};

// Navigation entry points and current review notes.
$('[data-preview="research"]')?.remove();
$('[data-existing="板块中心"]')?.remove();
$('[data-existing="资讯雷达"]').onclick=()=>allEvents();
$('[data-existing="股票工作台"]').onclick=()=>showReviewAccount();
function reviewDesignNotes(){
 openModal('V2.30 · 评审说明',`<h3>工作台视觉统一</h3><p>参照浅色研究工作台：灰白底色、细分隔线、紧凑面板、统一的导航与表单。首页指数与市场概览并列，简报仍保留阅读层次；机会、标的、追踪和助手统一视觉。原有业务、来源、模拟数据与本地保存规则保留。</p><p>本次评审围绕“发现信息 → 理解关联 → 闪电猫追问 → 确认追踪”展开。保留早晚报、主题与 ETF 浏览、共用详情和来源。</p><h3>建议演示顺序</h3><ol class="review-tour"><li>今日总览 → 完整早报 / 晚报 → 事件详情与来源。</li><li>闪电猫“查公告” → 深入解读 → 展开拟用专家与 Skill。</li><li>个股 / ETF → 自选或铃铛 → 确认追踪 → 左侧股票工作台“触发”。</li><li>订阅与提醒 → 修改或停止追踪；提醒记录与设置分开。</li></ol><h3>热点机会与个股事件追踪</h3><p>热点按“事件背景 → AI 简析 → 关联个股”展示；在事件详情选择一只或多只股票，由闪电猫设置与这些股票相关的本事件后续或同类事件。确认前不保存。管理页、股票工作台和个股详情同步以股票名称展示；旧的无明确个股设置保留为待补选，不自动升级。环保政策与三只个股来自用户参考截图，尚未核验政策原文；不照搬收益判断、回测或模拟交易。</p><p>主题机会展示本期产业催化。主题是浏览范围，具体追踪仍从个股／ETF 详情铃铛进入。</p><h3>ETF 机会简析</h3><p>ETF 机会从报价列表改为观察卡片：默认显示“闪电猫简析 / 为什么关注”，展开查看机会来自哪里、与本只 ETF 的关系、后续关注与风险，以及催化标签。点击“继续问闪电猫”带入当前 ETF；详情沿用同一段解释。简析采用完整模拟场景，未调用真实 AI；报价、自选和排序继续由数据与规则提供。开启汇报标注可查看基金研究陪伴助手及公司 Skill 分工。</p><h3>新增标的追踪</h3><p>在订阅与提醒中点击“新增标的追踪”，从自选、持仓或搜索选择股票／ETF，直接由闪电猫设置条件；确认后当前管理列表更新。已追踪标的进入修改，取消不新增。搜索仅使用原型候选与本地记录。</p><h3>股票工作台</h3><p>左侧自选股与我的持仓合并为“股票工作台”，在同一页面切换自选、持仓、触发；订阅与提醒继续管理追踪设置。</p><h3>大盘指数</h3><p>首页两页六宫格展示常用指数；进入独立详情后查看全球市场示意图、A 股、全球指数、商品与美元、外汇。常用选择确认后在当前浏览器保存，首页与详情同步。报价来自用户截图，迷你线为静态示意。</p><h3>首页市场概览</h3><p>首页保留成交额、涨跌家数与风格摘要；点击“查看市场全貌”进入独立详情页，查看涨跌分布、涨跌停、连板与截图排行。支持刷新与返回首页。统计与排行标注资料说明；分时图采用独立的虚构演示数据，可悬停或拖动查看读数。各快照不混作同一行情时点，未接入实时行情。</p><h3>持仓导入</h3><p>持仓 Tab 支持 Excel / CSV 与手动填写，识别后可核对并编辑，确认才保存到当前浏览器。重复代码默认保留已有持仓；数量与成本价直接显示用户输入，不计算市值或盈亏。</p><h3>事件追踪范围</h3><p>先选择一只或多只具体股票，再选择“本事件后续进展”或与所选股票相关的“同类事件”。股票是对象，事件是条件；不再把行业或抽象范围直接当作追踪对象。旧设置保留并提示补选个股，确认后才升级。</p><h3>汇报标注</h3><p>点击顶部“汇报标注”，用箭头就地讲解 AI 生成解读、AI 辅助整理与数据／规则主导的分工。标注沿用公司 Skill 与专家原名，属于拟接入方案；关闭即可恢复普通原型。标注状态随当前链接保留。</p><h3>公司能力映射</h3><p>界面展示调用建议，保留公司能力原名。清单已完成不等于本产品已接通。</p><div class="flow-actions"><a class="button" href="capability-map.html" target="_blank" rel="noopener">查看完整映射表</a></div><h3>模拟解读与制作资料</h3><p>V2.29 起，ETF、主题与热点简析按产品口吻展示模拟场景，取消简析中的截图措辞和外部截图入口。制作参考仍保留在本地 references 目录，报价原始数据未改写。</p><h3>资料与演示边界</h3><p>机会解读、产业催化及环保关联说明为用户授权的模拟内容，不作为研究证据；行情仍沿用历史样本。早晚报日期演示模板切换，不代表重新生成资料。自选和追踪只存在当前浏览器；未连接真实 AI、行情刷新、后台监控或通知。</p><details><summary>早期原型记录</summary><p>复杂的研究版本对照、手动模拟检查已退出当前主流程。旧数据保留。</p>${action('查看只读历史记录','review-archive')}</details><p class="flow-small">本机预览链接仅能在本机访问，转交其他设备需另行部署。</p>`,'交付评审 / V2.30');
}
$('#designNotes').onclick=reviewDesignNotes;
$('.design-strip b').textContent='V2.30';
$('.design-strip>span:nth-child(2)').textContent='演示模式 · 机会解读为模拟内容 · 尚未接入 AI 与监控';
catalog.find(w=>w.id==='market').desc='阅读市场快照与本期解读';
catalog.find(w=>w.id==='sectors').desc='从已有产业线索进入主题与关联标的';
catalog.find(w=>w.id==='funds').desc='查看公司资金事项；不代表实时资金轮动';
const reviewDecorate=opportunityDecorate;
opportunityDecorate=function(){reviewDecorate();const n=route.type==='stock-workbench'?$('[data-existing="股票工作台"]'):route.type==='events'?$('[data-existing="资讯雷达"]'):null;if(n){markNav('');n.classList.add('active');n.setAttribute('aria-current','page');}};
const reviewRenderWidgets=renderWidgets;
renderWidgets=function(...args){reviewRenderWidgets(...args);if(route.type==='tasks')showTasks();else if(route.type==='stock-workbench')showReviewAccount(route.tab);};
document.addEventListener('click',e=>{
 const b=e.target.closest('[data-review-task-tab],[data-review-account],[data-review-announcements],[data-flow="review-archive"],[data-op-watch]');if(!b)return;
 if(b.dataset.reviewTaskTab){taskTab=b.dataset.reviewTaskTab;showTasks();}
 if(b.dataset.reviewAccount){const tab=b.dataset.reviewAccount,wasTab=b.getAttribute('role')==='tab';showReviewAccount(tab);if(wasTab)$('#workspace-tab-'+tab)?.focus({preventScroll:true});}
 if(b.dataset.reviewAnnouncements)reviewAnnouncements(b.dataset.reviewAnnouncements);
 if(b.dataset.flow==='review-archive'){closeModal();showLibrary();}
 if(b.dataset.opWatch)renderWidgets();
});
document.addEventListener('keydown',e=>{
 const tab=e.target.closest('.review-workspace-tabs [role="tab"]');
 if(!tab||!['ArrowLeft','ArrowRight','Home','End'].includes(e.key))return;
 e.preventDefault();
 const keys=['watchlist','holdings','triggers'],index=keys.indexOf(tab.dataset.reviewAccount);
 const next=e.key==='Home'?0:e.key==='End'?2:(index+(e.key==='ArrowRight'?1:2))%3;
 showReviewAccount(keys[next]);$('#workspace-tab-'+keys[next])?.focus({preventScroll:true});
});
// Free text never enters the retired mock task builder. Only explicit demo prompts run.
$('#chatForm').onsubmit=e=>{
 e.preventDefault();const text=$('#chatInput').value.trim();if(!text)return;$('#chatInput').value='';
 const item=briefItems.find(i=>text.includes(i.company));
 if(/公告/.test(text)&&item){reviewAnnouncements(item.code);return;}
 const entry=Object.entries(editorialQuestions).find(([,a])=>a.question===text);
 if(entry){editorialAsk(entry[0]);return;}
 openAssistant();$('#assistantContent').insertAdjacentHTML('beforeend',`<div class="user-message">${esc(text)}</div><p class="sample-notice">自由问答尚未接入。可使用页面给出的示例问题；追踪请从对应事件或标的详情进入，避免把条件带给错误对象。</p>`);$('#assistantContent').scrollTop=$('#assistantContent').scrollHeight;
};
