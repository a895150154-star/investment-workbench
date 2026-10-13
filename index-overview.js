/* Native index card and independent global market detail. Local preferences only. */
(() => {
  window.ICONS.globe='<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c5 5 5 13 0 18-5-5-5-13 0-18Z"/>';
  window.ICONS['chevron-left']='<path d="m15 18-6-6 6-6"/>';
  const data=indexOverviewData,storageKey='vra-design-today-v2-common-indices';
  const sections=[['common','常用指数'],['china','A 股指数'],['global','全球指数'],['commodities','商品与美元'],['fx','重要外汇']];
  const groupName=Object.fromEntries(sections),get=id=>data.quotes.find(q=>q.id===id);
  let common=[...data.common],homePage=0,draft=null;
  try{const saved=JSON.parse(localStorage.getItem(storageKey));if(Array.isArray(saved)){const valid=[...new Set(saved)].filter(id=>get(id));if(valid.length&&valid.length<=12)common=valid;}}catch{}
  const tone=q=>q.percent.startsWith('+')?'up':q.percent.startsWith('−')?'down':'flat';
  const sourceButton=(id,label='资料说明')=>`<button class="indices-source" data-indices-source="${id}">${label} ${icon('external-link')}</button>`;
  const detailLink=(label,id,extra='')=>`<a href="#/global-indices" id="${id}" data-indices-open class="${extra}">${label}</a>`;
  const unit=q=>q.group==='fx'?'右侧货币 / 1 单位左侧货币':q.group==='commodities'?'原图报价 · 单位未提供':'点';
  // Fixed, normalized drawing coordinates for visual illustration; not price history.
  function spark(q,i){
    const shapes=['2,6 7,9 12,7 17,13 22,11 27,18 32,15 37,17 42,13 47,20 52,18 58,23 64,20 70,24','2,8 7,5 12,12 17,9 22,14 27,11 32,15 37,18 42,16 47,21 52,18 58,22 64,20 70,25','2,7 7,11 12,9 17,12 22,8 27,15 32,13 37,19 42,16 47,18 52,23 58,20 64,22 70,21'];
    return `<svg class="indices-spark" viewBox="0 0 74 30" aria-hidden="true"><path d="M0 12H74" class="indices-spark-base"/><polyline points="${shapes[i%3]}" ${tone(q)==='up'?'transform="translate(0 30) scale(1 -1)"':''}/></svg>`;
  }
  function smallQuote(id,i){const q=get(id);return `<a href="#/global-indices" data-indices-open class="indices-mini indices-${tone(q)}" aria-label="${q.name}，参考报价 ${q.value}，${q.percent}，查看全球指数"><span>${q.name}</span><strong>${q.value}</strong><div><b>${q.percent}</b>${spark(q,i)}</div></a>`;}
  window.indexOverviewBody=function(){
    const pages=[];for(let i=0;i<common.length;i+=6)pages.push(common.slice(i,i+6));homePage=Math.min(homePage,pages.length-1);
    return `<div class="indices-summary"><div class="indices-carousel" aria-label="常用指数分页" tabindex="0">${pages.map((ids,i)=>`<div class="indices-slide" aria-label="第 ${i+1} 页">${ids.map(smallQuote).join('')}</div>`).join('')}</div><div class="indices-summary-bottom"><span>截图参考 · 迷你线为走势示意</span><nav class="indices-pagination" aria-label="指数卡片翻页"><button class="icon-button" data-indices-page="prev" aria-label="上一页指数" ${homePage===0?'disabled':''}>${icon('chevron-left')}</button>${pages.map((_,i)=>`<button data-indices-page="${i}" aria-label="第 ${i+1} 页指数" aria-current="${homePage===i?'page':'false'}"><i></i></button>`).join('')}<button class="icon-button" data-indices-page="next" aria-label="下一页指数" ${homePage===pages.length-1?'disabled':''}>${icon('chevron-right')}</button></nav></div></div>`;
  };
  function quoteCard(q){return `<button class="indices-quote indices-${tone(q)}" data-index-quote="${q.id}"><span class="indices-quote-name">${q.name}</span><strong>${q.value}</strong><span class="indices-quote-change">${q.change?`<span>${q.change}</span>`:q.closed?'<small>闭市参考</small>':''}<b>${q.percent}</b></span></button>`;}
  function sectionHead(id,label,tools=''){return `<header class="indices-section-head"><h2>${label}</h2>${tools}</header>`;}
  function quoteSection(id,ids){return `<section class="indices-section" id="indices-${id}">${sectionHead(id,groupName[id],id==='common'?`<button class="text-action" data-indices-manage>${icon('sliders-horizontal')}管理常用</button>`:'')}<div class="indices-quote-grid ${id==='fx'?'indices-fx-grid':''}">${ids.map(id=>quoteCard(get(id))).join('')}</div>${id==='commodities'?'<p class="indices-footnote">沿用原图报价；商品合约月份与计价单位未提供。</p>':''}</section>`;}
  function globalSection(){return `<section class="indices-section" id="indices-global">${sectionHead('global','全球指数')}<div class="indices-regions">${[['asia','亚太市场'],['europe','欧洲市场'],['americas','美洲市场']].map(([region,label])=>`<div><h3>${label}</h3><div>${data.quotes.filter(q=>q.region===region).map(quoteCard).join('')}</div></div>`).join('')}</div></section>`;}
  function worldMap(){
    const markers=[['nasdaq',18,27,20,35],['dow',13,58,18,47],['ftse',42,15,47,31],['dax',59,24,51,33],['euro50',48,66,49,42],['sse',76,40,80,47],['hsi',73,76,79,58],['nikkei',91,21,87,43]];
    const land='M60 96L94 63 157 47 185 58 202 36 266 44 276 63 326 64 333 87 305 101 289 124 258 129 242 157 219 169 203 195 218 218 235 228 257 239 253 260 229 245 206 233 192 212 164 202 148 180 130 167 112 145 78 137Z M279 244L321 236 359 256 381 284 368 309 341 326 329 354 299 378 288 349 278 322 261 304 254 276Z M355 37L404 29 420 55 397 83 366 79 352 54Z M441 86L454 67 475 74 493 58 504 70 525 61 553 71 576 47 637 45 674 33 727 42 753 57 821 50 859 66 910 75 927 96 887 106 865 128 845 145 818 160 816 180 791 204 768 210 755 186 731 174 717 207 694 230 671 211 657 182 624 182 600 165 576 170 559 149 530 147 513 128 485 125 471 108 448 111Z M458 153L496 135 536 146 558 174 588 186 584 222 567 243 552 278 526 301 503 281 486 247 462 223 444 191Z M813 299L843 278 880 281 900 303 884 330 850 334 821 322Z M757 235L777 247 795 249 804 262 781 267 755 254Z M824 218L837 231 833 246 823 242Z M881 153L890 161 886 178 877 183Z M909 338L917 341 912 357 903 360Z';
    return `<section class="indices-map-section" aria-label="全球主要市场示意"><div class="indices-map-heading"><span>全球市场一眼看</span><small>位置示意 · 涨红跌绿</small></div><div class="indices-map-scroll" tabindex="0" aria-label="全球市场图，可横向滚动"><div class="indices-map-canvas"><svg viewBox="0 0 1000 400" preserveAspectRatio="none" aria-hidden="true"><defs><pattern id="indices-world-dots" width="6" height="6" patternUnits="userSpaceOnUse"><circle cx="2" cy="2" r="1.3" fill="currentColor"/></pattern></defs><path d="${land}" fill="url(#indices-world-dots)"/>${markers.map(([id,x,y,px,py])=>`<path class="indices-map-connector" d="M${x*10} ${y*4}L${px*10} ${py*4}"/><circle class="indices-map-halo indices-${tone(get(id))}" cx="${px*10}" cy="${py*4}" r="14"/><circle class="indices-map-dot indices-${tone(get(id))}" cx="${px*10}" cy="${py*4}" r="5"/>`).join('')}</svg>${markers.map(([id,x,y])=>{const q=get(id);return `<button data-index-quote="${id}" class="indices-map-label indices-${tone(q)}" style="left:${x}%;top:${y}%"><span>${q.name}</span><b>${q.percent}</b></button>`;}).join('')}</div></div><div class="indices-map-mobile-quotes">${markers.map(([id])=>{const q=get(id);return `<button data-index-quote="${id}" class="indices-${tone(q)}"><span>${q.name}</span><b>${q.percent}</b></button>`;}).join('')}</div></section>`;
  }
  window.showGlobalIndices=function(section='all',keepPosition=false){
    const selected=sections.some(([id])=>id===section)?section:'all',scroll=scrollY;
    page('大盘指数',back()+`<article class="detail-sheet indices-detail" id="indicesDetail"><header class="detail-cover"><div class="brief-detail-top"><span class="eyebrow">全球市场 / INDICES</span><span class="indices-reference-badge">静态参考</span></div><h1>大盘指数</h1><p>A 股与全球市场，在一页里看全貌。</p><div class="indices-cover-meta"><span>截图参考 · 非实时行情</span>${sourceButton(4,'资料与来源')}</div></header>${worldMap()}<nav class="report-index indices-section-nav" aria-label="指数详情栏目">${sections.map(([id,label])=>`<button data-indices-section="${id}" aria-current="${selected===id?'location':'false'}">${label}</button>`).join('')}</nav><div class="indices-detail-body">${quoteSection('common',common)}${quoteSection('china',data.quotes.filter(q=>q.group==='china').map(q=>q.id))}${globalSection()}${quoteSection('commodities',data.quotes.filter(q=>q.group==='commodities').map(q=>q.id))}${quoteSection('fx',data.quotes.filter(q=>q.group==='fx').map(q=>q.id))}<p class="indices-footnote">参考截图未提供交易日期，各市场数据不保证同一时点。当前未接入实时行情。</p></div><footer class="paper-foot"><button class="button" data-indices-top>${icon('arrow-up')}回到详情顶部</button>${sourceButton(4,'查看参考资料')}</footer></article>`,'global-indices');
    route={type:'global-indices',section:selected};
    if(keepPosition)window.scrollTo({top:scroll,behavior:'instant'});else if(selected!=='all')$('#indices-'+selected)?.scrollIntoView({block:'start'});
  };
  function showSource(id){const s=data.sources.find(s=>s.id===id);if(!s)return;
    openModal(s.title,`<p>${s.note}</p><p class="indices-footnote">来源：用户提供的参考截图；仅作界面与资料展示，不代表当前行情。</p><nav class="market-source-tabs" aria-label="指数参考截图">${data.sources.map(r=>`<button class="button ${r.id===id?'primary':''}" data-indices-source="${r.id}">参考 ${r.id}</button>`).join('')}</nav><p class="flow-small">公开演示仅展示资料摘编，未附参考资料说明；数据非实时。</p>`,'大盘指数 / 参考资料');
  }
  function showQuote(id){const q=get(id);if(!q)return;
    openModal(q.name,`<div class="indices-quote-preview indices-${tone(q)}"><strong>${q.value}</strong><span>${q.percent}</span></div><dl class="market-reference-facts"><dt>报价单位</dt><dd>${unit(q)}</dd><dt>涨跌额</dt><dd>${q.change||'原图未提供'}</dd><dt>资料来源</dt><dd>参考截图 ${q.source}</dd><dt>交易日期</dt><dd>原图未提供</dd></dl>${q.closed?'<p class="indices-footnote">“闭市”沿用截图状态，不表示当前市场状态。</p>':''}<div class="modal-actions">${sourceButton(q.source,'查看对应原图')}<button class="button" data-indices-manage>管理常用指数</button></div>`,'大盘指数 / 参考报价');
  }
  function managerBody(){return `<form id="indicesManageForm"><p>选择首页和详情页优先展示的指数与资产，最多 12 项。</p><div class="indices-manage-meta"><strong id="indicesChosenCount">已选 ${draft.length} / 12</strong><button type="button" class="text-action" data-indices-reset>恢复默认选择</button></div>${sections.filter(([id])=>id!=='common').map(([id,label])=>`<fieldset class="indices-manage-group"><legend>${label}</legend><div>${data.quotes.filter(q=>q.group===id).map(q=>`<label><input type="checkbox" name="index" value="${q.id}" ${draft.includes(q.id)?'checked':''}><span>${q.name}</span></label>`).join('')}</div></fieldset>`).join('')}<p id="indicesManageError" class="flow-error" role="status"></p><p class="indices-footnote">确认后保存在当前浏览器，只调整展示顺序与范围。</p><div class="modal-actions"><button type="button" class="button" data-indices-cancel>取消</button><button type="submit" class="button primary">保存常用指数</button></div></form>`;}
  function openManager(){draft=[...common];openModal('管理常用指数',managerBody(),'大盘指数 / 展示偏好');bindManager();}
  function bindManager(){
    const form=$('#indicesManageForm');form.onchange=e=>{
      const el=e.target;if(el.name!=='index')return;
      if(el.checked&&draft.length>=12){el.checked=false;$('#indicesManageError').textContent='最多选择 12 项，可先取消一项再添加。';return;}
      draft=el.checked?[...draft,el.value]:draft.filter(id=>id!==el.value);$('#indicesChosenCount').textContent=`已选 ${draft.length} / 12`;$('#indicesManageError').textContent='';
    };
    form.onsubmit=e=>{e.preventDefault();if(!draft.length){$('#indicesManageError').textContent='请至少选择一项。';return;}
      try{localStorage.setItem(storageKey,JSON.stringify(draft));}catch{$('#indicesManageError').textContent='浏览器未能保存，请稍后重试。';return;}
      common=[...draft];homePage=0;closeModal();renderWidgets();if(route.type==='global-indices')window.showGlobalIndices(route.section,true);toast('常用指数已保存，首页与详情同步更新');
    };
  }
  function ensureWidget(){if(state.indexOverviewVersion===1)return;state.indexOverviewVersion=1;save();}
  function updatePager(rail){const pages=Math.ceil(common.length/6);homePage=Math.max(0,Math.min(pages-1,Math.round(rail.scrollLeft/rail.clientWidth)||0));const root=rail.closest('.indices-summary');root.querySelectorAll('[data-indices-page]').forEach(b=>{const v=b.dataset.indicesPage;if(v==='prev'||v==='next')b.disabled=v==='prev'?homePage===0:homePage===pages-1;else b.setAttribute('aria-current',Number(v)===homePage?'page':'false');});}
  function movePage(value){const rail=$('[data-widget="indexes"] .indices-carousel');if(!rail)return;const pages=Math.ceil(common.length/6),next=value==='next'?homePage+1:value==='prev'?homePage-1:Number(value);rail.scrollTo({left:Math.max(0,Math.min(pages-1,next))*rail.clientWidth,behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth'});}
  function decorate(){const w=$('[data-widget="indexes"]');if(!w)return;w.classList.add('indices-widget');w.classList.remove('collapsed');const title=w.querySelector('h2');title.innerHTML=detailLink(esc(state.titles.indexes||'大盘指数'),'indicesTitleLink');const sub=w.querySelector('.widget-sub');if(sub)sub.outerHTML=detailLink('查看全球指数 '+icon('chevron-right'),'indicesGlobalLink','indices-header-link');const collapse=w.querySelector('[data-collapse="indexes"]');if(collapse)collapse.outerHTML=detailLink(icon('arrow-up-right'),'indicesOpenArrow','icon-button');w.querySelector('#indicesOpenArrow').setAttribute('aria-label','查看大盘指数详情');const rail=w.querySelector('.indices-carousel');rail.scrollLeft=homePage*rail.clientWidth;rail.addEventListener('scroll',()=>updatePager(rail),{passive:true});}
  const previousRender=renderWidgets;renderWidgets=function(...args){ensureWidget();previousRender(...args);decorate();};
  const previousFooter=widgetFooter;widgetFooter=function(id){return id==='indexes'?`<span>常用指数 · 当前为参考快照</span><button data-indices-manage>管理常用 ${icon('sliders-horizontal')}</button>`:previousFooter(id);};
  document.addEventListener('click',e=>{
    const b=e.target.closest('a,button');if(!b)return;
    if(b.hasAttribute('data-indices-open')){if(e.ctrlKey||e.metaKey||e.shiftKey||e.altKey||e.button!==0)return;e.preventDefault();window.showGlobalIndices();}
    if(b.hasAttribute('data-indices-page'))movePage(b.dataset.indicesPage);
    if(b.dataset.indicesSection)window.showGlobalIndices(b.dataset.indicesSection);
    if(b.hasAttribute('data-indices-top')){$('#indicesDetail .detail-cover').scrollIntoView({block:'start'});const title=$('#indicesDetail h1');title.tabIndex=-1;title.focus({preventScroll:true});}
    if(b.dataset.indexQuote)showQuote(b.dataset.indexQuote);
    if(b.dataset.indicesSource)showSource(Number(b.dataset.indicesSource));
    if(b.hasAttribute('data-indices-manage'))openManager();
    if(b.hasAttribute('data-indices-cancel'))closeModal();
    if(b.hasAttribute('data-indices-reset')){draft=[...data.common];$('#modalBody').innerHTML=managerBody();bindManager();}
  });
  document.addEventListener('keydown',e=>{if(!e.target.matches('.indices-carousel')||!['ArrowLeft','ArrowRight','Home','End'].includes(e.key))return;e.preventDefault();movePage(e.key==='Home'?0:e.key==='End'?Math.ceil(common.length/6)-1:e.key==='ArrowRight'?'next':'prev');});
  ensureWidget();
})();
