/* Shared opportunity collection; themes reuse the existing explorer catalog. */
(()=>{
 'use strict';
 if(!window.workbenchClient.desktop)return;
 const previous=showOpportunities;
 const themeRows=()=>window.themeExplorer.topics();
 const tabRoute=(r,tab)=>({type:'opportunities',tab,issueId:r.issueId});
 const pct=value=>value==null?'':opChange({change:value});
 function heading(r){return `<header class="oh-header"><h1>机会浏览</h1><p>从主题、ETF与热点中，发现值得继续研究的线索。</p></header><nav class="oh-tabs" aria-label="机会栏目">${opportunityTabs.map(([tab,name])=>opLink(name,tabRoute(r,tab),r.tab===tab?'selected':'')).join('')}</nav>`;}
 function associations(t,kind,r){
  const list=t[kind].map(q=>opportunitySecurity(q.code||q.id||q.name)).filter(Boolean);if(!list.length)return '';
  const target=kind==='stocks'?{...opThemeRoute(t.id,r.issueId),filter:'stock'}:{type:'theme-etfs',themeId:t.id,issueId:r.issueId};
  return `<div class="oh-associations"><span class="oh-association-label">${kind==='stocks'?'关联股票':'关联 ETF'}</span><div class="oh-chips">${list.slice(0,3).map(q=>opLink(`<span>${esc(q.name)}</span>${pct(q.change)}`,opQuoteRoute(opSecurityKey(q),r.issueId),'oh-chip')).join('')}</div>${opLink(kind==='stocks'?'全部股票 '+icon('chevron-right'):'全部 ETF '+icon('chevron-right'),target,'oh-all')}</div>`;
 }
 function headline(t,r){
  const events=[...(t.events||[])].filter(e=>e.id&&e.title).sort((a,b)=>String(b.date||'').localeCompare(String(a.date||'')));
  const event=events.find(e=>e.title===t.title)||events[0];if(!event)return '';
  return opLink(`<span>${esc(event.title)}</span>${event.date?`<time>${esc(event.date)}</time>`:''}${icon('chevron-right')}`,{type:'theme-feed',themeId:t.id,issueId:r.issueId,mode:'hotspots',item:event.id},'oh-event-headline');
 }
 function card(t,r){const detail=opThemeRoute(t.id,r.issueId),reading=t.analysis?.[0]?.[1]||t.read||t.summary||'';
  return `<article class="oh-theme" data-oh-theme="${esc(t.id)}"><header><h2>${opLink(esc(t.name)+' '+icon('chevron-right'),detail,'oh-name')}</h2>${pct(t.change)}</header>${headline(t,r)}${reading?opLink(`<span class="oh-reading-label">主题解读</span><span>${esc(reading)}</span>${icon('arrow-up-right')}`,detail,'oh-reading'):''}${associations(t,'stocks',r)}${associations(t,'etfs',r)}</article>`;
 }
 function browserRoute(r,filter,query=r.query||r.themeQuery||''){return r.type==='events'?{type:'events',driverTab:'themes',driverScope:'all',themeFilter:filter,themeQuery:query,issueId:r.issueId}:{...r,themeFilter:filter,query};}
 function browserLink(label,r,cls=''){return r.type==='events'?`<a class="${cls}" href="${esc(eventDriver.radarURL(r))}" data-oh-radar-route="${esc(JSON.stringify(r))}">${label}</a>`:opLink(label,r,cls);}
 function bindSearch(root,r,render){root.querySelector('#ohSearch').onsubmit=e=>{e.preventDefault();render(browserRoute(r,r.themeFilter,root.querySelector('#ohQuery').value.trim()));};}
 function themeContent(r){const topics=themeRows(),query=(r.query||r.themeQuery||'').toLowerCase(),filter=topics.some(t=>t.id===r.themeFilter)?r.themeFilter:'all';
  r.themeFilter=filter;
  const list=topics.filter(t=>(filter==='all'||t.id===filter)&&(!query||[t.name,t.title,...t.stocks.map(q=>q.name+' '+(q.code||'')),...t.etfs.map(q=>q.name+' '+(q.code||''))].join(' ').toLowerCase().includes(query)));
  return `<div class="oh-theme-tools"><form id="ohSearch" role="search"><label class="sr-only" for="ohQuery">搜索主题或关联标的</label><input id="ohQuery" name="query" type="search" placeholder="搜索主题或关联标的" value="${esc(r.query||r.themeQuery||'')}" maxlength="80"><button aria-label="搜索主题">${icon('search')}</button></form></div><nav class="oh-filters" aria-label="筛选主题"><span>筛选主题</span>${[{id:'all',name:'全部'},...topics].map(t=>browserLink(esc(t.name),browserRoute(r,t.id),filter===t.id?'selected':'')).join('')}</nav><div class="oh-list">${list.length?list.map(t=>card(t,r)).join(''):`<div class="oh-empty"><h2>没有匹配的主题</h2><p>试试主题名称、关联标的名称或代码。</p>${browserLink('查看全部主题',browserRoute(r,'all',''),'oh-reset')}</div>`}</div>`;
 }
 function hotspotContent(r){
  const rows=eventDriverData.events.slice().sort((a,b)=>a.age-b.age);
  return `<div class="oh-hotspot-list">${rows.map(e=>{
   const detail={type:'event-detail',eventId:e.id,themeId:e.themeId,issueId:r.issueId},qs=e.stocks.map(opportunitySecurity).filter(q=>q?.type==='stock');
   return `<article class="oh-hotspot" data-hotspot-event="${esc(e.id)}"><header><h2>${opLink(esc(e.title),detail,'oh-hotspot-title')}</h2><time>${esc(e.time)}</time></header><div class="oh-hotspot-stocks">${qs.slice(0,3).map(q=>opLink(`<span>${esc(q.name)}</span>${pct(q.change)}`,opQuoteRoute(opSecurityKey(q),r.issueId),'oh-chip')).join('')}${qs.length>3?opLink('更多关联股票 '+icon('chevron-right'),{...detail,section:'stocks'},'oh-all'):''}</div>${opLink(`<strong>事件总结</strong><span>${esc(e.summary)}</span>${icon('chevron-right')}`,{...detail,section:'summary'},'oh-hotspot-summary')}</article>`;
  }).join('')}</div>`;
 }
 function wrapExisting(r){
  const view=document.querySelector('#flowView');
  view.querySelector(':scope > .flow-page-head')?.remove();
  view.querySelector(':scope > .op-tabs')?.remove();
  view.querySelector(':scope > .op-disclosure')?.remove();
  const hub=document.createElement('div');hub.className='oh-hub';hub.setAttribute('data-v3-keep-copy','');
  const back=view.querySelector(':scope > .back-button');
  const nodes=[...view.childNodes].filter(n=>n!==back);hub.innerHTML=heading(r);nodes.forEach(n=>hub.append(n));view.append(hub);
 }
 showOpportunities=function(input={},retain=false){
  const r={type:'opportunities',tab:'themes',category:'all',sort:'reference',query:'',watched:false,issueId:opIssue().id,...input};
  if(r.tab==='hotspots'){page('机会浏览',opBack()+`<div class="oh-hub" data-v3-keep-copy>${heading(r)}${hotspotContent(r)}</div>`,'opportunities');route=r;return;}
  if(r.tab!=='themes'){previous(r,retain);wrapExisting(r);return;}
  page('机会浏览',opBack()+`<div class="oh-hub" data-v3-keep-copy>${heading(r)}${themeContent(r)}</div>`,'opportunities');route=r;
  bindSearch(document.querySelector('.oh-hub'),r,next=>showOpportunities(next,true));
 };
 window.sharedThemeList={render:themeContent,bind:bindSearch};
 document.addEventListener('click',e=>{const link=e.target.closest('[data-oh-radar-route]');if(!link||e.button!==0||e.ctrlKey||e.metaKey||e.shiftKey||e.altKey)return;e.preventDefault();allEvents(JSON.parse(link.dataset.ohRadarRoute));});
})();
