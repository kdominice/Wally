(function () {
    
    var defaultCommands = [];
    
    defaultCommands.push({
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
    });
    
    defaultCommands.push({
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
    });
    
    defaultCommands.push({
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
    });
    
    defaultCommands.push({
        keyword : 'skip',
        action : function (bot, user, keyword) {
            bot.bot.stopSong(function () {
                bot.bot.speak(bot.templates.render('skip', {
                        name : user.name
                    }));
            });
        }
    });
    
    defaultCommands.push({
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
    });
    
    module.exports = {
        commands : defaultCommands
    };
    
}).call(this);
