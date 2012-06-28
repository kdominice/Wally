(function (_, Handlebars, async, natural, fn) {
    
    var commands = {};
    var registeredCommands = {};
    var wordnet = new natural.WordNet();
    
    commands.register = function (command) {
        registeredCommands[command.keyword] = command.action;
    };
    
    function getCommand(keyword) {
        return registeredCommands[keyword];
    }
    
    commands.alias = function (aliases, keyword) {
        var command = getCommand(keyword);
        if (command) {
            _.each(_.isArray(aliases) ? aliases : [aliases], function (alias) {
                registeredCommands[alias] = command.action;
            });
        }
    };
    
    commands.loadAliases = function (aliases) {
        _.each(aliases, commands.alias);
    };
    
    commands.execute = function (bot, user, keyword) {
        var args = Array.prototype.slice.call(arguments);
        var commandAction = getCommand(keyword);
        
        if (commandAction) {
            commandAction.apply(null, args);
        } else {
            wordnet.lookup(keyword, function (results) {
                var synonymResult = _.chain(results)
                    .filter(fn.property('pos').eq('v'))
                    .pluck('synonyms')
                    .flatten()
                    .map(getCommand)
                    .reject(_.isUndefined)
                    .first()
                    .value();
                if (synonymResult) {
                    synonymResult.apply(null, args);
                }
            });
        }
    };
    
    commands.register({
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
    
    commands.register({
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
    
    commands.register({
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
    
    commands.register({
        keyword : 'skip',
        action : function (bot, user, keyword) {
            bot.bot.stopSong(function () {
                bot.bot.speak(bot.templates.render('skip', {
                        name : user.name
                    }));
            });
        }
    });
    
    commands.register({
        keywords : 'remove',
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
    
    exports.commands = commands;
    
}).call(this, require('underscore'), require('handlebars'), require('async'), require('natural'), require('./fn'));
