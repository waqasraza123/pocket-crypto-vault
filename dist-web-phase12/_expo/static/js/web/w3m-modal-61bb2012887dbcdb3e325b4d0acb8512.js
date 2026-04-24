__d(function(g,r,i,a,m,e,d){"use strict";Object.defineProperty(e,'__esModule',{value:!0});var t=r(d[0]);Object.keys(t).forEach(function(n){'default'===n||Object.prototype.hasOwnProperty.call(e,n)||Object.defineProperty(e,n,{enumerable:!0,get:function(){return t[n]}})});var n=r(d[1]);Object.keys(n).forEach(function(t){'default'===t||Object.prototype.hasOwnProperty.call(e,t)||Object.defineProperty(e,t,{enumerable:!0,get:function(){return n[t]}})});var c=r(d[2]);Object.keys(c).forEach(function(t){'default'===t||Object.prototype.hasOwnProperty.call(e,t)||Object.defineProperty(e,t,{enumerable:!0,get:function(){return c[t]}})});var o=r(d[3]);Object.keys(o).forEach(function(t){'default'===t||Object.prototype.hasOwnProperty.call(e,t)||Object.defineProperty(e,t,{enumerable:!0,get:function(){return o[t]}})})},3676,[3844,3866,3868,3870]);
__d(function(g,_r,_i,a,m,_e,_d){"use strict";Object.defineProperty(_e,'__esModule',{value:!0}),Object.defineProperty(_e,"W3mModalBase",{enumerable:!0,get:function(){return b}}),Object.defineProperty(_e,"W3mModal",{enumerable:!0,get:function(){return u}}),Object.defineProperty(_e,"AppKitModal",{enumerable:!0,get:function(){return C}});var e=_r(_d[0]),t=_r(_d[1]),o=_r(_d[2]);_r(_d[3]);var r=_r(_d[4]),i=_r(_d[5]);_r(_d[6]),_r(_d[7]),_r(_d[8]),_r(_d[9]),_r(_d[10]),_r(_d[11]),_r(_d[12]);var s=_r(_d[13]);_r(_d[14]),_r(_d[15]);var l,n=_r(_d[16]),d=(l=n)&&l.__esModule?l:{default:l},c=this&&this.__decorate||function(e,t,o,r){var i,s=arguments.length,l=s<3?t:null===r?r=Object.getOwnPropertyDescriptor(t,o):r;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)l=Reflect.decorate(e,t,o,r);else for(var n=e.length-1;n>=0;n--)(i=e[n])&&(l=(s<3?i(l):s>3?i(t,o,l):i(t,o))||l);return s>3&&l&&Object.defineProperty(t,o,l),l};const h='scroll-lock',p={PayWithExchange:'0',PayWithExchangeSelectAsset:'0',Pay:'0',PayQuote:'0',PayLoading:'0'};class b extends e.LitElement{constructor(){super(),this.unsubscribe=[],this.abortController=void 0,this.hasPrefetched=!1,this.enableEmbedded=r.OptionsController.state.enableEmbedded,this.open=r.ModalController.state.open,this.caipAddress=r.ChainController.state.activeCaipAddress,this.caipNetwork=r.ChainController.state.activeCaipNetwork,this.shake=r.ModalController.state.shake,this.filterByNamespace=r.ConnectorController.state.filterByNamespace,this.padding=i.vars.spacing[1],this.mobileFullScreen=r.OptionsController.state.enableMobileFullScreen,this.initializeTheming(),r.ApiController.prefetchAnalyticsConfig(),this.unsubscribe.push(r.ModalController.subscribeKey('open',e=>e?this.onOpen():this.onClose()),r.ModalController.subscribeKey('shake',e=>this.shake=e),r.ChainController.subscribeKey('activeCaipNetwork',e=>this.onNewNetwork(e)),r.ChainController.subscribeKey('activeCaipAddress',e=>this.onNewAddress(e)),r.OptionsController.subscribeKey('enableEmbedded',e=>this.enableEmbedded=e),r.ConnectorController.subscribeKey('filterByNamespace',e=>{this.filterByNamespace===e||r.ChainController.getAccountData(e)?.caipAddress||(r.ApiController.fetchRecommendedWallets(),this.filterByNamespace=e)}),r.RouterController.subscribeKey('view',()=>{this.dataset.border=s.HelpersUtil.hasFooter()?'true':'false',this.padding=p[r.RouterController.state.view]??i.vars.spacing[1]}))}firstUpdated(){if(this.dataset.border=s.HelpersUtil.hasFooter()?'true':'false',this.mobileFullScreen&&this.setAttribute('data-mobile-fullscreen','true'),this.caipAddress){if(this.enableEmbedded)return r.ModalController.close(),void this.prefetch();this.onNewAddress(this.caipAddress)}this.open&&this.onOpen(),this.enableEmbedded&&this.prefetch()}disconnectedCallback(){this.unsubscribe.forEach(e=>e()),this.onRemoveKeyboardListener()}render(){return this.style.setProperty('--local-modal-padding',this.padding),this.enableEmbedded?e.html`${this.contentTemplate()}
        <w3m-tooltip></w3m-tooltip> `:this.open?e.html`
          <wui-flex @click=${this.onOverlayClick.bind(this)} data-testid="w3m-modal-overlay">
            ${this.contentTemplate()}
          </wui-flex>
          <w3m-tooltip></w3m-tooltip>
        `:null}contentTemplate(){return e.html` <wui-card
      shake="${this.shake}"
      data-embedded="${(0,o.ifDefined)(this.enableEmbedded)}"
      role="alertdialog"
      aria-modal="true"
      tabindex="0"
      data-testid="w3m-modal-card"
    >
      <w3m-header></w3m-header>
      <w3m-router></w3m-router>
      <w3m-footer></w3m-footer>
      <w3m-snackbar></w3m-snackbar>
      <w3m-alertbar></w3m-alertbar>
    </wui-card>`}async onOverlayClick(e){if(e.target===e.currentTarget){if(this.mobileFullScreen)return;await this.handleClose()}}async handleClose(){await r.ModalUtil.safeClose()}initializeTheming(){const{themeVariables:e,themeMode:t}=r.ThemeController.state,o=i.UiHelperUtil.getColorTheme(t);(0,i.initializeTheming)(e,o)}onClose(){this.open=!1,this.classList.remove('open'),this.onScrollUnlock(),r.SnackController.hide(),this.onRemoveKeyboardListener()}onOpen(){this.open=!0,this.classList.add('open'),this.onScrollLock(),this.onAddKeyboardListener()}onScrollLock(){const e=document.createElement('style');e.dataset.w3m=h,e.textContent="\n      body {\n        touch-action: none;\n        overflow: hidden;\n        overscroll-behavior: contain;\n      }\n      w3m-modal {\n        pointer-events: auto;\n      }\n    ",document.head.appendChild(e)}onScrollUnlock(){const e=document.head.querySelector(`style[data-w3m="${h}"]`);e&&e.remove()}onAddKeyboardListener(){this.abortController=new AbortController;const e=this.shadowRoot?.querySelector('wui-card');e?.focus(),window.addEventListener('keydown',t=>{if('Escape'===t.key)this.handleClose();else if('Tab'===t.key){const{tagName:o}=t.target;!o||o.includes('W3M-')||o.includes('WUI-')||e?.focus()}},this.abortController)}onRemoveKeyboardListener(){this.abortController?.abort(),this.abortController=void 0}async onNewAddress(e){const t=r.ChainController.state.isSwitchingNamespace,o='ProfileWallets'===r.RouterController.state.view;!e&&!t&&!o&&r.ModalController.close(),await r.SIWXUtil.initializeIfEnabled(e),this.caipAddress=e,r.ChainController.setIsSwitchingNamespace(!1)}onNewNetwork(e){const t=this.caipNetwork,o=t?.caipNetworkId?.toString(),i=e?.caipNetworkId?.toString(),s=o!==i,l='UnsupportedChain'===r.RouterController.state.view,n=r.ModalController.state.open;let d=!1;this.enableEmbedded&&'SwitchNetwork'===r.RouterController.state.view&&(d=!0),s&&r.SwapController.resetState(),n&&l&&(d=!0),d&&'SIWXSignMessage'!==r.RouterController.state.view&&r.RouterController.goBack(),this.caipNetwork=e}prefetch(){this.hasPrefetched||(r.ApiController.prefetch(),r.ApiController.fetchWalletsByPage({page:1}),this.hasPrefetched=!0)}}b.styles=d.default,c([(0,t.property)({type:Boolean})],b.prototype,"enableEmbedded",void 0),c([(0,t.state)()],b.prototype,"open",void 0),c([(0,t.state)()],b.prototype,"caipAddress",void 0),c([(0,t.state)()],b.prototype,"caipNetwork",void 0),c([(0,t.state)()],b.prototype,"shake",void 0),c([(0,t.state)()],b.prototype,"filterByNamespace",void 0),c([(0,t.state)()],b.prototype,"padding",void 0),c([(0,t.state)()],b.prototype,"mobileFullScreen",void 0);let u=class extends b{};u=c([(0,i.customElement)('w3m-modal')],u);let C=class extends b{};C=c([(0,i.customElement)('appkit-modal')],C)},3844,[2549,2575,2586,2169,2164,2546,3845,2650,3848,3853,3860,2729,2731,2663,2648,2647,3865]);
