"use strict";(self.webpackChunk=self.webpackChunk||[]).push([[68181,18401],{19490:(t,e,n)=>{n.d(e,{Ay:()=>s});var a=n(58168),r=(n(96540),n(15680));const i={toc:[]},o="wrapper";function s(t){let{components:e,...n}=t;return(0,r.yg)(o,(0,a.A)({},i,n,{components:e,mdxType:"MDXLayout"}),(0,r.yg)("details",null,(0,r.yg)("summary",null,"How to use the code sample"),(0,r.yg)("strong",null,"The code presented below requires:"),(0,r.yg)("ul",null,(0,r.yg)("li",{parentName:"ul"},"That ",(0,r.yg)("inlineCode",{parentName:"li"},"createChart")," has already been imported. See ",(0,r.yg)("a",{parentName:"li",href:"/docs#creating-a-chart"},"Getting Started")," for more information,"),(0,r.yg)("li",{parentName:"ul"},"and that there is an html div element on the page with an ",(0,r.yg)("inlineCode",{parentName:"li"},"id")," of ",(0,r.yg)("inlineCode",{parentName:"li"},"container"),".")),(0,r.yg)("p",null,"Here is an example skeleton setup: ",(0,r.yg)("a",{parentName:"p",href:"https://codesandbox.io/s/lightweight-charts-skeleton-n67pm6"},"Code Sandbox"),".\nYou can paste the provided code below the ",(0,r.yg)("inlineCode",{parentName:"p"},"// REPLACE EVERYTHING BELOW HERE")," comment."),(0,r.yg)("admonition",{type:"tip"},(0,r.yg)("p",{parentName:"admonition"},"Some code may be hidden to improve readability. Toggle the checkbox above the code block to reveal all the code."))))}s.isMDXComponent=!0},95718:(t,e,n)=>{n.r(e),n.d(e,{assets:()=>h,contentTitle:()=>c,default:()=>O,frontMatter:()=>l,metadata:()=>d,toc:()=>m});var a=n(58168),r=(n(96540),n(15680)),i=n(19490),o=n(5546);const s="// remove-start\n// Lightweight Charts\u2122 Example: Infinite history\n// https://tradingview.github.io/lightweight-charts/tutorials/demos/infinite-history\n\n// remove-end\n\n// hide-start\nlet randomFactor = 25 + Math.random() * 25;\nconst samplePoint = i =>\n\ti *\n\t\t(0.5 +\n\t\t\tMath.sin(i / 10) * 0.2 +\n\t\t\tMath.sin(i / 20) * 0.4 +\n\t\t\tMath.sin(i / randomFactor) * 0.8 +\n\t\t\tMath.sin(i / 500) * 0.5) +\n\t200;\n\nfunction generateLineData(numberOfPoints = 500, endDate) {\n\trandomFactor = 25 + Math.random() * 25;\n\tconst res = [];\n\tconst date = endDate || new Date(Date.UTC(2018, 0, 1, 12, 0, 0, 0));\n\tdate.setUTCDate(date.getUTCDate() - numberOfPoints - 1);\n\tfor (let i = 0; i < numberOfPoints; ++i) {\n\t\tconst time = date.getTime() / 1000;\n\t\tconst value = samplePoint(i);\n\t\tres.push({\n\t\t\ttime,\n\t\t\tvalue,\n\t\t});\n\n\t\tdate.setUTCDate(date.getUTCDate() + 1);\n\t}\n\n\treturn res;\n}\n\nfunction randomNumber(min, max) {\n\treturn Math.random() * (max - min) + min;\n}\n\nfunction randomBar(lastClose) {\n\tconst open = +randomNumber(lastClose * 0.95, lastClose * 1.05).toFixed(2);\n\tconst close = +randomNumber(open * 0.95, open * 1.05).toFixed(2);\n\tconst high = +randomNumber(\n\t\tMath.max(open, close),\n\t\tMath.max(open, close) * 1.1\n\t).toFixed(2);\n\tconst low = +randomNumber(\n\t\tMath.min(open, close) * 0.9,\n\t\tMath.min(open, close)\n\t).toFixed(2);\n\treturn {\n\t\topen,\n\t\thigh,\n\t\tlow,\n\t\tclose,\n\t};\n}\n\nfunction generateCandleData(numberOfPoints = 250, endDate) {\n\tconst lineData = generateLineData(numberOfPoints, endDate);\n\tlet lastClose = lineData[0].value;\n\treturn lineData.map(d => {\n\t\tconst candle = randomBar(lastClose);\n\t\tlastClose = candle.close;\n\t\treturn {\n\t\t\ttime: d.time,\n\t\t\tlow: candle.low,\n\t\t\thigh: candle.high,\n\t\t\topen: candle.open,\n\t\t\tclose: candle.close,\n\t\t};\n\t});\n}\n\nclass Datafeed {\n\tconstructor() {\n\t\tthis._earliestDate = new Date(Date.UTC(2018, 0, 1, 12, 0, 0, 0));\n\t\tthis._data = [];\n\t}\n\n\tgetBars(numberOfExtraBars) {\n\t\tconst historicalData = generateCandleData(\n\t\t\tnumberOfExtraBars,\n\t\t\tthis._earliestDate\n\t\t);\n\t\tthis._data = [...historicalData, ...this._data];\n\t\tthis._earliestDate = new Date(historicalData[0].time * 1000);\n\t\treturn this._data;\n\t}\n}\n\nconst chartOptions = {\n\tlayout: {\n\t\ttextColor: CHART_TEXT_COLOR,\n\t\tbackground: { type: 'solid', color: CHART_BACKGROUND_COLOR },\n\t},\n};\n// hide-end\nconst container = document.getElementById('container');\n// remove-line\n/** @type {import('lightweight-charts').IChartApi} */\nconst chart = createChart(container, chartOptions);\n\nconst series = chart.addCandlestickSeries({\n\tupColor: BAR_UP_COLOR,\n\tdownColor: BAR_DOWN_COLOR,\n\tborderVisible: false,\n\twickUpColor: BAR_UP_COLOR,\n\twickDownColor: BAR_DOWN_COLOR,\n});\n\nconst datafeed = new Datafeed();\n\nseries.setData(datafeed.getBars(200));\n\nchart.timeScale().subscribeVisibleLogicalRangeChange(logicalRange => {\n\tif (logicalRange.from < 10) {\n\t\t// load more data\n\t\tconst numberBarsToLoad = 50 - logicalRange.from;\n\t\tconst data = datafeed.getBars(numberBarsToLoad);\n\t\tsetTimeout(() => {\n\t\t\tseries.setData(data);\n\t\t}, 250); // add a loading delay\n\t}\n});\n",l={title:"Infinite history",sidebar_label:"Infinite history",description:"An example of how to load historical data on demand",pagination_prev:null,pagination_next:null,keywords:["history"]},c=void 0,d={unversionedId:"demos/infinite-history",id:"demos/infinite-history",title:"Infinite history",description:"An example of how to load historical data on demand",source:"@site/tutorials/demos/infinite-history.mdx",sourceDirName:"demos",slug:"/demos/infinite-history",permalink:"/lightweight-charts/tutorials/demos/infinite-history",draft:!1,tags:[],version:"current",frontMatter:{title:"Infinite history",sidebar_label:"Infinite history",description:"An example of how to load historical data on demand",pagination_prev:null,pagination_next:null,keywords:["history"]},sidebar:"tutorialsSidebar"},h={},m=[],u={toc:m},g="wrapper";function O(t){let{components:e,...n}=t;return(0,r.yg)(g,(0,a.A)({},u,n,{components:e,mdxType:"MDXLayout"}),(0,r.yg)("p",null,"This sample showcases the capability of Lightweight Charts\u2122 to manage and display\nan ever-expanding dataset, resembling a live feed that loads older data when the\nuser scrolls back in time. The example depicts a chart that initially loads a\nlimited amount of data, but later fetches additional data as required."),(0,r.yg)("p",null,"Key to this functionality is the\n",(0,r.yg)("a",{parentName:"p",href:"docs/api/interfaces/ITimeScaleApi#subscribevisiblelogicalrangechange"},(0,r.yg)("inlineCode",{parentName:"a"},"subscribeVisibleLogicalRangeChange")),"\nmethod. This function is triggered when the visible data range changes, in this\ncase, when the user scrolls beyond the initially loaded data."),(0,r.yg)("p",null,"By checking if the amount of unseen data on the left of the screen falls below a\ncertain threshold (in this example, 10 units), it's determined whether\nadditional data needs to be loaded. New data is appended through a simulated\ndelay using ",(0,r.yg)("inlineCode",{parentName:"p"},"setTimeout"),"."),(0,r.yg)("p",null,"This kind of infinite history functionality is typical of financial charts which\nfrequently handle large and continuously expanding datasets."),(0,r.yg)(o.Ay,{replaceThemeConstants:!0,chart:!0,className:"language-js",hideableCode:!0,chartOnTop:!0,codeUsage:(0,r.yg)(i.Ay,{mdxType:"UsageGuidePartial"}),mdxType:"CodeBlock"},s))}O.isMDXComponent=!0},5546:(t,e,n)=>{n.d(e,{Ay:()=>p});var a=n(96540),r=n(77964),i=n(78478),o=n(95293),s=n(55597),l=n(6715);function c(t,e,n){t.addEventListener("resize",(()=>{const t=e.getBoundingClientRect();n(t.width,t.height)}),!0)}const d={3.8:async t=>{const e=await n.e(73409).then(n.bind(n,73409));return{module:e,createChart:(n,a)=>{const r=e.createChart(n,a);return c(t,n,r.resize.bind(r)),r},createChartEx:void 0}},"4.0":async t=>{const e=await n.e(37476).then(n.bind(n,37476));return{module:e,createChart:(n,a)=>{const r=e.createChart(n,a);return c(t,n,r.resize.bind(r)),r},createChartEx:void 0}},4.1:async t=>{const e=await n.e(59631).then(n.bind(n,59631));return{module:e,createChart:(n,a)=>{const r=e.createChart(n,a);return c(t,n,r.resize.bind(r)),r},createChartEx:(n,a,r)=>{const i=e.createChartEx(n,a,r);return c(t,n,i.resize.bind(i)),i}}},4.2:async t=>{const e=await n.e(90142).then(n.bind(n,90142));return{module:e,createChart:(n,a)=>{const r=e.createChart(n,a);return c(t,n,r.resize.bind(r)),r},createChartEx:(n,a,r)=>{const i=e.createChartEx(n,a,r);return c(t,n,i.resize.bind(i)),i}}},current:async()=>{const t=await n.e(47839).then(n.bind(n,47839));return{module:t,createChart:(e,n)=>{const a=t.createChart(e,n);return c(window,e,a.resize.bind(a)),a},createChartEx:(e,n,a)=>{const r=t.createChartEx(e,n,a);return c(window,e,r.resize.bind(r)),r}}}},h="iframe_R_Fr";function m(t){const{script:e,iframeStyle:n}=t,{preferredVersion:r}=(0,s.g1)(),i=l&&l.length>0?l[0]:"",o=r?.name??i??"current",c=function(t){return`\n\t\t<style>\n\t\t\thtml,\n\t\t\tbody,\n\t\t\t#container {\n\t\t\t\twidth: 100%;\n\t\t\t\theight: 100%;\n\t\t\t\toverflow: hidden;\n\t\t\t\tmargin: 0;\n\t\t\t}\n\t\t</style>\n\t\t<div id="container"></div>\n\t\t<script>\n\t\t\twindow.run = () => {\n\t\t\t\t${t}\n\t\t\t};\n\t\t<\/script>\n\t`}(e),m=a.useRef(null);return a.useEffect((()=>{const t=m.current,e=t?.contentWindow,n=t?.contentDocument;if(null===t||!e||!n)return;const a=async()=>{try{const{module:t,createChart:n,createChartEx:a}=await d[o](e);Object.assign(e,t),e.createChart=n,e.createChartEx=a,e.run?.()}catch(t){console.error(t)}};if(void 0!==e.run)a();else{const e=()=>{a(),t.removeEventListener("load",e)};t.addEventListener("load",e)}}),[c]),a.createElement("iframe",{key:e,ref:m,srcDoc:c,className:h,style:n})}var u=n(82840);function g(){const[t,e]=(0,a.useState)("");return(0,a.useEffect)((()=>e(`${Math.random().toString(36).slice(2,11)}`)),[]),t}const O=Object.keys(u.k.DARK);const p=t=>{const{chart:e,replaceThemeConstants:n,hideableCode:s,chartOnly:l,chartOnTop:c=!1,iframeStyle:d,replaceTabs:p=!0,codeUsage:C,..._}=t;let{children:L}=t;const{colorMode:b}=(0,o.G)(),f="dark"===b,y="string"==typeof E?E:g();var E;if(n&&"string"==typeof L&&(L=function(t,e){const n=e?u.k.DARK:u.k.LIGHT;let a=t;for(const r of O)a=a.replace(new RegExp(r,"g"),`'${n[r]}'`);return a}(L,f)),p&&"string"==typeof L&&(L=L.replace(/\t/g,"    ")),L=L.replace(new RegExp(/\/\/ delete-start[\w\W]*?\/\/ delete-end/,"gm"),""),e||s){const t=!l&&a.createElement(r.A,_,L),n=e&&a.createElement(i.A,{fallback:a.createElement("div",{className:h},"\xa0")},(()=>a.createElement(m,{script:L,iframeStyle:d}))),o=s&&a.createElement(a.Fragment,null,a.createElement("input",{id:y,type:"checkbox",className:"toggle-hidden-lines"}),a.createElement("label",{className:"toggle-label",htmlFor:y},"Show all code"));return c?a.createElement(a.Fragment,null,n,C,o,t):a.createElement(a.Fragment,null,C,o,t,n)}return a.createElement(r.A,_,L)}},82840:(t,e,n)=>{n.d(e,{k:()=>a});const a={DARK:{CHART_BACKGROUND_COLOR:"black",CHART_BACKGROUND_RGB_COLOR:"0, 0, 0",LINE_LINE_COLOR:"#2962FF",LINE_LINE2_COLOR:"rgb(225, 87, 90)",LINE_LINE3_COLOR:"rgb(242, 142, 44)",LINE_LINE4_COLOR:"rgb(164, 89, 209)",LINE_LINE5_COLOR:"rgb(27, 156, 133)",AREA_TOP_COLOR:"#2962FF",AREA_BOTTOM_COLOR:"rgba(41, 98, 255, 0.28)",BAR_UP_COLOR:"#26a69a",BAR_DOWN_COLOR:"#ef5350",BASELINE_TOP_LINE_COLOR:"rgba( 38, 166, 154, 1)",BASELINE_TOP_FILL_COLOR1:"rgba( 38, 166, 154, 0.28)",BASELINE_TOP_FILL_COLOR2:"rgba( 38, 166, 154, 0.05)",BASELINE_BOTTOM_LINE_COLOR:"rgba( 239, 83, 80, 1)",BASELINE_BOTTOM_FILL_COLOR1:"rgba( 239, 83, 80, 0.05)",BASELINE_BOTTOM_FILL_COLOR2:"rgba( 239, 83, 80, 0.28)",HISTOGRAM_COLOR:"#26a69a",CHART_TEXT_COLOR:"white"},LIGHT:{CHART_BACKGROUND_COLOR:"white",CHART_BACKGROUND_RGB_COLOR:"255, 255, 255",LINE_LINE_COLOR:"#2962FF",LINE_LINE2_COLOR:"rgb(225, 87, 90)",LINE_LINE3_COLOR:"rgb(242, 142, 44)",LINE_LINE4_COLOR:"rgb(164, 89, 209)",LINE_LINE5_COLOR:"rgb(27, 156, 133)",AREA_TOP_COLOR:"#2962FF",AREA_BOTTOM_COLOR:"rgba(41, 98, 255, 0.28)",BAR_UP_COLOR:"#26a69a",BAR_DOWN_COLOR:"#ef5350",BASELINE_TOP_LINE_COLOR:"rgba( 38, 166, 154, 1)",BASELINE_TOP_FILL_COLOR1:"rgba( 38, 166, 154, 0.28)",BASELINE_TOP_FILL_COLOR2:"rgba( 38, 166, 154, 0.05)",BASELINE_BOTTOM_LINE_COLOR:"rgba( 239, 83, 80, 1)",BASELINE_BOTTOM_FILL_COLOR1:"rgba( 239, 83, 80, 0.05)",BASELINE_BOTTOM_FILL_COLOR2:"rgba( 239, 83, 80, 0.28)",HISTOGRAM_COLOR:"#26a69a",CHART_TEXT_COLOR:"black"}}},6715:t=>{t.exports=JSON.parse('["4.2","4.1","4.0","3.8"]')}}]);