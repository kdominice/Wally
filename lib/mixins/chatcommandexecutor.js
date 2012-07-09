var ChatCommandExecutor = (function (_, natural) {
    
    function ChatCommandExecutor(options) {
        if (!(this instanceof ChatCommandExecutor)) {
            return new ChatCommandExecutor(options);
        }
        this.config = _.extend({}, ChatCommandExecutor.defaults, options.config);
        this.tokenizer = new natural.WordTokenizer();
        this.logger = options.logger;
        _.bindAll(this);
        
        this.logger.info('ChatCommandExecutor created', {
            spellcheckThreshold : this.config.spellcheckThreshold
        });
    }
    
    ChatCommandExecutor.defaults = {
        spellcheckThreshold : 90
    };
    
    ChatCommandExecutor.prototype.initialize = function (parent) {
        this.bot = parent.bot;
        this.userInfo = parent.userInfo;
        this.commands = parent.commands;
        this.commands.spellcheckThreshold = this.config.spellcheckThreshold;
        this.parent = parent;
        
        this.bot.on('speak', this.chatHandler);
        
        this.logger.info('ChatCommandExecutor initialized', {
            spellcheckThreshold : this.config.spellcheckThreshold
        });
    };
    
    ChatCommandExecutor.prototype.chatHandler = function (error, data) {
        var tokens = this.tokenizer.tokenize(data.text.toLowerCase());
        if (tokens[0] === this.userInfo.shortName && tokens.length > 1) {
            var args = tokens.slice(1);
            args.unshift(data);
            this.executeCommand.apply(this, args);
        }
    };
    
    ChatCommandExecutor.prototype.executeCommand = function (user, command) {
        var args = Array.prototype.slice.apply(arguments);
        this.logger.info('Executing command', {
            command : args[1]
        });
        args.unshift(this.parent);
        this.commands.execute.apply(this.commands, args);
    };
    
    module.exports = ChatCommandExecutor;
    
    return ChatCommandExecutor;
    
}).call(this, require('underscore'), require('natural'));
