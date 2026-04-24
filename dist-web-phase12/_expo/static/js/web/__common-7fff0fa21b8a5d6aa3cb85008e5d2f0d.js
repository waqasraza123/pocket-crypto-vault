__d(function(g,r,i,a,m,e,d){"use strict";Object.defineProperty(e,'__esModule',{value:!0}),Object.defineProperty(e,"openPay",{enumerable:!0,get:function(){return c.openPay}}),Object.defineProperty(e,"getExchanges",{enumerable:!0,get:function(){return c.getExchanges}}),Object.defineProperty(e,"getPayResult",{enumerable:!0,get:function(){return c.getPayResult}}),Object.defineProperty(e,"getPayError",{enumerable:!0,get:function(){return c.getPayError}}),Object.defineProperty(e,"getIsPaymentInProgress",{enumerable:!0,get:function(){return c.getIsPaymentInProgress}}),Object.defineProperty(e,"pay",{enumerable:!0,get:function(){return c.pay}}),Object.defineProperty(e,"PayController",{enumerable:!0,get:function(){return u.PayController}});var t=r(d[0]);Object.keys(t).forEach(function(n){'default'===n||Object.prototype.hasOwnProperty.call(e,n)||Object.defineProperty(e,n,{enumerable:!0,get:function(){return t[n]}})});var n=r(d[1]);Object.keys(n).forEach(function(t){'default'===t||Object.prototype.hasOwnProperty.call(e,t)||Object.defineProperty(e,t,{enumerable:!0,get:function(){return n[t]}})});var o=r(d[2]);Object.keys(o).forEach(function(t){'default'===t||Object.prototype.hasOwnProperty.call(e,t)||Object.defineProperty(e,t,{enumerable:!0,get:function(){return o[t]}})});var c=r(d[3]),u=r(d[4]),f=r(d[5]);Object.keys(f).forEach(function(t){'default'===t||Object.prototype.hasOwnProperty.call(e,t)||Object.defineProperty(e,t,{enumerable:!0,get:function(){return f[t]}})})},3674,[4230,4240,4246,4258,4233,4259]);
__d(function(g,r,i,a,m,e,d){"use strict";Object.defineProperty(e,'__esModule',{value:!0});var t=r(d[0]);Object.keys(t).forEach(function(n){'default'===n||Object.prototype.hasOwnProperty.call(e,n)||Object.defineProperty(e,n,{enumerable:!0,get:function(){return t[n]}})})},3677,[4217]);
__d(function(g,_r,_i,a,m,_e,_d){"use strict";Object.defineProperty(_e,'__esModule',{value:!0}),Object.defineProperty(_e,"W3mEmailOtpWidget",{enumerable:!0,get:function(){return c}});var t=_r(_d[0]),e=_r(_d[1]),i=_r(_d[2]),o=_r(_d[3]);_r(_d[4]),_r(_d[5]),_r(_d[6]),_r(_d[7]),_r(_d[8]);var r,n,l=_r(_d[9]),s=_r(_d[10]),u=(r=s)&&r.__esModule?r:{default:r},h=this&&this.__decorate||function(t,e,i,o){var r,n=arguments.length,l=n<3?e:null===o?o=Object.getOwnPropertyDescriptor(e,i):o;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)l=Reflect.decorate(t,e,i,o);else for(var s=t.length-1;s>=0;s--)(r=t[s])&&(l=(n<3?r(l):n>3?r(e,i,l):r(e,i))||l);return n>3&&l&&Object.defineProperty(e,i,l),l};let c=n=class extends t.LitElement{firstUpdated(){this.startOTPTimeout()}disconnectedCallback(){clearTimeout(this.OTPTimeout)}constructor(){super(),this.loading=!1,this.timeoutTimeLeft=l.W3mFrameHelpers.getTimeToNextEmailLogin(),this.error='',this.otp='',this.email=i.RouterController.state.data?.email,this.authConnector=i.ConnectorController.getAuthConnector()}render(){if(!this.email)throw new Error('w3m-email-otp-widget: No email provided');const e=Boolean(this.timeoutTimeLeft),i=this.getFooterLabels(e);return t.html`
      <wui-flex
        flexDirection="column"
        alignItems="center"
        .padding=${['4','0','4','0']}
        gap="4"
      >
        <wui-flex
          class="email-display"
          flexDirection="column"
          alignItems="center"
          .padding=${['0','5','0','5']}
        >
          <wui-text variant="md-regular" color="primary" align="center">
            Enter the code we sent to
          </wui-text>
          <wui-text variant="md-medium" color="primary" lineClamp="1" align="center">
            ${this.email}
          </wui-text>
        </wui-flex>

        <wui-text variant="sm-regular" color="secondary">The code expires in 20 minutes</wui-text>

        ${this.loading?t.html`<wui-loading-spinner size="xl" color="accent-primary"></wui-loading-spinner>`:t.html` <wui-flex flexDirection="column" alignItems="center" gap="2">
              <wui-otp
                dissabled
                length="6"
                @inputChange=${this.onOtpInputChange.bind(this)}
                .otp=${this.otp}
              ></wui-otp>
              ${this.error?t.html`
                    <wui-text variant="sm-regular" align="center" color="error">
                      ${this.error}. Try Again
                    </wui-text>
                  `:null}
            </wui-flex>`}

        <wui-flex alignItems="center" gap="2">
          <wui-text variant="sm-regular" color="secondary">${i.title}</wui-text>
          <wui-link @click=${this.onResendCode.bind(this)} .disabled=${e}>
            ${i.action}
          </wui-link>
        </wui-flex>
      </wui-flex>
    `}startOTPTimeout(){this.timeoutTimeLeft=l.W3mFrameHelpers.getTimeToNextEmailLogin(),this.OTPTimeout=setInterval(()=>{this.timeoutTimeLeft>0?this.timeoutTimeLeft=l.W3mFrameHelpers.getTimeToNextEmailLogin():clearInterval(this.OTPTimeout)},1e3)}async onOtpInputChange(t){try{this.loading||(this.otp=t.detail,this.shouldSubmitOnOtpChange()&&(this.loading=!0,await(this.onOtpSubmit?.(this.otp))))}catch(t){this.error=i.CoreHelperUtil.parseError(t),this.loading=!1}}async onResendCode(){try{if(this.onOtpResend){if(!this.loading&&!this.timeoutTimeLeft){this.error='',this.otp='';if(!i.ConnectorController.getAuthConnector()||!this.email)throw new Error('w3m-email-otp-widget: Unable to resend email');this.loading=!0,await this.onOtpResend(this.email),this.startOTPTimeout(),i.SnackController.showSuccess('Code email resent')}}else this.onStartOver&&this.onStartOver()}catch(t){i.SnackController.showError(t)}finally{this.loading=!1}}getFooterLabels(t){return this.onStartOver?{title:'Something wrong?',action:"Try again "+(t?`in ${this.timeoutTimeLeft}s`:'')}:{title:"Didn't receive it?",action:"Resend "+(t?`in ${this.timeoutTimeLeft}s`:'Code')}}shouldSubmitOnOtpChange(){return this.authConnector&&this.otp.length===n.OTP_LENGTH}};c.OTP_LENGTH=6,c.styles=u.default,h([(0,e.state)()],c.prototype,"loading",void 0),h([(0,e.state)()],c.prototype,"timeoutTimeLeft",void 0),h([(0,e.state)()],c.prototype,"error",void 0),c=n=h([(0,o.customElement)('w3m-email-otp-widget')],c)},3757,[2549,2575,2164,2546,2650,2659,2778,4220,2651,2198,4225]);
__d(function(g,r,i,a,m,e,d){"use strict";Object.defineProperty(e,'__esModule',{value:!0});var t=r(d[0]);Object.keys(t).forEach(function(n){'default'===n||Object.prototype.hasOwnProperty.call(e,n)||Object.defineProperty(e,n,{enumerable:!0,get:function(){return t[n]}})})},3785,[4226]);
__d(function(g,r,i,a,m,e,d){"use strict";Object.defineProperty(e,'__esModule',{value:!0});var t=r(d[0]);Object.keys(t).forEach(function(n){'default'===n||Object.prototype.hasOwnProperty.call(e,n)||Object.defineProperty(e,n,{enumerable:!0,get:function(){return t[n]}})})},3806,[4228]);
__d(function(g,r,i,a,m,e,d){"use strict";Object.defineProperty(e,'__esModule',{value:!0});var t=r(d[0]);Object.keys(t).forEach(function(n){'default'===n||Object.prototype.hasOwnProperty.call(e,n)||Object.defineProperty(e,n,{enumerable:!0,get:function(){return t[n]}})})},3826,[2620]);
__d(function(g,r,i,a,m,e,d){"use strict";Object.defineProperty(e,'__esModule',{value:!0});var t=r(d[0]);Object.keys(t).forEach(function(n){'default'===n||Object.prototype.hasOwnProperty.call(e,n)||Object.defineProperty(e,n,{enumerable:!0,get:function(){return t[n]}})})},3872,[4231]);
__d(function(_g,_r,_i,_a,_m,_e,_d){"use strict";Object.defineProperty(_e,'__esModule',{value:!0}),Object.defineProperty(_e,"CSSResult",{enumerable:!0,get:function(){return t.CSSResult}}),Object.defineProperty(_e,"ReactiveElement",{enumerable:!0,get:function(){return m}}),Object.defineProperty(_e,"adoptStyles",{enumerable:!0,get:function(){return t.adoptStyles}}),Object.defineProperty(_e,"css",{enumerable:!0,get:function(){return t.css}}),Object.defineProperty(_e,"defaultConverter",{enumerable:!0,get:function(){return d}}),Object.defineProperty(_e,"getCompatibleStyle",{enumerable:!0,get:function(){return t.getCompatibleStyle}}),Object.defineProperty(_e,"notEqual",{enumerable:!0,get:function(){return p}}),Object.defineProperty(_e,"supportsAdoptingStyleSheets",{enumerable:!0,get:function(){return t.supportsAdoptingStyleSheets}}),Object.defineProperty(_e,"unsafeCSS",{enumerable:!0,get:function(){return t.unsafeCSS}});var t=_r(_d[0]);
/**
   * @license
   * Copyright 2017 Google LLC
   * SPDX-License-Identifier: BSD-3-Clause
   */const{is:e,defineProperty:r,getOwnPropertyDescriptor:s,getOwnPropertyNames:i,getOwnPropertySymbols:n,getPrototypeOf:o}=Object,a=globalThis,l=a.trustedTypes,h=l?l.emptyScript:"",c=a.reactiveElementPolyfillSupport,u=(t,e)=>t,d={toAttribute(t,e){switch(e){case Boolean:t=t?h:null;break;case Object:case Array:t=null==t?t:JSON.stringify(t)}return t},fromAttribute(t,e){let r=t;switch(e){case Boolean:r=null!==t;break;case Number:r=null===t?null:Number(t);break;case Object:case Array:try{r=JSON.parse(t)}catch(t){r=null}}return r}},p=(t,r)=>!e(t,r),f={attribute:!0,type:String,converter:d,reflect:!1,hasChanged:p};var y;null!=Symbol.metadata||(Symbol.metadata=Symbol("metadata")),null!=a.litPropertyMetadata||(a.litPropertyMetadata=new WeakMap);class m extends HTMLElement{static addInitializer(t){var e;this._$Ei(),(null!=(e=this.l)?e:this.l=[]).push(t)}static get observedAttributes(){return this.finalize(),this._$Eh&&[...this._$Eh.keys()]}static createProperty(t,e=f){if(e.state&&(e.attribute=!1),this._$Ei(),this.elementProperties.set(t,e),!e.noAccessor){const s=Symbol(),i=this.getPropertyDescriptor(t,s,e);void 0!==i&&r(this.prototype,t,i)}}static getPropertyDescriptor(t,e,r){var i;const{get:n,set:o}=null!=(i=s(this.prototype,t))?i:{get(){return this[e]},set(t){this[e]=t}};return{get(){return null==n?void 0:n.call(this)},set(e){const s=null==n?void 0:n.call(this);o.call(this,e),this.requestUpdate(t,s,r)},configurable:!0,enumerable:!0}}static getPropertyOptions(t){var e;return null!=(e=this.elementProperties.get(t))?e:f}static _$Ei(){if(this.hasOwnProperty(u("elementProperties")))return;const t=o(this);t.finalize(),void 0!==t.l&&(this.l=[...t.l]),this.elementProperties=new Map(t.elementProperties)}static finalize(){if(this.hasOwnProperty(u("finalized")))return;if(this.finalized=!0,this._$Ei(),this.hasOwnProperty(u("properties"))){const t=this.properties,e=[...i(t),...n(t)];for(const r of e)this.createProperty(r,t[r])}const t=this[Symbol.metadata];if(null!==t){const e=litPropertyMetadata.get(t);if(void 0!==e)for(const[t,r]of e)this.elementProperties.set(t,r)}this._$Eh=new Map;for(const[t,e]of this.elementProperties){const r=this._$Eu(t,e);void 0!==r&&this._$Eh.set(r,t)}this.elementStyles=this.finalizeStyles(this.styles)}static finalizeStyles(e){const r=[];if(Array.isArray(e)){const s=new Set(e.flat(1/0).reverse());for(const e of s)r.unshift((0,t.getCompatibleStyle)(e))}else void 0!==e&&r.push((0,t.getCompatibleStyle)(e));return r}static _$Eu(t,e){const r=e.attribute;return!1===r?void 0:"string"==typeof r?r:"string"==typeof t?t.toLowerCase():void 0}constructor(){super(),this._$Ep=void 0,this.isUpdatePending=!1,this.hasUpdated=!1,this._$Em=null,this._$Ev()}_$Ev(){var t;this._$ES=new Promise(t=>this.enableUpdating=t),this._$AL=new Map,this._$E_(),this.requestUpdate(),null==(t=this.constructor.l)||t.forEach(t=>t(this))}addController(t){var e,r;(null!=(e=this._$EO)?e:this._$EO=new Set).add(t),void 0!==this.renderRoot&&this.isConnected&&(null==(r=t.hostConnected)||r.call(t))}removeController(t){var e;null==(e=this._$EO)||e.delete(t)}_$E_(){const t=new Map,e=this.constructor.elementProperties;for(const r of e.keys())this.hasOwnProperty(r)&&(t.set(r,this[r]),delete this[r]);t.size>0&&(this._$Ep=t)}createRenderRoot(){var e;const r=null!=(e=this.shadowRoot)?e:this.attachShadow(this.constructor.shadowRootOptions);return(0,t.adoptStyles)(r,this.constructor.elementStyles),r}connectedCallback(){var t;null!=this.renderRoot||(this.renderRoot=this.createRenderRoot()),this.enableUpdating(!0),null==(t=this._$EO)||t.forEach(t=>{var e;return null==(e=t.hostConnected)?void 0:e.call(t)})}enableUpdating(t){}disconnectedCallback(){var t;null==(t=this._$EO)||t.forEach(t=>{var e;return null==(e=t.hostDisconnected)?void 0:e.call(t)})}attributeChangedCallback(t,e,r){this._$AK(t,r)}_$EC(t,e){var r;const s=this.constructor.elementProperties.get(t),i=this.constructor._$Eu(t,s);if(void 0!==i&&!0===s.reflect){const n=(void 0!==(null==(r=s.converter)?void 0:r.toAttribute)?s.converter:d).toAttribute(e,s.type);this._$Em=t,null==n?this.removeAttribute(i):this.setAttribute(i,n),this._$Em=null}}_$AK(t,e){var r;const s=this.constructor,i=s._$Eh.get(t);if(void 0!==i&&this._$Em!==i){const t=s.getPropertyOptions(i),n="function"==typeof t.converter?{fromAttribute:t.converter}:void 0!==(null==(r=t.converter)?void 0:r.fromAttribute)?t.converter:d;this._$Em=i,this[i]=n.fromAttribute(e,t.type),this._$Em=null}}requestUpdate(t,e,r){var s;if(void 0!==t){if(null!=r||(r=this.constructor.getPropertyOptions(t)),!(null!=(s=r.hasChanged)?s:p)(this[t],e))return;this.P(t,e,r)}!1===this.isUpdatePending&&(this._$ES=this._$ET())}P(t,e,r){var s;this._$AL.has(t)||this._$AL.set(t,e),!0===r.reflect&&this._$Em!==t&&(null!=(s=this._$Ej)?s:this._$Ej=new Set).add(t)}async _$ET(){this.isUpdatePending=!0;try{await this._$ES}catch(t){Promise.reject(t)}const t=this.scheduleUpdate();return null!=t&&await t,!this.isUpdatePending}scheduleUpdate(){return this.performUpdate()}performUpdate(){var t;if(!this.isUpdatePending)return;if(!this.hasUpdated){if(null!=this.renderRoot||(this.renderRoot=this.createRenderRoot()),this._$Ep){for(const[t,e]of this._$Ep)this[t]=e;this._$Ep=void 0}const t=this.constructor.elementProperties;if(t.size>0)for(const[e,r]of t)!0!==r.wrapped||this._$AL.has(e)||void 0===this[e]||this.P(e,this[e],r)}let e=!1;const r=this._$AL;try{e=this.shouldUpdate(r),e?(this.willUpdate(r),null==(t=this._$EO)||t.forEach(t=>{var e;return null==(e=t.hostUpdate)?void 0:e.call(t)}),this.update(r)):this._$EU()}catch(t){throw e=!1,this._$EU(),t}e&&this._$AE(r)}willUpdate(t){}_$AE(t){var e;null==(e=this._$EO)||e.forEach(t=>{var e;return null==(e=t.hostUpdated)?void 0:e.call(t)}),this.hasUpdated||(this.hasUpdated=!0,this.firstUpdated(t)),this.updated(t)}_$EU(){this._$AL=new Map,this.isUpdatePending=!1}get updateComplete(){return this.getUpdateComplete()}getUpdateComplete(){return this._$ES}shouldUpdate(t){return!0}update(t){this._$Ej&&(this._$Ej=this._$Ej.forEach(t=>this._$EC(t,this[t]))),this._$EU()}updated(t){}firstUpdated(t){}}m.elementStyles=[],m.shadowRootOptions={mode:"open"},m[u("elementProperties")]=new Map,m[u("finalized")]=new Map,null==c||c({ReactiveElement:m}),(null!=(y=a.reactiveElementVersions)?y:a.reactiveElementVersions=[]).push("2.0.4")},3873,[3878]);
