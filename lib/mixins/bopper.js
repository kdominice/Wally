var Bopper = (function (_) {

    function Bopper(options) {
        if (!(this instanceof Bopper)) {
            return new Bopper(options);
        }
        this.logger = options.logger;
        _.bindAll(this);
    }
    
    Bopper.prototype.initialize = function (parent) {
        this.bot = parent.bot;
        
        parent.isBopping = this.isBopping;
        parent.startBopping = this.startBopping;
        
        this.bot.on('newsong', this.resetBop);
    };
        
    /* Public API ----------------------------------------------------------- */
    Bopper.prototype.resetBop = function () {
        this.bopping = false;
    };
        
    Bopper.prototype.isBopping = function () {
        return (this.bopping === true);
    };
        
    Bopper.prototype.startBopping = function () {
        if (!this.isBopping()) {
            this.bopping = true;
            this.bot.vote('up');
        }
    };
    
    module.exports = Bopper;
    
    return Bopper;

}).call(this, require('underscore'));