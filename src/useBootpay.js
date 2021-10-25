// import { useCallback } from 'react';
// import BootpayAnalytics  from './BootpayAnalytics';
// import BootpayWebView from './BootpayWebView'; 

// export const useBootpay = () => {
//     const bootpay = useRef(new BootpayWebView());
//     // const anlaytics = useRef(new BootpayAnalytics());

//     const [bootpayEvents, setBootpayEvents] = useState([]);

//     const request = useCallback((payload, items, user, extra) => {
//         console.log('use call reqeust');
//         return bootpay.current.request(payload, items, user, extra);
//     }, []);

//     const dismiss = useCallback(() => {
//         console.log('use call dismiss');
//         return bootpay.current.dismiss();
//     }, []);

//     const transactionConfirm = useCallback((data) => {
//         console.log('use call transactionConfirm');
//         return bootpay.current.transactionConfirm(data);
//     }, []);

//     const userTrace = useCallback(() => {

//         console.log('user trace click');
//         BootpayAnalytics.userTrace();
//         // return anlaytics.current.userTrace();
//     }, []);

//     const pageTrace = useCallback(() => {
//         BootpayAnalytics.pageTrace();
//         // return anlaytics.current.pageTrace();
//     }, []);

//     return [
//         {
//           bootpayEvents,
//         },
//         {
//             request,
//             transactionConfirm,
//             dismiss,
//             text,
//             userTrace,
//             pageTrace
//         },
//       ];
// }
