import {UAParser} from "ua-parser-js";


const userAgent = navigator.userAgent;

export const getDeviceInfo = () => {
    const parser = new UAParser(userAgent);
    const result = parser.getResult();
    console.info("Device info: ", result);

    let deviceId = getDeviceId(); // Retrieve or generate a unique device ID

    return {
        deviceId,
        browser: result.browser.name || "Unknown",
        
        OS: result.os.name || "Unknown",
        
        deviceName: result.device.type || "desktop",
        userAgent: result.ua || "Unknown"
    };
};

export const getDeviceId = () =>{
    let deviceId = localStorage.getItem("deviceId");

    if (!deviceId) {
        deviceId = crypto.randomUUID();
        localStorage.setItem("deviceId", deviceId);
    }
    return deviceId;
}