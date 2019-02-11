const fs = require('fs');

const cacheImageName = [];

//小组相关缓存
const cacheGroupSendRequest = {};
let cacheRoomList = [];
const cacheRoomKeyList = {};
let cacheRoomReplayString = "";
const isAutoReplyRoom = {};
let cacheRoomManagerData = {};
const cacheRoomManagerRequest = {};
const cacheRoomManagerRoomRequest = {};
const cacheRoomManagerAddRequest = {};

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

async function initCache() {

    fs.readdir("image_cache/image/", (error, files) => {
        if (!files) return;
        files.forEach(file => {
            cacheImageName.push(file)
        });
    });

    fs.readFile("julive-data.json", 'utf-8', (err, data) => {
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
    });
    fs.readFile("julive-work-data.json", "utf-8", (err, data) => {
    // fs.readFile("./../../julive-work-data.json", "utf-8", (err, data) => {
        if (err) {
            console.log(err);
            return;
        }
        cacheJuliveWorkData = JSON.parse(data);
        console.log(JSON.stringify(cacheJuliveWorkData.keyList));

    });

    fs.readFile("mention-data.json", "utf-8", (err, data) => {
        if (err) {
            console.log(err);
            return;
        }
        cacheMentionContactData = JSON.parse(data);
    });
    fs.readFile("room-manager-data.json", "utf-8", (err, data) => {
        if (err) {
            console.log(err);
            return;
        }
        cacheRoomManagerData = JSON.parse(data)
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

module.exports = {
    cacheImageName,
    cacheGroupSendRequest,
    cacheRoomList,
    cacheRoomKeyList,
    cacheRoomReplayString,
    isAutoReplyRoom,
    cacheRoomManagerData,
    cacheRoomManagerRequest,
    cacheRoomManagerRoomRequest,
    cacheRoomManagerAddRequest,
    cacheWikiWakeUpKey,
    cachePersonSendRequest,
    cacheWikiReplayString,
    cacheWikiList,
    cacheWeatherSendRequest,
    cacheWeatherCity,
    cacheWeatherTime,
    cacheWeatherIsSend,
    cacheWeatherJsonData,
    cacheFriendList,
    cacheJuliveWorkData,
    cacheJuliveWorkDataRequest,
    cacheLastMessageContent,
    cacheMentionContactData,
    cacheMentionAutoReply,
    updateRoomManagerDataJson,
    updateWeatherJson,
    updateJuliveWorkDataJson,
    updateMentionData,
    initCache
};
