
async function onMessage(userKey,message) {
    console.log(` ${userKey} Message: ${message}`);
}

module.exports = {
    onMessage
};
