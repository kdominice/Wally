(function () {
    
    module.exports = {
        keyword : 'autobop',
        action : function (bot, user, keyword, threshold) {
            if (threshold === 'off') {
                bot.disableAutoBop();
            } else {
                if (typeof threshold === 'undefined') {
                    bot.enableAutoBop();
                } else {
                    bot.enableAutoBop(parseInt(threshold, 10));
                }
            }
        }
    }
    
}).call(this);