__d(function(_g,_r,_i,_a,_m,_e,_d){"use strict";Object.defineProperty(_e,'__esModule',{value:!0}),Object.defineProperty(_e,"html",{enumerable:!0,get:function(){return m}}),Object.defineProperty(_e,"noChange",{enumerable:!0,get:function(){return H}}),Object.defineProperty(_e,"nothing",{enumerable:!0,get:function(){return x}}),Object.defineProperty(_e,"render",{enumerable:!0,get:function(){return W}}),Object.defineProperty(_e,"svg",{enumerable:!0,get:function(){return y}});
/**
   * @license
   * Copyright 2017 Google LLC
   * SPDX-License-Identifier: BSD-3-Clause
   */
const t=globalThis,e=t.trustedTypes,i=e?e.createPolicy("lit-html",{createHTML:t=>t}):void 0,s="$lit$",n=`lit$${Math.random().toFixed(9).slice(2)}$`,r="?"+n,o=`<${r}>`,l=document,h=()=>l.createComment(""),$=t=>null===t||"object"!=typeof t&&"function"!=typeof t,u=Array.isArray,a="[ \t\n\f\r]",c=/<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g,d=/-->/g,_=/>/g,A=RegExp(`>|${a}(?:([^\\s"'>=/]+)(${a}*=${a}*(?:[^ \t\n\f\r"'\`<>=]|("|')|))|$)`,"g"),p=/'/g,v=/"/g,g=/^(?:script|style|textarea|title)$/i,f=t=>(e,...i)=>({_$litType$:t,strings:e,values:i}),m=f(1),y=f(2),H=Symbol.for("lit-noChange"),x=Symbol.for("lit-nothing"),b=new WeakMap,N=l.createTreeWalker(l,129);function T(t,e){if(!Array.isArray(t)||!t.hasOwnProperty("raw"))throw Error("invalid template strings array");return void 0!==i?i.createHTML(e):e}const C=(t,e)=>{const i=t.length-1,r=[];let l,h=2===e?"<svg>":"",$=c;for(let e=0;e<i;e++){const i=t[e];let u,a,f=-1,m=0;for(;m<i.length&&($.lastIndex=m,a=$.exec(i),null!==a);)m=$.lastIndex,$===c?"!--"===a[1]?$=d:void 0!==a[1]?$=_:void 0!==a[2]?(g.test(a[2])&&(l=RegExp("</"+a[2],"g")),$=A):void 0!==a[3]&&($=A):$===A?">"===a[0]?($=null!=l?l:c,f=-1):void 0===a[1]?f=-2:(f=$.lastIndex-a[2].length,u=a[1],$=void 0===a[3]?A:'"'===a[3]?v:p):$===v||$===p?$=A:$===d||$===_?$=c:($=A,l=void 0);const y=$===A&&t[e+1].startsWith("/>")?" ":"";h+=$===c?i+o:f>=0?(r.push(u),i.slice(0,f)+s+i.slice(f)+n+y):i+n+(-2===f?e:y)}return[T(t,h+(t[i]||"<?>")+(2===e?"</svg>":"")),r]};class M{constructor({strings:t,_$litType$:i},o){let l;this.parts=[];let $=0,u=0;const a=t.length-1,c=this.parts,[d,_]=C(t,i);if(this.el=M.createElement(d,o),N.currentNode=this.el.content,2===i){const t=this.el.content.firstChild;t.replaceWith(...t.childNodes)}for(;null!==(l=N.nextNode())&&c.length<a;){if(1===l.nodeType){if(l.hasAttributes())for(const t of l.getAttributeNames())if(t.endsWith(s)){const e=_[u++],i=l.getAttribute(t).split(n),s=/([.?@])?(.*)/.exec(e);c.push({type:1,index:$,name:s[2],strings:i,ctor:"."===s[1]?E:"?"===s[1]?I:"@"===s[1]?B:j}),l.removeAttribute(t)}else t.startsWith(n)&&(c.push({type:6,index:$}),l.removeAttribute(t));if(g.test(l.tagName)){const t=l.textContent.split(n),i=t.length-1;if(i>0){l.textContent=e?e.emptyScript:"";for(let e=0;e<i;e++)l.append(t[e],h()),N.nextNode(),c.push({type:2,index:++$});l.append(t[i],h())}}}else if(8===l.nodeType)if(l.data===r)c.push({type:2,index:$});else{let t=-1;for(;-1!==(t=l.data.indexOf(n,t+1));)c.push({type:7,index:$}),t+=n.length-1}$++}}static createElement(t,e){const i=l.createElement("template");return i.innerHTML=t,i}}function S(t,e,i=t,s){var n,r,o;if(e===H)return e;let l=void 0!==s?null==(n=i._$Co)?void 0:n[s]:i._$Cl;const h=$(e)?void 0:e._$litDirective$;return(null==l?void 0:l.constructor)!==h&&(null==(r=null==l?void 0:l._$AO)||r.call(l,!1),void 0===h?l=void 0:(l=new h(t),l._$AT(t,i,s)),void 0!==s?(null!=(o=i._$Co)?o:i._$Co=[])[s]=l:i._$Cl=l),void 0!==l&&(e=S(t,l._$AS(t,e.values),l,s)),e}class w{constructor(t,e){this._$AV=[],this._$AN=void 0,this._$AD=t,this._$AM=e}get parentNode(){return this._$AM.parentNode}get _$AU(){return this._$AM._$AU}u(t){var e;const{el:{content:i},parts:s}=this._$AD,n=(null!=(e=null==t?void 0:t.creationScope)?e:l).importNode(i,!0);N.currentNode=n;let r=N.nextNode(),o=0,h=0,$=s[0];for(;void 0!==$;){if(o===$.index){let e;2===$.type?e=new P(r,r.nextSibling,this,t):1===$.type?e=new $.ctor(r,$.name,$.strings,this,t):6===$.type&&(e=new O(r,this,t)),this._$AV.push(e),$=s[++h]}o!==(null==$?void 0:$.index)&&(r=N.nextNode(),o++)}return N.currentNode=l,n}p(t){let e=0;for(const i of this._$AV)void 0!==i&&(void 0!==i.strings?(i._$AI(t,i,e),e+=i.strings.length-2):i._$AI(t[e])),e++}}class P{get _$AU(){var t,e;return null!=(e=null==(t=this._$AM)?void 0:t._$AU)?e:this._$Cv}constructor(t,e,i,s){var n;this.type=2,this._$AH=x,this._$AN=void 0,this._$AA=t,this._$AB=e,this._$AM=i,this.options=s,this._$Cv=null==(n=null==s?void 0:s.isConnected)||n}get parentNode(){let t=this._$AA.parentNode;const e=this._$AM;return void 0!==e&&11===(null==t?void 0:t.nodeType)&&(t=e.parentNode),t}get startNode(){return this._$AA}get endNode(){return this._$AB}_$AI(t,e=this){var i;t=S(this,t,e),$(t)?t===x||null==t||""===t?(this._$AH!==x&&this._$AR(),this._$AH=x):t!==this._$AH&&t!==H&&this._(t):void 0!==t._$litType$?this.$(t):void 0!==t.nodeType?this.T(t):u(i=t)||"function"==typeof(null==i?void 0:i[Symbol.iterator])?this.k(t):this._(t)}S(t){return this._$AA.parentNode.insertBefore(t,this._$AB)}T(t){this._$AH!==t&&(this._$AR(),this._$AH=this.S(t))}_(t){this._$AH!==x&&$(this._$AH)?this._$AA.nextSibling.data=t:this.T(l.createTextNode(t)),this._$AH=t}$(t){var e;const{values:i,_$litType$:s}=t,n="number"==typeof s?this._$AC(t):(void 0===s.el&&(s.el=M.createElement(T(s.h,s.h[0]),this.options)),s);if((null==(e=this._$AH)?void 0:e._$AD)===n)this._$AH.p(i);else{const t=new w(n,this),e=t.u(this.options);t.p(i),this.T(e),this._$AH=t}}_$AC(t){let e=b.get(t.strings);return void 0===e&&b.set(t.strings,e=new M(t)),e}k(t){u(this._$AH)||(this._$AH=[],this._$AR());const e=this._$AH;let i,s=0;for(const n of t)s===e.length?e.push(i=new P(this.S(h()),this.S(h()),this,this.options)):i=e[s],i._$AI(n),s++;s<e.length&&(this._$AR(i&&i._$AB.nextSibling,s),e.length=s)}_$AR(t=this._$AA.nextSibling,e){var i;for(null==(i=this._$AP)||i.call(this,!1,!0,e);t&&t!==this._$AB;){const e=t.nextSibling;t.remove(),t=e}}setConnected(t){var e;void 0===this._$AM&&(this._$Cv=t,null==(e=this._$AP)||e.call(this,t))}}class j{get tagName(){return this.element.tagName}get _$AU(){return this._$AM._$AU}constructor(t,e,i,s,n){this.type=1,this._$AH=x,this._$AN=void 0,this.element=t,this.name=e,this._$AM=s,this.options=n,i.length>2||""!==i[0]||""!==i[1]?(this._$AH=Array(i.length-1).fill(new String),this.strings=i):this._$AH=x}_$AI(t,e=this,i,s){const n=this.strings;let r=!1;if(void 0===n)t=S(this,t,e,0),r=!$(t)||t!==this._$AH&&t!==H,r&&(this._$AH=t);else{const s=t;let o,l;for(t=n[0],o=0;o<n.length-1;o++)l=S(this,s[i+o],e,o),l===H&&(l=this._$AH[o]),r||(r=!$(l)||l!==this._$AH[o]),l===x?t=x:t!==x&&(t+=(null!=l?l:"")+n[o+1]),this._$AH[o]=l}r&&!s&&this.j(t)}j(t){t===x?this.element.removeAttribute(this.name):this.element.setAttribute(this.name,null!=t?t:"")}}class E extends j{constructor(){super(...arguments),this.type=3}j(t){this.element[this.name]=t===x?void 0:t}}class I extends j{constructor(){super(...arguments),this.type=4}j(t){this.element.toggleAttribute(this.name,!!t&&t!==x)}}class B extends j{constructor(t,e,i,s,n){super(t,e,i,s,n),this.type=5}_$AI(t,e=this){var i;if((t=null!=(i=S(this,t,e,0))?i:x)===H)return;const s=this._$AH,n=t===x&&s!==x||t.capture!==s.capture||t.once!==s.once||t.passive!==s.passive,r=t!==x&&(s===x||n);n&&this.element.removeEventListener(this.name,this,s),r&&this.element.addEventListener(this.name,this,t),this._$AH=t}handleEvent(t){var e,i;"function"==typeof this._$AH?this._$AH.call(null!=(i=null==(e=this.options)?void 0:e.host)?i:this.element,t):this._$AH.handleEvent(t)}}class O{constructor(t,e,i){this.element=t,this.type=6,this._$AN=void 0,this._$AM=e,this.options=i}get _$AU(){return this._$AM._$AU}_$AI(t){S(this,t)}}const U=t.litHtmlPolyfillSupport;var R;null==U||U(M,P),(null!=(R=t.litHtmlVersions)?R:t.litHtmlVersions=[]).push("3.1.4");const W=(t,e,i)=>{var s,n;const r=null!=(s=null==i?void 0:i.renderBefore)?s:e;let o=r._$litPart$;if(void 0===o){const t=null!=(n=null==i?void 0:i.renderBefore)?n:null;r._$litPart$=o=new P(e.insertBefore(h(),t),t,void 0,null!=i?i:{})}return o._$AI(t),o}},3874,[]);
__d(function(g,_r,_i,a,m,_e,d){"use strict";Object.defineProperty(_e,'__esModule',{value:!0}),Object.defineProperty(_e,"LitElement",{enumerable:!0,get:function(){return r}}),Object.defineProperty(_e,"ReactiveElement",{enumerable:!0,get:function(){return t.ReactiveElement}}),Object.defineProperty(_e,"defaultConverter",{enumerable:!0,get:function(){return t.defaultConverter}}),Object.defineProperty(_e,"html",{enumerable:!0,get:function(){return n.html}}),Object.defineProperty(_e,"noChange",{enumerable:!0,get:function(){return n.noChange}}),Object.defineProperty(_e,"notEqual",{enumerable:!0,get:function(){return t.notEqual}}),Object.defineProperty(_e,"nothing",{enumerable:!0,get:function(){return n.nothing}}),Object.defineProperty(_e,"render",{enumerable:!0,get:function(){return n.render}}),Object.defineProperty(_e,"svg",{enumerable:!0,get:function(){return n.svg}});var e,t=_r(d[0]),n=_r(d[1]);
/**
   * @license
   * Copyright 2017 Google LLC
   * SPDX-License-Identifier: BSD-3-Clause
   */
class r extends t.ReactiveElement{constructor(){super(...arguments),this.renderOptions={host:this},this._$Do=void 0}createRenderRoot(){var e;const t=super.createRenderRoot();return null!=(e=this.renderOptions).renderBefore||(e.renderBefore=t.firstChild),t}update(e){const t=this.render();this.hasUpdated||(this.renderOptions.isConnected=this.isConnected),super.update(e),this._$Do=(0,n.render)(t,this.renderRoot,this.renderOptions)}connectedCallback(){var e;super.connectedCallback(),null==(e=this._$Do)||e.setConnected(!0)}disconnectedCallback(){var e;super.disconnectedCallback(),null==(e=this._$Do)||e.setConnected(!1)}render(){return n.noChange}}r._$litElement$=!0,r.finalized=!0,null==(e=globalThis.litElementHydrateSupport)||e.call(globalThis,{LitElement:r});const l=globalThis.litElementPolyfillSupport;var o;null==l||l({LitElement:r}),(null!=(o=globalThis.litElementVersions)?o:globalThis.litElementVersions=[]).push("4.0.6")},3875,[3873,3874]);
__d(function(g,r,i,a,m,_e,d){"use strict";Object.defineProperty(_e,'__esModule',{value:!0}),Object.defineProperty(_e,"customElement",{enumerable:!0,get:function(){return e}});
/**
   * @license
   * Copyright 2017 Google LLC
   * SPDX-License-Identifier: BSD-3-Clause
   */
const e=e=>(t,n)=>{void 0!==n?n.addInitializer(()=>{customElements.define(e,t)}):customElements.define(e,t)}},3876,[]);
__d(function(_g,_r,_i,_a,m,_e,_d){"use strict";Object.defineProperty(_e,'__esModule',{value:!0}),Object.defineProperty(_e,"property",{enumerable:!0,get:function(){return d}}),Object.defineProperty(_e,"standardProperty",{enumerable:!0,get:function(){return u}});var e=_r(_d[0]),t=Object.defineProperty,r=Object.defineProperties,o=Object.getOwnPropertyDescriptors,n=Object.getOwnPropertySymbols,a=Object.prototype.hasOwnProperty,i=Object.prototype.propertyIsEnumerable,c=(e,r,o)=>r in e?t(e,r,{enumerable:!0,configurable:!0,writable:!0,value:o}):e[r]=o,s=(e,t)=>{for(var r in t||(t={}))a.call(t,r)&&c(e,r,t[r]);if(n)for(var r of n(t))i.call(t,r)&&c(e,r,t[r]);return e},p=(e,t)=>r(e,o(t));
/**
   * @license
   * Copyright 2017 Google LLC
   * SPDX-License-Identifier: BSD-3-Clause
   */
const l={attribute:!0,type:String,converter:e.defaultConverter,reflect:!1,hasChanged:e.notEqual},u=(e=l,t,r)=>{const{kind:o,metadata:n}=r;let a=globalThis.litPropertyMetadata.get(n);if(void 0===a&&globalThis.litPropertyMetadata.set(n,a=new Map),a.set(r.name,e),"accessor"===o){const{name:o}=r;return{set(r){const n=t.get.call(this);t.set.call(this,r),this.requestUpdate(o,n,e)},init(t){return void 0!==t&&this.P(o,void 0,e),t}}}if("setter"===o){const{name:o}=r;return function(r){const n=this[o];t.call(this,r),this.requestUpdate(o,n,e)}}throw Error("Unsupported decorator location: "+o)};function d(e){return(t,r)=>"object"==typeof r?u(e,t,r):((e,t,r)=>{const o=t.hasOwnProperty(r);return t.constructor.createProperty(r,o?p(s({},e),{wrapped:!0}):e),o?Object.getOwnPropertyDescriptor(t,r):void 0})(e,t,r)}},3877,[3873]);
__d(function(g,_r,_i,_a,m,_e,_d){"use strict";Object.defineProperty(_e,'__esModule',{value:!0}),Object.defineProperty(_e,"CSSResult",{enumerable:!0,get:function(){return o}}),Object.defineProperty(_e,"adoptStyles",{enumerable:!0,get:function(){return i}}),Object.defineProperty(_e,"css",{enumerable:!0,get:function(){return c}}),Object.defineProperty(_e,"getCompatibleStyle",{enumerable:!0,get:function(){return u}}),Object.defineProperty(_e,"supportsAdoptingStyleSheets",{enumerable:!0,get:function(){return t}}),Object.defineProperty(_e,"unsafeCSS",{enumerable:!0,get:function(){return r}});
/**
   * @license
   * Copyright 2019 Google LLC
   * SPDX-License-Identifier: BSD-3-Clause
   */
const e=globalThis,t=e.ShadowRoot&&(void 0===e.ShadyCSS||e.ShadyCSS.nativeShadow)&&"adoptedStyleSheets"in Document.prototype&&"replace"in CSSStyleSheet.prototype,n=Symbol(),s=new WeakMap;class o{constructor(e,t,s){if(this._$cssResult$=!0,s!==n)throw Error("CSSResult is not constructable. Use `unsafeCSS` or `css` instead.");this.cssText=e,this.t=t}get styleSheet(){let e=this.o;const n=this.t;if(t&&void 0===e){const t=void 0!==n&&1===n.length;t&&(e=s.get(n)),void 0===e&&((this.o=e=new CSSStyleSheet).replaceSync(this.cssText),t&&s.set(n,e))}return e}toString(){return this.cssText}}const r=e=>new o("string"==typeof e?e:e+"",void 0,n),c=(e,...t)=>{const s=1===e.length?e[0]:t.reduce((t,n,s)=>t+(e=>{if(!0===e._$cssResult$)return e.cssText;if("number"==typeof e)return e;throw Error("Value passed to 'css' function must be a 'css' function result: "+e+". Use 'unsafeCSS' to pass non-literal values, but take care to ensure page security.")})(n)+e[s+1],e[0]);return new o(s,e,n)},i=(n,s)=>{if(t)n.adoptedStyleSheets=s.map(e=>e instanceof CSSStyleSheet?e:e.styleSheet);else for(const t of s){const s=document.createElement("style"),o=e.litNonce;void 0!==o&&s.setAttribute("nonce",o),s.textContent=t.cssText,n.appendChild(s)}},u=t?e=>e:e=>e instanceof CSSStyleSheet?(e=>{let t="";for(const n of e.cssRules)t+=n.cssText;return r(t)})(e):e},3878,[]);
__d(function(g,r,i,a,m,e,d){"use strict";Object.defineProperty(e,'__esModule',{value:!0});var t=r(d[0]);Object.keys(t).forEach(function(n){'default'===n||Object.prototype.hasOwnProperty.call(e,n)||Object.defineProperty(e,n,{enumerable:!0,get:function(){return t[n]}})});var n=r(d[1]);Object.keys(n).forEach(function(t){'default'===t||Object.prototype.hasOwnProperty.call(e,t)||Object.defineProperty(e,t,{enumerable:!0,get:function(){return n[t]}})})},4217,[4218,4219]);
__d(function(g,r,i,a,m,e,d){"use strict";Object.defineProperty(e,'__esModule',{value:!0}),Object.defineProperty(e,"ReownAuthentication",{enumerable:!0,get:function(){return l}});var t=r(d[0]),s=r(d[1]),o=r(d[2]),n=r(d[3]),c=r(d[4]),h=r(d[5]);class l{constructor(s={}){this.otpUuid=null,this.listeners={sessionChanged:[]},this.localAuthStorageKey=s.localAuthStorageKey||t.SafeLocalStorageKeys.SIWX_AUTH_TOKEN,this.localNonceStorageKey=s.localNonceStorageKey||t.SafeLocalStorageKeys.SIWX_NONCE_TOKEN,this.required=s.required??!0,this.messenger=new h.ReownAuthenticationMessenger({getNonce:this.getNonce.bind(this)})}async createMessage(t){return this.messenger.createMessage(t)}async addSession(t){const s=await this.request({method:'POST',key:'authenticate',body:{data:t.data,message:t.message,signature:t.signature,clientId:this.getClientId(),walletInfo:this.getWalletInfo()},headers:['nonce','otp']});this.setStorageToken(s.token,this.localAuthStorageKey),this.emit('sessionChanged',t),this.setAppKitAccountUser(u(s.token)),this.otpUuid=null}async getSessions(t,s){try{if(!this.getStorageToken(this.localAuthStorageKey))return[];const o=await this.request({method:'GET',key:'me',query:{},headers:['auth']});if(!o)return[];const n=o.address.toLowerCase()===s.toLowerCase(),c=o.caip2Network===t;if(!n||!c)return[];const h={data:{accountAddress:o.address,chainId:o.caip2Network},message:'',signature:''};return this.emit('sessionChanged',h),this.setAppKitAccountUser(o),[h]}catch{return[]}}async revokeSession(t,s){return Promise.resolve(this.clearStorageTokens())}async setSessions(t){if(0===t.length)this.clearStorageTokens();else{const s=t.find(t=>t.data.chainId===(0,c.getActiveCaipNetwork)()?.caipNetworkId)||t[0];await this.addSession(s)}}getRequired(){return this.required}async getSessionAccount(){if(!this.getStorageToken(this.localAuthStorageKey))throw new Error('Not authenticated');return this.request({method:'GET',key:'me',body:void 0,query:{includeAppKitAccount:!0},headers:['auth']})}async setSessionAccountMetadata(t=null){if(!this.getStorageToken(this.localAuthStorageKey))throw new Error('Not authenticated');return this.request({method:'PUT',key:'account-metadata',body:{metadata:t},headers:['auth']})}on(t,s){return this.listeners[t].push(s),()=>{this.listeners[t]=this.listeners[t].filter(t=>t!==s)}}removeAllListeners(){Object.keys(this.listeners).forEach(t=>{this.listeners[t]=[]})}async requestEmailOtp({email:t,account:s}){const o=await this.request({method:'POST',key:'otp',body:{email:t,account:s}});return this.otpUuid=o.uuid,this.messenger.resources=[`email:${t}`],o}confirmEmailOtp({code:t}){return this.request({method:'PUT',key:'otp',body:{code:t},headers:['otp']})}async request({method:s,key:o,query:n,body:c,headers:h}){const{projectId:l,st:u,sv:y}=this.getSDKProperties(),S=new URL(`${t.ConstantsUtil.W3M_API_URL}/auth/v1/${String(o)}`);S.searchParams.set('projectId',l),S.searchParams.set('st',u),S.searchParams.set('sv',y),n&&Object.entries(n).forEach(([t,s])=>S.searchParams.set(t,String(s)));const p=await fetch(S,{method:s,body:c?JSON.stringify(c):void 0,headers:Array.isArray(h)?h.reduce((t,s)=>{switch(s){case'nonce':t['x-nonce-jwt']=`Bearer ${this.getStorageToken(this.localNonceStorageKey)}`;break;case'auth':t.Authorization=`Bearer ${this.getStorageToken(this.localAuthStorageKey)}`;break;case'otp':this.otpUuid&&(t['x-otp']=this.otpUuid)}return t},{}):void 0});if(!p.ok)throw new Error(await p.text());return p.headers.get('content-type')?.includes('application/json')?p.json():null}getStorageToken(s){return t.SafeLocalStorage.getItem(s)}setStorageToken(s,o){t.SafeLocalStorage.setItem(o,s)}clearStorageTokens(){this.otpUuid=null,t.SafeLocalStorage.removeItem(this.localAuthStorageKey),t.SafeLocalStorage.removeItem(this.localNonceStorageKey),this.emit('sessionChanged',void 0)}async getNonce(){const{nonce:t,token:s}=await this.request({method:'GET',key:'nonce'});return this.setStorageToken(s,this.localNonceStorageKey),t}getClientId(){return o.BlockchainApiController.state.clientId}getWalletInfo(){const t=n.ChainController.getAccountData()?.connectedWalletInfo;if(!t)return;if('social'in t&&'identifier'in t){return{type:'social',social:t.social,identifier:t.identifier}}const{name:s,icon:o}=t;let c='unknown';switch(t.type){case'EXTERNAL':case'INJECTED':case'ANNOUNCED':c='extension';break;case'WALLET_CONNECT':c='walletconnect';break;default:c='unknown'}return{type:c,name:s,icon:o}}getSDKProperties(){return s.ApiController._getSdkProperties()}emit(t,s){this.listeners[t].forEach(t=>t(s))}setAppKitAccountUser(s){const{email:o}=s;o&&Object.values(t.ConstantsUtil.CHAIN).forEach(t=>{n.ChainController.setAccountProp('user',{email:o},t)})}}function u(t){const s=t.split('.');if(3!==s.length)throw new Error('Invalid token');const o=s[1];if('string'!=typeof o)throw new Error('Invalid token');const n=o.replace(/-/gu,'+').replace(/_/gu,'/'),c=n.padEnd(n.length+(4-n.length%4)%4,'=');return JSON.parse(atob(c))}},4218,[2169,2225,2214,2197,2220,4219]);
__d(function(g,r,i,a,m,e,d){"use strict";Object.defineProperty(e,'__esModule',{value:!0}),Object.defineProperty(e,"ReownAuthenticationMessenger",{enumerable:!0,get:function(){return o}});var t=r(d[0]),n=r(d[1]);class o{constructor(t){this.getNonce=t.getNonce}async createMessage(t){const n={accountAddress:t.accountAddress,chainId:t.chainId,version:'1',domain:'undefined'==typeof document?'Unknown Domain':document.location.host,uri:'undefined'==typeof document?'Unknown URI':document.location.href,resources:this.resources,nonce:await this.getNonce(t),issuedAt:this.stringifyDate(new Date),statement:void 0,expirationTime:void 0,notBefore:void 0},o={toString:()=>this.stringify(n)};return Object.assign(n,o)}stringify(t){const n=this.getNetworkName(t.chainId);return[`${t.domain} wants you to sign in with your ${n} account:`,t.accountAddress,t.statement?`\n${t.statement}\n`:'',`URI: ${t.uri}`,`Version: ${t.version}`,`Chain ID: ${t.chainId}`,`Nonce: ${t.nonce}`,t.issuedAt&&`Issued At: ${t.issuedAt}`,t.expirationTime&&`Expiration Time: ${t.expirationTime}`,t.notBefore&&`Not Before: ${t.notBefore}`,t.requestId&&`Request ID: ${t.requestId}`,t.resources?.length&&t.resources.reduce((t,n)=>`${t}\n- ${n}`,'Resources:')].filter(t=>'string'==typeof t).join('\n').trim()}getNetworkName(o){const s=n.ChainController.getAllRequestedCaipNetworks();return t.NetworkUtil.getNetworkNameByCaipNetworkId(s,o)}stringifyDate(t){return t.toISOString()}}},4219,[2169,2197]);
__d(function(g,r,i,a,m,e,d){"use strict";Object.defineProperty(e,'__esModule',{value:!0});var t=r(d[0]);Object.keys(t).forEach(function(n){'default'===n||Object.prototype.hasOwnProperty.call(e,n)||Object.defineProperty(e,n,{enumerable:!0,get:function(){return t[n]}})})},4220,[4221]);
__d(function(g,_r,_i,a,m,_e,_d){"use strict";Object.defineProperty(_e,'__esModule',{value:!0}),Object.defineProperty(_e,"WuiOtp",{enumerable:!0,get:function(){return h}});var t=_r(_d[0]),e=_r(_d[1]);_r(_d[2]);var s=_r(_d[3]),i=_r(_d[4]),n=_r(_d[5]);_r(_d[6]);var u,l=_r(_d[7]),r=(u=l)&&u.__esModule?u:{default:u},o=this&&this.__decorate||function(t,e,s,i){var n,u=arguments.length,l=u<3?e:null===i?i=Object.getOwnPropertyDescriptor(e,s):i;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)l=Reflect.decorate(t,e,s,i);else for(var r=t.length-1;r>=0;r--)(n=t[r])&&(l=(u<3?n(l):u>3?n(e,s,l):n(e,s))||l);return u>3&&l&&Object.defineProperty(e,s,l),l};let h=class extends t.LitElement{constructor(){super(...arguments),this.length=6,this.otp='',this.values=Array.from({length:this.length}).map(()=>''),this.numerics=[],this.shouldInputBeEnabled=t=>this.values.slice(0,t).every(t=>''!==t),this.handleKeyDown=(t,e)=>{const s=t.target,i=this.getInputElement(s);if(!i)return;['ArrowLeft','ArrowRight','Shift','Delete'].includes(t.key)&&t.preventDefault();const n=i.selectionStart;switch(t.key){case'ArrowLeft':n&&i.setSelectionRange(n+1,n+1),this.focusInputField('prev',e);break;case'ArrowRight':case'Shift':this.focusInputField('next',e);break;case'Delete':case'Backspace':''===i.value?this.focusInputField('prev',e):this.updateInput(i,e,'')}},this.focusInputField=(t,e)=>{if('next'===t){const t=e+1;if(!this.shouldInputBeEnabled(t))return;const s=this.numerics[t<this.length?t:e],i=s?this.getInputElement(s):void 0;i&&(i.disabled=!1,i.focus())}if('prev'===t){const t=e-1,s=this.numerics[t>-1?t:e],i=s?this.getInputElement(s):void 0;i&&i.focus()}}}firstUpdated(){this.otp&&(this.values=this.otp.split(''));const t=this.shadowRoot?.querySelectorAll('wui-input-numeric');t&&(this.numerics=Array.from(t)),this.numerics[0]?.focus()}render(){return t.html`
      <wui-flex gap="1" data-testid="wui-otp-input">
        ${Array.from({length:this.length}).map((e,s)=>t.html`
            <wui-input-numeric
              @input=${t=>this.handleInput(t,s)}
              @click=${t=>this.selectInput(t)}
              @keydown=${t=>this.handleKeyDown(t,s)}
              .disabled=${!this.shouldInputBeEnabled(s)}
              .value=${this.values[s]||''}
            >
            </wui-input-numeric>
          `)}
      </wui-flex>
    `}updateInput(t,e,s){const i=this.numerics[e],n=t||(i?this.getInputElement(i):void 0);n&&(n.value=s,this.values=this.values.map((t,i)=>i===e?s:t))}selectInput(t){const e=t.target;if(e){const t=this.getInputElement(e);t?.select()}}handleInput(t,e){const s=t.target,n=this.getInputElement(s);if(n){const s=n.value;if('insertFromPaste'===t.inputType)this.handlePaste(n,s,e);else{i.UiHelperUtil.isNumber(s)&&t.data?(this.updateInput(n,e,t.data),this.focusInputField('next',e)):this.updateInput(n,e,'')}}this.dispatchInputChangeEvent()}handlePaste(t,e,s){const n=e[0];if(n&&i.UiHelperUtil.isNumber(n)){this.updateInput(t,s,n);const i=e.substring(1);if(s+1<this.length&&i.length){const t=this.numerics[s+1],e=t?this.getInputElement(t):void 0;e&&this.handlePaste(e,i,s+1)}else this.focusInputField('next',s)}else this.updateInput(t,s,'')}getInputElement(t){return t.shadowRoot?.querySelector('input')?t.shadowRoot.querySelector('input'):null}dispatchInputChangeEvent(){const t=this.values.join('');this.dispatchEvent(new CustomEvent('inputChange',{detail:t,bubbles:!0,composed:!0}))}};h.styles=[s.resetStyles,r.default],o([(0,e.property)({type:Number})],h.prototype,"length",void 0),o([(0,e.property)({type:String})],h.prototype,"otp",void 0),o([(0,e.state)()],h.prototype,"values",void 0),h=o([(0,n.customElement)('wui-otp')],h)},4221,[2549,2575,2629,2548,2557,2559,4222,4224]);
__d(function(g,_r,_i,a,m,_e,_d){"use strict";Object.defineProperty(_e,'__esModule',{value:!0}),Object.defineProperty(_e,"WuiInputNumeric",{enumerable:!0,get:function(){return s}});var e,t=_r(_d[0]),r=_r(_d[1]),n=_r(_d[2]),o=_r(_d[3]),u=_r(_d[4]),l=(e=u)&&e.__esModule?e:{default:e},i=this&&this.__decorate||function(e,t,r,n){var o,u=arguments.length,l=u<3?t:null===n?n=Object.getOwnPropertyDescriptor(t,r):n;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)l=Reflect.decorate(e,t,r,n);else for(var i=e.length-1;i>=0;i--)(o=e[i])&&(l=(u<3?o(l):u>3?o(t,r,l):o(t,r))||l);return u>3&&l&&Object.defineProperty(t,r,l),l};let s=class extends t.LitElement{constructor(){super(...arguments),this.disabled=!1,this.value=''}render(){return t.html`<input
      type="number"
      maxlength="1"
      inputmode="numeric"
      autofocus
      ?disabled=${this.disabled}
      value=${this.value}
    /> `}};s.styles=[n.resetStyles,n.elementStyles,l.default],i([(0,r.property)({type:Boolean})],s.prototype,"disabled",void 0),i([(0,r.property)({type:String})],s.prototype,"value",void 0),s=i([(0,o.customElement)('wui-input-numeric')],s)},4222,[2549,2575,2548,2559,4223]);
