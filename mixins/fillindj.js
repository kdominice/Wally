var FillInDJ = (function (_) {
    
    function FillInDJ(options) {
        if (!(this instanceof FillInDJ)) {
            return new FillInDJ(options);
        }
        this.logger = options.logger;
        _.bindAll(this);
    }
    
    FillInDJ.prototype.initialize = function (parent) {
        this.bot = parent.bot;
        parent.isDJing = this.isDJing;
        this.userInfo = parent.userInfo;
        this.bot.on('roomChanged', this.registeredHandler);
        this.bot.on('registered', this.registeredHandler);
        this.bot.on('deregistered', this.registeredHandler);
        this.bot.on('add_dj', this.updateDjing);
        this.bot.on('rem_dj', this.updateDjing);
    };
    
    FillInDJ.prototype.registeredHandler = function (data) {
        this.bot.roomInfo(this.checkDJ);
    };
    
    FillInDJ.prototype.isDJing = function () {
        return (this.djing === true);
    };
    
    FillInDJ.prototype.checkDJ = function (roomInfoData) {
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
    
    FillInDJ.prototype.updateDjing = function (addDjData) {
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
    
    exports.FillInDJ = FillInDJ;
    
    return FillInDJ;
    
}).call(this, require('underscore'));
