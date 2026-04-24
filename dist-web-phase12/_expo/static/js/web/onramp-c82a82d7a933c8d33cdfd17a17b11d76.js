__d(function(g,r,i,a,m,e,d){"use strict";Object.defineProperty(e,'__esModule',{value:!0});var t=r(d[0]);Object.keys(t).forEach(function(n){'default'===n||Object.prototype.hasOwnProperty.call(e,n)||Object.defineProperty(e,n,{enumerable:!0,get:function(){return t[n]}})});var n=r(d[1]);Object.keys(n).forEach(function(t){'default'===t||Object.prototype.hasOwnProperty.call(e,t)||Object.defineProperty(e,t,{enumerable:!0,get:function(){return n[t]}})});var c=r(d[2]);Object.keys(c).forEach(function(t){'default'===t||Object.prototype.hasOwnProperty.call(e,t)||Object.defineProperty(e,t,{enumerable:!0,get:function(){return c[t]}})});var o=r(d[3]);Object.keys(o).forEach(function(t){'default'===t||Object.prototype.hasOwnProperty.call(e,t)||Object.defineProperty(e,t,{enumerable:!0,get:function(){return o[t]}})});var u=r(d[4]);Object.keys(u).forEach(function(t){'default'===t||Object.prototype.hasOwnProperty.call(e,t)||Object.defineProperty(e,t,{enumerable:!0,get:function(){return u[t]}})});var f=r(d[5]);Object.keys(f).forEach(function(t){'default'===t||Object.prototype.hasOwnProperty.call(e,t)||Object.defineProperty(e,t,{enumerable:!0,get:function(){return f[t]}})})},3671,[3812,3814,3817,3819,3821,3822]);
__d(function(g,_r,_i,a,m,_e,_d){"use strict";Object.defineProperty(_e,'__esModule',{value:!0}),Object.defineProperty(_e,"W3mOnrampFiatSelectView",{enumerable:!0,get:function(){return u}});var e=_r(_d[0]),t=_r(_d[1]),r=_r(_d[2]),c=_r(_d[3]),s=_r(_d[4]);_r(_d[5]),_r(_d[6]),_r(_d[7]),_r(_d[8]);var i,n=_r(_d[9]),o=(i=n)&&i.__esModule?i:{default:i},l=this&&this.__decorate||function(e,t,r,c){var s,i=arguments.length,n=i<3?t:null===c?c=Object.getOwnPropertyDescriptor(t,r):c;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)n=Reflect.decorate(e,t,r,c);else for(var o=e.length-1;o>=0;o--)(s=e[o])&&(n=(i<3?s(n):i>3?s(t,r,n):s(t,r))||n);return i>3&&n&&Object.defineProperty(t,r,n),n};let u=class extends e.LitElement{constructor(){super(),this.unsubscribe=[],this.selectedCurrency=c.OnRampController.state.paymentCurrency,this.currencies=c.OnRampController.state.paymentCurrencies,this.currencyImages=c.AssetController.state.currencyImages,this.checked=c.OptionsStateController.state.isLegalCheckboxChecked,this.unsubscribe.push(c.OnRampController.subscribe(e=>{this.selectedCurrency=e.paymentCurrency,this.currencies=e.paymentCurrencies}),c.AssetController.subscribeKey('currencyImages',e=>this.currencyImages=e),c.OptionsStateController.subscribeKey('isLegalCheckboxChecked',e=>{this.checked=e}))}disconnectedCallback(){this.unsubscribe.forEach(e=>e())}render(){const{termsConditionsUrl:t,privacyPolicyUrl:s}=c.OptionsController.state,i=c.OptionsController.state.features?.legalCheckbox,n=Boolean(t||s)&&Boolean(i)&&!this.checked;return e.html`
      <w3m-legal-checkbox></w3m-legal-checkbox>
      <wui-flex
        flexDirection="column"
        .padding=${['0','3','3','3']}
        gap="2"
        class=${(0,r.ifDefined)(n?'disabled':void 0)}
      >
        ${this.currenciesTemplate(n)}
      </wui-flex>
    `}currenciesTemplate(t=!1){return this.currencies.map(c=>e.html`
        <wui-list-item
          imageSrc=${(0,r.ifDefined)(this.currencyImages?.[c.id])}
          @click=${()=>this.selectCurrency(c)}
          variant="image"
          tabIdx=${(0,r.ifDefined)(t?-1:void 0)}
        >
          <wui-text variant="md-medium" color="primary">${c.id}</wui-text>
        </wui-list-item>
      `)}selectCurrency(e){e&&(c.OnRampController.setPaymentCurrency(e),c.ModalController.close())}};u.styles=o.default,l([(0,t.state)()],u.prototype,"selectedCurrency",void 0),l([(0,t.state)()],u.prototype,"currencies",void 0),l([(0,t.state)()],u.prototype,"currencyImages",void 0),l([(0,t.state)()],u.prototype,"checked",void 0),u=l([(0,s.customElement)('w3m-onramp-fiat-select-view')],u)},3812,[2549,2575,2586,2164,2546,2650,2672,2651,2790,3813]);
