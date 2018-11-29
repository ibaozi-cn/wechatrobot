const qrTerm = require("qrcode-terminal");

const Tuling123 = require("./robot/tuling123");
const path = require('path');
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

const msgGroup2 = "【居理员工group群2规2】\n" +
    "格式：城市+部门+姓名，例：集团员满兴汉哥；\n" +
    "注⚠️：\n" +
    "1、【工作号不得入群，仅限私人号】咨询，渠道同事的工作号入群会被清退出群；\n" +
    "2、已经在一群的成员也不要入二群避免占新人名额；\n" +
    "3、【离职小伙伴请配合退出】；\n" +
    "\n" +
    "⚠️入群24小时内没修改备注的小伙伴将清退出群，请相互通知！！\n" +
    "\n" +
    "线上管理者请拉新进的员工：）\n" +
    "已在一群的非管理者可不用在二群，内容都一样，不用占新人名额：）";

const msgGroup1 = "【居理员工group群1规2】\n" +
    "格式：城市+部门+姓名，例：集团员满兴汉哥；\n" +
    "注⚠️：\n" +
    "1、【工作号不得入群，仅限私人号】咨询，渠道同事的工作号入群会被清退出群；\n" +
    "2、已经在一群的成员也不要入二群避免占新人名额；\n" +
    "3、【离职小伙伴请配合退出】；\n" +
    "\n" +
    "⚠️入群24小时内没修改备注的小伙伴将清退出群，请相互通知！！\n" +
    "\n" +
    "线上管理者请拉新进的员工：）\n" +
    "已在一群的非管理者可不用在二群，内容都一样，不用占新人名额：）";

const msgGroup = "【居理员工group群规】\n" +
    "格式：城市+部门+姓名，例：集团员满兴汉哥；\n" +
    "注⚠️：\n" +
    "1、【工作号不得入群，仅限私人号】咨询，渠道同事的工作号入群会被清退出群；\n" +
    "2、已经在一群的成员也不要入二群避免占新人名额；\n" +
    "3、【离职小伙伴请配合退出】；\n" +
    "\n" +
    "⚠️入群24小时内没修改备注的小伙伴将清退出群，请相互通知！！\n" +
    "\n" +
    "线上管理者请拉新进的员工：）\n" +
    "已在一群的非管理者可不用在二群，内容都一样，不用占新人名额：）";


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

    console.log(`Message: ${msg}`);

    let text = msg.text();
    // console.log("msg text " + text);

    if (text === "[Send an emoji, view it on mobile]") {
        msg.say("您发的表情目前没办法转发，十分抱歉。");
        return;
    }
    if (msg.self()) {
        return;
    }

    if (msg.from().name() === '微信团队') {
        return;
    }
    const room = msg.room();

    if (room) {

        if (text === "发群规") {
            room.say(msgGroup)
        }

        return;
    }

    if (msg.type() !== Message.Type.Text) {
        // await msg.say("目前只支持文本信息哦，很快就支持语音聊天了呢，敬请期待吧。");
        const room1 = await bot.Room.find("居理测试机器人群1");
        switch (msg.type()) {
            case Message.Type.Image:
                // console.log("msg json"+JSON.stringify(msg));
                // const url = await msg.toUrlLink();
                // room1.say(url);
                const fileName = msg.payload.filename;
                if (fileName && fileName.endsWith("gif")) {
                    const file = await msg.toFileBox();
                    room1.say(file);
                }
                if (fileName && fileName.endsWith("jpg")) {
                    const file = await msg.toFileBox();
                    // const name = file.name;
                    // console.log('Save file to: ' + name);
                    // file.toFile(name);
                    // room1.say(file);
                    // const r = filePath => path.resolve(__dirname, filePath);
                    // const filepath = r('./9124625869023057319.jpg');
                    // const filefox = FileBox.fromFile(filepath,"9124625869023057319.jpg");
                    room1.say(file);
                }
                break;
            case Message.Type.Emoticon:
                console.log("msg json" + JSON.stringify(msg));


                break;

        }


        return;
    } else {
        console.log("msg text json" + JSON.stringify(msg));
    }
    if (text.startsWith("发段子")) {
        const duanzi = text.substring(3);
        const room2 = await bot.Room.find("居理测试机器人群2");
        const room1 = await bot.Room.find("居理测试机器人群1");
        room1.say(duanzi);
        room2.say(duanzi);
        return
    }
    if (text.startsWith("发群1段子")) {
        const duanzi = text.substring(5);
        const room = await bot.Room.find("居理测试机器人群1");
        room.say(duanzi);
        return
    }
    if (text.startsWith("发群2段子")) {
        const duanzi = text.substring(5);
        const room = await bot.Room.find("居理测试机器人群2");
        room.say(duanzi);
        return
    }
    if (text === "发群2规1") {
        const room = await bot.Room.find("居理测试机器人群2");
        console.log("msg text " + JSON.stringify(room));
        room.say(msgGroup1);
        return
    }
    if (text === "发群1规2") {
        const room = await bot.Room.find("居理测试机器人群1");
        console.log("msg text " + JSON.stringify(room));
        room.say(msgGroup2);
        return
    }

    if (text === "发群2规2") {
        const room = await bot.Room.find("居理测试机器人群2");
        console.log("msg text " + JSON.stringify(room));
        room.say(msgGroup2);
        return
    }
    if (text === "发群1规1") {
        const room = await bot.Room.find("居理测试机器人群1");
        console.log("msg text " + JSON.stringify(room));
        room.say(msgGroup1);
        return
    }
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
                if (friendship.hello() === 'julive') {
                    logMsg = 'accepted automatically because verify messsage is "julive"';
                    console.log('before accept');
                    await friendship.accept();

                    // if want to send msg , you need to delay sometimes
                    await new Promise(r => setTimeout(r, 1000 * 5));
                    await friendship.contact().say('您好，我叫果果科技one，有什么可以帮助您的');
                    await friendship.contact().say('我可以帮您，查天气，查地理，查快递，查邮编，查历史人物，查新闻，算数，中英翻译，还可以讲笑话哦，总之您有什么需求尽管提，我也在不断学习哦。么么哒 [亲亲]');

                    console.log('after accept')

                } else {
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

async function onRoomJoin(room, inviteeList, inviter) {
    log.info('Bot', 'EVENT: room-join - Room "%s" got new member "%s", invited by "%s"',
        await room.topic(),
        inviteeList.map(c => c.name()).join(','),
        inviter.name(),
    );
    console.log('bot room-join room id:', room.id);

    const topic = await room.topic();
    await room.say(`欢迎您加入 "${topic}"!`, inviteeList[0]);
}

