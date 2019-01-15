const CacheData = require("./cache-data");
const Data = require('./city-data');
const CommData = require("./comm-data");

function openWeather(msg) {
    CacheData.cacheWeatherSendRequest[name] = true;
    msg.say("请问您要订阅哪个城市的天气？");
    setTimeout(function () {
        CacheData.cacheWeatherSendRequest[name] = false;
    }, 1000 * 60 * 3);
}

function setWeather(msg) {
    const messageContent = msg.text();
    if (messageContent.includes("点")) {
        if (CacheData.cacheWeatherCity[name]) {
            const array = messageContent.split('点');
            const time = array[0];
            if (Data.isTimeExsit(time)) {
                CacheData.cacheWeatherTime[name] = time;
                msg.say("已为您设置好天气订阅");
                CacheData.cacheWeatherSendRequest[name] = false;
                if (CacheData.cacheWeatherJsonData.names.indexOf(name) == -1) {
                    CacheData.cacheWeatherJsonData.names.push(name);
                    CacheData.cacheWeatherJsonData.list.push({
                        name: name,
                        city: CacheData.cacheWeatherCity[name],
                        time: CacheData.cacheWeatherTime[name],
                        isSend: true
                    });
                } else {
                    CacheData.cacheWeatherJsonData.list.forEach((item, index) => {
                        if (item.name == name) {
                            CacheData.cacheWeatherJsonData.list[index].city = CacheData.cacheWeatherCity[name];
                            CacheData.cacheWeatherJsonData.list[index].time = CacheData.cacheWeatherTime[name];
                            CacheData.cacheWeatherJsonData.list[index].isSend = true;
                        }
                    });
                    console.log(name + "已存在")
                }
                CacheData.cacheWeatherIsSend[name] = true;
                CacheData.updateWeatherJson();
            } else {
                msg.say("抱歉您输入有误，请输入：8点或者9点");
            }
        } else {
            msg.say("还不知道您要哪个城市的天气呢？");
        }
    } else {
        CacheData.cacheWeatherCity[name] = messageContent;
        if (Data.isCityExsit(CacheData.cacheWeatherCity[name])) {
            msg.say("您希望每天的几点推送" + CacheData.cacheWeatherCity[name] + "的天气呢");
        } else {
            msg.say("抱歉未查到该城市，请重新输入");
        }
    }
}

function cancelWeather(msg) {
    const messageContent = msg.text();
    if (CacheData.cacheWeatherJsonData.names.indexOf(name) != -1) {
        if (CommData.cancelSubscribeWeatherKeys.indexOf(messageContent) != -1) {
            CacheData.cacheWeatherJsonData.list.forEach((item, index) => {
                if (item.name == name) {
                    CacheData.cacheWeatherJsonData.list[index].isSend = false;
                }
            });
            CacheData.cacheWeatherIsSend[name] = false;
            CacheData.updateWeatherJson();
            msg.say("恭喜您已取消订阅");
        }
    }
}

module.exports = {
    openWeather,
    setWeather,
    cancelWeather
};
