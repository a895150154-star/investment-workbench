/* Compact personal reminders. Uses existing evidence, preferences and tracking;
 * no model calls, new market facts, or automatic subscription writes. */
(() => {
  const materialDisclosureState=new Map();
  function ensurePersonalBriefDefault(){
    if(state.personalBriefDefaultVersion===1)return;
    const legacy=['indexes','market','brief','events','stocks','sectors','funds'];
    if(!state.pinned.length&&state.order.length===legacy.length&&state.order.every((id,i)=>id===legacy[i])){
      state.order=['brief','indexes','market',...legacy.slice(3)];
    }
    state.personalBriefDefaultVersion=1;save();
  }
  const followups={
    '2490095':'关注客户适配、实际机型与交付披露，再核对是否形成持续采购。若适配延期，需重新评估落地节奏；具体披露日期尚未取得。',
    '2490104':'关注延后订单是否补发，以及季度议价、收入确认与回款。若物流恢复后出货仍偏弱，需要重新核对公司解释；更新日期尚未取得。',
    xys:'核对归属条件与股份上市时间。经营判断仍需客户、订单和交付材料，不能从激励安排推导需求增长。',
    zjxc:'先核对股份变动类别、生效时间及资金用途；经营增长另看产品交付与客户披露。完整条款尚待核对。',
    tftx:'核对产品期限、赎回条件与经营付款安排，继续看实际购买和资金回收。仅有授权，尚不能判断经营用款是否受影响。'
  };
  const trackFocus={'2490095':'客户适配与实际交付','2490104':'延后订单补发与季度议价'};
  function data(id){return briefItems.find(x=>x.id===id)||briefNewsAnalysis[id];}
  function reading(id){
    const a=data(id),v=focusDemo.variant(id);
    const analysis=v.key==='business'?v.sections[0][1]+' '+v.sections[2][1].replace('财务分析样例只能列出缺口，','').replace('本次财务样例保留为待补','相关财务资料尚待补充').replace('这里只展示核验路径，',''):v.key==='events'?briefPersonalization.metadata[id].events+' '+a.answer:a.answer;
    return {analysis,watch:followups[id],variant:v};
  }
  function questions(id){
    const a=data(id),v=focusDemo.variant(id);
    const events={
      '2490095':'海光芯片发布后，哪些进展值得继续跟踪？',
      '2490104':'中船特气的延后交付，接下来如何核对？',
      xys:'新易盛这次激励安排，接下来要核对什么？',
      zjxc:'中际旭创的股本变动，还需要哪些披露？',
      tftx:'天孚通信现金管理授权后，哪些进展值得关注？'
    };
    const first=v.key==='events'?{label:events[id],answer:followups[id]}:{label:a.question,answer:a.answer};
    return [first,...v.questions.slice(1)];
  }
  function trackLabel(id){if(researchDemo.isCase(id))return researchTracking.get().record?'管理追踪':'设置后续追踪';const t=eventTracking[id];return t?.demo?'查看追踪示例':t?(eventTrackingActive(t)?'已追踪 · 管理':'完善追踪条件'):'追踪这条线索';}
  function entryActions(id,issue){return `<div class="reminder-actions reminder-entry-actions">${opLink('查看完整解读',eventRoute(id,issue.id),'button primary')}<button type="button" class="button" data-reminder-questions="${esc(id)}" data-issue="${esc(issue.id)}">问闪电猫</button></div>`;}
  function openReminderQuestions(id,issue){
    if(researchDemo.isCase(id))researchDemo.openQuestions(issue.id);
    else{
      const a=data(id),item=briefItems.find(x=>x.id===id),source=item?.a||briefNews.find(x=>x.id===id);if(!a||!source)return;
      const name=a.company||a.object;
      setContext({kind:'brief',company:name,briefIssue:issue.id,briefItem:item?id:undefined,editorialKey:item?undefined:'news-'+id,source:source.title,topic:source.title,question:'围绕'+name+'继续研究'});
      openAssistant();$('#assistantContent').hidden=false;$('#chatForm').hidden=false;
      $('#assistantContent').innerHTML=`<div class="reminder-assistant"><span class="research-demo-label" title="${esc(source.title)}">${esc(name)} · ${esc(issue.day)} · ${issue.period==='morning'?'早报':'晚报'}</span><h2 class="assistant-greeting">继续核对这条资料。</h2><div class="reminder-assistant-questions" role="group" aria-label="${esc(name)}的可选问题">${questions(id).map((q,i)=>`<button type="button" class="suggestion" data-reminder-ask="${esc(id)}" data-question-index="${i}" data-issue="${esc(issue.id)}">${esc(q.label)}</button>`).join('')}</div><p class="editorial-runtime-note">固定资料与预设解读 · 未接入在线 AI</p></div>`;
      $('#assistantContent').scrollTop=0;
    }
    $('#assistantContent [data-research-question],#assistantContent [data-reminder-ask]')?.focus({preventScroll:true});
  }
  function card(old,id,issue){
    if(researchDemo.isCase(id))return `<article class="report-alert reminder-card research-demo-card" data-personal-alert="${id}" id="analysis-${id}">
      <header class="report-alert-title"><strong class="reminder-security">海光信息</strong><span class="brief-reason-tag">长期关注</span><span class="research-demo-label">演示用户 · 事件进展</span></header>
      <p class="research-demo-reason"><strong>为什么推荐</strong>${esc(researchDemo.relation)}</p>
      <h3>${opLink(esc(data(id).headline),eventRoute(id,issue.id),'report-event-title')}</h3>
      <p>${esc(researchDemo.summary)}</p>
      <div class="report-attribution"><span>${esc(researchDemo.status(issue))}</span><time>原文日期：2026-09-22 至 2026-09-23</time></div>
      <div class="report-analysis reminder-analysis"><p><strong>后续关注</strong>客户适配、实际交付和持续采购；推进、延期或取消都需要核对具体资料。</p>
      ${entryActions(id,issue)}</div>
    </article>`;
    const a=data(id),item=briefItems.find(x=>x.id===id),news=briefNews.find(x=>x.id===id),source=item?.a||news;
    const found=trackedEvent(eventRoute(id,issue.id)),sources=window.eventSources?.sources(found)||[];
    const original=document.createElement('template');original.innerHTML=old;
    const tags=[...original.content.querySelectorAll('.brief-reason-tag')].slice(0,2).map(x=>x.outerHTML).join('');
    const name=a.company||a.object,key=briefPersonalization.metadata[id].identity,r=reading(id);
    const quote=item?briefQuoteByCode(item.code):null;
    return `<article class="report-alert reminder-card" data-personal-alert="${id}" id="analysis-${id}">
      <header class="report-alert-title">${opLink(esc(name),opQuoteRoute(key,issue.id),'reminder-security')}${quote?briefQuoteValues(item.code):''}${tags}</header>
      ${quote?`<small class="reminder-quote-date">${esc(item.code)} · 行情快照 ${esc(briefQuoteTime(quote))}</small>`:''}
      <h3>${opLink(esc(source.title),eventRoute(id,issue.id),'report-event-title')}</h3>
      <div class="report-attribution"><time>${esc(source.date||source.time)}</time><a href="${esc(source.url)}" target="_blank" rel="noopener noreferrer" class="reminder-source">${esc(source.source)}原文</a>${sources.length>1?`<button type="button" class="reminder-sources" data-reminder-sources="${id}" data-issue="${esc(issue.id)}">同事件资料 · ${sources.length}</button>`:''}${quote?briefSource('腾讯行情 · '+name,issue):''}</div>
      <div class="report-analysis reminder-analysis" data-focus-mode="${r.variant.key}"><p><strong>分析</strong>${esc(r.analysis)}</p><p><strong>后续关注</strong>${esc(r.watch)}</p>
        ${entryActions(id,issue)}
      </div>
    </article>`;
  }
  const originalDocument=briefDocument;
  briefDocument=function(issue){
    const previousDisclosure=document.querySelector('#briefView .brief-other-materials[data-reminder-issue]');
    if(previousDisclosure)materialDisclosureState.set(previousDisclosure.dataset.reminderIssue,previousDisclosure.open);
    const html=originalDocument(issue);if(issue.period!=='morning')return html;
    const t=document.createElement('template');t.innerHTML=html;
    t.content.querySelectorAll('[data-personal-alert]').forEach(el=>{el.outerHTML=card(el.outerHTML,el.dataset.personalAlert,issue);});
    const holder=t.content.querySelector('.brief-personal-alerts'),demo=holder?.querySelector('[data-personal-alert="2490095"]');
    if(demo){
      holder.prepend(demo);
      const other=holder.querySelector('[data-personal-alert]:not([data-personal-alert="2490095"])');
      if(other)other.insertAdjacentHTML('beforebegin',`<p class="research-other-scope">其他关注内容 · 阅读重点：${esc(briefPersonalization.focusLabel())}</p>`);
    }
    const repeated=t.content.querySelector('.report-news [data-brief-action="news"][data-brief-value="2490095"]')?.closest('li');
    if(demo&&repeated){
      repeated.classList.add('research-event-reference');repeated.dataset.researchReference=researchDemo.id;
      repeated.innerHTML=`<strong>海光信息 · 端侧芯片发布</strong><p>已在个人提醒中解读；继续核对客户适配、交付与采购。<span>原文：2026-09-22 至 2026-09-23</span></p>${opLink('查看同一事件的综合解读',eventRoute(researchDemo.id,issue.id),'text-action')}`;
    }
    t.content.querySelector('.brief-personal-intro')?.remove();
    t.content.querySelector('.brief-personal-boundary')?.remove();
    t.content.querySelector('.brief-editorial-opening')?.remove();
    const heading=t.content.querySelector('#brief-alerts span');if(heading)heading.textContent='海光演示优先 · 事件进展';
    const others=t.content.querySelector('.brief-other-materials > .flow-small');if(others)others.textContent='更多本期资料 · 阅读重点：'+briefPersonalization.focusLabel();
    const disclosure=t.content.querySelector('.brief-other-materials');if(disclosure){disclosure.dataset.reminderIssue=issue.id;disclosure.open=materialDisclosureState.get(issue.id)||false;}
    return t.innerHTML;
  };
  // The approved fixed case has its own visible recommendation explanation.
  const originalOverview=briefOverview;
  briefOverview=function(issue){
    const html=originalOverview(issue);if(issue.period!=='morning')return html;
    const t=document.createElement('template');t.innerHTML=html;
    const panel=t.content.querySelector('.brief-cover-personal');
    if(panel){panel.classList.add('research-demo-preview');panel.innerHTML=`
      <div class="brief-cover-kicker">我的关注线索 <span>演示用户 · 事件进展</span></div>
      <div class="brief-cover-company"><strong>海光信息</strong><span class="brief-reason-tag">长期关注</span></div>
      <p class="research-demo-reason"><strong>为什么推荐</strong>你长期关注海光信息。本次产品发布值得继续核对客户适配与交付进展。</p>
      <p class="brief-cover-summary"><strong>事件摘要</strong>${esc(researchDemo.summary)}</p>
      <p class="brief-cover-followup"><strong>下一步验证</strong>客户适配、实际交付、持续采购；不把发布直接视为经营兑现。</p>
      <p class="research-demo-date">${esc(researchDemo.status(issue))}<br>原文日期：2026-09-22 至 2026-09-23</p>
      ${opLink('查看完整解读',eventRoute(researchDemo.id,issue.id),'button primary research-demo-entry')}`;
      const lead=t.content.querySelector('.brief-cover-lead');if(lead)lead.textContent='先看海光信息的事件进展，再读市场背景。';
      const disclosure=t.content.querySelector('.brief-cover-disclosure');if(disclosure)disclosure.textContent='固定案例 · 演示用户长期关注海光信息 · 未提供持仓 · 原文日期保持不变';
    }
    return t.innerHTML;
  };
  function updateTracking(){document.querySelectorAll('[data-reminder-track]').forEach(b=>{b.innerHTML=icon('bell')+trackLabel(b.dataset.reminderTrack);});}
  const refresh=eventTrackingRefresh;
  eventTrackingRefresh=function(...args){const result=refresh(...args);updateTracking();return result;};
  document.addEventListener('click',e=>{
    const b=e.target.closest('[data-reminder-questions],[data-reminder-ask],[data-reminder-track],[data-reminder-sources]');if(!b)return;
    const issue=issueFromId(b.dataset.issue);if(!issue)return;
    if(b.dataset.reminderQuestions){openReminderQuestions(b.dataset.reminderQuestions,issue);return;}
    if(b.dataset.reminderSources){showTrackedEvent(eventRoute(b.dataset.reminderSources,issue.id));$('#eventSources')?.scrollIntoView({block:'start'});return;}
    if(b.dataset.reminderTrack){if(researchDemo.isCase(b.dataset.reminderTrack))researchTrackingUI.configure(issue.id);else eventTrackingAssistant(b.dataset.reminderTrack);return;}
    const id=b.dataset.reminderAsk,q=questions(id)[Number(b.dataset.questionIndex)];if(!q)return;
    if(briefItems.some(x=>x.id===id))briefAsk(id,issue,false,q.label);else editorialAsk('news-'+id,q.label,null,issue.id);
    $('#assistantContent .user-message')?.insertAdjacentHTML('afterend',`<section class="guide-specific-answer"><strong>本次核对重点</strong><p>${esc(q.answer)}</p></section>`);
  });
  window.briefReminders={reading};
  // Later review-note handlers had hidden the existing time demonstration controls.
  function bindReviewNotes(){
    const priorNotes=$('#designNotes').onclick;if(priorNotes?.researchDemoNotes)return;
    const handler=function(...args){
      priorNotes?.apply(this,args);mountBriefDemoClock();
      const issue=reportIssue(researchTrackingUI.issueFor().day,'evening');
      $('#modalTitle').textContent='V2.62 · 设计说明';$('#modalEyebrow').textContent='个人投研工作台 · 本地评审';
      $('#modalBody').insertAdjacentHTML('afterbegin',`<section><h3>个性化如何体现在内容中</h3><p>已确认的关注与研究偏好，应影响选哪些信息、先看什么、重点解释什么，以及继续研究的问题与入口。</p><p>当前海光案例：长期关注决定推荐对象；事件进展决定先看发布事实与后续验证；三个预设问题和追踪入口承接客户适配、交付与采购。首页默认先展示个人简报，已自定义的排序保留。</p><p>这是固定案例演示，尚未实现完整画像驱动的动态推荐。基本面、技术面、长短线及风险风格是讨论中的举例，分类与具体规则尚待确认。其他关注内容继续使用你已保存的偏好。</p></section><section><h3>本批体验路径</h3><p>早报、事件研究和追踪流程沿用前两批。晚报先看个人标的表现，再读原因及证据、下一交易日观察，最后结合市场背景。</p><p>固定演示用户长期关注海光信息，阅读重点为事件进展，未提供持仓。正文默认展示完整回顾，假设行情保留标识。</p></section><section><h3>晚报演示场景</h3><p>仅供原型评审使用。选择后打开 ${esc(issue.day)} 的晚报；直接关闭说明不改变当前内容。</p>${researchTrackingUI.reviewControls(issue)}<p>“行情变化示例”包含明确标记的假设行情；“仅看已录入进展”只回顾原追踪资料，没有本期进展时收起空卡片。切换不会保存偏好或生成信号，刷新恢复默认示例。</p></section>`);
    };
    handler.researchDemoNotes=true;$('#designNotes').onclick=handler;
  }
  function render(){bindReviewNotes();document.querySelector('.design-strip b').textContent='V2.62';if(activeView==='brief'&&selectedIssue)showBrief(selectedIssue.id);else if(activeView==='overview')renderWidgets();}
  ensurePersonalBriefDefault();render();document.addEventListener('DOMContentLoaded',render,{once:true});
})();
