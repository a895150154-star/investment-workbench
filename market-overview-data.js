/* User-supplied reference images only. No live feed or current trading-date claim. */
const marketOverviewReference = {
  primary:{source:4,clock:'09:36',date:null,turnover:'2153',turnoverDelta:'−314',up:2226,down:3006,flat:333,limitUp:19,limitDown:2,large:'+0.15%',small:'−0.14%',yesterdayLimit:'+0.34%',oneWord:4,tWord:1,natural:14,highest:5},
  distribution:[
    {label:'涨停',value:19,tone:'up'},{label:'>8%',value:7,tone:'up'},
    {label:'5–8%',value:29,tone:'up'},{label:'2–5%',value:167,tone:'up'},
    {label:'0–2%',value:2004,tone:'up'},{label:'平盘',value:333,tone:'flat'},
    {label:'0–2%',value:2571,tone:'down'},{label:'2–5%',value:388,tone:'down'},
    {label:'5–8%',value:41,tone:'down'},{label:'>8%',value:4,tone:'down'},
    {label:'跌停',value:2,tone:'down'}
  ],
  ladder:{source:3,rows:[
    {boards:5,names:['新华文轩']},{boards:4,names:['奥佳华','新华传媒','泰慕士']},
    {boards:3,names:['天威视讯']},{boards:2,names:['金辰股份','东方中科','雪龙集团','华茂股份']}
  ]},
  ranking:{source:3,rows:[
    {code:'920201',name:'N百瑞吉',price:'84.99',change:'406.80',flow:null},
    {code:'688682',name:'霍莱沃',price:'36.25',change:'14.64',flow:'912.03'},
    {code:'301601',name:'惠通科技',price:'19.77',change:'11.46',flow:'388.66'},
    {code:'002321',name:'华英农业',price:'2.27',change:'10.19',flow:null},
    {code:'000790',name:'华神科技',price:'4.68',change:'10.12',flow:'1393.71'},
    {code:'000850',name:'华茂股份',price:'5.12',change:'10.11',flow:'2240.05'}
  ]},
  sources:[
    {id:1,title:'收起卡片参考',note:'仅作布局参考。数值属于另一截图时点，未混入当前卡片。'},
    {id:2,title:'涨跌分布与涨跌停参考',note:'仅作布局参考。与第 4 张不同快照，未混用统计数。'},
    {id:3,title:'连板梯队与个股排行参考',note:'用于对应两个模块。交易日期、采集时间未提供；排行仅保留画面中可读的 6 条，不代表全市场完整榜单。'},
    {id:4,title:'市场摘要与涨跌统计参考',note:'手机时间显示 09:36，交易日期未提供。摘要、分布与涨跌停统计统一使用此图。'}
  ]
};

// Fictional UI fixture, explicitly authorized for prototype illustration.
// Kept separate from screenshot facts; never used by summary statistics or monitoring.
const marketOverviewDemoSeries = {
  kind:'synthetic',
  times:['09:30','09:40','09:50','10:00','10:10','10:20','10:30','10:40','10:50','11:00','11:10','11:20','11:30 / 13:00','13:10','13:20','13:30','13:40','13:50','14:00','14:10','14:20','14:30','14:40','14:50','15:00'],
  series:[
    {id:'up',name:'涨停数',values:[4,6,5,8,9,7,10,12,11,13,12,14,14,15,13,16,15,17,16,18,20,18,21,20,19]},
    {id:'down',name:'跌停数',values:[2,2,3,2,2,3,4,3,3,2,2,3,3,3,2,2,3,2,2,1,2,3,2,2,2]},
    {id:'broken',name:'炸板数',values:[1,2,2,3,2,4,3,3,4,3,4,4,4,5,4,4,5,5,4,6,5,6,5,4,5]}
  ]
};
