# wechatrobot
微信智能聊天机器人
#前言
有这样一个需求，如何实现微信聊天的自动回复，又如何实现微信群聊的多群同时回复，调研了微信里的功能，要实现多群回复就要先发出消息，然后长按可以多条转发，但也只能实现最多九个群的转发，这样复杂的操作岂不是要把用户累💩。于是瞬间就想到了这样一个功能，如图：
![微信群发](https://upload-images.jianshu.io/upload_images/2413316-af0b0fb19a873c22.jpg?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
如果能这样勾选群组后，直接输入聊天内容呢，而且不管有多少群，照样可以群发。那么下面探索一下，目前互联网里能实现这种功能的所有方案，经过一段时间的调研，目前主要分为一下几种方式实现：
- 微信Web端api封装调用实现
- 基于Windows自动化技术，其实就是自动化Windows桌面版的微信，因为是客户端，效率要比网页端的快
- 网页自动化技术，跟上一个技术有相似之处，这种方式就是对微信web端的自动化实现
- 微信Android端的自动化技术，这个需要一整套Android开发环境。
#优缺点分析
这么多的方案，各有优缺点，目前来看基于web端api封装的方案是最合适，因为定制化更强，直接接口的调用相当稳定，windows桌面端的自动化和网页自动化看似也很好，但实现难度上和稳定性上已经输给了前者，然而Android端的自动化是同样的，但它有一个不可替代的优点，就是可以实现自动发送朋友圈，这点是前三者都实现不了的。
#轮子的选择
找到了方案，我们就要考虑有没有轮子可以用，毕竟站在巨人的肩膀好乘凉，在github上找到如下几种：
- [ItChat - Python](https://github.com/littlecodersh/ItChat)
- [wxpy - Python](https://github.com/youfou/wxpy)  wxpy 在 itchat 的基础上提供更丰富的扩展
- [wechat - PHP](https://www.easywechat.com/)  官方： 它可能是开发微信App的世界上最好的SDK
- [wechaty - TypeScript](https://github.com/Chatie/wechaty)  Wechaty是一个用于微信个人账户的Bot SDK，可以帮助您在6行javascript中创建机器人，跨平台支持包括Linux，Windows，Darwin（OSX / Mac）和Docker。
- [WeChatAssist - JAVA](https://github.com/Nicky213Zhang/WeChatAssist)  
目前找到各个语言里面最合适的几个，选择你最喜欢的一个，我选了wechaty - TypeScript ，因为它是目前为止最为活跃的一个，而且问题又是最少的一个。
#轮子的部署
wechaty 是一个服务端，通过NodeJs实现，那我们只需要一个ubuntu服务器，就可以完成部署    
###具体环境如下：
- node  环境
- pm2  对node服务管理
###开发工具如下：
- webStorm 编码工具
- express 用于接口的实现
#轮子的升华
wechaty官方给的例子只适合在服务终端直接使用，我们要实现的是在手机客户端通过接口调用获取登录二维码，登录后获取所有群组。下面是通过express框架写的两个接口。
###如何通过接口获取二维码
``` 
router.get('/getScan', function (req, res, next) {
        const userKey = req.query.key;
        if (userKey) {
              const wechaty = new Wechaty(name: userKey});
              Data.pushWechaty(userKey, wechaty); //缓存Wechaty对象
              wechaty.on('scan', (qrcode, status) => {
                       const scanUrl = `https://api.qrserver.com/v1/create-qr-code/?     data=${encodeURIComponent(qrcode)}`;
                       console.log(`${userKey} Scan QR Code to login: ${status}\n ${scanUrl}`);
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
              wechaty.start();
            }
    }else {
        res.send({
            success: false,
            msg: "用户信息不能为空"
        })
    }
}
```
###如何获取所有群组
```
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
```
这样就实现了我们刚开始的需求，群组有了，发个消息简直不能再简单了，只需要一句话：
 ```
     const keyroom = await bot.Room.find({topic: '群名'})
     keyroom.say("内容")
```
这样手机端就可以只传过来群名，我就可以这样发送消息了。
#总结
通过这次调研，可以跟那些收费的机器人平台说拜拜了，最好是不用他们的平台，因为你的聊天记录都在他们的掌握之中，哪还有隐私可讲。必须扼杀。
