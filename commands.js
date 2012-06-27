(function (_, Handlebars, async, natural, fn) {
    
    var commands = {};
    var registeredCommands = {};
    var wordnet = new natural.WordNet();
    
    function addIng(verb) {
        if (verb.match(/[^i]e$/)) {
            return verb.replace(/e$/, 'ing');
        }
        if (verb.match(/[pm]$/)) {
            return verb + verb[verb.length - 1] + 'ing';
        }
        if (verb.match(/[^e]$/)) {
            return verb + 'ing';
        }
        return verb + '-ing';
    }
    
    Handlebars.registerHelper('mention', function (item) {
        return '@' + item;
    });
    
    Handlebars.registerHelper('addIng', addIng);
    
    var templates = {
        bop : Handlebars.compile('OK {{mention name}}, I\'m {{addIng action}}!'),
        someoneElseBop : Handlebars.compile('{{mention name}}, I\'d love to {{ action }}, but I think it\'d be nicer if someone else asked me to {{ action }} for your song...'),
        alreadyBopping : Handlebars.compile('Sorry {{mention name}}, I can\'t {{action}}, I\'m too busy {{addIng oldAction}}!'),
        skip : Handlebars.compile('Alright {{mention name}}, I skipped my song, even though it was awesome...'),
        addSuccess : Handlebars.compile('OK {{mention name}}, I\'ll play this if I ever DJ.'),
        addFailure : Handlebars.compile('Actually {{mention name}}, I\'ve already got this tune in my queue.'),
        song : Handlebars.compile('"{{{ song }}}" by {{{ artist }}}, from the album "{{{ album }}}"'),
        suggestion : Handlebars.compile('Hey {{mention name}}, why don\'t you try "{{{ song }}}", by {{{ artist }}}'),
        suggestionFailure : Handlebars.compile('Sorry {{mention name}}, wait just a little bit longer. I\'m not quite ready to suggest a song.')
    };
    
    commands.register = function (command) {
        _.each(command.keywords, function (keyword) {
            registeredCommands[keyword] = command.action;
        });
    };
    
    function getCommand(keyword) {
        return registeredCommands[keyword];
    }
    
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
        keywords : ['sway', 'swing', 'bop', 'dance', 'mosh', 'rock', 'jam', 'dougie',
            'breakdance', 'headbang', 'rave', 'groove'],
        action : function (bot, user, keyword) {
            if (!bot.isBopping()) {
                var currentDj = bot.getCurrentDj();
                if (currentDj !== user.userid) {
                    bot.startBopping();
                    bot.lastAction = keyword;
                    bot.bot.speak(templates.bop({
                            name : user.name,
                            action : keyword
                        }));
                } else {
                    bot.bot.speak(templates.someoneElseBop({
                            name : user.name,
                            action : keyword
                        }));
                }
            } else {
                bot.bot.speak(templates.alreadyBopping({
                    name : user.name,
                    action : keyword,
                    oldAction : bot.lastAction || 'bop'
                }));
            }
        }
    });
    
    commands.register({
        keywords : ['skip'],
        action : function (bot, user, keyword) {
            bot.bot.stopSong(function () {
                bot.bot.speak(templates.skip({
                        name : user.name
                    }));
            });
        }
    });
    
    commands.register({
        keywords : ['snag', 'add', 'grab', 'snatch'],
        action : function (bot, user, keyword) {
            bot.addSong(bot.getCurrentlyPlaying()._id, function (addData) {
                if (addData && addData.success) {
                    bot.bot.speak(templates.addSuccess({
                            name : user.name
                        }));
                } else {
                    bot.bot.speak(templates.addFailure({
                            name : user.name
                        }));
                }
            });
        }
    });
    
    commands.register({
        keywords : ['suggest'],
        action : function (bot, user, keyword) {
            var session = bot.getSession();
            if (session) {
                bot.playlistSuggestion(function (err, results) {
                    bot.bot.pm(templates.suggestion({
                            name : user.name,
                            song : results.response.songs[0].title,
                            artist : results.response.songs[0].artist_name
                        }), user.userid, function (result) {
                        if (!(result && result.success)) {
                            bot.bot.speak(templates.suggestion({
                                    name : user.name,
                                    song : results.response.songs[0].title,
                                    artist : results.response.songs[0].artist_name
                                }));
                        }
                    });
                });
            } else {
                bot.bot.speak(templates.suggestionFailure({
                        name : user.name
                    }));
            }
        }
    });
    
    commands.register({
        keywords : ['skip'],
        action : function (bot, user, keyword) {
            bot.bot.stopSong(function () {
                bot.bot.speak(templates.skip({
                        name : user.name
                    }));
            });
        }
    });
    
    commands.register({
        keywords : ['remove', 'delete'],
        action : function (bot, user, keyword) {
            if (bot.isDJing()) {
                bot.bot.stopSong(function () {
                    bot.bot.playlistAll(function (data) {
                        bot.bot.playlistRemove(data.list.length - 1, function () {
                            bot.bot.speak(templates.skip({
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
    
}).call(this, require('underscore'), require('handlebars'), require('async'), require('natural'), require('./fn').fn);
