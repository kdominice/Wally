var _ = require('underscore');
var winston = require('winston');
var natural = require('natural');
var Bot = require('ttapi');
var fs = require('fs');
var async = require('async');

var templates = require('../lib/templates').templates;
var TTAdapter = require('../lib/ttadapter');
var logging = require('../lib/logging').logging;
var ControllerBot = require('../lib/controller').ControllerBot;

var CommandStore = require('../lib/commands');
var defaultCommands = require('../lib/commands/defaults');

var commands = new CommandStore({
        wordnet : new natural.WordNet(),
        spellchecker : natural.JaroWinklerDistance
    });

var echonest = require('../lib/echonest');

_.each(defaultCommands.commands, function (command) {
    commands.register(command.keyword, command.action);
});

function createMixins(mixinConfig) {
    var mixinClasses = ['roomlogger', 'fillindj', 'playtracker', 'bopper', 'greeter', 'snagger',
        'echonestsessionmanager', 'chatcommandexecutor', 'autobop'];
    
    return _.map(mixinClasses, function (mixinClass) {
        var MixinClass = require('../lib/mixins/' + mixinClass);
        return new MixinClass({
            logger : logging.fileLogger(mixinClass + '.log'),
            config : _.extend({}, mixinConfig[mixinClass])
        });
    });
    
}

var files = ['./conf.json', './data/aliases.json', './data/templateText.json'];

async.map(files, fs.readFile, function (error, results) {
    console.log(error);
    var parsedResults = _.chain(results).invoke('toString', 'ascii').map(JSON.parse).value();
    var CONFIG = parsedResults[0];
    var aliases = parsedResults[1];
    var templateDefinitions = parsedResults[2];
    
    var mixins = createMixins(CONFIG.mixins || {});
    
    var http = require('http');
    var LyricsWikiaClient = require('../lib/lyricswikia');
    
    commands.loadAliases(aliases);
    templates.load(templateDefinitions);
    
    new ControllerBot({
        room : CONFIG.ROOM_ID,
        templates : templates,
        bot : new TTAdapter(new Bot(CONFIG.AUTH, CONFIG.USER_ID)),
        commands : commands,
        userInfo : {
            shortName : CONFIG.BOT_SHORT_NAME,
            name : CONFIG.BOT_USERNAME
        },
        echonest : new echonest.Client({
            http : http,
            api_key : CONFIG.ECHONEST_API_KEY,
            logger : logging.fileLogger('echonest.log')
        }),
        lyricsClient : new LyricsWikiaClient({
            http : http,
            logger : logging.fileLogger('lyricswiki.log')
        }),
        adminUser : {
            name : CONFIG.ADMIN_USER_NAME,
            id : CONFIG.ADMIN_USER_ID
        },
        mixins : mixins
    });
});
