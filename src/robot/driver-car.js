const api = require('./api');
const {
    FileBox
} = require('wechaty');

 async function driver(msg) {
    const messageContent = msg.text();
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
}

module.exports = {
  driver
};
