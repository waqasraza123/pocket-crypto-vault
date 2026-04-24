__d(function(g,r,i,a,m,e,d){"use strict";Object.defineProperty(e,'__esModule',{value:!0});var t=r(d[0]);Object.keys(t).forEach(function(n){'default'===n||Object.prototype.hasOwnProperty.call(e,n)||Object.defineProperty(e,n,{enumerable:!0,get:function(){return t[n]}})});var n=r(d[1]);Object.keys(n).forEach(function(t){'default'===t||Object.prototype.hasOwnProperty.call(e,t)||Object.defineProperty(e,t,{enumerable:!0,get:function(){return n[t]}})});var c=r(d[2]);Object.keys(c).forEach(function(t){'default'===t||Object.prototype.hasOwnProperty.call(e,t)||Object.defineProperty(e,t,{enumerable:!0,get:function(){return c[t]}})});var o=r(d[3]);Object.keys(o).forEach(function(t){'default'===t||Object.prototype.hasOwnProperty.call(e,t)||Object.defineProperty(e,t,{enumerable:!0,get:function(){return o[t]}})});var u=r(d[4]);Object.keys(u).forEach(function(t){'default'===t||Object.prototype.hasOwnProperty.call(e,t)||Object.defineProperty(e,t,{enumerable:!0,get:function(){return u[t]}})});var f=r(d[5]);Object.keys(f).forEach(function(t){'default'===t||Object.prototype.hasOwnProperty.call(e,t)||Object.defineProperty(e,t,{enumerable:!0,get:function(){return f[t]}})});var l=r(d[6]);Object.keys(l).forEach(function(t){'default'===t||Object.prototype.hasOwnProperty.call(e,t)||Object.defineProperty(e,t,{enumerable:!0,get:function(){return l[t]}})})},3666,[3749,3750,3752,3754,3755,3756,3757]);
__d(function(g,_r,_i,a,m,e,_d){"use strict";Object.defineProperty(e,'__esModule',{value:!0}),Object.defineProperty(e,"W3mEmailVerifyOtpView",{enumerable:!0,get:function(){return l}});var t=_r(_d[0]),r=_r(_d[1]),o=_r(_d[2]),n=this&&this.__decorate||function(t,r,o,n){var l,i=arguments.length,s=i<3?r:null===n?n=Object.getOwnPropertyDescriptor(r,o):n;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)s=Reflect.decorate(t,r,o,n);else for(var c=t.length-1;c>=0;c--)(l=t[c])&&(s=(i<3?l(s):i>3?l(r,o,s):l(r,o))||s);return i>3&&s&&Object.defineProperty(r,o,s),s};let l=class extends o.W3mEmailOtpWidget{constructor(){super(...arguments),this.onOtpSubmit=async r=>{try{if(this.authConnector){const o=t.ChainController.state.activeChain,n=t.ConnectionController.getConnections(o),l=t.OptionsController.state.remoteFeatures?.multiWallet,i=n.length>0;if(await this.authConnector.provider.connectOtp({otp:r}),t.EventsController.sendEvent({type:'track',event:'EMAIL_VERIFICATION_CODE_PASS'}),!o)throw new Error('Active chain is not set on ChainController');if(await t.ConnectionController.connectExternal(this.authConnector,o),t.OptionsController.state.remoteFeatures?.emailCapture)return;if(t.OptionsController.state.siwx)return void t.ModalController.close();if(i&&l)return t.RouterController.replace('ProfileWallets'),void t.SnackController.showSuccess('New Wallet Added');t.ModalController.close()}}catch(r){throw t.EventsController.sendEvent({type:'track',event:'EMAIL_VERIFICATION_CODE_FAIL',properties:{message:t.CoreHelperUtil.parseError(r)}}),r}},this.onOtpResend=async r=>{this.authConnector&&(await this.authConnector.provider.connectEmail({email:r}),t.EventsController.sendEvent({type:'track',event:'EMAIL_VERIFICATION_CODE_SENT'}))}}};l=n([(0,r.customElement)('w3m-email-verify-otp-view')],l)},3749,[2164,2546,3757]);
__d(function(g,_r,_i,a,m,_e,_d){"use strict";Object.defineProperty(_e,'__esModule',{value:!0}),Object.defineProperty(_e,"W3mEmailVerifyDeviceView",{enumerable:!0,get:function(){return s}});var e=_r(_d[0]),t=_r(_d[1]),i=_r(_d[2]),r=_r(_d[3]);_r(_d[4]),_r(_d[5]),_r(_d[6]),_r(_d[7]);var n,o=_r(_d[8]),l=(n=o)&&n.__esModule?n:{default:n},c=this&&this.__decorate||function(e,t,i,r){var n,o=arguments.length,l=o<3?t:null===r?r=Object.getOwnPropertyDescriptor(t,i):r;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)l=Reflect.decorate(e,t,i,r);else for(var c=e.length-1;c>=0;c--)(n=e[c])&&(l=(o<3?n(l):o>3?n(t,i,l):n(t,i))||l);return o>3&&l&&Object.defineProperty(t,i,l),l};let s=class extends e.LitElement{constructor(){super(),this.email=i.RouterController.state.data?.email,this.authConnector=i.ConnectorController.getAuthConnector(),this.loading=!1,this.listenForDeviceApproval()}render(){if(!this.email)throw new Error('w3m-email-verify-device-view: No email provided');if(!this.authConnector)throw new Error('w3m-email-verify-device-view: No auth connector provided');return e.html`
      <wui-flex
        flexDirection="column"
        alignItems="center"
        .padding=${['6','3','6','3']}
        gap="4"
      >
        <wui-icon-box size="xl" color="accent-primary" icon="sealCheck"></wui-icon-box>

        <wui-flex flexDirection="column" alignItems="center" gap="3">
          <wui-flex flexDirection="column" alignItems="center">
            <wui-text variant="md-regular" color="primary">
              Approve the login link we sent to
            </wui-text>
            <wui-text variant="md-regular" color="primary"><b>${this.email}</b></wui-text>
          </wui-flex>

          <wui-text variant="sm-regular" color="secondary" align="center">
            The code expires in 20 minutes
          </wui-text>

          <wui-flex alignItems="center" id="w3m-resend-section" gap="2">
            <wui-text variant="sm-regular" color="primary" align="center">
              Didn't receive it?
            </wui-text>
            <wui-link @click=${this.onResendCode.bind(this)} .disabled=${this.loading}>
              Resend email
            </wui-link>
          </wui-flex>
        </wui-flex>
      </wui-flex>
    `}async listenForDeviceApproval(){if(this.authConnector)try{await this.authConnector.provider.connectDevice(),i.EventsController.sendEvent({type:'track',event:'DEVICE_REGISTERED_FOR_EMAIL'}),i.EventsController.sendEvent({type:'track',event:'EMAIL_VERIFICATION_CODE_SENT'}),i.RouterController.replace('EmailVerifyOtp',{email:this.email})}catch(e){i.RouterController.goBack()}}async onResendCode(){try{if(!this.loading){if(!this.authConnector||!this.email)throw new Error('w3m-email-login-widget: Unable to resend email');this.loading=!0,await this.authConnector.provider.connectEmail({email:this.email}),this.listenForDeviceApproval(),i.SnackController.showSuccess('Code email resent')}}catch(e){i.SnackController.showError(e)}finally{this.loading=!1}}};s.styles=l.default,c([(0,t.state)()],s.prototype,"loading",void 0),s=c([(0,r.customElement)('w3m-email-verify-device-view')],s)},3750,[2549,2575,2164,2546,2650,2705,2659,2651,3751]);
