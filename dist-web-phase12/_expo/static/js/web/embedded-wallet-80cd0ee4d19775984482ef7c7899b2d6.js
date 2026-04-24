__d(function(g,r,i,a,m,e,d){"use strict";Object.defineProperty(e,'__esModule',{value:!0});var t=r(d[0]);Object.keys(t).forEach(function(n){'default'===n||Object.prototype.hasOwnProperty.call(e,n)||Object.defineProperty(e,n,{enumerable:!0,get:function(){return t[n]}})});var n=r(d[1]);Object.keys(n).forEach(function(t){'default'===t||Object.prototype.hasOwnProperty.call(e,t)||Object.defineProperty(e,t,{enumerable:!0,get:function(){return n[t]}})});var c=r(d[2]);Object.keys(c).forEach(function(t){'default'===t||Object.prototype.hasOwnProperty.call(e,t)||Object.defineProperty(e,t,{enumerable:!0,get:function(){return c[t]}})});var o=r(d[3]);Object.keys(o).forEach(function(t){'default'===t||Object.prototype.hasOwnProperty.call(e,t)||Object.defineProperty(e,t,{enumerable:!0,get:function(){return o[t]}})});var u=r(d[4]);Object.keys(u).forEach(function(t){'default'===t||Object.prototype.hasOwnProperty.call(e,t)||Object.defineProperty(e,t,{enumerable:!0,get:function(){return u[t]}})})},3665,[3732,3734,3738,3739,3747]);
__d(function(g,_r,_i,a,m,_e,_d){"use strict";Object.defineProperty(_e,'__esModule',{value:!0}),Object.defineProperty(_e,"W3mApproveTransactionView",{enumerable:!0,get:function(){return d}});var e,t=_r(_d[0]),i=_r(_d[1]),s=_r(_d[2]),r=_r(_d[3]),o=_r(_d[4]),n=_r(_d[5]),h=(e=n)&&e.__esModule?e:{default:e},l=this&&this.__decorate||function(e,t,i,s){var r,o=arguments.length,n=o<3?t:null===s?s=Object.getOwnPropertyDescriptor(t,i):s;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)n=Reflect.decorate(e,t,i,s);else for(var h=e.length-1;h>=0;h--)(r=e[h])&&(n=(o<3?r(n):o>3?r(t,i,n):r(t,i))||n);return o>3&&n&&Object.defineProperty(t,i,n),n};let d=class extends t.LitElement{constructor(){super(),this.bodyObserver=void 0,this.unsubscribe=[],this.iframe=document.getElementById('w3m-iframe'),this.ready=!1,this.unsubscribe.push(r.ModalController.subscribeKey('open',e=>{e||this.onHideIframe()}),r.ModalController.subscribeKey('shake',e=>{this.iframe.style.animation=e?"w3m-shake 500ms var(--apkt-easings-ease-out-power-2)":'none'}))}disconnectedCallback(){this.onHideIframe(),this.unsubscribe.forEach(e=>e()),this.bodyObserver?.unobserve(window.document.body)}async firstUpdated(){await this.syncTheme(),this.iframe.style.display='block';const e=this?.renderRoot?.querySelector('div');this.bodyObserver=new ResizeObserver(t=>{const i=t?.[0]?.contentBoxSize,s=i?.[0]?.inlineSize;this.iframe.style.height="600px",e.style.height="600px",r.OptionsController.state.enableEmbedded?this.updateFrameSizeForEmbeddedMode():s&&s<=430?(this.iframe.style.width='100%',this.iframe.style.left='0px',this.iframe.style.bottom='0px',this.iframe.style.top='unset',this.onShowIframe()):(this.iframe.style.width="360px",this.iframe.style.left="calc(50% - 180px)",this.iframe.style.top="calc(50% - 300px + 32px)",this.iframe.style.bottom='unset',this.onShowIframe())}),this.bodyObserver.observe(window.document.body)}render(){return t.html`<div data-ready=${this.ready} id="w3m-frame-container"></div>`}onShowIframe(){const e=window.innerWidth<=430;this.ready=!0,this.iframe.style.animation=e?'w3m-iframe-zoom-in-mobile 200ms var(--apkt-easings-ease-out-power-2)':'w3m-iframe-zoom-in 200ms var(--apkt-easings-ease-out-power-2)'}onHideIframe(){this.iframe.style.display='none',this.iframe.style.animation='w3m-iframe-fade-out 200ms var(--apkt-easings-ease-out-power-2)'}async syncTheme(){const e=r.ConnectorController.getAuthConnector();if(e){const t=r.ThemeController.getSnapshot().themeMode,i=r.ThemeController.getSnapshot().themeVariables;await e.provider.syncTheme({themeVariables:i,w3mThemeVariables:(0,s.getW3mThemeVariables)(i,t)})}}async updateFrameSizeForEmbeddedMode(){const e=this?.renderRoot?.querySelector('div');await new Promise(e=>{setTimeout(e,300)});const t=this.getBoundingClientRect();e.style.width='100%',this.iframe.style.left=`${t.left}px`,this.iframe.style.top=`${t.top}px`,this.iframe.style.width=`${t.width}px`,this.iframe.style.height=`${t.height}px`,this.onShowIframe()}};d.styles=h.default,l([(0,i.state)()],d.prototype,"ready",void 0),d=l([(0,o.customElement)('w3m-approve-transaction-view')],d)},3732,[2549,2575,2169,2164,2546,3733]);
__d(function(g,r,i,a,m,e,d){"use strict";Object.defineProperty(e,'__esModule',{value:!0}),Object.defineProperty(e,"default",{enumerable:!0,get:function(){return t}});var t=r(d[0]).css`
  div {
    width: 100%;
  }

  [data-ready='false'] {
    transform: scale(1.05);
  }

  @media (max-width: 430px) {
    [data-ready='false'] {
      transform: translateY(-50px);
    }
  }
`},3733,[2549]);
__d(function(g,_r,_i,a,m,e,_d){"use strict";Object.defineProperty(e,'__esModule',{value:!0}),Object.defineProperty(e,"W3mUpgradeWalletView",{enumerable:!0,get:function(){return l}});var t=_r(_d[0]),r=_r(_d[1]),n=_r(_d[2]);_r(_d[3]),_r(_d[4]),_r(_d[5]);var i=this&&this.__decorate||function(t,r,n,i){var l,o=arguments.length,c=o<3?r:null===i?i=Object.getOwnPropertyDescriptor(r,n):i;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)c=Reflect.decorate(t,r,n,i);else for(var s=t.length-1;s>=0;s--)(l=t[s])&&(c=(o<3?l(c):o>3?l(r,n,c):l(r,n))||c);return o>3&&c&&Object.defineProperty(r,n,c),c};let l=class extends t.LitElement{render(){return t.html`
      <wui-flex flexDirection="column" alignItems="center" gap="5" padding="5">
        <wui-text variant="md-regular" color="primary">Follow the instructions on</wui-text>
        <wui-semantic-chip
          icon="externalLink"
          variant="fill"
          text=${r.ConstantsUtil.SECURE_SITE_DASHBOARD}
          href=${r.ConstantsUtil.SECURE_SITE_DASHBOARD}
          imageSrc=${r.ConstantsUtil.SECURE_SITE_FAVICON}
          data-testid="w3m-secure-website-button"
        >
        </wui-semantic-chip>
        <wui-text variant="sm-regular" color="secondary">
          You will have to reconnect for security reasons
        </wui-text>
      </wui-flex>
    `}};l=i([(0,n.customElement)('w3m-upgrade-wallet-view')],l)},3734,[2549,2164,2546,2650,3735,2651]);
