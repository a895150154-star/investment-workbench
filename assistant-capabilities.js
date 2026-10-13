/* V2.53. Deterministic orchestration demonstration; no model or tool execution; habits are saved only after explicit confirmation.
 * Expert names follow the supplied company catalog. All task routing remains a local demonstration.
 */
(() => {
  const q=s=>document.querySelector(s);
  const agents={
    auto:{name:'闪电猫·全能金融投研专家',short:'全能',desc:'结合本次问题与已确认偏好协调专家，沿用你的研究方法。'},
    event:{name:'市场解读陪伴助手',short:'市场',desc:'串起事件事实、传导影响与后续验证点。'},
    company:{name:'个股投研专家',short:'个股',desc:'按问题组织行业、业务、财务与估值研究，不据此认定投资风格。'},
    fund:{name:'基金研究陪伴助手',short:'基金',desc:'查看基金研究的拟用能力；当前原型尚无基金资料样例。'},
    value:{name:'巴菲特·价值投资专家',short:'价值',desc:'由你明确指定价值投资视角；演示盈利质量与估值检查框架。'}
  };
  const skills={
    basic:{name:'公司基本面速览',desc:'分清公司背景、当前事项与经营证据。',input:'所选公司、本期事件摘要',output:'本期材料提供事件线索；业务结构与竞争位置仍需正式披露核验。',gap:'未补充最新公司基础数据。'},
    news:{name:'新闻查询',desc:'整理本期已有报道与来源范围。',input:'本期固定资料的标题与摘要',output:'已展示资料中保留的事件摘要；没有发起新的新闻搜索。',gap:'未获取本期快照之后的新报道。'},
    industry:{name:'行业深度分析',desc:'提出需求、产业链与兑现路径问题。',input:'所选对象及既有主题标签',output:'研究框架：需求变化 → 客户采用 → 交付 → 经营兑现；各环节分别需要证据。',gap:'行业供需、份额及客户验证材料未获取。'},
    financial:{name:'股票财务分析',desc:'核对盈利质量、现金流与报告期。',input:'拟核对最新财报及现金流证据',output:'示例检查项：盈利与现金流是否一致、一次性损益是否影响判断、报告期是否对齐。',gap:'本轮没有财报取数，财务结果未获取。'},
    valuation:{name:'股票估值分析',desc:'检查估值口径、预期与数据缺口。',input:'拟核对同期市值、利润及一致预期',output:'示例检查项：区分事实利润与预期，核对口径、报告期和分歧；缺输入时不计算倍数。',gap:'本轮未取得估值输入，未调用计算库，估值结果未获取。'},
    event:{name:'市场点评与事件解读',desc:'区分事件事实、影响推断和验证点。',input:'既有事件摘要与待验证事项',output:'沿用原简报的事件分析，展示影响成立所需条件；不把发布或公告直接视为业绩兑现。',gap:'后续进展与公告条款仍以原资料缺口为准。'},
    evidence:{name:'证据可追溯引擎',desc:'所有方案都保留来源与资料缺口。',input:'前序示例步骤及本期来源入口',output:'汇总资料范围、推断边界与缺失输入；保留原资料查看入口。',gap:'这里只演示核验清单，没有执行引擎或新增证据。'}
  };

  let selection={agent:'auto',skills:[]},run=null,viewState=null;
  const panel=document.createElement('section');panel.id='capabilityPanel';panel.className='assistant-scroll capability-panel';panel.hidden=true;panel.setAttribute('aria-label','画像协作演示');q('#assistantContent').after(panel);
  function presetBinding(){return ['event-research-demo','evening-overseas'].includes(context?.kind)?context.researchBinding:null;}
  function toolbar(){const preset=presetBinding();q('#capabilityAgent').textContent='Agent · '+agents[preset?.agentId||selection.agent].short;q('#capabilitySkills').textContent='Skill · '+(preset?preset.skillIds.length+' 项':selection.skills.length?selection.skills.length+' 项':'自动');}
  function options(kind){
    const preset=presetBinding();
    if(preset){openModal('这道问题的研究分工',`<p class="cap-dialog-lead">${esc(agents[preset.agentId].name)}</p><p>${preset.skillIds.map(id=>esc(skills[id].name)).join('、')}</p><p class="cap-boundary">这道预设问题使用上述分工。仅为演示，尚未实际调用。其他问题的手动选择仍保留。</p><div class="modal-actions"><button class="button primary" data-cap="dismiss">返回解读</button></div>`,context.kind==='evening-overseas'?'晚间外盘 · 本次分工':'海光事件 · 本次分工');return;}
    const catalog=kind==='agent'?agents:skills;
    openModal(kind==='agent'?'选择本次研究 Agent':'选择本次研究 Skill',`<p class="cap-dialog-lead">${kind==='agent'?'闪电猫负责协调；可指定公司专家，按你的本次问题组织研究。':'默认由全能助手安排。可指定本次优先使用的能力，来源与缺口检查始终保留。'}</p><p class="cap-boundary">仅用于当前页面会话的演示，不会写入长期画像。全部能力尚未在本原型执行。</p><form id="capabilityChoice"><div class="cap-choice-list">${Object.entries(catalog).map(([id,item])=>`<label class="cap-choice"><input type="${kind==='agent'?'radio':'checkbox'}" name="capChoice" value="${id}" ${kind==='agent'?(selection.agent===id?'checked':''):(selection.skills.includes(id)||id==='evidence'?'checked':'')} ${kind==='skills'&&id==='evidence'?'disabled':''}><span><strong>${esc(item.name)}</strong><small>${esc(item.desc)}</small></span></label>`).join('')}</div>${kind==='skills'?'<p class="cap-boundary">股票技术面分析：本轮暂无行情序列及分析样例，暂不提供选择。</p>':''}<div class="modal-actions"><button class="button" type="button" data-cap="dismiss">取消</button>${kind==='skills'?'<button class="button" type="button" data-cap="auto-skills">恢复自动</button>':''}<button class="button primary" type="submit">应用本次选择</button></div></form>`,'Agent / Skill · 演示配置');
    q('#capabilityChoice').onsubmit=e=>{e.preventDefault();const values=[...q('#capabilityChoice').querySelectorAll('input:checked:not(:disabled)')].map(x=>x.value);if(kind==='agent')selection.agent=values[0]||'auto';else selection.skills=values;toolbar();closeModal();toast('已应用；下一次编排生效，不修改长期画像');};
  }
  function material(id){const c=briefItems.find(x=>x.id===id),n=briefNewsAnalysis[id];return c?{name:c.company,title:c.title,summary:c.summary,watch:c.watch,source:c.source}:n?{name:n.object,title:n.headline,summary:n.summary,watch:n.watch,source:briefNews.find(x=>x.id===id)?.title}:null;}
  function profile(id){return {method:researchMethods.match(id),focus:briefPrefs.focus,label:briefPersonalization.focusLabel(),targets:briefPrefs.targets,risk:researchRisk.label(briefPrefs.riskPreference)};}
  function fundGap(){
    openModal('基金研究陪伴助手',`<p class="cap-dialog-lead">基金问题由基金研究陪伴助手承接。</p><p>拟用 Skill：基金综合分析、基金收益分析、基金风险分析、基金持仓分析。</p><p class="cap-boundary">当前原型没有基金资料样例，尚不能展示诊断过程或结果。这里仅展示专家与能力的对应关系，未执行调用。</p><div class="modal-actions"><button class="button" data-cap="agent">选择其他专家</button><button class="button primary" data-cap="dismiss">返回对话</button></div>`,'专家目录 · 待补演示资料');
  }
  function prepare({fromSend=false,notice=''}={}){
    if(selection.agent==='fund'||/基金|ETF/i.test(q('#chatInput').value)){fundGap();return;}

    const items=briefPersonalization.candidates(),current=items.find(x=>x.name===context?.company),confirmed=items.find(x=>x.reasons.some(r=>r.label==='长期关注'));
    const chosen=fromSend?null:current||(!context?.company?confirmed:null);const sentDraft=q('#chatInput').value.trim();
    openModal('让全能助手组织一次研究',`<p class="cap-dialog-lead">先核对本次对象与问题，再看画像如何影响分工。</p><p class="cap-boundary">固定场景编排演示 · 未调用在线 AI、Agent 或 Skill。</p><form id="capabilityPrepare"><label class="field"><span>研究对象 · 本期固定资料</span><select name="object" required><option value="">请选择一只样例个股</option>${items.map(x=>`<option value="${x.id}" ${chosen?.id===x.id?'selected':''}>${esc(x.name)}</option>`).join('')}</select></label><p class="cap-boundary">${fromSend?'尚未选定对象，请选择本次要看的样例；未配置的公司暂不能生成结果。':chosen&&current?'已带入当前助手的研究对象。':context?.company?'当前上下文没有可匹配的单只样例个股，请自行选择。':confirmed?'优先带入与你已确认关注匹配的对象，可更换。':'没有匹配到已确认关注，请自主选择样例。'} 选择不会加入持仓、自选或长期关注。</p><label class="field"><span>本次研究问题</span><textarea name="question" maxlength="240" required>${esc(q('#chatInput').value.trim()||'结合我的研究偏好，梳理这家公司本期资料和待验证问题。')}</textarea></label><div class="cap-prompt-row"><button type="button" data-cap-prompt="请优先检查财务与估值的资料缺口。">财务与估值</button><button type="button" data-cap-prompt="请先梳理行业与业务兑现需要什么证据。">行业与业务</button><button type="button" data-cap-prompt="请核对本次事件和后续进展。">事件进展</button></div><p class="cap-boundary">本次指定：${esc(agents[selection.agent].name)} · ${selection.skills.length?selection.skills.map(id=>skills[id].name).join('、'):'Skill 自动安排'}。自由文本只参与预设关键词规则，不能生成新分析。</p><button class="text-action" type="button" data-cap="method-example">体验：系统如何发现持续关注</button><p class="cap-boundary">用三个日期的普通提问演示主动确认；样例记录不会写入你的近期线索。</p><p id="capPrepareError" role="alert">${esc(notice)}</p><div class="modal-actions"><button class="button" type="button" data-cap="dismiss">取消</button><button class="button primary" type="submit">${fromSend?'查看演示结果':'预览协作方案'}</button></div></form>`,'画像 → Agent → Skill');
    q('#capabilityPrepare').onsubmit=e=>{e.preventDefault();const f=new FormData(e.target),id=f.get('object'),question=String(f.get('question')).trim();if(/基金|ETF/i.test(question)){fundGap();return;}if(!material(id)||!question){q('#capPrepareError').textContent='请选择样例个股并填写本次问题。';return;}if(items.some(x=>x.id!==id&&(question.includes(x.name)||question.includes(x.identity)))){q('#capPrepareError').textContent='问题中包含其他样例公司；本轮只演示一家公司，请让研究对象与问题保持一致。';return;}start(id,question,{record:fromSend||/以后|每次|习惯|通常|一直/.test(question),natural:fromSend});if(fromSend&&q('#chatInput').value.trim()===sentDraft)q('#chatInput').value='';closeModal();};
  }
  function dispatch(p,question){
    const resolved=capabilityRouting.resolve(question,p,selection,researchMethods.choices);
    return {...resolved,reason:resolved.basis};
  }
  function close(){q('#capabilityExit').hidden=true;panel.hidden=true;panel.replaceChildren();run=null;if(viewState){q('#assistantContent').hidden=viewState.content;q('#chatForm').hidden=viewState.form;q('.cap-composer-meta>span').textContent=viewState.hint;viewState=null;}}
  function start(id,question,{record=false,natural=false}={}){
    const p=profile(id),choice=dispatch(p,question),m=material(id),ids=choice.ids,team=collaborationDemo.plan(choice);
    const candidate=researchMethods.detect(id,question);if(record&&!choice.gap){researchMethods.record(candidate);researchProfile.record(m.name,'ask');}
    close();viewState={content:q('#assistantContent').hidden,form:q('#chatForm').hidden,hint:q('.cap-composer-meta>span').textContent};q('#assistantContent').hidden=true;q('#chatForm').hidden=false;q('.cap-composer-meta>span').textContent=m.name+(natural?' · 本次提问':' · 协作演示');panel.hidden=false;q('#capabilityExit').hidden=false;openAssistant();
    run={id,question,p,choice,m,ids,team,manualAgent:selection.agent!=='auto',natural,issue:reportIssue('2026-09-29','morning'),candidate,canLearn:!choice.gap&&record&&!selection.skills.length&&!!candidate&&choice.agent===researchMethods.choices[candidate.key].agent,prompted:false,learning:'',step:0,manual:selection.skills.length>0,relation:briefPersonalization.candidates().find(x=>x.id===id)?.reasons.filter(x=>!['近期提问','近期浏览'].includes(x.label))||[]};render();panel.scrollTop=0;
  }
  function outputSections(r){
    if(r.choice.gap)return [['本次资料缺口',r.choice.gap]];
    const out=[],add=(title,body)=>out.push([title,body]);
    const general=window.focusDemo?.variant(r.id,'general'),events=window.focusDemo?.variant(r.id,'events'),business=window.focusDemo?.variant(r.id,'business');
    if(r.ids.includes('news'))(r.choice.focus==='events'?events?.sections.slice(0,1):general?.sections.slice(0,r.choice.focus==='general'?2:1))?.forEach(x=>out.push(x));
    if(r.ids.includes('event'))events?.sections.slice(1).forEach(x=>out.push(x));
    if(r.ids.includes('basic'))add(...(business?.sections[0]||['公司资料',r.m.summary]));
    if(r.ids.includes('industry'))add(...(business?.sections[1]||['行业核验',skills.industry.gap]));
    if(r.ids.includes('financial')){
      if(r.choice.focus==='business'&&business)add(...business.sections[2]);
      else add('财务核验：当前不能得出结果',skills.financial.output+' '+skills.financial.gap+' 本期资料「'+r.m.title+'」不能替代同期财报。');
    }
    if(r.ids.includes('valuation'))add('估值核验：缺少输入，不计算倍数',skills.valuation.output+' '+skills.valuation.gap);
    if(r.choice.agent==='value')add('本次价值投资视角', '先核对盈利质量与可持续性，再讨论估值依据。当前资料不足以判断内在价值；这是你指定的本次视角，不会写入长期投资风格。');
    if(!out.length)add('来源核验',r.m.summary);
    if(r.choice.missing?.length)add('本次尚未覆盖',r.choice.missing.map(id=>skills[id].name).join('、')+' 未在手动 Skill 中选中，未展示对应分析。可在输入框内调整 Skill 后重问。');
    if(!out.some(([,body])=>body===r.m.watch))add('后续观察与资料边界',r.m.watch);
    return out;
  }
  function expertCards(r){
    if(!r.team.multiple)return '';
    return `<section class="cap-team" aria-label="多专家协作演示"><h3>各自看什么</h3><p class="cap-boundary">以下是预设观点样例，不是真实 Agent 发言或独立检索结果。</p>${r.team.members.map(member=>{
      const sample=collaborationDemo.perspective(r.id,member,focusDemo.variant);
      return `<article class="cap-expert" data-expert="${member.agent}"><header><strong>${esc(agents[member.agent].name)}</strong><span>样例分析</span></header><p class="cap-expert-skills">${member.ids.map(id=>esc(skills[id].name)).join(' · ')}</p><p class="cap-expert-lead">${esc(sample.lead)}</p><details><summary>展开分析与依据</summary>${sample.sections.map(([h,p])=>`<h4>${esc(h)}</h4><p>${esc(p)}</p>`).join('')}<p class="cap-boundary">本视角缺口：${esc(sample.gap)}</p>${briefSource(r.m.source,r.issue)}</details></article>`;
    }).join('')}</section>`;
  }
  function synthesisSections(r){
    const summary=collaborationDemo.synthesis(r.id,r.team);
    return [['共同判断',summary.common],['分歧与侧重点',summary.tension],['仍缺哪些资料',summary.gap],...(r.choice.missing?.length?[['手动选择未覆盖',r.choice.missing.map(id=>skills[id].name).join('、')+' 未选中，未展示对应结果。']]:[]),['下一步如何验证',r.m.watch]];
  }
  function assignment(r){
    if(r.choice.gap)return `<div class="cap-assignment"><strong>资料待补 · 未安排专家结果</strong></div>`;
    const members=r.team.members.map(m=>agents[m.agent].name).join(' + ');
    return `<div class="cap-assignment" data-team-size="${r.team.members.length}"><strong>${r.team.multiple?'多专家协作':'单专家解读'} · 固定演示</strong><p>${esc(members)}</p><small>${r.team.multiple?'闪电猫协调与汇总；下方专家观点均为预设样例。':esc(r.team.reason)}</small>${r.manualAgent||/巴菲特|价值投资/.test(r.question)?`<p class="cap-boundary">本次指定：${esc(agents[r.choice.agent].name)}。${r.team.members.some(m=>m.agent===r.choice.agent)?'承接对应分析。':'保留主持视角，所选专业能力交由对应专家展示。'}</p>`:''}${r.team.multiple?'':`<p>${r.ids.map(id=>esc(skills[id].name)).join(' · ')}</p><small>没有执行真实能力</small>`}</div>`;
  }
  function result(){
    const r=run;
    return `<section class="cap-result" data-result-focus="${esc(r.choice.focus)}"><span class="eyebrow">${r.team.multiple?'闪电猫汇总 · 固定演示':'固定资料 · 演示结果'}</span><h3>${esc(r.m.name)} · ${r.choice.gap?'资料待补':esc(r.choice.label)}</h3>${(r.team.multiple?synthesisSections(r):outputSections(r)).map(([title,body])=>`<h4>${esc(title)}</h4><p>${esc(body)}</p>`).join('')}<h4>资料来源</h4><p class="cap-boundary">采用 2026.09.29 早报固定样例；原始资料日期以来源为准，不代表实时变化。</p>${briefSource(r.m.source,r.issue)}<p class="cap-boundary">未调用在线 AI、Agent 或 Skill。财务、估值输入未获取，完整研究未完成。</p><button class="button" data-cap="original">回到原资料解读</button></section>`;
  }
  function renderNatural(){
    const r=run;
    panel.innerHTML=`<header class="cap-run-head"><span class="eyebrow">本次需求匹配 · 演示</span><button class="text-action" data-cap="close">返回对话</button></header><p class="cap-question">${esc(r.question)}</p><div class="cap-profile-note"><strong>${esc(r.m.name)} · ${esc(r.choice.label)}</strong><p>${esc(r.choice.basis)}</p>${(r.choice.notes||[]).filter(note=>!r.team.multiple||!note.startsWith('市场解读陪伴助手仅整理事件')).map(note=>`<p>${esc(note)}</p>`).join('')}</div>${assignment(r)}${expertCards(r)}${result()}<details class="cap-routing-details"><summary>查看分工与资料缺口</summary>${r.ids.map(id=>`<div><strong>${esc(skills[id].name)}</strong><p>${esc(skills[id].output)}</p><small>${esc(skills[id].gap)}</small></div>`).join('')}<p class="cap-boundary">本次选择不修改长期画像；提问可保留为近期线索，另行确认才成为偏好。</p></details>${learningHTML()}`;
  }
  function learningHTML(){
    const r=run;if(r.learning==='confirmed')return `<section class="method-confirm" role="status"><strong>已记住 · ${esc(r.candidate.scope)}</strong><p>${esc(researchMethods.choices[r.candidate.key].label)}</p><p class="method-receipt">个人简报已突出对应核验重点；下次同范围的综合提问将沿用相关专家与 Skill。明确的本次要求仍优先。</p><div class="method-actions"><button class="button" data-cap="retry-method">按新偏好再研究一次</button><button class="text-action" data-cap="read-method-brief">查看简报变化</button><button class="text-action" data-cap="profile">修改或删除</button></div></section>`;
    if(r.learning==='declined')return '<p class="method-receipt" role="status">仅用于这次，不写入画像；不再重复询问这条习惯。可在研究偏好中恢复建议。</p>';
    if(r.prompted)return researchMethods.prompt(r.candidate);
    if(r.canLearn&&researchMethods.canOffer(r.candidate,true))return '<button class="text-action" data-cap="remember-method">将这类问题设为阅读重点</button>';
    return '';
  }
  function startPassiveDemo(){
    start('2490095','半导体交付进展怎样？海光信息有披露吗？');
    const today=beijingClock().slice(0,10),questions=['半导体订单情况怎么样？海光信息有新客户吗？','半导体新增订单有公开证据吗？看看海光信息。','半导体交付进展怎样？海光信息有披露吗？'];
    run.demo={step:1,status:'',events:questions.map((quote,i)=>({...researchMethods.detect('2490095',quote),day:shiftedDate(today,i-2)}))};
    render();
  }
  function renderPassiveDemo(){
    const d=run.demo,events=d.events.slice(0,d.step),candidate=events.at(-1),ready=researchMethods.canOffer(candidate,false,{enabled:true,lastPrompt:'',methodEvents:events,methodDismissed:{}},[]);
    panel.innerHTML=`<header class="cap-run-head"><span class="eyebrow">被动发现偏好 · 独立演示</span><button class="text-action" data-cap="close">退出</button></header><h2 class="assistant-greeting">用户正常问，助手慢慢了解。</h2><p class="cap-boundary">以下为虚构的提问样例，不是你的历史。原型压缩跨日过程，不写入真实记录，不改变真实提示频次。</p><ol class="passive-timeline">${events.map((x,i)=>`<li><small>${esc(x.day)} · 第 ${i+1} 次普通提问</small><p>“${esc(x.quote)}”</p><span>系统线索：${esc(x.scope)} · ${researchMethods.choices[x.key].signal}</span></li>`).join('')}</ol><div class="cap-profile-note"><strong>${ready?'三个不同日期出现同类问题':'目前只有 '+events.length+' 个日期，继续观察'}</strong><p>共同话题是订单与交付。没有证据说明用户关心现金流、偏好某种投资风格或要求固定研究顺序。</p></div>${!ready?'<button class="button primary" data-demo-memory="next">演示下一次普通提问</button>':d.status==='accepted'||d.status==='applied'?`<section class="method-confirm"><strong>${d.status==='applied'?'已应用到你的工作台':'演示：用户确认后才形成偏好'}</strong><p>半导体 · 优先关注订单与交付</p><dl class="passive-effects"><dt>简报</dt><dd>突出客户、订单与交付证据；缺少资料时明确显示缺口。</dd><dt>Agent</dt><dd>个股投研专家承接；不贴成长或价值投资风格标签。</dd><dt>Skill</dt><dd>公司基本面速览、行业深度分析，并保留来源核验。这是系统安排的工作步骤，不是用户自述的研究顺序。</dd></dl>${d.status==='accepted'?'<p class="cap-boundary">以上变化仅预览，尚未保存到你的画像。</p><button class="button primary" data-demo-memory="apply">将此偏好应用到我的工作台</button>':'<p role="status">仅保存你刚确认的偏好，没有保存上方虚构历史。</p><button class="button" data-cap="read-method-brief">查看简报变化</button><button class="text-action" data-cap="retry-method">用已确认偏好研究一次</button>'}</section>`:d.status==='declined'?'<section class="method-confirm" role="status"><strong>演示：用户拒绝，保持原样</strong><p>不加入画像，不修改简报或研究分工。本演示也未改变你的真实抑制设置。</p></section>':researchMethods.prompt(candidate,{demo:true,events})}<p id="passiveDemoStatus" role="status"></p>`;
    panel.scrollTop=panel.scrollHeight;
  }
  function render(focusLearning=false){
    if(run.demo){renderPassiveDemo();return;}

    const r=run,total=r.ids.length+2,finished=r.natural||r.step===total;
    if(finished&&r.canLearn&&!r.prompted&&!r.learning&&researchMethods.canOffer(r.candidate)&&researchMethods.markPrompt())r.prompted=true;
    if(r.natural){renderNatural();return;}
    const stages=[{title:'读取共享画像',who:'全能助手',input:'当前已确认的阅读重点、关注范围与自述风险偏好',output:`阅读重点：${r.p.label}；关注范围：${r.p.targets||'未设置'}；风险偏好：${r.p.risk}。`,gap:'本次编排不修改画像；已发送问题可形成近期线索，完成后另行确认才会记为研究习惯。'},
      {title:'安排研究分工',who:'全能助手 → '+agents[r.choice.agent].name,input:r.question,output:r.choice.reason+(r.manual?' Skill 按你的本次指定安排。':' Skill 随研究分工自动安排。'),gap:'这是预设规则匹配，非在线模型决策。'},
      ...r.ids.map((id,index)=>({title:skills[id].name,who:(id==='evidence'?'全能助手':agents[r.team.members.find(m=>m.ids.includes(id))?.agent||r.choice.agent].name)+' → Skill',input:skills[id].input+(index?'；承接前序步骤的检查项':''),output:skills[id].output,gap:skills[id].gap}))];
    panel.innerHTML=`<header class="cap-run-head"><span class="eyebrow">画像驱动协作 · 模拟过程</span><button class="text-action" data-cap="close">退出</button></header><h2 class="assistant-greeting">${esc(r.m.name)} · 协作方案</h2><p class="cap-question">${esc(r.question)}</p><div class="cap-profile-note"><strong>本次研究重点：${esc(r.choice.label)}</strong><p>${r.relation.length?esc(r.relation.map(x=>x.label+'：'+x.text).join(' ')):'此对象未匹配已确认的个人关联，是本次自主选择的样例。'}</p><p>${esc(r.choice.reason)}</p><small>本次使用启动时的画像快照。修改偏好后，重新编排才会更新。</small></div><div class="cap-sequence"><span>全能助手</span><span>→ ${esc(r.team.members.map(m=>agents[m.agent].name).join(' + ')||agents[r.choice.agent].name)}</span><span>→ ${r.ids.length} 项 Skill</span><span>→ 汇总与缺口</span></div><p class="cap-boundary">每一步由你点击展示。状态只表示演示进度，不表示真实调用完成。</p><div class="cap-progress" role="status">${finished?'演示结束 · 完整研究仍缺数据':r.step?'已展示 '+r.step+' / '+total+' 个步骤':'方案已准备 · 尚未开始演示'}</div><ol class="cap-steps">${stages.map((s,i)=>`<li class="${i<r.step?'shown':''}"><details ${i===r.step-1?'open':''}><summary><span>${esc(s.title)}</span><small>${i<r.step?'已展示':'待演示'}</small></summary><p class="cap-worker">${esc(s.who)}</p>${i<r.step?`<dl><dt>输入</dt><dd>${esc(s.input)}</dd><dt>示例产出</dt><dd>${esc(s.output)}</dd><dt>缺口</dt><dd>${esc(s.gap)}</dd></dl>`:'<p>继续演示后查看本步输入与产出。</p>'}</details></li>`).join('')}</ol>${finished?expertCards(r)+result()+learningHTML():''}<div class="cap-run-actions">${finished?'<button class="button" data-cap="prepare">重新编排</button>':`<button class="button primary" data-cap="next">${r.step?'演示下一步':'开始逐步演示'}</button><button class="text-action" data-cap="all">展示完整过程</button>`}</div>`;
    if(finished){const result=(focusLearning&&panel.querySelector('.method-confirm, .method-receipt'))||panel.querySelector('.cap-result');panel.scrollTop+=result.getBoundingClientRect().top-panel.getBoundingClientRect().top;}
  }
  document.addEventListener('click',e=>{
    const demoAction=e.target.closest('[data-demo-memory]')?.dataset.demoMemory;
    if(run?.demo&&demoAction){const d=run.demo;if(demoAction==='next')d.step=Math.min(3,d.step+1);if(demoAction==='accept')d.status='accepted';if(demoAction==='decline')d.status='declined';if(demoAction==='apply'){const candidate=d.events.at(-1);if(!researchMethods.confirm(candidate)){q('#passiveDemoStatus').textContent='未保存：请检查是否关闭了行为记忆，或稍后重试。';return;}d.status='applied';}render();return;}
    if(run&&e.target.closest('[data-method-accept]')){if(researchMethods.confirm(run.candidate)){run.learning='confirmed';render(true);}return;}
    if(run&&e.target.closest('[data-method-decline]')){if(researchMethods.decline(run.candidate)){run.learning='declined';render(true);}return;}

    const prompt=e.target.closest('[data-cap-prompt]');if(prompt){q('#capabilityPrepare [name=question]').value=prompt.dataset.capPrompt;return;}
    const b=e.target.closest('[data-cap]');if(!b)return;
    switch(b.dataset.cap){
      case 'method-example':closeModal();startPassiveDemo();break;
      case 'remember-method':if(run&&researchMethods.canOffer(run.candidate,true)&&researchMethods.markPrompt()){run.prompted=true;render(true);}break;
      case 'retry-method':if(run){const id=run.id;start(id,'结合我的研究习惯，梳理这家公司的本期资料。');}break;
      case 'read-method-brief':close();showBrief(briefSnapshot().displayed.id);break;
      case 'agent':options('agent');break;case 'skills':options('skills');break;case 'prepare':if(presetBinding())options('agent');else prepare();break;
      case 'dismiss':closeModal();break;
      case 'auto-skills':selection.skills=[];toolbar();closeModal();toast('Skill 已恢复自动安排');break;
      case 'close':close();break;
      case 'next':if(run){run.step=Math.min(run.step+1,run.ids.length+2);render();}break;
      case 'all':if(run){run.step=run.ids.length+2;render();}break;
      case 'profile':close();researchProfile.open();break;
      case 'original':if(run){const id=run.id,issue=run.issue;close();if(briefItems.some(x=>x.id===id))briefAsk(id,issue);else editorialAsk('news-'+id,null,null,issue.id);}break;
    }
  });
  // Other navigation or original assistant actions return to the preserved original conversation.
  new MutationObserver(()=>{if(run)close();toolbar();}).observe(q('#assistantContent'),{childList:true});
  window.addEventListener('hashchange',close);
  document.addEventListener('keydown',e=>{if(e.key==='Escape'&&run&&!q('#modal').open)close();});
  // Intercept only ordinary chat sends. Existing preference/task/onboarding forms keep their handlers.
  document.addEventListener('submit',e=>{
    if(e.target!==q('#chatForm')||context?.kind==='brief-customization'||taskDraft||q('#eventTrackForm')||q('[data-first-ui]'))return;
    const question=q('#chatInput').value.trim();if(!question)return;
    e.preventDefault();e.stopImmediatePropagation();
    if(selection.agent==='fund'||/基金|ETF/i.test(question)){fundGap();return;}
    const items=briefPersonalization.candidates(),mentioned=items.filter(x=>question.includes(x.name)||question.includes(x.identity));
    const target=mentioned.length===1?mentioned[0]:mentioned.length>1?null:(/继续|这家|这只|它|当前/.test(question)?items.find(x=>x.id===run?.id)||items.find(x=>x.name===context?.company):null);
    if(!target){prepare({fromSend:true,notice:mentioned.length>1?'本轮仅演示一家公司，请选择对象并调整问题。':'请明确本次研究对象；原型仅覆盖下列样例个股。'});return;}
    start(target.id,question,{record:true,natural:true});q('#chatInput').value='';
  },true);
  toolbar();q('.design-strip b').textContent='V2.53';
  document.addEventListener('DOMContentLoaded',()=>{q('.design-strip b').textContent='V2.53';},{once:true});
})();
