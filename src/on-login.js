const data = require('./data');

function onLogin(userKey, user, callback) {

    console.log(`${userKey} User ${user} logined`);

    data.pushWechatyStatus(userKey, true);

    callback()
}

module.exports = {
    onLogin
};