__d(function(g,r,i,a,m,e,d){"use strict";Object.defineProperty(e,'__esModule',{value:!0});var t=r(d[0]);Object.keys(t).forEach(function(n){'default'===n||Object.prototype.hasOwnProperty.call(e,n)||Object.defineProperty(e,n,{enumerable:!0,get:function(){return t[n]}})})},3845,[3846]);
__d(function(g,_r,_i,a,m,_e,_d){"use strict";Object.defineProperty(_e,'__esModule',{value:!0}),Object.defineProperty(_e,"WuiCard",{enumerable:!0,get:function(){return s}});var e,t=_r(_d[0]),r=_r(_d[1]),l=_r(_d[2]),n=_r(_d[3]),o=(e=n)&&e.__esModule?e:{default:e},c=this&&this.__decorate||function(e,t,r,l){var n,o=arguments.length,c=o<3?t:null===l?l=Object.getOwnPropertyDescriptor(t,r):l;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)c=Reflect.decorate(e,t,r,l);else for(var s=e.length-1;s>=0;s--)(n=e[s])&&(c=(o<3?n(c):o>3?n(t,r,c):n(t,r))||c);return o>3&&c&&Object.defineProperty(t,r,c),c};let s=class extends t.LitElement{render(){return t.html`<slot></slot>`}};s.styles=[r.resetStyles,o.default],s=c([(0,l.customElement)('wui-card')],s)},3846,[2549,2548,2559,3847]);
__d(function(g,r,i,a,m,e,d){"use strict";Object.defineProperty(e,'__esModule',{value:!0}),Object.defineProperty(e,"default",{enumerable:!0,get:function(){return o}});var o=r(d[0]).css`
  :host {
    display: block;
    border-radius: clamp(0px, ${({borderRadius:o})=>o[8]}, 44px);
    box-shadow: 0 0 0 1px ${({tokens:o})=>o.theme.foregroundPrimary};
    overflow: hidden;
  }
`},3847,[2555]);
__d(function(g,_r,_i,a,m,_e,_d){"use strict";Object.defineProperty(_e,'__esModule',{value:!0}),Object.defineProperty(_e,"presets",{enumerable:!0,get:function(){return l}}),Object.defineProperty(_e,"W3mAlertBar",{enumerable:!0,get:function(){return u}});var e=_r(_d[0]),r=_r(_d[1]),o=_r(_d[2]),t=_r(_d[3]);_r(_d[4]);var n,s=_r(_d[5]),c=(n=s)&&n.__esModule?n:{default:n},i=this&&this.__decorate||function(e,r,o,t){var n,s=arguments.length,c=s<3?r:null===t?t=Object.getOwnPropertyDescriptor(r,o):t;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)c=Reflect.decorate(e,r,o,t);else for(var i=e.length-1;i>=0;i--)(n=e[i])&&(c=(s<3?n(c):s>3?n(r,o,c):n(r,o))||c);return s>3&&c&&Object.defineProperty(r,o,c),c};const l={info:{backgroundColor:'fg-350',iconColor:'fg-325',icon:'info'},success:{backgroundColor:'success-glass-reown-020',iconColor:'success-125',icon:'checkmark'},warning:{backgroundColor:'warning-glass-reown-020',iconColor:'warning-100',icon:'warningCircle'},error:{backgroundColor:'error-glass-reown-020',iconColor:'error-125',icon:'warning'}};let u=class extends e.LitElement{constructor(){super(),this.unsubscribe=[],this.open=o.AlertController.state.open,this.onOpen(!0),this.unsubscribe.push(o.AlertController.subscribeKey('open',e=>{this.open=e,this.onOpen(!1)}))}disconnectedCallback(){this.unsubscribe.forEach(e=>e())}render(){const{message:r,variant:t}=o.AlertController.state,n=l[t];return e.html`
      <wui-alertbar
        message=${r}
        backgroundColor=${n?.backgroundColor}
        iconColor=${n?.iconColor}
        icon=${n?.icon}
        type=${t}
      ></wui-alertbar>
    `}onOpen(e){this.open?(this.animate([{opacity:0,transform:'scale(0.85)'},{opacity:1,transform:'scale(1)'}],{duration:150,fill:'forwards',easing:'ease'}),this.style.cssText="pointer-events: auto"):e||(this.animate([{opacity:1,transform:'scale(1)'},{opacity:0,transform:'scale(0.85)'}],{duration:150,fill:'forwards',easing:'ease'}),this.style.cssText="pointer-events: none")}};u.styles=c.default,i([(0,r.state)()],u.prototype,"open",void 0),u=i([(0,t.customElement)('w3m-alertbar')],u)},3848,[2549,2575,2164,2546,3849,3852]);
__d(function(g,r,i,a,m,e,d){"use strict";Object.defineProperty(e,'__esModule',{value:!0});var t=r(d[0]);Object.keys(t).forEach(function(n){'default'===n||Object.prototype.hasOwnProperty.call(e,n)||Object.defineProperty(e,n,{enumerable:!0,get:function(){return t[n]}})})},3849,[3850]);
__d(function(g,_r,_i,a,m,_e,_d){"use strict";Object.defineProperty(_e,'__esModule',{value:!0}),Object.defineProperty(_e,"WuiAlertBar",{enumerable:!0,get:function(){return p}});var e=_r(_d[0]),t=_r(_d[1]),i=_r(_d[2]),r=_r(_d[3]);_r(_d[4]),_r(_d[5]),_r(_d[6]);var n,o=_r(_d[7]),s=_r(_d[8]),l=_r(_d[9]),c=(n=l)&&n.__esModule?n:{default:n},u=this&&this.__decorate||function(e,t,i,r){var n,o=arguments.length,s=o<3?t:null===r?r=Object.getOwnPropertyDescriptor(t,i):r;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)s=Reflect.decorate(e,t,i,r);else for(var l=e.length-1;l>=0;l--)(n=e[l])&&(s=(o<3?n(s):o>3?n(t,i,s):n(t,i))||s);return o>3&&s&&Object.defineProperty(t,i,s),s};const f={info:'info',success:'checkmark',warning:'warningCircle',error:'warning'};let p=class extends e.LitElement{constructor(){super(...arguments),this.message='',this.type='info'}render(){return e.html`
      <wui-flex
        data-type=${(0,i.ifDefined)(this.type)}
        flexDirection="row"
        justifyContent="space-between"
        alignItems="center"
        gap="2"
      >
        <wui-flex columnGap="2" flexDirection="row" alignItems="center">
          <wui-flex
            flexDirection="row"
            alignItems="center"
            justifyContent="center"
            class="icon-box"
          >
            <wui-icon color="inherit" size="md" name=${f[this.type]}></wui-icon>
          </wui-flex>
          <wui-text variant="md-medium" color="inherit" data-testid="wui-alertbar-text"
            >${this.message}</wui-text
          >
        </wui-flex>
        <wui-icon
          class="close"
          color="inherit"
          size="sm"
          name="close"
          @click=${this.onClose}
        ></wui-icon>
      </wui-flex>
    `}onClose(){r.AlertController.close()}};p.styles=[o.resetStyles,c.default],u([(0,t.property)()],p.prototype,"message",void 0),u([(0,t.property)()],p.prototype,"type",void 0),p=u([(0,s.customElement)('wui-alertbar')],p)},3850,[2549,2575,2586,2164,2590,2624,2629,2548,2559,3851]);
