const qrTerm = require("qrcode-terminal");

const Tuling123 = require("./tuling123");
const fs = require('fs');

const cacheImageName = [];
const outReplyList = ["小哆退下了", "有事叫我，我走了", "我去休息了，么么哒", "没电了,我去充充电", "时间到了，我要走了，有事call me", "我走了，五星好评哦亲"];

const merryChristmasBlessing = [
    "圣诞节踮着脚尖，轻快地走来，请迎着她轻轻地，轻轻地说出你心中的期待！",
    "圣诞节到了也，你有没有在床头挂起臭袜子哦，圣诞老公公会把我最好的礼物丢进去的，圣诞快乐！",
    "圣诞快乐，并不是只在特别的日子才会想起你，但是圣诞节的时候，一定会让你收到我的祝福。",
    "白雪飘飘，鹿铃霄霄，甜蜜的平安夜又来到，小手摆摆，舞姿曼曼，快乐的圣诞节日多美好。",
    "惦记着往日的笑声忆取那温馨的爱抚愿老师所有的日子洋溢着欢欣的喜悦圣诞快乐、年年如意。",
    "圣诞，有圣诞老人，有你也有我，在这日子里，我想对你说，世上你最美，在今生我最爱你！",
    "平安夜，祝福你！我的朋友，温磬平安！欢乐时，我和你一道分享；不开心时，我和你一起承担！",
    "奉上一颗祝福的心，在这个特别的日子里，愿幸福，如意，快乐，鲜花，一切美好的祝愿与你同在。圣诞快乐！",
    "钟声是我的问候，歌声是我的祝福，雪花是我的贺卡，美酒是我的飞吻，轻风是我的拥抱，快乐是我的礼物！",
    "在经过了一段长长的冷寂后，圣诞节正向我们走来，也许她最珍贵的就是让人们摆脱寒冬，重归温馨的记忆。",
    "如果说圣诞老人要我只许要一个礼物，那么我会对他说：“一个正在看这则短信的人做我的礼物，生世世陪伴我！”",
    "每一次的感触，每一份的收获，每一秒的流过，每一次节日的问候，都代表着对朋友们的思念与祝福——-圣诞节快乐！",
    "嗨！你怎么还在这呢！你知道你的重要性吗？没了你，谁拉着圣诞老公公去给大家送礼物啊！呵呵，圣诞快乐！",
    "我想在你最高兴时说出我的心里话，浪漫的圣诞夜里机会来了，你高兴得像头小猪，其实你生气时更像，哈哈。圣诞快乐！",
    "生活是一本百科全书，社会是一张电子地图，希望你在社会上找到自己的方向，在生活中感悟自己的理想。年轻人，圣诞节愉快。",
    "快乐圣诞！什么使圣诞快乐？不是那快乐的阳光，也不是鸟儿的啁啾；那是愉快的念头和幸福的笑容，是温馨慈爱的问候。",
    "恰有这样一天，雪花轻轻飘落，快乐满溢人间，圣诞老人带着礼物携着祝福而来，轻轻的问候一句：圣诞快乐，生命因此而美好。",
    "又是圣诞了，还记得我们一起度过的浪漫的白色平安夜吗？我的祝福就是平安夜的雪片，落在你的身上，融进你的心里。圣诞快乐！",
    "浪漫一身很冻人，意乱情迷狂热心。毕业一别多少春，天涯海角不相邻。偶有同学要结婚，多有错过喜鹊门。平安夜前祝福深，一生平安美善真！",
    "又到圣诞节，分别已几年；梦中想起你，醒来对愁眠；独坐陋室内，思念千里外；奈何相思苦，短信表祝福：时时开心在，刻刻笑开怀！",
    "农场里牛妈妈问鸡妈妈：为什么我生小牛累的要命，你生完蛋却还咯咯的叫得欢呢？鸡妈妈答：因为生蛋快乐啊！哈哈，也祝你圣诞（生蛋）快乐！",
    "亲爱的，圣诞快乐！只想对你说：一句寒暖，一线相喧；一句叮咛，一笺相传；一份相思，一心相盼；一份爱意，一生相恋，那都是我思念你。",
    "在这个神圣的日子里，诞生了一条史上难得一见的温馨节日祝福。只因为特别的问候要在特别的日子，送给特别的你！朋友：祝你圣诞节快乐！",
    "圣诞新年串一串，开心快乐永不散；好运幸福串一串，家庭和睦财不散；朋友祝福串一串，友谊常青情不散；发条短信串一串，保你节日祝福永不断。",
    "音乐卡是我的挂念，钟声是我的问候，歌声是我的祝福，雪花是我的贺卡，美酒是我的飞吻，清风是我的拥抱，快乐是我的礼物！平安夜快乐！"
];