__d(function(g,r,i,a,m,e,d){"use strict";Object.defineProperty(e,'__esModule',{value:!0});var t=r(d[0]);Object.keys(t).forEach(function(n){'default'===n||Object.prototype.hasOwnProperty.call(e,n)||Object.defineProperty(e,n,{enumerable:!0,get:function(){return t[n]}})})},3735,[3736]);
__d(function(g,_r,_i,a,m,_e,_d){"use strict";Object.defineProperty(_e,'__esModule',{value:!0}),Object.defineProperty(_e,"WuiSemanticChip",{enumerable:!0,get:function(){return h}});var e=_r(_d[0]),t=_r(_d[1]);_r(_d[2]),_r(_d[3]),_r(_d[4]);var i,r=_r(_d[5]),s=_r(_d[6]),o=_r(_d[7]),l=(i=o)&&i.__esModule?i:{default:i},n=this&&this.__decorate||function(e,t,i,r){var s,o=arguments.length,l=o<3?t:null===r?r=Object.getOwnPropertyDescriptor(t,i):r;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)l=Reflect.decorate(e,t,i,r);else for(var n=e.length-1;n>=0;n--)(s=e[n])&&(l=(o<3?s(l):o>3?s(t,i,l):s(t,i))||l);return o>3&&l&&Object.defineProperty(t,i,l),l};const c={sm:'md-regular',md:'lg-regular',lg:'lg-regular'},p={success:'sealCheck',error:'warning',warning:'exclamationCircle'};let h=class extends e.LitElement{constructor(){super(...arguments),this.type='success',this.size='md',this.imageSrc=void 0,this.disabled=!1,this.href='',this.text=void 0}render(){return e.html`
      <a
        rel="noreferrer"
        target="_blank"
        href=${this.href}
        class=${this.disabled?'disabled':''}
        data-type=${this.type}
        data-size=${this.size}
      >
        ${this.imageTemplate()}
        <wui-text variant=${c[this.size]} color="inherit">${this.text}</wui-text>
      </a>
    `}imageTemplate(){return this.imageSrc?e.html`<wui-image src=${this.imageSrc} size="inherit"></wui-image>`:e.html`<wui-icon
      name=${p[this.type]}
      weight="fill"
      color="inherit"
      size="inherit"
      class="image-icon"
    ></wui-icon>`}};h.styles=[r.resetStyles,r.elementStyles,l.default],n([(0,t.property)()],h.prototype,"type",void 0),n([(0,t.property)()],h.prototype,"size",void 0),n([(0,t.property)()],h.prototype,"imageSrc",void 0),n([(0,t.property)({type:Boolean})],h.prototype,"disabled",void 0),n([(0,t.property)()],h.prototype,"href",void 0),n([(0,t.property)()],h.prototype,"text",void 0),h=n([(0,s.customElement)('wui-semantic-chip')],h)},3736,[2549,2575,2590,2620,2624,2548,2559,3737]);
