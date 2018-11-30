const pinyin = require("pinyin");

const compare = (() => {
    function compareArray(a, b) {
        console.log("array", a, b);
        if (a.length !== b.length) {
            return false;
        }
        const length = a.length;
        for (let i = 0; i < length; i++) {
            if (!compare(a[i], b[i])) {
                return false;
            }
        }
        return true;
    }

    function compareObject(a, b) {
        console.log("object", a, b);
        const keya = Object.keys(a);
        const keyb = Object.keys(b);

        if (keya.length !== keyb.length) {
            return false;
        }

        return keya.every(key => {
            if (!compare(a[key], b[key])) {
                return false;
            }
            return true;
        });
    }

    function compare(a, b) {
        if (a === b) {
            return true;
        }

        if (typeof a !== typeof b || a === null || b === null) {
            return false;
        }

        if (Array.isArray(a)) {
            if (!Array.isArray(b)) {
                return false;
            }
            return compareArray(a, b);
        }

        if (typeof a === "object") {
            return compareObject(a, b);
        }

        console.log("value", a, b);
        return false;
    }

    return compare;
})();

function compareHello(hello) {
    return compare(pinyin(hello, {
        style: pinyin.STYLE_NORMAL,
        segment: false
    }), pinyin("爱小哆", {
        style: pinyin.STYLE_NORMAL,
        segment: false
    }))
}

module.exports = {
    compare: compare,
    compareH: compareHello
};
