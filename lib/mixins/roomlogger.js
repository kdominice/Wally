var RoomLogger = (function (_) {
    
    function RoomLogger(options) {
        if (!(this instanceof RoomLogger)) {
            return new RoomLogger(options);
        }
        this.logger = options.logger;
        _.bindAll(this);
    }
    
    RoomLogger.prototype.initialize = function (parent) {
        this.bot = parent.bot;
        this.bot.on('registered', this.registeredHandler);
        this.bot.on('deregistered', this.registeredHandler);
        this.bot.on('speak', this.speakHandler);
        this.bot.on('newsong', this.songHandler);
    };
    
    RoomLogger.prototype.registeredHandler = function (error, data) {
        this.logger.info({
            event : data.command,
            username : data.user[0].name,
            userid : data.user[0].userid,
        });
    }
    
    RoomLogger.prototype.speakHandler = function (error, data) {
        this.logger.info({
            event : data.command,
            username : data.name,
            userid : data.userid,
            text : data.text
        });
    }
    
    RoomLogger.prototype.songHandler = function (error, data) {
        this.logger.info({
            event : data.command,
            songid : data.room.metadata.current_song._id,
            song : data.room.metadata.current_song.metadata.song,
            artist : data.room.metadata.current_song.metadata.artist
        });
    }
    
    module.exports = RoomLogger;
    
    return RoomLogger;
    
}).call(this, require('underscore'));
