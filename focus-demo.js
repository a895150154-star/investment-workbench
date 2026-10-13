/* Matched, fixed demo outputs. No Skill execution or additional market evidence. */
(() => {
  const modes={general:{label:'综合解读',skills:['新闻查询','证据可追溯引擎']},events:{label:'事件进展',skills:['新闻查询','市场点评与事件解读','证据可追溯引擎']},business:{label:'经营兑现',skills:['公司基本面速览','行业深度分析','股票财务分析','证据可追溯引擎']}};
  const business={
    '2490095':[['业务路径：产品如何变成收入','端侧芯片扩展了产品覆盖，经营兑现仍要经过客户适配、整机采用、量产交付和持续采购。本期确认的是产品发布，尚不能确认收入增量。'],['产业环节：谁来验证需求','需要由整机厂商或合作方公开适配机型、应用场景与交付信息。功耗、成本和软件兼容会影响产品能否进入客户的实际采购。'],['财务验证：还缺什么','本期没有新产品订单金额、收入贡献和回款数据。财务分析样例只能列出缺口，后续要对照经营披露与定期报告核验。']],
    '2490104':[['业务路径：订单不等于当期收入','公司回应称出口订单总量未受冲击，并将出口回落解释为船期延后。现有需求能否兑现，取决于延后出货能否补回，不能由订单表述直接推出业绩不受影响。'],['产业环节：数量和价格分开看','相关产品以季度议价为主。即使补回交付，也要核对最终售价，才能继续讨论销售和盈利；物流修复与价格变化是两条不同的验证线。'],['财务验证：从交付到回款','本期资料未给出延后订单补发金额、收入确认和现金回款。这里只展示核验路径，不能据此计算盈利或认定经营已经修复。']],
    xys:[['业务关联：激励兑现与经营兑现分开','本次材料是限制性股票归属和股份上市安排。它可以帮助理解团队激励与股本变化，并未提供光模块新增客户、订单或交付信息。'],['产业验证：等待经营披露','后续研究应核对客户采用和产品交付的公开材料。属于光通信行业，并不意味着每一条公司公告都能证明需求增长。'],['财务缺口：不从激励推算利润','未取得对应收入、利润和现金流资料。本次财务样例保留为待补，不能将股份归属视为业绩已经兑现。']],
    zjxc:[['业务关联：股本报表说明什么','本次更新提供股份变动的核对入口，不能替代主营产品与客户信息。股本事项和业务增长需要分别核验。'],['产业验证：看产品与客户证据','继续关注产品交付、客户采用及经营公告。如果报表涉及融资，还需取得资金用途与项目实施材料，当前不能直接认定新增产能或订单。'],['财务缺口：缺少经营与用途证据','本期未取得完整变动条款及可支撑经营增长的财务数据。暂不推算收入、盈利或估值。']],
    tftx:[['业务关联：现金管理是否影响经营用款','现金管理安排反映资金使用事项，不能单凭授权判断扩产资金充裕。要先核对自有资金与采购、项目支出的使用边界。'],['资金路径：期限要与支出匹配','重点检查产品期限、赎回条件与经营付款计划。短期资金能否及时回收，比仅看授权安排更有助于判断流动性影响。'],['财务缺口：授权不是现金流结果','本期未取得实际购买、赎回、经营支出与现金回流数据。因此不能把授权额度当作实际投入，也不能给出资金充足的结论。']]
  };
  function variant(id,focus=briefPrefs.focus){const a=briefItems.find(x=>x.id===id)||briefNewsAnalysis[id];if(!a||!business[id])return null;
    const key=modes[focus]?focus:'general',mode=modes[key],name=a.company||a.object;
    const sections=key==='business'&&business[id]?business[id]:key==='events'?[['本次变化：已披露什么',a.summary],['进展与下一步：等待什么公开信息',a.watch],['确认边界：哪些还不能下结论',a.answer]]:[['事实摘要',a.summary],['影响解读',a.analysis],['后续观察与边界',a.watch]];
    const labels=key==='events'?[`${name}这次披露了什么变化？`,`${name}下一步有哪些进展值得留意？`,`${name}目前哪些判断还不能确认？`]:key==='business'?[`${name}这条消息怎样影响经营兑现？`,`${name}需要核对哪些产业或经营环节？`,`${name}还缺哪些财务验证资料？`]:[`${name}这条资讯主要说了什么？`,`${name}这条资讯有哪些影响？`,`${name}后续还需要观察什么？`];
    return {...mode,key,name,sections,questions:sections.map(([,answer],i)=>({label:labels[i],answer}))};
  }
  function badge(v){return `<div class="focus-demo-badge"><strong>${esc(v.label)} · 演示解读</strong><span>对应 Skill：${v.skills.map(esc).join(' → ')}</span><small>固定资料匹配的不同输出样例 · 未执行真实 Skill</small></div>`;}
  function transform(html,id){const v=variant(id);if(!v)return html;const t=document.createElement('template');t.innerHTML=html;const a=t.content.querySelector('.report-analysis');if(!a)return html;
    [...a.children].filter(x=>x.matches('p:not(.brief-personal-focus):not(.risk-reading-note),.focus-demo-badge,.focus-demo-content')).forEach(x=>x.remove());
    const anchor=a.querySelector('.inline-questions,button[data-brief-action="question"],button[data-editorial-ask]');
    const content=badge(v)+`<div class="focus-demo-content" data-focus-mode="${v.key}">${v.sections.map(([h,p])=>`<p><strong>${esc(h)}</strong>${esc(p)}</p>`).join('')}</div>`;
    if(anchor)anchor.insertAdjacentHTML('beforebegin',content);else a.insertAdjacentHTML('beforeend',content);return t.innerHTML;
  }
  window.focusDemo={variant,badge};
  const block=briefNewsAnalysisBlock,alert=briefAlert;
  briefNewsAnalysisBlock=(id,issue)=>transform(block(id,issue),id);
  briefAlert=(item,issue)=>transform(alert(item,issue),item.id);
  function answer(id){const v=variant(id),box=$('#assistantContent');if(!v||!box.querySelector('.brief-answer'))return;
    box.querySelectorAll('.brief-answer-heading,.assistant-copy,.brief-answer-table,.focus-demo-badge,.focus-demo-content').forEach(n=>n.remove());
    const lead=box.querySelector('.brief-answer');lead.innerHTML=`<strong>${esc(v.sections[0][0])}</strong><p>${esc(v.sections[0][1])}</p>`;
    lead.insertAdjacentHTML('beforebegin',badge(v));lead.insertAdjacentHTML('afterend',`<div class="focus-demo-content" data-focus-mode="${v.key}">${v.sections.slice(1).map(([h,p])=>`<h3>${esc(h)}</h3><p>${esc(p)}</p>`).join('')}</div>`);
  }
  const oldAsk=briefAsk,oldEditorial=editorialAsk;
  briefAsk=function(id,...args){if(researchDemo.isCase(id))return researchDemo.ask(args[2]||researchDemo.questions[0].label,args[0]?.id);const r=oldAsk(id,...args);answer(id);return r;};
  editorialAsk=function(key,...args){if(key==='news-'+researchDemo.id)return researchDemo.ask(args[0]||researchDemo.questions[0].label,args[2]);const r=oldEditorial(key,...args);if(key.startsWith('news-'))answer(key.slice(5));return r;};
})();
