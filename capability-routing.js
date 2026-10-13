/* Fixed local routing for the prototype. No model calls, profile writes or market calculations. */
(() => {
  const modes={general:{label:'综合解读',agent:'auto',skills:['news']},events:{label:'事件进展',agent:'event',skills:['news','event']},business:{label:'经营兑现',agent:'company',skills:['basic','industry','financial']},financial:{label:'财务核验',agent:'company',skills:['financial']},valuation:{label:'估值核验',agent:'company',skills:['valuation']}};
  function resolve(question,p,selection,methods){
    // Suppress explicitly negated clauses rather than treating their keywords as requests.
    const text=question.replace(/(?:不要|不看|别看|不想看|不需要|不用|不谈|不分析|不关注)[^，,。；;！？!?]*(?=[，,。；;！？!?]|$)/g,'');
    const gap=/基金|ETF/i.test(text)||selection.agent==='fund'?'基金资料与完整分析样例尚未配置。':/技术面|均线|K\s*线|量价|实时|今天.*(?:股价|涨跌)|目标价|止损|买入|卖出|加仓|减仓/.test(text)?'本次所需的行情序列、实时数据或投资动作结论不在演示范围内。':/晚报/.test(text)?'普通提问编排目前仅配置早报个股样例，晚报请沿用原有正文追问。':null;
    const requested=[[/综合|全面|总体/,'general'],[/事件|公告|进展/,'events'],[/订单|交付|经营|业务|行业|产业链|客户/,'business'],[/现金流|财务|财报|利润|盈利/,'financial'],[/估值|市盈率|PE\b/i,'valuation']].filter(([re])=>re.test(text)).map(([,key])=>key);
    if(!requested.length&&/多\s*agent|多(?:个|位)?专家|协作/i.test(text))requested.push('events','business');
    const method=p.method&&methods[p.method.key];
    let focus=requested[0],ids=[],basis='';
    if(focus){ids=requested.flatMap(key=>modes[key].skills);basis='本次明确要求优先；已确认的默认阅读重点「'+(method?method.label:p.label)+'」保留不变。';}
    else if(selection.skills.length){focus=selection.skills.includes('event')?'events':selection.skills.includes('financial')?'financial':selection.skills.includes('valuation')?'valuation':selection.skills.some(x=>['basic','industry'].includes(x))?'business':'general';basis='本次未限定方向，采用你手动指定的 Skill；不改变长期偏好。';}
    else if(selection.agent!=='auto'){focus=selection.agent==='event'?'events':selection.agent==='value'?'financial':'business';ids=selection.agent==='value'?['financial','valuation']:modes[focus].skills;basis='本次未限定方向，按手动指定专家的视角展示。';}
    else if(method){focus=method.skills.includes('event')?'events':method.skills.includes('industry')?'business':method.skills.includes('financial')?'financial':'valuation';ids=method.skills;basis='采用已确认偏好「'+p.method.scope+' · '+method.label+'」，仅作用于匹配范围；未确认线索不参与。';}
    else{focus=modes[p.focus]?p.focus:'general';ids=modes[focus].skills;basis='本次未限定方向，沿用已保存的阅读重点「'+modes[focus].label+'」。';}
    if(!requested.length&&!/看看|看一下|研究|分析|梳理|解读|变化|情况|怎么样|怎样|如何|继续|材料|资料|了解|诊断|最近|近期|巴菲特|价值投资/.test(text)&&!selection.skills.length) return {...modes[focus],focus,ids:['evidence'],basis,gap:gap||'这个问题没有匹配到固定分析样例，请具体说明想看事件、经营、财务还是估值。',requested};
    const manual=selection.skills.length>0;
    const missing=manual?ids.filter(id=>!selection.skills.includes(id)):[];
    const agent=selection.agent!=='auto'?selection.agent:/巴菲特|价值投资/.test(text)?'value':modes[focus].agent;
    if(agent==='value'&&!manual&&!requested.length)ids=[...ids,'financial','valuation'];
    if(manual)ids=selection.skills;
    const notes=[];
    if(selection.agent!=='auto')notes.push('按你指定的专家展示；专家选择不会把本次问题改成另一种需求，也不认定长期投资风格。');
    if(agent==='event'&&ids.some(x=>['financial','valuation','industry'].includes(x)))notes.push('市场解读陪伴助手仅整理事件；经营、财务或估值检查由个股投研专家协作演示。');
    if(manual)notes.push('仅采用你手动勾选的 Skill，并保留来源核验。');
    if(missing.length)notes.push('手动 Skill 未覆盖全部需求；未选能力不自动补用，未覆盖部分保留为缺口。');
    return {agent,focus,label:requested.length?requested.map(k=>modes[k].label).join(' + '):modes[focus].label,ids:[...new Set([...ids,'evidence'])],basis,notes,missing,gap,requested,manual};
  }
  window.capabilityRouting={resolve,modes};
})();
