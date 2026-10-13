/* V2.25 — optional review annotations, not a capability execution layer.
 * Company names follow capability-map.html and its retained source snapshots.
 * State lives only in the URL. No changes to user records or business handlers.
 */
(() => {
  'use strict';
  const labels = {ai:'AI 生成解读', assist:'AI 辅助整理', data:'数据 / 规则主导'};
  const note = (kind,title,copy,skills=[],owner='') => ({kind,title,copy,skills,owner});
  const maps = {
    indexes:note('data','指数点位与涨跌，来自行情数据','系统负责查询、展示和常用管理；AI 不生成报价。', ['指数数据查询','实时行情速查'],'行情数据服务；查询 Skill 按需取数'),
    market:note('data','成交、涨跌分布与榜单，由数据和统计产生','图表呈现确定的统计结果；只有进一步的盘面解读才需要 AI。',['实时行情速查'],'行情与统计服务；解读时再用「盘面解读分析」'),
    brief:note('ai','AI 生成导读、摘要与影响解读','先取新闻、公告和行情，再按用户关注组织早晚报；事实和数字保留来源。',['每日早报/晚报','新闻查询','公告查询'],'闪电猫·全能金融投研专家；按需交给市场解读陪伴助手'),
    events:note('assist','AI 提炼事件看点，解释为什么值得关注','新闻原文来自资讯源；摘要、重点和与关注对象的关联由 AI 辅助整理。',['新闻查询','事件及催化剂查询','市场点评与事件解读'],'闪电猫·全能金融投研专家'),
    sectors:note('assist','AI 把产业线索归到主题，并解释关联','这里展示主题线索，不是行业涨幅榜；公司、产业链和主题关系仍需证据核验。',['行业 & 概念标签匹配','行业深度分析','产业链上下游图谱梳理'],'市场解读陪伴助手'),
    funds:note('ai','AI 解释公司资金事项的影响','当前卡片解读现金管理公告；公告是输入，经营影响是分析，不是实时资金流排行。',['公告查询','公司基本面速览','股票财务分析'],'个股投研专家'),
    watch:note('data','用户维护清单，系统展示报价','自选的添加、移除与排序是产品功能；查询 Skill 可供数，深入解读才需要专家。',['实时行情速查'],'用户操作 + 行情数据服务'),
    holdings:note('data','持仓由用户导入，系统解析并保存','文件列识别、输入核对与本地存储按规则执行；AI 不生成持仓，也不替用户确认。',[],'用户确认 + 文件解析与存储'),
    triggers:note('data','条件满足才触发，保存设置不等于触发','指标计算、规则匹配、去重和通知由监控服务承担；AI 可协助解释变化。',['实时行情速查','历史多维时序查询','事件及催化剂查询'],'监控服务需建设；当前只有本地设置与明确标注的演示'),
    eventSummary:note('ai','从原资料提炼事件摘要','AI 归纳已披露的事实，保留出处；不能把推测写成已经发生的事。',['新闻查询','公告查询'],'闪电猫·全能金融投研专家'),
    eventRead:note('ai','解释事件影响，指出下一步看什么','这是分析层：结合当前证据给出解释和待验证点，不生成未经核验的结论。',['市场点评与事件解读'],'市场解读陪伴助手；公司经营问题可交给个股投研专家'),
    related:note('assist','AI 列出关联个股，逐家公司解释关系','新闻直接提及、主题线索与用户指定分别标注；关联依据需由公司业务、公告或项目材料核验。',['行业 & 概念标签匹配','产业链上下游图谱梳理'],'闪电猫组织线索；专项问题再交专家'),
    track:note('assist','AI 带入事件与具体股票，确认权在用户','从新闻自动带入关联标的和追踪条件；仅提醒频率和提醒方式可修改。方式弹窗只改草稿，最终确认才保存。已有追踪范围保留，不自动加入自选；当前不执行真实监控。',['事件及催化剂查询','公告查询','实时行情速查'],'闪电猫·全能金融投研专家；监控不是专家持续聊天'),
    securityTrack:note('assist','基础预选、历史习惯与手动条件分开','首次带入业绩公告及风险提示；同类型至少两个已保存标的重复选择的非数值条件，可补充一项。已有设置原样带入，不按风险画像重置，不迁移其他标的数值阈值。添加条件和提醒方式只改草稿，最终确认才保存。',['公告查询','实时行情速查'],'规则预设与用户已确认设置；当前不运行监控'),
    security:note('data','价格、涨跌和走势由行情服务提供','查询 Skill 用来拿数据，不负责“生成”行情；缺失字段保持未获取。',['实时行情速查','历史多维时序查询'],'行情数据服务'),
    etf:note('data','指数名称、成分与权重依赖数据核验','需要解释 ETF 的覆盖与差异时，再由基金专家分析；当前缺失的成分数据不补造。',['基金数据查询','指数数据查询'],'基金研究陪伴助手按需解读；ETF 覆盖待核验'),
    company:note('assist','AI 整理公司资料，专家解释经营含义','公告和财务数据是依据；概要整理与专项分析属于 AI，缺口必须保留。',['公告查询','公司基本面速览','股票财务分析'],'个股投研专家按需参与'),
    assistant:note('ai','闪电猫按问题选择能力，组织带来源的回答','简单查询可直接用一个 Skill；复杂分析再组合 Skill 或交给专项专家。',['自然语言问数','智能搜索'],'闪电猫·全能金融投研专家；无需每次转交其他 Agent'),
    tasks:note('data','这里管理已确认的规则与订阅偏好','新增时先选择标的，再由闪电猫整理条件；用户确认后保存。修改、停止和提醒记录由系统管理。',[],'设置与监控服务；当前未运行监控或通知'),
    opportunities:note('assist','AI 组织热点与主题，解释它们的联系','主题线索可以由 AI 整理；列表价格、筛选和排序仍由数据与规则提供。',['热点数据查询','板块机会发现','行业 & 概念标签匹配'],'市场解读陪伴助手；进入标的后按需交个股或基金专家'),
    etfInsight:note('ai','这里由 AI 解释为什么关注这只 ETF','基金专家结合事件和指数覆盖，生成简要理由、关联依据与待验证点；当前展示模拟内容。',['基金综合分析','基金持仓分析','基金数据查询','指数数据查询'],'基金研究陪伴助手；闪电猫组织展示与继续追问'),
    etfs:note('data','ETF 列表与筛选由数据和规则提供','分类、报价、自选和排序由数据与规则提供；下方紫色简析区单独展示 AI 关注理由。',['基金数据查询','指数数据查询','基金与ETF筛选'],'基金研究陪伴助手按需参与；数据覆盖待核验')
  };
  let enabled = new URL(location.href).searchParams.get('annotate') === '1';
  let frame = 0;
  const toggle=document.createElement('button');
  toggle.type='button';toggle.id='presentationToggle';toggle.className='presentation-toggle';
  toggle.setAttribute('aria-controls','presentationLegend');
  toggle.innerHTML='<svg viewBox="0 0 20 20" aria-hidden="true"><path d="M4 4h8v11m-4-4 4 4 4-4"/></svg><span>汇报标注</span><b></b>';
  document.querySelector('.top-tools').prepend(toggle);
  const legend=document.createElement('section');
  legend.id='presentationLegend';legend.className='pa-legend';
  legend.setAttribute('aria-label','汇报标注说明');
  legend.innerHTML=`<div class="pa-legend-top"><strong>汇报讲解层</strong><span>箭头指向对应卡片或内容</span><a href="capability-map.html" target="_blank" rel="noopener">完整能力映射 ↗</a></div><div class="pa-legend-keys">${Object.entries(labels).map(([k,v])=>`<span class="pa-key pa-${k}">${v}</span>`).join('')}</div><p>以下标注说明<strong>拟接入的能力分工</strong>。当前机会解读为模拟内容、行情为历史样本，尚未调用公司 Agent / Skill；查询类 Skill 提供数据，不代表 AI 生成行情数字。</p>`;
  document.querySelector('#main').prepend(legend);
  const observer=new MutationObserver(()=>schedule());
  const observe=()=>observer.observe(document.querySelector('.work-area'),{childList:true,subtree:true,attributes:true,attributeFilter:['hidden']});
  function html(d){
    return `<svg class="pa-arrow" viewBox="0 0 26 46" aria-hidden="true"><path d="M23 6H9v34m-5-6 5 6 5-6"/></svg><div class="pa-note-body"><div class="pa-note-heading"><span class="pa-tag">${labels[d.kind]}</span><strong>${esc(d.title)}</strong></div><p>${esc(d.copy)}</p><div class="pa-note-meta">${d.skills.length?`<span><b>拟用 Skill</b>${d.skills.map(esc).join(' · ')}</span>`:''}${d.owner?`<span><b>分工</b>${esc(d.owner)}</span>`:''}</div></div>`;
  }
  function render(){
    observer.disconnect();
    try{
      toggle.setAttribute('aria-pressed',String(enabled));
      toggle.querySelector('b').textContent=enabled?'开':'关';
      legend.hidden=!enabled;
      document.body.classList.toggle('presentation-on',enabled);
      const wanted=new Set();
      const add=(target,d,key,placement='prepend')=>{
        if(!enabled||!target||target.closest('[hidden]'))return;
        wanted.add(key);
        let el=document.querySelector(`[data-presentation-note="${key}"]`);
        if(!el){el=document.createElement('aside');el.dataset.presentationNote=key;el.setAttribute('aria-label','汇报标注');}
        el.className='pa-note pa-'+d.kind;
        const content=html(d);if(el.innerHTML!==content)el.innerHTML=content;
        if(placement==='after'){if(target.nextElementSibling!==el)target.after(el);}
        else if(target.firstElementChild!==el)target.prepend(el);
      };
      for(const widget of document.querySelectorAll('#widgetGrid [data-widget]')){
        const id=widget.dataset.widget;
        const d=id==='stocks'?maps[stockTab==='持仓'?'holdings':stockTab==='触发'?'triggers':'watch']:maps[id];
        if(d)add(widget,d,'widget-'+id);
      }
      add(document.querySelector('#briefView .detail-cover'),maps.brief,'brief','after');
      for(const card of document.querySelectorAll('#briefView .reminder-card')){
        const id=card.dataset.personalAlert,v=window.focusDemo?.variant(id);
        if(v)add(card.querySelector('.reminder-analysis'),note('ai','特别提醒 · '+v.label,'按已有关注关系排序，已确认阅读重点改变分析与追问；风险与资料缺口保留。本卡采用固定资料和预设内容，未执行真实 Skill。风险自述只作为呈现参考，不是承受能力测评。',v.skills,'闪电猫组织解读；追踪确认后仅保存本地设置'),'reminder-'+id);
      }
      add(document.querySelector('#indicesDetail .detail-cover'),maps.indexes,'indices','after');
      add(document.querySelector('#marketDetail .detail-cover'),maps.market,'market','after');
      add(document.querySelector('#marketDetail .market-previous-news summary'),note('ai','这一段市场解读才由 AI 整理','把统计事实转为有出处的盘面解释，与上方数据图表分别呈现。',['盘面解读分析','市场点评与事件解读'],'市场解读陪伴助手'),'market-read','after');
      add(document.querySelector('#flowView .hotspot-ai-insight'),maps.eventRead,'hotspot-analysis');
      add(document.querySelector('#flowView .hotspot-card-stocks'),maps.related,'hotspot-stocks');
      add(document.querySelector('#flowView .hotspot-theme-reading'),maps.opportunities,'theme-reading');
      const eventSections=document.querySelectorAll('#flowView .event-detail-section');
      [maps.eventSummary,maps.eventRead,maps.related].forEach((d,i)=>add(eventSections[i],d,'event-'+i));
      add(document.querySelector('#flowView .event-detail-track'),maps.track,'event-track');
      if(route.type==='brief-quote'){
        const q=opportunitySecurity(route.code||route.company);
        const panels=document.querySelectorAll('#flowView .flow-panel');
        add(panels[0],maps.security,'quote');
        add(panels[1],q?.type==='etf'?maps.etf:maps.company,'quote-info');
        add(document.querySelector('#flowView .security-track-status'),maps.securityTrack,'quote-track');
      }
      if(route.type==='stock-workbench')add(document.querySelector('#workspace-panel'),maps[route.tab==='holdings'?'holdings':route.tab==='triggers'?'triggers':'watch'],'workspace');
      if(route.type==='tasks')add(document.querySelector('#flowView .flow-page-head'),maps.tasks,'tasks','after');
      if(['events','theme-feed'].includes(route.type))add(document.querySelector('#flowView .flow-page-head'),maps.events,'events','after');
      if(['opportunities','brief-theme','theme-etfs'].includes(route.type)){
        add(document.querySelector('#flowView .flow-page-head'),route.type==='theme-etfs'||route.tab==='etfs'?maps.etfs:maps.opportunities,'opportunity','after');
      }
      add(document.querySelector('#flowView .etf-insight'),maps.etfInsight,'etf-insight');
      if(route.type.startsWith('evening-'))add(document.querySelector('#flowView .flow-page-head'),note('assist','AI 撰写复盘观点，数据提供事实依据','行情、涨跌和资金数字按来源展示；AI 归纳变化、解释含义并标明推断。',['盘面解读分析','市场点评与事件解读'],'市场解读陪伴助手'),'evening','after');
      const box=document.querySelector('#assistantContent');
      let assistant=maps.assistant;
      if(box.querySelector('#securityTrackForm'))assistant=maps.securityTrack;
      else if(box.querySelector('#eventTrackForm'))assistant=maps.track;
      else if(box.querySelector('.flow-success-mark'))assistant=maps.tasks;
      else if(box.querySelector('.review-capability')){
        const capability=box.querySelector('.review-capability');
        const direct=capability.querySelector('summary')?.textContent.includes('直接查询');
        const skills=capability.querySelector('dd')?.textContent.split('、')||[];
        const expert=capability.querySelector('summary')?.textContent.replace('专家解读示意 · ','');
        assistant=note(direct?'assist':'ai',direct?'这次直接用查询 Skill，无需专家接力':'这次由专项专家参与解读',direct?'闪电猫查询并整理现有公告资料；原文和日期由数据源提供。':'闪电猫带入当前问题和资料，专家分析后组织带出处的回答。',skills,direct?'闪电猫·全能金融投研专家':expert);
      }
      add(box,assistant,'assistant');
      for(const el of document.querySelectorAll('[data-presentation-note]'))if(!wanted.has(el.dataset.presentationNote))el.remove();
    }finally{observe();}
  }
  function schedule(){if(frame)return;frame=requestAnimationFrame(()=>{frame=0;render();});}
  toggle.addEventListener('click',()=>{
    enabled=!enabled;
    const url=new URL(location.href);
    if(enabled)url.searchParams.set('annotate','1');else url.searchParams.delete('annotate');
    history.replaceState(history.state,'',url);
    render();
  });
  window.addEventListener('popstate',()=>{enabled=new URL(location.href).searchParams.get('annotate')==='1';schedule();});
  window.addEventListener('hashchange',schedule);
  render();
})();
