__d(function(g,r,i,a,m,e,d){"use strict";Object.defineProperty(e,'__esModule',{value:!0});var t=r(d[0]);Object.keys(t).forEach(function(n){'default'===n||Object.prototype.hasOwnProperty.call(e,n)||Object.defineProperty(e,n,{enumerable:!0,get:function(){return t[n]}})});var n=r(d[1]);Object.keys(n).forEach(function(t){'default'===t||Object.prototype.hasOwnProperty.call(e,t)||Object.defineProperty(e,t,{enumerable:!0,get:function(){return n[t]}})});var c=r(d[2]);Object.keys(c).forEach(function(t){'default'===t||Object.prototype.hasOwnProperty.call(e,t)||Object.defineProperty(e,t,{enumerable:!0,get:function(){return c[t]}})});var o=r(d[3]);Object.keys(o).forEach(function(t){'default'===t||Object.prototype.hasOwnProperty.call(e,t)||Object.defineProperty(e,t,{enumerable:!0,get:function(){return o[t]}})})},3669,[3786,3792,3794,3804]);
__d(function(g,_r,_i,a,m,_e,_d){"use strict";Object.defineProperty(_e,'__esModule',{value:!0}),Object.defineProperty(_e,"W3mWalletSendView",{enumerable:!0,get:function(){return w}});var e=_r(_d[0]),t=_r(_d[1]);_r(_d[2]);var n=_r(_d[3]),i=_r(_d[4]),s=_r(_d[5]);_r(_d[6]),_r(_d[7]),_r(_d[8]),_r(_d[9]),_r(_d[10]),_r(_d[11]);var o,r=_r(_d[12]),l=(o=r)&&o.__esModule?o:{default:o},d=this&&this.__decorate||function(e,t,n,i){var s,o=arguments.length,r=o<3?t:null===i?i=Object.getOwnPropertyDescriptor(t,n):i;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)r=Reflect.decorate(e,t,n,i);else for(var l=e.length-1;l>=0;l--)(s=e[l])&&(r=(o<3?s(r):o>3?s(t,n,r):s(t,n))||r);return o>3&&r&&Object.defineProperty(t,n,r),r};const c='Insufficient Funds',h='Incorrect Value',u='Invalid Address',f='Add Address',p='Add Amount',k='Select Token',C='Preview Send';let w=class extends e.LitElement{constructor(){super(),this.unsubscribe=[],this.isTryingToChooseDifferentWallet=!1,this.token=n.SendController.state.token,this.sendTokenAmount=n.SendController.state.sendTokenAmount,this.receiverAddress=n.SendController.state.receiverAddress,this.receiverProfileName=n.SendController.state.receiverProfileName,this.loading=n.SendController.state.loading,this.params=n.RouterController.state.data?.send,this.caipAddress=n.ChainController.getAccountData()?.caipAddress,this.message=C,this.disconnecting=!1,this.token&&!this.params&&(this.fetchBalances(),this.fetchNetworkPrice());const e=n.ChainController.subscribeKey('activeCaipAddress',t=>{!t&&this.isTryingToChooseDifferentWallet&&(this.isTryingToChooseDifferentWallet=!1,n.ModalController.open({view:'Connect',data:{redirectView:'WalletSend'}}).catch(()=>null),e())});this.unsubscribe.push(n.ChainController.subscribeAccountStateProp('caipAddress',e=>{this.caipAddress=e}),n.SendController.subscribe(e=>{this.token=e.token,this.sendTokenAmount=e.sendTokenAmount,this.receiverAddress=e.receiverAddress,this.receiverProfileName=e.receiverProfileName,this.loading=e.loading}))}disconnectedCallback(){this.unsubscribe.forEach(e=>e())}async firstUpdated(){await this.handleSendParameters()}render(){this.getMessage();const t=Boolean(this.params);return e.html` <wui-flex flexDirection="column" .padding=${['0','4','4','4']}>
      <wui-flex class="inputContainer" gap="2" flexDirection="column">
        <w3m-input-token
          .token=${this.token}
          .sendTokenAmount=${this.sendTokenAmount}
          ?readOnly=${t}
          ?isInsufficientBalance=${this.message===c}
        ></w3m-input-token>
        <wui-icon-box size="md" variant="secondary" icon="arrowBottom"></wui-icon-box>
        <w3m-input-address
          ?readOnly=${t}
          .value=${this.receiverProfileName?this.receiverProfileName:this.receiverAddress}
        ></w3m-input-address>
      </wui-flex>
      ${this.buttonTemplate()}
    </wui-flex>`}async fetchBalances(){await n.SendController.fetchTokenBalance(),n.SendController.fetchNetworkBalance()}async fetchNetworkPrice(){await n.SwapController.getNetworkTokenPrice()}onButtonClick(){n.RouterController.push('WalletSendPreview',{send:this.params})}onFundWalletClick(){n.RouterController.push('FundWallet',{redirectView:'WalletSend'})}async onConnectDifferentWalletClick(){try{this.isTryingToChooseDifferentWallet=!0,this.disconnecting=!0,await n.ConnectionController.disconnect()}finally{this.disconnecting=!1}}getMessage(){if(this.message=C,this.receiverAddress&&!n.CoreHelperUtil.isAddress(this.receiverAddress,n.ChainController.state.activeChain)&&(this.message=u),this.receiverAddress||(this.message=f),this.sendTokenAmount&&this.token&&this.sendTokenAmount>Number(this.token.quantity.numeric)&&(this.message=c),this.sendTokenAmount||(this.message=p),this.sendTokenAmount&&this.token?.price){this.sendTokenAmount*this.token.price||(this.message=h)}this.token||(this.message=k)}buttonTemplate(){const t=!this.message.startsWith(C),n=this.message===c,i=Boolean(this.params);return n&&!i?e.html`
        <wui-flex .margin=${['4','0','0','0']} flexDirection="column" gap="4">
          <wui-button
            @click=${this.onFundWalletClick.bind(this)}
            size="lg"
            variant="accent-secondary"
            fullWidth
          >
            Fund Wallet
          </wui-button>

          <wui-separator data-testid="wui-separator" text="or"></wui-separator>

          <wui-button
            @click=${this.onConnectDifferentWalletClick.bind(this)}
            size="lg"
            variant="neutral-secondary"
            fullWidth
            ?loading=${this.disconnecting}
          >
            Connect a different wallet
          </wui-button>
        </wui-flex>
      `:e.html`<wui-flex .margin=${['4','0','0','0']}>
      <wui-button
        @click=${this.onButtonClick.bind(this)}
        ?disabled=${t}
        size="lg"
        variant="accent-primary"
        ?loading=${this.loading}
        fullWidth
      >
        ${this.message}
      </wui-button>
    </wui-flex>`}async handleSendParameters(){if(this.loading=!0,!this.params)return void(this.loading=!1);const e=Number(this.params.amount);if(isNaN(e))return n.SnackController.showError('Invalid amount'),void(this.loading=!1);const{namespace:t,chainId:s,assetAddress:o}=this.params;if(!n.ConstantsUtil.SEND_PARAMS_SUPPORTED_CHAINS.includes(t))return n.SnackController.showError(`Chain "${t}" is not supported for send parameters`),void(this.loading=!1);const r=n.ChainController.getCaipNetworkById(s,t);if(!r)return n.SnackController.showError(`Network with id "${s}" not found`),void(this.loading=!1);try{const{balance:t,name:s,symbol:l,decimals:d}=await i.BalanceUtil.fetchERC20Balance({caipAddress:this.caipAddress,assetAddress:o,caipNetwork:r});if(!(s&&l&&d&&t))return void n.SnackController.showError('Token not found');n.SendController.setToken({name:s,symbol:l,chainId:r.id.toString(),address:`${r.chainNamespace}:${r.id}:${o}`,value:0,price:0,quantity:{decimals:d.toString(),numeric:t.toString()},iconUrl:n.AssetUtil.getTokenImage(l)??''}),n.SendController.setTokenAmount(e),n.SendController.setReceiverAddress(this.params.to)}catch(e){console.error('Failed to load token information:',e),n.SnackController.showError('Failed to load token information')}finally{this.loading=!1}}};w.styles=l.default,d([(0,t.state)()],w.prototype,"token",void 0),d([(0,t.state)()],w.prototype,"sendTokenAmount",void 0),d([(0,t.state)()],w.prototype,"receiverAddress",void 0),d([(0,t.state)()],w.prototype,"receiverProfileName",void 0),d([(0,t.state)()],w.prototype,"loading",void 0),d([(0,t.state)()],w.prototype,"params",void 0),d([(0,t.state)()],w.prototype,"caipAddress",void 0),d([(0,t.state)()],w.prototype,"message",void 0),d([(0,t.state)()],w.prototype,"disconnecting",void 0),w=d([(0,s.customElement)('w3m-wallet-send-view')],w)},3786,[2549,2575,2169,2164,2531,2546,2683,2650,2705,2743,3787,3789,3791]);