/**
 * 小组相关缓存 start
 */
const cacheGroupSendRequest = {};
let cacheRoomList = [];
const cacheRoomKeyList = {};
let cacheRoomReplayString = "";
/**
 * 小组相关缓存 end
 */
/**
 * 问答系统相关缓存 start
 */
let cacheWikiWakeUpKey = "";
let cachePersonSendRequest = {};
let cacheWikiReplayString = "";
let cacheWikiList = [];
/**
 * 问答系统相关缓存 end
 */
let cacheFriendList = [];
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

const schedule = require('node-schedule');

function scheduleMerryChristmas() {
    //秒、分、时、日、月、周几
    schedule.scheduleJob('59 59 23 24 12 *', async function () {
        merryChristmas(cacheFriendList, cacheRoomList)
    });
}

scheduleMerryChristmas();

/**
 *
 * Apply Your Own Tuling123 Developer API_KEY at:
 * http://www.tuling123.com
 *
 */
const TULING123_API_KEY = '8ace61c729e7475190a14f4ed7679d7e';

const tuling = new Tuling123(TULING123_API_KEY);

const bot = new Wechaty();

bot.on('scan', onScan);
bot.on('login', onLogin);
bot.on('logout', onLogout);
bot.on('message', onMessage);
bot.on('error', onError);
bot.on('friendship', onFriend);
bot.on('room-join', onRoomJoin);
// bot.on('room-leave',onRoomLeave);

const isAutoReplyRoom = {};

bot.start()
    .catch(console.error);

const cacheUserLoginStatus = {};
const cacheUserBotList = {};

