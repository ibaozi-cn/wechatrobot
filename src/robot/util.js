const commData = require("./comm-data");

/**
 * 获取不重复随机数
 * @param integer start 随机数最小值
 * @param integer end 随机数最大值
 * @param integer size 随机数获取数量 最小为1，默认1
 * @return integer|array 如 1或者[2,4,7,9]
 */
 function randUnique(start, end, size) {
    // 全部随机数值
    const allNums = [];

    // 判断获取随机数个数
    size = size ? (size > end - start ? end - start : size) : 1;

    // 生成随机数值区间数组
    for (let i = start, k = 0; i <= end; i++, k++) {
        allNums[k] = i;
    }

    // 打撒数组排序
    allNums.sort(function () {
        return 0.5 - Math.random();
    });

    // 获取数组从第一个开始到指定个数的下标区间
    return allNums.slice(0, size);
}

 function rd(n, m) {
    const c = m - n + 1;
    return Math.floor(Math.random() * c + n);
}


 function merryChristmas(friendList, roomList) {
    if (bot) {
        if (friendList.length > 0) {
            friendList.forEach((item, index) => {
                const length = commData.merryChristmasBlessing.length;
                const blessing = randUnique(0, length, length);
                if (index < length - 1) {
                    item.say(commData.merryChristmasBlessing[blessing[index]]);
                } else {
                    item.say(commData.merryChristmasBlessing[blessing[index - length]]);
                }
            })
        }
        if (roomList.length > 0) {
            roomList.forEach((item, index) => {
                const length = commData.merryChristmasBlessing.length;
                const blessing = randUnique(0, length, length);
                if (index < length - 1) {
                    item.say(commData.merryChristmasBlessing[blessing[index]]);
                } else {
                    item.say(commData.merryChristmasBlessing[blessing[index - length]]);
                }
            })
        }
    }
}

module.exports = {
    merryChristmas,
    rd,
    randUnique
};