__d(function(g,r,i,a,m,e,d){"use strict";Object.defineProperty(e,'__esModule',{value:!0}),Object.defineProperty(e,"default",{enumerable:!0,get:function(){return o}});var o=r(d[0]).css`
  :host {
    width: 100%;
  }

  :host > wui-flex {
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: ${({spacing:o})=>o[2]};
    padding: ${({spacing:o})=>o[3]};
    border-radius: ${({borderRadius:o})=>o[6]};
    border: 1px solid ${({tokens:o})=>o.theme.borderPrimary};
    box-sizing: border-box;
    background-color: ${({tokens:o})=>o.theme.foregroundPrimary};
    box-shadow: 0px 0px 16px 0px rgba(0, 0, 0, 0.25);
    color: ${({tokens:o})=>o.theme.textPrimary};
  }

  :host > wui-flex[data-type='info'] {
    .icon-box {
      background-color: ${({tokens:o})=>o.theme.foregroundSecondary};

      wui-icon {
        color: ${({tokens:o})=>o.theme.iconDefault};
      }
    }
  }
  :host > wui-flex[data-type='success'] {
    .icon-box {
      background-color: ${({tokens:o})=>o.core.backgroundSuccess};

      wui-icon {
        color: ${({tokens:o})=>o.core.borderSuccess};
      }
    }
  }
  :host > wui-flex[data-type='warning'] {
    .icon-box {
      background-color: ${({tokens:o})=>o.core.backgroundWarning};

      wui-icon {
        color: ${({tokens:o})=>o.core.borderWarning};
      }
    }
  }
  :host > wui-flex[data-type='error'] {
    .icon-box {
      background-color: ${({tokens:o})=>o.core.backgroundError};

      wui-icon {
        color: ${({tokens:o})=>o.core.borderError};
      }
    }
  }

  wui-flex {
    width: 100%;
  }

  wui-text {
    word-break: break-word;
    flex: 1;
  }

  .close {
    cursor: pointer;
    color: ${({tokens:o})=>o.theme.iconDefault};
  }

  .icon-box {
    height: 40px;
    width: 40px;
    border-radius: ${({borderRadius:o})=>o[2]};
    background-color: var(--local-icon-bg-value);
  }
`},3851,[2555]);
__d(function(g,r,i,a,m,e,d){"use strict";Object.defineProperty(e,'__esModule',{value:!0}),Object.defineProperty(e,"default",{enumerable:!0,get:function(){return t}});var t=r(d[0]).css`
  :host {
    display: block;
    position: absolute;
    top: ${({spacing:t})=>t[3]};
    left: ${({spacing:t})=>t[4]};
    right: ${({spacing:t})=>t[4]};
    opacity: 0;
    pointer-events: none;
  }
`},3852,[2546]);
__d(function(g,_r,_i,a,m,_e,_d){"use strict";Object.defineProperty(_e,'__esModule',{value:!0}),Object.defineProperty(_e,"W3mHeader",{enumerable:!0,get:function(){return p}});var e=_r(_d[0]),t=_r(_d[1]),i=_r(_d[2]),o=_r(_d[3]),n=_r(_d[4]);_r(_d[5]),_r(_d[6]),_r(_d[7]),_r(_d[8]),_r(_d[9]);var r=_r(_d[10]);_r(_d[11]);var l,s=_r(_d[12]),c=(l=s)&&l.__esModule?l:{default:l},h=this&&this.__decorate||function(e,t,i,o){var n,r=arguments.length,l=r<3?t:null===o?o=Object.getOwnPropertyDescriptor(t,i):o;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)l=Reflect.decorate(e,t,i,o);else for(var s=e.length-1;s>=0;s--)(n=e[s])&&(l=(r<3?n(l):r>3?n(t,i,l):n(t,i))||l);return r>3&&l&&Object.defineProperty(t,i,l),l};const d=['SmartSessionList'],u={PayWithExchange:n.vars.tokens.theme.foregroundPrimary};function w(){const e=o.RouterController.state.data?.connector?.name,t=o.RouterController.state.data?.wallet?.name,i=o.RouterController.state.data?.network?.name,n=t??e,r=o.ConnectorController.getConnectors(),l=1===r.length&&'w3m-email'===r[0]?.id,s=o.ChainController.getAccountData()?.socialProvider;return{Connect:`Connect ${l?'Email':''} Wallet`,Create:'Create Wallet',ChooseAccountName:void 0,Account:void 0,AccountSettings:void 0,AllWallets:'All Wallets',ApproveTransaction:'Approve Transaction',BuyInProgress:'Buy',UsageExceeded:'Usage Exceeded',ConnectingExternal:n??'Connect Wallet',ConnectingWalletConnect:n??'WalletConnect',ConnectingWalletConnectBasic:'WalletConnect',ConnectingSiwe:'Sign In',Convert:'Convert',ConvertSelectToken:'Select token',ConvertPreview:'Preview Convert',Downloads:n?`Get ${n}`:'Downloads',EmailLogin:'Email Login',EmailVerifyOtp:'Confirm Email',EmailVerifyDevice:'Register Device',GetWallet:'Get a Wallet',Networks:'Choose Network',OnRampProviders:'Choose Provider',OnRampActivity:'Activity',OnRampTokenSelect:'Select Token',OnRampFiatSelect:'Select Currency',Pay:'How you pay',ProfileWallets:'Wallets',SwitchNetwork:i??'Switch Network',Transactions:'Activity',UnsupportedChain:'Switch Network',UpgradeEmailWallet:'Upgrade Your Wallet',UpdateEmailWallet:'Edit Email',UpdateEmailPrimaryOtp:'Confirm Current Email',UpdateEmailSecondaryOtp:'Confirm New Email',WhatIsABuy:'What is Buy?',RegisterAccountName:'Choose Name',RegisterAccountNameSuccess:'',WalletReceive:'Receive',WalletCompatibleNetworks:'Compatible Networks',Swap:'Swap',SwapSelectToken:'Select Token',SwapPreview:'Preview Swap',WalletSend:'Send',WalletSendPreview:'Review Send',WalletSendSelectToken:'Select Token',WalletSendConfirmed:'Confirmed',WhatIsANetwork:'What is a network?',WhatIsAWallet:'What is a Wallet?',ConnectWallets:'Connect Wallet',ConnectSocials:'All Socials',ConnectingSocial:s?s.charAt(0).toUpperCase()+s.slice(1):'Connect Social',ConnectingMultiChain:'Select Chain',ConnectingFarcaster:'Farcaster',SwitchActiveChain:'Switch Chain',SmartSessionCreated:void 0,SmartSessionList:'Smart Sessions',SIWXSignMessage:'Sign In',PayLoading:'Processing payment...',PayQuote:'Payment Quote',DataCapture:'Profile',DataCaptureOtpConfirm:'Confirm Email',FundWallet:'Fund Wallet',PayWithExchange:'Deposit from Exchange',PayWithExchangeSelectAsset:'Select Asset',SmartAccountSettings:'Smart Account Settings'}}let p=class extends e.LitElement{constructor(){super(),this.unsubscribe=[],this.heading=w()[o.RouterController.state.view],this.network=o.ChainController.state.activeCaipNetwork,this.networkImage=o.AssetUtil.getNetworkImage(this.network),this.showBack=!1,this.prevHistoryLength=1,this.view=o.RouterController.state.view,this.viewDirection='',this.unsubscribe.push(o.AssetController.subscribeNetworkImages(()=>{this.networkImage=o.AssetUtil.getNetworkImage(this.network)}),o.RouterController.subscribeKey('view',e=>{setTimeout(()=>{this.view=e,this.heading=w()[e]},r.ConstantsUtil.ANIMATION_DURATIONS.HeaderText),this.onViewChange(),this.onHistoryChange()}),o.ChainController.subscribeKey('activeCaipNetwork',e=>{this.network=e,this.networkImage=o.AssetUtil.getNetworkImage(this.network)}))}disconnectCallback(){this.unsubscribe.forEach(e=>e())}render(){const t=u[o.RouterController.state.view]??n.vars.tokens.theme.backgroundPrimary;return this.style.setProperty('--local-header-background-color',t),e.html`
      <wui-flex
        .padding=${['0','4','0','4']}
        justifyContent="space-between"
        alignItems="center"
      >
        ${this.leftHeaderTemplate()} ${this.titleTemplate()} ${this.rightHeaderTemplate()}
      </wui-flex>
    `}onWalletHelp(){o.EventsController.sendEvent({type:'track',event:'CLICK_WALLET_HELP'}),o.RouterController.push('WhatIsAWallet')}async onClose(){await o.ModalUtil.safeClose()}rightHeaderTemplate(){const t=o.OptionsController?.state?.features?.smartSessions;return'Account'===o.RouterController.state.view&&t?e.html`<wui-flex>
      <wui-icon-button
        icon="clock"
        size="lg"
        iconSize="lg"
        type="neutral"
        variant="primary"
        @click=${()=>o.RouterController.push('SmartSessionList')}
        data-testid="w3m-header-smart-sessions"
      ></wui-icon-button>
      ${this.closeButtonTemplate()}
    </wui-flex> `:this.closeButtonTemplate()}closeButtonTemplate(){return e.html`
      <wui-icon-button
        icon="close"
        size="lg"
        type="neutral"
        variant="primary"
        iconSize="lg"
        @click=${this.onClose.bind(this)}
        data-testid="w3m-header-close"
      ></wui-icon-button>
    `}titleTemplate(){if('PayQuote'===this.view)return e.html`<w3m-pay-header></w3m-pay-header>`;const t=d.includes(this.view);return e.html`
      <wui-flex
        view-direction="${this.viewDirection}"
        class="w3m-header-title"
        alignItems="center"
        gap="2"
      >
        <wui-text
          display="inline"
          variant="lg-regular"
          color="primary"
          data-testid="w3m-header-text"
        >
          ${this.heading}
        </wui-text>
        ${t?e.html`<wui-tag variant="accent" size="md">Beta</wui-tag>`:null}
      </wui-flex>
    `}leftHeaderTemplate(){const{view:t}=o.RouterController.state,n='Connect'===t,r=o.OptionsController.state.enableEmbedded,l='ApproveTransaction'===t,s='ConnectingSiwe'===t,c='Account'===t,h=o.OptionsController.state.enableNetworkSwitch,d=l||s||n&&r;return c&&h?e.html`<wui-select
        id="dynamic"
        data-testid="w3m-account-select-network"
        active-network=${(0,i.ifDefined)(this.network?.name)}
        @click=${this.onNetworks.bind(this)}
        imageSrc=${(0,i.ifDefined)(this.networkImage)}
      ></wui-select>`:this.showBack&&!d?e.html`<wui-icon-button
        data-testid="header-back"
        id="dynamic"
        icon="chevronLeft"
        size="lg"
        iconSize="lg"
        type="neutral"
        variant="primary"
        @click=${this.onGoBack.bind(this)}
      ></wui-icon-button>`:e.html`<wui-icon-button
      data-hidden=${!n}
      id="dynamic"
      icon="helpCircle"
      size="lg"
      iconSize="lg"
      type="neutral"
      variant="primary"
      @click=${this.onWalletHelp.bind(this)}
    ></wui-icon-button>`}onNetworks(){this.isAllowedNetworkSwitch()&&(o.EventsController.sendEvent({type:'track',event:'CLICK_NETWORKS'}),o.RouterController.push('Networks'))}isAllowedNetworkSwitch(){const e=o.ChainController.getAllRequestedCaipNetworks(),t=!!e&&e.length>1,i=e?.find(({id:e})=>e===this.network?.id);return t||!i}onViewChange(){const{history:e}=o.RouterController.state;let t=r.ConstantsUtil.VIEW_DIRECTION.Next;e.length<this.prevHistoryLength&&(t=r.ConstantsUtil.VIEW_DIRECTION.Prev),this.prevHistoryLength=e.length,this.viewDirection=t}async onHistoryChange(){const{history:e}=o.RouterController.state,t=this.shadowRoot?.querySelector('#dynamic');e.length>1&&!this.showBack&&t?(await t.animate([{opacity:1},{opacity:0}],{duration:200,fill:'forwards',easing:'ease'}).finished,this.showBack=!0,t.animate([{opacity:0},{opacity:1}],{duration:200,fill:'forwards',easing:'ease'})):e.length<=1&&this.showBack&&t&&(await t.animate([{opacity:1},{opacity:0}],{duration:200,fill:'forwards',easing:'ease'}).finished,this.showBack=!1,t.animate([{opacity:0},{opacity:1}],{duration:200,fill:'forwards',easing:'ease'}))}onGoBack(){o.RouterController.goBack()}};p.styles=c.default,h([(0,t.state)()],p.prototype,"heading",void 0),h([(0,t.state)()],p.prototype,"network",void 0),h([(0,t.state)()],p.prototype,"networkImage",void 0),h([(0,t.state)()],p.prototype,"showBack",void 0),h([(0,t.state)()],p.prototype,"prevHistoryLength",void 0),h([(0,t.state)()],p.prototype,"view",void 0),h([(0,t.state)()],p.prototype,"viewDirection",void 0),p=h([(0,n.customElement)('w3m-header')],p)},3853,[2549,2575,2586,2164,2546,2650,3872,3854,2689,2651,2664,3857,3859]);
