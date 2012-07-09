(function (assert, sinon, events, util, ChatCommandExecutor) {
    
    describe('ChatCommandExecutor mixin', function () {
        
        var executor;
        var bot;
        
        beforeEach(function () {
            
            executor = new ChatCommandExecutor({
                    logger : {
                        info : sinon.stub()
                    },
                    config : {
                        spellcheckThreshold : 0.99
                    }
                });
            
            function Bot() {
                events.EventEmitter.call(this);
            }
            util.inherits(Bot, events.EventEmitter);
            
            bot = {};
            bot.userInfo = {
                shortName : 'wally'
            };
            
            bot.bot = new Bot();
            bot.commands = {};
            bot.commands.execute = sinon.stub();
            
            executor.initialize(bot);
            
        });
        
        it('should respond to chat commands from other users', function () {
            
            var eventData = {
                "command" : "speak",
                "userid" : "4dea70c94fe7d0517b1a3519",
                "name" : "@richhemsley",
                "text" : "wally bop again"
            };
            
            bot.bot.emit('speak', null, eventData);
            
            sinon.assert.calledOnce(bot.commands.execute);
            sinon.assert.calledWith(bot.commands.execute, bot, eventData, 'bop', 'again');
            
        });
        
        it ('should update the command threshold upon initialization', function () {
        
            assert.equal(bot.commands.spellcheckThreshold, 0.99);
        
        })
        
    });
    
}).call(this, require('assert'), require('sinon'), require('events'), require('util'),
    require('../lib/mixins/chatcommandexecutor'));
