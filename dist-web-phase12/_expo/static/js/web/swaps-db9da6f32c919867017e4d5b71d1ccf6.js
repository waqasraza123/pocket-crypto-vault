__d(function(g,r,i,a,m,e,d){"use strict";Object.defineProperty(e,'__esModule',{value:!0});var t=r(d[0]);Object.keys(t).forEach(function(n){'default'===n||Object.prototype.hasOwnProperty.call(e,n)||Object.defineProperty(e,n,{enumerable:!0,get:function(){return t[n]}})});var n=r(d[1]);Object.keys(n).forEach(function(t){'default'===t||Object.prototype.hasOwnProperty.call(e,t)||Object.defineProperty(e,t,{enumerable:!0,get:function(){return n[t]}})});var c=r(d[2]);Object.keys(c).forEach(function(t){'default'===t||Object.prototype.hasOwnProperty.call(e,t)||Object.defineProperty(e,t,{enumerable:!0,get:function(){return c[t]}})})},3668,[3767,3775,3777]);
__d(function(g,_r,_i,a,m,_e,_d){"use strict";Object.defineProperty(_e,'__esModule',{value:!0}),Object.defineProperty(_e,"W3mSwapView",{enumerable:!0,get:function(){return u}});var t=_r(_d[0]),e=_r(_d[1]),o=_r(_d[2]),i=_r(_d[3]),n=_r(_d[4]);_r(_d[5]),_r(_d[6]),_r(_d[7]),_r(_d[8]),_r(_d[9]);var r=_r(_d[10]);_r(_d[11]),_r(_d[12]),_r(_d[13]);var s,l=_r(_d[14]),c=(s=l)&&s.__esModule?s:{default:s},p=this&&this.__decorate||function(t,e,o,i){var n,r=arguments.length,s=r<3?e:null===i?i=Object.getOwnPropertyDescriptor(e,o):i;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)s=Reflect.decorate(t,e,o,i);else for(var l=t.length-1;l>=0;l--)(n=t[l])&&(s=(r<3?n(s):r>3?n(e,o,s):n(e,o))||s);return r>3&&s&&Object.defineProperty(e,o,s),s};let u=class extends t.LitElement{subscribe({resetSwapState:t,initializeSwapState:e}){return()=>{i.ChainController.subscribeKey('activeCaipNetwork',o=>this.onCaipNetworkChange({newCaipNetwork:o,resetSwapState:t,initializeSwapState:e})),i.ChainController.subscribeChainProp('accountState',o=>{this.onCaipAddressChange({newCaipAddress:o?.caipAddress,resetSwapState:t,initializeSwapState:e})})}}constructor(){super(),this.unsubscribe=[],this.initialParams=i.RouterController.state.data?.swap,this.detailsOpen=!1,this.caipAddress=i.ChainController.getAccountData()?.caipAddress,this.caipNetworkId=i.ChainController.state.activeCaipNetwork?.caipNetworkId,this.initialized=i.SwapController.state.initialized,this.loadingQuote=i.SwapController.state.loadingQuote,this.loadingPrices=i.SwapController.state.loadingPrices,this.loadingTransaction=i.SwapController.state.loadingTransaction,this.sourceToken=i.SwapController.state.sourceToken,this.sourceTokenAmount=i.SwapController.state.sourceTokenAmount,this.sourceTokenPriceInUSD=i.SwapController.state.sourceTokenPriceInUSD,this.toToken=i.SwapController.state.toToken,this.toTokenAmount=i.SwapController.state.toTokenAmount,this.toTokenPriceInUSD=i.SwapController.state.toTokenPriceInUSD,this.inputError=i.SwapController.state.inputError,this.fetchError=i.SwapController.state.fetchError,this.lastTokenPriceUpdate=0,this.minTokenPriceUpdateInterval=1e4,this.visibilityChangeHandler=()=>{document?.hidden?(clearInterval(this.interval),this.interval=void 0):this.startTokenPriceInterval()},this.startTokenPriceInterval=()=>{this.interval&&Date.now()-this.lastTokenPriceUpdate<this.minTokenPriceUpdateInterval||(this.lastTokenPriceUpdate&&Date.now()-this.lastTokenPriceUpdate>this.minTokenPriceUpdateInterval&&this.fetchTokensAndValues(),clearInterval(this.interval),this.interval=setInterval(()=>{this.fetchTokensAndValues()},this.minTokenPriceUpdateInterval))},this.watchTokensAndValues=()=>{this.sourceToken&&this.toToken&&(this.subscribeToVisibilityChange(),this.startTokenPriceInterval())},this.onDebouncedGetSwapCalldata=i.CoreHelperUtil.debounce(async()=>{await i.SwapController.swapTokens()},200),this.subscribe({resetSwapState:!0,initializeSwapState:!1})(),this.unsubscribe.push(this.subscribe({resetSwapState:!1,initializeSwapState:!0}),i.ModalController.subscribeKey('open',t=>{t||i.SwapController.resetState()}),i.RouterController.subscribeKey('view',t=>{t.includes('Swap')||i.SwapController.resetValues()}),i.SwapController.subscribe(t=>{this.initialized=t.initialized,this.loadingQuote=t.loadingQuote,this.loadingPrices=t.loadingPrices,this.loadingTransaction=t.loadingTransaction,this.sourceToken=t.sourceToken,this.sourceTokenAmount=t.sourceTokenAmount,this.sourceTokenPriceInUSD=t.sourceTokenPriceInUSD,this.toToken=t.toToken,this.toTokenAmount=t.toTokenAmount,this.toTokenPriceInUSD=t.toTokenPriceInUSD,this.inputError=t.inputError,this.fetchError=t.fetchError,t.sourceToken&&t.toToken&&this.watchTokensAndValues()}))}async firstUpdated(){i.SwapController.initializeState(),this.watchTokensAndValues(),await this.handleSwapParameters()}disconnectedCallback(){this.unsubscribe.forEach(t=>t?.()),clearInterval(this.interval),document?.removeEventListener('visibilitychange',this.visibilityChangeHandler)}render(){return t.html`
      <wui-flex flexDirection="column" .padding=${['0','4','4','4']} gap="3">
        ${this.initialized?this.templateSwap():this.templateLoading()}
      </wui-flex>
    `}subscribeToVisibilityChange(){document?.removeEventListener('visibilitychange',this.visibilityChangeHandler),document?.addEventListener('visibilitychange',this.visibilityChangeHandler)}fetchTokensAndValues(){i.SwapController.getNetworkTokenPrice(),i.SwapController.getMyTokensWithBalance(),i.SwapController.swapTokens(),this.lastTokenPriceUpdate=Date.now()}templateSwap(){return t.html`
      <wui-flex flexDirection="column" gap="3">
        <wui-flex flexDirection="column" alignItems="center" gap="2" class="swap-inputs-container">
          ${this.templateTokenInput('sourceToken',this.sourceToken)}
          ${this.templateTokenInput('toToken',this.toToken)} ${this.templateReplaceTokensButton()}
        </wui-flex>
        ${this.templateDetails()} ${this.templateActionButton()}
      </wui-flex>
    `}actionButtonLabel(){const t=!this.sourceTokenAmount||'0'===this.sourceTokenAmount;return this.fetchError?'Swap':this.sourceToken&&this.toToken?t?'Enter amount':this.inputError?this.inputError:'Review swap':'Select token'}templateReplaceTokensButton(){return t.html`
      <wui-flex class="replace-tokens-button-container">
        <wui-icon-box
          @click=${this.onSwitchTokens.bind(this)}
          icon="recycleHorizontal"
          size="md"
          variant="default"
        ></wui-icon-box>
      </wui-flex>
    `}templateLoading(){return t.html`
      <wui-flex flexDirection="column" gap="4">
        <wui-flex flexDirection="column" alignItems="center" gap="2" class="swap-inputs-container">
          <w3m-swap-input-skeleton target="sourceToken"></w3m-swap-input-skeleton>
          <w3m-swap-input-skeleton target="toToken"></w3m-swap-input-skeleton>
          ${this.templateReplaceTokensButton()}
        </wui-flex>
        ${this.templateActionButton()}
      </wui-flex>
    `}templateTokenInput(e,n){const r=i.SwapController.state.myTokensWithBalance?.find(t=>t?.address===n?.address),s='toToken'===e?this.toTokenAmount:this.sourceTokenAmount,l='toToken'===e?this.toTokenPriceInUSD:this.sourceTokenPriceInUSD,c=o.NumberUtil.parseLocalStringToNumber(s)*l;return t.html`<w3m-swap-input
      .value=${'toToken'===e?this.toTokenAmount:this.sourceTokenAmount}
      .disabled=${'toToken'===e}
      .onSetAmount=${this.handleChangeAmount.bind(this)}
      target=${e}
      .token=${n}
      .balance=${r?.quantity?.numeric}
      .price=${r?.price}
      .marketValue=${c}
      .onSetMaxValue=${this.onSetMaxValue.bind(this)}
    ></w3m-swap-input>`}onSetMaxValue(t,e){const i=o.NumberUtil.bigNumber(e||'0');this.handleChangeAmount(t,i.gt(0)?i.toFixed(20):'0')}templateDetails(){return this.sourceToken&&this.toToken&&!this.inputError?t.html`<w3m-swap-details .detailsOpen=${this.detailsOpen}></w3m-swap-details>`:null}handleChangeAmount(t,e){i.SwapController.clearError(),'sourceToken'===t?i.SwapController.setSourceTokenAmount(e):i.SwapController.setToTokenAmount(e),this.onDebouncedGetSwapCalldata()}templateActionButton(){const e=!this.toToken||!this.sourceToken,o=!this.sourceTokenAmount||'0'===this.sourceTokenAmount,i=this.loadingQuote||this.loadingPrices||this.loadingTransaction,n=i||e||o||this.inputError;return t.html` <wui-flex gap="2">
      <wui-button
        data-testid="swap-action-button"
        class="action-button"
        fullWidth
        size="lg"
        borderRadius="xs"
        variant="accent-primary"
        ?loading=${Boolean(i)}
        ?disabled=${Boolean(n)}
        @click=${this.onSwapPreview.bind(this)}
      >
        ${this.actionButtonLabel()}
      </wui-button>
    </wui-flex>`}async onSwitchTokens(){await i.SwapController.switchTokens()}async onSwapPreview(){this.fetchError&&await i.SwapController.swapTokens(),i.EventsController.sendEvent({type:'track',event:'INITIATE_SWAP',properties:{network:this.caipNetworkId||'',swapFromToken:this.sourceToken?.symbol||'',swapToToken:this.toToken?.symbol||'',swapFromAmount:this.sourceTokenAmount||'',swapToAmount:this.toTokenAmount||'',isSmartAccount:(0,i.getPreferredAccountType)(i.ChainController.state.activeChain)===r.W3mFrameRpcConstants.ACCOUNT_TYPES.SMART_ACCOUNT}}),i.RouterController.push('SwapPreview')}async handleSwapParameters(){if(this.initialParams){if(!i.SwapController.state.initialized){const t=new Promise(t=>{const e=i.SwapController.subscribeKey('initialized',o=>{o&&(e?.(),t())})});await t}await this.setSwapParameters(this.initialParams)}}async setSwapParameters({amount:t,fromToken:e,toToken:o}){if(!i.SwapController.state.tokens||!i.SwapController.state.myTokensWithBalance){const t=new Promise(t=>{const e=i.SwapController.subscribeKey('myTokensWithBalance',o=>{o&&o.length>0&&(e?.(),t())});setTimeout(()=>{e?.(),t()},5e3)});await t}const n=[...i.SwapController.state.tokens||[],...i.SwapController.state.myTokensWithBalance||[]];if(e){const t=n.find(t=>t.symbol.toLowerCase()===e.toLowerCase());t&&i.SwapController.setSourceToken(t)}if(o){const t=n.find(t=>t.symbol.toLowerCase()===o.toLowerCase());t&&i.SwapController.setToToken(t)}t&&!isNaN(Number(t))&&i.SwapController.setSourceTokenAmount(t)}onCaipAddressChange({newCaipAddress:t,resetSwapState:e,initializeSwapState:o}){this.caipAddress!==t&&(this.caipAddress=t,e&&i.SwapController.resetState(),o&&i.SwapController.initializeState())}onCaipNetworkChange({newCaipNetwork:t,resetSwapState:e,initializeSwapState:o}){this.caipNetworkId!==t?.caipNetworkId&&(this.caipNetworkId=t?.caipNetworkId,e&&i.SwapController.resetState(),o&&i.SwapController.initializeState())}};u.styles=c.default,p([(0,e.property)({type:Object})],u.prototype,"initialParams",void 0),p([(0,e.state)()],u.prototype,"interval",void 0),p([(0,e.state)()],u.prototype,"detailsOpen",void 0),p([(0,e.state)()],u.prototype,"caipAddress",void 0),p([(0,e.state)()],u.prototype,"caipNetworkId",void 0),p([(0,e.state)()],u.prototype,"initialized",void 0),p([(0,e.state)()],u.prototype,"loadingQuote",void 0),p([(0,e.state)()],u.prototype,"loadingPrices",void 0),p([(0,e.state)()],u.prototype,"loadingTransaction",void 0),p([(0,e.state)()],u.prototype,"sourceToken",void 0),p([(0,e.state)()],u.prototype,"sourceTokenAmount",void 0),p([(0,e.state)()],u.prototype,"sourceTokenPriceInUSD",void 0),p([(0,e.state)()],u.prototype,"toToken",void 0),p([(0,e.state)()],u.prototype,"toTokenAmount",void 0),p([(0,e.state)()],u.prototype,"toTokenPriceInUSD",void 0),p([(0,e.state)()],u.prototype,"inputError",void 0),p([(0,e.state)()],u.prototype,"fetchError",void 0),p([(0,e.state)()],u.prototype,"lastTokenPriceUpdate",void 0),u=p([(0,n.customElement)('w3m-swap-view')],u)},3767,[2549,2575,2169,2164,2546,2683,2650,2658,2705,2651,2222,3768,3770,3772,3774]);
