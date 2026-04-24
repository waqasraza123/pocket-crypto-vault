__d(function(g,r,i,a,m,e,d){"use strict";Object.defineProperty(e,'__esModule',{value:!0});var t=r(d[0]);Object.keys(t).forEach(function(n){'default'===n||Object.prototype.hasOwnProperty.call(e,n)||Object.defineProperty(e,n,{enumerable:!0,get:function(){return t[n]}})});var n=r(d[1]);Object.keys(n).forEach(function(t){'default'===t||Object.prototype.hasOwnProperty.call(e,t)||Object.defineProperty(e,t,{enumerable:!0,get:function(){return n[t]}})})},3672,[3827,3833]);
__d(function(g,_r,_i,a,m,_e,_d){"use strict";Object.defineProperty(_e,'__esModule',{value:!0}),Object.defineProperty(_e,"W3mDepositFromExchangeView",{enumerable:!0,get:function(){return u}});var e=_r(_d[0]),t=_r(_d[1]),n=_r(_d[2]),s=_r(_d[3]),o=_r(_d[4]);_r(_d[5]),_r(_d[6]),_r(_d[7]),_r(_d[8]),_r(_d[9]),_r(_d[10]),_r(_d[11]),_r(_d[12]);var i,r=_r(_d[13]),l=(i=r)&&i.__esModule?i:{default:i},c=this&&this.__decorate||function(e,t,n,s){var o,i=arguments.length,r=i<3?t:null===s?s=Object.getOwnPropertyDescriptor(t,n):s;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)r=Reflect.decorate(e,t,n,s);else for(var l=e.length-1;l>=0;l--)(o=e[l])&&(r=(i<3?o(r):i>3?o(t,n,r):o(t,n))||r);return i>3&&r&&Object.defineProperty(t,n,r),r};const h=[10,50,100];let u=class extends e.LitElement{constructor(){super(),this.unsubscribe=[],this.network=s.ChainController.state.activeCaipNetwork,this.exchanges=s.ExchangeController.state.exchanges,this.isLoading=s.ExchangeController.state.isLoading,this.amount=s.ExchangeController.state.amount,this.tokenAmount=s.ExchangeController.state.tokenAmount,this.priceLoading=s.ExchangeController.state.priceLoading,this.isPaymentInProgress=s.ExchangeController.state.isPaymentInProgress,this.currentPayment=s.ExchangeController.state.currentPayment,this.paymentId=s.ExchangeController.state.paymentId,this.paymentAsset=s.ExchangeController.state.paymentAsset,this.unsubscribe.push(s.ChainController.subscribeKey('activeCaipNetwork',e=>{this.network=e,this.setDefaultPaymentAsset()}),s.ExchangeController.subscribe(e=>{this.exchanges=e.exchanges,this.isLoading=e.isLoading,this.amount=e.amount,this.tokenAmount=e.tokenAmount,this.priceLoading=e.priceLoading,this.paymentId=e.paymentId,this.isPaymentInProgress=e.isPaymentInProgress,this.currentPayment=e.currentPayment,this.paymentAsset=e.paymentAsset;e.isPaymentInProgress&&e.currentPayment?.exchangeId&&e.currentPayment?.sessionId&&e.paymentId&&this.handlePaymentInProgress()}))}disconnectedCallback(){this.unsubscribe.forEach(e=>e());s.ExchangeController.state.isPaymentInProgress||s.ExchangeController.reset()}async firstUpdated(){await this.getPaymentAssets(),this.paymentAsset||await this.setDefaultPaymentAsset(),s.ExchangeController.setAmount(h[0]),await s.ExchangeController.fetchExchanges()}render(){return e.html`
      <wui-flex flexDirection="column" class="container">
        ${this.amountInputTemplate()} ${this.exchangesTemplate()}
      </wui-flex>
    `}exchangesLoadingTemplate(){return Array.from({length:2}).map(()=>e.html`<wui-shimmer width="100%" height="65px" borderRadius="xxs"></wui-shimmer>`)}_exchangesTemplate(){return this.exchanges.length>0?this.exchanges.map(t=>e.html`<wui-list-item
              @click=${()=>this.onExchangeClick(t)}
              chevron
              variant="image"
              imageSrc=${t.imageUrl}
              ?loading=${this.isLoading}
            >
              <wui-text variant="md-regular" color="primary">
                Deposit from ${t.name}
              </wui-text>
            </wui-list-item>`):e.html`<wui-flex flexDirection="column" alignItems="center" gap="4" padding="4">
          <wui-text variant="lg-medium" align="center" color="primary">
            No exchanges support this asset on this network
          </wui-text>
        </wui-flex>`}exchangesTemplate(){return e.html`<wui-flex
      flexDirection="column"
      gap="2"
      .padding=${['3','3','3','3']}
      class="exchanges-container"
    >
      ${this.isLoading?this.exchangesLoadingTemplate():this._exchangesTemplate()}
    </wui-flex>`}amountInputTemplate(){return e.html`
      <wui-flex
        flexDirection="column"
        .padding=${['0','3','3','3']}
        class="amount-input-container"
      >
        <wui-flex
          justifyContent="space-between"
          alignItems="center"
          .margin=${['0','0','6','0']}
        >
          <wui-text variant="md-medium" color="secondary">Asset</wui-text>
          <wui-token-button
            data-testid="deposit-from-exchange-asset-button"
            flexDirection="row-reverse"
            text=${this.paymentAsset?.metadata.symbol||''}
            imageSrc=${this.paymentAsset?.metadata.iconUrl||''}
            @click=${()=>s.RouterController.push('PayWithExchangeSelectAsset')}
            size="lg"
            .chainImageSrc=${(0,n.ifDefined)(s.AssetUtil.getNetworkImage(this.network))}
          >
          </wui-token-button>
        </wui-flex>
        <wui-flex
          flexDirection="column"
          alignItems="center"
          justifyContent="center"
          .margin=${['0','0','4','0']}
        >
          <w3m-fund-input
            @inputChange=${this.onAmountChange.bind(this)}
            .amount=${this.amount}
            .maxDecimals=${6}
            .maxIntegers=${10}
          >
          </w3m-fund-input>
          ${this.tokenAmountTemplate()}
        </wui-flex>
        <wui-flex justifyContent="center" gap="2">
          ${h.map(t=>e.html`<wui-chip-button
                @click=${()=>s.ExchangeController.setAmount(t)}
                type="neutral"
                size="lg"
                text=${`$${t}`}
              ></wui-chip-button>`)}
        </wui-flex>
      </wui-flex>
    `}tokenAmountTemplate(){return this.priceLoading?e.html`<wui-shimmer
        width="65px"
        height="20px"
        borderRadius="xxs"
        variant="light"
      ></wui-shimmer>`:e.html`
      <wui-text variant="md-regular" color="secondary">
        ${this.tokenAmount.toFixed(4)} ${this.paymentAsset?.metadata.symbol}
      </wui-text>
    `}async onExchangeClick(e){this.amount?await s.ExchangeController.handlePayWithExchange(e.id):s.SnackController.showError('Please enter an amount')}handlePaymentInProgress(){const e=s.ChainController.state.activeChain,{redirectView:t="Account"}=s.RouterController.state.data??{};this.isPaymentInProgress&&this.currentPayment?.exchangeId&&this.currentPayment?.sessionId&&this.paymentId&&(s.ExchangeController.waitUntilComplete({exchangeId:this.currentPayment.exchangeId,sessionId:this.currentPayment.sessionId,paymentId:this.paymentId}).then(t=>{'SUCCESS'===t.status?(s.SnackController.showSuccess('Deposit completed'),s.ExchangeController.reset(),e&&(s.ChainController.fetchTokenBalance(),s.ConnectionController.updateBalance(e)),s.RouterController.replace('Transactions')):'FAILED'===t.status&&s.SnackController.showError('Deposit failed')}),s.SnackController.showLoading('Deposit in progress...'),s.RouterController.replace(t))}onAmountChange({detail:e}){s.ExchangeController.setAmount(e?Number(e):null)}async getPaymentAssets(){this.network&&await s.ExchangeController.getAssetsForNetwork(this.network.caipNetworkId)}async setDefaultPaymentAsset(){if(this.network){const e=await s.ExchangeController.getAssetsForNetwork(this.network.caipNetworkId);e[0]&&s.ExchangeController.setPaymentAsset(e[0])}}};u.styles=l.default,c([(0,t.state)()],u.prototype,"network",void 0),c([(0,t.state)()],u.prototype,"exchanges",void 0),c([(0,t.state)()],u.prototype,"isLoading",void 0),c([(0,t.state)()],u.prototype,"amount",void 0),c([(0,t.state)()],u.prototype,"tokenAmount",void 0),c([(0,t.state)()],u.prototype,"priceLoading",void 0),c([(0,t.state)()],u.prototype,"isPaymentInProgress",void 0),c([(0,t.state)()],u.prototype,"currentPayment",void 0),c([(0,t.state)()],u.prototype,"paymentId",void 0),c([(0,t.state)()],u.prototype,"paymentAsset",void 0),u=c([(0,o.customElement)('w3m-deposit-from-exchange-view')],u)},3827,[2549,2575,2586,2164,2546,3828,2650,2669,3826,2672,2773,2651,3831,3832]);
