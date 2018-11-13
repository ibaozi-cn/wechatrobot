(function () {
    var Robot, axios;

    axios = require('axios');

    module.exports = Robot = class Robot {
        constructor(key, api = 'http://www.tuling123.com/openapi/api', answer1) {
            this.key = key;
            this.api = api;
            this.answer = answer1;
        }

        async ask(info, options = {}, answer = this.answer) {
            var ret;
            ret = answer ? (await answer(info, options)) : void 0;
            if (ret) {
                return ret;
            }
            options.key = this.key;
            options.info = info;
            return axios.get(this.api, {
                params: options
            }).then(function (res) {
                console.log("tuling123:response===================" + res);
                return res.data;
            });
        }

    };

}).call(this);
