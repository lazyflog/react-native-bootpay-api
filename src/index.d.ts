import { Component, ReactNode } from 'react';
import { ViewProperties, EmitterSubscription } from 'react-native';
import { EventEmitter } from 'events';


import { BootpayWebView } from './BootpayWebView'
import { userTrace, pageTrace } from './BootpayAnalytics'


export { BootpayWebView, userTrace, pageTrace }

// interface BootpayWebViewProps {
//     ios_application_id: string;
//     android_application_id: string;

//     onCancel: (data: string) => void;
//     onError: (data: string) => void;
//     onReady: (data: string) => void;
//     onConfirm: (data: string) => void;
//     onDone: (data: string) => void;
//     onClose: () => void;
//   }

// export class BootpayWebView extends Component<BootpayWebViewProps> { 
//     request: (payload: Object, items: Object, user: Object, extra: Object) => Promise<string>;
//     dismiss: () => Promise<string>;
//     transactionConfirm: (data: string) => Promise<string>;
// }

// export class BootpayAnalytics {
//   static userTrace: () => void;
//   static pageTrace: () => void;
// }

// export const userTrace: () => void;
// export default function pageTrace(): void;
// export const userTrace: () => void;

// export default function PageTrace() : void;

// const Bootpay = 
 
// export { BootpayWebView, userTrace, pageTrace }