__d(function(g,r,i,a,m,e,d){"use strict";Object.defineProperty(e,'__esModule',{value:!0}),Object.defineProperty(e,"default",{enumerable:!0,get:function(){return t}});var t=r(d[0]).css`
  :host > wui-grid {
    max-height: 360px;
    overflow: auto;
  }

  wui-flex {
    transition: opacity ${({easings:t})=>t['ease-out-power-1']}
      ${({durations:t})=>t.md};
    will-change: opacity;
  }

  wui-grid::-webkit-scrollbar {
    display: none;
  }

  wui-flex.disabled {
    opacity: 0.3;
    pointer-events: none;
    user-select: none;
  }
`},3813,[2546]);
__d(function(g,_r,_i,a,m,e,_d){"use strict";Object.defineProperty(e,'__esModule',{value:!0}),Object.defineProperty(e,"W3mOnRampProvidersView",{enumerable:!0,get:function(){return l}});var r=_r(_d[0]),t=_r(_d[1]),o=_r(_d[2]),n=_r(_d[3]);_r(_d[4]);var i=_r(_d[5]);_r(_d[6]),_r(_d[7]);var s=this&&this.__decorate||function(r,t,o,n){var i,s=arguments.length,l=s<3?t:null===n?n=Object.getOwnPropertyDescriptor(t,o):n;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)l=Reflect.decorate(r,t,o,n);else for(var p=r.length-1;p>=0;p--)(i=r[p])&&(l=(s<3?i(l):s>3?i(t,o,l):i(t,o))||l);return s>3&&l&&Object.defineProperty(t,o,l),l};let l=class extends r.LitElement{constructor(){super(),this.unsubscribe=[],this.providers=o.OnRampController.state.providers,this.unsubscribe.push(o.OnRampController.subscribeKey('providers',r=>{this.providers=r}))}render(){return r.html`
      <wui-flex flexDirection="column" .padding=${['0','3','3','3']} gap="2">
        ${this.onRampProvidersTemplate()}
      </wui-flex>
    `}onRampProvidersTemplate(){return this.providers.filter(r=>r.supportedChains.includes(o.ChainController.state.activeChain??'eip155')).map(t=>r.html`
          <w3m-onramp-provider-item
            label=${t.label}
            name=${t.name}
            feeRange=${t.feeRange}
            @click=${()=>{this.onClickProvider(t)}}
            ?disabled=${!t.url}
            data-testid=${`onramp-provider-${t.name}`}
          ></w3m-onramp-provider-item>
        `)}onClickProvider(r){o.OnRampController.setSelectedProvider(r),o.RouterController.push('BuyInProgress'),o.CoreHelperUtil.openHref(o.OnRampController.state.selectedProvider?.url||r.url,'popupWindow','width=600,height=800,scrollbars=yes'),o.EventsController.sendEvent({type:'track',event:'SELECT_BUY_PROVIDER',properties:{provider:r.name,isSmartAccount:(0,o.getPreferredAccountType)(o.ChainController.state.activeChain)===i.W3mFrameRpcConstants.ACCOUNT_TYPES.SMART_ACCOUNT}})}};s([(0,t.state)()],l.prototype,"providers",void 0),l=s([(0,n.customElement)('w3m-onramp-providers-view')],l)},3814,[2549,2575,2164,2546,2650,2222,3815,2657]);
