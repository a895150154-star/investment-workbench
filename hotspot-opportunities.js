/* V2.28: the same event/stock relationship is reused in discovery, detail and tracking. */
function hotspotRelatedStocks(id){return (hotspotStoryData[id]?.stocks||[]).map(x=>({...x,q:opportunitySecurity(x.key)})).filter(x=>x.q?.type==='stock');}
function hotspotRelatedView(id,issueId,selectable=false){
 const listed=hotspotRelatedStocks(id),keys=new Set(listed.map(x=>x.key));
 const manual=eventTrackingStocks(eventTracking[id]).filter(q=>!keys.has(opSecurityKey(q))).map(q=>({q,key:opSecurityKey(q),label:'用户指定关注',reason:'由你选择关注该股票，尚未核验与本事件的业务关联。追踪意图与已确认受益分别看。'}));
 const rows=[...listed,...manual];
 if(!rows.length)return '<div class="hotspot-no-stocks"><strong>关联个股待补充</strong><p>现有资料未确认具体上市公司。可以继续阅读原事件；补充明确标的后再设置追踪。</p></div>';
 return `<div class="hotspot-related-stocks">${rows.map(({q,key,label,reason})=>`<article class="hotspot-stock"><header><div><h3>${opportunitySecurity(key)?opLink(esc(q.name)+icon('arrow-up-right'),opQuoteRoute(key,issueId)):esc(q.name)}</h3><small>${esc(q.code||'代码未获取')} · ${esc(label)}</small></div>${selectable?`<label class="hotspot-pick"><input type="checkbox" data-event-select-stock="${esc(id)}" value="${esc(key)}" ${(eventSelectedSecurities[id]||[]).includes(key)?'checked':''}><span>选择追踪</span></label>`:''}</header><p><span>关联依据</span>${esc(reason)}</p></article>`).join('')}</div>`;
}
function hotspotOpportunityCard(id,issueId){
 const found=trackedEvent(eventRoute(id,issueId));if(!found)return '';
 const {item,summary,story}=found,related=hotspotRelatedStocks(id),tracking=eventTracking[id];
 return `<article class="hotspot-opportunity" data-hotspot-card="${esc(id)}"><header><span class="hotspot-event-tag">${esc(story?.tag||'事件线索')}</span><span class="hotspot-event-time">${esc(item.date||'日期未获取')}</span></header><h2>${opLink(esc(item.title)+icon('arrow-up-right'),eventRoute(id,issueId))}</h2><p class="hotspot-event-summary">${esc(summary)}</p><div class="hotspot-ai-insight"><strong>${icon('sparkles')}闪电猫简析 <small>模拟解读</small></strong><p>${esc(story?.why||found.interpretation)}</p></div><div class="hotspot-card-stocks"><span>关联个股</span>${related.length?related.map(({q})=>opLink(esc(q.name)+(q.code?'<small>'+esc(q.code)+'</small>':''),opQuoteRoute(opSecurityKey(q),issueId),'hotspot-stock-chip')).join(''):'<small>尚未确认上市公司关联</small>'}</div><footer><div>${item.origin==='reference'?opEventSource(item):briefSource(found.companyItem?.source||item.title,issueFromId(issueId))}</div><div>${tracking?`<small class="hotspot-record-state">${eventTrackingLabel(tracking)}</small>`:''}${opLink('查看事件与关联个股 '+icon('arrow-right'),eventRoute(id,issueId),'text-action')}<button class="button" data-event-track="${esc(id)}">${icon('bell')}${tracking?'修改提醒设置':'追踪这条事件'}</button></div></footer></article>`;
}
function hotspotOpportunityList(issueId){return `<div class="hotspot-list-intro"><div><h2>从一件事，看到值得跟进的股票</h2><p>读事件与简析 → 核对关联个股 → 让闪电猫设置追踪</p></div><span>发现催化，跟进个股</span></div><div class="hotspot-opportunity-list">${['reference-environment','2490095','2490104','2490113'].map(id=>hotspotOpportunityCard(id,issueId)).join('')}</div><details class="hotspot-company-notices"><summary>其他公司事项 · 激励、股本与资金安排 ${icon('chevron-down')}</summary><p class="flow-small">保留公告阅读与个股追踪入口；这些事项不直接证明行业景气改善。</p>${['xys','zjxc','tftx'].map(id=>hotspotOpportunityCard(id,issueId)).join('')}</details>`;}
const hotspotThemeEventIds={
 'optical-interconnect':['xys','zjxc','tftx'],
 'semiconductors':['2490095','2490104'],
 'ai-applications':['2490113'],
 'innovative-drugs':[],
 'environmental-policy':['reference-environment']
};
opThemeLookpoints['optical-interconnect']='AI 算力建设加快，高速光模块与互联设备需求升温。产品升级和客户扩容形成催化，重点看新产品验证、订单落地与交付节奏。';
opThemeLookpoints['semiconductors']='端侧 AI 新品与国产算力升级带来新的应用需求。芯片设计、设备和材料分别进入客户验证与交付阶段，重点看产业需求能否转成持续订单。';
opThemeLookpoints['ai-applications']='手机 AI 正从对话助手走向任务执行，终端入口和应用生态迎来变化。关注厂商合作、功能上线和持续使用，判断应用能否形成商业化收入。';
opThemeLookpoints['innovative-drugs']='研发进展与海外合作为创新药带来催化。重点产品临床推进、授权合作和商业化放量共同影响行业预期，后续关注里程碑兑现和销售进展。';
opThemeLookpoints['environmental-policy']='污染治理政策推动地方项目落地，水环境与园区污水处理需求成为关注重点。跟进项目招标、企业中标和回款，判断政策催化能否转成经营增量。';
const hotspotThemeSignals={
 'optical-interconnect':['云厂商扩建算力基础设施','高速光模块进入客户验证'],
 'semiconductors':['端侧算力新品发布','半导体材料交付进展'],
 'ai-applications':['手机 AI 方案发布','终端厂商开展应用适配'],
 'innovative-drugs':['重点产品临床取得进展','海外授权合作推进'],
 'environmental-policy':['污染防治行动计划出台','地方治理项目推进']
};
function hotspotThemeDrivers(t,issueId){
 return `<div class="hotspot-theme-drivers"><span>本期催化</span>${(hotspotThemeSignals[t.id]||[]).map(text=>`<span class="hotspot-catalyst">${esc(text)}</span>`).join('')}${t.id==='optical-interconnect'?'':(hotspotThemeEventIds[t.id]||[]).map(id=>{const found=trackedEvent(eventRoute(id,issueId));return found?opLink(esc(found.item.title)+icon('arrow-up-right'),eventRoute(id,issueId),'hotspot-driver-link'):'';}).join('')}</div>`;
}
const hotspotBaseTheme=showBriefTheme;
showBriefTheme=function(issue,...args){
 hotspotBaseTheme(issue,...args);const t=opportunityTheme(route.themeId);
 $('#flowView .flow-page-head')?.insertAdjacentHTML('afterend',`<section class="hotspot-theme-reading"><h2>${icon('sparkles')}本期为什么关注 <small>闪电猫简析 · 模拟解读</small></h2><p>${esc(opThemeLookpoints[t.id]||t.read)}</p>${hotspotThemeDrivers(t,issue.id)}</section>`);
};
const hotspotBaseFeed=showThemeFeed;
showThemeFeed=function(r){
 if(r.mode!=='hotspots')return hotspotBaseFeed(r);
 const t=opportunityTheme(r.themeId),events=opportunityEvents(t.id);
 page(t.name+' · 热点事件',opBack()+head(t.name,'热点事件','以事件理解关联，再选择具体个股设置追踪。')+opNotice()+`<div class="hotspot-opportunity-list">${events.map(e=>hotspotOpportunityCard(e.id,r.issueId)).join('')||'<div class="op-empty">本期尚未补齐事件资料。</div>'}</div>`,'theme-feed');route=r;
};
const hotspotBaseQuote=briefQuote;
briefQuote=function(company,issue){
 hotspotBaseQuote(company,issue);const q=opportunitySecurity(company);if(!q||q.type!=='stock')return;
 const rows=Object.entries(eventTracking).filter(([,v])=>eventTrackingActive(v)&&eventTrackingStocks(v).some(s=>opSecurityKey(s)===opSecurityKey(q)));
 if(rows.length)$('#flowView .security-track-status')?.insertAdjacentHTML('afterend',`<section class="hotspot-security-events"><h2>这只股票的事件追踪</h2><p class="flow-small">股票是追踪对象，事件是关注条件。以下设置与订阅管理同步。</p>${rows.map(([id,v])=>eventTrackingRow(id,v,issue.id,true)).join('')}</section>`);
};
