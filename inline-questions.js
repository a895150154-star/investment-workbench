/* V2.50: rotate the question at the foot of each existing news analysis. */
(() => {
  const reduced=matchMedia('(prefers-reduced-motion: reduce)'),states=new WeakMap();
  function questions(id){
    const demo=window.focusDemo?.variant(id);if(demo)return demo.questions;
    const item=briefItems.find(x=>x.id===id),a=item||briefNewsAnalysis[id];if(!a)return [];
    return [{label:a.question,answer:null},...a.checks.map(([h,answer])=>({label:(item?item.company:a.object)+'：'+h+'，还需要核对哪些信息？',answer}))];
  }
  function row(id,issue){const list=questions(id);if(!list.length)return '';
    if(researchDemo.isCase(id))return `<div class="research-demo-card-questions">${researchDemo.questionButtons(issue.id)}</div>`;
    return `<div class="inline-questions" data-iq-id="${esc(id)}" data-iq-issue="${esc(issue.id)}" aria-label="本条资讯的追问示例" aria-roledescription="手动切换"><button class="iq-ask" data-iq-ask><span class="iq-label">问闪电猫</span>${icon('arrow-up-right')}<span class="iq-text">${esc(list[0].label)}</span></button><div class="iq-controls"><button data-iq-step="-1" aria-label="上一个问题">${icon('chevron-left')}</button><span class="iq-position" aria-live="off">1 / ${list.length}</span><button data-iq-step="1" aria-label="下一个问题">${icon('chevron-right')}</button></div></div>`;
  }
  function replace(html,id,issue){const t=document.createElement('template');t.innerHTML=html;
    const b=t.content.querySelector('.report-analysis > button[data-editorial-ask],.report-analysis > button[data-brief-action="question"]');
    if(b)b.outerHTML=row(id,issue);return t.innerHTML;
  }
  const newsBlock=briefNewsAnalysisBlock,alert=briefAlert;
  briefNewsAnalysisBlock=(id,issue)=>replace(newsBlock(id,issue),id,issue);
  briefAlert=(item,issue)=>replace(alert(item,issue),item.id,issue);
  function state(root){if(!states.has(root))states.set(root,{index:0});return states.get(root);}
  function update(root,step){const s=state(root),list=questions(root.dataset.iqId);s.index=(s.index+step+list.length)%list.length;
    const text=root.querySelector('.iq-text');text.textContent=list[s.index].label;
    root.querySelector('.iq-position').textContent=`${s.index+1} / ${list.length}`;
    if(!reduced.matches)text.animate([{opacity:0,transform:'translateY(7px)'},{opacity:1,transform:'translateY(0)'}],{duration:220});
  }
  document.addEventListener('click',e=>{
    const b=e.target.closest('button'),root=b?.closest('.inline-questions');if(!root)return;
    const s=state(root);
    if(b.hasAttribute('data-iq-step')){update(root,Number(b.dataset.iqStep));return;}
    if(!b.hasAttribute('data-iq-ask'))return;
    const id=root.dataset.iqId,question=questions(id)[s.index],issue=issueFromId(root.dataset.iqIssue);
    if(briefItems.some(x=>x.id===id))briefAsk(id,issue,false,question.label);
    else editorialAsk('news-'+id,question.label,null,issue.id);
    if(question.answer)$('#assistantContent .user-message')?.insertAdjacentHTML('afterend',`<section class="guide-specific-answer"><strong>本次核对重点</strong><p>${esc(question.answer)}</p><small>根据本条固定资料整理；下方保留完整解读与来源。</small></section>`);
  });
  document.addEventListener('keydown',e=>{const root=e.target.closest('.inline-questions');if(!root||!['ArrowLeft','ArrowRight'].includes(e.key))return;e.preventDefault();update(root,e.key==='ArrowRight'?1:-1);});
  document.addEventListener('DOMContentLoaded',()=>{if(activeView==='brief'&&selectedIssue)showBrief(selectedIssue.id);});
})();
