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
// Per-ETF authored examples for reviewing tags and filtering; not model outputs.
const etfInsightProducts = {
 '515880':{rating:4.5,researchTags:[{period:'短期',factor:'量价趋势'}],group:'communication',relation:'跟踪中证全指通信设备指数，以通信设备产业为观察范围。算力互联需求通过光通信、网络设备等环节传导，成分公司的订单兑现是后续重点。'},
 '515050':{rating:4,researchTags:[{period:'短期',factor:'资金面'}],group:'communication',relation:'围绕中证5G通信主题指数观察网络建设与设备升级。相比单一光模块方向，更需要区分不同通信环节的需求变化。'},
 '159507':{rating:3.5,researchTags:[{period:'短期',factor:'量价趋势'}],group:'communication',relation:'通过国证通信指数观察通信产业链，把产品升级、客户投入和交付变化放在同一视角下跟进。'},
 '159695':{rating:3,researchTags:[{period:'中长期',factor:'基本面'}],group:'communication',relation:'同样以国证通信指数为观察范围，产业逻辑集中在通信需求升级；与同指数产品的差异则需比较费率、流动性和跟踪情况。'},
 '159583':{rating:4,researchTags:[{period:'中长期',factor:'景气度'}],group:'communication',relation:'以通信设备主题为主线，重点观察网络升级对设备、部件与系统交付的带动，以及成分公司在其中的业务位置。'},
 '159363':{rating:4.5,researchTags:[{period:'中长期',factor:'基本面'}],group:'ai',relation:'通过创业板人工智能指数观察 AI 软硬件生态。手机 AI 和端侧算力提供产业催化，实际影响取决于成分公司的产品及客户布局。'},
 '515980':{rating:4,researchTags:[{period:'中长期',factor:'景气度'}],group:'ai',relation:'围绕中证人工智能产业指数观察产业链变化，跟进算力、终端和应用环节的协同进展；各环节的商业化节奏可能不同。'},
 '159381':{rating:3.5,researchTags:[{period:'短期',factor:'资金面'}],group:'ai',relation:'以创业板人工智能方向为观察入口，关注成分公司的产品落地与业绩兑现；与同指数产品对比时，重点看流动性和跟踪表现。'},
 '159388':{rating:3,researchTags:[{period:'短期',factor:'量价趋势'},{period:'中长期',factor:'基本面'}],group:'ai',relation:'围绕创业板人工智能生态观察应用与硬件升级。产业催化提供方向，成分业务结构决定具体覆盖。'},
 'ref-chip-design':{rating:4,researchTags:[{period:'短期',factor:'量价趋势'}],group:'chip',relation:'聚焦芯片设计方向，观察端侧推理、算力与终端升级带来的需求变化。不同公司的技术路线和客户导入阶段需要分别跟进。'},
 'ref-vaccine-cm':{rating:3,researchTags:[{period:'中长期',factor:'景气度'}],group:'vaccine',relation:'以疫苗产业为观察方向，重点跟进研发、审批和商业化。疫苗与创新药的业务覆盖不同，需要围绕具体产品判断催化强度。'},
 'ref-vaccine-js':{rating:2.5,researchTags:[{period:'中长期',factor:'基本面'}],group:'vaccine',relation:'围绕疫苗企业的产品进度、接种需求和竞争格局展开观察。同主题产品可以对照，具体覆盖仍由指数成分决定。'}
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
function etfResearchTags(q){
 const tags=etfInsight(q)?.researchTags||[];if(!tags.length)return '';
 return `<div class="etf-research-tags" aria-label="ETF期限与因子标签（模拟）">${tags.map(t=>`<span class="etf-research-tag" title="模拟标签：期限是观察周期，因子是分析维度；尚未接入公司因子结果。"><span>${esc(t.period)}</span><span aria-hidden="true"> · </span><span>${esc(t.factor)}</span></span>`).join('')}</div>`;
}
function etfInsightBlock(q,issueId,{expanded=false}={}){
 const d=etfInsight(q);if(!d)return '';
 return `<div class="etf-insight ${expanded?'is-expanded':''}" aria-label="${esc(q.name)}的分析"><p class="etf-insight-lead">${icon('sparkles')}${esc(d.lead)}</p><button class="etf-analysis-toggle" aria-expanded="${expanded}" aria-label="${expanded?'收起':'展开'}${esc(q.name)}的分析" title="${expanded?'收起':'展开'}分析" data-etf-analysis-toggle>${icon('chevron-down')}</button></div>`;
}
function etfOpportunityCards(quotes,issueId){
 return `<div class="etf-opportunity-list">${quotes.map(q=>`<article class="etf-opportunity-card" data-etf-card="${esc(opSecurityKey(q))}"><header class="etf-card-top"><h2>${opLink(esc(q.name),opQuoteRoute(opSecurityKey(q),issueId))}</h2>${opChange(q)}${opWatch(q)}${etfRating(q)}</header><p class="etf-card-index">跟踪指数：${etfIndexLink(q,issueId)}</p>${etfResearchTags(q)}${etfInsightBlock(q,issueId)}</article>`).join('')}</div>`;
}
const etfInsightQuote=briefQuote;
briefQuote=function(company,issue){
 etfInsightQuote(company,issue);
 const q=opportunitySecurity(company);if(q?.type!=='etf'||!etfInsight(q))return;
 $('#flowView .flow-page-head')?.insertAdjacentHTML('afterend',`<section class="etf-detail-insight"><h2>为什么关注这只 ETF</h2>${etfResearchTags(q)}${etfInsightBlock(q,issue.id,{expanded:true})}</section>`);
};
document.addEventListener('click',e=>{
 const toggle=e.target.closest('[data-etf-analysis-toggle]');if(toggle){const block=toggle.closest('.etf-insight'),expanded=block.classList.toggle('is-expanded');toggle.setAttribute('aria-expanded',String(expanded));toggle.setAttribute('aria-label',(expanded?'收起':'展开')+block.getAttribute('aria-label'));toggle.title=(expanded?'收起':'展开')+'分析';return;}
 const button=e.target.closest('[data-etf-insight-ask]');if(!button)return;
 const q=opportunitySecurity(button.dataset.etfInsightAsk),d=q&&etfInsight(q);if(!d)return;
 const issueId=button.dataset.etfInsightIssue||opIssue().id;
 const question=`为什么关注${q.name}？后续重点看什么？`;
 setContext({kind:'etf-insight',company:q.name,code:q.code,question,source:'当前 ETF 的模拟机会解读'});openAssistant();
 $('#assistantContent').innerHTML=`<div class="flow-context-chip">${esc(q.name)} · ${esc(q.code||'代码未获取')}</div><div class="user-message">${esc(question)}</div><p class="sample-notice">模拟回答 · 已带入当前 ETF</p><div class="brief-answer"><strong>关注理由</strong><p>${esc(d.lead)}</p></div>${reviewCapability({expert:'基金研究陪伴助手',skills:['基金数据查询','指数数据查询','基金持仓分析','基金综合分析'],data:'演示场景：行业催化、指数覆盖与后续关注；正式接入时使用基金与指数数据'})}`;
 $('#assistantContent').scrollTop=0;
});

const etfFilterPeriods=['短期','中长期'];
const etfFilterFactors=['量价趋势','景气度','资金面','基本面'];
function etfMatchesFilters(q,r){
 const periods=r.etfPeriods||etfFilterPeriods,factors=r.etfFactors||etfFilterFactors;
 if(periods.length===2&&factors.length===4)return true;
 return (etfInsight(q)?.researchTags||[]).some(t=>periods.includes(t.period)&&factors.includes(t.factor));
}
function openEtfFilters(){
 document.querySelector('#etfFilterDialog')?.remove();
 const r={...route},periods=r.etfPeriods||etfFilterPeriods,factors=r.etfFactors||etfFilterFactors;
 const options=(items,selected,name)=>items.map(v=>`<label class="etf-filter-option"><input type="checkbox" name="${name}" value="${esc(v)}" ${selected.includes(v)?'checked':''}><span>${esc(v)}</span></label>`).join('');
 const dialog=document.createElement('dialog');dialog.id='etfFilterDialog';dialog.className='etf-filter-dialog';dialog.setAttribute('aria-labelledby','etfFilterTitle');
 dialog.innerHTML=`<form id="etfFilterForm"><header><h2 id="etfFilterTitle">ETF机会筛选</h2><button type="button" class="etf-filter-close" aria-label="关闭ETF筛选">${icon('x')}</button></header><fieldset><legend>ETF投资期限</legend><div class="etf-filter-options">${options(etfFilterPeriods,periods,'period')}</div></fieldset><fieldset><legend>ETF因子</legend><div class="etf-filter-options">${options(etfFilterFactors,factors,'factor')}</div></fieldset><p class="etf-filter-description">投资期限表示观察周期，因子表示分析维度。同一组内多选可扩大范围，期限与因子共同筛选匹配的标签。当前标签和分析为原型示例，不代表实时因子结果。</p><footer><button type="button" class="etf-filter-reset">恢复默认</button><button type="submit" class="etf-filter-confirm">确定</button></footer></form>`;
 document.body.append(dialog);const form=dialog.querySelector('form');
 const close=()=>{dialog.close();dialog.remove();document.querySelector('[data-etf-filter-open]')?.focus();};
 dialog.querySelector('.etf-filter-close').onclick=close;dialog.addEventListener('cancel',e=>{e.preventDefault();close();});
 dialog.querySelector('.etf-filter-reset').onclick=()=>{form.querySelectorAll('input').forEach(i=>i.checked=true);};
 form.onsubmit=e=>{e.preventDefault();const data=new FormData(form);const next={...r,etfPeriods:data.getAll('period'),etfFactors:data.getAll('factor')};close();showOpportunities(next,true);document.querySelector('[data-etf-filter-open]')?.focus();};
 dialog.addEventListener('click',e=>{if(e.target===dialog){const b=dialog.getBoundingClientRect();if(e.clientX<b.left||e.clientX>b.right||e.clientY<b.top||e.clientY>b.bottom)close();}});
 dialog.showModal();
}
document.addEventListener('click',e=>{if(e.target.closest('[data-etf-filter-open]'))openEtfFilters();});

function etfRating(q){
 const rating=etfInsight(q)?.rating;if(rating==null)return '';
 return `<button class="etf-rating" data-etf-rating="${esc(opSecurityKey(q))}" aria-label="${esc(q.name)}关注星级${rating}星，查看说明" title="模拟关注星级 ${rating}/5，点击查看说明">${Array.from({length:5},(_,i)=>`<span class="etf-star" style="--fill:${Math.max(0,Math.min(1,rating-i))*100}%" aria-hidden="true">★</span>`).join('')}</button>`;
}
function etfIndexLink(q,issueId){
 if(!q.index)return '未获取';
 const key=opSecurityKey(opportunityQuotes.find(other=>other.type==='etf'&&other.index===q.index)||q);
 return opLink(esc(q.index.replace('（参考截图）',''))+icon('chevron-right'),{type:'etf-index',code:key,issueId},'etf-index-link');
}
function showEtfIndex(r){
 const etf=opportunitySecurity(r.code);if(!etf?.index)return;
 const names=[...new Set(opportunityQuotes.filter(q=>q.type==='etf'&&q.index).map(q=>q.index))],n=names.indexOf(etf.index);
 // Independent synthetic index fixtures, never derived from ETF quotes.
 const last=1800+n*137.25,delta=(n%2?-1:1)*(6.2+n),previous=last-delta,percent=delta/previous*100;
 const related=opportunityQuotes.filter(q=>q.type==='etf'&&q.index===etf.index);
 const samples=Array.from({length:25},(_,i)=>last+(Math.sin(i*.65)-Math.sin(24*.65))*15+(i-24)*.45);
 const lo=Math.min(...samples)-8,hi=Math.max(...samples)+8;
 const points=samples.map((v,i)=>`${45+i*27},${220-(v-lo)/(hi-lo)*170}`).join(' ');
 const chart=`<svg class="etf-index-chart" viewBox="0 0 740 260" role="img" aria-label="${esc(etf.index)}模拟分时走势"><title>模拟分时走势，非真实指数行情</title>${[0,1,2,3].map(i=>`<line x1="45" x2="693" y1="${50+i*56}" y2="${50+i*56}" stroke="var(--line)"/><text x="2" y="${54+i*56}" fill="var(--muted)" font-size="11">${(hi-(hi-lo)*i/3).toFixed(0)}</text>`).join('')}<polyline points="${points}" fill="none" stroke="var(--orange)" stroke-width="2"/><text x="45" y="250" fill="var(--muted)" font-size="12">09:30</text><text x="325" y="250" fill="var(--muted)" font-size="12">11:30／13:00</text><text x="655" y="250" fill="var(--muted)" font-size="12">15:00</text></svg>`;
 page(etf.index,opBack()+`<header class="flow-page-head"><div><h1>${esc(etf.index)}</h1><p>指数行情</p></div></header><section class="flow-panel etf-index-overview"><div class="etf-index-value ${delta>=0?'up':'down'}"><strong>${last.toFixed(2)}</strong><span>${delta>=0?'+':''}${delta.toFixed(2)}　${delta>=0?'+':''}${percent.toFixed(2)}%</span><small>点</small></div><dl class="flow-facts"><dt>昨收</dt><dd>${previous.toFixed(2)}</dd><dt>最高</dt><dd>${Math.max(...samples).toFixed(2)}</dd><dt>最低</dt><dd>${Math.min(...samples).toFixed(2)}</dd></dl></section><section class="flow-panel"><h2>分时走势</h2>${chart}<p class="flow-small">模拟行情 · 走势示意</p></section><section class="flow-panel"><h2>跟踪该指数的ETF</h2><div class="etf-index-related">${related.map(q=>opLink(esc(q.name),opQuoteRoute(opSecurityKey(q),r.issueId))).join('')}</div></section>`,'etf-index');
 route={...r,type:'etf-index'};
}
document.addEventListener('click',e=>{
 const button=e.target.closest('[data-etf-rating]');if(!button)return;const q=opportunitySecurity(button.dataset.etfRating),d=etfInsight(q);
 openModal('ETF关注星级',`<p><strong>${esc(q.name)} · ${d.rating} / 5星</strong></p><p>星级表示当前相对关注程度，用于辅助筛选研究候选。量价、景气度、资金和基本面等维度可作为后续量化评价的输入。</p><p class="flow-small">当前为固定示例星级，尚未接入公司量化评分；不代表收益预测。</p>`);
});