__d(function(g,r,i,a,m,e,d){"use strict";Object.defineProperty(e,'__esModule',{value:!0}),Object.defineProperty(e,"default",{enumerable:!0,get:function(){return o}});var o=r(d[0]).css`
  :host {
    position: relative;
    display: inline-block;
  }

  input {
    width: 48px;
    height: 48px;
    background: ${({tokens:o})=>o.theme.foregroundPrimary};
    border-radius: ${({borderRadius:o})=>o[4]};
    border: 1px solid ${({tokens:o})=>o.theme.borderPrimary};
    font-family: ${({fontFamily:o})=>o.regular};
    font-size: ${({textSize:o})=>o.large};
    line-height: 18px;
    letter-spacing: -0.16px;
    text-align: center;
    color: ${({tokens:o})=>o.theme.textPrimary};
    caret-color: ${({tokens:o})=>o.core.textAccentPrimary};
    transition:
      background-color ${({durations:o})=>o.lg}
        ${({easings:o})=>o['ease-out-power-2']},
      border-color ${({durations:o})=>o.lg}
        ${({easings:o})=>o['ease-out-power-2']},
      box-shadow ${({durations:o})=>o.lg}
        ${({easings:o})=>o['ease-out-power-2']};
    will-change: background-color, border-color, box-shadow;
    box-sizing: border-box;
    -webkit-appearance: none;
    -moz-appearance: textfield;
    padding: ${({spacing:o})=>o[4]};
  }

  input::-webkit-outer-spin-button,
  input::-webkit-inner-spin-button {
    -webkit-appearance: none;
    margin: 0;
  }

  input[type='number'] {
    -moz-appearance: textfield;
  }

  input:disabled {
    cursor: not-allowed;
    opacity: 0.5;
  }

  input:focus-visible:enabled {
    background-color: transparent;
    border: 1px solid ${({tokens:o})=>o.theme.borderSecondary};
    box-shadow: 0px 0px 0px 4px ${({tokens:o})=>o.core.foregroundAccent040};
  }
`},4223,[2555]);
__d(function(g,r,i,a,m,e,d){"use strict";Object.defineProperty(e,'__esModule',{value:!0}),Object.defineProperty(e,"default",{enumerable:!0,get:function(){return t}});var t=r(d[0]).css`
  :host {
    position: relative;
    display: block;
  }
`},4224,[2549]);
__d(function(g,r,i,a,m,e,d){"use strict";Object.defineProperty(e,'__esModule',{value:!0}),Object.defineProperty(e,"default",{enumerable:!0,get:function(){return t}});var t=r(d[0]).css`
  wui-loading-spinner {
    margin: 9px auto;
  }

  .email-display,
  .email-display wui-text {
    max-width: 100%;
  }
`},4225,[2549]);
__d(function(g,_r,_i,a,m,_e,_d){"use strict";Object.defineProperty(_e,'__esModule',{value:!0}),Object.defineProperty(_e,"WuiTokenButton",{enumerable:!0,get:function(){return p}});var e=_r(_d[0]),t=_r(_d[1]);_r(_d[2]),_r(_d[3]),_r(_d[4]),_r(_d[5]),_r(_d[6]);var i,r=_r(_d[7]),s=_r(_d[8]),o=_r(_d[9]),l=(i=o)&&i.__esModule?i:{default:i},n=this&&this.__decorate||function(e,t,i,r){var s,o=arguments.length,l=o<3?t:null===r?r=Object.getOwnPropertyDescriptor(t,i):r;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)l=Reflect.decorate(e,t,i,r);else for(var n=e.length-1;n>=0;n--)(s=e[n])&&(l=(o<3?s(l):o>3?s(t,i,l):s(t,i))||l);return o>3&&l&&Object.defineProperty(t,i,l),l};const c={lg:'lg-regular',md:'lg-regular',sm:'md-regular'},u={lg:'lg',md:'md',sm:'sm'};let p=class extends e.LitElement{constructor(){super(...arguments),this.size='md',this.disabled=!1,this.text='',this.loading=!1}render(){return this.loading?e.html` <wui-flex alignItems="center" gap="01" padding="01">
        <wui-shimmer width="20px" height="20px"></wui-shimmer>
        <wui-shimmer width="32px" height="18px" borderRadius="4xs"></wui-shimmer>
      </wui-flex>`:e.html`
      <button ?disabled=${this.disabled} data-size=${this.size}>
        ${this.imageTemplate()} ${this.textTemplate()}
      </button>
    `}imageTemplate(){if(this.imageSrc&&this.chainImageSrc)return e.html`<wui-flex class="left-image-container">
        <wui-image src=${this.imageSrc} class="token-image"></wui-image>
        <wui-image src=${this.chainImageSrc} class="chain-image"></wui-image>
      </wui-flex>`;if(this.imageSrc)return e.html`<wui-image src=${this.imageSrc} class="token-image"></wui-image>`;const t=u[this.size];return e.html`<wui-flex class="left-icon-container">
      <wui-icon size=${t} name="networkPlaceholder"></wui-icon>
    </wui-flex>`}textTemplate(){const t=c[this.size];return e.html`<wui-text color="primary" variant=${t}
      >${this.text}</wui-text
    >`}};p.styles=[r.resetStyles,r.elementStyles,l.default],n([(0,t.property)()],p.prototype,"size",void 0),n([(0,t.property)()],p.prototype,"imageSrc",void 0),n([(0,t.property)()],p.prototype,"chainImageSrc",void 0),n([(0,t.property)({type:Boolean})],p.prototype,"disabled",void 0),n([(0,t.property)()],p.prototype,"text",void 0),n([(0,t.property)({type:Boolean})],p.prototype,"loading",void 0),p=n([(0,s.customElement)('wui-token-button')],p)},4226,[2549,2575,2590,2620,2714,2624,2629,2548,2559,4227]);
__d(function(g,r,i,a,m,e,d){"use strict";Object.defineProperty(e,'__esModule',{value:!0}),Object.defineProperty(e,"default",{enumerable:!0,get:function(){return t}});var t=r(d[0]).css`
  button {
    display: block;
    display: flex;
    align-items: center;
    padding: ${({spacing:t})=>t[1]};
    transition: background-color ${({durations:t})=>t.lg}
      ${({easings:t})=>t['ease-out-power-2']};
    will-change: background-color;
    background-color: ${({tokens:t})=>t.theme.foregroundPrimary};
    border-radius: ${({borderRadius:t})=>t[32]};
  }

  wui-image {
    border-radius: ${({borderRadius:t})=>t[32]};
  }

  wui-text {
    padding-left: ${({spacing:t})=>t[1]};
    padding-right: ${({spacing:t})=>t[1]};
  }

  .left-icon-container {
    width: 24px;
    height: 24px;
    justify-content: center;
    align-items: center;
  }

  .left-image-container {
    position: relative;
    justify-content: center;
    align-items: center;
  }

  .chain-image {
    position: absolute;
    border: 1px solid ${({tokens:t})=>t.theme.foregroundPrimary};
  }

  /* -- Sizes --------------------------------------------------- */
  button[data-size='lg'] {
    height: 32px;
  }

  button[data-size='md'] {
    height: 28px;
  }

  button[data-size='sm'] {
    height: 24px;
  }

  button[data-size='lg'] .token-image {
    width: 24px;
    height: 24px;
  }

  button[data-size='md'] .token-image {
    width: 20px;
    height: 20px;
  }

  button[data-size='sm'] .token-image {
    width: 16px;
    height: 16px;
  }

  button[data-size='lg'] .left-icon-container {
    width: 24px;
    height: 24px;
  }

  button[data-size='md'] .left-icon-container {
    width: 20px;
    height: 20px;
  }

  button[data-size='sm'] .left-icon-container {
    width: 16px;
    height: 16px;
  }

  button[data-size='lg'] .chain-image {
    width: 12px;
    height: 12px;
    bottom: 2px;
    right: -4px;
  }

  button[data-size='md'] .chain-image {
    width: 10px;
    height: 10px;
    bottom: 2px;
    right: -4px;
  }

  button[data-size='sm'] .chain-image {
    width: 8px;
    height: 8px;
    bottom: 2px;
    right: -3px;
  }

  /* -- Focus states --------------------------------------------------- */
  button:focus-visible:enabled {
    background-color: ${({tokens:t})=>t.theme.foregroundSecondary};
    box-shadow: 0 0 0 4px ${({tokens:t})=>t.core.foregroundAccent040};
  }

  /* -- Hover & Active states ----------------------------------------------------------- */
  @media (hover: hover) {
    button:hover:enabled,
    button:active:enabled {
      background-color: ${({tokens:t})=>t.theme.foregroundSecondary};
    }
  }

  /* -- Disabled states --------------------------------------------------- */
  button:disabled {
    background-color: ${({tokens:t})=>t.theme.foregroundSecondary};
    opacity: 0.5;
  }
`},4227,[2555]);
__d(function(g,_r,_i,a,m,_e,_d){"use strict";Object.defineProperty(_e,'__esModule',{value:!0}),Object.defineProperty(_e,"WuiInputAmount",{enumerable:!0,get:function(){return d}});var t,e=_r(_d[0]),i=_r(_d[1]),r=_r(_d[2]),n=_r(_d[3]),s=_r(_d[4]),p=_r(_d[5]),o=_r(_d[6]),l=_r(_d[7]),u=(t=l)&&t.__esModule?t:{default:t},h=this&&this.__decorate||function(t,e,i,r){var n,s=arguments.length,p=s<3?e:null===r?r=Object.getOwnPropertyDescriptor(e,i):r;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)p=Reflect.decorate(t,e,i,r);else for(var o=t.length-1;o>=0;o--)(n=t[o])&&(p=(s<3?n(p):s>3?n(e,i,p):n(e,i))||p);return s>3&&p&&Object.defineProperty(e,i,p),p};let d=class extends e.LitElement{constructor(){super(...arguments),this.inputElementRef=(0,r.createRef)(),this.disabled=!1,this.value='',this.placeholder='0',this.widthVariant='auto',this.maxDecimals=void 0,this.maxIntegers=void 0,this.fontSize='h4',this.error=!1}firstUpdated(){this.resizeInput()}updated(){this.style.setProperty('--local-font-size',n.vars.textSize[this.fontSize]),this.resizeInput()}render(){return this.dataset.widthVariant=this.widthVariant,this.dataset.error=String(this.error),this.inputElementRef?.value&&this.value&&(this.inputElementRef.value.value=this.value),'auto'===this.widthVariant?this.inputTemplate():e.html`
      <div class="wui-input-amount-fit-width">
        <span class="wui-input-amount-fit-mirror"></span>
        ${this.inputTemplate()}
      </div>
    `}inputTemplate(){return e.html`<input
      ${(0,r.ref)(this.inputElementRef)}
      type="text"
      inputmode="decimal"
      pattern="[0-9,.]*"
      placeholder=${this.placeholder}
      ?disabled=${this.disabled}
      autofocus
      value=${this.value??''}
      @input=${this.dispatchInputChangeEvent.bind(this)}
    />`}dispatchInputChangeEvent(){this.inputElementRef.value&&(this.inputElementRef.value.value=p.UiHelperUtil.maskInput({value:this.inputElementRef.value.value,decimals:this.maxDecimals,integers:this.maxIntegers}),this.dispatchEvent(new CustomEvent('inputChange',{detail:this.inputElementRef.value.value,bubbles:!0,composed:!0})),this.resizeInput())}resizeInput(){if('fit'===this.widthVariant){const t=this.inputElementRef.value;if(t){const e=t.previousElementSibling;e&&(e.textContent=t.value||'0',t.style.width=`${e.offsetWidth}px`)}}}};d.styles=[s.resetStyles,s.elementStyles,u.default],h([(0,i.property)({type:Boolean})],d.prototype,"disabled",void 0),h([(0,i.property)({type:String})],d.prototype,"value",void 0),h([(0,i.property)({type:String})],d.prototype,"placeholder",void 0),h([(0,i.property)({type:String})],d.prototype,"widthVariant",void 0),h([(0,i.property)({type:Number})],d.prototype,"maxDecimals",void 0),h([(0,i.property)({type:Number})],d.prototype,"maxIntegers",void 0),h([(0,i.property)({type:String})],d.prototype,"fontSize",void 0),h([(0,i.property)({type:Boolean})],d.prototype,"error",void 0),d=h([(0,o.customElement)('wui-input-amount')],d)},4228,[2549,2575,2753,2555,2548,2557,2559,4229]);
