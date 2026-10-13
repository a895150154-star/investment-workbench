/* Navigation and accessible interactions for the isolated prototype. */
(() => {
  const clone = value => JSON.parse(JSON.stringify(value));
  const enc = encodeURIComponent;
  const nativeRestore = restoreRoute;
  let rendering = 0, replaying = false, current = null, pendingFocus = null;
  let sectionObserver, assistantTrigger = null, sourceParent = null;
  const mobile = matchMedia('(max-width: 1100px)');
  history.scrollRestoration = 'manual';

  const originalOverview = briefOverview;
  briefOverview = function(issue) {
    const template = document.createElement('template');
    template.innerHTML = originalOverview(issue);
    template.content.querySelectorAll('button[data-brief-action="read"]:not(.button)').forEach(button => {
      const text = document.createElement('div'); text.className = button.className;
      text.innerHTML = button.innerHTML;
      text.querySelectorAll('.icon').forEach(i => i.remove());
      button.replaceWith(text);
    });
    for (const [selector, section, text] of [
      ['.brief-cover-personal',issue.period==='evening'?'summary':'alerts',issue.period==='evening'?'在晚报中查看大盘总结':'在简报中查看特别提醒'],
      ['.brief-cover-market',issue.period==='evening'?'flows':'pulse',issue.period==='evening'?'在晚报中查看资金与事件':'在简报中查看市场与主题']
    ]) {
      const panel = template.content.querySelector(selector);
      panel?.insertAdjacentHTML('beforeend',`<button class="text-action brief-preview-link" ${briefAttrs('section',section,issue)}>${text} ${icon('chevron-right')}</button>`);
    }
    template.content.querySelector('.brief-cover-personal .brief-cover-kicker span')?.replaceChildren('按关注方向整理');
    return template.innerHTML;
  };
  dateButton = issue => `<button class="brief-date" data-brief-history aria-label="查看历史早晚报，当前${issueLabel(issue)}">${icon('history')}<span>${issue.day.slice(5).replace('-','.')} · 历史</span>${icon('chevron-down')}</button>`;

  function urlFor(r) {
    const extension = opportunityRouteURL(r); if (extension) return extension;
    if (r.type === 'overview') return '#/overview';
    if (r.type === 'global-indices') return '#/global-indices'+(r.section&&r.section!=='all'?'?section='+enc(r.section):'');
    if (r.type === 'market-overview') return '#/market-overview?tab='+(['breadth','turnover','style','limits'].includes(r.tab)?r.tab:'breadth');
    if (r.type === 'tasks') return '#/tracking?tab='+(r.tab==='notices'?'notices':'tasks')+(r.security?'&security='+encodeURIComponent(r.security):'')+'&scene='+(r.scene||'demo')+(r.issueId?'&issue='+enc(r.issueId):'');
    if (r.type === 'stock-workbench' || ['watchlist','holdings'].includes(r.type)) return '#/stock-workbench?tab='+(['watchlist','holdings'].includes(r.type)?r.type:['watchlist','holdings','triggers'].includes(r.tab)?r.tab:'watchlist');
    if (r.type === 'library') return '#/archive';
    if (r.type === 'events') return window.eventDriver?.radarURL(r) || '#/radar';
    if (r.type === 'brief') return '#/briefs/' + r.issueId.replace('_', '/') + (r.section ? '?section=' + enc(r.section) : '');
    if (r.type === 'brief-theme') return '#/themes/optical-interconnect?issue=' + enc(r.issueId) + '&type=' + (r.filter || 'all') + '&sort=' + (r.sort || 'relevance');
    if (r.type === 'brief-quote') {
      const q = briefSecurities.find(s => s.name === r.company);
      return '#/' + (q?.type === 'etf' ? 'etfs/' : 'stocks/') + (q?.code || '') + '?issue=' + enc(r.issueId);
    }
    return '#/preview/' + enc(r.type) + '?state=' + enc(JSON.stringify(r));
  }
  function parseURL() {
    try {
      const [path, search = ''] = location.hash.slice(1).split('?'), args = new URLSearchParams(search);
      const extension = opportunityParse(path,args); if(extension) return extension;
      const parts = path.split('/').filter(Boolean), issue = issueFromId(args.get('issue')) || briefSnapshot().displayed;
      if (parts[0] === 'global-indices') return {type:'global-indices',section:['common','china','global','commodities','fx'].includes(args.get('section'))?args.get('section'):'all'};
      if (parts[0] === 'market-overview') return {type:'market-overview',tab:['breadth','turnover','style','limits'].includes(args.get('tab'))?args.get('tab'):'breadth'};
      if (parts[0] === 'tracking') return {type:'tasks',tab:args.get('tab')==='notices'?'notices':'tasks',security:args.get('security')||'',scene:args.get('scene')||'demo',issueId:issue.id};
      if (parts[0] === 'stock-workbench') return {type:'stock-workbench',tab:['watchlist','holdings','triggers'].includes(args.get('tab'))?args.get('tab'):'watchlist'};
      if (['watchlist','holdings'].includes(parts[0])) return {type:'stock-workbench',tab:parts[0]};
      if (parts[0] === 'archive') return {type:'library'};
      if (parts[0] === 'radar') return window.eventDriver?.parseRadar(args) || {type:'events'};
      if (path === 'brief') return {type:'brief', issueId:issue.id};
      if (parts[0] === 'briefs') {
        const id = parts[1] + '_' + parts[2];
        if (!issueFromId(id)) return {type:'overview'};
        return {type:'brief', issueId:id, section:briefSectionsFor(issueFromId(id)).some(([s]) => s === args.get('section')) ? args.get('section') : undefined};
      }
      if (parts[0] === 'themes') return {type:'brief-theme',issueId:issue.id,filter:['all','stock','etf'].includes(args.get('type')) ? args.get('type') : 'all',sort:args.get('sort') === 'name' ? 'name' : 'relevance'};
      if (['stocks','etfs'].includes(parts[0])) {
        const security = briefSecurities.find(s => s.code === parts[1]);
        if (security) return {type:'brief-quote',company:security.name,issueId:issue.id};
      }
      if (parts[0] === 'preview') return JSON.parse(args.get('state'));
    } catch {}
    return {type:'overview'};
  }
  function focusKey(el) {
    if (!el || el === document.body) return null;
    if (el.id) return '#' + CSS.escape(el.id);
    if (el.dataset?.opRoute) return '[data-op-route="' + CSS.escape(el.dataset.opRoute) + '"]';
    if (el.name && el.closest('#opFilters')) return '#opFilters [name="' + CSS.escape(el.name) + '"]';
    if (el.dataset?.briefAction) return '[data-brief-action="' + CSS.escape(el.dataset.briefAction) + '"][data-brief-value="' + CSS.escape(el.dataset.briefValue || '') + '"]';
    return null;
  }
  function checkpoint() {
    if (!current || replaying) return;
    current.scroll = scrollY;
    current.focus = pendingFocus || focusKey(document.activeElement);
    history.replaceState(clone(current), '', urlFor(current.route));
  }
  function routeName(r) {
    if(r) {const extension=opportunityRouteName(r);if(extension)return extension;}
    if (!r || r.type === 'overview') return '今日总览';
    if (r.type === 'market-overview') return '市场概览';
    if (r.type === 'global-indices') return '大盘指数';
    if (r.type === 'stock-workbench' || ['watchlist','holdings'].includes(r.type)) return '股票工作台';
    if (r.type === 'brief') return issueLabel(issueFromId(r.issueId));
    if (r.type === 'brief-theme') return '光模块与算力互联';
    return r.company || ({events:'事件列表',event:'事件详情',theme:'主题详情',library:'早期原型记录',watchlist:'自选股',holdings:'我的持仓',tasks:'追踪管理'}[r.type]) || '上一页';
  }
  function fallback(r) {
    const extension=opportunityFallback(r);if(extension)return extension;
    if (r.type === 'brief-theme' || r.type === 'brief-quote') return {type:'brief',issueId:r.issueId};
    return {type:'overview'};
  }
  function finalise(before, replace = false) {
    if (replaying) return;
    const r = clone(route);
    if (r.type === 'tasks') r.tab = taskTab;
    if (r.type === 'study' && !r.id) r.study = currentStudy;
    const same = current && urlFor(current.route) === urlFor(r);
    let trail = current?.trail || [];
    if (!same && !replace && before) trail = [...trail, before].slice(-24);
    current = {prototypeNavigation:true,route:r,trail,scroll:replace ? before?.scroll || 0 : scrollY,focus:null};
    history[same || replace ? 'replaceState' : 'pushState'](clone(current), '', urlFor(r));
    decorate();
    syncAssistant();
    if (!replace) focusHeading();
    else if (pendingFocus) $(pendingFocus)?.focus({preventScroll:true});
  }
  const names = ['showGlobalIndices','showMarketOverview','showReviewAccount','showEveningDetail','showOpportunities','showThemeFeed','showRelatedETFs','showTrackedEvent','home','showBrief','showBriefTheme','briefQuote','showEvent','showTheme','allEvents','quote','showTasks','taskDetail','showLibrary','showStudy','showResult','openNotice'];
  names.forEach(name => {
    const original = window[name];
    window[name] = function(...args) {
      const outer = rendering === 0;
      if (outer) checkpoint();
      const before = current ? {route:clone(current.route),scroll:current.scroll,focus:current.focus} : null;
      rendering++;
      try { return original.apply(this,args); }
      finally {
        rendering--;
        if (outer) finalise(before, (name === 'showBriefTheme' && args[3] === true) || (name === 'showMarketOverview' && before?.route.type === 'market-overview') || (name === 'showGlobalIndices' && before?.route.type === 'global-indices') || (name === 'showReviewAccount' && before?.route.type === 'stock-workbench') || (['showOpportunities','showRelatedETFs'].includes(name) && args[1] === true));
      }
    };
  });
  function renderState(next) {
    replaying = true;
    try {
      current = clone(next);
      const r = next.route, parent = next.trail?.at(-1)?.route || fallback(r);
      if ($('#modal').open) { sourceParent = null; $('#modal').close(); }
      if (mobile.matches) closeAssistant();
      if (['evening-board','evening-event','evening-source','opportunities','theme-feed','theme-etfs','event-detail'].includes(r.type)) renderOpportunityRoute(r);
      else if (r.type === 'global-indices') showGlobalIndices(r.section);
      else if (r.type === 'market-overview') showMarketOverview(r.tab);
      else if (r.type === 'brief') showBrief(r.issueId);
      else if (r.type === 'brief-theme') showBriefTheme(issueFromId(r.issueId),r.filter,r.sort,true,r.themeId);
      else if (r.type === 'brief-quote') briefQuote(r.code||r.company,issueFromId(r.issueId));
      else if (r.type === 'quote') quote(r.company);
      else if (r.type === 'task-detail') taskDetail(r.id);
      else if (r.type === 'notice') openNotice(r.id);
      else if (r.type === 'stock-workbench' || ['watchlist','holdings'].includes(r.type)) showReviewAccount(r.type==='stock-workbench'?r.tab:r.type);
      else if (r.type === 'events') allEvents(r);
      else if (r.type === 'tasks') {taskTab = r.tab || 'tasks'; trackingSignalKey=r.security||''; trackingCenter.mode=r.scene||'demo';route=r;showTasks();}
      else if (r.type === 'study' && r.study) showStudy(r.study);
      else nativeRestore(r);
      route = {...route, ...(r.section ? {section:r.section} : {})};
      briefThemeOrigin = parent;
      quoteReturn = parent;
      decorate(); syncAssistant();
      focusHeading();
      if (next.focus) {
        const target = [...document.querySelectorAll(next.focus)].find(e => e.getClientRects().length);
        target?.focus({preventScroll:true});
      }
      if (next.scroll != null) window.scrollTo({top:next.scroll,behavior:'instant'});
      else if (r.section) $(r.type==='global-indices'?'#indices-'+r.section:(window.workbenchClient.desktop?'#briefView ':'')+'#brief-' + r.section)?.scrollIntoView();
    } finally { replaying = false; }
  }
  function goBack(target) {
    checkpoint();
    if (current?.trail.length) history.back();
    else {
      const r = target || fallback(current.route);
      const next = {prototypeNavigation:true,route:r,trail:[],scroll:0};
      history.replaceState(next,'',urlFor(r)); renderState(next);
    }
  }
  restoreRoute = r => goBack(r);
  window.addEventListener('popstate', e => {
    const next = e.state?.prototypeNavigation ? e.state : {prototypeNavigation:true,route:parseURL(),trail:[],scroll:null};
    renderState(next);
  });
  window.addEventListener('hashchange', () => {
    if (location.hash === '#main') return;
    if (current && location.hash === urlFor(current.route)) return;
    const next = {prototypeNavigation:true,route:parseURL(),trail:[],scroll:null};
    history.replaceState(next,'',urlFor(next.route)); renderState(next);
  });
  let scrollTimer;
  addEventListener('scroll', () => {clearTimeout(scrollTimer);scrollTimer=setTimeout(checkpoint,150);}, {passive:true});
  addEventListener('pagehide', checkpoint);

  function linkRoute(el) {
    const action = el.dataset.briefAction, issueId = el.dataset.briefIssue || selectedIssue?.id || briefSnapshot().displayed.id;
    if (action === 'read' || action === 'section') return {type:'brief',issueId,section:action === 'section' ? el.dataset.briefValue : undefined};
    if (action === 'theme') return {type:'brief-theme',issueId,filter:el.dataset.briefValue === 'etf' ? 'etf' : 'all',sort:'relevance'};
    if (action === 'quote') return {type:'brief-quote',issueId,company:el.dataset.briefValue};
    return null;
  }
  function decorateLinks() {
    document.querySelectorAll('button[data-brief-action]').forEach(button => {
      const r = linkRoute(button); if (!r) return;
      const a = document.createElement('a');
      for (const attr of button.attributes) a.setAttribute(attr.name,attr.value);
      a.href = urlFor(r); a.innerHTML = button.innerHTML; button.replaceWith(a);
    });
  }
  function focusHeading() {
    const heading = $('#main section:not([hidden]) h1') || $('#main');
    heading.tabIndex = -1; heading.focus({preventScroll:true});
  }
  function decorate() {
    decorateLinks();
    $$('#briefView .report-analysis>button').forEach(button => {
      if (!button.querySelector('.brief-ask-label')) button.insertAdjacentHTML('afterbegin','<span class="brief-ask-label">问闪电猫</span>');
    });
    const parent = current?.trail.at(-1)?.route || fallback(route);
    const back = route.type === 'brief' ? $('#backOverview') : $('#flowView .back-button');
    if (back) {
      back.innerHTML = icon('arrow-left') + '返回' + esc(routeName(parent));
      back.dataset.navigationBack = 'true';
    }
    const label = routeName(route);
    document.title = label + ' · 个人投研工作台';
    $('#breadcrumbTitle').textContent = label;
    if (['market-overview','global-indices'].includes(route.type)||route.type.startsWith('brief')||route.type.startsWith('evening-')) markNav('overview');
    if (route.type === 'brief-theme') {
      const select = $('#briefSecurityFilter');
      select?.closest('label').classList.add('sr-only');
      if (select) {
        const tabs = document.createElement('div'); tabs.className = 'brief-type-tabs'; tabs.setAttribute('role','group'); tabs.setAttribute('aria-label','关联标的类型');
        tabs.innerHTML = [['all','全部'],['stock','关联个股'],['etf','关联 ETF']].map(([value,text]) => `<button type="button" data-security-type="${value}" aria-pressed="${select.value===value}" class="${select.value===value?'selected':''}">${text}</button>`).join('');
        select.closest('.brief-security-controls').prepend(tabs);
      }
    }
    opportunityDecorate();
    sectionObserver?.disconnect();
    if (route.type === 'brief') {
      sectionObserver = new IntersectionObserver(entries => {
        const entry = entries.find(e => e.isIntersecting); if (!entry) return;
        const id = entry.target.id.replace('brief-','');
        $$('#briefView .report-index a').forEach(a => a.setAttribute('aria-current',a.dataset.briefValue===id?'location':'false'));
      }, {rootMargin:'-80px 0px -65% 0px'});
      $$('#briefView .report-section-head').forEach(el=>sectionObserver.observe(el));
    }
  }
  for (const name of ['renderWidgets','refreshBrief']) {
    const original = window[name]; window[name] = function(...args) {const result=original(...args);decorateLinks();return result;};
  }

  const originalAssistantDefault = assistantDefault;
  function pageContext() {
    const title = routeName(route);
    return {title,description:route.type==='global-indices'?'可以围绕 A 股、全球指数与商品外汇的市场背景继续提问。':route.type==='market-overview'?'可以围绕市场成交、涨跌分布与情绪变化继续提问。':route.type==='brief-theme'?'可以围绕这个主题的公司、产业环节和关联 ETF 继续提问。':route.type==='brief-quote'?'可以围绕这只标的的行情快照和公开资料继续提问。':'可以围绕当前页面继续提问。'};
  }
  function syncAssistant() {
    if(route.type==='event-detail'&&researchDemo.isCase(route.eventId)&&!context&&!taskDraft){researchDemo.ready(route.issueId);return;}
    let note = $('#assistantPageContext');
    if (!note) {
      note=document.createElement('div');note.id='assistantPageContext';note.className='assistant-page-context';
      $('.assistant-context').after(note);
    }
    const p=pageContext();
    $('.assistant-context>span').textContent = context ? '当前对话对象' : '当前页面';
    const sameResearch=context?.kind==='event-research-demo'&&route.type==='event-detail'&&researchDemo.isCase(route.eventId);
    note.innerHTML = context&&!sameResearch ? `当前页面：${esc(p.title)}<button type="button" data-use-page>围绕本页提问</button>` : '';
    note.hidden = !context||sameResearch;
    if (context || taskDraft) return;
    $('#contextName').textContent=p.title;
    $('#persistentContext').hidden=true;
    $('.composer>div>span').textContent='提问将携带当前页面信息';
    if (['global-indices','market-overview','tasks','events','stock-workbench','watchlist','holdings','library','evening-board','evening-event','evening-source','brief-theme','brief-quote','opportunities','theme-feed','theme-etfs','event-detail'].includes(route.type)) {
      $('#assistantContent').innerHTML=`<h2 class="assistant-greeting">了解${esc(p.title)}</h2><p class="assistant-copy">${p.description}</p><div class="sample-notice">可以围绕当前内容继续提问。演示回答采用模拟内容，尚未调用真实 AI。</div>`;
    }
  }
  assistantDefault=function(){originalAssistantDefault();syncAssistant();};
  const originalSetContext=setContext;
  setContext=function(c){originalSetContext(c);syncAssistant();};

  // Preserve the parent dialog DOM so its event handlers and reading position survive.
  const originalSource=showBriefSource, originalCloseModal=closeModal;
  showBriefSource=function(...args){
    if ($('#modal').open && $('#modalTitle').textContent==='要闻速读') {
      sourceParent={title:$('#modalTitle').textContent,eyebrow:$('#modalEyebrow').textContent,nodes:[...$('#modalBody').childNodes],focus:document.activeElement,scroll:$('#modal').scrollTop};
    }
    originalSource(...args);
    if (sourceParent) {
      $('#modalBody').insertAdjacentHTML('afterbegin','<button class="back-button" id="sourceBack">'+icon('arrow-left')+'返回要闻速读</button>');
      $('#sourceBack').onclick=()=>closeModal();
      $('#sourceBack').focus();$('#modal').scrollTop=0;
    }
  };
  closeModal=function(){
    if (sourceParent) {
      const parent=sourceParent;sourceParent=null;
      $('#modalTitle').textContent=parent.title;$('#modalEyebrow').textContent=parent.eyebrow;
      $('#modalBody').replaceChildren(...parent.nodes);$('#modal').scrollTop=parent.scroll;parent.focus?.focus({preventScroll:true});
    } else originalCloseModal();
  };
  $('#closeModal').onclick=()=>closeModal();
  $('#modal').addEventListener('cancel',e=>{if(sourceParent){e.preventDefault();closeModal();}});

  const background=[$('#main'),$('.sidebar'),$('.topbar'),$('.design-strip')];
  function drawerState(open) {
    const active=mobile.matches&&open;
    background.forEach(el=>el.inert=active);
    document.body.classList.toggle('assistant-modal-open',active);
    const aside=$('#assistant');
    if(active){aside.setAttribute('role','dialog');aside.setAttribute('aria-modal','true');}
    else {aside.removeAttribute('role');aside.removeAttribute('aria-modal');}
  }
  const originalOpenAssistant=openAssistant,originalCloseAssistant=closeAssistant;
  openAssistant=function(){
    if (!$('#assistant').contains(document.activeElement)) assistantTrigger=document.activeElement;
    originalOpenAssistant();drawerState(true);
    if(mobile.matches)$('#closeAssistant').focus({preventScroll:true});
  };
  closeAssistant=function(){originalCloseAssistant();drawerState(false);if(assistantTrigger?.isConnected)assistantTrigger.focus({preventScroll:true});};
  $('#closeAssistant').onclick=()=>closeAssistant();
  mobile.addEventListener('change',()=>{
    const open=document.body.classList.contains('show-assistant-mobile')&&!$('#assistant').hidden;
    drawerState(open);
    if(mobile.matches&&open)$('#closeAssistant').focus({preventScroll:true});
  });
  document.addEventListener('keydown',e=>{
    if(!document.body.classList.contains('assistant-modal-open')||$('#modal').open)return;
    if(e.key==='Escape'){e.preventDefault();closeAssistant();return;}
    if(e.key!=='Tab')return;
    const controls=[...$('#assistant').querySelectorAll('button,a,input,textarea,select,[tabindex="0"]')].filter(el=>!el.disabled&&el.getClientRects().length);
    const first=controls[0],last=controls.at(-1);
    if(e.shiftKey&&document.activeElement===first){e.preventDefault();last?.focus();}
    else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first?.focus();}
  });
  document.addEventListener('click', e=>{
    const el=e.target.closest('a,button'); if(!el)return;
    pendingFocus=focusKey(el);
    queueMicrotask(()=>{pendingFocus=null;});
    if(el.hasAttribute('data-navigation-back')){e.preventDefault();e.stopImmediatePropagation();goBack();return;}
    if(el.hasAttribute('data-use-page')){
      context=null;taskDraft=null;assistantDefault();openAssistant();$('#chatInput').focus();return;
    }
    if(el.dataset.securityType){
      e.preventDefault();const value=el.dataset.securityType;
      pendingFocus='[data-security-type="'+value+'"]';
      showBriefTheme(issueFromId(route.issueId),value,route.sort,true);return;
    }
    if(el.tagName==='A'&&el.dataset.briefAction){
      if(e.ctrlKey||e.metaKey||e.shiftKey||e.altKey||e.button!==0){e.stopImmediatePropagation();return;}
      e.preventDefault();
    }
    if(el.dataset.briefAction==='section'){
      e.preventDefault();e.stopImmediatePropagation();
      const id=el.dataset.briefIssue || selectedIssue.id, section=el.dataset.briefValue;
      if(route.type!=='brief'||route.issueId!==id)showBrief(id);
      route.section=section;current.route.section=section;
      history.replaceState(clone(current),'',urlFor(current.route));
      $((window.workbenchClient.desktop?'#briefView ':'')+'#brief-'+section)?.scrollIntoView({block:'start'});
      checkpoint();
    }
    if(el.dataset.flow==='clear-context')queueMicrotask(()=>assistantDefault());
  },true);
  document.addEventListener('change',e=>{pendingFocus=focusKey(e.target);queueMicrotask(()=>{pendingFocus=null;});},true);

  const initial=history.state?.prototypeNavigation && urlFor(history.state.route)===location.hash ? history.state : {prototypeNavigation:true,route:parseURL(),trail:[],scroll:null};
  history.replaceState(initial,'',urlFor(initial.route));renderState(initial);
})();
