/* Market overview prototype: compact homepage summary and routed detail page. */
(() => {
  const data=marketOverviewReference,p=data.primary,previousMarketBody=marketBody;
  let tab='breadth',rankingSide='up',rankingSort='change',rankingOrder='desc',chartIndex=24;
  const sourcePath=id=>'references/market-overview/reference-'+id+'.png';
  const sourceButton=(id,label='资料说明')=>`<button class="market-source" data-market-source="${id}">${label} ${icon('external-link')}</button>`;
  function ensureWidget(){
    const w=catalog.find(w=>w.id==='market');w.title='市场概览';w.desc='全市场成交、涨跌分布、涨跌停与排行';w.wide=true;
    if(state.marketOverviewVersion===1)return;
    // Current defaults already include this widget. Keep saved moves/removals.
    state.marketOverviewVersion=1;save();
  }
  function breadthBar(){return `<div class="market-breadth-bar" role="img" aria-label="上涨 ${p.up} 家，平盘 ${p.flat} 家，下跌 ${p.down} 家"><i class="market-up-bg" style="flex:${p.up}"></i><i class="market-flat-bg" style="flex:${p.flat}"></i><i class="market-down-bg" style="flex:${p.down}"></i></div>`;}
  function compact(){return `<div class="market-compact"><div class="market-summary-top"><div>沪深京成交额 <strong>${p.turnover}<small>亿元</small></strong></div><div>较上日 <strong class="market-down">${p.turnoverDelta}<small>亿元</small></strong></div></div><div class="market-summary-counts"><span>涨 / 停 <strong class="market-up">${p.up}<small> / ${p.limitUp}</small></strong></span><span>跌 / 停 <strong class="market-down">${p.down}<small> / ${p.limitDown}</small></strong></span></div>${breadthBar()}<div class="market-summary-bottom"><span>昨日涨停表现 <strong class="market-up">${p.yesterdayLimit}</strong></span><span>大 / 小盘 <strong class="market-up">${p.large}</strong><span class="market-divider"> / </span><strong class="market-down">${p.small}</strong></span></div><div class="market-compact-note"><span>截图参考 · 非实时行情</span><a class="text-action" id="openMarketOverview" href="#/market-overview?tab=breadth" data-market-open>查看市场全貌 ${icon('arrow-up-right')}</a></div></div>`;}
  function tabs(){return `<div class="market-metric-tabs" role="tablist" aria-label="市场概览维度">${[
    ['breadth','涨跌分布',`<b class="market-up">${p.up}</b><span> / </span><b class="market-down">${p.down}</b>`,`涨停 ${p.limitUp} / 跌停 ${p.limitDown}`],
    ['turnover','沪深京成交额',`${p.turnover}<small> 亿元</small>`,`较上日 <span class="market-down">${p.turnoverDelta} 亿元</span>`],
    ['style','大小盘对比',`<b class="market-up">${p.large}</b><span> / </span><b class="market-down">${p.small}</b>`,'大盘 / 小盘 · 截图口径'],
    ['limits','昨日涨停表现',`<b class="market-up">${p.yesterdayLimit}</b>`,'最高连板 · 5 板（截图）']
  ].map(([id,label,value,note])=>`<button type="button" id="market-tab-${id}" role="tab" data-market-tab="${id}" aria-selected="${tab===id}" aria-controls="market-panel" tabindex="${tab===id?'0':'-1'}" class="${tab===id?'selected':''}"><span>${label}</span><strong>${value}</strong><small>${note}</small></button>`).join('')}</div>`;}
  function sectionHead(title,id,copy=''){return `<div class="market-section-head"><div><h3>${title}</h3>${copy?`<p>${copy}</p>`:''}</div>${sourceButton(id)}</div>`;}
  function histogram(){return `<section class="market-section">${sectionHead('涨跌统计',4)}<div class="market-stat-grid">${[['上涨',p.up,'up'],['涨停',p.limitUp,'up'],['下跌',p.down,'down'],['跌停',p.limitDown,'down']].map(([label,value,tone])=>`<div><strong class="market-${tone}">${value}</strong><span>${label}<small> 家</small></span></div>`).join('')}</div><p class="market-scroll-hint">左右滑动查看全部涨跌区间</p><div class="market-histogram-wrap" tabindex="0" aria-label="可横向滚动的涨跌分布"><div class="market-histogram" role="img" aria-label="截图涨跌分布，单位家。${data.distribution.map(d=>d.label+d.value+'家').join('；')}">${data.distribution.map(d=>`<div class="market-histogram-column market-${d.tone}"><div class="market-bar-space"><strong>${d.value.toLocaleString('en-US')}</strong><i class="market-${d.tone}-bg" style="height:max(2px,calc(${d.value} * .055px))"></i></div><small>${d.label}</small></div>`).join('')}</div></div>${breadthBar()}<div class="market-chart-caption"><span><i class="market-up-bg"></i>上涨区间</span><span>平盘 ${p.flat} 家</span><span><i class="market-down-bg"></i>下跌区间</span></div><p class="market-footnote">涨停、跌停单独列出，其余区间按原图展示；单位：家。统计范围与区间边界尚未核验。</p></section>`;}
  // SVG coordinates are only visual layout; values are a fixed synthetic UI fixture.
  const chartData=marketOverviewDemoSeries,chartWidth=720,chartHeight=200,chartMax=24;
  const chartX=i=>i*chartWidth/(chartData.times.length-1),chartY=v=>chartHeight-v*chartHeight/chartMax;
  const chartDescription=i=>chartData.times[i]+'，静态示意，'+chartData.series.map(s=>s.name+s.values[i]+'家').join('，');
  function intradayChart(){
    const i=chartIndex,x=chartX(i);
    return `<div class="market-line-chart" data-market-chart>
      <div class="market-chart-readout"><div class="market-chart-legend">${chartData.series.map(s=>`<span class="market-series-${s.id}"><i></i>${s.name}<b data-market-chart-value="${s.id}">${s.values[i]}</b><small>家</small></span>`).join('')}</div><span class="market-chart-time"><b data-market-chart-time>${chartData.times[i]}</b> · 示意</span></div>
      <div class="market-chart-area"><span class="market-chart-unit">家</span><div class="market-chart-y-axis" aria-hidden="true">${[24,18,12,6,0].map(v=>`<span>${v}</span>`).join('')}</div>
        <svg class="market-intraday-svg" viewBox="0 0 ${chartWidth} ${chartHeight}" preserveAspectRatio="none" role="img" aria-labelledby="market-intraday-title market-intraday-description">
          <title id="market-intraday-title">涨跌停分时 · 静态演示</title><desc id="market-intraday-description">三条曲线均为虚构示意，非真实行情。使用下方时间滑块查看各时点读数。</desc>
          <defs><linearGradient id="market-demo-wash" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="var(--red)" stop-opacity=".12"/><stop offset="100%" stop-color="var(--red)" stop-opacity="0"/></linearGradient></defs>
          ${[24,18,12,6,0].map(v=>`<line class="market-chart-grid" x1="0" x2="${chartWidth}" y1="${chartY(v)}" y2="${chartY(v)}"/>`).join('')}
          <line class="market-chart-session" x1="360" x2="360" y1="0" y2="${chartHeight}"/>
          <path d="M 0 ${chartHeight} L ${chartData.series[0].values.map((v,j)=>chartX(j)+','+chartY(v)).join(' L ')} L ${chartWidth} ${chartHeight} Z" fill="url(#market-demo-wash)"/>
          ${chartData.series.map(s=>`<path class="market-chart-line market-series-${s.id}" d="M ${s.values.map((v,j)=>chartX(j)+','+chartY(v)).join(' L ')}"/>`).join('')}
          <line class="market-chart-guide" data-market-chart-guide x1="${x}" x2="${x}" y1="0" y2="${chartHeight}"/>
          ${chartData.series.map(s=>`<ellipse class="market-chart-point market-series-${s.id}" data-market-chart-point="${s.id}" cx="${x}" cy="${chartY(s.values[i])}" rx="4" ry="4"/>`).join('')}
        </svg>
        <div class="market-chart-x-axis" aria-hidden="true"><span>09:30</span><span>10:30</span><span>11:30 / 13:00</span><span>14:00</span><span>15:00</span></div>
        <input class="market-chart-scrubber" type="range" min="0" max="24" step="1" value="${i}" aria-label="查看分时示意读数" aria-valuetext="${chartDescription(i)}">
      </div><p class="market-chart-hint">悬停或拖动时间轴，查看示意读数</p>
    </div>`;
  }
  function updateChart(root,index){
    chartIndex=Math.max(0,Math.min(chartData.times.length-1,index));const x=chartX(chartIndex);
    root.querySelector('[data-market-chart-time]').textContent=chartData.times[chartIndex];
    const guide=root.querySelector('[data-market-chart-guide]');guide.setAttribute('x1',x);guide.setAttribute('x2',x);
    const svg=root.querySelector('svg'),bounds=svg.getBoundingClientRect();
    chartData.series.forEach(s=>{
      root.querySelector('[data-market-chart-value="'+s.id+'"]').textContent=s.values[chartIndex];
      const point=root.querySelector('[data-market-chart-point="'+s.id+'"]');point.setAttribute('cx',x);point.setAttribute('cy',chartY(s.values[chartIndex]));
      // Preserve round screen-space markers when the responsive SVG is stretched.
      if(bounds.width)point.setAttribute('rx',4*chartWidth/bounds.width);
      if(bounds.height)point.setAttribute('ry',4*chartHeight/bounds.height);
    });
    const slider=root.querySelector('input');slider.value=chartIndex;slider.setAttribute('aria-valuetext',chartDescription(chartIndex));
  }
  function limitStats(){return `<section class="market-section">${sectionHead('涨跌停情况',4)}<div class="market-limit-grid">${[['一字涨停',p.oneWord,'家'],['T 字涨停',p.tWord,'家'],['自然涨停',p.natural,'家'],['最高连板',p.highest,'板']].map(([name,v,unit])=>`<div><strong class="market-up">${v}<small> ${unit}</small></strong><span>${name}</span></div>`).join('')}</div><div class="market-curve-head"><h4>涨跌停分时</h4><span class="market-demo-badge">静态演示</span></div>${intradayChart()}<p class="market-footnote">曲线为虚构示意，仅展示图表交互，不代表真实行情。</p></section>`;}
  function ladder(){return `<section class="market-section">${sectionHead('连板梯队',3,'独立截图快照 · 与上方统计不保证同一时点')}<div class="market-ladder">${data.ladder.rows.map(row=>`<div><strong class="market-up">${row.boards}<small> 板</small></strong><span>${row.names.map(n=>`<span>${esc(n)}</span>`).join('')}</span></div>`).join('')}</div><p class="market-footnote">仅显示参考图中可读的梯队，不推断题材归属或后续走势。</p></section>`;}
  function ranking(){
    const rows=rankingSide==='up'?[...data.ranking.rows].sort((a,b)=>{const av=Number(a[rankingSort]),bv=Number(b[rankingSort]);return rankingOrder==='desc'?bv-av:av-bv;}):[];
    return `<section class="market-section">${sectionHead('个股涨跌',3,'参考图中的可见名单 · 交易日期未提供')}<div class="market-ranking-tools"><div role="group" aria-label="涨跌排行"><button data-market-side="up" aria-pressed="${rankingSide==='up'}" class="${rankingSide==='up'?'selected':''}">涨幅参考</button><button data-market-side="down" aria-pressed="${rankingSide==='down'}" class="${rankingSide==='down'?'selected':''}">跌幅参考</button></div><span>${rankingSide==='up'?'仅截图可见 6 只':'暂无对应截图资料'}</span></div>${rows.length?`<p class="market-scroll-hint">左右滑动查看完整行情字段</p><div class="market-ranking-wrap" tabindex="0" aria-label="可横向滚动的截图排行"><table class="market-ranking-table"><caption class="sr-only">用户截图参考，价格单位元，涨跌幅单位百分比，主力净流入显示原图的万单位</caption><thead><tr><th>股票 / 代码</th>${[['price','参考价（元）'],['change','涨跌幅']].map(([id,label])=>`<th aria-sort="${rankingSort===id?(rankingOrder==='desc'?'descending':'ascending'):'none'}"><button data-market-sort="${id}">${label} ${icon(rankingSort===id&&rankingOrder==='asc'?'chevron-up':'chevron-down')}</button></th>`).join('')}<th>主力净流入</th></tr></thead><tbody>${rows.map(r=>`<tr><td><button data-market-security="${r.code}">${esc(r.name)} ${icon('arrow-up-right')}</button><small>${r.code}</small></td><td>${r.price}</td><td class="market-up">+${r.change}%</td><td>${r.flow?r.flow+' 万':'—'}</td></tr>`).join('')}</tbody></table></div>`:'<div class="market-data-gap"><strong>尚无跌幅榜参考资料</strong><p>当前截图只提供涨幅名单。接入行情后，此处展示完整跌幅排行。</p></div>'}<p class="market-footnote">仅排序这组截图记录，不代表全市场排名。原图遮挡或缺失的资金数据保留为 —。</p></section>`;
  }
  function turnover(){return `<section class="market-section">${sectionHead('沪深京成交额',4)}<div class="market-turnover-stats"><div><span>截图所示成交额</span><strong>${p.turnover}<small> 亿元</small></strong></div><div><span>较上日（原图口径）</span><strong class="market-down">${p.turnoverDelta}<small> 亿元</small></strong></div></div><div class="market-data-gap"><strong>分时成交序列待接入</strong><p>当前仅有截图中的汇总值，未提供分钟成交与历史对比序列。</p></div><p class="market-footnote">比较基准、交易日与统计范围尚未核验，不据此计算全天成交或成交额变化率。</p></section>`;}
  function style(){return `<section class="market-section">${sectionHead('大小盘对比',4)}<div class="market-style-grid"><div><span>大盘表现</span><strong class="market-up">${p.large}</strong><small>原图标记：大盘价值占优</small></div><div><span>小盘表现</span><strong class="market-down">${p.small}</strong><small>原图未提供对应指数名称</small></div></div><p class="market-footnote">以上为截图原值与原文标签，不代表当前市场判断。指数口径、权重、日期与持续表现待接入后核验。</p></section>`;}
  function yesterday(){return `<section class="market-section">${sectionHead('昨日涨停表现',4)}<div class="market-turnover-stats"><div><span>截图显示的表现值</span><strong class="market-up">${p.yesterdayLimit}</strong></div><div><span>截图所示最高连板</span><strong class="market-up">5<small> 板</small></strong><small>新华文轩</small></div></div><p class="market-footnote">“昨日”沿用原图栏目名称。交易日期与样本范围未提供，不能当成当前交易日数据。</p></section>`+ladder();}
  function panelContent(){return tab==='breadth'?histogram()+limitStats()+ladder()+ranking():tab==='turnover'?turnover():tab==='style'?style():yesterday();}
  function detailContent(){return `${tabs()}<div class="market-data-note">用户截图参考 · 主统计来自第 4 张（手机显示 ${p.clock}，交易日期未知）${sourceButton(4,'查看原图')}</div><div role="tabpanel" id="market-panel" aria-labelledby="market-tab-${tab}" tabindex="0">${panelContent()}</div><details class="market-previous-news"><summary>本期港股收盘要闻</summary>${previousMarketBody()}</details>`;}
  marketBody=function(){return `<div class="market-overview">${compact()}</div>`;};
  window.showMarketOverview=function(selected='breadth',keepPosition=false){
    tab=['breadth','turnover','style','limits'].includes(selected)?selected:'breadth';
    const scroll=scrollY;
    page('市场概览',back()+`<article class="detail-sheet market-detail" id="marketDetail"><header class="detail-cover"><div class="brief-detail-top"><span class="eyebrow">市场全貌 / 沪深京</span><span class="market-demo-badge">静态参考与演示</span></div><h1>市场概览</h1><p>从成交与涨跌分布，看全市场的基本面貌。</p><p class="market-detail-caption">统计沿用参考截图，分时曲线为交互示意。</p></header><div class="market-detail-content">${detailContent()}</div><footer class="paper-foot"><button class="button" data-market-top>${icon('arrow-up')}回到详情顶部</button><span class="flow-small">未接入实时行情或后台监控</span></footer></article>`,'market-overview');
    route={type:'market-overview',tab};
    if(keepPosition)window.scrollTo({top:scroll,behavior:'instant'});
  };
  const previousFooter=widgetFooter;
  widgetFooter=function(id){return id==='market'?`<span>沪深京全市场视角 · 静态参考与演示</span>${sourceButton(4,'来源与说明')}`:previousFooter(id);};
  function decorate(){
    const w=$('[data-widget="market"]');if(!w)return;
    w.classList.add('market-overview-widget');w.classList.remove('collapsed');
    const collapse=w.querySelector('[data-collapse="market"]');
    if(collapse)collapse.outerHTML=`<a class="icon-button" id="marketOverviewArrow" href="#/market-overview?tab=breadth" data-market-open aria-label="查看市场概览详情" title="查看详情">${icon('chevron-right')}</a>`;
    const sub=w.querySelector('.widget-sub');if(sub)sub.textContent='全市场 · 截图参考';
    const title=w.querySelector('.widget-title h2');if(title)title.innerHTML=`<a id="marketOverviewTitle" href="#/market-overview?tab=breadth" data-market-open>${esc(state.titles.market||'市场概览')} ${icon('chevron-right')}</a>`;
  }
  const originalRender=renderWidgets;
  renderWidgets=function(...args){ensureWidget();originalRender(...args);decorate();};
  function refreshPanel(focusId){
    const body=$('#marketDetail .market-detail-content');if(!body)return;
    body.innerHTML=detailContent();
    if(focusId)$(focusId)?.focus({preventScroll:true});
  }
  function changeTab(selected){
    window.showMarketOverview(selected,true);
    $('#market-tab-'+tab)?.focus({preventScroll:true});
  }
  function showSource(id){
    const ref=data.sources.find(s=>s.id===id);if(!ref)return;
    openModal(ref.title,`<p>${esc(ref.note)}</p><p class="market-footnote">来源：用户提供的竞品截图。用途：产品交互与布局参考；未联网核验，非当前行情。</p><nav class="market-source-tabs" aria-label="参考截图">${data.sources.map(s=>`<button class="button ${id===s.id?'primary':''}" data-market-source="${s.id}">参考 ${s.id}</button>`).join('')}</nav><p class="flow-small">公开演示仅展示资料摘编，未附参考资料说明；数据非实时。</p>`,'市场概览 / 资料来源');
    $('#modal').classList.add('market-source-modal');$('#modal').scrollTop=0;
  }
  function showSecurity(code){
    const r=data.ranking.rows.find(s=>s.code===code);if(!r)return;
    openModal(r.name,`<p>${r.code} · 用户截图中的标的参考</p><dl class="market-reference-facts"><dt>参考价</dt><dd>${r.price} 元</dd><dt>涨跌幅</dt><dd class="market-up">+${r.change}%</dd><dt>主力净流入</dt><dd>${r.flow?r.flow+' 万（原图单位）':'未获取／被遮挡'}</dd></dl><p>当前仅保留截图可见字段，交易日期与行情时点未知。公司资料与完整行情尚未补齐。</p>${sourceButton(3,'查看排行原图')}`,'市场概览 / 截图记录');
  }
  document.addEventListener('click',e=>{
    const b=e.target.closest('button,a');if(!b)return;
    if(b.hasAttribute('data-market-open')){
      if(e.ctrlKey||e.metaKey||e.shiftKey||e.altKey||e.button!==0)return;
      e.preventDefault();window.showMarketOverview();return;
    }
    if(b.hasAttribute('data-market-top')){$('#marketDetail .detail-cover').scrollIntoView({block:'start'});const title=$('#marketDetail h1');title.tabIndex=-1;title.focus({preventScroll:true});}
    if(b.dataset.marketTab)changeTab(b.dataset.marketTab);
    if(b.dataset.marketSide){rankingSide=b.dataset.marketSide;const top=b.getBoundingClientRect().top;refreshPanel('[data-market-side="'+rankingSide+'"]');const after=$('[data-market-side="'+rankingSide+'"]');window.scrollBy(0,after.getBoundingClientRect().top-top);}
    if(b.dataset.marketSort){const field=b.dataset.marketSort;rankingOrder=rankingSort===field&&rankingOrder==='desc'?'asc':'desc';rankingSort=field;refreshPanel('[data-market-sort="'+field+'"]');}
    if(b.dataset.marketSource)showSource(Number(b.dataset.marketSource));
    if(b.dataset.marketSecurity)showSecurity(b.dataset.marketSecurity);
  });
  document.addEventListener('input',e=>{
    if(e.target.matches('.market-chart-scrubber'))updateChart(e.target.closest('[data-market-chart]'),Number(e.target.value));
  });
  function scrubChart(e){
    const svg=e.target.closest('.market-intraday-svg');if(!svg)return;
    const bounds=svg.getBoundingClientRect();
    updateChart(svg.closest('[data-market-chart]'),Math.round((e.clientX-bounds.left)/bounds.width*(chartData.times.length-1)));
  }
  document.addEventListener('pointermove',scrubChart);
  document.addEventListener('pointerdown',e=>{
    const svg=e.target.closest('.market-intraday-svg');if(!svg)return;
    if(e.pointerType==='touch')svg.setPointerCapture(e.pointerId);
    scrubChart(e);
  });
  document.addEventListener('keydown',e=>{
    if(!e.target.matches('[data-market-tab]')||!['ArrowLeft','ArrowRight','Home','End'].includes(e.key))return;
    e.preventDefault();const keys=['breadth','turnover','style','limits'],index=keys.indexOf(tab);
    changeTab(keys[e.key==='Home'?0:e.key==='End'?3:(index+(e.key==='ArrowRight'?1:3))%4]);
  });
  $('#modal').addEventListener('close',()=>$('#modal').classList.remove('market-source-modal'));
  ensureWidget();
})();
