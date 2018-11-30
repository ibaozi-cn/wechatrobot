const qrTerm = require("qrcode-terminal");

const Tuling123 = require("./tuling123");
const util = require("../utils");

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
bot.on('friendship', onFriend);
bot.on('room-join', onRoomJoin);
// bot.on('room-leave',onRoomLeave);

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

    console.log(`消息: ${msg}`);

    if (msg.self()) {
        return;
    }

    const messageContent = msg.text();

    if (messageContent.includes("招募合伙人吗" || "能投资吗" || "需要合伙人吗" || "合伙吗")) {
        await msg.say("想合作请联系我们的创始人：i校长 微信号：zhanyong0425");
        return;
    }

    if (msg.from().name() === '微信团队') {
        return;
    }

    if (messageContent.includes("开启了朋友验证")) {
        console.log("不是好友了已经");
        return;
    }

    if (messageContent === "[Send an emoji, view it on mobile]") {
        await reply(msg);
        return;
    }


    if (msg.room()) {
        if (messageContent.includes("小哆" || "小多")) {
            await reply(msg)
        }
        if (msg.type() !== Message.Type.Text) {
            switch (msg.type()) {
                case Message.Type.Image:
                    const file = await msg.toFileBox();
                    const name = file.name;
                    file.toFile("../../public/" + name, true);
                    break;
            }
        }
        return;
    }

    if (msg.type() !== Message.Type.Text) {
        await msg.say("目前只支持文本信息哦！");
        return;
    }


    await reply(msg)
}

async function reply(msg) {
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
        console.error('Bot', '消息异常: %s', e && e.message || e)
    }
}


async function onFriend(friendship) {
    let logMsg;
    const fileHelper = bot.Contact.load('filehelper');

    try {
        logMsg = '来自添加好友动作：' + friendship.contact().name();
        await fileHelper.say(logMsg);
        console.log(logMsg);
        const hello = friendship.hello();
        switch (friendship.type()) {
            case Friendship.Type.Receive:
                if (util.compare(hello, '爱小哆')) {
                    logMsg = '自动同意了好友添加请求，口令是： "爱小哆"';
                    await friendship.accept();

                    // if want to send msg , you need to delay sometimes
                    await new Promise(r => setTimeout(r, 1000 * 5));
                    await friendship.contact().say('您好，我叫Ai小哆，有什么可以帮助您的');
                    await friendship.contact().say('我可以帮您，查天气，查地理，查快递，查邮编，查历史人物，查新闻，算数，中英翻译，还可以讲笑话哦，总之您有什么需求尽管提，我也在不断学习哦。么么哒 [亲亲]');
                    await friendship.contact().say('我还可以做您的群助手，自动欢迎群新成员，把我设置成群管理后，我还能帮您拉人、踢人等，只需您发一个指令');
                } else {
                    logMsg = '不允许，因为他发送的消息是：' + friendship.hello()
                }
                break;

            case Friendship.Type.Confirm:
                logMsg = '朋友确认' + friendship.contact().name();
                break
        }
    } catch (e) {
        logMsg = e.message
    }

    console.log(logMsg);
    await fileHelper.say(logMsg)

}

const roomRule = "本群群规，新老同学请注意：\n" +
    "\n" +
    "1. 禁止向群里发广告、二维码、团购优惠券领取、支付宝口令，小程序、广告推文等信息（违者至少10元红包，否则t）\n" +
    "\n" +
    "2. 本群为技术讨论群，上班期间尽量少吹水，多多解答问题，相互帮助，这也是建群的原因。\n" +
    "\n" +
    "3. 修改一下群名片 ,格式为: 城市 - 昵称";

const ruleMap = {
    "依然范特西技术交流群": roomRule,
    "依然范特西技术交流群2": roomRule
};

async function onRoomJoin(room, inviteeList, inviter) {
    log.info('Bot', '动作: 入群 "%s" 新增新成员 "%s", 被拉进来 "%s"',
        await room.topic(),
        inviteeList.map(c => c.name()).join(','),
        inviter.name(),
    );
    console.log('机器人入群 id:', room.id);
    const topic = await room.topic();
    await room.say(`欢迎加入 "${topic}"!`, inviteeList[0]);
    const rule = ruleMap[topic];
    if (rule)
        await room.say(rule, inviteeList[0]);
}

