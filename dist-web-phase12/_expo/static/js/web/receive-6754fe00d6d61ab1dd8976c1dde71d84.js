__d(function(g,r,i,a,m,e,d){"use strict";Object.defineProperty(e,'__esModule',{value:!0});var t=r(d[0]);Object.keys(t).forEach(function(n){'default'===n||Object.prototype.hasOwnProperty.call(e,n)||Object.defineProperty(e,n,{enumerable:!0,get:function(){return t[n]}})})},3670,[3807]);
__d(function(g,_r,_i,a,m,_e,_d){"use strict";Object.defineProperty(_e,'__esModule',{value:!0}),Object.defineProperty(_e,"W3mWalletReceiveView",{enumerable:!0,get:function(){return u}});var e=_r(_d[0]),t=_r(_d[1]),r=_r(_d[2]),i=_r(_d[3]),o=_r(_d[4]);_r(_d[5]),_r(_d[6]),_r(_d[7]),_r(_d[8]);var s,n=_r(_d[9]),l=_r(_d[10]),c=(s=l)&&s.__esModule?s:{default:s},d=this&&this.__decorate||function(e,t,r,i){var o,s=arguments.length,n=s<3?t:null===i?i=Object.getOwnPropertyDescriptor(t,r):i;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)n=Reflect.decorate(e,t,r,i);else for(var l=e.length-1;l>=0;l--)(o=e[l])&&(n=(s<3?o(n):s>3?o(t,r,n):o(t,r))||n);return s>3&&n&&Object.defineProperty(t,r,n),n};let u=class extends e.LitElement{constructor(){super(),this.unsubscribe=[],this.address=i.ChainController.getAccountData()?.address,this.profileName=i.ChainController.getAccountData()?.profileName,this.network=i.ChainController.state.activeCaipNetwork,this.unsubscribe.push(i.ChainController.subscribeChainProp('accountState',e=>{e?(this.address=e.address,this.profileName=e.profileName):i.SnackController.showError('Account not found')}),i.ChainController.subscribeKey('activeCaipNetwork',e=>{e?.id&&(this.network=e)}))}disconnectedCallback(){this.unsubscribe.forEach(e=>e())}render(){if(!this.address)throw new Error('w3m-wallet-receive-view: No account provided');const t=i.AssetUtil.getNetworkImage(this.network);return e.html` <wui-flex
      flexDirection="column"
      .padding=${['0','4','4','4']}
      alignItems="center"
    >
      <wui-chip-button
        data-testid="receive-address-copy-button"
        @click=${this.onCopyClick.bind(this)}
        text=${o.UiHelperUtil.getTruncateString({string:this.profileName||this.address||'',charsStart:this.profileName?18:4,charsEnd:this.profileName?0:4,truncate:this.profileName?'end':'middle'})}
        icon="copy"
        size="sm"
        imageSrc=${t||''}
        variant="gray"
      ></wui-chip-button>
      <wui-flex
        flexDirection="column"
        .padding=${['4','0','0','0']}
        alignItems="center"
        gap="4"
      >
        <wui-qr-code
          size=${232}
          theme=${i.ThemeController.state.themeMode}
          uri=${this.address}
          ?arenaClear=${!0}
          color=${(0,r.ifDefined)(i.ThemeController.state.themeVariables['--apkt-qr-color']??i.ThemeController.state.themeVariables['--w3m-qr-color'])}
          data-testid="wui-qr-code"
        ></wui-qr-code>
        <wui-text variant="lg-regular" color="primary" align="center">
          Copy your address or scan this QR code
        </wui-text>
        <wui-button @click=${this.onCopyClick.bind(this)} size="sm" variant="neutral-secondary">
          <wui-icon slot="iconLeft" size="sm" color="inherit" name="copy"></wui-icon>
          <wui-text variant="md-regular" color="inherit">Copy address</wui-text>
        </wui-button>
      </wui-flex>
      ${this.networkTemplate()}
    </wui-flex>`}networkTemplate(){const t=i.ChainController.getAllRequestedCaipNetworks(),r=i.ChainController.checkIfSmartAccountEnabled(),o=i.ChainController.state.activeCaipNetwork,s=t.filter(e=>e?.chainNamespace===o?.chainNamespace);if((0,i.getPreferredAccountType)(o?.chainNamespace)===n.W3mFrameRpcConstants.ACCOUNT_TYPES.SMART_ACCOUNT&&r)return o?e.html`<wui-compatible-network
        @click=${this.onReceiveClick.bind(this)}
        text="Only receive assets on this network"
        .networkImages=${[i.AssetUtil.getNetworkImage(o)??'']}
      ></wui-compatible-network>`:null;const l=s?.filter(e=>e?.assets?.imageId)?.slice(0,5),c=l.map(i.AssetUtil.getNetworkImage).filter(Boolean);return e.html`<wui-compatible-network
      @click=${this.onReceiveClick.bind(this)}
      text="Only receive assets on these networks"
      .networkImages=${c}
    ></wui-compatible-network>`}onReceiveClick(){i.RouterController.push('WalletCompatibleNetworks')}onCopyClick(){try{this.address&&(i.CoreHelperUtil.copyToClopboard(this.address),i.SnackController.showSuccess('Address copied'))}catch{i.SnackController.showError('Failed to copy')}}};u.styles=c.default,d([(0,t.state)()],u.prototype,"address",void 0),d([(0,t.state)()],u.prototype,"profileName",void 0),d([(0,t.state)()],u.prototype,"network",void 0),u=d([(0,o.customElement)('w3m-wallet-receive-view')],u)},3807,[2549,2575,2586,2164,2546,3808,2650,2834,2651,2222,3811]);
