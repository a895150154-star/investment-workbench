/* Fixed evening observation, not a live market feed or trading-calendar calculation. */
(() => {
  function initialize(){
  const scenarios = {full:'完整模拟示例',partial:'部分资料缺失',empty:'暂无可用资料'};
  const skills = {news:'新闻查询',event:'市场点评与事件解读',industry:'行业深度分析',evidence:'证据可追溯引擎'};
  const questions = [
    {id:'before-open',label:'美股还没开盘，现在能看什么？',agentId:'event',agent:'市场解读陪伴助手',skillIds:['news','event','evidence'],expert:'市场解读'},
    {id:'connection',label:'海外芯片消息，和海光有什么关系？',agentId:'company',agent:'个股投研专家',skillIds:['event','industry','evidence'],expert:'个股研究'},
    {id:'next-check',label:'明早需要核对哪些变化？',agentId:'event',agent:'市场解读陪伴助手',skillIds:['news','event','evidence'],expert:'市场解读'}
  ];
  questions.forEach(q=>{Object.freeze(q.skillIds);Object.freeze(q);});
  let scenario = 'full';
  const answers = new Map();
  function snapshot(issue,mode=scenario){
    const empty=mode==='empty',partial=mode==='partial';
    return {
      issueId:issue.id,day:issue.day,scenario:mode,demo:true,time:'20:00',timeZone:'Asia/Shanghai',sourceKeys:[],
      rows:empty?[]:[
        {id:'europe',stage:'交易中（模拟）',title:partial?'欧洲半导体行情暂未取得':'欧洲半导体示例指数 +1.2%',text:partial?'缺少这一时点的行情，先保留观察位置，不补数字。':'海外芯片板块出现上涨线索，仍不能据此判断海光明日涨跌。',status:partial?'missing_input':'preset'},
        {id:'us',stage:'未开盘（模拟）',title:'美股未开盘，先看芯片需求消息',text:'模拟消息：一家海外芯片企业上调需求预期。仍需核对采购证据及与国内公司的关系。',status:'preset'},
        {id:'dollar',stage:'背景观察（模拟）',title:'美元示例指数 +0.3%',text:'作为外部环境线索保留，尚不能确认对海光的具体影响。',status:'preset'}
      ]
    };
  }
  function questionHTML(issue){
    const selected=answers.get(issue.id)?.questionId;
    return `<div class="research-question-list overseas-questions">${questions.map(q=>`<button type="button" class="suggestion research-demo-question" data-overseas-question="${q.id}" data-overseas-issue="${esc(issue.id)}" aria-pressed="${selected===q.id}"><span class="research-question-text">${esc(q.label)}</span><span class="research-question-expert">${esc(q.expert)}</span>${icon('chevron-right')}</button>`).join('')}</div>`;
  }
  function body(issue){
    const data=snapshot(issue);
    return `<section class="evening-overseas" id="brief-overseas" aria-label="今晚外盘观察" data-overseas-scenario="${data.scenario}"><header class="overseas-heading"><h3>今晚外盘看什么</h3><span>模拟示例 · ${data.time} 北京时间</span></header><p class="overseas-notice">${esc(issue.day)} 演示期次 · 以下行情、消息和市场状态均为虚构，历史期次复用同一情景。</p>${data.rows.length?`<ol class="overseas-information">${data.rows.map(row=>`<li data-overseas-market="${row.id}" data-overseas-status="${row.status}"><div class="overseas-stage">${esc(row.stage)}</div><h4>${esc(row.title)}</h4><p>${esc(row.text)}</p></li>`).join('')}</ol>`:'<p class="overseas-empty" role="status">外盘资料暂未取得，当前不能判断海外行情或与海光的关系。已录入的个人回顾和历史资料仍可阅读。</p>'}<div class="research-workspace-heading"><h3>继续研究</h3><small>点击问题，直接问闪电猫</small></div>${questionHTML(issue)}${opLink('继续海光事件研究 '+icon('arrow-up-right'),eventRoute(researchDemo.id,issue.id),'text-action overseas-research-link')}</section>`;
  }
  function interpretation(q,data){
    if(data.scenario==='empty')return {conclusion:'当前没有可用外盘资料，先保留核对清单。',next:'补齐海外市场状态、行情时点和新闻原文，再与海光同期披露对照；现在不判断传导影响。'};
    if(q.id==='before-open')return {conclusion:'这个20:00模拟情景中，美股尚未开盘；先区分新闻线索与已经发生的行情。',next:(data.scenario==='partial'?'欧洲行情也缺失。':'欧洲半导体+1.2%是交易中的模拟快照。')+'之后补美股正式交易结果及对应时间，不能把当前消息写成美股收盘表现。'};
    if(q.id==='connection')return {conclusion:'海外芯片需求消息提供行业线索，尚不能证明海光获得订单或收入。',next:'核对消息原文中的产品、客户和采购，再找海光自身的适配、交付和经营披露；外盘上涨不能直接推出海光上涨。'};
    return {conclusion:'下一次研究先核对海外实际交易结果，再看A股相关板块与海光自身的新披露。',next:'补海外收盘行情和时点；对照A股同期表现；检查海光客户、交付及采购资料。三类证据分别判断，不预设明日涨跌。'};
  }
  function renderAnswer(entry,{open=false,focus=false}={}){
    const issue=issueFromId(entry.data.issueId),q=questions.find(x=>x.id===entry.questionId),data=entry.data;
    const answer=interpretation(q,data);
    setContext({kind:'evening-overseas',company:'外盘观察',briefIssue:issue.id,question:q.label,questionId:q.id,source:'固定外盘模拟情景',sourceKeys:[],overseasSnapshot:data,researchBinding:{agentId:q.agentId,skillIds:[...q.skillIds]}});
    if(open)openAssistant();$('#assistantContent').hidden=false;$('#chatForm').hidden=false;
    $('#assistantContent').innerHTML=`<section class="overseas-answer" data-overseas-answer="${q.id}" data-overseas-answer-issue="${esc(issue.id)}" data-overseas-answer-scenario="${data.scenario}"><small class="research-demo-label">外盘观察 · ${esc(issue.day)} 晚报 · ${data.time} 北京时间 · ${scenarios[data.scenario]}</small><div class="user-message" tabindex="-1">${esc(q.label)}</div><p class="research-result-conclusion">${esc(answer.conclusion)}</p><p class="overseas-answer-next"><strong>下一步</strong>${esc(answer.next)}</p><details class="research-result-details"><summary>查看资料范围与研究分工</summary><p>本次只使用上方固定模拟情景；没有真实外盘行情或新闻原文，不引用海光历史报道为模拟消息作证。</p><p>Agent：${esc(q.agent)}</p><p>拟用 Skill：${q.skillIds.map(id=>skills[id]).join('、')}</p><p>固定流程：核对市场阶段和时点，区分事实与传导假设，保留缺口，再给下一次研究清单。</p></details><small class="research-result-notice">预设解读示例 · 未实际调用 Agent / Skill · 不作为海光涨跌原因</small></section>`;
    $('#assistantContent').scrollTop=0;
    document.querySelectorAll('[data-overseas-question]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.overseasIssue===issue.id&&b.dataset.overseasQuestion===q.id)));
    if(focus)$('#assistantContent .user-message')?.focus({preventScroll:true});
  }
  function ask(id,issueId){
    const issue=issueFromId(issueId),q=questions.find(x=>x.id===id);
    if(!q||issue?.period!=='evening')return false;
    const entry={questionId:id,data:snapshot(issue)};answers.set(issue.id,entry);renderAnswer(entry,{open:true,focus:true});return true;
  }
  const originalDocument=briefDocument;
  briefDocument=function(issue){
    const html=originalDocument(issue);if(issue.period!=='evening')return html;
    const template=document.createElement('template');template.innerHTML=html;
    template.content.querySelector('#brief-summary')?.insertAdjacentHTML('afterend',body(issue));
    return template.innerHTML;
  };
  const originalOverview=briefOverview;
  briefOverview=function(issue){
    const html=originalOverview(issue);if(issue.period!=='evening'||!state.segments.includes('市场全局'))return html;
    const template=document.createElement('template');template.innerHTML=html;
    const content=scenario==='empty'?'外盘资料暂未取得，可查看下一次核对清单。':scenario==='partial'?'美股未开盘；欧洲行情暂缺，已有消息与缺口分别展示。':'欧洲芯片示例+1.2%；美股未开盘，先看盘前消息。';
    template.content.querySelector('.brief-cover-market')?.insertAdjacentHTML('afterbegin',`<div class="overseas-preview"><strong>今晚外盘 · 模拟20:00</strong><p>${content}</p><button class="text-action" ${briefAttrs('section','summary',issue)}>查看外盘观察 ${icon('arrow-up-right')}</button></div>`);
    return template.innerHTML;
  };
  const originalShow=showBrief;
  showBrief=function(...args){
    const result=originalShow.apply(this,args),issue=selectedIssue;
    if(issue?.period==='evening'&&answers.has(issue.id))renderAnswer(answers.get(issue.id));
    else if(context?.kind==='evening-overseas'){
      context=null;assistantDefault();
    }
    return result;
  };
  const originalEvent=showTrackedEvent;
  showTrackedEvent=function(...args){
    if(context?.kind==='evening-overseas')context=null;
    return originalEvent.apply(this,args);
  };
  function setScenario(mode){
    if(!Object.hasOwn(scenarios,mode))return false;
    scenario=mode;refreshBrief(true);
    if(activeView==='brief'&&selectedIssue?.period==='evening'){
      const position=window.scrollY;showBrief(selectedIssue.id);window.scrollTo({top:position,behavior:'instant'});
    }
    return true;
  }
  const originalNotes=$('#designNotes').onclick;
  $('#designNotes').onclick=function(...args){
    originalNotes?.apply(this,args);
    const issue=reportIssue((issueFromId(route.issueId)||briefSnapshot().displayed).day,'evening');
    $('#modalBody').insertAdjacentHTML('beforeend',`<section class="overseas-review"><h3>晚间外盘演示场景</h3><p>固定20:00北京时间的情景，不读取实时行情或交易日历。切换只影响本次展示，不保存偏好或生成追踪资料，刷新恢复完整模拟示例。已有回答保留提问时的情景快照。</p><div class="profile-review-controls" role="group" aria-label="外盘资料演示场景">${Object.entries(scenarios).map(([id,label])=>`<button type="button" class="button" data-overseas-scenario-choice="${id}" aria-pressed="${scenario===id}">${label}</button>`).join('')}</div><button class="text-action" data-overseas-open ${briefAttrs('section','summary',issue)}>打开晚报外盘观察 ${icon('arrow-up-right')}</button></section>`);
  };
  window.addEventListener('click',e=>{if(e.target.closest('[data-overseas-open]'))closeModal();},true);
  document.addEventListener('click',e=>{
    const choice=e.target.closest('[data-overseas-scenario-choice]');
    if(choice){e.preventDefault();closeModal();setScenario(choice.dataset.overseasScenarioChoice);return;}
    const button=e.target.closest('[data-overseas-question]');
    if(button){e.preventDefault();ask(button.dataset.overseasQuestion,button.dataset.overseasIssue);}
  });
  // Window capture runs before the legacy individual-stock-only chat sender.
  window.addEventListener('submit',e=>{
    if(e.target!==$('#chatForm')||context?.kind!=='evening-overseas'||taskDraft||$('#modal').open)return;
    e.preventDefault();e.stopImmediatePropagation();
    const text=$('#chatInput').value.trim();if(!text)return;
    const question=questions.find(q=>q.label===text)||(/海光|关系|影响/.test(text)?questions[1]:/明早|明天|下一交易日/.test(text)?questions[2]:/美股|未开盘|外盘/.test(text)?questions[0]:null);
    if(question){ask(question.id,context.briefIssue);$('#chatInput').value='';}
    else {$('#assistantContent').insertAdjacentHTML('beforeend','<p class="sample-notice" role="status">这个问题超出外盘预设样板，请选择工作台中的问题继续研究。没有执行新的检索或分析。</p>');}
  },true);
  window.eveningOverseas=Object.freeze({questions:Object.freeze(questions),snapshot,body,ask,setScenario,mode:()=>scenario});
  refreshBrief(true);
  if(activeView==='brief'&&selectedIssue?.period==='evening')showBrief(selectedIssue.id);
  }
  if(document.readyState!=='complete')document.addEventListener('DOMContentLoaded',initialize,{once:true});
  else initialize();
})();