__d(function(g,_r,_i,a,m,_e,_d){"use strict";Object.defineProperty(_e,'__esModule',{value:!0}),Object.defineProperty(_e,"W3mInputAddress",{enumerable:!0,get:function(){return u}});var e=_r(_d[0]),t=_r(_d[1]),i=_r(_d[2]),n=_r(_d[3]),s=_r(_d[4]);_r(_d[5]),_r(_d[6]),_r(_d[7]),_r(_d[8]);var o,r=_r(_d[9]),l=(o=r)&&o.__esModule?o:{default:o},c=this&&this.__decorate||function(e,t,i,n){var s,o=arguments.length,r=o<3?t:null===n?n=Object.getOwnPropertyDescriptor(t,i):n;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)r=Reflect.decorate(e,t,i,n);else for(var l=e.length-1;l>=0;l--)(s=e[l])&&(r=(o<3?s(r):o>3?s(t,i,r):s(t,i))||r);return o>3&&r&&Object.defineProperty(t,i,r),r};let u=class extends e.LitElement{constructor(){super(...arguments),this.inputElementRef=(0,i.createRef)(),this.instructionElementRef=(0,i.createRef)(),this.readOnly=!1,this.instructionHidden=Boolean(this.value),this.pasting=!1,this.onDebouncedSearch=n.CoreHelperUtil.debounce(async e=>{if(!e.length)return void this.setReceiverAddress('');const t=n.ChainController.state.activeChain;if(n.CoreHelperUtil.isAddress(e,t))this.setReceiverAddress(e);else try{const t=await n.ConnectionController.getEnsAddress(e);if(t){n.SendController.setReceiverProfileName(e),n.SendController.setReceiverAddress(t);const i=await n.ConnectionController.getEnsAvatar(e);n.SendController.setReceiverProfileImageUrl(i||void 0)}}catch(t){this.setReceiverAddress(e)}finally{n.SendController.setLoading(!1)}})}firstUpdated(){this.value&&(this.instructionHidden=!0),this.checkHidden()}render(){return this.readOnly?e.html` <wui-flex
        flexDirection="column"
        justifyContent="center"
        gap="01"
        .padding=${['8','4','5','4']}
      >
        <textarea
          spellcheck="false"
          ?disabled=${!0}
          autocomplete="off"
          .value=${this.value??''}
        >
           ${this.value??''}</textarea
        >
      </wui-flex>`:e.html` <wui-flex
      @click=${this.onBoxClick.bind(this)}
      flexDirection="column"
      justifyContent="center"
      gap="01"
      .padding=${['8','4','5','4']}
    >
      <wui-text
        ${(0,i.ref)(this.instructionElementRef)}
        class="instruction"
        color="secondary"
        variant="md-medium"
      >
        Type or
        <wui-button
          class="paste"
          size="md"
          variant="neutral-secondary"
          iconLeft="copy"
          @click=${this.onPasteClick.bind(this)}
        >
          <wui-icon size="sm" color="inherit" slot="iconLeft" name="copy"></wui-icon>
          Paste
        </wui-button>
        address
      </wui-text>
      <textarea
        spellcheck="false"
        ?disabled=${!this.instructionHidden}
        ${(0,i.ref)(this.inputElementRef)}
        @input=${this.onInputChange.bind(this)}
        @blur=${this.onBlur.bind(this)}
        .value=${this.value??''}
        autocomplete="off"
      >
${this.value??''}</textarea
      >
    </wui-flex>`}async focusInput(){this.instructionElementRef.value&&(this.instructionHidden=!0,await this.toggleInstructionFocus(!1),this.instructionElementRef.value.style.pointerEvents='none',this.inputElementRef.value?.focus(),this.inputElementRef.value&&(this.inputElementRef.value.selectionStart=this.inputElementRef.value.selectionEnd=this.inputElementRef.value.value.length))}async focusInstruction(){this.instructionElementRef.value&&(this.instructionHidden=!1,await this.toggleInstructionFocus(!0),this.instructionElementRef.value.style.pointerEvents='auto',this.inputElementRef.value?.blur())}async toggleInstructionFocus(e){this.instructionElementRef.value&&await this.instructionElementRef.value.animate([{opacity:e?0:1},{opacity:e?1:0}],{duration:100,easing:'ease',fill:'forwards'}).finished}onBoxClick(){this.value||this.instructionHidden||this.focusInput()}onBlur(){this.value||!this.instructionHidden||this.pasting||this.focusInstruction()}checkHidden(){this.instructionHidden&&this.focusInput()}async onPasteClick(){this.pasting=!0;const e=await navigator.clipboard.readText();n.SendController.setReceiverAddress(e),this.focusInput()}onInputChange(e){const t=e.target;this.pasting=!1,this.value=e.target?.value,t.value&&!this.instructionHidden&&this.focusInput(),n.SendController.setLoading(!0),this.onDebouncedSearch(t.value)}setReceiverAddress(e){n.SendController.setReceiverAddress(e),n.SendController.setReceiverProfileName(void 0),n.SendController.setReceiverProfileImageUrl(void 0),n.SendController.setLoading(!1)}};u.styles=l.default,c([(0,t.property)()],u.prototype,"value",void 0),c([(0,t.property)({type:Boolean})],u.prototype,"readOnly",void 0),c([(0,t.state)()],u.prototype,"instructionHidden",void 0),c([(0,t.state)()],u.prototype,"pasting",void 0),u=c([(0,s.customElement)('w3m-input-address')],u)},3787,[2549,2575,2753,2164,2546,2683,2650,2658,2651,3788]);
