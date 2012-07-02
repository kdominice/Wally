(function (assert, sinon, TTAdapter) {
    
    describe('TTAdapter', function () {
        
        var bot;
        
        beforeEach(function () {
            bot = {};
            
            bot.foo = sinon.stub().callsArgWith(1, 'calledResult');
            
            bot.on = function (eventName, callback) {
                bot[eventName] = function () {
                    callback.apply(null, arguments);
                }
            };
        });
        
        it('should adapt the wrapped API callbacks to two arguments', function (done) {
            
            var adapter = new TTAdapter(bot);
            
            adapter.foo('bar', function (error, result) {
                assert.equal(error, null);
                assert.equal(result, 'calledResult');
                sinon.assert.calledOnce(bot.foo);
                
                done();
            });
            
        });
        
        it('should adapt event binding to wrap callbacks with two arguments', function (done) {
            
            var adapter = new TTAdapter(bot);
            
            adapter.on('bar', function (error, result1, result2) {
                assert.equal(error, null);
                assert.deepEqual(result1, {
                    foo : 'callback',
                    bar : 'args'
                });
                assert.equal(result2, 'otherResult');
                done();
            });
            
            setTimeout(function () {
                bot.bar({
                    foo : 'callback',
                    bar : 'args'
                }, 'otherResult');
            }, 20)
            
        });
        
    });
    
}).call(this, require('assert'), require('sinon'), require('../lib/ttadapter'));