__d(function(g,_r,_i,a,m,_e,_d){"use strict";Object.defineProperty(_e,'__esModule',{value:!0}),Object.defineProperty(_e,"W3mOnRampProviderItem",{enumerable:!0,get:function(){return c}});var e=_r(_d[0]),t=_r(_d[1]),i=_r(_d[2]),o=_r(_d[3]),r=_r(_d[4]);_r(_d[5]),_r(_d[6]),_r(_d[7]),_r(_d[8]),_r(_d[9]),_r(_d[10]);var l,n=_r(_d[11]),s=(l=n)&&l.__esModule?l:{default:l},u=this&&this.__decorate||function(e,t,i,o){var r,l=arguments.length,n=l<3?t:null===o?o=Object.getOwnPropertyDescriptor(t,i):o;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)n=Reflect.decorate(e,t,i,o);else for(var s=e.length-1;s>=0;s--)(r=e[s])&&(n=(l<3?r(n):l>3?r(t,i,n):r(t,i))||n);return l>3&&n&&Object.defineProperty(t,i,n),n};let c=class extends e.LitElement{constructor(){super(...arguments),this.disabled=!1,this.color='inherit',this.label='',this.feeRange='',this.loading=!1,this.onClick=null}render(){return e.html`
      <button ?disabled=${this.disabled} @click=${this.onClick} ontouchstart>
        <wui-visual name=${(0,i.ifDefined)(this.name)} class="provider-image"></wui-visual>
        <wui-flex flexDirection="column" gap="01">
          <wui-text variant="md-regular" color="primary">${this.label}</wui-text>
          <wui-flex alignItems="center" justifyContent="flex-start" gap="4">
            <wui-text variant="sm-medium" color="primary">
              <wui-text variant="sm-regular" color="secondary">Fees</wui-text>
              ${this.feeRange}
            </wui-text>
            <wui-flex gap="2">
              <wui-icon name="bank" size="sm" color="default"></wui-icon>
              <wui-icon name="card" size="sm" color="default"></wui-icon>
            </wui-flex>
            ${this.networksTemplate()}
          </wui-flex>
        </wui-flex>
        ${this.loading?e.html`<wui-loading-spinner color="secondary" size="md"></wui-loading-spinner>`:e.html`<wui-icon name="chevronRight" color="default" size="sm"></wui-icon>`}
      </button>
    `}networksTemplate(){const t=o.ChainController.getAllRequestedCaipNetworks(),r=t?.filter(e=>e?.assets?.imageId)?.slice(0,5);return e.html`
      <wui-flex class="networks">
        ${r?.map(t=>e.html`
            <wui-flex class="network-icon">
              <wui-image src=${(0,i.ifDefined)(o.AssetUtil.getNetworkImage(t))}></wui-image>
            </wui-flex>
          `)}
      </wui-flex>
    `}};c.styles=[s.default],u([(0,t.property)({type:Boolean})],c.prototype,"disabled",void 0),u([(0,t.property)()],c.prototype,"color",void 0),u([(0,t.property)()],c.prototype,"name",void 0),u([(0,t.property)()],c.prototype,"label",void 0),u([(0,t.property)()],c.prototype,"feeRange",void 0),u([(0,t.property)({type:Boolean})],c.prototype,"loading",void 0),u([(0,t.property)()],c.prototype,"onClick",void 0),c=u([(0,r.customElement)('w3m-onramp-provider-item')],c)},3815,[2549,2575,2586,2164,2546,2650,2658,3826,2778,2651,2878,3816]);
