const express = require('express');
const router = express.Router();

const Robot = require('../src/main/robot/index');
const CodeUrl = 'https://login.weixin.qq.com/qrcode/';

const data = require('../src/main/data.js');

let robot = null;
let isScanEnd = false;
let isLoadedUserInfo = false;
let isNeedReLogin = false;
/* GET users listing. */
/**
 * 用户获取扫描二维码
 */
router.get('/', function (req, res, next) {
    let response = res;
    if (robot&&isLoadedUserInfo) {
        response.send("已登录成功");
        console.log("no need create new Robot");
        return
    }
    console.log("create new Robot");
    //清空数组中的数据，保证数据的最新
    data.groupChatList.length=0;
    robot = new Robot();
    robot
        .on('robot-reply', res => {

            console.log(JSON.stringify(res));

            if (res.key == "getUUID") {
                response.send(CodeUrl + res.value);
            }
            if (res.key == "getUser") {
                isScanEnd = true;
            }
            if (res.key == "getMemberlist") {
                isLoadedUserInfo = true;
                data.addChatListAndRepeatList(res.value)
            }
            if (res.key == "onerror") {
                //其他设备登录web微信
                if (res.value.status == 804) {
                    isNeedReLogin = true;
                    isLoadedUserInfo=false;
                    isScanEnd=false;
                    robot = null;
                }
            }

        });
    robot.start(isNeedReLogin);
});
/**
 * 判断用户是否已经扫描二维码，并是否成功获取到好友列表
 */
router.get('/next', function (req, res, next) {
    if (isScanEnd && !isLoadedUserInfo) {
        //已扫描，并成功获取用户信息
        res.send("0");
    } else if (isLoadedUserInfo && isScanEnd) {
        //已扫描，并成功获取用户好友列表
        res.send("1");
    } else {
        res.send("-1");
    }
});

router.post('/sendMsg', function (req, res, next) {

    console.log(JSON.stringify(req.body));

    // const tos = {
    //     "Bc8b87810d39abab4f820e793ce1b16c4": 0,
    //     "B3cd6f5584935be31b79e62dc20857a15": 0
    // };
    const tos = {};

    req.body.toList.forEach(function (item) {
        tos[item] = 0
    });

    const toList = data.getToList(tos);

    const key = (+new Date() + Math.random().toFixed(3)).replace('.', '');

    const msgItem = {
        key,
        Type: 1,
        Content: req.body.Content,
        toList: toList
    };

    console.log("msgItem" + JSON.stringify(msgItem));

    robot.sendmsg(msgItem);
    res.send("发送成功")
});

router.get('/getGroupList', function (req, res, next) {

    // const md5 = data.getPremd5("@@bab5522dbe163ec41b5260d2fd957ea699705574dcfde2a1ab6c2c83fd1a9a15", "一个正经的吃饭群", "");

    console.log("groupChatList==================" + JSON.stringify(data.groupChatList));

    res.send(data.groupChatList)
});


module.exports = router;