__d(function(g,r,i,a,m,e,d){"use strict";Object.defineProperty(e,'__esModule',{value:!0}),Object.defineProperty(e,"default",{enumerable:!0,get:function(){return o}});var o=r(d[0]).css`
  a {
    border: none;
    border-radius: ${({borderRadius:o})=>o[20]};
    display: flex;
    flex-direction: row;
    align-items: center;
    padding: ${({spacing:o})=>o[1]};
    transition:
      background-color ${({durations:o})=>o.lg}
        ${({easings:o})=>o['ease-out-power-2']},
      box-shadow ${({durations:o})=>o.lg}
        ${({easings:o})=>o['ease-out-power-2']},
      border ${({durations:o})=>o.lg} ${({easings:o})=>o['ease-out-power-2']};
    will-change: background-color, box-shadow, border;
  }

  /* -- Variants --------------------------------------------------------------- */
  a[data-type='success'] {
    background-color: ${({tokens:o})=>o.core.backgroundSuccess};
    color: ${({tokens:o})=>o.core.textSuccess};
  }

  a[data-type='error'] {
    background-color: ${({tokens:o})=>o.core.backgroundError};
    color: ${({tokens:o})=>o.core.textError};
  }

  a[data-type='warning'] {
    background-color: ${({tokens:o})=>o.core.backgroundWarning};
    color: ${({tokens:o})=>o.core.textWarning};
  }

  /* -- Sizes --------------------------------------------------------------- */
  a[data-size='sm'] {
    height: 24px;
  }

  a[data-size='md'] {
    height: 28px;
  }

  a[data-size='lg'] {
    height: 32px;
  }

  a[data-size='sm'] > wui-image,
  a[data-size='sm'] > wui-icon {
    width: 16px;
    height: 16px;
  }

  a[data-size='md'] > wui-image,
  a[data-size='md'] > wui-icon {
    width: 20px;
    height: 20px;
  }

  a[data-size='lg'] > wui-image,
  a[data-size='lg'] > wui-icon {
    width: 24px;
    height: 24px;
  }

  wui-text {
    padding-left: ${({spacing:o})=>o[1]};
    padding-right: ${({spacing:o})=>o[1]};
  }

  wui-image {
    border-radius: ${({borderRadius:o})=>o[3]};
    overflow: hidden;
    user-drag: none;
    user-select: none;
    -moz-user-select: none;
    -webkit-user-drag: none;
    -webkit-user-select: none;
    -ms-user-select: none;
  }

  /* -- States --------------------------------------------------------------- */
  @media (hover: hover) and (pointer: fine) {
    a[data-type='success']:not(:disabled):hover {
      background-color: ${({tokens:o})=>o.theme.foregroundPrimary};
      box-shadow: 0px 0px 0px 1px ${({tokens:o})=>o.core.borderSuccess};
    }

    a[data-type='error']:not(:disabled):hover {
      background-color: ${({tokens:o})=>o.theme.foregroundPrimary};
      box-shadow: 0px 0px 0px 1px ${({tokens:o})=>o.core.borderError};
    }

    a[data-type='warning']:not(:disabled):hover {
      background-color: ${({tokens:o})=>o.theme.foregroundPrimary};
      box-shadow: 0px 0px 0px 1px ${({tokens:o})=>o.core.borderWarning};
    }
  }

  a[data-type='success']:not(:disabled):focus-visible {
    box-shadow:
      0px 0px 0px 1px ${({tokens:o})=>o.core.backgroundAccentPrimary},
      0px 0px 0px 4px ${({tokens:o})=>o.core.foregroundAccent020};
  }

  a[data-type='error']:not(:disabled):focus-visible {
    box-shadow:
      0px 0px 0px 1px ${({tokens:o})=>o.core.backgroundAccentPrimary},
      0px 0px 0px 4px ${({tokens:o})=>o.core.foregroundAccent020};
  }

  a[data-type='warning']:not(:disabled):focus-visible {
    box-shadow:
      0px 0px 0px 1px ${({tokens:o})=>o.core.backgroundAccentPrimary},
      0px 0px 0px 4px ${({tokens:o})=>o.core.foregroundAccent020};
  }

  a:disabled {
    opacity: 0.5;
  }
`},3737,[2555]);
__d(function(g,_r,_i,a,m,e,_d){"use strict";Object.defineProperty(e,'__esModule',{value:!0}),Object.defineProperty(e,"W3mSmartAccountSettingsView",{enumerable:!0,get:function(){return u}});var t=_r(_d[0]),o=_r(_d[1]),r=_r(_d[2]),n=_r(_d[3]),i=_r(_d[4]),c=_r(_d[5]),s=_r(_d[6]),l=this&&this.__decorate||function(t,o,r,n){var i,c=arguments.length,s=c<3?o:null===n?n=Object.getOwnPropertyDescriptor(o,r):n;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)s=Reflect.decorate(t,o,r,n);else for(var l=t.length-1;l>=0;l--)(i=t[l])&&(s=(c<3?i(s):c>3?i(o,r,s):i(o,r))||s);return c>3&&s&&Object.defineProperty(o,r,s),s};let u=class extends t.LitElement{constructor(){super(...arguments),this.loading=!1,this.switched=!1,this.text='',this.network=n.ChainController.state.activeCaipNetwork}render(){return t.html`
      <wui-flex flexDirection="column" gap="2" .padding=${['6','4','3','4']}>
        ${this.togglePreferredAccountTypeTemplate()} ${this.toggleSmartAccountVersionTemplate()}
      </wui-flex>
    `}toggleSmartAccountVersionTemplate(){return t.html`
      <w3m-tooltip-trigger text="Changing the smart account version will reload the page">
        <wui-list-item
          icon=${this.isV6()?'arrowTop':'arrowBottom'}
          ?rounded=${!0}
          ?chevron=${!0}
          data-testid="account-toggle-smart-account-version"
          @click=${this.toggleSmartAccountVersion.bind(this)}
        >
          <wui-text variant="lg-regular" color="primary"
            >Force Smart Account Version ${this.isV6()?'7':'6'}</wui-text
          >
        </wui-list-item>
      </w3m-tooltip-trigger>
    `}isV6(){return'v6'===(c.W3mFrameStorage.get('dapp_smart_account_version')||'v6')}toggleSmartAccountVersion(){c.W3mFrameStorage.set('dapp_smart_account_version',this.isV6()?'v7':'v6'),'undefined'!=typeof window&&window?.location?.reload()}togglePreferredAccountTypeTemplate(){const o=this.network?.chainNamespace,i=n.ChainController.checkIfSmartAccountEnabled(),c=n.ConnectorController.getConnectorId(o);return n.ConnectorController.getAuthConnector()&&c===r.ConstantsUtil.CONNECTOR_ID.AUTH&&i?(this.switched||(this.text=(0,n.getPreferredAccountType)(o)===s.W3mFrameRpcConstants.ACCOUNT_TYPES.SMART_ACCOUNT?'Switch to your EOA':'Switch to your Smart Account'),t.html`
      <wui-list-item
        icon="swapHorizontal"
        ?rounded=${!0}
        ?chevron=${!0}
        ?loading=${this.loading}
        @click=${this.changePreferredAccountType.bind(this)}
        data-testid="account-toggle-preferred-account-type"
      >
        <wui-text variant="lg-regular" color="primary">${this.text}</wui-text>
      </wui-list-item>
    `):null}async changePreferredAccountType(){const t=this.network?.chainNamespace,o=n.ChainController.checkIfSmartAccountEnabled(),r=(0,n.getPreferredAccountType)(t)!==s.W3mFrameRpcConstants.ACCOUNT_TYPES.SMART_ACCOUNT&&o?s.W3mFrameRpcConstants.ACCOUNT_TYPES.SMART_ACCOUNT:s.W3mFrameRpcConstants.ACCOUNT_TYPES.EOA;n.ConnectorController.getAuthConnector()&&(this.loading=!0,await n.ConnectionController.setPreferredAccountType(r,t),this.text=r===s.W3mFrameRpcConstants.ACCOUNT_TYPES.SMART_ACCOUNT?'Switch to your EOA':'Switch to your Smart Account',this.switched=!0,n.SendController.resetSend(),this.loading=!1,this.requestUpdate())}};l([(0,o.state)()],u.prototype,"loading",void 0),l([(0,o.state)()],u.prototype,"switched",void 0),l([(0,o.state)()],u.prototype,"text",void 0),l([(0,o.state)()],u.prototype,"network",void 0),u=l([(0,i.customElement)('w3m-smart-account-settings-view')],u)},3738,[2549,2575,2169,2164,2546,2198,2222]);
