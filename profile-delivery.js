/* Fixed workflow outputs for the existing V2 components. No service calls or
 * profile writes: confirmed preferences choose delivery; review is in memory. */
(() => {
  function initialize(){
  const labels={short:'短线交易',swing:'波段配置',long:'中长期持有',unset:'未设置投资习惯'};
  const names={brief:'个人简报',events:'事件捕手',market:'市场概览',sectors:'关注行业',stocks:'股票工作台',indexes:'大盘指数',funds:'资金观察'};
  const orders={
    short:['brief','events','market','stocks','sectors','indexes','funds'],
    swing:['brief','sectors','events','stocks','market','indexes','funds'],
    long:['brief','events','stocks','sectors','indexes','market','funds']
  };
  const workflows={
    short:{id:'event-verification',name:'事件核验',skillIds:['event','evidence'],catalogNames:['市场点评与事件解读','证据可追溯引擎'],steps:['读取同一事件原文','核对日期、发布事项与未确认信息','整理下一披露节点和缺口'],questions:['release','revenue','value'],meaning:'先看发布带来了什么新线索，以及下一次披露要核对什么。',gaps:'缺本期新披露和同期量价资料，不能判断当天股价影响。',next:'按日期核对公司原文、适配和交付披露，再补同期行情。'},
    swing:{id:'industry-progress-verification',name:'产业进展核验',skillIds:['event','basic','evidence'],catalogNames:['市场点评与事件解读','公司基本面速览','证据可追溯引擎'],steps:['汇集同一事件资料','区分发布、适配、交付与持续采购','对照连续证据，列出尚未走通的环节'],questions:['revenue','release','value'],meaning:'先看端侧算力线索能否由客户适配走向交付和持续采购。',gaps:'缺客户验证、交付规模及连续披露，一次发布不能证明趋势。',next:'按时间对照适配、交付和后续采购资料，看进展是否持续。'},
    long:{id:'business-financial-verification',name:'经营与财务核验',skillIds:['event','basic','financial','evidence'],catalogNames:['市场点评与事件解读','公司基本面速览','财务数据查询','财务面分析','证据可追溯引擎'],steps:['核对业务落地链条','检查收入、利润和现金流所需输入','输出已知事实与财务估值缺口'],questions:['revenue','value','release'],meaning:'先看新产品怎样形成收入，以及盈利和现金流还需要什么证据。',gaps:'缺对应财报、回款和同期估值输入，不能判断长期价值改善。',next:'补客户及交付证据，再核对财报中的收入、利润和经营现金流。'}
  };
  const baseline=['brief','indexes','market','events','stocks','sectors','funds'];
  const informationTypes={release:{key:'short',title:'发布消息'},progress:{key:'swing',title:'客户与交付'},business:{key:'long',title:'收入与财务'}};
  const informationOrders={short:['release','progress','business'],swing:['progress','release','business'],long:['business','progress','release']};
  // One fixed fictional scenario. It is separate from historical evidence and
  // stored tracking materials; changing preferences only reorders these rows.
  const samples={
    release:{id:'profile-sample-release',time:'10:00',category:'新品消息',headline:'2 款工控样机亮相',meaning:'看到了新的应用场景，但样机展示还不等于量产供货。',facts:'模拟展示了 2 款采用 CPU 1000 的工控样机。',gaps:'尚无量产供货证据。',nextSteps:'核对量产计划和正式交付。'},
    progress:{id:'profile-sample-progress',time:'14:00',category:'客户进展',headline:'3 家完成适配，1 家开始试交付',meaning:'产品向客户落地推进了一步，还要看试交付能否变成持续采购。',facts:'模拟 3 家整机合作方完成适配，1 家进入小批量试交付。',gaps:'尚无持续采购证据。',nextSteps:'核对后续采购及正式交付规模。'},
    business:{id:'profile-sample-business',time:'16:00',category:'订单进展',headline:'800 万元试用订单，收入尚未确认',meaning:'订单金额有了，但还不能当作收入；继续看交付、收入确认和回款。',facts:'模拟取得 800 万元试用订单，尚未确认收入或回款。',gaps:'尚无收入确认或回款证据。',nextSteps:'核对交付、收入确认和回款。'}
  };
  let preview=null;
  const actualMode=()=>Object.hasOwn(workflows,briefPrefs.investmentHorizon)?briefPrefs.investmentHorizon:'unset';
  const mode=()=>preview||actualMode();
  const manual=()=>state.profileOrderMode==='manual'||(state.profileOrderMode!=='auto'&&![baseline,['indexes','market','brief','events','stocks','sectors','funds']].some(base=>base.filter(id=>state.order.includes(id)).join('|')===state.order.join('|')));
  function visibleOrder(){
    const base=manual()||!orders[mode()]?state.order:orders[mode()].filter(id=>state.order.includes(id));
    return [...base.filter(id=>state.pinned.includes(id)),...base.filter(id=>!state.pinned.includes(id))];
  }
  function informationResults(issue){
    return (informationOrders[mode()]||informationOrders.short).map(id=>{
    const type=informationTypes[id],flow=workflows[type.key];
    return {version:3,informationId:id,title:type.title,workflowId:flow.id,eventId:'2490095',issueId:issue.id,investmentHorizon:mode(),
      status:'partial',execution:'preset',sourceKeys:researchDemo.sources.map(s=>s.key),
      evidenceAsOf:'2026-09-23 19:57:38',skillIds:[...flow.skillIds],
      facts:'海光已发布 CPU 1000 系列，面向低功耗、嵌入式和端侧算力场景。',
      meaning:flow.meaning,gaps:flow.gaps,nextSteps:flow.next,
      demoSample:{...samples[id],demo:true,scenarioId:'profile-clarity-sample-v1',issueId:issue.id,sourceKeys:[]}};
    });
  }
  const result=issue=>informationResults(issue)[0];
  function informationHTML(r,index){const s=r.demoSample;return `<li class="profile-information" data-profile-info="${esc(r.informationId)}" data-profile-sample="${esc(s.id)}"><div class="profile-information-meta"><span>${esc(s.category)} · ${s.time}（模拟）</span>${index===0&&mode()!=='unset'?'<span class="profile-first-information">优先看</span>':''}</div><h5>${esc(s.headline)}</h5><p>${esc(s.meaning)}</p></li>`;}
  function summaryHTML(issue){
    const results=informationResults(issue),r=results[0],tag=preview?'对照预览 · '+labels[mode()]:labels[mode()];
    return `<section class="profile-reading-summary" data-profile-result="${esc(r.workflowId)}" data-profile-horizon="${esc(r.investmentHorizon)}" data-profile-issue="${esc(r.issueId)}">
      <h4>海光进展 · 模拟示例 <span>${esc(tag)}</span></h4><p class="profile-sample-notice">以下 3 条消息、时间和金额均为虚构，用于比较画像排序。</p><ol class="profile-information-list">${results.map(informationHTML).join('')}</ol>
    </section>`;
  }
  function questionOrder(questions){const ids=workflows[mode()]?.questions;return ids?ids.map(id=>questions.find(q=>q.id===id)).filter(Boolean):questions;}
  function sampleAnswerHTML(questionId,issue){if(issue.period!=='morning'&&!(route.type==='event-detail'&&researchDemo.isCase(route.eventId)))return '';const id=questionId==='release'?'release':'business',s=samples[id];return `<p class="profile-sample-answer" data-profile-answer-sample="${esc(s.id)}"><strong>模拟情景</strong>${esc(s.headline)}。${esc(s.meaning)}这些演示数字不作为真实海光的判断依据。</p>`;}
  window.profileDelivery=Object.freeze({mode,actualMode,result,informationResults,summaryHTML,sampleAnswerHTML,questionOrder,visibleOrder});

  function applyLayout(){
    const grid=$('#widgetGrid'),order=visibleOrder(),focused=document.activeElement;
    document.querySelector('.design-strip b').textContent='V2.71';
    if([...grid.children].filter(n=>n.dataset.widget).map(n=>n.dataset.widget).join('|')!==order.join('|')){
      order.forEach(id=>{const node=grid.querySelector(`[data-widget="${id}"]`);if(node)grid.append(node);});
      if(grid.contains(focused))focused.focus({preventScroll:true});
    }
    const note=`<div class="profile-layout-note" id="profileLayoutNote"><div>${preview?'对照预览':manual()?'手动顺序':mode()==='unset'?'默认顺序':'按已保存习惯'} · <strong>${esc(labels[mode()])}</strong>${!preview&&manual()&&mode()!=='unset'?'<button type="button" class="text-action" data-profile-auto-order>按画像排序</button>':''}</div><span>${manual()?'组件保留你的手动排序；信息和追问仍按习惯调整。':mode()==='unset'?'可在用户薄画像中选择投资习惯，完成最后一步保存后生效。':state.pinned.length?'先保留置顶组件，其余按习惯排序。':'个人简报在前，其余按研究重点排序。'}${preview?' 预览不保存为画像。':''}</span><small>当前顺序：${order.map(id=>names[id]).join(' → ')}</small></div>`;
    const old=$('#profileLayoutNote');if(old?.outerHTML===note)return;
    if(old)old.outerHTML=note;else grid.insertAdjacentHTML('beforebegin',note);
  }
  const render=renderWidgets;
  renderWidgets=function(...args){const answer=render(...args);applyLayout();return answer;};
  // Build menu positions from the visible order. Persist it only on the user's
  // explicit move/pin action, never during automatic rendering or review.
  const originalMenu=menu;
  menu=function(...args){const saved=state.order;state.order=visibleOrder();try{return originalMenu(...args);}finally{state.order=saved;}};
  document.addEventListener('click',e=>{
    if(e.target.closest('[data-profile-auto-order]')){state.profileOrderMode='auto';save();applyLayout();toast('已按投资习惯排序，保留置顶、收起和已删除组件。');return;}
    const b=e.target.closest('[data-w-action]');if(!b||b.disabled||!['up','down','pin'].includes(b.dataset.wAction))return;
    if(preview){e.preventDefault();e.stopImmediatePropagation();toast('请先在设计说明中退出对照，再调整你的布局。');return;}
    state.order=visibleOrder();state.profileOrderMode='manual';
  },true);

  const documentBefore=briefDocument;
  briefDocument=function(issue){
    const t=document.createElement('template');t.innerHTML=documentBefore(issue);
    if(issue.period==='morning'){
      const card=t.content.querySelector('[data-personal-alert="2490095"]');
      if(card){
        card.querySelector('.research-demo-label').textContent='海光案例 · '+labels[mode()];
        const reason=card.querySelector('.research-demo-reason');
        reason.innerHTML='<strong>为什么推荐</strong>固定案例长期关注海光信息；下方用同一组模拟进展展示不同投资习惯的阅读顺序。';
        const analysis=card.querySelector('.reminder-analysis');analysis.querySelector('p')?.remove();analysis.insertAdjacentHTML('afterbegin',summaryHTML(issue));
      }
      const heading=t.content.querySelector('#brief-alerts span');if(heading)heading.textContent='海光案例 · '+labels[mode()];
    }
    return t.innerHTML;
  };
  const overviewBefore=briefOverview;
  briefOverview=function(issue){
    const t=document.createElement('template');t.innerHTML=overviewBefore(issue);
    if(issue.period==='morning'){
      const panel=t.content.querySelector('.research-demo-preview');
      if(panel){
        panel.querySelector('.brief-cover-kicker span').textContent='海光案例 · '+labels[mode()];
        const follow=panel.querySelector('.brief-cover-followup');follow.outerHTML=summaryHTML(issue);
        panel.querySelector('.research-demo-reason').innerHTML='<strong>为什么推荐</strong>固定案例长期关注海光信息；下方模拟进展按投资习惯排序。';
        const lead=t.content.querySelector('.brief-cover-lead');if(lead)lead.textContent='先读个人简报，再查看相关研究线索。';
      }
    }
    return t.innerHTML;
  };
  function refreshCurrent(){
    const input=$('#chatInput'),draft=input.value;renderWidgets();
    if(route.type==='brief')showBrief(route.issueId);
    else if(route.type==='event-detail'&&researchDemo.isCase(route.eventId))showTrackedEvent({...route});
    input.value=draft;
  }
  const refreshBefore=refreshBrief;
  function syncAssistantQuestions(){
    if($('#assistantContent [data-research-result]'))return;
    $('#assistantContent').querySelectorAll('.research-question-list').forEach(list=>{
      const first=list.querySelector('[data-research-question]');if(!first)return;
      const focused=document.activeElement,html=researchDemo.questionButtons(first.dataset.researchIssue);
      if(list.outerHTML===html)return;const index=focused?.dataset.researchQuestion;
      list.outerHTML=html;if(index)$('#assistantContent [data-research-question="'+index+'"]').focus({preventScroll:true});
    });
  }
  refreshBrief=function(...args){
    const answer=refreshBefore(...args),summary=$('#flowView [data-profile-horizon]');
    applyLayout();
    if(route.type==='event-detail'&&researchDemo.isCase(route.eventId)&&summary?.dataset.profileHorizon!==mode()){
      const input=$('#chatInput'),draft=input.value;showTrackedEvent({...route});input.value=draft;
    }
    queueMicrotask(syncAssistantQuestions);return answer;
  };
  // Only a successful explicit preference write exits a review preview.
  // Cancellation and transaction failures never dispatch this event.
  window.addEventListener('research-profile-saved',()=>{preview=null;refreshBrief(true);});
  const priorNotes=$('#designNotes').onclick;
  $('#designNotes').onclick=function(...args){
    priorNotes?.apply(this,args);
    $('#modalTitle').textContent='V2.71 · 设计说明';
    // Supersede the earlier review paragraph, retaining other reviewed scenes.
    [...$('#modalBody').querySelectorAll('section')].find(s=>s.querySelector('h3')?.textContent==='个性化如何体现在内容中')?.remove();
    const oldLayout=[...$('#modalBody').querySelectorAll('h3')].find(h=>h.textContent==='布局提案');
    if(oldLayout?.nextElementSibling)oldLayout.nextElementSibling.textContent='个人简报默认在前；已保存投资习惯时，其余现有组件按上方规则排序。未设置时沿用指数和市场概览在前的原默认；手动排序、置顶、删除与收起保留。';
    const oldPath=[...$('#modalBody').querySelectorAll('section')].find(s=>s.querySelector('h3')?.textContent==='本批体验路径');
    if(oldPath?.querySelector('p:last-child'))oldPath.querySelector('p:last-child').textContent='海光固定案例长期关注该公司，未提供持仓。早报和事件研究按本次投资习惯对照；晚报仍沿用已审查的事件进展回顾与假设行情标识。';
    const rows=Object.keys(workflows).map(key=>`<tr><th scope="row">${labels[key]}</th><td>${orders[key].slice(0,3).map(id=>names[id]).join(' → ')}</td><td>${informationOrders[key].map(id=>samples[id].category).join(' → ')}</td><td>${esc(researchDemo.questions.find(q=>q.id===workflows[key].questions[0]).label)}</td></tr>`).join('');
    const flowRows=Object.values(workflows).map(f=>`<li><strong>${esc(f.name)}</strong><p>${f.steps.map(esc).join(' → ')}</p><small>公司目录候选能力：${f.catalogNames.map(esc).join('、')}。原型稳定标识：${f.skillIds.join(' / ')}；生产接口映射待确认。</small></li>`).join('');
    $('#modalBody').insertAdjacentHTML('afterbegin',`<section class="profile-delivery-review"><h3>画像：组件、内容、追问三处联动</h3><p>当前已保存：${esc(labels[actualMode()])}。${preview?'正在临时预览 '+labels[preview]+'。':'未开启临时预览。'}选择下面一类，关闭弹窗后查看当前页面，也可返回今日总览比较排序。</p><div class="profile-review-controls" role="group" aria-label="投资习惯临时对照">${Object.keys(workflows).map(key=>`<button class="button" data-profile-preview="${key}" aria-pressed="${preview===key}">${labels[key]}</button>`).join('')}<button class="button" data-profile-preview="actual" aria-pressed="${preview===null}">退出对照，用已保存偏好</button></div><p class="profile-review-note">切换不保存画像、不生成资料；刷新恢复已保存偏好。手动布局保留。完整规则是本轮方案，尚非生产推荐算法。</p><div class="profile-review-table"><table><thead><tr><th>投资习惯</th><th>默认组件优先级</th><th>信息顺序</th><th>首道推荐追问</th></tr></thead><tbody>${rows}</tbody></table></div><details><summary>组件中的内容从哪里来？</summary><p>历史资料 → 固定研究流程及 Skill → 固定格式结果 → 现有组件。三类研究结果各自包含“发生了什么、怎么看、还缺什么、下一步”。四字段保留在数据层；界面用同一组三条模拟消息和一句解释直接展示，画像调整先后顺序。模拟消息不作为真实历史报道的结论。当前使用预设结果，未运行真实工作流或 Agent/Skill。</p><ul class="profile-workflows">${flowRows}</ul><p>组件名称不等于 Skill 名称；同一组件可展示不同研究结果。Agent 承接本次具体追问。巴菲特题由用户明确点击才使用，中长期习惯不自动绑定该专家。资金观察展示公司资金事项，关注行业展示资讯线索，股票工作台尚未接财务估值数据。</p></details></section>`);
    $('#modalBody').querySelectorAll('[data-profile-preview]').forEach(b=>b.onclick=()=>{preview=b.dataset.profilePreview==='actual'?null:b.dataset.profilePreview;closeModal();refreshCurrent();toast(preview?'正在预览'+labels[preview]+'，未保存画像。':'已退出对照，恢复已保存偏好。');});
  };
  $('#designNotes').onclick.researchDemoNotes=true;
  // Existing preference-save handlers already refresh the original views. This
  // initial pass only redraws them; it never writes confirmed preferences.
  refreshCurrent();
  }
  if(document.readyState!=='complete')document.addEventListener('DOMContentLoaded',initialize,{once:true});
  else initialize();
})();