__d(function(g,r,i,a,m,e,d){"use strict";Object.defineProperty(e,'__esModule',{value:!0}),Object.defineProperty(e,"default",{enumerable:!0,get:function(){return t}});var t=r(d[0]).css`
  wui-icon-box {
    height: ${({spacing:t})=>t[16]};
    width: ${({spacing:t})=>t[16]};
  }
`},3751,[2546]);
__d(function(g,_r,_i,a,m,_e,_d){"use strict";Object.defineProperty(_e,'__esModule',{value:!0}),Object.defineProperty(_e,"W3mUpdateEmailWalletView",{enumerable:!0,get:function(){return d}});var t=_r(_d[0]),e=_r(_d[1]),i=_r(_d[2]),l=_r(_d[3]),n=_r(_d[4]);_r(_d[5]),_r(_d[6]),_r(_d[7]);var r,o=_r(_d[8]),s=(r=o)&&r.__esModule?r:{default:r},u=this&&this.__decorate||function(t,e,i,l){var n,r=arguments.length,o=r<3?e:null===l?l=Object.getOwnPropertyDescriptor(e,i):l;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)o=Reflect.decorate(t,e,i,l);else for(var s=t.length-1;s>=0;s--)(n=t[s])&&(o=(r<3?n(o):r>3?n(e,i,o):n(e,i))||o);return r>3&&o&&Object.defineProperty(e,i,o),o};let d=class extends t.LitElement{constructor(){super(...arguments),this.formRef=(0,i.createRef)(),this.initialEmail=l.RouterController.state.data?.email??'',this.redirectView=l.RouterController.state.data?.redirectView,this.email='',this.loading=!1}firstUpdated(){this.formRef.value?.addEventListener('keydown',t=>{'Enter'===t.key&&this.onSubmitEmail(t)})}render(){return t.html`
      <wui-flex flexDirection="column" padding="4" gap="4">
        <form ${(0,i.ref)(this.formRef)} @submit=${this.onSubmitEmail.bind(this)}>
          <wui-email-input
            value=${this.initialEmail}
            .disabled=${this.loading}
            @inputChange=${this.onEmailInputChange.bind(this)}
          >
          </wui-email-input>
          <input type="submit" hidden />
        </form>
        ${this.buttonsTemplate()}
      </wui-flex>
    `}onEmailInputChange(t){this.email=t.detail}async onSubmitEmail(t){try{if(this.loading)return;this.loading=!0,t.preventDefault();const e=l.ConnectorController.getAuthConnector();if(!e)throw new Error('w3m-update-email-wallet: Auth connector not found');const i=await e.provider.updateEmail({email:this.email});l.EventsController.sendEvent({type:'track',event:'EMAIL_EDIT'}),'VERIFY_SECONDARY_OTP'===i.action?l.RouterController.push('UpdateEmailSecondaryOtp',{email:this.initialEmail,newEmail:this.email,redirectView:this.redirectView}):l.RouterController.push('UpdateEmailPrimaryOtp',{email:this.initialEmail,newEmail:this.email,redirectView:this.redirectView})}catch(t){l.SnackController.showError(t),this.loading=!1}}buttonsTemplate(){const e=!this.loading&&this.email.length>3&&this.email!==this.initialEmail;return this.redirectView?t.html`
      <wui-flex gap="3">
        <wui-button size="md" variant="neutral" fullWidth @click=${l.RouterController.goBack}>
          Cancel
        </wui-button>

        <wui-button
          size="md"
          variant="accent-primary"
          fullWidth
          @click=${this.onSubmitEmail.bind(this)}
          .disabled=${!e}
          .loading=${this.loading}
        >
          Save
        </wui-button>
      </wui-flex>
    `:t.html`
        <wui-button
          size="md"
          variant="accent-primary"
          fullWidth
          @click=${this.onSubmitEmail.bind(this)}
          .disabled=${!e}
          .loading=${this.loading}
        >
          Save
        </wui-button>
      `}};d.styles=s.default,u([(0,e.state)()],d.prototype,"email",void 0),u([(0,e.state)()],d.prototype,"loading",void 0),d=u([(0,n.customElement)('w3m-update-email-wallet-view')],d)},3752,[2549,2575,2753,2164,2546,2683,2786,2650,3753]);
