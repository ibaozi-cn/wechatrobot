const qrTerm = require("qrcode-terminal");

const Tuling123 = require("./tuling123");

const {
    config,
    log,
    Wechaty,
    Message,
    Friendship
} = require('wechaty');


const welcome = `
=============== Powered by Wechaty ===============
-------- https://github.com/Chatie/wechaty --------

I can talk with you using Tuling123.com
Apply your own tuling123.com API_KEY
at: http://www.tuling123.com/html/doc/api.html

__________________________________________________

Please wait... I'm trying to login in...
`;

console.log(welcome);

/**
 *
 * Apply Your Own Tuling123 Developer API_KEY at:
 * http://www.tuling123.com
 *
 */
const TULING123_API_KEY = '8ace61c729e7475190a14f4ed7679d7e';
const TULING123_API_KEY_2 = '0c5ce9bb0c4e4f43ae0fad21f88c38ba';

const tuling = new Tuling123(TULING123_API_KEY);
const tuling_2 = new Tuling123(TULING123_API_KEY_2);

const bot = new Wechaty();

bot.on('scan', onScan);
bot.on('login', onLogin);
bot.on('logout', onLogout);
bot.on('message', onMessage);
bot.on('error', onError);
// bot.on('friendship', onFriend);


bot.start()
    .catch(console.error);

function onScan(qrcode, status) {
    qrTerm.generate(qrcode, {small: true})  // show qrcode on console
}

function onLogin(user) {
    console.log(`${user} login`)
}

function onLogout(user) {
    console.log(`${user} logout`)
}

function onError(e) {
    console.error("onError============================" + e)
}

async function onMessage(msg) {

    console.log(`Message: ${msg}`);

    if (msg.self() || msg.room()) {
        return;
    }

    if (msg.type() !== Message.Type.Text) {
        await msg.say("目前只支持文本信息哦，很快就支持语音聊天了呢，敬请期待吧。");
        return;
    }

    if (msg.from().name() === '微信团队' || msg.text() === 'Ai小哆') {
        return;
    }

    let text = msg.text();

    if (text === "招募合伙人吗" || text === "能投资吗" || text === "需要合伙人吗") {
        await msg.say("想合作请联系我们的创始人：i校长 微信号：zhanyong0425");
        return;
    }
    console.log("msg text " + text);

    try {
        const {text: reply, url: url, list: listNews} = await tuling.ask(msg.text(), {userid: msg.from()});
        await msg.say(reply);
        if (url) {
            await msg.say(url);
        }
        if (listNews) {
            let news = msg;
            listNews.forEach(async function (item, index) {
                if (index > 3) return;
                await news.say(item.article + "\n" + item.detailurl);
            })
        }
    } catch (e) {
        console.error('Bot', 'on message tuling.ask() exception: %s', e && e.message || e)
    }

}

async function onFriend(friendship) {
    let logMsg;
    const fileHelper = bot.Contact.load('filehelper');

    try {
        logMsg = 'received `friend` event from ' + friendship.contact().name();
        await fileHelper.say(logMsg);
        console.log(logMsg);

        switch (friendship.type()) {
            /**
             *
             * 1. New Friend Request
             *
             * when request is set, we can get verify message from `request.hello`,
             * and accept this request by `request.accept()`
             */
            case Friendship.Type.Receive:
                if (friendship.hello() === 'Ai小哆') {
                    logMsg = 'accepted automatically because verify messsage is "Ai小哆"';
                    console.log('before accept');
                    await friendship.accept();

                    // if want to send msg , you need to delay sometimes
                    await new Promise(r => setTimeout(r, 1000));
                    await friendship.contact().say('您好，我叫Ai小哆，有什么可以帮助您的');
                    await friendship.contact().say('我可以帮您，查天气，查地理，查快递，查邮编，查历史人物，查新闻，算数，中英翻译，还可以讲笑话哦，总之您有什么需求尽管提，我也在不断学习哦。么么哒 [亲亲]');

                    console.log('after accept')

                } else {
                    await friendship.contact().say('口令不对哦，请输入Ai小哆');
                    logMsg = 'not auto accepted, because verify message is: ' + friendship.hello()
                }
                break;

            /**
             *
             * 2. Friend Ship Confirmed
             *
             */
            case Friendship.Type.Confirm:
                logMsg = 'friend ship confirmed with ' + friendship.contact().name();
                break
        }
    } catch (e) {
        logMsg = e.message
    }

    console.log(logMsg);
    await fileHelper.say(logMsg)

}
