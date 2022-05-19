

import React, { Component, useRef, useEffect } from 'react';
import { SafeAreaView, Modal, Platform, TouchableOpacity, Image, StyleSheet,  BackHandler} from 'react-native';
import WebView  from 'react-native-webview-bootpay';
import UserInfo from './UserInfo'

export class BootpayWebView extends Component {
 

    webView = useRef<WebView>(null); 

    _VERSION = "4.0.8";
    _DEBUG = false;
    _payload = {};

    
    state = {
        visibility: false, 
        script: '',
        firstLoad: false
    }  

    async componentWillUnmount() {
        this.setState(
            {
                visibility: false, 
                firstLoad: false,
                showCloseButton: false
            }
        )
        UserInfo.setBootpayLastTime(Date.now());
    } 
    render() { 
        return <Modal
            animationType={'slide'}
            transparent={false} 
            onRequestClose={()=> { 
                this.dismiss();
            }}
            visible={this.state.visibility}>
            <SafeAreaView style={{ flex: 1 }}>
                {
                    this.state.showCloseButton &&
                    <TouchableOpacity
                        onPress={() => {
                            var cancelData = {
                                action: 'BootpayCancel',
                                message: '사용자에 의해 취소되었습니다'
                            }
                            var closeData = {
                                action: 'BootpayClose',
                                message: '결제창이 닫혔습니다'
                            }
                            
                            if(this.props.onCancel != undefined) this.props.onCancel(cancelData);
                            if(this.props.onClose != undefined) this.props.onClose(closeData); 

                            this.setState({visibility: false})
                        } }>
                        <Image 
                            style={[styles.overlay]}
                            source={require('../images/close.png')} />
                    </TouchableOpacity>
                }
                <WebView
                    ref={(wv) => this.webView = wv} 
                    useWebKit={true}
                    originWhitelist={['*']}
                    source={{
                        uri: 'https://webview.bootpay.co.kr/4.0.6/'
                    }}
                    onRequestClose={()=> {
                        // console.log('onRequestClose');
                        this.dismiss();
                    }}
                    injectedJavaScript={this.state.script}
                    javaScriptEnabled={true}
                    javaScriptCanOpenWindowsAutomatically={true}
                    // scalesPageToFit={true} 
                    onMessage={this.onMessage}
                    onShouldStartLoadWithRequest={this.onShouldStartLoadWithRequest}
                />
            </SafeAreaView>

        </Modal>
    }

    requestPayment = async (payload, items, user, extra) => {        
        this.bootpayRequest(payload, items, user, extra, "requestPayment");
    }

    requestSubscription = async (payload, items, user, extra) => {        
        this.bootpayRequest(payload, items, user, extra, "requestSubscription");
    }

    requestAuthentication = async (payload, items, user, extra) => {        
        this.bootpayRequest(payload, items, user, extra, "requestAuthentication");
    }

