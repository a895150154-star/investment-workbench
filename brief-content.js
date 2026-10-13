/* Dated public material for local interface review. No report generation or live subscriptions. */
const briefSections=[['alerts','特别提醒'],['pulse','市场脉搏'],['themes','主题机会'],['etfs','ETF 机会'],['industries','关注行业']];
const briefQuoteByCode=code=>briefSnapshotData.quotes.find(q=>q.code===code);
const briefAnnouncement=(code,match)=>briefSnapshotData.announcements.find(a=>a.code===code&&a.title.includes(match));
const briefItems=[
 {id:'xys',code:'300502',company:'新易盛',reason:'自选相关',a:briefAnnouncement('300502','归属结果'),title:'新易盛更新股权激励安排，暂不视为订单信号',summary:'新易盛披露限制性股票归属结果及股份上市安排。这条消息首先关系到激励兑现与股本变化，对研究光模块订单的帮助有限。',analysis:'这份公告应放在“公司治理与股本”一栏，而不是“订单增长”一栏。激励计划有助于理解公司如何约束和留住团队，但本次标题没有提供客户、订单或产品交付的新增信息。',watch:'阅读原文时先找股份上市安排和归属条件；下一条更可能改变经营判断的信息，是客户导入、产品交付或业绩披露。',question:'新易盛这条公告，会改变光模块的研究判断吗？',answer:'仅凭本次公告标题，还不足以改变光模块的经营判断。它说的是股权激励归属和股份上市，并未给出新增订单或交付进度。可以先把它归入公司事项，再把研究重点留给经营披露。',checks:[['安排','核对归属对象、条件与上市时间'],['股本','核对股份变动与对应口径'],['经营','结合后续经营披露，避免直接推导盈利']]},
 {id:'zjxc',code:'300308',company:'中际旭创',reason:'近期浏览',a:briefAnnouncement('300308','翌日披露报表'),title:'中际旭创披露股本报表，与经营进展分开看',summary:'中际旭创的最新材料中出现 H 股翌日披露报表。它提供的是股本事项的阅读入口，不能替代高速光模块的产品与客户信息。',analysis:'这条信息值得留档，但不应仅凭标题提高对经营增长的判断。先看报表对应哪类股份变动，再单独跟进主营产品与交付节奏；两条信息线有不同的验证材料。',watch:'查看原文的变动类别和时间，并与最新公司披露交叉核对。',question:'中际旭创这条披露，和业务增长有什么关系？',answer:'目前能确认的是股本报表更新，不能由此推出主营业务增长。阅读时应把股份变动和产品交付分开：前者看报表项目，后者看经营公告、客户与订单。',checks:[['事项','核对股本变动类别'],['时点','核对披露日及实际变动日'],['边界','不将股本披露等同于经营进展']]},
 {id:'tftx',code:'300394',company:'天孚通信',reason:'主题关注',a:briefAnnouncement('300394','现金管理'),title:'天孚通信安排现金管理，重点看经营资金是否受影响',summary:'天孚通信披露闲置自有资金现金管理安排。这是资金使用效率的观察线索，尚不能用来判断扩产资金是否充裕。',analysis:'现金管理和产业扩张是两件事。短期要看资金是否能及时用于经营，中期要看项目支出与现金回流是否匹配；授权额度本身也不等于已经投入的金额。',watch:'核对授权范围、产品类型、期限及风险控制；不将闲置资金直接视为可无限用于扩产的资金。',question:'天孚通信做现金管理，能说明资金很充裕吗？',answer:'不能仅凭这条公告判断资金很充裕。它说明公司有现金管理安排，但还需要知道期限、可赎回条件和经营支出计划，才能评估可动用资金。',checks:[['用途','核对自有资金与经营使用边界'],['期限','核对产品期限及赎回条件'],['风险','核对授权范围及风控安排']]}
].map(i=>({...i,source:i.a.title,kind:'公司公告',impact:'公司事项解读'}));
const briefCompanyAnalysis={
 "xys": {
  "title": "激励兑现有助于观察团队约束，股本变化还要看具体安排",
  "summary": "新易盛披露限制性股票归属结果及股份上市安排。本期先从人才激励与股本两个角度读这条事项，再与光模块产品交付的经营线索对照。",
  "analysis": "股权激励的传导路径是“约束与留住团队—支持研发和交付执行”，它与新增订单直接拉动收入的路径不同。归属安排一方面让激励进入兑现环节，另一方面也需要核对新增股份及流通安排：前者关系到激励是否有效，后者关系到每股口径和交易供给。只有把具体归属条件与公司经营结果放在一起，才能判断激励目标是否具有约束力。当前仅取得公告标题和链接，尚未读取归属条款，因此本期将其归入公司治理观察，经营景气仍由产品交付与后续业绩单独验证。",
  "watch": "先读本次归属结果与股份上市公告，核对归属条件、股份安排和实际上市时间；再看公司下一份经营披露能否提供客户与交付进展。若仅有激励事项而无经营变化，维持治理观察；若出现可核对的产品交付与业绩兑现，再更新增长判断。下一次经营披露日期尚未取得。",
  "answer": "它首先改变的是我们对团队激励和股本安排的观察。是否改变经营判断，要看激励约束怎样设置，以及后续有没有实际交付和业绩支撑，不能把股份归属直接当成订单增加。"
 },
 "zjxc": {
  "title": "股本报表先辨变动性质，再看是否影响每股口径",
  "summary": "中际旭创披露 H 股翌日披露报表。阅读重点是先辨别具体股份变动，再分别检查融资用途、每股口径或流通安排是否需要更新。",
  "analysis": "股本信息会通过不同路径影响研究判断，关键取决于变动性质：如果涉及新增股份，需要同时看资金用途与每股口径；如果只是股份类别或流通安排调整，更应关注对应的交易结构，而不是据此推导经营扩张。同样一份“股本披露”，未必意味着公司获得了新的资金，也未必意味着主营业务发生变化。当前只有报表标题，无法确定属于哪种情形，因此先保留为股本事项；对高速光模块业务的判断，则继续沿客户需求、交付能力和利润兑现的链条观察。",
  "watch": "先在本次原文中核对股份变动类别、生效时间及是否涉及资金进入公司；如涉及融资，再找配套公告中的用途和实施进度。后续经营披露若显示项目落地与交付改善，才建立股本事项与业务增长之间的联系。原文条款与下一次披露日期尚未取得。",
  "answer": "股本报表需要先分清变动性质。如果涉及融资，资金用途和项目实施可能与增长有关；如果只是股份安排变化，影响更多在每股口径或交易结构。标题本身还不能把这两类情况区分开。"
 },
 "tftx": {
  "title": "现金管理看期限匹配，资金效率与经营保障要一起判断",
  "summary": "天孚通信披露闲置自有资金现金管理安排。研究重点在于暂时闲置的资金能否在经营需要时回到主业，以及产品期限是否与项目支出相匹配。",
  "analysis": "现金管理可能提高暂时闲置资金的使用效率，但“账上有资金”和“随时可用于经营”之间还隔着产品期限与赎回条件。如果配置期限短、风险可控，又与采购、研发及项目付款节奏匹配，资金安排可以兼顾收益和经营保障；如果资金被较长期限锁定，而经营回款或项目支出出现变化，就可能形成期限错配。因此，判断重点不是授权额度大不大，而是实际投入、到期安排和经营现金回流能否匹配。当前尚未解析公告条款，不能据此确认公司处于上述哪一种情景。",
  "watch": "先核对本次公告的产品范围、期限、赎回条件及实际使用安排；下一份定期报告再结合经营现金流、应收款与项目支出复核。若回款走弱或支出提前，而资金仍被锁定，应上调对流动性匹配的关注；若到期回收顺畅且主业支出得到保障，则支持资金管理有效的判断。具体披露日期尚未取得。",
  "answer": "现金管理说明公司在安排暂时闲置的资金，但充裕程度取决于资金何时可用、主业何时要用。需要把产品到期日、采购及项目付款和经营回款放在一起看，才能判断是否真正留有余量。"
 }
};
briefItems.forEach(item=>Object.assign(item,briefCompanyAnalysis[item.id]));
const briefNews=briefSnapshotData.news;
const briefNewsAnalysis={
 "2490095": {
  "object": "海光信息",
  "tag": "端侧算力 · 产品发布",
  "headline": "海光从云侧走向端侧，增量空间要由客户导入兑现",
  "summary": "据财联社报道，海光发布 CPU 1000 系列，面向低功耗、嵌入式和端侧算力场景。公司表示，将按场景需求调配 CPU、GPU、NPU 算力，逐步丰富产品矩阵。",
  "analysis": "此次发布的变化，在于海光把产品覆盖从云侧延伸到了边缘和终端。沿着“产品可用—客户适配—批量交付”的路径看，低功耗和嵌入式场景可能带来新的客户入口，也意味着公司需要面对不同于服务器的功耗、成本与软件兼容要求。若整机厂商完成适配并形成持续采购，新产品才可能转化为业务增量；如果停留在样机展示，研发和生态适配投入会先发生，收入兑现则可能滞后。因此，本期更适合把它看作业务边界扩展的预期催化，尚不把产品发布等同于新一轮盈利增长。",
  "judgment": "产品方向已经公开，商业验证仍在下一阶段；最有分量的后续信息是客户导入和持续交付。",
  "watch": "先看公司或整机合作方下一次公开的适配机型、应用场景与量产交付消息，再在后续定期报告中核对新产品的商业进展。若出现重复采购，业务增量的判断得到支持；若适配反复延期或始终没有实际客户，需下调对落地节奏的预期。具体披露日期尚未取得。",
  "question": "海光端侧芯片，从发布到收入兑现还差哪几步？",
  "answer": "关键不是再出现一次发布，而是跨过客户适配、量产交付和持续采购这几道门槛。可先把产品矩阵扩展视为方向进展，再用整机落地与经营披露判断是否进入商业兑现阶段。",
  "checks": [
   [
    "客户适配",
    "公司或整机厂商公布可用机型与软件适配，说明从芯片走到了终端产品。"
   ],
   [
    "量产交付",
    "出现正式交付信息，比单次展示更接近商业验证；还要区分试用与批量采购。"
   ],
   [
    "持续采购",
    "后续经营披露能解释客户复购和业务贡献，才支持收入具有持续性。"
   ]
  ],
  "teaser": "端侧产品打开新的客户入口，但软件适配、功耗与成本决定能否进入整机。下一步要看真实机型与批量交付。"
 },
 "2490104": {
  "object": "中船特气",
  "tag": "半导体材料 · 公司回应",
  "headline": "出口回落是船期延后，还是需求转弱？先看交付能否补回",
  "summary": "据科创板日报报道，中船特气在业绩会上将六氟化钨出口回落归因于台风造成的船期堆积与运输延后，并称出口订单总量及境外客户合作未受冲击。公司还表示，相关产品目前以季度议价为主。",
  "analysis": "这条回应把问题从“有没有需求”转向了“什么时候交付”。如果公司所述成立，船期延后会先扰动出口出货，并可能影响收入确认与回款节奏；订单仍在，并不意味着当期经营表现完全不受影响。反过来，单月出口下降也不足以直接推出客户需求萎缩。更关键的是把数量和价格分开：后续补发能够验证交付延后，季度议价结果则影响同样销量对应的收入与盈利。当前解读倾向于先观察物流扰动后的修复，但依据仍是公司的解释，需要后续出货和经营结果交叉验证。",
  "judgment": "订单口径缓解了需求骤降的担忧，交付补回与价格变化仍是两个独立的验证点。",
  "watch": "下一次公司公开出货或交付进展时，看延后订单是否补发；后续定期报告或业绩交流中，再看销售、回款及议价变化。若物流恢复后出货仍持续偏弱，或公司改口提到客户推迟采购，应重新审视“只是交付延后”的解释。具体更新日期尚未取得。",
  "question": "中船特气说订单没受影响，为什么还要看出货和价格？",
  "answer": "订单、交付和收入对应不同阶段。订单没有取消，只能说明需求承诺仍在；货何时发出、何时确认收入以及最终售价，仍会影响当期经营结果。判断这次扰动是否结束，需要同时看到交付修复与价格端的信息。",
  "checks": [
   [
    "交付补回",
    "下一次公司公开交付进展时，核对船期延后部分是否发出；没有补回要追问原因。"
   ],
   [
    "价格变化",
    "在公司季度议价相关披露或业绩交流中，观察售价方向；补量不等于收入与盈利同步恢复。"
   ],
   [
    "现金回流",
    "后续定期报告中结合经营现金流与应收项目看回款，避免只看订单表述。"
   ]
  ],
  "teaser": "订单未取消与当期业绩不受影响是两回事。物流延迟影响交付节奏，季度议价还会影响收入，后续需同时看补发与价格。"
 },
 "2490113": {
  "object": "手机 AI",
  "tag": "AI 应用 · 方案发布",
  "headline": "手机 AI 从回答问题走向执行任务，厂商接入是落地关键",
  "summary": "据千问大模型消息，千问发布手机 AI 全栈解决方案 Qwen Intelligence，希望与手机厂商共同开发，让手机完成更复杂的任务。",
  "analysis": "全栈方案的研究价值，在于它尝试把模型能力接到手机上的实际任务，而不只是增加一个问答入口。若手机厂商开放系统能力并完成适配，模型可以更深入地参与用户操作，应用入口和服务方式也可能随之变化。不过，复杂任务涉及权限、跨应用协作和执行可靠性：演示中能完成，不等于用户日常会持续使用。因此，本期重点是观察手机厂商是否把方案做成可用产品，而非直接把发布消息外推成换机需求或硬件订单。与海光端侧芯片联读，可以看到应用和硬件两端都在扩展；两篇报道并未披露双方存在合作。",
  "judgment": "这是应用落地的预期催化。终端接入、任务完成体验和持续使用，比发布声量更能验证价值。",
  "watch": "下一次厂商发布会或系统更新中，核对实际接入机型、功能开放范围与任务完成体验；后续再看厂商公开的使用反馈。若功能停留在演示或开放范围迟迟不扩展，应降低对快速普及的预期。接入名单及具体上线日期尚未取得。",
  "question": "手机 AI 真正落地，最值得验证的是什么？",
  "answer": "先验证用户能否在真实手机上稳定完成任务，再讨论商业价值。接入厂商与可用机型证明产品进入终端，实际完成率和持续使用才说明它超越了发布演示。",
  "checks": [
   [
    "进入终端",
    "厂商公布机型与上线范围，区分合作意向和已开放功能。"
   ],
   [
    "任务可用",
    "看跨应用任务能否完成、失败如何恢复，不能只看一句回答是否流畅。"
   ],
   [
    "持续使用",
    "观察后续公开使用反馈，判断新鲜感能否转化为日常习惯。"
   ]
  ],
  "teaser": "从问答走向任务执行，关键在手机厂商的系统接入。先看真实机型上的完成体验，再判断是否形成持续使用。"
 },
 "2490099": {
  "object": "港股市场",
  "tag": "市场脉搏 · 收盘观察",
  "headline": "科技股内部仍有分化，指数上涨不等于 AI 链条同步走强",
  "summary": "本期港股收盘报道中，腾讯等科网股走强，存储与半导体多数上涨；部分大模型概念股下跌，PCB 个股也出现分化。",
  "analysis": "将这些表现放在一起看，本期更明显的特征是科技板块内部的分化。平台、模型和硬件承担不同的商业角色，其股价表现不必沿同一方向变化。因此，不能因为指数上涨，就把整条 AI 产业链归为同一轮行情，也不能仅凭这次分化断言资金已经从模型转向硬件。对后续研究更有用的做法，是把股价表现与各自的新产品、客户采用和经营披露对应起来：消息催化能否被业务进展接住，决定这条解释是否有持续性。",
  "judgment": "本期看到的是结构分化；“资金轮动”或“趋势确立”还需要持续行情与经营证据。",
  "watch": "下一交易日先观察分化是否延续，再结合相关公司后续财报与产品披露核对原因。若领涨迅速更替、缺乏业务进展，应把本次表现保留为单日市场现象；若经营证据持续改善，才进一步讨论基本面驱动。财报日期以公司正式公告为准。",
  "question": "科技股涨跌分化，能说明资金在切换方向吗？",
  "answer": "仅凭一次收盘分化还不够。价格反映了当日交易结果，却没有直接说明资金去向或持续原因。需要连续市场表现与公司经营信息相互印证，才能把“看到分化”推进到“解释轮动”。",
  "checks": [
   [
    "持续性",
    "下一交易日观察相对表现是否延续，单日排名不等于趋势。"
   ],
   [
    "业务依据",
    "与后续产品、客户和财报披露对应，避免用价格反过来证明业务。"
   ],
   [
    "资金证据",
    "真实资金流向尚未接入；不能把板块涨跌写成净流入结论。"
   ]
  ],
  "teaser": "平台、模型与硬件表现不同步。先把单日价格分化和各自经营线索对应，再判断是否有持续的基本面驱动。"
 }
};
function editorialNewsRead(id){return briefNewsAnalysis[id]?.analysis||'继续结合原文阅读。';}
function briefNewsAnalysisBlock(id,issue){const a=briefNewsAnalysis[id];return `<div class="report-analysis"><p><strong>传导分析</strong>${a.analysis}</p><p><strong>本期判断</strong>${a.judgment}</p><p><strong>后续关注</strong>${a.watch}</p><button data-editorial-ask="news-${id}" data-editorial-issue="${issue.id}">${icon('arrow-up-right')}${a.question}</button></div>`;}
function briefFeaturedNews(id,issue){const a=briefNewsAnalysis[id],n=briefNews.find(n=>n.id===id);return `<article class="report-alert" id="analysis-${id}"><div class="report-alert-title"><strong class="report-featured-name">${a.object}</strong><span class="tag">${a.tag}</span></div><h3>${opLink(esc(a.headline),eventRoute(id,issue.id),'report-event-title')}</h3><p>${a.summary}</p><div class="report-attribution"><span>${n.time}</span>${briefSource(n.title,issue)}</div>${briefNewsAnalysisBlock(id,issue)}</article>`;}

