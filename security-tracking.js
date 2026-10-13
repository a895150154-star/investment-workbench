/* Review prototype only: confirmed local settings; no data polling, calculations or notifications. */
(() => {
  const storageKey = 'vra-prototype-security-tracking-v1';
  const categories = ['量价', '基本面', '资金', '指标'];
  const frequencies = ['仅提醒一次', '每个交易日最多一次', '每次满足条件时提醒'];
  const boundary = '原型状态：仅保存本地设置，尚未运行后台监控、指标计算和通知。';
  const rulesFor = q => [
    {id:'price-up',category:'量价',label:'价格达到或高于',unit:'元',min:0,positive:true},
    {id:'price-down',category:'量价',label:'价格达到或低于',unit:'元',min:0,positive:true},
    {id:'turnover',category:'量价',label:'当日换手率达到或高于',unit:'%',min:0,positive:true},
    ...(q.type==='etf' ? [
      {id:'index-change',category:'基本面',label:'跟踪指数成分调整公告'},
      {id:'fund-report',category:'基本面',label:'基金定期报告发布'},
      {id:'fund-risk',category:'基本面',label:'基金风险提示公告',note:'清盘、暂停申赎、异常溢价等基金风险公告'},
      {id:'shares-up',category:'资金',label:'基金份额单日净增加达到或高于',unit:'万份',min:0,positive:true}
    ] : [
      {id:'earnings',category:'基本面',label:'业绩预告或定期报告发布'},
      {id:'major-risk',category:'基本面',label:'重大风险公告',note:'退市风险警示、重大诉讼、债务违约等公司风险公告'},
      {id:'business-progress',category:'基本面',label:'经营进展公告',note:'公司披露重大订单、项目投产或客户合作进展'},
      {id:'profit-growth',category:'基本面',label:'扣非净利润 TTM 同比低于',unit:'%'},
      {id:'inflow',category:'资金',label:'当日主力净流入达到或高于',unit:'万元',min:0,positive:true}
    ]),
    {id:'macd',category:'指标',label:'日线 MACD 金叉',note:'DIF 上穿 DEA；参数 12 / 26 / 9，仅定义条件'},
    {id:'rsi',category:'指标',label:'日线 RSI(14) 低于',unit:'',min:0,max:100,note:'取值范围 0–100，仅定义条件'}
  ];
  let saved = {};
  // Imported holdings may have no quote fixture. Keep only the user-confirmed
  // identity with the rule; never invent a quote, company profile or source.
  function localIdentity(value,key) {
    return value && value.code===key && /^\d{6}$/.test(key) && typeof value.name==='string' && value.name.trim() && value.name.length<=80 && ['stock','etf'].includes(value.type)
      ? {code:key,name:value.name.trim(),type:value.type,localOnly:true} : null;
  }
  function securityFor(key) {return opportunitySecurity(key)||localIdentity(saved[key]?.security,key);}
  try {
    const value = JSON.parse(localStorage.getItem(storageKey) || '{}');
    if (value && typeof value === 'object' && !Array.isArray(value)) {
      for (const [key, item] of Object.entries(value)) {
        const q = opportunitySecurity(key)||localIdentity(item?.security,key);
        if (q && item && frequencies.includes(item.frequency) && Array.isArray(item.conditions) && item.conditions.length && item.conditions.every(c => {
          const rule = rulesFor(q).find(r => r.id === c?.id);
          return rule && (!Object.hasOwn(rule,'unit') || validThreshold(rule,c.value));
        })) saved[key] = item;
      }
    }
  } catch { /* Unreadable state is never treated as confirmed. */ }
  function validThreshold(rule, value) {
    if (typeof value !== 'string' || !value.trim()) return false;
    const n = Number(value);
    return Number.isFinite(n) && (!rule.positive || n > 0) && (rule.min == null || n >= rule.min) && (rule.max == null || n <= rule.max);
  }
  function persist(next) {
    try { localStorage.setItem(storageKey,JSON.stringify(next)); saved=next; return true; }
    catch { return false; }
  }
  function describe(q, item) {
    return item.conditions.map(c => {
      const rule=rulesFor(q).find(r=>r.id===c.id);
      return rule.label+(Object.hasOwn(rule,'unit')?' '+c.value+' '+rule.unit:'');
    });
  }
  function status(q) {
    const key=opSecurityKey(q), item=saved[key];
    return `<section class="security-track-status" aria-label="标的追踪状态"><div class="security-track-top"><div><span class="eyebrow">标的追踪</span><h2>${item?'追踪已设置':'有变化时，让闪电猫提醒我'}</h2></div>${item?`<button class="button" data-security-track="${esc(key)}">修改设置</button><button class="text-action" data-security-stop="${esc(key)}">停止追踪</button>`:''}</div>${item?`<ul>${describe(q,item).map(s=>`<li>${esc(s)}</li>`).join('')}</ul><p>任一条件满足时提醒 · ${esc(item.frequency)} · ${esc(channelLabel(item))}</p>`:'<p>点击铃铛查看预选条件，可直接确认或添加其他条件。</p>'}<p class="security-boundary">${boundary}</p></section>`;
  }
  const originalQuote=briefQuote;
  briefQuote=function(company,issue) {
    originalQuote(company,issue);
    const q=opportunitySecurity(company); if(!q)return;
    const key=opSecurityKey(q), item=saved[key];
    $('#flowView .flow-page-head .flow-actions')?.insertAdjacentHTML('beforeend',`<button type="button" class="button security-bell ${item?'is-tracking':''}" data-security-track="${esc(key)}" aria-label="${item?'修改追踪':'设置追踪'}：${esc(q.name)}" title="${item?'修改追踪设置':'设置标的追踪'}">${icon('bell')}<span>${item?'已追踪':'追踪'}</span></button>`);
    $('#flowView .flow-page-head')?.insertAdjacentHTML('afterend',status(q));
  };
  const originalStockBody=stockBody;
  stockBody=function() {
    const html=originalStockBody(); if(stockTab!=='触发')return html;
    const template=document.createElement('template');template.innerHTML=html;
    const body=template.content.querySelector('.trigger-body');if(!body)return html;
    const eventHeading=[...body.querySelectorAll('.trigger-section-head h3')].find(el=>el.textContent==='监控中');
    if(eventHeading)eventHeading.textContent='个股事件追踪';
    const entries=Object.entries(saved);
    const section=`<section class="security-tracked-list" aria-label="已确认的标的追踪"><div class="trigger-section-head"><h3>标的追踪 · 已设置</h3><small>${entries.length} 项本地设置</small></div><p class="security-boundary">已保存追踪与今日实际触发分开。${boundary}</p>${entries.length?entries.map(([key,item])=>{const q=securityFor(key);return `<article class="trigger-entry"><div class="flow-meta">${badge('已确认 · 未运行','good')}<span>${q.type==='etf'?'ETF':'个股'} · ${esc(q.code||'代码未获取')}</span></div><h3>${esc(q.name)}</h3><p>${describe(q,item).map(esc).join('；')}<br>任一条件满足 · ${esc(item.frequency)} · ${esc(channelLabel(item))}</p>${q.localOnly?'<button class="text-action" data-flow="tasks">管理这条追踪 '+icon('arrow-up-right')+'</button><small class="security-boundary">本地持仓标的，行情与详情资料未接入。</small>':opLink('返回标的详情 '+icon('arrow-up-right'),opQuoteRoute(key,briefSnapshot().displayed.id),'text-action')}</article>`;}).join(''):'<p class="data-message">还没有确认的标的追踪。可在“订阅与提醒”新增，或从个股 / ETF 详情的铃铛开始。</p>'}</section>`;
    const eventSection=eventHeading?.parentElement;
    if(eventSection)eventSection.insertAdjacentHTML('beforebegin',section);else body.insertAdjacentHTML('beforeend',section);
    return template.innerHTML;
  };
  const reminderChannels=['工作台标记 + 消息提醒','仅工作台标记','工作台标记 + 消息提醒 + 声音'];
  const channelLabel=item=>item?.channel==='工作台内提醒'?'仅工作台标记':item?.channel||'仅工作台标记';
  function preset(q) {
    const rules=rulesFor(q),basic=q.type==='etf'?['fund-report','fund-risk']:['earnings','major-risk'];
    // Infer only non-numeric conditions explicitly saved on at least two other
    // securities of the same type. Never transfer prices or numeric thresholds.
    const counts={};
    for(const [key,item] of Object.entries(saved)){
      if(securityFor(key)?.type!==q.type)continue;
      for(const id of new Set(item.conditions.map(c=>c.id))){
        const r=rules.find(r=>r.id===id);if(r&&!Object.hasOwn(r,'unit')&&!basic.includes(id))counts[id]=(counts[id]||0)+1;
      }
    }
    const habit=Object.keys(counts).filter(id=>counts[id]>=2).sort((a,b)=>counts[b]-counts[a]||a.localeCompare(b)).slice(0,1);
    return {conditions:[...basic,...habit].map(id=>({id})),hasHabit:habit.length>0};
  }
  function configure(key,identity,options={}) {
    const q=securityFor(key)||localIdentity(identity,key);if(!q)return;
    const current=options.record||saved[key],rules=rulesFor(q),initial=current?null:preset(q);
    let draft=Object.fromEntries((current?.conditions||initial.conditions).map(c=>[c.id,{...c}]));
    const visible=new Set(Object.keys(draft)),remembered=JSON.parse(JSON.stringify(draft));
    let channel=current?channelLabel(current):reminderChannels[0];
    setContext({kind:'security-tracking',company:q.name,code:key,question:'设置标的追踪',source:'本地原型设置'});openAssistant();
    $('#assistantContent').innerHTML=`<h2 class="assistant-greeting">${current?'管理盯盘':'盯盘设置'}</h2><div class="bell-security"><strong>${esc(q.name)}</strong><span>${esc(q.code||'代码未获取')} · ${q.type==='etf'?'ETF':'个股'}</span></div><p class="assistant-copy">${current?'已带入上次保存的设置，可直接调整。':initial.hasHabit?'已准备基础条件，并带入你常用的提醒条件，可直接确认或调整。':'已为你预选'+(q.type==='etf'?'基金报告、风险提示':'业绩公告、重大风险')+'，可直接确认或调整。'}</p><form id="securityTrackForm" class="security-track-form bell-simple-form" novalidate><div class="bell-section-head"><strong>提醒条件 <small id="bellSelectedCount"></small></strong><button type="button" class="text-action" id="bellAddCondition">添加条件</button></div><div id="bellSelectedRules"></div><p class="bell-help">任一条件满足时提醒。</p><label class="field"><span>提醒频率</span><select name="frequency">${frequencies.map(f=>`<option ${f===(current?.frequency||'每个交易日最多一次')?'selected':''}>${f}</option>`).join('')}</select></label><div class="event-method"><span class="event-setting-label" id="bellMethodLabel">提醒方式</span><button type="button" id="bellReminderMethod" aria-haspopup="dialog" aria-labelledby="bellMethodLabel bellMethodValue"><span id="bellMethodValue">${esc(channel)}</span>${icon('chevron-down')}</button></div><p id="securityTrackError" class="flow-error" role="alert"></p><div class="security-form-actions"><button class="button primary" type="submit">${current?'保存修改':'确认追踪'}</button><button class="button" type="button" data-security-cancel>取消</button></div><p class="event-demo-note">${options.demo?'临时演示设置，刷新后重置；不会发送通知或播放声音。':'仅保存本地设置；不会发送通知或播放声音。'}</p></form>`;
    const form=$('#securityTrackForm');
    function description(r,c){return r.label+(Object.hasOwn(r,'unit')?' '+(c?.value||'待填写')+' '+r.unit:'');}
    function renderSelected(){
      $('#bellSelectedCount').textContent='('+Object.keys(draft).length+')';
      $('#bellSelectedRules').innerHTML=[...visible].map(id=>{const r=rules.find(r=>r.id===id);return `<div class="bell-selected-row"><label><input type="checkbox" data-bell-selected="${id}" ${draft[id]?'checked':''}><span>${esc(description(r,draft[id]||remembered[id]))}</span></label>${Object.hasOwn(r,'unit')&&draft[id]?`<button type="button" class="text-action" data-bell-edit="${id}">修改</button>`:''}</div>`;}).join('')||'<p class="bell-help">还没有条件，点击“添加条件”选择。</p>';
    }
    function openConditions(editId){
      let pending=JSON.parse(JSON.stringify(draft)),category=editId?rules.find(r=>r.id===editId).category:categories[0];
      openModal('添加提醒条件',`<form id="bellConditionForm" novalidate><p class="bell-picker-security">${esc(q.name)} <span>${esc(q.code||'')}</span></p><div class="security-categories" role="group" aria-label="条件类别">${categories.map(c=>`<button type="button" data-bell-category="${c}" aria-pressed="false">${c}</button>`).join('')}</div><div id="bellConditionOptions"></div><p id="bellConditionError" class="flow-error" role="alert"></p><div class="bell-picker-footer"><span id="bellPendingCount" aria-live="polite"></span><div class="flow-actions"><button type="submit" class="button primary">确认添加</button><button type="button" id="bellConditionCancel" class="button">取消</button></div></div></form>`,'标的追踪');
      const picker=$('#bellConditionForm');
      function render(){
        picker.querySelectorAll('[data-bell-category]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.bellCategory===category)));
        $('#bellConditionOptions').innerHTML=rules.filter(r=>r.category===category).map(r=>`<div class="security-rule ${pending[r.id]?'selected':''}"><label class="security-rule-label"><input type="checkbox" data-bell-rule="${r.id}" ${pending[r.id]?'checked':''}><span>${esc(r.label)}</span></label>${r.note?`<small>${esc(r.note)}</small>`:''}${Object.hasOwn(r,'unit')&&pending[r.id]?`<label class="field security-threshold"><span>阈值${r.unit?'（'+r.unit+'）':''}${r.positive?'，须大于 0':''}</span><input type="number" step="any" data-bell-value="${r.id}" aria-label="${esc(r.label)}阈值" value="${esc(pending[r.id].value||'')}" placeholder="请填写阈值"></label>`:''}</div>`).join('');
        $('#bellPendingCount').textContent='已选 '+Object.keys(pending).length+' 个条件';
      }
      picker.onclick=e=>{const b=e.target.closest('[data-bell-category]');if(b){category=b.dataset.bellCategory;render();}};
      picker.onchange=e=>{const id=e.target.dataset.bellRule;if(!id)return;if(e.target.checked)pending[id]={id,value:''};else delete pending[id];render();picker.querySelector('[data-bell-rule="'+id+'"]').focus();$('#bellConditionError').textContent='';};
      picker.oninput=e=>{const id=e.target.dataset.bellValue;if(id&&pending[id])pending[id].value=e.target.value;$('#bellConditionError').textContent='';};
      picker.addEventListener('wheel',()=>{if(picker.contains(document.activeElement)&&document.activeElement.type==='number')document.activeElement.blur();},{passive:true});
      $('#bellConditionCancel').onclick=closeModal;
      picker.onsubmit=e=>{
        e.preventDefault();const invalid=rules.find(r=>pending[r.id]&&Object.hasOwn(r,'unit')&&!validThreshold(r,pending[r.id].value));
        if(invalid){category=invalid.category;render();$('#bellConditionError').textContent='请填写有效的“'+invalid.label+'”阈值'+(invalid.positive?'（大于 0）':invalid.id==='rsi'?'（0–100）':'')+'。';picker.querySelector('[data-bell-value="'+invalid.id+'"]').focus();return;}
        draft=pending;Object.assign(remembered,JSON.parse(JSON.stringify(draft)));Object.keys(draft).forEach(id=>visible.add(id));renderSelected();$('#securityTrackError').textContent='';closeModal();
      };
      render();if(editId)picker.querySelector('[data-bell-value="'+editId+'"]').focus();
    }
    $('#bellAddCondition').onclick=()=>openConditions();
    form.onclick=e=>{const b=e.target.closest('[data-bell-edit]');if(b)openConditions(b.dataset.bellEdit);};
    form.onchange=e=>{const id=e.target.dataset.bellSelected;if(id){if(e.target.checked)draft[id]={...(remembered[id]||{id})};else{remembered[id]={...draft[id]};delete draft[id];}renderSelected();form.querySelector('[data-bell-selected="'+id+'"]').focus();}$('#securityTrackError').textContent='';};
    $('#bellReminderMethod').onclick=()=>{
      const options=reminderChannels.includes(channel)?reminderChannels:[channel,...reminderChannels];
      openModal('提醒方式',`<form id="bellMethodForm"><fieldset class="event-channel-options"><legend class="sr-only">选择提醒方式</legend>${options.map((c,i)=>`<label><input type="radio" name="channel" value="${i}" ${c===channel?'checked':''}><span>${esc(c)}</span></label>`).join('')}</fieldset><div class="flow-actions"><button type="submit" class="button primary">确定</button><button type="button" id="bellMethodCancel" class="button">取消</button></div></form>`,'标的追踪');
      $('#bellMethodCancel').onclick=closeModal;$('#bellMethodForm').onsubmit=e=>{e.preventDefault();channel=options[Number(e.currentTarget.elements.channel.value)];$('#bellMethodValue').textContent=channel;closeModal();};
    };
    form.onsubmit=e=>{
      e.preventDefault();const conditions=rules.filter(r=>draft[r.id]).map(r=>draft[r.id]),frequency=form.elements.frequency.value;
      if(!conditions.length){$('#securityTrackError').textContent='请至少选择一个提醒条件。';$('#bellAddCondition').focus();return;}
      const invalid=rules.find(r=>draft[r.id]&&Object.hasOwn(r,'unit')&&!validThreshold(r,draft[r.id].value));
      if(invalid){openConditions(invalid.id);return;}
      const record={...current,conditions,frequency,channel,...(q.localOnly?{security:{code:q.code,name:q.name,type:q.type}}:{})};
      if(!(options.onSave?options.onSave(record):persist({...saved,[key]:record}))){$('#securityTrackError').textContent='未能保存，请重试。原追踪设置未改变。';return;}
      if(!options.demo&&typeof trackingCenter!=='undefined')trackingCenter.activateMine();
      refresh(key);
      $('#assistantContent').innerHTML=`<div class="flow-success-mark">${icon('check')}</div><h2 class="assistant-greeting">追踪设置已保存</h2><p class="assistant-copy">${esc(q.name)}</p><ul class="security-saved-summary">${describe(q,record).map(s=>`<li>${esc(s)}</li>`).join('')}</ul><div class="event-saved-settings"><span>任一条件满足 · ${esc(frequency)}</span><span>${esc(channel)}</span></div><div class="flow-actions"><button class="button" ${options.demo?'data-tc-edit':'data-security-track'}="${esc(key)}">修改设置</button><button class="button primary" data-security-done="${esc(key)}">管理追踪</button></div><p class="event-demo-note">${options.demo?'临时演示设置，刷新后重置；不会发送通知或播放声音。':'仅保存本地设置；不会发送通知或播放声音。'}</p>`;
      $('#assistantContent').scrollTop=0;toast('追踪设置已保存');
    };
    if(options.demo)form.insertAdjacentHTML('beforebegin','<p class="event-demo-note">正在编辑临时演示设置，不会修改“我的设置”。</p>');
    if(current){const stop=document.createElement('button');stop.type='button';stop.className='text-action bell-stop';stop.textContent='停止该标的盯盘';stop.onclick=e=>{e.stopPropagation();if(options.onStop){options.onStop();closeAssistant();showTasks();}else{stop.dataset.securityStop=key;stop.onclick=null;stop.click();closeAssistant();}};form.append(stop);}
    renderSelected();$('#assistantContent').scrollTop=0;
  }
  function refresh(key) {
    if(route.type==='brief-quote'&&opSecurityKey(opportunitySecurity(route.code||route.company))===key)briefQuote(key,issueFromId(route.issueId)||briefSnapshot().displayed);
    renderWidgets();
    if(route.type==='tasks')showTasks();
  }
  window.securityTrackingView = {
    entries: () => Object.entries(saved).map(([key,item]) => ({key,item,security:securityFor(key),conditions:describe(securityFor(key),item)})),
    configure: (q,options) => configure(opSecurityKey(q),q,options),
    channelLabel
  };
  document.addEventListener('click',e=>{
    const start=e.target.closest('[data-security-track]');if(start){configure(start.dataset.securityTrack);return;}
    const stop=e.target.closest('[data-security-stop]');if(stop){
      const key=stop.dataset.securityStop,next={...saved};delete next[key];
      if(!persist(next)){toast('停止设置未能保存，请重试；原设置仍保留');return;}
      if(context?.kind==='security-tracking'&&context.code===key){context=null;assistantDefault();}
      refresh(key);toast('已停止该标的的原型追踪');return;
    }
    if(e.target.closest('[data-security-cancel]')){context=null;assistantDefault();closeAssistant();toast('已取消，原追踪设置未改变');return;}
    const done=e.target.closest('[data-security-done]');
    if(done){closeAssistant();taskTab='tasks';showTasks();const row=document.querySelector('[data-tracking-key="'+CSS.escape(done.dataset.securityDone)+'"]');row?.scrollIntoView({block:'nearest'});row?.focus({preventScroll:true});return;}
    if(e.target.closest('[data-security-open-triggers]')){
      closeAssistant();showReviewAccount('triggers');
    }
  });
  const previousNotes=$('#designNotes').onclick;
  $('#designNotes').onclick=function(...args){previousNotes?.apply(this,args);$('#modalBody').insertAdjacentHTML('afterbegin','<h3>V2.16 · 标的铃铛与指标追踪</h3><p>个股 / ETF 详情的铃铛由闪电猫承接设置，确认后本地保存，可修改或停止。股票卡片“触发”中分开展示今日触发示例、已确认标的追踪及事件追踪。</p><p class="sample-notice">'+boundary+'阈值由用户填写；保存不生成触发记录。</p>');};
})();
