/* V2.20: user-entered holdings, local parsing and explicit confirmation only. */
const holdingsStore = (() => {
  const key = 'vra-prototype-holdings-v1';
  const limit = 200;
  let items = [], readError = '', draft = null, generation = 0;
  const clean = value => String(value ?? '').trim();
  const codeOf = value => {
    const match = clean(value).match(/^(?:SH|SZ|BJ)?(\d{1,6})(?:\.(?:SH|SZ|BJ))?$/i);
    return match ? match[1].padStart(6, '0') : clean(value);
  };
  const numeric = value => {
    const s = clean(value);
    return /^\d{1,3}(,\d{3})+(\.\d+)?$/.test(s) ? s.replaceAll(',', '') : s;
  };
  function normalized(row) {
    return {code:codeOf(row.code), name:clean(row.name), type:row.type==='etf'?'etf':'stock', quantity:numeric(row.quantity), cost:numeric(row.cost)};
  }
  function problems(row) {
    const r = normalized(row), errors = [];
    if(!/^\d{6}$/.test(r.code)) errors.push('代码需为 6 位数字');
    if(!r.name || r.name.length>80) errors.push('请填写名称（最多 80 字）');
    if(!/^\d{1,12}$/.test(r.quantity) || !/[1-9]/.test(r.quantity)) errors.push('数量需为正整数，单位为股／份');
    if(r.cost && (!/^\d{1,12}(\.\d{1,6})?$/.test(r.cost))) errors.push('成本价需为非负数，最多 6 位小数');
    return errors;
  }
  function read() {
    const raw=localStorage.getItem(key);
    if(!raw) return [];
    const data=JSON.parse(raw);
    if(data?.version!==1 || !Array.isArray(data.items) || data.items.length>limit || data.items.some(r=>!r||problems(r).length) || new Set(data.items.map(r=>r.code)).size!==data.items.length) throw new Error('invalid holdings');
    return data.items;
  }
  try {items=read();} catch {readError='本地持仓读取失败，原记录未改动。请检查浏览器存储后刷新。';}
  const buttons=()=>'<button class="button primary" data-holding-import>'+icon('files')+'导入持仓表</button><button class="button" data-holding-manual>'+icon('plus')+'手动添加</button>';
  const securityLink=r=>{
    const q=opportunitySecurity(r.code);
    return q ? opLink(esc(r.name),opQuoteRoute(r.code,briefSnapshot().displayed.id)) : esc(r.name);
  };
  function content() {
    return `<div class="review-workspace-intro"><div><h2>我的持仓</h2><p>导入持仓表或手动添加，确认后保存在当前浏览器。</p></div><div class="flow-actions">${buttons()}</div></div>${readError?`<p class="flow-error" role="alert">${readError}</p>`:''}${items.length?`<div class="holdings-table-wrap"><table class="holdings-table"><caption class="sr-only">本地持仓记录，数量单位为股或份，成本价单位为人民币元</caption><thead><tr><th>标的</th><th>持仓数量</th><th>成本价</th><th>记录来源</th><th>操作</th></tr></thead><tbody>${items.map(r=>`<tr><td><strong>${securityLink(r)}</strong><small>${esc(r.code)} · ${r.type==='etf'?'ETF':'股票'}${opportunitySecurity(r.code)?'':' · 详情资料未补齐'}</small></td><td>${esc(r.quantity)} <small class="inline">${r.type==='etf'?'份':'股'}</small></td><td>${r.cost?esc(r.cost)+' 元':'未填写'}</td><td><span>${r.source==='manual'?'手动填写':'表格导入'}</span><small>保存于 ${esc(new Date(r.updatedAt).toLocaleDateString('zh-CN'))}</small></td><td><div class="holdings-row-actions"><button class="text-action" data-holding-edit="${esc(r.code)}">编辑</button><button class="text-action" data-holding-delete="${esc(r.code)}">删除</button></div></td></tr>`).join('')}</tbody></table></div>`:reviewEmpty('把你的持仓放到这里','支持 Excel / CSV 表格；也可以手动添加一只股票或 ETF。','<button class="text-action" data-holding-template>下载空白模板 '+icon('arrow-down')+'</button>')}<p class="holdings-boundary">仅支持 A 股与境内场内 ETF，成本价单位为人民币元。文件在本机解析；这里只保存你确认的数据，未连接证券账户，也不计算实时市值与盈亏。导入不会自动加入自选或开启追踪。</p>`;
  }
  function summary() {
    return items.length ? items.slice(0,4).map(r=>`<div class="review-stock-row"><div>${securityLink(r)}<small>${esc(r.code)} · 本地持仓记录</small></div><div>${esc(r.quantity)} ${r.type==='etf'?'份':'股'}<small>成本价 ${r.cost?esc(r.cost)+' 元':'未填写'}</small></div></div>`).join('')+`<p class="holdings-boundary">${items.length} 只本地持仓 · 未连接证券账户</p><button class="text-action" data-review-account="holdings">查看全部持仓</button>` : '<p class="data-message">还没有持仓记录，导入表格或手动添加即可开始。</p><button class="text-action" data-review-account="holdings">导入或添加持仓</button>';
  }
  function showDialog(title, body) {
    openModal(title,body,'股票工作台 / 持仓');
    $('#modal').classList.add('holdings-modal');
    $('#modal').scrollTop=0;
  }
  function error(text) {const el=$('#holdingError');if(el){el.textContent=text;if(text)el.scrollIntoView({block:'nearest'});}}
  function start(mode, code) {
    generation++;
    const row=items.find(r=>r.code===code);
    draft={mode,source:mode==='import'?'file':'manual',rows:row?[{...row}]:[{code:'',name:'',type:'stock',quantity:'',cost:''}],originalCode:row?.code,policy:row?'update':'skip',workbook:null,fileName:'',step:mode==='import'?'file':'review'};
    if(mode==='import') fileStep(); else reviewStep();
  }
  function fileStep() {
    draft.step='file';
    showDialog('导入持仓表',`<ol class="holdings-steps"><li class="current">1 选择文件</li><li>2 核对并确认</li></ol><p>首行为表头，每行一只股票或 ETF。选择文件后，先识别列，再核对持仓。</p><label class="holdings-upload"><strong>${icon('files')}选择 Excel / CSV 文件</strong><span>.xlsx、.xls、.csv · 不超过 5 MB · 单次最多 ${limit} 条</span><input id="holdingsFile" type="file" accept=".xlsx,.xls,.csv" aria-label="选择持仓表文件"></label><button class="text-action" data-holding-template>下载空白 CSV 模板</button><div id="holdingFileMapping"></div><p id="holdingError" class="flow-error" role="alert"></p><div class="modal-actions"><button class="button" data-holding-cancel>取消</button><button class="button primary" id="holdingReview" disabled>下一步：核对持仓</button></div><p class="holdings-boundary">文件只在本机解析；确认前不会保存任何持仓。</p>`);
    $('#holdingsFile').onchange=e=>loadFile(e.target.files[0]);
    $('#holdingReview').onclick=()=>{
      try {
        const mapping=Object.fromEntries([...document.querySelectorAll('[data-holding-column]')].map(el=>[el.dataset.holdingColumn,Number(el.value)]));
        if(mapping.code<0 || mapping.quantity<0){error('请选择股票代码和持仓数量对应的列。');return;}
        const used=Object.values(mapping).filter(n=>n>=0);
        if(new Set(used).size!==used.length){error('每个字段请选择不同的列。');return;}
        draft.rows=draft.table.slice(1).filter(row=>row.some(v=>clean(v))).map(row=>{
          const code=codeOf(row[mapping.code]),q=opportunitySecurity(code);
          return {code,name:mapping.name<0?q?.name||'':clean(row[mapping.name])||q?.name||'',type:q?.type==='etf'?'etf':'stock',quantity:numeric(row[mapping.quantity]),cost:mapping.cost<0?'':numeric(row[mapping.cost])};
        });
        if(!draft.rows.length){error('没有可导入的持仓行。请在表头下填写持仓。');return;}
        if(draft.rows.length>limit){error(`单次最多导入 ${limit} 条，请拆分表格。`);return;}
        reviewStep();
      } catch {error('表格未能识别，请重新选择文件。');}
    };
  }
  async function loadFile(file) {
    if(!file)return;
    const token=++generation,owner=draft;
    draft.workbook=null;$('#holdingFileMapping').innerHTML='';$('#holdingReview').disabled=true;
    if(!/\.(xlsx|xls|csv)$/i.test(file.name)){error('请选择 Excel（.xlsx / .xls）或 CSV 文件。');return;}
    if(file.size>5*1024*1024){error('文件超过 5 MB，请拆分后导入。');return;}
    error('');$('#holdingError').textContent='正在读取文件…';
    try {
      const buffer=await file.arrayBuffer();
      if(token!==generation||draft!==owner||!$('#modal').open)return;
      if(!window.XLSX)throw new Error('parser unavailable');
      const signature=new Uint8Array(buffer,0,Math.min(4,buffer.byteLength));
      if(/\.xlsx$/i.test(file.name)&&!(signature[0]===0x50&&signature[1]===0x4b))throw new Error('invalid xlsx');
      if(/\.xls$/i.test(file.name)&&!(signature[0]===0xd0&&signature[1]===0xcf&&signature[2]===0x11&&signature[3]===0xe0))throw new Error('invalid xls');
      // Raw CSV values retain codes and avoid implicit date/number conversion.
      let input=buffer,options={type:'array',sheetRows:limit+2,cellFormula:false};
      if(/\.csv$/i.test(file.name)){
        const bytes=new Uint8Array(buffer);
        const text=bytes[0]===0xff&&bytes[1]===0xfe?new TextDecoder('utf-16le').decode(bytes):new TextDecoder('utf-8').decode(bytes);
        input=text.includes('\ufffd')?new TextDecoder('gb18030').decode(bytes):text;
        options={...options,type:'string',raw:true};
      }
      const book=XLSX.read(input,options);
      if(!book.SheetNames.length)throw new Error('no sheet');
      draft.workbook=book;draft.fileName=file.name;
      error('');mapSheet(book.SheetNames[0]);
    } catch {if(token===generation&&draft===owner)error('读取失败：文件可能已损坏、加密或格式不受支持。请另存为 .xlsx / CSV，或改用手动添加。');}
  }
  function mapSheet(name) {
    const book=draft.workbook,sheet=book.Sheets[name];
    $('#holdingFileMapping').innerHTML=`<div class="holdings-file-meta"><strong>${esc(draft.fileName)}</strong><label>工作表<select id="holdingSheet">${book.SheetNames.map(n=>`<option value="${esc(n)}" ${n===name?'selected':''}>${esc(n)}</option>`).join('')}</select></label></div><div id="holdingColumns"></div>`;
    $('#holdingSheet').onchange=e=>{error('');mapSheet(e.target.value);};
    const table=XLSX.utils.sheet_to_json(sheet,{header:1,defval:'',raw:false,blankrows:false});
    const range=XLSX.utils.decode_range(sheet['!fullref']||sheet['!ref']||'A1');
    if(table.length>limit+1||range.e.r-range.s.r>limit){$('#holdingReview').disabled=true;error(`该工作表超过 ${limit} 条，请拆分后导入。`);return;}
    const headers=table[0]||[];
    if(!headers.length || headers.length>50){$('#holdingReview').disabled=true;error('表头为空或列数超过 50，请使用模板整理。');return;}
    draft.table=table;
    const aliases={code:['股票代码','证券代码','代码','code','symbol'],name:['股票名称','证券名称','名称','name'],quantity:['持仓数量','证券数量','股票余额','持仓余额','数量','quantity','shares'],cost:['成本价','成本价格','持仓成本价','平均成本价','买入均价','cost','costprice']};
    const labels={code:'股票代码（必选）',name:'名称（可稍后补充）',quantity:'持仓数量（必选）',cost:'成本价（可选，元）'};
    const notes={code:'如 000001，前导零会自动补齐。',name:'未填写时，只匹配原型已有资料；其他名称由你补充。',quantity:'按股或份填写，不使用“手”。',cost:'选择每股／份成本价，不是成本总金额。'};
    $('#holdingColumns').innerHTML=`<div class="holdings-mapping">${Object.keys(aliases).map(key=>{const selected=headers.findIndex(h=>aliases[key].includes(clean(h).toLowerCase().replace(/[\s_（）()]/g,'')));return `<label class="field"><span>${labels[key]}</span><select data-holding-column="${key}"><option value="-1">${['code','quantity'].includes(key)?'请选择对应列':'不导入此列'}</option>${headers.map((h,i)=>`<option value="${i}" ${i===selected?'selected':''}>${esc(clean(h)||'未命名列')}（第 ${i+1} 列）</option>`).join('')}</select><small>${notes[key]}</small></label>`;}).join('')}</div><p class="holdings-boundary">已读取 ${table.length-1} 行待核对内容。请确认列的含义，下一步可修改每一行。</p>`;
    $('#holdingReview').disabled=table.length<2;
  }
  function rowMarkup(r,index) {
    return `<tr data-holding-row="${index}"><td><input aria-label="第 ${index+1} 行代码" data-holding-field="code" value="${esc(r.code)}" inputmode="numeric" maxlength="12" ${draft.mode==='edit'?'readonly':''}></td><td><input aria-label="第 ${index+1} 行名称" data-holding-field="name" value="${esc(r.name)}" maxlength="80"><select aria-label="第 ${index+1} 行类型" data-holding-field="type"><option value="stock" ${r.type!=='etf'?'selected':''}>股票 · 股</option><option value="etf" ${r.type==='etf'?'selected':''}>ETF · 份</option></select></td><td><input aria-label="第 ${index+1} 行数量" data-holding-field="quantity" value="${esc(r.quantity)}" inputmode="numeric" placeholder="股 / 份"></td><td><input aria-label="第 ${index+1} 行成本价" data-holding-field="cost" value="${esc(r.cost)}" inputmode="decimal" placeholder="可不填"></td><td><span class="holding-row-state" aria-live="polite"></span>${draft.mode==='edit'?'':`<button class="text-action" data-holding-remove="${index}" aria-label="移除第 ${index+1} 行">移除</button>`}</td></tr>`;
  }
  function reviewStep() {
    draft.step='review';
    showDialog(draft.mode==='edit'?'编辑持仓':draft.mode==='manual'?'手动添加持仓':'核对持仓',`${draft.mode==='import'?'<ol class="holdings-steps"><li>1 选择文件</li><li class="current">2 核对并确认</li></ol>':''}<p>${draft.mode==='import'?'请核对识别结果，可以直接修改；ETF 请确认类型为“ETF”。':'填写代码、名称与数量，成本价可选填。'} 数量按股／份、成本价按人民币元填写。</p><div class="holdings-table-wrap"><table class="holdings-table holdings-edit-table"><thead><tr><th>代码</th><th>名称与类型</th><th>数量（股／份）</th><th>成本价（元）</th><th>核对状态</th></tr></thead><tbody>${draft.rows.map(rowMarkup).join('')}</tbody></table></div>${draft.mode==='manual'?'<button class="text-action" data-holding-add-row>再添加一行</button>':''}${draft.mode!=='edit'?`<label class="field holdings-policy"><span>与已有持仓代码重复时</span><select id="holdingDuplicate"><option value="skip" ${draft.policy==='skip'?'selected':''}>保留已有持仓，跳过本次重复行</option><option value="update" ${draft.policy==='update'?'selected':''}>使用本次数据更新同代码持仓</option></select><small>更新会替换该标的的数量和成本价，不会自动累加；未填写成本价会清空原成本价。</small></label>`:''}<p id="holdingReviewSummary" class="holdings-review-summary" aria-live="polite"></p><p id="holdingError" class="flow-error" role="alert"></p><div class="modal-actions">${draft.mode==='import'?'<button class="button" data-holding-back>重新选择文件</button>':''}<button class="button" data-holding-cancel>取消</button><button class="button primary" id="holdingConfirm">${draft.mode==='edit'?'确认修改':'确认保存持仓'}</button></div><p class="holdings-boundary">确认后仅保存在当前浏览器，不影响未出现在本次表格中的持仓。未连接账户、行情或后台监控。</p>`);
    $('#holdingDuplicate')?.addEventListener('change',e=>{draft.policy=e.target.value;feedback();});
    $('#holdingConfirm').onclick=commit;
    feedback();
  }
  function reviewStatus() {
    const counts=new Map();
    draft.rows.forEach(r=>{const c=codeOf(r.code);counts.set(c,(counts.get(c)||0)+1);});
    return draft.rows.map(row=>{
      const r=normalized(row),errors=problems(r);
      if(counts.get(r.code)>1)errors.push('本次有重复代码，请合为一行');
      const exists=items.some(x=>x.code===r.code);
      return {r,errors,action:exists?(draft.policy==='update'?'update':'skip'):'add'};
    });
  }
  function feedback() {
    const rows=reviewStatus(),counts={add:0,update:0,skip:0};
    rows.forEach((r,i)=>{
      counts[r.action]++;
      const el=$(`[data-holding-row="${i}"] .holding-row-state`);
      if(el){el.textContent=r.errors.join('；')||({add:'新增',update:'更新已有持仓',skip:'已有持仓 · 将跳过'}[r.action]);el.classList.toggle('invalid',!!r.errors.length);}
    });
    $('#holdingReviewSummary').textContent=`共 ${rows.length} 条：新增 ${counts.add} 条，更新 ${counts.update} 条，跳过 ${counts.skip} 条。`+(rows.some(r=>r.errors.length)?'请先修正标红内容。':'');
    $('#holdingConfirm').disabled=!!readError||!rows.length||rows.some(r=>r.errors.length)||counts.add+counts.update===0;
  }
  function persist(next) {
    try {localStorage.setItem(key,JSON.stringify({version:1,items:next}));items=next;return true;}
    catch {error('保存失败，原持仓未改变。请检查浏览器存储空间后重试。');return false;}
  }
  function commit() {
    if(!draft||readError)return;
    try {items=read();}catch{error('无法读取当前持仓，未保存本次修改。');return;}
    const rows=reviewStatus();
    if(!rows.length||rows.some(r=>r.errors.length)){feedback();return;}
    if(!rows.some(r=>r.action!=='skip')){feedback();error('本次全部为重复代码。可选择更新，或取消本次导入。');return;}
    if(draft.mode==='edit'&&!items.some(r=>r.code===draft.originalCode)){error('这条持仓已被移除，请关闭后重新添加。');return;}
    const next=items.map(r=>({...r})),time=new Date().toISOString();
    for(const row of rows){
      if(row.action==='skip')continue;
      const index=next.findIndex(r=>r.code===row.r.code);
      const record={...row.r,source:draft.source,updatedAt:time};
      if(index>=0)next[index]=record;else next.push(record);
    }
    if(next.length>limit){error(`本地持仓最多 ${limit} 条，请减少后再保存。`);return;}
    if(!persist(next))return;
    closeModal();renderWidgets();showReviewAccount('holdings');toast('持仓已保存到当前浏览器');
  }
  function remove(code) {
    const r=items.find(x=>x.code===code);if(!r)return;
    showDialog('删除持仓记录',`<p>删除 ${esc(r.name)}（${esc(r.code)}）的本地持仓记录？</p><p>自选和追踪设置不受影响。</p><p id="holdingError" class="flow-error" role="alert"></p><div class="modal-actions"><button class="button" data-holding-cancel>取消</button><button class="button primary" id="holdingDeleteConfirm">确认删除</button></div>`);
    $('#holdingDeleteConfirm').onclick=()=>{
      try{items=read();}catch{error('当前持仓读取失败，未删除任何记录。');return;}
      if(!persist(items.filter(x=>x.code!==code)))return;
      closeModal();renderWidgets();toast('已删除这条本地持仓');
    };
  }
  function template() {
    const url=URL.createObjectURL(new Blob(['\uFEFF股票代码,股票名称,持仓数量,成本价\r\n'],{type:'text/csv;charset=utf-8'}));
    const a=document.createElement('a');a.href=url;a.download='持仓导入模板.csv';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
  }
  document.addEventListener('click',e=>{
    const el=e.target.closest('button');if(!el)return;
    if(el.hasAttribute('data-holding-import'))start('import');
    if(el.hasAttribute('data-holding-manual'))start('manual');
    if(el.dataset.holdingEdit)start('edit',el.dataset.holdingEdit);
    if(el.dataset.holdingDelete)remove(el.dataset.holdingDelete);
    if(el.hasAttribute('data-holding-cancel'))closeModal();
    if(el.hasAttribute('data-holding-template'))template();
    if(el.hasAttribute('data-holding-back')){generation++;fileStep();}
    if(el.hasAttribute('data-holding-remove')&&draft){draft.rows.splice(Number(el.dataset.holdingRemove),1);reviewStep();}
    if(el.hasAttribute('data-holding-add-row')&&draft){if(draft.rows.length>=limit){error(`最多 ${limit} 条。`);return;}draft.rows.push({code:'',name:'',type:'stock',quantity:'',cost:''});reviewStep();}
  });
  document.addEventListener('input',e=>{
    const field=e.target.dataset.holdingField,index=e.target.closest('[data-holding-row]')?.dataset.holdingRow;
    if(!field||index===undefined||!draft)return;
    const r=draft.rows[Number(index)],previous=opportunitySecurity(codeOf(r.code));r[field]=e.target.value;
    if(field==='code'){
      const q=opportunitySecurity(codeOf(r.code));
      if(q&&(!r.name||r.name===previous?.name)){r.name=q.name;r.type=q.type==='etf'?'etf':'stock';const tr=e.target.closest('tr');tr.querySelector('[data-holding-field=name]').value=r.name;tr.querySelector('[data-holding-field=type]').value=r.type;}
    }
    error('');feedback();
  });
  $('#modal').addEventListener('close',()=>{generation++;draft=null;$('#modal').classList.remove('holdings-modal');});
  return {count:()=>items.length,content,summary,identities:()=>items.map(({code,name,type})=>({code,name,type}))};
})();
