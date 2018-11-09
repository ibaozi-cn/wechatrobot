const express = require('express');
const router = express.Router();
const {log, Wechaty} = require('wechaty');// import { Wechaty } from 'wechaty'

const Scan = require('../src/on-scan');
const Login = require('../src/on-login');
const Message = require('../src/on-message');
const Logout = require('../src/on-logout');
const Error = require('../src/on-error');
const Data = require('../src/data');


router.get('/test', function (req, res, next) {
    console.log(req.query)
});

router.get('/getScan', function (req, res, next) {
    const userKey = req.query.key;
    if (userKey) {
        // let errorLast = Data.getLastErrorForWechaty(userKey);
        // if(errorLast){
        //     res.send({
        //         success: false,
        //         msg: errorLast
        //     });
        //     return;
        // }
        if (Data.getWechatyStatus(userKey)) {
            res.send({
                success: false,
                msg: "用户已登录"
            });
            return;
        }
        let wechatyCache = Data.getWechaty(userKey);
        if (wechatyCache) {
            console.log(`wechatyCache.options.name============================${wechatyCache.options.name}`);
            wechatyCache.stop();
        }
        const wechaty = new Wechaty({
            name: userKey
        });
        Data.pushWechaty(userKey, wechaty);
        wechaty.on('scan', (qrcode, status) => {
            Scan.onScan(userKey, qrcode, status, (url) => {
                try {
                    res.send({
                        success: true,
                        msg: "请扫描二维码登录",
                        data: {
                            url: url
                        }
                    })
                } catch (e) {

                }
            })
        });
        wechaty.on('login', user => {
            Login.onLogin(userKey, user, () => {
                try {
                    res.send({
                        success: false,
                        msg: "用户已登录"
                    })
                } catch (e) {

                }
            });
        });
        wechaty.on('logout', user => Logout.onLogout(userKey, user));
        wechaty.on('message', message => Message.onMessage(userKey, message));
        wechaty.on('error', e => Error.onError(userKey, e));
        wechaty.start().catch(async e => {
            console.error(`${userKey} Bot start() fail:`, e);
            await wechaty.stop();
        });
    } else {
        res.send({
            success: false,
            msg: "用户信息不能为空"
        })
    }
});
/**
 * 获取所有小组信息
 */
router.get('/getRoomList', async function (req, res, next) {

    const userKey = req.query.key;

    if (userKey) {
        if (!Data.getWechatyStatus(userKey)) {
            res.send({
                success: false,
                msg: "用户未登录"
            });
            return;
        }
        const wechaty = Data.getWechaty(userKey);
        if (!wechaty) {
            res.send({
                success: false,
                msg: "用户信息缓存异常，请重新登录"
            });
            return;
        }
        const isOff = wechaty.logonoff();
        console.log(JSON.stringify(isOff));

        if (!isOff) {
            res.send({
                success: false,
                msg: "用户已退出，请重新登录"
            });
            return;
        }

        const roomList = await wechaty.Room.findAll();

        const topicList = await Promise.all(
            roomList.map(async room => await room.topic()),
        );

        log.info('Bot', topicList);
        //
        // const contact = await wechaty.Contact.find({
        //     name: '崔铮-居理新房咨询师'
        // });
        // console.log("contact=======" + JSON.stringify(contact));

        res.send({
            success: true,
            data: roomList,
            msg: "获取所有组信息"
        });

    } else {
        res.send({
            success: false,
            msg: "用户信息不能为空"
        })
    }
});

router.get('/stop', function (req, res, next) {
    const userKey = req.query.key;
    if (userKey) {
        let wechaty = Data.getWechaty(userKey);
        if (wechaty) {
            wechaty.stop()
                .then(() => {
                    Data.pushWechatyStatus(userKey, false);
                    res.send({
                        success: true,
                        msg: "已暂停监听服务"
                    })
                })
                .catch(e => {
                    res.send({
                        success: true,
                        msg: "停止服务监听失败" + e
                    })
                });
        } else {
            res.send({
                success: false,
                msg: "该用户服务不存在"
            })
        }
    } else {
        res.send({
            success: false,
            msg: "用户信息不能为空"
        })
    }
});

module.exports = router;