__d(function(g,_r,_i,a,m,_e,_d){"use strict";Object.defineProperty(_e,'__esModule',{value:!0}),Object.defineProperty(_e,"W3mRegisterAccountNameView",{enumerable:!0,get:function(){return p}});var e=_r(_d[0]),t=_r(_d[1]),n=_r(_d[2]),i=_r(_d[3]),s=_r(_d[4]),r=_r(_d[5]);_r(_d[6]),_r(_d[7]),_r(_d[8]),_r(_d[9]),_r(_d[10]),_r(_d[11]),_r(_d[12]);var o,l=_r(_d[13]),u=_r(_d[14]),c=_r(_d[15]),h=(o=c)&&o.__esModule?o:{default:o},d=this&&this.__decorate||function(e,t,n,i){var s,r=arguments.length,o=r<3?t:null===i?i=Object.getOwnPropertyDescriptor(t,n):i;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)o=Reflect.decorate(e,t,n,i);else for(var l=e.length-1;l>=0;l--)(s=e[l])&&(o=(r<3?s(o):r>3?s(t,n,o):s(t,n))||o);return r>3&&o&&Object.defineProperty(t,n,o),o};let p=class extends e.LitElement{constructor(){super(),this.formRef=(0,n.createRef)(),this.usubscribe=[],this.name='',this.error='',this.loading=s.EnsController.state.loading,this.suggestions=s.EnsController.state.suggestions,this.profileName=s.ChainController.getAccountData()?.profileName,this.onDebouncedNameInputChange=s.CoreHelperUtil.debounce(e=>{e.length<4?this.error='Name must be at least 4 characters long':u.HelpersUtil.isValidReownName(e)?(this.error='',s.EnsController.getSuggestions(e)):this.error='The value is not a valid username'}),this.usubscribe.push(s.EnsController.subscribe(e=>{this.suggestions=e.suggestions,this.loading=e.loading}),s.ChainController.subscribeChainProp('accountState',e=>{this.profileName=e?.profileName,e?.profileName&&(this.error='You already own a name')}))}firstUpdated(){this.formRef.value?.addEventListener('keydown',this.onEnterKey.bind(this))}disconnectedCallback(){super.disconnectedCallback(),this.usubscribe.forEach(e=>e()),this.formRef.value?.removeEventListener('keydown',this.onEnterKey.bind(this))}render(){return e.html`
      <wui-flex
        flexDirection="column"
        alignItems="center"
        gap="4"
        .padding=${['1','3','4','3']}
      >
        <form ${(0,n.ref)(this.formRef)} @submit=${this.onSubmitName.bind(this)}>
          <wui-ens-input
            @inputChange=${this.onNameInputChange.bind(this)}
            .errorMessage=${this.error}
            .value=${this.name}
            .onKeyDown=${this.onKeyDown.bind(this)}
          >
          </wui-ens-input>
          ${this.submitButtonTemplate()}
          <input type="submit" hidden />
        </form>
        ${this.templateSuggestions()}
      </wui-flex>
    `}submitButtonTemplate(){const t=this.suggestions.find(e=>e.name?.split('.')?.[0]===this.name&&e.registered);if(this.loading)return e.html`<wui-loading-spinner
        class="input-loading-spinner"
        color="secondary"
      ></wui-loading-spinner>`;const n=`${this.name}${i.ConstantsUtil.WC_NAME_SUFFIX}`;return e.html`
      <wui-icon-link
        ?disabled=${Boolean(t)}
        class="input-submit-button"
        size="sm"
        icon="chevronRight"
        iconColor=${t?'default':'accent-primary'}
        @click=${()=>this.onSubmitName(n)}
      >
      </wui-icon-link>
    `}onNameInputChange(e){const t=u.HelpersUtil.validateReownName(e.detail||'');this.name=t,this.onDebouncedNameInputChange(t)}onKeyDown(e){1!==e.key.length||u.HelpersUtil.isValidReownName(e.key)||e.preventDefault()}templateSuggestions(){return!this.name||this.name.length<4||this.error?null:e.html`<wui-flex flexDirection="column" gap="1" alignItems="center">
      ${this.suggestions.map(t=>e.html`<wui-account-name-suggestion-item
            name=${t.name}
            ?registered=${t.registered}
            ?loading=${this.loading}
            ?disabled=${t.registered||this.loading}
            data-testid="account-name-suggestion"
            @click=${()=>this.onSubmitName(t.name)}
          ></wui-account-name-suggestion-item>`)}
    </wui-flex>`}isAllowedToSubmit(e){const t=e.split('.')?.[0],n=this.suggestions.find(e=>e.name?.split('.')?.[0]===t&&e.registered);return!this.loading&&!this.error&&!this.profileName&&t&&s.EnsController.validateName(t)&&!n}async onSubmitName(e){try{if(!this.isAllowedToSubmit(e))return;s.EventsController.sendEvent({type:'track',event:'REGISTER_NAME_INITIATED',properties:{isSmartAccount:(0,s.getPreferredAccountType)(s.ChainController.state.activeChain)===l.W3mFrameRpcConstants.ACCOUNT_TYPES.SMART_ACCOUNT,ensName:e}}),await s.EnsController.registerName(e),s.EventsController.sendEvent({type:'track',event:'REGISTER_NAME_SUCCESS',properties:{isSmartAccount:(0,s.getPreferredAccountType)(s.ChainController.state.activeChain)===l.W3mFrameRpcConstants.ACCOUNT_TYPES.SMART_ACCOUNT,ensName:e}})}catch(t){s.SnackController.showError(t.message),s.EventsController.sendEvent({type:'track',event:'REGISTER_NAME_ERROR',properties:{isSmartAccount:(0,s.getPreferredAccountType)(s.ChainController.state.activeChain)===l.W3mFrameRpcConstants.ACCOUNT_TYPES.SMART_ACCOUNT,ensName:e,error:s.CoreHelperUtil.parseError(t)}})}}onEnterKey(e){if('Enter'===e.key&&this.name&&this.isAllowedToSubmit(this.name)){const e=`${this.name}${i.ConstantsUtil.WC_NAME_SUFFIX}`;this.onSubmitName(e)}}};p.styles=h.default,d([(0,t.property)()],p.prototype,"errorMessage",void 0),d([(0,t.state)()],p.prototype,"name",void 0),d([(0,t.state)()],p.prototype,"error",void 0),d([(0,t.state)()],p.prototype,"loading",void 0),d([(0,t.state)()],p.prototype,"suggestions",void 0),d([(0,t.state)()],p.prototype,"profileName",void 0),p=d([(0,r.customElement)('w3m-register-account-name-view')],p)},3739,[2549,2575,2753,2169,2164,2546,3740,3743,2650,2658,2669,2778,2651,2222,2663,3746]);
