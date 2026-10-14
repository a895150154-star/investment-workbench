/* One morning entry into the existing shared theme and security views. */
(()=>{
 'use strict';if(!window.workbenchClient.desktop)return;
 const initialThemeSection=/\/briefs\/[^/]+\/morning\?/.test(location.hash)&&new URLSearchParams(location.hash.split('?')[1]).get('section')==='themes';
 const data=()=>window.themeExplorer?.data('coal');
 const change=value=>value==null?'':`<span class="btp-change ${value>0?'up':value<0?'down':'neutral'}">${value>0?'+':''}${Number(value).toFixed(2)}%</span>`;
 const rows=(t,kind)=>t[kind].slice(0,3).map(row=>opportunitySecurity(row.code||row.id||row.name)).filter(Boolean);
 const reading=t=>t.analysis?.[0]?.[1]||t.read||t.summary||'';
 function securities(t,kind,issue){const quotes=rows(t,kind);if(!quotes.length)return '';return `<div class="btp-related"><h4>${kind==='stocks'?'关联股票':'关联 ETF'}</h4><div class="btp-securities">${quotes.map(q=>opLink(`<span class="btp-security-name">${esc(q.name)}</span>${change(q.change)}`,opQuoteRoute(opSecurityKey(q),issue.id),'btp-security')).join('')}</div></div>`;}
 function section(issue){const t=data();if(!t)return '';const detail=opThemeRoute(t.id,issue.id);return `<header class="report-section-head btp-heading" id="brief-themes"><h2>主题机会</h2>${opLink('更多 '+icon('chevron-right'),{type:'opportunities',tab:'themes',issueId:issue.id},'btp-more')}</header><article class="btp-card" data-v3-keep-copy><header class="btp-card-head"><h3>${opLink(esc(t.name)+' '+icon('chevron-right'),detail,'btp-name')}</h3>${change(t.change)}</header>${opLink(`<span class="btp-reading-label">主题解读</span><span class="btp-reading-copy">${esc(reading(t))}</span><span class="btp-detail-action">查看主题详情 ${icon('arrow-right')}</span>`,detail,'btp-reading')}${securities(t,'stocks',issue)}${securities(t,'etfs',issue)}</article>`;}
 function summary(){const t=data();return t?[t.name,reading(t),...['stocks','etfs'].map(kind=>(kind==='stocks'?'关联股票：':'关联ETF：')+rows(t,kind).map(q=>q.name+(q.change==null?'':` ${Number(q.change)>0?'+':''}${Number(q.change).toFixed(2)}%`)).join('；'))]:[];}
 function initialize(){
  const previous=briefDocument;
  briefDocument=function(issue){const html=previous(issue);if(issue.period!=='morning'||!briefPrefs.morning.includes('themes'))return html;const t=document.createElement('template');t.innerHTML=html;if(!t.content.querySelector('#brief-themes'))t.content.querySelector('.report-body')?.insertAdjacentHTML('beforeend',section(issue));return t.innerHTML;};
  if(activeView==='brief'&&selectedIssue?.period==='morning'){const top=scrollY;showBrief(selectedIssue.id);requestAnimationFrame(()=>{if(route.type==='brief'&&(route.section==='themes'||initialThemeSection))document.querySelector('#briefView [data-brief-action="section"][data-brief-value="themes"]')?.click();else window.scrollTo({top,behavior:'instant'});});}
 }
 window.morningThemePreview={data,section,summary};
 if(document.readyState==='complete')initialize();else document.addEventListener('DOMContentLoaded',initialize,{once:true});
})();