__d(function(g,_r,_i,a,m,_e,_d){"use strict";Object.defineProperty(_e,'__esModule',{value:!0}),Object.defineProperty(_e,"WuiSwapDetails",{enumerable:!0,get:function(){return p}});var e=_r(_d[0]),t=_r(_d[1]),o=_r(_d[2]),i=_r(_d[3]),r=_r(_d[4]);_r(_d[5]),_r(_d[6]),_r(_d[7]),_r(_d[8]),_r(_d[9]);var n,l=_r(_d[10]),s=(n=l)&&n.__esModule?n:{default:n},u=this&&this.__decorate||function(e,t,o,i){var r,n=arguments.length,l=n<3?t:null===i?i=Object.getOwnPropertyDescriptor(t,o):i;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)l=Reflect.decorate(e,t,o,i);else for(var s=e.length-1;s>=0;s--)(r=e[s])&&(l=(n<3?r(l):n>3?r(t,o,l):r(t,o))||l);return n>3&&l&&Object.defineProperty(t,o,l),l};const c=i.ConstantsUtil.CONVERT_SLIPPAGE_TOLERANCE;let p=class extends e.LitElement{constructor(){super(),this.unsubscribe=[],this.networkName=i.ChainController.state.activeCaipNetwork?.name,this.detailsOpen=!1,this.sourceToken=i.SwapController.state.sourceToken,this.toToken=i.SwapController.state.toToken,this.toTokenAmount=i.SwapController.state.toTokenAmount,this.sourceTokenPriceInUSD=i.SwapController.state.sourceTokenPriceInUSD,this.toTokenPriceInUSD=i.SwapController.state.toTokenPriceInUSD,this.priceImpact=i.SwapController.state.priceImpact,this.maxSlippage=i.SwapController.state.maxSlippage,this.networkTokenSymbol=i.SwapController.state.networkTokenSymbol,this.inputError=i.SwapController.state.inputError,this.unsubscribe.push(i.SwapController.subscribe(e=>{this.sourceToken=e.sourceToken,this.toToken=e.toToken,this.toTokenAmount=e.toTokenAmount,this.priceImpact=e.priceImpact,this.maxSlippage=e.maxSlippage,this.sourceTokenPriceInUSD=e.sourceTokenPriceInUSD,this.toTokenPriceInUSD=e.toTokenPriceInUSD,this.inputError=e.inputError}))}render(){const t=this.toTokenAmount&&this.maxSlippage?o.NumberUtil.bigNumber(this.toTokenAmount).minus(this.maxSlippage).toString():null;if(!this.sourceToken||!this.toToken||this.inputError)return null;const i=this.sourceTokenPriceInUSD&&this.toTokenPriceInUSD?1/this.toTokenPriceInUSD*this.sourceTokenPriceInUSD:0;return e.html`
      <wui-flex flexDirection="column" alignItems="center" gap="01" class="details-container">
        <wui-flex flexDirection="column">
          <button @click=${this.toggleDetails.bind(this)}>
            <wui-flex justifyContent="space-between" .padding=${['0','2','0','2']}>
              <wui-flex justifyContent="flex-start" flexGrow="1" gap="2">
                <wui-text variant="sm-regular" color="primary">
                  1 ${this.sourceToken.symbol} =
                  ${o.NumberUtil.formatNumberToLocalString(i,3)}
                  ${this.toToken.symbol}
                </wui-text>
                <wui-text variant="sm-regular" color="secondary">
                  $${o.NumberUtil.formatNumberToLocalString(this.sourceTokenPriceInUSD)}
                </wui-text>
              </wui-flex>
              <wui-icon name="chevronBottom"></wui-icon>
            </wui-flex>
          </button>
          ${this.detailsOpen?e.html`
                <wui-flex flexDirection="column" gap="2" class="details-content-container">
                  ${this.priceImpact?e.html` <wui-flex flexDirection="column" gap="2">
                        <wui-flex
                          justifyContent="space-between"
                          alignItems="center"
                          class="details-row"
                        >
                          <wui-flex alignItems="center" gap="2">
                            <wui-text
                              class="details-row-title"
                              variant="sm-regular"
                              color="secondary"
                            >
                              Price impact
                            </wui-text>
                            <w3m-tooltip-trigger
                              text="Price impact reflects the change in market price due to your trade"
                            >
                              <wui-icon size="sm" color="default" name="info"></wui-icon>
                            </w3m-tooltip-trigger>
                          </wui-flex>
                          <wui-flex>
                            <wui-text variant="sm-regular" color="secondary">
                              ${o.NumberUtil.formatNumberToLocalString(this.priceImpact,3)}%
                            </wui-text>
                          </wui-flex>
                        </wui-flex>
                      </wui-flex>`:null}
                  ${this.maxSlippage&&this.sourceToken.symbol?e.html`<wui-flex flexDirection="column" gap="2">
                        <wui-flex
                          justifyContent="space-between"
                          alignItems="center"
                          class="details-row"
                        >
                          <wui-flex alignItems="center" gap="2">
                            <wui-text
                              class="details-row-title"
                              variant="sm-regular"
                              color="secondary"
                            >
                              Max. slippage
                            </wui-text>
                            <w3m-tooltip-trigger
                              text=${"Max slippage sets the minimum amount you must receive for the transaction to proceed. "+(t?`Transaction will be reversed if you receive less than ${o.NumberUtil.formatNumberToLocalString(t,6)} ${this.toToken.symbol} due to price changes.`:'')}
                            >
                              <wui-icon size="sm" color="default" name="info"></wui-icon>
                            </w3m-tooltip-trigger>
                          </wui-flex>
                          <wui-flex>
                            <wui-text variant="sm-regular" color="secondary">
                              ${o.NumberUtil.formatNumberToLocalString(this.maxSlippage,6)}
                              ${this.toToken.symbol} ${c}%
                            </wui-text>
                          </wui-flex>
                        </wui-flex>
                      </wui-flex>`:null}
                  <wui-flex flexDirection="column" gap="2">
                    <wui-flex
                      justifyContent="space-between"
                      alignItems="center"
                      class="details-row provider-free-row"
                    >
                      <wui-flex alignItems="center" gap="2">
                        <wui-text class="details-row-title" variant="sm-regular" color="secondary">
                          Provider fee
                        </wui-text>
                      </wui-flex>
                      <wui-flex>
                        <wui-text variant="sm-regular" color="secondary">0.85%</wui-text>
                      </wui-flex>
                    </wui-flex>
                  </wui-flex>
                </wui-flex>
              `:null}
        </wui-flex>
      </wui-flex>
    `}toggleDetails(){this.detailsOpen=!this.detailsOpen}};p.styles=[s.default],u([(0,t.state)()],p.prototype,"networkName",void 0),u([(0,t.property)()],p.prototype,"detailsOpen",void 0),u([(0,t.state)()],p.prototype,"sourceToken",void 0),u([(0,t.state)()],p.prototype,"toToken",void 0),u([(0,t.state)()],p.prototype,"toTokenAmount",void 0),u([(0,t.state)()],p.prototype,"sourceTokenPriceInUSD",void 0),u([(0,t.state)()],p.prototype,"toTokenPriceInUSD",void 0),u([(0,t.state)()],p.prototype,"priceImpact",void 0),u([(0,t.state)()],p.prototype,"maxSlippage",void 0),u([(0,t.state)()],p.prototype,"networkTokenSymbol",void 0),u([(0,t.state)()],p.prototype,"inputError",void 0),p=u([(0,r.customElement)('w3m-swap-details')],p)},3768,[2549,2575,2169,2164,2546,2650,2658,2651,2729,2731,3769]);
