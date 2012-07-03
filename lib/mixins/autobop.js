var AutoBopper = (function (_) {
    
    function AutoBopper(options) {
        if (!(this instanceof AutoBopper)) {
            return new AutoBopper(options);
        }
        this.logger = options.logger;
        this.config = _.extend({}, AutoBopper.defaults, options.config);
        
        this.logger.info('AutoBopper instantiated - configuration set', this.config);
        _.bindAll(this);
    }
    
    AutoBopper.defaults = {
        enabled : false,
        threshold : 75
    };
    
    AutoBopper.prototype.initialize = function (parent) {
        parent.isAutoBopEnabled = this.isEnabled;
        parent.getAutoBopThreshold = this.getThreshold;
        parent.enableAutoBop = this.enable;
        parent.disableAutoBop = this.disable;
        
        parent.bot.on('update_votes', this.updateVotesHandler);
        parent.bot.on('roomChanged', this.updateVotesHandler);
        
        this.parent = parent;
    };
    
    /* Public API ----------------------------------------------------------- */
    AutoBopper.prototype.meetsThreshold = function (roomMetadata) {
        var ratio = (roomMetadata.upvotes / roomMetadata.listeners) * 100;
        this.logger.info('checking ratio', {
            threshold : this.getThreshold(),
            ratio : ratio
        });
        return (ratio >= this.getThreshold());
    };
    
    AutoBopper.prototype.isEnabled = function () {
        return this.config.enabled === true;
    };
    
    AutoBopper.prototype.updateStatus = function () {
        if (this.isEnabled()) {
            this.logger.info('checking for autobop', {
                isBopping : this.parent.isBopping(),
                meetsThreshold : this.meetsThreshold(this.lastRoomMetadata)
            });
            if (!this.parent.isBopping() && this.meetsThreshold(this.lastRoomMetadata)) {
                this.parent.startBopping();
            }
        }
    };
    
    AutoBopper.prototype.updateVotesHandler = function (error, response) {
        this.logger.info('running updateVotesHandler');
        this.lastRoomMetadata = response.room.metadata;
        this.updateStatus();
    };
    
    AutoBopper.prototype.getThreshold = function () {
        return this.config.threshold;
    };
    
    AutoBopper.prototype.enable = function (threshold) {
        if (!this.isEnabled()) {
            this.config.enabled = true;
            this.logger.info('autobop enabled');
            if (!_.isUndefined(threshold)) {
                this.config.threshold = threshold;
                this.logger.info('threshold updated', {
                    threshold : this.config.threshold
                });
            }
            this.updateStatus();
        }
    };
    
    AutoBopper.prototype.disable = function () {
        if (this.isEnabled()) {
            this.config.enabled = false;
            this.logger.info('autobop disabled');
        }
    };
    
    module.exports = AutoBopper;
    
    return AutoBopper;
    
}).call(this, require('underscore'));