__d(function(g,r,i,a,m,e,d){"use strict";Object.defineProperty(e,'__esModule',{value:!0}),Object.defineProperty(e,"default",{enumerable:!0,get:function(){return o}});var o=r(d[0]).css`
  :host {
    width: 100%;
    height: 100px;
    border-radius: ${({borderRadius:o})=>o[5]};
    border: 1px solid ${({tokens:o})=>o.theme.foregroundPrimary};
    background-color: ${({tokens:o})=>o.theme.foregroundPrimary};
    transition: background-color ${({durations:o})=>o.lg}
      ${({easings:o})=>o['ease-out-power-1']};
    will-change: background-color;
    position: relative;
  }

  :host(:hover) {
    background-color: ${({tokens:o})=>o.theme.foregroundSecondary};
  }

  wui-flex {
    width: 100%;
    height: fit-content;
  }

  wui-button {
    display: ruby;
    color: ${({tokens:o})=>o.theme.textPrimary};
    margin: 0 ${({spacing:o})=>o[2]};
  }

  .instruction {
    position: absolute;
    top: 50%;
    transform: translateY(-50%);
    z-index: 2;
  }

  .paste {
    display: inline-flex;
  }

  textarea {
    background: transparent;
    width: 100%;
    font-family: ${({fontFamily:o})=>o.regular};
    font-style: normal;
    font-size: ${({textSize:o})=>o.large};
    font-weight: ${({fontWeight:o})=>o.regular};
    line-height: ${({typography:o})=>o['lg-regular'].lineHeight};
    letter-spacing: ${({typography:o})=>o['lg-regular'].letterSpacing};
    color: ${({tokens:o})=>o.theme.textPrimary};
    caret-color: ${({tokens:o})=>o.core.backgroundAccentPrimary};
    box-sizing: border-box;
    -webkit-appearance: none;
    -moz-appearance: textfield;
    padding: 0px;
    border: none;
    outline: none;
    appearance: none;
    resize: none;
    overflow: hidden;
  }
`},3788,[2546]);
__d(function(g,_r,_i,a,m,_e,_d){"use strict";Object.defineProperty(_e,'__esModule',{value:!0}),Object.defineProperty(_e,"W3mInputToken",{enumerable:!0,get:function(){return c}});var t=_r(_d[0]),e=_r(_d[1]),n=_r(_d[2]),i=_r(_d[3]),o=_r(_d[4]);_r(_d[5]),_r(_d[6]),_r(_d[7]),_r(_d[8]),_r(_d[9]),_r(_d[10]);var l,r=_r(_d[11]),u=(l=r)&&l.__esModule?l:{default:l},s=this&&this.__decorate||function(t,e,n,i){var o,l=arguments.length,r=l<3?e:null===i?i=Object.getOwnPropertyDescriptor(e,n):i;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)r=Reflect.decorate(t,e,n,i);else for(var u=t.length-1;u>=0;u--)(o=t[u])&&(r=(l<3?o(r):l>3?o(e,n,r):o(e,n))||r);return l>3&&r&&Object.defineProperty(e,n,r),r};let c=class extends t.LitElement{constructor(){super(...arguments),this.readOnly=!1,this.isInsufficientBalance=!1}render(){const e=this.readOnly||!this.token;return t.html` <wui-flex
      flexDirection="column"
      gap="01"
      .padding=${['5','3','4','3']}
    >
      <wui-flex alignItems="center">
        <wui-input-amount
          @inputChange=${this.onInputChange.bind(this)}
          ?disabled=${e}
          .value=${this.sendTokenAmount?String(this.sendTokenAmount):''}
          ?error=${Boolean(this.isInsufficientBalance)}
        ></wui-input-amount>
        ${this.buttonTemplate()}
      </wui-flex>
      ${this.bottomTemplate()}
    </wui-flex>`}buttonTemplate(){return this.token?t.html`<wui-token-button
        text=${this.token.symbol}
        imageSrc=${this.token.iconUrl}
        @click=${this.handleSelectButtonClick.bind(this)}
      >
      </wui-token-button>`:t.html`<wui-button
      size="md"
      variant="neutral-secondary"
      @click=${this.handleSelectButtonClick.bind(this)}
      >Select token</wui-button
    >`}handleSelectButtonClick(){this.readOnly||i.RouterController.push('WalletSendSelectToken')}sendValueTemplate(){if(!this.readOnly&&this.token&&this.sendTokenAmount){const e=this.token.price*this.sendTokenAmount;return t.html`<wui-text class="totalValue" variant="sm-regular" color="secondary"
        >${e?`$${n.NumberUtil.formatNumberToLocalString(e,2)}`:'Incorrect value'}</wui-text
      >`}return null}maxAmountTemplate(){return this.token?t.html` <wui-text variant="sm-regular" color="secondary">
        ${o.UiHelperUtil.roundNumber(Number(this.token.quantity.numeric),6,5)}
      </wui-text>`:null}actionTemplate(){return this.token?t.html`<wui-link @click=${this.onMaxClick.bind(this)}>Max</wui-link>`:null}bottomTemplate(){return this.readOnly?null:t.html`<wui-flex alignItems="center" justifyContent="space-between">
      ${this.sendValueTemplate()}
      <wui-flex alignItems="center" gap="01" justifyContent="flex-end">
        ${this.maxAmountTemplate()} ${this.actionTemplate()}
      </wui-flex>
    </wui-flex>`}onInputChange(t){i.SendController.setTokenAmount(t.detail)}onMaxClick(){if(this.token){const t=n.NumberUtil.bigNumber(this.token.quantity.numeric);i.SendController.setTokenAmount(Number(t.toFixed(20)))}}};c.styles=u.default,s([(0,e.property)({type:Object})],c.prototype,"token",void 0),s([(0,e.property)({type:Boolean})],c.prototype,"readOnly",void 0),s([(0,e.property)({type:Number})],c.prototype,"sendTokenAmount",void 0),s([(0,e.property)({type:Boolean})],c.prototype,"isInsufficientBalance",void 0),c=s([(0,o.customElement)('w3m-input-token')],c)},3789,[2549,2575,2169,2164,2546,2683,2650,3806,2659,2651,3785,3790]);
