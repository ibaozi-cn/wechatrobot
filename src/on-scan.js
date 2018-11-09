function onScan(userKey, qrcode, status, callBack) {
    const scanUrl = `https://api.qrserver.com/v1/create-qr-code/?data=${encodeURIComponent(qrcode)}`;
    console.log(`${userKey} Scan QR Code to login: ${status}\n ${scanUrl}`);
    callBack(scanUrl)
}

module.exports = {
    onScan
};
