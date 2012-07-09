(function (_, async, fn) {
    
    function CommandStore(options) {
        _.extend(this, options);
        this.spellcheckThreshold = 0.9;
        this.registeredCommands = {};
    }
    
    CommandStore.prototype.register = function (keyword, command) {
        this.registeredCommands[keyword] = command;
    };
    
    CommandStore.prototype.getCommand = function (keyword) {
        return this.registeredCommands[keyword];
    };
    
    CommandStore.prototype.alias = function (aliases, keyword) {
        var command = this.getCommand(keyword);
        if (command) {
            _.each(_.isArray(aliases) ? aliases : [aliases], function (alias) {
                this.register(alias, command);
            }, this);
        }
    };
    
    CommandStore.prototype.loadAliases = function (aliases) {
        _.each(aliases, this.alias, this);
    };
    
    CommandStore.prototype.execute = function (bot, user, keyword) {
        var args = Array.prototype.slice.call(arguments);
        var commandAction = this.getCommand(keyword);
        var self = this;
        
        if (commandAction) {
            return commandAction.apply(null, args);
        }
        
        if (this.spellchecker) {
            var spellcheckResult = _.chain(this.registeredCommands)
                .keys()
                .map(function (commandKeyword) {
                    return {
                        keyword : commandKeyword,
                        distance : this.spellchecker(commandKeyword, keyword)
                    };
                }, this)
                .sortBy(fn.property('distance'))
                .filter(fn.property('distance').gt(this.spellcheckThreshold), this)
                .reverse()
                .first()
                .value();
            if (spellcheckResult) {
                args[2] = spellcheckResult.keyword;
                return this.getCommand(spellcheckResult.keyword).apply(null, args);
            }
        }
        
        if (this.wordnet) {
            this.wordnet.lookup(keyword, function (results) {
                var synonymResult = _.chain(results)
                    .filter(fn.property('pos').eq('v'))
                    .pluck('synonyms')
                    .flatten()
                    .map(self.getCommand, self)
                    .reject(_.isUndefined)
                    .first()
                    .value();
                if (synonymResult) {
                    synonymResult.apply(null, args);
                }
            });
        }
    };
    
    module.exports = CommandStore;
    
}).call(this, require('underscore'), require('async'), require('./fn'));