__d(function(g,r,i,a,m,e,d){"use strict";Object.defineProperty(e,'__esModule',{value:!0}),Object.defineProperty(e,"default",{enumerable:!0,get:function(){return t}});var t=r(d[0]).css`
  :host {
    width: 100%;
    height: 100px;
    border-radius: ${({borderRadius:t})=>t[5]};
    border: 1px solid ${({tokens:t})=>t.theme.foregroundPrimary};
    background-color: ${({tokens:t})=>t.theme.foregroundPrimary};
    transition: background-color ${({durations:t})=>t.lg}
      ${({easings:t})=>t['ease-out-power-1']};
    will-change: background-color;
    transition: all ${({easings:t})=>t['ease-out-power-1']}
      ${({durations:t})=>t.lg};
  }

  :host(:hover) {
    background-color: ${({tokens:t})=>t.theme.foregroundSecondary};
  }

  wui-flex {
    width: 100%;
    height: fit-content;
  }

  wui-button {
    width: 100%;
    display: flex;
    justify-content: flex-end;
  }

  wui-input-amount {
    mask-image: linear-gradient(
      270deg,
      transparent 0px,
      transparent 8px,
      black 24px,
      black 25px,
      black 32px,
      black 100%
    );
  }

  .totalValue {
    width: 100%;
  }
`},3790,[2546]);
__d(function(g,r,i,a,m,e,d){"use strict";Object.defineProperty(e,'__esModule',{value:!0}),Object.defineProperty(e,"default",{enumerable:!0,get:function(){return t}});var t=r(d[0]).css`
  :host {
    display: block;
  }

  wui-flex {
    position: relative;
  }

  wui-icon-box {
    width: 32px;
    height: 32px;
    border-radius: ${({borderRadius:t})=>t[10]} !important;
    border: 4px solid ${({tokens:t})=>t.theme.backgroundPrimary};
    background: ${({tokens:t})=>t.theme.foregroundPrimary};
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    z-index: 3;
  }

  wui-button {
    --local-border-radius: ${({borderRadius:t})=>t[4]} !important;
  }

  .inputContainer {
    height: fit-content;
  }
`},3791,[2546]);
__d(function(g,_r,_i,a,m,_e,_d){"use strict";Object.defineProperty(_e,'__esModule',{value:!0}),Object.defineProperty(_e,"W3mSendSelectTokenView",{enumerable:!0,get:function(){return c}});var e=_r(_d[0]),t=_r(_d[1]),n=_r(_d[2]),i=_r(_d[3]);_r(_d[4]),_r(_d[5]),_r(_d[6]),_r(_d[7]),_r(_d[8]),_r(_d[9]),_r(_d[10]),_r(_d[11]);var o,l=_r(_d[12]),r=(o=l)&&o.__esModule?o:{default:o},s=this&&this.__decorate||function(e,t,n,i){var o,l=arguments.length,r=l<3?t:null===i?i=Object.getOwnPropertyDescriptor(t,n):i;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)r=Reflect.decorate(e,t,n,i);else for(var s=e.length-1;s>=0;s--)(o=e[s])&&(r=(l<3?o(r):l>3?o(t,n,r):o(t,n))||r);return l>3&&r&&Object.defineProperty(t,n,r),r};let c=class extends e.LitElement{constructor(){super(),this.unsubscribe=[],this.tokenBalances=n.SendController.state.tokenBalances,this.search='',this.onDebouncedSearch=n.CoreHelperUtil.debounce(e=>{this.search=e}),this.fetchBalancesAndNetworkPrice(),this.unsubscribe.push(n.SendController.subscribe(e=>{this.tokenBalances=e.tokenBalances}))}disconnectedCallback(){this.unsubscribe.forEach(e=>e())}render(){return e.html`
      <wui-flex flexDirection="column">
        ${this.templateSearchInput()} <wui-separator></wui-separator> ${this.templateTokens()}
      </wui-flex>
    `}async fetchBalancesAndNetworkPrice(){this.tokenBalances&&0!==this.tokenBalances?.length||(await this.fetchBalances(),await this.fetchNetworkPrice())}async fetchBalances(){await n.SendController.fetchTokenBalance(),n.SendController.fetchNetworkBalance()}async fetchNetworkPrice(){await n.SwapController.getNetworkTokenPrice()}templateSearchInput(){return e.html`
      <wui-flex gap="2" padding="3">
        <wui-input-text
          @inputChange=${this.onInputChange.bind(this)}
          class="network-search-input"
          size="sm"
          placeholder="Search token"
          icon="search"
        ></wui-input-text>
      </wui-flex>
    `}templateTokens(){return this.tokens=this.tokenBalances?.filter(e=>e.chainId===n.ChainController.state.activeCaipNetwork?.caipNetworkId),this.search?this.filteredTokens=this.tokenBalances?.filter(e=>e.name.toLowerCase().includes(this.search.toLowerCase())):this.filteredTokens=this.tokens,e.html`
      <wui-flex
        class="contentContainer"
        flexDirection="column"
        .padding=${['0','3','0','3']}
      >
        <wui-flex justifyContent="flex-start" .padding=${['4','3','3','3']}>
          <wui-text variant="md-medium" color="secondary">Your tokens</wui-text>
        </wui-flex>
        <wui-flex flexDirection="column" gap="2">
          ${this.filteredTokens&&this.filteredTokens.length>0?this.filteredTokens.map(t=>e.html`<wui-list-token
                    @click=${this.handleTokenClick.bind(this,t)}
                    ?clickable=${!0}
                    tokenName=${t.name}
                    tokenImageUrl=${t.iconUrl}
                    tokenAmount=${t.quantity.numeric}
                    tokenValue=${t.value}
                    tokenCurrency=${t.symbol}
                  ></wui-list-token>`):e.html`<wui-flex
                .padding=${['20','0','0','0']}
                alignItems="center"
                flexDirection="column"
                gap="4"
              >
                <wui-icon-box icon="coinPlaceholder" color="default" size="lg"></wui-icon-box>
                <wui-flex
                  class="textContent"
                  gap="2"
                  flexDirection="column"
                  justifyContent="center"
                  flexDirection="column"
                >
                  <wui-text variant="lg-medium" align="center" color="primary">
                    No tokens found
                  </wui-text>
                  <wui-text variant="lg-regular" align="center" color="secondary">
                    Your tokens will appear here
                  </wui-text>
                </wui-flex>
                <wui-link @click=${this.onBuyClick.bind(this)}>Buy</wui-link>
              </wui-flex>`}
        </wui-flex>
      </wui-flex>
    `}onBuyClick(){n.RouterController.push('OnRampProviders')}onInputChange(e){this.onDebouncedSearch(e.detail)}handleTokenClick(e){n.SendController.setToken(e),n.SendController.setTokenAmount(void 0),n.RouterController.goBack()}};c.styles=r.default,s([(0,t.state)()],c.prototype,"tokenBalances",void 0),s([(0,t.state)()],c.prototype,"tokens",void 0),s([(0,t.state)()],c.prototype,"filteredTokens",void 0),s([(0,t.state)()],c.prototype,"search",void 0),c=s([(0,i.customElement)('w3m-wallet-send-select-token-view')],c)},3792,[2549,2575,2164,2546,2650,2658,2705,2914,2659,2725,2743,2651,3793]);
