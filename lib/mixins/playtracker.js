var PlayTracker = (function (_) {
    
    function PlayTracker(options) {
        if (!(this instanceof PlayTracker)) {
            return new PlayTracker(options);
        }
        this.logger = options.logger;
        this.playedList = [];
        _.bindAll(this);
    }
    
    PlayTracker.prototype.initialize = function (parent) {
        this.bot = parent.bot;
        
        parent.lastPlayed = this.lastPlayed;
        parent.getCurrentlyPlaying = this.getCurrentlyPlaying;
        parent.getCurrentDj = this.getCurrentDj;
        
        this.bot.on('newsong', this.updateNowPlaying);
        this.bot.on('roomChanged', this.roomChangedHandler);
    };
    
    /* Event Handlers ------------------------------------------------------- */
    PlayTracker.prototype.roomChangedHandler = function (error, roomChangeData) {
        if (roomChangeData.room.metadata.songlog) {
            this.addToPlayedList(roomChangeData.room.metadata.songlog);
        }
        this.updateNowPlaying(error, roomChangeData);
    };
    
    /* Public API ----------------------------------------------------------- */
    PlayTracker.prototype.addToPlayedList = function (songs) {
        if (_.isArray(songs)) {
            this.playedList = this.playedList.concat(songs);
        } else {
            this.playedList.push(songs);
        }
    };
        
    PlayTracker.prototype.getCurrentlyPlaying = function () {
        return this.currentlyPlaying;
    };
    
    PlayTracker.prototype.getCurrentDj = function () {
        return this.currentDj;
    };
    
    PlayTracker.prototype.lastPlayed = function (n) {
        return _.last(this.playedList, n);
    };
    
    PlayTracker.prototype.updateNowPlaying = function (error, data) {
        delete this.currentlyPlaying;
        delete this.currentDj;
        
        if (data.room.metadata.current_song) {
            this.currentlyPlaying = data.room.metadata.current_song;
            if (_.last(this.playedList)._id != this.currentlyPlaying._id) {
                this.addToPlayedList(this.currentlyPlaying);
            }
        }
        if (data.room.metadata.current_dj) {
            this.currentDj = data.room.metadata.current_dj;
        }
    };
    
    module.exports = PlayTracker;
    
    return PlayTracker;
    
}).call(this, require('underscore'), require('handlebars'), require('natural'));