__d(function(g,r,i,a,m,e,d){"use strict";Object.defineProperty(e,'__esModule',{value:!0}),Object.defineProperty(e,"default",{enumerable:!0,get:function(){return t}});var t=r(d[0]).css`
  :host {
    position: relative;
    display: inline-block;
  }

  :host([data-error='true']) > input {
    color: ${({tokens:t})=>t.core.textError};
  }

  :host([data-error='false']) > input {
    color: ${({tokens:t})=>t.theme.textPrimary};
  }

  input {
    background: transparent;
    height: auto;
    box-sizing: border-box;
    color: ${({tokens:t})=>t.theme.textPrimary};
    font-feature-settings: 'case' on;
    font-size: ${({textSize:t})=>t.h4};
    caret-color: ${({tokens:t})=>t.core.backgroundAccentPrimary};
    line-height: ${({typography:t})=>t['h4-regular-mono'].lineHeight};
    letter-spacing: ${({typography:t})=>t['h4-regular-mono'].letterSpacing};
    -webkit-appearance: none;
    -moz-appearance: textfield;
    padding: 0px;
    font-family: ${({fontFamily:t})=>t.mono};
  }

  :host([data-width-variant='auto']) input {
    width: 100%;
  }

  :host([data-width-variant='fit']) input {
    width: 1ch;
  }

  .wui-input-amount-fit-mirror {
    position: absolute;
    visibility: hidden;
    white-space: pre;
    font-size: var(--local-font-size);
    line-height: 130%;
    letter-spacing: -1.28px;
    font-family: ${({fontFamily:t})=>t.mono};
  }

  .wui-input-amount-fit-width {
    display: inline-block;
    position: relative;
  }

  input::-webkit-outer-spin-button,
  input::-webkit-inner-spin-button {
    -webkit-appearance: none;
    margin: 0;
  }

  input::placeholder {
    color: ${({tokens:t})=>t.theme.textSecondary};
  }
`},4229,[2555]);
__d(function(g,_r,_i,a,m,_e,_d){"use strict";Object.defineProperty(_e,'__esModule',{value:!0}),Object.defineProperty(_e,"W3mPayView",{enumerable:!0,get:function(){return h}});var e=_r(_d[0]),t=_r(_d[1]),i=_r(_d[2]);_r(_d[3]);var n=_r(_d[4]),o=_r(_d[5]);_r(_d[6]),_r(_d[7]),_r(_d[8]),_r(_d[9]),_r(_d[10]),_r(_d[11]),_r(_d[12]),_r(_d[13]),_r(_d[14]),_r(_d[15]),_r(_d[16]),_r(_d[17]);var r,s=_r(_d[18]),l=_r(_d[19]),c=_r(_d[20]),u=_r(_d[21]),d=(r=u)&&r.__esModule?r:{default:r},p=this&&this.__decorate||function(e,t,i,n){var o,r=arguments.length,s=r<3?t:null===n?n=Object.getOwnPropertyDescriptor(t,i):n;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)s=Reflect.decorate(e,t,i,n);else for(var l=e.length-1;l>=0;l--)(o=e[l])&&(s=(r<3?o(s):r>3?o(t,i,s):o(t,i))||s);return r>3&&s&&Object.defineProperty(t,i,s),s};let h=class extends e.LitElement{constructor(){super(),this.unsubscribe=[],this.amount=s.PayController.state.amount,this.namespace=void 0,this.paymentAsset=s.PayController.state.paymentAsset,this.activeConnectorIds=n.ConnectorController.state.activeConnectorIds,this.caipAddress=void 0,this.exchanges=s.PayController.state.exchanges,this.isLoading=s.PayController.state.isLoading,this.initializeNamespace(),this.unsubscribe.push(s.PayController.subscribeKey('amount',e=>this.amount=e)),this.unsubscribe.push(n.ConnectorController.subscribeKey('activeConnectorIds',e=>this.activeConnectorIds=e)),this.unsubscribe.push(s.PayController.subscribeKey('exchanges',e=>this.exchanges=e)),this.unsubscribe.push(s.PayController.subscribeKey('isLoading',e=>this.isLoading=e)),s.PayController.fetchExchanges(),s.PayController.setSelectedExchange(void 0)}disconnectedCallback(){this.unsubscribe.forEach(e=>e())}render(){return e.html`
      <wui-flex flexDirection="column">
        ${this.paymentDetailsTemplate()} ${this.paymentMethodsTemplate()}
      </wui-flex>
    `}paymentMethodsTemplate(){return e.html`
      <wui-flex flexDirection="column" padding="3" gap="2" class="payment-methods-container">
        ${this.payWithWalletTemplate()} ${this.templateSeparator()}
        ${this.templateExchangeOptions()}
      </wui-flex>
    `}initializeNamespace(){const e=n.ChainController.state.activeChain;this.namespace=e,this.caipAddress=n.ChainController.getAccountData(e)?.caipAddress,this.unsubscribe.push(n.ChainController.subscribeChainProp('accountState',e=>{this.caipAddress=e?.caipAddress},e))}paymentDetailsTemplate(){const t=n.ChainController.getAllRequestedCaipNetworks().find(e=>e.caipNetworkId===this.paymentAsset.network);return e.html`
      <wui-flex
        alignItems="center"
        justifyContent="space-between"
        .padding=${['6','8','6','8']}
        gap="2"
      >
        <wui-flex alignItems="center" gap="1">
          <wui-text variant="h1-regular" color="primary">
            ${(0,l.formatAmount)(this.amount||'0')}
          </wui-text>

          <wui-flex flexDirection="column">
            <wui-text variant="h6-regular" color="secondary">
              ${this.paymentAsset.metadata.symbol||'Unknown'}
            </wui-text>
            <wui-text variant="md-medium" color="secondary"
              >on ${t?.name||'Unknown'}</wui-text
            >
          </wui-flex>
        </wui-flex>

        <wui-flex class="left-image-container">
          <wui-image
            src=${(0,i.ifDefined)(this.paymentAsset.metadata.logoURI)}
            class="token-image"
          ></wui-image>
          <wui-image
            src=${(0,i.ifDefined)(n.AssetUtil.getNetworkImage(t))}
            class="chain-image"
          ></wui-image>
        </wui-flex>
      </wui-flex>
    `}payWithWalletTemplate(){return(0,l.isPayWithWalletSupported)(this.paymentAsset.network)?this.caipAddress?this.connectedWalletTemplate():this.disconnectedWalletTemplate():e.html``}connectedWalletTemplate(){const{name:t,image:n}=this.getWalletProperties({namespace:this.namespace});return e.html`
      <wui-flex flexDirection="column" gap="3">
        <wui-list-item
          type="secondary"
          boxColor="foregroundSecondary"
          @click=${this.onWalletPayment}
          .boxed=${!1}
          ?chevron=${!0}
          ?fullSize=${!1}
          ?rounded=${!0}
          data-testid="wallet-payment-option"
          imageSrc=${(0,i.ifDefined)(n)}
          imageSize="3xl"
        >
          <wui-text variant="lg-regular" color="primary">Pay with ${t}</wui-text>
        </wui-list-item>

        <wui-list-item
          type="secondary"
          icon="power"
          iconColor="error"
          @click=${this.onDisconnect}
          data-testid="disconnect-button"
          ?chevron=${!1}
          boxColor="foregroundSecondary"
        >
          <wui-text variant="lg-regular" color="secondary">Disconnect</wui-text>
        </wui-list-item>
      </wui-flex>
    `}disconnectedWalletTemplate(){return e.html`<wui-list-item
      type="secondary"
      boxColor="foregroundSecondary"
      variant="icon"
      iconColor="default"
      iconVariant="overlay"
      icon="wallet"
      @click=${this.onWalletPayment}
      ?chevron=${!0}
      data-testid="wallet-payment-option"
    >
      <wui-text variant="lg-regular" color="primary">Pay with wallet</wui-text>
    </wui-list-item>`}templateExchangeOptions(){if(this.isLoading)return e.html`<wui-flex justifyContent="center" alignItems="center">
        <wui-loading-spinner size="md"></wui-loading-spinner>
      </wui-flex>`;const t=this.exchanges.filter(e=>(0,l.isTestnetAsset)(this.paymentAsset)?e.id===c.REOWN_TEST_EXCHANGE_ID:e.id!==c.REOWN_TEST_EXCHANGE_ID);return 0===t.length?e.html`<wui-flex justifyContent="center" alignItems="center">
        <wui-text variant="md-medium" color="primary">No exchanges available</wui-text>
      </wui-flex>`:t.map(t=>e.html`
        <wui-list-item
          type="secondary"
          boxColor="foregroundSecondary"
          @click=${()=>this.onExchangePayment(t)}
          data-testid="exchange-option-${t.id}"
          ?chevron=${!0}
          imageSrc=${(0,i.ifDefined)(t.imageUrl)}
        >
          <wui-text flexGrow="1" variant="lg-regular" color="primary">
            Pay with ${t.name}
          </wui-text>
        </wui-list-item>
      `)}templateSeparator(){return e.html`<wui-separator text="or" bgColor="secondary"></wui-separator>`}async onWalletPayment(){if(!this.namespace)throw new Error('Namespace not found');this.caipAddress?n.RouterController.push('PayQuote'):(await n.ConnectorController.connect(),await n.ModalController.open({view:'PayQuote'}))}onExchangePayment(e){s.PayController.setSelectedExchange(e),n.RouterController.push('PayQuote')}async onDisconnect(){try{await n.ConnectionController.disconnect(),await n.ModalController.open({view:'Pay'})}catch{console.error('Failed to disconnect'),n.SnackController.showError('Failed to disconnect')}}getWalletProperties({namespace:e}){if(!e)return{name:void 0,image:void 0};const t=this.activeConnectorIds[e];if(!t)return{name:void 0,image:void 0};const i=n.ConnectorController.getConnector({id:t,namespace:e});if(!i)return{name:void 0,image:void 0};const o=n.AssetUtil.getConnectorImage(i);return{name:i.name,image:o}}};h.styles=d.default,p([(0,t.state)()],h.prototype,"amount",void 0),p([(0,t.state)()],h.prototype,"namespace",void 0),p([(0,t.state)()],h.prototype,"paymentAsset",void 0),p([(0,t.state)()],h.prototype,"activeConnectorIds",void 0),p([(0,t.state)()],h.prototype,"caipAddress",void 0),p([(0,t.state)()],h.prototype,"exchanges",void 0),p([(0,t.state)()],h.prototype,"isLoading",void 0),h=p([(0,o.customElement)('w3m-pay-view')],h)},4230,[2549,2575,2586,2169,2164,2546,2683,2650,2658,3872,2669,3826,2672,2778,2907,2743,2651,2774,4233,4238,4236,4239]);
__d(function(g,_r,_i,a,m,_e,_d){"use strict";Object.defineProperty(_e,'__esModule',{value:!0}),Object.defineProperty(_e,"WuiIconButton",{enumerable:!0,get:function(){return l}});var t=_r(_d[0]),e=_r(_d[1]),i=_r(_d[2]);_r(_d[3]);var o,r=_r(_d[4]),n=_r(_d[5]),p=_r(_d[6]),s=(o=p)&&o.__esModule?o:{default:o},d=this&&this.__decorate||function(t,e,i,o){var r,n=arguments.length,p=n<3?e:null===o?o=Object.getOwnPropertyDescriptor(e,i):o;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)p=Reflect.decorate(t,e,i,o);else for(var s=t.length-1;s>=0;s--)(r=t[s])&&(p=(n<3?r(p):n>3?r(e,i,p):r(e,i))||p);return n>3&&p&&Object.defineProperty(e,i,p),p};let l=class extends t.LitElement{constructor(){super(...arguments),this.icon='card',this.variant='primary',this.type='accent',this.size='md',this.iconSize=void 0,this.fullWidth=!1,this.disabled=!1}render(){return t.html`<button
      data-variant=${this.variant}
      data-type=${this.type}
      data-size=${this.size}
      data-full-width=${this.fullWidth}
      ?disabled=${this.disabled}
    >
      <wui-icon color="inherit" name=${this.icon} size=${(0,i.ifDefined)(this.iconSize)}></wui-icon>
    </button>`}};l.styles=[r.resetStyles,r.elementStyles,s.default],d([(0,e.property)()],l.prototype,"icon",void 0),d([(0,e.property)()],l.prototype,"variant",void 0),d([(0,e.property)()],l.prototype,"type",void 0),d([(0,e.property)()],l.prototype,"size",void 0),d([(0,e.property)()],l.prototype,"iconSize",void 0),d([(0,e.property)({type:Boolean})],l.prototype,"fullWidth",void 0),d([(0,e.property)({type:Boolean})],l.prototype,"disabled",void 0),l=d([(0,n.customElement)('wui-icon-button')],l)},4231,[2549,2575,2586,2590,2548,2559,4232]);