__d(function(g,r,i,a,m,e,d){"use strict";Object.defineProperty(e,'__esModule',{value:!0}),Object.defineProperty(e,"default",{enumerable:!0,get:function(){return t}});var t=r(d[0]).css`
  .contentContainer {
    height: 440px;
    overflow: scroll;
    scrollbar-width: none;
  }

  .contentContainer::-webkit-scrollbar {
    display: none;
  }

  wui-icon-box {
    width: 40px;
    height: 40px;
    border-radius: ${({borderRadius:t})=>t[3]};
  }
`},3793,[2546]);
__d(function(g,_r,_i,a,m,_e,_d){"use strict";Object.defineProperty(_e,'__esModule',{value:!0}),Object.defineProperty(_e,"W3mWalletSendPreviewView",{enumerable:!0,get:function(){return d}});var e=_r(_d[0]),t=_r(_d[1]),r=_r(_d[2]),i=_r(_d[3]),n=_r(_d[4]);_r(_d[5]),_r(_d[6]),_r(_d[7]),_r(_d[8]),_r(_d[9]),_r(_d[10]);var o,s=_r(_d[11]),l=(o=s)&&o.__esModule?o:{default:o},c=this&&this.__decorate||function(e,t,r,i){var n,o=arguments.length,s=o<3?t:null===i?i=Object.getOwnPropertyDescriptor(t,r):i;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)s=Reflect.decorate(e,t,r,i);else for(var l=e.length-1;l>=0;l--)(n=e[l])&&(s=(o<3?n(s):o>3?n(t,r,s):n(t,r))||s);return o>3&&s&&Object.defineProperty(t,r,s),s};let d=class extends e.LitElement{constructor(){super(),this.unsubscribe=[],this.token=i.SendController.state.token,this.sendTokenAmount=i.SendController.state.sendTokenAmount,this.receiverAddress=i.SendController.state.receiverAddress,this.receiverProfileName=i.SendController.state.receiverProfileName,this.receiverProfileImageUrl=i.SendController.state.receiverProfileImageUrl,this.caipNetwork=i.ChainController.state.activeCaipNetwork,this.loading=i.SendController.state.loading,this.params=i.RouterController.state.data?.send,this.unsubscribe.push(i.SendController.subscribe(e=>{this.token=e.token,this.sendTokenAmount=e.sendTokenAmount,this.receiverAddress=e.receiverAddress,this.receiverProfileName=e.receiverProfileName,this.receiverProfileImageUrl=e.receiverProfileImageUrl,this.loading=e.loading}),i.ChainController.subscribeKey('activeCaipNetwork',e=>this.caipNetwork=e))}disconnectedCallback(){this.unsubscribe.forEach(e=>e())}render(){return e.html` <wui-flex flexDirection="column" .padding=${['0','4','4','4']}>
      <wui-flex gap="2" flexDirection="column" .padding=${['0','2','0','2']}>
        <wui-flex alignItems="center" justifyContent="space-between">
          <wui-flex flexDirection="column" gap="01">
            <wui-text variant="sm-regular" color="secondary">Send</wui-text>
            ${this.sendValueTemplate()}
          </wui-flex>
          <wui-preview-item
            text="${this.sendTokenAmount?n.UiHelperUtil.roundNumber(this.sendTokenAmount,6,5):'unknown'} ${this.token?.symbol}"
            .imageSrc=${this.token?.iconUrl}
          ></wui-preview-item>
        </wui-flex>
        <wui-flex>
          <wui-icon color="default" size="md" name="arrowBottom"></wui-icon>
        </wui-flex>
        <wui-flex alignItems="center" justifyContent="space-between">
          <wui-text variant="sm-regular" color="secondary">To</wui-text>
          <wui-preview-item
            text="${this.receiverProfileName?n.UiHelperUtil.getTruncateString({string:this.receiverProfileName,charsStart:20,charsEnd:0,truncate:'end'}):n.UiHelperUtil.getTruncateString({string:this.receiverAddress?this.receiverAddress:'',charsStart:4,charsEnd:4,truncate:'middle'})}"
            address=${this.receiverAddress??''}
            .imageSrc=${this.receiverProfileImageUrl??void 0}
            .isAddress=${!0}
          ></wui-preview-item>
        </wui-flex>
      </wui-flex>
      <wui-flex flexDirection="column" .padding=${['6','0','0','0']}>
        <w3m-wallet-send-details
          .caipNetwork=${this.caipNetwork}
          .receiverAddress=${this.receiverAddress}
        ></w3m-wallet-send-details>
        <wui-flex justifyContent="center" gap="1" .padding=${['3','0','0','0']}>
          <wui-icon size="sm" color="default" name="warningCircle"></wui-icon>
          <wui-text variant="sm-regular" color="secondary">Review transaction carefully</wui-text>
        </wui-flex>
        <wui-flex justifyContent="center" gap="3" .padding=${['4','0','0','0']}>
          <wui-button
            class="cancelButton"
            @click=${this.onCancelClick.bind(this)}
            size="lg"
            variant="neutral-secondary"
          >
            Cancel
          </wui-button>
          <wui-button
            class="sendButton"
            @click=${this.onSendClick.bind(this)}
            size="lg"
            variant="accent-primary"
            .loading=${this.loading}
          >
            Send
          </wui-button>
        </wui-flex>
      </wui-flex></wui-flex
    >`}sendValueTemplate(){if(!this.params&&this.token&&this.sendTokenAmount){const t=this.token.price*this.sendTokenAmount;return e.html`<wui-text variant="md-regular" color="primary"
        >$${t.toFixed(2)}</wui-text
      >`}return null}async onSendClick(){if(this.sendTokenAmount&&this.receiverAddress)try{await i.SendController.sendToken(),this.params?i.RouterController.reset('WalletSendConfirmed'):(i.SnackController.showSuccess('Transaction started'),i.RouterController.replace('Account'))}catch(e){let t='Failed to send transaction';const n=e instanceof i.AppKitError&&e.originalName===r.ErrorUtil.PROVIDER_RPC_ERROR_NAME.USER_REJECTED_REQUEST,o=e instanceof i.AppKitError&&e.originalName===r.ErrorUtil.PROVIDER_RPC_ERROR_NAME.SEND_TRANSACTION_ERROR;(n||o)&&(t=e.message),i.EventsController.sendEvent({type:'track',event:n?'SEND_REJECTED':'SEND_ERROR',properties:i.SendController.getSdkEventProperties(e)}),i.SnackController.showError(t)}else i.SnackController.showError('Please enter a valid amount and receiver address')}onCancelClick(){i.RouterController.goBack()}};d.styles=l.default,c([(0,t.state)()],d.prototype,"token",void 0),c([(0,t.state)()],d.prototype,"sendTokenAmount",void 0),c([(0,t.state)()],d.prototype,"receiverAddress",void 0),c([(0,t.state)()],d.prototype,"receiverProfileName",void 0),c([(0,t.state)()],d.prototype,"receiverProfileImageUrl",void 0),c([(0,t.state)()],d.prototype,"caipNetwork",void 0),c([(0,t.state)()],d.prototype,"loading",void 0),c([(0,t.state)()],d.prototype,"params",void 0),d=c([(0,n.customElement)('w3m-wallet-send-preview-view')],d)},3794,[2549,2575,2169,2164,2546,2683,2650,2658,3795,2651,3798,3803]);
