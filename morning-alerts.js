/* Approved morning stock reminders. Screenshot fixtures, no recommendation engine. */
(()=>{
 'use strict';
 if(!window.workbenchClient.desktop)return;
 const items=[
  {id:'nuode',name:'诺德股份',key:'morning-nuode',change:1.72,reason:'近期浏览',sourceCount:3,
   summary:'财政部、税务总局公告，2027年4月1日起新能源汽车出口退税率由13%下调至9%，单车退税额降约6000元。',
   analysis:'政策可能通过整车出口利润、车企排产，影响上游锂电池及锂电铜箔采购需求。PCB铜箔业务增长可能形成部分对冲，但实际影响仍需结合业务结构和后续披露核对。',
   watch:'关注政策生效前整车企业排产调整、公司三季报铜箔出货量与毛利率，以及PCB铜箔营收占比的变化。',
   question:'诺德股份2026年三季报中，PCB铜箔业务营收占比能否持续提升以对冲锂电铜箔需求走弱风险？',
   conclusion:'PCB铜箔占比提升有业务基础，但现有材料不足以确认三季报占比继续提升，也不足以确认它能单独对冲锂电铜箔需求变化。',
   evidence:[['营业收入','64.33亿元','2026年上半年'],['归母净利润','1.03亿元','2026年上半年'],['PCB铜箔营收占比','12.10%','4—6月，按助手截图口径']],
   sections:[['影响路径','新能源汽车出口政策 → 整车企业排产 → 锂电池及铜箔采购。每个环节都有传导条件，不能把政策变化直接等同于公司订单下降。'],['检查问题前提','图3的助手回答同时提到锂电铜箔需求仍有支撑。因此，“需求走弱”应作为需要验证的风险，而不能直接当作已经发生的事实。'],['仍需验证','核对三季报的PCB铜箔收入占比、产品毛利率及出货节奏，再对照锂电铜箔加工费、经营现金流和存货变化。']],answerOrigin:'沿用图3可见结论和数据，按桌面阅读结构整理。'},
  {id:'xinyisheng',name:'新易盛',key:'300502',change:1.06,reason:'近期浏览',sourceCount:1,
   summary:'2026年国内算力网络建设推进，运营商光通信采购量同比大幅提升，光纤光缆供需格局优化，多家头部企业前三季度业绩预增。',
   analysis:'算力网络建设拉动高速光模块需求。公司光互联产品营收208.83亿元、同比增长100.61%，占总营收99.87%，毛利率48.46%。',
   watch:'关注1.6T光模块放量节奏、NPO产品客户验证进展、海外云厂商资本开支落地及美国贸易规则变化。',
   question:'新易盛2026年光互联产品营收增速能否持续，1.6T光模块放量对下半年业绩贡献有多大？',
   conclusion:'截图提供了光互联业务增长线索，但尚不足以量化1.6T产品对下半年业绩的贡献；需要产品收入、出货和客户验证等进一步披露。',
   evidence:[['光互联产品营收','208.83亿元','截图引用，报告期待核对'],['同比增长','100.61%','截图引用'],['占总营收','99.87%','截图引用'],['毛利率','48.46%','截图引用']],
   sections:[['影响路径','算力建设与云厂商投入 → 高速光模块采购 → 公司交付与收入。需求增长需要通过实际订单和交付得到验证。'],['依据的限制','截图没有给出1.6T产品的独立收入、出货量和毛利率，不能从光互联产品整体增速直接计算1.6T的业绩贡献。'],['后续观察','继续核对1.6T交付节奏、NPO客户验证、客户资本开支与贸易规则变化。']],answerOrigin:'依据图2提醒整理的预设解读；未提供该条竞品助手回答。'},
  {id:'shenghong',name:'胜宏科技',key:'morning-shenghong',change:1.18,reason:'盯盘关注',sourceCount:1,
   summary:'2026年10月电子布价格续涨，覆铜板企业称原材料涨价可传导至PCB，AI服务器及数据中心建设带动高多层板、HDI需求增长。',
   analysis:'上游材料涨价可能带来成本压力，高端PCB产品结构与议价能力影响成本能否向下游传导。PCB制造业务收入180.84亿元、占总营收93.74%、毛利率31.91%，具体报告期仍待核对。',
   watch:'关注三季报高端AI板营收占比和毛利率变化，验证成本传导；跟踪电子布价格走势及公司高端产能爬坡进度。',
   question:'胜宏科技三季报中AI服务器相关高端PCB产品的营收占比及毛利率能否延续提升趋势？',
   conclusion:'高端产品需求提供观察方向，但营收占比与毛利率能否继续提升，需要同时核对产品结构、成本传导和产能爬坡。',
   evidence:[['PCB制造业务收入','180.84亿元','截图引用，报告期待核对'],['占总营收','93.74%','截图引用'],['毛利率','31.91%','截图引用']],
   sections:[['影响路径','电子布涨价 → 覆铜板成本 → PCB采购成本；产品议价能力、订单结构和传导时滞共同决定利润影响。'],['依据的限制','需求增加不等于成本一定能完全转嫁。截图涉及不同毛利率数值，不能忽略报告期和统计口径直接比较。'],['后续观察','核对三季报高端AI板收入占比、同口径毛利率、电子布价格，以及高端产能爬坡。']],answerOrigin:'依据图2提醒整理的预设解读；未提供该条竞品助手回答。'}
 ];
 // Reuse known identities; unknown stock codes stay missing instead of being invented.
 for(const item of items){
  const existing=opportunitySecurity(item.name);
  if(existing)item.key=opSecurityKey(existing);
  else opportunityQuotes.push({id:item.key,name:item.name,type:'stock',price:null,change:item.change,reference:'morning-screenshot',source:'用户提供的AI涨乐早报截图',asOf:'10.14截图，报价时刻未提供'});
 }
 const find=id=>items.find(item=>item.id===id);
 const selected=()=>items.filter(item=>opportunitySecurity(item.key)?.type==='stock').filter((item,index,rows)=>rows.findIndex(x=>x.key===item.key)===index).slice(0,3);
 const pct=value=>`${value>0?'+':''}${value.toFixed(2)}%`;
 const sourceButton=(item,issue)=>`<button type="button" class="ma-source" data-ma-source="${item.id}" data-ma-issue="${esc(issue.id)}">来源 · ${item.sourceCount} ${icon('chevron-right')}</button>`;
 function card(item,issue){return `<article class="ma-card v3-brief-stock" data-ma-stock="${esc(item.key)}" data-v3-keep-copy>
  <header class="ma-card-head v3-security-heading">${opLink(`<strong>${esc(item.name)}</strong>`,opQuoteRoute(item.key,issue.id),'ma-stock-link')}<span class="ma-change">${pct(item.change)}</span><span class="tag ma-reason">${esc(item.reason)}</span></header>
  <p class="ma-summary v3-risk-opening">${esc(item.summary)}</p>
  <div class="ma-sources">${sourceButton(item,issue)}</div>
  <div class="ma-analysis"><div><h4>传导分析</h4><p>${esc(item.analysis)}</p></div><div><h4>后续关注</h4><p>${esc(item.watch)}</p></div></div>
  <button type="button" class="ma-question" data-ma-ask="${item.id}" data-ma-issue="${esc(issue.id)}" aria-label="向闪电猫提问：${esc(item.question)}"><span class="ma-question-label">继续研究</span><span>${esc(item.question)}</span>${icon('arrow-up-right')}</button>
 </article>`;}
 function section(issue){return `<section id="brief-my-targets" class="ma-section" data-v3-keep-copy><header class="ma-section-head"><h3>特别提醒 <span>${selected().length}</span></h3><span>股票 · 最多3条</span></header>${selected().map(item=>card(item,issue)).join('')}</section>`;}
 function showSource(item,issue){
  openModal('内容来源',`<div class="ma-source-detail" data-v3-keep-copy><p>${esc(item.name)} · ${esc(issueLabel(issue))}</p><h3>截图中的资讯摘要</h3><p>${esc(item.summary)}</p><p class="ma-reference-note">材料：用户提供的AI涨乐10.14早报截图（图2）。原图标注“来源+${item.sourceCount}”，未提供原文标题清单和网址，暂不能打开原文。</p><p>此处保留已提供的摘要，不将截图标记当作已取得的原始材料。</p></div>`,'特别提醒 / 来源');
 }
 function ask(item,issue){
  const readingScroll=window.scrollY;
  setContext({kind:'brief',company:item.name,briefIssue:issue.id,source:item.summary,topic:item.summary,question:item.question,morningAlertId:item.id,screenshotDate:'10.14',sourceCount:item.sourceCount});
  openAssistant();$('#assistantContent').hidden=false;$('#chatForm').hidden=false;
  $('#assistantContent').innerHTML=`<div class="ma-answer" data-v3-keep-copy><div class="user-message">${esc(item.question)}</div><p class="ma-answer-context">${esc(issueLabel(issue))} · ${esc(item.name)} · 10.14参考截图</p><details class="ma-context"><summary>查看本次问题的依据</summary><p>${esc(item.summary)}</p>${sourceButton(item,issue)}</details><section class="ma-conclusion"><h3>核心判断</h3><p>${esc(item.conclusion)}</p></section><h3>依据与口径</h3><div class="ma-evidence-wrap"><table class="ma-evidence"><caption>截图引用数据，尚未核验原始披露</caption><thead><tr><th scope="col">指标</th><th scope="col">数值</th><th scope="col">口径</th></tr></thead><tbody>${item.evidence.map(row=>`<tr>${row.map(cell=>`<td>${esc(cell)}</td>`).join('')}</tr>`).join('')}</tbody></table></div>${item.sections.map(([title,copy])=>`<section><h3>${esc(title)}</h3><p>${esc(copy)}</p></section>`).join('')}<p class="ma-answer-note">${esc(item.answerOrigin)} 本次为原型预设回答，未调用在线AI。</p><button type="button" class="ma-return" data-ma-return="${item.id}">回到这条特别提醒 ${icon('arrow-left')}</button></div>`;
  $('#assistantContent').scrollTop=0;
  requestAnimationFrame(()=>window.scrollTo({top:readingScroll,behavior:'instant'}));
 }
 function initialize(){
  const previous=briefDocument;
  briefDocument=function(issue){const html=previous(issue);if(issue.period!=='morning')return html;const t=document.createElement('template');t.innerHTML=html;const old=t.content.querySelector('#brief-my-targets');if(old)old.outerHTML=section(issue);const reference=t.content.querySelector('.research-event-reference p');if(reference)reference.innerHTML=reference.innerHTML.replace('已在个人提醒中解读；继续核对','继续核对');return t.innerHTML;};
  const previousQuote=briefQuote;
  briefQuote=function(value,issue){const result=previousQuote(value,issue),q=opportunitySecurity(value);if(q?.reference!=='morning-screenshot')return result;
   const item=items.find(x=>x.key===opSecurityKey(q));
   const chart=$('#opChart');chart?.previousElementSibling?.matches('.op-tabs')&&chart.previousElementSibling.remove();
   if(chart)chart.outerHTML='<div class="ma-quote-empty" data-v3-keep-copy><strong>走势数据待补充</strong><p>参考截图只提供涨跌幅，未提供价格和走势序列。</p></div>';
   const related=[...document.querySelectorAll('#flowView .flow-panel')].find(el=>el.querySelector('header')?.textContent==='相关资料');
   if(related&&item)related.innerHTML=`<header><h2>相关资料</h2></header><p>${esc(item.summary)}</p>${sourceButton(item,issue)}`;
   return result;
  };
  document.addEventListener('click',e=>{
   const b=e.target.closest('[data-ma-source],[data-ma-ask],[data-ma-return]');if(!b)return;
   const item=find(b.dataset.maSource||b.dataset.maAsk||b.dataset.maReturn);if(!item)return;
   const issue=issueFromId(b.dataset.maIssue)||issueFromId(context?.briefIssue)||selectedIssue||briefSnapshot().displayed;
   if(b.hasAttribute('data-ma-source'))showSource(item,issue);
   else if(b.hasAttribute('data-ma-ask'))ask(item,issue);
   else{if(activeView!=='brief'||selectedIssue?.id!==issue.id)showBrief(issue.id);const target=document.querySelector(`[data-ma-ask="${item.id}"]`);target?.focus({preventScroll:true});target?.closest('article')?.scrollIntoView({block:'center',behavior:'smooth'});}
  });
  if(activeView==='brief'&&selectedIssue?.period==='morning')showBrief(selectedIssue.id);
  if(activeView==='overview')renderWidgets();
 }
 window.morningAlerts={items,selected,section,preview:()=>selected().slice(0,2).map(x=>[x.reason,x.name,pct(x.change),'up',x.summary]),summary:'诺德股份、新易盛、胜宏科技：先看消息影响，再明确后续观察。'};
 if(document.readyState==='complete')initialize();else document.addEventListener('DOMContentLoaded',initialize,{once:true});
})();