__d(function(g,r,i,a,m,e,d){"use strict";Object.defineProperty(e,'__esModule',{value:!0}),Object.defineProperty(e,"default",{enumerable:!0,get:function(){return t}});var t=r(d[0]).css`
  wui-email-input {
    width: 100%;
  }

  form {
    width: 100%;
    display: block;
    position: relative;
  }
`},3753,[2549]);
__d(function(g,_r,_i,a,m,e,_d){"use strict";Object.defineProperty(e,'__esModule',{value:!0}),Object.defineProperty(e,"W3mUpdateEmailPrimaryOtpView",{enumerable:!0,get:function(){return l}});var t=_r(_d[0]),r=_r(_d[1]),o=_r(_d[2]),n=this&&this.__decorate||function(t,r,o,n){var l,i=arguments.length,c=i<3?r:null===n?n=Object.getOwnPropertyDescriptor(r,o):n;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)c=Reflect.decorate(t,r,o,n);else for(var p=t.length-1;p>=0;p--)(l=t[p])&&(c=(i<3?l(c):i>3?l(r,o,c):l(r,o))||c);return i>3&&c&&Object.defineProperty(r,o,c),c};let l=class extends o.W3mEmailOtpWidget{constructor(){super(),this.email=t.RouterController.state.data?.email,this.onOtpSubmit=async r=>{try{this.authConnector&&(await this.authConnector.provider.updateEmailPrimaryOtp({otp:r}),t.EventsController.sendEvent({type:'track',event:'EMAIL_VERIFICATION_CODE_PASS'}),t.RouterController.replace('UpdateEmailSecondaryOtp',t.RouterController.state.data))}catch(r){throw t.EventsController.sendEvent({type:'track',event:'EMAIL_VERIFICATION_CODE_FAIL',properties:{message:t.CoreHelperUtil.parseError(r)}}),r}},this.onStartOver=()=>{t.RouterController.replace('UpdateEmailWallet',t.RouterController.state.data)}}};l=n([(0,r.customElement)('w3m-update-email-primary-otp-view')],l)},3754,[2164,2546,3757]);
__d(function(g,_r,_i,a,m,e,_d){"use strict";Object.defineProperty(e,'__esModule',{value:!0}),Object.defineProperty(e,"W3mUpdateEmailSecondaryOtpView",{enumerable:!0,get:function(){return i}});var t=_r(_d[0]),r=_r(_d[1]),o=_r(_d[2]),n=this&&this.__decorate||function(t,r,o,n){var i,l=arguments.length,c=l<3?r:null===n?n=Object.getOwnPropertyDescriptor(r,o):n;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)c=Reflect.decorate(t,r,o,n);else for(var s=t.length-1;s>=0;s--)(i=t[s])&&(c=(l<3?i(c):l>3?i(r,o,c):i(r,o))||c);return l>3&&c&&Object.defineProperty(r,o,c),c};let i=class extends o.W3mEmailOtpWidget{constructor(){super(),this.email=t.RouterController.state.data?.newEmail,this.redirectView=t.RouterController.state.data?.redirectView,this.onOtpSubmit=async r=>{try{this.authConnector&&(await this.authConnector.provider.updateEmailSecondaryOtp({otp:r}),t.EventsController.sendEvent({type:'track',event:'EMAIL_VERIFICATION_CODE_PASS'}),this.redirectView&&t.RouterController.reset(this.redirectView))}catch(r){throw t.EventsController.sendEvent({type:'track',event:'EMAIL_VERIFICATION_CODE_FAIL',properties:{message:t.CoreHelperUtil.parseError(r)}}),r}},this.onStartOver=()=>{t.RouterController.replace('UpdateEmailWallet',t.RouterController.state.data)}}};i=n([(0,r.customElement)('w3m-update-email-secondary-otp-view')],i)},3755,[2164,2546,3757]);
__d(function(g,_r,_i,a,m,e,_d){"use strict";Object.defineProperty(e,'__esModule',{value:!0}),Object.defineProperty(e,"W3mEmailLoginView",{enumerable:!0,get:function(){return s}});var t=_r(_d[0]),n=_r(_d[1]),o=_r(_d[2]),r=_r(_d[3]),i=_r(_d[4]),l=_r(_d[5]),c=this&&this.__decorate||function(t,n,o,r){var i,l=arguments.length,c=l<3?n:null===r?r=Object.getOwnPropertyDescriptor(n,o):r;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)c=Reflect.decorate(t,n,o,r);else for(var s=t.length-1;s>=0;s--)(i=t[s])&&(c=(l<3?i(c):l>3?i(n,o,c):i(n,o))||c);return l>3&&c&&Object.defineProperty(n,o,c),c};let s=class extends t.LitElement{constructor(){super(),this.authConnector=r.ConnectorController.getAuthConnector(),this.isEmailEnabled=r.OptionsController.state.remoteFeatures?.email,this.isAuthEnabled=this.checkIfAuthEnabled(r.ConnectorController.state.connectors),this.connectors=r.ConnectorController.state.connectors,r.ConnectorController.subscribeKey('connectors',t=>{this.connectors=t,this.isAuthEnabled=this.checkIfAuthEnabled(this.connectors)})}render(){if(!this.isEmailEnabled)throw new Error('w3m-email-login-view: Email is not enabled');if(!this.isAuthEnabled)throw new Error('w3m-email-login-view: No auth connector provided');return t.html`<wui-flex flexDirection="column" .padding=${['1','3','3','3']} gap="4">
      <w3m-email-login-widget></w3m-email-login-widget>
    </wui-flex> `}checkIfAuthEnabled(t){const n=t.filter(t=>t.type===l.ConstantsUtil.CONNECTOR_TYPE_AUTH).map(t=>t.chain);return o.ConstantsUtil.AUTH_CONNECTOR_SUPPORTED_CHAINS.some(t=>n.includes(t))}};c([(0,n.state)()],s.prototype,"connectors",void 0),s=c([(0,i.customElement)('w3m-email-login-view')],s)},3756,[2549,2575,2169,2164,2546,2534]);