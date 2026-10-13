/* Self-reported reading preference, not a suitability assessment or risk score. */
window.researchRisk = (() => {
  const choices={
    unset:{label:'暂不设置',description:'保持原有阅读顺序，之后可以随时补充。'},
    steady:{label:'稳健',description:'先看已披露事实与待验证风险，再看影响路径。'},
    balanced:{label:'均衡',description:'结合增长线索、兑现条件与主要风险一起看。'},
    active:{label:'积极',description:'先展开新方向与潜在催化，同时核对成立条件和风险。'}
  };
  const normalize=value=>Object.hasOwn(choices,value)?value:'unset';
  const current=()=>normalize(briefPrefs.riskPreference);
  const label=value=>choices[normalize(value===undefined?current():value)].label;
  const description=value=>choices[normalize(value===undefined?current():value)].description;
  function lens(id){
    const value=current();if(value==='unset')return '';
    const company=briefItems.find(x=>x.id===id),news=briefNewsAnalysis[id];
    const item=company||news;if(!item)return description();
    const detail=value==='steady'?(item.checks?.[0]?.[1]||item.watch):value==='active'?(news?.teaser||company?.answer):item.answer;
    const firstSentence=String(detail||item.summary).split('。')[0];
    return description()+' 本条先看：'+firstSentence+'。';
  }
  function note(id){return current()==='unset'?'':`<p class="risk-reading-note"><strong>风险偏好（自述）：${label()}</strong><span>${esc(id?lens(id):description())}</span></p>`;}
  return {choices,normalize,current,label,description,lens,note};
})();