__d(function(g,r,i,a,m,e,d){"use strict";Object.defineProperty(e,'__esModule',{value:!0}),Object.defineProperty(e,"default",{enumerable:!0,get:function(){return o}});var o=r(d[0]).css`
  button {
    padding: ${({spacing:o})=>o[3]};
    border-radius: ${({borderRadius:o})=>o[4]};
    border: none;
    outline: none;
    background-color: ${({tokens:o})=>o.core.glass010};
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: flex-start;
    gap: ${({spacing:o})=>o[3]};
    transition: background-color ${({easings:o})=>o['ease-out-power-1']}
      ${({durations:o})=>o.md};
    will-change: background-color;
    cursor: pointer;
  }

  button:hover {
    background-color: ${({tokens:o})=>o.theme.foregroundPrimary};
  }

  .provider-image {
    width: ${({spacing:o})=>o[10]};
    min-width: ${({spacing:o})=>o[10]};
    height: ${({spacing:o})=>o[10]};
    border-radius: calc(
      ${({borderRadius:o})=>o[4]} - calc(${({spacing:o})=>o[3]} / 2)
    );
    position: relative;
    overflow: hidden;
  }

  .network-icon {
    width: ${({spacing:o})=>o[3]};
    height: ${({spacing:o})=>o[3]};
    border-radius: calc(${({spacing:o})=>o[3]} / 2);
    overflow: hidden;
    box-shadow:
      0 0 0 3px ${({tokens:o})=>o.theme.foregroundPrimary},
      0 0 0 3px ${({tokens:o})=>o.theme.backgroundPrimary};
    transition: box-shadow ${({easings:o})=>o['ease-out-power-1']}
      ${({durations:o})=>o.md};
    will-change: box-shadow;
  }

  button:hover .network-icon {
    box-shadow:
      0 0 0 3px ${({tokens:o})=>o.core.glass010},
      0 0 0 3px ${({tokens:o})=>o.theme.backgroundPrimary};
  }
`},3816,[2546]);
__d(function(g,_r,_i,a,m,_e,_d){"use strict";Object.defineProperty(_e,'__esModule',{value:!0}),Object.defineProperty(_e,"W3mOnrampTokensView",{enumerable:!0,get:function(){return u}});var e=_r(_d[0]),t=_r(_d[1]),r=_r(_d[2]),s=_r(_d[3]),o=_r(_d[4]);_r(_d[5]),_r(_d[6]),_r(_d[7]),_r(_d[8]);var i,n=_r(_d[9]),c=(i=n)&&i.__esModule?i:{default:i},l=this&&this.__decorate||function(e,t,r,s){var o,i=arguments.length,n=i<3?t:null===s?s=Object.getOwnPropertyDescriptor(t,r):s;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)n=Reflect.decorate(e,t,r,s);else for(var c=e.length-1;c>=0;c--)(o=e[c])&&(n=(i<3?o(n):i>3?o(t,r,n):o(t,r))||n);return i>3&&n&&Object.defineProperty(t,r,n),n};let u=class extends e.LitElement{constructor(){super(),this.unsubscribe=[],this.selectedCurrency=s.OnRampController.state.purchaseCurrencies,this.tokens=s.OnRampController.state.purchaseCurrencies,this.tokenImages=s.AssetController.state.tokenImages,this.checked=s.OptionsStateController.state.isLegalCheckboxChecked,this.unsubscribe.push(s.OnRampController.subscribe(e=>{this.selectedCurrency=e.purchaseCurrencies,this.tokens=e.purchaseCurrencies}),s.AssetController.subscribeKey('tokenImages',e=>this.tokenImages=e),s.OptionsStateController.subscribeKey('isLegalCheckboxChecked',e=>{this.checked=e}))}disconnectedCallback(){this.unsubscribe.forEach(e=>e())}render(){const{termsConditionsUrl:t,privacyPolicyUrl:o}=s.OptionsController.state,i=s.OptionsController.state.features?.legalCheckbox,n=Boolean(t||o)&&Boolean(i)&&!this.checked;return e.html`
      <w3m-legal-checkbox></w3m-legal-checkbox>
      <wui-flex
        flexDirection="column"
        .padding=${['0','3','3','3']}
        gap="2"
        class=${(0,r.ifDefined)(n?'disabled':void 0)}
      >
        ${this.currenciesTemplate(n)}
      </wui-flex>
    `}currenciesTemplate(t=!1){return this.tokens.map(s=>e.html`
        <wui-list-item
          imageSrc=${(0,r.ifDefined)(this.tokenImages?.[s.symbol])}
          @click=${()=>this.selectToken(s)}
          variant="image"
          tabIdx=${(0,r.ifDefined)(t?-1:void 0)}
        >
          <wui-flex gap="1" alignItems="center">
            <wui-text variant="md-medium" color="primary">${s.name}</wui-text>
            <wui-text variant="sm-regular" color="secondary">${s.symbol}</wui-text>
          </wui-flex>
        </wui-list-item>
      `)}selectToken(e){e&&(s.OnRampController.setPurchaseCurrency(e),s.ModalController.close())}};u.styles=c.default,l([(0,t.state)()],u.prototype,"selectedCurrency",void 0),l([(0,t.state)()],u.prototype,"tokens",void 0),l([(0,t.state)()],u.prototype,"tokenImages",void 0),l([(0,t.state)()],u.prototype,"checked",void 0),u=l([(0,o.customElement)('w3m-onramp-token-select-view')],u)},3817,[2549,2575,2586,2164,2546,2650,2672,2651,2649,3818]);