__d(function(g,r,i,a,m,e,d){"use strict";Object.defineProperty(e,'__esModule',{value:!0}),Object.defineProperty(e,"default",{enumerable:!0,get:function(){return t}});var t=r(d[0]).css`
  :host {
    position: relative;
  }

  button {
    display: flex;
    justify-content: center;
    align-items: center;
    background-color: transparent;
    padding: ${({spacing:t})=>t[1]};
  }

  /* -- Colors --------------------------------------------------- */
  button[data-type='accent'] wui-icon {
    color: ${({tokens:t})=>t.core.iconAccentPrimary};
  }

  button[data-type='neutral'][data-variant='primary'] wui-icon {
    color: ${({tokens:t})=>t.theme.iconInverse};
  }

  button[data-type='neutral'][data-variant='secondary'] wui-icon {
    color: ${({tokens:t})=>t.theme.iconDefault};
  }

  button[data-type='success'] wui-icon {
    color: ${({tokens:t})=>t.core.iconSuccess};
  }

  button[data-type='error'] wui-icon {
    color: ${({tokens:t})=>t.core.iconError};
  }

  /* -- Sizes --------------------------------------------------- */
  button[data-size='xs'] {
    width: 16px;
    height: 16px;

    border-radius: ${({borderRadius:t})=>t[1]};
  }

  button[data-size='sm'] {
    width: 20px;
    height: 20px;
    border-radius: ${({borderRadius:t})=>t[1]};
  }

  button[data-size='md'] {
    width: 24px;
    height: 24px;
    border-radius: ${({borderRadius:t})=>t[2]};
  }

  button[data-size='lg'] {
    width: 28px;
    height: 28px;
    border-radius: ${({borderRadius:t})=>t[2]};
  }

  button[data-size='xs'] wui-icon {
    width: 8px;
    height: 8px;
  }

  button[data-size='sm'] wui-icon {
    width: 12px;
    height: 12px;
  }

  button[data-size='md'] wui-icon {
    width: 16px;
    height: 16px;
  }

  button[data-size='lg'] wui-icon {
    width: 20px;
    height: 20px;
  }

  /* -- Hover --------------------------------------------------- */
  @media (hover: hover) {
    button[data-type='accent']:hover:enabled {
      background-color: ${({tokens:t})=>t.core.foregroundAccent010};
    }

    button[data-variant='primary'][data-type='neutral']:hover:enabled {
      background-color: ${({tokens:t})=>t.theme.foregroundSecondary};
    }

    button[data-variant='secondary'][data-type='neutral']:hover:enabled {
      background-color: ${({tokens:t})=>t.theme.foregroundSecondary};
    }

    button[data-type='success']:hover:enabled {
      background-color: ${({tokens:t})=>t.core.backgroundSuccess};
    }

    button[data-type='error']:hover:enabled {
      background-color: ${({tokens:t})=>t.core.backgroundError};
    }
  }

  /* -- Focus --------------------------------------------------- */
  button:focus-visible {
    box-shadow: 0 0 0 4px ${({tokens:t})=>t.core.foregroundAccent020};
  }

  /* -- Properties --------------------------------------------------- */
  button[data-full-width='true'] {
    width: 100%;
  }

  :host([fullWidth]) {
    width: 100%;
  }

  button[disabled] {
    opacity: 0.5;
    cursor: not-allowed;
  }
`},4232,[2555]);
__d(function(g,r,i,a,m,e,d){"use strict";Object.defineProperty(e,'__esModule',{value:!0}),Object.defineProperty(e,"DIRECT_TRANSFER_REQUEST_ID",{enumerable:!0,get:function(){return P}}),Object.defineProperty(e,"DIRECT_TRANSFER_DEPOSIT_TYPE",{enumerable:!0,get:function(){return h}}),Object.defineProperty(e,"DIRECT_TRANSFER_TRANSACTION_TYPE",{enumerable:!0,get:function(){return w}}),Object.defineProperty(e,"PayController",{enumerable:!0,get:function(){return C}});var t=r(d[0]),n=r(d[1]),s=r(d[2]),o=r(d[3]),c=r(d[4]),p=r(d[5]),y=r(d[6]),u=r(d[7]),l=r(d[8]),E=r(d[9]);const A='unknown',P='direct-transfer',h='deposit',w='transaction',I=(0,t.proxy)({paymentAsset:{network:'eip155:1',asset:'0x0',metadata:{name:'0x0',symbol:'0x0',decimals:0}},recipient:'0x0',amount:0,isConfigured:!1,error:null,isPaymentInProgress:!1,exchanges:[],isLoading:!1,openInNewTab:!0,redirectUrl:void 0,payWithExchange:void 0,currentPayment:void 0,analyticsSet:!1,paymentId:void 0,choice:'pay',tokenBalances:{[s.ConstantsUtil.CHAIN.EVM]:[],[s.ConstantsUtil.CHAIN.SOLANA]:[]},isFetchingTokenBalances:!1,selectedPaymentAsset:null,quote:void 0,quoteStatus:'waiting',quoteError:null,isFetchingQuote:!1,selectedExchange:void 0,exchangeUrlForQuote:void 0,requestId:void 0}),C={state:I,subscribe:n=>(0,t.subscribe)(I,()=>n(I)),subscribeKey:(t,s)=>(0,n.subscribeKey)(I,t,s),async handleOpenPay(t){this.resetState(),this.setPaymentConfig(t),this.initializeAnalytics(),(0,E.ensureCorrectAddress)(),await this.prepareTokenLogo(),I.isConfigured=!0,o.EventsController.sendEvent({type:'track',event:'PAY_MODAL_OPEN',properties:{exchanges:I.exchanges,configuration:{network:I.paymentAsset.network,asset:I.paymentAsset.asset,recipient:I.recipient,amount:I.amount}}}),await o.ModalController.open({view:'Pay'})},resetState(){I.paymentAsset={network:'eip155:1',asset:'0x0',metadata:{name:'0x0',symbol:'0x0',decimals:0}},I.recipient='0x0',I.amount=0,I.isConfigured=!1,I.error=null,I.isPaymentInProgress=!1,I.isLoading=!1,I.currentPayment=void 0,I.selectedExchange=void 0,I.exchangeUrlForQuote=void 0,I.requestId=void 0},resetQuoteState(){I.quote=void 0,I.quoteStatus='waiting',I.quoteError=null,I.isFetchingQuote=!1,I.requestId=void 0},setPaymentConfig(t){if(!t.paymentAsset)throw new y.AppKitPayError(y.AppKitPayErrorCodes.INVALID_PAYMENT_CONFIG);try{I.choice=t.choice??'pay',I.paymentAsset=t.paymentAsset,I.recipient=t.recipient,I.amount=t.amount,I.openInNewTab=t.openInNewTab??!0,I.redirectUrl=t.redirectUrl,I.payWithExchange=t.payWithExchange,I.error=null}catch(t){throw new y.AppKitPayError(y.AppKitPayErrorCodes.INVALID_PAYMENT_CONFIG,t.message)}},setSelectedPaymentAsset(t){I.selectedPaymentAsset=t},setSelectedExchange(t){I.selectedExchange=t},setRequestId(t){I.requestId=t},setPaymentInProgress(t){I.isPaymentInProgress=t},getPaymentAsset:()=>I.paymentAsset,getExchanges:()=>I.exchanges,async fetchExchanges(){try{I.isLoading=!0;const t=await(0,u.getExchanges)({page:0});I.exchanges=t.exchanges.slice(0,2)}catch(t){throw o.SnackController.showError(y.AppKitPayErrorMessages.UNABLE_TO_GET_EXCHANGES),new y.AppKitPayError(y.AppKitPayErrorCodes.UNABLE_TO_GET_EXCHANGES)}finally{I.isLoading=!1}},async getAvailableExchanges(t){try{const n=t?.asset&&t?.network?(0,l.formatCaip19Asset)(t.network,t.asset):void 0;return await(0,u.getExchanges)({page:t?.page??0,asset:n,amount:t?.amount?.toString()})}catch(t){throw new y.AppKitPayError(y.AppKitPayErrorCodes.UNABLE_TO_GET_EXCHANGES)}},async getPayUrl(t,n,s=!1){try{const c=Number(n.amount),p=await(0,u.getPayUrl)({exchangeId:t,asset:(0,l.formatCaip19Asset)(n.network,n.asset),amount:c.toString(),recipient:`${n.network}:${n.recipient}`});return o.EventsController.sendEvent({type:'track',event:'PAY_EXCHANGE_SELECTED',properties:{source:'pay',exchange:{id:t},configuration:{network:n.network,asset:n.asset,recipient:n.recipient,amount:c},currentPayment:{type:'exchange',exchangeId:t},headless:s}}),s&&(this.initiatePayment(),o.EventsController.sendEvent({type:'track',event:'PAY_INITIATED',properties:{source:'pay',paymentId:I.paymentId||A,configuration:{network:n.network,asset:n.asset,recipient:n.recipient,amount:c},currentPayment:{type:'exchange',exchangeId:t}}})),p}catch(t){if(t instanceof Error&&t.message.includes('is not supported'))throw new y.AppKitPayError(y.AppKitPayErrorCodes.ASSET_NOT_SUPPORTED);throw new Error(t.message)}},async generateExchangeUrlForQuote({exchangeId:t,paymentAsset:n,amount:s,recipient:o}){const c=await(0,u.getPayUrl)({exchangeId:t,asset:(0,l.formatCaip19Asset)(n.network,n.asset),amount:s.toString(),recipient:o});I.exchangeSessionId=c.sessionId,I.exchangeUrlForQuote=c.url},async openPayUrl(t,n,s=!1){try{const c=await this.getPayUrl(t.exchangeId,n,s);if(!c)throw new y.AppKitPayError(y.AppKitPayErrorCodes.UNABLE_TO_GET_PAY_URL);const p=t.openInNewTab??!0?'_blank':'_self';return o.CoreHelperUtil.openHref(c.url,p),c}catch(t){throw t instanceof y.AppKitPayError?I.error=t.message:I.error=y.AppKitPayErrorMessages.GENERIC_PAYMENT_ERROR,new y.AppKitPayError(y.AppKitPayErrorCodes.UNABLE_TO_GET_PAY_URL)}},async onTransfer({chainNamespace:t,fromAddress:n,toAddress:c,amount:u,paymentAsset:l}){if(I.currentPayment={type:'wallet',status:'IN_PROGRESS'},!I.isPaymentInProgress)try{this.initiatePayment();const A=o.ChainController.getAllRequestedCaipNetworks().find(t=>t.caipNetworkId===l.network);if(!A)throw new Error('Target network not found');const P=o.ChainController.state.activeCaipNetwork;switch(p.HelpersUtil.isLowerCaseMatch(P?.caipNetworkId,A.caipNetworkId)||await o.ChainController.switchActiveNetwork(A),t){case s.ConstantsUtil.CHAIN.EVM:'native'===l.asset&&(I.currentPayment.result=await(0,E.processEvmNativePayment)(l,t,{recipient:c,amount:u,fromAddress:n})),l.asset.startsWith('0x')&&(I.currentPayment.result=await(0,E.processEvmErc20Payment)(l,{recipient:c,amount:u,fromAddress:n})),I.currentPayment.status='SUCCESS';break;case s.ConstantsUtil.CHAIN.SOLANA:I.currentPayment.result=await(0,E.processSolanaPayment)(t,{recipient:c,amount:u,fromAddress:n,tokenMint:'native'===l.asset?void 0:l.asset}),I.currentPayment.status='SUCCESS';break;default:throw new y.AppKitPayError(y.AppKitPayErrorCodes.INVALID_CHAIN_NAMESPACE)}}catch(t){throw t instanceof y.AppKitPayError?I.error=t.message:I.error=y.AppKitPayErrorMessages.GENERIC_PAYMENT_ERROR,I.currentPayment.status='FAILED',o.SnackController.showError(I.error),t}finally{I.isPaymentInProgress=!1}},async onSendTransaction(t){try{const{namespace:n,transactionStep:c}=t;C.initiatePayment();const y=o.ChainController.getAllRequestedCaipNetworks().find(t=>t.caipNetworkId===I.paymentAsset?.network);if(!y)throw new Error('Target network not found');const u=o.ChainController.state.activeCaipNetwork;if(p.HelpersUtil.isLowerCaseMatch(u?.caipNetworkId,y.caipNetworkId)||await o.ChainController.switchActiveNetwork(y),n===s.ConstantsUtil.CHAIN.EVM){const{from:t,to:s,data:p,value:y}=c.transaction;await o.ConnectionController.sendTransaction({address:t,to:s,data:p,value:BigInt(y),chainNamespace:n})}else if(n===s.ConstantsUtil.CHAIN.SOLANA){const{instructions:t}=c.transaction;await o.ConnectionController.writeSolanaTransaction({instructions:t})}}catch(t){throw t instanceof y.AppKitPayError?I.error=t.message:I.error=y.AppKitPayErrorMessages.GENERIC_PAYMENT_ERROR,o.SnackController.showError(I.error),t}finally{I.isPaymentInProgress=!1}},getExchangeById:t=>I.exchanges.find(n=>n.id===t),validatePayConfig(t){const{paymentAsset:n,recipient:s,amount:o}=t;if(!n)throw new y.AppKitPayError(y.AppKitPayErrorCodes.INVALID_PAYMENT_CONFIG);if(!s)throw new y.AppKitPayError(y.AppKitPayErrorCodes.INVALID_RECIPIENT);if(!n.asset)throw new y.AppKitPayError(y.AppKitPayErrorCodes.INVALID_ASSET);if(null==o||o<=0)throw new y.AppKitPayError(y.AppKitPayErrorCodes.INVALID_AMOUNT)},async handlePayWithExchange(t){try{I.currentPayment={type:'exchange',exchangeId:t};const{network:n,asset:s}=I.paymentAsset,o={network:n,asset:s,amount:I.amount,recipient:I.recipient},c=await this.getPayUrl(t,o);if(!c)throw new y.AppKitPayError(y.AppKitPayErrorCodes.UNABLE_TO_INITIATE_PAYMENT);return I.currentPayment.sessionId=c.sessionId,I.currentPayment.status='IN_PROGRESS',I.currentPayment.exchangeId=t,this.initiatePayment(),{url:c.url,openInNewTab:I.openInNewTab}}catch(t){return t instanceof y.AppKitPayError?I.error=t.message:I.error=y.AppKitPayErrorMessages.GENERIC_PAYMENT_ERROR,I.isPaymentInProgress=!1,o.SnackController.showError(I.error),null}},async getBuyStatus(t,n){try{const s=await(0,u.getBuyStatus)({sessionId:n,exchangeId:t});return'SUCCESS'!==s.status&&'FAILED'!==s.status||o.EventsController.sendEvent({type:'track',event:'SUCCESS'===s.status?'PAY_SUCCESS':'PAY_ERROR',properties:{message:'FAILED'===s.status?o.CoreHelperUtil.parseError(I.error):void 0,source:'pay',paymentId:I.paymentId||A,configuration:{network:I.paymentAsset.network,asset:I.paymentAsset.asset,recipient:I.recipient,amount:I.amount},currentPayment:{type:'exchange',exchangeId:I.currentPayment?.exchangeId,sessionId:I.currentPayment?.sessionId,result:s.txHash}}}),s}catch(t){throw new y.AppKitPayError(y.AppKitPayErrorCodes.UNABLE_TO_GET_BUY_STATUS)}},async fetchTokensFromEOA({caipAddress:t,caipNetwork:n,namespace:o}){if(!t)return[];const{address:p}=s.ParseUtil.parseCaipAddress(t);let y=n;o===s.ConstantsUtil.CHAIN.EVM&&(y=void 0);return await c.BalanceUtil.getMyTokensWithBalance({address:p,caipNetwork:y})},async fetchTokensFromExchange(){if(!I.selectedExchange)return[];const t=await(0,u.getAssetsForExchange)(I.selectedExchange.id),n=Object.values(t.assets).flat();return await Promise.all(n.map(async t=>{const n=(0,l.formatPaymentAssetToBalance)(t),{chainNamespace:c}=s.ParseUtil.parseCaipNetworkId(n.chainId);let p=n.address;if(o.CoreHelperUtil.isCaipAddress(p)){const{address:t}=s.ParseUtil.parseCaipAddress(p);p=t}const y=await o.AssetUtil.getImageByToken(p??'',c).catch(()=>{});return n.iconUrl=y??'',n}))},async fetchTokens({caipAddress:t,caipNetwork:n,namespace:s}){try{I.isFetchingTokenBalances=!0;const o=Boolean(I.selectedExchange)?this.fetchTokensFromExchange():this.fetchTokensFromEOA({caipAddress:t,caipNetwork:n,namespace:s}),c=await o;I.tokenBalances={...I.tokenBalances,[s]:c}}catch(t){const n=t instanceof Error?t.message:'Unable to get token balances';o.SnackController.showError(n)}finally{I.isFetchingTokenBalances=!1}},async fetchQuote({amount:t,address:n,sourceToken:c,toToken:p,recipient:l}){try{C.resetQuoteState(),I.isFetchingQuote=!0;const o=await(0,u.getQuote)({amount:t,address:I.selectedExchange?void 0:n,sourceToken:c,toToken:p,recipient:l});if(I.selectedExchange){const t=(0,E.getTransferStep)(o);if(t){const n=`${c.network}:${t.deposit.receiver}`,o=s.NumberUtil.formatNumber(t.deposit.amount,{decimals:c.metadata.decimals??0,round:8});await C.generateExchangeUrlForQuote({exchangeId:I.selectedExchange.id,paymentAsset:c,amount:o.toString(),recipient:n})}}I.quote=o}catch(t){let n=y.AppKitPayErrorMessages.UNABLE_TO_GET_QUOTE;if(t instanceof Error&&t.cause&&t.cause instanceof Response)try{const s=await t.cause.json();s.error&&'string'==typeof s.error&&(n=s.error)}catch{}throw I.quoteError=n,o.SnackController.showError(n),new y.AppKitPayError(y.AppKitPayErrorCodes.UNABLE_TO_GET_QUOTE)}finally{I.isFetchingQuote=!1}},async fetchQuoteStatus({requestId:t}){try{if(t===P){const t=I.selectedExchange,n=I.exchangeSessionId;if(t&&n){switch((await this.getBuyStatus(t.id,n)).status){case'IN_PROGRESS':case'UNKNOWN':default:I.quoteStatus='waiting';break;case'SUCCESS':I.quoteStatus='success',I.isPaymentInProgress=!1;break;case'FAILED':I.quoteStatus='failure',I.isPaymentInProgress=!1}return}return void(I.quoteStatus='success')}const{status:n}=await(0,u.getQuoteStatus)({requestId:t});I.quoteStatus=n}catch{throw I.quoteStatus='failure',new y.AppKitPayError(y.AppKitPayErrorCodes.UNABLE_TO_GET_QUOTE_STATUS)}},initiatePayment(){I.isPaymentInProgress=!0,I.paymentId=crypto.randomUUID()},initializeAnalytics(){I.analyticsSet||(I.analyticsSet=!0,this.subscribeKey('isPaymentInProgress',t=>{if(I.currentPayment?.status&&'UNKNOWN'!==I.currentPayment.status){const t={IN_PROGRESS:'PAY_INITIATED',SUCCESS:'PAY_SUCCESS',FAILED:'PAY_ERROR'}[I.currentPayment.status];o.EventsController.sendEvent({type:'track',event:t,properties:{message:'FAILED'===I.currentPayment.status?o.CoreHelperUtil.parseError(I.error):void 0,source:'pay',paymentId:I.paymentId||A,configuration:{network:I.paymentAsset.network,asset:I.paymentAsset.asset,recipient:I.recipient,amount:I.amount},currentPayment:{type:I.currentPayment.type,exchangeId:I.currentPayment.exchangeId,sessionId:I.currentPayment.sessionId,result:I.currentPayment.result}}})}}))},async prepareTokenLogo(){if(!I.paymentAsset.metadata.logoURI)try{const{chainNamespace:t}=s.ParseUtil.parseCaipNetworkId(I.paymentAsset.network),n=await o.AssetUtil.getImageByToken(I.paymentAsset.asset,t);I.paymentAsset.metadata.logoURI=n}catch{}}}},4233,[2166,2168,2169,2164,2531,2534,4234,4235,4238,4237]);
__d(function(g,r,i,a,m,e,d){"use strict";Object.defineProperty(e,'__esModule',{value:!0}),Object.defineProperty(e,"AppKitPayErrorCodes",{enumerable:!0,get:function(){return _}}),Object.defineProperty(e,"AppKitPayErrorMessages",{enumerable:!0,get:function(){return E}}),Object.defineProperty(e,"AppKitPayError",{enumerable:!0,get:function(){return T}}),e.createAppKitPayError=function(E,A){const N=E||_.UNKNOWN_ERROR;return new T(N,A)};const _={INVALID_PAYMENT_CONFIG:'INVALID_PAYMENT_CONFIG',INVALID_RECIPIENT:'INVALID_RECIPIENT',INVALID_ASSET:'INVALID_ASSET',INVALID_AMOUNT:'INVALID_AMOUNT',UNKNOWN_ERROR:'UNKNOWN_ERROR',UNABLE_TO_INITIATE_PAYMENT:'UNABLE_TO_INITIATE_PAYMENT',INVALID_CHAIN_NAMESPACE:'INVALID_CHAIN_NAMESPACE',GENERIC_PAYMENT_ERROR:'GENERIC_PAYMENT_ERROR',UNABLE_TO_GET_EXCHANGES:'UNABLE_TO_GET_EXCHANGES',ASSET_NOT_SUPPORTED:'ASSET_NOT_SUPPORTED',UNABLE_TO_GET_PAY_URL:'UNABLE_TO_GET_PAY_URL',UNABLE_TO_GET_BUY_STATUS:'UNABLE_TO_GET_BUY_STATUS',UNABLE_TO_GET_TOKEN_BALANCES:'UNABLE_TO_GET_TOKEN_BALANCES',UNABLE_TO_GET_QUOTE:'UNABLE_TO_GET_QUOTE',UNABLE_TO_GET_QUOTE_STATUS:'UNABLE_TO_GET_QUOTE_STATUS',INVALID_RECIPIENT_ADDRESS_FOR_ASSET:'INVALID_RECIPIENT_ADDRESS_FOR_ASSET'},E={[_.INVALID_PAYMENT_CONFIG]:'Invalid payment configuration',[_.INVALID_RECIPIENT]:'Invalid recipient address',[_.INVALID_ASSET]:'Invalid asset specified',[_.INVALID_AMOUNT]:'Invalid payment amount',[_.INVALID_RECIPIENT_ADDRESS_FOR_ASSET]:'Invalid recipient address for the asset selected',[_.UNKNOWN_ERROR]:'Unknown payment error occurred',[_.UNABLE_TO_INITIATE_PAYMENT]:'Unable to initiate payment',[_.INVALID_CHAIN_NAMESPACE]:'Invalid chain namespace',[_.GENERIC_PAYMENT_ERROR]:'Unable to process payment',[_.UNABLE_TO_GET_EXCHANGES]:'Unable to get exchanges',[_.ASSET_NOT_SUPPORTED]:'Asset not supported by the selected exchange',[_.UNABLE_TO_GET_PAY_URL]:'Unable to get payment URL',[_.UNABLE_TO_GET_BUY_STATUS]:'Unable to get buy status',[_.UNABLE_TO_GET_TOKEN_BALANCES]:'Unable to get token balances',[_.UNABLE_TO_GET_QUOTE]:'Unable to get quote. Please choose a different token',[_.UNABLE_TO_GET_QUOTE_STATUS]:'Unable to get quote status'};class T extends Error{get message(){return E[this.code]}constructor(_,A){super(E[_]),this.name='AppKitPayError',this.code=_,this.details=A,Error.captureStackTrace&&Error.captureStackTrace(this,T)}}},4234,[]);
__d(function(g,r,i,a,m,e,d){"use strict";Object.defineProperty(e,'__esModule',{value:!0}),e.getApiUrl=l,e.getExchanges=async function(t){return(await h('reown_getExchanges',t)).result},e.getPayUrl=async function(t){return(await h('reown_getExchangePayUrl',t)).result},e.getBuyStatus=async function(t){return(await h('reown_getExchangeBuyStatus',t)).result},e.getTransfersQuote=w,e.getQuote=async function(t){const n=s.HelpersUtil.isLowerCaseMatch(t.sourceToken.network,t.toToken.network),o=s.HelpersUtil.isLowerCaseMatch(t.sourceToken.asset,t.toToken.asset);if(n&&o)return(0,c.getDirectTransferQuote)(t);return w(t)},e.getQuoteStatus=async function(t){return await u.get({path:'/appkit/v1/transfers/status',params:{requestId:t.requestId,...k()}})},e.getAssetsForExchange=async function(t){return await u.get({path:`/appkit/v1/transfers/assets/exchanges/${t}`,params:k()})};var t=r(d[0]),n=r(d[1]),s=r(d[2]),o=r(d[3]),c=r(d[4]);const u=new n.FetchUtil({baseUrl:n.CoreHelperUtil.getApiUrl(),clientId:null});class p extends Error{}function l(){const t=n.OptionsController.getSnapshot().projectId;return`${o.API_URL}?projectId=${t}`}function k(){const{projectId:t,sdkType:s,sdkVersion:o}=n.OptionsController.state;return{projectId:t,st:s||'appkit',sv:o||'html-wagmi-4.2.2'}}async function h(t,s){const o=l(),{sdkType:c,sdkVersion:u,projectId:k}=n.OptionsController.getSnapshot(),h={jsonrpc:'2.0',id:1,method:t,params:{...s||{},st:c,sv:u,projectId:k}},w=await fetch(o,{method:'POST',body:JSON.stringify(h),headers:{'Content-Type':'application/json'}}),f=await w.json();if(f.error)throw new p(f.error.message);return f}async function w(s){const o=t.NumberUtil.bigNumber(s.amount).times(10**s.toToken.metadata.decimals).toString(),{chainId:c,chainNamespace:p}=t.ParseUtil.parseCaipNetworkId(s.sourceToken.network),{chainId:l,chainNamespace:h}=t.ParseUtil.parseCaipNetworkId(s.toToken.network),w='native'===s.sourceToken.asset?(0,n.getNativeTokenAddress)(p):s.sourceToken.asset,f='native'===s.toToken.asset?(0,n.getNativeTokenAddress)(h):s.toToken.asset;return await u.post({path:'/appkit/v1/transfers/quote',body:{user:s.address,originChainId:c.toString(),originCurrency:w,destinationChainId:l.toString(),destinationCurrency:f,recipient:s.recipient,amount:o},params:k()})}},4235,[2169,2164,2534,4236,4237]);
__d(function(g,r,i,a,m,e,d){"use strict";Object.defineProperty(e,'__esModule',{value:!0}),Object.defineProperty(e,"API_URL",{enumerable:!0,get:function(){return t}}),Object.defineProperty(e,"REOWN_TEST_EXCHANGE_ID",{enumerable:!0,get:function(){return n}});const t='https://rpc.walletconnect.org/v1/json-rpc',n='reown_test'},4236,[]);
__d(function(g,r,i,a,m,e,d){"use strict";Object.defineProperty(e,'__esModule',{value:!0}),e.ensureCorrectNetwork=async function(t){const{paymentAssetNetwork:n,activeCaipNetwork:p,approvedCaipNetworkIds:E,requestedCaipNetworks:A}=t,c=o.CoreHelperUtil.sortRequestedNetworks(E,A).find(t=>t.caipNetworkId===n);if(!c)throw new s.AppKitPayError(s.AppKitPayErrorCodes.INVALID_PAYMENT_CONFIG);if(c.caipNetworkId===p.caipNetworkId)return;const C=o.ChainController.getNetworkProp('supportsAllNetworks',c.chainNamespace);if(!E?.includes(c.caipNetworkId)&&!C)throw new s.AppKitPayError(s.AppKitPayErrorCodes.INVALID_PAYMENT_CONFIG);try{await o.ChainController.switchActiveNetwork(c)}catch(t){throw new s.AppKitPayError(s.AppKitPayErrorCodes.GENERIC_PAYMENT_ERROR,t)}},e.ensureCorrectAddress=function(){const{chainNamespace:p}=t.ParseUtil.parseCaipNetworkId(n.PayController.state.paymentAsset.network);if(!o.CoreHelperUtil.isAddress(n.PayController.state.recipient,p))throw new s.AppKitPayError(s.AppKitPayErrorCodes.INVALID_RECIPIENT_ADDRESS_FOR_ASSET,`Provide valid recipient address for namespace "${p}"`)},e.processEvmNativePayment=async function(n,p,E){if(p!==t.ConstantsUtil.CHAIN.EVM)throw new s.AppKitPayError(s.AppKitPayErrorCodes.INVALID_CHAIN_NAMESPACE);if(!E.fromAddress)throw new s.AppKitPayError(s.AppKitPayErrorCodes.INVALID_PAYMENT_CONFIG,'fromAddress is required for native EVM payments.');const A='string'==typeof E.amount?parseFloat(E.amount):E.amount;if(isNaN(A))throw new s.AppKitPayError(s.AppKitPayErrorCodes.INVALID_PAYMENT_CONFIG);const c=n.metadata?.decimals??18,C=o.ConnectionController.parseUnits(A.toString(),c);if('bigint'!=typeof C)throw new s.AppKitPayError(s.AppKitPayErrorCodes.GENERIC_PAYMENT_ERROR);return await o.ConnectionController.sendTransaction({chainNamespace:p,to:E.recipient,address:E.fromAddress,value:C,data:'0x'})??void 0},e.processEvmErc20Payment=async function(n,p){if(!p.fromAddress)throw new s.AppKitPayError(s.AppKitPayErrorCodes.INVALID_PAYMENT_CONFIG,'fromAddress is required for ERC20 EVM payments.');const E=n.asset,A=p.recipient,c=Number(n.metadata.decimals),C=o.ConnectionController.parseUnits(p.amount.toString(),c);if(void 0===C)throw new s.AppKitPayError(s.AppKitPayErrorCodes.GENERIC_PAYMENT_ERROR);return await o.ConnectionController.writeContract({fromAddress:p.fromAddress,tokenAddress:E,args:[A,C],method:'transfer',abi:t.ContractUtil.getERC20Abi(E),chainNamespace:t.ConstantsUtil.CHAIN.EVM})??void 0},e.processSolanaPayment=async function(n,p){if(n!==t.ConstantsUtil.CHAIN.SOLANA)throw new s.AppKitPayError(s.AppKitPayErrorCodes.INVALID_CHAIN_NAMESPACE);if(!p.fromAddress)throw new s.AppKitPayError(s.AppKitPayErrorCodes.INVALID_PAYMENT_CONFIG,'fromAddress is required for Solana payments.');const E='string'==typeof p.amount?parseFloat(p.amount):p.amount;if(isNaN(E)||E<=0)throw new s.AppKitPayError(s.AppKitPayErrorCodes.INVALID_PAYMENT_CONFIG,'Invalid payment amount.');try{if(!o.ProviderController.getProvider(n))throw new s.AppKitPayError(s.AppKitPayErrorCodes.GENERIC_PAYMENT_ERROR,'No Solana provider available.');const A=await o.ConnectionController.sendTransaction({chainNamespace:t.ConstantsUtil.CHAIN.SOLANA,to:p.recipient,value:E,tokenMint:p.tokenMint});if(!A)throw new s.AppKitPayError(s.AppKitPayErrorCodes.GENERIC_PAYMENT_ERROR,'Transaction failed.');return A}catch(t){if(t instanceof s.AppKitPayError)throw t;throw new s.AppKitPayError(s.AppKitPayErrorCodes.GENERIC_PAYMENT_ERROR,`Solana payment failed: ${t}`)}},e.getDirectTransferQuote=async function({sourceToken:t,toToken:s,amount:p,recipient:E}){const A=o.ConnectionController.parseUnits(p,t.metadata.decimals),c=o.ConnectionController.parseUnits(p,s.metadata.decimals);return Promise.resolve({type:n.DIRECT_TRANSFER_REQUEST_ID,origin:{amount:A?.toString()??'0',currency:t},destination:{amount:c?.toString()??'0',currency:s},fees:[{id:'service',label:'Service Fee',amount:'0',currency:s}],steps:[{requestId:n.DIRECT_TRANSFER_REQUEST_ID,type:'deposit',deposit:{amount:A?.toString()??'0',currency:t.asset,receiver:E}}],timeInSeconds:6})},e.getTransferStep=function(t){if(!t)return null;const o=t.steps[0];if(!o||o.type!==n.DIRECT_TRANSFER_DEPOSIT_TYPE)return null;return o},e.getTransactionsSteps=function(t,o=0){if(!t)return[];const s=t.steps.filter(t=>t.type===n.DIRECT_TRANSFER_TRANSACTION_TYPE),p=s.filter((t,n)=>n+1>o);return s.length>0&&s.length<3?p:[]};var t=r(d[0]),o=r(d[1]),n=r(d[2]),s=r(d[3])},4237,[2169,2164,4233,4234]);
__d(function(g,r,i,a,m,e,d){"use strict";Object.defineProperty(e,'__esModule',{value:!0}),e.formatCaip19Asset=function(n,s){const{chainNamespace:o,chainId:u}=t.ParseUtil.parseCaipNetworkId(n),p=c[o];if(!p)throw new Error(`Unsupported chain namespace for CAIP-19 formatting: ${o}`);let f=p.native.assetNamespace,w=p.native.assetReference;'native'!==s?(f=p.defaultTokenNamespace,w=s):'eip155'===o&&l[u]&&(w=l[u]);return`${o}:${u}/${f}:${w}`},e.isPayWithWalletSupported=function(n){const{chainNamespace:s}=t.ParseUtil.parseCaipNetworkId(n);return o.includes(s)},e.formatBalanceToPaymentAsset=function(o){const c=n.ChainController.getAllRequestedCaipNetworks().find(t=>t.caipNetworkId===o.chainId);let l=o.address;if(!c)throw new Error(`Target network not found for balance chainId "${o.chainId}"`);if(s.HelpersUtil.isLowerCaseMatch(o.symbol,c.nativeCurrency.symbol))l='native';else if(n.CoreHelperUtil.isCaipAddress(l)){const{address:n}=t.ParseUtil.parseCaipAddress(l);l=n}else if(!l)throw new Error(`Balance address not found for balance symbol "${o.symbol}"`);return{network:c.caipNetworkId,asset:l,metadata:{name:o.name,symbol:o.symbol,decimals:Number(o.quantity.decimals),logoURI:o.iconUrl},amount:o.quantity.numeric}},e.formatPaymentAssetToBalance=function(t){return{chainId:t.network,address:`${t.network}:${t.asset}`,symbol:t.metadata.symbol,name:t.metadata.name,iconUrl:t.metadata.logoURI||'',price:0,quantity:{numeric:'0',decimals:t.metadata.decimals.toString()}}},e.formatAmount=function(n){const s=t.NumberUtil.bigNumber(n,{safe:!0});if(s.lt(.001))return'<0.001';return s.round(4).toString()},e.isTestnetAsset=function(t){const s=n.ChainController.getAllRequestedCaipNetworks().find(n=>n.caipNetworkId===t.network);if(!s)return!1;return Boolean(s.testnet)};var t=r(d[0]),n=r(d[1]),s=r(d[2]);const o=['eip155','solana'],c={eip155:{native:{assetNamespace:'slip44',assetReference:'60'},defaultTokenNamespace:'erc20'},solana:{native:{assetNamespace:'slip44',assetReference:'501'},defaultTokenNamespace:'token'}},l={56:'714',204:'714'}},4238,[2169,2164,2534]);
__d(function(g,r,i,a,m,e,d){"use strict";Object.defineProperty(e,'__esModule',{value:!0}),Object.defineProperty(e,"default",{enumerable:!0,get:function(){return t}});var t=r(d[0]).css`
  wui-separator {
    margin: var(--apkt-spacing-3) calc(var(--apkt-spacing-3) * -1) var(--apkt-spacing-2)
      calc(var(--apkt-spacing-3) * -1);
    width: calc(100% + var(--apkt-spacing-3) * 2);
  }

  .token-display {
    padding: var(--apkt-spacing-3) var(--apkt-spacing-3);
    border-radius: var(--apkt-borderRadius-5);
    background-color: var(--apkt-tokens-theme-backgroundPrimary);
    margin-top: var(--apkt-spacing-3);
    margin-bottom: var(--apkt-spacing-3);
  }

  .token-display wui-text {
    text-transform: none;
  }

  wui-loading-spinner {
    padding: var(--apkt-spacing-2);
  }

  .left-image-container {
    position: relative;
    justify-content: center;
    align-items: center;
  }

  .token-image {
    border-radius: ${({borderRadius:t})=>t.round};
    width: 40px;
    height: 40px;
  }

  .chain-image {
    position: absolute;
    width: 20px;
    height: 20px;
    bottom: -3px;
    right: -5px;
    border-radius: ${({borderRadius:t})=>t.round};
    border: 2px solid ${({tokens:t})=>t.theme.backgroundPrimary};
  }

  .payment-methods-container {
    background-color: ${({tokens:t})=>t.theme.foregroundPrimary};
    border-top-right-radius: ${({borderRadius:t})=>t[8]};
    border-top-left-radius: ${({borderRadius:t})=>t[8]};
  }
`},4239,[2546]);
__d(function(g,_r,_i,a,m,_e,_d){"use strict";Object.defineProperty(_e,'__esModule',{value:!0}),Object.defineProperty(_e,"W3mPayLoadingView",{enumerable:!0,get:function(){return y}});var e=_r(_d[0]),t=_r(_d[1]),i=_r(_d[2]),n=_r(_d[3]),s=_r(_d[4]),r=_r(_d[5]),o=_r(_d[6]);_r(_d[7]),_r(_d[8]),_r(_d[9]),_r(_d[10]),_r(_d[11]),_r(_d[12]);var l,u=_r(_d[13]),c=_r(_d[14]),d=_r(_d[15]),p=_r(_d[16]),f=_r(_d[17]),h=(l=f)&&l.__esModule?l:{default:l},w=this&&this.__decorate||function(e,t,i,n){var s,r=arguments.length,o=r<3?t:null===n?n=Object.getOwnPropertyDescriptor(t,i):n;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)o=Reflect.decorate(e,t,i,n);else for(var l=e.length-1;l>=0;l--)(s=e[l])&&(o=(r<3?s(o):r>3?s(t,i,o):s(t,i))||o);return r>3&&o&&Object.defineProperty(t,i,o),o};const x={received:['pending','success','submitted'],processing:['success','submitted'],sending:['success','submitted']};let y=class extends e.LitElement{constructor(){super(),this.unsubscribe=[],this.pollingInterval=null,this.paymentAsset=c.PayController.state.paymentAsset,this.quoteStatus=c.PayController.state.quoteStatus,this.quote=c.PayController.state.quote,this.amount=c.PayController.state.amount,this.namespace=void 0,this.caipAddress=void 0,this.profileName=null,this.activeConnectorIds=r.ConnectorController.state.activeConnectorIds,this.selectedExchange=c.PayController.state.selectedExchange,this.initializeNamespace(),this.unsubscribe.push(c.PayController.subscribeKey('quoteStatus',e=>this.quoteStatus=e),c.PayController.subscribeKey('quote',e=>this.quote=e),r.ConnectorController.subscribeKey('activeConnectorIds',e=>this.activeConnectorIds=e),c.PayController.subscribeKey('selectedExchange',e=>this.selectedExchange=e))}connectedCallback(){super.connectedCallback(),this.startPolling()}disconnectedCallback(){super.disconnectedCallback(),this.stopPolling(),this.unsubscribe.forEach(e=>e())}render(){return e.html`
      <wui-flex flexDirection="column" .padding=${['3','0','0','0']} gap="2">
        ${this.tokenTemplate()} ${this.paymentTemplate()} ${this.paymentLifecycleTemplate()}
      </wui-flex>
    `}tokenTemplate(){const t=(0,d.formatAmount)(this.amount||'0'),i=this.paymentAsset.metadata.symbol??'Unknown',s=r.ChainController.getAllRequestedCaipNetworks().find(e=>e.caipNetworkId===this.paymentAsset.network),o='failure'===this.quoteStatus||'timeout'===this.quoteStatus||'refund'===this.quoteStatus;return'success'===this.quoteStatus||'submitted'===this.quoteStatus?e.html`<wui-flex alignItems="center" justifyContent="center">
        <wui-flex justifyContent="center" alignItems="center" class="token-image success">
          <wui-icon name="checkmark" color="success" size="inherit"></wui-icon>
        </wui-flex>
      </wui-flex>`:o?e.html`<wui-flex alignItems="center" justifyContent="center">
        <wui-flex justifyContent="center" alignItems="center" class="token-image error">
          <wui-icon name="close" color="error" size="inherit"></wui-icon>
        </wui-flex>
      </wui-flex>`:e.html`
      <wui-flex alignItems="center" justifyContent="center">
        <wui-flex class="token-image-container">
          <wui-pulse size="125px" rings="3" duration="4" opacity="0.5" variant="accent-primary">
            <wui-flex justifyContent="center" alignItems="center" class="token-image loading">
              <wui-icon name="paperPlaneTitle" color="accent-primary" size="inherit"></wui-icon>
            </wui-flex>
          </wui-pulse>

          <wui-flex
            justifyContent="center"
            alignItems="center"
            class="token-badge-container loading"
          >
            <wui-flex
              alignItems="center"
              justifyContent="center"
              gap="01"
              padding="1"
              class="token-badge"
            >
              <wui-image
                src=${(0,n.ifDefined)(r.AssetUtil.getNetworkImage(s))}
                class="chain-image"
                size="mdl"
              ></wui-image>

              <wui-text variant="lg-regular" color="primary">${t} ${i}</wui-text>
            </wui-flex>
          </wui-flex>
        </wui-flex>
      </wui-flex>
    `}paymentTemplate(){return e.html`
      <wui-flex flexDirection="column" gap="2" .padding=${['0','6','0','6']}>
        ${this.renderPayment()}
        <wui-separator></wui-separator>
        ${this.renderWallet()}
      </wui-flex>
    `}paymentLifecycleTemplate(){const t=this.getStepsWithStatus();return e.html`
      <wui-flex flexDirection="column" padding="4" gap="2" class="payment-lifecycle-container">
        <wui-flex alignItems="center" justifyContent="space-between">
          <wui-text variant="md-regular" color="secondary">PAYMENT CYCLE</wui-text>

          ${this.renderPaymentCycleBadge()}
        </wui-flex>

        <wui-flex flexDirection="column" gap="5" .padding=${['2','0','2','0']}>
          ${t.map(e=>this.renderStep(e))}
        </wui-flex>
      </wui-flex>
    `}renderPaymentCycleBadge(){const t='failure'===this.quoteStatus||'timeout'===this.quoteStatus||'refund'===this.quoteStatus,i='success'===this.quoteStatus||'submitted'===this.quoteStatus;if(t)return e.html`
        <wui-flex
          justifyContent="center"
          alignItems="center"
          class="payment-step-badge error"
          gap="1"
        >
          <wui-icon name="close" color="error" size="xs"></wui-icon>
          <wui-text variant="sm-regular" color="error">Failed</wui-text>
        </wui-flex>
      `;if(i)return e.html`
        <wui-flex
          justifyContent="center"
          alignItems="center"
          class="payment-step-badge success"
          gap="1"
        >
          <wui-icon name="checkmark" color="success" size="xs"></wui-icon>
          <wui-text variant="sm-regular" color="success">Completed</wui-text>
        </wui-flex>
      `;const n=this.quote?.timeInSeconds??0;return e.html`
      <wui-flex alignItems="center" justifyContent="space-between" gap="3">
        <wui-flex
          justifyContent="center"
          alignItems="center"
          class="payment-step-badge loading"
          gap="1"
        >
          <wui-icon name="clock" color="default" size="xs"></wui-icon>
          <wui-text variant="sm-regular" color="primary">Est. ${n} sec</wui-text>
        </wui-flex>

        <wui-icon name="chevronBottom" color="default" size="xxs"></wui-icon>
      </wui-flex>
    `}renderPayment(){const t=r.ChainController.getAllRequestedCaipNetworks().find(e=>{const t=this.quote?.origin.currency.network;if(!t)return!1;const{chainId:i}=s.ParseUtil.parseCaipNetworkId(t);return u.HelpersUtil.isLowerCaseMatch(e.id.toString(),i.toString())}),i=s.NumberUtil.formatNumber(this.quote?.origin.amount||'0',{decimals:this.quote?.origin.currency.metadata.decimals??0}).toString(),o=(0,d.formatAmount)(i),l=this.quote?.origin.currency.metadata.symbol??'Unknown';return e.html`
      <wui-flex
        alignItems="flex-start"
        justifyContent="space-between"
        .padding=${['3','0','3','0']}
      >
        <wui-text variant="lg-regular" color="secondary">Payment Method</wui-text>

        <wui-flex flexDirection="column" alignItems="flex-end" gap="1">
          <wui-flex alignItems="center" gap="01">
            <wui-text variant="lg-regular" color="primary">${o}</wui-text>
            <wui-text variant="lg-regular" color="secondary">${l}</wui-text>
          </wui-flex>

          <wui-flex alignItems="center" gap="1">
            <wui-text variant="md-regular" color="secondary">on</wui-text>
            <wui-image
              src=${(0,n.ifDefined)(r.AssetUtil.getNetworkImage(t))}
              size="xs"
            ></wui-image>
            <wui-text variant="md-regular" color="secondary">${t?.name}</wui-text>
          </wui-flex>
        </wui-flex>
      </wui-flex>
    `}renderWallet(){return e.html`
      <wui-flex
        alignItems="flex-start"
        justifyContent="space-between"
        .padding=${['3','0','3','0']}
      >
        <wui-text variant="lg-regular" color="secondary"
          >${this.selectedExchange?'Exchange':'Wallet'}</wui-text
        >

        ${this.renderWalletText()}
      </wui-flex>
    `}renderWalletText(){const{image:t}=this.getWalletProperties({namespace:this.namespace}),{address:i}=this.caipAddress?s.ParseUtil.parseCaipAddress(this.caipAddress):{},r=this.selectedExchange?.name;return this.selectedExchange?e.html`
        <wui-flex alignItems="center" justifyContent="flex-end" gap="1">
          <wui-text variant="lg-regular" color="primary">${r}</wui-text>
          <wui-image src=${(0,n.ifDefined)(this.selectedExchange.imageUrl)} size="mdl"></wui-image>
        </wui-flex>
      `:e.html`
      <wui-flex alignItems="center" justifyContent="flex-end" gap="1">
        <wui-text variant="lg-regular" color="primary">
          ${o.UiHelperUtil.getTruncateString({string:this.profileName||i||r||'',charsStart:this.profileName?16:4,charsEnd:this.profileName?0:6,truncate:this.profileName?'end':'middle'})}
        </wui-text>

        <wui-image src=${(0,n.ifDefined)(t)} size="mdl"></wui-image>
      </wui-flex>
    `}getStepsWithStatus(){return'failure'===this.quoteStatus||'timeout'===this.quoteStatus||'refund'===this.quoteStatus?p.STEPS.map(e=>({...e,status:'failed'})):p.STEPS.map(e=>{const t=(x[e.id]??[]).includes(this.quoteStatus)?'completed':'pending';return{...e,status:t}})}renderStep({title:t,icon:n,status:s}){const r={'step-icon-box':!0,success:'completed'===s};return e.html`
      <wui-flex alignItems="center" gap="3">
        <wui-flex justifyContent="center" alignItems="center" class="step-icon-container">
          <wui-icon name=${n} color="default" size="mdl"></wui-icon>

          <wui-flex alignItems="center" justifyContent="center" class=${(0,i.classMap)(r)}>
            ${this.renderStatusIndicator(s)}
          </wui-flex>
        </wui-flex>

        <wui-text variant="md-regular" color="primary">${t}</wui-text>
      </wui-flex>
    `}renderStatusIndicator(t){return'completed'===t?e.html`<wui-icon size="sm" color="success" name="checkmark"></wui-icon>`:'failed'===t?e.html`<wui-icon size="sm" color="error" name="close"></wui-icon>`:'pending'===t?e.html`<wui-loading-spinner color="accent-primary" size="sm"></wui-loading-spinner>`:null}startPolling(){this.pollingInterval||(this.fetchQuoteStatus(),this.pollingInterval=setInterval(()=>{this.fetchQuoteStatus()},3e3))}stopPolling(){this.pollingInterval&&(clearInterval(this.pollingInterval),this.pollingInterval=null)}async fetchQuoteStatus(){const e=c.PayController.state.requestId;if(!e||p.TERMINAL_STATES.includes(this.quoteStatus))this.stopPolling();else try{await c.PayController.fetchQuoteStatus({requestId:e}),p.TERMINAL_STATES.includes(this.quoteStatus)&&this.stopPolling()}catch{this.stopPolling()}}initializeNamespace(){const e=r.ChainController.state.activeChain;this.namespace=e,this.caipAddress=r.ChainController.getAccountData(e)?.caipAddress,this.profileName=r.ChainController.getAccountData(e)?.profileName??null,this.unsubscribe.push(r.ChainController.subscribeChainProp('accountState',e=>{this.caipAddress=e?.caipAddress,this.profileName=e?.profileName??null},e))}getWalletProperties({namespace:e}){if(!e)return{name:void 0,image:void 0};const t=this.activeConnectorIds[e];if(!t)return{name:void 0,image:void 0};const i=r.ConnectorController.getConnector({id:t,namespace:e});if(!i)return{name:void 0,image:void 0};const n=r.AssetUtil.getConnectorImage(i);return{name:i.name,image:n}}};y.styles=h.default,w([(0,t.state)()],y.prototype,"paymentAsset",void 0),w([(0,t.state)()],y.prototype,"quoteStatus",void 0),w([(0,t.state)()],y.prototype,"quote",void 0),w([(0,t.state)()],y.prototype,"amount",void 0),w([(0,t.state)()],y.prototype,"namespace",void 0),w([(0,t.state)()],y.prototype,"caipAddress",void 0),w([(0,t.state)()],y.prototype,"profileName",void 0),w([(0,t.state)()],y.prototype,"activeConnectorIds",void 0),w([(0,t.state)()],y.prototype,"selectedExchange",void 0),y=w([(0,o.customElement)('w3m-pay-loading-view')],y)},4240,[2549,2575,2625,2586,2169,2164,2546,2650,3826,2778,4241,2743,2651,2534,4233,4238,4244,4245]);
