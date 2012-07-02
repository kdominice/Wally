(function (_, async, natural, fn) {
    
    var commands = {};
    var registeredCommands = {};
    var wordnet = new natural.WordNet();
    
    commands.register = function (keyword, command) {
        registeredCommands[keyword] = command;
    };
    
    function getCommand(keyword) {
        return registeredCommands[keyword];
    }
    
    commands.alias = function (aliases, keyword) {
        var command = getCommand(keyword);
        if (command) {
            _.each(_.isArray(aliases) ? aliases : [aliases], function (alias) {
                commands.register(alias, command);
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
    
    module.exports = commands;
    
}).call(this, require('underscore'), require('async'), require('natural'), require('./fn'));
