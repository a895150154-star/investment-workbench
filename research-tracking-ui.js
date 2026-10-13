/* Render the existing event, management and report surfaces from one record. */
(() => {
  let outcomes={};
  // Presentation only: never persists a quote, profile choice, material or signal.
  const reviewModes=Object.create(null);
  const priceExample=Object.freeze({change:2.4,sectorChange:0.8});
  function setReviewMode(issueId,mode){
    if(!['price','progress'].includes(mode))return false;
    reviewModes[issueId]=mode;return true;
  }
  function reviewControls(issue){
    const mode=reviewModes[issue.id]||'price';
    return `<div class="research-review-controls" role="group" aria-label="晚报演示场景">${[['price','行情变化示例'],['progress','仅看已录入进展']].map(([value,label])=>`<button type="button" class="button ${mode===value?'selected':''}" aria-pressed="${mode===value}" data-research-review-mode="${value}" data-research-issue="${esc(issue.id)}">${label}</button>`).join('')}</div>`;
  }
  const labels=ids=>researchDemo.observations.filter(o=>ids.includes(o.id)).map(o=>o.label).join('、');
  const statusText=record=>!record?'尚未确认追踪':({active:'追踪已保存',completed:'已完成 · 仅提醒一次',stopped:'追踪已停止'}[record.status]);
  const issueFor=id=>issueFromId(id)||issueFromId(route.issueId)||issueFromId(context?.briefIssue)||(activeView==='brief'?selectedIssue:null)||briefSnapshot().displayed;
  const eventLink=(issue,label='查看进展',className='button')=>opLink(label,eventRoute(researchDemo.id,issue.id),className);
  const reportLink=(issue,label,section='research-review')=>`<button class="button" type="button" ${briefAttrs('section',section,issue)}>${label}</button>`;
  const oldDescription=old=>[old.scope,old.eventType,old.focus,old.frequency,old.channel].filter(v=>typeof v==='string').join(' · ');
  function legacyNote(){const old=researchTracking.legacy();return old?`<p class="research-track-legacy">旧海光条件：${esc(oldDescription(old))}。原记录保留；请重新选择观察项并确认，不会自动沿用为新条件。</p>`:'';}
  function status(){const record=researchTracking.get().record;return `<div class="event-track-status"><div><strong>${statusText(record)}</strong><small>${record?esc(labels(record.observations)+' · '+record.frequency+' · '+record.channel):'客户适配、实际交付、持续采购 · 等待确认'}</small></div></div>`;}
  function refresh(){eventTrackingRefresh();}
  function configure(issueId){
    const issue=issueFor(issueId),record=researchTracking.get().record,old=researchTracking.legacy();
    const draft=record||{observations:old?[]:researchDemo.observations.map(o=>o.id),frequency:'持续提醒'};
    setContext({kind:'research-tracking',company:'海光信息',eventId:researchDemo.id,security:researchDemo.identity,briefIssue:issue.id,readingFocus:researchDemo.focus,source:researchDemo.sources[0].title});openAssistant();
    $('#chatForm').hidden=true;
    $('#assistantContent').innerHTML=`<div class="research-track-assistant"><span class="research-demo-label">海光信息 · 追踪设置 · 演示</span><h2 class="assistant-greeting">${record?'调整这条追踪':'把后续验证设为追踪'}</h2><p>对象是海光信息，研究背景是 CPU 1000 系列发布。打开表单不会保存。</p>
      ${!record?legacyNote():''}<form id="researchTrackForm">
        <fieldset class="research-track-options"><legend>观察哪些进展</legend>${researchDemo.observations.map(o=>`<label><input type="checkbox" name="observation" value="${o.id}" ${draft.observations.includes(o.id)?'checked':''}><span><strong>${o.label}</strong><small>${o.check}</small></span></label>`).join('')}</fieldset>
        <p>所选环节的推进、延期或取消均作为核验线索。</p>
        <fieldset class="event-frequency"><legend>提醒频率</legend>${['持续提醒','仅提醒一次'].map(f=>`<label><input type="radio" name="frequency" value="${f}" ${draft.frequency===f?'checked':''}><span>${f}</span></label>`).join('')}</fieldset>
        <p><strong>提醒方式</strong>　工作台内提醒</p><p class="research-demo-label">仅在当前浏览器保存。需要手动模拟进展；未启动后台监控或外部通知。</p>
        <p id="researchTrackError" class="flow-error" role="alert">${esc(researchTracking.readError)}</p>
        <div class="flow-actions"><button class="button primary" type="submit">${record?'确认修改并继续追踪':'确认保存追踪'}</button><button class="button" type="button" data-research-track-cancel>取消</button></div>
      </form></div>`;
    $('#researchTrackForm').onsubmit=e=>{
      e.preventDefault();const form=e.currentTarget;
      const result=researchTracking.save({observations:[...form.querySelectorAll('[name=observation]:checked')].map(x=>x.value),frequency:form.elements.frequency.value});
      if(!result.ok){$('#researchTrackError').textContent=result.message;return;}
      trackingCenter.activateMine();refresh();
      setContext({kind:'research-tracking',company:'海光信息',eventId:researchDemo.id,briefIssue:issue.id,source:researchDemo.sources[0].title});
      const saved=researchTracking.get().record;
      $('#assistantContent').innerHTML=`<div class="research-track-assistant"><div class="flow-success-mark">${icon('check')}</div><h2 class="assistant-greeting">${esc(result.message)}</h2><p>海光信息 · ${esc(labels(saved.observations))}</p><p>${esc(saved.frequency)} · 工作台内提醒</p><p>保存只更新设置，没有生成信号。下一步到管理页手动模拟新进展。</p><div class="flow-actions"><button class="button primary" data-research-manage="${issue.id}">管理追踪并模拟进展</button><button class="button" data-event-track="${researchDemo.id}">修改设置</button></div><p class="research-demo-label">演示设置，仅保存在当前浏览器。</p></div>`;
      $('#chatForm').hidden=true;$('#assistantContent').scrollTop=0;toast(result.message);
    };
    $('#assistantContent').scrollTop=0;
  }
  function stop(){
    const result=researchTracking.stop();
    if(!result.ok){const error=$('#researchTrackError')||$('#researchSimulationResult');if(error)error.textContent=result.message;toast(result.message);return;}
    refresh();toast(result.message);
  }
  function signal(signal,issue){
    const state=researchTracking.get(),material=state.materials.find(m=>m.id===signal.materialId);
    if(!material)return '';
    const snapshot=signal.condition;
    return `<article class="research-signal" data-research-signal="${esc(signal.id)}"><div class="research-track-meta"><span class="research-demo-label">模拟信号 · 演示</span><time>${esc(signal.time)}（演示时间）</time></div><h3>海光信息 · ${esc(material.title)}</h3>
      <p><strong>命中条件</strong> ${esc(labels([snapshot.matched]))}。触发时观察：${esc(labels(snapshot.observations))}；${esc(snapshot.frequency)}；${esc(snapshot.channel)}。</p>
      <p><strong>资料依据 · 模拟资料</strong> ${esc(material.text)}</p><p><strong>下一步核验</strong> ${esc(material.next)}</p>
      ${state.record?.status==='stopped'?'<p class="research-track-legacy">对应追踪已停止，保留本次历史信号。</p>':state.record?.status==='completed'?'<p class="research-demo-label">对应追踪已完成，后续模拟不再新增信号。</p>':''}
      <div class="flow-actions">${eventLink(issue)}<button class="text-action" data-event-track="${researchDemo.id}">查看当前追踪设置</button></div></article>`;
  }
  function eventProgress(issue){
    const current=researchTracking.forDay(issue.day);
    if(!current.materials.length)return '';
    return `<section class="research-materials"><h3>本期模拟进展 · ${esc(issue.day)}</h3><p>${current.materials.length} 条模拟资料 · ${current.signals.length} 条模拟信号。模拟内容与上方真实来源分开。</p>${current.materials.map(m=>`<p><strong>${esc(m.title)} · 模拟资料</strong><br>${esc(m.time)}（演示时间）<br>${esc(m.text)}<br>${current.signals.some(s=>s.materialId===m.id)?'已命中当时的追踪条件，仍需核验原始披露。':'录入时未命中已选条件，未生成信号。'}</p>`).join('')}</section>`;
  }
  function manager(){return '';}
  function review(issue,compact=false){
    const current=researchTracking.forDay(issue.day),historical=researchDemo.sources.length>0;
    const price=reviewModes[issue.id]!=='progress',hasProgress=current.materials.length>0||current.signals.length>0;
    const opening=`<section class="research-evening-review ${compact?'compact':''} ${!price&&!hasProgress?'is-quiet':''}" id="${compact?'researchReviewPreview':'brief-research-review'}" aria-label="我的关注回顾"><header class="research-track-meta"><h2>我的关注回顾</h2><span>${esc(issue.day)} · 晚报演示期次</span></header>`;
    const actions=`<div class="flow-actions">${historical?eventLink(issue,!price&&!hasProgress?'查看历史解读':'查看进展'):reportLink(issue,'阅读市场背景','summary')}<button type="button" class="button" data-research-manage="${esc(issue.id)}">管理追踪</button>${compact?reportLink(issue,'阅读完整晚报'):''}</div>`;
    if(!price&&!hasProgress)return `${opening}<p class="research-review-empty">本期暂无已录入的个人进展，可继续阅读市场背景。</p><p class="research-demo-label">${historical?'历史解读 · 原文日期：2026-09-22 至 2026-09-23。':'暂无可用历史解读。'}追踪设置保留。</p>${actions}</section>`;
    const sources=historical?`<details class="research-materials research-review-sources"><summary>资料依据 · ${researchDemo.sources.length} 份历史报道</summary><p class="research-demo-label">原文日期：2026-09-22 至 2026-09-23。历史资料不能充当本期新进展。</p>${researchDemo.sources.map(s=>`<p><a href="${esc(s.url)}" target="_blank" rel="noopener noreferrer">${esc(s.title)}</a><br><span class="research-demo-label">${esc(s.publisher)} · ${esc(s.date)} · ${esc(s.role)}</span></p>`).join('')}</details>`:'<p class="research-demo-label">暂无可用历史解读；缺少可核验依据，本期不补写海光信息结论。</p>';
    const progress=hasProgress?`<p><strong>本期研究进展</strong> 本期新增 ${current.materials.length} 条模拟资料${current.signals.length?`，产生 ${current.signals.length} 条模拟信号`:'；本期暂无新触发'}。</p>${!current.signals.length&&current.materials.length?'<p class="research-demo-label">资料录入时未命中已选观察项；没有触发，不代表没有新资料。</p>':''}${!compact?`<details class="research-materials"><summary>查看本期模拟进展与信号</summary><p class="research-demo-label">${esc(statusText(current.record))} · 模拟资料与真实来源分开呈现。</p>${current.materials.map(m=>`<p><strong>${esc(m.title)} · 模拟资料</strong><br>${esc(m.time)}（演示时间）<br>${esc(m.text)}</p>`).join('')}${current.signals.map(s=>signal(s,issue)).join('')}</details>`:''}`:'';
    return `${opening}<div class="research-demo-user"><strong>海光信息</strong><span class="brief-reason-tag">长期关注</span><span>演示用户 · 事件进展 · 持仓未提供</span></div>
      <div class="research-recap-section"><h3>我的标的表现</h3>${price?`<p class="research-demo-label">假设行情 · 用于展示晚报结构，并非 ${esc(issue.day)} 的真实行情。</p><div class="research-performance"><div><span>海光信息 · 示例涨跌</span><strong class="op-number up">+${priceExample.change.toFixed(1)}%</strong></div><div><span>半导体板块 · 示例涨跌</span><strong class="op-number up">+${priceExample.sectorChange.toFixed(1)}%</strong></div><div><span>相对板块表现</span><strong>+${(priceExample.change-priceExample.sectorChange).toFixed(1)}<small> 个百分点</small></strong></div></div><p>这个示例中，海光涨幅高于板块。值得继续核对的是：强势表现有没有事件进展支撑，能否延续到下一交易日。</p>`:'<p>本期有新的研究进展；尚未提供本期行情，因此这里只回顾事件，不解释股价涨跌。</p>'}</div>
      <div class="research-recap-section"><h3>原因及证据</h3>${historical?'<p><strong>已知资料</strong> 历史报道记录了 CPU 1000 系列发布，并提示客户适配、生态和商业化仍需验证。</p>':''}${progress}
      <p><strong>解释边界</strong> ${price?`相对板块更强只说明示例中的价格表现，尚不足以确认这次涨幅由产品发布或商业兑现推动。${hasProgress||historical?'现有资料仍缺少对应交易日的解释依据。':'当前缺少可核验的解释资料。'}还需对应交易日的行情与最新原始披露核对。`:'模拟进展只是后续核验线索，尚不足以确认客户规模、持续采购或收入贡献。推进、延期和取消均需核对原因及影响范围。'}</p>${historical?`<p><strong>对原判断的影响</strong> 保留原判断：${esc(researchDemo.judgment)}</p>`:''}
      <p><strong>与你的关注方式</strong> 你关注事件进展，因此行情变化需要与适配、交付及采购证据一起看。交易周期和策略尚未确认，这里只解释与事件研究的关系。</p>${!compact?sources:historical?'<p class="research-demo-label">历史依据 · 2026-09-22 至 2026-09-23；完整晚报可查看来源。</p>':sources}</div>
      <div class="research-recap-section"><h3>明日观察与研究机会</h3><p><strong>下一交易日</strong> ${price?'核对海光相对板块的强弱是否延续；若走势转弱，先区分板块共同变化与个股因素，再寻找解释依据。':'先取得海光与板块的行情，核对相对表现，再区分板块共同变化与个股因素，寻找解释依据。'}</p><p><strong>下一次公司披露</strong> 核对客户适配结果、正式交付及持续采购。若得到公开资料验证，可继续评估落地进展；若延期或取消，需要重新评估节奏。单日涨幅和提醒触发本身不代表经营兑现。</p></div>${actions}</section>`;
  }
  document.addEventListener('click',e=>{
    const button=e.target.closest('[data-research-track-cancel],[data-research-track-stop],[data-research-manage],[data-research-simulate],[data-research-review-mode]');if(!button)return;
    if(button.dataset.researchReviewMode){const issue=issueFor(button.dataset.researchIssue);if(setReviewMode(issue.id,button.dataset.researchReviewMode)){closeModal();showBrief(issue.id);}return;}
    if(button.hasAttribute('data-research-track-cancel')){context=null;taskDraft=null;$('#chatForm').hidden=false;assistantDefault();closeAssistant();toast('已取消，原追踪设置未改变');return;}
    if(button.hasAttribute('data-research-track-stop')){stop();return;}
    if(button.hasAttribute('data-research-manage')){const issue=issueFor(button.dataset.researchManage);closeAssistant();trackingCenter.activateMine();taskTab='tasks';route={...route,issueId:issue.id};showTasks();return;}
    if(button.dataset.researchSimulate){const day=button.dataset.researchDay,result=researchTracking.simulate(button.dataset.researchSimulate,day);outcomes[day]=result;refresh();toast(result.message);}
  });
  window.researchTrackingUI=Object.freeze({statusText,labels,status,configure,stop,signal,manager,review,reviewControls,setReviewMode,eventProgress,issueFor});
})();
