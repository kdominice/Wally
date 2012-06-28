var Greeter = (function (_, Handlebars, natural) {
    
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
        this.parent = parent;
        this.userInfo = parent.userInfo;
        this.nameMentionRegExp = new RegExp('@' + this.userInfo.name.toLowerCase());
        
        parent.greet = this.greet;
        
        this.bot.on('speak', this.chatHandler);
        this.bot.on('registered', this.registeredHandler);
    };
    
    Greeter.prototype.registeredHandler = function (error, data) {
        this.bot.speak(this.parent.templates.render('greeting', {
                name : data.user[0].name
            }));
    };
    
    Greeter.prototype.greet = function (user) {
        this.bot.speak(this.parent.templates.render('hello', {
                name : user
            }));
    };
    
    Greeter.prototype.chatHandler = function (error, data) {
        var tokens = this.tokenizer.tokenize(data.text.toLowerCase());
        if (data.text.toLowerCase().match(this.nameMentionRegExp)) {
            if (_.indexOf(['hey', 'hi', 'hello', 'greetings'], tokens[0]) > -1) {
                this.greet(data.name);
            }
        }
    };
    
    module.exports = Greeter;
    
    return Greeter;
    
}).call(this, require('underscore'), require('handlebars'), require('natural'));
