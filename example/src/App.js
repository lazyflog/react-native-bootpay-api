import React, { useRef, useEffect } from 'react';
import { BackHandler } from 'react-native';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import { BootpayWebView, userTrace, pageTrace } from 'react-native-bootpay-api';
export default function App() {
    const bootpay = useRef(null);
    // const api = useRef<BootpayAnalytics>(null);
    const onAndroidBackPress = () => {
        console.log(1234);
        // if (bootpay.current) {
        //   if(bootpay.current.canGoBack()) {
        //     bootpay.current.goBack();
        //   } else {
        //     bootpay.current.dismiss();
        //   }
        //   return true; // prevent default behavior (exit app)
        // }
        return false;
    };
    useEffect(() => {
        BackHandler.addEventListener('hardwareBackPress', onAndroidBackPress);
        return () => {
            BackHandler.removeEventListener('hardwareBackPress', onAndroidBackPress);
        };
    }, []); // Never
    const onAnalyticsPress = async () => {
        //회원 추적
        await userTrace('5b8f6a4d396fa665fdc2b5e9', 'user_1234', '01012345678', 'rupy1014@gmail.com', 1, '861014', '서울');
        //결제되는 상품정보들로 통계에 사용되며, price의 합은 결제금액과 동일해야함 
        const items = [
            {
                item_name: '키보드',
                unique: 'ITEM_CODE_KEYBOARD',
                price: 1000,
                cat1: '패션',
                cat2: '여성상의',
                cat3: '블라우스', //카테고리 하, 자유롭게 기술
            },
            {
                item_name: '마우스',
                unique: 'ITEM_CODE_KEYBOARD',
                price: 2000,
                cat1: '패션2',
                cat2: '여성상의2',
                cat3: '블라우스2', //카테고리 하, 자유롭게 기술
            }
        ];
        //페이지 추적 
        await pageTrace('5b8f6a4d396fa665fdc2b5e9', 'main_page_1234', '', items);
    };
    const onPayPress = () => {
        console.log('onPayPress');
        const payload = {
            pg: 'danal',
            name: '마스카라',
            order_id: '1234_1234',
            method: 'card',
            price: 1000 //결제금액 
        };
        //결제되는 상품정보들로 통계에 사용되며, price의 합은 결제금액과 동일해야함 
        const items = [
            {
                item_name: '키보드',
                qty: 1,
                unique: 'ITEM_CODE_KEYBOARD',
                price: 1000,
                cat1: '패션',
                cat2: '여성상의',
                cat3: '블라우스', //카테고리 하, 자유롭게 기술
            }
        ];
        //구매자 정보로 결제창이 미리 적용될 수 있으며, 통계에도 사용되는 정보 
        const user = {
            id: 'user_id_1234',
            username: '홍길동',
            email: 'user1234@gmail.com',
            gender: 0,
            birth: '1986-10-14',
            phone: '01012345678',
            area: '서울',
            addr: '서울시 동작구 상도로' //주소
        };
        //기타 설정
        const extra = {
            app_scheme: "bootpayrnapi",
            expire_month: "0",
            vbank_result: true,
            start_at: "",
            end_at: "",
            quota: "0,2,3",
            offer_period: "",
            popup: 1,
            quick_popup: 1,
            locale: "ko",
            disp_cash_result: "Y",
            escrow: "0",
            theme: "purple",
            custom_background: "",
            custom_font_color: "",
            show_close_button: true
        };
        if (bootpay != null && bootpay.current != null)
            bootpay.current.request(payload, items, user, extra);
    };
    const onCancel = (data) => {
        console.log('cancel', data);
        var json = JSON.stringify(data);
        console.log('cancel json', json);
    };
    const onError = (data) => {
        console.log('error', data);
    };
    const onReady = (data) => {
        console.log('ready', data);
    };
    const onConfirm = (data) => {
        console.log('confirm', data);
        if (bootpay != null && bootpay.current != null)
            bootpay.current.transactionConfirm(data);
    };
    const onDone = (data) => {
        console.log('done', data);
    };
    const onClose = () => {
        console.log('closed');
    };
    // React.useEffect(() => {
    //   BootpayApi.multiply(3, 7).then(setResult);
    // }, []);
    return (React.createElement(View, { style: styles.container },
        React.createElement(BootpayWebView, { ref: bootpay, ios_application_id: '5b8f6a4d396fa665fdc2b5e9', android_application_id: '5b8f6a4d396fa665fdc2b5e8', onCancel: onCancel, onError: onError, onReady: onReady, onConfirm: onConfirm, onDone: onDone, onClose: onClose }),
        React.createElement(TouchableOpacity, { style: styles.button, onPress: onAnalyticsPress },
            React.createElement(Text, null, "analytics click")),
        React.createElement(TouchableOpacity, { style: styles.button, onPress: onPayPress },
            React.createElement(Text, null, "pay click"))));
}
const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: "#00DDDD",
    },
    button: {
        alignItems: "center",
        backgroundColor: "#DDDDDD",
        padding: 10
    },
});
