(function () {
    
    module.exports = {
        keyword : 'suggest',
        action : function (bot, user, keyword) {
            var session = bot.getSession();
            if (session) {
                bot.playlistSuggestion(function (err, results) {
                    bot.bot.pm(bot.templates.render('suggestion', {
                            name : user.name,
                            song : results.response.songs[0].title,
                            artist : results.response.songs[0].artist_name
                        }), user.userid, function (error, result) {
                        if (!(result && result.success)) {
                            bot.bot.speak(bot.templates.render('suggestion', {
                                    name : user.name,
                                    song : results.response.songs[0].title,
                                    artist : results.response.songs[0].artist_name
                                }));
                        }
                    });
                });
            } else {
                bot.bot.speak(bot.templates.render('suggestionFailure', {
                        name : user.name
                    }));
            }
        }
    };
    
}).call(this);
