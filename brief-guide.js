/* Local reading guide: reuse this issue's rendered objects and existing question actions. */
(() => {
  const reduced=matchMedia('(prefers-reduced-motion: reduce)');
  let current=null;
  let details={};
  function detailButton(id,label,answer,base){const key=id+"-"+Object.keys(details).length;details[key]={id,label,answer,base};return `<button class="suggestion" data-guide-detail="${key}">${esc(label)}${icon("arrow-up-right")}</button>`;}
  function demoEntry(issue){
    return {name:researchDemo.name,copy:'先核对这次发布，再看客户适配、交付与采购的验证进展。',scope:'海光演示 · 阅读重点：事件进展 · 持仓未提供',questions:researchDemo.questions.map((q,i)=>`<button type="button" class="suggestion" data-research-question="${i}" data-research-issue="${esc(issue.id)}">${esc(q.label)}</button>`)};
  }
  function entries(issue){
    details={};
    const t=document.createElement('template');t.innerHTML=briefDocument(issue);
    const nightEvents=window.eveningReferenceData?.events||eveningEvents;
    if(issue.period==='evening'&&window.workbenchClient.desktop)return [{name:'整份晚报',whole:true,copy:'从本期收盘资料出发，选择想进一步核对的问题。',questions:[]}];
    if(issue.period==='evening')return [
      ...(t.content.querySelector('.research-evening-review:not(.is-quiet)')?[demoEntry(issue)]:[]),
      {name:'整份晚报',whole:true,copy:'从本期收盘资料出发，选择想进一步核对的问题。',questions:[eveningAskButton('a-market','放量但上涨家数减少，怎么理解？'),eveningAskButton('hk-market','科技方向分化，后面看什么？'),...nightEvents.map(e=>eveningAskButton(e.id,e.question))]},
      ...nightEvents.map(e=>({name:e.tag,copy:e.title,questions:[eveningAskButton(e.id,e.question),...e.sections.map(([h,a])=>detailButton(e.id,'关于「'+h+'」，有哪些依据和待验证事项？',a,'evening'))]}))
    ];
    const result=[{name:'整份简报',whole:true,scope:'海光演示：事件进展；其他内容：'+briefPersonalization.focusLabel(),copy:'梳理本期重点，比较不同标的的变化，再选择一个对象深入。',questions:['priorities','optical','ai','etf'].map(k=>editorialAskButton(k))}];
    const seen=new Set();
    function add(name,copy,questions){if(seen.has(name))return;seen.add(name);result.push({name,copy,questions});}
    t.content.querySelectorAll('[data-personal-alert]').forEach(el=>{
      const id=el.dataset.personalAlert,item=briefItems.find(x=>x.id===id),news=briefNewsAnalysis[id];
      if(researchDemo.isCase(id)){if(!seen.has(researchDemo.name)){seen.add(researchDemo.name);result.push(demoEntry(issue));}return;}
      const demo=window.focusDemo?.variant(id);if(demo){add(demo.name,demo.label+' · '+demo.sections[0][1],demo.questions.map(q=>detailButton(id,q.label,q.answer,item?'item':'news')));return;}
      if(item)add(item.company,briefPersonalization.material(id)?.text||'从本期公司披露出发，核对事项、经营影响与后续观察点。',[
        `<button class="suggestion" ${briefAttrs('question',id,issue)}>${esc(item.question)}${icon('arrow-up-right')}</button>`,
        ...item.checks.map(([h,a])=>detailButton(id,item.company+'的「'+h+'」，还需要核对什么？',a,'item')),
        `<button class="suggestion" ${briefAttrs('source',item.source,issue)}>查看${esc(item.company)}这份公告的来源${icon('arrow-up-right')}</button>`
      ]);
      else if(news)add(news.object,briefPersonalization.material(id)?.text||'围绕本期报道，区分已经发生的变化与仍需验证的经营影响。',[editorialAskButton('news-'+id),...news.checks.map(([h,a])=>detailButton(id,news.object+'：'+h+'，现有资料怎么看？',a,'news')),`<button class="suggestion" ${briefAttrs('source',briefNews.find(n=>n.id===id).title,issue)}>查看${esc(news.object)}的报道依据${icon('arrow-up-right')}</button>`]);
    });
    t.content.querySelectorAll('a[href],[data-brief-action="quote"]').forEach(a=>{
      const match=(a.getAttribute('href')||'').match(/\/(stocks|etfs)\/(\d+)/);
      const q=match?briefQuoteByCode(match[2]):briefSnapshotData.quotes.find(x=>x.name===a.dataset.briefValue);if(!q||seen.has(q.name))return;
      const item=briefItems.find(x=>x.code===q.code);
      if(item)add(q.name,'核对本期公司事项，再看它与研究主题的关系。',[`<button class="suggestion" ${briefAttrs('question',item.id,issue)}>${esc(item.question)}${icon('arrow-up-right')}</button>`]);
      else add(q.name,'从本期提到的标的出发，核对主题关联、资料依据与尚待补齐的信息。',[
        `<button class="suggestion" data-guide-etf="${esc(q.name)}">研究${esc(q.name)}，需要核对哪些指数与成分信息？${icon('arrow-up-right')}</button>`,
        `<button class="suggestion" ${briefAttrs('quote',q.name,issue)}>查看${esc(q.name)}的详情与来源${icon('arrow-up-right')}</button>`
      ]);
    });
    const personal=result.findIndex(x=>x.name===researchDemo.name);if(personal>0)result.unshift(...result.splice(personal,1));
    return result;
  }
  function mount(issue,previous=null){
    const recommended=window.profileBriefQuestions?.buttons(issue)||[],compact=window.workbenchClient.desktop,singleEvening=compact&&issue.period==='evening';
    const items=entries(issue).map(item=>item.whole&&recommended.length?{...item,questions:recommended}:{...item,questions:window.profileBriefQuestions?.recommend(item.questions)||item.questions}),box=$('#assistantContent');
    box.innerHTML=`<section class="brief-guide" aria-label="本期简报追问引导" aria-roledescription="${singleEvening?'预设问题':'手动切换'}">${compact?'':'<div class="guide-toolbar"><span>本期可追问</span></div>'}<div class="guide-tabs" aria-label="选择本期研究对象">${items.map((x,i)=>`<button type="button" data-guide-index="${i}" aria-pressed="${i===0}">${esc(x.name)}</button>`).join('')}</div><div class="guide-track">${items.map((x,i)=>`<section class="guide-slide" aria-label="${esc(x.name)}" ${i?'inert':''}><h2 class="assistant-greeting">${x.whole?'这期简报，继续往下拆。':esc(x.name)+'，继续往下看。'}</h2>${compact?'':`<p class="assistant-copy">${esc(x.copy)}</p>`}<div class="assistant-scope">${icon('link')}${esc(x.scope||(issue.period==='evening'?'依据本期晚报资料':'当前阅读重点：'+(window.briefPersonalization?.focusLabel()||'综合解读')))}</div>${x.name!==researchDemo.name&&issue.period==='morning'&&briefPersonalization.candidates().some(c=>c.name===x.name&&briefPersonalization.material(c.id))?'<p class="guide-hint">根据你确认的研究偏好，相关资讯优先；问题仍依据本期资料。</p>':''}<div class="suggestion-label">${x.whole?'从整份简报开始问':'围绕'+esc(x.name)+'继续问'}</div>${compact?'':`<p class="guide-question-count">${x.questions.length} 个问题 · 上下滚动查看更多</p>`}<div class="guide-questions" tabindex="0" aria-label="${esc(x.name)}的可选问题">${x.questions.join('')}</div></section>`).join('')}</div>${singleEvening?'':`<div class="guide-navigation"><button type="button" data-guide-step="-1" aria-label="上一个研究对象">${icon('chevron-left')}</button><span data-guide-position>1 / ${items.length} · ${items[0].name}</span><button type="button" data-guide-step="1" aria-label="下一个研究对象">${icon('chevron-right')}</button></div><p class="guide-hint">左右滑动、点击研究对象或箭头，手动切换</p>`}<p class="editorial-runtime-note">固定资料与预设解读 · 日期以各条原文为准 · 未接入在线 AI</p></section>`;
    const root=box.querySelector('.brief-guide'),track=root.querySelector('.guide-track');
    const state={root,track,items,index:0,issue};current=state;
    const update=()=>{
      root.querySelectorAll('[data-guide-index]').forEach((b,i)=>b.setAttribute('aria-pressed',String(i===state.index)));
      track.querySelectorAll('.guide-slide').forEach((slide,i)=>slide.inert=i!==state.index);
      const position=root.querySelector('[data-guide-position]');if(position)position.textContent=`${state.index+1} / ${items.length} · ${items[state.index].name}`;
      const tabs=root.querySelector('.guide-tabs'),button=tabs.children[state.index];
      tabs.scrollTo({left:button.offsetLeft-tabs.offsetLeft-(tabs.clientWidth-button.clientWidth)/2,behavior:reduced.matches?'instant':'smooth'});
    };
    function go(index,instant=false){state.index=(index+items.length)%items.length;update();track.scrollTo({left:state.index*track.clientWidth,behavior:'instant'});}
    state.go=go;
    root.addEventListener('keydown',e=>{if(singleEvening)return;if(e.key==='ArrowRight'||e.key==='ArrowLeft'){e.preventDefault();go(state.index+(e.key==='ArrowRight'?1:-1));root.querySelector(`[data-guide-index="${state.index}"]`).focus({preventScroll:true});}});
    root.addEventListener('click',e=>{
      const button=e.target.closest('button');if(!button)return;
      if(button.hasAttribute('data-guide-index')){go(Number(button.dataset.guideIndex));}
      if(button.dataset.guideStep){go(state.index+Number(button.dataset.guideStep));}
      if(button.dataset.guideDetail){const d=details[button.dataset.guideDetail];if(d){if(d.base==='evening'){eveningAsk(d.id);$('#assistantContent .user-message').textContent=d.label;context.question=d.label;}else if(d.base==='item')briefAsk(d.id,issue,false,d.label);else editorialAsk('news-'+d.id,d.label,null,issue.id);$('#assistantContent .user-message').insertAdjacentHTML('afterend',`<section class="guide-specific-answer"><strong>本次核对重点</strong><p>${esc(d.answer)}</p><small>以下保留本期完整解读与来源，未调用在线 AI。</small></section>`);}}
      if(button.dataset.guideProfile)window.profileBriefQuestions.ask(button.dataset.guideProfile,issue);
      if(button.dataset.guideEtf)editorialAsk('etf',button.textContent.trim(),button.dataset.guideEtf,issue.id);
    });
    let scrollTimer;
    track.addEventListener('scroll',()=>{clearTimeout(scrollTimer);scrollTimer=setTimeout(()=>{if(!root.isConnected)return;state.index=Math.max(0,Math.min(items.length-1,Math.round(track.scrollLeft/track.clientWidth)));update();},150);},{passive:true});
    if(previous){
      go(Math.max(0,items.findIndex(item=>item.name===previous.name)),true);
      root.querySelectorAll(".guide-questions").forEach((n,i)=>n.scrollTop=previous.questionScroll?.[i]||0);
    }
    box.scrollTop=previous?.scrollTop||0;
  }
  // Rebuild preference-dependent guidance while keeping the reader's chosen object.
  // Conversation answers and subscription drafts are not carousel content.
  window.briefGuide={
    capture(){const s=current;return s?.root.isConnected?{name:s.items[s.index].name,issue:s.issue,scrollTop:s.root.parentElement.scrollTop,questionScroll:[...s.root.querySelectorAll(".guide-questions")].map(n=>n.scrollTop)}:null;},
    restore(state){mount(state.issue,state);}
  };
  const previous=assistantDefault;
  assistantDefault=function(){previous();if(context||taskDraft||!['overview','brief'].includes(activeView))return;mount(activeView==='brief'?selectedIssue:briefSnapshot().displayed);};
  document.addEventListener('click',e=>{
    if(e.target.closest('[data-guide-return]')){const issue=current?.issue||selectedIssue||briefSnapshot().displayed;context=null;taskDraft=null;assistantDefault();return;}
    if(!e.target.closest('.brief-guide .suggestion,.brief-guide [data-evening-ask]'))return;
    const issue=current?.issue;
    queueMicrotask(()=>{if(issue&&context?.kind==='brief'&&!$('#assistantContent .brief-guide'))$('#assistantContent').insertAdjacentHTML('afterbegin','<button type="button" class="text-action guide-return" data-guide-return>← 继续浏览本期问题</button>');});
  });
  document.addEventListener('research-methods-changed',()=>{if(context||taskDraft||!['overview','brief'].includes(activeView)||document.querySelector('[data-first-ui]'))return;const saved=window.briefGuide.capture();if(saved)mount(saved.issue,saved);else assistantDefault();});
  document.addEventListener('DOMContentLoaded',()=>{if(!context&&!taskDraft&&['overview','brief'].includes(activeView))assistantDefault();});
  if(!context&&!taskDraft&&['overview','brief'].includes(activeView))mount(activeView==='brief'?selectedIssue:briefSnapshot().displayed);
})();
