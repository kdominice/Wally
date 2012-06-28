var logging = (function (winston) {
    
    var logging = {};
    
    logging.fileLogger = function (fileName) {
        return new winston.Logger({
            transports : [
                new(winston.transports.File)({
                    filename : 'log/' + fileName
                })
            ]
        });
    };
    
    exports.logging = logging;
    
    return logging;
    
}).call(this, require('winston'));
