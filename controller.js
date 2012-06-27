var ControllerBot = (function (_) {
    
    var slice = Array.prototype.slice;
    
    function ControllerBot(options) {
        if (!(this instanceof ControllerBot)) {
            return new ControllerBot(options);
        }
        this.bot = options.bot;
        this.roomId = options.room;
        this.adminUser = options.adminUser;
        this.commands = options.commands || {};
        
        this.echonest = options.echonest;
        this.userInfo = options.userInfo;
        
        _.bindAll(this);
        
        this.mixins = [].concat(options.mixins);
        _.invoke(this.mixins, 'initialize', this);
        
        this.bot.on('ready', this.readyHandler);
        this.bot.on('roomChanged', this.roomChangedHandler);
    }
    
    ControllerBot.prototype.readyHandler = function () {
        this.bot.roomRegister(this.roomId);
    };
    
    ControllerBot.prototype.roomChangedHandler = function (data) {
        this.room = data.room;
        this.bot.getFanOf(this.fanAdmin);
        this.bot.userInfo(this.verifyProfileInfo);
    };
    
    ControllerBot.prototype.verifyProfileInfo = function (data) {
        if (data.name !== this.userInfo.userName) {
            this.bot.modifyProfile({
                name : this.userInfo.name
            });
        }
    };
    
    ControllerBot.prototype.fanAdmin = function (data) {
        if (!(this.adminUser.id in data.fanof)) {
            this.bot.becomeFan(this.adminUser.id);
        }
    };
    
    exports.ControllerBot = ControllerBot;
    
    return ControllerBot;
    
}).call(this, require('underscore'));