const briefSecurities=briefSnapshotData.quotes.map(q=>({name:q.name,code:q.code,type:q.code==='515880'?'etf':'stock',relation:q.code==='515880'?'通信主题观察':'光通信观察名单',note:q.code==='515880'?'指数成分与实际主题覆盖尚未核验。':'观察名单不代表本期订单关联或受益判断。'}));
function briefAttrs(action,value='',issue){return `data-brief-action="${action}" data-brief-value="${esc(value)}"${issue?` data-brief-issue="${issue.id}"`:''}`;}
function briefSource(name,issue){const publisher=briefSnapshotData.announcements.some(a=>a.title===name)?'深交所':briefNews.some(n=>n.title===name)?'财联社':name.startsWith('腾讯行情')?'腾讯行情':name;return `<button class="brief-source" ${briefAttrs('source',name,issue)}>来源：${esc(publisher)} ${icon('chevron-right')}</button>`;}
function briefQuoteTime(q){return `${q.time.slice(0,4)}.${q.time.slice(4,6)}.${q.time.slice(6,8)} ${q.time.slice(8,10)}:${q.time.slice(10,12)}`;}
function briefQuoteValues(code){const q=briefQuoteByCode(code);return `<span class="brief-price">${q.price.toFixed(code==='515880'?3:2)}<small>元</small></span><span class="brief-change ${q.change<0?'down':'up'}">${q.change>0?'+':''}${q.change.toFixed(2)}%</span>`;}
function briefSnapshotNote(){return `<p class="brief-data-note">依据 ${briefSnapshotData.asOf} 固定资料整理 · 解读预览，未接入在线 AI；历史期次复用此份资料。</p>`;}
function briefHeading(id,title,subtitle){return `<header class="report-section-head" id="brief-${id}"><h2>${title}</h2><span>${subtitle}</span></header>`;}
function briefRelated(issue,type){return `<div class="brief-related">${briefSecurities.filter(s=>!type||s.type===type).map(s=>`<button ${briefAttrs('quote',s.name,issue)}><strong>${s.name}</strong><span>${s.code} · ${s.type==='etf'?'ETF':'个股'}</span><span>${briefQuoteValues(s.code)}</span></button>`).join('')}</div>`;}
function briefOverview(issue){
 const personal=state.segments.includes('个人相关'),market=state.segments.includes('市场全局'),n=briefNews.find(n=>n.id==='2490095'),a=briefNewsAnalysis[n.id],m=briefNews.find(n=>n.id==='2490104');
 return `<div class="brief-cover-card"><div class="brief-cover-intro"><div><span class="eyebrow">闪电猫导读</span><button class="brief-cover-lead" ${briefAttrs('read','',issue)}>新产品看客户导入，出口波动看交付修复：本期重点拆解两条经营传导路径。</button></div><button class="button primary" ${briefAttrs('read','',issue)}>阅读完整${periodName(issue.period)} ${icon('arrow-up-right')}</button></div><div class="brief-cover-columns ${!personal||!market?'single':''}">${personal?`<section class="brief-cover-personal"><div class="brief-cover-kicker">重点解读 <span>端侧算力</span></div><button class="brief-cover-company" ${briefAttrs('read','',issue)}><strong>海光信息</strong><span class="tag">产品发布</span></button><button class="brief-cover-summary" ${briefAttrs('read','',issue)}>从云侧延伸到端侧，CPU 1000 系列打开新的客户场景。</button><div class="brief-cover-source">${briefSource(n.title,issue)}<span>${n.time.slice(5,16)}</span></div><button class="brief-cover-transmission" ${briefAttrs('read','',issue)}><strong>传导分析</strong>${a.teaser} ${icon('chevron-right')}</button><p class="brief-cover-followup"><strong>后续关注</strong>下一次整机适配与量产交付消息，能否让产品发布走向持续采购。</p></section>`:''}${market?`<section class="brief-cover-market"><div class="brief-cover-kicker">经营观察 <span>半导体材料</span></div><button class="brief-cover-news" ${briefAttrs('read','',issue)}><strong>中船特气：出口延后，订单仍在</strong><span>${briefNewsAnalysis[m.id].teaser}</span></button><div class="brief-cover-source">${briefSource(m.title,issue)}<span>${m.time.slice(5,16)}</span></div><div class="brief-cover-theme"><div class="brief-cover-kicker">主题联读</div><button ${briefAttrs('read','',issue)}><strong>手机 AI 与端侧算力 ${icon('arrow-up-right')}</strong><span>千问手机方案 · 海光端侧芯片</span><small>应用能否走进终端，关键在系统接入与实际任务体验。</small></button></div></section>`:''}</div><div class="brief-cover-bottom">继续阅读：传导分析 · 后续验证 · 光通信公司事项 · 主题与 ETF</div><div class="brief-cover-disclosure">依据 ${briefSnapshotData.asOf} 固定资料整理 · 关注关系为体验设定，未读取个人持仓</div></div>`;
}
function briefAlert(item,issue){const q=briefQuoteByCode(item.code);return `<article class="report-alert"><div class="report-alert-title"><button class="flow-title-link" ${briefAttrs('quote',item.company,issue)}>${item.company} ${icon('arrow-up-right')}</button>${briefQuoteValues(item.code)}<span class="tag">${item.reason}</span></div><span class="brief-cover-time">${item.code} · 行情 ${briefQuoteTime(q)}</span><h3>${opLink(esc(item.title),eventRoute(item.id,issue.id),'report-event-title')}</h3><p>${item.summary}</p><div class="report-attribution"><span>${item.a.date} · ${item.kind}</span>${briefSource(item.source,issue)}${briefSource('腾讯行情 · '+item.company,issue)}</div><div class="report-analysis"><p><strong>传导分析</strong>${item.analysis}</p><p><strong>后续关注</strong>${item.watch}</p><button ${briefAttrs('question',item.id,issue)}>${icon('arrow-up-right')}${item.question}</button></div></article>`;}
function briefDocument(issue){return `<nav class="report-index" aria-label="完整简报目录">${briefSections.map(([id,title])=>`<button ${briefAttrs('section',id,issue)}>${title}</button>`).join('')}</nav><div class="detail-body report-body">${briefSnapshotNote()}<section class="brief-editorial-opening"><strong>闪电猫导读</strong><p>本期有两条值得分开追踪的路径：海光把芯片产品从云侧延伸到端侧，研究重点是新场景能否形成客户与交付；中船特气将出口回落解释为物流延后，研究重点是后续能否补发，以及价格变化是否影响经营结果。</p><p>把它们放在一起看，前者是“新产品如何创造增量”，后者是“已有订单何时兑现”。手机 AI 方案提供应用侧的联读线索；光通信公司的激励、股本与现金管理则放在后面，分别讨论其对治理、每股口径和经营资金的影响。</p><button class="text-action" data-editorial-ask="priorities">问闪电猫：这份简报先看什么？ ${icon('arrow-up-right')}</button></section>
${briefHeading('alerts','特别提醒','先读经营传导，再读公司事项')}
<p class="report-explanation">以下解读根据本期公开资料整理。事件事实、传导判断与后续验证分开呈现。</p>${['2490095','2490104'].map(id=>briefFeaturedNews(id,issue)).join('')}<h3 class="report-company-divider">光通信 · 公司事项跟进</h3>${briefItems.map(item=>briefAlert(item,issue)).join('')}
${briefHeading('pulse','市场脉搏','必读要闻 · 资料快照')}
<ol class="report-news">${briefNews.map(n=>`<li><span class="eyebrow">${n.category} · ${n.time}</span><button class="report-news-title" ${briefAttrs('news',n.id,issue)}>${n.title}${icon('chevron-right')}</button><p>${briefNewsAnalysis[n.id].summary}</p><p class="report-editorial-read"><strong>看点</strong> ${briefNewsAnalysis[n.id].teaser}</p>${briefSource(n.title,issue)}<button class="text-action" ${briefAttrs('news',n.id,issue)}>阅读分析与后续关注 ${icon('arrow-up-right')}</button></li>`).join('')}</ol>
${briefHeading('themes','主题机会','从资讯延伸到产业与标的')}
<div class="report-theme"><button class="report-theme-name" ${briefAttrs('theme','',issue)}>光模块与算力互联 ${icon('arrow-up-right')}</button><button class="report-theme-insight" ${briefAttrs('theme','',issue)}><strong>看点</strong>AI 产业动态让算力互联继续受到关注，但本期公司披露主要是股本、激励和资金安排。主题讨论与经营增长之间，还要经过产品、客户和订单的验证。${icon('chevron-right')}</button><p class="flow-small">关联个股 · 观察名单</p>${briefRelated(issue,'stock')}<p class="flow-small">ETF 观察 · 指数成分待核验</p>${briefRelated(issue,'etf')}<button class="text-action" ${briefAttrs('theme','',issue)}>查看完整主题与关联标的 ${icon('arrow-up-right')}</button></div>
${briefHeading('etfs','ETF 机会','核对指数与主题覆盖')}
<div class="report-etf"><button class="flow-title-link" ${briefAttrs('quote','通信ETF国泰',issue)}>通信ETF国泰 · 515880 ${icon('arrow-up-right')}</button><p>${briefQuoteValues('515880')}</p><span class="brief-cover-time">行情 ${briefQuoteTime(briefQuoteByCode('515880'))}</span><p>通信 ETF 提供了观察通信产业组合的另一种视角。与单只公司相比，先弄清它覆盖哪些业务、权重如何分布，再比较主题变化；名称里有“通信”，并不等于纯粹的光模块组合。</p>${briefSource('腾讯行情 · 通信ETF国泰',issue)}<button class="text-action" ${briefAttrs('theme','etf',issue)}>查看主题 ETF 列表 ${icon('arrow-up-right')}</button></div>
${briefHeading('industries','关注行业','应用与硬件放在一起看')}
<article class="report-industry"><h3>半导体与 AI</h3><p>${briefNews[2].title}；${briefNews[1].title}。</p>${briefSource(briefNews[2].title,issue)}<div class="report-industry-read"><strong>关注方向</strong><p>手机 AI 方案代表应用入口，端侧芯片代表硬件供给。本期线索可以放在同一条产业路径中观察，但报道未说明两者存在合作关系。接下来更值得看的是适配厂商、终端产品和客户采用。</p></div></article>
<article class="report-industry"><h3>光通信</h3><p>本次材料包括中际旭创的 H 股披露、新易盛的股份归属及天孚通信的现金管理公告。</p>${briefSource(briefItems[0].source,issue)}<div class="report-industry-read"><strong>关注方向</strong><p>这些披露分别涉及股本、激励和资金安排，不能合并解释为行业订单增长；经营判断仍需业务与订单材料。</p></div></article></div>`;}
function showBriefSource(name,issue){
 const a=briefSnapshotData.announcements.find(x=>x.title===name),n=briefNews.find(x=>x.title===name),q=briefSnapshotData.quotes.find(x=>name==='腾讯行情 · '+x.name);
 const source=a||n||q;
 if(!source)return openModal('来源资料','<p>当前未取得对应材料。</p>');
 const title=a?.title||n?.title||q.name+' · 行情快照',date=a?.date||n?.time||briefQuoteTime(q);
 openModal('来源资料',`<h3>${esc(title)}</h3><dl class="flow-facts"><dt>来源</dt><dd>${source.source}</dd><dt>${q?'行情时间':'发布日期'}</dt><dd>${date}</dd><dt>本次获取</dt><dd>${briefSnapshotData.asOf}</dd></dl>${q?`<p>${briefQuoteValues(q.code)}</p><p class="flow-small">页面显示本次保存的快照；源接口可能已更新。</p>`:a?'<p>已核对公告列表标题、日期与原文链接；公告正文尚未解析，相关分析是阅读框架。</p>':`<p>${esc(briefNewsAnalysis[n.id]?.summary||n.summary)}</p>`}<a class="button" href="${esc(source.url)}" target="_blank" rel="noopener noreferrer">打开${q?'行情来源':'原文'} ${icon('external-link')}</a><p class="flow-small">证据编号：${esc(a?.evidenceId||n?.evidenceId||q.priceEvidence)}</p>`);
}
function showBriefNews(id,issue){const n=briefNews.find(n=>n.id===id),a=briefNewsAnalysis[id];if(!n||!a)return;openModal('要闻速读',`<span class="eyebrow">${n.category} · ${n.time}</span><h3>${a.headline}</h3><p>${a.summary}</p>${briefSource(n.title,issue)}${briefNewsAnalysisBlock(id,issue)}<a class="button" href="${esc(n.url)}" target="_blank" rel="noopener noreferrer">阅读原文 ${icon('external-link')}</a>`);}
function briefAsk(id,issue,followup=false,askedQuestion=null){
 const item=briefItems.find(i=>i.id===id);if(!item)return;
 setContext({kind:'brief',company:item.company,briefIssue:issue.id,briefItem:id,source:item.source,topic:item.title,analysis:item.analysis,question:askedQuestion||(followup?`下一条什么信息会改变判断？`:item.question)});openAssistant();
 $('#assistantContent').innerHTML=`<div class="flow-context-chip"><span>来自个人简报 · ${briefSnapshotData.asOf} 资料快照<br><strong>${item.company} · ${item.title}</strong></span></div><div class="user-message">${esc(context.question)}</div><p class="sample-notice">基于本页资料的解读预览 · 未接入在线 AI。</p><div class="brief-answer"><strong>先看结论</strong><p>${followup?item.watch:item.answer}</p></div><h3 class="brief-answer-heading">为什么这样判断</h3><p class="assistant-copy">${item.analysis}</p><table class="brief-answer-table"><caption>接下来重点看</caption><tbody>${item.checks.map(([a,b])=>`<tr><th>${a}</th><td>${b}</td></tr>`).join('')}</tbody></table><h3 class="brief-answer-heading">来源与边界</h3>${briefSource(item.source,issue)}<p class="assistant-copy">${item.watch}</p><button class="suggestion" ${briefAttrs('followup',id,issue)}>下一条什么信息会改变判断？${icon('arrow-up-right')}</button>`;$('#assistantContent').scrollTop=0;
}
let briefThemeOrigin=null;
function showBriefTheme(issue,filter='all',sort='relevance',retainOrigin=false){
 if(!retainOrigin)briefThemeOrigin={...route,scroll:window.scrollY};
 let securities=briefSecurities.filter(s=>filter==='all'||s.type===filter);if(sort==='name')securities=[...securities].sort((a,b)=>a.name.localeCompare(b.name,'zh-CN'));
 page('主题详情',`<button class="back-button" ${briefAttrs('theme-back')}>${icon('arrow-left')}返回简报</button>`+head('主题机会 / 观察名单','光模块与算力互联','资料快照 '+briefSnapshotData.asOf)+panel('主题解读',`<p class="flow-lead">结合公司公告与行情，继续核对实际业务、产品和订单。</p><p>股本、激励和资金管理披露不能替代经营证据。ETF 成分尚未核验，观察名单不等于成分股或受益名单。</p>${briefSnapshotNote()}`)+panel('个股与 ETF',`<div class="brief-security-controls"><label>类型<select id="briefSecurityFilter">${[['all','全部'],['stock','关联个股'],['etf','关联 ETF']].map(([v,t])=>`<option value="${v}" ${v===filter?'selected':''}>${t}</option>`).join('')}</select></label><label>排序<select id="briefSecuritySort"><option value="relevance" ${sort==='relevance'?'selected':''}>观察名单顺序</option><option value="name" ${sort==='name'?'selected':''}>名称排序</option></select></label></div><div class="brief-security-list">${securities.map(s=>`<article><div><button class="flow-title-link" ${briefAttrs('quote',s.name,issue)}>${s.name} ${icon('arrow-up-right')}</button><span class="tag">${s.code}</span>${briefQuoteValues(s.code)}</div><p>${s.note}</p><span class="flow-small">行情 ${briefQuoteTime(briefQuoteByCode(s.code))}</span><button class="text-action" ${briefAttrs('quote',s.name,issue)}>查看详情 ${icon('chevron-right')}</button></article>`).join('')}</div>`),'brief-theme');route={type:'brief-theme',issueId:issue.id,filter,sort};
 $('#briefSecurityFilter').onchange=e=>showBriefTheme(issue,e.target.value,sort,true);$('#briefSecuritySort').onchange=e=>showBriefTheme(issue,filter,e.target.value,true);
}
function briefQuote(company,issue){
 quoteReturn={...route,scroll:window.scrollY};const item=briefItems.find(i=>i.company===company),q=briefSnapshotData.quotes.find(i=>i.name===company);if(!q)return;
 page('标的详情',`<button class="back-button" data-flow="quote-back">${icon('arrow-left')}返回上一页</button>`+head('标的详情 / 行情快照',esc(company)+' · '+q.code,'腾讯行情 · '+briefQuoteTime(q))+panel('行情概览',`<div class="brief-quote-hero">${briefQuoteValues(q.code)}</div>${briefSource('腾讯行情 · '+company,issue)}<div class="flow-tabs">${['分时','日 K','周 K'].map((t,i)=>`<button data-flow="chart" class="${i===0?'selected':''}">${t}</button>`).join('')}</div><div id="quoteChart" class="flow-chart-placeholder"><span>分时图区域</span><small>已取得行情快照，走势序列尚未接入</small></div>`)+panel('相关资料',item?`<h3>${item.title}</h3><p>${item.summary}</p>${briefSource(item.source,issue)}<div class="flow-actions"><button class="button" ${briefAttrs('question',item.id,issue)}>${item.question}</button></div>`:`<h3>通信产业观察</h3><p>当前未取得指数成分，暂不判断具体公司的权重与覆盖。</p><button class="text-action" ${briefAttrs('return-theme','',issue)}>查看关联主题 ${icon('arrow-up-right')}</button>`),'brief-quote');route={type:'brief-quote',company,issueId:issue.id};
}
document.addEventListener('click',e=>{const b=e.target.closest('[data-brief-action]');if(!b||b.disabled)return;const a=b.dataset.briefAction,v=b.dataset.briefValue,issue=issueFromId(b.dataset.briefIssue)||selectedIssue||briefSnapshot().displayed;
 if(a==='read')showBrief(issue.id);
 if(a==='source')showBriefSource(v,issue);
 if(a==='news')showBriefNews(v,issue);
 if(a==='question'||a==='followup')briefAsk(v,issue,a==='followup');
 if(a==='section'){if(activeView!=='brief'||selectedIssue?.id!==issue.id)showBrief(issue.id);$(`#brief-${v}`)?.scrollIntoView({block:'start'});}
 if(a==='theme')showBriefTheme(issue,v==='etf'?'etf':'all');
 if(a==='return-theme'){if(quoteReturn?.type==='brief-theme')restoreRoute(quoteReturn);else {const origin=quoteReturn;showBriefTheme(issue);briefThemeOrigin=origin;}}
 if(a==='theme-back')restoreRoute(briefThemeOrigin||{type:'brief',issueId:issue.id});
 if(a==='quote')briefQuote(v,issue);
});
const briefContentRestore=restoreRoute;
restoreRoute=function(r){if(r?.type==='brief-quote'){briefQuote(r.company,issueFromId(r.issueId));return;}if(r?.type==='brief-theme'){showBriefTheme(issueFromId(r.issueId),r.filter,r.sort,true);if(r.scroll)window.scrollTo(0,r.scroll);return;}briefContentRestore(r);};

const briefDefaultAssistant=assistantDefault;
assistantDefault=function(){
 briefDefaultAssistant();
 if(context||taskDraft||!['overview','brief'].includes(activeView))return;
 $$('#assistantContent [data-prompt]').forEach((button,index)=>{const item=briefItems[index];button.innerHTML=esc(item.question)+icon('arrow-up-right');button.onclick=()=>briefAsk(item.id,activeView==='brief'?selectedIssue:briefSnapshot().displayed);});
};