__d(function(g,r,i,a,m,e,d){"use strict";Object.defineProperty(e,'__esModule',{value:!0});var t=r(d[0]);Object.keys(t).forEach(function(n){'default'===n||Object.prototype.hasOwnProperty.call(e,n)||Object.defineProperty(e,n,{enumerable:!0,get:function(){return t[n]}})})},3795,[3796]);
__d(function(g,_r,_i,a,m,_e,_d){"use strict";Object.defineProperty(_e,'__esModule',{value:!0}),Object.defineProperty(_e,"WuiPreviewItem",{enumerable:!0,get:function(){return c}});var e=_r(_d[0]),t=_r(_d[1]);_r(_d[2]),_r(_d[3]),_r(_d[4]),_r(_d[5]);var r=_r(_d[6]),i=_r(_d[7]);_r(_d[8]);var o,s=_r(_d[9]),l=(o=s)&&o.__esModule?o:{default:o},n=this&&this.__decorate||function(e,t,r,i){var o,s=arguments.length,l=s<3?t:null===i?i=Object.getOwnPropertyDescriptor(t,r):i;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)l=Reflect.decorate(e,t,r,i);else for(var n=e.length-1;n>=0;n--)(o=e[n])&&(l=(s<3?o(l):s>3?o(t,r,l):o(t,r))||l);return s>3&&l&&Object.defineProperty(t,r,l),l};let c=class extends e.LitElement{constructor(){super(...arguments),this.text=''}render(){return e.html`<wui-text variant="lg-regular" color="primary">${this.text}</wui-text>
      ${this.imageTemplate()}`}imageTemplate(){return this.address?e.html`<wui-avatar address=${this.address} .imageSrc=${this.imageSrc}></wui-avatar>`:this.imageSrc?e.html`<wui-image src=${this.imageSrc}></wui-image>`:e.html`<wui-icon size="lg" color="inverse" name="networkPlaceholder"></wui-icon>`}};c.styles=[r.resetStyles,r.elementStyles,l.default],n([(0,t.property)({type:String})],c.prototype,"text",void 0),n([(0,t.property)({type:String})],c.prototype,"address",void 0),n([(0,t.property)({type:String})],c.prototype,"imageSrc",void 0),c=n([(0,i.customElement)('wui-preview-item')],c)},3796,[2549,2575,2590,2620,2624,2629,2548,2559,2631,3797]);