__d(function(g,r,i,a,m,e,d){"use strict";Object.defineProperty(e,'__esModule',{value:!0});var t=r(d[0]);Object.keys(t).forEach(function(n){'default'===n||Object.prototype.hasOwnProperty.call(e,n)||Object.defineProperty(e,n,{enumerable:!0,get:function(){return t[n]}})})},3808,[3809]);
__d(function(g,_r,_i,a,m,_e,_d){"use strict";Object.defineProperty(_e,'__esModule',{value:!0}),Object.defineProperty(_e,"WuiCompatibleNetwork",{enumerable:!0,get:function(){return u}});var e=_r(_d[0]),t=_r(_d[1]);_r(_d[2]),_r(_d[3]),_r(_d[4]),_r(_d[5]);var r,o=_r(_d[6]),i=_r(_d[7]),n=_r(_d[8]),l=(r=n)&&r.__esModule?r:{default:r},s=this&&this.__decorate||function(e,t,r,o){var i,n=arguments.length,l=n<3?t:null===o?o=Object.getOwnPropertyDescriptor(t,r):o;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)l=Reflect.decorate(e,t,r,o);else for(var s=e.length-1;s>=0;s--)(i=e[s])&&(l=(n<3?i(l):n>3?i(t,r,l):i(t,r))||l);return n>3&&l&&Object.defineProperty(t,r,l),l};let u=class extends e.LitElement{constructor(){super(...arguments),this.networkImages=[''],this.text=''}render(){return e.html`
      <button>
        <wui-text variant="md-regular" color="inherit">${this.text}</wui-text>
        <wui-flex>
          ${this.networksTemplate()}
          <wui-icon name="chevronRight" size="sm" color="inherit"></wui-icon>
        </wui-flex>
      </button>
    `}networksTemplate(){const t=this.networkImages.slice(0,5);return e.html` <wui-flex class="networks">
      ${t?.map(t=>e.html` <wui-flex class="network-icon"> <wui-image src=${t}></wui-image> </wui-flex>`)}
    </wui-flex>`}};u.styles=[o.resetStyles,o.elementStyles,l.default],s([(0,t.property)({type:Array})],u.prototype,"networkImages",void 0),s([(0,t.property)()],u.prototype,"text",void 0),u=s([(0,i.customElement)('wui-compatible-network')],u)},3809,[2549,2575,2590,2620,2624,2629,2548,2559,3810]);
__d(function(g,r,i,a,m,e,d){"use strict";Object.defineProperty(e,'__esModule',{value:!0}),Object.defineProperty(e,"default",{enumerable:!0,get:function(){return o}});var o=r(d[0]).css`
  button {
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: ${({spacing:o})=>o[4]};
    background-color: ${({tokens:o})=>o.theme.foregroundPrimary};
    border-radius: ${({borderRadius:o})=>o[3]};
    border: none;
    padding: ${({spacing:o})=>o[3]};
    transition: background-color ${({durations:o})=>o.lg}
      ${({easings:o})=>o['ease-out-power-2']};
    will-change: background-color;
  }

  /* -- Hover & Active states ----------------------------------------------------------- */
  button:hover:enabled,
  button:active:enabled {
    background-color: ${({tokens:o})=>o.theme.foregroundSecondary};
  }

  wui-text {
    flex: 1;
    color: ${({tokens:o})=>o.theme.textSecondary};
  }

  wui-flex {
    width: auto;
    display: flex;
    align-items: center;
    gap: ${({spacing:o})=>o['01']};
  }

  wui-icon {
    color: ${({tokens:o})=>o.theme.iconDefault};
  }

  .network-icon {
    position: relative;
    width: 20px;
    height: 20px;
    border-radius: ${({borderRadius:o})=>o[4]};
    overflow: hidden;
    margin-left: -8px;
  }

  .network-icon:first-child {
    margin-left: 0px;
  }

  .network-icon:after {
    position: absolute;
    inset: 0;
    content: '';
    display: block;
    height: 100%;
    width: 100%;
    border-radius: ${({borderRadius:o})=>o[4]};
    box-shadow: inset 0 0 0 1px ${({tokens:o})=>o.core.glass010};
  }
`},3810,[2555]);
__d(function(g,r,i,a,m,e,d){"use strict";Object.defineProperty(e,'__esModule',{value:!0}),Object.defineProperty(e,"default",{enumerable:!0,get:function(){return t}});var t=r(d[0]).css`
  wui-compatible-network {
    margin-top: ${({spacing:t})=>t[4]};
    width: 100%;
  }

  wui-qr-code {
    width: unset !important;
    height: unset !important;
  }

  wui-icon {
    align-items: normal;
  }
`},3811,[2546]);