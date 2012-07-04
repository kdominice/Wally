var FillInDJ = (function (_) {
    
    function FillInDJ(options) {
        if (!(this instanceof FillInDJ)) {
            return new FillInDJ(options);
        }
        this.logger = options.logger;
        this.config = _.extend({}, FillInDJ.defaults, options.config);
        _.bindAll(this);
    }
    
    FillInDJ.defaults = {
        enabled : false
    };
    
    FillInDJ.prototype.isEnabled = function () {
        return this.config.enabled === true;
    };
    
    FillInDJ.prototype.enable = function () {
        this.config.enabled = true;
        this.bot.roomInfo(this.checkDJ);
    };
    
    FillInDJ.prototype.disable = function () {
        this.config.enabled = false;
        if (this.isDJing()) {
            this.bot.remDj();
        }
    };
    
    FillInDJ.prototype.initialize = function (parent) {
        this.bot = parent.bot;
        
        parent.isDJing = this.isDJing;
        parent.isFillInDjEnabled = this.isEnabled;
        parent.enableFillInDj = this.enable;
        parent.disableFillInDj = this.disable;
        
        this.userInfo = parent.userInfo;
        this.bot.on('roomChanged', this.registeredHandler);
        this.bot.on('registered', this.registeredHandler);
        this.bot.on('deregistered', this.registeredHandler);
        this.bot.on('add_dj', this.updateDjing);
        this.bot.on('rem_dj', this.updateDjing);
    };
    
    FillInDJ.prototype.registeredHandler = function (error, data) {
        if (this.isEnabled()) { 
            this.bot.roomInfo(this.checkDJ);
        }
    };
    
    FillInDJ.prototype.isDJing = function () {
        return (this.djing === true);
    };
    
    FillInDJ.prototype.checkDJ = function (error, roomInfoData) {
        if (roomInfoData && roomInfoData.users) {
            if (!this.isDJing() && roomInfoData.users.length < 6) {
                this.djing = true;
                this.bot.addDj();
            } else if (this.isDJing() && roomInfoData.users.length >= 6) {
                this.djing = false;
                this.bot.remDj();
            }
        }
    };
    
    FillInDJ.prototype.updateDjing = function (error, addDjData) {
        switch (addDjData.command) {
        case 'rem_dj':
            if (addDjData.user.name === this.userInfo.name) {
                this.djing = false;
            }
            break;
        case 'add_dj':
            if (addDjData.user.name === this.userInfo.name) {
                this.djing = true;
            }
            break;
        }
    };
    
    module.exports = FillInDJ;
    
    return FillInDJ;
    
}).call(this, require('underscore'));