__d(function(g,r,i,a,m,e,d){"use strict";Object.defineProperty(e,'__esModule',{value:!0});var t=r(d[0]);Object.keys(t).forEach(function(n){'default'===n||Object.prototype.hasOwnProperty.call(e,n)||Object.defineProperty(e,n,{enumerable:!0,get:function(){return t[n]}})})},3854,[3855]);
__d(function(g,_r,_i,a,m,_e,_d){"use strict";Object.defineProperty(_e,'__esModule',{value:!0}),Object.defineProperty(_e,"WuiSelect",{enumerable:!0,get:function(){return p}});var e=_r(_d[0]),t=_r(_d[1]);_r(_d[2]),_r(_d[3]),_r(_d[4]);var i,r=_r(_d[5]),o=_r(_d[6]),s=_r(_d[7]),l=(i=s)&&i.__esModule?i:{default:i},n=this&&this.__decorate||function(e,t,i,r){var o,s=arguments.length,l=s<3?t:null===r?r=Object.getOwnPropertyDescriptor(t,i):r;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)l=Reflect.decorate(e,t,i,r);else for(var n=e.length-1;n>=0;n--)(o=e[n])&&(l=(s<3?o(l):s>3?o(t,i,l):o(t,i))||l);return s>3&&l&&Object.defineProperty(t,i,l),l};const c={lg:'lg-regular',md:'md-regular',sm:'sm-regular'},u={lg:'lg',md:'md',sm:'sm'};let p=class extends e.LitElement{constructor(){super(...arguments),this.imageSrc='',this.text='',this.size='lg',this.type='text-dropdown',this.disabled=!1}render(){return e.html`<button ?disabled=${this.disabled} data-size=${this.size} data-type=${this.type}>
      ${this.imageTemplate()} ${this.textTemplate()}
      <wui-flex class="right-icon-container">
        <wui-icon name="chevronBottom"></wui-icon>
      </wui-flex>
    </button>`}textTemplate(){const t=c[this.size];return this.text?e.html`<wui-text color="primary" variant=${t}>${this.text}</wui-text>`:null}imageTemplate(){if(this.imageSrc)return e.html`<wui-image src=${this.imageSrc} alt="select visual"></wui-image>`;const t=u[this.size];return e.html` <wui-flex class="left-icon-container">
      <wui-icon size=${t} name="networkPlaceholder"></wui-icon>
    </wui-flex>`}};p.styles=[r.resetStyles,r.elementStyles,l.default],n([(0,t.property)()],p.prototype,"imageSrc",void 0),n([(0,t.property)()],p.prototype,"text",void 0),n([(0,t.property)()],p.prototype,"size",void 0),n([(0,t.property)()],p.prototype,"type",void 0),n([(0,t.property)({type:Boolean})],p.prototype,"disabled",void 0),p=n([(0,o.customElement)('wui-select')],p)},3855,[2549,2575,2590,2620,2624,2548,2559,3856]);
