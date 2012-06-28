﻿var Snagger = (function (_) {

    function Snagger(options) {
        if (!(this instanceof Snagger)) {
            return new Snagger(options);
        }
        this.logger = options.logger;
        _.bindAll(this);
    }
    
    Snagger.prototype.initialize = function (parent) {
        this.bot = parent.bot;
        parent.addSong = this.addSong;
    };
    
    Snagger.prototype.addSong = function (id, callback) {
        var self = this;
        this.bot.playlistAll(function (error, data) {
            var songIds = _.pluck(data.list, '_id');
            if (_.indexOf(songIds, id) === -1) {
                self.bot.playlistAdd(id, songIds.length, function (error, addData) {
                    callback(addData);
                });
            } else {
                callback({
                    success : false
                });
            }
        });
    };
    
    module.exports = Snagger;
    
    return Snagger;
    
}).call(this, require('underscore'));