__d(function(g,r,i,a,m,e,d){"use strict";Object.defineProperty(e,'__esModule',{value:!0});var t=r(d[0]);Object.keys(t).forEach(function(n){'default'===n||Object.prototype.hasOwnProperty.call(e,n)||Object.defineProperty(e,n,{enumerable:!0,get:function(){return t[n]}})})},4241,[4242]);
__d(function(g,_r,_i,a,m,_e,_d){"use strict";Object.defineProperty(_e,'__esModule',{value:!0}),Object.defineProperty(_e,"WuiPulse",{enumerable:!0,get:function(){return u}});var e,t=_r(_d[0]),r=_r(_d[1]),s=_r(_d[2]),i=_r(_d[3]),o=_r(_d[4]),n=_r(_d[5]),p=(e=n)&&e.__esModule?e:{default:e},c=this&&this.__decorate||function(e,t,r,s){var i,o=arguments.length,n=o<3?t:null===s?s=Object.getOwnPropertyDescriptor(t,r):s;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)n=Reflect.decorate(e,t,r,s);else for(var p=e.length-1;p>=0;p--)(i=e[p])&&(n=(o<3?i(n):o>3?i(t,r,n):i(t,r))||n);return o>3&&n&&Object.defineProperty(t,r,n),n};const l={'accent-primary':s.vars.tokens.core.backgroundAccentPrimary};let u=class extends t.LitElement{constructor(){super(...arguments),this.rings=3,this.duration=2,this.opacity=.3,this.size="200px",this.variant='accent-primary'}render(){const e=l[this.variant];this.style.cssText=`\n      --pulse-size: ${this.size};\n      --pulse-duration: ${this.duration}s;\n      --pulse-color: ${e};\n      --pulse-opacity: ${this.opacity};\n    `;const r=Array.from({length:this.rings},(e,t)=>this.renderRing(t,this.rings));return t.html`
      <div class="pulse-container">
        <div class="pulse-rings">${r}</div>
        <div class="pulse-content">
          <slot></slot>
        </div>
      </div>
    `}renderRing(e,r){const s=`animation-delay: ${e/r*this.duration}s;`;return t.html`<div class="pulse-ring" style=${s}></div>`}};u.styles=[i.resetStyles,p.default],c([(0,r.property)({type:Number})],u.prototype,"rings",void 0),c([(0,r.property)({type:Number})],u.prototype,"duration",void 0),c([(0,r.property)({type:Number})],u.prototype,"opacity",void 0),c([(0,r.property)()],u.prototype,"size",void 0),c([(0,r.property)()],u.prototype,"variant",void 0),u=c([(0,o.customElement)('wui-pulse')],u)},4242,[2549,2575,2555,2548,2559,4243]);