__d(function(g,r,i,a,m,e,d){"use strict";Object.defineProperty(e,'__esModule',{value:!0}),Object.defineProperty(e,"default",{enumerable:!0,get:function(){return n}});var n=r(d[0]).css`
  :host {
    width: 100%;
  }

  .details-container > wui-flex {
    background: ${({tokens:n})=>n.theme.foregroundPrimary};
    border-radius: ${({borderRadius:n})=>n[3]};
    width: 100%;
  }

  .details-container > wui-flex > button {
    border: none;
    background: none;
    padding: ${({spacing:n})=>n[3]};
    border-radius: ${({borderRadius:n})=>n[3]};
    cursor: pointer;
  }

  .details-content-container {
    padding: ${({spacing:n})=>n[2]};
    padding-top: 0px;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .details-content-container > wui-flex {
    width: 100%;
  }

  .details-row {
    width: 100%;
    padding: ${({spacing:n})=>n[3]};
    padding-left: ${({spacing:n})=>n[3]};
    padding-right: ${({spacing:n})=>n[2]};
    border-radius: calc(
      ${({borderRadius:n})=>n[1]} + ${({borderRadius:n})=>n[1]}
    );
    background: ${({tokens:n})=>n.theme.foregroundPrimary};
  }

  .details-row-title {
    white-space: nowrap;
  }

  .details-row.provider-free-row {
    padding-right: ${({spacing:n})=>n[2]};
  }
`},3769,[2546]);
__d(function(g,_r,_i,a,m,_e,_d){"use strict";Object.defineProperty(_e,'__esModule',{value:!0}),Object.defineProperty(_e,"W3mSwapInputSkeleton",{enumerable:!0,get:function(){return u}});var e=_r(_d[0]),t=_r(_d[1]);_r(_d[2]);var n=_r(_d[3]);_r(_d[4]),_r(_d[5]);var r,i=_r(_d[6]),l=(r=i)&&r.__esModule?r:{default:r},o=this&&this.__decorate||function(e,t,n,r){var i,l=arguments.length,o=l<3?t:null===r?r=Object.getOwnPropertyDescriptor(t,n):r;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)o=Reflect.decorate(e,t,n,r);else for(var u=e.length-1;u>=0;u--)(i=e[u])&&(o=(l<3?i(o):l>3?i(t,n,o):i(t,n))||o);return l>3&&o&&Object.defineProperty(t,n,o),o};let u=class extends e.LitElement{constructor(){super(...arguments),this.target='sourceToken'}render(){return e.html`
      <wui-flex class justifyContent="space-between">
        <wui-flex
          flex="1"
          flexDirection="column"
          alignItems="flex-start"
          justifyContent="center"
          class="swap-input"
          gap="1"
        >
          <wui-shimmer width="80px" height="40px" rounded variant="light"></wui-shimmer>
        </wui-flex>
        ${this.templateTokenSelectButton()}
      </wui-flex>
    `}templateTokenSelectButton(){return e.html`
      <wui-flex
        class="swap-token-button"
        flexDirection="column"
        alignItems="flex-end"
        justifyContent="center"
        gap="1"
      >
        <wui-shimmer width="80px" height="40px" rounded variant="light"></wui-shimmer>
      </wui-flex>
    `}};u.styles=[l.default],o([(0,t.property)()],u.prototype,"target",void 0),u=o([(0,n.customElement)('w3m-swap-input-skeleton')],u)},3770,[2549,2575,2164,2546,2650,2773,3771]);
