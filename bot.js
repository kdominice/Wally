var winston = require('winston');

var Bot = require('ttapi');
var logging = require('./logging').logging;
var ControllerBot = require('./controller').ControllerBot;
var commands = require('./commands').commands;

var echonest = require('./echonest').echonest;

var mixins = (function () {
    
    var roomLogger = new require('./mixins/roomlogger').RoomLogger({
            logger : logging.fileLogger('room.log')
        });
    
    var fillInDj = new require('./mixins/fillindj').FillInDJ({
            logger : logging.fileLogger('fillindj.log')
        });
    
    var playTracker = new require('./mixins/playtracker').PlayTracker({
            logger : logging.fileLogger('playtracker.log')
        });
    
    var bopper = new require('./mixins/bopper').Bopper({
            logger : logging.fileLogger('bopper.log')
        });
    
    var greeter = new require('./mixins/greeter').Greeter({
            logger : logging.fileLogger('greeter.log')
        });
    
    var snagger = new require('./mixins/snagger').Snagger({
            logger : logging.fileLogger('snagger.log')
        });
    
    var echonestSessionManager = new require('./mixins/echonestsessionmanager').EchonestSessionManager({
            logger : logging.fileLogger('snagger.log')
        });
    
    var chatCommandExecutor = new require('./mixins/chatcommandexecutor').ChatCommandExecutor({
            logger : logging.fileLogger('snagger.log')
        });
    
    return [roomLogger, fillInDj, playTracker, bopper, snagger, echonestSessionManager,
        chatCommandExecutor, greeter];
    
}).call(this);

require('fs').readFile('./conf.json', 'ascii', function (err, result) {
    var CONFIG = JSON.parse(result);
    var bot = new ControllerBot({
        room : CONFIG.ROOM_ID,
        bot : new Bot(CONFIG.AUTH, CONFIG.USER_ID),
        commands : commands,
        userInfo : {
            shortName : 'wally',
            name : 'Shy Wally'
        },
        echonest : new echonest.Client({
            http : require('http'),
            api_key : CONFIG.ECHONEST_API_KEY,
            logger : logging.fileLogger('echonest.log')
        }),
        adminUser : {
            name : 'mdomi',
            id : '4f67ab51590ca246db036ab1'
        },
        mixins : mixins
    });
});
return;