__d(function(g,r,i,a,m,e,d){"use strict";Object.defineProperty(e,'__esModule',{value:!0}),Object.defineProperty(e,"default",{enumerable:!0,get:function(){return t}});var t=r(d[0]).css`
  button {
    display: block;
    display: flex;
    align-items: center;
    padding: ${({spacing:t})=>t[1]};
    transition: background-color ${({durations:t})=>t.lg}
      ${({easings:t})=>t['ease-out-power-2']};
    will-change: background-color;
    border-radius: ${({borderRadius:t})=>t[32]};
  }

  wui-image {
    border-radius: 100%;
  }

  wui-text {
    padding-left: ${({spacing:t})=>t[1]};
  }

  .left-icon-container,
  .right-icon-container {
    width: 24px;
    height: 24px;
    justify-content: center;
    align-items: center;
  }

  wui-icon {
    color: ${({tokens:t})=>t.theme.iconDefault};
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

  button[data-size='lg'] wui-image {
    width: 24px;
    height: 24px;
  }

  button[data-size='md'] wui-image {
    width: 20px;
    height: 20px;
  }

  button[data-size='sm'] wui-image {
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

  /* -- Variants --------------------------------------------------------- */
  button[data-type='filled-dropdown'] {
    background-color: ${({tokens:t})=>t.theme.foregroundPrimary};
  }

  button[data-type='text-dropdown'] {
    background-color: transparent;
  }

  /* -- Focus states --------------------------------------------------- */
  button:focus-visible:enabled {
    background-color: ${({tokens:t})=>t.theme.foregroundSecondary};
    box-shadow: 0 0 0 4px ${({tokens:t})=>t.core.foregroundAccent040};
  }

  /* -- Hover & Active states ----------------------------------------------------------- */
  @media (hover: hover) and (pointer: fine) {
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
`},3856,[2555]);
__d(function(g,_r,_i,a,m,_e,_d){"use strict";Object.defineProperty(_e,'__esModule',{value:!0}),Object.defineProperty(_e,"W3mPayHeader",{enumerable:!0,get:function(){return p}});var e=_r(_d[0]),t=_r(_d[1]),r=_r(_d[2]),s=_r(_d[3]),n=_r(_d[4]),o=_r(_d[5]);_r(_d[6]),_r(_d[7]);var i,l=_r(_d[8]),u=(i=l)&&i.__esModule?i:{default:i},c=this&&this.__decorate||function(e,t,r,s){var n,o=arguments.length,i=o<3?t:null===s?s=Object.getOwnPropertyDescriptor(t,r):s;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)i=Reflect.decorate(e,t,r,s);else for(var l=e.length-1;l>=0;l--)(n=e[l])&&(i=(o<3?n(i):o>3?n(t,r,i):n(t,r))||i);return o>3&&i&&Object.defineProperty(t,r,i),i};let p=class extends e.LitElement{constructor(){super(),this.unsubscribe=[],this.paymentAsset=n.PayController.state.paymentAsset,this.amount=n.PayController.state.amount,this.unsubscribe.push(n.PayController.subscribeKey('paymentAsset',e=>{this.paymentAsset=e}),n.PayController.subscribeKey('amount',e=>{this.amount=e}))}disconnectedCallback(){this.unsubscribe.forEach(e=>e())}render(){const t=s.ChainController.getAllRequestedCaipNetworks().find(e=>e.caipNetworkId===this.paymentAsset.network);return e.html`<wui-flex
      alignItems="center"
      gap="1"
      .padding=${['1','2','1','1']}
      class="transfers-badge"
    >
      <wui-image src=${(0,r.ifDefined)(this.paymentAsset.metadata.logoURI)} size="xl"></wui-image>
      <wui-text variant="lg-regular" color="primary">
        ${this.amount} ${this.paymentAsset.metadata.symbol}
      </wui-text>
      <wui-text variant="sm-regular" color="secondary">
        on ${t?.name??'Unknown'}
      </wui-text>
    </wui-flex>`}};p.styles=[u.default],c([(0,t.property)()],p.prototype,"paymentAsset",void 0),c([(0,t.property)()],p.prototype,"amount",void 0),p=c([(0,o.customElement)('w3m-pay-header')],p)},3857,[2549,2575,2586,2164,3674,2546,2650,2651,3858]);
__d(function(g,r,i,a,m,e,d){"use strict";Object.defineProperty(e,'__esModule',{value:!0}),Object.defineProperty(e,"default",{enumerable:!0,get:function(){return o}});var o=r(d[0]).css`
  wui-image {
    border-radius: ${({borderRadius:o})=>o.round};
  }

  .transfers-badge {
    background-color: ${({tokens:o})=>o.theme.foregroundPrimary};
    border: 1px solid ${({tokens:o})=>o.theme.foregroundSecondary};
    border-radius: ${({borderRadius:o})=>o[4]};
  }
`},3858,[2546]);
__d(function(g,r,i,a,m,e,d){"use strict";Object.defineProperty(e,'__esModule',{value:!0}),Object.defineProperty(e,"default",{enumerable:!0,get:function(){return t}});var t=r(d[0]).css`
  :host {
    height: 60px;
  }

  :host > wui-flex {
    box-sizing: border-box;
    background-color: var(--local-header-background-color);
  }

  wui-text {
    background-color: var(--local-header-background-color);
  }

  wui-flex.w3m-header-title {
    transform: translateY(0);
    opacity: 1;
  }

  wui-flex.w3m-header-title[view-direction='prev'] {
    animation:
      slide-down-out 120ms forwards ${({easings:t})=>t['ease-out-power-2']},
      slide-down-in 120ms forwards ${({easings:t})=>t['ease-out-power-2']};
    animation-delay: 0ms, 200ms;
  }

  wui-flex.w3m-header-title[view-direction='next'] {
    animation:
      slide-up-out 120ms forwards ${({easings:t})=>t['ease-out-power-2']},
      slide-up-in 120ms forwards ${({easings:t})=>t['ease-out-power-2']};
    animation-delay: 0ms, 200ms;
  }

  wui-icon-button[data-hidden='true'] {
    opacity: 0 !important;
    pointer-events: none;
  }

  @keyframes slide-up-out {
    from {
      transform: translateY(0px);
      opacity: 1;
    }
    to {
      transform: translateY(3px);
      opacity: 0;
    }
  }

  @keyframes slide-up-in {
    from {
      transform: translateY(-3px);
      opacity: 0;
    }
    to {
      transform: translateY(0);
      opacity: 1;
    }
  }

  @keyframes slide-down-out {
    from {
      transform: translateY(0px);
      opacity: 1;
    }
    to {
      transform: translateY(-3px);
      opacity: 0;
    }
  }

  @keyframes slide-down-in {
    from {
      transform: translateY(3px);
      opacity: 0;
    }
    to {
      transform: translateY(0);
      opacity: 1;
    }
  }
`},3859,[2546]);
__d(function(g,_r,_i,a,m,_e,_d){"use strict";Object.defineProperty(_e,'__esModule',{value:!0}),Object.defineProperty(_e,"W3mSnackBar",{enumerable:!0,get:function(){return l}});var e=_r(_d[0]),t=_r(_d[1]),r=_r(_d[2]),s=_r(_d[3]);_r(_d[4]);var n,o=_r(_d[5]),i=(n=o)&&n.__esModule?n:{default:n},c=this&&this.__decorate||function(e,t,r,s){var n,o=arguments.length,i=o<3?t:null===s?s=Object.getOwnPropertyDescriptor(t,r):s;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)i=Reflect.decorate(e,t,r,s);else for(var c=e.length-1;c>=0;c--)(n=e[c])&&(i=(o<3?n(i):o>3?n(t,r,i):n(t,r))||i);return o>3&&i&&Object.defineProperty(t,r,i),i};let l=class extends e.LitElement{constructor(){super(),this.unsubscribe=[],this.timeout=void 0,this.open=r.SnackController.state.open,this.unsubscribe.push(r.SnackController.subscribeKey('open',e=>{this.open=e,this.onOpen()}))}disconnectedCallback(){clearTimeout(this.timeout),this.unsubscribe.forEach(e=>e())}render(){const{message:t,variant:s}=r.SnackController.state;return e.html` <wui-snackbar message=${t} variant=${s}></wui-snackbar> `}onOpen(){clearTimeout(this.timeout),this.open?(this.animate([{opacity:0,transform:'translateX(-50%) scale(0.85)'},{opacity:1,transform:'translateX(-50%) scale(1)'}],{duration:150,fill:'forwards',easing:'ease'}),this.timeout&&clearTimeout(this.timeout),r.SnackController.state.autoClose&&(this.timeout=setTimeout(()=>r.SnackController.hide(),2500))):this.animate([{opacity:1,transform:'translateX(-50%) scale(1)'},{opacity:0,transform:'translateX(-50%) scale(0.85)'}],{duration:150,fill:'forwards',easing:'ease'})}};l.styles=i.default,c([(0,t.state)()],l.prototype,"open",void 0),l=c([(0,s.customElement)('w3m-snackbar')],l)},3860,[2549,2575,2164,2546,3861,3864]);
__d(function(g,r,i,a,m,e,d){"use strict";Object.defineProperty(e,'__esModule',{value:!0});var t=r(d[0]);Object.keys(t).forEach(function(n){'default'===n||Object.prototype.hasOwnProperty.call(e,n)||Object.defineProperty(e,n,{enumerable:!0,get:function(){return t[n]}})})},3861,[3862]);
__d(function(g,_r,_i,a,m,_e,_d){"use strict";Object.defineProperty(_e,'__esModule',{value:!0}),Object.defineProperty(_e,"WuiSnackbar",{enumerable:!0,get:function(){return l}});var e=_r(_d[0]),t=_r(_d[1]);_r(_d[2]),_r(_d[3]);var r=_r(_d[4]),n=_r(_d[5]);_r(_d[6]);var i,s=_r(_d[7]),o=(i=s)&&i.__esModule?i:{default:i},c=this&&this.__decorate||function(e,t,r,n){var i,s=arguments.length,o=s<3?t:null===n?n=Object.getOwnPropertyDescriptor(t,r):n;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)o=Reflect.decorate(e,t,r,n);else for(var c=e.length-1;c>=0;c--)(i=e[c])&&(o=(s<3?i(o):s>3?i(t,r,o):i(t,r))||o);return s>3&&o&&Object.defineProperty(t,r,o),o};let l=class extends e.LitElement{constructor(){super(...arguments),this.message='',this.variant='success'}render(){return e.html`
      ${this.templateIcon()}
      <wui-text variant="lg-regular" color="primary" data-testid="wui-snackbar-message"
        >${this.message}</wui-text
      >
    `}templateIcon(){return'loading'===this.variant?e.html`<wui-loading-spinner size="md" color="accent-primary"></wui-loading-spinner>`:e.html`<wui-icon-box
      size="md"
      color=${{success:'success',error:'error',warning:'warning',info:'default'}[this.variant]}
      icon=${{success:'checkmark',error:'warning',warning:'warningCircle',info:'info'}[this.variant]}
    ></wui-icon-box>`}};l.styles=[r.resetStyles,o.default],c([(0,t.property)()],l.prototype,"message",void 0),c([(0,t.property)()],l.prototype,"variant",void 0),l=c([(0,n.customElement)('wui-snackbar')],l)},3862,[2549,2575,2622,2624,2548,2559,2643,3863]);
