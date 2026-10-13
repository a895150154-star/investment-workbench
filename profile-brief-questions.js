/* Explicit profile chooses fixed, source-backed report questions. Desktop only. */
(()=>{
 if(!window.workbenchClient.desktop)return;
 const mode=()=>window.overviewV3?.mode?.()||briefPrefs.investmentHorizon||'unset';
 const pct=n=>n==null?'未提供':(Number(n)>0?'+':'')+Number(n).toFixed(2)+'%';
 const quoteSource='<button class="brief-source" data-guide-sample-source>查看当前量价样例 '+icon('chevron-right')+'</button>';
 const demoSource=id=>'<button class="brief-source" data-personal-source="demo-'+id+'">查看'+(id==='order'?'试用订单':id==='delivery'?'客户适配与试交付':'成长指数')+'资料 '+icon('chevron-right')+'</button>';
 const newsSource=(id,issue)=>briefSource(briefNews.find(n=>String(n.id)===id).title,issue);
 const companySources=issue=>briefItems.map(i=>briefSource(i.source,issue)).join('');
 function forIssue(issue){
  const V=window.overviewV3,D=window.overviewV3Data,night=issue.period==='evening';
  const rows=V?.briefRows?.()||[],subjects=rows.slice(0,3),names=subjects.map(s=>s.name).join('、');
  const priceText=night?eveningIndices.map(([,name,,change])=>name+' '+change+'%').join('；'):subjects.map(s=>s.name+'：涨跌 '+pct(s.change)+'，资金 '+(s.flow==null?'未提供':s.flow.toFixed(2)+' 亿元')).join('；');
  const sectorText=night?eveningBoards.industry.slice(0,3).map(([,name,flow,change])=>name+'：涨跌 '+change+'%，主力净流入 '+flow+' 亿元').join('；'):subjects.map(s=>s.sector+'：今日 '+pct(s.sectorToday)+'，近20日 '+pct(s.sector20)).filter((v,i,a)=>a.indexOf(v)===i).join('；');
  const marketSource=night?eveningSource('a-market'):quoteSource;
  const q=(id,label,lead,sections,sources,object='本期简报')=>({id,label,lead,sections,sources,object});
  const order=D?.timeline.find(n=>n.id==='order'),delivery=D?.timeline.find(n=>n.id==='delivery');
  const banks={
   short:[
    q('price',night?'收盘后的涨跌变化，哪些需要继续核对？':'今天哪些价格、资金或异动需要优先核对？',priceText||'当前没有已匹配的标的量价资料，可先阅读市场脉搏。',
     [['先核对同一时点','区分价格、成交和资金的口径，按原资料日期逐项核对。单次价格或资金变化不能证明经营改善。'],['再看事件','公司公告、产品进展和市场交易变化分别判断，继续对照后续成交与披露。']],marketSource,names||'本期市场变化'),
    q('nature','这条消息是交易变化，还是经营进展？','价格与资金反映交易变化；股本、激励和现金管理属于公司事项，产品适配与交付提供经营观察线索。',
     [['分别核对','股本报表和股份上市安排没有给出新增订单；手机 AI 与端侧芯片的发布也不能直接等同收入。'],['后续关注','对照成交延续性与下一次经营披露，核对消息发生的时间与当前交易是否一致。']],companySources(issue)),
    q('supply','哪些公告可能改变流通或成交节奏？','新易盛的股份上市安排和中际旭创的股本报表，需要先核对股份变动性质与实际生效时间。',
     [['本期已有资料','新易盛披露股份归属与上市安排，中际旭创披露 H 股翌日披露报表。'],['还缺什么','具体条款、流通规模和同期成交仍需核对，不能只根据公告标题推导价格影响。']],companySources(issue),'光通信公司披露'),
    q('next-event','接下来先核对哪个事件节点？',delivery?.explanation||'继续核对客户适配、交付与公开披露。',
     [['适配与交付',delivery?.quote||'客户适配与实际交付分别核对。'],['订单与收入',order?.quote||'订单与收入确认分别核对。']],demoSource('delivery')+demoSource('order'),'端侧算力进展')
   ],
   swing:[
    q('sector','相关板块的强弱变化能否延续？',sectorText||'当前没有已匹配的板块资料，继续查看市场脉搏中的公开线索。',
     [['先看连续变化','对照不同日期的板块强弱和交易范围，再看变化是否由同一产业线索支持。'],['避免混用指标','板块涨跌、资金流向和公司近20日表现不是同一指标，单日表现不足以确认延续性。']],night?eveningSource('flows'):quoteSource),
    q('progress','主题进展走到了发布、适配还是交付？','沿着产品发布、客户适配、交付与持续采购逐项核对，区分已经发生的进展与尚待验证的环节。',
     [['本期进展',delivery?.quote||'现有资料未补齐客户适配进度。'],['后续验证','继续观察后续适配、交付规模与连续采购披露，一次发布不能证明持续需求。']],newsSource('2490095',issue)+demoSource('delivery'),'端侧算力主题'),
    q('industry','公司公告能证明产业需求改善吗？','股本、激励和现金管理与行业订单增长有不同的解释路径。',
     [['本期公司事项','新易盛看股份归属与上市安排，中际旭创看股本变动性质，天孚通信看资金期限和经营支出匹配。'],['产业验证','需求判断继续核对产品升级、客户采用、订单和交付材料。']],companySources(issue),'光通信主题'),
    q('connections','手机 AI 与端侧芯片的进展怎样相互验证？','应用入口与硬件供给可以联读，但现有报道未说明双方存在合作关系。',
     [['应用端','继续核对接入厂商、功能上线和实际终端采用。'],['硬件端','继续核对客户适配、产品交付和持续采购，寻找具体产品上的连接证据。']],newsSource('2490113',issue)+newsSource('2490095',issue),'AI 应用与端侧算力')
   ],
   long:[
    q('revenue','订单怎样走到收入确认和回款？',order?.explanation||'订单、交付、收入确认和回款分别核对。',
     [['已有线索',order?.quote||'当前未补齐订单金额与回款资料。'],['继续验证','核对交付、验收、收入确认和回款，再结合经营现金流判断兑现。']],demoSource('order'),'订单与经营兑现'),
    q('product','新产品能否形成持续采购和盈利？','产品发布提供业务方向，客户采用、量产交付与持续采购才支持进一步的经营判断。',
     [['客户与产品','继续核对机型适配、实际交付规模和客户采用。'],['盈利与现金流','成本、利润和回款需要对应财务材料，当前资料不足以确认盈利或估值改善。']],newsSource('2490095',issue)+demoSource('delivery'),'产品与公司经营'),
    q('cash','成本与资金安排会怎样影响现金流？',night?eveningEvents.find(e=>e.id==='battery-cost').summary:'闲置资金现金管理安排需要与经营支出和回款节奏一起核对。',
     [['成本传导','原料采购、库存消耗与产品调价存在时间差，先核对合同、周转和定价方式。'],['期限匹配','现金管理的产品期限、赎回条件与主业资金需求分别核对，授权额度不等于可随时动用的现金。']],night?eveningSource('events'):briefSource(briefItems.find(i=>i.id==='tftx').source,issue),'经营现金流'),
    q('evidence','判断经营改善，还缺哪些原始证据？','把新闻线索、经营披露和财务结果相互对照，保留仍未验证的部分。',
     [['业务资料','客户采用、持续采购、交付和收入确认材料。'],['财务资料','对应财报中的收入、利润与经营现金流；估值判断还需要同期价格和财务口径。']],newsSource('2490095',issue)+demoSource('order'),'经营与财务证据')
   ]
  };
  return banks[mode()]||[];
 }
 function recommend(questions){
  const words={short:['价格','涨跌','资金','异动','公告','发布时间','节点'],swing:['板块','产业','主题','趋势','适配','交付','持续采购'],long:['收入','盈利','利润','现金流','回款','财务','估值'] }[mode()];
  if(!words)return questions;
  const text=html=>{const t=document.createElement('template');t.innerHTML=html;return t.content.textContent;};
  return questions.map((html,index)=>({html,index,score:words.reduce((n,word)=>n+(text(html).includes(word)?1:0),0)})).sort((a,b)=>b.score-a.score||a.index-b.index).map(q=>q.html);
 }
 function buttons(issue){return forIssue(issue).map(q=>'<button class="suggestion" data-guide-profile="'+q.id+'">'+esc(q.label)+icon('arrow-up-right')+'</button>');}
 function ask(id,issue){
  const q=forIssue(issue).find(q=>q.id===id);if(!q)return;
  if($('#modal').open)closeModal();
  setContext({kind:'brief',company:q.object,briefIssue:issue.id,question:q.label,source:'本期固定资料',profileQuestion:id});
  openAssistant();
  $('#assistantContent').innerHTML='<div data-v3-keep-copy><div class="user-message">'+esc(q.label)+'</div><div class="brief-answer"><strong>闪电猫解读</strong><p>'+esc(q.lead)+'</p></div>'+q.sections.map(([title,text])=>'<h3 class="brief-answer-heading">'+esc(title)+'</h3><p class="assistant-copy">'+esc(text)+'</p>').join('')+'<h3 class="brief-answer-heading">本次依据</h3>'+q.sources+'</div>';
  $('#assistantContent').scrollTop=0;
 }
 document.addEventListener('click',e=>{
  if(!e.target.closest('[data-guide-sample-source]'))return;
  const rows=window.overviewV3?.portfolio?.()||[];
  openModal('当前量价样例','<div data-v3-keep-copy><p>资料类型：原型固定示例；沿用当前工作台中的指标，不代表实时行情。</p>'+rows.map(s=>'<p>'+esc(s.name)+'：涨跌 '+pct(s.change)+'；板块 '+esc(s.sector)+' 今日 '+pct(s.sectorToday)+'、近20日 '+pct(s.sector20)+'</p>').join('')+'</div>');
 });
 window.profileBriefQuestions={mode,forIssue,buttons,recommend,ask};
})();
