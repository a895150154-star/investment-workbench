/* Synthetic chart fixtures only. Never used by tracking, quotes or analysis. */
(() => {
 const daily=Array.from({length:48},(_,i)=>{
   const open=100+Math.sin(i*.46)*3+i*.19,close=open+Math.sin(i*1.7+1)*1.6;
   return {open,close,high:Math.max(open,close)+.6+(i%4)*.18,low:Math.min(open,close)-.7-(i%3)*.14,volume:90+(i*37)%150};
 });
 const average=(series,n)=>series.map((_,i)=>i<n-1?null:series.slice(i-n+1,i+1).reduce((v,p)=>v+p.close,0)/n);
 let period='分时',index=47,show5=true,show10=true;
 const fmt=n=>n.toFixed(2);
 function render(){
  const box=document.querySelector('#opChart');if(!box)return;
  box.className='demo-market-chart';
  const series=period==='周 K'?Array.from({length:12},(_,i)=>{const group=daily.slice(i*4,i*4+4);return {open:group[0].open,close:group[3].close,high:Math.max(...group.map(p=>p.high)),low:Math.min(...group.map(p=>p.low)),volume:group.reduce((n,p)=>n+p.volume,0)};}):daily;
  index=Math.min(index,series.length-1);const ma5=average(series,5),ma10=average(series,10);
  const W=760,H=280,left=48,right=24,top=20,bottom=35,step=(W-left-right)/series.length;
  const min=Math.min(...series.map(p=>p.low))-1,max=Math.max(...series.map(p=>p.high))+1;
  const y=v=>top+(max-v)/(max-min)*(H-top-bottom),x=i=>left+(i+.5)*step;
  const path=a=>a.map((v,i)=>v==null?'':`${i===0||a[i-1]==null?'M':'L'}${x(i).toFixed(1)},${y(v).toFixed(1)}`).join(' ');
  const label=i=>period==='分时'?`${i<24?'上午':'下午'} · 第 ${i%24+1} 个采样点`:`第 ${i+1} ${period==='日 K'?'日':'周'}`;
  const p=series[index];
  box.innerHTML=`<div class="demo-chart-heading"><strong>模拟${period}行情</strong><span>独立演示数据 · 不对应上方历史报价</span></div>
   <div class="demo-chart-values" aria-live="polite"><b>${label(index)}</b><span>开 <strong>${fmt(p.open)}</strong></span><span>高 <strong>${fmt(p.high)}</strong></span><span>低 <strong>${fmt(p.low)}</strong></span><span>收 <strong>${fmt(p.close)}</strong></span><small>模拟价格 / 元</small></div>
   <div class="demo-chart-legends"><label><input type="checkbox" data-demo-ma="5" ${show5?'checked':''}>MA5 <span>${ma5[index]==null?'—':fmt(ma5[index])}</span></label><label><input type="checkbox" data-demo-ma="10" ${show10?'checked':''}>MA10 <span>${ma10[index]==null?'—':fmt(ma10[index])}</span></label></div>
   <svg class="demo-price-svg" viewBox="0 0 ${W} ${H}" role="img" aria-label="${period}模拟走势图，价格与均线均为虚构演示"><title>模拟行情，不代表真实价格</title>
   ${Array.from({length:5},(_,i)=>{const v=min+(max-min)*i/4;return `<line x1="${left}" x2="${W-right}" y1="${y(v)}" y2="${y(v)}" class="demo-grid"/><text x="2" y="${y(v)+4}">${fmt(v)}</text>`;}).join('')}
   ${period==='分时'?`<path d="${path(series.map(p=>p.close))}" class="demo-line"/>`:series.map((p,i)=>`<g class="${p.close>=p.open?'demo-up':'demo-down'}"><line x1="${x(i)}" x2="${x(i)}" y1="${y(p.high)}" y2="${y(p.low)}"/><rect x="${x(i)-step*.29}" y="${Math.min(y(p.open),y(p.close))}" width="${step*.58}" height="${Math.max(1,Math.abs(y(p.open)-y(p.close)))}"/></g>`).join('')}
   ${show5?`<path d="${path(ma5)}" class="demo-ma5"/>`:''}${show10?`<path d="${path(ma10)}" class="demo-ma10"/>`:''}
   <line x1="${x(index)}" x2="${x(index)}" y1="${top}" y2="${H-bottom}" class="demo-crosshair"/>
   <text x="${left}" y="${H-7}">${period==='分时'?'09:30':'第 1 '+(period==='日 K'?'日':'周')}</text><text x="${W/2-20}" y="${H-7}">${period==='分时'?'11:30 / 13:00':'第 '+Math.ceil(series.length/2)+' '+(period==='日 K'?'日':'周')}</text><text x="${W-70}" y="${H-7}">${period==='分时'?'15:00':'第 '+series.length+' '+(period==='日 K'?'日':'周')}</text>
   </svg>
   <div class="demo-volume-label">模拟成交量 <b>${p.volume} 万股 / 份</b></div><svg viewBox="0 0 ${W} 65" class="demo-volume-svg" role="img" aria-label="模拟成交量">${series.map((p,i)=>`<rect x="${x(i)-step*.29}" y="${60-p.volume/Math.max(...series.map(p=>p.volume))*50}" width="${step*.58}" height="${p.volume/Math.max(...series.map(p=>p.volume))*50}" class="${p.close>=p.open?'demo-up':'demo-down'}"/>`).join('')}</svg>
   <label class="demo-chart-slider">拖动查看数据<input type="range" min="0" max="${series.length-1}" value="${index}" aria-label="选择模拟行情采样点" id="demoChartPoint"></label>`;
  box.querySelector('#demoChartPoint').oninput=e=>{const active=e.target===document.activeElement;index=Number(e.target.value);render();if(active)document.querySelector('#demoChartPoint').focus({preventScroll:true});};
  box.querySelectorAll('[data-demo-ma]').forEach(input=>input.onchange=()=>{if(input.dataset.demoMa==='5')show5=input.checked;else show10=input.checked;render();box.querySelector('[data-demo-ma="'+input.dataset.demoMa+'"]').focus({preventScroll:true});});
  box.querySelector('.demo-price-svg').onclick=e=>{const b=e.currentTarget.getBoundingClientRect();index=Math.max(0,Math.min(series.length-1,Math.floor(((e.clientX-b.left)/b.width*W-left)/step)));render();};
 }
 const previous=briefQuote;briefQuote=function(...args){previous(...args);period='分时';index=47;render();const status=document.querySelector('.security-track-status'),panel=document.querySelector('#opChart')?.closest('.flow-panel');if(status&&panel)panel.after(status);};
 document.addEventListener('click',e=>{const b=e.target.closest('[data-op-chart]');if(!b)return;period=b.dataset.opChart;index=47;render();});
 window.demoMarketChart={render};
})();