    bootpayRequest = async (payload, items, user, extra, requestMethod) => {    

        payload.application_id =  Platform.OS == 'ios' ? this.props.ios_application_id : this.props.android_application_id;
        payload.items = items;
        payload.user = user; 
        payload.extra = {
            card_quota: extra.card_quota ?? "",
            seller_name: extra.seller_name ?? "",            
            delivery_day: extra.delivery_day ?? 1, //배송일자 
            locale: extra.locale ?? "ko", 
            offer_period: extra.offer_period ?? "" , //결제창 제공기간에 해당하는 string 값, 지원하는 PG만 적용됨
            disp_cash_result: extra.disp_cash_result ?? true,  // 현금영수증 보일지 말지.. 가상계좌 KCP 옵션
            deposit_expiration: extra.deposit_expiration ?? "", //가상계좌 입금 만료일자 설정, yyyy-MM-dd
            app_scheme: extra.app_scheme ?? "", //ios의 경우 카드사 앱 호출 후 되돌아오기 위한 앱 스키마명 
            use_card_point: extra.use_card_point ?? true,  //카드 포인트 사용 여부 (토스만 가능)
            direct_card: extra.direct_card ?? "", //해당 카드로 바로 결제창 (토스만 가능)
            use_order_id: extra.use_order_id ?? false, //가맹점 order_id로 PG로 전송
            international_card_only: extra.international_card_only ?? false, //해외 결제카드 선택 여부 (토스만 가능)
            // phone_carrier: 'SKT', // ['SKT', 'KT', 'LGT'] 중 택 1
            direct_app_card: extra.direct_app_card ?? false, //카드사앱으로 direct 호출
            direct_samsungpay: extra.direct_samsungpay ?? false, //삼성페이 바로 띄우기
            test_deposit: extra.test_deposit ?? false, //가상계좌 모의 입금
            enable_error_webhook: extra.enable_error_webhook ?? false, //결제 오류시 Feedback URL로 webhook
            separately_confirmed: extra.separately_confirmed ?? true, // confirm 이벤트를 호출할지 말지, false일 경우 자동승인
            confirm_only_rest_api: extra.confirm_only_rest_api ?? false, // REST API로만 승인 처리
            open_type: extra.open_type ?? 'redirect', // [그대로 지정] 페이지 오픈 type [iframe, popup, redirect] 중 택 1, 앱에서는 redriect가 default 
            use_bootpay_inapp_sdk: extra.use_bootpay_inapp_sdk ?? true, // [그대로 지정] native app에서는 redirect를 완성도있게 지원하기 위한 옵션 
            redirect_url: extra.redirect_url ?? 'https://api.bootpay.co.kr/v2',  // [그대로 지정]  open_type이 redirect일 경우 페이지 이동할 URL ( 오류 및 결제 완료 모두 수신 가능 ) 
            display_success_result: extra.display_success_result ?? false,  // 결제 완료되면 부트페이가 제공하는 완료창으로 보여주기 ( open_type이 iframe, popup 일때만 가능 )
            display_error_result: extra.display_error_result ?? true, // 결제가 실패하면 부트페이가 제공하는 실패창으로 보여주기 ( open_type이 iframe, popup 일때만 가능 )
            show_close_button: extra.show_close_button ?? false, // x 닫기 버튼 삽입 (닫기버튼이 없는 PG사를 위한 옵션)
            use_welcomepayment: extra.use_welcomepayment ?? false, // 웰컴에서 스마트로 재판모듈 사용시 true 
        }; 


        this._payload = payload;
  

        //visibility가 true가 되면 webview onLoaded가 실행됨
        this.setState(
            {
                visibility: true,
                script: `
                ${await this.getMountJavascript()} 
                ${this.generateScript(payload, requestMethod)}
                `,
                firstLoad: false,
                showCloseButton: extra.show_close_button || false  
            }
        ) 

        UserInfo.updateInfo();  
    }
 


    dismiss = () => {
        this.setState(
            ({ visibility }) => ({
                visibility: false
            })
        )
        // this.removePaymentWindow();
    }
 

    getMountJavascript = async () => { 
        return `
        ${this.getSDKVersion()}
        ${this.getEnvironmentMode()}
        ${this.getBootpayPlatform()}
        ${this.close()}
        ${await this.getAnalyticsData()}
        `; 
    }


    generateScript= (payload, requestMethod) => {    
        const script = "Bootpay." + requestMethod + 
        `(${JSON.stringify(payload)})` +
        ".then( function (res) {" + 
        this.confirm() + 
        this.issued() + 
        this.done() + 
        "}, function (res) {" +
        this.error() + 
        this.cancel() + 
        "}); void(0);";
        
        return script;

        // return this.generateScript; 
    }

    onMessage = ({ nativeEvent }) => { 
        // console.log(`onMessage: ${nativeEvent}, ${JSON.stringify(nativeEvent)}`);

        if (nativeEvent == undefined) return;

        const res = JSON.parse(JSON.stringify(nativeEvent));
         
    
        if(res.data == 'close') {
            if(this.props.onClose == undefined) return;
            var json = {
                action: 'BootpayClose',
                message: '결제창이 닫혔습니다'
            } 
            this.props.onClose(json);
            this.dismiss();
            return;
        }

 
        const data = JSON.parse(res.data);
        // console.log(`redirect: ${JSON.stringify(data)}`);
 
        switch (data.event) {
            case 'cancel':
                if(this.props.onCancel != undefined) this.props.onCancel(data); 
                break;
            case 'error':
                if(this.props.onError != undefined) this.props.onError(data); 
                break;
            case 'issued':
                if(this.props.onIssued != undefined) this.props.onIssued(data);
                break;
            case 'confirm':
                if(this.props.onConfirm != undefined) this.props.onConfirm(data);
                break;
            case 'done':
                if(this.props.onDone != undefined) this.props.onDone(data); 
                break;
            case 'close':
                if(this.props.onClose != undefined) this.props.onClose(data);
                this.dismiss();
                break; 
        }
 
        

        if(this._payload != undefined && this._payload.extra != undefined && this._payload.extra.open_type == 'redirect') {
            
           
            if(data.event == 'done' && this._payload.extra.display_success_result != true) { 
                if(this.props.onClose != undefined) this.props.onClose(data);
                this.dismiss();
            } else if(data.event == 'error' && this._payload.extra.display_error_result != true ) { 
                if(this.props.onClose != undefined) this.props.onClose(data);
                this.dismiss();
            } else if(data.event == 'issued' && this._payload.extra.display_success_result != true ) { 
                if(this.props.onClose != undefined) this.props.onClose(data);
                this.dismiss();
            } else if(data.event == 'cancel') {
                if(this.props.onClose != undefined) this.props.onClose(data);
                this.dismiss();
            }
        }
    }

