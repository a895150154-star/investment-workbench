/* V3.0: fixed fictional data only. No service calls; never seeded into user portfolios. */
window.overviewV3Data = (() => {
  const labels={unset:'未设置投资习惯',short:'短线交易',swing:'波段配置',long:'中长期持有'};
  const names={brief:'个人简报','holdings-news':'我的标的动态',events:'事件捕手','sector-flows':'板块资金',sectors:'关注行业',indexes:'大盘指数',market:'市场概览',stocks:'股票工作台'};
  const orders={unset:['brief','indexes','events','holdings-news','sectors','sector-flows','market','stocks'],short:['brief','holdings-news','events','sector-flows','market','stocks','sectors','indexes'],swing:['brief','sectors','sector-flows','holdings-news','events','stocks','indexes','market'],long:['brief','holdings-news','sectors','indexes','events','stocks','sector-flows','market']};
  const rules={unset:'持仓在前，同组按发布时间从新到旧。',short:'先看你的标的异动、事件和板块资金；同组按涨跌幅绝对值，再按资金绝对值排序。',swing:'先看关注行业、板块资金和主题；同组按板块近20日强弱变化排序。',long:'先看经营变化、行业和指数；同组优先业绩、订单、研报变化，再按持仓比重。'};
  const eventTypes=['异动','资金','热点','板块轮动','公告','政策','业绩','订单','研报观点'];
  const templates=['订单落地','收入确认','产品或产能进展'];
  const securities=[
    {code:'688041',name:'海光信息',group:'holdings',price:168.20,change:2.4,flow:1.2,anomaly:'端侧算力产品推进客户试用',sector:'半导体',sectorToday:1.6,sector20:14.8,change20:12.4,indices:['科创50'],themes:['端侧算力'],business:'试用订单已取得，经营兑现仍需交付和回款。',earnings:'收入尚未确认',report:'关注客户导入与现金流验证',weight:24,longTerm:true},
    {code:'300308',name:'中际旭创',group:'holdings',price:192.60,change:5.8,flow:3.6,anomaly:'光模块方向交易活跃',sector:'光通信',sectorToday:2.1,sector20:9.2,change20:10.6,indices:['创业板指'],themes:['算力互联'],business:'股本事项与交付进展分开评估。',earnings:'等待季度经营披露',report:'继续核对产品结构与订单能见度',weight:16},
    {code:'300502',name:'新易盛',group:'watchlist',price:139.80,change:3.2,flow:1.8,anomaly:'股份上市流通事项受到关注',sector:'光通信',sectorToday:2.1,sector20:9.2,change20:8.7,indices:['创业板指'],themes:['算力互联'],business:'新增流通股份影响供给，不能直接推导收入增长。',earnings:'未披露新增业绩',report:'关注股本与经营指标的不同口径'},
    {code:'300394',name:'天孚通信',group:'watchlist',price:96.40,change:-1.1,flow:-0.7,anomaly:'闲置资金现金管理安排披露',sector:'光通信',sectorToday:2.1,sector20:9.2,change20:6.3,indices:['创业板指'],themes:['算力互联'],business:'核对资金期限与经营支出的匹配。',earnings:'现金管理不等同经营收入',report:'关注现金使用效率及流动性'},
    {code:'688146',name:'中船特气',group:'watchlist',price:38.60,change:1.7,flow:0.6,anomaly:'延后交付的补发节奏受到关注',sector:'半导体材料',sectorToday:1.2,sector20:11.3,change20:9.4,indices:['科创50'],themes:['半导体'],business:'交付补发与季度议价共同影响经营兑现。',earnings:'补发收入仍待核验',report:'订单未取消不等于当期收入不受影响'}
  ];
  const stockNews=[
    {id:'hg-order',code:'688041',time:'16:00',title:'取得800万元试用订单，收入尚未确认',type:'订单',cycles:['long'],direction:'中性',analysis:'订单提供业务落地线索；收入还需要交付、验收与财务确认。',next:'核对交付、收入确认与回款。',openings:{conservative:'先留意交付及回款风险，订单金额还不是收入。',balanced:'试用订单已取得，收入确认仍待后续披露。',aggressive:'试用订单带来落地机会，成立条件是交付与验收完成。'}},
    {id:'zj-move',code:'300308',time:'15:40',title:'光模块交易活跃，股本披露更新',type:'异动',cycles:['short','swing'],direction:'利好',analysis:'价格与资金反映交易变化，股本报表本身不能证明新订单增长。',next:'对照成交延续性与下一次经营披露。',openings:{conservative:'先留意上涨后的回撤，交易活跃尚未验证业绩。',balanced:'交易活跃与股本披露同时出现，需分别理解。',aggressive:'光模块活跃带来观察机会，需成交延续与经营证据配合。'}},
    {id:'xys-announcement',code:'300502',time:'15:20',title:'股份上市流通公告',type:'公告',cycles:['swing'],direction:'中性',analysis:'新增可流通股份可能影响交易供给；不直接等同经营利好或利空。',next:'核对上市日期、规模与相关股东安排。',openings:{conservative:'先留意新增流通股份带来的短期波动风险。',balanced:'股份上市流通安排已披露，关注具体规模与时间。',aggressive:'流通安排提供新的交易观察点，需结合规模与成交条件。'}},
    {id:'tf-cash',code:'300394',time:'14:20',title:'闲置资金现金管理安排',type:'公告',cycles:['swing','long'],direction:'中性',analysis:'现金管理应与经营资金需求匹配，不能用投资收益替代主营业务增长。',next:'核对期限、风险等级及后续经营支出。',openings:{conservative:'先核对现金管理的流动性与本金风险。',balanced:'现金管理安排更新，需看期限与经营支出是否匹配。',aggressive:'闲置资金运用有改善效率的空间，前提是不影响经营投入。'}},
    {id:'zc-delivery',code:'688146',time:'15:10',title:'出口交付补发推进，订单保持',type:'公告',cycles:['swing'],direction:'利好',analysis:'订单仍在但交付时间后移，需同时看补发进度与季度议价。',next:'持续核对交付、价格和回款。',openings:{conservative:'先留意交付延后和价格波动对回款的影响。',balanced:'延后交付正在补发，经营结果仍需后续验证。',aggressive:'补发可能带来修复机会，条件是交付和价格兑现。'}}
  ].map(n=>({...n,objects:[n.code,securities.find(s=>s.code===n.code).sector,...securities.find(s=>s.code===n.code).themes],demo:true}));
  const timeline=[
    {id:'order',time:'16:00',title:'取得800万元试用订单，收入尚未确认',type:'订单',cycles:['long'],direction:'中性',statuses:['已确认','进展中','已确认'],headline:'订单落地：已确认；收入确认：进展中',explanation:'金额已明确，但尚无确认收入或回款的披露。',source:'试用订单进展',quote:'取得800万元试用订单，尚未确认收入或回款。'},
    {id:'delivery',time:'14:00',title:'3家合作方完成适配，1家开始试交付',type:'公告',cycles:['swing'],direction:'中性',statuses:['进展中','未触发','已确认'],headline:'订单落地：进展中',explanation:'客户适配推进到试交付，尚未披露金额或客户名称。',source:'客户适配与试交付更新',quote:'3家整机合作方完成适配，1家进入小批量试交付，尚未披露订单金额及客户名。'},
    {id:'prototype',time:'10:00',title:'2款工控样机亮相',type:'热点',cycles:['short'],direction:'中性',statuses:['未触发','未触发','已确认'],headline:'产品或产能进展：已确认',explanation:'样机已发布，产品展示尚未走到量产供货。',source:'工控样机发布消息',quote:'展示2款采用CPU 1000的工控样机，尚无量产供货证据。'}
  ].map(n=>({...n,objects:['海光信息（688041）','半导体板块','端侧算力主题'],demo:true}));
  const macro=[
    {id:'semi',title:'端侧算力推进客户适配',text:'关注半导体产品如何从发布走向实际采用。',sectors:['半导体','半导体材料'],indices:['科创50'],themes:['端侧算力'],type:'热点',cycles:['short','swing'],direction:'中性'},
    {id:'optical',title:'光通信交易与公司披露并行',text:'行业活跃与股本、激励和现金管理分别核对。',sectors:['光通信'],indices:['创业板指'],themes:['算力互联'],type:'板块轮动',cycles:['swing'],direction:'中性'},
    {id:'growth',title:'成长指数内部走势分化',text:'核对指数表现与个股经营能否相互印证。',sectors:[],indices:['科创50','创业板指'],themes:[],type:'异动',cycles:['short'],direction:'中性'},
    {id:'ai',title:'手机AI与端侧算力联读',text:'应用入口和硬件供给要靠具体终端适配连接。',sectors:[],indices:[],themes:['端侧算力'],type:'热点',cycles:['short','swing'],direction:'中性'},
    {id:'broad',title:'市场指数涨跌互现',text:'市场保持分化，继续观察成交和上涨范围。',sectors:['银行'],indices:['沪深300'],themes:['红利'],type:'资金',cycles:['short'],direction:'中性'}
  ].map(n=>({...n,objects:[...n.sectors,...n.indices,...n.themes],demo:true}));
  // Preserve all 20 original evening-report values and labels.
  const boards=Object.fromEntries(Object.entries(eveningBoards).map(([kind,rows])=>[kind,rows.map(([,name,flow,change])=>[name,Number(flow),Number(change)])]));
  const themes=[{id:'optical-interconnect',name:'光模块与算力互联',look:'AI产业动态让算力互联受到关注，经营增长仍需产品、客户和订单验证。',stocks:['300308','300502','300394'],etf:{name:'通信 ETF 国泰',code:'515880',price:1.284}},{id:'ai-applications',name:'手机 AI 与端侧算力',look:'手机AI方案代表应用入口，端侧芯片代表硬件供给；继续核对机型适配和实际采用。',stocks:['688041'],etf:{name:'人工智能 ETF 华富',code:'515980',price:1.146}}];
  const industries=[['AI 应用','ai-applications','手机 AI 方案代表应用入口，端侧芯片代表硬件供给。本期线索可以放在同一条产业路径中观察，但尚无两者合作的证据。接下来观察适配厂商、终端产品和客户采用。'],['半导体','semiconductors','手机 AI 方案代表应用入口，端侧芯片代表硬件供给。关注样机、客户适配、交付及经营兑现，分清产品发布与订单收入。'],['光通信','optical-interconnect','中际旭创的股本披露、新易盛的股份上市流通及天孚通信的现金管理分别涉及股本、激励和资金安排，不能合并解释为行业订单增长；经营判断仍需业务与订单材料。']];
  return {labels,names,orders,rules,eventTypes,templates,securities,stockNews,timeline,macro,boards,themes,industries};
})();