__d(function(g,r,i,a,m,e,d){"use strict";Object.defineProperty(e,'__esModule',{value:!0}),Object.defineProperty(e,"default",{enumerable:!0,get:function(){return t}});var t=r(d[0]).css`
  :host {
    height: 32px;
    display: flex;
    align-items: center;
    gap: ${({spacing:t})=>t[1]};
    border-radius: ${({borderRadius:t})=>t[32]};
    background-color: ${({tokens:t})=>t.theme.foregroundPrimary};
    padding: ${({spacing:t})=>t[1]};
    padding-left: ${({spacing:t})=>t[2]};
  }

  wui-avatar,
  wui-image {
    width: 24px;
    height: 24px;
    border-radius: ${({borderRadius:t})=>t[16]};
  }

  wui-icon {
    border-radius: ${({borderRadius:t})=>t[16]};
  }
`},3797,[2555]);
__d(function(g,_r,_i,a,m,_e,_d){"use strict";Object.defineProperty(_e,'__esModule',{value:!0}),Object.defineProperty(_e,"W3mWalletSendDetails",{enumerable:!0,get:function(){return u}});var e=_r(_d[0]),t=_r(_d[1]),r=_r(_d[2]);_r(_d[3]);var i=_r(_d[4]),o=_r(_d[5]);_r(_d[6]),_r(_d[7]),_r(_d[8]);var l,n=_r(_d[9]),s=(l=n)&&l.__esModule?l:{default:l},c=this&&this.__decorate||function(e,t,r,i){var o,l=arguments.length,n=l<3?t:null===i?i=Object.getOwnPropertyDescriptor(t,r):i;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)n=Reflect.decorate(e,t,r,i);else for(var s=e.length-1;s>=0;s--)(o=e[s])&&(n=(l<3?o(n):l>3?o(t,r,n):o(t,r))||n);return l>3&&n&&Object.defineProperty(t,r,n),n};let u=class extends e.LitElement{constructor(){super(...arguments),this.params=i.RouterController.state.data?.send}render(){return e.html` <wui-text variant="sm-regular" color="secondary">Details</wui-text>
      <wui-flex flexDirection="column" gap="1">
        <wui-list-content
          textTitle="Address"
          textValue=${o.UiHelperUtil.getTruncateString({string:this.receiverAddress??'',charsStart:4,charsEnd:4,truncate:'middle'})}
        >
        </wui-list-content>
        ${this.networkTemplate()}
      </wui-flex>`}networkTemplate(){return this.caipNetwork?.name?e.html` <wui-list-content
        @click=${()=>this.onNetworkClick(this.caipNetwork)}
        class="network"
        textTitle="Network"
        imageSrc=${(0,r.ifDefined)(i.AssetUtil.getNetworkImage(this.caipNetwork))}
      ></wui-list-content>`:null}onNetworkClick(e){e&&!this.params&&i.RouterController.push('Networks',{network:e})}};u.styles=s.default,c([(0,t.property)()],u.prototype,"receiverAddress",void 0),c([(0,t.property)({type:Object})],u.prototype,"caipNetwork",void 0),c([(0,t.state)()],u.prototype,"params",void 0),u=c([(0,o.customElement)('w3m-wallet-send-details')],u)},3798,[2549,2575,2586,2169,2164,2546,2650,3799,2651,3802]);
__d(function(g,r,i,a,m,e,d){"use strict";Object.defineProperty(e,'__esModule',{value:!0});var t=r(d[0]);Object.keys(t).forEach(function(n){'default'===n||Object.prototype.hasOwnProperty.call(e,n)||Object.defineProperty(e,n,{enumerable:!0,get:function(){return t[n]}})})},3799,[3800]);
__d(function(g,_r,_i,a,m,_e,_d){"use strict";Object.defineProperty(_e,'__esModule',{value:!0}),Object.defineProperty(_e,"WuiListContent",{enumerable:!0,get:function(){return s}});var e=_r(_d[0]),t=_r(_d[1]);_r(_d[2]),_r(_d[3]),_r(_d[4]),_r(_d[5]);var r,i=_r(_d[6]),o=_r(_d[7]),l=_r(_d[8]),n=(r=l)&&r.__esModule?r:{default:r},u=this&&this.__decorate||function(e,t,r,i){var o,l=arguments.length,n=l<3?t:null===i?i=Object.getOwnPropertyDescriptor(t,r):i;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)n=Reflect.decorate(e,t,r,i);else for(var u=e.length-1;u>=0;u--)(o=e[u])&&(n=(l<3?o(n):l>3?o(t,r,n):o(t,r))||n);return l>3&&n&&Object.defineProperty(t,r,n),n};let s=class extends e.LitElement{constructor(){super(...arguments),this.imageSrc=void 0,this.textTitle='',this.textValue=void 0}render(){return e.html`
      <wui-flex justifyContent="space-between" alignItems="center">
        <wui-text variant="lg-regular" color="primary"> ${this.textTitle} </wui-text>
        ${this.templateContent()}
      </wui-flex>
    `}templateContent(){return this.imageSrc?e.html`<wui-image src=${this.imageSrc} alt=${this.textTitle}></wui-image>`:this.textValue?e.html` <wui-text variant="md-regular" color="secondary"> ${this.textValue} </wui-text>`:e.html`<wui-icon size="inherit" color="default" name="networkPlaceholder"></wui-icon>`}};s.styles=[i.resetStyles,i.elementStyles,n.default],u([(0,t.property)()],s.prototype,"imageSrc",void 0),u([(0,t.property)()],s.prototype,"textTitle",void 0),u([(0,t.property)()],s.prototype,"textValue",void 0),s=u([(0,o.customElement)('wui-list-content')],s)},3800,[2549,2575,2590,2620,2624,2629,2548,2559,3801]);
