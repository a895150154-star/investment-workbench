/* V2.29 — explicitly simulated opportunity narratives for product review.
 * These authored scenarios are not research evidence or live AI output.
 * Existing quote fixtures and their provenance remain unchanged.
 */
const etfInsightGroups = {
 communication: {
  tag:'算力互联 · 需求升级',
  lead:'AI 算力建设持续推进，高速光模块与数据中心互联需求升温，通信设备迎来产品升级窗口。通信 ETF 将相关产业链集中到一篮子标的中，后续重点关注客户订单和交付节奏。',
  fact:'云厂商加快算力基础设施投入，高速光模块进入新一轮产品验证，数据中心网络升级带来设备需求。产业需求与产品迭代形成共振。',
  verify:'关注头部公司的客户验证、订单落地和交付进展。若扩产快于需求、产品价格承压，或订单兑现低于预期，产业机会的持续性就会减弱。',
  signals:['算力基础设施扩建','高速光模块迭代','数据中心网络升级'],
  focus:'客户订单 · 产品交付',events:[]
 },
 ai: {
  tag:'人工智能 · 应用落地',
  lead:'手机 AI 与端侧算力新品密集落地，人工智能正从模型能力走向终端应用。人工智能 ETF 提供观察软硬件协同的入口，重点看厂商合作、用户使用和商业化进展。',
  fact:'手机 AI 方案拓展应用入口，端侧芯片升级提升本地推理能力。终端适配与生态合作正在成为产业竞争的新焦点。',
  verify:'跟进接入厂商、正式上线功能和持续使用情况。若合作停留在演示阶段，或收入增长跟不上投入，主题热度就难以转化为经营增长。',
  signals:['手机 AI 方案发布','端侧算力升级','应用生态合作'],
  focus:'终端适配 · 商业化进展',events:['2490113','2490095']
 },
 chip: {
  tag:'芯片设计 · 新品催化',
  lead:'端侧 AI 带来新的芯片设计需求，国产算力新品拓展了应用场景。芯片设计 ETF 可以集中观察这一轮产品升级，客户导入和量产交付将决定机会能否持续。',
  fact:'终端智能化提高了对低功耗、本地推理和系统协同的要求，芯片企业围绕性能与应用适配加快迭代。新品发布后，关注点转向客户验证。',
  verify:'观察量产时间、客户导入和持续采购。若适配周期拉长、交付推迟或竞争加剧，新品带来的增长预期可能需要调整。',
  signals:['端侧算力新品发布','终端应用适配','国产芯片客户导入'],
  focus:'客户导入 · 量产交付',events:['2490095']
 },
 vaccine: {
  tag:'疫苗研发 · 产品催化',
  lead:'新产品研发与接种需求恢复带来疫苗产业的观察窗口。疫苗 ETF 的关注点在于重点产品审批、渠道放量和企业产品结构，而不是医药板块的普遍上涨。',
  fact:'重点产品研发进入新阶段，企业推进新品上市和渠道拓展。研发进展能否转化为接种需求，是本轮产业观察的核心。',
  verify:'跟进临床结果、审批进度和终端接种情况。若新品获批延后、推广不及预期或竞争压低价格，需要重新评估增长空间。',
  signals:['重点产品研发进展','新品审批与上市','接种渠道拓展'],
  focus:'产品审批 · 接种需求',events:[]
 }
};
const etfInsightProducts = {
 '515880':{group:'communication',relation:'跟踪中证全指通信设备指数，以通信设备产业为观察范围。算力互联需求通过光通信、网络设备等环节传导，成分公司的订单兑现是后续重点。'},
 '515050':{group:'communication',relation:'围绕中证5G通信主题指数观察网络建设与设备升级。相比单一光模块方向，更需要区分不同通信环节的需求变化。'},
 '159507':{group:'communication',relation:'通过国证通信指数观察通信产业链，把产品升级、客户投入和交付变化放在同一视角下跟进。'},
 '159695':{group:'communication',relation:'同样以国证通信指数为观察范围，产业逻辑集中在通信需求升级；与同指数产品的差异则需比较费率、流动性和跟踪情况。'},
 '159583':{group:'communication',relation:'以通信设备主题为主线，重点观察网络升级对设备、部件与系统交付的带动，以及成分公司在其中的业务位置。'},
 '159363':{group:'ai',relation:'通过创业板人工智能指数观察 AI 软硬件生态。手机 AI 和端侧算力提供产业催化，实际影响取决于成分公司的产品及客户布局。'},
 '515980':{group:'ai',relation:'围绕中证人工智能产业指数观察产业链变化，跟进算力、终端和应用环节的协同进展；各环节的商业化节奏可能不同。'},
 '159381':{group:'ai',relation:'以创业板人工智能方向为观察入口，关注成分公司的产品落地与业绩兑现；与同指数产品对比时，重点看流动性和跟踪表现。'},
 '159388':{group:'ai',relation:'围绕创业板人工智能生态观察应用与硬件升级。产业催化提供方向，成分业务结构决定具体覆盖。'},
 'ref-chip-design':{group:'chip',relation:'聚焦芯片设计方向，观察端侧推理、算力与终端升级带来的需求变化。不同公司的技术路线和客户导入阶段需要分别跟进。'},
 'ref-vaccine-cm':{group:'vaccine',relation:'以疫苗产业为观察方向，重点跟进研发、审批和商业化。疫苗与创新药的业务覆盖不同，需要围绕具体产品判断催化强度。'},
 'ref-vaccine-js':{group:'vaccine',relation:'围绕疫苗企业的产品进度、接种需求和竞争格局展开观察。同主题产品可以对照，具体覆盖仍由指数成分决定。'}
};
const etfInsightLeads = {
 '515050':'算力网络与通信基础设施升级形成双重需求，5G 通信产业链迎来设备更新窗口。这只 ETF 可以集中观察通信环节的变化，后续看新增需求能否转为成分公司的订单。',
 '159507':'算力互联需求向通信产业链传导，网络设备与高速连接产品成为观察重点。通过国证通信指数，可以同时跟进产品迭代和交付节奏。',
 '159695':'通信行业的关注点正从建设预期转向订单兑现。国证通信指数提供一篮子观察入口，后续重点跟进客户投入、产品升级和交付变化。',
 '159583':'数据中心网络升级推动通信设备更新，高速连接产品的需求成为产业催化。这只 ETF 聚焦通信设备方向，值得跟进客户验证和规模交付。',
 '159363':'手机 AI 方案与端侧芯片新品共同推动人工智能向终端落地。创业板人工智能 ETF 提供观察成长型软硬件企业的入口，后续看厂商适配和商业化能否接力。',
 '515980':'AI 应用从单点功能走向终端生态，软硬件协同创造新的产业需求。中证人工智能产业指数覆盖的不同环节，可结合产品发布、合作和收入兑现持续观察。',
 '159381':'端侧 AI 新品与终端应用形成联动，人工智能产业进入落地验证阶段。这只 ETF 可用于集中观察相关企业，重点看客户合作能否转为可持续业务。',
 '159388':'手机 AI 和本地推理场景拓展，为人工智能软硬件带来新的需求。沿创业板人工智能方向，继续观察应用渗透与产品交付的变化。'
};
function etfInsight(q){const key=opSecurityKey(q),product=etfInsightProducts[key];return product?{...etfInsightGroups[product.group],...product,...(etfInsightLeads[key]?{lead:etfInsightLeads[key]}:{})}:null;}
function etfInsightSources(d,issueId){
 return `<div class="etf-insight-signals"><span>催化线索</span><ul>${d.signals.map(signal=>`<li>${esc(signal)}</li>`).join('')}</ul></div>`;
}
function etfInsightExplanation(d,issueId){
 return `<dl class="etf-insight-reasons"><div><dt>机会来自哪里</dt><dd>${esc(d.fact)}</dd></div><div><dt>与这只 ETF 的关系</dt><dd>${esc(d.relation)}</dd></div><div><dt>后续关注与风险</dt><dd>${esc(d.verify)}</dd></div></dl>${etfInsightSources(d,issueId)}`;
}
function etfInsightBlock(q,issueId,{expanded=false}={}){
 const d=etfInsight(q);if(!d)return '';
 return `<section class="etf-insight" aria-label="${esc(q.name)}的关注理由"><header class="etf-insight-heading"><strong>${icon('sparkles')}闪电猫简析</strong><span>模拟解读</span><small>${esc(d.tag)}</small></header><h3>为什么关注</h3><p class="etf-insight-lead">${esc(d.lead)}</p><details class="etf-insight-details" ${expanded?'open':''}><summary><span class="etf-expand-label">展开机会逻辑</span><span class="etf-collapse-label">收起机会逻辑</span>${icon('chevron-down')}</summary>${etfInsightExplanation(d,issueId)}</details><footer><small>关注重点：${esc(d.focus)}</small><button class="etf-ask" data-etf-insight-ask="${esc(opSecurityKey(q))}" data-etf-insight-issue="${esc(issueId)}">继续问闪电猫 ${icon('arrow-up-right')}</button></footer></section>`;
}
function etfOpportunityCards(quotes,issueId){
 return `<div class="etf-opportunity-list"><div class="etf-list-caption"><strong>发现机会，读懂背后的逻辑</strong><span>这里的“机会”指值得进一步研究的线索</span></div>${quotes.map(q=>`<article class="etf-opportunity-card" data-etf-card="${esc(opSecurityKey(q))}"><header class="etf-card-top"><div class="etf-card-name"><h2>${opLink(esc(q.name)+icon('arrow-up-right'),opQuoteRoute(opSecurityKey(q),issueId))}</h2><p>${esc(q.code||'代码未获取')}<span>跟踪指数：${esc((q.index||'未获取').replace('（参考截图）',''))}</span></p></div><div class="etf-card-quote"><div><small>参考价</small>${opPrice(q)}</div><div><small>涨跌幅</small>${opChange(q)}</div>${opWatch(q)}</div></header>${etfInsightBlock(q,issueId)}<div class="etf-card-source"><span>报价来源</span>${opSource(q)}</div></article>`).join('')}</div>`;
}
const etfInsightQuote=briefQuote;
briefQuote=function(company,issue){
 etfInsightQuote(company,issue);
 const q=opportunitySecurity(company);if(q?.type!=='etf'||!etfInsight(q))return;
 $('#flowView .flow-page-head')?.insertAdjacentHTML('afterend',`<section class="etf-detail-insight"><h2>为什么关注这只 ETF</h2>${etfInsightBlock(q,issue.id,{expanded:true})}</section>`);
};
document.addEventListener('click',e=>{
 const button=e.target.closest('[data-etf-insight-ask]');if(!button)return;
 const q=opportunitySecurity(button.dataset.etfInsightAsk),d=q&&etfInsight(q);if(!d)return;
 const issueId=button.dataset.etfInsightIssue||opIssue().id;
 const question=`为什么关注${q.name}？后续重点看什么？`;
 setContext({kind:'etf-insight',company:q.name,code:q.code,question,source:'当前 ETF 的模拟机会解读'});openAssistant();
 $('#assistantContent').innerHTML=`<div class="flow-context-chip">${esc(q.name)} · ${esc(q.code||'代码未获取')}</div><div class="user-message">${esc(question)}</div><p class="sample-notice">模拟回答 · 已带入当前 ETF</p><div class="brief-answer"><strong>关注理由</strong><p>${esc(d.lead)}</p></div>${etfInsightExplanation(d,issueId)}${reviewCapability({expert:'基金研究陪伴助手',skills:['基金数据查询','指数数据查询','基金持仓分析','基金综合分析'],data:'演示场景：行业催化、指数覆盖与后续关注；正式接入时使用基金与指数数据'})}`;
 $('#assistantContent').scrollTop=0;
});