__d(function(g,r,i,a,m,e,d){"use strict";Object.defineProperty(e,'__esModule',{value:!0}),Object.defineProperty(e,"default",{enumerable:!0,get:function(){return t}});var t=r(d[0]).css`
  :host {
    display: inline-flex;
    align-items: center;
    justify-content: center;
  }

  .pulse-container {
    position: relative;
    width: var(--pulse-size);
    height: var(--pulse-size);
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .pulse-rings {
    position: absolute;
    inset: 0;
    pointer-events: none;
  }

  .pulse-ring {
    position: absolute;
    inset: 0;
    border-radius: 50%;
    border: 2px solid var(--pulse-color);
    opacity: 0;
    animation: pulse var(--pulse-duration, 2s) ease-out infinite;
  }

  .pulse-content {
    position: relative;
    z-index: 1;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  @keyframes pulse {
    0% {
      transform: scale(0.5);
      opacity: var(--pulse-opacity, 0.3);
    }
    50% {
      opacity: calc(var(--pulse-opacity, 0.3) * 0.5);
    }
    100% {
      transform: scale(1.2);
      opacity: 0;
    }
  }
`},4243,[2555]);
__d(function(g,r,i,a,m,e,d){"use strict";Object.defineProperty(e,'__esModule',{value:!0}),Object.defineProperty(e,"STEPS",{enumerable:!0,get:function(){return t}}),Object.defineProperty(e,"TERMINAL_STATES",{enumerable:!0,get:function(){return n}});const t=[{id:'received',title:'Receiving funds',icon:'dollar'},{id:'processing',title:'Swapping asset',icon:'recycleHorizontal'},{id:'sending',title:'Sending asset to the recipient address',icon:'send'}],n=['success','submitted','failure','timeout','refund']},4244,[]);
__d(function(g,r,i,a,m,e,d){"use strict";Object.defineProperty(e,'__esModule',{value:!0}),Object.defineProperty(e,"default",{enumerable:!0,get:function(){return o}});var o=r(d[0]).css`
  :host {
    display: block;
    height: 100%;
    width: 100%;
  }

  wui-image {
    border-radius: ${({borderRadius:o})=>o.round};
  }

  .token-badge-container {
    position: absolute;
    bottom: 6px;
    left: 50%;
    transform: translateX(-50%);
    border-radius: ${({borderRadius:o})=>o[4]};
    z-index: 3;
    min-width: 105px;
  }

  .token-badge-container.loading {
    background-color: ${({tokens:o})=>o.theme.backgroundPrimary};
    border: 3px solid ${({tokens:o})=>o.theme.backgroundPrimary};
  }

  .token-badge-container.success {
    background-color: ${({tokens:o})=>o.theme.backgroundPrimary};
    border: 3px solid ${({tokens:o})=>o.theme.backgroundPrimary};
  }

  .token-image-container {
    position: relative;
  }

  .token-image {
    border-radius: ${({borderRadius:o})=>o.round};
    width: 64px;
    height: 64px;
  }

  .token-image.success {
    background-color: ${({tokens:o})=>o.theme.foregroundPrimary};
  }

  .token-image.error {
    background-color: ${({tokens:o})=>o.theme.foregroundPrimary};
  }

  .token-image.loading {
    background: ${({colors:o})=>o.accent010};
  }

  .token-image wui-icon {
    width: 32px;
    height: 32px;
  }

  .token-badge {
    background-color: ${({tokens:o})=>o.theme.foregroundPrimary};
    border: 1px solid ${({tokens:o})=>o.theme.foregroundSecondary};
    border-radius: ${({borderRadius:o})=>o[4]};
  }

  .token-badge wui-text {
    white-space: nowrap;
  }

  .payment-lifecycle-container {
    background-color: ${({tokens:o})=>o.theme.foregroundPrimary};
    border-top-right-radius: ${({borderRadius:o})=>o[6]};
    border-top-left-radius: ${({borderRadius:o})=>o[6]};
  }

  .payment-step-badge {
    padding: ${({spacing:o})=>o[1]} ${({spacing:o})=>o[2]};
    border-radius: ${({borderRadius:o})=>o[1]};
  }

  .payment-step-badge.loading {
    background-color: ${({tokens:o})=>o.theme.foregroundSecondary};
  }

  .payment-step-badge.error {
    background-color: ${({tokens:o})=>o.core.backgroundError};
  }

  .payment-step-badge.success {
    background-color: ${({tokens:o})=>o.core.backgroundSuccess};
  }

  .step-icon-container {
    position: relative;
    height: 40px;
    width: 40px;
    border-radius: ${({borderRadius:o})=>o.round};
    background-color: ${({tokens:o})=>o.theme.foregroundSecondary};
  }

  .step-icon-box {
    position: absolute;
    right: -4px;
    bottom: -1px;
    padding: 2px;
    border-radius: ${({borderRadius:o})=>o.round};
    border: 2px solid ${({tokens:o})=>o.theme.backgroundPrimary};
    background-color: ${({tokens:o})=>o.theme.foregroundPrimary};
  }

  .step-icon-box.success {
    background-color: ${({tokens:o})=>o.core.backgroundSuccess};
  }
`},4245,[2546]);
__d(function(g,_r,_i,a,m,_e,_d){"use strict";Object.defineProperty(_e,'__esModule',{value:!0}),Object.defineProperty(_e,"W3mPayQuoteView",{enumerable:!0,get:function(){return b}});var e=_r(_d[0]),t=_r(_d[1]),s=_r(_d[2]),i=_r(_d[3]),n=_r(_d[4]),o=_r(_d[5]),r=_r(_d[6]);_r(_d[7]),_r(_d[8]),_r(_d[9]);var l=_r(_d[10]),c=_r(_d[11]);_r(_d[12]),_r(_d[13]),_r(_d[14]),_r(_d[15]),_r(_d[16]);var h,u=_r(_d[17]),d=_r(_d[18]),p=_r(_d[19]),y=(h=p)&&h.__esModule?h:{default:h},f=this&&this.__decorate||function(e,t,s,i){var n,o=arguments.length,r=o<3?t:null===i?i=Object.getOwnPropertyDescriptor(t,s):i;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)r=Reflect.decorate(e,t,s,i);else for(var l=e.length-1;l>=0;l--)(n=e[l])&&(r=(o<3?n(r):o>3?n(t,s,r):n(t,s))||r);return o>3&&r&&Object.defineProperty(t,s,r),r};const w={eip155:{icon:'ethereum',label:'EVM'},solana:{icon:'solana',label:'Solana'},bip122:{icon:'bitcoin',label:'Bitcoin'},ton:{icon:'ton',label:'Ton'}};let b=class extends e.LitElement{constructor(){super(),this.unsubscribe=[],this.profileName=null,this.paymentAsset=c.PayController.state.paymentAsset,this.namespace=void 0,this.caipAddress=void 0,this.amount=c.PayController.state.amount,this.recipient=c.PayController.state.recipient,this.activeConnectorIds=o.ConnectorController.state.activeConnectorIds,this.selectedPaymentAsset=c.PayController.state.selectedPaymentAsset,this.selectedExchange=c.PayController.state.selectedExchange,this.isFetchingQuote=c.PayController.state.isFetchingQuote,this.quoteError=c.PayController.state.quoteError,this.quote=c.PayController.state.quote,this.isFetchingTokenBalances=c.PayController.state.isFetchingTokenBalances,this.tokenBalances=c.PayController.state.tokenBalances,this.isPaymentInProgress=c.PayController.state.isPaymentInProgress,this.exchangeUrlForQuote=c.PayController.state.exchangeUrlForQuote,this.completedTransactionsCount=0,this.unsubscribe.push(c.PayController.subscribeKey('paymentAsset',e=>this.paymentAsset=e)),this.unsubscribe.push(c.PayController.subscribeKey('tokenBalances',e=>this.onTokenBalancesChanged(e))),this.unsubscribe.push(c.PayController.subscribeKey('isFetchingTokenBalances',e=>this.isFetchingTokenBalances=e)),this.unsubscribe.push(o.ConnectorController.subscribeKey('activeConnectorIds',e=>this.activeConnectorIds=e)),this.unsubscribe.push(c.PayController.subscribeKey('selectedPaymentAsset',e=>this.selectedPaymentAsset=e)),this.unsubscribe.push(c.PayController.subscribeKey('isFetchingQuote',e=>this.isFetchingQuote=e)),this.unsubscribe.push(c.PayController.subscribeKey('quoteError',e=>this.quoteError=e)),this.unsubscribe.push(c.PayController.subscribeKey('quote',e=>this.quote=e)),this.unsubscribe.push(c.PayController.subscribeKey('amount',e=>this.amount=e)),this.unsubscribe.push(c.PayController.subscribeKey('recipient',e=>this.recipient=e)),this.unsubscribe.push(c.PayController.subscribeKey('isPaymentInProgress',e=>this.isPaymentInProgress=e)),this.unsubscribe.push(c.PayController.subscribeKey('selectedExchange',e=>this.selectedExchange=e)),this.unsubscribe.push(c.PayController.subscribeKey('exchangeUrlForQuote',e=>this.exchangeUrlForQuote=e)),this.resetQuoteState(),this.initializeNamespace(),this.fetchTokens()}disconnectedCallback(){super.disconnectedCallback(),this.resetAssetsState(),this.unsubscribe.forEach(e=>e())}updated(e){super.updated(e);e.has('selectedPaymentAsset')&&this.fetchQuote()}render(){return e.html`
      <wui-flex flexDirection="column">
        ${this.profileTemplate()}

        <wui-flex
          flexDirection="column"
          gap="4"
          class="payment-methods-container"
          .padding=${['4','4','5','4']}
        >
          ${this.paymentOptionsViewTemplate()} ${this.amountWithFeeTemplate()}

          <wui-flex
            alignItems="center"
            justifyContent="space-between"
            .padding=${['1','0','1','0']}
          >
            <wui-separator></wui-separator>
          </wui-flex>

          ${this.paymentActionsTemplate()}
        </wui-flex>
      </wui-flex>
    `}profileTemplate(){if(this.selectedExchange){const t=n.NumberUtil.formatNumber(this.quote?.origin.amount,{decimals:this.quote?.origin.currency.metadata.decimals??0}).toString();return e.html`
        <wui-flex
          .padding=${['4','3','4','3']}
          alignItems="center"
          justifyContent="space-between"
          gap="2"
        >
          <wui-text variant="lg-regular" color="secondary">Paying with</wui-text>

          ${this.quote?e.html`<wui-text variant="lg-regular" color="primary">
                ${n.NumberUtil.bigNumber(t,{safe:!0}).round(6).toString()}
                ${this.quote.origin.currency.metadata.symbol}
              </wui-text>`:e.html`<wui-shimmer width="80px" height="18px" variant="light"></wui-shimmer>`}
        </wui-flex>
      `}const t=o.CoreHelperUtil.getPlainAddress(this.caipAddress)??'',{name:s,image:r}=this.getWalletProperties({namespace:this.namespace}),{icon:l,label:c}=w[this.namespace]??{};return e.html`
      <wui-flex
        .padding=${['4','3','4','3']}
        alignItems="center"
        justifyContent="space-between"
        gap="2"
      >
        <wui-wallet-switch
          profileName=${(0,i.ifDefined)(this.profileName)}
          address=${(0,i.ifDefined)(t)}
          imageSrc=${(0,i.ifDefined)(r)}
          alt=${(0,i.ifDefined)(s)}
          @click=${this.onConnectOtherWallet.bind(this)}
          data-testid="wui-wallet-switch"
        ></wui-wallet-switch>

        <wui-wallet-switch
          profileName=${(0,i.ifDefined)(c)}
          address=${(0,i.ifDefined)(t)}
          icon=${(0,i.ifDefined)(l)}
          iconSize="xs"
          .enableGreenCircle=${!1}
          alt=${(0,i.ifDefined)(c)}
          @click=${this.onConnectOtherWallet.bind(this)}
          data-testid="wui-wallet-switch"
        ></wui-wallet-switch>
      </wui-flex>
    `}initializeNamespace(){const e=o.ChainController.state.activeChain;this.namespace=e,this.caipAddress=o.ChainController.getAccountData(e)?.caipAddress,this.profileName=o.ChainController.getAccountData(e)?.profileName??null,this.unsubscribe.push(o.ChainController.subscribeChainProp('accountState',e=>this.onAccountStateChanged(e),e))}async fetchTokens(){if(this.namespace){let e;if(this.caipAddress){const{chainId:t,chainNamespace:s}=n.ParseUtil.parseCaipAddress(this.caipAddress),i=`${s}:${t}`;e=o.ChainController.getAllRequestedCaipNetworks().find(e=>e.caipNetworkId===i)}await c.PayController.fetchTokens({caipAddress:this.caipAddress,caipNetwork:e,namespace:this.namespace})}}fetchQuote(){if(this.amount&&this.recipient&&this.selectedPaymentAsset&&this.paymentAsset){const{address:e}=this.caipAddress?n.ParseUtil.parseCaipAddress(this.caipAddress):{};c.PayController.fetchQuote({amount:this.amount.toString(),address:e,sourceToken:this.selectedPaymentAsset,toToken:this.paymentAsset,recipient:this.recipient})}}getWalletProperties({namespace:e}){if(!e)return{name:void 0,image:void 0};const t=this.activeConnectorIds[e];if(!t)return{name:void 0,image:void 0};const s=o.ConnectorController.getConnector({id:t,namespace:e});if(!s)return{name:void 0,image:void 0};const i=o.AssetUtil.getConnectorImage(s);return{name:s.name,image:i}}paymentOptionsViewTemplate(){return e.html`
      <wui-flex flexDirection="column" gap="2">
        <wui-text variant="sm-regular" color="secondary">CHOOSE PAYMENT OPTION</wui-text>
        <wui-flex class="pay-options-container">${this.paymentOptionsTemplate()}</wui-flex>
      </wui-flex>
    `}paymentOptionsTemplate(){const t=this.getPaymentAssetFromTokenBalances();if(this.isFetchingTokenBalances)return e.html`<w3m-pay-options-skeleton></w3m-pay-options-skeleton>`;if(0===t.length)return e.html`<w3m-pay-options-empty
        @connectOtherWallet=${this.onConnectOtherWallet.bind(this)}
      ></w3m-pay-options-empty>`;const n={disabled:this.isFetchingQuote};return e.html`<w3m-pay-options
      class=${(0,s.classMap)(n)}
      .options=${t}
      .selectedPaymentAsset=${(0,i.ifDefined)(this.selectedPaymentAsset)}
      .onSelect=${this.onSelectedPaymentAssetChanged.bind(this)}
    ></w3m-pay-options>`}amountWithFeeTemplate(){return this.isFetchingQuote||!this.selectedPaymentAsset||this.quoteError?e.html`<w3m-pay-fees-skeleton></w3m-pay-fees-skeleton>`:e.html`<w3m-pay-fees></w3m-pay-fees>`}paymentActionsTemplate(){const t=this.isFetchingQuote||this.isFetchingTokenBalances,s=this.isFetchingQuote||this.isFetchingTokenBalances||!this.selectedPaymentAsset||Boolean(this.quoteError),i=n.NumberUtil.formatNumber(this.quote?.origin.amount??0,{decimals:this.quote?.origin.currency.metadata.decimals??0}).toString();return this.selectedExchange?t||s?e.html`
          <wui-shimmer width="100%" height="48px" variant="light" ?rounded=${!0}></wui-shimmer>
        `:e.html`<wui-button
        size="lg"
        fullWidth
        variant="accent-secondary"
        @click=${this.onPayWithExchange.bind(this)}
      >
        ${`Continue in ${this.selectedExchange.name}`}

        <wui-icon name="arrowRight" color="inherit" size="sm" slot="iconRight"></wui-icon>
      </wui-button>`:e.html`
      <wui-flex alignItems="center" justifyContent="space-between">
        <wui-flex flexDirection="column" gap="1">
          <wui-text variant="md-regular" color="secondary">Order Total</wui-text>

          ${t||s?e.html`<wui-shimmer width="58px" height="32px" variant="light"></wui-shimmer>`:e.html`<wui-flex alignItems="center" gap="01">
                <wui-text variant="h4-regular" color="primary">${(0,u.formatAmount)(i)}</wui-text>

                <wui-text variant="lg-regular" color="secondary">
                  ${this.quote?.origin.currency.metadata.symbol||'Unknown'}
                </wui-text>
              </wui-flex>`}
        </wui-flex>

        ${this.actionButtonTemplate({isLoading:t,isDisabled:s})}
      </wui-flex>
    `}actionButtonTemplate(t){const s=(0,d.getTransactionsSteps)(this.quote),{isLoading:i,isDisabled:n}=t;let o='Pay';return s.length>1&&0===this.completedTransactionsCount&&(o='Approve'),e.html`
      <wui-button
        size="lg"
        variant="accent-primary"
        ?loading=${i||this.isPaymentInProgress}
        ?disabled=${n||this.isPaymentInProgress}
        @click=${()=>{s.length>0?this.onSendTransactions():this.onTransfer()}}
      >
        ${o}
        ${i?null:e.html`<wui-icon
              name="arrowRight"
              color="inherit"
              size="sm"
              slot="iconRight"
            ></wui-icon>`}
      </wui-button>
    `}getPaymentAssetFromTokenBalances(){if(!this.namespace)return[];return(this.tokenBalances[this.namespace]??[]).map(e=>{try{return(0,u.formatBalanceToPaymentAsset)(e)}catch(e){return null}}).filter(e=>Boolean(e)).filter(e=>{const{chainId:t}=n.ParseUtil.parseCaipNetworkId(e.network),{chainId:s}=n.ParseUtil.parseCaipNetworkId(this.paymentAsset.network);return!!l.HelpersUtil.isLowerCaseMatch(e.asset,this.paymentAsset.asset)||(!this.selectedExchange||!l.HelpersUtil.isLowerCaseMatch(t.toString(),s.toString()))})}onTokenBalancesChanged(e){this.tokenBalances=e;const[t]=this.getPaymentAssetFromTokenBalances();t&&c.PayController.setSelectedPaymentAsset(t)}async onConnectOtherWallet(){await o.ConnectorController.connect(),await o.ModalController.open({view:'PayQuote'})}onAccountStateChanged(e){const{address:t}=this.caipAddress?n.ParseUtil.parseCaipAddress(this.caipAddress):{};if(this.caipAddress=e?.caipAddress,this.profileName=e?.profileName??null,t){const{address:e}=this.caipAddress?n.ParseUtil.parseCaipAddress(this.caipAddress):{};e?l.HelpersUtil.isLowerCaseMatch(e,t)||(this.resetAssetsState(),this.resetQuoteState(),this.fetchTokens()):o.ModalController.close()}}onSelectedPaymentAssetChanged(e){this.isFetchingQuote||c.PayController.setSelectedPaymentAsset(e)}async onTransfer(){const e=(0,d.getTransferStep)(this.quote);if(e){if(!l.HelpersUtil.isLowerCaseMatch(this.selectedPaymentAsset?.asset,e.deposit.currency))throw new Error('Quote asset is not the same as the selected payment asset');const t=this.selectedPaymentAsset?.amount??'0',s=n.NumberUtil.formatNumber(e.deposit.amount,{decimals:this.selectedPaymentAsset?.metadata.decimals??0}).toString();if(!n.NumberUtil.bigNumber(t).gte(s))return void o.SnackController.showError('Insufficient funds');if(this.quote&&this.selectedPaymentAsset&&this.caipAddress&&this.namespace){const{address:t}=n.ParseUtil.parseCaipAddress(this.caipAddress);await c.PayController.onTransfer({chainNamespace:this.namespace,fromAddress:t,toAddress:e.deposit.receiver,amount:s,paymentAsset:this.selectedPaymentAsset}),c.PayController.setRequestId(e.requestId),o.RouterController.push('PayLoading')}}}async onSendTransactions(){const e=this.selectedPaymentAsset?.amount??'0',t=n.NumberUtil.formatNumber(this.quote?.origin.amount??0,{decimals:this.selectedPaymentAsset?.metadata.decimals??0}).toString();if(!n.NumberUtil.bigNumber(e).gte(t))return void o.SnackController.showError('Insufficient funds');const s=(0,d.getTransactionsSteps)(this.quote),[i]=(0,d.getTransactionsSteps)(this.quote,this.completedTransactionsCount);if(i&&this.namespace){await c.PayController.onSendTransaction({namespace:this.namespace,transactionStep:i}),this.completedTransactionsCount+=1;this.completedTransactionsCount===s.length&&(c.PayController.setRequestId(i.requestId),o.RouterController.push('PayLoading'))}}onPayWithExchange(){if(this.exchangeUrlForQuote){const e=o.CoreHelperUtil.returnOpenHref('','popupWindow','scrollbar=yes,width=480,height=720');if(!e)throw new Error('Could not create popup window');e.location.href=this.exchangeUrlForQuote;const t=(0,d.getTransferStep)(this.quote);t&&c.PayController.setRequestId(t.requestId),c.PayController.initiatePayment(),o.RouterController.push('PayLoading')}}resetAssetsState(){c.PayController.setSelectedPaymentAsset(null)}resetQuoteState(){c.PayController.resetQuoteState()}};b.styles=y.default,f([(0,t.state)()],b.prototype,"profileName",void 0),f([(0,t.state)()],b.prototype,"paymentAsset",void 0),f([(0,t.state)()],b.prototype,"namespace",void 0),f([(0,t.state)()],b.prototype,"caipAddress",void 0),f([(0,t.state)()],b.prototype,"amount",void 0),f([(0,t.state)()],b.prototype,"recipient",void 0),f([(0,t.state)()],b.prototype,"activeConnectorIds",void 0),f([(0,t.state)()],b.prototype,"selectedPaymentAsset",void 0),f([(0,t.state)()],b.prototype,"selectedExchange",void 0),f([(0,t.state)()],b.prototype,"isFetchingQuote",void 0),f([(0,t.state)()],b.prototype,"quoteError",void 0),f([(0,t.state)()],b.prototype,"quote",void 0),f([(0,t.state)()],b.prototype,"isFetchingTokenBalances",void 0),f([(0,t.state)()],b.prototype,"tokenBalances",void 0),f([(0,t.state)()],b.prototype,"isPaymentInProgress",void 0),f([(0,t.state)()],b.prototype,"exchangeUrlForQuote",void 0),f([(0,t.state)()],b.prototype,"completedTransactionsCount",void 0),b=f([(0,r.customElement)('w3m-pay-quote-view')],b)},4246,[2549,2575,2625,2586,2169,2164,2546,2650,2651,2692,2534,4233,4247,4249,4251,4253,4255,4238,4237,4257]);
__d(function(g,_r,_i,a,m,_e,_d){"use strict";Object.defineProperty(_e,'__esModule',{value:!0}),Object.defineProperty(_e,"W3mPayFeesSkeleton",{enumerable:!0,get:function(){return l}});var e=_r(_d[0]),t=_r(_d[1]);_r(_d[2]),_r(_d[3]),_r(_d[4]);var i,r=_r(_d[5]),n=(i=r)&&i.__esModule?i:{default:i},u=this&&this.__decorate||function(e,t,i,r){var n,u=arguments.length,l=u<3?t:null===r?r=Object.getOwnPropertyDescriptor(t,i):r;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)l=Reflect.decorate(e,t,i,r);else for(var s=e.length-1;s>=0;s--)(n=e[s])&&(l=(u<3?n(l):u>3?n(t,i,l):n(t,i))||l);return u>3&&l&&Object.defineProperty(t,i,l),l};let l=class extends e.LitElement{render(){return e.html`
      <wui-flex flexDirection="column" gap="4">
        <wui-flex alignItems="center" justifyContent="space-between">
          <wui-text variant="md-regular" color="secondary">Pay</wui-text>
          <wui-shimmer width="60px" height="16px" borderRadius="4xs" variant="light"></wui-shimmer>
        </wui-flex>

        <wui-flex alignItems="center" justifyContent="space-between">
          <wui-text variant="md-regular" color="secondary">Network Fee</wui-text>

          <wui-flex flexDirection="column" alignItems="flex-end" gap="2">
            <wui-shimmer
              width="75px"
              height="16px"
              borderRadius="4xs"
              variant="light"
            ></wui-shimmer>

            <wui-flex alignItems="center" gap="01">
              <wui-shimmer width="14px" height="14px" rounded variant="light"></wui-shimmer>
              <wui-shimmer
                width="49px"
                height="14px"
                borderRadius="4xs"
                variant="light"
              ></wui-shimmer>
            </wui-flex>
          </wui-flex>
        </wui-flex>

        <wui-flex alignItems="center" justifyContent="space-between">
          <wui-text variant="md-regular" color="secondary">Service Fee</wui-text>
          <wui-shimmer width="75px" height="16px" borderRadius="4xs" variant="light"></wui-shimmer>
        </wui-flex>
      </wui-flex>
    `}};l.styles=[n.default],l=u([(0,t.customElement)('w3m-pay-fees-skeleton')],l)},4247,[2549,2546,2650,2773,2651,4248]);
