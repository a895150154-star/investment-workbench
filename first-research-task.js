/* V2.40: one guided company diagnosis experience, using existing brief / answer / tracking actions.
 * Progress is ephemeral. No new profile or subscription storage. Reward entitlement is a separate local demo.
 */
(() => {
  let task=null,offerState=null,trackingReturn=null;
  const q=s=>document.querySelector(s);
  const all=s=>[...document.querySelectorAll(s)];
  function material(id){
    const company=briefItems.find(x=>x.id===id),news=briefNewsAnalysis[id];
    return company?{name:company.company,title:company.title,summary:company.summary,impact:company.answer,watch:company.watch,question:company.question}:
      news?{name:news.object,title:news.headline,summary:news.summary,impact:news.answer,watch:news.watch,question:news.question}:null;
  }
  function relation(item){return item?.reasons.length?item.reasons.map(r=>r.label+'：'+r.text).join(' '):'尚未匹配个人关联。这是你自主选择的体验资料，不代表持仓或长期关注。';}
  const boundary='<p class="first-task-boundary">固定资料版诊断体验 · 未接入在线 AI。仅展示公司事件、影响与待验证风险，完整财务及估值诊断未接入。选择个股不会加入自选或持仓。</p>';
  function options(items,selected){
    const option=item=>`<label class="first-task-option"><input type="radio" name="firstTaskMaterial" value="${item.id}" ${item.id===selected?'checked':''}><span><strong>${esc(item.name)}</strong><span>${esc(material(item.id).title)}</span><small>${item.matched?'已有关系 · '+esc(item.reasons.map(r=>r.label).join('、')):'样例个股 · 未匹配个人关联'}</small></span></label>`;
    if(!items.length)return '<p>本期暂无可体验的资料，请先浏览工作台。</p>';
    if(!selected)return items.map(option).join('');
    const chosen=items.find(x=>x.id===selected),others=items.filter(x=>x.id!==selected);
    return option(chosen)+(others.length?`<details class="first-task-alternatives"><summary>换一只个股</summary><div>${others.map(option).join('')}</div></details>`:'');
  }
  function offer({skipped=false}={}){
    if(trackingReturn){const saved=trackingReturn;trackingReturn=null;restoreConversation(saved);}
    stop(true);
    const holdings=holdingsStore.identities().filter(x=>x.type==='stock');
    const items=(window.briefPersonalization?.candidates()||[]).filter(x=>material(x.id)).map(item=>{const held=holdings.some(x=>x.name===item.name||x.code===item.identity);return held?{...item,held:true,matched:true,reasons:[{label:'已确认持仓',text:'来自你已录入的持仓清单。'},...item.reasons.filter(x=>x.label!=='持仓关联')]}:item;}).sort((a,b)=>Number(!!b.held)-Number(!!a.held));
    const uncovered=holdings.filter(h=>!items.some(x=>x.name===h.name||x.identity===h.code));
    const matched=items.filter(x=>x.matched);
    offerState={items,selected:skipped?null:matched[0]?.id||null,skipped};
    const selected=offerState.selected;
    openModal('送你一次个股诊断体验',
      `<div class="first-task-intro"><span class="eyebrow">你的新手专享</span>${newcomerReward.banner()}<p>${skipped?'不填画像、不上传持仓，也可以选一只样例个股体验。':items.some(x=>x.held)?'先从你已确认的持仓里选一只，结合资料看影响、风险和下一步验证点。':matched.length?'先从你关注的个股开始，不必再上传持仓。也可以换一只样例个股。':'本期固定资料尚未覆盖你的关注，可自主选择一只样例个股体验。'}</p><p class="first-task-focus">阅读重点：${esc(briefPersonalization.focusLabel())}</p>${researchRisk.note()}<ol class="first-task-path"><li>选一只个股</li><li>体验诊断</li><li>完成领积分</li></ol></div>
      ${uncovered.length?`<p class="flow-small">${esc(uncovered.map(x=>x.name).join("、"))}暂无可用诊断资料，本轮不生成结论。可先选择下方样例。</p>`:""}<fieldset class="first-task-options"><legend>选择这次想诊断的个股</legend>${options(items,selected)}</fieldset>
      <p class="first-task-choice" id="firstTaskReason">${selected?esc(relation(items.find(x=>x.id===selected))):'请选择一只个股后开始。'}</p>
      ${context||taskDraft||q('#chatInput').value?'<p class="flow-small">体验会临时打开一段解读，结束时可返回你原来的对话和输入。</p>':''}
      ${newcomerReward.status()==='ready'?newcomerReward.panel():''}${boundary}<div class="modal-actions newcomer-offer-actions"><button class="button" data-first-later>先逛工作台</button><button class="button primary" data-first-start ${selected?'':'disabled'}>开始免费体验</button></div>`,'新手个股诊断');
  }
  function clean(){
    all('[data-first-ui]').forEach(el=>el.remove());
    all('.first-task-highlight').forEach(el=>el.classList.remove('first-task-highlight'));
  }
  function restoreConversation(saved){
    context=saved.context;taskDraft=saved.taskDraft;
    q('#chatInput').value=saved.input;q('#assistantContent').replaceChildren(...saved.nodes);
    if(context){const draft=taskDraft;setContext(context);taskDraft=draft;}
    else assistantDefault();
    q('#assistantContent').scrollTop=saved.scroll;
  }
  function stop(restore=false){
    const previous=task;task=null;clean();
    if(previous?.openedDetails?.isConnected)previous.openedDetails.open=false;
    if(restore&&previous?.saved)restoreConversation(previous.saved);
  }
  function begin(){
    const item=offerState?.items.find(x=>x.id===offerState.selected);if(!item)return;
    const issue=reportIssue(beijingClock().slice(0,10),'morning');
    const saved=context||taskDraft||q('#chatInput').value?{context,taskDraft,input:q('#chatInput').value,nodes:[...q('#assistantContent').childNodes],scroll:q('#assistantContent').scrollTop}:null;
    closeModal();context=null;taskDraft=null;q('#chatInput').value='';showBrief(issue.id);
    task={id:item.id,item,issue,step:'read',saved,openedDetails:null};
    let card=q(`#briefView [data-personal-alert="${item.id}"]`);
    if(!card){
      // A hidden alerts section is opened for this task only; preferences stay untouched.
      const company=briefItems.find(x=>x.id===item.id),holder=document.createElement('section');
      holder.dataset.firstUi='temporary-material';holder.className='first-task-temporary';
      holder.innerHTML='<p class="flow-small">本次临时展开特别提醒，原来的栏目设置保持不变。</p>'+(company?briefAlert(company,issue):briefFeaturedNews(item.id,issue));
      q('#briefView .detail-cover').after(holder);card=holder.querySelector('[data-personal-alert]');
    }
    if(!card){stop(true);toast('未能打开这条资料，请重新选择');return;}
    const details=card.closest('details');if(details&&!details.open){details.open=true;task.openedDetails=details;}
    task.card=card;
    if(innerWidth<=1100)closeAssistant();
    renderCard();
  }
  function header(step,title){return `<header class="first-task-header"><span>首次任务 · ${step} / 3</span><button class="text-action" data-first-exit>退出体验</button></header><h3 tabindex="-1" class="first-task-title">${title}</h3>`;}
  function questionButton(){return task?.card.querySelector('[data-brief-action="question"],[data-editorial-ask]');}
  function renderCard(){
    all('[data-first-ui="coach"]').forEach(x=>x.remove());
    const coach=document.createElement('section');coach.className='first-task-coach';coach.dataset.firstUi='coach';
    coach.setAttribute('aria-label','首次个股诊断');
    coach.innerHTML=header(2,'这次，先诊断'+esc(material(task.id).name))+`<p>${esc(relation(task.item))}</p>${researchRisk.note(task.id)}<p>结合下方公司资料，查看事件影响、待验证风险，以及下一步该核对什么。</p><button class="button primary" data-first-read>开始个股诊断（演示）</button><p class="first-task-boundary">点击后打开预设诊断。财务、估值与完整持仓诊断未接入，不会给出买卖建议。</p>`;
    task.card.prepend(coach);coach.querySelector('h3').focus({preventScroll:true});coach.scrollIntoView({block:'center',behavior:'instant'});
  }
  function answerOpened(id){
    if(!task||!['read','ask'].includes(task.step)||task.id!==id)return;
    if(context?.kind!=='brief'||context.company!==material(id).name||!q('#assistantContent .brief-answer'))return;
    all('[data-first-ui="coach"]').forEach(x=>x.remove());all('.first-task-highlight').forEach(x=>x.classList.remove('first-task-highlight'));
    task.step='result';
    const m=material(id),coach=document.createElement('section');coach.className='first-task-coach first-task-result';coach.dataset.firstUi='result';
    coach.innerHTML=header(3,esc(material(id).name)+' · 本期资料诊断')+`<p class="first-task-focus">${esc(m.name)} · ${esc(briefPersonalization.focusLabel())}</p>${researchRisk.note(id)}<dl><dt>公司事件</dt><dd>${esc(m.summary)}</dd><dt>影响与成立条件</dt><dd>${esc(m.impact)}</dd><dt>与你有什么关系</dt><dd>${esc(relation(task.item))}</dd><dt>风险与后续验证</dt><dd>${esc(m.watch)}</dd></dl><section class="diagnosis-gap"><strong>诊断范围与缺口</strong><p>当前仅有本条公司事件资料。最新财务质量、估值和完整持仓风险尚未获取，本次不能作综合诊断结论。</p></section><p class="first-task-boundary">固定资料版 · 预设解读，未调用在线 AI。详细分析与原始来源在下方。</p><button class="button primary" data-first-complete>看完诊断，完成体验</button>`;
    q('#assistantContent').prepend(coach);q('#assistantContent').scrollTop=0;coach.querySelector('h3').focus({preventScroll:true});
  }
  function complete(){
    if(task?.step!=='result'||!q('[data-first-ui="result"]'))return;
    if(!newcomerReward.complete(material(task.id).name)){
      let error=q('#firstRewardError');if(!error){error=document.createElement('p');error.id='firstRewardError';error.setAttribute('role','alert');q('[data-first-ui="result"]').append(error);}error.textContent='未能保存体验完成状态，积分尚未解锁，请重试。';return;
    }
    task.step='done';const coach=q('[data-first-ui="result"]');
    coach.innerHTML=`<span class="first-task-success">${icon('check')} 首次诊断体验已完成</span><h3 tabindex="-1" class="first-task-title">${esc(material(task.id).name)}，下一步要看什么已经列好。</h3><p>本次已展示公司事件、影响、风险与资料缺口；完整诊断仍需补齐财务和估值信息。</p>${newcomerReward.panel()}<div class="first-task-next"><strong>需要继续关注它的后续进展？</strong><p>可在原有入口设置跟踪，确认后才保存。</p><button class="button" data-first-track>设置后续跟踪</button></div><button class="button" data-first-finish>${task.saved?'完成，返回原对话':'完成，继续阅读'}</button><p class="first-task-boundary">积分领取与是否上传持仓、设置订阅无关。后台监控与推送尚未接通。</p>`;
    coach.querySelector('h3').focus({preventScroll:true});q('#assistantContent').scrollTop=0;
  }

  const previousAsk=briefAsk;briefAsk=function(id,...args){const result=previousAsk(id,...args);answerOpened(id);return result;};
  const previousEditorial=editorialAsk;editorialAsk=function(key,...args){const result=previousEditorial(key,...args);if(key.startsWith('news-'))answerOpened(key.slice(5));return result;};
  window.firstResearchTask={offer};
  document.addEventListener('change',e=>{
    if(e.target.name!=='firstTaskMaterial'||!offerState)return;
    const item=offerState.items.find(x=>x.id===e.target.value);if(!item)return;
    offerState.selected=item.id;q('#firstTaskReason').textContent=relation(item);q('[data-first-start]').disabled=false;
  });
  document.addEventListener('click',e=>{
    const button=e.target.closest('button');if(!button)return;
    if(button.hasAttribute('data-first-start'))begin();
    if(button.hasAttribute('data-first-later'))closeModal();
    if(button.hasAttribute('data-first-exit')||button.hasAttribute('data-first-finish')){stop(true);return;}
    if(button.hasAttribute('data-first-read')&&task?.step==='read'){const trigger=questionButton();if(trigger)trigger.click();else toast('当前资料无法开始诊断，请重新选择个股');}
    if(button.hasAttribute('data-first-complete'))complete();
    if(button.hasAttribute('data-first-track')&&task?.step==='done'){
      const id=task.id,saved=task.saved;stop(false);eventTrackingAssistant(id);
      trackingReturn=saved;
    }
    if(button.hasAttribute('data-first-resume')&&trackingReturn){const saved=trackingReturn;trackingReturn=null;restoreConversation(saved);openAssistant();}
  });
  // Changing page or opening another workflow ends the temporary guide, not the user's data.
  document.addEventListener('click',e=>{if(task&&e.target.closest('[data-profile-open],[data-profile-onboarding],#onboardingTourEntry,[data-brief-custom]'))stop(true);},true);
  document.addEventListener('keydown',e=>{if(e.key==='Escape'&&task&&!q('dialog[open]')){e.preventDefault();stop(true);}});
  document.addEventListener('DOMContentLoaded',()=>{
    new MutationObserver(()=>{
      if(trackingReturn&&!q('[data-first-resume]'))q('#assistantContent').insertAdjacentHTML('beforeend','<button class="text-action" data-first-resume>返回体验前的对话（未确认的跟踪草稿不保存）</button>');
      if(!task)return;
      if(activeView!=='brief'||selectedIssue?.id!==task.issue?.id||!task.card?.isConnected){stop(true);return;}
      if(['result','done'].includes(task.step)&&!q('[data-first-ui="result"]'))stop(false);
    }).observe(q('.work-area'),{childList:true,subtree:true});
  });
})();
