/* V2.28: identity and relationship fixtures from retained news or the supplied screenshot.
 * No quote or business exposure is inferred from an identity or a theme label.
 */
const hotspotIdentities=[
 {id:'event-haiguang',name:'海光信息',themeId:'semiconductors',sourceEvent:'2490095'},
 {id:'event-zctq',name:'中船特气',themeId:'semiconductors',sourceEvent:'2490104'},
 {code:'605069',name:'正和生态',themeId:'environmental-policy',reference:'hotspot-environment'},
 {code:'688057',name:'金达莱',themeId:'environmental-policy',reference:'hotspot-environment'},
 {code:'301519',name:'舜禹股份',themeId:'environmental-policy',reference:'hotspot-environment'}
].map(q=>({...q,type:'stock',price:null,change:null,identityOnly:true}));
const hotspotReferenceEvents=[{
 id:'reference-environment',themeId:'environmental-policy',title:'生态环境部审议通过多项污染防治行动计划',date:'09/23 22:32 · 演示场景',origin:'reference',reference:'hotspot-environment',
 summary:'污染防治行动计划聚焦县城黑臭水体治理、工业园区水污染整治和噪声污染防治，推动地方细化治理任务和项目安排。'
}];
const hotspotStoryData={
 'reference-environment':{tag:'环境治理 · 政策线索',eventType:'环保政策发布',why:'污染治理从政策部署走向项目落地，水环境治理和园区污水处理迎来需求窗口。关注相关企业的项目参与、合同落地和回款进度，判断政策催化能否转成经营增量。',watch:'关注地方实施方案、项目招标和公司合同披露。若项目推进缓慢、资金落实不足或回款周期拉长，政策带来的增长预期可能落空。',stocks:[
  {key:'605069',label:'业务关联 · 模拟场景',reason:'围绕水环境与生态治理展开观察。治理任务增加，有望带来项目参与机会；后续重点跟进中标、合同和项目回款。'},
  {key:'688057',label:'业务关联 · 模拟场景',reason:'围绕污水处理技术和治理项目展开观察。园区治理需求提升，有望拓展设备与系统应用；重点看新项目签约和交付。'},
  {key:'301519',label:'业务关联 · 模拟场景',reason:'围绕城镇水务与污水处理展开观察。治理设施更新带来业务线索；重点看地方项目推进、订单落地和运营效果。'}
 ]},
 '2490095':{tag:'端侧算力 · 产品发布',eventType:'端侧芯片产品发布',why:'端侧算力新品拓展了海光信息的应用场景，产品升级为后续客户导入创造条件。重点跟进适配、量产和持续采购，判断新场景能否带来经营增量。',stocks:[{key:'event-haiguang',label:'新闻直接提及',reason:'海光信息是该新品的发布主体。重点跟进客户适配、量产交付和持续采购；发布本身不等于订单或利润已经兑现。'}]},
 '2490104':{tag:'半导体材料 · 交付进展',eventType:'出口与交付进展',why:'公司将出口回落解释为运输延后。值得继续验证的是中船特气的延后交付能否补回，以及价格变化是否影响经营结果。',stocks:[{key:'event-zctq',label:'新闻直接提及',reason:'中船特气是公开回应的主体。跟踪其后续出货、补发与议价披露，以实际经营材料验证“物流延后”的解释。'}]},
 '2490113':{tag:'手机 AI · 方案发布',eventType:'手机 AI 方案发布',why:'手机 AI 从对话走向任务执行，有望带动终端适配、应用服务与端侧算力需求。后续看接入厂商、正式上线功能和持续使用表现，判断应用落地速度。',stocks:[]},
 xys:{tag:'公司事项 · 股权激励',eventType:'股权激励事项',why:'这条公告给出新易盛的激励与股本观察入口。关注具体归属和上市安排，对经营增长的判断仍需订单与交付材料。',stocks:[{key:'300502',label:'公司公告主体',reason:'新易盛是公告发布主体，事件直接对应其激励及股份安排。它不直接证明光模块订单增加。'}]},
 zjxc:{tag:'公司事项 · 股本披露',eventType:'股本变动披露',why:'中际旭创的股本事项值得单独核对变动性质和每股口径。它是公司观察事项，不能当成行业景气上升的依据。',stocks:[{key:'300308',label:'公司公告主体',reason:'中际旭创是报表披露主体。先辨明股份变动类别，再判断是否需要更新每股口径或流通安排。'}]},
 tftx:{tag:'公司事项 · 资金安排',eventType:'现金管理公告',why:'天孚通信的现金管理安排涉及资金何时可用、经营何时要用。后续看期限与项目支出匹配，不由授权安排直接推导资金充裕。',stocks:[{key:'300394',label:'公司公告主体',reason:'天孚通信是公告发布主体，追踪其现金管理实施与后续经营资金披露；授权额度不等于实际投入。'}]}
};
