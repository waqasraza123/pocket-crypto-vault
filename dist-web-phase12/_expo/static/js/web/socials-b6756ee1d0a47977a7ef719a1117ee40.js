__d(function(g,r,i,a,m,e,d){"use strict";Object.defineProperty(e,'__esModule',{value:!0});var t=r(d[0]);Object.keys(t).forEach(function(n){'default'===n||Object.prototype.hasOwnProperty.call(e,n)||Object.defineProperty(e,n,{enumerable:!0,get:function(){return t[n]}})});var n=r(d[1]);Object.keys(n).forEach(function(t){'default'===t||Object.prototype.hasOwnProperty.call(e,t)||Object.defineProperty(e,t,{enumerable:!0,get:function(){return n[t]}})});var c=r(d[2]);Object.keys(c).forEach(function(t){'default'===t||Object.prototype.hasOwnProperty.call(e,t)||Object.defineProperty(e,t,{enumerable:!0,get:function(){return c[t]}})})},3667,[3758,3762,3765]);
__d(function(g,_r,_i,a,m,_e,_d){"use strict";Object.defineProperty(_e,'__esModule',{value:!0}),Object.defineProperty(_e,"W3mConnectSocialsView",{enumerable:!0,get:function(){return d}});var e=_r(_d[0]),t=_r(_d[1]),o=_r(_d[2]),c=_r(_d[3]),i=_r(_d[4]);_r(_d[5]),_r(_d[6]),_r(_d[7]);var l,s=_r(_d[8]),n=(l=s)&&l.__esModule?l:{default:l},r=this&&this.__decorate||function(e,t,o,c){var i,l=arguments.length,s=l<3?t:null===c?c=Object.getOwnPropertyDescriptor(t,o):c;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)s=Reflect.decorate(e,t,o,c);else for(var n=e.length-1;n>=0;n--)(i=e[n])&&(s=(l<3?i(s):l>3?i(t,o,s):i(t,o))||s);return l>3&&s&&Object.defineProperty(t,o,s),s};let d=class extends e.LitElement{constructor(){super(),this.unsubscribe=[],this.checked=c.OptionsStateController.state.isLegalCheckboxChecked,this.unsubscribe.push(c.OptionsStateController.subscribeKey('isLegalCheckboxChecked',e=>{this.checked=e}))}disconnectedCallback(){this.unsubscribe.forEach(e=>e())}render(){const{termsConditionsUrl:t,privacyPolicyUrl:i}=c.OptionsController.state,l=c.OptionsController.state.features?.legalCheckbox,s=Boolean(t||i)&&Boolean(l)&&!this.checked,n=s?-1:void 0;return e.html`
      <w3m-legal-checkbox></w3m-legal-checkbox>
      <wui-flex
        flexDirection="column"
        .padding=${['0','3','3','3']}
        gap="01"
        class=${(0,o.ifDefined)(s?'disabled':void 0)}
      >
        <w3m-social-login-list tabIdx=${(0,o.ifDefined)(n)}></w3m-social-login-list>
      </wui-flex>
    `}};d.styles=n.default,r([(0,t.state)()],d.prototype,"checked",void 0),d=r([(0,i.customElement)('w3m-connect-socials-view')],d)},3758,[2549,2575,2586,2164,2546,2650,2790,3759,3761]);