__d(function(g,r,i,a,m,e,d){"use strict";Object.defineProperty(e,'__esModule',{value:!0}),Object.defineProperty(e,"default",{enumerable:!0,get:function(){return t}});var t=r(d[0]).css`
  :host {
    width: 100%;
  }

  :host > wui-flex {
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
    border-radius: ${({borderRadius:t})=>t[5]};
    padding: ${({spacing:t})=>t[5]};
    padding-right: ${({spacing:t})=>t[3]};
    background-color: ${({tokens:t})=>t.theme.foregroundPrimary};
    box-shadow: inset 0px 0px 0px 1px ${({tokens:t})=>t.theme.foregroundPrimary};
    width: 100%;
    height: 100px;
    box-sizing: border-box;
    position: relative;
  }

  wui-shimmer.market-value {
    opacity: 0;
  }

  :host > wui-flex > svg.input_mask {
    position: absolute;
    inset: 0;
    z-index: 5;
  }

  :host wui-flex .input_mask__border,
  :host wui-flex .input_mask__background {
    transition: fill ${({durations:t})=>t.md}
      ${({easings:t})=>t['ease-out-power-1']};
    will-change: fill;
  }

  :host wui-flex .input_mask__border {
    fill: ${({tokens:t})=>t.core.glass010};
  }

  :host wui-flex .input_mask__background {
    fill: ${({tokens:t})=>t.theme.foregroundPrimary};
  }
`},3771,[2546]);
__d(function(g,_r,_i,a,m,_e,_d){"use strict";Object.defineProperty(_e,'__esModule',{value:!0}),Object.defineProperty(_e,"W3mSwapInput",{enumerable:!0,get:function(){return c}});var t=_r(_d[0]),e=_r(_d[1]),o=_r(_d[2]),n=_r(_d[3]),i=_r(_d[4]);_r(_d[5]),_r(_d[6]),_r(_d[7]),_r(_d[8]);var r,u=_r(_d[9]),s=(r=u)&&r.__esModule?r:{default:r},l=this&&this.__decorate||function(t,e,o,n){var i,r=arguments.length,u=r<3?e:null===n?n=Object.getOwnPropertyDescriptor(e,o):n;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)u=Reflect.decorate(t,e,o,n);else for(var s=t.length-1;s>=0;s--)(i=t[s])&&(u=(r<3?i(u):r>3?i(e,o,u):i(e,o))||u);return r>3&&u&&Object.defineProperty(e,o,u),u};let c=class extends t.LitElement{constructor(){super(...arguments),this.focused=!1,this.price=0,this.target='sourceToken',this.onSetAmount=null,this.onSetMaxValue=null}render(){const e=this.marketValue||'0',n=o.NumberUtil.bigNumber(e).gt('0');return t.html`
      <wui-flex
        class="${this.focused?'focus':''}"
        justifyContent="space-between"
        alignItems="center"
      >
        <wui-flex
          flex="1"
          flexDirection="column"
          alignItems="flex-start"
          justifyContent="center"
          class="swap-input"
        >
          <input
            data-testid="swap-input-${this.target}"
            @focusin=${()=>this.onFocusChange(!0)}
            @focusout=${()=>this.onFocusChange(!1)}
            ?disabled=${this.disabled}
            value=${this.value||''}
            @input=${this.dispatchInputChangeEvent}
            @keydown=${this.handleKeydown}
            placeholder="0"
            type="text"
            inputmode="decimal"
            pattern="[0-9,.]*"
          />
          <wui-text class="market-value" variant="sm-regular" color="secondary">
            ${n?`$${o.NumberUtil.formatNumberToLocalString(this.marketValue,2)}`:null}
          </wui-text>
        </wui-flex>
        ${this.templateTokenSelectButton()}
      </wui-flex>
    `}handleKeydown(t){return o.InputUtil.numericInputKeyDown(t,this.value,t=>this.onSetAmount?.(this.target,t))}dispatchInputChangeEvent(t){if(!this.onSetAmount)return;const e=t.target.value.replace(/[^0-9.]/gu,'');','===e||'.'===e?this.onSetAmount(this.target,'0.'):e.endsWith(',')?this.onSetAmount(this.target,e.replace(',','.')):this.onSetAmount(this.target,e)}setMaxValueToInput(){this.onSetMaxValue?.(this.target,this.balance)}templateTokenSelectButton(){return this.token?t.html`
      <wui-flex
        class="swap-token-button"
        flexDirection="column"
        alignItems="flex-end"
        justifyContent="center"
        gap="1"
      >
        <wui-token-button
          data-testid="swap-input-token-${this.target}"
          text=${this.token.symbol}
          imageSrc=${this.token.logoUri}
          @click=${this.onSelectToken.bind(this)}
        >
        </wui-token-button>
        <wui-flex alignItems="center" gap="1"> ${this.tokenBalanceTemplate()} </wui-flex>
      </wui-flex>
    `:t.html` <wui-button
        data-testid="swap-select-token-button-${this.target}"
        class="swap-token-button"
        size="md"
        variant="neutral-secondary"
        @click=${this.onSelectToken.bind(this)}
      >
        Select token
      </wui-button>`}tokenBalanceTemplate(){const e=o.NumberUtil.multiply(this.balance,this.price),n=!!e&&e?.gt(5e-5);return t.html`
      ${n?t.html`<wui-text variant="sm-regular" color="secondary">
            ${o.NumberUtil.formatNumberToLocalString(this.balance,2)}
          </wui-text>`:null}
      ${'sourceToken'===this.target?this.tokenActionButtonTemplate(n):null}
    `}tokenActionButtonTemplate(e){return e?t.html` <button class="max-value-button" @click=${this.setMaxValueToInput.bind(this)}>
        <wui-text color="accent-primary" variant="sm-medium">Max</wui-text>
      </button>`:t.html` <button class="max-value-button" @click=${this.onBuyToken.bind(this)}>
      <wui-text color="accent-primary" variant="sm-medium">Buy</wui-text>
    </button>`}onFocusChange(t){this.focused=t}onSelectToken(){n.EventsController.sendEvent({type:'track',event:'CLICK_SELECT_TOKEN_TO_SWAP'}),n.RouterController.push('SwapSelectToken',{target:this.target})}onBuyToken(){n.RouterController.push('OnRampProviders')}};c.styles=[s.default],l([(0,e.property)()],c.prototype,"focused",void 0),l([(0,e.property)()],c.prototype,"balance",void 0),l([(0,e.property)()],c.prototype,"value",void 0),l([(0,e.property)()],c.prototype,"price",void 0),l([(0,e.property)()],c.prototype,"marketValue",void 0),l([(0,e.property)()],c.prototype,"disabled",void 0),l([(0,e.property)()],c.prototype,"target",void 0),l([(0,e.property)()],c.prototype,"token",void 0),l([(0,e.property)()],c.prototype,"onSetAmount",void 0),l([(0,e.property)()],c.prototype,"onSetMaxValue",void 0),c=l([(0,i.customElement)('w3m-swap-input')],c)},3772,[2549,2575,2169,2164,2546,2683,2650,2651,3785,3773]);
