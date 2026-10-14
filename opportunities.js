/* v2.8: shared opportunity views. Loaded before the navigation controller. */
const opportunityQuotes = [...briefSnapshotData.quotes.map(q=>({...q,type:q.code==='515880'?'etf':'stock',index:q.code==='515880'?'中证全指通信设备指数':null,reference:null})),...opportunityReferenceQuotes,...hotspotIdentities];
const opportunitySecurity = value => value==null?undefined:opportunityQuotes.find(q=>q.code===value||q.id===value||q.name===value);
const opportunityThemes = [
 {id:'optical-interconnect',name:'光模块与算力互联',tag:'光通信',summary:'从近期公司披露出发，串联行业背景、产品交付与关联标的。',read:'算力集群扩建提升了对高速连接的需求，产品升级带来新的客户验证与交付机会。产业催化能否持续，取决于订单兑现、产能爬坡和价格变化。',stocks:['300502','601869','300394','300308'],etfs:['159363','515980','159381','159388','515050','159507','159695','515880','159583']},
 {id:'semiconductors',name:'半导体',tag:'产品与产业',summary:'海光信息发布端侧算力芯片，关注产品落地与客户进展。',read:'端侧 AI 和国产算力升级共同拓展芯片应用。分别观察设计、设备与材料公司的客户导入和交付节奏，避免把不同产业环节视作同一增长逻辑。',stocks:['event-haiguang','event-zctq','ref-zhongkeyi','ref-tuojing'],etfs:['ref-chip-design']},
 {id:'ai-applications',name:'AI 应用',tag:'应用进展',summary:'从手机 AI 方案出发，跟踪应用落地和合作进展。',read:'方案发布是研究起点，后续需核对实际合作、使用情况与商业化披露。',stocks:[],etfs:[]},
 {id:'environmental-policy',name:'环境治理',tag:'政策线索',summary:'污染防治政策推动治理需求，关注地方项目与公司订单。',read:'政策催化通过地方实施方案、项目招标和企业合同逐步传导。重点跟进项目进度和回款，警惕政策预期先行而经营兑现偏慢。',stocks:['605069','688057','301519'],etfs:[]},
 {id:'innovative-drugs',name:'创新药',tag:'研发与商业化',summary:'从研发进展与海外合作，观察创新药的商业化机会。',read:'重点产品临床、授权合作与商业化形成多条催化线索。逐家公司看里程碑和销售兑现，研发失败、审批延期或竞争加剧都会改变增长预期。',stocks:['ref-zhongsheng','ref-aoruite','ref-kailaiying'],etfs:['ref-vaccine-cm','ref-vaccine-js']}
];
const opportunityTheme = id => opportunityThemes.find(t=>t.id===id)||opportunityThemes[0];
const opportunityCategories = [['all','全部'],['broad','宽基'],['industry','行业／主题'],['overseas','海外／商品']];
const opEtfCategory = value => ({thematic:'industry',commodity:'overseas'}[value] || (opportunityCategories.some(([id])=>id===value)?value:'all'));
const opEtfCategoryOf = q => q.etfCategory || (/沪深300|中证(?:500|1000|A50)|上证50|创业板指/.test(q.index||'')?'broad':/纳斯达克|日经|标普|TOPIX|港股|黄金|能源化工/.test((q.index||'')+q.name)?'overseas':'industry');
const opportunityTabs = [['themes','主题机会'],['etfs','ETF机会'],['hotspots','热点机会']];
const opportunityWatchKey='vra-prototype-v28-watchlist';
let opportunityWatch=[];
try{const stored=JSON.parse(localStorage.getItem(opportunityWatchKey)||'[]');if(Array.isArray(stored))opportunityWatch=stored.filter(c=>opportunitySecurity(c));}catch{}
const opIssue = () => selectedIssue || briefSnapshot().displayed;
const opLink=(label,r,cls='op-link')=>`<a class="${cls}" href="${esc(opportunityRouteURL(r))}" data-op-route="${esc(JSON.stringify(r))}">${label}</a>`;
const opThemeRoute=(id,issueId=opIssue().id)=>({type:'brief-theme',themeId:id,issueId,filter:'all',sort:'relevance'});
const opQuoteRoute=(key,issueId=opIssue().id)=>({type:'brief-quote',company:opportunitySecurity(key).name,code:key,issueId});
const opSecurityKey=q=>q.code||q.id;
const opQuoteTheme=q=>opportunityThemes.find(t=>t.id===q.themeId)||opportunityThemes.find(t=>[...t.stocks,...t.etfs].includes(opSecurityKey(q)))||opportunityThemes[0];
const opBack=()=>'<button class="back-button" data-navigation-back="true">'+icon('arrow-left')+'返回上一页</button>';
function opportunityRouteURL(r){
 if(r.type==='reminder-history'){const args=new URLSearchParams();if(r.security)args.set('stock',r.security);if(r.kind)args.set('kind',r.kind);if(r.page>1)args.set('page',r.page);return '#/reminder-history'+(args.size?'?'+args:'');}
 const args=new URLSearchParams(); if(r.issueId)args.set('issue',r.issueId);
 if(r.type==='event-detail'){if(r.section)args.set('section',r.section);if(r.themeId)args.set('theme',r.themeId);return '#/events/'+encodeURIComponent(r.eventId)+'?'+args;}
 if(r.type==='opportunities') {args.set('tab',r.tab||'themes');if(r.category&&r.category!=='all')args.set('category',r.category);if(r.sort&&r.sort!=='reference')args.set('sort',r.sort);if(r.query)args.set('q',r.query);if(r.themeFilter&&r.themeFilter!=='all')args.set('theme',r.themeFilter);if(r.watched)args.set('watch','yes');if(r.etfPeriods)args.set('periods',r.etfPeriods.join(','));if(r.etfFactors)args.set('factors',r.etfFactors.join(','));return '#/opportunities?'+args;}
 if(r.type==='brief-theme'){args.set('type',r.filter||'all');args.set('sort',r.sort||'relevance');return '#/themes/'+(r.themeId||'optical-interconnect')+'?'+args;}
 if(r.type==='theme-feed'||r.type==='theme-etfs'){if(r.item)args.set('item',r.item);if(r.sort)args.set('sort',r.sort);if(r.query)args.set('q',r.query);if(r.watched)args.set('watch','yes');return '#/themes/'+(r.themeId||'optical-interconnect')+'/'+(r.type==='theme-etfs'?'etfs':r.mode||'hotspots')+'?'+args;}
 if(r.type==='etf-index')return '#/etf-index/'+encodeURIComponent(r.code)+'?'+args;
 if(r.type==='brief-quote'){const q=opportunitySecurity(r.code||r.company);if(q)return '#/'+(q.type==='etf'?'etfs':'stocks')+'/'+opSecurityKey(q)+'?'+args;}
 return null;
}
function opportunityParse(path,args){
 if(path.replace(/^\//,'')==='reminder-history')return {type:'reminder-history',security:args.get('stock')||'',kind:args.get('kind')||'',page:Number(args.get('page'))||1};
 const parts=path.split('/').filter(Boolean),issueId=(issueFromId(args.get('issue'))||briefSnapshot().displayed).id;
 const sort=['name','price-desc','price-asc','change-desc','change-asc'].includes(args.get('sort'))?args.get('sort'):'reference';
 if(parts[0]==='events'&&parts[1])return {type:'event-detail',eventId:decodeURIComponent(parts[1]),themeId:args.get('theme')||'',section:args.get('section')||'',issueId};
 if(parts[0]==='opportunities')return {type:'opportunities',tab:opportunityTabs.some(([v])=>v===args.get('tab'))?args.get('tab'):'themes',themeFilter:args.get('theme')||'all',category:opEtfCategory(args.get('category')),etfPeriods:args.has('periods')?args.get('periods').split(',').filter(Boolean):undefined,etfFactors:args.has('factors')?args.get('factors').split(',').filter(Boolean):undefined,sort,query:args.get('q')||'',watched:args.get('watch')==='yes',issueId};
 if(parts[0]==='themes'&&opportunityThemes.some(t=>t.id===parts[1])){
 const themeId=parts[1];if(parts[2]==='etfs')return {type:'theme-etfs',themeId,issueId,sort,query:args.get('q')||'',watched:args.get('watch')==='yes'};
 if(['hotspots','timeline'].includes(parts[2]))return {type:'theme-feed',themeId,issueId,mode:parts[2],item:args.get('item')||''};
 return {type:'brief-theme',themeId,issueId,filter:['stock','etf'].includes(args.get('type'))?args.get('type'):'all',sort:args.get('sort')==='name'?'name':'relevance'};
 }
 if(parts[0]==='etf-index'){const q=opportunitySecurity(decodeURIComponent(parts[1]||''));if(q?.type==='etf'&&q.index)return {type:'etf-index',code:opSecurityKey(q),issueId};}
 if(['etfs','stocks'].includes(parts[0])){const q=opportunitySecurity(parts[1]);if(q)return {type:'brief-quote',company:q.name,code:opSecurityKey(q),issueId};}
 return null;
}
function opportunityRouteName(r){if(r.type==='etf-index')return opportunitySecurity(r.code)?.index||'指数行情';if(r.type==='reminder-history')return '历史提醒';if(r.type==='event-detail')return '事件详情';if(r.type==='opportunities')return '机会浏览 · '+(opportunityTabs.find(([v])=>v===r.tab)?.[1]||'主题');if(r.type==='brief-theme')return opportunityTheme(r.themeId).name;if(r.type==='theme-feed')return opportunityTheme(r.themeId).name+' · '+(r.mode==='timeline'?'发展脉络':'热点事件');if(r.type==='theme-etfs')return opportunityTheme(r.themeId).name+' · 关联 ETF';return null;}
function opportunityFallback(r){if(r.type==='etf-index')return {type:'opportunities',tab:'etfs',issueId:r.issueId};if(r.type==='reminder-history')return {type:'stock-workbench',tab:'triggers'};if(r.type==='event-detail')return r.themeId?{type:'theme-feed',themeId:r.themeId,issueId:r.issueId,mode:'hotspots'}:{type:'brief',issueId:r.issueId};if(['theme-etfs','theme-feed'].includes(r.type))return opThemeRoute(r.themeId,r.issueId);if(r.type==='brief-theme')return {type:'opportunities',tab:'themes',issueId:r.issueId};return null;}
function renderOpportunityRoute(r){if(r.type==='etf-index')return showEtfIndex(r);if(r.type==='stock-workbench')return showReviewAccount(r.tab);if(r.type==='reminder-history')return showTrackingHistory(r);if(r.type==='event-detail')return showTrackedEvent(r);if(r.type==='opportunities')return showOpportunities(r);if(r.type==='theme-feed')return showThemeFeed(r);if(r.type==='theme-etfs')return showRelatedETFs(r);if(r.type==='brief-theme')return showBriefTheme(issueFromId(r.issueId),r.filter,r.sort,true,r.themeId);if(r.type==='brief-quote')return briefQuote(r.code||r.company,issueFromId(r.issueId));}
function opPrice(q){if(q.price==null)return '<span class="op-muted">未获取</span>';return `<strong class="op-number">${esc(typeof q.price==='number'?q.price.toFixed(q.type==='etf'?3:2):q.price)}<small> 元</small></strong>`;}
function opChange(q){return q.change==null?'<span class="op-muted">未获取</span>':`<span class="op-number ${Number(q.change)<0?'down':'up'}">${typeof q.change==='number'?(q.change>0?'+':'')+q.change.toFixed(2):esc(q.change)}%</span>`;}
function opSource(q){if(q.sourceEvent)return briefSource(briefNews.find(n=>String(n.id)===q.sourceEvent)?.title||q.name,opIssue());return q.reference?'<span class="op-meta">历史样本 · 非实时行情</span>':briefSource('腾讯行情 · '+q.name,opIssue());}
function opWatch(q){const yes=opportunityWatch.includes(opSecurityKey(q));return `<button class="op-watch ${yes?'selected':''}" data-op-watch="${opSecurityKey(q)}" aria-pressed="${yes}" aria-label="${yes?'移出':'加入'}原型自选：${esc(q.name)}">${icon(yes?'check':'plus')}<span>${yes?'已自选':'自选'}</span></button>`;}
function opAsk(label,object,question){return `<button class="button" data-op-ask="${esc(question)}" data-op-object="${esc(object)}">${icon('sparkles')}${label}</button>`;}
function opNotice(){return '<p class="op-disclosure">演示模式 · AI 解读与产业催化为模拟内容，仅用于原型演示；行情为历史样本，尚未接入实时 AI 与监控。</p>';}
function opRows(quotes,issueId){return `<div class="op-table-wrap"><table class="op-table"><caption class="sr-only">标的参考列表；最新价单位为元，涨跌幅单位为百分比</caption><thead><tr><th scope="col">名称 / 代码</th><th scope="col">参考价</th><th scope="col">涨跌幅</th><th scope="col">自选</th></tr></thead><tbody>${quotes.map(q=>`<tr><td>${opLink(esc(q.name)+icon('arrow-up-right'),opQuoteRoute(opSecurityKey(q),issueId))}<small>${q.code||'代码未获取'}${q.index?' · '+esc(q.index):''}</small>${opSource(q)}</td><td>${opPrice(q)}</td><td>${opChange(q)}</td><td>${opWatch(q)}</td></tr>`).join('')}</tbody></table></div>`;}
function opEmpty(copy='当前分类尚未加入演示资料。'){return `<div class="op-empty"><h2>暂没有可展示的资料</h2><p>${copy}这不表示市场没有相关标的。</p>${opLink('返回全部 ETF',{type:'opportunities',tab:'etfs',category:'all',issueId:route.issueId||opIssue().id},'button')}</div>`;}
function opSorted(quotes,r){let list=quotes.filter(q=>(!r.query||(q.name+(q.code||'')).includes(r.query))&&(!r.watched||opportunityWatch.includes(opSecurityKey(q))));if(r.sort==='name')list.sort((a,b)=>a.name.localeCompare(b.name,'zh-CN'));else if(/^(price|change)-(asc|desc)$/.test(r.sort||'')){const [key,d]=r.sort.split('-');list.sort((a,b)=>a[key]==null?1:b[key]==null?-1:(d==='asc'?Number(a[key])-Number(b[key]):Number(b[key])-Number(a[key])));}return list;}
function opControls(r){return `<form class="op-controls" id="opFilters"><label class="op-search">搜索名称或代码<input type="search" name="query" value="${esc(r.query||'')}" placeholder="例如：通信、159363…" autocomplete="off"></label><label>排序<select name="sort">${[['reference','资料顺序'],['name','名称'],['price-desc','参考价：高到低'],['price-asc','参考价：低到高'],['change-desc','涨跌幅：高到低'],['change-asc','涨跌幅：低到高']].map(([v,t])=>`<option value="${v}" ${r.sort===v?'selected':''}>${t}</option>`).join('')}</select></label><label class="op-checkbox"><input type="checkbox" name="watched" ${r.watched?'checked':''}>只看原型自选</label><button class="button" type="submit">应用筛选</button></form>`;}
function opBindFilters(r,fn){const form=$('#opFilters');if(!form)return;const update=()=>fn({...r,query:form.elements.query.value.trim(),sort:form.elements.sort.value,watched:form.elements.watched.checked},true);form.onsubmit=e=>{e.preventDefault();update();};form.elements.sort.onchange=update;form.elements.watched.onchange=update;}
function opportunityEvents(themeId){
 if(themeId==='environmental-policy')return hotspotReferenceEvents;
 if(themeId==='semiconductors')return [briefNews[2],briefNews[3]].map(n=>({...n,date:n.time,id:n.id,origin:'public'})).sort((a,b)=>b.date.localeCompare(a.date));
 if(themeId==='ai-applications')return [{...briefNews[1],date:briefNews[1].time,id:briefNews[1].id,origin:'public'}];
 if(themeId==='innovative-drugs')return [];
 if(themeId!=='optical-interconnect')return [];
 return [
 ...briefItems.map(i=>({id:i.id,title:i.a.title,date:i.a.date,summary:i.summary,origin:'public'})).sort((a,b)=>b.date.localeCompare(a.date)),
 {id:'reference-ipo',title:'DeepSeek 启动科创板 IPO 筹备',date:'09/10 · 截图标注',summary:'参考截图将 AI 企业融资与算力建设预期联系起来。此处仅展示该资讯线索，尚未取得原始报道，不确认事件属实或相关公司受益。',origin:'reference'},
 {id:'reference-market',title:'高盛上调全球光模块市场规模预测',date:'09/08 · 截图标注',summary:'截图中的行业预测线索，原始研报与预测口径未获取。后续需要核对需求假设、产品范围及预测修订依据。',origin:'reference'},
 {id:'reference-earnings',title:'中际旭创半年度业绩披露',date:'08/24 · 截图标注',summary:'截图收录了半年度业绩信息；本轮未解析财报，不转录其中的增长判断。',origin:'reference'}
 ];
}
function opEventSource(e){return e.origin==='reference'?'<span class="op-meta">模拟事件场景</span>':briefSource(e.title,opIssue());}
function opEventPreview(e,themeId,issueId){return `<article class="op-event-preview"><span class="op-meta">${esc(e.date)} · ${e.origin==='reference'?'模拟事件':'公开资料快照'}</span>${opLink(esc(e.title)+icon('chevron-right'),{type:'event-detail',eventId:e.id,themeId,issueId})}<p>${esc(e.summary)}</p>${opEventSource(e)}</article>`;}
const opThemeLookpoints={
 'optical-interconnect':'算力集群扩张带来高速互联需求。关注光模块产品升级、客户订单与交付进展，区分产业预期和经营兑现。',
 'innovative-drugs':'从产业政策与研发进展寻找研究线索。进一步核对产品审批、商业化收入及海外合作，判断预期能否兑现。',
 'semiconductors':'AI 需求与国产替代提供产业观察线索。按芯片设计、设备及材料区分环节，继续追踪客户验证与实际交付。',
 'ai-applications':'从手机 AI 方案继续追踪应用落地。关注合作进展与可验证的商业化信息。'
};
function opThemeSecurities(t,issueId,type){
 const keys=type==='stock'?t.stocks:t.etfs;
 const target=type==='stock'?{...opThemeRoute(t.id,issueId),filter:'stock'}:{type:'theme-etfs',themeId:t.id,issueId};
 return `<div class="theme-associations"><span class="theme-association-label">${type==='stock'?'关联个股':'关联ETF'}</span><div class="theme-security-chips">${keys.length?keys.slice(0,type==='stock'?3:2).map(key=>{const q=opportunitySecurity(key);return opLink(`<span>${esc(q.name)}</span>${opChange(q)}`,opQuoteRoute(key,issueId),'theme-security-chip');}).join(''):'<span class="theme-missing">关联资料待补充</span>'}</div>${keys.length?opLink((type==='stock'?'全部个股':'全部ETF')+' '+icon('arrow-right'),target,'theme-more'):''}</div>`;
}
function opThemeCard(t,issueId){return `<article class="theme-opportunity"><header><h2>${opLink((t.id==='optical-interconnect'?'光模块':t.name)+opChange({change:opportunityThemeChanges[t.id]})+icon('chevron-right'),opThemeRoute(t.id,issueId),'theme-title-link')}</h2>${opLink('查看主题 '+icon('arrow-right'),opThemeRoute(t.id,issueId),'theme-more')}</header><div class="theme-lookpoint"><p><span class="theme-lookpoint-label">AI 看点</span>${opThemeLookpoints[t.id]||t.read}</p></div>${hotspotThemeDrivers(t,issueId)}${opThemeSecurities(t,issueId,'stock')}${opThemeSecurities(t,issueId,'etf')}</article>`;}
function opThemeToolbar(r,nav){return `<header class="theme-browser-head"><h1>机会浏览</h1><button class="theme-source" data-theme-material="overview">演示说明 ${icon('arrow-up-right')}</button></header><div class="theme-browser-toolbar">${nav}<form id="themeSearch" role="search"><label class="sr-only" for="themeQuery">搜索主题或标的</label><input id="themeQuery" name="query" type="search" placeholder="搜索主题或标的" value="${esc(r.query||'')}" autocomplete="off"><button type="submit" aria-label="搜索主题或标的">${icon('search')}</button></form></div><p class="theme-data-caption">主题涨跌 · 历史样本</p>`;}
function showOpportunities(r={},retain=false){
 r={type:'opportunities',tab:'themes',category:'all',sort:'reference',query:'',watched:false,issueId:opIssue().id,...r};
 const nav=`<nav class="op-tabs" aria-label="机会栏目">${opportunityTabs.map(([v,t])=>opLink(t,{...r,tab:v,query:'',watched:false},r.tab===v?'selected':'')).join('')}</nav>`;
 let body='';
 if(r.tab==='themes'){
 const order=['optical-interconnect','innovative-drugs','semiconductors','ai-applications','environmental-policy',...(window.briefRelatedThemes?.ids||[])];
 const list=order.map(opportunityTheme).filter(t=>!r.query||(t.name+[...t.stocks,...t.etfs].map(k=>opportunitySecurity(k).name+' '+(opportunitySecurity(k).code||'')).join(' ')).toLowerCase().includes(r.query.toLowerCase()));
 body='<div class="theme-opportunity-list">'+(list.length?list.map(t=>opThemeCard(t,r.issueId)).join(''):'<div class="theme-search-empty"><h2>没有匹配的主题</h2><p>试试主题名称、关联标的名称或已知代码。</p>'+opLink('查看全部主题',{...r,query:''},'button')+'</div>')+'</div><p class="theme-browser-footnote">主题与标的行情为历史样本，非实时行情。</p>';
 }
 if(r.tab==='hotspots')body=hotspotOpportunityList(r.issueId);
 if(r.tab==='etfs'){
 r.category=opEtfCategory(r.category);r.query='';r.watched=false;r.sort='reference';
 const categories=`<nav class="op-categories" aria-label="ETF 分类">${opportunityCategories.map(([v,t])=>opLink(t,{...r,category:v},r.category===v?'selected':'')).join('')}<button class="etf-filter-entry" data-etf-filter-open aria-label="ETF机会筛选" title="ETF机会筛选"><svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 4h18l-7 8v8l-4-2v-6Z"/></svg></button></nav>`;
 const list=opportunityQuotes.filter(q=>q.type==='etf'&&(r.category==='all'||opEtfCategoryOf(q)===r.category)&&etfMatchesFilters(q,r));
 body=categories+(list.length?etfOpportunityCards(list,r.issueId):'<div class="op-empty"><h2>暂无符合条件的ETF</h2><p>试试其他期限、因子或分类。</p><button class="button" data-etf-filter-open>调整筛选</button></div>');
 }
 if(r.tab==='themes'){
 page('机会浏览',`<div class="theme-back">${opBack()}</div>`+opThemeToolbar(r,nav)+opNotice()+body,'opportunities');route=r;
 $('#themeSearch').onsubmit=e=>{e.preventDefault();showOpportunities({...r,query:$('#themeQuery').value.trim()},true);};return;
 }
 page('机会浏览',opBack()+head('发现 / 浏览','机会浏览','按主题、ETF 和热点，发现机会背后的逻辑。',opAsk('围绕当前栏目提问','机会浏览 · '+(opportunityTabs.find(([v])=>v===r.tab)?.[1]||'主题'),'如何从当前资料中挑选需要进一步核验的研究线索？'))+nav+opNotice()+body,'opportunities');route=r;opBindFilters(r,showOpportunities);
}
showBriefTheme=function(issue,filter='all',sort='relevance',retainOrigin=false,themeId='optical-interconnect'){
 const t=opportunityTheme(themeId),r={type:'brief-theme',themeId:t.id,issueId:issue.id,filter,sort};
 const events=opportunityEvents(t.id),feed=mode=>({type:'theme-feed',themeId:t.id,issueId:issue.id,mode});
 const etfs=t.etfs.slice(0,3).map(opportunitySecurity);let stocks=t.stocks.map(opportunitySecurity);if(sort==='name')stocks.sort((a,b)=>a.name.localeCompare(b.name,'zh-CN'));
 const nav=`<nav class="op-tabs" aria-label="主题内容">${[['all','主题全览'],['stock','关联个股'],['etf','关联 ETF']].map(([v,label])=>opLink(label,{...r,filter:v},filter===v?'selected':'')).join('')}</nav>`;
 let body='';
 if(filter==='all')body=`<div class="op-theme-grid">${panel('热点事件',events.slice(0,2).map(e=>opEventPreview(e,t.id,issue.id)).join('')||'<p>热点资料尚未补齐。</p>',opLink('查看全部热点 '+icon('chevron-right'),feed('hotspots')))}${panel('发展脉络',`<ol class="op-timeline">${events.slice(0,3).map(e=>`<li><time>${esc(e.date)}</time><p>${esc(e.title)}</p></li>`).join('')||'<li>等待补充带日期的原始材料。</li>'}</ol><p class="op-meta">按披露记录串联；公司事项与产业趋势需分别判断。</p>`,opLink('查看完整脉络 '+icon('chevron-right'),feed('timeline')))}</div>`+panel('主题解读',`<p class="op-lead">${t.read}</p><div class="op-reading-path"><span>需求线索</span>${icon('chevron-right')}<span>产品与客户</span>${icon('chevron-right')}<span>订单与交付</span>${icon('chevron-right')}<span>经营兑现</span></div><p class="op-meta">研究阅读路径 · 非已验证的因果链</p>${opAsk('问闪电猫：还缺哪些证据？',t.name,`判断${t.name}的经营兑现，还需要哪些原始证据？`)}`);
 if(filter!=='stock')body+=panel('关联 ETF',etfs.length?'<p class="op-meta">沿主题查看相关 ETF，比较指数覆盖与产品差异。</p>'+opRows(filter==='etf'?t.etfs.map(opportunitySecurity):etfs,issue.id):'<p class="op-meta">该主题的 ETF 资料尚未补齐。</p>',opLink('浏览全部关联 ETF '+icon('chevron-right'),{type:'theme-etfs',themeId:t.id,issueId:issue.id,sort:'reference'}));
 if(filter!=='etf')body+=panel('关联个股',stocks.length?`<div class="op-inline-tools"><span>观察名单 · 不代表受益判断</span><label>排列方式<select id="opStockSort"><option value="relevance" ${sort!=='name'?'selected':''}>资料顺序</option><option value="name" ${sort==='name'?'selected':''}>名称</option></select></label></div>`+opRows(stocks,issue.id):'<p class="op-meta">尚未补齐关联公司的原始业务资料。</p>');
 page(t.name,opBack()+head('主题 / 共用详情',t.name,t.summary,opAsk('围绕主题提问',t.name,`如何梳理${t.name}的研究逻辑与反证？`))+opNotice()+nav+body,'brief-theme');route=r;
 if($('#opStockSort'))$('#opStockSort').onchange=e=>showBriefTheme(issue,filter,e.target.value,true,t.id);
};
function showThemeFeed(r){const t=opportunityTheme(r.themeId),timeline=r.mode==='timeline',events=opportunityEvents(t.id);page(opportunityRouteName(r),opBack()+head(t.name,timeline?'发展脉络':'热点事件',timeline?'公开披露与截图线索分组排列，组内按日期倒序；截图日期未标明年份。':'阅读事件详情与来源，再决定是否追踪。')+opNotice()+(events.length?`<div class="${timeline?'op-feed-timeline':'op-feed'}">${events.map(e=>`<article id="op-event-${e.id}" class="op-feed-item"><span class="op-meta">${esc(e.date)} · ${e.origin==='reference'?'截图线索，待核验':'公开资料快照'}</span><h2>${opLink(esc(e.title)+icon('chevron-right'),{type:'event-detail',eventId:e.id,themeId:t.id,issueId:r.issueId})}</h2><p>${esc(e.summary)}</p>${opEventSource(e)}</article>`).join('')}</div>`:'<div class="op-empty">当前尚未补齐带日期的资料。</div>'),'theme-feed');route=r;if(r.item)$('#op-event-'+CSS.escape(r.item))?.scrollIntoView({block:'start'});}
function showRelatedETFs(r,retain=false){r={type:'theme-etfs',themeId:'optical-interconnect',issueId:opIssue().id,sort:'reference',query:'',watched:false,...r};const t=opportunityTheme(r.themeId),list=opSorted(t.etfs.map(opportunitySecurity),r);page(opportunityRouteName(r),opBack()+head(t.name,'关联 ETF','沿主题查看相关 ETF，了解机会逻辑与后续关注。')+opNotice()+`<div class="op-stat-grid"><div><span>当前列表</span><strong>${list.length}<small> 只</small></strong></div><div><span>涨跌分布</span><strong>暂不汇总</strong><small>参考报价时点未对齐</small></div><div><span>交易机制</span><strong>待核验</strong><small>未获取 T+0 规则资料</small></div></div>`+opControls(r)+(list.length?etfOpportunityCards(list,r.issueId):opEmpty('未找到符合条件的演示标的。')),'theme-etfs');route=r;opBindFilters(r,showRelatedETFs);}
briefQuote=function(company,issue){const q=opportunitySecurity(company);if(!q)return;const item=briefItems.find(i=>i.company===q.name),r={type:'brief-quote',company:q.name,code:opSecurityKey(q),issueId:issue.id};page(q.name,opBack()+head(q.type==='etf'?'ETF / 共用详情':'个股 / 共用详情',q.name,(q.code||'代码未获取')+' · '+(q.identityOnly?'行情待接入':q.reference?'历史样本 · 非实时行情':'腾讯行情 · '+briefQuoteTime(q)),opWatch(q))+panel('行情参考',`<div class="op-quote-hero">${opPrice(q)}${opChange(q)}</div>${opSource(q)}<nav class="op-tabs" aria-label="行情周期">${['分时','日 K','周 K'].map((x,i)=>`<button data-op-chart="${x}" aria-pressed="${i===0}" class="${i===0?'selected':''}">${x}</button>`).join('')}</nav><div class="op-chart-empty" id="opChart"><strong>分时走势尚未接入</strong><p>当前仅有参考报价，不根据单点价格绘制走势。</p></div>`)+panel(q.type==='etf'?'指数与主题':'相关资料',q.type==='etf'?`<dl class="flow-facts"><dt>参考跟踪指数</dt><dd>${esc(q.index||'未获取')}</dd><dt>资料状态</dt><dd>成分与权重待接入</dd></dl>${opLink('查看'+opQuoteTheme(q).name,opThemeRoute(opQuoteTheme(q).id,issue.id))}`:q.sourceEvent?`<p>${q.identityOnly?'新闻明确提及该公司；行情资料尚未接入。':'可继续查看关联事件与公司影响。'}</p>${opLink('查看相关事件',eventRoute(q.sourceEvent,issue.id))}`:item?`<h3>${item.title}</h3><p>${item.summary}</p>${briefSource(item.source,issue)}${opAsk('问闪电猫：如何核验？',q.name,item.question)}`:`<p>围绕公司业务与相关主题，继续关注经营进展。</p>${opLink('查看关联主题',opThemeRoute(opQuoteTheme(q).id,issue.id))}`)+opAsk('围绕当前标的提问',q.name,`研究${q.name}时，当前资料能说明什么，还缺什么？`),'brief-quote');route=r;};
// Keep the report template, add explicit links to the shared browsing hub.
const opOriginalHeading=briefHeading;
briefHeading=function(id,title,subtitle){let html=opOriginalHeading(id,title,subtitle);if(id==='themes'||id==='etfs')html=html.replace('</header>',opLink(id==='themes'?'浏览全部主题 '+icon('arrow-up-right'):'浏览全部 ETF '+icon('arrow-up-right'),{type:'opportunities',tab:id,issueId:opIssue().id})+'</header>');return html;};
const opNav=document.createElement('a');opNav.className='nav-item';opNav.id='opportunityNav';opNav.href='#/opportunities?tab=themes';opNav.dataset.opRoute=JSON.stringify({type:'opportunities',tab:'themes'});opNav.setAttribute('aria-label','机会浏览');opNav.innerHTML=icon('radar')+'机会浏览';$('.sidebar .nav-item').after(opNav);
let opThemeBrowserActive=false;
function opportunityDecorate(){const browsing=route.type==='opportunities'&&route.tab==='themes';document.body.classList.toggle('op-theme-browser',browsing);if(browsing&&!opThemeBrowserActive&&!context&&!taskDraft)closeAssistant();opThemeBrowserActive=browsing;const active=['opportunities','theme-feed','theme-etfs','brief-theme','brief-quote','etf-index'].includes(route.type);if(active){markNav('');opNav.classList.add('active');opNav.setAttribute('aria-current','page');}$$('.op-tabs a,.op-categories a').forEach(a=>{if(a.classList.contains('selected'))a.setAttribute('aria-current','page');});}
document.addEventListener('click',e=>{
 const el=e.target.closest('[data-op-route],[data-op-watch],[data-op-source],[data-op-ask],[data-op-chart]');if(!el)return;
 if(el.dataset.opRoute){if(e.metaKey||e.ctrlKey||e.shiftKey||e.altKey||e.button!==0)return;e.preventDefault();if($('#modal').open)closeModal();const r=JSON.parse(el.dataset.opRoute);r.issueId ||= opIssue().id;const replace=route.type===r.type&&(['opportunities'].includes(r.type)||(r.type==='brief-theme'&&(r.themeId||'optical-interconnect')===(route.themeId||'optical-interconnect')));if(r.type==='opportunities')showOpportunities(r,replace);else if(r.type==='brief-theme')showBriefTheme(issueFromId(r.issueId),r.filter,r.sort,replace,r.themeId);else renderOpportunityRoute(r);}
 if(el.dataset.opWatch){const code=el.dataset.opWatch;opportunityWatch=opportunityWatch.includes(code)?opportunityWatch.filter(c=>c!==code):[...opportunityWatch,code];let saved=true;try{localStorage.setItem(opportunityWatchKey,JSON.stringify(opportunityWatch));}catch{saved=false;}$$(`[data-op-watch="${code}"]`).forEach(b=>{const t=document.createElement('template');t.innerHTML=opWatch(opportunitySecurity(code));b.replaceWith(t.content.firstChild);});$(`[data-op-watch="${code}"]`)?.focus({preventScroll:true});if(route.watched){if(route.type==='theme-etfs')showRelatedETFs(route,true);else if(route.type==='opportunities')showOpportunities(route,true);}document.dispatchEvent(new CustomEvent('opportunity-watch-change'));$(`[data-op-watch="${code}"]`)?.focus({preventScroll:true});toast((opportunityWatch.includes(code)?'已加入':'已移出')+'原型自选'+(saved?'，仅在本机保存':'，浏览器未允许持久保存'));}
 if(el.dataset.opSource){const names={'hotspot-environment':'环境治理事件与关联个股参考截图',etfs:'关联 ETF 参考截图',stocks:'关联个股参考截图',themes:'主题列表参考截图',events:'热点事件参考截图',timeline:'发展脉络参考截图',quote:'标的行情参考截图','theme-list':'主题列表参考截图'};const key=el.dataset.opSource;if(!names[key])return;openModal(names[key],`<p>来源：本轮用户提供的竞品截图。仅作交互与素材参考；报价时点、新闻原文及研究结论未独立核验。</p><p class="flow-small">公开演示仅展示资料摘编，未附参考资料说明；数据非实时。</p><p class="flow-small">如与公开资料快照不同，请分别查看各自来源与时点，不能视为同一时刻的数据。</p>`);}
 if(el.dataset.opAsk){if(typeof editorialOpportunityAsk==='function'&&editorialOpportunityAsk(el.dataset.opObject,el.dataset.opAsk))return;const object=el.dataset.opObject,question=el.dataset.opAsk;setContext({kind:'opportunity',company:object,question,source:'当前页面的机会解读与标的背景'});openAssistant();$('#assistantContent').innerHTML=`<div class="flow-context-chip">${esc(object)}</div><div class="user-message">${esc(question)}</div><p class="sample-notice">模拟回答 · 已带入当前研究对象</p><h3>先看产业催化，再看经营兑现</h3><p class="assistant-copy">沿产业催化、公司业务和订单兑现继续分析。重点关注客户变化、产品交付与经营结果，及时判断机会逻辑是否发生变化。</p><h3>仍需补齐</h3><p class="assistant-copy">新闻原文、公司业务材料、ETF 指数成分和统一时点行情。</p>`;}
 if(el.dataset.opChart){$$('[data-op-chart]').forEach(b=>{const yes=b===el;b.classList.toggle('selected',yes);b.setAttribute('aria-pressed',String(yes));});if(!window.demoMarketChart)$('#opChart strong').textContent=el.dataset.opChart+'走势尚未接入';}
});

// Provenance is available without repeating full disclosure in every list row.
document.addEventListener('click',e=>{
 const button=e.target.closest('[data-theme-material]');if(!button)return;
 openModal('演示说明',`<p>本页机会解读、产业催化与关联逻辑均为模拟内容，用于展示产品体验，不代表已发生的市场事实或实时 AI 输出。</p><p>行情沿用历史样本；自选和追踪仅保存在当前浏览器。正式产品将使用资讯、行情及公司数据生成解读。</p>`);
});
