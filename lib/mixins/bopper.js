var Bopper = (function (_) {

    function Bopper(options) {
        if (!(this instanceof Bopper)) {
            return new Bopper(options);
        }
        this.logger = options.logger;
        this.isEnabled = false;
        this.threshold = 75;
        _.bindAll(this);
    }
    
    Bopper.prototype.initialize = function (parent) {
        this.bot = parent.bot;
        
        parent.isBopping = this.isBopping;
        parent.startBopping = this.startBopping;
        parent.getCurrentBopAction = this.getCurrentBopAction;
        
        this.bot.on('newsong', this.resetBop);
    };
        
    /* Public API ----------------------------------------------------------- */
    Bopper.prototype.resetBop = function () {
        this.bopping = false;
        delete this.currentBopAction;
    };
        
    Bopper.prototype.isBopping = function () {
        return (this.bopping === true);
    };
        
    Bopper.prototype.startBopping = function (bopAction) {
        if (!this.isBopping()) {
            this.currentBopAction = bopAction || 'bop';
            this.bopping = true;
            this.bot.vote('up');
        }
    };
    
    Bopper.prototype.getCurrentBopAction = function () {
        return this.currentBopAction;
    };
    
    module.exports = Bopper;
    
    return Bopper;

}).call(this, require('underscore'));