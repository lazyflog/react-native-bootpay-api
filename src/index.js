 
// import { useBootpay } from './useBootpay';
import { BootpayWebView } from './BootpayWebView'
import { userTrace, pageTrace } from './BootpayAnalytics'

export {  BootpayWebView, userTrace, pageTrace };
// export { useBootpay };

// import React, { Component } from 'react';
// import WebView  from 'react-native-webview-bootpay';

// export class BootpayWebView extends Component {
//     render() {
//         return <WebView 
//             useWebKit={true}
//             originWhitelist={['*']}
//             source={{
//                 uri: 'https://www.google.com'
//             }}
//             javaScriptEnabled={true}
//             javaScriptCanOpenWindowsAutomatically={true}
//             scalesPageToFit={true}  
//         />
//     }
// } 