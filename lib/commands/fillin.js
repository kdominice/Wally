(function () {

    module.exports = {
        keyword : 'fillin',
        action : function (bot, user, keyword, onOff) {
            if (onOff === 'off') {
                bot.disableFillInDj();
            } else if (onOff === 'on') {
                bot.enableFillInDj();
            }
        }
    };

}).call(this);