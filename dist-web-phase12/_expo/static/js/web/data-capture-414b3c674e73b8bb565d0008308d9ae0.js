__d(function(g,r,i,a,m,e,d){"use strict";Object.defineProperty(e,'__esModule',{value:!0});var t=r(d[0]);Object.keys(t).forEach(function(n){'default'===n||Object.prototype.hasOwnProperty.call(e,n)||Object.defineProperty(e,n,{enumerable:!0,get:function(){return t[n]}})});var n=r(d[1]);Object.keys(n).forEach(function(t){'default'===t||Object.prototype.hasOwnProperty.call(e,t)||Object.defineProperty(e,t,{enumerable:!0,get:function(){return n[t]}})});var c=r(d[2]);Object.keys(c).forEach(function(t){'default'===t||Object.prototype.hasOwnProperty.call(e,t)||Object.defineProperty(e,t,{enumerable:!0,get:function(){return c[t]}})});var o=r(d[3]);Object.keys(o).forEach(function(t){'default'===t||Object.prototype.hasOwnProperty.call(e,t)||Object.defineProperty(e,t,{enumerable:!0,get:function(){return o[t]}})})},3675,[3837,3839,3841,3842]);
__d(function(g,_r,_i,a,m,_e,_d){"use strict";Object.defineProperty(_e,'__esModule',{value:!0}),Object.defineProperty(_e,"W3mEmailSuffixesWidget",{enumerable:!0,get:function(){return c}});var e,t=_r(_d[0]),i=_r(_d[1]),o=_r(_d[2]),l=_r(_d[3]),n=(e=l)&&e.__esModule?e:{default:e},s=this&&this.__decorate||function(e,t,i,o){var l,n=arguments.length,s=n<3?t:null===o?o=Object.getOwnPropertyDescriptor(t,i):o;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)s=Reflect.decorate(e,t,i,o);else for(var r=e.length-1;r>=0;r--)(l=e[r])&&(s=(n<3?l(s):n>3?l(t,i,s):l(t,i))||s);return n>3&&s&&Object.defineProperty(t,i,s),s};const r=['@gmail.com','@outlook.com','@yahoo.com','@hotmail.com','@aol.com','@icloud.com','@zoho.com'];let c=class extends t.LitElement{constructor(){super(...arguments),this.email=''}render(){const e=r.filter(this.filter.bind(this)).map(this.item.bind(this));return 0===e.length?null:t.html`<div class="email-sufixes">${e}</div>`}filter(e){if(!this.email)return!1;const t=this.email.split('@');if(t.length<2)return!0;const i=t.pop();return e.includes(i)&&e!==`@${i}`}item(e){return t.html`<wui-button variant="neutral" size="sm" @click=${()=>{const t=this.email.split('@');t.length>1&&t.pop();const i=t[0]+e;this.dispatchEvent(new CustomEvent('change',{detail:i,bubbles:!0,composed:!0}))}}
      >${e}</wui-button
    >`}};c.styles=[n.default],s([(0,i.property)()],c.prototype,"email",void 0),c=s([(0,o.customElement)('w3m-email-suffixes-widget')],c)},3837,[2549,2575,2546,3838]);
__d(function(g,r,i,a,m,e,d){"use strict";Object.defineProperty(e,'__esModule',{value:!0}),Object.defineProperty(e,"default",{enumerable:!0,get:function(){return n}});var n=r(d[0]).css`
  .email-sufixes {
    display: flex;
    flex-direction: row;
    gap: var(--wui-spacing-3xs);
    overflow-x: auto;
    max-width: 100%;
    margin-top: var(--wui-spacing-s);
    margin-bottom: calc(-1 * var(--wui-spacing-m));
    padding-bottom: var(--wui-spacing-m);
    margin-left: calc(-1 * var(--wui-spacing-m));
    margin-right: calc(-1 * var(--wui-spacing-m));
    padding-left: var(--wui-spacing-m);
    padding-right: var(--wui-spacing-m);

    &::-webkit-scrollbar {
      display: none;
    }
  }
`},3838,[2549]);
__d(function(g,_r,_i,a,m,_e,_d){"use strict";Object.defineProperty(_e,'__esModule',{value:!0}),Object.defineProperty(_e,"W3mRecentEmailsWidget",{enumerable:!0,get:function(){return c}});var e,t=_r(_d[0]),i=_r(_d[1]),l=_r(_d[2]),r=_r(_d[3]),s=(e=r)&&e.__esModule?e:{default:e},n=this&&this.__decorate||function(e,t,i,l){var r,s=arguments.length,n=s<3?t:null===l?l=Object.getOwnPropertyDescriptor(t,i):l;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)n=Reflect.decorate(e,t,i,l);else for(var c=e.length-1;c>=0;c--)(r=e[c])&&(n=(s<3?r(n):s>3?r(t,i,n):r(t,i))||n);return s>3&&n&&Object.defineProperty(t,i,n),n};let c=class extends t.LitElement{constructor(){super(...arguments),this.emails=[]}render(){return 0===this.emails.length?null:t.html`<div class="recent-emails">
      <wui-text variant="micro-600" color="fg-200" class="recent-emails-heading"
        >Recently used emails</wui-text
      >
      ${this.emails.map(this.item.bind(this))}
    </div>`}item(e){return t.html`<wui-list-item
      @click=${()=>{this.dispatchEvent(new CustomEvent('select',{detail:e,bubbles:!0,composed:!0}))}}
      ?chevron=${!0}
      icon="mail"
      iconVariant="overlay"
      class="recent-emails-list-item"
    >
      <wui-text variant="paragraph-500" color="fg-100">${e}</wui-text>
    </wui-list-item>`}};c.styles=[s.default],n([(0,i.property)()],c.prototype,"emails",void 0),c=n([(0,l.customElement)('w3m-recent-emails-widget')],c)},3839,[2549,2575,2546,3840]);
