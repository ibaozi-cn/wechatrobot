const data = require('./data');

function onLogout(userKey, user) {
    console.log(`${userKey} User ${user} logined`);
    data.pushWechatyStatus(userKey, false);
    const wechaty = data.getWechaty(userKey);
    if(wechaty){
        wechaty.stop().catch(e => {
            console.error(`${userKey} User ${user} Bot stop() fail:`, e);
        });
    }
}

module.exports = {
    onLogout
};
