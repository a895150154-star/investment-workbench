/* Screenshot news fixtures. Shared quote destinations; no generated sources or market data. */
(()=>{
 'use strict';if(!window.workbenchClient.desktop)return;
 const items=[
  {id:'us-market',title:'美股三大指数微幅收跌，能源板块领涨。',body:'标普500跌0.02%，存储芯片承压，美光跌约3.6%，Meta涨2.63%。',names:['标普500','美光','Meta']},
  {id:'imf',title:'IMF上调今年全球经济增长预期至3.1%。',body:'AI投资热潮对部分经济体的提振抵消了中东冲突的拖累。'},
  {id:'iran',title:'特朗普称将很快就伊朗问题作出决定。',body:'他指责胡塞武装以恶劣手段打击沙特，并可能要求土耳其参与相关行动。'},
  {id:'oil-facilities',title:'胡塞武装警告打击沙特阿美石油设施。',body:'消息称沙特阿美总部遭导弹袭击后起火，沙特政府未确认该消息。'},
  {id:'korea',title:'韩国股市遭遇“黑色星期二”。',body:'韩国综合指数大跌5.46%，SK海力士和三星电子分别跌超10%和7%。',names:['SK海力士','三星电子']},
  {id:'hk-regulation',title:'香港证监会重拳整肃IPO认购操纵。',body:'向31家券商发限制通知，冻结逾46.6亿港元资产，涉案百道等新股。'},
  {id:'silicon',title:'硅料龙头杭州闭门会约定稳价。',body:'通威、协鑫等约定硅料销售价格不得低于每吨4.3万元，并划定电池片报价底线。'},
  {id:'homeview',title:'苹果发布智能家居中枢HomeView。',body:'售价299美元，集音乐、视频通话、家庭监控及智能家居控制于一体。'},
  {id:'memory',title:'AI效率“引擎”三星公布下一代内存与存储技术。',body:'展示CXL内存扩展、HBM5及存算一体技术，提升AI算力释放效率，相关公司有澜起科技、雅克科技。',names:['澜起科技','雅克科技']},
  {id:'brain-interface',title:'国内首创脑机康复技术为患者重建运动功能。',body:'协和医院研发高通道矩阵式电刺激脑机接口系统，帮助偏瘫患者恢复精细动作，相关公司有爱朋医疗、三博脑科。',names:['爱朋医疗','三博脑科'],sources:1}
 ];
 const securities={};
 const ids={'美光':'micron','Meta':'meta','SK海力士':'sk-hynix','三星电子':'samsung','澜起科技':'montage','雅克科技':'yoke','爱朋医疗':'apon','三博脑科':'sanbo'};
 for(const [name,id]of Object.entries(ids)){
  let q=opportunitySecurity(name);
  if(!q){q={id:'pulse-'+id,name,type:'stock',price:null,change:name==='Meta'?2.63:null,reference:'pulse-screenshot',source:'早报要闻'};opportunityQuotes.push(q);}
  securities[name]=opSecurityKey(q);
 }
 function linkedBody(item,issue){let out='',rest=item.body;const names=item.names||[];while(rest){let hit=null,pos=rest.length;for(const name of names){const i=rest.indexOf(name);if(i>=0&&i<pos){hit=name;pos=i;}}if(!hit){out+=esc(rest);break;}out+=esc(rest.slice(0,pos));out+=hit==='标普500'?`<button type="button" class="mp-security-link" data-index-quote="sp500" aria-label="查看标普500行情">${esc(hit)}</button>`:opLink(esc(hit),opQuoteRoute(securities[hit],issue.id),'mp-security-link');rest=rest.slice(pos+hit.length);}return out;}
 function list(issue){return `<ol class="mp-news" aria-label="市场脉搏必读要闻" data-v3-keep-copy>${items.map(item=>`<li data-mp-news="${item.id}"><p><strong class="mp-title">${esc(item.title)}</strong> ${linkedBody(item,issue)}${item.sources?` <button type="button" class="mp-source" data-mp-source="${item.id}">来源 · ${item.sources} ${icon('chevron-right')}</button>`:''}</p></li>`).join('')}</ol>`;}
 const previousQuote=briefQuote;
 briefQuote=function(value,issue){const result=previousQuote(value,issue),q=opportunitySecurity(value);if(q?.reference!=='pulse-screenshot')return result;
  const chart=$('#opChart');if(chart?.previousElementSibling?.matches('.op-tabs'))chart.previousElementSibling.remove();if(chart)chart.outerHTML='<div class="ma-quote-empty"><strong>走势数据待补充</strong></div>';
  const related=[...document.querySelectorAll('#flowView .flow-panel')].find(el=>el.querySelector('header')?.textContent==='相关资料');
  if(related)related.innerHTML=`<header><h2>相关要闻</h2></header>${items.filter(n=>n.names?.includes(q.name)).map(n=>`<p><strong>${esc(n.title)}</strong> ${esc(n.body)}</p>`).join('')}`;
  return result;
 };
 document.addEventListener('click',e=>{const b=e.target.closest('[data-mp-source]');if(!b)return;const item=items.find(n=>n.id===b.dataset.mpSource);if(!item?.sources)return;openModal('内容来源',`<div class="mp-source-detail" data-v3-keep-copy><h3>${esc(item.title)}</h3><p>${esc(item.body)}</p><p class="mp-source-status">原文链接暂未提供。</p></div>`,'市场脉搏 / 来源');});
 function initialize(){const previous=briefDocument;briefDocument=function(issue){const html=previous(issue);if(issue.period!=='morning')return html;const t=document.createElement('template');t.innerHTML=html;const heading=t.content.querySelector('#brief-pulse');if(heading){const subtitle=heading.querySelector('span');if(subtitle)subtitle.textContent='必读要闻';let next=heading.nextElementSibling;while(next&&!next.classList.contains('report-section-head')){const old=next.matches('.report-news')?next:next.querySelector('.report-news');if(old){old.outerHTML=list(issue);break;}next=next.nextElementSibling;}}return t.innerHTML;};if(activeView==='brief'&&selectedIssue?.period==='morning'){const top=scrollY;showBrief(selectedIssue.id);requestAnimationFrame(()=>window.scrollTo({top,behavior:'instant'}));}}
 window.marketPulse={items,list};
 if(document.readyState==='complete')initialize();else document.addEventListener('DOMContentLoaded',initialize,{once:true});
})();
