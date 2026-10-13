/* V2.47: confirmed, scoped research habits. Fixed rules; no semantic model or remote memory. */
(() => {
  const choices={
    orders:{label:'优先关注订单与交付',signal:'询问订单与交付',steps:['关注客户、订单和交付证据'],skills:['basic','industry'],agent:'company'},
    cashflow:{label:'优先关注现金流',signal:'询问现金流',steps:['核对现金流与盈利质量'],skills:['financial'],agent:'company'},
    valuationFocus:{label:'优先关注估值',signal:'询问估值',steps:['核对估值口径与预期依据'],skills:['valuation'],agent:'company'},
    financialFocus:{label:'优先关注财务状况',signal:'询问财务状况',steps:['核对财报与数据缺口'],skills:['financial'],agent:'company'},
    eventFocus:{label:'优先关注事件进展',signal:'询问事件与公告进展',steps:['核对事件变化及后续公开进展'],skills:['news','event'],agent:'event'},
    business:{signal:'本次明确提出订单→现金流顺序',label:'先看订单兑现，再看现金流',steps:['核对客户、订单与交付','检查收入兑现与现金流'],skills:['basic','industry','financial'],agent:'company'},
    financial:{signal:'本次明确提出现金流→估值顺序',label:'先看现金流，再看估值',steps:['检查盈利质量与现金流','核对估值口径与预期'],skills:['financial','valuation'],agent:'company'},
    events:{signal:'本次明确提出事件→验证点顺序',label:'先看事件变化，再看验证点',steps:['核对公告与事件变化','列出后续验证与反证'],skills:['news','event'],agent:'event'}
  };
  const scopes=['新易盛','中际旭创','天孚通信','海光信息','中船特气','半导体','半导体材料','端侧算力','端侧芯片','光模块','光通信','算力互联'];
  const day=()=>beijingClock().slice(0,10);
  const valid=x=>x&&scopes.includes(x.scope)&&Object.hasOwn(choices,x.key);
  function normalize(items){return Array.isArray(items)?items.filter(valid).filter((x,i,a)=>a.findIndex(y=>y.scope===x.scope)===i).slice(0,scopes.length).map(x=>({scope:x.scope,key:x.key,confirmedAt:typeof x.confirmedAt==='string'?x.confirmedAt.slice(0,10):''})):[];}
  const signature=x=>x.scope+'|'+x.key;
  const state=()=>researchProfile.learningState();
  const fresh=d=>/^\d{4}-\d{2}-\d{2}$/.test(d)&&d<=day()&&d>=shiftedDate(day(),-6);
  const supportedSignal=x=>valid(x)&&typeof x.quote==='string'&&x.quote.length>0;
  function detect(id,text){
    if(/不要|不看|不是|别看|不想|不再|取消|删除/.test(text))return null;
    const sequence=/先[^。]*(订单|交付)[^。]*(再|然后)[^。]*现金流/.test(text)?'business':/先[^。]*现金流[^。]*(再|然后)[^。]*估值/.test(text)?'financial':/先[^。]*事件[^。]*(再|然后)[^。]*验证/.test(text)?'events':null;
    const hits=[[/订单|交付|经营兑现|业务兑现/,'orders'],[/现金流/,'cashflow'],[/估值/,'valuationFocus'],[/财务|财报/,'financialFocus'],[/事件|公告|进展/,'eventFocus']].filter(([re])=>re.test(text));
    // Ambiguous multi-focus questions remain task context, rather than fabricating a preference.
    const specific=hits.filter(([,key])=>key!=='eventFocus');
    const focused=specific.length?specific:hits;
    const key=sequence||(focused.length===1?focused[0][1]:null);
    const m=window.briefPersonalization?.metadata[id];if(!key||!m)return null;
    // A stock question does not imply a preference for its entire sector.
    const named=scopes.filter(x=>text.includes(x));
    const scope=named.filter(x=>m.topics.includes(x)).sort((a,b)=>b.length-a.length)[0]||m.name;
    return {scope,key,quote:text.slice(0,240),truncated:text.length>240,explicit:/习惯|(?:以后|每次|通常)[^。]*(?:优先|先看|重点|关注)/.test(text)};
  }
  function match(id){const m=window.briefPersonalization?.metadata[id];if(!m)return null;const all=normalize(briefPrefs.methods);return all.find(x=>x.scope===m.name)||all.filter(x=>m.topics.includes(x.scope)).sort((a,b)=>b.scope.length-a.scope.length)[0]||null;}
  function record(candidate){
    if(!candidate||!state().enabled)return;
    const s=state(),events=(s.methodEvents||[]).filter(x=>supportedSignal(x)&&fresh(x.day));
    if(!events.some(x=>signature(x)===signature(candidate)&&x.day===day()))events.push({scope:candidate.scope,key:candidate.key,day:day(),quote:candidate.quote,truncated:!!candidate.truncated});
    researchProfile.updateLearning({methodEvents:events.slice(-100)});
  }
  function canOffer(candidate,manual=false,s=state(),confirmed=briefPrefs.methods){
    if(!candidate||!s.enabled)return false;
    if(normalize(confirmed).some(x=>signature(x)===signature(candidate))||s.methodDismissed?.[signature(candidate)])return false;
    if(manual)return true;
    return s.lastPrompt!==day()&&(candidate.explicit||new Set((s.methodEvents||[]).filter(x=>supportedSignal(x)&&signature(x)===signature(candidate)&&fresh(x.day)).map(x=>x.day)).size>=3);
  }
  function evidenceHTML(candidate,events=state().methodEvents||[]){
    const related=events.filter(x=>supportedSignal(x)&&signature(x)===signature(candidate)&&fresh(x.day));
    return `<details class="method-evidence"><summary>查看提问依据 · ${related.length} 个日期</summary>${related.map(x=>`<blockquote><small>${esc(x.day)} · ${x.truncated?'提问片段':'提问原文'}</small><p>${esc(x.quote)}</p></blockquote>`).join('')||'<p>本次问题：'+esc(candidate.quote||'无可追溯原文')+'</p>'}</details>`;
  }
  function prompt(candidate,{demo=false,events=null}={}){
    const previous=!demo&&normalize(briefPrefs.methods).find(x=>x.scope===candidate.scope);
    return `<section class="method-confirm" aria-label="确认研究偏好"><small>${demo?'系统主动询问 · 演示，不写入真实记忆':'系统归纳待确认 · 不代表你的既定偏好'}</small><h3>以后研究${esc(candidate.scope)}，要${esc(choices[candidate.key].label)}吗？</h3><p>依据：${esc(choices[candidate.key].signal)}。这只是当前问题的归类，需要你确认是否适用于以后。</p>${evidenceHTML(candidate,events||undefined)}${previous?`<p>将替换原来的「${esc(choices[previous.key].label)}」。</p>`:''}<p class="flow-small">只影响${esc(candidate.scope)}的内容重点与能力选择，不推断其他研究顺序、投资风格或持仓，不创建订阅。</p><div class="method-actions"><button class="button primary" ${demo?'data-demo-memory="accept"':'data-method-accept'}>${demo?'确认演示偏好':'是，以后优先看这些'}</button><button class="text-action" ${demo?'data-demo-memory="decline"':'data-method-decline'}>只是这次，不用记</button></div></section>`;
  }
  function markPrompt(){return researchProfile.updateLearning({lastPrompt:day()});}
  function confirm(candidate){
    if(!valid(candidate)||!state().enabled)return false;
    const methods=[...normalize(briefPrefs.methods).filter(x=>x.scope!==candidate.scope),{scope:candidate.scope,key:candidate.key,confirmedAt:day()}];
    const dismissed={...state().methodDismissed};delete dismissed[signature(candidate)];
    const saved=researchProfile.updateLearning({methodDismissed:dismissed},normalizeBriefPrefs({...briefPrefs,methods}));
    if(saved)refresh();return saved;
  }
  function decline(candidate){return researchProfile.updateLearning({methodDismissed:{...state().methodDismissed,[signature(candidate)]:day()}});}
  function reading(id){const m=match(id);return m?`${m.scope} · ${choices[m.key].label}。` : '';}
  function briefHTML(issue){
    if(issue?.period!=='morning'||!briefPrefs.morning.includes('alerts'))return '';
    const matches=window.briefPersonalization?.candidates().filter(x=>briefPersonalization.material(x.id))||[];
    if(!matches.length)return '';
    const direct=matches.some(x=>briefPersonalization.material(x.id).direct);
    return `<div class="method-brief"><strong>${direct?'与你研究偏好匹配的资讯已优先':'相关公司与行业资讯已优先'}</strong><p>${direct?'有直接匹配的披露时先看对应资料，其余资讯继续保留。':'本期没有直接匹配细项的资料，先看相关资讯。'} 根据你确认的研究偏好整理。</p><button class="text-action" data-profile-open>管理研究偏好</button></div>`;
  }
  function refresh(){
    refreshBrief(true);
    if(activeView==='brief'&&selectedIssue){
      const box=$('#assistantContent'),nodes=[...box.childNodes],scroll=box.scrollTop;
      showBrief(selectedIssue.id);box.replaceChildren(...nodes);box.scrollTop=scroll;
    }
    document.dispatchEvent(new CustomEvent('research-methods-changed'));
  }
  function manager(methods){
    const s=state(),events=(s.methodEvents||[]).filter(x=>supportedSignal(x)&&fresh(x.day)),recent=[...new Set(events.map(signature))];
    return `<section class="profile-memory-panel"><h3>已确认的研究偏好</h3><p class="profile-muted">只影响对应范围的阅读重点与研究分工。与个人简报共用，修改后点击最后一步“保存修改”生效。</p>${normalize(methods).map(x=>`<div class="method-manage-row"><label class="field"><span>${esc(x.scope)} · 你已确认${x.confirmedAt?' · '+esc(x.confirmedAt):''}</span><select data-method-edit="${esc(x.scope)}">${Object.entries(choices).map(([key,c])=>`<option value="${key}" ${key===x.key?'selected':''}>${c.label}</option>`).join('')}</select></label><button class="text-action" data-method-remove="${esc(x.scope)}">删除习惯</button></div>`).join('')||'<p class="profile-muted">尚未确认研究偏好。助手会在合适的时候顺着当前研究询问。</p>'}<details id="methodSignals"><summary>近期研究线索与暂缓建议</summary><p class="profile-muted">线索保留七天，尚未成为画像。三个不同日期提出同类问题后再询问；明确表达以后优先关注什么时可当次询问。每天最多主动询问一次。</p>${recent.map(k=>{const x=events.find(e=>signature(e)===k);return `<p>${esc(x.scope)} · ${choices[x.key].signal} · ${events.filter(e=>signature(e)===k).length} 个日期 · 待确认 <button class="text-action" data-method-forget="${esc(k)}">删除线索</button></p>${evidenceHTML(x,events)}`;}).join('')||'<p class="profile-muted">暂无近期研究线索。</p>'}${(s.methodEvents||[]).some(x=>!supportedSignal(x))?'<p class="profile-muted">旧版线索没有保存提问原文，已停止用于推断或触发建议。</p><button class="text-action" data-method-clear-legacy>清除旧版无依据线索</button>':''}${Object.keys(s.methodDismissed||{}).map(k=>{const [scope,key]=k.split('|');return scopes.includes(scope)&&choices[key]?`<p>${esc(scope)} · ${choices[key].label} <button class="text-action" data-method-resume="${esc(k)}">允许再次询问</button></p>`:'';}).join('')}</details></section>`;
  }
  window.researchMethods={choices,normalize,detect,match,record,canOffer,prompt,markPrompt,confirm,decline,reading,refresh,manager,signature,supportedSignal,evidenceHTML};
  document.addEventListener('DOMContentLoaded',()=>{
    const overview=briefOverview,documentBody=briefDocument;
    briefOverview=issue=>overview(issue)+briefHTML(issue);
    briefDocument=issue=>briefHTML(issue)+documentBody(issue);
    refresh();
  });
})();
