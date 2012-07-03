(function (assert, sinon, _, CommandStore) {
    
    describe('CommandStore', function () {
        
        var commands;
        
        beforeEach(function () {
            commands = new CommandStore({});
        });
        
        it('should execute a command that is registered', function (done) {
            
            commands.register('execute', function (bot, user, keyword) {
                assert.equal(keyword, 'execute');
                done();
            });
            
            commands.execute(null, null, 'execute');
        });
        
        it('should execute an aliased command', function (done) {
            
            commands.register('execute', function (bot, user, keyword) {
                assert.equal(keyword, 'do');
                done();
            });
            
            commands.alias('do', 'execute');
            
            commands.execute(null, null, 'do');
        });
        
        it('should alias an array if passed an alias', function () {
            
            var executed = [];
            
            commands.register('execute', function (bot, user, keyword) {
                executed.push(keyword);
            });
            
            commands.alias(['do', 'work', 'laugh'], 'execute');
            
            commands.execute(null, null, 'do');
            commands.execute(null, null, 'work');
            commands.execute(null, null, 'laugh');
            
            assert.deepEqual(executed, ['do', 'work', 'laugh']);
        });
        
        it('should consult a WordNet database for synonyms of commands', function () {
            
            var wordnet = {};
            wordnet.lookup = sinon.stub().callsArgWith(1, [{
                            pos : 'v',
                            synonyms : ['execute', 'work']
                        }
                    ]);
            
            commands = new CommandStore({
                    wordnet : wordnet
                });
            
            commands.register('execute', function (bot, user, keyword) {
                assert.equal(keyword, 'do');
            });
            
            commands.execute(null, null, 'do');
            sinon.assert.calledOnce(wordnet.lookup);
            
        });
        
        it('should attempt to spellcheck', function () {
            
            var spellchecker = sinon.stub();
            spellchecker.withArgs('execute', 'do').returns(0.81);
            spellchecker.withArgs('othercommand', 'do').returns(0.1);
            
            commands = new CommandStore({
                    spellchecker : spellchecker
                });
            
            
            var callback = sinon.stub();
            
            commands.register('execute', callback);
            
            commands.register('othercommand', function (bot, user, keyword) {});
            
            commands.execute(null, null, 'do');
            
            
            sinon.assert.calledTwice(spellchecker);
            sinon.assert.calledWith(spellchecker, 'execute', 'do');
            sinon.assert.calledWith(spellchecker, 'othercommand', 'do');
            
            sinon.assert.calledOnce(callback);
            sinon.assert.calledWith(callback, null, null, 'execute'); 
            
        });
        
    });
    
}).call(this, require('assert'), require('sinon'), require('underscore'), require('../lib/commands.js'));
