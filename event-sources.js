/* Curated same-event sources, reviewed 2026-09-28. Not automatic clustering. */
(() => {
  const supplements={
    '2490095':researchDemo.sources
  };
  function bundle(found){
    const {item,companyItem}=found;
    if(supplements[item.id])return supplements[item.id];
    if(item.origin==='reference')return [];
    const data=companyItem?.a||briefNews.find(n=>String(n.id)===String(item.id));
    return data?.url?[{key:data.evidenceId||data.url,title:data.title,publisher:data.source,type:companyItem?'公告':'新闻',date:data.date||data.time,url:data.url,role:companyItem?'公司披露':'新闻报道',contribution:companyItem?'已保留公告标题、日期与原文链接；条款正文尚未解析。':'本期事件的已有报道入口；尚未补齐同事件的其他材料。',checked:null}]:[];
  }
  function sources(found){return [...new Map(bundle(found).map(x=>[x.key,x])).values()];}
  window.eventSources={sources};
  function content(found){
    const list=sources(found),multi=list.length>1;
    const originals=list.length?`<div class="event-source-filters" aria-label="按资料类型筛选">${['全部',...new Set(list.map(x=>x.type))].map((type,i)=>`<button type="button" data-event-source-filter="${type}" aria-pressed="${i===0}">${type}</button>`).join('')}</div><div class="event-source-list">${list.map(x=>`<article class="event-source-row" data-source-type="${x.type}"><div class="event-source-row-meta"><strong>${esc(x.publisher)}</strong><span>${esc(x.role)}</span><time>${esc(x.date||'发布日期未获取')}</time></div><h3>${esc(x.title)}</h3><p><strong>这份资料提供什么</strong>${esc(x.contribution)}</p><div class="event-source-row-footer"><span>${x.checked?'已核对正文 · '+x.checked:found.companyItem?'仅标题与链接 · 本期留存':'本期留存资料'}</span><a class="text-action" href="${esc(x.url)}" target="_blank" rel="noopener noreferrer">查看原文 ${icon('arrow-up-right')}</a></div></article>`).join('')}</div>`:'';
    if(researchDemo.isCase(found.item.id))return `<section class="event-source-section research-source-compact" id="eventSources"><div class="event-sources-heading"><div><h2>同一事件的资料</h2><p>三份历史报道支持发布与适配方向，尚未确认订单、交付和收入。</p></div><span class="event-source-total">${list.length} 份资料</span></div><p class="event-source-missing">还缺公司原始发布、客户验证与经营披露；尚未完成逐项分歧核验。</p><details class="event-source-originals"><summary>核对 ${list.length} 份原文及资料分工</summary>${originals}<p class="event-source-boundary">保留历史发布日期；转载不算新增证据，本期模拟进展另列。</p></details></section>`;
    return `<section class="event-detail-section event-source-section" id="eventSources">
      <div class="event-sources-heading"><div><h2>${multi?'这件事，综合看':'同一事件的资料'}</h2><p>${multi?'围绕同一次产品发布，先看资料支持什么，再核对各份原文。':list.length?'目前收录一份资料，可先核对原文。':'当前是模拟场景，尚无可核验的事件原文。'}</p></div><span class="event-source-total">${list.length} 份资料</span></div>
      ${multi?`<div class="event-source-overview"><strong>综合解读 · 预设</strong><p>海光已发布面向端侧的 CPU 1000 系列。现有报道把研究问题从“是否发布”推进到“客户能否采用、能否持续供货”；它们尚不能证明订单、交付或收入已经兑现。</p><small>依据下列三份历史报道整理；不是本期新进展，也不是三份独立的订单证据。</small></div><div class="event-source-contributions"><strong>三份资料各补充什么</strong><ol>${list.map(x=>`<li><a href="${esc(x.url)}" target="_blank" rel="noopener noreferrer">${esc(x.publisher)} · ${esc(x.role)}</a><time>${esc(x.date)}</time><p>${esc(x.contribution)}</p></li>`).join('')}</ol></div>`:''}
      <div class="event-source-missing"><strong>${multi?'分歧与证据缺口':'还缺哪些依据'}</strong><p>${multi?'尚未完成逐项分歧核验，不能据此断言三份资料完全一致。公司原始发布材料、正式公告及研报尚未收录；客户适配结果、实际交付规模与持续采购仍缺直接依据。下一步按下方验证项继续核对。':list.length?'同事件的其他新闻、公告或研报尚未补齐，不把同公司、同主题的其他事件合并进来。':'模拟解读不计入资料数量；取得真实来源后再补充。'}</p></div>
      ${multi?`<details class="event-source-originals"><summary>核对 ${list.length} 份原文及收录信息</summary>${originals}</details>`:originals}
      <p class="event-source-boundary">按事件主体、具体事项与发生时间核对关联；同一原文只列一次，转载不代表新增独立证据。</p>
    </section>`;
  }
  const original=showTrackedEvent;
  showTrackedEvent=function(r){
    original(r);const found=trackedEvent(r),article=$('#flowView .event-detail');if(!found||!article)return;
    article.querySelector('#eventSources')?.remove();
    const slot=article.querySelector('[data-research-sources]');
    if(slot){
      slot.innerHTML=content(found);slot.firstElementChild.classList.remove('event-detail-section');
      const heading=slot.querySelector('h2'),sub=document.createElement('h3');sub.innerHTML=heading.innerHTML;heading.replaceWith(sub);
    }else{const first=article.querySelector('.event-detail-section');first.insertAdjacentHTML('afterend',content(found));}
    const count=sources(found).length;
    article.querySelector('.event-detail-meta').insertAdjacentHTML('beforeend',`<button type="button" class="text-action" data-event-sources-jump>查看事件资料 · ${count} ${icon('chevron-right')}</button>`);
  };
  const featured=briefFeaturedNews;
  briefFeaturedNews=function(id,issue){
    const html=featured(id,issue);if(!supplements[id])return html;
    const t=document.createElement('template');t.innerHTML=html;
    t.content.querySelector('.report-attribution')?.insertAdjacentHTML('beforeend',opLink('同事件资料 · '+supplements[id].length+' '+icon('chevron-right'),eventRoute(id,issue.id),'text-action event-bundle-link'));
    return t.innerHTML;
  };
  document.addEventListener('click',e=>{
    if(e.target.closest('[data-event-sources-jump]')){const section=$('#eventSources');const originals=section?.querySelector('.event-source-originals');if(originals)originals.open=true;section?.scrollIntoView({block:'start',behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth'});}
    const filter=e.target.closest('[data-event-source-filter]');if(!filter)return;
    const section=filter.closest('.event-source-section'),type=filter.dataset.eventSourceFilter;
    section.querySelectorAll('[data-event-source-filter]').forEach(b=>b.setAttribute('aria-pressed',String(b===filter)));
    section.querySelectorAll('[data-source-type]').forEach(row=>row.hidden=type!=='全部'&&row.dataset.sourceType!==type);
  });
  if(route.type==='event-detail')showTrackedEvent(route);
  else if(activeView==='brief'&&selectedIssue)showBrief(selectedIssue.id);
})();
