/* V2.38 — replayable, non-destructive spotlight tour of existing controls. */
(() => {
  let current=-1,dialog,returnFocus,previousScroll=0,frame=0;
  const steps=[
    {target:'#profileEntry',title:'先让工作台了解你',copy:'选择阅读重点、关注方向，也可以关联已确认持仓。这是初次填写的入口。后续从左侧“我的研究偏好”独立管理偏好与记忆。',label:'用户薄画像',icon:'sliders-horizontal'},
    {target:'[data-widget="brief"] .widget-head',title:'每天，从个人简报开始',copy:'先看你的标的，再看和你有关的大势',label:'个人简报',icon:'files'},
    {target:'#assistantToggle',title:'看到问题，继续问闪电猫',copy:'点击这里展开助手。阅读简报时，可以切换不同标的继续追问，把资讯和你正在研究的问题接起来。',label:'闪电猫',icon:'sparkles'},
    {target:'[data-existing="股票工作台"]',title:'把关注对象放在一起看',copy:'自选、持仓与标的追踪，都在股票工作台里。已有清单继续复用，不需要在每个功能里重复添加。在这里设置提醒的事件类型和追踪进展。',label:'股票工作台',icon:'star'},
    {target:'[data-preview="subscriptions"]',title:'需要持续关注，到这里管理',copy:'查看已确认的追踪条件和简报设置，按需要修改或停止。之后想重看这份引导，点击右上角「新手引导」即可。',label:'订阅与提醒',icon:'bell'}
  ];
  function selected(){const step={...steps[current]};let target=document.querySelector(step.target);if(!target&&current===1){target=document.querySelector('#addWidget');step.label='添加组件';step.title='把个人简报加回首页';step.copy='你当前隐藏了个人简报。可从「添加组件」把它加回首页，再阅读完整早晚报和调整关注范围。';}return {step,target};}
  const clamp=(x,min,max)=>Math.max(min,Math.min(x,Math.max(min,max)));
  function place(){
    frame=0;if(current<0||!dialog.open)return;
    const {target}=selected(),box=dialog.querySelector('.tour-coach'),w=innerWidth,h=innerHeight;
    if(!target)return;
    const r=target.getBoundingClientRect(),pad=6;
    const x=clamp(r.left-pad,4,w-12),y=clamp(r.top-pad,4,h-12),right=clamp(r.right+pad,x+8,w-4),bottom=clamp(r.bottom+pad,y+8,h-4);
    const width=right-x,height=bottom-y;
    const mask=dialog.querySelector('.tour-shade');mask.setAttribute('viewBox',`0 0 ${w} ${h}`);
    mask.querySelector('path').setAttribute('d',`M0 0H${w}V${h}H0Z M${x} ${y}V${bottom}H${right}V${y}Z`);
    const focus=dialog.querySelector('.tour-spotlight');Object.assign(focus.style,{left:x+'px',top:y+'px',width:width+'px',height:height+'px'});
    box.style.width=Math.min(368,w-32)+'px';box.style.maxHeight=Math.max(180,h-32)+'px';
    const bw=box.offsetWidth,bh=box.offsetHeight,gap=22;
    let left,top,direction;
    if(w>700&&right+bw+gap<w-16){left=right+gap;top=clamp(y,16,h-bh-16);direction='left';}
    else if(bottom+gap+bh<h-16){left=clamp(right-bw,16,w-bw-16);top=bottom+gap;direction='top';}
    else if(y-gap-bh>16){left=clamp(right-bw,16,w-bw-16);top=y-gap-bh;direction='bottom';}
    else {left=clamp(right-bw,16,w-bw-16);top=clamp(bottom+gap,16,h-bh-16);direction='none';}
    Object.assign(box.style,{left:left+'px',top:top+'px'});box.dataset.arrow=direction;
    box.style.setProperty('--tour-arrow-x',clamp(x+width/2-left,22,bw-22)+'px');
    box.style.setProperty('--tour-arrow-y',clamp(y+height/2-top,25,bh-25)+'px');
  }
  function schedule(){if(!frame)frame=requestAnimationFrame(place);}
  function show(index){
    current=index;const {step,target}=selected();
    dialog.innerHTML=`<svg class="tour-shade" aria-hidden="true" preserveAspectRatio="none"><path fill-rule="evenodd"></path></svg><div class="tour-spotlight" aria-hidden="true"></div><section class="tour-coach"><header><span class="tour-cat" aria-hidden="true">${icon(step.icon)}</span><div><small>闪电猫带你认识工作台</small><span>${step.label}</span></div><button class="tour-skip" type="button" data-tour-skip>跳过引导</button></header><div class="tour-copy" aria-live="polite"><p class="tour-counter">${index+1} / ${steps.length}</p><h2 id="workbenchTourTitle">${step.title}</h2><p id="workbenchTourDescription">${step.copy}</p></div><footer><span class="tour-dots" aria-hidden="true">${steps.map((_,i)=>`<i class="${i===index?'current':''}"></i>`).join('')}</span><div>${index?'<button class="tour-prev" type="button" data-tour-prev>上一步</button>':''}<button class="tour-next" type="button" data-tour-next>${index===steps.length-1?'免费体验个股诊断':'下一步'}</button></div></footer></section>`;
    if(target)target.scrollIntoView({block:'center',inline:'nearest',behavior:'instant'});
    place();dialog.querySelector('[data-tour-next]').focus({preventScroll:true});
  }
  function finish(){if(current<0)return;current=-1;cancelAnimationFrame(frame);frame=0;dialog.close();window.scrollTo({top:previousScroll,behavior:'instant'});returnFocus?.focus?.({preventScroll:true});}
  function start(){
    if(dialog.open)return;
    returnFocus=document.activeElement;previousScroll=activeView==='overview'?scrollY:0;
    if(activeView!=='overview')home();
    current=0;dialog.showModal();show(0);
  }
  function init(){
    dialog=document.createElement('dialog');dialog.id='workbenchTour';dialog.setAttribute('aria-labelledby','workbenchTourTitle');dialog.setAttribute('aria-describedby','workbenchTourDescription');document.body.append(dialog);
    dialog.addEventListener('cancel',e=>{e.preventDefault();finish();});
    dialog.addEventListener('click',e=>{if(e.target.closest('[data-tour-skip]'))finish();else if(e.target.closest('[data-tour-prev]'))show(current-1);else if(e.target.closest('[data-tour-next]')){if(current===steps.length-1){finish();window.firstResearchTask?.offer();}else show(current+1);}});
    dialog.addEventListener('keydown',e=>{if(e.key==='ArrowRight'){e.preventDefault();if(current===steps.length-1){finish();window.firstResearchTask?.offer();}else show(current+1);}else if(e.key==='ArrowLeft'&&current>0){e.preventDefault();show(current-1);}});
    $('#onboardingTourEntry').addEventListener('click',start);
    window.addEventListener('resize',schedule);window.addEventListener('scroll',schedule,true);
    $('.design-strip b').textContent='V2.42';
  }
  document.addEventListener('DOMContentLoaded',init);
})();
