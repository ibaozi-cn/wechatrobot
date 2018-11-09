const cacheWechatyStatus = {};
const cacheWechaty = {};
const cacheErrorWechaty = {};

function getWechatyStatus(key) {
    return cacheWechatyStatus[key]
}

function getWechaty(key) {
    return cacheWechaty[key]
}

function getLastErrorForWechaty(key) {
    return cacheErrorWechaty[key]
}

function pushErrorWechaty(key, error) {
    cacheErrorWechaty[key] = error.toString();
}

function pushWechatyStatus(key, status) {
    cacheWechatyStatus[key] = status;
}

function pushWechaty(key, wechaty) {
    cacheWechaty[key] = wechaty;
}

function clearCacheData() {
    Object.keys(cacheWechaty).forEach(key => delete cacheWechaty[key]);
    Object.keys(cacheWechatyStatus).forEach(key => delete cacheWechatyStatus[key])
}

module.exports = {
    getWechatyStatus,
    getWechaty,
    pushWechatyStatus,
    pushWechaty,
    clearCacheData,
    pushErrorWechaty,
    getLastErrorForWechaty
};
