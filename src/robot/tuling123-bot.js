const commData = require("./comm-data");
const Driver = require("./driver-car");
const History = require("./history-today");
const Train = require("./search-train");
const CacheData = require('./cache-data');
const util = require('./util');
const qrTerm = require("qrcode-terminal");
const fs = require('fs');

const Tuling123 = require("./tuling123");

const {
    config,
    log,
    Wechaty,
    Message,
    Friendship,
    FileBox
} = require('wechaty');

//缓存julive日常工作消费品名单
let cacheJuliveWorkData = {};
let cacheJuliveWorkDataRequest = {};
let cacheJuliveWorkDataRequestName = {};

//小组相关缓存
let cacheRoomManagerData = {};
const cacheRoomManagerRequest = {};
const cacheRoomManagerRoomRequest = {};
const cacheRoomManagerAddRequest = {};

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
const Weather = require("./weather");

function scheduleMerryChristmas() {
    //秒、分、时、日、月、周几  demo  '59 59 23 24 12 *'
    schedule.scheduleJob('0 0 * * * *', async function () {
        CacheData.cacheFriendList = await bot.Contact.findAll();
        console.log(JSON.stringify(CacheData.cacheFriendList));
        if (CacheData.cacheWeatherJsonData.names)
            cacheWeatherJsonData.names.forEach(async item => {
                if (!CacheData.cacheWeatherIsSend[item]) return;
                const myDate = new Date();
                const hours = myDate.getHours();
                if (hours == CacheData.cacheWeatherTime[item]) {
                    cacheFriendList.forEach(async friend => {
                        const name = friend.name();
                        if (name == item) {
                            const text = "查询" + CacheData.cacheWeatherCity[name] + "天气";
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
            });
        const room = await bot.Room.find("自由麻将群5毛一份");
        if (room) {
            await room.say("群规：\n" +
                "        自觉发房卡")
        }
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
bot.on('room-topic', onRoomTopicUpdate);
// bot.on('room-leave',onRoomLeave);


bot.start()
    .catch(console.error);

function onScan(qrcode, status) {
    qrTerm.generate(qrcode, {small: true});  // show qrcode on console
    const scanUrl = `https://api.qrserver.com/v1/create-qr-code/?data=${encodeURIComponent(qrcode)}`;
    console.log(`Scan QR Code to login: ${status}\n ${scanUrl}`);
}

async function onLogin(user) {
    console.log(`${user} login`);
    bot.Room.findAll().then(roomList => {
        CacheData.cacheRoomList = roomList;
        let attr = [];
        CacheData.cacheRoomList.forEach(function (item, index) {
            CacheData.cacheRoomKeyList[index] = item;
            item.topic().then(function (str) {
                attr.push("\n");
                attr.push("群" + index);
                attr.push(":" + str);
                if (index === CacheData.cacheRoomList.length - 1) {
                    CacheData.cacheRoomReplayString = attr.join("");
                    console.log("cacheRoomReplayString==" + CacheData.cacheRoomReplayString);
                }
            });
        });
    });
    CacheData.cacheFriendList = await bot.Contact.findAll();
    await CacheData.initCache();
    fs.readFile("julive-work-data.json", "utf-8", (err, data) => {
        // fs.readFile("./../../julive-work-data.json", "utf-8", (err, data) => {
        if (err) {
            console.log(err);
            return;
        }
        cacheJuliveWorkData = JSON.parse(data);
        console.log(JSON.stringify(cacheJuliveWorkData.keyList));
    });
    fs.readFile("room-manager-data.json", "utf-8", (err, data) => {
        if (err) {
            console.log(err);
            return;
        }
        cacheRoomManagerData = JSON.parse(data)
    })
}

function updateJuliveWorkDataJson() {
    fs.writeFile("julive-work-data.json", JSON.stringify(cacheJuliveWorkData, null, 2), (err) => {
        // fs.writeFile("./../../julive-work-data.json", JSON.stringify(cacheJuliveWorkData, null, 2), (err) => {
        if (err) {
            console.log(err);
        } else {
            console.log("JSON saved to " + "julive-work-data.json")
        }
    })
}

function updateRoomManagerDataJson() {
    fs.writeFile("room-manager-data.json", JSON.stringify(cacheRoomManagerData, null, 2), (err) => {
        if (err) {
            console.log(err);
        } else {
            console.log("JSON saved to " + "room-manager-data.json")
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
        return
    }

    const from = msg.from();
    console.log("from === >" + JSON.stringify(from));
    const name = from.name();

    if (name == '微信团队' || name == "懂得珍惜") {
        return
    }

    if (messageContent.includes("开启了朋友验证")) {
        console.log("不是好友了已经");
        return
    }

    if (messageContent === "[Send an emoji, view it on mobile]") {
        // await msg.say("");
        return
    }

    if (messageContent.includes("合伙吗") || messageContent.includes("你的主人是") || messageContent.includes("你主人是") || messageContent.includes("你爸爸是") || messageContent.includes("你老爸是") || messageContent.includes("你爸是") || messageContent.includes("你的爸爸是")) {
        await msg.say("想联系我的主人？请长按扫描下方二维码，添加好友哦");
        const filebox = FileBox.fromFile('image_cache/xiaozhang.jpeg');
        msg.say(filebox);
        return
    }

    if ((messageContent.includes("美女") || messageContent.includes("小黄") && messageContent.includes("图")) || messageContent.indexOf("开车") == 0) {
        await Driver.driver(msg);
        return
    }

    if (messageContent == "历史上的今天" || messageContent == "历史今天") {
        await History.get(msg);
        return
    }

    if (messageContent.indexOf("查列车") == 0) {
        await Train.get(msg);
        return
    }

    if (messageContent.includes("订阅天气") || messageContent.includes("天气订阅")) {
        Weather.openWeather(msg);
        return;
    }

    if (CacheData.cacheWeatherSendRequest[name]) {
        Weather.setWeather(msg);
        return;
    }

    if (messageContent.includes("取消天气订阅")) {
        Weather.cancelWeather(msg);
        return
    }

    if (messageContent === CacheData.cacheWikiWakeUpKey) {
        CacheData.cachePersonSendRequest[name] = true;
        msg.say(name + "已为您开启WIKI问答");
        setTimeout(function () {
            CacheData.cachePersonSendRequest[name] = false;
            msg.say(name + "已自动关闭WIKI问答");
        }, 1000 * 60 * 3);
        msg.say("已知问题如下：" + CacheData.cacheWikiReplayString);
        msg.say("请回复对应编号获取对应答案，如：1");
        return;
    }

    if (CacheData.cachePersonSendRequest[name]) {
        const problem = CacheData.cacheWikiList[messageContent];
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
        CacheData.cacheGroupSendRequest[name] = true;
        msg.say(name + "已为您开启群发功能");
        setTimeout(function () {
            CacheData.cacheGroupSendRequest[name] = false;
            msg.say(name + "体验时间到了亲，已关闭群发功能");
        }, 1000 * 60 * 3);
        msg.say("小哆所在群组如下：" + CacheData.cacheRoomReplayString);
        const filebox = FileBox.fromFile('image_cache/rootSendRules.jpeg');
        msg.say(filebox);
        return;
    }

    if (CacheData.cacheGroupSendRequest[name]) {
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
            const room = CacheData.cacheRoomKeyList[roomKey];
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
            if (!CacheData.isAutoReplyRoom[room.id]) {
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
                const length = CacheData.cacheImageName.length - 1;
                const randImage = util.randUnique(0, length, length);
                const imageName = CacheData.cacheImageName[randImage[util.rd(0, length)]];
                const filebox = FileBox.fromFile('image_cache/image/' + imageName);
                if (filebox)
                    await msg.say(filebox);
                break;
        }
        return
    }

    if (room) {

        if (messageContent == "发群规") {
            const topic = await room.topic();
            const roomTopicList = cacheRoomManagerData.roomTopicList;
            const roomList = cacheRoomManagerData.roomList;
            Object.keys(roomTopicList).forEach(async key => {
                if (topic == roomTopicList[key]) {
                    const manager = roomList[key];
                    if (manager) {
                        const announce = manager.announce;
                        if (announce && announce != "") {
                            await room.say(announce);
                        }
                    }
                }
            });
            if (topic.includes("诚信拼车顺风车群")) {
                await room.say("公告：\n" +
                    "1. 本群的成立是为了乘车方便，不准在群里说话不文明胡乱吵骂，不准在群里乱发游戏链接，不准在群里乱发淫秽.色情.诅咒的视频信息，违者踢出本群。\n" +
                    "\n" +
                    "2.  正规的广告视频也不能连续发入。\n" +
                    "\n" +
                    "3.  提醒群友；凡是经常坐车的朋友，请伸出宝贵的手把他们拉入本群能让他们快速坐上车。 🙏\n" +
                    "\n" +
                    "4.  特别提醒：所有司机及乘客凡是提前讲好条件预约的，双方都不要失约，咱们要诚信为主，不能遵守以上群规。还请自觉退群，否则送飞机票一张！。🚀\n" +
                    "\n" +
                    "5.  昵称修改：村-镇 + 昵称")

            }
            if(topic.includes("自由麻将群")){
                await room.say("群规：\n" +
                    "        自觉发房卡")
            }
            return
        }

        if (messageContent.indexOf("TM@") == 0) {
            const realName = messageContent.replace("TM@", "");
            const topic = await room.topic();
            const roomTopicList = cacheRoomManagerData.roomTopicList;
            const roomList = cacheRoomManagerData.roomList;
            Object.keys(roomTopicList).forEach(async key => {
                if (topic == roomTopicList[key]) {
                    const manager = roomList[key];
                    if (manager) {
                        console.log("manager=====" + JSON.stringify(manager));
                        if (manager.managers[name]) {
                            const member = await room.member(realName);
                            console.log("member=====" + JSON.stringify(member));
                            try {
                                await room.del(member);
                                await room.say("小哆已经试着踢" + realName + "了，如果失败了，请您将小哆设置成管理员再重试哦。")
                            } catch (e) {
                                log.error('Bot', 'getOutRoom() exception: ' + e.stack);
                            }
                        } else {
                            room.say("您不是管理员不能T人")
                        }
                    }
                }
            });
            return
        }

        if (messageContent.includes("开启") && messageContent.includes("提醒") && messageContent.includes("功能")) {
            CacheData.cacheMentionContactData.mention[from.name()] = true;
            CacheData.updateMentionData();
            msg.say("小哆已为您开启提醒功能，需要有人@您，我就会将消息转发给您。");
            return;
        }
        if (messageContent.includes("关闭") && messageContent.includes("提醒") && messageContent.includes("功能")) {
            CacheData.cacheMentionContactData.mention[from.name()] = false;
            CacheData.updateMentionData();
            msg.say("小哆已为您关闭提醒功能");
            return;
        }

        const arrayContact = await msg.mention();

        if (arrayContact) {
            console.log("start mention" + JSON.stringify(arrayContact));
            arrayContact.forEach(item => {
                if (CacheData.cacheMentionContactData.mention)
                    if (CacheData.cacheMentionContactData.mention[item.name()]) {
                        console.log("start mention" + item.name());
                        CacheData.cacheMentionAutoReply[item.name()] = true;
                        setTimeout(function () {
                            console.log("stop mention" + item.name());
                            CacheData.cacheMentionAutoReply[item.name()] = false;
                        }, 1000 * 60 * 3);
                    }
            })
        }
        let fileBox = null;
        if (msg.type() == Message.Type.Image || msg.type() == Message.Type.Audio) {
            fileBox = await msg.toFileBox()
        }
        CacheData.cacheFriendList.forEach(friend => {
            // console.log("forEach mention" + friend.name());
            // console.log("forEach mention" + cacheMentionContactData.mention[friend.name] + " " + cacheMentionAutoReply[friend.name()]);
            const friendName = friend.name();
            if (friendName != null || friendName != "") {
                if (CacheData.cacheMentionContactData.mention)
                    if (CacheData.cacheMentionContactData.mention[friendName] && CacheData.cacheMentionAutoReply[friendName]) {
                        console.log("msg.type() mention" + msg.type());
                        if (msg.type() == Message.Type.Text) {
                            friend.say(name + "说：\n" + messageContent)
                        }
                        if (fileBox) {
                            friend.say(fileBox)
                        }
                    }
            }
        });

        if ((messageContent.includes("替我") || messageContent.includes("帮我")) && (messageContent.includes("回复") || messageContent.includes("回答"))) {
            reply(CacheData.cacheLastMessageContent[room.id]);
            return
        } else {
            if (msg.type() == Message.Type.Text)
                CacheData.cacheLastMessageContent[room.id] = msg;
        }

        if (messageContent.indexOf("统计日用品") == 0) {
            cacheJuliveWorkDataRequest[room.id] = true;
            await msg.say("已开启统计功能，目前只能统计如下品类，\n如需增加品类，请回复'addTag+自定义品类名称'\n如'addTag火腿肠'即可");
            console.log("----" + JSON.stringify(cacheJuliveWorkData));
            const str = cacheJuliveWorkData.keyList.join("\n");
            console.log(str);
            await msg.say(str);
            await msg.say("请回复对应品类名新增，\n如'新增笔记本1卫生纸2笔1'\n或者'新增笔记本1笔1'\n或者'新增卫生纸2'");
            return
        }

        if (cacheJuliveWorkDataRequest[room.id]) {
            const roomName = await room.topic();

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
                const roomList = cacheJuliveWorkData.roomList[roomName];
                const arry = [];
                if (roomList) {
                    Object.keys(roomList).forEach(key => {
                        const keys = [];
                        keys.push(key + ":");
                        const item = roomList[key];
                        Object.keys(item).forEach(value => {
                            keys.push("     " + value + " " + item[value])
                        });
                        arry.push(keys.join("\n"))
                    });
                    await msg.say(arry.join("\n"));
                }
                return
            }
            if (messageContent == "统计") {
                const arry = [];
                const roomList = cacheJuliveWorkData.roomList[roomName];
                if (roomList) {
                    cacheJuliveWorkData.keyList.forEach(item => {
                        let num = 0;
                        Object.keys(roomList).forEach(key => {
                            const data = roomList[key];
                            Object.keys(data).forEach(value => {
                                if (data[value] && value == item) {
                                    num += parseInt(data[item])
                                }
                            })
                        });
                        arry.push(item + " " + num)
                    });
                    await msg.say(arry.join("\n"));
                }
                return
            }

            if (cacheJuliveWorkDataRequestName[name]) {
                cacheJuliveWorkData.nameList[name] = messageContent;
                msg.say(messageContent + "欢迎使用新增功能，添加您的日用品");
                cacheJuliveWorkDataRequestName[name] = false;
                return
            }

            if (messageContent.indexOf("新增") == 0) {
                const realName = cacheJuliveWorkData.nameList[name];
                if (!realName) {
                    cacheJuliveWorkDataRequestName[name] = true;
                    msg.say("请问您的真实姓名是？");
                    return
                }
                const realContent = messageContent.replace("新增", "");
                let isUpdate = false;
                let updateTag = "";
                let updateValue = "";
                let num = 0;
                cacheJuliveWorkData.keyList.forEach(item => {
                    if (realContent.includes(item)) {
                        const arry = realContent.split(item);
                        if (arry.length > 1) {
                            num = arry[1].substring(0, 1);
                        }
                        updateTag = item;
                        updateValue = num;
                        isUpdate = true;
                    }
                });
                if (!isUpdate) {
                    msg.say("抱歉输入有误、无法更新");
                    return
                }
                if (Object.keys(cacheJuliveWorkData.roomList).includes(roomName)) {
                    const roomList = cacheJuliveWorkData.roomList[roomName];
                    let item = roomList[realName];
                    if (item) {
                        item[updateTag] = updateValue
                    } else {
                        item = {};
                        item[updateTag] = updateValue;
                    }
                    roomList[realName] = item;
                    cacheJuliveWorkData.roomList[roomName] = roomList;
                } else {
                    const item = {};
                    const roomItem = {};
                    item[updateTag] = updateValue;
                    roomItem[realName] = item;
                    cacheJuliveWorkData.roomList[roomName] = roomItem;
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

            if (messageContent == "统计群") {
                Object.keys(cacheJuliveWorkData.roomList).forEach(room => {
                    const arry = [];
                    const roomList = cacheJuliveWorkData.roomList[room];
                    if (roomList) {
                        cacheJuliveWorkData.keyList.forEach(item => {
                            let num = 0;
                            Object.keys(roomList).forEach(key => {
                                const data = roomList[key];
                                Object.keys(data).forEach(value => {
                                    if (data[value] && value == item) {
                                        num += parseInt(data[item])
                                    }
                                })
                            });
                            arry.push(item + " " + num)
                        });
                        msg.say(room + "群:\n" + arry.join("\n"));
                    }
                });
                return
            }

        }

        if (messageContent.includes("不要你了") || messageContent.includes("退下") || messageContent.includes("你走") || messageContent.includes("你滚") || messageContent.includes("滚吧")) {
            CacheData.isAutoReplyRoom[room.id] = false;
            await reply(msg);
            return;
        }

        if (CacheData.isAutoReplyRoom[room.id]) {
            console.log("开启自动回复三分钟");
            await reply(msg);
            return;
        }
        if (messageContent.includes("小哆")) {
            CacheData.isAutoReplyRoom[room.id] = true;
            setTimeout(function () {
                if (CacheData.isAutoReplyRoom[room.id]) {
                    const index = util.randUnique(0, commData.outReplyList.length, 1)[0];
                    room.say(commData.outReplyList[index]);
                    console.log("关闭自动回复");
                }
                CacheData.isAutoReplyRoom[room.id] = false;
            }, 1000 * 60 * 3);
            await reply(msg)
        }
        return;
    } else {

        if (messageContent == "添加群管") {
            cacheRoomManagerRequest[from.id] = true;
            await msg.say("小哆所在群组如下：" + CacheData.cacheRoomReplayString);
            await msg.say("请问您要添加哪个群的管理？请回复群对应编号即可，如：群1");
            return;
        }

        if (cacheRoomManagerRequest[from.id]) {
            if (cacheRoomManagerAddRequest[from.id]) {
                cacheRoomManagerData.roomList[cacheRoomManagerAddRequest[from.id]].managers[messageContent] = true;
                updateRoomManagerDataJson();
                await msg.say("已成功添加" + messageContent + "为管理员哦");
                cacheRoomManagerAddRequest[from.id] = undefined;
                cacheRoomManagerRequest[from.id] = undefined;
                cacheRoomManagerRoomRequest[from.id] = undefined;
                return
            }

            if (cacheRoomManagerRoomRequest[from.id]) {
                const roomTopicList = cacheRoomManagerData.roomTopicList;
                const roomList = cacheRoomManagerData.roomList;
                Object.keys(roomTopicList).forEach(async key => {
                    if (cacheRoomManagerRoomRequest[from.id] == roomTopicList[key]) {
                        const manager = roomList[key];
                        if (manager) {
                            if (manager.password == messageContent) {
                                cacheRoomManagerAddRequest[from.id] = key;
                                await msg.say("请您拷贝添加群管理员的昵称，然后告诉我，注意：拷贝他本人的群昵称哦");
                            } else {
                                await msg.say("密码输入错误，请重新输入");
                            }
                        } else {
                            await msg.say("未找到匹配密码，请寻求i校长的帮助");
                        }
                    }
                });
                return
            }
            if (messageContent.indexOf("群") == 0) {
                const realRoom = messageContent.replace("群", "");
                const room = cacheRoomKeyList[realRoom];
                if (room) {
                    const topic = await room.topic();
                    cacheRoomManagerRoomRequest[from.id] = topic;
                    await msg.say("请输入群【" + topic + "】的管理密码，如：密码1234");
                } else {
                    await msg.say("抱歉没找到您说的群，请回复群对应编号即可，如：群1");
                }
                return
            }

        }

    }
    await reply(msg);
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
    const roomTopicList = cacheRoomManagerData.roomTopicList;
    if (!JSON.stringify(roomTopicList).includes(topic)) {
        await room.say("Ai小哆欢迎您入群哦，么么哒", inviteeList[0]);
        return;
    }
    const roomList = cacheRoomManagerData.roomList;
    Object.keys(roomTopicList).forEach(async key => {
        if (topic == roomTopicList[key]) {
            const manager = roomList[key];
            if (manager) {
                const welcome = manager.welcome;
                const announce = manager.announce;
                await room.say(welcome, inviteeList[0]);
                if (announce && announce != "") {
                    await room.say(announce, inviteeList[0]);
                }
            } else {
                await room.say("Ai小哆欢迎您入群哦，么么哒", inviteeList[0]);
            }
        }
    });
}

async function onRoomTopicUpdate(room, topic, oldTopic, changer) {
    const roomTopicList = cacheRoomManagerData.roomTopicList;
    Object.keys(roomTopicList).forEach(async (key, index) => {
        if (oldTopic == roomTopicList[key]) {
            roomTopicList[index] = topic;
            updateRoomManagerDataJson();
            await room.say(`"${changer.name()}"将群名"${oldTopic}" 修改为 "${topic}"`)
        }
    });
}
