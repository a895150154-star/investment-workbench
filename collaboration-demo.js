/* Preset expert perspectives. No network requests, model execution, timers or persistent state. */
(() => {
  function plan(choice){
    if(choice.gap)return {members:[],multiple:false,reason:'资料不足，暂不安排协作结果。'};
    const groups=new Map();
    for(const skill of choice.ids.filter(x=>x!=='evidence')){
      const event=['news','event'].includes(skill);
      const owner=event?(choice.agent==='auto'&&choice.ids.every(x=>['news','evidence'].includes(x))?'auto':'event'):
        choice.agent==='value'&&['financial','valuation'].includes(skill)?'value':'company';
      if(!groups.has(owner))groups.set(owner,[]);
      groups.get(owner).push(skill);
    }
    // A compatible manually selected expert can handle one angle alone.
    if(groups.size===1&&choice.agent==='value'&&groups.has('event')){const ids=groups.get('event');groups.clear();groups.set('value',ids);}
    const members=[...groups].map(([agent,ids])=>({agent,ids}));
    return {members,multiple:members.length>1,reason:members.length>1?'本次同时需要不同角度的核验，按已选 Skill 分工；闪电猫负责对照与汇总。':'本次能力可以由同一位专家承接，无需增加协作环节。'};
  }
  const cases={
    '2490095':{event:'产品发布是方向上的新进展，尚不是客户采用的证明。',company:'从芯片发布到收入兑现，仍需适配、采购与实际交付证据。',value:'没有收入贡献与回款资料，无法判断新产品的盈利质量与价值。',common:'产品发布不能直接等同于收入或利润增量。',tension:'事件视角可以记录产品覆盖扩展；经营视角仍等待客户采用。两者的确认门槛不同，并不构成事实矛盾。',gap:'客户适配、量产交付、持续采购及新产品收入与回款资料。'},
    '2490104':{event:'公司将出口回落解释为船期延后，订单未受冲击仍是公司表述。',company:'补发数量与最终售价都要核对，订单存在不等于收入已确认。',value:'在取得收入确认与回款证据前，不能确认盈利质量未受影响。',common:'订单、交付、收入和回款需要分别核验。',tension:'事件视角保留公司对物流的解释；经营视角还要求补发和价格证据。解释可以成立，但业绩影响尚不能据此排除。',gap:'延后订单补发、实际议价、收入确认及现金回款资料。'},
    xys:{event:'当前材料指向股权激励归属与股份上市安排。',company:'激励兑现属于治理事项，不能替代光模块客户与交付证据。',value:'需要核对股份安排与同期盈利，不能只凭激励事项推算每股价值。',common:'激励归属不能直接作为业务增长的证据。',tension:'事件视角关注激励安排进入兑现环节；经营视角关注实际产品交付。两者研究对象不同，当前样例没有足够依据形成相反结论。',gap:'完整归属条款、股份安排、经营披露与同期财报。'},
    zjxc:{event:'本期资料提供股份变动报表的核对入口。',company:'股本变化与主营业务增长需要分别核验。',value:'没有完整股份条款与盈利资料，不能判断每股价值的变化。',common:'股份报表本身不能证明新增订单或产能。',tension:'事件视角先核对股份变动；经营视角仍等待资金用途与项目证据。不能把可能的融资用途当成已经发生的扩张。',gap:'完整变动条款、资金用途、项目实施及经营财务资料。'},
    tftx:{event:'现金管理公告说明授权安排，不能视作实际资金使用。',company:'资金期限、赎回条件需要与采购及项目支出匹配。',value:'缺少实际回收与现金流数据，不能认定资金充裕或使用效率已经提高。',common:'授权安排不等于实际投入，也不等于流动性充分。',tension:'事件视角记录现金管理安排；经营与价值视角要求核对付款时点和现金回收。是否存在期限错配，当前资料不能裁定。',gap:'实际购买与赎回、经营回款、项目支出和付款安排。'}
  };
  function perspective(id,member,variant){
    const c=cases[id];if(!c)return null;
    const business=variant(id,'business'),events=variant(id,'events');
    const sections=[];
    for(const skill of member.ids){
      if(skill==='news')sections.push(events.sections[0]);
      if(skill==='event')sections.push(events.sections[2]);
      if(skill==='basic')sections.push(business.sections[0]);
      if(skill==='industry')sections.push(business.sections[1]);
      if(skill==='financial')sections.push(business.sections[2]);
      if(skill==='valuation')sections.push(['估值输入待补','缺少同期市值、利润与一致预期输入，未调用计算库，不输出估值倍数。']);
    }
    return {lead:c[member.agent]||c.event,sections,gap:member.agent==='event'?'尚未获取原资料快照之后的新增披露；完整条款及后续进展仍需核验。':member.ids.includes('valuation')?c.gap+' 另缺同期估值输入。':c.gap};
  }
  function synthesis(id,team){
    const c=cases[id];if(!c||!team.multiple)return null;
    const hasEvent=team.members.some(x=>x.agent==='event');
    return {common:c.common,tension:hasEvent?c.tension:'个股视角核对业务路径，价值视角要求盈利质量与估值输入。当前只有检查框架与资料缺口，尚不足以形成有证据支撑的观点冲突。',gap:c.gap};
  }
  window.collaborationDemo={plan,perspective,synthesis};
})();
