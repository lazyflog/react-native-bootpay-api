

import React, { Component, useRef } from 'react';
import { SafeAreaView, Modal, Platform, TouchableOpacity, Image, StyleSheet } from 'react-native';
import WebView  from 'react-native-webview-bootpay';
import UserInfo from './UserInfo'

export class BootpayWebView extends Component {
    webView = useRef<WebView>(null); 

    state = {
        visibility: false, 
        script: '',
        firstLoad: false
    } 
s
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
            visible={this.state.visibility}>
            <SafeAreaView style={{ flex: 1 }}>
                {
                    this.state.showCloseButton &&
                    <TouchableOpacity
                        onPress={() => {
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
                        uri: 'https://inapp.bootpay.co.kr/3.3.3/production.html'
                    }}
                    injectedJavaScript={this.state.script}
                    javaScriptEnabled={true}
                    javaScriptCanOpenWindowsAutomatically={true}
                    scalesPageToFit={true} 
                    onMessage={this.onMessage}
                    onShouldStartLoadWithRequest={this.onShouldStartLoadWithRequest}
                />
            </SafeAreaView>

        </Modal>
    }

    request = async (payload, items, user, extra) => {        

        payload.application_id =  Platform.OS == 'ios' ? this.props.ios_application_id : this.props.android_application_id;
        payload.items = items;
        payload.user_info = user;
        payload.extra = extra; 

        // this.state.script = await this.getMountJavascript(); 
        // this.setState({showCloseButton: true}); 

        var quickPopup = '';

        if(extra != undefined) {
            if(extra.quick_popup == 1) {
                quickPopup = 'BootPay.startQuickPopup();';
            }
        }
        // injectedJavaScript += 'BootPay.request(' + JSON.stringify(payload) + ')';

        

        //visibility가 true가 되면 webview onLoaded가 실행됨
        this.setState(
            {
                visibility: true,
                script: `
                ${await this.getMountJavascript()}
                ${quickPopup}
                ${this.generateScript(payload)}
                `,
                firstLoad: false,
                showCloseButton: extra.show_close_button
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
        this.removePaymentWindow();
    }

    // uri: 'https://inapp.bootpay.co.kr/3.3.1/production.html'
    // onLoadEnd = async (e) => { 
        // if(this.state.firstLoad == true) return;

        // this.setBootpayPlatform();
        // await this.setAnalyticsData();
        // this.setPayScript();
        // this.startBootpay();

        // this.setState({
        //     ...this,
        //     firstLoad: true
        // }) 
    // }

    getMountJavascript = async () => { 
        return `
        ${this.getBootpayPlatform()}
        ${await this.getAnalyticsData()}
        `; 
    }


    generateScript= (payload) => {

        // BootPay.request(${JSON.stringify(payload)})

        const onError = '.error(function(data){ window.BootpayRNWebView.postMessage( JSON.stringify(data) ); })';
        const onCancel = '.cancel(function(data){ window.BootpayRNWebView.postMessage( JSON.stringify(data) ); })';
        const onReady = '.ready(function(data){ window.BootpayRNWebView.postMessage( JSON.stringify(data) ); })';
        const onConfirm = '.confirm(function(data){ window.BootpayRNWebView.postMessage( JSON.stringify(data) ); })';
        const onClose = '.close(function(data){ window.BootpayRNWebView.postMessage("close"); })';
        const onDone = '.done(function(data){ window.BootpayRNWebView.postMessage( JSON.stringify(data) ); })';

        return `BootPay.request(${JSON.stringify(payload)})` + onError + onCancel + onReady + onConfirm + onClose + onDone + '; void(0);';
    }

    onMessage = ({ nativeEvent }) => { 
        if (nativeEvent == undefined || nativeEvent.data == undefined) return;
    
        if(nativeEvent.data == 'close') {
            if(this.props.onClose == undefined) return;
            var json = {
                action: 'BootpayClose',
                message: '결제창이 닫혔습니다'
            }
            this.props.onClose(json);
            this.dismiss();
            return;
        }

        const data = JSON.parse(nativeEvent.data);
        switch (data.action) {
            case 'BootpayCancel':
                if(this.props.onCancel != undefined) this.props.onCancel(data);
                this.setState(
                    {
                        visibility: false
                    }
                )
                break;
            case 'BootpayError':
                if(this.props.onError != undefined) this.props.onError(data);
                this.setState(
                    {
                        visibility: false
                    }
                )
                break;
            case 'BootpayBankReady':
                if(this.props.onReady != undefined) this.props.onReady(data);
                break;
            case 'BootpayConfirm':
                if(this.props.onConfirm != undefined) this.props.onConfirm(data);
                break;
            case 'BootpayDone':
                if(this.props.onDone != undefined) this.props.onDone(data);
                this.setState(
                    {
                        visibility: false
                    }
                )
                break;
        }
    }

    onShouldStartLoadWithRequest = (url) => { 
        return true;
    }

    getBootpayPlatform = () => { 
        if(Platform.OS == 'ios') {
            return "BootPay.setDevice('IOS');";
        } else if(Platform.OS == 'android'){
            return "BootPay.setDevice('ANDROID');"; 
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

    transactionConfirm = (data) => {
        var json = JSON.stringify(data)
        this.callJavaScript(`
        BootPay.transactionConfirm(${json});
          `);
    }

    removePaymentWindow = () => {
        this.callJavaScript(`
        BootPay.removePaymentWindow();
          `);
    } 

    callJavaScript = (script) => {
        if(this.webView == null || this.webView == undefined) return;
        this.webView.callJavaScript(`
        javascript:(function(){${script} })()
          `);
    }  

    getAnalyticsData = async () => { 
        const uuid = await UserInfo.getBootpayUUID(); 
        const bootpaySK = await UserInfo.getBootpaySK();
        const bootLastTime = await UserInfo.getBootpayLastTime();      


        const elaspedTime = Date.now() - bootLastTime;  
        return `window.BootPay.setAnalyticsData({uuid:'${uuid}',sk:'${bootpaySK}',sk_time:${bootLastTime},time:${elaspedTime}});`;
        // this.callJavaScript(`window.BootPay.setAnalyticsData({uuid:'${uuid}',sk:'${bootpaySK}',sk_time:${bootLastTime},time:${elaspedTime}});`); 
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