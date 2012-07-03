(function () {
    
    module.exports = {
        keyword : 'bop',
        action : function (bot, user, keyword) {
            if (!bot.isBopping()) {
                var currentDj = bot.getCurrentDj();
                if (currentDj !== user.userid) {
                    bot.startBopping();
                    bot.lastAction = keyword;
                    bot.bot.speak(bot.templates.render('bop', {
                            name : user.name,
                            action : keyword
                        }));
                } else {
                    bot.bot.speak(bot.templates.render('someoneElseBop', {
                            name : user.name,
                            action : keyword
                        }));
                }
            } else {
                bot.bot.speak(bot.templates.render('alreadyBopping', {
                        name : user.name,
                        action : keyword,
                        oldAction : bot.lastAction || 'bop'
                    }));
            }
        }
    }
    
}).call(this);