__d(function(g,r,i,a,m,e,d){"use strict";Object.defineProperty(e,'__esModule',{value:!0}),Object.defineProperty(e,"default",{enumerable:!0,get:function(){return t}});var t=r(d[0]).css`
  :host > wui-flex {
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
    border-radius: ${({borderRadius:t})=>t[5]};
    background-color: ${({tokens:t})=>t.theme.foregroundPrimary};
    padding: ${({spacing:t})=>t[5]};
    padding-right: ${({spacing:t})=>t[3]};
    width: 100%;
    height: 100px;
    box-sizing: border-box;
    box-shadow: inset 0px 0px 0px 1px ${({tokens:t})=>t.theme.foregroundPrimary};
    position: relative;
    transition: box-shadow ${({easings:t})=>t['ease-out-power-1']}
      ${({durations:t})=>t.lg};
    will-change: background-color;
  }

  :host wui-flex.focus {
    box-shadow: inset 0px 0px 0px 1px ${({tokens:t})=>t.core.glass010};
  }

  :host > wui-flex .swap-input,
  :host > wui-flex .swap-token-button {
    z-index: 10;
  }

  :host > wui-flex .swap-input {
    -webkit-mask-image: linear-gradient(
      270deg,
      transparent 0px,
      transparent 8px,
      black 24px,
      black 25px,
      black 32px,
      black 100%
    );
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

  :host > wui-flex .swap-input input {
    background: none;
    border: none;
    height: 42px;
    width: 100%;
    font-size: 32px;
    font-style: normal;
    font-weight: 400;
    line-height: 130%;
    letter-spacing: -1.28px;
    outline: none;
    caret-color: ${({tokens:t})=>t.core.textAccentPrimary};
    color: ${({tokens:t})=>t.theme.textPrimary};
    padding: 0px;
  }

  :host > wui-flex .swap-input input:focus-visible {
    outline: none;
  }

  :host > wui-flex .swap-input input::-webkit-outer-spin-button,
  :host > wui-flex .swap-input input::-webkit-inner-spin-button {
    -webkit-appearance: none;
    margin: 0;
  }

  .max-value-button {
    background-color: transparent;
    border: none;
    cursor: pointer;
    color: ${({tokens:t})=>t.core.glass010};
    padding-left: 0px;
  }

  .market-value {
    min-height: 18px;
  }
`},3773,[2546]);
__d(function(g,r,i,a,m,e,d){"use strict";Object.defineProperty(e,'__esModule',{value:!0}),Object.defineProperty(e,"default",{enumerable:!0,get:function(){return o}});var o=r(d[0]).css`
  :host > wui-flex:first-child {
    overflow-y: auto;
    overflow-x: hidden;
    scrollbar-width: none;
  }

  :host > wui-flex:first-child::-webkit-scrollbar {
    display: none;
  }

  wui-loading-hexagon {
    position: absolute;
  }

  .action-button {
    width: 100%;
    border-radius: ${({borderRadius:o})=>o[4]};
  }

  .action-button:disabled {
    border-color: 1px solid ${({tokens:o})=>o.core.glass010};
  }

  .swap-inputs-container {
    position: relative;
  }

  wui-icon-box {
    width: 32px;
    height: 32px;
    border-radius: ${({borderRadius:o})=>o[10]} !important;
    border: 4px solid ${({tokens:o})=>o.theme.backgroundPrimary};
    background: ${({tokens:o})=>o.theme.foregroundPrimary};
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    z-index: 3;
  }

  .replace-tokens-button-container {
    display: flex;
    justify-content: center;
    align-items: center;
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    gap: ${({spacing:o})=>o[2]};
    border-radius: ${({borderRadius:o})=>o[4]};
    background-color: ${({tokens:o})=>o.theme.backgroundPrimary};
    padding: ${({spacing:o})=>o[2]};
  }

  .details-container > wui-flex {
    background: ${({tokens:o})=>o.theme.foregroundPrimary};
    border-radius: ${({borderRadius:o})=>o[3]};
    width: 100%;
  }

  .details-container > wui-flex > button {
    border: none;
    background: none;
    padding: ${({spacing:o})=>o[3]};
    border-radius: ${({borderRadius:o})=>o[3]};
    transition: background ${({durations:o})=>o.lg}
      ${({easings:o})=>o['ease-out-power-2']};
    will-change: background;
  }

  .details-container > wui-flex > button:hover {
    background: ${({tokens:o})=>o.theme.foregroundPrimary};
  }

  .details-content-container {
    padding: ${({spacing:o})=>o[2]};
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .details-content-container > wui-flex {
    width: 100%;
  }

  .details-row {
    width: 100%;
    padding: ${({spacing:o})=>o[3]} ${({spacing:o})=>o[5]};
    border-radius: ${({borderRadius:o})=>o[3]};
    background: ${({tokens:o})=>o.theme.foregroundPrimary};
  }
`},3774,[2546]);
__d(function(g,_r,_i,a,m,_e,_d){"use strict";Object.defineProperty(_e,'__esModule',{value:!0}),Object.defineProperty(_e,"W3mSwapPreviewView",{enumerable:!0,get:function(){return u}});var t=_r(_d[0]),e=_r(_d[1]),o=_r(_d[2]),n=_r(_d[3]),i=_r(_d[4]);_r(_d[5]),_r(_d[6]),_r(_d[7]),_r(_d[8]),_r(_d[9]),_r(_d[10]);var r,s=_r(_d[11]),l=(r=s)&&r.__esModule?r:{default:r},c=this&&this.__decorate||function(t,e,o,n){var i,r=arguments.length,s=r<3?e:null===n?n=Object.getOwnPropertyDescriptor(e,o):n;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)s=Reflect.decorate(t,e,o,n);else for(var l=t.length-1;l>=0;l--)(i=t[l])&&(s=(r<3?i(s):r>3?i(e,o,s):i(e,o))||s);return r>3&&s&&Object.defineProperty(e,o,s),s};let u=class extends t.LitElement{constructor(){super(),this.unsubscribe=[],this.detailsOpen=!0,this.approvalTransaction=n.SwapController.state.approvalTransaction,this.swapTransaction=n.SwapController.state.swapTransaction,this.sourceToken=n.SwapController.state.sourceToken,this.sourceTokenAmount=n.SwapController.state.sourceTokenAmount??'',this.sourceTokenPriceInUSD=n.SwapController.state.sourceTokenPriceInUSD,this.balanceSymbol=n.ChainController.getAccountData()?.balanceSymbol,this.toToken=n.SwapController.state.toToken,this.toTokenAmount=n.SwapController.state.toTokenAmount??'',this.toTokenPriceInUSD=n.SwapController.state.toTokenPriceInUSD,this.caipNetwork=n.ChainController.state.activeCaipNetwork,this.inputError=n.SwapController.state.inputError,this.loadingQuote=n.SwapController.state.loadingQuote,this.loadingApprovalTransaction=n.SwapController.state.loadingApprovalTransaction,this.loadingBuildTransaction=n.SwapController.state.loadingBuildTransaction,this.loadingTransaction=n.SwapController.state.loadingTransaction,this.unsubscribe.push(n.ChainController.subscribeChainProp('accountState',t=>{t?.balanceSymbol!==this.balanceSymbol&&n.RouterController.goBack()}),n.ChainController.subscribeKey('activeCaipNetwork',t=>{this.caipNetwork!==t&&(this.caipNetwork=t)}),n.SwapController.subscribe(t=>{this.approvalTransaction=t.approvalTransaction,this.swapTransaction=t.swapTransaction,this.sourceToken=t.sourceToken,this.toToken=t.toToken,this.toTokenPriceInUSD=t.toTokenPriceInUSD,this.sourceTokenAmount=t.sourceTokenAmount??'',this.toTokenAmount=t.toTokenAmount??'',this.inputError=t.inputError,t.inputError&&n.RouterController.goBack(),this.loadingQuote=t.loadingQuote,this.loadingApprovalTransaction=t.loadingApprovalTransaction,this.loadingBuildTransaction=t.loadingBuildTransaction,this.loadingTransaction=t.loadingTransaction}))}firstUpdated(){n.SwapController.getTransaction(),this.refreshTransaction()}disconnectedCallback(){this.unsubscribe.forEach(t=>t?.()),clearInterval(this.interval)}render(){return t.html`
      <wui-flex flexDirection="column" .padding=${['0','4','4','4']} gap="3">
        ${this.templateSwap()}
      </wui-flex>
    `}refreshTransaction(){this.interval=setInterval(()=>{n.SwapController.getApprovalLoadingState()||n.SwapController.getTransaction()},1e4)}templateSwap(){const e=`${o.NumberUtil.formatNumberToLocalString(parseFloat(this.sourceTokenAmount))} ${this.sourceToken?.symbol}`,n=`${o.NumberUtil.formatNumberToLocalString(parseFloat(this.toTokenAmount))} ${this.toToken?.symbol}`,i=parseFloat(this.sourceTokenAmount)*this.sourceTokenPriceInUSD,r=parseFloat(this.toTokenAmount)*this.toTokenPriceInUSD,s=o.NumberUtil.formatNumberToLocalString(i),l=o.NumberUtil.formatNumberToLocalString(r),c=this.loadingQuote||this.loadingBuildTransaction||this.loadingTransaction||this.loadingApprovalTransaction;return t.html`
      <wui-flex flexDirection="column" alignItems="center" gap="4">
        <wui-flex class="preview-container" flexDirection="column" alignItems="flex-start" gap="4">
          <wui-flex
            class="preview-token-details-container"
            alignItems="center"
            justifyContent="space-between"
            gap="4"
          >
            <wui-flex flexDirection="column" alignItems="flex-start" gap="01">
              <wui-text variant="sm-regular" color="secondary">Send</wui-text>
              <wui-text variant="md-regular" color="primary">$${s}</wui-text>
            </wui-flex>
            <wui-token-button
              flexDirection="row-reverse"
              text=${e}
              imageSrc=${this.sourceToken?.logoUri}
            >
            </wui-token-button>
          </wui-flex>
          <wui-icon name="recycleHorizontal" color="default" size="md"></wui-icon>
          <wui-flex
            class="preview-token-details-container"
            alignItems="center"
            justifyContent="space-between"
            gap="4"
          >
            <wui-flex flexDirection="column" alignItems="flex-start" gap="01">
              <wui-text variant="sm-regular" color="secondary">Receive</wui-text>
              <wui-text variant="md-regular" color="primary">$${l}</wui-text>
            </wui-flex>
            <wui-token-button
              flexDirection="row-reverse"
              text=${n}
              imageSrc=${this.toToken?.logoUri}
            >
            </wui-token-button>
          </wui-flex>
        </wui-flex>

        ${this.templateDetails()}

        <wui-flex flexDirection="row" alignItems="center" justifyContent="center" gap="2">
          <wui-icon size="sm" color="default" name="info"></wui-icon>
          <wui-text variant="sm-regular" color="secondary">Review transaction carefully</wui-text>
        </wui-flex>

        <wui-flex
          class="action-buttons-container"
          flexDirection="row"
          alignItems="center"
          justifyContent="space-between"
          gap="2"
        >
          <wui-button
            class="cancel-button"
            fullWidth
            size="lg"
            borderRadius="xs"
            variant="neutral-secondary"
            @click=${this.onCancelTransaction.bind(this)}
          >
            <wui-text variant="md-medium" color="secondary">Cancel</wui-text>
          </wui-button>
          <wui-button
            class="action-button"
            fullWidth
            size="lg"
            borderRadius="xs"
            variant="accent-primary"
            ?loading=${c}
            ?disabled=${c}
            @click=${this.onSendTransaction.bind(this)}
          >
            <wui-text variant="md-medium" color="invert"> ${this.actionButtonLabel()} </wui-text>
          </wui-button>
        </wui-flex>
      </wui-flex>
    `}templateDetails(){return this.sourceToken&&this.toToken&&!this.inputError?t.html`<w3m-swap-details .detailsOpen=${this.detailsOpen}></w3m-swap-details>`:null}actionButtonLabel(){return this.loadingApprovalTransaction?'Approving...':this.approvalTransaction?'Approve':'Swap'}onCancelTransaction(){n.RouterController.goBack()}onSendTransaction(){this.approvalTransaction?n.SwapController.sendTransactionForApproval(this.approvalTransaction):n.SwapController.sendTransactionForSwap(this.swapTransaction)}};u.styles=l.default,c([(0,e.state)()],u.prototype,"interval",void 0),c([(0,e.state)()],u.prototype,"detailsOpen",void 0),c([(0,e.state)()],u.prototype,"approvalTransaction",void 0),c([(0,e.state)()],u.prototype,"swapTransaction",void 0),c([(0,e.state)()],u.prototype,"sourceToken",void 0),c([(0,e.state)()],u.prototype,"sourceTokenAmount",void 0),c([(0,e.state)()],u.prototype,"sourceTokenPriceInUSD",void 0),c([(0,e.state)()],u.prototype,"balanceSymbol",void 0),c([(0,e.state)()],u.prototype,"toToken",void 0),c([(0,e.state)()],u.prototype,"toTokenAmount",void 0),c([(0,e.state)()],u.prototype,"toTokenPriceInUSD",void 0),c([(0,e.state)()],u.prototype,"caipNetwork",void 0),c([(0,e.state)()],u.prototype,"inputError",void 0),c([(0,e.state)()],u.prototype,"loadingQuote",void 0),c([(0,e.state)()],u.prototype,"loadingApprovalTransaction",void 0),c([(0,e.state)()],u.prototype,"loadingBuildTransaction",void 0),c([(0,e.state)()],u.prototype,"loadingTransaction",void 0),u=c([(0,i.customElement)('w3m-swap-preview-view')],u)},3775,[2549,2575,2169,2164,2546,2683,2650,2658,2651,3785,3768,3776]);
