/* Morning-report personal themes and whole-page summary. All inputs are retained local examples. */
(()=>{
function initialize(){
 if(!window.workbenchClient.desktop)return;
 const V=window.overviewV3,D=window.overviewV3Data;
 const groups={
  'optical-interconnect':{themes:['算力互联','光模块与算力互联'],concepts:[]},
  'ai-applications':{themes:['端侧算力','手机 AI 与端侧算力'],concepts:['人工智能概念']}
 };
 const records=[
  {id:'semi',summary:'端侧算力推进客户适配，订单兑现仍待收入确认。',events:'3 家合作方完成适配，1 家开始试交付；取得 800 万元试用订单，尚未确认收入或回款。',links:[{field:'sectors',kind:'板块',names:['半导体','半导体材料']}],sources:[{id:'demo-delivery',name:'客户适配与试交付更新'},{id:'demo-order',name:'试用订单进展'}]},
  {id:'optical',summary:'光通信公司披露集中在股本、激励和资金安排。',events:'中际旭创披露 H 股翌日披露报表，新易盛披露股份归属与上市安排，天孚通信披露现金管理安排；这些事项与行业订单增长分开核对。',links:[{field:'sectors',kind:'板块',names:['光通信']},{field:'themes',kind:'主题',names:['算力互联']}],sources:briefItems.filter(i=>['xys','zjxc','tftx'].includes(i.id)).map(i=>({name:i.source,existing:true,label:'深交所 · '+i.company+'公告'}))},
  {id:'growth',summary:'成长指数内部走势分化，指数与公司经营需分别核对。',events:'科创50、创业板指相关标的呈现不同变化；结合指数观察与公司经营资料，核对表现和经营是否相互印证。',links:[{field:'indices',kind:'指数',names:['科创50','创业板指']}],sources:[{id:'demo-growth',name:'成长指数观察'}]},
  {id:'ai',summary:'手机 AI 与端侧芯片分别推进应用入口和硬件供给。',events:'千问发布手机 AI 全栈解决方案，海光信息发布面向端侧的 CPU 1000 系列；现有报道未说明双方存在合作关系，继续关注终端适配与客户采用。',links:[{field:'themes',kind:'主题',names:['端侧算力']},{field:'concepts',kind:'概念',names:['人工智能概念']}],sources:briefNews.filter(n=>['2490113','2490095'].includes(n.id)).map(n=>({name:n.title,existing:true,label:'财联社 · '+(n.id==='2490113'?'手机 AI':'海光信息')}))}
 ];
 const unique=a=>[...new Set(a.filter(Boolean))];
 function associations(target){
  const code=String(target.code||''),known=D.securities.find(s=>s.code===code),quote=opportunityReferenceQuotes.find(q=>q.code===code);
  const registry=D.themes.filter(t=>t.stocks.includes(code)||t.etf.code===code);
  const mapped=registry.map(t=>groups[t.id]).filter(Boolean);
  return {...target,code,sectors:unique([target.sector,known?.sector]).filter(n=>n!=='待补充'),indices:unique([...(target.indices||[]),...(known?.indices||[]),target.index,quote?.index]),themes:unique([...(target.themes||[]),...(known?.themes||[]),...mapped.flatMap(x=>x.themes)]),concepts:unique([...(target.concepts||[]),...(known?.concepts||[]),...mapped.flatMap(x=>x.concepts),...(known?.themes?.includes('端侧算力')?['人工智能概念']:[])])};
 }
 function related(targets=V.portfolio()){
  const items=targets.map(associations);
  return records.map(r=>({...r,matches:r.links.flatMap(l=>l.names.map(name=>({kind:l.kind,name,targets:items.filter(t=>t[l.field].includes(name))})).filter(m=>m.targets.length))})).filter(r=>r.matches.length);
 }
 function sourceHTML(s,issue){
  if(s.existing){const t=document.createElement('template');t.innerHTML=briefSource(s.name,issue).replace('来源：','数据来源：');if(s.label)t.content.firstElementChild.firstChild.textContent='数据来源：'+s.label+' ';return t.innerHTML;}
  return `<button class="brief-source personal-data-source" data-personal-source="${s.id}">数据来源：${esc(s.name)} ${icon('chevron-right')}</button>`;
 }
 function relationHTML(m,issue){
  const category=window.briefRelatedThemes.lookup(m.kind,m.name),value=category.change;
  const percent=value==null?'未获取':(value>0?'+':'')+value.toFixed(2)+'%';
  const label=`<span>${esc(m.kind)}：${esc(m.name)}</span><span class="personal-relation-change ${value<0?'down':'up'}">${percent}</span>${icon('chevron-right')}`;
  return opLink(label,opThemeRoute(category.themeId,issue.id),'personal-relation').replace('<a ',`<a data-personal-category="${esc(m.name)}" `);
 }
 function relatedHTML(issue){
  const rows=related();
  return `<section class="personal-theme-related" id="brief-related-macro" data-v3-keep-copy><h2>和我有关</h2>${rows.length?rows.map(r=>`<article class="personal-theme-event" data-personal-related="${r.id}"><h3>${esc(r.summary)}</h3><p class="personal-event-summary"><span class="personal-field-label">事件总结</span>${esc(r.events)}</p><div class="personal-associations"><span class="personal-field-label">关联</span>${r.matches.map(m=>relationHTML(m,issue)).join('')}</div><div class="personal-event-sources">${r.sources.map(s=>sourceHTML(s,issue)).join('')}</div></article>`).join(''):`<p class="personal-no-relations">${V.portfolio().length?'当前标的暂无已确认的主题关联，继续查看市场脉搏。':'添加持仓或自选后，按标的的板块、概念、指数和主题整理相关信息。'}</p>`}</section>`;
 }
 for(const section of briefSections){if(section[0]==='my-targets')section[1]='特别提醒';if(section[0]==='related-macro')section[1]='和我有关';}
 const previousDocument=briefDocument;
 briefDocument=function(issue){
  const html=previousDocument(issue);if(issue.period!=='morning')return html;
  const t=document.createElement('template');t.innerHTML=html;
  const heading=t.content.querySelector('#brief-my-targets>h3');if(heading)heading.textContent='特别提醒';
  const old=t.content.querySelector('#brief-related-macro');if(old){const replacement=document.createElement('template');replacement.innerHTML=relatedHTML(issue);old.replaceWith(replacement.content);}
  t.content.querySelectorAll('[data-v3-paper]').forEach(n=>n.remove());
  t.content.querySelectorAll('.report-news .text-action').forEach(n=>{if(/阅读分析与后续关注|查看同一事件的综合解读/.test(n.textContent))n.remove();});
  return t.innerHTML;
 };
 function decorate(){
  const report=$('#briefView'),morning=activeView==='brief'&&selectedIssue?.period==='morning';
  if(morning){report.dataset.personalBrief='morning';const toolbar=report.querySelector('.brief-extra-actions');if(toolbar&&!toolbar.querySelector('[data-personal-paper]'))toolbar.insertAdjacentHTML('afterbegin',`<button class="brief-card-action" data-personal-paper>${icon('files')}<span>一页纸</span></button>`);}else delete report.dataset.personalBrief;
 }
 const previousShow=showBrief;showBrief=function(...args){const result=previousShow(...args);decorate();return result;};
 const clean=n=>(n?.textContent||'').replace(/●/g,'').replace(/\s+/g,' ').trim();
 function pageSummary(){
  const root=$('#briefView'),issue=selectedIssue,targets=root.querySelector('#brief-my-targets'),relations=root.querySelector('#brief-related-macro'),pulse=root.querySelector('#brief-pulse');
  const lines=[issueLabel(issue),'一页纸',''];
  const quick=[];
  if(targets){const names=[...targets.querySelectorAll('.v3-brief-stock .v3-security-heading strong')].map(clean);quick.push(names.length?'特别提醒：'+names.join('、'):clean(targets.querySelector('.v3-empty h3')||targets.querySelector('p')));}
  if(relations){const titles=[...relations.querySelectorAll('.personal-theme-event h3')].map(clean);quick.push('和我有关：'+(titles.join('；')||clean(relations.querySelector('p'))));}
  let news=[];if(pulse){let sibling=pulse.nextElementSibling;while(sibling&&!sibling.classList.contains('report-section-head')){news.push(...sibling.querySelectorAll('.report-news li'));sibling=sibling.nextElementSibling;}quick.push('市场脉搏：'+news.map(n=>clean(n.querySelector('[data-brief-action="news"]'))).filter(Boolean).join('；'));}
  lines.push('整页概括',...quick,'');
  if(targets){lines.push('特别提醒');const rows=[...targets.querySelectorAll('.v3-brief-stock')];if(rows.length)rows.forEach(n=>lines.push(`${clean(n.querySelector('.v3-security-heading strong'))}（${clean(n.querySelector('.tag'))}）：${clean(n.querySelector('.v3-risk-opening'))} ${clean(n.querySelector('.v3-habit-line'))}`));else lines.push(clean(targets.querySelector('.v3-empty')||targets.querySelector('p')));lines.push('');}
  if(relations){lines.push('和我有关');relations.querySelectorAll('.personal-theme-event').forEach(n=>{lines.push(clean(n.querySelector('h3')),clean(n.querySelector('.personal-event-summary')).replace(/^事件总结/,'事件总结：'),'关联：'+[...n.querySelectorAll('.personal-relation')].map(clean).join('；'),[...n.querySelectorAll('.personal-event-sources button')].map(clean).join('；'),'');});}
  if(pulse){lines.push('市场脉搏');news.forEach(n=>lines.push(clean(n.querySelector('[data-brief-action="news"]')),clean(n.querySelector('p')),clean(n.querySelector('.brief-source')),''));}
  return lines.join('\n');
 }
 document.addEventListener('click',e=>{
  const paper=e.target.closest('[data-personal-paper]');if(paper){openModal('一页纸 · 整页总结',`<pre class="v3-one-page personal-page-summary">${esc(pageSummary())}</pre><div class="modal-actions"><button class="button" data-personal-close>关闭</button></div>`);}
  const source=e.target.closest('[data-personal-source]');if(source){const timeline=D.timeline.find(n=>'demo-'+n.id===source.dataset.personalSource);const name=timeline?.source||'成长指数观察';openModal(name,`<div data-v3-keep-copy><p>资料类型：原型固定示例，不是对应期次的真实公告或实时行情。</p><p>${timeline?`原句：${esc(timeline.quote)}`:esc(D.macro.find(m=>m.id==='growth').text)}</p><p>本页按已有标的分类和主题与 ETF 的示例对应关系筛选。ETF 成分和权重未核验，不按名称推断其持仓。</p></div>`,'和我有关 / 数据来源');}
  if(e.target.closest('[data-personal-close]'))closeModal();
 });
 const style=document.createElement('style');style.id='personalRelatedBriefStyle';style.textContent=`
 #briefView[data-personal-brief="morning"] .brief-extra-actions{flex-wrap:wrap;justify-content:flex-end}
 #briefView[data-personal-brief="morning"] .personal-theme-related{margin-top:28px}
 #briefView[data-personal-brief="morning"] .personal-theme-related>h2{font-size:20px;line-height:28px;font-weight:600;margin:0 0 16px}
 #briefView[data-personal-brief="morning"] .personal-theme-event{padding:20px 0;border-bottom:1px solid var(--line);}
 #briefView[data-personal-brief="morning"] .personal-theme-event:last-child{border-bottom:0}
 #briefView[data-personal-brief="morning"] .personal-theme-event h3{font-size:16px;line-height:24px;font-weight:600;margin:0 0 12px}
 #briefView[data-personal-brief="morning"] .personal-event-summary{font-size:14px;line-height:22px;margin:0 0 12px;color:var(--muted)}
 #briefView[data-personal-brief="morning"] .personal-field-label{font-size:12px;line-height:20px;color:var(--subtle);margin-right:12px;flex:none}
 #briefView[data-personal-brief="morning"] .personal-associations{display:flex;flex-wrap:wrap;align-items:flex-start;gap:8px;font-size:12px;line-height:20px;margin:0 0 12px}
 #briefView[data-personal-brief="morning"] .personal-relation{display:inline-flex;align-items:center;gap:8px;border:1px solid var(--line);border-radius:5px;padding:4px 8px;color:var(--muted);text-decoration:none}
 #briefView[data-personal-brief="morning"] .personal-relation:hover{border-color:var(--accent)}\n #briefView[data-personal-brief="morning"] .personal-relation:focus-visible{outline:2px solid var(--accent);outline-offset:2px}\n #briefView[data-personal-brief="morning"] .personal-relation-change{font-variant-numeric:tabular-nums}\n #briefView[data-personal-brief="morning"] .personal-relation-change.up{color:var(--red)}\n #briefView[data-personal-brief="morning"] .personal-relation-change.down{color:var(--green)}
 #briefView[data-personal-brief="morning"] .personal-event-sources{display:flex;flex-wrap:wrap;gap:8px 16px}
 #briefView[data-personal-brief="morning"] .personal-event-sources .brief-source{font-size:12px;line-height:20px;color:var(--subtle)}
 #briefView[data-personal-brief="morning"] .personal-no-relations{font-size:14px;line-height:22px}
 .personal-page-summary{font-size:14px;line-height:22px;white-space:pre-wrap;overflow-wrap:anywhere;max-width:100%}
 `;document.head.append(style);
 window.personalRelatedBrief={associations,related,records,pageSummary};decorate();
 if(activeView==='brief'&&selectedIssue?.period==='morning'){const scroll=window.scrollY;showBrief(selectedIssue.id);window.scrollTo({top:scroll,behavior:'instant'});}
}
if(document.readyState!=='complete')document.addEventListener('DOMContentLoaded',initialize,{once:true});else initialize();
})();
