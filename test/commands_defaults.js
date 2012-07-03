(function (_, assert, sinon, commands, defaultCommands) {
    
    describe('built-in commands', function () {
        
        var bot;
        
        beforeEach(function () {
            _.each(defaultCommands.commands, function (command) {
                commands.register(command.keyword, command.action);
            });
            bot = {};
            bot.templates = {};
            bot.bot = {};
        });
        
        describe('autobop command', function () {
        
            it('should call disableAutobop() on the bot when called with "off"', function () {
            
                bot.disableAutoBop = sinon.stub();
                
                commands.execute(bot, {
                    name : 'bob'
                }, 'autobop', 'off');
                
                sinon.assert.calledOnce(bot.disableAutoBop);
            
            });
        
            it('should call enableAutobop() called with no threshold', function () {
            
                bot.enableAutoBop = sinon.stub();
                
                commands.execute(bot, {
                    name : 'bob'
                }, 'autobop', '75');
                
                sinon.assert.calledOnce(bot.enableAutoBop);
                sinon.assert.calledWith(bot.enableAutoBop);
            
            });
        
            it('should call enableAutobop() on the bot, passing a threshold when called with a threshold', function () {
            
                bot.enableAutoBop = sinon.stub();
                
                commands.execute(bot, {
                    name : 'bob'
                }, 'autobop', '75');
                
                sinon.assert.calledOnce(bot.enableAutoBop);
                sinon.assert.calledWith(bot.enableAutoBop, 75);
            
            });
        
        });
        
        describe('bop command', function () {
            
            it('should speak the "already bopping template" when bot is bopping', function () {
                
                bot.isBopping = sinon.stub().returns(true);
                bot.templates.render = sinon.stub().returns('rendered template');
                bot.bot.speak = sinon.stub();
                
                commands.execute(bot, {
                    name : 'bob'
                }, 'bop');
                
                sinon.assert.calledOnce(bot.isBopping);
                
                sinon.assert.calledOnce(bot.templates.render);
                sinon.assert.calledWith(bot.templates.render, 'alreadyBopping', {
                    name : 'bob',
                    action : 'bop',
                    oldAction : 'bop'
                });
                
                sinon.assert.calledOnce(bot.bot.speak);
                sinon.assert.calledWith(bot.bot.speak, 'rendered template');
            });
            
            it('should speak the "someone else bop" template if the commanding user is DJ-ing', function () {
                
                bot.isBopping = sinon.stub().returns(false);
                bot.getCurrentDj = sinon.stub().returns('1234');
                bot.templates.render = sinon.stub().returns('rendered template');
                bot.bot.speak = sinon.stub();
                
                commands.execute(bot, {
                    name : 'bob',
                    userid : '1234'
                }, 'bop');
                
                sinon.assert.calledOnce(bot.isBopping);
                sinon.assert.calledOnce(bot.getCurrentDj);
                
                sinon.assert.calledOnce(bot.templates.render);
                sinon.assert.calledWith(bot.templates.render, 'someoneElseBop', {
                    name : 'bob',
                    action : 'bop'
                });
                
                sinon.assert.calledOnce(bot.bot.speak);
                sinon.assert.calledWith(bot.bot.speak, 'rendered template');
                
            });
            
            it('should speak the "bop" template when the commanding user is not DJ-ing', function () {
                
                bot.isBopping = sinon.stub().returns(false);
                bot.getCurrentDj = sinon.stub().returns('1234');
                bot.startBopping = sinon.stub();
                bot.templates.render = sinon.stub().returns('rendered template');
                bot.bot.speak = sinon.stub();
                
                commands.execute(bot, {
                    name : 'bob',
                    userid : '4321'
                }, 'bop');
                
                assert.equal(bot.lastAction, 'bop');
                
                sinon.assert.calledOnce(bot.isBopping);
                sinon.assert.calledOnce(bot.getCurrentDj);
                
                sinon.assert.calledOnce(bot.templates.render);
                sinon.assert.calledWith(bot.templates.render, 'bop', {
                    name : 'bob',
                    action : 'bop'
                });
                
                sinon.assert.calledOnce(bot.bot.speak);
                sinon.assert.calledWith(bot.bot.speak, 'rendered template');
                
            });
        });
        
        describe('snag command', function () {});
        
        describe('suggestion command', function () {
            
            it('should speak the "suggestion failure" template if there is not active echonest suggestion', function () {
                bot.getSession = sinon.stub();
                bot.templates.render = sinon.stub().returns('rendered template');
                bot.bot.speak = sinon.stub();
                
                commands.execute(bot, {
                    name : 'bob'
                }, 'suggest');
                
                sinon.assert.calledOnce(bot.getSession);
                
                sinon.assert.calledOnce(bot.templates.render);
                sinon.assert.calledWith(bot.templates.render, 'suggestionFailure', {
                    name : 'bob'
                });
                
                sinon.assert.calledOnce(bot.bot.speak);
                sinon.assert.calledWith(bot.bot.speak, 'rendered template');
            });
            
            it('should pm the "suggestion" template when echonest session is active', function () {
                
                bot.getSession = sinon.stub().returns({});
                bot.templates.render = sinon.stub().returns('rendered template');
                bot.playlistSuggestion = sinon.stub().callsArgWith(0, null, {
                        response : {
                            songs : [{
                                    title : 'Times Like These',
                                    artist_name : 'Foo Fighters'
                                }
                            ]
                        }
                    });
                bot.bot.pm = sinon.stub().callsArgWith(2, null, {
                        success : true
                    });
                
                commands.execute(bot, {
                    name : 'bob',
                    userid : '4321'
                }, 'suggest');
                
                sinon.assert.calledOnce(bot.getSession);
                
                sinon.assert.calledOnce(bot.playlistSuggestion);
                
                sinon.assert.calledOnce(bot.templates.render);
                sinon.assert.calledWith(bot.templates.render, 'suggestion', {
                    name : 'bob',
                    song : 'Times Like These',
                    artist : 'Foo Fighters'
                });
                
                sinon.assert.calledOnce(bot.bot.pm);
                sinon.assert.calledWith(bot.bot.pm, 'rendered template', '4321');
            });
            
            it('should speak the "suggestion" template when echonest session is active and pm fails', function () {
                
                bot.getSession = sinon.stub().returns({});
                bot.templates.render = sinon.stub().returns('rendered template');
                bot.playlistSuggestion = sinon.stub().callsArgWith(0, null, {
                        response : {
                            songs : [{
                                    title : 'Times Like These',
                                    artist_name : 'Foo Fighters'
                                }
                            ]
                        }
                    });
                bot.bot.pm = sinon.stub().callsArgWith(2, null, {
                        success : false
                    });
                bot.bot.speak = sinon.stub();
                
                commands.execute(bot, {
                    name : 'bob',
                    userid : '4321'
                }, 'suggest');
                
                sinon.assert.calledOnce(bot.getSession);
                
                sinon.assert.calledOnce(bot.playlistSuggestion);
                
                sinon.assert.calledTwice(bot.templates.render);
                sinon.assert.calledWith(bot.templates.render, 'suggestion', {
                    name : 'bob',
                    song : 'Times Like These',
                    artist : 'Foo Fighters'
                });
                
                sinon.assert.calledOnce(bot.bot.pm);
                sinon.assert.calledWith(bot.bot.pm, 'rendered template', '4321');
                
                sinon.assert.calledOnce(bot.bot.speak);
                sinon.assert.calledWith(bot.bot.pm, 'rendered template');
            });
            
        });
        
        describe('skip command', function () {});
        
        describe('remove command', function () {});
    });
}).call(this, require('underscore'), require('assert'), require('sinon'),
    require('../lib/commands'), require('../lib/commands/defaults'));