__d(function(g,r,i,a,m,e,d){"use strict";Object.defineProperty(e,'__esModule',{value:!0}),Object.defineProperty(e,"default",{enumerable:!0,get:function(){return t}});var t=r(d[0]).css`
  :host > wui-grid {
    max-height: 360px;
    overflow: auto;
  }

  wui-flex {
    transition: opacity ${({easings:t})=>t['ease-out-power-1']}
      ${({durations:t})=>t.md};
    will-change: opacity;
  }

  wui-grid::-webkit-scrollbar {
    display: none;
  }

  wui-flex.disabled {
    opacity: 0.3;
    pointer-events: none;
    user-select: none;
  }
`},3818,[2546]);
__d(function(g,_r,_i,a,m,_e,_d){"use strict";Object.defineProperty(_e,'__esModule',{value:!0}),Object.defineProperty(_e,"W3mBuyInProgressView",{enumerable:!0,get:function(){return c}});var e=_r(_d[0]),r=_r(_d[1]),t=_r(_d[2]),o=_r(_d[3]),i=_r(_d[4]);_r(_d[5]),_r(_d[6]),_r(_d[7]),_r(_d[8]),_r(_d[9]),_r(_d[10]),_r(_d[11]),_r(_d[12]);var n,l=_r(_d[13]),s=(n=l)&&n.__esModule?n:{default:n},d=this&&this.__decorate||function(e,r,t,o){var i,n=arguments.length,l=n<3?r:null===o?o=Object.getOwnPropertyDescriptor(r,t):o;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)l=Reflect.decorate(e,r,t,o);else for(var s=e.length-1;s>=0;s--)(i=e[s])&&(l=(n<3?i(l):n>3?i(r,t,l):i(r,t))||l);return n>3&&l&&Object.defineProperty(r,t,l),l};let c=class extends e.LitElement{constructor(){super(),this.unsubscribe=[],this.selectedOnRampProvider=o.OnRampController.state.selectedProvider,this.uri=o.ConnectionController.state.wcUri,this.ready=!1,this.showRetry=!1,this.buffering=!1,this.error=!1,this.isMobile=!1,this.onRetry=void 0,this.unsubscribe.push(o.OnRampController.subscribeKey('selectedProvider',e=>{this.selectedOnRampProvider=e}))}disconnectedCallback(){this.intervalId&&clearInterval(this.intervalId)}render(){let r='Continue in external window';this.error?r='Buy failed':this.selectedOnRampProvider&&(r=`Buy in ${this.selectedOnRampProvider?.label}`);const o=this.error?'Buy can be declined from your side or due to and error on the provider app':"We\u2019ll notify you once your Buy is processed";return e.html`
      <wui-flex
        data-error=${(0,t.ifDefined)(this.error)}
        data-retry=${this.showRetry}
        flexDirection="column"
        alignItems="center"
        .padding=${['10','5','5','5']}
        gap="5"
      >
        <wui-flex justifyContent="center" alignItems="center">
          <wui-visual
            name=${(0,t.ifDefined)(this.selectedOnRampProvider?.name)}
            size="lg"
            class="provider-image"
          >
          </wui-visual>

          ${this.error?null:this.loaderTemplate()}

          <wui-icon-box
            color="error"
            icon="close"
            size="sm"
            border
            borderColor="wui-color-bg-125"
          ></wui-icon-box>
        </wui-flex>

        <wui-flex
          flexDirection="column"
          alignItems="center"
          gap="2"
          .padding=${['4','0','0','0']}
        >
          <wui-text variant="md-medium" color=${this.error?'error':'primary'}>
            ${r}
          </wui-text>
          <wui-text align="center" variant="sm-medium" color="secondary">${o}</wui-text>
        </wui-flex>

        ${this.error?this.tryAgainTemplate():null}
      </wui-flex>

      <wui-flex .padding=${['0','5','5','5']} justifyContent="center">
        <wui-link @click=${this.onCopyUri} color="secondary">
          <wui-icon size="sm" color="default" slot="iconLeft" name="copy"></wui-icon>
          Copy link
        </wui-link>
      </wui-flex>
    `}onTryAgain(){this.selectedOnRampProvider&&(this.error=!1,o.CoreHelperUtil.openHref(this.selectedOnRampProvider.url,'popupWindow','width=600,height=800,scrollbars=yes'))}tryAgainTemplate(){return this.selectedOnRampProvider?.url?e.html`<wui-button size="md" variant="accent" @click=${this.onTryAgain.bind(this)}>
      <wui-icon color="inherit" slot="iconLeft" name="refresh"></wui-icon>
      Try again
    </wui-button>`:null}loaderTemplate(){const r=o.ThemeController.state.themeVariables['--w3m-border-radius-master'],t=r?parseInt(r.replace('px',''),10):4;return e.html`<wui-loading-thumbnail radius=${9*t}></wui-loading-thumbnail>`}onCopyUri(){if(!this.selectedOnRampProvider?.url)return o.SnackController.showError('No link found'),void o.RouterController.goBack();try{o.CoreHelperUtil.copyToClopboard(this.selectedOnRampProvider.url),o.SnackController.showSuccess('Link copied')}catch{o.SnackController.showError('Failed to copy')}}};c.styles=s.default,d([(0,r.state)()],c.prototype,"intervalId",void 0),d([(0,r.state)()],c.prototype,"selectedOnRampProvider",void 0),d([(0,r.state)()],c.prototype,"uri",void 0),d([(0,r.state)()],c.prototype,"ready",void 0),d([(0,r.state)()],c.prototype,"showRetry",void 0),d([(0,r.state)()],c.prototype,"buffering",void 0),d([(0,r.state)()],c.prototype,"error",void 0),d([(0,r.property)({type:Boolean})],c.prototype,"isMobile",void 0),d([(0,r.property)()],c.prototype,"onRetry",void 0),c=d([(0,i.customElement)('w3m-buy-in-progress-view')],c)},3819,[2549,2575,2586,2164,2546,2683,2650,2658,2705,2659,2817,2651,2878,3820]);
