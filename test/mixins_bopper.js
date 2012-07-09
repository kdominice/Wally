(function (assert, sinon, events, util, Bopper) {
    
    describe('Bopper mixin', function () {
        
        var bopper;
        var bot;
        
        beforeEach(function () {
            bopper = new Bopper({
                    logger : {
                        info : sinon.stub()
                    }
                });
            
            function Bot() {
                events.EventEmitter.call(this);
            }
            util.inherits(Bot, events.EventEmitter);
            
            bot = {};
            
            bot.bot = new Bot();
            bot.bot.vote = sinon.stub();
            
            bopper.initialize(bot);
        });
        
        it('should bind new API methods to the parent bot', function () {
            
            assert.equal(bopper.isBopping, bot.isBopping);
            assert.equal(bopper.startBopping, bot.startBopping);
            assert.equal(bopper.getCurrentBopAction, bot.getCurrentBopAction);
            
        });
        
        it('should not be bopping on load up', function () {
            
            assert.equal(bot.isBopping(), false);
            assert.equal(bot.getCurrentBopAction(), undefined);
        
        });
        
        it('should vote the song up if told to start bopping', function () {
        
            bot.startBopping();
            
            assert.equal(bot.isBopping(), true);
            assert.equal(bot.getCurrentBopAction(), 'bop');
            sinon.assert.calledOnce(bot.bot.vote);
            sinon.assert.calledWith(bot.bot.vote, 'up');
        
        });
        
        it('should set the bop action when told to start bopping with a bop action', function () {
        
            bot.startBopping('dance');
            
            assert.equal(bot.isBopping(), true);
            assert.equal(bot.getCurrentBopAction(), 'dance');
            sinon.assert.calledOnce(bot.bot.vote);
            sinon.assert.calledWith(bot.bot.vote, 'up');
        
        });
        
        it('should stop bopping when a new song starts', function () {
        
            bot.startBopping();
            
            bot.bot.emit('newsong');
            
            assert.equal(bot.isBopping(), false);
            assert.equal(bot.getCurrentBopAction(), undefined);
            
        });
        
    });
    
}).call(this, require('assert'), require('sinon'), require('events'), require('util'),
    require('../lib/mixins/bopper'));