__d(function(g,r,i,a,m,e,d){"use strict";Object.defineProperty(e,'__esModule',{value:!0});var t=r(d[0]);Object.keys(t).forEach(function(n){'default'===n||Object.prototype.hasOwnProperty.call(e,n)||Object.defineProperty(e,n,{enumerable:!0,get:function(){return t[n]}})})},3740,[3741]);
__d(function(g,_r,_i,a,m,_e,_d){"use strict";Object.defineProperty(_e,'__esModule',{value:!0}),Object.defineProperty(_e,"WuiAccountNameSuggestionItem",{enumerable:!0,get:function(){return u}});var e=_r(_d[0]),t=_r(_d[1]);_r(_d[2]),_r(_d[3]),_r(_d[4]);var i,r=_r(_d[5]),o=_r(_d[6]),n=_r(_d[7]),s=(i=n)&&i.__esModule?i:{default:i},l=this&&this.__decorate||function(e,t,i,r){var o,n=arguments.length,s=n<3?t:null===r?r=Object.getOwnPropertyDescriptor(t,i):r;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)s=Reflect.decorate(e,t,i,r);else for(var l=e.length-1;l>=0;l--)(o=e[l])&&(s=(n<3?o(s):n>3?o(t,i,s):o(t,i))||s);return n>3&&s&&Object.defineProperty(t,i,s),s};let u=class extends e.LitElement{constructor(){super(...arguments),this.name='',this.registered=!1,this.loading=!1,this.disabled=!1}render(){return e.html`
      <button ?disabled=${this.disabled}>
        <wui-text class="name" color="primary" variant="md-regular">${this.name}</wui-text>
        ${this.templateRightContent()}
      </button>
    `}templateRightContent(){return this.loading?e.html`<wui-loading-spinner size="lg" color="primary"></wui-loading-spinner>`:this.registered?e.html`<wui-tag variant="info" size="sm">Registered</wui-tag>`:e.html`<wui-tag variant="success" size="sm">Available</wui-tag>`}};u.styles=[r.resetStyles,r.elementStyles,s.default],l([(0,t.property)()],u.prototype,"name",void 0),l([(0,t.property)({type:Boolean})],u.prototype,"registered",void 0),l([(0,t.property)({type:Boolean})],u.prototype,"loading",void 0),l([(0,t.property)({type:Boolean})],u.prototype,"disabled",void 0),u=l([(0,o.customElement)('wui-account-name-suggestion-item')],u)},3741,[2549,2575,2622,2624,2690,2548,2559,3742]);