__d(function(g,_r,_i,a,m,_e,_d){"use strict";Object.defineProperty(_e,'__esModule',{value:!0}),Object.defineProperty(_e,"W3mSocialLoginList",{enumerable:!0,get:function(){return u}});var e=_r(_d[0]),t=_r(_d[1]),o=_r(_d[2]),s=_r(_d[3]),i=_r(_d[4]);_r(_d[5]),_r(_d[6]);var r,n=_r(_d[7]),c=_r(_d[8]),l=(r=c)&&r.__esModule?r:{default:r},d=this&&this.__decorate||function(e,t,o,s){var i,r=arguments.length,n=r<3?t:null===s?s=Object.getOwnPropertyDescriptor(t,o):s;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)n=Reflect.decorate(e,t,o,s);else for(var c=e.length-1;c>=0;c--)(i=e[c])&&(n=(r<3?i(n):r>3?i(t,o,n):i(t,o))||n);return r>3&&n&&Object.defineProperty(t,o,n),n};let u=class extends e.LitElement{constructor(){super(),this.unsubscribe=[],this.tabIdx=void 0,this.connectors=o.ConnectorController.state.connectors,this.authConnector=this.connectors.find(e=>'AUTH'===e.type),this.remoteFeatures=o.OptionsController.state.remoteFeatures,this.isPwaLoading=!1,this.hasExceededUsageLimit=o.ApiController.state.plan.hasExceededUsageLimit,this.unsubscribe.push(o.ConnectorController.subscribeKey('connectors',e=>{this.connectors=e,this.authConnector=this.connectors.find(e=>'AUTH'===e.type)}),o.OptionsController.subscribeKey('remoteFeatures',e=>this.remoteFeatures=e))}connectedCallback(){super.connectedCallback(),this.handlePwaFrameLoad()}disconnectedCallback(){this.unsubscribe.forEach(e=>e())}render(){let t=this.remoteFeatures?.socials||[];const s=Boolean(this.authConnector),i=t?.length,r='ConnectSocials'===o.RouterController.state.view;return s&&i||r?(r&&!i&&(t=o.ConstantsUtil.DEFAULT_SOCIALS),e.html` <wui-flex flexDirection="column" gap="2">
      ${t.map(t=>e.html`<wui-list-social
            @click=${()=>{this.onSocialClick(t)}}
            data-testid=${`social-selector-${t}`}
            name=${t}
            logo=${t}
            ?disabled=${this.isPwaLoading}
          ></wui-list-social>`)}
    </wui-flex>`):null}async onSocialClick(e){this.hasExceededUsageLimit?o.RouterController.push('UsageExceeded'):e&&await(0,s.executeSocialLogin)(e)}async handlePwaFrameLoad(){if(s.CoreHelperUtil.isPWA()){this.isPwaLoading=!0;try{this.authConnector?.provider instanceof n.W3mFrameProvider&&await this.authConnector.provider.init()}catch(e){o.AlertController.open({displayMessage:'Error loading embedded wallet in PWA',debugMessage:e.message},'error')}finally{this.isPwaLoading=!1}}}};u.styles=l.default,d([(0,t.property)()],u.prototype,"tabIdx",void 0),d([(0,t.state)()],u.prototype,"connectors",void 0),d([(0,t.state)()],u.prototype,"authConnector",void 0),d([(0,t.state)()],u.prototype,"remoteFeatures",void 0),d([(0,t.state)()],u.prototype,"isPwaLoading",void 0),d([(0,t.state)()],u.prototype,"hasExceededUsageLimit",void 0),u=d([(0,i.customElement)('w3m-social-login-list')],u)},3759,[2549,2575,2164,2531,2546,2650,2796,2198,3760]);
