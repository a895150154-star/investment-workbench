/* V2.36 — shared explicit preferences, optional onboarding and local behavior memory. */
(() => {
  const KEY='vra-prototype-profile-memory-v1';
  const labels={general:'综合解读',business:'经营兑现',events:'事件进展'};
  const stocks=[...briefItems.map(x=>({name:x.company,code:x.code,id:x.id})),{name:'海光信息',code:'',id:'2490095'},{name:'中船特气',code:'',id:'2490104'}];
  const industries=['光模块','半导体','端侧算力','半导体材料'];
  const split=text=>[...new Set(text.split(/[\s,，、;；]+/).map(x=>x.trim()).filter(Boolean))];
  const day=()=>beijingClock().slice(0,10);
  const fresh=(d,today=day())=>/^\d{4}-\d{2}-\d{2}$/.test(d)&&d<=today&&d>=shiftedDate(today,-6);
  let memory={status:'new',enabled:true,events:[],dismissed:{},origins:{},lastPrompt:'',methodEvents:[],methodDismissed:{}};
  try {const x=JSON.parse(localStorage.getItem(KEY));if(x&&typeof x==='object')memory={...memory,...x,events:Array.isArray(x.events)?x.events.filter(e=>stocks.some(s=>s.name===e.name)&&['ask','view'].includes(e.kind)&&fresh(e.day)):[],dismissed:x.dismissed||{},origins:x.origins||{}};}catch{}
  memory.methodEvents=Array.isArray(memory.methodEvents)?memory.methodEvents.filter(x=>researchMethods.normalize([x]).length&&fresh(x.day)):[];
  memory.methodDismissed=memory.methodDismissed&&typeof memory.methodDismissed==='object'?memory.methodDismissed:{};
  let draft=null,step=0,mode='first',returnFromHoldings=false,returnFocus=null;
  function save(next=memory,prefs=null){
    let oldMemory,oldPrefs;
    try {oldMemory=localStorage.getItem(KEY);oldPrefs=localStorage.getItem(BRIEF_PREFS_KEY);if(prefs)localStorage.setItem(BRIEF_PREFS_KEY,JSON.stringify(prefs));localStorage.setItem(KEY,JSON.stringify(next));}
    catch {try {oldMemory===null?localStorage.removeItem(KEY):localStorage.setItem(KEY,oldMemory);oldPrefs===null?localStorage.removeItem(BRIEF_PREFS_KEY):localStorage.setItem(BRIEF_PREFS_KEY,oldPrefs);}catch{}toast('保存失败，请保留当前页面并重试');return false;}
    memory=next;if(prefs){briefPrefs=prefs;window.dispatchEvent(new Event('research-profile-saved'));}return true;
  }
  function refresh(){
    const readingPosition=window.workbenchClient.desktop?window.scrollY:null;
    const guide=window.briefGuide?.capture();
    refreshBrief(true);
    if(activeView==='brief'&&selectedIssue){
      const box=$('#assistantContent'),nodes=[...box.childNodes],scroll=box.scrollTop;
      showBrief(selectedIssue.id);
      if(guide)window.briefGuide.restore(guide);
      else box.replaceChildren(...nodes);
      box.scrollTop=scroll;
    }
    if(readingPosition!==null)window.scrollTo({top:readingPosition,behavior:'instant'});
  }
  function events(name,kind){return memory.enabled?memory.events.filter(e=>e.name===name&&e.kind===kind&&fresh(e.day)):[];}
  function eligible(name,today=day()){
    return memory.enabled&&!split(briefPrefs.targets).includes(name)&&!memory.dismissed[name]&&memory.lastPrompt!==today&&new Set(memory.events.filter(e=>e.name===name&&e.kind==='ask'&&fresh(e.day,today)).map(e=>e.day)).size>=3;
  }
  function record(name,kind){
    if(!memory.enabled||!stocks.some(s=>s.name===name))return;
    const today=day();if(memory.events.some(e=>e.name===name&&e.kind===kind&&e.day===today))return;
    save({...memory,events:[...memory.events.filter(e=>fresh(e.day)),{name,kind,day:today}].slice(-140)});
  }
  function relations(name){
    if(!briefPrefs.scopes.includes('recent')||!memory.enabled)return [];
    return [['ask','近期提问','向闪电猫提问'],['view','近期浏览','打开标的详情']].filter(([k])=>events(name,k).length).map(([k,label,action])=>({label,text:'近七天曾'+action+'；这是近期记录，尚不代表长期关注。'}));
  }
  function suggest(name){
    if(!eligible(name)||$('#memorySuggestion'))return;
    if(!save({...memory,lastPrompt:day()}))return;
    $('#assistantContent').insertAdjacentHTML('beforeend',`<section id="memorySuggestion" class="memory-suggestion" aria-label="长期关注建议"><small>由你确认，再记住</small><h3>以后也关注${esc(name)}吗？</h3><p>近一周，你在三个不同日期问过它。设为长期关注后，个人简报会优先呈现相关资料。</p><div><button class="button primary" data-memory-accept="${esc(name)}">设为长期关注</button><button class="button" data-memory-dismiss="${esc(name)}">暂不需要</button></div><small>不加入自选，也不创建订阅。可随时在研究偏好中移除。</small></section>`);
  }
  function afterAsk(name){if(!name)return;record(name,'ask');const item=stocks.find(s=>s.name===name);const personal=window.briefPersonalization;if(item&&personal){$('#assistantContent .profile-answer-focus')?.remove();$('#assistantContent .brief-answer')?.insertAdjacentHTML('beforebegin',`<div class="profile-answer-focus"><strong>按你的「${personal.focusLabel()}」继续看</strong>${esc(personal.reading(item.id))}${researchRisk.note(item.id)}</div>`);}suggest(name);}
  window.researchProfile={learningState:()=>structuredClone({enabled:memory.enabled,lastPrompt:memory.lastPrompt,methodEvents:memory.methodEvents,methodDismissed:memory.methodDismissed}),updateLearning:(patch,prefs=null)=>save({...memory,...patch},prefs),relations,eligible,record,open:openManager,onboard:()=>open(memory.status==='new'?'first':'revisit'),source:name=>memory.origins[name]?.source||'你在简报定制中主动指定'};
  const ask=briefAsk;briefAsk=function(id,...args){const result=ask(id,...args);afterAsk(briefItems.find(x=>x.id===id)?.company);return result;};
  const editorial=editorialAsk;editorialAsk=function(key,...args){const result=editorial(key,...args);afterAsk(stocks.find(x=>x.name===context?.company)?.name);return result;};
  const quote=briefQuote;briefQuote=function(name,...args){const result=quote(name,...args);record(opportunitySecurity(name)?.name,'view');return result;};
  // Record a submitted question, never keystrokes, and only exact known identities.
  $('#chatForm').addEventListener('submit',()=>{
    if(context?.kind==='brief-customization')return;
    const text=$('#chatInput').value.trim();if(!text)return;
    const named=stocks.filter(x=>text.includes(x.name)||(x.code&&text.includes(x.code)));
    const names=named.length?named.map(x=>x.name):stocks.filter(x=>x.name===context?.company).map(x=>x.name);
    queueMicrotask(()=>{names.forEach(n=>record(n,'ask'));const candidate=names.find(n=>eligible(n));if(candidate)suggest(candidate);});
  },true);
  function selectedHTML(){return draft.targets.length?draft.targets.map(n=>`<button type="button" class="profile-chip selected" data-profile-remove="${esc(n)}" aria-label="移除关注 ${esc(n)}">${esc(n)} <span aria-hidden="true">×</span></button>`).join(''):'<span class="profile-empty">还没有选择，可以稍后补充。</span>';}
  function chip(name,code=''){return `<button type="button" class="profile-chip ${draft.targets.includes(name)?'selected':''}" data-profile-target="${esc(name)}" aria-pressed="${draft.targets.includes(name)}">${esc(name)}${code?` <small>${esc(code)}</small>`:''}</button>`;}
  function render(resetScroll=false){
    const d=$('#profileDialog');
    const headings=['你更接近哪类投资者？','最近重点关注什么？','要结合你的持仓看吗？'];
    const bodies=[
      `<p class="profile-lead">帮助闪电猫用更适合你的方式分析市场和回答问题。可以跳过，之后随时调整。</p><div class="profile-focus-options" role="group" aria-label="投资习惯">${['short','swing','long'].map(v=>`<button type="button" data-profile-horizon="${v}" aria-pressed="${draft.investmentHorizon===v}" class="profile-focus ${draft.investmentHorizon===v?'selected':''}"><span><strong>${investmentHorizonChoices[v].label}</strong><small>${investmentHorizonChoices[v].description}</small></span><span class="profile-radio" aria-hidden="true">${draft.investmentHorizon===v?'●':'○'}</span></button>`).join('')}</div><button type="button" class="text-action profile-horizon-skip" data-profile-horizon="unset" aria-pressed="${draft.investmentHorizon==='unset'}">暂不设置投资习惯</button><section class="profile-risk-section"><h3 id="profileRiskTitle">你的风险偏好？<small>自述 · 可跳过</small></h3><div id="profileRiskOptions" class="profile-risk-options" role="group" aria-labelledby="profileRiskTitle">${['steady','balanced','active','unset'].map(v=>`<button type="button" data-profile-risk="${v}" aria-pressed="${draft.riskPreference===v}" class="profile-risk-option ${draft.riskPreference===v?'selected':''}">${researchRisk.choices[v].label}</button>`).join('')}</div><p class="profile-risk-effect" aria-live="polite">${researchRisk.description(draft.riskPreference)}</p><p class="profile-muted">这是你主动表达的偏好，不是风险承受能力测评。各选项都保留事实、来源与重要风险。</p></section>`,
      `<p class="profile-lead">主动选择的方向会记为长期关注，用于简报排序和追问引导。</p><label class="field"><span>搜索标的或方向</span><input id="profileSearch" placeholder="例如：新易盛、300502、半导体" autocomplete="off"></label><div id="profileSearchResults" class="profile-chip-list">${stocks.map(s=>chip(s.name,s.code)).join('')}</div><small class="profile-muted">当前可搜索本期样例标的与方向。</small><h3>关注方向</h3><div class="profile-chip-list">${industries.map(n=>chip(n)).join('')}</div><h3>已选择</h3><div class="profile-chip-list" id="profileSelected">${selectedHTML()}</div><p class="profile-muted">关注方向可随时在「我的研究偏好」中调整。</p>`,
      `${newcomerReward.banner()}<p class="profile-lead">可选：从已确认持仓开始诊断。没有持仓也能用样例个股免费体验，领取积分不要求上传持仓。</p>${holdingsStore.count()?`<div class="profile-holdings">${holdingsStore.identities().map(s=>`<div><strong>${esc(s.name)}</strong><small>${esc(s.code)}</small></div>`).join('')}</div><label class="profile-check"><input id="profileHoldings" type="checkbox" ${draft.scopes.includes('holdings')?'checked':''}>在个人简报中关联这些已确认持仓</label>`:'<div class="profile-no-holdings"><strong>还没有已确认的持仓</strong><p>可以用现有持仓入口添加，也可以先开始阅读。</p></div>'}<div class="profile-holding-actions"><button class="button" data-profile-holding="manual">手动添加持仓</button><button class="button" data-profile-holding="import">导入 Excel / CSV</button></div><p class="profile-muted">保存持仓后回到这里，选择是否关联。持仓保存在原有持仓清单中。</p>`
    ];
    d.innerHTML=`<div class="profile-top"><span>${icon('sparkles')} 用户薄画像 · 快速了解你</span><button class="text-action" data-profile-close>${mode==='first'?'跳过画像，直接体验':'关闭'}</button></div><div class="profile-layout"><div class="profile-main"><nav class="profile-steps" aria-label="画像步骤">${['投资习惯','关注方向','持仓关联'].map((s,i)=>`<button data-profile-step="${i}" aria-current="${step===i?'step':'false'}"><b>${i+1}</b>${s}</button>`).join('')}</nav><h2 id="profileTitle" tabindex="-1">${headings[step]}</h2>${bodies[step]}<div class="profile-error" id="profileError" role="alert"></div><footer class="profile-footer">${step?'<button class="button" data-profile-prev>上一步</button>':'<span></span>'}<button class="button primary" data-profile-next>${step===2?(mode==='first'?'保存并开始体验':'保存基础偏好'):'下一步'}</button></footer><p class="profile-muted">这里只填写基础信息；后续在「我的研究偏好」管理偏好与记忆。</p></div></div>`;
    if(resetScroll)d.scrollTop=0;
    $('#profileTitle').focus({preventScroll:true});
  }
  function open(which='first'){
    mode=which;step=0;returnFocus=document.activeElement;
    draft={investmentHorizon:briefPrefs.investmentHorizon,riskPreference:researchRisk.normalize(briefPrefs.riskPreference),targets:split(briefPrefs.targets),scopes:[...briefPrefs.scopes]};
    render(true);if(!$('#profileDialog').open)$('#profileDialog').showModal();
  }
  function close(experience=false){if(mode==='first'&&memory.status==='new'&&!save({...memory,status:'skipped'}))return;$('#profileDialog').close();returnFocus?.focus?.({preventScroll:true});if(experience&&mode==='first')window.firstResearchTask?.offer({skipped:true});}
  function commit(){
    const targets=draft.targets.join('、');if(targets.length>300){$('#profileError').textContent='关注方向过多，请减少后保存。';return;}
    const origins={...memory.origins},dismissed={...memory.dismissed};split(briefPrefs.targets).filter(n=>!draft.targets.includes(n)).forEach(n=>{dismissed[n]=day();delete origins[n];});draft.targets.forEach(n=>{if(!split(briefPrefs.targets).includes(n))origins[n]={source:'你在轻画像中主动选择',date:day()};});
    const next=normalizeBriefPrefs({...briefPrefs,methods:briefPrefs.methods,investmentHorizon:draft.investmentHorizon,riskPreference:draft.riskPreference,targets,scopes:draft.scopes});
    if(!save({...memory,status:'complete',enabled:memory.enabled,origins,dismissed},next))return;
    $('#profileDialog').close();refresh();researchMethods.refresh();if(mode==='first')home();
    if(mode==='first'){window.firstResearchTask?.offer();return;}
    toast('基础偏好已保存；后续可在“我的研究偏好”管理。');
  }
  // A separate management surface, sharing the same preferences and memory stores.
  let management=null,managementTab='preferences',managementReturn=null;
  const managerDialog=()=>$('#researchPreferencesDialog');
  function openManager(){
    management={prefs:normalizeBriefPrefs(structuredClone(briefPrefs)),memory:structuredClone(memory)};
    managementTab='preferences';managementReturn=document.activeElement;
    renderManager();managerDialog().showModal();
  }
  function closeManager(){managerDialog().close();management=null;managementReturn?.focus?.({preventScroll:true});}
  function managerPreferences(){
    const p=management.prefs,targets=split(p.targets);
    return `<div class="preferences-grid"><section class="preferences-section"><h3>基础偏好</h3><p>决定简报与助手的默认阅读侧重。</p><label class="field"><span>投资习惯</span><select data-pref-field="investmentHorizon">${['unset','short','swing','long'].map(id=>`<option value="${id}" ${p.investmentHorizon===id?'selected':''}>${investmentHorizonChoices[id].label}</option>`).join('')}</select></label><label class="field"><span>研究内容侧重 · 可选</span><select data-pref-field="focus">${Object.entries(labels).map(([id,label])=>`<option value="${id}" ${p.focus===id?'selected':''}>${label}</option>`).join('')}</select></label><label class="field"><span>风险偏好 · 自述</span><select data-pref-field="riskPreference">${Object.entries(researchRisk.choices).map(([id,item])=>`<option value="${id}" ${p.riskPreference===id?'selected':''}>${item.label}</option>`).join('')}</select></label><p class="profile-muted">随时修改，不根据浏览或提问推断风险承受能力。</p><h4>内容关联</h4>${[['watchlist','关联已有自选'],['holdings','关联已确认持仓'],['recent','关联近期浏览与提问']].map(([key,label])=>`<label class="profile-check"><input type="checkbox" data-pref-scope="${key}" ${p.scopes.includes(key)?'checked':''}>${label}</label>`).join('')}<p class="profile-muted">这里仅设置是否关联；自选和持仓仍在原有股票工作台管理。</p></section><section class="preferences-section"><h3>长期关注</h3><p>你主动选择或确认的公司、行业与主题。</p><div class="preferences-targets">${targets.map(n=>`<div class="preferences-target-row"><span><strong>${esc(n)}</strong><small>${esc(management.memory.origins[n]?.source||'你在简报定制中主动指定')}</small></span><button class="text-action" data-pref-remove-target="${esc(n)}" aria-label="移除长期关注 ${esc(n)}">移除</button></div>`).join('')||'<p class="preferences-empty">还没有长期关注。可直接添加，也可在助手建议后确认。</p>'}</div><label class="field"><span>添加关注方向</span><input id="preferencesTarget" maxlength="80" placeholder="公司、行业或主题；多个用顿号分隔"></label><button class="button" data-pref-add-target>添加到草稿</button><p class="profile-muted">移除后仍可能因持仓、自选或近期记录看到相关资料。</p></section></div><section class="preferences-section"><h3>已确认的研究重点</h3><p>只有经过你确认的内容才在这里；待确认线索在“近期线索”中查看。</p>${p.methods.map(x=>`<div class="preferences-method-row"><label class="field"><span>${esc(x.scope)} <small>你已确认${x.confirmedAt?' · '+esc(x.confirmedAt):''}</small></span><select data-pref-method="${esc(x.scope)}">${Object.entries(researchMethods.choices).map(([key,c])=>`<option value="${key}" ${key===x.key?'selected':''}>${esc(c.label)}</option>`).join('')}</select></label><button class="text-action" data-pref-remove-method="${esc(x.scope)}">移除偏好</button></div>`).join('')||'<p class="preferences-empty">尚未确认研究重点。正常提问即可，助手会在合适的时候询问。</p>'}<p class="profile-muted">只作用于对应范围的简报重点与研究分工，本次明确要求始终优先。</p></section>`;
  }
  function managerSignals(){
    const m=management.memory,ev=m.methodEvents.filter(x=>researchMethods.supportedSignal(x)&&fresh(x.day)),keys=[...new Set(ev.map(researchMethods.signature))];
    const behavior=m.events.filter(x=>fresh(x.day)),names=[...new Set(behavior.map(x=>x.name))];
    return `<section class="preferences-section"><h3>提问中的研究线索 <span class="preferences-status">尚未成为画像</span></h3><p>保留最近七个北京时间自然日。同类问题在不同日期反复出现后，助手才会询问；未经确认，不改变长期偏好。</p>${keys.map(key=>{const x=ev.find(x=>researchMethods.signature(x)===key);return `<article class="preferences-signal"><div><strong>${esc(x.scope)} · ${esc(researchMethods.choices[x.key].signal)}</strong><button class="text-action" data-pref-forget-method="${esc(key)}">删除线索</button></div><small>${ev.filter(x=>researchMethods.signature(x)===key).length} 个日期 · 关键词归类，等待确认</small>${researchMethods.evidenceHTML(x,ev)}</article>`;}).join('')||'<p class="preferences-empty">暂无有提问依据的近期研究线索。</p>'}${m.methodEvents.some(x=>!researchMethods.supportedSignal(x))?'<p class="profile-muted">旧版线索缺少提问依据，已停止用于推断。</p><button class="text-action" data-pref-clear-legacy>清除旧版无依据线索</button>':''}</section><section class="preferences-section"><h3>近期浏览与提问</h3><p>表示最近使用过的标的，不代表持仓或长期关注。</p>${names.map(name=>`<div class="preferences-target-row"><span><strong>${esc(name)}</strong><small>${behavior.filter(x=>x.name===name&&x.kind==='ask').length} 天提问 · ${behavior.filter(x=>x.name===name&&x.kind==='view').length} 天浏览</small></span><button class="text-action" data-pref-forget-stock="${esc(name)}">删除记录</button></div>`).join('')||'<p class="preferences-empty">暂无近期浏览或提问记录。</p>'}</section>`;
  }
  function managerMemory(){
    const m=management.memory,stockKeys=Object.keys(m.dismissed),methodKeys=Object.keys(m.methodDismissed);
    return `<section class="preferences-section"><h3>记忆设置</h3><label class="preferences-toggle"><span><strong>使用近期浏览与提问帮助了解我</strong><small>记录近期线索，在合适的时候询问是否记为长期偏好。</small></span><input type="checkbox" data-pref-enabled ${m.enabled?'checked':''}></label><p class="profile-muted">关闭后停止采集与主动建议；已确认偏好仍保留。已有线索可在“近期线索”中删除。</p><p>研究线索保留七天，同类问题在三个不同日期出现后可触发确认；每天最多主动询问一次。原型规则可调整。</p></section><section class="preferences-section"><h3>已暂缓的建议</h3><p>你拒绝过的同条建议不会反复出现。恢复后，仍需满足触发条件。</p>${stockKeys.map(name=>`<div class="preferences-target-row"><span><strong>${esc(name)}</strong><small>长期关注建议</small></span><button class="text-action" data-pref-resume-stock="${esc(name)}">允许再次建议</button></div>`).join('')}${methodKeys.map(key=>{const [scope,kind]=key.split('|');return `<div class="preferences-target-row"><span><strong>${esc(scope)}</strong><small>${esc(researchMethods.choices[kind]?.label||'研究偏好建议')}</small></span><button class="text-action" data-pref-resume-method="${esc(key)}">允许再次询问</button></div>`;}).join('')}${!stockKeys.length&&!methodKeys.length?'<p class="preferences-empty">暂无暂缓建议。</p>':''}</section>`;
  }
  function renderManager(message=''){
    const tabs=[['preferences','研究偏好','已确认并生效的选择'],['signals','近期线索','待观察、待确认'],['memory','记忆设置','开关与暂缓建议']];
    managerDialog().innerHTML=`<header class="preferences-head"><div><span class="eyebrow">个人设置</span><h2 id="preferencesTitle">我的研究偏好</h2><p>查看已有偏好、管理使用中积累的记忆。</p></div><button class="icon-button" data-pref-close aria-label="关闭研究偏好管理">${icon('x')}</button></header><div class="preferences-layout"><nav class="preferences-nav" aria-label="研究偏好管理栏目">${tabs.map(([key,title,desc])=>`<button data-pref-tab="${key}" aria-current="${key===managementTab?'page':'false'}"><strong>${title}</strong><small>${desc}</small></button>`).join('')}</nav><div class="preferences-content" id="preferencesPanel" tabindex="-1">${managementTab==='preferences'?managerPreferences():managementTab==='signals'?managerSignals():managerMemory()}</div></div><footer class="preferences-footer"><div><p id="preferencesStatus" role="status">${esc(message||'修改与删除暂存为草稿，保存后生效。')}</p><small>与个人简报共用偏好 · 仅保存在当前浏览器</small></div><button class="button" data-pref-close>取消</button><button class="button primary" data-pref-save>保存修改</button></footer>`;
  }
  function saveManager(){
    const readingPosition=window.workbenchClient.desktop?window.scrollY:null;
    const p=normalizeBriefPrefs(management.prefs),m=structuredClone(management.memory);
    if(p.targets.length>300){$('#preferencesStatus').textContent='关注方向过多，请减少后保存。';return;}
    const before=split(briefPrefs.targets),after=split(p.targets);
    before.filter(n=>!after.includes(n)).forEach(n=>{m.dismissed[n]=day();delete m.origins[n];});
    after.filter(n=>!before.includes(n)).forEach(n=>{m.origins[n]={source:'你在研究偏好中主动设置',date:day()};});
    briefPrefs.methods.filter(x=>!p.methods.some(y=>researchMethods.signature(x)===researchMethods.signature(y))).forEach(x=>{m.methodDismissed[researchMethods.signature(x)]=day();});
    if(!save(m,p)){$('#preferencesStatus').textContent='保存失败，草稿已保留，请重试。';return;}
    management={prefs:structuredClone(briefPrefs),memory:structuredClone(memory)};
    refresh();researchMethods.refresh();renderManager('已保存。简报与助手将使用这份偏好。');
    $('#preferencesPanel').scrollTop=0;
    if(readingPosition!==null)window.scrollTo({top:readingPosition,behavior:'instant'});
  }
  function initializeManager(){
    const d=document.createElement('dialog');d.id='researchPreferencesDialog';d.setAttribute('aria-labelledby','preferencesTitle');document.body.append(d);
    d.addEventListener('cancel',e=>{e.preventDefault();closeManager();});
    d.addEventListener('change',e=>{
      if(!management)return;const t=e.target,p=management.prefs;
      if(t.dataset.prefField)p[t.dataset.prefField]=t.value;
      if(t.dataset.prefScope)p.scopes=t.checked?[...new Set([...p.scopes,t.dataset.prefScope])]:p.scopes.filter(x=>x!==t.dataset.prefScope);
      if(t.dataset.prefMethod)p.methods=p.methods.map(x=>x.scope===t.dataset.prefMethod?{...x,key:t.value,confirmedAt:day()}:x);
      if(t.hasAttribute('data-pref-enabled'))management.memory.enabled=t.checked;
    });
    d.addEventListener('click',e=>{
      const b=e.target.closest('button');if(!b||!management)return;
      if(b.hasAttribute('data-pref-close')){closeManager();return;}
      if(b.hasAttribute('data-pref-save')){saveManager();return;}
      const p=management.prefs,m=management.memory;
      if(b.dataset.prefTab){managementTab=b.dataset.prefTab;renderManager();return;}
      if(b.hasAttribute('data-pref-add-target')){const value=$('#preferencesTarget').value.trim();if(!value)return;const next=[...new Set([...split(p.targets),...split(value)])].join('、');if(next.length>300){$('#preferencesStatus').textContent='关注方向过多，请减少后添加。';return;}p.targets=next;}
      if(b.dataset.prefRemoveTarget)p.targets=split(p.targets).filter(n=>n!==b.dataset.prefRemoveTarget).join('、');
      if(b.dataset.prefRemoveMethod)p.methods=p.methods.filter(x=>x.scope!==b.dataset.prefRemoveMethod);
      if(b.dataset.prefForgetMethod)m.methodEvents=m.methodEvents.filter(x=>researchMethods.signature(x)!==b.dataset.prefForgetMethod);
      if(b.dataset.prefForgetStock)m.events=m.events.filter(x=>x.name!==b.dataset.prefForgetStock);
      if(b.hasAttribute('data-pref-clear-legacy'))m.methodEvents=m.methodEvents.filter(researchMethods.supportedSignal);
      if(b.dataset.prefResumeStock)delete m.dismissed[b.dataset.prefResumeStock];
      if(b.dataset.prefResumeMethod)delete m.methodDismissed[b.dataset.prefResumeMethod];
      renderManager();
    });
  }

  function initialize(){
    initializeManager();
    const dialog=document.createElement('dialog');dialog.id='profileDialog';dialog.setAttribute('aria-labelledby','profileTitle');document.body.append(dialog);
    dialog.addEventListener('cancel',e=>{e.preventDefault();close();});
    $('.design-strip b').textContent='V2.37';
    const previousNotes=designNotes;designNotes=function(){previousNotes();$('#modalTitle').textContent='V2.36 · 评审说明';$('#modalBody').insertAdjacentHTML('afterbegin','<section><h3>轻画像与记忆</h3><p>首次轻画像与简报定制共用偏好。近期行为保留七天，三个不同日期提问同一标的后，由用户确认是否长期关注；每天最多提示一次。</p><button class="button" data-profile-demo>查看记忆确认交互示例</button><p class="flow-small">交互示例不写入你的实际偏好。</p></section>');};$('#designNotes').onclick=designNotes;
    $('.sidebar nav').insertAdjacentHTML('beforeend',`<button class="nav-item" data-profile-open aria-label="我的研究偏好" title="我的研究偏好">${icon('sliders-horizontal')}我的研究偏好</button>`);
    const previousSave=saveBriefPreferences;
    saveBriefPreferences=function(event){const previous=briefPrefs;previousSave(event);if(previous===briefPrefs)return;window.dispatchEvent(new Event('research-profile-saved'));const removed=split(previous.targets).filter(n=>!split(briefPrefs.targets).includes(n));if(removed.length){const dismissed={...memory.dismissed},origins={...memory.origins};removed.forEach(n=>{dismissed[n]=day();delete origins[n];});save({...memory,dismissed,origins});}};
    const originalRender=renderBriefPreferences;
    renderBriefPreferences=function(d){originalRender(d);$('#briefPreferencesForm').insertAdjacentHTML('afterbegin','<p class="profile-shared-note">与首次画像共用投资习惯、风险偏好和关注方向。<button type="button" class="text-action" data-profile-open>管理研究偏好与记忆</button></p>');};
    document.addEventListener('click',e=>{
      const b=e.target.closest('button');if(!b)return;
      if(b.hasAttribute('data-profile-open'))openManager();
      if(b.hasAttribute('data-profile-onboarding'))open(memory.status==='new'?'first':'revisit');
      if(b.hasAttribute('data-profile-demo'))openModal('记忆确认 · 交互示例','<p class="flow-small">演示情境：近一周在三个不同日期提问新易盛。以下操作不写入实际偏好。</p><section class="memory-suggestion"><small>由你确认，再记住</small><h3>以后也关注新易盛吗？</h3><p>设为长期关注后，个人简报会优先呈现相关资料。</p><div><button class="button primary" data-profile-demo-answer="yes">设为长期关注</button><button class="button" data-profile-demo-answer="no">暂不需要</button></div></section><p id="memoryDemoResult" role="status"></p>');
      if(b.dataset.profileDemoAnswer){$('#memoryDemoResult').textContent=b.dataset.profileDemoAnswer==='yes'?'演示结果：确认后记为长期关注，可随时移除；不加入自选或创建订阅。':'演示结果：不写入长期关注，暂缓这个标的的建议；可在研究偏好中恢复。';$('#modalBody .memory-suggestion').remove();}

      if(b.hasAttribute('data-profile-close'))close(true);

      if(b.dataset.profileStep!==undefined){step=Number(b.dataset.profileStep);render(true);}
      if(b.dataset.profileRisk){draft.riskPreference=b.dataset.profileRisk;render();$('#profileRiskOptions [aria-pressed=true]')?.focus({preventScroll:true});}
      if(b.dataset.profileHorizon){draft.investmentHorizon=b.dataset.profileHorizon;render();$('#profileDialog [data-profile-horizon="'+draft.investmentHorizon+'"]').focus({preventScroll:true});}
      const name=b.dataset.profileTarget||b.dataset.profileRemove;
      if(name){draft.targets=draft.targets.includes(name)?draft.targets.filter(n=>n!==name):[...draft.targets,name];render();}
      if(b.hasAttribute('data-profile-prev')){step--;render(true);}
      if(b.hasAttribute('data-profile-next')){if(step<2){step++;render(true);}else commit();}
      if(b.dataset.profileHolding){returnFromHoldings=true;dialog.close();const trigger=document.createElement('button');trigger.hidden=true;trigger.dataset[b.dataset.profileHolding==='manual'?'holdingManual':'holdingImport']='';document.body.append(trigger);trigger.click();trigger.remove();}
      if(b.hasAttribute('data-profile-done'))closeModal();
      if(b.dataset.profileRead){closeModal();window.firstResearchTask?.offer();}
      if(b.dataset.memoryAccept){const n=b.dataset.memoryAccept,targets=[...new Set([...split(briefPrefs.targets),n])].join('、');if(targets.length>300){toast('关注方向已满，请在研究偏好中调整');return;}const prefs=normalizeBriefPrefs({...briefPrefs,targets});if(save({...memory,origins:{...memory.origins,[n]:{source:'你确认了助手的长期关注建议',date:day()}}},prefs)){$('#memorySuggestion').innerHTML='<strong>已记为长期关注</strong><p>个人简报会优先展示相关资料。可在「我的研究偏好」中移除。</p>';refresh();}}
      if(b.dataset.memoryDismiss){const n=b.dataset.memoryDismiss;if(save({...memory,dismissed:{...memory.dismissed,[n]:day()}}))$('#memorySuggestion').innerHTML='<p>已暂缓，不再重复建议这个标的。可在研究偏好中恢复。</p>';}
    });
    dialog.addEventListener('input',e=>{if(e.target.id!=='profileSearch')return;const term=e.target.value.trim().toLowerCase(),results=[...stocks,...industries.map(name=>({name,code:''}))].filter(s=>(s.name+s.code).toLowerCase().includes(term));$('#profileSearchResults').innerHTML=results.length?results.map(s=>chip(s.name,s.code)).join(''):'<span class="profile-empty">当前样例里没有找到，可选择下方已有方向。</span>';});
    dialog.addEventListener('change',e=>{const id=e.target.id,key=id==='profileHoldings'?'holdings':null;if(key)draft.scopes=e.target.checked?[...new Set([...draft.scopes,key])]:draft.scopes.filter(s=>s!==key);});
    $('#modal').addEventListener('close',()=>{if(!returnFromHoldings)return;returnFromHoldings=false;step=2;render();dialog.showModal();});
    const forced=new URLSearchParams(location.search).get('onboarding')==='1';
    if(forced){const url=new URL(location.href);url.searchParams.delete('onboarding');history.replaceState(history.state,'',url);}
    if(forced||(memory.status==='new'&&route.type==='overview'))open();
  }
  document.addEventListener('DOMContentLoaded',initialize);
})();
