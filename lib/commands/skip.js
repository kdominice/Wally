(function () {
    
    module.exports = {
        keyword : 'skip',
        action : function (bot, user, keyword) {
            bot.bot.stopSong(function () {
                bot.bot.speak(bot.templates.render('skip', {
                        name : user.name
                    }));
            });
        }
        
    };
    
}).call(this);