__d(function(g,r,i,a,m,e,d){"use strict";Object.defineProperty(e,'__esModule',{value:!0}),Object.defineProperty(e,"default",{enumerable:!0,get:function(){return c}});var c=r(d[0]).css`
  :host {
    margin-top: ${({spacing:c})=>c[1]};
  }
  wui-separator {
    margin: ${({spacing:c})=>c[3]} calc(${({spacing:c})=>c[3]} * -1)
      ${({spacing:c})=>c[2]} calc(${({spacing:c})=>c[3]} * -1);
    width: calc(100% + ${({spacing:c})=>c[3]} * 2);
  }
`},3760,[2546]);
__d(function(g,r,i,a,m,e,d){"use strict";Object.defineProperty(e,'__esModule',{value:!0}),Object.defineProperty(e,"default",{enumerable:!0,get:function(){return t}});var t=r(d[0]).css`
  wui-flex {
    max-height: clamp(360px, 540px, 80vh);
    overflow: scroll;
    scrollbar-width: none;
    transition: opacity ${({durations:t})=>t.md}
      ${({easings:t})=>t['ease-out-power-1']};
    will-change: opacity;
  }

  wui-flex::-webkit-scrollbar {
    display: none;
  }

  wui-flex.disabled {
    opacity: 0.3;
    pointer-events: none;
    user-select: none;
  }
`},3761,[2546]);
__d(function(g,_r,_i,a,m,_e,_d){"use strict";Object.defineProperty(_e,'__esModule',{value:!0}),Object.defineProperty(_e,"W3mConnectingSocialView",{enumerable:!0,get:function(){return u}});var e=_r(_d[0]),t=_r(_d[1]),o=_r(_d[2]),r=_r(_d[3]),i=_r(_d[4]);_r(_d[5]),_r(_d[6]),_r(_d[7]),_r(_d[8]),_r(_d[9]);var n,s=_r(_d[10]),l=_r(_d[11]),c=_r(_d[12]),d=(n=c)&&n.__esModule?n:{default:n},h=this&&this.__decorate||function(e,t,o,r){var i,n=arguments.length,s=n<3?t:null===r?r=Object.getOwnPropertyDescriptor(t,o):r;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)s=Reflect.decorate(e,t,o,r);else for(var l=e.length-1;l>=0;l--)(i=e[l])&&(s=(n<3?i(s):n>3?i(t,o,s):i(t,o))||s);return n>3&&s&&Object.defineProperty(t,o,s),s};let u=class extends e.LitElement{constructor(){super(),this.unsubscribe=[],this.socialProvider=r.ChainController.getAccountData()?.socialProvider,this.socialWindow=r.ChainController.getAccountData()?.socialWindow,this.error=!1,this.connecting=!1,this.message='Connect in the provider window',this.remoteFeatures=r.OptionsController.state.remoteFeatures,this.address=r.ChainController.getAccountData()?.address,this.connectionsByNamespace=r.ConnectionController.getConnections(r.ChainController.state.activeChain),this.hasMultipleConnections=this.connectionsByNamespace.length>0,this.authConnector=r.ConnectorController.getAuthConnector(),this.handleSocialConnection=async e=>{if(e.data?.resultUri)if(e.origin===l.ConstantsUtil.SECURE_SITE_ORIGIN){window.removeEventListener('message',this.handleSocialConnection,!1);try{if(this.authConnector&&!this.connecting){this.connecting=!0;const t=this.parseURLError(e.data.resultUri);if(t)return void this.handleSocialError(t);this.closeSocialWindow(),this.updateMessage();const o=e.data.resultUri;this.socialProvider&&r.EventsController.sendEvent({type:'track',event:'SOCIAL_LOGIN_REQUEST_USER_DATA',properties:{provider:this.socialProvider}}),await r.ConnectionController.connectExternal({id:this.authConnector.id,type:this.authConnector.type,socialUri:o},this.authConnector.chain),this.socialProvider&&(r.StorageUtil.setConnectedSocialProvider(this.socialProvider),r.EventsController.sendEvent({type:'track',event:'SOCIAL_LOGIN_SUCCESS',properties:{provider:this.socialProvider}}))}}catch(e){this.error=!0,this.updateMessage(),this.socialProvider&&r.EventsController.sendEvent({type:'track',event:'SOCIAL_LOGIN_ERROR',properties:{provider:this.socialProvider,message:r.CoreHelperUtil.parseError(e)}})}}else r.RouterController.goBack(),r.SnackController.showError('Untrusted Origin'),this.socialProvider&&r.EventsController.sendEvent({type:'track',event:'SOCIAL_LOGIN_ERROR',properties:{provider:this.socialProvider,message:'Untrusted Origin'}})};s.ErrorUtil.EmbeddedWalletAbortController.signal.addEventListener('abort',()=>{this.closeSocialWindow()}),this.unsubscribe.push(r.ChainController.subscribeChainProp('accountState',e=>{if(e&&(this.socialProvider=e.socialProvider,e.socialWindow&&(this.socialWindow=e.socialWindow),e.address)){const t=this.remoteFeatures?.multiWallet;e.address!==this.address&&(this.hasMultipleConnections&&t?(r.RouterController.replace('ProfileWallets'),r.SnackController.showSuccess('New Wallet Added'),this.address=e.address):(r.ModalController.state.open||r.OptionsController.state.enableEmbedded)&&r.ModalController.close())}}),r.OptionsController.subscribeKey('remoteFeatures',e=>{this.remoteFeatures=e})),this.authConnector&&this.connectSocial()}disconnectedCallback(){this.unsubscribe.forEach(e=>e()),window.removeEventListener('message',this.handleSocialConnection,!1);r.ChainController.state.activeCaipAddress||!this.socialProvider||this.connecting||r.EventsController.sendEvent({type:'track',event:'SOCIAL_LOGIN_CANCELED',properties:{provider:this.socialProvider}}),this.closeSocialWindow()}render(){return e.html`
      <wui-flex
        data-error=${(0,o.ifDefined)(this.error)}
        flexDirection="column"
        alignItems="center"
        .padding=${['10','5','5','5']}
        gap="6"
      >
        <wui-flex justifyContent="center" alignItems="center">
          <wui-logo logo=${(0,o.ifDefined)(this.socialProvider)}></wui-logo>
          ${this.error?null:this.loaderTemplate()}
          <wui-icon-box color="error" icon="close" size="sm"></wui-icon-box>
        </wui-flex>
        <wui-flex flexDirection="column" alignItems="center" gap="2">
          <wui-text align="center" variant="lg-medium" color="primary"
            >Log in with
            <span class="capitalize">${this.socialProvider??'Social'}</span></wui-text
          >
          <wui-text align="center" variant="lg-regular" color=${this.error?'error':'secondary'}
            >${this.message}</wui-text
          ></wui-flex
        >
      </wui-flex>
    `}loaderTemplate(){const t=r.ThemeController.state.themeVariables['--w3m-border-radius-master'],o=t?parseInt(t.replace('px',''),10):4;return e.html`<wui-loading-thumbnail radius=${9*o}></wui-loading-thumbnail>`}parseURLError(e){try{const t='error=',o=e.indexOf(t);if(-1===o)return null;return e.substring(o+t.length)}catch{return null}}connectSocial(){const e=setInterval(()=>{this.socialWindow?.closed&&(this.connecting||'ConnectingSocial'!==r.RouterController.state.view||r.RouterController.goBack(),clearInterval(e))},1e3);window.addEventListener('message',this.handleSocialConnection,!1)}updateMessage(){this.error?this.message='Something went wrong':this.connecting?this.message='Retrieving user data':this.message='Connect in the provider window'}handleSocialError(e){this.error=!0,this.updateMessage(),this.socialProvider&&r.EventsController.sendEvent({type:'track',event:'SOCIAL_LOGIN_ERROR',properties:{provider:this.socialProvider,message:e}}),this.closeSocialWindow()}closeSocialWindow(){this.socialWindow&&(this.socialWindow.close(),r.ChainController.setAccountProp('socialWindow',void 0,r.ChainController.state.activeChain))}};u.styles=d.default,h([(0,t.state)()],u.prototype,"socialProvider",void 0),h([(0,t.state)()],u.prototype,"socialWindow",void 0),h([(0,t.state)()],u.prototype,"error",void 0),h([(0,t.state)()],u.prototype,"connecting",void 0),h([(0,t.state)()],u.prototype,"message",void 0),h([(0,t.state)()],u.prototype,"remoteFeatures",void 0),u=h([(0,i.customElement)('w3m-connecting-social-view')],u)},3762,[2549,2575,2586,2164,2546,2650,2705,2817,3763,2651,2534,2664,3764]);
