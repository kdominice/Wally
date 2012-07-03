(function () {
    
    module.exports = {
        keyword : 'remove',
        action : function (bot, user, keyword) {
            if (bot.isDJing()) {
                bot.bot.stopSong(function () {
                    bot.bot.playlistAll(function (error, data) {
                        bot.bot.playlistRemove(data.list.length - 1, function () {
                            bot.bot.speak(bot.templates.render('skip', {
                                    name : user.name
                                }));
                        });
                    });
                });
            } else {
                bot.bot.speak('Sorry, I can\'t take a song off my playlist if I\'m not DJing.');
            }
        }
    };
    
}).call(this);