__d(function(g,r,i,a,m,e,d){"use strict";Object.defineProperty(e,'__esModule',{value:!0}),Object.defineProperty(e,"default",{enumerable:!0,get:function(){return n}});var n=r(d[0]).css`
  :host > wui-flex:first-child {
    overflow-y: auto;
    overflow-x: hidden;
    scrollbar-width: none;
  }

  :host > wui-flex:first-child::-webkit-scrollbar {
    display: none;
  }

  .preview-container,
  .details-container {
    width: 100%;
  }

  .token-image {
    width: 24px;
    height: 24px;
    box-shadow: 0 0 0 2px ${({tokens:n})=>n.core.glass010};
    border-radius: 12px;
  }

  wui-loading-hexagon {
    position: absolute;
  }

  .token-item {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: ${({spacing:n})=>n[2]};
    padding: ${({spacing:n})=>n[2]};
    height: 40px;
    border: none;
    border-radius: 80px;
    background: ${({tokens:n})=>n.theme.foregroundPrimary};
    box-shadow: inset 0 0 0 1px ${({tokens:n})=>n.theme.foregroundPrimary};
    cursor: pointer;
    transition: background ${({durations:n})=>n.lg}
      ${({easings:n})=>n['ease-out-power-2']};
    will-change: background;
  }

  .token-item:hover {
    background: ${({tokens:n})=>n.core.glass010};
  }

  .preview-token-details-container {
    width: 100%;
  }

  .details-row {
    width: 100%;
    padding: ${({spacing:n})=>n[3]} ${({spacing:n})=>n[5]};
    border-radius: ${({borderRadius:n})=>n[3]};
    background: ${({tokens:n})=>n.theme.foregroundPrimary};
  }

  .action-buttons-container {
    width: 100%;
    gap: ${({spacing:n})=>n[2]};
  }

  .action-buttons-container > button {
    display: flex;
    align-items: center;
    justify-content: center;
    background: transparent;
    height: 48px;
    border-radius: ${({borderRadius:n})=>n[4]};
    border: none;
    box-shadow: inset 0 0 0 1px ${({tokens:n})=>n.core.glass010};
  }

  .action-buttons-container > button:disabled {
    opacity: 0.8;
    cursor: not-allowed;
  }

  .action-button > wui-loading-spinner {
    display: inline-block;
  }

  .cancel-button:hover,
  .action-button:hover {
    cursor: pointer;
  }

  .action-buttons-container > wui-button.cancel-button {
    flex: 2;
  }

  .action-buttons-container > wui-button.action-button {
    flex: 4;
  }

  .action-buttons-container > button.action-button > wui-text {
    color: white;
  }

  .details-container > wui-flex {
    background: ${({tokens:n})=>n.theme.foregroundPrimary};
    border-radius: ${({borderRadius:n})=>n[3]};
    width: 100%;
  }

  .details-container > wui-flex > button {
    border: none;
    background: none;
    padding: ${({spacing:n})=>n[3]};
    border-radius: ${({borderRadius:n})=>n[3]};
    transition: background ${({durations:n})=>n.lg}
      ${({easings:n})=>n['ease-out-power-2']};
    will-change: background;
  }

  .details-container > wui-flex > button:hover {
    background: ${({tokens:n})=>n.theme.foregroundPrimary};
  }

  .details-content-container {
    padding: ${({spacing:n})=>n[2]};
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .details-content-container > wui-flex {
    width: 100%;
  }

  .details-row {
    width: 100%;
    padding: ${({spacing:n})=>n[3]} ${({spacing:n})=>n[5]};
    border-radius: ${({borderRadius:n})=>n[3]};
    background: ${({tokens:n})=>n.theme.foregroundPrimary};
  }
`},3776,[2546]);
__d(function(g,_r,_i,_a,m,_e,_d){"use strict";Object.defineProperty(_e,'__esModule',{value:!0}),Object.defineProperty(_e,"W3mSwapSelectTokenView",{enumerable:!0,get:function(){return a}});var e=_r(_d[0]),t=_r(_d[1]),o=_r(_d[2]),s=_r(_d[3]);_r(_d[4]),_r(_d[5]),_r(_d[6]),_r(_d[7]),_r(_d[8]),_r(_d[9]),_r(_d[10]),_r(_d[11]);var n,i=_r(_d[12]),l=(n=i)&&n.__esModule?n:{default:n},r=this&&this.__decorate||function(e,t,o,s){var n,i=arguments.length,l=i<3?t:null===s?s=Object.getOwnPropertyDescriptor(t,o):s;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)l=Reflect.decorate(e,t,o,s);else for(var r=e.length-1;r>=0;r--)(n=e[r])&&(l=(i<3?n(l):i>3?n(t,o,l):n(t,o))||l);return i>3&&l&&Object.defineProperty(t,o,l),l};let a=class extends e.LitElement{constructor(){super(),this.unsubscribe=[],this.targetToken=o.RouterController.state.data?.target,this.sourceToken=o.SwapController.state.sourceToken,this.sourceTokenAmount=o.SwapController.state.sourceTokenAmount,this.toToken=o.SwapController.state.toToken,this.myTokensWithBalance=o.SwapController.state.myTokensWithBalance,this.popularTokens=o.SwapController.state.popularTokens,this.suggestedTokens=o.SwapController.state.suggestedTokens,this.tokensLoading=o.SwapController.state.tokensLoading,this.searchValue='',this.unsubscribe.push(o.SwapController.subscribe(e=>{this.sourceToken=e.sourceToken,this.toToken=e.toToken,this.myTokensWithBalance=e.myTokensWithBalance,this.popularTokens=e.popularTokens,this.suggestedTokens=e.suggestedTokens,this.tokensLoading=e.tokensLoading}))}async firstUpdated(){await o.SwapController.getTokenList()}updated(){const e=this.renderRoot?.querySelector('.suggested-tokens-container');e?.addEventListener('scroll',this.handleSuggestedTokensScroll.bind(this));const t=this.renderRoot?.querySelector('.tokens');t?.addEventListener('scroll',this.handleTokenListScroll.bind(this))}disconnectedCallback(){super.disconnectedCallback();const e=this.renderRoot?.querySelector('.suggested-tokens-container'),t=this.renderRoot?.querySelector('.tokens');e?.removeEventListener('scroll',this.handleSuggestedTokensScroll.bind(this)),t?.removeEventListener('scroll',this.handleTokenListScroll.bind(this)),clearInterval(this.interval)}render(){return e.html`
      <wui-flex flexDirection="column" gap="3">
        ${this.templateSearchInput()} ${this.templateSuggestedTokens()} ${this.templateTokens()}
      </wui-flex>
    `}onSelectToken(e){'sourceToken'===this.targetToken?o.SwapController.setSourceToken(e):(o.SwapController.setToToken(e),this.sourceToken&&this.sourceTokenAmount&&o.SwapController.swapTokens()),o.RouterController.goBack()}templateSearchInput(){return e.html`
      <wui-flex .padding=${['1','3','0','3']} gap="2">
        <wui-input-text
          data-testid="swap-select-token-search-input"
          class="network-search-input"
          size="sm"
          placeholder="Search token"
          icon="search"
          .value=${this.searchValue}
          @inputChange=${this.onSearchInputChange.bind(this)}
        ></wui-input-text>
      </wui-flex>
    `}templateMyTokens(){const t=this.myTokensWithBalance?Object.values(this.myTokensWithBalance):[],o=this.filterTokensWithText(t,this.searchValue);return o?.length>0?e.html`<wui-flex justifyContent="flex-start" padding="2">
          <wui-text variant="md-medium" color="secondary">Your tokens</wui-text>
        </wui-flex>
        ${o.map(t=>{const o=t.symbol===this.sourceToken?.symbol||t.symbol===this.toToken?.symbol;return e.html`
            <wui-token-list-item
              data-testid="swap-select-token-item-${t.symbol}"
              name=${t.name}
              ?disabled=${o}
              symbol=${t.symbol}
              price=${t?.price}
              amount=${t?.quantity?.numeric}
              imageSrc=${t.logoUri}
              @click=${()=>{o||this.onSelectToken(t)}}
            >
            </wui-token-list-item>
          `})}`:null}templateAllTokens(){const t=this.popularTokens?this.popularTokens:[],o=this.filterTokensWithText(t,this.searchValue);return this.tokensLoading?e.html`
        <wui-token-list-item-loader></wui-token-list-item-loader>
        <wui-token-list-item-loader></wui-token-list-item-loader>
        <wui-token-list-item-loader></wui-token-list-item-loader>
        <wui-token-list-item-loader></wui-token-list-item-loader>
        <wui-token-list-item-loader></wui-token-list-item-loader>
      `:o?.length>0?e.html`
        ${o.map(t=>e.html`
            <wui-token-list-item
              data-testid="swap-select-token-item-${t.symbol}"
              name=${t.name}
              symbol=${t.symbol}
              imageSrc=${t.logoUri}
              @click=${()=>this.onSelectToken(t)}
            >
            </wui-token-list-item>
          `)}
      `:null}templateTokens(){return e.html`
      <wui-flex class="tokens-container">
        <wui-flex class="tokens" .padding=${['0','2','2','2']} flexDirection="column">
          ${this.templateMyTokens()}
          <wui-flex justifyContent="flex-start" padding="3">
            <wui-text variant="md-medium" color="secondary">Tokens</wui-text>
          </wui-flex>
          ${this.templateAllTokens()}
        </wui-flex>
      </wui-flex>
    `}templateSuggestedTokens(){const t=this.suggestedTokens?this.suggestedTokens.slice(0,8):null;return this.tokensLoading?e.html`
        <wui-flex
          class="suggested-tokens-container"
          .padding=${['0','3','0','3']}
          gap="2"
        >
          <wui-token-button loading></wui-token-button>
          <wui-token-button loading></wui-token-button>
          <wui-token-button loading></wui-token-button>
          <wui-token-button loading></wui-token-button>
          <wui-token-button loading></wui-token-button>
        </wui-flex>
      `:t?e.html`
      <wui-flex
        class="suggested-tokens-container"
        .padding=${['0','3','0','3']}
        gap="2"
      >
        ${t.map(t=>e.html`
            <wui-token-button
              text=${t.symbol}
              imageSrc=${t.logoUri}
              @click=${()=>this.onSelectToken(t)}
            >
            </wui-token-button>
          `)}
      </wui-flex>
    `:null}onSearchInputChange(e){this.searchValue=e.detail}handleSuggestedTokensScroll(){const e=this.renderRoot?.querySelector('.suggested-tokens-container');e&&(e.style.setProperty('--suggested-tokens-scroll--left-opacity',s.MathUtil.interpolate([0,100],[0,1],e.scrollLeft).toString()),e.style.setProperty('--suggested-tokens-scroll--right-opacity',s.MathUtil.interpolate([0,100],[0,1],e.scrollWidth-e.scrollLeft-e.offsetWidth).toString()))}handleTokenListScroll(){const e=this.renderRoot?.querySelector('.tokens');e&&(e.style.setProperty('--tokens-scroll--top-opacity',s.MathUtil.interpolate([0,100],[0,1],e.scrollTop).toString()),e.style.setProperty('--tokens-scroll--bottom-opacity',s.MathUtil.interpolate([0,100],[0,1],e.scrollHeight-e.scrollTop-e.offsetHeight).toString()))}filterTokensWithText(e,t){return e.filter(e=>`${e.symbol} ${e.name} ${e.address}`.toLowerCase().includes(t.toLowerCase())).sort((e,o)=>{const s=`${e.symbol} ${e.name} ${e.address}`.toLowerCase(),n=`${o.symbol} ${o.name} ${o.address}`.toLowerCase();return s.indexOf(t.toLowerCase())-n.indexOf(t.toLowerCase())})}};a.styles=l.default,r([(0,t.state)()],a.prototype,"interval",void 0),r([(0,t.state)()],a.prototype,"targetToken",void 0),r([(0,t.state)()],a.prototype,"sourceToken",void 0),r([(0,t.state)()],a.prototype,"sourceTokenAmount",void 0),r([(0,t.state)()],a.prototype,"toToken",void 0),r([(0,t.state)()],a.prototype,"myTokensWithBalance",void 0),r([(0,t.state)()],a.prototype,"popularTokens",void 0),r([(0,t.state)()],a.prototype,"suggestedTokens",void 0),r([(0,t.state)()],a.prototype,"tokensLoading",void 0),r([(0,t.state)()],a.prototype,"searchValue",void 0),a=r([(0,s.customElement)('w3m-swap-select-token-view')],a)},3777,[2549,2575,2164,2546,2683,2650,2658,2914,2651,3785,3778,3781,3784]);
