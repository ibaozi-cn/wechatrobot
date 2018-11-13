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

    let text = msg.text();

    if (msg.type() !== Message.Type.Text) {
        await msg.say("目前小哆只回复文本信息哦，很快就学会语音识别了呢");
        return;
    }

    if (text === "招募" || text === "合伙人" || text === "缺合伙人吗" || text === "需要合伙人吗") {
        await msg.say("加入我们，请联系我的创始人：校长，微信：zhanyong0425");
        return;
    }

    if (msg.self() || msg.room() || msg.from().name() === '微信团队' || text === 'Ai小哆') {
        return;
    }

    try {
        const {text: reply} = await tuling.ask(msg.text(), {userid: msg.from()});
        await msg.say(reply)
    } catch (e) {
        console.error('Bot', 'on message tuling.ask() exception: %s', e && e.message || e)
    }

}

module.exports = {
    onMessage
};
