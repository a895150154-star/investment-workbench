/* Existing special reminders: confirmed local relations and explicit reading focus.
 * No new market facts, inferred profiles, background monitoring or model calls.
 */
(() => {
  const focusLabels = {general:'综合解读', business:'经营兑现', events:'事件进展'};
  const metadata = {
    '2490095': {name:'海光信息', identity:'event-haiguang', topics:['半导体','端侧算力','端侧芯片'], business:'优先核对客户适配、实际交付与持续采购；产品发布本身不能证明收入兑现。', events:'先区分本次产品发布与后续客户适配、量产交付；继续核对每个阶段是否有公开进展。'},
    '2490104': {name:'中船特气', identity:'event-zctq', topics:['半导体','半导体材料'], business:'优先核对延后交付是否补回，以及议价、收入确认与回款；订单表述还需经营结果验证。', events:'先看公司对出口变化的解释，再跟踪补发进展；未取得后续材料前，保留解释尚待验证的状态。'},
    xys: {name:'新易盛', identity:'300502', topics:['光模块','光通信','算力互联'], business:'先检查这份材料有没有新增客户、订单或交付证据；不能把激励兑现直接当成经营兑现。', events:'优先核对归属条件、股份上市安排与生效时间；未读取条款的部分继续保留为待核对事项。'},
    zjxc: {name:'中际旭创', identity:'300308', topics:['光模块','光通信','算力互联'], business:'优先区分股本变化和业务增长；若涉及融资，还需核对资金用途与项目实施证据。', events:'先核对股份变动类别、生效时间及配套披露，再判断这次报表更新改变了哪些事项。'},
    tftx: {name:'天孚通信', identity:'300394', topics:['光模块','光通信','算力互联'], business:'优先核对资金期限、可赎回条件与经营支出是否匹配；现金管理安排不能直接证明扩产资金充足。', events:'先核对授权范围、产品期限与实施进展；区分公告授权和已经发生的资金使用。'},
  };
  const focus = () => focusLabels[briefPrefs.focus] ? briefPrefs.focus : 'general';
  const tokens = () => briefPrefs.targets.split(/[\s,，、;；]+/).map(x=>x.trim()).filter(Boolean);
  function relationship(id) {
    const m=metadata[id], reasons=[];
    if(briefPrefs.scopes.includes('holdings') && holdingsStore.identities().some(x=>x.type!=='etf' && (x.code===m.identity || x.name===m.name))) reasons.push({label:'持仓关联',text:'该标的在你已确认的本机持仓中。'});
    if(briefPrefs.scopes.includes('watchlist') && opportunityWatch.includes(m.identity)) reasons.push({label:'自选关联',text:'你已将该标的加入本机自选。'});
    const matched=tokens().filter(x=>[m.name,m.identity,...m.topics].includes(x));
    if(matched.length) reasons.push({label:'长期关注',text:'匹配你主动指定的「'+matched.join('、')+'」。'+(window.researchProfile?.source(matched[0])||'')+'。'});
    const method=window.researchMethods?.match(id);
    if(method)reasons.push({label:'研究偏好',text:'你已确认「'+method.scope+' · '+researchMethods.choices[method.key].label+'」。'});
    reasons.push(...(window.researchProfile?.relations(m.name)||[]));
    return {matched:reasons.length>0,reasons,label:reasons.find(r=>r.label)?.label||''};
  }
  function material(id){
    const method=window.researchMethods?.match(id);if(!method)return null;
    // Curated match against the retained source, never inferred from analysis/checklist keywords.
    const direct=id==='2490104'&&['orders','business','eventFocus','events'].includes(method.key)||['eventFocus','events'].includes(method.key);
    return {method,direct,rank:direct?0:1,text:direct?(id==='2490104'&&['orders','business'].includes(method.key)?'本期资料包含公司对出口订单与延后交付的回应；这不等于已经完成交付。':'本期资料包含相关事件披露。'):'本期没有直接匹配这一细项的资料，先看相关公司与行业资讯。'};
  }
  function reading(id) {const m=material(id);return (m?m.text+' ':'')+(focus()==='general'?'先看本次披露，再区分影响判断与后续待验证事项。':metadata[id][focus()]);}
  function tagHTML(id) {return relationship(id).reasons.filter(r=>r.label).map(r=>`<span class="brief-reason-tag">${esc(r.label)}</span>`).join('');}
  function relationHTML(id) {
    const relation=relationship(id);
    if(!relation.matched)return '';
    return `<details class="brief-personal-relation"><summary>为什么推荐${relation.reasons.length>1?' · 多个关联原因':''}</summary><ul>${relation.reasons.map(r=>`<li>${r.label?`<strong>${esc(r.label)}</strong>`:''}${esc(r.text)}</li>`).join('')}</ul><p>本期有该标的的相关材料，优先呈现供你阅读。</p></details>`;
  }
  function readingHTML(id) {return `<p class="brief-personal-focus"><strong>${focus()==='general'?'本次阅读重点':'按你选择的「'+focusLabels[focus()]+'」解读'}</strong>${esc(reading(id))}${material(id)?'<small class="preference-attribution">根据你确认的研究偏好 · '+esc(material(id).method.scope)+' · '+esc(researchMethods.choices[material(id).method.key].label)+'</small>':''}</p>${researchRisk.note(id)}`;}
  window.briefPersonalization={reading,focusLabel:()=>focusLabels[focus()],metadata,candidates,material};
  const oldFeatured=briefFeaturedNews,oldAlert=briefAlert;
  function enrich(html,id) {
    const t=document.createElement('template');t.innerHTML=html;
    const card=t.content.firstElementChild;card.dataset.personalAlert=id;
    const title=card.querySelector('.report-alert-title');
    if(briefItems.some(item=>item.id===id))title.querySelector('.tag')?.remove();
    title.insertAdjacentHTML('beforeend',tagHTML(id));
    card.querySelector('h3').insertAdjacentHTML('beforebegin',relationHTML(id));
    const analysis=card.querySelector('.report-analysis');analysis.insertAdjacentHTML('afterbegin',readingHTML(id));
    if(researchRisk.current()==='steady'||(researchRisk.current()==='unset'&&focus()==='events')) {
      const next=[...analysis.querySelectorAll(':scope > p')].find(p=>p.querySelector('strong')?.textContent==='后续关注');
      if(next)(analysis.querySelector('.risk-reading-note')||analysis.querySelector('.brief-personal-focus')).after(next);
    }
    return t.innerHTML;
  }
  briefFeaturedNews=(id,issue)=>enrich(oldFeatured(id,issue),id);
  briefAlert=(item,issue)=>enrich(oldAlert({...item,reason:''},issue),item.id);
  function candidates() {
    const ranks={'持仓关联':0,'自选关联':1,'长期关注':2,'近期提问':3,'近期浏览':4};
    return Object.keys(metadata).map(id=>({id,...metadata[id],...relationship(id)})).sort((a,b)=>(material(a.id)?.rank??2)-(material(b.id)?.rank??2)||(ranks[a.label]??9)-(ranks[b.label]??9));
  }
  function customization(issue,label='修改阅读重点与关注范围') {return `<button class="text-action" data-brief-custom="${issue.id}" data-brief-focus-edit>${label} ${icon('chevron-right')}</button>`;}
  function intro(issue,matched) {
    const descriptions={general:'先读事件事实，再看传导分析与后续关注。',business:'阅读重点聚焦客户、订单、交付与经营兑现。',events:'阅读重点聚焦事件进展；未设置风险偏好时，后续关注前移。'};
    return `<div class="brief-personal-intro"><div><strong class="brief-focus-current">当前阅读重点：${focusLabels[focus()]}</strong><p>${descriptions[focus()]}</p>${researchRisk.note()}<p>${matched.length?'与你有关的材料已优先展示；可展开「为什么推荐」查看依据。':'本期尚未匹配你的关注对象，可在定制中选择关注范围。'}</p></div>${customization(issue)}</div>`;
  }
  const oldDocument=briefDocument;
  briefDocument=function(issue) {
    const html=oldDocument(issue);if(issue.period!=='morning')return html;
    const t=document.createElement('template');t.innerHTML=html;
    const header=t.content.querySelector('#brief-alerts');if(!header)return html;
    const all=candidates(),matched=all.filter(x=>x.matched),rest=all.filter(x=>!x.matched);
    const cards=new Map([...t.content.querySelectorAll('[data-personal-alert]')].map(el=>[el.dataset.personalAlert,el]));
    let next=header.nextElementSibling;
    while(next&&!next.classList.contains('report-section-head')){const following=next.nextElementSibling;next.remove();next=following;}
    header.querySelector('span').textContent='与你有关的先看 · '+focusLabels[focus()];
    const holder=document.createElement('div');holder.className='brief-personal-alerts';holder.innerHTML=intro(issue,matched);
    matched.forEach(x=>holder.append(cards.get(x.id)));
    if(rest.length) {
      const other=document.createElement('details');other.className='brief-other-materials';other.open=briefPrefs.more;
      other.innerHTML='<summary>本期其他资讯</summary><p class="flow-small">以下为本期其他资讯，未匹配个人关联，因此不显示归因标签。</p>';
      rest.forEach(x=>other.append(cards.get(x.id)));holder.append(other);
    }
    holder.insertAdjacentHTML('beforeend','<p class="brief-personal-boundary">按已确认关注与近期记录整理本期固定资料；近期记录不自动变为长期关注。</p>');
    header.after(holder);
    const opening=t.content.querySelector('.brief-editorial-opening');
    if(opening) opening.innerHTML='<strong>闪电猫导读</strong><p>'+esc(matched.length?'本期先看'+matched.map(x=>x.name).join('、')+'的相关材料。先核对披露内容，再看与你选择的研究重点是否有关。':'本期公开资料涵盖产品发布、交付回应与公司事项。还不了解你的关注时，先保留为可选阅读，不将它们标为你的持仓或偏好。')+'</p>';
    return t.innerHTML;
  };
  const oldOverview=briefOverview;
  briefOverview=function(issue) {
    const html=oldOverview(issue);if(issue.period!=='morning'||!briefPrefs.morning.includes('alerts'))return html;
    const t=document.createElement('template');t.innerHTML=html;const panel=t.content.querySelector('.brief-cover-personal');if(!panel)return html;
    const first=candidates().find(x=>x.matched);
    if(first) {
      const item=briefItems.find(x=>x.id===first.id),news=briefNews.find(x=>x.id===first.id),analysis=briefNewsAnalysis[first.id];
      panel.innerHTML=`<div class="brief-cover-kicker">特别提醒 <span>${focusLabels[focus()]}</span></div><div class="brief-cover-company"><strong>${esc(first.name)}</strong>${tagHTML(first.id)}</div>${relationHTML(first.id)}<p class="brief-cover-summary">${esc(item?.title||analysis.headline)}</p><div class="brief-cover-source">${briefSource(item?.source||news.title,issue)}</div>${readingHTML(first.id)}<button class="text-action brief-preview-link" ${briefAttrs('section','alerts',issue)}>在简报中查看特别提醒 ${icon('chevron-right')}</button>`;
    } else panel.innerHTML=`<div class="brief-cover-kicker">特别提醒 <span>等待关联</span></div><p class="brief-cover-summary">先告诉我，你希望关注哪些变化。</p><p class="brief-personal-empty">本期资料尚未匹配你的关注。添加自选或指定关注后，相关材料会优先呈现。</p>${customization(issue)}<button class="text-action brief-preview-link" ${briefAttrs('section','alerts',issue)}>查看本期其他资讯 ${icon('chevron-right')}</button>`;
    if(first?.id==='2490104'){
      const secondary=t.content.querySelector('.brief-cover-market .brief-cover-news');
      if(secondary){t.content.querySelector('.brief-cover-market .brief-cover-kicker span').textContent='端侧算力';const n=briefNews.find(x=>x.id==='2490095');secondary.innerHTML='<strong>'+esc(briefNewsAnalysis[n.id].headline)+'</strong><span>'+esc(n.summary)+'</span>';const source=secondary.nextElementSibling;if(source?.classList.contains('brief-cover-source'))source.innerHTML=briefSource(n.title,issue);}
    }
    const lead=t.content.querySelector('.brief-cover-lead');if(lead)lead.textContent=first?'先看与你有关的变化，再读市场背景。':'从本期公开资料开始，逐步明确你的关注。';
    const disclosure=t.content.querySelector('.brief-cover-disclosure');if(disclosure)disclosure.textContent='固定资料 '+briefSnapshotData.asOf+' · 关注关系来自本机清单与已保存定制，不代表实时提醒';
    return t.innerHTML;
  };
  const oldSave=saveBriefPreferences;
  saveBriefPreferences=function(event) {
    const previous=briefPrefs;oldSave(event);if(previous===briefPrefs)return;
    if(activeView==='brief'&&selectedIssue) {
      const box=$('#assistantContent'),receipt=document.createDocumentFragment();while(box.firstChild)receipt.append(box.firstChild);
      const currentContext=context,currentDraft=taskDraft;showBrief(selectedIssue.id);context=currentContext;taskDraft=currentDraft;
      box.replaceChildren(receipt);box.scrollTop=0;
    }
  };
  // Existing watch and holding controls already own storage. Read their result only.
  document.addEventListener('click',e=>{
    if(e.target.closest('[data-brief-focus-edit]'))queueMicrotask(()=>{const field=$('#briefFocusField');if(field){field.scrollIntoView({block:'nearest'});field.querySelector('select')?.focus({preventScroll:true});}});
    if(e.target.closest('[data-op-watch],#holdingConfirm,#holdingDeleteConfirm'))queueMicrotask(()=>refreshBrief(true));
  });
  refreshBrief(true);
  if(activeView==='brief'&&selectedIssue)showBrief(selectedIssue.id);
})();
