import{c as D,P as de,B as j,C as pe,a as me,b as O,d as fe,e as he,t as W,u as ge,_ as p,T as ve}from"./common.9d0335be.js";import{g as be,E as xe,D as we,F as _e,b as v,d as U,B as b,_ as x,j as s,V as l,G as ye,H as Ee,f as Te,J as I,m as Ce,S as je,K as Be,M as Fe,e as Pe,N as Se,X as ke,O as Ae,P as Oe,Q as Ne,y as d,z as u,U as De,W as K,Y as Q,r as N,Z as He,$ as Ie,a0 as Le,a1 as Re,a2 as ze,a3 as Ve,a4 as Z}from"./vendors.c7f8fc40.js";(function(){const e=document.createElement("link").relList;if(e&&e.supports&&e.supports("modulepreload"))return;for(const i of document.querySelectorAll('link[rel="modulepreload"]'))n(i);new MutationObserver(i=>{for(const a of i)if(a.type==="childList")for(const t of a.addedNodes)t.tagName==="LINK"&&t.rel==="modulepreload"&&n(t)}).observe(document,{childList:!0,subtree:!0});function r(i){const a={};return i.integrity&&(a.integrity=i.integrity),i.referrerPolicy&&(a.referrerPolicy=i.referrerPolicy),i.crossOrigin==="use-credentials"?a.credentials="include":i.crossOrigin==="anonymous"?a.credentials="omit":a.credentials="same-origin",a}function n(i){if(i.ep)return;i.ep=!0;const a=r(i);fetch(i.href,a)}})();var Me=`
/* H5 端隐藏 TabBar 空图标（只隐藏没有 src 的图标） */
.weui-tabbar__icon:not([src]),
.weui-tabbar__icon[src=''] {
  display: none !important;
}

.weui-tabbar__item:has(.weui-tabbar__icon:not([src])) .weui-tabbar__label,
.weui-tabbar__item:has(.weui-tabbar__icon[src='']) .weui-tabbar__label {
  margin-top: 0 !important;
}

/* Vite 错误覆盖层无法选择文本的问题 */
vite-error-overlay {
  /* stylelint-disable-next-line property-no-vendor-prefix */
  -webkit-user-select: text !important;
}

vite-error-overlay::part(window) {
  max-width: 90vw;
  padding: 10px;
}

.taro_page {
  overflow: auto;
}

::-webkit-scrollbar {
  width: 4px;
  height: 4px;
}

::-webkit-scrollbar-track {
  background: transparent;
}

::-webkit-scrollbar-thumb {
  background: rgba(0, 0, 0, 0.2);
  border-radius: 2px;
}

::-webkit-scrollbar-thumb:hover {
  background: rgba(0, 0, 0, 0.3);
}

/* H5 导航栏页面自动添加顶部间距 */
body.h5-navbar-visible .taro_page {
  padding-top: 44px;
}

body.h5-navbar-visible .toaster[data-position^="top"] {
  top: 44px !important;
}

/* Sheet 组件在 H5 导航栏下的位置修正 */
body.h5-navbar-visible .sheet-content:not([data-side="bottom"]) {
    top: 44px !important;
}

/*
 * H5 端 rem 适配：与小程序 rpx 缩放一致
 * 375px 屏幕：1rem = 16px，小程序 32rpx = 16px
 */
html {
    font-size: 4vw !important;
}

/* H5 端组件默认样式修复 */
taro-view-core {
    display: block;
}

taro-text-core {
    display: inline;
}

taro-input-core {
    display: block;
    width: 100%;
}

taro-input-core input {
    width: 100%;
    background: transparent;
    border: none;
    outline: none;
}

taro-input-core.taro-otp-hidden-input input {
    color: transparent;
    caret-color: transparent;
    -webkit-text-fill-color: transparent;
}

/* 全局按钮样式重置 */
taro-button-core,
button {
    margin: 0 !important;
    padding: 0 !important;
    line-height: inherit;
    display: flex;
    align-items: center;
    justify-content: center;
}

taro-button-core::after,
button::after {
    border: none;
}

taro-textarea-core > textarea,
.taro-textarea,
textarea.taro-textarea {
    resize: none !important;
}
`,We=`
/* PC 宽屏适配 - 基础布局 */
@media (min-width: 769px) {
  html {
    font-size: 15px !important;
  }

  body {
    background-color: #f3f4f6 !important;
    display: flex !important;
    justify-content: center !important;
    align-items: center !important;
    min-height: 100vh !important;
  }
}
`,Ue=`
/* PC 宽屏适配 - 手机框样式（有 TabBar 页面） */
@media (min-width: 769px) {
  .taro-tabbar__container {
    width: 375px !important;
    max-width: 375px !important;
    height: calc(100vh - 40px) !important;
    max-height: 900px !important;
    background-color: #fff !important;
    transform: translateX(0) !important;
    box-shadow: 0 0 20px rgba(0, 0, 0, 0.1) !important;
    border-radius: 20px !important;
    overflow: hidden !important;
    position: relative !important;
  }

  .taro-tabbar__panel {
    height: 100% !important;
    overflow: auto !important;
  }
}

/* PC 宽屏适配 - Toast 定位到手机框范围内 */
@media (min-width: 769px) {
  body .toaster {
    left: 50% !important;
    right: auto !important;
    width: 375px !important;
    max-width: 375px !important;
    transform: translateX(-50%) !important;
    box-sizing: border-box !important;
  }
}

/* PC 宽屏适配 - 手机框样式（无 TabBar 页面，通过 JS 添加 no-tabbar 类） */
@media (min-width: 769px) {
  body.no-tabbar #app {
    width: 375px !important;
    max-width: 375px !important;
    height: calc(100vh - 40px) !important;
    max-height: 900px !important;
    background-color: #fff !important;
    box-shadow: 0 0 20px rgba(0, 0, 0, 0.1) !important;
    border-radius: 20px !important;
    overflow: hidden !important;
    position: relative !important;
    transform: translateX(0) !important;
  }

  body.no-tabbar #app .taro_router {
    height: 100% !important;
    overflow: auto !important;
  }
}
`;function $e(){var o=document.createElement("style");o.innerHTML=Me+We+Ue,document.head.appendChild(o)}function Ye(){var o=function(){var n=!!document.querySelector(".taro-tabbar__container");document.body.classList.toggle("no-tabbar",!n)};o();var e=new MutationObserver(o);e.observe(document.body,{childList:!0,subtree:!0})}function Xe(){$e(),Ye()}function Ge(){var o=be();if(o===xe.WEAPP)try{var e=we(),r=e.miniProgram.envVersion;console.log("[Debug] envVersion:",r),r!=="release"&&_e({enableDebug:!0})}catch(n){console.error("[Debug] 开启调试模式失败:",n)}}var Je={visible:!1,title:"",bgColor:"#ffffff",textStyle:"black",navStyle:"default",transparent:"none",leftIcon:"none"},qe=function(){var e,r=I();return(r==null||(e=r.config)===null||e===void 0?void 0:e.window)||{}},Ke=function(){var e,r,n=(e=I())===null||e===void 0||(e=e.config)===null||e===void 0?void 0:e.tabBar;return new Set((n==null||(r=n.list)===null||r===void 0?void 0:r.map(function(i){return i.pagePath}))||[])},$=function(){var e,r=I();return(r==null||(e=r.config)===null||e===void 0||(e=e.pages)===null||e===void 0?void 0:e[0])||"pages/index/index"},F=function(e){return e.replace(/^\//,"")},Qe=function(e,r,n,i){if(!e)return"none";var a=F(e),t=F(i),g=a===t,c=r.has(a)||r.has("/".concat(a)),f=n>1;return c||g?"none":f?"back":"home"},Ze=function(){var e=v.useState(Je),r=U(e,2),n=r[0],i=r[1],a=v.useState(0),t=U(a,2),g=t[0],c=t[1],f=v.useCallback(function(){var m=b.getCurrentPages();if(m.length===0){i(function(ce){return x(x({},ce),{},{visible:!1})});return}var h=m[m.length-1],z=(h==null?void 0:h.route)||"";if(z){var w=(h==null?void 0:h.config)||{},_=qe(),T=Ke(),se=$(),C=F(z),V=F(se),ue=C===V,le=T.has(C)||T.has("/".concat(C)),M=T.size<=1&&m.length<=1&&(ue||le);i({visible:!M,title:document.title||w.navigationBarTitleText||_.navigationBarTitleText||"",bgColor:w.navigationBarBackgroundColor||_.navigationBarBackgroundColor||"#ffffff",textStyle:w.navigationBarTextStyle||_.navigationBarTextStyle||"black",navStyle:w.navigationStyle||_.navigationStyle||"default",transparent:w.transparentTitle||_.transparentTitle||"none",leftIcon:M?"none":Qe(C,T,m.length,V)})}},[]);b.useDidShow(function(){f()}),b.usePageScroll(function(m){var h=m.scrollTop;n.transparent==="auto"&&c(Math.min(h/100,1))}),v.useEffect(function(){var m=null,h=new MutationObserver(function(){m&&clearTimeout(m),m=setTimeout(function(){f()},50)});return h.observe(document.head,{subtree:!0,childList:!0,characterData:!0}),f(),function(){h.disconnect(),m&&clearTimeout(m)}},[f]);var A=n.visible&&n.navStyle!=="custom";if(v.useEffect(function(){A?document.body.classList.add("h5-navbar-visible"):document.body.classList.remove("h5-navbar-visible")},[A]),!A)return s.jsx(s.Fragment,{});var R=n.textStyle==="white"?"#fff":"#333",te=n.textStyle==="white"?"text-white":"text-gray-800",ae=function(){return n.transparent==="always"?{backgroundColor:"transparent"}:n.transparent==="auto"?{backgroundColor:n.bgColor,opacity:g}:{backgroundColor:n.bgColor}},ie=function(){return b.navigateBack()},oe=function(){var h=$();b.reLaunch({url:"/".concat(h)})};return s.jsxs(s.Fragment,{children:[s.jsxs(l,{className:"fixed top-0 left-0 right-0 h-11 flex items-center justify-center z-1000",style:ae(),children:[n.leftIcon==="back"&&s.jsx(l,{className:"absolute left-2 top-1/2 -translate-y-1/2 p-1 flex items-center justify-center",onClick:ie,children:s.jsx(ye,{size:24,color:R})}),n.leftIcon==="home"&&s.jsx(l,{className:"absolute left-2 top-1/2 -translate-y-1/2 p-1 flex items-center justify-center",onClick:oe,children:s.jsx(Ee,{size:22,color:R})}),s.jsx(Te,{className:"text-base font-medium max-w-3/5 truncate ".concat(te),children:n.title})]}),s.jsx(l,{className:"h-11 shrink-0"})]})},er=function(e){var r=e.children;return s.jsxs(s.Fragment,{children:[s.jsx(Ze,{}),r]})},rr=["className","children","orientation"],ee=v.forwardRef(function(o,e){var r=o.className,n=o.children,i=o.orientation,a=i===void 0?"vertical":i,t=Ce(o,rr),g=a==="horizontal"||a==="both",c=a==="vertical"||a==="both";return s.jsx(je,x(x({ref:e,className:D("relative",r),scrollY:c,scrollX:g,style:{overflowX:g?"auto":"hidden",overflowY:c?"auto":"hidden"}},t),{},{children:n}))});ee.displayName="ScrollArea";var nr={error:null,report:"",source:"",visible:!1,open:!1,timestamp:""},Y="hsl(360, 100%, 45%)",X=!1,P=nr,H=new Set,tr=function(){H.forEach(function(e){return e()})},ar=function(e){return H.add(e),function(){return H.delete(e)}},G=function(){return P},re=function(e){P=e,tr()},ir=(function(){var o=d(u().m(function e(r){var n,i,a,t,g;return u().w(function(c){for(;;)switch(c.p=c.n){case 0:if(typeof window!="undefined"){c.n=1;break}return c.a(2,!1);case 1:if(c.p=1,!((n=navigator.clipboard)!==null&&n!==void 0&&n.writeText)){c.n=3;break}return c.n=2,navigator.clipboard.writeText(r);case 2:return c.a(2,!0);case 3:c.n=5;break;case 4:c.p=4,t=c.v,console.warn("[H5ErrorBoundary] Clipboard API copy failed:",t);case 5:return c.p=5,i=document.createElement("textarea"),i.value=r,i.setAttribute("readonly","true"),i.style.position="fixed",i.style.opacity="0",document.body.appendChild(i),i.select(),a=document.execCommand("copy"),document.body.removeChild(i),c.a(2,a);case 6:return c.p=6,g=c.v,console.warn("[H5ErrorBoundary] Fallback copy failed:",g),c.a(2,!1)}},e,null,[[5,6],[1,4]])}));return function(r){return o.apply(this,arguments)}})(),or=function(e){if(e instanceof Error)return e;if(typeof e=="string")return new Error(e);try{return new Error(JSON.stringify(e))}catch(r){return new Error(String(e))}},sr=function(e){var r=arguments.length>1&&arguments[1]!==void 0?arguments[1]:{},n=["[H5 Runtime Error]","Time: ".concat(new Date().toISOString()),r.source?"Source: ".concat(r.source):"","Name: ".concat(e.name),"Message: ".concat(e.message),e.stack?`Stack:
`.concat(e.stack):"",r.componentStack?`Component Stack:
`.concat(r.componentStack):"",typeof navigator!="undefined"?"User Agent: ".concat(navigator.userAgent):""].filter(Boolean);return n.join(`

`)},J=function(e){P.visible&&re(x(x({},P),{},{open:e}))},L=function(e){var r=arguments.length>1&&arguments[1]!==void 0?arguments[1]:{};if(typeof window!="undefined"){var n=or(e),i=sr(n,r),a=new Date().toLocaleTimeString("zh-CN",{hour:"2-digit",minute:"2-digit",second:"2-digit"});re({error:n,report:i,source:r.source||"runtime",timestamp:a,visible:!0,open:!1}),console.error("[H5ErrorOverlay] Showing error overlay:",n,r)}},ur=function(e){var r=e.error||new Error(e.message||"Unknown H5 runtime error");L(r,{source:"window.error"})},lr=function(e){L(e.reason,{source:"window.unhandledrejection"})},cr=function(){typeof window=="undefined"||X||(X=!0,window.addEventListener("error",ur),window.addEventListener("unhandledrejection",lr))},dr=function(){var e,r,n=v.useSyncExternalStore(ar,G,G);if(!n.visible)return null;var i=((e=n.error)===null||e===void 0?void 0:e.name)||"Error";return s.jsx(de,{children:s.jsxs(l,{className:"pointer-events-none fixed inset-0 z-[2147483646]",children:[s.jsx(l,{className:"pointer-events-auto fixed bottom-5 left-5",children:s.jsx(j,{variant:"outline",size:"icon",className:D("h-11 w-11 rounded-full shadow-md transition-transform"),style:{backgroundColor:"hsl(359, 100%, 97%)",borderColor:"hsl(359, 100%, 94%)",color:Y},onClick:function(){return J(!n.open)},children:s.jsx(Pe,{size:22,color:Y})})}),n.open&&s.jsx(l,{className:"pointer-events-none fixed inset-0 bg-white bg-opacity-15 supports-[backdrop-filter]:backdrop-blur-md",children:s.jsx(l,{className:"absolute inset-0 flex items-center justify-center px-4 py-4",children:s.jsx(l,{className:"w-full max-w-md",style:{width:"min(calc(100vw - 32px), var(--h5-phone-width, 390px))",height:"min(calc(100vh - 32px), 900px)"},children:s.jsx(pe,{className:D("pointer-events-auto h-full rounded-2xl border border-border bg-background text-foreground shadow-2xl"),children:s.jsxs(l,{className:"relative flex h-full flex-col",children:[s.jsxs(me,{className:"gap-2 p-4 pb-2",children:[s.jsxs(l,{className:"flex items-start justify-between gap-3",children:[s.jsxs(l,{className:"flex flex-wrap items-center gap-2",children:[s.jsx(O,{variant:"destructive",className:"border-none bg-red-500 px-3 py-1 text-xs font-medium text-white",children:"Runtime Error"}),s.jsx(O,{variant:"outline",className:"px-3 py-1 text-xs",children:n.source})]}),s.jsxs(l,{className:"flex shrink-0 items-center gap-1",children:[s.jsx(j,{variant:"ghost",size:"icon",className:"h-8 w-8 rounded-full",onClick:function(){return window.location.reload()},children:s.jsx(Se,{size:15,color:"inherit"})}),s.jsx(j,{variant:"ghost",size:"icon",className:"h-8 w-8 rounded-full",onClick:function(){return J(!1)},children:s.jsx(ke,{size:17,color:"inherit"})})]})]}),s.jsxs(l,{className:"flex items-center justify-between gap-3",children:[s.jsx(fe,{className:"text-left text-lg",children:i}),s.jsxs(j,{variant:"outline",size:"sm",className:"shrink-0 rounded-lg",onClick:(function(){var a=d(u().m(function g(){var c;return u().w(function(f){for(;;)switch(f.n){case 0:return f.n=1,ir(n.report);case 1:if(c=f.v,!c){f.n=2;break}return W.success("已复制错误信息",{description:"可发送给 Agent 进行自动修复",position:"top-center"}),f.a(2);case 2:W.warning("复制失败",{description:"请直接选中文本后手动复制。",position:"top-center"});case 3:return f.a(2)}},g)}));function t(){return a.apply(this,arguments)}return t})(),children:[s.jsx(Ae,{size:15,color:"inherit"}),s.jsx(l,{children:"复制错误"})]})]})]}),s.jsx(he,{className:"min-h-0 flex-1 overflow-hidden px-4 pb-4 pt-2",children:s.jsxs(l,{className:"flex h-full min-h-0 flex-col gap-2",children:[s.jsxs(l,{className:"flex flex-wrap items-center gap-x-4 gap-y-2 rounded-lg border border-border px-3 py-2 text-sm",children:[s.jsxs(l,{className:"flex items-center gap-2",children:[s.jsx(l,{className:"text-muted-foreground",children:"Error"}),s.jsx(l,{className:"font-medium text-foreground",children:((r=n.error)===null||r===void 0?void 0:r.name)||"Error"})]}),s.jsx(l,{className:"h-4 w-px bg-border"}),s.jsxs(l,{className:"flex items-center gap-2",children:[s.jsx(l,{className:"text-muted-foreground",children:"Source"}),s.jsx(l,{className:"font-medium text-foreground",children:n.source})]})]}),s.jsxs(l,{className:"min-h-0 flex flex-1 flex-col overflow-hidden rounded-xl border border-border bg-black text-white",children:[s.jsxs(l,{className:"flex items-center justify-between border-b border-white border-opacity-10 px-3 py-3",children:[s.jsx(l,{className:"text-xs font-medium uppercase tracking-wide text-zinc-400",children:"Full Report"}),s.jsx(O,{variant:"outline",className:"border-zinc-700 bg-transparent px-2 py-1 text-xs text-zinc-400",children:n.timestamp})]}),s.jsx(ee,{className:"min-h-0 flex-1 w-full",orientation:"both",children:s.jsx(l,{className:"inline-block min-w-full whitespace-pre px-3 py-3 pb-8 font-mono text-xs leading-6 text-zinc-200",children:n.report})})]})]})})]})})})})})]})})},pr=(function(o){function e(){var r;Oe(this,e);for(var n=arguments.length,i=new Array(n),a=0;a<n;a++)i[a]=arguments[a];return r=Ne(this,e,[].concat(i)),r.state={error:null},r}return Be(e,o),Fe(e,[{key:"componentDidUpdate",value:function(n){this.state.error&&n.children!==this.props.children&&this.setState({error:null})}},{key:"componentDidCatch",value:function(n,i){L(n,{source:"React Error Boundary",componentStack:i.componentStack||""})}},{key:"render",value:function(){return s.jsxs(s.Fragment,{children:[s.jsx(dr,{}),this.state.error?null:this.props.children]})}}],[{key:"getDerivedStateFromError",value:function(n){return{error:n}}}])})(v.Component),mr=function(e){var r=e.children;return s.jsx(pr,{children:r})},fr=function(e){var r=e.children;return cr(),b.useLaunch(function(){Ge(),Xe()}),s.jsx(mr,{children:s.jsx(er,{children:r})})},hr=function(e){var r=e.children;return b.useLaunch(function(){var n=ge.getState(),i=n.studentId;i&&p(()=>import("./draft.e8cafa7e.js"),["./draft.e8cafa7e.js","./vendors.c7f8fc40.js","..\\css\\vendors.8886af03.css","./common.9d0335be.js"],import.meta.url).then(function(a){return a.hydrateDrafts()}).catch(function(a){return console.warn("[draft] hydrate failed",a)})}),s.jsxs(De,{defaultColor:"#000",defaultSize:24,children:[s.jsx(fr,{children:r}),s.jsx(ve,{})]})},E=K.__taroAppConfig={router:{mode:"hash"},pages:["pages/index/index","pages/case/index","pages/my-mood/index","pages/fragments/index","pages/concept-module/index","pages/fragment-brief/index","pages/chat/index","pages/conceptualization/index","pages/feedback/index","pages/case-detail/index","pages/session-brief/index","pages/mood-record/index","pages/progress/index","pages/identity/index","pages/homework/index","pages/homework-detail/index","pages/teacher/index","pages/teacher-grade/index"],window:{backgroundTextStyle:"light",navigationBarBackgroundColor:"#F7F6F2",navigationBarTitleText:"知愈心理",navigationBarTextStyle:"black",backgroundColor:"#F7F6F2"},tabBar:{color:"#9AA19A",selectedColor:"#5B8C7B",backgroundColor:"#ffffff",borderStyle:"black",list:[{pagePath:"pages/index/index",text:"片段练习",iconPath:"./assets/tabbar/layers.png",selectedIconPath:"./assets/tabbar/layers-active.png"},{pagePath:"pages/case/index",text:"完整咨询",iconPath:"./assets/tabbar/user-round.png",selectedIconPath:"./assets/tabbar/user-round-active.png"},{pagePath:"pages/my-mood/index",text:"我的周记",iconPath:"./assets/tabbar/heart-pulse.png",selectedIconPath:"./assets/tabbar/heart-pulse-active.png"}]}},S=[],k=[];S[0]="/static/images/layers.png";k[0]="/static/images/layers-active.png";S[1]="/static/images/user-round.png";k[1]="/static/images/user-round-active.png";S[2]="/static/images/heart-pulse.png";k[2]="/static/images/heart-pulse-active.png";var q=E.tabBar.list;for(var y=0;y<q.length;y++){var B=q[y];B.iconPath&&(B.iconPath=S[y]),B.selectedIconPath&&(B.selectedIconPath=k[y])}E.routes=[Object.assign({path:"pages/index/index",load:(function(){var o=d(u().m(function r(n,i){var a;return u().w(function(t){for(;;)switch(t.n){case 0:return t.n=1,p(()=>import("./index.ad6abef9.js"),["./index.ad6abef9.js","./vendors.c7f8fc40.js","..\\css\\vendors.8886af03.css","./common.9d0335be.js"],import.meta.url);case 1:return a=t.v,t.a(2,[a,n,i])}},r)}));function e(r,n){return o.apply(this,arguments)}return e})()},{navigationBarTitleText:"知愈心理"}),Object.assign({path:"pages/case/index",load:(function(){var o=d(u().m(function r(n,i){var a;return u().w(function(t){for(;;)switch(t.n){case 0:return t.n=1,p(()=>import("./index.125894c8.js"),["./index.125894c8.js","./vendors.c7f8fc40.js","..\\css\\vendors.8886af03.css","./common.9d0335be.js"],import.meta.url);case 1:return a=t.v,t.a(2,[a,n,i])}},r)}));function e(r,n){return o.apply(this,arguments)}return e})()},{navigationBarTitleText:"完整咨询"}),Object.assign({path:"pages/my-mood/index",load:(function(){var o=d(u().m(function r(n,i){var a;return u().w(function(t){for(;;)switch(t.n){case 0:return t.n=1,p(()=>import("./index.a3f5ff2d.js"),["./index.a3f5ff2d.js","./common.9d0335be.js","./vendors.c7f8fc40.js","..\\css\\vendors.8886af03.css"],import.meta.url);case 1:return a=t.v,t.a(2,[a,n,i])}},r)}));function e(r,n){return o.apply(this,arguments)}return e})()},{navigationBarTitleText:"我的情绪周记"}),Object.assign({path:"pages/fragments/index",load:(function(){var o=d(u().m(function r(n,i){var a;return u().w(function(t){for(;;)switch(t.n){case 0:return t.n=1,p(()=>import("./index.8c9647af.js"),["./index.8c9647af.js","./vendors.c7f8fc40.js","..\\css\\vendors.8886af03.css","./common.9d0335be.js"],import.meta.url);case 1:return a=t.v,t.a(2,[a,n,i])}},r)}));function e(r,n){return o.apply(this,arguments)}return e})()},{navigationBarTitleText:"片段练习"}),Object.assign({path:"pages/concept-module/index",load:(function(){var o=d(u().m(function r(n,i){var a;return u().w(function(t){for(;;)switch(t.n){case 0:return t.n=1,p(()=>import("./index.4d9dafa0.js"),["./index.4d9dafa0.js","./vendors.c7f8fc40.js","..\\css\\vendors.8886af03.css","./common.9d0335be.js"],import.meta.url);case 1:return a=t.v,t.a(2,[a,n,i])}},r)}));function e(r,n){return o.apply(this,arguments)}return e})()},{navigationBarTitleText:"概念化模块"}),Object.assign({path:"pages/fragment-brief/index",load:(function(){var o=d(u().m(function r(n,i){var a;return u().w(function(t){for(;;)switch(t.n){case 0:return t.n=1,p(()=>import("./index.d2c194d7.js"),["./index.d2c194d7.js","./vendors.c7f8fc40.js","..\\css\\vendors.8886af03.css","./common.9d0335be.js"],import.meta.url);case 1:return a=t.v,t.a(2,[a,n,i])}},r)}));function e(r,n){return o.apply(this,arguments)}return e})()},{navigationBarTitleText:"练习说明"}),Object.assign({path:"pages/chat/index",load:(function(){var o=d(u().m(function r(n,i){var a;return u().w(function(t){for(;;)switch(t.n){case 0:return t.n=1,p(()=>import("./index.9da608d7.js"),["./index.9da608d7.js","./vendors.c7f8fc40.js","..\\css\\vendors.8886af03.css","./common.9d0335be.js"],import.meta.url);case 1:return a=t.v,t.a(2,[a,n,i])}},r)}));function e(r,n){return o.apply(this,arguments)}return e})()},{navigationBarTitleText:"咨询室"}),Object.assign({path:"pages/conceptualization/index",load:(function(){var o=d(u().m(function r(n,i){var a;return u().w(function(t){for(;;)switch(t.n){case 0:return t.n=1,p(()=>import("./index.669447fd.js"),["./index.669447fd.js","./vendors.c7f8fc40.js","..\\css\\vendors.8886af03.css","./common.9d0335be.js"],import.meta.url);case 1:return a=t.v,t.a(2,[a,n,i])}},r)}));function e(r,n){return o.apply(this,arguments)}return e})()},{navigationBarTitleText:"概念化填写"}),Object.assign({path:"pages/feedback/index",load:(function(){var o=d(u().m(function r(n,i){var a;return u().w(function(t){for(;;)switch(t.n){case 0:return t.n=1,p(()=>import("./index.7bb93f07.js"),["./index.7bb93f07.js","./vendors.c7f8fc40.js","..\\css\\vendors.8886af03.css","./common.9d0335be.js"],import.meta.url);case 1:return a=t.v,t.a(2,[a,n,i])}},r)}));function e(r,n){return o.apply(this,arguments)}return e})()},{navigationBarTitleText:"督导反馈"}),Object.assign({path:"pages/case-detail/index",load:(function(){var o=d(u().m(function r(n,i){var a;return u().w(function(t){for(;;)switch(t.n){case 0:return t.n=1,p(()=>import("./index.cee7f165.js"),["./index.cee7f165.js","./vendors.c7f8fc40.js","..\\css\\vendors.8886af03.css","./common.9d0335be.js"],import.meta.url);case 1:return a=t.v,t.a(2,[a,n,i])}},r)}));function e(r,n){return o.apply(this,arguments)}return e})()},{navigationBarTitleText:"咨询个案"}),Object.assign({path:"pages/session-brief/index",load:(function(){var o=d(u().m(function r(n,i){var a;return u().w(function(t){for(;;)switch(t.n){case 0:return t.n=1,p(()=>import("./index.cd55d568.js"),["./index.cd55d568.js","./vendors.c7f8fc40.js","..\\css\\vendors.8886af03.css","./common.9d0335be.js"],import.meta.url);case 1:return a=t.v,t.a(2,[a,n,i])}},r)}));function e(r,n){return o.apply(this,arguments)}return e})()},{navigationBarTitleText:"会谈说明"}),Object.assign({path:"pages/mood-record/index",load:(function(){var o=d(u().m(function r(n,i){var a;return u().w(function(t){for(;;)switch(t.n){case 0:return t.n=1,p(()=>import("./index.3786b5a4.js"),["./index.3786b5a4.js","./vendors.c7f8fc40.js","..\\css\\vendors.8886af03.css","./common.9d0335be.js"],import.meta.url);case 1:return a=t.v,t.a(2,[a,n,i])}},r)}));function e(r,n){return o.apply(this,arguments)}return e})()},{navigationBarTitleText:"来访者情绪记录"}),Object.assign({path:"pages/progress/index",load:(function(){var o=d(u().m(function r(n,i){var a;return u().w(function(t){for(;;)switch(t.n){case 0:return t.n=1,p(()=>import("./index.8f2aa0d6.js"),["./index.8f2aa0d6.js","./vendors.c7f8fc40.js","..\\css\\vendors.8886af03.css","./common.9d0335be.js"],import.meta.url);case 1:return a=t.v,t.a(2,[a,n,i])}},r)}));function e(r,n){return o.apply(this,arguments)}return e})()},{navigationBarTitleText:"学习进度"}),Object.assign({path:"pages/identity/index",load:(function(){var o=d(u().m(function r(n,i){var a;return u().w(function(t){for(;;)switch(t.n){case 0:return t.n=1,p(()=>import("./index.7a0c4f7f.js"),["./index.7a0c4f7f.js","./vendors.c7f8fc40.js","..\\css\\vendors.8886af03.css","./common.9d0335be.js"],import.meta.url);case 1:return a=t.v,t.a(2,[a,n,i])}},r)}));function e(r,n){return o.apply(this,arguments)}return e})()},{navigationBarTitleText:"身份设置"}),Object.assign({path:"pages/homework/index",load:(function(){var o=d(u().m(function r(n,i){var a;return u().w(function(t){for(;;)switch(t.n){case 0:return t.n=1,p(()=>import("./index.011dba72.js"),["./index.011dba72.js","./vendors.c7f8fc40.js","..\\css\\vendors.8886af03.css","./common.9d0335be.js"],import.meta.url);case 1:return a=t.v,t.a(2,[a,n,i])}},r)}));function e(r,n){return o.apply(this,arguments)}return e})()},{navigationBarTitleText:"我的作业"}),Object.assign({path:"pages/homework-detail/index",load:(function(){var o=d(u().m(function r(n,i){var a;return u().w(function(t){for(;;)switch(t.n){case 0:return t.n=1,p(()=>import("./index.228bde8d.js"),["./index.228bde8d.js","./vendors.c7f8fc40.js","..\\css\\vendors.8886af03.css","./common.9d0335be.js"],import.meta.url);case 1:return a=t.v,t.a(2,[a,n,i])}},r)}));function e(r,n){return o.apply(this,arguments)}return e})()},{navigationBarTitleText:"作业详情"}),Object.assign({path:"pages/teacher/index",load:(function(){var o=d(u().m(function r(n,i){var a;return u().w(function(t){for(;;)switch(t.n){case 0:return t.n=1,p(()=>import("./index.de14c65d.js"),["./index.de14c65d.js","./vendors.c7f8fc40.js","..\\css\\vendors.8886af03.css","./common.9d0335be.js"],import.meta.url);case 1:return a=t.v,t.a(2,[a,n,i])}},r)}));function e(r,n){return o.apply(this,arguments)}return e})()},{navigationBarTitleText:"教师工作台"}),Object.assign({path:"pages/teacher-grade/index",load:(function(){var o=d(u().m(function r(n,i){var a;return u().w(function(t){for(;;)switch(t.n){case 0:return t.n=1,p(()=>import("./index.417fdccc.js"),["./index.417fdccc.js","./vendors.c7f8fc40.js","..\\css\\vendors.8886af03.css","./common.9d0335be.js"],import.meta.url);case 1:return a=t.v,t.a(2,[a,n,i])}},r)}));function e(r,n){return o.apply(this,arguments)}return e})()},{navigationBarTitleText:"批改作业"})];Object.assign(Q,{findDOMNode:N.findDOMNode,render:N.render,unstable_batchedUpdates:N.unstable_batchedUpdates});He();var gr=Ie(hr,Z,Q,E),ne=Le({window:K});Re(E,ne);ze(ne,gr,E,Z);Ve({designWidth:750,deviceRatio:{375:2,640:1.17,750:1,828:.905},baseFontSize:20,unitPrecision:void 0,targetUnit:void 0});
