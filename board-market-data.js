/* Recorded board snapshots plus explicitly authored demo members and events.
 * No live market feed, stock-membership service, model or Skill is called. */
window.boardMarketData=(()=>{
 const groups={
  culture:[['301052','果麦文化',34.06,14.49,1.17],['002343','慈文传媒',8.10,10.05,-.68064,4,'09:30:03'],['603096','新经典',23.07,10.01,-1.19,4,'09:43:14'],['603533','掌阅科技',29.92,10,2.86,1,'10:07:31'],['601858','中国科传',26.11,9.98,1.28,1,'13:51:11'],['601811','新华文轩',23.25,9.98,1.64,1,'14:56:50'],['603598','引力传媒',21.91,9.99,3.68,1,'14:28:32'],['300413','芒果超媒',25.64,6.83,-.139929],['300364','中文在线',26.58,3.46,1.48],['600825','新华传媒',13.78,0,.06,10],['600831','广电网络',3.87,-10,-.44],['605577','龙版传媒',18.95,-7.32,-.61]],
  chip:[['688041','海光信息'],['688981','中芯国际'],['603501','韦尔股份'],['688012','中微公司']],
  electric:[['600900','长江电力'],['600795','国电电力'],['600025','华能水电']],
  communication:[['300308','中际旭创'],['300502','新易盛'],['300394','天孚通信'],['600487','亨通光电']],
  components:[['002463','沪电股份'],['002916','深南电路'],['600183','生益科技']],
  battery:[['300750','宁德时代'],['300014','亿纬锂能'],['002074','国轩高科']],
  coal:[['601088','中国神华'],['600188','兖矿能源'],['601225','陕西煤业']],
  consumer:[['002475','立讯精密'],['002241','歌尔股份'],['300433','蓝思科技']],
  glass:[['600176','中国巨石'],['002080','中材科技'],['000012','南玻A']],
  oil:[['601857','中国石油'],['600028','中国石化'],['600938','中国海油']],
  general:[['600770','综艺股份'],['000009','中国宝安'],['600624','复旦复华']],
  finance:[['600318','新力金融'],['000415','渤海租赁'],['600120','浙江东方']],
  medical:[['300015','爱尔眼科'],['300347','泰格医药'],['603259','药明康德']],
  cement:[['600585','海螺水泥'],['000401','冀东水泥'],['002233','塔牌集团']],
  retail:[['600729','重庆百货'],['601010','文峰股份'],['002251','步步高']]
 };
 const reasons={
  '002343':'AIGC平台建设与AI漫剧业务成为关注线索，继续核对项目推进、客户合作及实际收入。',
  '603096':'出版产业相关政策成为观察线索，关注内容版权与主营业务的实际变化。',
  '603533':'AI短剧与数字内容出海受到关注，后续核对产品采用与商业化表现。',
  '601858':'文化传媒与AI内容方向活跃，持续核对公司业务覆盖与业绩兑现。',
  '601811':'教育数字化与AI教辅方向受到关注，后续核对公司产品和订单进展。',
  '603598':'短剧出海方向受到关注，继续查看客户合作与业务披露。',
  '600831':'样例以重整进展和诉讼风险解释当日异动，实际判断需回看公司公告。',
  '605577':'样例展示短期交易波动与获利回吐线索，尚未核验具体驱动。'
 };
 const stocks={};let n=0;
 Object.entries(groups).forEach(([group,rows])=>rows.forEach((row,i)=>{
  const [code,name,p,c,f,boards=0,time='']=row,authored=p==null;
  const limit=authored?i===0:!!time;
  stocks[code]={code,name,price:p??Number((12+n*1.73).toFixed(2)),change:c??(i===0?10:[2.31,-1.27,0.68][(i-1)%3]),flow:f??Number((i===0?1.12:(i%2?-.36:.53)).toFixed(2)),boards:authored?(limit?1:0):boards,limitTime:authored?(limit?'10:18:36':''):time,limit,reason:reasons[code]||`${name}所在方向的交易活跃度提升，样例以产业需求和业务进展作为观察线索，后续需核对公告、订单与业绩。`,group,sealedAmount:limit?Number((.48+i*.21).toFixed(2)):0};n++;
 }));
 stocks['601811'].sealedAmount=.0007207;
 // Independent authored amounts, rounded aggregate is 6.37亿; not inferred from quotes.
 ['002343','603096','603533','601858','603598'].forEach((code,i)=>stocks[code].sealedAmount=[.98,1.32,1.48,.62,1.97][i]);
 const keys=g=>groups[g].map(r=>r[0]);
 const combine=(...gs)=>[...new Set(gs.flatMap(keys))];
 const industry=[
  ['demo-culture','文化传媒',14.83,1.35,keys('culture')],['ref-semiconductor','半导体类',-64.18,-2.92,keys('chip')],['demo-electric','电力',9.01,.33,keys('electric')],['ref-communication','通信系统设备',-55.53,-2.30,keys('communication')],['demo-components','元件',8.75,-.95,keys('components')],['ref-battery','电池',-29.10,-3.06,keys('battery')],['demo-coal','煤炭',7.92,1.17,keys('coal')],['ref-consumer','消费电子类',-16.84,-2.20,keys('consumer')],['demo-glass','玻璃玻纤',-16.03,-2.74,keys('glass')],['demo-oil','石油类',7.35,-.42,keys('oil')]
 ];
 const concept=[
  ['demo-entertainment','文娱消费',11.36,.87,combine('culture','consumer')],['margin','融资融券',-289.15,-1.68,combine('chip','components','culture')],['demo-ai-data','AI语料',10.14,1.63,['603533','300364','601858','301052']],['demo-msci','MSCI中国',-246.14,-1.34,combine('electric','oil','battery')],['demo-film','影视概念',10.11,.87,['002343','300413','603598','600825']],['ftse','富时罗素',-210.52,-.95,combine('communication','consumer','electric')],['demo-aigc','AIGC概念',9.86,-.05,['002343','603533','300364','688041']],['sz-connect','深股通',-170.23,-1.76,combine('consumer','battery','components')],['demo-csi300','沪深300',-169.76,-.82,combine('electric','oil','battery')],['demo-short-drama','短剧互动游戏',9.72,1.41,['002343','603598','300364','603533']]
 ];
 const boards=[...industry.map(r=>({id:r[0],name:r[1],flow:r[2],change:r[3],members:r[4],kind:'industry'})),...concept.map(r=>({id:r[0],name:r[1],flow:r[2],change:r[3],members:r[4],kind:'concept'}))];
 const legacy=[['ref-general','综合类','general'],['ref-ship','船舶制造','oil'],['ref-finance','多元金融','finance'],['ref-medical','医疗服务','medical'],['ref-cement','水泥建材','cement'],['ref-retail','商业百货','retail'],['internet','互联网服务','culture'],['communications','通信系统设备','communication'],['culture','文化传媒','culture'],['grid','电网设备','electric'],['computer','计算机设备','chip'],['special','专业设备','components'],['metals','有色','components'],['components','元件','components'],['general','通用设备','components'],['automobiles','汽车整车','battery'],['ai','人工智能概念','chip'],['baidu','百度概念','culture'],['sh-connect','沪股通','electric'],['consumer','消费电子概念','consumer'],['state-reform','央国企改革','oil'],['metaverse','元宇宙概念','culture'],['agents','AI智能体','chip']];
 // Legacy unmatched membership is kept as missing, never filled with another sector.
 legacy.forEach(([id,name,group])=>{if(!boards.some(b=>b.id===id))boards.push({id,name,flow:0,change:0,members:['ref-ship','internet','grid','computer','special','metals','general','automobiles','baidu','state-reform','metaverse','agents'].includes(id)?[]:keys(group),kind:'industry',legacy:true});});
 function moves(board){
  if(board.id==='demo-culture')return [
   ['14:56:50','601811',9.98,'涨停回封',31,.0007207,0,'13天9板'],['14:56:44','601811',9.93,'炸板',null,null,null,'',14.235,2.617],['14:56:17','601811',9.98,'涨停回封',297,.0069052,.05,'—'],
   ['14:28:32','603598',9.99,'首次涨停',78100,1.97,12.4,'首板'],['13:51:11','601858',9.98,'首次涨停',23800,.62,8.3,'首板'],['10:07:31','603533',10,'首次涨停',49400,1.48,16.2,'首板'],['09:43:14','603096',10.01,'首次涨停',57200,1.32,2.91,'4连板'],['09:30:30','600831',-10,'封跌停板',17110,.0662312,10.8,'—'],['09:30:03','002343',10.05,'首次涨停',92220,.7469901,20.09,'4连板'],['09:25:01','605577',-10,'封跌停板',32100,.61,9.2,'—']
  ].map(([time,code,change,status,volume,amount,ratio,streak,total,limitTurnover])=>({time,code,change,status,volume,amount,ratio,streak,total,limitTurnover}));
  return board.members.filter(c=>stocks[c].limit).flatMap(code=>{const s=stocks[code];return [{time:'14:31:20',code,change:s.change,status:'涨停回封',volume:16000,amount:s.sealedAmount,ratio:8.6,streak:s.boards===1?'首板':s.boards+'连板'},{time:'14:30:48',code,change:s.change-.21,status:'炸板',total:2.31,limitTurnover:.46},{time:s.limitTime,code,change:s.change,status:'首次涨停',volume:18000,amount:s.sealedAmount,ratio:9.1,streak:s.boards===1?'首板':s.boards+'连板'}];}).sort((a,b)=>b.time.localeCompare(a.time));
 }
 return {boards,stocks,industry,concept,moves,get:id=>boards.find(b=>b.id===id)};
})();
