var ChatCommandExecutor = (function (_, natural) {
    
    function ChatCommandExecutor(options) {
        if (!(this instanceof ChatCommandExecutor)) {
            return new ChatCommandExecutor(options);
        }
        this.tokenizer = new natural.WordTokenizer();
        this.logger = options.logger;
        _.bindAll(this);
    }
    
    ChatCommandExecutor.prototype.initialize = function (parent) {
        this.bot = parent.bot;
        this.userInfo = parent.userInfo;
        this.commands = parent.commands;
        this.parent = parent;
        
        this.bot.on('speak', this.chatHandler);
    };
    
    ChatCommandExecutor.prototype.chatHandler = function (data) {
        var tokens = this.tokenizer.tokenize(data.text.toLowerCase());
        if (tokens[0] === this.userInfo.shortName && tokens.length > 1) {
            var args = tokens.slice(1);
            args.unshift(data);
            this.executeCommand.apply(this, args);
        }
    };
    
    ChatCommandExecutor.prototype.executeCommand = function (user, command) {
        var args = Array.prototype.slice.apply(arguments);
        args.unshift(this.parent);
        this.commands.execute.apply(null, args);
    };
    
    exports.ChatCommandExecutor = ChatCommandExecutor;
    
    return ChatCommandExecutor;
    
}).call(this, require('underscore'), require('natural'));