__d(function(g,r,i,a,m,e,d){"use strict";Object.defineProperty(e,'__esModule',{value:!0}),Object.defineProperty(e,"default",{enumerable:!0,get:function(){return o}});var o=r(d[0]).css`
  :host {
    display: flex;
    align-items: center;
    gap: ${({spacing:o})=>o[1]};
    padding: ${({spacing:o})=>o[2]} ${({spacing:o})=>o[3]}
      ${({spacing:o})=>o[2]} ${({spacing:o})=>o[2]};
    border-radius: ${({borderRadius:o})=>o[20]};
    background-color: ${({tokens:o})=>o.theme.foregroundPrimary};
    box-shadow:
      0px 0px 8px 0px rgba(0, 0, 0, 0.1),
      inset 0 0 0 1px ${({tokens:o})=>o.theme.borderPrimary};
    max-width: 320px;
  }

  wui-icon-box {
    border-radius: ${({borderRadius:o})=>o.round} !important;
    overflow: hidden;
  }

  wui-loading-spinner {
    padding: ${({spacing:o})=>o[1]};
    background-color: ${({tokens:o})=>o.core.foregroundAccent010};
    border-radius: ${({borderRadius:o})=>o.round} !important;
  }
`},3863,[2555]);
__d(function(g,r,i,a,m,e,d){"use strict";Object.defineProperty(e,'__esModule',{value:!0}),Object.defineProperty(e,"default",{enumerable:!0,get:function(){return t}});var t=r(d[0]).css`
  :host {
    display: block;
    position: absolute;
    opacity: 0;
    pointer-events: none;
    top: 11px;
    left: 50%;
    width: max-content;
  }
`},3864,[2549]);
__d(function(g,r,i,a,m,e,d){"use strict";Object.defineProperty(e,'__esModule',{value:!0}),Object.defineProperty(e,"default",{enumerable:!0,get:function(){return o}});var o=r(d[0]).css`
  :host {
    z-index: ${({tokens:o})=>o.core.zIndex};
    display: block;
    backface-visibility: hidden;
    will-change: opacity;
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    pointer-events: none;
    opacity: 0;
    background-color: ${({tokens:o})=>o.theme.overlay};
    backdrop-filter: blur(0px);
    transition:
      opacity ${({durations:o})=>o.lg} ${({easings:o})=>o['ease-out-power-2']},
      backdrop-filter ${({durations:o})=>o.lg}
        ${({easings:o})=>o['ease-out-power-2']};
    will-change: opacity;
  }

  :host(.open) {
    opacity: 1;
    backdrop-filter: blur(8px);
  }

  :host(.appkit-modal) {
    position: relative;
    pointer-events: unset;
    background: none;
    width: 100%;
    opacity: 1;
  }

  wui-card {
    max-width: var(--apkt-modal-width);
    width: 100%;
    position: relative;
    outline: none;
    transform: translateY(4px);
    box-shadow: 0 2px 8px 0 rgba(0, 0, 0, 0.05);
    transition:
      transform ${({durations:o})=>o.lg}
        ${({easings:o})=>o['ease-out-power-2']},
      border-radius ${({durations:o})=>o.lg}
        ${({easings:o})=>o['ease-out-power-1']},
      background-color ${({durations:o})=>o.lg}
        ${({easings:o})=>o['ease-out-power-1']},
      box-shadow ${({durations:o})=>o.lg}
        ${({easings:o})=>o['ease-out-power-1']};
    will-change: border-radius, background-color, transform, box-shadow;
    background-color: ${({tokens:o})=>o.theme.backgroundPrimary};
    padding: var(--local-modal-padding);
    box-sizing: border-box;
  }

  :host(.open) wui-card {
    transform: translateY(0px);
  }

  wui-card::before {
    z-index: 1;
    pointer-events: none;
    content: '';
    position: absolute;
    inset: 0;
    border-radius: clamp(0px, var(--apkt-borderRadius-8), 44px);
    transition: box-shadow ${({durations:o})=>o.lg}
      ${({easings:o})=>o['ease-out-power-2']};
    transition-delay: ${({durations:o})=>o.md};
    will-change: box-shadow;
  }

  :host([data-mobile-fullscreen='true']) wui-card::before {
    border-radius: 0px;
  }

  :host([data-border='true']) wui-card::before {
    box-shadow: inset 0px 0px 0px 4px ${({tokens:o})=>o.theme.foregroundSecondary};
  }

  :host([data-border='false']) wui-card::before {
    box-shadow: inset 0px 0px 0px 1px ${({tokens:o})=>o.theme.borderPrimaryDark};
  }

  :host([data-border='true']) wui-card {
    animation:
      fade-in ${({durations:o})=>o.lg} ${({easings:o})=>o['ease-out-power-2']},
      card-background-border var(--apkt-duration-dynamic)
        ${({easings:o})=>o['ease-out-power-2']};
    animation-fill-mode: backwards, both;
    animation-delay: var(--apkt-duration-dynamic);
  }

  :host([data-border='false']) wui-card {
    animation:
      fade-in ${({durations:o})=>o.lg} ${({easings:o})=>o['ease-out-power-2']},
      card-background-default var(--apkt-duration-dynamic)
        ${({easings:o})=>o['ease-out-power-2']};
    animation-fill-mode: backwards, both;
    animation-delay: 0s;
  }

  :host(.appkit-modal) wui-card {
    max-width: var(--apkt-modal-width);
  }

  wui-card[shake='true'] {
    animation:
      fade-in ${({durations:o})=>o.lg} ${({easings:o})=>o['ease-out-power-2']},
      w3m-shake ${({durations:o})=>o.xl}
        ${({easings:o})=>o['ease-out-power-2']};
  }

  wui-flex {
    overflow-x: hidden;
    overflow-y: auto;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    height: 100%;
  }

  @media (max-height: 700px) and (min-width: 431px) {
    wui-flex {
      align-items: flex-start;
    }

    wui-card {
      margin: var(--apkt-spacing-6) 0px;
    }
  }

  @media (max-width: 430px) {
    :host([data-mobile-fullscreen='true']) {
      height: 100dvh;
    }
    :host([data-mobile-fullscreen='true']) wui-flex {
      align-items: stretch;
    }
    :host([data-mobile-fullscreen='true']) wui-card {
      max-width: 100%;
      height: 100%;
      border-radius: 0;
      border: none;
    }
    :host(:not([data-mobile-fullscreen='true'])) wui-flex {
      align-items: flex-end;
    }

    :host(:not([data-mobile-fullscreen='true'])) wui-card {
      max-width: 100%;
      border-bottom: none;
    }

    :host(:not([data-mobile-fullscreen='true'])) wui-card[data-embedded='true'] {
      border-bottom-left-radius: clamp(0px, var(--apkt-borderRadius-8), 44px);
      border-bottom-right-radius: clamp(0px, var(--apkt-borderRadius-8), 44px);
    }

    :host(:not([data-mobile-fullscreen='true'])) wui-card:not([data-embedded='true']) {
      border-bottom-left-radius: 0px;
      border-bottom-right-radius: 0px;
    }

    wui-card[shake='true'] {
      animation: w3m-shake 0.5s ${({easings:o})=>o['ease-out-power-2']};
    }
  }

  @keyframes fade-in {
    0% {
      transform: scale(0.99) translateY(4px);
    }
    100% {
      transform: scale(1) translateY(0);
    }
  }

  @keyframes w3m-shake {
    0% {
      transform: scale(1) rotate(0deg);
    }
    20% {
      transform: scale(1) rotate(-1deg);
    }
    40% {
      transform: scale(1) rotate(1.5deg);
    }
    60% {
      transform: scale(1) rotate(-1.5deg);
    }
    80% {
      transform: scale(1) rotate(1deg);
    }
    100% {
      transform: scale(1) rotate(0deg);
    }
  }

  @keyframes card-background-border {
    from {
      background-color: ${({tokens:o})=>o.theme.backgroundPrimary};
    }
    to {
      background-color: ${({tokens:o})=>o.theme.foregroundSecondary};
    }
  }

  @keyframes card-background-default {
    from {
      background-color: ${({tokens:o})=>o.theme.foregroundSecondary};
    }
    to {
      background-color: ${({tokens:o})=>o.theme.backgroundPrimary};
    }
  }
`},3865,[2546]);
__d(function(g,_r,_i,a,m,_e,_d){"use strict";Object.defineProperty(_e,'__esModule',{value:!0}),Object.defineProperty(_e,"W3mUsageExceededView",{enumerable:!0,get:function(){return l}});var e=_r(_d[0]),t=_r(_d[1]),r=_r(_d[2]);_r(_d[3]),_r(_d[4]),_r(_d[5]),_r(_d[6]);var n,i=_r(_d[7]),o=(n=i)&&n.__esModule?n:{default:n},c=this&&this.__decorate||function(e,t,r,n){var i,o=arguments.length,c=o<3?t:null===n?n=Object.getOwnPropertyDescriptor(t,r):n;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)c=Reflect.decorate(e,t,r,n);else for(var l=e.length-1;l>=0;l--)(i=e[l])&&(c=(o<3?i(c):o>3?i(t,r,c):i(t,r))||c);return o>3&&c&&Object.defineProperty(t,r,c),c};let l=class extends e.LitElement{constructor(){super()}render(){return e.html`
      <wui-flex
        flexDirection="column"
        alignItems="center"
        gap="4"
        .padding="${['1','3','4','3']}"
      >
        <wui-flex justifyContent="center" alignItems="center" class="icon-box">
          <wui-icon size="xxl" color="error" name="warningCircle"></wui-icon>
        </wui-flex>

        <wui-text variant="lg-medium" color="primary" align="center">
          The app isn't responding as expected
        </wui-text>
        <wui-text variant="md-regular" color="secondary" align="center">
          Try again or reach out to the app team for help.
        </wui-text>

        <wui-button
          variant="neutral-secondary"
          size="md"
          @click=${this.onTryAgainClick.bind(this)}
          data-testid="w3m-usage-exceeded-button"
        >
          <wui-icon color="inherit" slot="iconLeft" name="refresh"></wui-icon>
          Try Again
        </wui-button>
      </wui-flex>
    `}onTryAgainClick(){t.RouterController.goBack()}};l.styles=o.default,l=c([(0,r.customElement)('w3m-usage-exceeded-view')],l)},3866,[2549,2164,2546,2683,2650,2658,2651,3867]);