__d(function(g,r,i,a,m,e,d){"use strict";Object.defineProperty(e,'__esModule',{value:!0}),Object.defineProperty(e,"default",{enumerable:!0,get:function(){return t}});var t=r(d[0]).css`
  .recent-emails {
    display: flex;
    flex-direction: column;
    padding: var(--wui-spacing-s) 0;
    border-top: 1px solid var(--wui-color-gray-glass-005);
    border-bottom: 1px solid var(--wui-color-gray-glass-005);
  }

  .recent-emails-heading {
    margin-bottom: var(--wui-spacing-s);
  }

  .recent-emails-list-item {
    --wui-color-gray-glass-002: transparent;
  }
`},3840,[2549]);
__d(function(g,_r,_i,a,m,e,_d){"use strict";Object.defineProperty(e,'__esModule',{value:!0}),Object.defineProperty(e,"W3mDataCaptureOtpConfirmView",{enumerable:!0,get:function(){return s}});var t=_r(_d[0]),n=_r(_d[1]),i=_r(_d[2]),o=_r(_d[3]),r=_r(_d[4]),c=this&&this.__decorate||function(t,n,i,o){var r,c=arguments.length,s=c<3?n:null===o?o=Object.getOwnPropertyDescriptor(n,i):o;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)s=Reflect.decorate(t,n,i,o);else for(var l=t.length-1;l>=0;l--)(r=t[l])&&(s=(c<3?r(s):c>3?r(n,i,s):r(n,i))||s);return c>3&&s&&Object.defineProperty(n,i,s),s};let s=class extends r.W3mEmailOtpWidget{constructor(){super(...arguments),this.siwx=n.OptionsController.state.siwx,this.onOtpSubmit=async t=>{await this.siwx.confirmEmailOtp({code:t}),n.RouterController.replace('SIWXSignMessage')},this.onOtpResend=async t=>{const i=n.ChainController.getAccountData();if(!i?.caipAddress)throw new Error('No account data found');await this.siwx.requestEmailOtp({email:t,account:i.caipAddress})}}connectedCallback(){this.siwx&&this.siwx instanceof i.ReownAuthentication||n.SnackController.showError('ReownAuthentication is not initialized.'),super.connectedCallback()}shouldSubmitOnOtpChange(){return this.otp.length===r.W3mEmailOtpWidget.OTP_LENGTH}};c([(0,t.state)()],s.prototype,"siwx",void 0),s=c([(0,o.customElement)('w3m-data-capture-otp-confirm-view')],s)},3841,[2575,2164,3677,2546,3757]);
__d(function(g,_r,_i,a,m,_e,_d){"use strict";Object.defineProperty(_e,'__esModule',{value:!0}),Object.defineProperty(_e,"W3mDataCaptureView",{enumerable:!0,get:function(){return h}});var t,e=_r(_d[0]),i=_r(_d[1]),o=_r(_d[2]),r=_r(_d[3]),l=_r(_d[4]),n=_r(_d[5]),s=_r(_d[6]),c=(t=s)&&t.__esModule?t:{default:t},u=this&&this.__decorate||function(t,e,i,o){var r,l=arguments.length,n=l<3?e:null===o?o=Object.getOwnPropertyDescriptor(e,i):o;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)n=Reflect.decorate(t,e,i,o);else for(var s=t.length-1;s>=0;s--)(r=t[s])&&(n=(l<3?r(n):l>3?r(e,i,n):r(e,i))||n);return l>3&&n&&Object.defineProperty(e,i,n),n};let h=class extends e.LitElement{constructor(){super(...arguments),this.email=r.RouterController.state.data?.email??r.ChainController.getAccountData()?.user?.email??'',this.address=r.ChainController.getAccountData()?.address??'',this.loading=!1,this.appName=r.OptionsController.state.metadata?.name??'AppKit',this.siwx=r.OptionsController.state.siwx,this.isRequired=Array.isArray(r.OptionsController.state.remoteFeatures?.emailCapture)&&r.OptionsController.state.remoteFeatures?.emailCapture.includes('required'),this.recentEmails=this.getRecentEmails()}connectedCallback(){this.siwx&&this.siwx instanceof l.ReownAuthentication||r.SnackController.showError('ReownAuthentication is not initialized. Please contact support.'),super.connectedCallback()}firstUpdated(){this.loading=!1,this.recentEmails=this.getRecentEmails(),this.email&&this.onSubmit()}render(){return e.html`
      <wui-flex flexDirection="column" .padding=${['3xs','m','m','m']} gap="l">
        ${this.hero()} ${this.paragraph()} ${this.emailInput()} ${this.recentEmailsWidget()}
        ${this.footerActions()}
      </wui-flex>
    `}hero(){return e.html`
      <div class="hero" data-state=${this.loading?'loading':'default'}>
        ${this.heroRow(['id','mail','wallet','x','solana','qrCode'])}
        ${this.heroRow(['mail','farcaster','wallet','discord','mobile','qrCode'])}
        <div class="hero-row">
          ${this.heroIcon('github')} ${this.heroIcon('bank')}
          <wui-icon-box
            size="xl"
            iconSize="xxl"
            iconColor=${this.loading?'fg-100':'accent-100'}
            backgroundColor=${this.loading?'fg-100':'accent-100'}
            icon=${this.loading?'id':'user'}
            isOpaque
            class="hero-main-icon"
            data-state=${this.loading?'loading':'default'}
          >
          </wui-icon-box>
          ${this.heroIcon('id')} ${this.heroIcon('card')}
        </div>
        ${this.heroRow(['google','id','github','verify','apple','mobile'])}
      </div>
    `}heroRow(t){return e.html`
      <div class="hero-row" data-state=${this.loading?'loading':'default'}>
        ${t.map(this.heroIcon.bind(this))}
      </div>
    `}heroIcon(t){return e.html`
      <wui-icon-box
        size="xl"
        iconSize="xxl"
        iconColor="fg-100"
        backgroundColor="fg-100"
        icon=${t}
        data-state=${this.loading?'loading':'default'}
        isOpaque
        class="hero-row-icon"
      >
      </wui-icon-box>
    `}paragraph(){return this.loading?e.html`
        <wui-text variant="paragraph-400" color="fg-200" align="center"
          >We are verifying your account with email
          <wui-text variant="paragraph-600" color="accent-100">${this.email}</wui-text> and address
          <wui-text variant="paragraph-600" color="fg-100">
            ${n.UiHelperUtil.getTruncateString({string:this.address,charsEnd:4,charsStart:4,truncate:'middle'})} </wui-text
          >, please wait a moment.</wui-text
        >
      `:this.isRequired?e.html`
        <wui-text variant="paragraph-600" color="fg-100" align="center">
          ${this.appName} requires your email for authentication.
        </wui-text>
      `:e.html`
      <wui-flex flexDirection="column" gap="xs" alignItems="center">
        <wui-text variant="paragraph-600" color="fg-100" align="center" size>
          ${this.appName} would like to collect your email.
        </wui-text>

        <wui-text variant="small-400" color="fg-200" align="center">
          Don't worry, it's optional&mdash;you can skip this step.
        </wui-text>
      </wui-flex>
    `}emailInput(){if(this.loading)return null;const t=t=>{this.email=t.detail};return e.html`
      <wui-flex flexDirection="column">
        <wui-email-input
          .value=${this.email}
          .disabled=${this.loading}
          @inputChange=${t}
          @keydown=${t=>{'Enter'===t.key&&this.onSubmit()}}
        ></wui-email-input>

        <w3m-email-suffixes-widget
          .email=${this.email}
          @change=${t}
        ></w3m-email-suffixes-widget>
      </wui-flex>
    `}recentEmailsWidget(){if(0===this.recentEmails.length||this.loading)return null;return e.html`
      <w3m-recent-emails-widget
        .emails=${this.recentEmails}
        @select=${t=>{this.email=t.detail,this.onSubmit()}}
      ></w3m-recent-emails-widget>
    `}footerActions(){return e.html`
      <wui-flex flexDirection="row" fullWidth gap="s">
        ${this.isRequired?null:e.html`<wui-button
              size="lg"
              variant="neutral"
              fullWidth
              .disabled=${this.loading}
              @click=${this.onSkip.bind(this)}
              >Skip this step</wui-button
            >`}

        <wui-button
          size="lg"
          variant="main"
          type="submit"
          fullWidth
          .disabled=${!this.email||!this.isValidEmail(this.email)}
          .loading=${this.loading}
          @click=${this.onSubmit.bind(this)}
        >
          Continue
        </wui-button>
      </wui-flex>
    `}async onSubmit(){if(!(this.siwx instanceof l.ReownAuthentication))return void r.SnackController.showError('ReownAuthentication is not initialized. Please contact support.');const t=r.ChainController.getActiveCaipAddress();if(!t)throw new Error('Account is not connected.');if(this.isValidEmail(this.email))try{this.loading=!0;const e=await this.siwx.requestEmailOtp({email:this.email,account:t});this.pushRecentEmail(this.email),null===e.uuid?r.RouterController.replace('SIWXSignMessage'):r.RouterController.replace('DataCaptureOtpConfirm',{email:this.email})}catch(t){r.SnackController.showError('Failed to send email OTP'),this.loading=!1}else r.SnackController.showError('Please provide a valid email.')}onSkip(){r.RouterController.replace('SIWXSignMessage')}getRecentEmails(){const t=o.SafeLocalStorage.getItem(o.SafeLocalStorageKeys.RECENT_EMAILS);return(t?t.split(','):[]).filter(this.isValidEmail.bind(this)).slice(0,3)}pushRecentEmail(t){const e=this.getRecentEmails(),i=Array.from(new Set([t,...e])).slice(0,3);o.SafeLocalStorage.setItem(o.SafeLocalStorageKeys.RECENT_EMAILS,i.join(','))}isValidEmail(t){return/^\S+@\S+\.\S+$/u.test(t)}};h.styles=[c.default],u([(0,i.state)()],h.prototype,"email",void 0),u([(0,i.state)()],h.prototype,"address",void 0),u([(0,i.state)()],h.prototype,"loading",void 0),u([(0,i.state)()],h.prototype,"appName",void 0),u([(0,i.state)()],h.prototype,"siwx",void 0),u([(0,i.state)()],h.prototype,"isRequired",void 0),u([(0,i.state)()],h.prototype,"recentEmails",void 0),h=u([(0,n.customElement)('w3m-data-capture-view')],h)},3842,[2549,2575,2169,2164,3677,2546,3843]);