__d(function(g,r,i,a,m,e,d){"use strict";Object.defineProperty(e,'__esModule',{value:!0}),Object.defineProperty(e,"default",{enumerable:!0,get:function(){return t}});var t=r(d[0]).css`
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

  wui-visual {
    border-radius: calc(
      ${({borderRadius:t})=>t[1]} * 9 - ${({borderRadius:t})=>t[3]}
    );
    position: relative;
    overflow: hidden;
  }

  wui-icon-box {
    position: absolute;
    right: calc(${({spacing:t})=>t[1]} * -1);
    bottom: calc(${({spacing:t})=>t[1]} * -1);
    opacity: 0;
    transform: scale(0.5);
    transition:
      opacity ${({durations:t})=>t.lg} ${({easings:t})=>t['ease-out-power-2']},
      transform ${({durations:t})=>t.lg}
        ${({easings:t})=>t['ease-out-power-2']};
    will-change: opacity, transform;
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

  [data-retry='false'] wui-link {
    display: none;
  }

  [data-retry='true'] wui-link {
    display: block;
    opacity: 1;
  }

  wui-link {
    padding: ${({spacing:t})=>t['01']} ${({spacing:t})=>t[2]};
  }
`},3820,[2546]);
__d(function(g,_r,_i,a,m,e,_d){"use strict";Object.defineProperty(e,'__esModule',{value:!0}),Object.defineProperty(e,"W3mWhatIsABuyView",{enumerable:!0,get:function(){return o}});var t=_r(_d[0]),r=_r(_d[1]),i=_r(_d[2]);_r(_d[3]),_r(_d[4]),_r(_d[5]),_r(_d[6]),_r(_d[7]);var n=this&&this.__decorate||function(t,r,i,n){var o,u=arguments.length,l=u<3?r:null===n?n=Object.getOwnPropertyDescriptor(r,i):n;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)l=Reflect.decorate(t,r,i,n);else for(var c=t.length-1;c>=0;c--)(o=t[c])&&(l=(u<3?o(l):u>3?o(r,i,l):o(r,i))||l);return u>3&&l&&Object.defineProperty(r,i,l),l};let o=class extends t.LitElement{render(){return t.html`
      <wui-flex
        flexDirection="column"
        .padding=${['6','10','5','10']}
        alignItems="center"
        gap="5"
      >
        <wui-visual name="onrampCard"></wui-visual>
        <wui-flex flexDirection="column" gap="2" alignItems="center">
          <wui-text align="center" variant="md-medium" color="primary">
            Quickly and easily buy digital assets!
          </wui-text>
          <wui-text align="center" variant="sm-regular" color="secondary">
            Simply select your preferred onramp provider and add digital assets to your account
            using your credit card or bank transfer
          </wui-text>
        </wui-flex>
        <wui-button @click=${r.RouterController.goBack}>
          <wui-icon size="sm" color="inherit" name="add" slot="iconLeft"></wui-icon>
          Buy
        </wui-button>
      </wui-flex>
    `}};o=n([(0,i.customElement)('w3m-what-is-a-buy-view')],o)},3821,[2549,2164,2546,2683,2650,2658,2651,2878]);