__d(function(g,r,i,a,m,e,d){"use strict";Object.defineProperty(e,'__esModule',{value:!0}),Object.defineProperty(e,"default",{enumerable:!0,get:function(){return o}});var o=r(d[0]).css`
  :host {
    width: 100%;
  }

  button {
    width: 100%;
    display: flex;
    justify-content: space-between;
    align-items: center;
    background-color: ${({tokens:o})=>o.theme.foregroundPrimary};
    border-radius: ${({borderRadius:o})=>o[4]};
    padding: ${({spacing:o})=>o[4]};
  }

  .name {
    max-width: 75%;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  @media (hover: hover) and (pointer: fine) {
    button:hover:enabled {
      cursor: pointer;
      background-color: ${({tokens:o})=>o.theme.foregroundSecondary};
      border-radius: ${({borderRadius:o})=>o[6]};
    }
  }

  button:disabled {
    opacity: 0.5;
    cursor: default;
  }

  button:focus-visible:enabled {
    box-shadow: 0 0 0 4px ${({tokens:o})=>o.core.foregroundAccent040};
    background-color: ${({tokens:o})=>o.theme.foregroundSecondary};
  }
`},3742,[2555]);
__d(function(g,r,i,a,m,e,d){"use strict";Object.defineProperty(e,'__esModule',{value:!0});var t=r(d[0]);Object.keys(t).forEach(function(n){'default'===n||Object.prototype.hasOwnProperty.call(e,n)||Object.defineProperty(e,n,{enumerable:!0,get:function(){return t[n]}})})},3743,[3744]);
__d(function(g,_r,_i,a,m,_e,_d){"use strict";Object.defineProperty(_e,'__esModule',{value:!0}),Object.defineProperty(_e,"WuiEnsInput",{enumerable:!0,get:function(){return u}});var e=_r(_d[0]),t=_r(_d[1]),o=_r(_d[2]);_r(_d[3]),_r(_d[4]);var r=_r(_d[5]),i=_r(_d[6]);_r(_d[7]);var n,p=_r(_d[8]),l=(n=p)&&n.__esModule?n:{default:n},s=this&&this.__decorate||function(e,t,o,r){var i,n=arguments.length,p=n<3?t:null===r?r=Object.getOwnPropertyDescriptor(t,o):r;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)p=Reflect.decorate(e,t,o,r);else for(var l=e.length-1;l>=0;l--)(i=e[l])&&(p=(n<3?i(p):n>3?i(t,o,p):i(t,o))||p);return n>3&&p&&Object.defineProperty(t,o,p),p};let u=class extends e.LitElement{constructor(){super(...arguments),this.disabled=!1,this.loading=!1}render(){return e.html`
      <wui-input-text
        value=${(0,o.ifDefined)(this.value)}
        ?disabled=${this.disabled}
        .value=${this.value||''}
        data-testid="wui-ens-input"
        icon="search"
        inputRightPadding="5xl"
        .onKeyDown=${this.onKeyDown}
      ></wui-input-text>
    `}};u.styles=[r.resetStyles,l.default],s([(0,t.property)()],u.prototype,"errorMessage",void 0),s([(0,t.property)({type:Boolean})],u.prototype,"disabled",void 0),s([(0,t.property)()],u.prototype,"value",void 0),s([(0,t.property)({type:Boolean})],u.prototype,"loading",void 0),s([(0,t.property)({attribute:!1})],u.prototype,"onKeyDown",void 0),u=s([(0,i.customElement)('wui-ens-input')],u)},3744,[2549,2575,2586,2590,2624,2548,2559,2761,3745]);
