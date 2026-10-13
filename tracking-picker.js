/* V2.26 — choose an identity, then reuse the existing bell configuration.
 * Selecting or cancelling never writes tracking/watchlist/holdings storage.
 */
(() => {
  function openPicker() {
    const watched=opportunityWatch.map(opportunitySecurity).filter(Boolean);
    const holdings=holdingsStore.identities().map(q=>opportunitySecurity(q.code)||{...q,localOnly:true});
    const saved=securityTrackingView.entries();
    const tracked=new Set(saved.map(x=>x.key));
    const all=new Map([...opportunityQuotes,...holdings,...saved.map(x=>x.security)].map(q=>[opSecurityKey(q),q]));
    const groups={watchlist:watched,holdings,search:[...all.values()]};
    let source=watched.length?'watchlist':holdings.length?'holdings':'search';
    let query='';
    const tabs=[['watchlist','我的自选',watched.length],['holdings','我的持仓',holdings.length],['search','搜索标的',null]];
    openModal('选择要追踪的标的',`<div class="tracking-picker" id="trackingPicker"><div class="tracking-picker-steps" aria-label="新增追踪步骤"><strong>1 选择标的</strong><span>→</span><span>2 设置条件</span><span>→</span><span>3 确认保存</span></div><p class="tracking-picker-intro">选中股票或 ETF 后，闪电猫会在当前页帮你设置追踪条件。</p><label class="tracking-picker-search" for="trackingPickerQuery">${icon('search')}<input id="trackingPickerQuery" type="search" aria-label="搜索股票或 ETF 名称或代码" placeholder="搜索股票 / ETF 名称或代码" autocomplete="off" aria-describedby="trackingSearchScope"></label><p id="trackingSearchScope" class="tracking-picker-scope">搜索范围：原型已有标的与本地自选、持仓。未连接全市场搜索。</p><div class="tracking-picker-tabs" role="tablist" aria-label="选择标的来源">${tabs.map(([key,label,count])=>`<button type="button" id="tracking-source-${key}" role="tab" data-tracking-source="${key}" aria-controls="trackingPickerResults">${label}${count===null?'':`<small>${count}</small>`}</button>`).join('')}</div><p id="trackingPickerCount" class="tracking-picker-count" role="status" aria-live="polite"></p><div id="trackingPickerResults" class="tracking-picker-results" role="tabpanel"></div><footer class="tracking-picker-footer"><span>选中只进入设置；确认前不会保存。</span><button class="button" type="button" data-tracking-picker-cancel>取消</button></footer></div>`,'新增标的追踪');
    const dialog=$('#modal'),root=$('#trackingPicker'),input=$('#trackingPickerQuery');
    dialog.classList.add('tracking-picker-modal');
    function render() {
      root.querySelectorAll('[role="tab"][data-tracking-source]').forEach(b=>{
        const active=b.dataset.trackingSource===source;
        b.setAttribute('aria-selected',String(active));b.tabIndex=active?0:-1;
      });
      const term=query.trim().toLocaleLowerCase();
      const list=groups[source].filter(q=>!term||[q.name,q.code||''].some(v=>v.toLocaleLowerCase().includes(term)));
      $('#trackingPickerCount').textContent=`${list.length} 个${source==='search'?'可选标的':source==='holdings'?'持仓标的':'自选标的'}${term?' · 搜索结果':''}`;
      const result=$('#trackingPickerResults');result.setAttribute('aria-labelledby','tracking-source-'+source);
      result.innerHTML=list.length?list.map(q=>{
        const key=opSecurityKey(q),existing=tracked.has(key);
        return `<button type="button" class="tracking-picker-row" data-tracking-pick="${esc(key)}" aria-label="${existing?'修改追踪':'设置追踪'}：${esc(q.name)}，${esc(q.code||'代码未获取')}"><span class="tracking-picker-identity"><strong>${esc(q.name)}${existing?'<em>已追踪</em>':''}</strong><small>${q.type==='etf'?'ETF':'股票'} · ${esc(q.code||'代码未获取')}${q.localOnly?' · 本地持仓，详情未接入':''}</small></span><span class="tracking-picker-action">${existing?'修改设置':'设置追踪'} ${icon('arrow-right')}</span></button>`;
      }).join(''):`<div class="tracking-picker-empty">${icon('search')}<strong>${term?'没有匹配的标的':source==='holdings'?'还没有持仓记录':'还没有自选标的'}</strong><p>${term?'试试其他名称或代码。当前仅搜索已有原型资料和本地记录。':'可以从其他来源选择股票或 ETF，再继续设置。'}</p>${term?'<button class="button" type="button" data-tracking-clear>清空搜索</button>':'<button class="button" type="button" data-tracking-source="search">搜索标的</button>'}</div>`;
    }
    function chooseSource(value) {source=value;query='';input.value='';render();}
    input.addEventListener('input',()=>{query=input.value;source='search';render();});
    root.addEventListener('click',e=>{
      const tab=e.target.closest('[data-tracking-source]');if(tab){chooseSource(tab.dataset.trackingSource);return;}
      if(e.target.closest('[data-tracking-clear]')){query='';input.value='';render();input.focus();return;}
      if(e.target.closest('[data-tracking-picker-cancel]')){closeModal();return;}
      const row=e.target.closest('[data-tracking-pick]');if(!row)return;
      const q=all.get(row.dataset.trackingPick);if(!q)return;
      closeModal();securityTrackingView.configure(q);
      $('#securityTrackForm [data-security-category]')?.focus({preventScroll:true});
    });
    root.addEventListener('keydown',e=>{
      const tab=e.target.closest('[role="tab"]');
      if(!tab||!['ArrowLeft','ArrowRight','Home','End'].includes(e.key))return;
      e.preventDefault();const keys=tabs.map(t=>t[0]),i=keys.indexOf(source);
      const next=e.key==='Home'?0:e.key==='End'?keys.length-1:(i+(e.key==='ArrowRight'?1:keys.length-1))%keys.length;
      chooseSource(keys[next]);$('#tracking-source-'+source).focus();
    });
    render();input.focus();
  }
  document.addEventListener('click',e=>{if(e.target.closest('[data-tracking-add]'))openPicker();});
  $('#modal').addEventListener('close',()=>$('#modal').classList.remove('tracking-picker-modal'));
})();
