const api = require('./api');

async function get(msg) {
    const messageContent = msg.text();
    const realContent = messageContent.replace("查列车", "");
    api.getTrainTimeList(realContent, async (isSuccess, data) => {
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
            await msg.say(array.join(""))
        } else {
            await msg.say(data)
        }
    });
}

module.exports = {
    get
};
