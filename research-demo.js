/* Shared fixed research case. Reading this module never writes user settings. */
(() => {
  const sources = [
    {key:'cls-2490095',title:'海光信息发布首款面向端侧的算力芯片CPU1000系列',publisher:'财联社',type:'新闻',date:'2026-09-22 16:08:36',url:'https://www.cls.cn/detail/2490095',role:'发布快讯',contribution:'记录新品发布、面向的场景及公司对产品系列的介绍。',checked:'2026-09-28'},
    {key:'stcn-4196793',title:'算力下沉产业现场：海光切入端侧市场，行业竞速转向生态比拼',publisher:'证券时报',type:'新闻',date:'2026-09-23 19:17',url:'https://www.stcn.com/article/detail/4196793.html',role:'现场报道',contribution:'补充客户选型、适配与生态协作的观察，提示产品验证需要时间。',checked:'2026-09-28'},
    {key:'nbd-4590261',title:'从数据中心迈入“工控”新赛道，海光信息端侧芯片能否开辟新增长曲线？',publisher:'每日经济新闻',type:'新闻',date:'2026-09-23 19:57:38',url:'https://www.nbd.com.cn/articles/2026-09-23/4590261.html',role:'采访报道',contribution:'补充工控客户认证、软件迁移和长期供货的商业化难点。',checked:'2026-09-28'}
  ];
  const observations = [
    {id:'adaptation',label:'客户适配',check:'公司或整机合作方是否披露适配机型、应用场景与验证结果？'},
    {id:'delivery',label:'实际交付',check:'是否出现正式交付披露？区分样机、试用与批量交付。'},
    {id:'purchase',label:'持续采购',check:'是否有后续采购及经营披露支持持续需求与业务贡献？'}
  ];
  const questions = [
    {id:'release',label:'这次产品发布了什么？哪些信息还不能确认？',category:'事件解读',prompt:'请使用市场点评与事件解读，帮我核对海光这次产品发布了什么，哪些信息还不能确认。',agentId:'event',agent:'市场解读陪伴助手',skillIds:['event','evidence'],skillNames:['市场点评与事件解读','证据可追溯引擎'],focus:'事件事实',conclusion:'产品方向已公开，客户采用与经营贡献仍待验证。',evidence:'三份历史报道记录 CPU 1000 系列发布，并补充适配、生态与商业化难点。',unconfirmed:'采购、批量交付和收入贡献均缺直接依据。',next:'先找公司发布原文，再补适配及交付披露。',sourceKeys:['cls-2490095','stcn-4196793','nbd-4590261']},
    {id:'revenue',label:'从产品发布到形成收入，还需要哪些证据？',category:'经营证据',prompt:'请由个股投研专家结合这次发布，帮我拆解从客户采用、交付到形成收入，还需要哪些证据。',agentId:'company',agent:'个股投研专家',skillIds:['event','basic','financial','evidence'],skillNames:['市场点评与事件解读','公司基本面速览','股票财务分析','证据可追溯引擎'],focus:'经营证据',conclusion:'发布不等于收入，要核对客户采用、交付与收入确认。',evidence:'现场与采访报道提示客户认证、软件迁移和长期供货是落地环节。',unconfirmed:'缺客户验证、交付规模及对应财报。',next:'补适配、交付披露，再核对财报中的收入和回款。',sourceKeys:['stcn-4196793','nbd-4590261']},
    {id:'value',label:'用巴菲特视角看，这次发布会改变海光的长期价值判断吗？',category:'价值投资',prompt:'请用巴菲特价值投资视角，帮我分析这次发布是否改变海光的长期价值判断，并说明还缺哪些财务和估值依据。',agentId:'value',agent:'巴菲特·价值投资专家',skillIds:['event','financial','valuation','evidence'],skillNames:['市场点评与事件解读','股票财务分析','股票估值分析','证据可追溯引擎'],focus:'长期价值',conclusion:'发布带来研究线索，长期价值改善仍缺证据。',evidence:'历史报道支持产品拓展方向；持续竞争力、盈利质量仍需另行核验。缺少财务与估值输入，无法计算估值倍数或合理价格。',unconfirmed:'缺财报、现金流及同期估值输入。',next:'补财报和持续采购证据，核对盈利、现金流后再讨论估值。',sourceKeys:['cls-2490095','stcn-4196793','nbd-4590261']}
  ];
  sources.forEach(Object.freeze); observations.forEach(Object.freeze);
  questions.forEach(q=>{[q.sourceKeys,q.skillIds,q.skillNames].forEach(Object.freeze);Object.freeze(q);});
  // Results are scoped to this event and issue, and never written to user storage.
  const results=new Map();
  const resultKey=issue=>'2490095|'+issue.id;
  function issueFor(id){return issueFromId(id)||issueFromId(context?.briefIssue)||issueFromId(route.issueId)||briefSnapshot().displayed;}
  function questionButtons(issueId){const selected=results.get('2490095|'+issueId),ordered=window.profileDelivery?.questionOrder(questions)||questions;return `<div class="research-question-list">${ordered.map((q,n)=>`<button type="button" class="suggestion research-demo-question" data-research-question="${questions.indexOf(q)}" data-research-issue="${esc(issueId)}" aria-pressed="${selected?.id===q.id}"><span class="research-question-text">${esc(q.label)}</span>${n===0&&window.profileDelivery?.mode()!=='unset'?'<span class="profile-question-priority">优先推荐</span>':''}<span class="research-question-expert" title="${esc(q.agent)}">${esc(q.agentId==='value'?'巴菲特':q.agentId==='company'?'个股研究':'市场解读')}</span>${icon('chevron-right')}</button>`).join('')}</div>`;}
  function connect(issue,question,q,{open=true}={}){
    setContext({kind:'event-research-demo',company:'海光信息',eventId:'2490095',security:'event-haiguang',briefIssue:issue.id,readingFocus:q?.focus||'事件进展',source:sources[0].title,sourceKeys:q?.sourceKeys||sources.map(s=>s.key),question,questionId:q?.id,researchBinding:q?{agentId:q.agentId,skillIds:[...q.skillIds]}:null});
    if(open)openAssistant();$('#assistantContent').hidden=false;$('#chatForm').hidden=false;
  }
  function prompts(issue){return `<section class="research-demo-questions" aria-label="海光事件的三个预设问题">${questionButtons(issue.id)}</section>`;}
  function resultHTML(q,issue){
    const sourceLinks=sources.filter(s=>q.sourceKeys.includes(s.key)).map(s=>`<li><a href="${esc(s.url)}" target="_blank" rel="noopener noreferrer">${esc(s.publisher)} · ${esc(s.role)}</a><time>${esc(s.date)}</time></li>`).join('');
    return `<section class="research-demo-answer research-compact-answer" data-research-result="${q.id}" data-result-issue="${esc(issue.id)}"><p class="research-result-conclusion">${esc(q.conclusion)}</p><dl class="research-result-points"><div><dt>还缺什么</dt><dd>${esc(q.unconfirmed)}</dd></div><div><dt>下一步</dt><dd>${esc(q.next)}</dd></div></dl>${window.profileDelivery?.sampleAnswerHTML(q.id,issue)||''}<details class="research-result-details"><summary>查看依据与研究分工</summary><p><strong>已有依据</strong>${esc(q.evidence)}</p><p><strong>完整问法</strong>${esc(q.prompt)}</p><p><strong>Agent</strong>${esc(q.agent)}</p><p><strong>拟用 Skill</strong>${esc(q.skillNames.join('、'))}</p><ul class="research-demo-answer-sources" aria-label="回答所依据的原文">${sourceLinks}</ul>${q.id==='value'?'<p>采用价值投资方法框架，不代表巴菲特本人观点。</p>':''}<p>只使用以上历史报道；本期模拟进展未作为经营兑现证据。</p></details><small class="research-result-notice">预设解读示例 · 未实际调用 Agent / Skill</small></section>`;
  }
  function workspace(issue){return `<div class="research-workspace" data-research-workspace="${esc(issue.id)}">${window.profileDelivery?.summaryHTML(issue)||''}<div class="research-workspace-heading"><h3>继续研究</h3><small>点击问题，直接问闪电猫</small></div>${prompts(issue)}</div>`;}
  function hasWorkspace(issue){return route.type==='event-detail'&&String(route.eventId)==='2490095'&&[...document.querySelectorAll('[data-research-workspace]')].some(el=>el.dataset.researchWorkspace===issue.id);}
  function updateWorkspace(issue){document.querySelectorAll('[data-research-workspace]').forEach(el=>{if(el.dataset.researchWorkspace===issue.id)el.querySelectorAll('[data-research-question]').forEach(b=>b.setAttribute('aria-pressed',String(questions[Number(b.dataset.researchQuestion)]===results.get(resultKey(issue)))));});}
  function issueLabel(issue){return `海光信息 · ${issue.day} · ${issue.period==='morning'?'早报':'晚报'}`;}
  function ready(issueId){const issue=issueFor(issueId);connect(issue,'围绕海光这次发布继续研究',null,{open:false});$('#assistantContent').innerHTML=`<div class="research-demo-assistant"><span class="research-demo-label">${esc(issueLabel(issue))}</span><p class="research-ready-note">点击工作台中的问题，我会在这里继续解读。</p></div>`;$('#assistantContent').scrollTop=0;}
  function openQuestions(issueId){
    const issue=issueFor(issueId);if(hasWorkspace(issue))return ready(issue.id);connect(issue,'核对海光信息的事件进展');
    $('#assistantContent').innerHTML=`<div class="research-demo-assistant"><span class="research-demo-label">${esc(issueLabel(issue))}</span><h2 class="assistant-greeting">想先核对哪一项？</h2>${prompts(issue)}<small class="research-result-notice">历史资料 · 预设解读示例</small></div>`;
    $('#assistantContent').scrollTop=0;
  }
  function resume(issueId){const issue=issueFor(issueId),q=results.get(resultKey(issue));if(q)ask(q.label,issue.id,{focus:false});else ready(issue.id);}
  function ask(question,issueId,{focus=true}={}){
    const issue=issueFor(issueId),q=questions.find(q=>q.label===String(question).trim()||q.prompt===String(question).trim());
    connect(issue,question,q);
    if(q){results.set(resultKey(issue),q);updateWorkspace(issue);}
    const inWorkspace=hasWorkspace(issue);
    $('#assistantContent').innerHTML=`<div class="research-demo-assistant"><span class="research-demo-label">${esc(issueLabel(issue))}</span><div class="user-message" tabindex="-1">${esc(question)}</div>${q?`${resultHTML(q,issue)}${inWorkspace?'':`<button class="text-action research-change-question" type="button" data-research-picker="${esc(issue.id)}" data-research-selected="${q.id}">换个问题</button>`}`:`<div class="research-demo-scope" role="status"><strong>当前样板支持三个海光问题</strong><p>${inWorkspace?'这条输入超出了预设范围，请点击工作台中的问题继续研究。':'这条输入超出了预设范围，请选择一个问题继续研究。'}</p></div>${inWorkspace?'':prompts(issue)}`}</div>`;
    $('#assistantContent').scrollTop=0;
    if(focus)$('#assistantContent .user-message')?.focus({preventScroll:true});
  }
  document.addEventListener('click',e=>{
    const picker=e.target.closest('[data-research-picker]');if(picker){openQuestions(picker.dataset.researchPicker);const index=questions.findIndex(q=>q.id===picker.dataset.researchSelected);$('#assistantContent [data-research-question="'+Math.max(index,0)+'"]')?.focus({preventScroll:true});return;}
    const b=e.target.closest('[data-research-question]');if(!b)return;
    const q=questions[Number(b.dataset.researchQuestion)];if(q){e.preventDefault();e.stopImmediatePropagation();ask(q.label,b.dataset.researchIssue);}
  },true);
  // Run before the generic collaboration-demo sender, retaining its behavior elsewhere.
  document.addEventListener('submit',e=>{
    if(e.target!==$('#chatForm')||taskDraft||$('#eventTrackForm')||$('#researchTrackForm')||context?.kind==='brief-customization')return;
    if(!(route.type==='event-detail'&&String(route.eventId)==='2490095')&&context?.kind!=='event-research-demo')return;
    e.preventDefault();e.stopImmediatePropagation();const text=$('#chatInput').value.trim();if(!text)return;
    ask(text,context?.briefIssue||route.issueId);$('#chatInput').value='';
  },true);
  window.researchDemo = Object.freeze({
    id:'2490095',identity:'event-haiguang',name:'海光信息',focus:'事件进展',
    relation:'你长期关注海光信息，阅读重点是事件进展。本次产品发布提供了新的研究起点，下一步要核对客户适配、实际交付和持续采购。',
    summary:'据财联社报道，海光信息发布 CPU 1000 系列，面向低功耗、嵌入式和端侧算力场景。产品方向已公开，客户采购、交付及收入兑现仍需后续资料。',
    judgment:'产品方向已公开，商业兑现仍待验证。',
    sources:Object.freeze(sources),observations:Object.freeze(observations),questions:Object.freeze(questions),
    isCase:id=>String(id)==='2490095',openQuestions,ready,resume,ask,questionButtons,workspace,
    status:issue=>window.researchTracking?.forDay(issue?.day).materials.length?'本期进展为模拟资料 · 固定真实资料为历史解读':issue?.day>'2026-09-23'?'本期无匹配新资料 · 最近一次历史解读':'固定案例解读 · 并非该期归档报告'
  });
})();