__d(function(g,r,i,a,m,e,d){"use strict";Object.defineProperty(e,'__esModule',{value:!0}),Object.defineProperty(e,"default",{enumerable:!0,get:function(){return t}});var t=r(d[0]).css`
  :host {
    display: flex;
    padding: ${({spacing:t})=>t[4]} ${({spacing:t})=>t[3]};
    width: 100%;
    background-color: ${({tokens:t})=>t.theme.foregroundPrimary};
    border-radius: ${({borderRadius:t})=>t[4]};
  }

  wui-image {
    width: 20px;
    height: 20px;
    border-radius: ${({borderRadius:t})=>t[16]};
  }

  wui-icon {
    width: 20px;
    height: 20px;
  }
`},3801,[2555]);
__d(function(g,r,i,a,m,e,d){"use strict";Object.defineProperty(e,'__esModule',{value:!0}),Object.defineProperty(e,"default",{enumerable:!0,get:function(){return o}});var o=r(d[0]).css`
  :host {
    display: flex;
    width: auto;
    flex-direction: column;
    gap: ${({spacing:o})=>o[1]};
    border-radius: ${({borderRadius:o})=>o[5]};
    background: ${({tokens:o})=>o.theme.foregroundPrimary};
    padding: ${({spacing:o})=>o[3]} ${({spacing:o})=>o[2]}
      ${({spacing:o})=>o[2]} ${({spacing:o})=>o[2]};
  }

  wui-list-content {
    width: -webkit-fill-available !important;
  }

  wui-text {
    padding: 0 ${({spacing:o})=>o[2]};
  }

  wui-flex {
    margin-top: ${({spacing:o})=>o[2]};
  }

  .network {
    cursor: pointer;
    transition: background-color ${({durations:o})=>o.lg}
      ${({easings:o})=>o['ease-out-power-1']};
    will-change: background-color;
  }

  .network:focus-visible {
    border: 1px solid ${({tokens:o})=>o.core.textAccentPrimary};
    background-color: ${({tokens:o})=>o.core.glass010};
    -webkit-box-shadow: 0px 0px 0px 4px ${({tokens:o})=>o.core.foregroundAccent010};
    -moz-box-shadow: 0px 0px 0px 4px ${({tokens:o})=>o.core.foregroundAccent010};
    box-shadow: 0px 0px 0px 4px ${({tokens:o})=>o.core.foregroundAccent010};
  }

  .network:hover {
    background-color: ${({tokens:o})=>o.core.glass010};
  }

  .network:active {
    background-color: ${({tokens:o})=>o.core.glass010};
  }
`},3802,[2546]);
__d(function(g,r,i,a,m,e,d){"use strict";Object.defineProperty(e,'__esModule',{value:!0}),Object.defineProperty(e,"default",{enumerable:!0,get:function(){return t}});var t=r(d[0]).css`
  wui-avatar,
  wui-image {
    display: ruby;
    width: 32px;
    height: 32px;
    border-radius: ${({borderRadius:t})=>t[20]};
  }

  .sendButton {
    width: 70%;
    --local-width: 100% !important;
    --local-border-radius: ${({borderRadius:t})=>t[4]} !important;
  }

  .cancelButton {
    width: 30%;
    --local-width: 100% !important;
    --local-border-radius: ${({borderRadius:t})=>t[4]} !important;
  }
`},3803,[2546]);
__d(function(g,_r,_i,a,m,_e,_d){"use strict";Object.defineProperty(_e,'__esModule',{value:!0}),Object.defineProperty(_e,"W3mSendConfirmedView",{enumerable:!0,get:function(){return o}});var e=_r(_d[0]),t=_r(_d[1]),n=_r(_d[2]);_r(_d[3]),_r(_d[4]),_r(_d[5]),_r(_d[6]);var i,r=_r(_d[7]),l=(i=r)&&i.__esModule?i:{default:i},c=this&&this.__decorate||function(e,t,n,i){var r,l=arguments.length,c=l<3?t:null===i?i=Object.getOwnPropertyDescriptor(t,n):i;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)c=Reflect.decorate(e,t,n,i);else for(var o=e.length-1;o>=0;o--)(r=e[o])&&(c=(l<3?r(c):l>3?r(t,n,c):r(t,n))||c);return l>3&&c&&Object.defineProperty(t,n,c),c};let o=class extends e.LitElement{constructor(){super(),this.unsubscribe=[],this.unsubscribe.push()}render(){return e.html`
      <wui-flex
        flexDirection="column"
        alignItems="center"
        gap="4"
        .padding="${['1','3','4','3']}"
      >
        <wui-flex justifyContent="center" alignItems="center" class="icon-box">
          <wui-icon size="xxl" color="success" name="checkmark"></wui-icon>
        </wui-flex>

        <wui-text variant="h6-medium" color="primary">You successfully sent asset</wui-text>

        <wui-button
          fullWidth
          @click=${this.onCloseClick.bind(this)}
          size="lg"
          variant="neutral-secondary"
        >
          Close
        </wui-button>
      </wui-flex>
    `}onCloseClick(){t.ModalController.close()}};o.styles=l.default,o=c([(0,n.customElement)('w3m-send-confirmed-view')],o)},3804,[2549,2164,2546,2683,2650,2658,2651,3805]);
__d(function(g,r,i,a,m,e,d){"use strict";Object.defineProperty(e,'__esModule',{value:!0}),Object.defineProperty(e,"default",{enumerable:!0,get:function(){return o}});var o=r(d[0]).css`
  .icon-box {
    width: 64px;
    height: 64px;
    border-radius: 16px;
    background-color: ${({spacing:o})=>o[16]};
    border: 8px solid ${({tokens:o})=>o.theme.borderPrimary};
    border-radius: ${({borderRadius:o})=>o.round};
  }
`},3805,[2546]);