__d(function(g,r,i,a,m,e,d){"use strict";Object.defineProperty(e,'__esModule',{value:!0});var t=r(d[0]);Object.keys(t).forEach(function(n){'default'===n||Object.prototype.hasOwnProperty.call(e,n)||Object.defineProperty(e,n,{enumerable:!0,get:function(){return t[n]}})})},3778,[3779]);
__d(function(g,_r,_i,a,m,_e,_d){"use strict";Object.defineProperty(_e,'__esModule',{value:!0}),Object.defineProperty(_e,"WuiTokenListItem",{enumerable:!0,get:function(){return c}});var e=_r(_d[0]),t=_r(_d[1]),i=_r(_d[2]);_r(_d[3]),_r(_d[4]),_r(_d[5]);var r,o=_r(_d[6]),s=_r(_d[7]),l=_r(_d[8]),n=(r=l)&&r.__esModule?r:{default:r},u=this&&this.__decorate||function(e,t,i,r){var o,s=arguments.length,l=s<3?t:null===r?r=Object.getOwnPropertyDescriptor(t,i):r;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)l=Reflect.decorate(e,t,i,r);else for(var n=e.length-1;n>=0;n--)(o=e[n])&&(l=(s<3?o(l):s>3?o(t,i,l):o(t,i))||l);return s>3&&l&&Object.defineProperty(t,i,l),l};let c=class extends e.LitElement{constructor(){super(),this.observer=new IntersectionObserver(()=>{}),this.imageSrc=void 0,this.name=void 0,this.symbol=void 0,this.price=void 0,this.amount=void 0,this.visible=!1,this.imageError=!1,this.observer=new IntersectionObserver(e=>{e.forEach(e=>{e.isIntersecting?this.visible=!0:this.visible=!1})},{threshold:.1})}firstUpdated(){this.observer.observe(this)}disconnectedCallback(){this.observer.disconnect()}render(){if(!this.visible)return null;const t=this.amount&&this.price?i.NumberUtil.multiply(this.price,this.amount)?.toFixed(3):null;return e.html`
      <wui-flex alignItems="center">
        ${this.visualTemplate()}
        <wui-flex flexDirection="column" gap="1">
          <wui-flex justifyContent="space-between">
            <wui-text variant="md-medium" color="primary" lineClamp="1">${this.name}</wui-text>
            ${t?e.html`
                  <wui-text variant="md-medium" color="primary">
                    $${i.NumberUtil.formatNumberToLocalString(t,3)}
                  </wui-text>
                `:null}
          </wui-flex>
          <wui-flex justifyContent="space-between">
            <wui-text variant="sm-regular" color="secondary" lineClamp="1">${this.symbol}</wui-text>
            ${this.amount?e.html`<wui-text variant="sm-regular" color="secondary">
                  ${i.NumberUtil.formatNumberToLocalString(this.amount,5)}
                </wui-text>`:null}
          </wui-flex>
        </wui-flex>
      </wui-flex>
    `}visualTemplate(){return this.imageError?e.html`<wui-flex class="token-item-image-placeholder">
        <wui-icon name="image" color="inherit"></wui-icon>
      </wui-flex>`:this.imageSrc?e.html`<wui-image
        width="40"
        height="40"
        src=${this.imageSrc}
        @onLoadError=${this.imageLoadError}
      ></wui-image>`:null}imageLoadError(){this.imageError=!0}};c.styles=[o.resetStyles,o.elementStyles,n.default],u([(0,t.property)()],c.prototype,"imageSrc",void 0),u([(0,t.property)()],c.prototype,"name",void 0),u([(0,t.property)()],c.prototype,"symbol",void 0),u([(0,t.property)()],c.prototype,"price",void 0),u([(0,t.property)()],c.prototype,"amount",void 0),u([(0,t.state)()],c.prototype,"visible",void 0),u([(0,t.state)()],c.prototype,"imageError",void 0),c=u([(0,s.customElement)('wui-token-list-item')],c)},3779,[2549,2575,2169,2620,2624,2629,2548,2559,3780]);