__d(function(g,r,i,a,m,e,d){"use strict";Object.defineProperty(e,'__esModule',{value:!0});var t=r(d[0]);Object.keys(t).forEach(function(n){'default'===n||Object.prototype.hasOwnProperty.call(e,n)||Object.defineProperty(e,n,{enumerable:!0,get:function(){return t[n]}})})},3763,[2798]);
__d(function(g,r,i,a,m,e,d){"use strict";Object.defineProperty(e,'__esModule',{value:!0}),Object.defineProperty(e,"default",{enumerable:!0,get:function(){return t}});var t=r(d[0]).css`
  wui-logo {
    width: 80px;
    height: 80px;
    border-radius: ${({borderRadius:t})=>t[8]};
  }
  @keyframes shake {
    0% {
      transform: translateX(0);
    }
    25% {
      transform: translateX(3px);
    }
    50% {
      transform: translateX(-3px);
    }
    75% {
      transform: translateX(3px);
    }
    100% {
      transform: translateX(0);
    }
  }
  wui-flex:first-child:not(:only-child) {
    position: relative;
  }
  wui-loading-thumbnail {
    position: absolute;
  }
  wui-icon-box {
    position: absolute;
    right: calc(${({spacing:t})=>t[1]} * -1);
    bottom: calc(${({spacing:t})=>t[1]} * -1);
    opacity: 0;
    transform: scale(0.5);
    transition: all ${({easings:t})=>t['ease-out-power-2']}
      ${({durations:t})=>t.lg};
  }
  wui-text[align='center'] {
    width: 100%;
    padding: 0px ${({spacing:t})=>t[4]};
  }
  [data-error='true'] wui-icon-box {
    opacity: 1;
    transform: scale(1);
  }
  [data-error='true'] > wui-flex:first-child {
    animation: shake 250ms ${({easings:t})=>t['ease-out-power-2']} both;
  }
  .capitalize {
    text-transform: capitalize;
  }
`},3764,[2546]);
__d(function(g,_r,_i,a,m,_e,_d){"use strict";Object.defineProperty(_e,'__esModule',{value:!0}),Object.defineProperty(_e,"W3mConnectingFarcasterView",{enumerable:!0,get:function(){return u}});var e=_r(_d[0]),t=_r(_d[1]),r=_r(_d[2]),i=_r(_d[3]),o=_r(_d[4]);_r(_d[5]),_r(_d[6]),_r(_d[7]),_r(_d[8]),_r(_d[9]),_r(_d[10]),_r(_d[11]),_r(_d[12]),_r(_d[13]);var n,l=_r(_d[14]),s=(n=l)&&n.__esModule?n:{default:n},c=this&&this.__decorate||function(e,t,r,i){var o,n=arguments.length,l=n<3?t:null===i?i=Object.getOwnPropertyDescriptor(t,r):i;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)l=Reflect.decorate(e,t,r,i);else for(var s=e.length-1;s>=0;s--)(o=e[s])&&(l=(n<3?o(l):n>3?o(t,r,l):o(t,r))||l);return n>3&&l&&Object.defineProperty(t,r,l),l};let u=class extends e.LitElement{constructor(){super(),this.unsubscribe=[],this.timeout=void 0,this.socialProvider=i.ChainController.getAccountData()?.socialProvider,this.uri=i.ChainController.getAccountData()?.farcasterUrl,this.ready=!1,this.loading=!1,this.remoteFeatures=i.OptionsController.state.remoteFeatures,this.authConnector=i.ConnectorController.getAuthConnector(),this.forceUpdate=()=>{this.requestUpdate()},this.unsubscribe.push(i.ChainController.subscribeChainProp('accountState',e=>{this.socialProvider=e?.socialProvider,this.uri=e?.farcasterUrl,this.connectFarcaster()}),i.OptionsController.subscribeKey('remoteFeatures',e=>{this.remoteFeatures=e})),window.addEventListener('resize',this.forceUpdate)}disconnectedCallback(){super.disconnectedCallback(),clearTimeout(this.timeout),window.removeEventListener('resize',this.forceUpdate);!i.ChainController.state.activeCaipAddress&&this.socialProvider&&(this.uri||this.loading)&&i.EventsController.sendEvent({type:'track',event:'SOCIAL_LOGIN_CANCELED',properties:{provider:this.socialProvider}})}render(){return this.onRenderProxy(),e.html`${this.platformTemplate()}`}platformTemplate(){return i.CoreHelperUtil.isMobile()?e.html`${this.mobileTemplate()}`:e.html`${this.desktopTemplate()}`}desktopTemplate(){return this.loading?e.html`${this.loadingTemplate()}`:e.html`${this.qrTemplate()}`}qrTemplate(){return e.html` <wui-flex
      flexDirection="column"
      alignItems="center"
      .padding=${['0','5','5','5']}
      gap="5"
    >
      <wui-shimmer width="100%"> ${this.qrCodeTemplate()} </wui-shimmer>

      <wui-text variant="lg-medium" color="primary"> Scan this QR Code with your phone </wui-text>
      ${this.copyTemplate()}
    </wui-flex>`}loadingTemplate(){return e.html`
      <wui-flex
        flexDirection="column"
        alignItems="center"
        .padding=${['5','5','5','5']}
        gap="5"
      >
        <wui-flex justifyContent="center" alignItems="center">
          <wui-logo logo="farcaster"></wui-logo>
          ${this.loaderTemplate()}
          <wui-icon-box color="error" icon="close" size="sm"></wui-icon-box>
        </wui-flex>
        <wui-flex flexDirection="column" alignItems="center" gap="2">
          <wui-text align="center" variant="md-medium" color="primary">
            Loading user data
          </wui-text>
          <wui-text align="center" variant="sm-regular" color="secondary">
            Please wait a moment while we load your data.
          </wui-text>
        </wui-flex>
      </wui-flex>
    `}mobileTemplate(){return e.html` <wui-flex
      flexDirection="column"
      alignItems="center"
      .padding=${['10','5','5','5']}
      gap="5"
    >
      <wui-flex justifyContent="center" alignItems="center">
        <wui-logo logo="farcaster"></wui-logo>
        ${this.loaderTemplate()}
        <wui-icon-box
          color="error"
          icon="close"
          size="sm"
        ></wui-icon-box>
      </wui-flex>
      <wui-flex flexDirection="column" alignItems="center" gap="2">
        <wui-text align="center" variant="md-medium" color="primary"
          >Continue in Farcaster</span></wui-text
        >
        <wui-text align="center" variant="sm-regular" color="secondary"
          >Accept connection request in the app</wui-text
        ></wui-flex
      >
      ${this.mobileLinkTemplate()}
    </wui-flex>`}loaderTemplate(){const t=i.ThemeController.state.themeVariables['--w3m-border-radius-master'],r=t?parseInt(t.replace('px',''),10):4;return e.html`<wui-loading-thumbnail radius=${9*r}></wui-loading-thumbnail>`}async connectFarcaster(){if(this.authConnector)try{await(this.authConnector?.provider.connectFarcaster()),this.socialProvider&&(i.StorageUtil.setConnectedSocialProvider(this.socialProvider),i.EventsController.sendEvent({type:'track',event:'SOCIAL_LOGIN_REQUEST_USER_DATA',properties:{provider:this.socialProvider}})),this.loading=!0;const e=i.ConnectionController.getConnections(this.authConnector.chain).length>0;await i.ConnectionController.connectExternal(this.authConnector,this.authConnector.chain);const t=this.remoteFeatures?.multiWallet;this.socialProvider&&i.EventsController.sendEvent({type:'track',event:'SOCIAL_LOGIN_SUCCESS',properties:{provider:this.socialProvider}}),this.loading=!1,e&&t?(i.RouterController.replace('ProfileWallets'),i.SnackController.showSuccess('New Wallet Added')):i.ModalController.close()}catch(e){this.socialProvider&&i.EventsController.sendEvent({type:'track',event:'SOCIAL_LOGIN_ERROR',properties:{provider:this.socialProvider,message:i.CoreHelperUtil.parseError(e)}}),i.RouterController.goBack(),i.SnackController.showError(e)}}mobileLinkTemplate(){return e.html`<wui-button
      size="md"
      ?loading=${this.loading}
      ?disabled=${!this.uri||this.loading}
      @click=${()=>{this.uri&&i.CoreHelperUtil.openHref(this.uri,'_blank')}}
    >
      Open farcaster</wui-button
    >`}onRenderProxy(){!this.ready&&this.uri&&(this.timeout=setTimeout(()=>{this.ready=!0},200))}qrCodeTemplate(){if(!this.uri||!this.ready)return null;const t=this.getBoundingClientRect().width-40,o=i.ThemeController.state.themeVariables['--apkt-qr-color']??i.ThemeController.state.themeVariables['--w3m-qr-color'];return e.html` <wui-qr-code
      size=${t}
      theme=${i.ThemeController.state.themeMode}
      uri=${this.uri}
      ?farcaster=${!0}
      data-testid="wui-qr-code"
      color=${(0,r.ifDefined)(o)}
    ></wui-qr-code>`}copyTemplate(){const t=!this.uri||!this.ready;return e.html`<wui-button
      .disabled=${t}
      @click=${this.onCopyUri}
      variant="neutral-secondary"
      size="sm"
      data-testid="copy-wc2-uri"
    >
      <wui-icon size="sm" color="default" slot="iconRight" name="copy"></wui-icon>
      Copy link
    </wui-button>`}onCopyUri(){try{this.uri&&(i.CoreHelperUtil.copyToClopboard(this.uri),i.SnackController.showSuccess('Link copied'))}catch{i.SnackController.showError('Failed to copy')}}};u.styles=s.default,c([(0,t.state)()],u.prototype,"socialProvider",void 0),c([(0,t.state)()],u.prototype,"uri",void 0),c([(0,t.state)()],u.prototype,"ready",void 0),c([(0,t.state)()],u.prototype,"loading",void 0),c([(0,t.state)()],u.prototype,"remoteFeatures",void 0),u=c([(0,o.customElement)('w3m-connecting-farcaster-view')],u)},3765,[2549,2575,2586,2164,2546,2683,2650,2658,2705,2817,3763,2834,2773,2651,3766]);
