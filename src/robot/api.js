const http = require('http');
const util = require('./util');

function getTodaysHistory(callBack) {
    const date = new Date();

    http.get("http://api.juheapi.com/japi/toh?v=1.0&month=" + (date.getMonth() + 1) + "&day=" + date.getDate() + "&key=e7be7efcaa9eaaa150fee985a397a40e", function (res) {
        res.setEncoding("utf-8");
        const resData = [];
        res.on("data", function (chunk) {
            resData.push(chunk);
        })
            .on("end", function () {
                const array = JSON.parse(resData.join(""));
                if(array.error_code==0){
                    const index = util.rd(0, array.result.length - 1);
                    callBack(array.result[index]);
                }
            });
    })

}

getTodaysHistory(function (res) {
    console.log(res)
});

module.exports = {
    getTodaysHistory
};
