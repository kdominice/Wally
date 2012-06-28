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

var fs = require('fs');
var async = require('async');
var templates = require('./templates').templates;

var files = ['./conf.json', './aliases.json', './templateText.json'];

async.map(files, fs.readFile, function (error, results) {
    var CONFIG = JSON.parse(results[0].toString('ascii'));
    var aliases = JSON.parse(results[1].toString('ascii'));
    var templateDefinitions = JSON.parse(results[2].toString('ascii'));
    
    commands.loadAliases(aliases);
    templates.load(templateDefinitions);
    
    var bot = new ControllerBot({
        room : CONFIG.ROOM_ID,
        templates : templates,
        bot : new Bot(CONFIG.AUTH, CONFIG.USER_ID),
        commands : commands,
        userInfo : {
            shortName : CONFIG.BOT_SHORT_NAME,
            name : CONFIG.BOT_USERNAME
        },
        echonest : new echonest.Client({
            http : require('http'),
            api_key : CONFIG.ECHONEST_API_KEY,
            logger : logging.fileLogger('echonest.log')
        }),
        adminUser : {
            name : CONFIG.ADMIN_USER_NAME,
            id : CONFIG.ADMIN_USER_ID
        },
        mixins : mixins
    });
});