__d(function(g,r,i,a,m,e,d){"use strict";Object.defineProperty(e,'__esModule',{value:!0}),Object.defineProperty(e,"default",{enumerable:!0,get:function(){return o}});var o=r(d[0]).css`
  wui-shimmer {
    width: 100%;
    aspect-ratio: 1 / 1;
    border-radius: ${({borderRadius:o})=>o[4]};
  }

  wui-qr-code {
    opacity: 0;
    animation-duration: ${({durations:o})=>o.xl};
    animation-timing-function: ${({easings:o})=>o['ease-out-power-2']};
    animation-name: fade-in;
    animation-fill-mode: forwards;
  }

  wui-logo {
    width: 80px;
    height: 80px;
    border-radius: ${({borderRadius:o})=>o[8]};
  }

  wui-flex:first-child:not(:only-child) {
    position: relative;
  }

  wui-loading-thumbnail {
    position: absolute;
  }

  wui-icon-box {
    position: absolute;
    right: calc(${({spacing:o})=>o[1]} * -1);
    bottom: calc(${({spacing:o})=>o[1]} * -1);
    opacity: 0;
    transform: scale(0.5);
    transition:
      opacity ${({durations:o})=>o.lg} ${({easings:o})=>o['ease-out-power-2']},
      transform ${({durations:o})=>o.lg}
        ${({easings:o})=>o['ease-out-power-2']};
    will-change: opacity, transform;
  }

  @keyframes fade-in {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }
`},3766,[2546]);