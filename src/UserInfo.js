import { Component } from 'react';
import DeviceInfo from 'react-native-device-info';
import SInfo from 'react-native-sensitive-info';
export default class UserInfo extends Component {
    static getBootpayInfo = (key, defaultVal) => {
        return new Promise((resolve, reject) => {
            SInfo.getItem(key, {
                sharedPreferencesName: 'bootpaySharedPrefs',
                keychainService: 'bootpayKeychain'
            }).then((res) => {
                res == undefined ? resolve(defaultVal) : resolve(res);
                resolve(res);
            }).catch((error) => {
                reject(error);
            });
        });
    };
    static setBootpayInfo = (key, val) => {
        return new Promise((resolve, reject) => {
            SInfo.setItem(String(key), String(val), {
                sharedPreferencesName: 'bootpaySharedPrefs',
                keychainService: 'bootpayKeychain'
            }).then((res) => {
                resolve(res);
            }).catch((error) => {
                reject(error);
            });
        });
    };
    static getBootpayUUID = () => {
        let uuid = DeviceInfo.getUniqueId();
        return UserInfo.setBootpayInfo('uuid', uuid);
    };
    static getBootpaySK = () => {
        return UserInfo.getBootpayInfo('bootpay_sk', '');
    };
    static setBootpaySK = (val) => {
        return UserInfo.setBootpayInfo('bootpay_sk', val);
    };
    static newBootpaySK = (uuid, time) => {
        return UserInfo.setBootpaySK(`${uuid}_${time}`);
    };
    static getBootpayLastTime = async () => {
        return await UserInfo.getBootpayInfo('bootpay_last_time', 0);
    };
    static setBootpayLastTime(val) {
        return UserInfo.setBootpayInfo('bootpay_last_time', val);
    }
    static getBootpayUserId() {
        return UserInfo.getBootpayInfo('bootpay_user_id', '');
    }
    static setBootpayUserId = (val) => {
        return UserInfo.setBootpayInfo('bootpay_user_id', val);
    };
    static updateInfo = async () => {
        const uuid = await UserInfo.getBootpayUUID();
        const bootpaySK = await UserInfo.getBootpaySK();
        const lastTime = await UserInfo.getBootpayLastTime();
        let current = Date.now();
        if (bootpaySK == '')
            await UserInfo.newBootpaySK(uuid, current);
        const isExpired = current - lastTime > 30 * 60 * 1000;
        if (isExpired)
            await UserInfo.newBootpaySK(uuid, current);
        await UserInfo.setBootpayLastTime(current);
    };
}