__d(function(g,r,i,a,m,e,d){"use strict";Object.defineProperty(e,'__esModule',{value:!0});var t=r(d[0]);Object.keys(t).forEach(function(n){'default'===n||Object.prototype.hasOwnProperty.call(e,n)||Object.defineProperty(e,n,{enumerable:!0,get:function(){return t[n]}})})},3828,[3829]);
__d(function(g,_r,_i,a,m,_e,_d){"use strict";Object.defineProperty(_e,'__esModule',{value:!0}),Object.defineProperty(_e,"WuiChipButton",{enumerable:!0,get:function(){return p}});var t=_r(_d[0]),e=_r(_d[1]);_r(_d[2]),_r(_d[3]),_r(_d[4]);var i,r=_r(_d[5]),o=_r(_d[6]),n=_r(_d[7]),s=(i=n)&&i.__esModule?i:{default:i},l=this&&this.__decorate||function(t,e,i,r){var o,n=arguments.length,s=n<3?e:null===r?r=Object.getOwnPropertyDescriptor(e,i):r;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)s=Reflect.decorate(t,e,i,r);else for(var l=t.length-1;l>=0;l--)(o=t[l])&&(s=(n<3?o(s):n>3?o(e,i,s):o(e,i))||s);return n>3&&s&&Object.defineProperty(e,i,s),s};const c={sm:'sm-regular',md:'md-regular',lg:'lg-regular'};let p=class extends t.LitElement{constructor(){super(...arguments),this.type='accent',this.size='md',this.imageSrc='',this.disabled=!1,this.leftIcon=void 0,this.rightIcon=void 0,this.text=''}render(){return t.html`
      <button ?disabled=${this.disabled} data-type=${this.type} data-size=${this.size}>
        ${this.imageSrc?t.html`<wui-image src=${this.imageSrc}></wui-image>`:null}
        ${this.leftIcon?t.html`<wui-icon name=${this.leftIcon} color="inherit" size="inherit"></wui-icon>`:null}
        <wui-text variant=${c[this.size]} color="inherit">${this.text}</wui-text>
        ${this.rightIcon?t.html`<wui-icon name=${this.rightIcon} color="inherit" size="inherit"></wui-icon>`:null}
      </button>
    `}};p.styles=[r.resetStyles,r.elementStyles,s.default],l([(0,e.property)()],p.prototype,"type",void 0),l([(0,e.property)()],p.prototype,"size",void 0),l([(0,e.property)()],p.prototype,"imageSrc",void 0),l([(0,e.property)({type:Boolean})],p.prototype,"disabled",void 0),l([(0,e.property)()],p.prototype,"leftIcon",void 0),l([(0,e.property)()],p.prototype,"rightIcon",void 0),l([(0,e.property)()],p.prototype,"text",void 0),p=l([(0,o.customElement)('wui-chip-button')],p)},3829,[2549,2575,2590,2620,2624,2548,2559,3830]);
