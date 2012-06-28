var TTAdapter = (function (_, fn) {
    
    function TTAdapter(bot) {
        if (!(this instanceof TTAdapter)) {
            return new TTAdapter(bot);
        }
        this.bot = bot;
        
        var self = this;
        
        _.chain(bot)
        .functions()
        .filter(fn.neq('on'))
        .each(function (functionName) {
            self[functionName] = function () {
                var args = _.map(arguments, function(argument) {
                    if (_.isFunction(argument)) {
                        return function (result) {
                            return argument.call(null, null, result);
                        };
                    }
                    return argument;
                });
                self.bot[functionName].apply(this.bot, args);
            };
        });
    }
    
    TTAdapter.prototype.on = function (eventName, callback) {
        return this.bot.on(eventName, function(result) {
            callback(null, result);
        });
    };
    
    module.exports = TTAdapter;
    
    return TTAdapter;
    
}).call(this, require('underscore'), require('./fn'));
