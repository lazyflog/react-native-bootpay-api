
 
import base64 from 'react-native-base64'
import DeviceInfo from 'react-native-device-info';

// import CryptoJS from 'crypto-js'; 
import { NativeModules } from 'react-native'
var Aes = NativeModules.Aes


const userTrace = async (applicationId, userId, phone, email, gender, birth, area) => { 
    try {        
        const payload = {
            "id": userId,            
            "ver": DeviceInfo.getVersion(),
            "application_id": applicationId, 
            "phone": phone,
            "email": email,
            "gender": gender,
            "birth": birth,
            "area": area
        };

        var key = getRandomKey(32);
        var iv = getRandomKey(16);
  
        try { 
            const data = await Aes.encrypt(JSON.stringify(payload), stringToHex(key), stringToHex(iv)).then(cipher => cipher);

            const response = await fetch(
                'https://analytics.bootpay.co.kr/login',
                {
                    method: 'POST',
                    headers: {
                        Accept: 'application/json',
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        data: data,
                        session_key: await getSessionKey(key, iv)
                    })
                }
              );
              const json = await response.json();
              return json;
        } catch (e) {
            console.log(e);
        } 
    } catch (error) {
        console.error(error);
    }
}

const pageTrace = async (applicationId, url, pageType, items) => {    
    try {        
        const payload = {
            "application_id": applicationId, 
            "url": url,            
            "page_type": pageType,
            "items": items,
            "referer": ''
        };        

        var key = getRandomKey(32);
        var iv = getRandomKey(16);
  
        try { 
            const data = await Aes.encrypt(JSON.stringify(payload), stringToHex(key), stringToHex(iv)).then(cipher => cipher);

            const response = await fetch(
                'https://analytics.bootpay.co.kr/call',
                {
                    method: 'POST',
                    headers: {
                        Accept: 'application/json',
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        data: data,
                        session_key: await getSessionKey(key, iv)
                    })
                }
              );
              const json = await response.json();
              return json;
        } catch (e) {
            console.log(e);
        } 
    } catch (error) {
        console.error(error);
    }
}

const stringToHex = (str) => {
    var hex = ''
    for (var i = 0, l = str.length; i < l; i++) {
        hex += str.charCodeAt(i).toString(16)
    }
    return hex
}

const getRandomKey = (length) => {
    var text = '';
    var keys = 'abcdefghijklmnopqrstuvwxyz1234567890ABCDEFGHIJKLMNOPQRSTUVWXYZ';

    for (var i = 0; i < length; i++)
        text += keys.charAt(Math.floor(Math.random() * keys.length));

    return text;
}


const getSessionKey = async (key, iv) => {
    const keyValue = base64.encode(key);
    const ivValue = base64.encode(iv);

    return `${keyValue}##${ivValue}`;
}

const strEncode = async (str, key, iv) => {
    return await Aes.encrypt(str, key, iv).then(cipher => {
        Aes.hmac256(cipher, key).then(hash => {
            console.log('HMAC', hash)
            return hash;
        })
    })

}

export { userTrace, pageTrace }
