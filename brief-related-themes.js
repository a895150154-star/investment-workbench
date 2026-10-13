/* Desktop report category links reuse fixed prototype quotes and shared theme details. */
(()=>{
 if(!window.workbenchClient.desktop)return;
 const added=[
  {id:'semiconductor-materials',name:'半导体材料',tag:'板块',summary:briefNews.find(n=>String(n.id)==='2490104').summary,read:briefNewsAnalysis['2490104'].summary,stocks:['event-zctq'],etfs:[],eventIds:['2490104'],signals:['半导体材料交付进展']},
  {id:'star50',name:'科创50',tag:'指数',summary:'成长指数内部走势分化',read:'核对指数表现与个股经营能否相互印证。',stocks:['event-haiguang','event-zctq'],etfs:[],eventIds:['2490095','2490104'],signals:[]},
  {id:'chinext',name:'创业板指',tag:'指数',summary:'成长指数内部走势分化',read:'核对指数表现与个股经营能否相互印证。',stocks:['300308','300502','300394'],etfs:[],eventIds:['xys','zjxc','tftx'],signals:[]},
  {id:'artificial-intelligence-concept',name:'人工智能概念',tag:'概念',summary:opportunityTheme('ai-applications').summary,read:opThemeLookpoints['ai-applications']+' '+opThemeLookpoints['semiconductors'],stocks:['event-haiguang'],etfs:['515980'],eventIds:['2490113','2490095'],signals:['手机 AI 方案发布','端侧算力新品发布']}
 ];
 const mappings=[
  {kind:'板块',name:'半导体',themeId:'semiconductors',sector:'半导体'},
  {kind:'板块',name:'半导体材料',themeId:'semiconductor-materials',sector:'半导体材料'},
  {kind:'板块',name:'光通信',themeId:'optical-interconnect',sector:'光通信'},
  {kind:'主题',name:'算力互联',themeId:'optical-interconnect',quoteTheme:'optical-interconnect'},
  {kind:'指数',name:'科创50',themeId:'star50',index:'star50'},
  {kind:'指数',name:'创业板指',themeId:'chinext',index:'chinext'},
  {kind:'主题',name:'端侧算力',themeId:'ai-applications',quoteTheme:'ai-applications'},
  {kind:'概念',name:'人工智能概念',themeId:'artificial-intelligence-concept',concept:'人工智能概念'}
 ];
 function lookup(kind,name){
  const m=mappings.find(m=>m.kind===kind&&m.name===name);if(!m)return null;
  let value;
  if(m.sector)value=window.overviewV3Data?.securities.find(s=>s.sector===m.sector)?.sectorToday;
  if(m.index)value=indexOverviewData.quotes.find(q=>q.id===m.index)?.percent;
  if(m.concept)value=eveningBoards.concept.find(b=>b[1]===m.concept)?.[3];
  if(m.quoteTheme)value=opportunityThemeChanges[m.quoteTheme];
  const change=value==null?null:Number(String(value).replace(/[%+]/g,'').replace(/[−–]/g,'-'));
  return {...m,change:Number.isFinite(change)?change:null};
 }
 for(const t of added){
  opportunityThemes.push(t);
  hotspotThemeEventIds[t.id]=t.eventIds;
  hotspotThemeSignals[t.id]=t.signals;
  opThemeLookpoints[t.id]=t.read;
  const m=mappings.find(m=>m.themeId===t.id);
  // Sector data loads later; the list reads its quote through category lookup below.
  if(!m.sector)opportunityThemeChanges[t.id]=lookup(m.kind,m.name).change;
 }
 const previousEvents=opportunityEvents;
 opportunityEvents=function(id){
  const t=added.find(t=>t.id===id);if(!t)return previousEvents(id);
  return t.eventIds.map(id=>{
   const company=briefItems.find(i=>i.id===id);
   if(company)return {id,title:company.a.title,date:company.a.date,summary:company.summary,origin:'public'};
   const news=briefNews.find(n=>String(n.id)===id);
   return news?{...news,id,date:news.time,origin:'public'}:null;
  }).filter(Boolean).sort((a,b)=>b.date.localeCompare(a.date));
 };
 const previousCard=opThemeCard;
 opThemeCard=function(t,issueId){
  const m=mappings.find(m=>m.themeId===t.id);
  if(added.some(a=>a.id===t.id)&&m)opportunityThemeChanges[t.id]=lookup(m.kind,m.name).change;
  return previousCard(t,issueId);
 };
 const previousDetail=showBriefTheme;
 showBriefTheme=function(issue,...args){
  previousDetail(issue,...args);
  const t=added.find(t=>t.id===route.themeId);if(!t)return;
  const m=mappings.find(m=>m.themeId===t.id),quote=lookup(m.kind,m.name);
  const header=$('#flowView .flow-page-head');
  header?.insertAdjacentHTML('afterend',`<p class="personal-theme-quote"><span>今日涨跌</span> ${opChange(quote)}</p>`);
  if(t.tag==='指数'){
   const nodes=[...document.querySelectorAll('#flowView .op-meta')];
   for(const n of nodes)if(n.textContent==='观察名单 · 不代表受益判断')n.textContent='分类关联示例 · 成分名单未核验';
   const tools=$('#flowView .op-inline-tools>span');if(tools)tools.textContent='分类关联示例 · 成分名单未核验';
  }
 };
 const style=document.createElement('style');style.textContent='.personal-theme-quote{display:flex;align-items:center;gap:12px;margin:0 0 20px;font-size:12px;color:var(--muted)}.personal-theme-quote .up{color:var(--red)}.personal-theme-quote .down{color:var(--green)}';document.head.append(style);
 window.briefRelatedThemes={ids:added.map(t=>t.id),added,mappings,lookup};
})();