__d(function(g,r,i,a,m,e,d){"use strict";Object.defineProperty(e,'__esModule',{value:!0}),Object.defineProperty(e,"default",{enumerable:!0,get:function(){return t}});var t=r(d[0]).css`
  button {
    border: none;
    border-radius: ${({borderRadius:t})=>t[20]};
    display: flex;
    flex-direction: row;
    align-items: center;
    padding: ${({spacing:t})=>t[1]};
    transition:
      background-color ${({durations:t})=>t.lg}
        ${({easings:t})=>t['ease-out-power-2']},
      box-shadow ${({durations:t})=>t.lg}
        ${({easings:t})=>t['ease-out-power-2']};
    will-change: background-color, box-shadow;
  }

  /* -- Variants --------------------------------------------------------------- */
  button[data-type='accent'] {
    background-color: ${({tokens:t})=>t.core.backgroundAccentPrimary};
    color: ${({tokens:t})=>t.theme.textPrimary};
  }

  button[data-type='neutral'] {
    background-color: ${({tokens:t})=>t.theme.foregroundSecondary};
    color: ${({tokens:t})=>t.theme.textPrimary};
  }

  /* -- Sizes --------------------------------------------------------------- */
  button[data-size='sm'] {
    height: 24px;
  }

  button[data-size='md'] {
    height: 28px;
  }

  button[data-size='lg'] {
    height: 32px;
  }

  button[data-size='sm'] > wui-image,
  button[data-size='sm'] > wui-icon {
    width: 16px;
    height: 16px;
  }

  button[data-size='md'] > wui-image,
  button[data-size='md'] > wui-icon {
    width: 20px;
    height: 20px;
  }

  button[data-size='lg'] > wui-image,
  button[data-size='lg'] > wui-icon {
    width: 24px;
    height: 24px;
  }

  wui-text {
    padding-left: ${({spacing:t})=>t[1]};
    padding-right: ${({spacing:t})=>t[1]};
  }

  wui-image {
    border-radius: ${({borderRadius:t})=>t[3]};
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
    button[data-type='accent']:not(:disabled):hover {
      background-color: ${({tokens:t})=>t.core.foregroundAccent060};
    }

    button[data-type='neutral']:not(:disabled):hover {
      background-color: ${({tokens:t})=>t.theme.foregroundTertiary};
    }
  }

  button[data-type='accent']:not(:disabled):focus-visible,
  button[data-type='accent']:not(:disabled):active {
    box-shadow: 0 0 0 4px ${({tokens:t})=>t.core.foregroundAccent020};
  }

  button[data-type='neutral']:not(:disabled):focus-visible,
  button[data-type='neutral']:not(:disabled):active {
    box-shadow: 0 0 0 4px ${({tokens:t})=>t.core.foregroundAccent020};
  }

  button:disabled {
    opacity: 0.5;
  }
`},3830,[2555]);
__d(function(g,_r,_i,a,m,e,_d){"use strict";Object.defineProperty(e,'__esModule',{value:!0}),Object.defineProperty(e,"W3mFundInput",{enumerable:!0,get:function(){return u}});var t=_r(_d[0]),r=_r(_d[1]),i=_r(_d[2]),n=_r(_d[3]);_r(_d[4]),_r(_d[5]),_r(_d[6]),_r(_d[7]),_r(_d[8]);var o=this&&this.__decorate||function(t,r,i,n){var o,u=arguments.length,s=u<3?r:null===n?n=Object.getOwnPropertyDescriptor(r,i):n;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)s=Reflect.decorate(t,r,i,n);else for(var c=t.length-1;c>=0;c--)(o=t[c])&&(s=(u<3?o(s):u>3?o(r,i,s):o(r,i))||s);return u>3&&s&&Object.defineProperty(r,i,s),s};let u=class extends t.LitElement{constructor(){super(...arguments),this.maxDecimals=void 0,this.maxIntegers=void 0}render(){return t.html`
      <wui-flex alignItems="center" gap="1">
        <wui-input-amount
          widthVariant="fit"
          fontSize="h2"
          .maxDecimals=${(0,i.ifDefined)(this.maxDecimals)}
          .maxIntegers=${(0,i.ifDefined)(this.maxIntegers)}
          .value=${this.amount?String(this.amount):''}
        ></wui-input-amount>
        <wui-text variant="md-regular" color="secondary">USD</wui-text>
      </wui-flex>
    `}};o([(0,r.property)({type:Number})],u.prototype,"amount",void 0),o([(0,r.property)({type:Number})],u.prototype,"maxDecimals",void 0),o([(0,r.property)({type:Number})],u.prototype,"maxIntegers",void 0),u=o([(0,n.customElement)('w3m-fund-input')],u)},3831,[2549,2575,2586,2546,2683,2650,3806,2659,2651]);
