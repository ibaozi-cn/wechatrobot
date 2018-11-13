const Tuling123 = require("./robot/tuling123");
const TULING123_API_KEY = '8ace61c729e7475190a14f4ed7679d7e';
const tuling = new Tuling123(TULING123_API_KEY);

const {
    Wechaty,
    Message,
} = require('wechaty');

async function onMessage(userKey, msg) {

    console.log(` ${userKey} Message: ${msg}`);

    // Skip message from self, or inside a room

    if (msg.self() || msg.room() || msg.from().name() === '微信团队' || msg.text() === 'Ai小哆' || msg.type() !== Message.Type.Text) {
        return;
    }

    let text = msg.text();

    console.log("msg text " + text);

    try {
        const {text: reply, url: url} = await tuling.ask(msg.text(), {userid: msg.from()});
        await msg.say(reply);
        await msg.say(url)
    } catch (e) {
        console.error('Bot', 'on message tuling.ask() exception: %s', e && e.message || e)
    }

}

module.exports = {
    onMessage
};
