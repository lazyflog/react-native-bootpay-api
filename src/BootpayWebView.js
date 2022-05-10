

import React, { Component, useRef, useEffect } from 'react';
import { SafeAreaView, Modal, Platform, TouchableOpacity, Image, StyleSheet,  BackHandler} from 'react-native';
import WebView  from 'react-native-webview-bootpay';
import UserInfo from './UserInfo'

export class BootpayWebView extends Component {
 

    webView = useRef<WebView>(null); 

    
    state = {
        visibility: false, 
        script: '',
        firstLoad: false
    } 
 
    // canGoBack() {
    //     console.log('canGoBack');
    //     if(this.webView.current) {
    //         return this.webView.current.canGoBack();
    //     }
    //     return false;
    // }

    // goBack() {
    //     console.log('GoBack');
    //     if(this.webView.goBack) {
    //         this.webView.current.goBack();
    //     }
    // }

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

    // componentDidMount() {
    //     // if(this.webView == null || this.webView == undefined || this.webView == false) return;

    //     console.log('componentDidMount: ' + this.close());

    //     this.webView.injectJavaScript(`
    //     javascript:(function(){${this.close()} })()
    //     `);
        
    // }
 
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
                        uri: 'https://webview.bootpay.co.kr/4.0.0/'
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
        payload.extra = extra; 
  

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
        if (nativeEvent == undefined || nativeEvent.data == undefined) return;
        

        console.log(`onMessage: ${nativeEvent.data}`);
    
        if(nativeEvent.data == 'close') {
            if(this.props.onClose == undefined) return;
            var json = {
                action: 'BootpayClose',
                message: '결제창이 닫혔습니다'
            }
            // this.setState(
            //     {
            //         visibility: false
            //     }
            // )
            this.props.onClose(json);
            this.dismiss();
            return;
        }

        const data = JSON.parse(nativeEvent.data);
        switch (data.event) {
            case 'cancel':
                if(this.props.onCancel != undefined) this.props.onCancel(data); 
                break;
            case 'error':
                if(this.props.onError != undefined) this.props.onError(data); 
                break;
            case 'issued':
                if(this.props.onReady != undefined) this.props.onIssued(data);
                break;
            case 'confirm':
                if(this.props.onConfirm != undefined) this.props.onConfirm(data);
                break;
            case 'done':
                if(this.props.onDone != undefined) this.props.onDone(data); 
                break;
            case 'close':
                if(this.props.onClose != undefined) this.props.onClose(data);
                break;
        }
    }

    onShouldStartLoadWithRequest = (url) => { 
        return true;
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
        const script = "Bootpay.confirm()" + 
        ".then( function (res) {" + 
        this.confirm() + 
        this.issued() + 
        this.done() + 
        "}, function (res) {" +
        this.error() + 
        this.cancel() + 
        "})";

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