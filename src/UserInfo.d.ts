import { Component } from 'react';
export default class UserInfo extends Component {
    static getBootpayInfo: (key: string, defaultVal: any) => Promise<unknown>;
    static setBootpayInfo: (key: string, val: any) => Promise<unknown>;
    static getBootpayUUID: () => Promise<unknown>;
    static getBootpaySK: () => Promise<unknown>;
    static setBootpaySK: (val: string) => Promise<unknown>;
    static newBootpaySK: (uuid: string, time: number) => Promise<unknown>;
    static getBootpayLastTime: () => Promise<unknown>;
    static setBootpayLastTime(val: number): Promise<unknown>;
    static getBootpayUserId(): Promise<unknown>;
    static setBootpayUserId: (val: string) => Promise<unknown>;
    static updateInfo: () => Promise<void>;
}
//# sourceMappingURL=UserInfo.d.ts.map