__d(function(g,r,i,a,m,e,d){"use strict";Object.defineProperty(e,'__esModule',{value:!0}),Object.defineProperty(e,"default",{enumerable:!0,get:function(){return o}});var o=r(d[0]).css`
  .amount-input-container {
    border-radius: ${({borderRadius:o})=>o[6]};
    border-top-right-radius: 0;
    border-top-left-radius: 0;
    background-color: ${({tokens:o})=>o.theme.foregroundPrimary};
    padding: ${({spacing:o})=>o[1]};
  }

  .container {
    border-radius: 30px;
  }
`},3832,[2546]);
__d(function(g,_r,_i,a,m,_e,_d){"use strict";Object.defineProperty(_e,'__esModule',{value:!0}),Object.defineProperty(_e,"W3mDepositFromExchangeSelectAssetView",{enumerable:!0,get:function(){return c}});var e=_r(_d[0]),t=_r(_d[1]),i=_r(_d[2]),n=_r(_d[3]);_r(_d[4]),_r(_d[5]),_r(_d[6]),_r(_d[7]),_r(_d[8]),_r(_d[9]),_r(_d[10]),_r(_d[11]);var o,s=_r(_d[12]),r=(o=s)&&o.__esModule?o:{default:o},l=this&&this.__decorate||function(e,t,i,n){var o,s=arguments.length,r=s<3?t:null===n?n=Object.getOwnPropertyDescriptor(t,i):n;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)r=Reflect.decorate(e,t,i,n);else for(var l=e.length-1;l>=0;l--)(o=e[l])&&(r=(s<3?o(r):s>3?o(t,i,r):o(t,i))||r);return s>3&&r&&Object.defineProperty(t,i,r),r};let c=class extends e.LitElement{constructor(){super(),this.unsubscribe=[],this.assets=i.ExchangeController.state.assets,this.search='',this.onDebouncedSearch=i.CoreHelperUtil.debounce(e=>{this.search=e}),this.unsubscribe.push(i.ExchangeController.subscribe(e=>{this.assets=e.assets}))}disconnectedCallback(){this.unsubscribe.forEach(e=>e())}render(){return e.html`
      <wui-flex flexDirection="column">
        ${this.templateSearchInput()} <wui-separator></wui-separator> ${this.templateTokens()}
      </wui-flex>
    `}templateSearchInput(){return e.html`
      <wui-flex gap="2" padding="3">
        <wui-input-text
          @inputChange=${this.onInputChange.bind(this)}
          class="network-search-input"
          size="sm"
          placeholder="Search token"
          icon="search"
        ></wui-input-text>
      </wui-flex>
    `}templateTokens(){const t=this.assets.filter(e=>e.metadata.name.toLowerCase().includes(this.search.toLowerCase())),i=t.length>0;return e.html`
      <wui-flex
        class="contentContainer"
        flexDirection="column"
        .padding=${['0','3','0','3']}
      >
        <wui-flex justifyContent="flex-start" .padding=${['4','3','3','3']}>
          <wui-text variant="md-medium" color="secondary">Available tokens</wui-text>
        </wui-flex>
        <wui-flex flexDirection="column" gap="2">
          ${i?t.map(t=>e.html`<wui-list-item
                    .imageSrc=${t.metadata.iconUrl}
                    ?clickable=${!0}
                    @click=${this.handleTokenClick.bind(this,t)}
                  >
                    <wui-text variant="md-medium" color="primary">${t.metadata.name}</wui-text>
                    <wui-text variant="md-regular" color="secondary"
                      >${t.metadata.symbol}</wui-text
                    >
                  </wui-list-item>`):e.html`<wui-flex
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
                >
                  <wui-text variant="lg-medium" align="center" color="primary">
                    No tokens found
                  </wui-text>
                </wui-flex>
                <wui-link @click=${this.onBuyClick.bind(this)}>Buy</wui-link>
              </wui-flex>`}
        </wui-flex>
      </wui-flex>
    `}onBuyClick(){i.RouterController.push('OnRampProviders')}onInputChange(e){this.onDebouncedSearch(e.detail)}handleTokenClick(e){i.ExchangeController.setPaymentAsset(e),i.RouterController.goBack()}};c.styles=r.default,l([(0,t.state)()],c.prototype,"assets",void 0),l([(0,t.state)()],c.prototype,"search",void 0),c=l([(0,n.customElement)('w3m-deposit-from-exchange-select-asset-view')],c)},3833,[2549,2575,2164,2546,2650,2658,2705,2914,2659,2725,2743,2651,3834]);
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
`},3834,[2546]);