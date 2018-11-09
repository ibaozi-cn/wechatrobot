const data = require('./data');

async function onError(userKey, error) {
    // console.log(`${userKey} error: ${error}`);
    data.pushErrorWechaty(userKey, error);
    data.pushWechatyStatus(userKey, false);
    let wechaty=data.getWechaty(userKey);
    if(wechaty){
        wechaty.stop()
    }
    data.pushWechaty(userKey, null);
}

module.exports = {
    onError
};