__d(function(g,r,i,a,m,e,d){"use strict";Object.defineProperty(e,'__esModule',{value:!0}),Object.defineProperty(e,"default",{enumerable:!0,get:function(){return t}});var t=r(d[0]).css`
  .hero {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: var(--wui-spacing-3xs);

    transition-property: margin, height;
    transition-duration: var(--wui-duration-md);
    transition-timing-function: var(--wui-ease-out-power-1);
    margin-top: -100px;

    &[data-state='loading'] {
      margin-top: 0px;
    }

    position: relative;
    &:after {
      content: '';
      position: absolute;
      bottom: 0;
      height: 252px;
      width: 360px;
      background: radial-gradient(
        96.11% 53.95% at 50% 51.28%,
        transparent 0%,
        color-mix(in srgb, var(--wui-color-bg-100) 5%, transparent) 49%,
        color-mix(in srgb, var(--wui-color-bg-100) 65%, transparent) 99.43%
      );
    }
  }

  .hero-main-icon {
    width: 176px;
    transition-property: background-color;
    transition-duration: var(--wui-duration-lg);
    transition-timing-function: var(--wui-ease-out-power-1);

    &[data-state='loading'] {
      width: 56px;
    }
  }

  .hero-row {
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: center;
    gap: var(--wui-spacing-3xs);
    flex-wrap: nowrap;
    min-width: fit-content;

    &:nth-child(1) {
      transform: translateX(-30px);
    }

    &:nth-child(2) {
      transform: translateX(30px);
    }

    &:nth-child(4) {
      transform: translateX(40px);
    }

    transition-property: height;
    transition-duration: var(--wui-duration-md);
    transition-timing-function: var(--wui-ease-out-power-1);
    height: 68px;

    &[data-state='loading'] {
      height: 0px;
    }
  }

  .hero-row-icon {
    opacity: 0.1;
    transition-property: opacity;
    transition-duration: var(--wui-duration-md);
    transition-timing-function: var(--wui-ease-out-power-1);

    &[data-state='loading'] {
      opacity: 0;
    }
  }
`},3843,[2549]);