__d(function(g,_r,_i,a,m,_e,_d){"use strict";Object.defineProperty(_e,'__esModule',{value:!0}),Object.defineProperty(_e,"W3mOnrampWidget",{enumerable:!0,get:function(){return c}});var t=_r(_d[0]),e=_r(_d[1]),n=_r(_d[2]),o=_r(_d[3]);_r(_d[4]),_r(_d[5]),_r(_d[6]);var i,r=_r(_d[7]),s=(i=r)&&i.__esModule?i:{default:i},u=this&&this.__decorate||function(t,e,n,o){var i,r=arguments.length,s=r<3?e:null===o?o=Object.getOwnPropertyDescriptor(e,n):o;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)s=Reflect.decorate(t,e,n,o);else for(var u=t.length-1;u>=0;u--)(i=t[u])&&(s=(r<3?i(s):r>3?i(e,n,s):i(e,n))||s);return r>3&&s&&Object.defineProperty(e,n,s),s};const l={USD:'$',EUR:'\u20ac',GBP:'\xa3'},p=[100,250,500,1e3];let c=class extends t.LitElement{constructor(){super(),this.unsubscribe=[],this.disabled=!1,this.caipAddress=n.ChainController.state.activeCaipAddress,this.loading=n.ModalController.state.loading,this.paymentCurrency=n.OnRampController.state.paymentCurrency,this.paymentAmount=n.OnRampController.state.paymentAmount,this.purchaseAmount=n.OnRampController.state.purchaseAmount,this.quoteLoading=n.OnRampController.state.quotesLoading,this.unsubscribe.push(n.ChainController.subscribeKey('activeCaipAddress',t=>this.caipAddress=t),n.ModalController.subscribeKey('loading',t=>{this.loading=t}),n.OnRampController.subscribe(t=>{this.paymentCurrency=t.paymentCurrency,this.paymentAmount=t.paymentAmount,this.purchaseAmount=t.purchaseAmount,this.quoteLoading=t.quotesLoading}))}disconnectedCallback(){this.unsubscribe.forEach(t=>t())}render(){return t.html`
      <wui-flex flexDirection="column" justifyContent="center" alignItems="center">
        <wui-flex flexDirection="column" alignItems="center" gap="2">
          <w3m-onramp-input
            type="Fiat"
            @inputChange=${this.onPaymentAmountChange.bind(this)}
            .value=${this.paymentAmount||0}
          ></w3m-onramp-input>
          <w3m-onramp-input
            type="Token"
            .value=${this.purchaseAmount||0}
            .loading=${this.quoteLoading}
          ></w3m-onramp-input>
          <wui-flex justifyContent="space-evenly" class="amounts-container" gap="2">
            ${p.map(e=>t.html`<wui-button
                  variant=${this.paymentAmount===e?'accent-secondary':'neutral-secondary'}
                  size="md"
                  textVariant="md-medium"
                  fullWidth
                  @click=${()=>this.selectPresetAmount(e)}
                  >${`${l[this.paymentCurrency?.id||'USD']} ${e}`}</wui-button
                >`)}
          </wui-flex>
          ${this.templateButton()}
        </wui-flex>
      </wui-flex>
    `}templateButton(){return this.caipAddress?t.html`<wui-button
          @click=${this.getQuotes.bind(this)}
          variant="accent-primary"
          fullWidth
          size="lg"
          borderRadius="xs"
        >
          Get quotes
        </wui-button>`:t.html`<wui-button
          @click=${this.openModal.bind(this)}
          variant="accent"
          fullWidth
          size="lg"
          borderRadius="xs"
        >
          Connect wallet
        </wui-button>`}getQuotes(){this.loading||n.ModalController.open({view:'OnRampProviders'})}openModal(){n.ModalController.open({view:'Connect'})}async onPaymentAmountChange(t){n.OnRampController.setPaymentAmount(Number(t.detail)),await n.OnRampController.getQuote()}async selectPresetAmount(t){n.OnRampController.setPaymentAmount(t),await n.OnRampController.getQuote()}};c.styles=s.default,u([(0,e.property)({type:Boolean})],c.prototype,"disabled",void 0),u([(0,e.state)()],c.prototype,"caipAddress",void 0),u([(0,e.state)()],c.prototype,"loading",void 0),u([(0,e.state)()],c.prototype,"paymentCurrency",void 0),u([(0,e.state)()],c.prototype,"paymentAmount",void 0),u([(0,e.state)()],c.prototype,"purchaseAmount",void 0),u([(0,e.state)()],c.prototype,"quoteLoading",void 0),c=u([(0,o.customElement)('w3m-onramp-widget')],c)},3822,[2549,2575,2164,2546,2683,2650,3823,3825]);
