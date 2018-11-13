const qrTerm = require("qrcode-terminal");

const Tuling123 = require("./tuling123");

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
const tuling = new Tuling123(TULING123_API_KEY);

const bot = new Wechaty();

bot.on('scan', onScan);
bot.on('login', onLogin);
bot.on('logout', onLogout);
bot.on('message', onMessage);
bot.on('error', onError);
bot.on('friendship', onFriend);


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

    // Skip message from self, or inside a room
    if (msg.self() || msg.room() || msg.from().name() === '微信团队' || msg.from().name() === "Friend recommendation message" || msg.type() !== Message.Type.Text) return;

    console.log(msg.text());

    try {
        const {text: reply} = await tuling.ask(msg.text(), {userid: msg.from()});
        // console.log('校长', `reply:"%s" for "%s" `,
        //     reply,
        //     msg.text(),
        // );
        await msg.say(reply)
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
                if (friendship.hello() === 'ding') {
                    logMsg = 'accepted automatically because verify messsage is "ding"';
                    console.log('before accept');
                    await friendship.accept();

                    // if want to send msg , you need to delay sometimes
                    await new Promise(r => setTimeout(r, 1000));
                    await friendship.contact().say('hello from Wechaty');
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