__d(function(g,r,i,a,m,e,d){"use strict";Object.defineProperty(e,'__esModule',{value:!0}),Object.defineProperty(e,"default",{enumerable:!0,get:function(){return t}});var t=r(d[0]).css`
  :host {
    display: block;
  }
`},4248,[2549]);
__d(function(g,_r,_i,a,m,_e,_d){"use strict";Object.defineProperty(_e,'__esModule',{value:!0}),Object.defineProperty(_e,"W3mPayFees",{enumerable:!0,get:function(){return w}});var e=_r(_d[0]),t=_r(_d[1]),r=_r(_d[2]),i=_r(_d[3]),n=_r(_d[4]),o=_r(_d[5]);_r(_d[6]),_r(_d[7]),_r(_d[8]);var u,l=_r(_d[9]),s=_r(_d[10]),c=_r(_d[11]),d=(u=c)&&u.__esModule?u:{default:u},f=this&&this.__decorate||function(e,t,r,i){var n,o=arguments.length,u=o<3?t:null===i?i=Object.getOwnPropertyDescriptor(t,r):i;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)u=Reflect.decorate(e,t,r,i);else for(var l=e.length-1;l>=0;l--)(n=e[l])&&(u=(o<3?n(u):o>3?n(t,r,u):n(t,r))||u);return o>3&&u&&Object.defineProperty(t,r,u),u};let w=class extends e.LitElement{constructor(){super(),this.unsubscribe=[],this.quote=s.PayController.state.quote,this.unsubscribe.push(s.PayController.subscribeKey('quote',e=>this.quote=e))}disconnectedCallback(){this.unsubscribe.forEach(e=>e())}render(){const t=i.NumberUtil.formatNumber(this.quote?.origin.amount||'0',{decimals:this.quote?.origin.currency.metadata.decimals??0,round:6}).toString();return e.html`
      <wui-flex flexDirection="column" gap="4">
        <wui-flex alignItems="center" justifyContent="space-between">
          <wui-text variant="md-regular" color="secondary">Pay</wui-text>
          <wui-text variant="md-regular" color="primary">
            ${t} ${this.quote?.origin.currency.metadata.symbol||'Unknown'}
          </wui-text>
        </wui-flex>

        ${this.quote&&this.quote.fees.length>0?this.quote.fees.map(e=>this.renderFee(e)):null}
      </wui-flex>
    `}renderFee(t){const o='network'===t.id,u=i.NumberUtil.formatNumber(t.amount||'0',{decimals:t.currency.metadata.decimals??0,round:6}).toString();if(o){const i=n.ChainController.getAllRequestedCaipNetworks().find(e=>l.HelpersUtil.isLowerCaseMatch(e.caipNetworkId,t.currency.network));return e.html`
        <wui-flex alignItems="center" justifyContent="space-between">
          <wui-text variant="md-regular" color="secondary">${t.label}</wui-text>

          <wui-flex flexDirection="column" alignItems="flex-end" gap="2">
            <wui-text variant="md-regular" color="primary">
              ${u} ${t.currency.metadata.symbol||'Unknown'}
            </wui-text>

            <wui-flex alignItems="center" gap="01">
              <wui-image
                src=${(0,r.ifDefined)(n.AssetUtil.getNetworkImage(i))}
                size="xs"
              ></wui-image>
              <wui-text variant="sm-regular" color="secondary">
                ${i?.name||'Unknown'}
              </wui-text>
            </wui-flex>
          </wui-flex>
        </wui-flex>
      `}return e.html`
      <wui-flex alignItems="center" justifyContent="space-between">
        <wui-text variant="md-regular" color="secondary">${t.label}</wui-text>
        <wui-text variant="md-regular" color="primary">
          ${u} ${t.currency.metadata.symbol||'Unknown'}
        </wui-text>
      </wui-flex>
    `}};w.styles=[d.default],f([(0,t.state)()],w.prototype,"quote",void 0),w=f([(0,o.customElement)('w3m-pay-fees')],w)},4249,[2549,2575,2586,2169,2164,2546,2650,3826,2651,2534,4233,4250]);
__d(function(g,r,i,a,m,e,d){"use strict";Object.defineProperty(e,'__esModule',{value:!0}),Object.defineProperty(e,"default",{enumerable:!0,get:function(){return t}});var t=r(d[0]).css`
  :host {
    display: block;
  }

  wui-image {
    border-radius: ${({borderRadius:t})=>t.round};
  }
`},4250,[2546]);
__d(function(g,_r,_i,a,m,_e,_d){"use strict";Object.defineProperty(_e,'__esModule',{value:!0}),Object.defineProperty(_e,"W3mPayOptionsEmpty",{enumerable:!0,get:function(){return l}});var e=_r(_d[0]),t=_r(_d[1]),n=_r(_d[2]);_r(_d[3]),_r(_d[4]),_r(_d[5]),_r(_d[6]);var c,r=_r(_d[7]),o=_r(_d[8]),i=(c=o)&&c.__esModule?c:{default:c},s=this&&this.__decorate||function(e,t,n,c){var r,o=arguments.length,i=o<3?t:null===c?c=Object.getOwnPropertyDescriptor(t,n):c;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)i=Reflect.decorate(e,t,n,c);else for(var s=e.length-1;s>=0;s--)(r=e[s])&&(i=(o<3?r(i):o>3?r(t,n,i):r(t,n))||i);return o>3&&i&&Object.defineProperty(t,n,i),i};let l=class extends e.LitElement{constructor(){super(),this.unsubscribe=[],this.selectedExchange=r.PayController.state.selectedExchange,this.unsubscribe.push(r.PayController.subscribeKey('selectedExchange',e=>this.selectedExchange=e))}disconnectedCallback(){this.unsubscribe.forEach(e=>e())}render(){const t=Boolean(this.selectedExchange);return e.html`
      <wui-flex
        flexDirection="column"
        alignItems="center"
        justifyContent="center"
        gap="3"
        class="disabled-container"
      >
        <wui-icon name="coins" color="default" size="inherit"></wui-icon>

        <wui-text variant="md-regular" color="primary" align="center">
          You don't have enough funds to complete this transaction
        </wui-text>

        ${t?null:e.html`<wui-button
              size="md"
              variant="neutral-secondary"
              @click=${this.dispatchConnectOtherWalletEvent.bind(this)}
              >Connect other wallet</wui-button
            >`}
      </wui-flex>
    `}dispatchConnectOtherWalletEvent(){this.dispatchEvent(new CustomEvent('connectOtherWallet',{detail:!0,bubbles:!0,composed:!0}))}};l.styles=[i.default],s([(0,t.property)({type:Array})],l.prototype,"selectedExchange",void 0),l=s([(0,n.customElement)('w3m-pay-options-empty')],l)},4251,[2549,2575,2546,2683,2650,2658,2651,4233,4252]);
__d(function(g,r,i,a,m,e,d){"use strict";Object.defineProperty(e,'__esModule',{value:!0}),Object.defineProperty(e,"default",{enumerable:!0,get:function(){return t}});var t=r(d[0]).css`
  :host {
    display: block;
    width: 100%;
  }

  .disabled-container {
    padding: ${({spacing:t})=>t[2]};
    min-height: 168px;
  }

  wui-icon {
    width: ${({spacing:t})=>t[8]};
    height: ${({spacing:t})=>t[8]};
  }

  wui-flex > wui-text {
    max-width: 273px;
  }
`},4252,[2546]);
__d(function(g,_r,_i,a,m,_e,_d){"use strict";Object.defineProperty(_e,'__esModule',{value:!0}),Object.defineProperty(_e,"W3mPayOptionsSkeleton",{enumerable:!0,get:function(){return s}});var e=_r(_d[0]),t=_r(_d[1]);_r(_d[2]),_r(_d[3]);var i,n=_r(_d[4]),r=(i=n)&&i.__esModule?i:{default:i},l=this&&this.__decorate||function(e,t,i,n){var r,l=arguments.length,s=l<3?t:null===n?n=Object.getOwnPropertyDescriptor(t,i):n;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)s=Reflect.decorate(e,t,i,n);else for(var o=e.length-1;o>=0;o--)(r=e[o])&&(s=(l<3?r(s):l>3?r(t,i,s):r(t,i))||s);return l>3&&s&&Object.defineProperty(t,i,s),s};let s=class extends e.LitElement{render(){return e.html`
      <wui-flex flexDirection="column" gap="2" class="pay-options-container">
        ${this.renderOptionEntry()} ${this.renderOptionEntry()} ${this.renderOptionEntry()}
      </wui-flex>
    `}renderOptionEntry(){return e.html`
      <wui-flex
        alignItems="center"
        justifyContent="space-between"
        gap="2"
        class="pay-option-container"
      >
        <wui-flex alignItems="center" gap="2">
          <wui-flex class="token-images-container">
            <wui-shimmer
              width="32px"
              height="32px"
              rounded
              variant="light"
              class="token-image"
            ></wui-shimmer>
            <wui-shimmer
              width="16px"
              height="16px"
              rounded
              variant="light"
              class="chain-image"
            ></wui-shimmer>
          </wui-flex>

          <wui-flex flexDirection="column" gap="1">
            <wui-shimmer
              width="74px"
              height="16px"
              borderRadius="4xs"
              variant="light"
            ></wui-shimmer>
            <wui-shimmer
              width="46px"
              height="14px"
              borderRadius="4xs"
              variant="light"
            ></wui-shimmer>
          </wui-flex>
        </wui-flex>
      </wui-flex>
    `}};s.styles=[r.default],s=l([(0,t.customElement)('w3m-pay-options-skeleton')],s)},4253,[2549,2546,2650,2773,4254]);
__d(function(g,r,i,a,m,e,d){"use strict";Object.defineProperty(e,'__esModule',{value:!0}),Object.defineProperty(e,"default",{enumerable:!0,get:function(){return o}});var o=r(d[0]).css`
  :host {
    display: block;
    width: 100%;
  }

  .pay-options-container {
    max-height: 196px;
    overflow-y: auto;
    overflow-x: hidden;
    scrollbar-width: none;
  }

  .pay-options-container::-webkit-scrollbar {
    display: none;
  }

  .pay-option-container {
    border-radius: ${({borderRadius:o})=>o[4]};
    padding: ${({spacing:o})=>o[3]};
    min-height: 60px;
  }

  .token-images-container {
    position: relative;
    justify-content: center;
    align-items: center;
  }

  .chain-image {
    position: absolute;
    bottom: -3px;
    right: -5px;
    border: 2px solid ${({tokens:o})=>o.theme.foregroundSecondary};
  }
`},4254,[2546]);
__d(function(g,_r,_i,a,m,_e,_d){"use strict";Object.defineProperty(_e,'__esModule',{value:!0}),Object.defineProperty(_e,"W3mPayOptions",{enumerable:!0,get:function(){return u}});var t=_r(_d[0]),e=_r(_d[1]),o=_r(_d[2]),i=_r(_d[3]),s=_r(_d[4]),r=_r(_d[5]);_r(_d[6]),_r(_d[7]);var n,l=_r(_d[8]),c=(n=l)&&n.__esModule?n:{default:n},p=this&&this.__decorate||function(t,e,o,i){var s,r=arguments.length,n=r<3?e:null===i?i=Object.getOwnPropertyDescriptor(e,o):i;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)n=Reflect.decorate(t,e,o,i);else for(var l=t.length-1;l>=0;l--)(s=t[l])&&(n=(r<3?s(n):r>3?s(e,o,n):s(e,o))||n);return r>3&&n&&Object.defineProperty(e,o,n),n};let u=class extends t.LitElement{constructor(){super(),this.unsubscribe=[],this.options=[],this.selectedPaymentAsset=null}disconnectedCallback(){this.unsubscribe.forEach(t=>t()),this.resizeObserver?.disconnect();const t=this.shadowRoot?.querySelector('.pay-options-container');t?.removeEventListener('scroll',this.handleOptionsListScroll.bind(this))}firstUpdated(){const t=this.shadowRoot?.querySelector('.pay-options-container');t&&(requestAnimationFrame(this.handleOptionsListScroll.bind(this)),t?.addEventListener('scroll',this.handleOptionsListScroll.bind(this)),this.resizeObserver=new ResizeObserver(()=>{this.handleOptionsListScroll()}),this.resizeObserver?.observe(t),this.handleOptionsListScroll())}render(){return t.html`
      <wui-flex flexDirection="column" gap="2" class="pay-options-container">
        ${this.options.map(t=>this.payOptionTemplate(t))}
      </wui-flex>
    `}payOptionTemplate(e){const{network:r,metadata:n,asset:l,amount:c="0"}=e,p=s.ChainController.getAllRequestedCaipNetworks().find(t=>t.caipNetworkId===r),u=`${r}:${l}`===`${this.selectedPaymentAsset?.network}:${this.selectedPaymentAsset?.asset}`,y=i.NumberUtil.bigNumber(c,{safe:!0}),d=y.gt(0);return t.html`
      <wui-flex
        alignItems="center"
        justifyContent="space-between"
        gap="2"
        @click=${()=>this.onSelect?.(e)}
        class="pay-option-container"
      >
        <wui-flex alignItems="center" gap="2">
          <wui-flex class="token-images-container">
            <wui-image
              src=${(0,o.ifDefined)(n.logoURI)}
              class="token-image"
              size="3xl"
            ></wui-image>
            <wui-image
              src=${(0,o.ifDefined)(s.AssetUtil.getNetworkImage(p))}
              class="chain-image"
              size="md"
            ></wui-image>
          </wui-flex>

          <wui-flex flexDirection="column" gap="1">
            <wui-text variant="lg-regular" color="primary">${n.symbol}</wui-text>
            ${d?t.html`<wui-text variant="sm-regular" color="secondary">
                  ${y.round(6).toString()} ${n.symbol}
                </wui-text>`:null}
          </wui-flex>
        </wui-flex>

        ${u?t.html`<wui-icon name="checkmark" size="md" color="success"></wui-icon>`:null}
      </wui-flex>
    `}handleOptionsListScroll(){const t=this.shadowRoot?.querySelector('.pay-options-container');if(!t)return;t.scrollHeight>300?(t.style.setProperty('--options-mask-image',"linear-gradient(\n          to bottom,\n          rgba(0, 0, 0, calc(1 - var(--options-scroll--top-opacity))) 0px,\n          rgba(200, 200, 200, calc(1 - var(--options-scroll--top-opacity))) 1px,\n          black 50px,\n          black calc(100% - 50px),\n          rgba(155, 155, 155, calc(1 - var(--options-scroll--bottom-opacity))) calc(100% - 1px),\n          rgba(0, 0, 0, calc(1 - var(--options-scroll--bottom-opacity))) 100%\n        )"),t.style.setProperty('--options-scroll--top-opacity',r.MathUtil.interpolate([0,50],[0,1],t.scrollTop).toString()),t.style.setProperty('--options-scroll--bottom-opacity',r.MathUtil.interpolate([0,50],[0,1],t.scrollHeight-t.scrollTop-t.offsetHeight).toString())):(t.style.setProperty('--options-mask-image','none'),t.style.setProperty('--options-scroll--top-opacity','0'),t.style.setProperty('--options-scroll--bottom-opacity','0'))}};u.styles=[c.default],p([(0,e.property)({type:Array})],u.prototype,"options",void 0),p([(0,e.property)()],u.prototype,"selectedPaymentAsset",void 0),p([(0,e.property)()],u.prototype,"onSelect",void 0),u=p([(0,r.customElement)('w3m-pay-options')],u)},4255,[2549,2575,2586,2169,2164,2546,2650,2651,4256]);
__d(function(g,r,i,a,m,e,d){"use strict";Object.defineProperty(e,'__esModule',{value:!0}),Object.defineProperty(e,"default",{enumerable:!0,get:function(){return o}});var o=r(d[0]).css`
  :host {
    display: block;
    width: 100%;
  }

  .pay-options-container {
    max-height: 196px;
    overflow-y: auto;
    overflow-x: hidden;
    scrollbar-width: none;
    mask-image: var(--options-mask-image);
    -webkit-mask-image: var(--options-mask-image);
  }

  .pay-options-container::-webkit-scrollbar {
    display: none;
  }

  .pay-option-container {
    cursor: pointer;
    border-radius: ${({borderRadius:o})=>o[4]};
    padding: ${({spacing:o})=>o[3]};
    transition: background-color ${({durations:o})=>o.lg}
      ${({easings:o})=>o['ease-out-power-1']};
    will-change: background-color;
  }

  .token-images-container {
    position: relative;
    justify-content: center;
    align-items: center;
  }

  .token-image {
    border-radius: ${({borderRadius:o})=>o.round};
    width: 32px;
    height: 32px;
  }

  .chain-image {
    position: absolute;
    width: 16px;
    height: 16px;
    bottom: -3px;
    right: -5px;
    border-radius: ${({borderRadius:o})=>o.round};
    border: 2px solid ${({tokens:o})=>o.theme.backgroundPrimary};
  }

  @media (hover: hover) and (pointer: fine) {
    .pay-option-container:hover {
      background-color: ${({tokens:o})=>o.theme.foregroundPrimary};
    }
  }
`},4256,[2546]);
__d(function(g,r,i,a,m,e,d){"use strict";Object.defineProperty(e,'__esModule',{value:!0}),Object.defineProperty(e,"default",{enumerable:!0,get:function(){return o}});var o=r(d[0]).css`
  .payment-methods-container {
    background-color: ${({tokens:o})=>o.theme.foregroundPrimary};
    border-top-right-radius: ${({borderRadius:o})=>o[5]};
    border-top-left-radius: ${({borderRadius:o})=>o[5]};
  }

  .pay-options-container {
    background-color: ${({tokens:o})=>o.theme.foregroundSecondary};
    border-radius: ${({borderRadius:o})=>o[5]};
    padding: ${({spacing:o})=>o[1]};
  }

  w3m-tooltip-trigger {
    display: flex;
    align-items: center;
    justify-content: center;
    max-width: fit-content;
  }

  wui-image {
    border-radius: ${({borderRadius:o})=>o.round};
  }

  w3m-pay-options.disabled {
    opacity: 0.5;
    pointer-events: none;
  }
`},4257,[2546]);
__d(function(g,r,i,a,m,e,d){"use strict";Object.defineProperty(e,'__esModule',{value:!0}),e.openPay=s,e.pay=async function(c,P=o){if(P<=0)throw new n.AppKitPayError(n.AppKitPayErrorCodes.INVALID_PAYMENT_CONFIG,'Timeout must be greater than 0');try{await s(c)}catch(t){if(t instanceof n.AppKitPayError)throw t;throw new n.AppKitPayError(n.AppKitPayErrorCodes.UNABLE_TO_INITIATE_PAYMENT,t.message)}return new Promise((o,s)=>{let c=!1;const l=setTimeout(()=>{c||(c=!0,C(),s(new n.AppKitPayError(n.AppKitPayErrorCodes.GENERIC_PAYMENT_ERROR,'Payment timeout')))},P);function y(){if(c)return;const n=t.PayController.state.currentPayment,s=t.PayController.state.error,u=t.PayController.state.isPaymentInProgress;return'SUCCESS'===n?.status?(c=!0,C(),clearTimeout(l),void o({success:!0,result:n.result})):'FAILED'===n?.status?(c=!0,C(),clearTimeout(l),void o({success:!1,error:s||'Payment failed'})):void(!s||u||n||(c=!0,C(),clearTimeout(l),o({success:!1,error:s})))}const E=u('currentPayment',y),p=u('error',y),f=u('isPaymentInProgress',y),C=(A=[E,p,f],()=>{A.forEach(t=>{try{t()}catch{}})});var A;y()})},e.getAvailableExchanges=function(n){return t.PayController.getAvailableExchanges(n)},e.getPayUrl=function(n,o){return t.PayController.getPayUrl(n,o,!0)},e.openPayUrl=function(n,o,s){return t.PayController.openPayUrl({exchangeId:n,openInNewTab:s},o,!0)},e.getExchanges=function(){return t.PayController.getExchanges()},e.getPayResult=function(){return t.PayController.state.currentPayment?.result},e.getPayError=function(){return t.PayController.state.error},e.getIsPaymentInProgress=function(){return t.PayController.state.isPaymentInProgress},e.subscribeStateKey=u;var t=r(d[0]),n=r(d[1]);const o=3e5;async function s(n){return t.PayController.handleOpenPay(n)}function u(n,o){return t.PayController.subscribeKey(n,o)}},4258,[4233,4234]);
__d(function(g,r,i,a,m,e,d){"use strict";Object.defineProperty(e,'__esModule',{value:!0}),Object.defineProperty(e,"baseETH",{enumerable:!0,get:function(){return t}}),Object.defineProperty(e,"baseUSDC",{enumerable:!0,get:function(){return n}}),Object.defineProperty(e,"baseSepoliaETH",{enumerable:!0,get:function(){return o}}),Object.defineProperty(e,"ethereumUSDC",{enumerable:!0,get:function(){return s}}),Object.defineProperty(e,"optimismUSDC",{enumerable:!0,get:function(){return c}}),Object.defineProperty(e,"arbitrumUSDC",{enumerable:!0,get:function(){return b}}),Object.defineProperty(e,"polygonUSDC",{enumerable:!0,get:function(){return l}}),Object.defineProperty(e,"solanaUSDC",{enumerable:!0,get:function(){return u}}),Object.defineProperty(e,"ethereumUSDT",{enumerable:!0,get:function(){return f}}),Object.defineProperty(e,"optimismUSDT",{enumerable:!0,get:function(){return D}}),Object.defineProperty(e,"arbitrumUSDT",{enumerable:!0,get:function(){return S}}),Object.defineProperty(e,"polygonUSDT",{enumerable:!0,get:function(){return p}}),Object.defineProperty(e,"solanaUSDT",{enumerable:!0,get:function(){return y}}),Object.defineProperty(e,"solanaSOL",{enumerable:!0,get:function(){return U}});const t={network:'eip155:8453',asset:'native',metadata:{name:'Ethereum',symbol:'ETH',decimals:18}},n={network:'eip155:8453',asset:'0x833589fcd6edb6e08f4c7c32d4f71b54bda02913',metadata:{name:'USD Coin',symbol:'USDC',decimals:6}},o={network:'eip155:84532',asset:'native',metadata:{name:'Ethereum',symbol:'ETH',decimals:18}},s={network:'eip155:1',asset:'0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',metadata:{name:'USD Coin',symbol:'USDC',decimals:6}},c={network:'eip155:10',asset:'0x0b2c639c533813f4aa9d7837caf62653d097ff85',metadata:{name:'USD Coin',symbol:'USDC',decimals:6}},b={network:'eip155:42161',asset:'0xaf88d065e77c8cC2239327C5EDb3A432268e5831',metadata:{name:'USD Coin',symbol:'USDC',decimals:6}},l={network:'eip155:137',asset:'0x3c499c542cef5e3811e1192ce70d8cc03d5c3359',metadata:{name:'USD Coin',symbol:'USDC',decimals:6}},u={network:'solana:5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp',asset:'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v',metadata:{name:'USD Coin',symbol:'USDC',decimals:6}},f={network:'eip155:1',asset:'0xdAC17F958D2ee523a2206206994597C13D831ec7',metadata:{name:'Tether USD',symbol:'USDT',decimals:6}},D={network:'eip155:10',asset:'0x94b008aA00579c1307B0EF2c499aD98a8ce58e58',metadata:{name:'Tether USD',symbol:'USDT',decimals:6}},S={network:'eip155:42161',asset:'0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9',metadata:{name:'Tether USD',symbol:'USDT',decimals:6}},p={network:'eip155:137',asset:'0xc2132d05d31c914a87c6611c10748aeb04b58e8f',metadata:{name:'Tether USD',symbol:'USDT',decimals:6}},y={network:'solana:5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp',asset:'Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB',metadata:{name:'Tether USD',symbol:'USDT',decimals:6}},U={network:'solana:5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp',asset:'native',metadata:{name:'Solana',symbol:'SOL',decimals:9}}},4259,[]);