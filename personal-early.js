/* Morning personal briefing: user-approved screenshot examples, not live recommendations. */
(()=>{
 'use strict';
 if(!window.workbenchClient.desktop)return;
 const items=[
  {id:'materials',name:'新材料ETF国泰',kind:'etf',key:'morning-materials-etf',change:0,relation:'自选',
   news:[{id:'battery',text:'2026年手机轻薄大电池突破：努比亚7.62mm配7100mAh，华为6.68mm配7000mAh，荣耀11000mAh入旗舰机身，硅碳负极达859Wh/L。',impact:'正向',sources:1}],
   analysis:'硅碳负极技术突破带动新型电池材料需求，新材料ETF国泰的重仓股包含宁德时代等电池产业链公司，与受影响方向有关。近一周净值下跌2.82%，10月12日资金净流入475.58万元，仍需结合持仓结构判断影响范围。',
   conclusion:'这组事件对新材料ETF国泰形成结构性催化，影响更集中于电池材料相关持仓，不能推及全部成分股。',
   evidence:[['宁德时代','7.83%','电池龙头，直接关联'],['天赐材料','2.59%','锂电材料，直接关联'],['北方华创','11.76%','电子材料与设备，间接关联'],['三环集团','7.92%','电子材料，间接关联']],
   sections:[['事件如何传导','手机电池容量提升与轻薄化要求，提高了对硅碳负极、高能量密度材料及相关配套技术的关注。技术采用能否转化为订单，仍要观察产品渗透和客户导入。'],['ETF持仓如何承接','该ETF覆盖半导体材料、电子材料、锂电材料、化工材料等方向。电池相关公司的业务联系更直接，其他持仓的影响需要逐一核对，不能把材料主题等同于纯电池主题。'],['行情与资金怎样看','资金流入与净值下跌可以同时出现，不能仅凭单日资金变化判断趋势反转。应对齐日期，结合连续资金变化和相关持仓表现观察。'],['后续观察','关注硅碳负极从旗舰机向中端机渗透、宁德时代及天赐材料相关业务兑现，以及技术变化能否带动电子材料与先进封装等方向。']]},
  {id:'ai-etf',name:'创业板人工智能ETF华宝',kind:'etf',key:'159363',change:0,relation:'自选',
   news:[{id:'ai-security',text:'微软总裁呼吁全球统一AI监管规则，称现力度不及日用品；网安AI需求激增，相关企业营收强劲增长。',impact:'正向',sources:1}],
   analysis:'AI监管话题带动A股网安方向关注，10月13日博汇科技涨超19%，高凌信息等冲高。创业板人工智能ETF当日放量反弹，收盘1.112元、涨1.83%，成交额12.98亿元；超大单净流入3426.01万元，但大单及中小单净流出，资金结构存在分化。',
   conclusion:'AI监管与网安需求提供事件催化，但板块活跃和ETF上涨尚不能单独证明相关企业业绩已经兑现。',
   evidence:[['收盘价','1.112元','10月13日'],['涨跌幅','+1.83%','10月13日'],['成交额','12.98亿元','10月13日'],['超大单净流入','3426.01万元','10月13日']],
   sections:[['事件如何传导','AI监管讨论提高对安全与合规需求的关注，可能传导至网安产品和服务采购。需要进一步核对规则落地、客户预算及企业订单。'],['ETF如何承接','基金名称不能替代成分股分析。需核对网安相关公司的实际权重，才能判断此次催化对ETF整体的影响程度。'],['资金信号的分歧','超大单净流入与其他规模资金净流出同时出现，说明参与资金的行为并不一致；不要把单一规模资金流入概括成全面流入。'],['后续观察','继续关注监管规则进展、相关企业收入与订单、ETF持仓覆盖，以及成交和资金变化能否持续。']]},
  {id:'components',name:'元件',kind:'industry',key:'morning-components',change:null,relation:'',
   news:[{id:'components-rally',text:'2026年10月13日元件指数反弹收涨5%，二线PCB领涨，受三季度业绩环比高增长披露驱动。',impact:'正向',sources:1},{id:'sanhuan-expansion',text:'三环集团预计2026—2028年营收132.1亿至240.4亿元，净利43.51亿至87.13亿元；港股募资70.46亿港元投向海外扩产。',impact:'正向',sources:1}],
   analysis:'元件板块10月13日反弹涨2.97%，AI服务器与汽车电子需求、国产替代构成关注线索；隔夜费城半导体指数走弱可能影响开盘情绪。资金聚焦PCB、MLCC、覆铜板等方向，主力净流入12.12亿元，中期资金尚未全面回流，继续观察龙头承接与三季报兑现。',
   conclusion:'业绩披露与扩产预期共同形成催化，但短期反弹、盈利预测和实际经营兑现需要分别判断。',
   evidence:[['需求方向','AI服务器、汽车电子','产业需求线索'],['关注环节','PCB、MLCC、覆铜板','板块内不同环节'],['主力净流入','12.12亿元','10月13日板块观点']],
   sections:[['把两条消息放在一起看','第一条是元件指数及PCB公司的市场表现，第二条是三环集团的盈利预测和扩产计划。两者共同提示对景气改善的关注，但不能把一家公司预测推广为整个行业确定增长。'],['区分预测与已实现业绩','2026—2028年的收入和利润属于预测，海外扩产还需经历项目建设、产能爬坡与客户导入。继续核对三季报和后续公告。'],['区分市场口径','消息中的指数涨5%与综合观点中的板块涨2.97%属于不同表述，不能直接当作同一统计口径比较；资金数据也需与对应范围和日期对齐。'],['后续观察','关注PCB、MLCC、覆铜板龙头的订单及盈利变化、三环集团扩产进度，以及隔夜市场变化和资金承接是否影响反弹持续性。']]}
 ];
 // Register only missing identities. Existing quotes retain their own data date and values.
 for(const item of items.filter(x=>x.kind==='etf')){
  const q=opportunitySecurity(item.name);
  if(q)item.key=opSecurityKey(q);
  else opportunityQuotes.push({id:item.key,name:item.name,type:'etf',price:null,change:item.change,reference:'personal-early-screenshot',source:'用户提供的早报截图'});
 }
 const industry=items.find(x=>x.kind==='industry');
 // Reuse the shared theme detail with these two supplied events; no invented constituents.
 const theme={id:industry.key,name:industry.name,title:'业绩披露与海外扩产带动元件行业关注',date:'10/13',change:null,stocks:[],etfs:[],analysis:[['综合影响',industry.analysis]],events:industry.news.map(n=>({id:n.id,title:n.text.split('，')[0],summary:n.text,date:n.id==='components-rally'?'2026-10-13':'日期未提供',sources:n.sources}))};
 window.themeExplorerData[industry.key]=theme;
 if(!opportunityThemes.some(t=>t.id===industry.key))opportunityThemes.push({id:theme.id,name:theme.name,tag:'行业',summary:theme.title,read:industry.analysis,stocks:[],etfs:[]});
 const find=id=>items.find(x=>x.id===id);
 function selected(){const alerts=window.morningAlerts?.selected()||[];return items.filter((x,i,a)=>a.findIndex(y=>y.key===x.key)===i&&!alerts.some(y=>y.key===x.key||y.name===x.name));}
 const source=(item,n,issue)=>`<button type="button" class="pe-source" data-pe-source="${item.id}|${n.id}" data-pe-issue="${esc(issue.id)}">来源 · ${n.sources} ${icon('chevron-right')}</button>`;
 const question=item=>`分析以下${item.news.length>1?'两条事件':'事件'}对${item.name}的影响：${item.news.map((n,i)=>`${i+1}. ${n.text}`).join(' ')} ${item.kind==='etf'?'结合相关持仓，':'结合产业链，'}说明影响路径、支持依据、分歧及后续观察点。`;
 function section(issue){return `<section class="personal-theme-related pe-section" id="brief-related-macro" data-v3-keep-copy><h2>和我有关</h2>${selected().map(item=>`<article class="pe-card" data-pe-object="${item.id}"><header class="pe-card-head"><h3>${opLink(esc(item.name),item.kind==='etf'?opQuoteRoute(item.key,issue.id):opThemeRoute(item.key,issue.id),'pe-name')}</h3>${item.change==null?'':`<span class="pe-change ${item.change===0?'neutral':item.change>0?'up':'down'}">${item.change>=0?'+':''}${item.change.toFixed(2)}%</span>`}${item.relation?`<span class="pe-relation">${esc(item.relation)}</span>`:''}</header><ol class="pe-news">${item.news.map(n=>`<li><p>${esc(n.text)} <span class="pe-impact">${esc(n.impact)}</span></p>${source(item,n,issue)}</li>`).join('')}</ol><button type="button" class="pe-analysis" data-pe-ask="${item.id}" data-pe-issue="${esc(issue.id)}" aria-label="进一步分析${esc(item.name)}的相关消息"><span class="pe-analysis-label">${item.kind==='industry'?'今日观点':'影响分析'}</span><span class="pe-analysis-copy">${esc(item.analysis)}</span><span class="pe-analysis-action">进一步分析 ${icon('arrow-right')}</span></button></article>`).join('')||'<p>本期相关对象已在特别提醒中展示。</p>'}</section>`;}
 function showSource(item,n,issue){openModal('内容来源',`<div class="pe-source-detail" data-v3-keep-copy><p>${esc(item.name)} · ${esc(issueLabel(issue))}</p><h3>资讯摘要</h3><p>${esc(n.text)}</p><p class="pe-source-status">原文链接暂未提供。</p></div>`,'和我有关 / 来源');}
 function ask(item,issue){
  const top=window.scrollY,prompt=question(item),news=item.news.map(n=>n.text).join('\n');
  setContext({kind:'brief',company:item.name,objectType:item.kind,topic:item.name,briefIssue:issue.id,source:news,question:prompt,personalEarlyId:item.id,relatedNews:item.news.map(n=>({id:n.id,text:n.text}))});
  openAssistant();$('#assistantContent').hidden=false;$('#chatForm').hidden=false;
  $('#assistantContent').innerHTML=`<div class="pe-answer" data-v3-keep-copy><div class="user-message">${esc(prompt)}</div><p class="pe-answer-context">${esc(issueLabel(issue))} · ${esc(item.name)}</p><details class="pe-context"><summary>本次分析的${item.news.length}条消息</summary>${item.news.map(n=>`<p>${esc(n.text)}</p>${source(item,n,issue)}`).join('')}</details><section class="pe-conclusion"><h3>核心判断</h3><p>${esc(item.conclusion)}</p></section><h3>${item.id==='materials'?'相关持仓与业务联系':'分析依据'}</h3><table class="pe-evidence"><thead><tr>${(item.id==='materials'?['公司','持仓比例','事件联系']:['指标','内容','口径']).map(t=>`<th scope="col">${t}</th>`).join('')}</tr></thead><tbody>${item.evidence.map(row=>`<tr>${row.map(c=>`<td>${esc(c)}</td>`).join('')}</tr>`).join('')}</tbody></table>${item.sections.map(([title,copy])=>`<section><h3>${esc(title)}</h3><p>${esc(copy)}</p></section>`).join('')}<button class="pe-return" data-pe-return="${item.id}" data-pe-issue="${esc(issue.id)}">回到这条内容 ${icon('arrow-left')}</button></div>`;
  $('#assistantContent').scrollTop=0;requestAnimationFrame(()=>window.scrollTo({top,behavior:'instant'}));
 }
 const previousQuote=briefQuote;
 briefQuote=function(value,issue){const result=previousQuote(value,issue),q=opportunitySecurity(value);if(q?.reference!=='personal-early-screenshot')return result;
  const chart=$('#opChart');if(chart?.previousElementSibling?.matches('.op-tabs'))chart.previousElementSibling.remove();if(chart)chart.outerHTML='<div class="ma-quote-empty"><strong>走势数据待补充</strong></div>';
  const item=items.find(x=>x.key===opSecurityKey(q)),related=[...document.querySelectorAll('#flowView .flow-panel')].find(el=>el.querySelector('header')?.textContent==='指数与主题');
  if(related&&item)related.innerHTML=`<header><h2>相关消息</h2></header>${item.news.map(n=>`<p>${esc(n.text)}</p>${source(item,n,issue)}`).join('')}`;
  return result;
 };
 document.addEventListener('click',e=>{const b=e.target.closest('[data-pe-source],[data-pe-ask],[data-pe-return]');if(!b)return;const [id,newsId]=(b.dataset.peSource||b.dataset.peAsk||b.dataset.peReturn).split('|'),item=find(id);if(!item)return;const issue=issueFromId(b.dataset.peIssue)||selectedIssue||briefSnapshot().displayed;
  if(b.dataset.peSource){const n=item.news.find(n=>n.id===newsId);if(n)showSource(item,n,issue);}
  else if(b.dataset.peAsk)ask(item,issue);
  else{if(activeView!=='brief'||selectedIssue?.id!==issue.id)showBrief(issue.id);const target=document.querySelector(`[data-pe-ask="${item.id}"]`);target?.focus({preventScroll:true});target?.closest('article')?.scrollIntoView({block:'center',behavior:'smooth'});}
 });
 function summary(){return selected().flatMap(item=>[item.name+(item.relation?'（'+item.relation+'）':''),...item.news.flatMap((n,i)=>[`${i+1}. ${n.text}（${n.impact}）`,`来源：${n.sources}份`]),'影响分析：'+item.analysis,'']);}
 window.personalEarly={items,selected,section,summary,question};
 document.addEventListener('DOMContentLoaded',()=>requestAnimationFrame(()=>requestAnimationFrame(()=>{if(activeView==='brief'&&new URLSearchParams(location.hash.split('?')[1]||'').get('section')==='related-macro')document.querySelector('#brief-related-macro')?.scrollIntoView({block:'start'});})),{once:true});
})();
