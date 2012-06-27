var models = (function (mongoose) {
    
    mongoose.connect('mongodb://localhost/test');
    
    var models = {};
    
    models.EchoNestSession = mongoose.model('EchonestSession', new mongoose.Schema({
        session_id : String
    }));
    
    exports.models = models;
    
    return models;
    
}).call(this, require('mongoose'));

