(function (assert, sinon, events, util, FillInDj) {
    
    describe('FillInDj mixin', function () {
        
        var fillInDj;
        var bot;
        
        beforeEach(function () {
            fillInDj = new FillInDj({
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
            bot.bot.addDj = sinon.stub();
            bot.bot.remDj = sinon.stub();
            bot.bot.roomInfo = sinon.stub().callsArgWith(0, null, {
                "users" : ['1234', '2345', '3456', '4567', '5678', '6789', '7890']
            });
            
            
            fillInDj.initialize(bot);
        });
        
        it('should load with default disabled', function () {
        
            assert.equal(fillInDj.isEnabled(), false);
        
        });
        
        it('should bind new API methods to the parent bot', function () {
            
            assert.equal(fillInDj.isEnabled, bot.isFillInDjEnabled);
            
            assert.equal(bot.isFillInDjEnabled(), false);
            
        });
        
        it('should report it is are enabled after it is enabled', function () {
            
            bot.enableFillInDj();
            
            assert.equal(bot.isFillInDjEnabled(), true);
            
        });
        
        it('should report it is disabled if it is disabled after being enabled', function () {
            
            bot.enableFillInDj();
            
            bot.disableFillInDj();
            
            assert.equal(bot.isFillInDjEnabled(), false);
            
        });
        
        it('should not react to the "roomChange" event when it is not enabled', function () {
            
            bot.bot.roomInfo = sinon.stub().callsArgWith(0, null, {
                "users" : ['1234']
            })
            
            bot.bot.emit('roomChanged', null);
            
            sinon.assert.notCalled(bot.bot.addDj);
            sinon.assert.notCalled(bot.bot.remDj);
            
        });
        
        it('should not react to the "registered" event when it is not enabled', function () {
            
            bot.bot.roomInfo = sinon.stub().callsArgWith(0, null, {
                "users" : ['1234']
            });
            
            bot.bot.emit('registered', null);
            
            sinon.assert.notCalled(bot.bot.addDj);
            sinon.assert.notCalled(bot.bot.remDj);
            
        });
        
        it('should not react to the "deregistered" event when it is not enabled', function () {
            
            bot.bot.roomInfo = sinon.stub().callsArgWith(0, null, {
                "users" : ['1234']
            });
            
            bot.bot.emit('deregistered', null);
            
            sinon.assert.notCalled(bot.bot.addDj);
            sinon.assert.notCalled(bot.bot.remDj);
            
        });
        
        it('should start DJing on "roomChange" if there enabled, and there are not enough people in the room to fill all slots', function () {
            
            fillInDj.enable();
            
            assert.equal(fillInDj.isEnabled(), true);
            assert.equal(fillInDj.isDJing(), false);
            bot.bot.roomInfo = sinon.stub().callsArgWith(0, null, {
                "users" : ['1234']
            });
            
            bot.bot.emit('roomChanged');
            
            sinon.assert.calledOnce(bot.bot.roomInfo);
            
            sinon.assert.calledOnce(bot.bot.addDj);
            sinon.assert.notCalled(bot.bot.remDj);
            assert.equal(fillInDj.isDJing(), true);
        
        });
        
        it('should start DJing on "registered" if there enabled, and there are not enough people in the room to fill all slots', function () {
            
            fillInDj.enable();
            
            assert.equal(fillInDj.isEnabled(), true);
            assert.equal(fillInDj.isDJing(), false);
            bot.bot.roomInfo = sinon.stub().callsArgWith(0, null, {
                "users" : ['1234']
            });
            
            bot.bot.emit('registered');
            
            sinon.assert.calledOnce(bot.bot.roomInfo);
            
            sinon.assert.calledOnce(bot.bot.addDj);
            sinon.assert.notCalled(bot.bot.remDj);
            assert.equal(fillInDj.isDJing(), true);
        
        });
        
        it('should start DJing on "deregistered" if there enabled, and there are not enough people in the room to fill all slots', function () {
            
            fillInDj.enable();
            
            assert.equal(fillInDj.isEnabled(), true);
            assert.equal(fillInDj.isDJing(), false);
            bot.bot.roomInfo = sinon.stub().callsArgWith(0, null, {
                "users" : ['1234']
            });
            
            bot.bot.emit('deregistered');
            
            sinon.assert.calledOnce(bot.bot.roomInfo);
            
            sinon.assert.calledOnce(bot.bot.addDj);
            sinon.assert.notCalled(bot.bot.remDj);
            assert.equal(fillInDj.isDJing(), true);
        
        });
        
        it('should stop DJing on "roomChange" if enabled and there are are enough people in the room to fill all slots', function () {
            
            fillInDj.enable();
            
            assert.equal(fillInDj.isEnabled(), true);
            assert.equal(fillInDj.isDJing(), false);
            bot.bot.roomInfo = sinon.stub().callsArgWith(0, null, {
                "users" : ['1234']
            });
            
            bot.bot.emit('roomChanged');
            
            sinon.assert.calledOnce(bot.bot.roomInfo);
            
            sinon.assert.calledOnce(bot.bot.addDj);
            sinon.assert.notCalled(bot.bot.remDj);
            assert.equal(fillInDj.isDJing(), true);
            
            // restub with "full" room
            bot.bot.roomInfo = sinon.stub().callsArgWith(0, null, {
                "users" : ['1234', '123', '2334', '4244', '4124', 'abcd']
            });
            bot.bot.addDj = sinon.stub();
            bot.bot.remDj = sinon.stub();
            
            bot.bot.emit('roomChanged');
            
            sinon.assert.calledOnce(bot.bot.roomInfo);
            
            sinon.assert.calledOnce(bot.bot.remDj);
            sinon.assert.notCalled(bot.bot.addDj);
            assert.equal(fillInDj.isDJing(), false);
        
        });
        
        it('should stop DJing on "registered" if enabled and there are are enough people in the room to fill all slots', function () {
            
            fillInDj.enable();
            
            assert.equal(fillInDj.isEnabled(), true);
            assert.equal(fillInDj.isDJing(), false);
            bot.bot.roomInfo = sinon.stub().callsArgWith(0, null, {
                "users" : ['1234']
            });
            
            bot.bot.emit('deregistered');
            
            sinon.assert.calledOnce(bot.bot.roomInfo);
            
            sinon.assert.calledOnce(bot.bot.addDj);
            sinon.assert.notCalled(bot.bot.remDj);
            assert.equal(fillInDj.isDJing(), true);
            
            // restub with "full" room
            bot.bot.roomInfo = sinon.stub().callsArgWith(0, null, {
                "users" : ['1234', '123', '2334', '4244', '4124', 'abcd']
            });
            bot.bot.addDj = sinon.stub();
            bot.bot.remDj = sinon.stub();
            
            bot.bot.emit('deregistered');
            
            sinon.assert.calledOnce(bot.bot.roomInfo);
            
            sinon.assert.calledOnce(bot.bot.remDj);
            sinon.assert.notCalled(bot.bot.addDj);
            assert.equal(fillInDj.isDJing(), false);
        
        });
        
        it('should stop DJing on "deregistered" if enabled and there are are enough people in the room to fill all slots', function () {
            
            fillInDj.enable();
            
            assert.equal(fillInDj.isEnabled(), true);
            assert.equal(fillInDj.isDJing(), false);
            bot.bot.roomInfo = sinon.stub().callsArgWith(0, null, {
                "users" : ['1234']
            });
            
            bot.bot.emit('deregistered');
            
            sinon.assert.calledOnce(bot.bot.roomInfo);
            
            sinon.assert.calledOnce(bot.bot.addDj);
            sinon.assert.notCalled(bot.bot.remDj);
            assert.equal(fillInDj.isDJing(), true);
            
            // restub with "full" room
            bot.bot.roomInfo = sinon.stub().callsArgWith(0, null, {
                "users" : ['1234', '123', '2334', '4244', '4124', 'abcd']
            });
            bot.bot.addDj = sinon.stub();
            bot.bot.remDj = sinon.stub();
            
            bot.bot.emit('deregistered');
            
            sinon.assert.calledOnce(bot.bot.roomInfo);
            
            sinon.assert.calledOnce(bot.bot.remDj);
            sinon.assert.notCalled(bot.bot.addDj);
            assert.equal(fillInDj.isDJing(), false);
        
        });
        
        it('should not respond on a "deregistered" if enabled, the room is not full, and it is already DJing', function () {
            
            fillInDj.enable();
            
            assert.equal(fillInDj.isEnabled(), true);
            assert.equal(fillInDj.isDJing(), false);
            bot.bot.roomInfo = sinon.stub().callsArgWith(0, null, {
                "users" : ['1234']
            });
            
            bot.bot.emit('roomChanged');
            
            sinon.assert.calledOnce(bot.bot.roomInfo);
            
            sinon.assert.calledOnce(bot.bot.addDj);
            sinon.assert.notCalled(bot.bot.remDj);
            assert.equal(fillInDj.isDJing(), true);
            
            // restub with "fuller" room
            bot.bot.roomInfo = sinon.stub().callsArgWith(0, null, {
                "users" : ['1234', '123', '2334', 'abcd']
            });
            bot.bot.addDj = sinon.stub();
            bot.bot.remDj = sinon.stub();
            
            bot.bot.emit('roomChanged');
            
            sinon.assert.calledOnce(bot.bot.roomInfo);
            
            sinon.assert.notCalled(bot.bot.remDj);
            sinon.assert.notCalled(bot.bot.addDj);
            assert.equal(fillInDj.isDJing(), true);
        
        });
        
        it('should not respond on a "registered" if enabled, the room is not full, and it is already DJing', function () {
            
            fillInDj.enable();
            
            assert.equal(fillInDj.isEnabled(), true);
            assert.equal(fillInDj.isDJing(), false);
            bot.bot.roomInfo = sinon.stub().callsArgWith(0, null, {
                "users" : ['1234']
            });
            
            bot.bot.emit('registered');
            
            sinon.assert.calledOnce(bot.bot.roomInfo);
            
            sinon.assert.calledOnce(bot.bot.addDj);
            sinon.assert.notCalled(bot.bot.remDj);
            assert.equal(fillInDj.isDJing(), true);
            
            // restub with "fuller" room
            bot.bot.roomInfo = sinon.stub().callsArgWith(0, null, {
                "users" : ['1234', '123', '2334', 'abcd']
            });
            bot.bot.addDj = sinon.stub();
            bot.bot.remDj = sinon.stub();
            
            bot.bot.emit('registered');
            
            sinon.assert.calledOnce(bot.bot.roomInfo);
            
            sinon.assert.notCalled(bot.bot.remDj);
            sinon.assert.notCalled(bot.bot.addDj);
            assert.equal(fillInDj.isDJing(), true);
        
        });
        
        it('should not respond on a "deregistered" if enabled, the room is not full, and it is already DJing', function () {
            
            fillInDj.enable();
            
            assert.equal(fillInDj.isEnabled(), true);
            assert.equal(fillInDj.isDJing(), false);
            bot.bot.roomInfo = sinon.stub().callsArgWith(0, null, {
                "users" : ['1234']
            });
            
            bot.bot.emit('deregistered');
            
            sinon.assert.calledOnce(bot.bot.roomInfo);
            
            sinon.assert.calledOnce(bot.bot.addDj);
            sinon.assert.notCalled(bot.bot.remDj);
            assert.equal(fillInDj.isDJing(), true);
            
            // restub with "fuller" room
            bot.bot.roomInfo = sinon.stub().callsArgWith(0, null, {
                "users" : ['1234', '123', '2334', 'abcd']
            });
            bot.bot.addDj = sinon.stub();
            bot.bot.remDj = sinon.stub();
            
            bot.bot.emit('deregistered');
            
            sinon.assert.calledOnce(bot.bot.roomInfo);
            
            sinon.assert.notCalled(bot.bot.remDj);
            sinon.assert.notCalled(bot.bot.addDj);
            assert.equal(fillInDj.isDJing(), true);
        
        });
        
        it('should start DJing if enabled and there is room', function () {
        
            bot.bot.roomInfo = sinon.stub().callsArgWith(0, null, {
                "users" : ['1234', '2345'],
            });
            
            fillInDj.enable();
            
            sinon.assert.calledOnce(bot.bot.roomInfo);
            sinon.assert.calledOnce(bot.bot.addDj);
            
        });
        
        it('should stop DJing if disabled while DJing', function () {
        
            bot.bot.roomInfo = sinon.stub().callsArgWith(0, null, {
                "users" : ['1234', '2345'],
            });
            
            fillInDj.enable();
            
            sinon.assert.calledOnce(bot.bot.roomInfo);
            sinon.assert.calledOnce(bot.bot.addDj);
            sinon.assert.notCalled(bot.bot.remDj);
            
            fillInDj.disable();
            
            sinon.assert.calledOnce(bot.bot.remDj);
            
        
        });
        
    });
    

}).call(this, require('assert'), require('sinon'), require('events'), require('util'),
    require('../lib/mixins/fillindj'));