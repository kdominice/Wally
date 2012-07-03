(function () {
    
    module.exports = {
        keyword : 'snag',
        action : function (bot, user, keyword) {
            bot.addSong(bot.getCurrentlyPlaying()._id, function (addData) {
                if (addData && addData.success) {
                    bot.bot.speak(bot.templates.render('addSuccess', {
                            name : user.name
                        }));
                } else {
                    bot.bot.speak(bot.templates.render('addFailure', {
                            name : user.name
                        }));
                }
            });
        }
    };
    
}).call(this);