function startNewWechaty(userKey, msg) {
    if (cacheUserLoginStatus[userKey]) {
        msg.say("您已经登录过了，不需要重复登录");
        return;
    }
    const bot = new Wechaty(
        {
            name: userKey
        }
    );
    cacheUserBotList[userKey] = bot;
    bot.on('scan', (qrcode, status) => {
        const scanUrl = `https://api.qrserver.com/v1/create-qr-code/?data=${encodeURIComponent(qrcode)}`;
        console.log(`Scan QR Code to login: ${status}\n ${scanUrl}`);
        // const filebox = FileBox.fromUrl(scanUrl);
        msg.say(scanUrl);
        msg.say("很抱歉由于微信限制，您只能在电脑端打开上面二维码，然后再用手机微信扫描呢")
    });
    bot.on('login', user => {
        cacheUserLoginStatus[userKey] = true;
        console.log(`${user} login`);
        msg.say("您已经登录成功，快去体验吧。目前您已具备自动回复功能，祝您圣诞节快乐哦")
    });
    bot.on('message', async msg => {
        console.log(`消息: ${msg}`);

        const messageContent = msg.text();
        console.log(`消息内容: ${messageContent}`);

        if (msg.self()) {
            return;
        }

        const name = msg.from().name();

        if (name === '微信团队') {
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
        if (messageContent.includes("圣诞节") && (messageContent.includes("祝福") || messageContent.includes("快乐"))) {
            const length = merryChristmasBlessing.length;
            const blessing = randUnique(0, length, length);
            await msg.say(merryChristmasBlessing[blessing[rd(0, length - 1)]]);
            return;
        }
        if (messageContent.includes("帮我群发祝福")) {
            const friendList = await bot.Contact.findAll();
            const roomList = await bot.Room.findAll();
            merryChristmas(friendList, roomList);
            return;
        }
        await reply(msg)
    });
    bot.on('logout', user => {
        console.log(`${user} login out`);
        cacheUserLoginStatus[userKey] = false;
    });
    bot.start().catch(console.error);
}


function onScan(qrcode, status) {
    qrTerm.generate(qrcode, {small: true});  // show qrcode on console
    const scanUrl = `https://api.qrserver.com/v1/create-qr-code/?data=${encodeURIComponent(qrcode)}`;
    console.log(`Scan QR Code to login: ${status}\n ${scanUrl}`);
}

async function onLogin(user) {
    console.log(`${user} login`);
    fs.readdir("image_cache/image/", (error, files) => {
        if (!files) return;
        // console.log("files====" + JSON.stringify(files));
        files.forEach(file => {
            cacheImageName.push(file)
        });
    });
    cacheRoomList = await bot.Room.findAll();
    // console.log("cacheRoomList==" + JSON.stringify(cacheRoomList));
    let attr = [];
    cacheRoomList.forEach(function (item, index) {
        cacheRoomKeyList[index] = item;
        item.topic().then(function (str) {
            attr.push("\n");
            attr.push("群" + index);
            attr.push(":" + str);
            if (index === cacheRoomList.length - 1) {
                cacheRoomReplayString = attr.join("");
                console.log("cacheRoomReplayString==" + cacheRoomReplayString);
            }
        });
    });
    // console.log("cacheRoomKeyList==" + JSON.stringify(cacheRoomKeyList));
    fs.readFile("wechatrobot/julive-data.json", 'utf-8', (err, data) => {
        if (err) {
            console.log(err);
            return;
        }
        const content = JSON.parse(data);
        cacheWikiWakeUpKey = content.name;
        let attr = [];
        cacheWikiList = content.wikiList;
        const lastIndex = cacheWikiList.length - 1;
        cacheWikiList.forEach(function (item, index) {
            attr.push("\n");
            attr.push("问题" + index + ".");
            attr.push(item.problem);
            if (index === lastIndex) {
                cacheWikiReplayString = attr.join("");
            }
        })
    });
    cacheFriendList = await bot.Contact.findAll();
}

function onLogout(user) {
    console.log(`${user} logout`);
}

function onError(e) {
    console.error("onError============================" + e)
}

async function onMessage(msg) {

    console.log(`消息: ${msg}`);

    const messageContent = msg.text();
    console.log(`消息内容: ${messageContent}`);

    if (msg.self()) {
        return;
    }

    const name = msg.from().name();

    if (name === '微信团队') {
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

    if (messageContent.includes("合伙吗") || messageContent.includes("你的主人是") || messageContent.includes("你主人是") || messageContent.includes("你爸爸是") || messageContent.includes("你老爸是") || messageContent.includes("你爸是") || messageContent.includes("你的爸爸是")) {
        await msg.say("想联系我的主人？请长按扫描下方二维码，添加好友哦");
        const filebox = FileBox.fromFile('image_cache/xiaozhang.jpeg');
        msg.say(filebox);
        return;
    }

    if (messageContent.includes("圣诞节") && (messageContent.includes("祝福") || messageContent.includes("快乐"))) {
        const length = merryChristmasBlessing.length;
        const blessing = randUnique(0, length, length);
        await msg.say(merryChristmasBlessing[blessing[rd(0, length - 1)]]);
        return;
    }

    if (messageContent.includes("登录") || messageContent.includes("登陆")) {
        startNewWechaty(name, msg);
        msg.say("欢迎体验小哆服务，登录成功您就可以群发祝福短语了。祝福快人一步。请输入指令：帮我群发祝福。");
        msg.say("退出请输入指令：退出登录");
    }

    if(messageContent.includes("退出登录")){
        if(cacheUserLoginStatus[name]){
            cacheUserBotList[name].stop();
        }
    }

    if (messageContent === cacheWikiWakeUpKey) {
        cachePersonSendRequest[name] = true;
        msg.say(name + "已为您开启WIKI问答");
        setTimeout(function () {
            cachePersonSendRequest[name] = false;
            msg.say(name + "已自动关闭WIKI问答");
        }, 1000 * 60 * 3);
        msg.say("已知问题如下：" + cacheWikiReplayString);
        msg.say("请回复对应编号获取对应答案，如：1");
        return;
    }

    if (cachePersonSendRequest[name]) {
        const problem = cacheWikiList[messageContent];
        if (problem) {
            msg.say(problem.desc);
            const attachment = problem.attachment;
            if (attachment) {
                if (attachment.includes(",")) {
                    const arry = messageContent.split(",");
                    arry.forEach(data => {
                        const filebox = FileBox.fromFile('image_cache/' + data);
                        msg.say(filebox);
                    })
                } else {
                    const filebox = FileBox.fromFile('image_cache/' + attachment);
                    msg.say(filebox);
                }
            }
        } else {
            msg.say("抱歉：未找到您的问题");
        }
        return;
    }


    if (messageContent.includes("我要群发") || messageContent.includes("我想群发")) {
        cacheGroupSendRequest[name] = true;
        msg.say(name + "已为您开启群发功能");
        setTimeout(function () {
            cacheGroupSendRequest[name] = false;
            msg.say(name + "体验时间到了亲，已关闭群发功能");
        }, 1000 * 60 * 3);
        msg.say("小哆所在群组如下：" + cacheRoomReplayString);
        const filebox = FileBox.fromFile('image_cache/rootSendRules.jpeg');
        msg.say(filebox);
        return;
    }

    if (cacheGroupSendRequest[name]) {
        console.log("群发消息开始");
        if (messageContent.includes("发群消息+")) {
            cacheRoomList.forEach(function (item) {
                item.has(msg.from()).then(bool => {
                    if (bool) {
                        item.say(name + "通过小哆转发以下消息：\n" + messageContent.replace("发群消息+", ""))
                    } else {
                        item.topic().then(topic => {
                            msg.say(name + "抱歉您不在该【" + topic + "】群，不能帮您转发，如果需要，请告诉i校长")
                        });
                    }
                });
            });
            return;
        }
        if (messageContent.includes("发群")) {
            const arry = messageContent.split("+");
            const roomKey = arry[0].replace("发群", "");
            const room = cacheRoomKeyList[roomKey];
            if (room) {
                room.has(msg.from()).then(bool => {
                    if (bool) {
                        room.say(name + "通过小哆转发以下消息：\n" + messageContent.replace(arry[0] + "+", ""))
                    } else {
                        room.topic().then(topic => {
                            msg.say(name + "抱歉您不在该【" + topic + "】群，不能帮您转发，如果需要，请告诉i校长")
                        });
                    }
                });
            } else {
                msg.say(name + "抱歉没找到这个群呀")
            }
            return;
        }
        return;
    }


    const room = msg.room();

    if (msg.type() !== Message.Type.Text) {
        if (room) {
            if (!isAutoReplyRoom[room.id]) {
                return;
            }
        }
        switch (msg.type()) {
            case Message.Type.Image:
                const fileName = msg.payload.filename;
                if (fileName && fileName.endsWith("gif")) {
                    const file = await msg.toFileBox();
                    const name = file.name;
                    console.log('Save file to: ' + name);
                    file.toFile("image/" + name, true);
                }
                const length = cacheImageName.length - 1;
                const randImage = randUnique(0, length, length);
                const imageName = cacheImageName[randImage[rd(0, length)]];
                const filebox = FileBox.fromFile('image_cache/image/' + imageName);
                if (filebox)
                    msg.say(filebox);
                break;
        }
        return;
    }

    if (room) {
        if (messageContent.includes("不要你了") || messageContent.includes("退下") || messageContent.includes("你走") || messageContent.includes("你滚") || messageContent.includes("滚吧")) {
            isAutoReplyRoom[room.id] = false;
            await reply(msg);
            return;
        }

        if (isAutoReplyRoom[room.id]) {
            console.log("开启自动回复三分钟");
            await reply(msg);
            return;
        }
        if (messageContent.includes("小哆")) {
            isAutoReplyRoom[room.id] = true;
            setTimeout(function () {
                if (isAutoReplyRoom[room.id]) {
                    const index = randUnique(0, outReplyList.length, 1)[0];
                    room.say(outReplyList[index]);
                    console.log("关闭自动回复");
                }
                isAutoReplyRoom[room.id] = false;
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
                // if (util.compare(hello, '爱小哆')) {
                //     logMsg = '自动同意了好友添加请求，口令是： "爱小哆"';
                await friendship.accept();

                // if want to send msg , you need to delay sometimes
                await new Promise(r => setTimeout(r, 1000 * 5));
                await friendship.contact().say('您好，我叫Ai小哆，有什么可以帮助您的');
                await friendship.contact().say('我可以帮您，查天气，查地理，查快递，查邮编，查历史人物，查新闻，算数，中英翻译，还可以讲笑话哦，总之您有什么需求尽管提，我也在不断学习哦。么么哒 [亲亲]');
                await friendship.contact().say('我还可以做您的群助手，多群转发、单群转发、自动欢迎新成员、自动发送群规、把我设置成群管理后，我还能帮您拉人、踢人等，只需您发一个指令');
                // } else {
                //     logMsg = '不允许，因为他发送的消息是：' + friendship.hello()
                // }
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

const roomRuleXiaoDuo = "本群群规，新老同学请注意：\n" +
    "\n" +
    "1. 禁止向群里发广告、二维码、团购优惠券领取、支付宝口令，小程序、广告推文等信息（违者至少10元红包，否则t）\n" +
    "\n" +
    "2. 本群致力于打造微信客户端的Ai机器人，您可以提任何功能需求，提任何奇葩问题。再次欢迎您的到来，让我们一起迎接新的人工智能。\n" +
    "\n" +
    "3. 修改一下群名片 ,格式为: 城市 - 昵称";

const ruleMap = {
    "依然范特西技术交流群": roomRule,
    "依然饭特稀西交流群2": roomRule,
    "小哆智能语音": roomRuleXiaoDuo
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
    if (rule) {
        await room.say(rule, inviteeList[0]);
        if (topic === "小哆智能语音") {
            await room.say('我可以帮您，查天气，查地理，查快递，查邮编，查历史人物，查新闻，算数，中英翻译，还可以讲笑话哦，我一直在不断学习哦。么么哒 [亲亲]');
            await room.say(`我还可以做您的群助手，多群转发、单群转发、自动欢迎新成员、自动发送群规、把我设置成群管理后，我还能帮您拉人、踢人等，只需您发一个指令`);
        }
    }
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

function rd(n, m) {
    const c = m - n + 1;
    return Math.floor(Math.random() * c + n);
}

function merryChristmas(friendList, roomList) {
    if (bot) {
        if (friendList.length > 0) {
            friendList.forEach((item, index) => {
                const length = merryChristmasBlessing.length;
                const blessing = randUnique(0, length, length);
                if (index < length - 1) {
                    item.say(merryChristmasBlessing[blessing[index]]);
                } else {
                    item.say(merryChristmasBlessing[blessing[index - length]]);
                }
            })
        }
        if (roomList.length > 0) {
            roomList.forEach((item, index) => {
                const length = merryChristmasBlessing.length;
                const blessing = randUnique(0, length, length);
                if (index < length - 1) {
                    item.say(merryChristmasBlessing[blessing[index]]);
                } else {
                    item.say(merryChristmasBlessing[blessing[index - length]]);
                }
            })
        }
    }
}
