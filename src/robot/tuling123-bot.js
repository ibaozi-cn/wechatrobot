const qrTerm = require("qrcode-terminal");

const Tuling123 = require("./tuling123");
const util = require("../utils");

const fs = require('fs');

const cacheImageName = [];

const outReplyList = ["小哆退下了", "有事叫我，我走了", "我去休息了，么么哒", "没电了,我去充充电", "时间到了，我要走了，有事call me", "我走了，五星好评哦亲"];

const {
    config,
    log,
    Wechaty,
    Message,
    Friendship,
    FileBox
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

let isAutoReply = false;
let isAutoReplyRoom = {};

bot.start()
    .catch(console.error);

function onScan(qrcode, status) {
    qrTerm.generate(qrcode, {small: true})  // show qrcode on console
}

function onLogin(user) {
    console.log(`${user} login`);
    fs.readdir("image/", (error, files) => {
        if (!files) return;
        // console.log("files====" + JSON.stringify(files));
        files.forEach(file => {
            cacheImageName.push(file)
        });
    })
}

function onLogout(user) {
    console.log(`${user} logout`);
    randomImageList = [];
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

    if (msg.type() !== Message.Type.Text) {
        switch (msg.type()) {
            case Message.Type.Image:
                const fileName = msg.payload.filename;
                if (fileName && fileName.endsWith("gif")) {
                    const file = await msg.toFileBox();
                    const name = file.name;
                    console.log('Save file to: ' + name);
                    file.toFile("image/" + name, true);
                    cacheImageName.push(name);
                }
                const length = cacheImageName.length;
                const randImage = randUnique(0, length, 10);
                const imageName = cacheImageName[randImage[2]];
                const filebox = FileBox.fromFile('image/' + imageName);
                if (filebox)
                    msg.say(filebox);
                break;
        }
        return;
    }

    if (messageContent.includes("开启了朋友验证")) {
        console.log("不是好友了已经");
        return;
    }

    if (messageContent === "[Send an emoji, view it on mobile]") {
        // await msg.say("");
        return;
    }

    const room = msg.room();

    if (room) {
        if (isAutoReply && isAutoReplyRoom[room.id]) {
            console.log("开启自动回复三分钟");
            await reply(msg);
            return
        }
        if (messageContent.includes("小哆")) {
            isAutoReply = true;
            isAutoReplyRoom[room.id] = true;
            setTimeout(function () {
                isAutoReply = false;
                isAutoReplyRoom[room.id] = false;
                const index = randUnique(0, outReplyList.length, 1)[0];
                room.say(outReplyList[index]);
                console.log("关闭自动回复");
            }, 1000 * 60 * 3);
            await reply(msg)
        }
        return;
    }

    await reply(msg)
}

async function reply(msg) {
    try {
        let text = msg.text();
        if (text.includes("小哆")) {
            text = text.replace("小哆", "");
            if (text.includes("@Ai")) {
                text = text.replace("@Ai", "");
            }
            console.log("replace text======" + text);
        }
        const {text: reply, url: url, list: listNews} = await tuling.ask(text, {userid: msg.from()});
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
    "依然饭特稀西交流群2": roomRule,
    "@@1abc14164bd56a9557319c34a6fd55d5f3b14c676163abacf1d684abf315daa3": roomRule
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

/**
 * 获取不重复随机数
 * @param integer start 随机数最小值
 * @param integer end 随机数最大值
 * @param integer size 随机数获取数量 最小为1，默认1
 * @return integer|array 如 1或者[2,4,7,9]
 */
function randUnique(start, end, size) {
    // 全部随机数值
    const allNums = [];

    // 判断获取随机数个数
    size = size ? (size > end - start ? end - start : size) : 1;

    // 生成随机数值区间数组
    for (let i = start, k = 0; i <= end; i++, k++) {
        allNums[k] = i;
    }

    // 打撒数组排序
    allNums.sort(function () {
        return 0.5 - Math.random();
    });

    // 获取数组从第一个开始到指定个数的下标区间
    return allNums.slice(0, size);
}