    onShouldStartLoadWithRequest = (url) => { 
        return true;
    }

    getSDKVersion = () => {
        if(Platform.OS == 'ios') {
            return "Bootpay.setVersion('" + this._VERSION + "', 'ios_react_native')";
            // return "Bootpay.setDevice('IOS');";
        } else if(Platform.OS == 'android'){
            return "Bootpay.setVersion('" + this._VERSION + "', 'android_react_native')";
            // return "Bootpay.setDevice('ANDROID');"; 
        }
    }

    getEnvironmentMode = () => {
        if(this._DEBUG) {
            return "Bootpay.setEnvironmentMode('development');";

        }
        return "";
    }

    getBootpayPlatform = () => { 
        if(Platform.OS == 'ios') {
            return "Bootpay.setDevice('IOS');";
        } else if(Platform.OS == 'android'){
            return "Bootpay.setDevice('ANDROID');"; 
        }
    }

    // setPayScript = () => {
        // const fullScript = this.generateScript(this.state.script);
        // this.injectJavaScript(fullScript);
        // if(this.state.showCloseButton == true) {
        //     if(this.webView == null || this.webView == undefined) return; 
        //     this.webView.showCloseButton();
        // }
    // } 

    transactionConfirm = () => { 
        const script = "Bootpay.confirm();"
        //  + 
        // ".then( function (res) {" + 
        // this.confirm() + 
        // this.issued() + 
        // this.done() + 
        // "}, function (res) {" +
        // this.error() + 
        // this.cancel() + 
        // "})";

        this.callJavaScript(script);
    }

    removePaymentWindow = () => {
        this.dismiss();
        // this.callJavaScript(`
        // Bootpay.removePaymentWindow();
        //   `);
    } 

    callJavaScript = (script) => { 
        if(this.webView == null || this.webView == undefined || this.webView == false) return;

        // console.log('callJavascript: ' + script);

        this.webView.injectJavaScript(`
        javascript:(function(){${script} })()
        `);
        //   this.webView.evalu
    }  

    getAnalyticsData = async () => { 
        const uuid = await UserInfo.getBootpayUUID(); 
        // const bootpaySK = await UserInfo.getBootpaySK();
        const bootLastTime = await UserInfo.getBootpayLastTime();      


        const elaspedTime = Date.now() - bootLastTime;  
        return `window.Bootpay.$analytics.setAnalyticsData({uuid:'${uuid}', time:${elaspedTime}});`;
        // this.callJavaScript(`window.BootPay.setAnalyticsData({uuid:'${uuid}',sk:'${bootpaySK}',sk_time:${bootLastTime},time:${elaspedTime}});`); 
    }

    confirm = () => {
        return "if (res.event === 'confirm') { window.BootpayRNWebView.postMessage( JSON.stringify(res) ); }";
    }

    done = () => {
        return "else if (res.event === 'done') { window.BootpayRNWebView.postMessage( JSON.stringify(res) ); }";
    }

    issued = () => {
        return "else if (res.event === 'issued') { window.BootpayRNWebView.postMessage( JSON.stringify(res) ); }";
    }

    error = () => {
        return "if (res.event === 'error') { window.BootpayRNWebView.postMessage( JSON.stringify(res) ); }";
    }

    cancel = () => {
        return "else if (res.event === 'cancel') { window.BootpayRNWebView.postMessage( JSON.stringify(res) ); }";
    }

    close = () => {
        return "document.addEventListener('bootpayclose', function (e) {  window.BootpayRNWebView.postMessage('close'); });";
    }
} 


var styles = StyleSheet.create({
    container: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: '#F5FCFF',
    },
    welcome: {
      fontSize: 20,
      textAlign: 'center',
      margin: 10,
    },
    // Flex to fill, position absolute, 
    // Fixed left/top, and the width set to the window width
    overlay: { 
      width: 25,
      height: 25, 
      right: 5,
      alignSelf: 'flex-end'
    }  
  });