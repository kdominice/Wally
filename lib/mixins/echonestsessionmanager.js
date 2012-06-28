var EchonestSessionManager = (function (_, async, models) {
    
    function EchonestSessionManager(options) {
        if (!(this instanceof EchonestSessionManager)) {
            return new EchonestSessionManager(options);
        }
        this.logger = options.logger;
        _.bindAll(this);
    }
    
    EchonestSessionManager.prototype.initialize = function (parent) {
        this.bot = parent.bot;
        this.parent = parent;
        
        this.parent.getSession = this.getSession;
        this.parent.playlistSuggestion = this.playlistSuggestion;
        
        this.bot.on('newsong', this.updateNowPlaying);
        this.bot.on('roomChanged', this.roomChangedHandler);
    };
    
    EchonestSessionManager.prototype.getSession = function () {
        return this.playlistSession;
    };
    
    EchonestSessionManager.prototype.handlePlaylistSessionCreate = function (error, result) {
        if (error) {
            this.logger.error(error)
            return;
        }
        this.playlistSession = new models.EchoNestSession();
        this.playlistSession.session_id = result.response.session_id;
        this.playlistSession.save();
    };
    
    EchonestSessionManager.prototype.handleSongSearchResults = function (error, results) {
        if (error) {
            this.logger.error(error);
            return;
        }
        var self = this;
        var ids = _.chain(_.isArray(results) ? results : [results])
            .pluck('response')
            .pluck('songs')
            .map(function (songArray) {
                return _.first(songArray);
            })
            .reject(_.isUndefined)
            .pluck('id')
            .value();
        if (this.playlistSession) {
            this.parent.echonest.playlist.dynamic.steer({
                session_id : this.playlistSession.session_id,
                more_like_this : ids
            });
        } else {
            models.EchoNestSession.find(function (err, docs) {
                if (docs.length === 0) {
                    self.parent.echonest.playlist.dynamic.create({
                        type : 'song-radio',
                        song_id : ids
                    }, self.handlePlaylistSessionCreate);
                } else {
                    self.playlistSession = docs[0];
                    self.parent.echonest.playlist.dynamic.steer({
                        session_id : self.playlistSession.session_id,
                        more_like_this : ids
                    });
                }
            })
            return;
        }
    };
    
    EchonestSessionManager.prototype.roomChangedHandler = function (error, roomChangeData) {
        if (error) {
            this.logger.error(error);
            return;
        }
        this.bot.setStatus('available');
        this.updateNowPlaying(error, roomChangeData);
        var lastPlayed = _.chain(this.parent.lastPlayed(1))
            .pluck('metadata')
            .map(function (songMetadata) {
                return {
                    title : songMetadata.song,
                    artist : songMetadata.artist
                };
            })
            .value();
        async.map(lastPlayed, this.parent.echonest.song.search, this.handleSongSearchResults);
    };
    
    EchonestSessionManager.prototype.playlistSuggestion = function (callback) {
        if (this.playlistSession) {
            return this.parent.echonest.playlist.dynamic.next({
                session_id : this.playlistSession.session_id,
                results : 1
            }, callback);
        }
    };
    
    EchonestSessionManager.prototype.updateNowPlaying = function (error, data) {
        if (error) {
            this.logger.error(error);
            return;
        }
        if (data.room.metadata.current_song) {
            if (this.playlistSession) {
                this.parent.echonest.song.search({
                    artist : data.room.metadata.current_song.metadata.artist,
                    title : data.room.metadata.current_song.metadata.song
                }, this.handleSongSearchResults);
            }
        }
    };
    
    module.exports = EchonestSessionManager;
    
    return EchonestSessionManager;
    
}).call(this, require('underscore'), require('async'), require('../models').models);
