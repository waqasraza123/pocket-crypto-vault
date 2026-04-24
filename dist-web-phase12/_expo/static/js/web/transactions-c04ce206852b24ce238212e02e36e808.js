__d(function(g,r,i,a,m,e,d){"use strict";Object.defineProperty(e,'__esModule',{value:!0});var t=r(d[0]);Object.keys(t).forEach(function(n){'default'===n||Object.prototype.hasOwnProperty.call(e,n)||Object.defineProperty(e,n,{enumerable:!0,get:function(){return t[n]}})})},3673,[3835]);
__d(function(g,_r,_i,a,m,_e,_d){"use strict";Object.defineProperty(_e,'__esModule',{value:!0}),Object.defineProperty(_e,"W3mTransactionsView",{enumerable:!0,get:function(){return l}});var e=_r(_d[0]),t=_r(_d[1]);_r(_d[2]),_r(_d[3]);var r,i=_r(_d[4]),n=(r=i)&&r.__esModule?r:{default:r},c=this&&this.__decorate||function(e,t,r,i){var n,c=arguments.length,l=c<3?t:null===i?i=Object.getOwnPropertyDescriptor(t,r):i;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)l=Reflect.decorate(e,t,r,i);else for(var o=e.length-1;o>=0;o--)(n=e[o])&&(l=(c<3?n(l):c>3?n(t,r,l):n(t,r))||l);return c>3&&l&&Object.defineProperty(t,r,l),l};let l=class extends e.LitElement{render(){return e.html`
      <wui-flex flexDirection="column" .padding=${['0','3','3','3']} gap="3">
        <w3m-activity-list page="activity"></w3m-activity-list>
      </wui-flex>
    `}};l.styles=n.default,l=c([(0,t.customElement)('w3m-transactions-view')],l)},3835,[2549,2546,2650,2704,3836]);
__d(function(g,r,i,a,m,e,d){"use strict";Object.defineProperty(e,'__esModule',{value:!0}),Object.defineProperty(e,"default",{enumerable:!0,get:function(){return t}});var t=r(d[0]).css`
  :host > wui-flex:first-child {
    height: 500px;
    overflow-y: auto;
    overflow-x: hidden;
    scrollbar-width: none;
  }

  :host > wui-flex:first-child::-webkit-scrollbar {
    display: none;
  }
`},3836,[2549]);