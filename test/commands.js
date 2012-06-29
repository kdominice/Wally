(function (assert, _, commands) {
    
    describe('commands', function () {
        
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
        
    });
    
}).call(this, require('assert'), require('underscore'), require('../lib/commands.js'));
