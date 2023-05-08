const setExpiredTime = (days) => {
    var now = new Date()
    now.setTime(now.getTime() + days*24*60*60*1000)
    return `expires=${now.toGMTString()}`
}
exports.setExpiredTime = setExpiredTime