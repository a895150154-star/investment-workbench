/* Screenshot fixtures supplied by the user. Quotes and analysis retain their original context. */
window.eventDriverData = {
 asOf:'2026-10-13 15:21',
 stocks:[
  {code:'300429',name:'强力新材',price:10.03,change:-0.99,flow:'−618.49万',ratio:'1.20',sector:'半导体材料',themeId:'semiconductors'},
  {code:'600664',name:'哈药股份',price:6.56,change:-1.35,sector:'医药',themeId:'innovative-drugs'},
  {code:'300450',name:'先导智能',price:null,change:-9.58,sector:'新能源',themeId:'ai-applications'},
  {code:'300766',name:'易点天下',price:null,change:2.88,sector:'AI 应用',themeId:'ai-applications'},
  {code:'002292',name:'奥飞娱乐',price:null,change:null,sector:'AI 应用',themeId:'ai-applications'},
  {code:'600969',name:'郴电国际',price:null,change:4.93,sector:'电力',themeId:'environmental-policy'},
  {code:'301259',name:'艾布鲁',price:null,change:3.37,sector:'环境治理',themeId:'environmental-policy'},
  {code:'000155',name:'川能动力',price:null,change:null,sector:'电力',themeId:'environmental-policy'},
  {code:'301500',name:'飞南资源',price:null,change:null,sector:'电力',themeId:'environmental-policy'},
  {code:'600104',name:'上汽集团',price:null,change:-1.10,sector:'新能源汽车',themeId:'ai-applications'},
  {code:'688428',name:'诺诚健华',price:null,change:-2.15,sector:'创新药',themeId:'innovative-drugs'},
  {code:'300953',name:'震裕科技',price:null,change:null,sector:'机器人',themeId:'ai-applications'},
  {code:'601001',name:'晋控煤业',price:null,change:2.46,sector:'煤炭',themeId:'coal'},
  {code:'515220',name:'煤炭ETF国泰',price:null,change:1.41,type:'etf',sector:'煤炭',themeId:'coal'}
 ],
 events:[
  {id:'driver-pspi',title:'强力新材超低温PSPI产品客户验证中',age:21,time:'21分钟前',tag:'半导体材料',themeId:'semiconductors',stocks:['300429'],keywords:['半导体','半导体材料','国产替代','PSPI'],summary:'强力新材在投资互动平台表示，公司研发的超低温PSPI产品在客户处仍处于验证中。该产品属于半导体材料领域，其验证进展是国产替代进程中的关键环节。',source:'深圳证券交易所 · 互动易',condition:'发布新公告或出现新资讯',prompt:'有新公告、新消息时提醒我',takeaway:'产品仍在客户验证阶段，短期关注验证进展，长期观察订单、收入与业务结构变化。'},
  {id:'driver-power',title:'市场监管总局就优化环保电价监管征求意见',age:60,time:'1小时前',tag:'电力',themeId:'environmental-policy',stocks:['600969','000155'],stockCount:79,keywords:['电力','环保','电价','环境治理'],summary:'市场监管总局就优化环保电价监管征求意见，涉及环保电价政策执行和监管安排。征求意见与政策正式实施是不同阶段。',source:'用户提供参考截图',condition:'发布新公告或出现新资讯',prompt:'有新公告、新消息时提醒我',takeaway:'关注正式政策、适用范围及电力企业实际执行情况。',backtest:{name:'川能动力',days:10,value:'+7.64%'},excerpt:true},
  {id:'driver-environment',title:'优化环保电价监管通知征求意见',age:181,time:'3小时前',tag:'环境治理',themeId:'environmental-policy',stocks:['301259','301500'],stockCount:52,keywords:['环境治理','环保','电价','电力'],summary:'优化环保电价监管通知征求意见。关注政策执行安排及环境治理产业链关联企业的后续披露。',source:'用户提供参考截图',condition:'发布新公告或出现新资讯',prompt:'有新公告、新消息时提醒我',takeaway:'政策仍处于征求意见阶段，关注正式发布与执行范围。',backtest:{name:'飞南资源',days:30,value:'+9.06%'},excerpt:true},
  {id:'driver-export',title:'新能源汽车出口退税率2027年4月起下调',age:360,time:'6小时前',tag:'新能源汽车',themeId:'ai-applications',stocks:['600104'],direction:'负向',keywords:['新能源','汽车','出口','智能制造'],summary:'参考截图显示新能源汽车出口退税率将自2027年4月起下调。关联出口业务、产品定价及车企盈利结构。',source:'用户提供参考截图',condition:'发布新公告或出现新资讯',prompt:'有新公告、新消息时提醒我',takeaway:'关注正式政策细则、海外销量及企业价格调整。',excerpt:true},
  {id:'driver-risk',title:'*ST航图被暂停军采资格一年',age:361,time:'6小时前',tag:'公司风险',themeId:'ai-applications',stocks:[],referenceStocks:[{name:'*ST航图',change:-5.92}],direction:'负向',high:true,keywords:['军工','采购','公司风险'],summary:'参考截图显示*ST航图被暂停军采资格一年。事件涉及采购资格、业务承接及后续整改进展。',source:'用户提供参考截图',condition:'发布新公告或出现新资讯',prompt:'有新公告、新消息时提醒我',takeaway:'截图股票名称未能核对代码，盯盘时需手动明确标的。',excerpt:true},
  {id:'driver-clinical',title:'诺诚健华美托克拉联合疗法获批III期临床',age:362,time:'6小时前',tag:'创新药',themeId:'innovative-drugs',stocks:['688428'],direction:'正向',high:true,keywords:['创新药','医药','临床','生物医药'],summary:'参考截图显示诺诚健华联合疗法获批III期临床。后续关注临床启动、患者入组、研究结果与监管进展。',source:'用户提供参考截图',condition:'发布新公告或出现新资讯',prompt:'有新公告、新消息时提醒我',takeaway:'获批临床是研发节点，关注后续研究进展与结果。',excerpt:true},
  {id:'driver-robot',title:'祥源新材压阻传感材料完成人形机器人领域验证',age:363,time:'6小时前',tag:'机器人',themeId:'ai-applications',stocks:['300980'],referenceStocks:[] ,referenceOnlyStocks:[{name:'祥源新材',change:null}],keywords:['机器人','新材料','智能制造','制造'],summary:'参考截图显示祥源新材压阻传感材料在人形机器人领域取得进展。关注客户验证、实际采用及产品交付。',source:'用户提供参考截图',condition:'发布新公告或出现新资讯',prompt:'有新公告、新消息时提醒我',takeaway:'核对客户验证、量产采用和订单披露。',excerpt:true},
  {id:'driver-hayao',title:'哈药股份硫酸钠原料药获批上市',age:1412,time:'10/12 15:49',tag:'医药',themeId:'innovative-drugs',stocks:['600664'],direction:'正向',keywords:['医药','原料药','创新药'],summary:'哈药股份所属企业哈药集团生物工程有限公司收到国家药品监督管理局颁发的关于硫酸钠的《化学原料药上市申请批准通知书》。硫酸钠原料药获批上市。',source:'哈药股份公告 · 参考截图',condition:'发布新公告或出现新资讯',prompt:'有新公告、新消息时提醒我',takeaway:'原料药获批提供业务进展线索，后续关注生产、销售及收入贡献。'}
 ],
 topics:[
  {id:'coal',name:'煤炭',change:'+0.60%',heat:92,summary:'动力煤淡季破千元，冬储启动煤价上行',stocks:['601001','515220']},
  {id:'innovative-drugs',name:'创新药',change:'−1.50%',heat:80,summary:'美国国立卫生研究院据称正在推进癌症疫苗研发相关工作',stocks:['688428','600664']}
 ],
 marketTable:[['收盘价','10.13元','较前一交易日收盘价下跌0.10%'],['当日振幅','5.13%','日内最高10.36元，最低9.84元'],['成交额','1.35亿元','当日成交量1339.8万股'],['动态市盈率','亏损','总市值56.64亿元']],
 businessTable:[['LCD光刻胶光引发剂','8317.69万元','49.61%'],['PCB光刻胶光引发剂','8654.13万元','35.28%'],['半导体光刻胶光引发剂','3073.47万元','42.80%'],['PCB光刻胶树脂','6130.15万元','−4.72%'],['其他用途光引发剂','1.49亿元','−1.41%']],
 pspiAnalysis:{
  impact:'本次超低温PSPI处于客户验证阶段的事件对强力新材整体维持中性影响，多空因素对衡。核心逻辑是公司PSPI产品线已实现小批量订单突破，但超低温品类尚未落地贡献收入，短期业绩无直接催化，长期半导体材料国产替代的成长逻辑仍在验证进程中。',
  market:'从当日走势来看，公司披露超低温PSPI仍在客户验证的信息后，股价全天窄幅波动、微幅收跌，未出现明显的单边上涨或下跌走势，反映市场对该验证进展的预期已相对充分，未形成超预期利好或利空冲击。',
  business:'从现有业务结构看，公司半导体光刻胶相关产品收入占比仅为5.74%，PSPI作为半导体材料领域的新产品线，尚未进入规模化收入贡献阶段；当前业绩的核心支撑仍来自LCD、PCB领域的光刻胶原料，部分传统品类甚至出现毛利率为负的情况，整体盈利基础仍待夯实。',
  factors:[
   ['现有PSPI业务落地进度','根据2026年中报披露信息，公司PSPI产品线已实现初步订单突破；高温PSPI产品收到百公斤级订单，应用于前制程应力缓冲层，截至报告期末已交付过半；高温、低温PSPI产品合计收到不足百公斤的先进封装RDL层应用订单，整体仍处于小批量供货阶段，尚未形成规模化收入。'],
   ['超低温PSPI的阶段定位','公司超低温PSPI产品自2025年10月起就已披露处于客户验证阶段，2026年5月、10月的两次互动平台回复均维持“验证中”的表述，本次披露属于进展的常规更新，未出现验证通过或失败的超预期变化。该产品属于半导体材料国产替代的关键品类，若后续验证通过，将进一步完善公司在PSPI领域的产品矩阵，拓展在先进封装等领域的应用场景，但当前阶段尚未产生实际订单与收入，对短期业绩无直接贡献。'],
   ['多空因素平衡逻辑','从利好维度看，公司持续推进超低温PSPI的客户验证，叠加已有高温、低温PSPI实现小批量供货，体现了公司在半导体光刻胶专用化学品领域的技术储备与客户拓展能力，长期国产替代的成长逻辑持续兑现；从利空维度看，超低温PSPI验证周期较长，尚未形成明确的落地时间表，且公司当前整体仍处于动态亏损状态，传统业务部分品类盈利承压，新品落地前业绩缺乏明确的向上弹性。']
  ],
  conclusion:'整体来看，本次超低温PSPI处于客户验证阶段的事件属于公司新品研发推进的常规信息披露，对公司短期业绩无直接影响，长期成长逻辑仍待验证落地，对应股价维持震荡均衡的判断。建议您后续重点跟踪超低温PSPI的客户验证结果、PSPI系列产品的订单规模变化，以及传统光刻胶原料业务的盈利修复情况，密切关注相关进展，及时做好投资决策的风险应对。'
 }
};

window.eventDriverData.events.forEach(e=>{const names=e.stocks.map(code=>window.eventDriverData.stocks.find(q=>q.code===code)?.name||(code==='300980'?'祥源新材':'')).filter(Boolean);const name=names.join('、')||e.referenceStocks?.map(q=>q.name).join('、')||'关注标的';e.condition=name+'发布新公告或出现新资讯';e.prompt=name+'有新公告、新消息时提醒我';});