__d(function(g,r,i,a,m,e,d){"use strict";Object.defineProperty(e,'__esModule',{value:!0}),Object.defineProperty(e,"default",{enumerable:!0,get:function(){return o}});var o=r(d[0]).css`
  .icon-box {
    width: 64px;
    height: 64px;
    border-radius: ${({borderRadius:o})=>o[5]};
    background-color: ${({colors:o})=>o.semanticError010};
  }
`},3867,[2546]);
__d(function(g,_r,_i,a,m,_e,_d){"use strict";Object.defineProperty(_e,'__esModule',{value:!0}),Object.defineProperty(_e,"W3mListWallet",{enumerable:!0,get:function(){return d}});var e=_r(_d[0]),t=_r(_d[1]),s=_r(_d[2]),r=_r(_d[3]),i=_r(_d[4]);_r(_d[5]);var o,n=_r(_d[6]),l=(o=n)&&o.__esModule?o:{default:o},p=this&&this.__decorate||function(e,t,s,r){var i,o=arguments.length,n=o<3?t:null===r?r=Object.getOwnPropertyDescriptor(t,s):r;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)n=Reflect.decorate(e,t,s,r);else for(var l=e.length-1;l>=0;l--)(i=e[l])&&(n=(o<3?i(n):o>3?i(t,s,n):i(t,s))||n);return o>3&&n&&Object.defineProperty(t,s,n),n};let d=class extends e.LitElement{constructor(){super(...arguments),this.hasImpressionSent=!1,this.walletImages=[],this.imageSrc='',this.name='',this.size='md',this.tabIdx=void 0,this.disabled=!1,this.showAllWallets=!1,this.loading=!1,this.loadingSpinnerColor='accent-100',this.rdnsId='',this.displayIndex=void 0,this.walletRank=void 0,this.namespaces=[]}connectedCallback(){super.connectedCallback()}disconnectedCallback(){super.disconnectedCallback(),this.cleanupIntersectionObserver()}updated(e){super.updated(e),(e.has('name')||e.has('imageSrc')||e.has('walletRank'))&&(this.hasImpressionSent=!1);e.has('walletRank')&&this.walletRank&&!this.intersectionObserver&&this.setupIntersectionObserver()}setupIntersectionObserver(){this.intersectionObserver=new IntersectionObserver(e=>{e.forEach(e=>{!e.isIntersecting||this.loading||this.hasImpressionSent||this.sendImpressionEvent()})},{threshold:.1}),this.intersectionObserver.observe(this)}cleanupIntersectionObserver(){this.intersectionObserver&&(this.intersectionObserver.disconnect(),this.intersectionObserver=void 0)}sendImpressionEvent(){this.name&&!this.hasImpressionSent&&this.walletRank&&(this.hasImpressionSent=!0,(this.rdnsId||this.name)&&r.EventsController.sendWalletImpressionEvent({name:this.name,walletRank:this.walletRank,rdnsId:this.rdnsId,view:r.RouterController.state.view,displayIndex:this.displayIndex}))}handleGetWalletNamespaces(){return Object.keys(r.AdapterController.state.adapters).length>1?this.namespaces:[]}render(){return e.html`
      <wui-list-wallet
        .walletImages=${this.walletImages}
        imageSrc=${(0,s.ifDefined)(this.imageSrc)}
        name=${this.name}
        size=${(0,s.ifDefined)(this.size)}
        tagLabel=${(0,s.ifDefined)(this.tagLabel)}
        .tagVariant=${this.tagVariant}
        .walletIcon=${this.walletIcon}
        .tabIdx=${this.tabIdx}
        .disabled=${this.disabled}
        .showAllWallets=${this.showAllWallets}
        .loading=${this.loading}
        loadingSpinnerColor=${this.loadingSpinnerColor}
        .namespaces=${this.handleGetWalletNamespaces()}
      ></wui-list-wallet>
    `}};d.styles=l.default,p([(0,t.property)({type:Array})],d.prototype,"walletImages",void 0),p([(0,t.property)()],d.prototype,"imageSrc",void 0),p([(0,t.property)()],d.prototype,"name",void 0),p([(0,t.property)()],d.prototype,"size",void 0),p([(0,t.property)()],d.prototype,"tagLabel",void 0),p([(0,t.property)()],d.prototype,"tagVariant",void 0),p([(0,t.property)()],d.prototype,"walletIcon",void 0),p([(0,t.property)()],d.prototype,"tabIdx",void 0),p([(0,t.property)({type:Boolean})],d.prototype,"disabled",void 0),p([(0,t.property)({type:Boolean})],d.prototype,"showAllWallets",void 0),p([(0,t.property)({type:Boolean})],d.prototype,"loading",void 0),p([(0,t.property)({type:String})],d.prototype,"loadingSpinnerColor",void 0),p([(0,t.property)()],d.prototype,"rdnsId",void 0),p([(0,t.property)()],d.prototype,"displayIndex",void 0),p([(0,t.property)()],d.prototype,"walletRank",void 0),p([(0,t.property)({type:Array})],d.prototype,"namespaces",void 0),d=p([(0,i.customElement)('w3m-list-wallet')],d)},3868,[2549,2575,2586,2164,2546,2807,3869]);
