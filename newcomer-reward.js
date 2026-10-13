/* Local demonstration entitlement. No account balance, payment or redeemable value. */
window.newcomerReward=(()=>{
  const KEY='vra-prototype-newcomer-reward-v1';
  const points=100;
  function read(){
    try{const value=JSON.parse(localStorage.getItem(KEY));if(value?.version===1&&['ready','claimed'].includes(value.status)&&typeof value.company==='string')return value;}catch{}
    return {version:1,status:'new'};
  }
  function write(value){try{localStorage.setItem(KEY,JSON.stringify(value));return true;}catch{return false;}}
  function complete(company){const saved=read();if(saved.status!=='new')return true;return write({version:1,status:'ready',company,completedAt:new Date().toISOString()});}
  function claim(){const saved=read();if(saved.status==='claimed')return true;if(saved.status!=='ready')return false;return write({...saved,status:'claimed',points,claimedAt:new Date().toISOString()});}
  function banner(){const state=read();return `<section class="newcomer-gift"><span class="newcomer-gift-mark" aria-hidden="true">${icon('sparkles')}</span><div><strong>${state.status==='claimed'?'新手权益已体验，可继续查看诊断':state.status==='ready'?'首次诊断体验已完成，积分待领取':'免费体验一次个股诊断'}</strong><p>${state.status==='claimed'?`${points} 演示积分已领取，不重复赠送。`:state.status==='ready'?`还有 ${points} 演示积分待领取。`:`完成首次诊断体验，再领 ${points} 演示积分。`}</p><small>本地演示权益 · 不可消费或兑换</small></div></section>`;}
  function panel(){const state=read();return `<section class="newcomer-reward-panel" aria-label="新手积分"><span class="eyebrow">新手专享 · 演示权益</span><strong>${points}<small> 演示积分</small></strong><p>${state.status==='claimed'?'已领取 · 本浏览器仅赠送一次。':state.status==='ready'?'首次诊断体验已完成，点击领取。':'完成首次诊断体验后可领取。'}</p>${state.status==='ready'?'<button class="button primary" data-newcomer-claim>领取 100 演示积分</button>':''}<p class="newcomer-reward-status" role="status"></p><small>仅保存在本浏览器，不是账户余额，不可消费或兑换。</small></section>`;}
  document.addEventListener('click',e=>{
    if(!e.target.closest('[data-newcomer-claim]'))return;
    if(!claim()){const status=document.querySelector('.newcomer-reward-status');if(status)status.textContent='领取未保存成功，请重试；本次未记为已领取。';return;}
    document.querySelectorAll('.newcomer-reward-panel').forEach(el=>{el.outerHTML=panel();});
  });
  return {points,banner,panel,complete,status:()=>read().status};
})();
