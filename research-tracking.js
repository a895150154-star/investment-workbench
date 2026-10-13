/* One device-local, transactional record for the fixed research demonstration. */
(() => {
  const key='vra-personalized-research-demo-v1',legacyKey='vra-prototype-event-tracking-v1';
  const copy=value=>JSON.parse(JSON.stringify(value));
  const observationIds=researchDemo.observations.map(o=>o.id);
  const samples=Object.freeze([
    Object.freeze({id:'adaptation',title:'客户适配推进',text:'模拟合作方披露适配验证进入下一阶段；具体机型、验证结果与商业规模仍需原始资料核对。',next:'核对适配机型、验证结果和合作方原始披露。'}),
    Object.freeze({id:'delivery',title:'实际交付延期',text:'模拟交付节点延期，尚未说明延期原因、影响范围和新的交付日期。',next:'核对延期原因、新交付时间，以及是否影响客户后续采购。'}),
    Object.freeze({id:'purchase',title:'持续采购取消',text:'模拟后续采购安排取消；取消范围、原因及经营影响尚未提供。',next:'核对取消范围、客户原因及后续经营披露，重新评估落地节奏。'})
  ]);
  const empty=()=>({schemaVersion:1,record:null,materials:[],signals:[]});
  let state=empty(),readError='';
  try {
    const raw=localStorage.getItem(key);
    if(raw){const saved=JSON.parse(raw);
      if(saved?.schemaVersion!==1||!Array.isArray(saved.materials)||!Array.isArray(saved.signals)||
        (saved.record&&(!['active','completed','stopped'].includes(saved.record.status)||saved.record.id!=='tracking-haiguang-2490095'||!Array.isArray(saved.record.observations)||saved.record.observations.some(id=>!observationIds.includes(id)))))throw new Error('invalid');
      state=saved;
    }
  }catch{readError='未能读取已有追踪数据，原数据保留。请检查浏览器存储后刷新重试。';}
  function commit(next,message){
    if(readError)return {ok:false,message:readError};
    try{localStorage.setItem(key,JSON.stringify(next));state=next;return {ok:true,message};}
    catch{return {ok:false,message:'未能保存，原追踪设置和信号保留。请重试。'};}
  }
  function legacy(){
    try{const old=JSON.parse(localStorage.getItem(legacyKey)||'null')?.['2490095'];return old&&!old.demo?copy(old):null;}
    catch{return null;}
  }
  function save(draft){
    const selected=observationIds.filter(id=>draft.observations?.includes(id));
    if(!selected.length)return {ok:false,message:'请至少选择一个观察项。'};
    if(!['持续提醒','仅提醒一次'].includes(draft.frequency))return {ok:false,message:'请选择提醒频率。'};
    const old=state.record,stamp=new Date().toISOString();
    const record={id:'tracking-haiguang-2490095',security:'event-haiguang',eventId:'2490095',eventTitle:researchDemo.sources[0].title,
      observations:selected,frequency:draft.frequency,channel:'工作台内提醒',status:'active',createdAt:old?.createdAt||stamp,updatedAt:stamp};
    return commit({...copy(state),record},old?'追踪设置已更新':'追踪设置已保存');
  }
  function stop(){
    if(!state.record)return {ok:false,message:'追踪尚未保存。'};
    return commit({...copy(state),record:{...copy(state.record),status:'stopped',updatedAt:new Date().toISOString()}},'追踪已停止，历史信号和长期关注保留');
  }
  function simulate(sampleId,day){
    const sample=samples.find(s=>s.id===sampleId),record=state.record;
    if(!sample||!/^\d{4}-\d{2}-\d{2}$/.test(day))return {ok:false,message:'请核对模拟进展和期次日期。'};
    if(!record)return {ok:false,message:'追踪尚未保存，请先确认观察项。未新增信号。'};
    if(record.status==='stopped')return {ok:false,message:'该追踪已停止，未新增信号。历史信号仍可查看。'};
    if(record.status==='completed')return {ok:false,message:'仅提醒一次的追踪已完成，未新增信号。重新确认设置后可继续演示。'};
    const next=copy(state),sequence=next.materials.length+1;
    const material={id:'research-material-'+sequence,eventId:record.eventId,security:record.security,day,time:day+' 16:30:'+String((sequence-1)%60).padStart(2,'0'),observation:sample.id,title:sample.title,text:sample.text,next:sample.next,demo:true};
    next.materials.push(material);
    const matched=record.observations.includes(sample.id);
    if(matched){next.signals.push({id:'research-signal-'+sequence,recordId:record.id,eventId:record.eventId,security:record.security,materialId:material.id,day,time:material.time,
      condition:{observations:[...record.observations],matched:sample.id,frequency:record.frequency,channel:record.channel},demo:true});
      if(record.frequency==='仅提醒一次')next.record.status='completed';
    }
    const result=commit(next,matched?'已生成模拟信号；资料不足以确认商业兑现。':'模拟资料已记录，未命中已选观察项；本期暂无新触发。');
    return {...result,matched:result.ok&&matched};
  }
  function forDay(day){const current=copy(state);return {...current,materials:current.materials.filter(m=>m.day===day),signals:current.signals.filter(s=>s.day===day)};}
  window.researchTracking=Object.freeze({key,get:()=>copy(state),legacy,save,stop,simulate,forDay,samples,get readError(){return readError;}});
})();
