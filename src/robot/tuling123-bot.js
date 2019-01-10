const commData = require("./comm-data");
const Data = require('./city-data');
const util = require('./util');
const api = require('./api');
const qrTerm = require("qrcode-terminal");

const Tuling123 = require("./tuling123");
const fs = require('fs');

const cacheImageName = [];

//小组相关缓存
const cacheGroupSendRequest = {};
let cacheRoomList = [];
const cacheRoomKeyList = {};
let cacheRoomReplayString = "";

//问答系统相关缓存
let cacheWikiWakeUpKey = "";
let cachePersonSendRequest = {};
let cacheWikiReplayString = "";
let cacheWikiList = [];

//天气订阅缓存
let cacheWeatherSendRequest = {};
let cacheWeatherCity = {};
let cacheWeatherTime = {};
let cacheWeatherIsSend = {};
let cacheWeatherJsonData = {};

//缓存好友列表
let cacheFriendList = [];

//缓存julive日常工作消费品名单
let cacheJuliveWorkData = {};
let cacheJuliveWorkDataRequest = {};

//缓存最近一条消息内容
let cacheLastMessageContent = {};

//缓存小哆自动转发被@消息好友列表
let cacheMentionContactData = {};
let cacheMentionAutoReply = {};

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
    //秒、分、时、日、月、周几  demo  '59 59 23 24 12 *'
    schedule.scheduleJob('0 0 * * * *', async function () {
        cacheFriendList = await bot.Contact.findAll();
        console.log(JSON.stringify(cacheFriendList));
        if (cacheWeatherJsonData.names)
            cacheWeatherJsonData.names.forEach(async item => {
                if (!cacheWeatherIsSend[item]) return;
                const myDate = new Date();
                const hours = myDate.getHours();
                if (hours == cacheWeatherTime[item]) {
                    cacheFriendList.forEach(async friend => {
                        const name = friend.name();
                        if (name == item) {
                            const text = "查询" + cacheWeatherCity[name] + "天气";
                            console.log("start schedule " + text);
                            const {text: reply} = await tuling.ask(text, {
                                userid: friend
                            });
                            await friend.say(reply);
                            await friend.say("如果需要取消订阅，请回复如下内容，自己拷贝哦");
                            const random = util.rd(0, commData.cancelSubscribeWeatherKeys.length - 1);
                            await friend.say(commData.cancelSubscribeWeatherKeys[random]);
                        }
                    });
                }
            })
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
    fs.readFile("weather-subcribe.json", "utf-8", (err, data) => {
        if (err) {
            console.log(err);
            return;
        }
        cacheWeatherJsonData = JSON.parse(data);
        console.log("cacheWeatherJsonData===" + JSON.stringify(cacheWeatherJsonData));
        cacheWeatherJsonData.list.forEach(item => {
            cacheWeatherCity[item.name] = item.city;
            cacheWeatherTime[item.name] = item.time;
            cacheWeatherIsSend[item.name] = item.isSend;
        });
        console.log("cacheWeatherCity===" + JSON.stringify(cacheWeatherCity));
        console.log("cacheWeatherTime===" + JSON.stringify(cacheWeatherTime));
        console.log("cacheWeatherIsSend===" + JSON.stringify(cacheWeatherIsSend));
    });
    fs.readFile("julive-work-data.json", "utf-8", (err, data) => {
        if (err) {
            console.log(err);
            return;
        }
        cacheJuliveWorkData = JSON.parse(data);
        console.log("cacheJuliveWorkData===" + JSON.stringify(cacheJuliveWorkData));
    });
    cacheFriendList = await bot.Contact.findAll();

    fs.readFile("mention-data.json", "utf-8", (err, data) => {
        if (err) {
            console.log(err);
            return;
        }
        cacheMentionContactData = JSON.parse(data);
        console.log("cacheMentionContactData===" + JSON.stringify(cacheMentionContactData));
    })
}


function updateWeatherJson() {
    fs.writeFile("weather-subcribe.json", JSON.stringify(cacheWeatherJsonData, null, 2), (err) => {
        if (err) {
            console.log(err);
        } else {
            console.log("JSON saved to " + "weather-subcribe.json")
        }
    })
}

function updateJuliveWorkDataJson() {
    fs.writeFile("julive-work-data.json", JSON.stringify(cacheJuliveWorkData, null, 2), (err) => {
        if (err) {
            console.log(err);
        } else {
            console.log("JSON saved to " + "julive-work-data.json")
        }
    })
}

function updateMentionData() {
    fs.writeFile("mention-data.json", JSON.stringify(cacheMentionContactData, null, 2), (err) => {
        if (err) {
            console.log(err);
        } else {
            console.log("JSON saved to " + "mention-data.json")
        }
    })
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

    const from = msg.from();
    const name = from.name();

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

    if (messageContent == "历史上的今天" || messageContent == "历史今天") {
        api.getTodaysHistory(async function (res) {
            if (res.pic) {
                const filebox = FileBox.fromUrl(res.pic);
                await msg.say(filebox);
            }
            await msg.say(res.title);
            await msg.say(res.des);
        });
        return
    }

    if (messageContent.indexOf("查列车") == 0) {
        const realContent = messageContent.replace("查列车", "");
        api.getTrainTimeList(realContent, (isSuccess, data) => {
            if (isSuccess) {
                const array = [];
                data.forEach(item => {
                    if (item.TrainStation[0].includes("车次")) {
                        array.push("始发站：" + item.TrainStation[0] + "\n");
                        array.push("出发时间：" + item.StartTime[0] + "\n")
                    } else {
                        array.push("    停靠站：" + item.TrainStation[0] + "\n");
                        array.push("    停靠时间：" + item.ArriveTime[0] + "\n");
                        if (item.StartTime[0].constructor == String)
                            array.push("    出发时间：" + item.StartTime[0] + "\n");
                    }
                });
                msg.say(array.join(""))
            } else {
                msg.say(data)
            }
        });
        return
    }

    if ((messageContent.includes("美女") || messageContent.includes("小黄") && messageContent.includes("图")) || messageContent.includes("开车")) {
        const num = messageContent.replace(/[^0-9]/ig, "");
        if (num > 10) {
            await msg.say("你咋不上天呢，贪心鬼，勉强给你1张look look")
        }
        if (num && num <= 10) {
            for (let i = 0; i < num; i++) {
                api.getGanHuoImage(async url => {
                    const fileBox = FileBox.fromUrl(url);
                    await msg.say(fileBox)
                });
            }
        } else {
            api.getGanHuoImage(async url => {
                const fileBox = FileBox.fromUrl(url);
                await msg.say(fileBox)
            });
        }
        return
    }

    if (messageContent.includes("订阅天气") || messageContent.includes("天气订阅")) {
        cacheWeatherSendRequest[name] = true;
        msg.say("请问您要订阅哪个城市的天气？");
        setTimeout(function () {
            cacheWeatherSendRequest[name] = false;
        }, 1000 * 60 * 3);
        return;
    }

    if (cacheWeatherSendRequest[name]) {
        if (messageContent.includes("点")) {
            if (cacheWeatherCity[name]) {
                const array = messageContent.split('点');
                const time = array[0];
                if (Data.isTimeExsit(time)) {
                    cacheWeatherTime[name] = time;
                    msg.say("已为您设置好天气订阅");
                    cacheWeatherSendRequest[name] = false;
                    if (cacheWeatherJsonData.names.indexOf(name) == -1) {
                        cacheWeatherJsonData.names.push(name);
                        cacheWeatherJsonData.list.push({
                            name: name,
                            city: cacheWeatherCity[name],
                            time: cacheWeatherTime[name],
                            isSend: true
                        });
                    } else {
                        cacheWeatherJsonData.list.forEach((item, index) => {
                            if (item.name == name) {
                                cacheWeatherJsonData.list[index].city = cacheWeatherCity[name];
                                cacheWeatherJsonData.list[index].time = cacheWeatherTime[name];
                                cacheWeatherJsonData.list[index].isSend = true;
                            }
                        });
                        console.log(name + "已存在")
                    }
                    cacheWeatherIsSend[name] = true;
                    updateWeatherJson();
                } else {
                    msg.say("抱歉您输入有误，请输入：8点或者9点");
                }
            } else {
                msg.say("还不知道您要哪个城市的天气呢？");
            }
        } else {
            cacheWeatherCity[name] = messageContent;
            if (Data.isCityExsit(cacheWeatherCity[name])) {
                msg.say("您希望每天的几点推送" + cacheWeatherCity[name] + "的天气呢");
            } else {
                msg.say("抱歉未查到该城市，请重新输入");
            }
        }
        return;
    }

    if (cacheWeatherJsonData.names)
        if (cacheWeatherJsonData.names.indexOf(name) != -1) {
            if (commData.cancelSubscribeWeatherKeys.indexOf(messageContent) != -1) {
                cacheWeatherJsonData.list.forEach((item, index) => {
                    if (item.name == name) {
                        cacheWeatherJsonData.list[index].isSend = false;
                    }
                });
                cacheWeatherIsSend[name] = false;
                updateWeatherJson();
                msg.say("恭喜您已取消订阅");
                return;
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
                // const fileName = msg.payload.filename;
                // if (fileName && fileName.endsWith("gif")) {
                //     const file = await msg.toFileBox();
                //     const name = file.name;
                //     console.log('Save file to: ' + name);
                //     file.toFile("image/" + name, true);
                // }
                const length = cacheImageName.length - 1;
                const randImage = util.randUnique(0, length, length);
                const imageName = cacheImageName[randImage[util.rd(0, length)]];
                const filebox = FileBox.fromFile('image_cache/image/' + imageName);
                if (filebox)
                    await msg.say(filebox);
                break;
        }
        return
    }

    if (room) {

        if(messageContent.includes("开启")&&messageContent.includes("提醒")&&messageContent.includes("功能")){
            cacheMentionContactData.mention[from.id]=true;
            updateMentionData();
            msg.say("小哆已为您开启提醒功能，需要有人@您，我就会将消息转发给您。");
            return;
        }

        const arrayContact = await msg.mention();

        if (arrayContact) {
            console.log("start mention"+JSON.stringify(arrayContact));
            arrayContact.forEach(item => {
                if (cacheMentionContactData.mention[item.id]) {
                    console.log("start mention" + item.id);
                    cacheMentionAutoReply[item.id] = true;
                    setTimeout(function () {
                        console.log("stop mention" + item.id);
                        cacheMentionAutoReply[item.id] = false;
                    }, 1000 * 60 * 3);
                    cacheFriendList.forEach(friend => {
                        if (friend.id == item.id) {
                            console.log("say mention" + friend.id);
                            friend.say("来自"+name + "的消息\n" + messageContent)
                        }
                    });
                }
            })
        }
        cacheFriendList.forEach(friend => {
            // console.log("forEach mention" + friend.name());
            // console.log("forEach mention" + cacheMentionContactData.mention[friend.name] + " " + cacheMentionAutoReply[friend.name()]);
            if (cacheMentionContactData.mention[friend.id] && cacheMentionAutoReply[friend.id]) {
                console.log("msg.type() mention" + msg.type());
                if (msg.type() == Message.Type.Text) {
                    friend.say(name + "给您发送的消息内容：\n" + messageContent)
                }
                if (msg.type() == Message.Type.Image || msg.type() == Message.Type.Audio) {
                    msg.toFileBox().then(file => {
                        friend.say(name + "给您发送的文件").then(function () {
                            friend.say(file)
                        });
                    });
                }
            }
        });

        if ((messageContent.includes("替我") || messageContent.includes("帮我")) && (messageContent.includes("回复") || messageContent.includes("回答"))) {
            reply(cacheLastMessageContent[room.id]);
            return
        } else {
            if (msg.type() == Message.Type.Text)
                cacheLastMessageContent[room.id] = msg;
        }

        if (messageContent.indexOf("统计日消") == 0 && name == "i校长") {
            cacheJuliveWorkDataRequest[room.id] = true;
            await msg.say("校长已开启统计功能，目前只能统计如下品类，\n如需增加品类，请回复'addTag+自定义品类名称'\n如'addTag火腿肠'即可");
            const str = cacheJuliveWorkData.keyList.join("\n");
            await msg.say(str);
            await msg.say("请回复对应品类名新增，\n如'新增笔记本1卫生纸2笔1'\n或者'新增笔记本1笔1'\n或者'新增卫生纸2'");
            return
        }

        if (cacheJuliveWorkDataRequest[room.id]) {
            if (messageContent.indexOf("addTag") == 0) {
                const newTag = messageContent.replace("addTag", "");
                if (cacheJuliveWorkData.keyList.indexOf(newTag) == -1) {
                    cacheJuliveWorkData.keyList.push(newTag);
                    await msg.say("已添加");
                    await msg.say("目前品类：\n" + cacheJuliveWorkData.keyList.join("\n"))
                } else {
                    await msg.say("抱歉，添加失败，已经存在");
                }
                return
            }
            if (messageContent == "查看") {
                const arry = [];
                cacheJuliveWorkData.valueList.forEach(item => {
                    const keys = [];
                    Object.keys(item).forEach(key => {
                        if (key == "name") {
                            keys.push(item[key] + ":")
                        } else {
                            keys.push("     " + key + " " + item[key])
                        }
                    });
                    arry.push(keys.join("\n"))
                });
                await msg.say(arry.join("\n"));
                return
            }
            if (messageContent == "统计") {
                const arry = [];
                cacheJuliveWorkData.keyList.forEach(item => {
                    let num = 0;
                    cacheJuliveWorkData.valueList.forEach(data => {
                        if (data[item])
                            num += parseInt(data[item])
                    });
                    arry.push(item + " " + num)
                });
                await msg.say(arry.join("\n"));
                return
            }
            if (messageContent.indexOf("新增") == 0) {
                const realContent = messageContent.replace("新增", "");
                let newData = {
                    "name": name
                };
                if (JSON.stringify(cacheJuliveWorkData.valueList).indexOf(name) != -1) {
                    cacheJuliveWorkData.valueList.forEach((item, index) => {
                        if (item.name == name) {
                            newData = cacheJuliveWorkData.valueList[index];
                        }
                    });
                }
                let num = 0;
                let isUpdate = false;
                cacheJuliveWorkData.keyList.forEach(item => {
                    if (realContent.includes(item)) {
                        const arry = realContent.split(item);
                        if (arry.length > 1) {
                            num = arry[1].substring(0, 1);
                        }
                        newData[item] = num;
                        isUpdate = true;
                    }
                });
                if (!isUpdate) {
                    msg.say("抱歉输入有误、无法更新");
                    return
                }
                if (JSON.stringify(cacheJuliveWorkData.valueList).indexOf(name) == -1) {
                    cacheJuliveWorkData.valueList.push(newData)
                } else {
                    cacheJuliveWorkData.valueList.forEach((item, index) => {
                        if (item.name == name) {
                            cacheJuliveWorkData.valueList[index] = newData;
                        }
                    });
                }
                updateJuliveWorkDataJson();
                msg.say("已成功添加，\n看结果请回复:'查看'");
                return
            }
            if (messageContent == "关闭") {
                cacheJuliveWorkDataRequest[room.id] = false;
                msg.say("已关闭统计");
                return
            }
        }

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
                    const index = util.randUnique(0, commData.outReplyList.length, 1)[0];
                    room.say(commData.outReplyList[index]);
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
        const {text: reply, url: url, list: listNews} = await tuling.ask(text, {
            userid: msg.from(),
            loc: msg.from().city()
        });
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
                await friendship.contact().say('我可以帮您，查天气，查地理，查列车，查邮编，查历史人物，查新闻，算数，中英翻译，还可以讲笑话哦，总之您有什么需求尽管提，我也在不断学习哦。么么哒 [亲亲]');
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

async function onRoomJoin(room, inviteeList, inviter) {
    log.info('Bot', '动作: 入群 "%s" 新增新成员 "%s", 被拉进来 "%s"',
        await room.topic(),
        inviteeList.map(c => c.name()).join(','),
        inviter.name(),
    );
    console.log('机器人入群 id:', room.id);
    const topic = await room.topic();
    await room.say(`欢迎加入 "${topic}"!`, inviteeList[0]);
    const rule = commData.ruleMap[topic];
    if (rule) {
        await room.say(rule, inviteeList[0]);
        if (topic === "小哆智能语音") {
            await room.say('我可以帮您，查天气，查地理，查快递，查邮编，查历史人物，查新闻，算数，中英翻译，还可以讲笑话哦，我一直在不断学习哦。么么哒 [亲亲]');
            await room.say(`我还可以做您的群助手，多群转发、单群转发、自动欢迎新成员、自动发送群规、把我设置成群管理后，我还能帮您拉人、踢人等，只需您发一个指令`);
        }
    }
}