__d(function(g,r,i,a,m,e,d){"use strict";Object.defineProperty(e,'__esModule',{value:!0}),Object.defineProperty(e,"default",{enumerable:!0,get:function(){return t}});var t=r(d[0]).css`
  :host {
    position: relative;
    width: 100%;
    display: inline-block;
  }

  :host([disabled]) {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .base-name {
    position: absolute;
    right: ${({spacing:t})=>t[4]};
    top: 50%;
    transform: translateY(-50%);
    text-align: right;
    padding: ${({spacing:t})=>t[1]};
    background-color: ${({tokens:t})=>t.theme.foregroundSecondary};
    border-radius: ${({borderRadius:t})=>t[1]};
  }
`},3745,[2555]);
__d(function(g,r,i,a,m,e,d){"use strict";Object.defineProperty(e,'__esModule',{value:!0}),Object.defineProperty(e,"default",{enumerable:!0,get:function(){return o}});var o=r(d[0]).css`
  wui-flex {
    width: 100%;
  }

  .suggestion {
    background-color: ${({tokens:o})=>o.theme.foregroundPrimary};
    border-radius: ${({borderRadius:o})=>o[4]};
  }

  .suggestion:hover:not(:disabled) {
    cursor: pointer;
    border: none;
    width: 100%;
    display: flex;
    justify-content: space-between;
    align-items: center;
    background-color: ${({tokens:o})=>o.theme.foregroundSecondary};
    border-radius: ${({borderRadius:o})=>o[6]};
    padding: ${({spacing:o})=>o[4]};
  }

  .suggestion:disabled {
    opacity: 0.5;
    cursor: default;
  }

  .suggestion:focus-visible:not(:disabled) {
    box-shadow: 0 0 0 4px ${({tokens:o})=>o.core.foregroundAccent040};
    background-color: ${({tokens:o})=>o.theme.foregroundSecondary};
  }

  .suggested-name {
    max-width: 75%;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  form {
    width: 100%;
    position: relative;
  }

  .input-submit-button,
  .input-loading-spinner {
    position: absolute;
    top: 22px;
    transform: translateY(-50%);
    right: 10px;
  }
`},3746,[2546]);
__d(function(g,_r,_i,a,m,_e,_d){"use strict";Object.defineProperty(_e,'__esModule',{value:!0}),Object.defineProperty(_e,"W3mRegisterAccountNameSuccess",{enumerable:!0,get:function(){return u}});var e=_r(_d[0]),t=_r(_d[1]),n=_r(_d[2]),i=_r(_d[3]);_r(_d[4]),_r(_d[5]),_r(_d[6]),_r(_d[7]),_r(_d[8]),_r(_d[9]);var r,c=_r(_d[10]),o=(r=c)&&r.__esModule?r:{default:r},l=this&&this.__decorate||function(e,t,n,i){var r,c=arguments.length,o=c<3?t:null===i?i=Object.getOwnPropertyDescriptor(t,n):i;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)o=Reflect.decorate(e,t,n,i);else for(var l=e.length-1;l>=0;l--)(r=e[l])&&(o=(c<3?r(o):c>3?r(t,n,o):r(t,n))||o);return c>3&&o&&Object.defineProperty(t,n,o),o};let u=class extends e.LitElement{render(){return e.html`
      <wui-flex
        flexDirection="column"
        alignItems="center"
        gap="6"
        .padding=${['0','0','4','0']}
      >
        ${this.onboardingTemplate()} ${this.buttonsTemplate()}
        <wui-link
          @click=${()=>{n.CoreHelperUtil.openHref(t.NavigationUtil.URLS.FAQ,'_blank')}}
        >
          Learn more
          <wui-icon color="inherit" slot="iconRight" name="externalLink"></wui-icon>
        </wui-link>
      </wui-flex>
    `}onboardingTemplate(){return e.html` <wui-flex
      flexDirection="column"
      gap="6"
      alignItems="center"
      .padding=${['0','6','0','6']}
    >
      <wui-flex gap="3" alignItems="center" justifyContent="center">
        <wui-icon-box size="xl" color="success" icon="checkmark"></wui-icon-box>
      </wui-flex>
      <wui-flex flexDirection="column" alignItems="center" gap="3">
        <wui-text align="center" variant="md-medium" color="primary">
          Account name chosen successfully
        </wui-text>
        <wui-text align="center" variant="md-regular" color="primary">
          You can now fund your account and trade crypto
        </wui-text>
      </wui-flex>
    </wui-flex>`}buttonsTemplate(){return e.html`<wui-flex
      .padding=${['0','4','0','4']}
      gap="3"
      class="continue-button-container"
    >
      <wui-button fullWidth size="lg" borderRadius="xs" @click=${this.redirectToAccount.bind(this)}
        >Let's Go!
      </wui-button>
    </wui-flex>`}redirectToAccount(){n.RouterController.replace('Account')}};u.styles=o.default,u=l([(0,i.customElement)('w3m-register-account-name-success-view')],u)},3747,[2549,2169,2164,2546,2683,2650,2658,2705,2659,2651,3748]);
__d(function(g,r,i,a,m,e,d){"use strict";Object.defineProperty(e,'__esModule',{value:!0}),Object.defineProperty(e,"default",{enumerable:!0,get:function(){return t}});var t=r(d[0]).css`
  .continue-button-container {
    width: 100%;
  }
`},3748,[2549]);