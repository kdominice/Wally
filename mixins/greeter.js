var Greeter = (function (_, Handlebars, natural) {
    
    var templates = {
        greeting : Handlebars.compile('Welcome @{{{ name }}}! You\'re welcome to play anything here, but please try to keep it SFW :-)'),
        hello : Handlebars.compile('Hi @{{{ name }}}! Thanks for noticing me...')
    };
    
    function Greeter(options) {
        if (!(this instanceof Greeter)) {
            return new Greeter(options);
        }
        this.logger = options.logger;
        this.tokenizer = new natural.WordTokenizer();
        _.bindAll(this);
    }
    
    Greeter.prototype.initialize = function (parent) {
        this.bot = parent.bot;
        this.userInfo = parent.userInfo;
        this.nameMentionRegExp = new RegExp('@' + this.userInfo.name.toLowerCase());
        
        parent.greet = this.greet;
        
        this.bot.on('speak', this.chatHandler);
        this.bot.on('registered', this.registeredHandler);
    };
    
    Greeter.prototype.registeredHandler = function (data) {
        this.bot.speak(templates.greeting({
                name : data.user[0].name
            }));
    };
    
    Greeter.prototype.greet = function (user) {
        this.bot.speak(templates.hello({
                name : user
            }));
    };
    
    Greeter.prototype.chatHandler = function (data) {
        var tokens = this.tokenizer.tokenize(data.text.toLowerCase());
        if (data.text.toLowerCase().match(this.nameMentionRegExp)) {
            if (_.indexOf(['hey', 'hi', 'hello', 'greetings'], tokens[0]) > -1) {
                this.greet(data.name);
            }
        }
    };
    
    exports.Greeter = Greeter;
    
    return Greeter;
    
}).call(this, require('underscore'), require('handlebars'), require('natural'));