__d(function(g,_r,_i,a,m,_e,_d){"use strict";Object.defineProperty(_e,'__esModule',{value:!0}),Object.defineProperty(_e,"W3mInputCurrency",{enumerable:!0,get:function(){return l}});var e=_r(_d[0]),t=_r(_d[1]),r=_r(_d[2]),s=_r(_d[3]),n=_r(_d[4]);_r(_d[5]),_r(_d[6]),_r(_d[7]),_r(_d[8]),_r(_d[9]);var i,c=_r(_d[10]),o=(i=c)&&i.__esModule?i:{default:i},u=this&&this.__decorate||function(e,t,r,s){var n,i=arguments.length,c=i<3?t:null===s?s=Object.getOwnPropertyDescriptor(t,r):s;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)c=Reflect.decorate(e,t,r,s);else for(var o=e.length-1;o>=0;o--)(n=e[o])&&(c=(i<3?n(c):i>3?n(t,r,c):n(t,r))||c);return i>3&&c&&Object.defineProperty(t,r,c),c};let l=class extends e.LitElement{constructor(){super(),this.unsubscribe=[],this.type='Token',this.value=0,this.currencies=[],this.selectedCurrency=this.currencies?.[0],this.currencyImages=s.AssetController.state.currencyImages,this.tokenImages=s.AssetController.state.tokenImages,this.unsubscribe.push(s.OnRampController.subscribeKey('purchaseCurrency',e=>{e&&'Fiat'!==this.type&&(this.selectedCurrency=this.formatPurchaseCurrency(e))}),s.OnRampController.subscribeKey('paymentCurrency',e=>{e&&'Token'!==this.type&&(this.selectedCurrency=this.formatPaymentCurrency(e))}),s.OnRampController.subscribe(e=>{'Fiat'===this.type?this.currencies=e.purchaseCurrencies.map(this.formatPurchaseCurrency):this.currencies=e.paymentCurrencies.map(this.formatPaymentCurrency)}),s.AssetController.subscribe(e=>{this.currencyImages={...e.currencyImages},this.tokenImages={...e.tokenImages}}))}firstUpdated(){s.OnRampController.getAvailableCurrencies()}disconnectedCallback(){this.unsubscribe.forEach(e=>e())}render(){const t=this.selectedCurrency?.symbol||'',n=this.currencyImages[t]||this.tokenImages[t];return e.html`<wui-input-text type="number" size="lg" value=${this.value}>
      ${this.selectedCurrency?e.html` <wui-flex
            class="currency-container"
            justifyContent="space-between"
            alignItems="center"
            gap="1"
            @click=${()=>s.ModalController.open({view:`OnRamp${this.type}Select`})}
          >
            <wui-image src=${(0,r.ifDefined)(n)}></wui-image>
            <wui-text color="primary">${this.selectedCurrency.symbol}</wui-text>
          </wui-flex>`:e.html`<wui-loading-spinner></wui-loading-spinner>`}
    </wui-input-text>`}formatPaymentCurrency(e){return{name:e.id,symbol:e.id}}formatPurchaseCurrency(e){return{name:e.name,symbol:e.symbol}}};l.styles=o.default,u([(0,t.property)({type:String})],l.prototype,"type",void 0),u([(0,t.property)({type:Number})],l.prototype,"value",void 0),u([(0,t.state)()],l.prototype,"currencies",void 0),u([(0,t.state)()],l.prototype,"selectedCurrency",void 0),u([(0,t.state)()],l.prototype,"currencyImages",void 0),u([(0,t.state)()],l.prototype,"tokenImages",void 0),l=u([(0,n.customElement)('w3m-onramp-input')],l)},3823,[2549,2575,2586,2164,2546,2650,3826,2914,2778,2651,3824]);
__d(function(g,r,i,a,m,e,d){"use strict";Object.defineProperty(e,'__esModule',{value:!0}),Object.defineProperty(e,"default",{enumerable:!0,get:function(){return t}});var t=r(d[0]).css`
  :host {
    width: 100%;
  }

  wui-loading-spinner {
    position: absolute;
    top: 50%;
    right: 20px;
    transform: translateY(-50%);
  }

  .currency-container {
    position: absolute;
    top: 50%;
    transform: translateY(-50%);
    right: ${({spacing:t})=>t[2]};
    height: 40px;
    padding: ${({spacing:t})=>t[2]} ${({spacing:t})=>t[2]}
      ${({spacing:t})=>t[2]} ${({spacing:t})=>t[2]};
    min-width: 95px;
    border-radius: ${({borderRadius:t})=>t.round};
    border: 1px solid ${({tokens:t})=>t.theme.foregroundPrimary};
    background: ${({tokens:t})=>t.theme.foregroundPrimary};
    cursor: pointer;
  }

  .currency-container > wui-image {
    height: 24px;
    width: 24px;
    border-radius: 50%;
  }
`},3824,[2546]);
__d(function(g,r,i,a,m,e,d){"use strict";Object.defineProperty(e,'__esModule',{value:!0}),Object.defineProperty(e,"default",{enumerable:!0,get:function(){return t}});var t=r(d[0]).css`
  :host > wui-flex {
    width: 100%;
    max-width: 360px;
  }

  :host > wui-flex > wui-flex {
    border-radius: ${({borderRadius:t})=>t[8]};
    width: 100%;
  }

  .amounts-container {
    width: 100%;
  }
`},3825,[2546]);