__d(function(g,r,i,a,m,e,d){"use strict";Object.defineProperty(e,'__esModule',{value:!0}),Object.defineProperty(e,"default",{enumerable:!0,get:function(){return t}});var t=r(d[0]).css`
  :host {
    width: 100%;
  }
`},3869,[2546]);
__d(function(g,_r,_i,a,m,_e,_d){"use strict";Object.defineProperty(_e,'__esModule',{value:!0}),Object.defineProperty(_e,"W3mRouterContainer",{enumerable:!0,get:function(){return p}});var t,e=_r(_d[0]),i=_r(_d[1]),r=_r(_d[2]),o=_r(_d[3]),s=_r(_d[4]),n=_r(_d[5]),h=(t=n)&&t.__esModule?t:{default:t},l=this&&this.__decorate||function(t,e,i,r){var o,s=arguments.length,n=s<3?e:null===r?r=Object.getOwnPropertyDescriptor(e,i):r;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)n=Reflect.decorate(t,e,i,r);else for(var h=t.length-1;h>=0;h--)(o=t[h])&&(n=(s<3?o(n):s>3?o(e,i,n):o(e,i))||n);return s>3&&n&&Object.defineProperty(e,i,n),n};let p=class extends e.LitElement{constructor(){super(...arguments),this.resizeObserver=void 0,this.transitionDuration='0.15s',this.transitionFunction='',this.history='',this.view='',this.setView=void 0,this.viewDirection='',this.historyState='',this.previousHeight='0px',this.mobileFullScreen=o.OptionsController.state.enableMobileFullScreen,this.onViewportResize=()=>{this.updateContainerHeight()}}updated(t){if(t.has('history')){const t=this.history;''!==this.historyState&&this.historyState!==t&&this.onViewChange(t)}t.has('transitionDuration')&&this.style.setProperty('--local-duration',this.transitionDuration),t.has('transitionFunction')&&this.style.setProperty('--local-transition',this.transitionFunction)}firstUpdated(){this.transitionFunction&&this.style.setProperty('--local-transition',this.transitionFunction),this.style.setProperty('--local-duration',this.transitionDuration),this.historyState=this.history,this.resizeObserver=new ResizeObserver(t=>{for(const e of t)if(e.target===this.getWrapper()){let t=e.contentRect.height;const i=parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--apkt-footer-height')||'0');if(this.mobileFullScreen){t=(window.visualViewport?.height||window.innerHeight)-this.getHeaderHeight()-i,this.style.setProperty('--local-border-bottom-radius','0px')}else{t=t+i,this.style.setProperty('--local-border-bottom-radius',i?'var(--apkt-borderRadius-5)':'0px')}this.style.setProperty('--local-container-height',`${t}px`),'0px'!==this.previousHeight&&this.style.setProperty('--local-duration-height',this.transitionDuration),this.previousHeight=`${t}px`}}),this.resizeObserver.observe(this.getWrapper()),this.updateContainerHeight(),window.addEventListener('resize',this.onViewportResize),window.visualViewport?.addEventListener('resize',this.onViewportResize)}disconnectedCallback(){const t=this.getWrapper();t&&this.resizeObserver&&this.resizeObserver.unobserve(t),window.removeEventListener('resize',this.onViewportResize),window.visualViewport?.removeEventListener('resize',this.onViewportResize)}render(){return e.html`
      <div class="container" data-mobile-fullscreen="${(0,r.ifDefined)(this.mobileFullScreen)}">
        <div
          class="page"
          data-mobile-fullscreen="${(0,r.ifDefined)(this.mobileFullScreen)}"
          view-direction="${this.viewDirection}"
        >
          <div class="page-content">
            <slot></slot>
          </div>
        </div>
      </div>
    `}onViewChange(t){const e=t.split(',').filter(Boolean),i=this.historyState.split(',').filter(Boolean),r=i.length,o=e.length,n=e[e.length-1]||'',h=s.UiHelperUtil.cssDurationToNumber(this.transitionDuration);let l='';o>r?l='next':o<r?l='prev':o===r&&e[o-1]!==i[r-1]&&(l='next'),this.viewDirection=`${l}-${n}`,setTimeout(()=>{this.historyState=t,this.setView?.(n)},h),setTimeout(()=>{this.viewDirection=''},2*h)}getWrapper(){return this.shadowRoot?.querySelector('div.page')}updateContainerHeight(){const t=this.getWrapper();if(!t)return;const e=parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--apkt-footer-height')||'0');let i=0;if(this.mobileFullScreen){i=(window.visualViewport?.height||window.innerHeight)-this.getHeaderHeight()-e,this.style.setProperty('--local-border-bottom-radius','0px')}else i=t.getBoundingClientRect().height+e,this.style.setProperty('--local-border-bottom-radius',e?'var(--apkt-borderRadius-5)':'0px');this.style.setProperty('--local-container-height',`${i}px`),'0px'!==this.previousHeight&&this.style.setProperty('--local-duration-height',this.transitionDuration),this.previousHeight=`${i}px`}getHeaderHeight(){return 60}};p.styles=[h.default],l([(0,i.property)({type:String})],p.prototype,"transitionDuration",void 0),l([(0,i.property)({type:String})],p.prototype,"transitionFunction",void 0),l([(0,i.property)({type:String})],p.prototype,"history",void 0),l([(0,i.property)({type:String})],p.prototype,"view",void 0),l([(0,i.property)({attribute:!1})],p.prototype,"setView",void 0),l([(0,i.state)()],p.prototype,"viewDirection",void 0),l([(0,i.state)()],p.prototype,"historyState",void 0),l([(0,i.state)()],p.prototype,"previousHeight",void 0),l([(0,i.state)()],p.prototype,"mobileFullScreen",void 0),p=l([(0,s.customElement)('w3m-router-container')],p)},3870,[2549,2575,2586,2164,2546,3871]);
__d(function(g,r,i,a,m,e,d){"use strict";Object.defineProperty(e,'__esModule',{value:!0}),Object.defineProperty(e,"default",{enumerable:!0,get:function(){return t}});var t=r(d[0]).css`
  :host {
    --local-duration-height: 0s;
    --local-duration: ${({durations:t})=>t.lg};
    --local-transition: ${({easings:t})=>t['ease-out-power-2']};
  }

  .container {
    display: block;
    overflow: hidden;
    overflow: hidden;
    position: relative;
    height: var(--local-container-height);
    transition: height var(--local-duration-height) var(--local-transition);
    will-change: height, padding-bottom;
  }

  .container[data-mobile-fullscreen='true'] {
    overflow: scroll;
  }

  .page {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    width: 100%;
    height: auto;
    width: inherit;
    box-sizing: border-box;
    display: flex;
    flex-direction: column;
    background-color: ${({tokens:t})=>t.theme.backgroundPrimary};
    border-bottom-left-radius: var(--local-border-bottom-radius);
    border-bottom-right-radius: var(--local-border-bottom-radius);
    transition: border-bottom-left-radius var(--local-duration) var(--local-transition);
  }

  .page[data-mobile-fullscreen='true'] {
    height: 100%;
  }

  .page-content {
    display: flex;
    flex-direction: column;
    min-height: 100%;
  }

  .footer {
    height: var(--apkt-footer-height);
  }

  div.page[view-direction^='prev-'] .page-content {
    animation:
      slide-left-out var(--local-duration) forwards var(--local-transition),
      slide-left-in var(--local-duration) forwards var(--local-transition);
    animation-delay: 0ms, var(--local-duration, ${({durations:t})=>t.lg});
  }

  div.page[view-direction^='next-'] .page-content {
    animation:
      slide-right-out var(--local-duration) forwards var(--local-transition),
      slide-right-in var(--local-duration) forwards var(--local-transition);
    animation-delay: 0ms, var(--local-duration, ${({durations:t})=>t.lg});
  }

  @keyframes slide-left-out {
    from {
      transform: translateX(0px) scale(1);
      opacity: 1;
      filter: blur(0px);
    }
    to {
      transform: translateX(8px) scale(0.99);
      opacity: 0;
      filter: blur(4px);
    }
  }

  @keyframes slide-left-in {
    from {
      transform: translateX(-8px) scale(0.99);
      opacity: 0;
      filter: blur(4px);
    }
    to {
      transform: translateX(0) translateY(0) scale(1);
      opacity: 1;
      filter: blur(0px);
    }
  }

  @keyframes slide-right-out {
    from {
      transform: translateX(0px) scale(1);
      opacity: 1;
      filter: blur(0px);
    }
    to {
      transform: translateX(-8px) scale(0.99);
      opacity: 0;
      filter: blur(4px);
    }
  }

  @keyframes slide-right-in {
    from {
      transform: translateX(8px) scale(0.99);
      opacity: 0;
      filter: blur(4px);
    }
    to {
      transform: translateX(0) translateY(0) scale(1);
      opacity: 1;
      filter: blur(0px);
    }
  }
`},3871,[2546]);