__d(function(g,r,i,a,m,e,d){"use strict";Object.defineProperty(e,'__esModule',{value:!0}),Object.defineProperty(e,"default",{enumerable:!0,get:function(){return o}});var o=r(d[0]).css`
  :host {
    width: 100%;
    height: 60px;
    min-height: 60px;
  }

  :host > wui-flex {
    cursor: pointer;
    height: 100%;
    display: flex;
    column-gap: ${({spacing:o})=>o[3]};
    padding: ${({spacing:o})=>o[2]};
    padding-right: ${({spacing:o})=>o[4]};
    width: 100%;
    background-color: transparent;
    border-radius: ${({borderRadius:o})=>o[4]};
    color: ${({tokens:o})=>o.theme.foregroundSecondary};
    transition:
      background-color ${({durations:o})=>o.lg}
        ${({easings:o})=>o['ease-out-power-2']},
      opacity ${({durations:o})=>o.lg} ${({easings:o})=>o['ease-out-power-2']};
    will-change: background-color, opacity;
  }

  @media (hover: hover) and (pointer: fine) {
    :host > wui-flex:hover {
      background-color: ${({tokens:o})=>o.theme.foregroundPrimary};
    }

    :host > wui-flex:active {
      background-color: ${({tokens:o})=>o.core.glass010};
    }
  }

  :host([disabled]) > wui-flex {
    opacity: 0.6;
  }

  :host([disabled]) > wui-flex:hover {
    background-color: transparent;
  }

  :host > wui-flex > wui-flex {
    flex: 1;
  }

  :host > wui-flex > wui-image,
  :host > wui-flex > .token-item-image-placeholder {
    width: 40px;
    max-width: 40px;
    height: 40px;
    border-radius: ${({borderRadius:o})=>o[20]};
    position: relative;
  }

  :host > wui-flex > .token-item-image-placeholder {
    display: flex;
    align-items: center;
    justify-content: center;
  }

  :host > wui-flex > wui-image::after,
  :host > wui-flex > .token-item-image-placeholder::after {
    position: absolute;
    content: '';
    inset: 0;
    box-shadow: inset 0 0 0 1px ${({tokens:o})=>o.core.glass010};
    border-radius: ${({borderRadius:o})=>o[8]};
  }

  button > wui-icon-box[data-variant='square-blue'] {
    border-radius: ${({borderRadius:o})=>o[2]};
    position: relative;
    border: none;
    width: 36px;
    height: 36px;
  }
`},3780,[2555]);
__d(function(g,r,i,a,m,e,d){"use strict";Object.defineProperty(e,'__esModule',{value:!0});var t=r(d[0]);Object.keys(t).forEach(function(n){'default'===n||Object.prototype.hasOwnProperty.call(e,n)||Object.defineProperty(e,n,{enumerable:!0,get:function(){return t[n]}})})},3781,[3782]);
__d(function(g,_r,_i,a,m,_e,_d){"use strict";Object.defineProperty(_e,'__esModule',{value:!0}),Object.defineProperty(_e,"WuiTokenListItemLoader",{enumerable:!0,get:function(){return n}});var e=_r(_d[0]);_r(_d[1]),_r(_d[2]);var t,i=_r(_d[3]),r=_r(_d[4]),u=_r(_d[5]),s=(t=u)&&t.__esModule?t:{default:t},l=this&&this.__decorate||function(e,t,i,r){var u,s=arguments.length,l=s<3?t:null===r?r=Object.getOwnPropertyDescriptor(t,i):r;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)l=Reflect.decorate(e,t,i,r);else for(var n=e.length-1;n>=0;n--)(u=e[n])&&(l=(s<3?u(l):s>3?u(t,i,l):u(t,i))||l);return s>3&&l&&Object.defineProperty(t,i,l),l};let n=class extends e.LitElement{render(){return e.html`
      <wui-flex alignItems="center">
        <wui-shimmer width="40px" height="40px"></wui-shimmer>
        <wui-flex flexDirection="column" gap="1">
          <wui-shimmer width="72px" height="16px" borderRadius="4xs"></wui-shimmer>
          <wui-shimmer width="148px" height="14px" borderRadius="4xs"></wui-shimmer>
        </wui-flex>
        <wui-flex flexDirection="column" gap="1" alignItems="flex-end">
          <wui-shimmer width="24px" height="12px" borderRadius="4xs"></wui-shimmer>
          <wui-shimmer width="32px" height="12px" borderRadius="4xs"></wui-shimmer>
        </wui-flex>
      </wui-flex>
    `}};n.styles=[i.resetStyles,s.default],n=l([(0,r.customElement)('wui-token-list-item-loader')],n)},3782,[2549,2714,2629,2548,2559,3783]);
__d(function(g,r,i,a,m,e,d){"use strict";Object.defineProperty(e,'__esModule',{value:!0}),Object.defineProperty(e,"default",{enumerable:!0,get:function(){return t}});var t=r(d[0]).css`
  :host {
    width: 100%;
  }

  :host > wui-flex {
    cursor: pointer;
    height: 100%;
    width: 100%;
    display: flex;
    column-gap: ${({spacing:t})=>t[3]};
    padding: ${({spacing:t})=>t[2]};
    padding-right: ${({spacing:t})=>t[4]};
  }

  wui-flex {
    display: flex;
    flex: 1;
  }
`},3783,[2555]);
__d(function(g,r,i,a,m,e,d){"use strict";Object.defineProperty(e,'__esModule',{value:!0}),Object.defineProperty(e,"default",{enumerable:!0,get:function(){return o}});var o=r(d[0]).css`
  :host {
    --tokens-scroll--top-opacity: 0;
    --tokens-scroll--bottom-opacity: 1;
    --suggested-tokens-scroll--left-opacity: 0;
    --suggested-tokens-scroll--right-opacity: 1;
  }

  :host > wui-flex:first-child {
    overflow-y: hidden;
    overflow-x: hidden;
    scrollbar-width: none;
    scrollbar-height: none;
  }

  :host > wui-flex:first-child::-webkit-scrollbar {
    display: none;
  }

  wui-loading-hexagon {
    position: absolute;
  }

  .suggested-tokens-container {
    overflow-x: auto;
    mask-image: linear-gradient(
      to right,
      rgba(0, 0, 0, calc(1 - var(--suggested-tokens-scroll--left-opacity))) 0px,
      rgba(200, 200, 200, calc(1 - var(--suggested-tokens-scroll--left-opacity))) 1px,
      black 50px,
      black 90px,
      black calc(100% - 90px),
      black calc(100% - 50px),
      rgba(155, 155, 155, calc(1 - var(--suggested-tokens-scroll--right-opacity))) calc(100% - 1px),
      rgba(0, 0, 0, calc(1 - var(--suggested-tokens-scroll--right-opacity))) 100%
    );
  }

  .suggested-tokens-container::-webkit-scrollbar {
    display: none;
  }

  .tokens-container {
    border-top: 1px solid ${({tokens:o})=>o.core.glass010};
    height: 100%;
    max-height: 390px;
  }

  .tokens {
    width: 100%;
    overflow-y: auto;
    mask-image: linear-gradient(
      to bottom,
      rgba(0, 0, 0, calc(1 - var(--tokens-scroll--top-opacity))) 0px,
      rgba(200, 200, 200, calc(1 - var(--tokens-scroll--top-opacity))) 1px,
      black 50px,
      black 90px,
      black calc(100% - 90px),
      black calc(100% - 50px),
      rgba(155, 155, 155, calc(1 - var(--tokens-scroll--bottom-opacity))) calc(100% - 1px),
      rgba(0, 0, 0, calc(1 - var(--tokens-scroll--bottom-opacity))) 100%
    );
  }

  .network-search-input,
  .select-network-button {
    height: 40px;
  }

  .select-network-button {
    border: none;
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: center;
    gap: ${({spacing:o})=>o[2]};
    box-shadow: inset 0 0 0 1px ${({tokens:o})=>o.core.glass010};
    background-color: transparent;
    border-radius: ${({borderRadius:o})=>o[3]};
    padding: ${({spacing:o})=>o[2]};
    align-items: center;
    transition: background-color ${({durations:o})=>o.lg}
      ${({easings:o})=>o['ease-out-power-2']};
    will-change: background-color;
  }

  .select-network-button:hover {
    background-color: ${({tokens:o})=>o.theme.foregroundPrimary};
  }

  .select-network-button > wui-image {
    width: 26px;
    height: 26px;
    border-radius: ${({borderRadius:o})=>o[4]};
    box-shadow: inset 0 0 0 1px ${({tokens:o})=>o.core.glass010};
  }
`},3784,[2546]);