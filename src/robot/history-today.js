const api = require('./api');
const {
    FileBox
} = require('wechaty');

async function get(msg) {
    api.getTodaysHistory(async function (res) {
        if (res.pic) {
            await msg.say(FileBox.fromUrl(res.pic));
        }
        await msg.say(res.title);
        await msg.say(res.des);
    });
}

module.exports = {
    get
};
