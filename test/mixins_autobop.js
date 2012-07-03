(function (assert, sinon, events, util, AutoBopper) {
    
    describe('autobop mixin', function () {
        
        var autoBopper;
        var bot;
        
        beforeEach(function () {
            autoBopper = new AutoBopper({
                    logger : {
                        info : sinon.stub()
                    }
                });
            
            function Bot() {
                events.EventEmitter.call(this);
            }
            util.inherits(Bot, events.EventEmitter);
            
            bot = {};
            
            bot.isBopping = sinon.stub().returns(false);
            bot.startBopping = sinon.stub();
            
            bot.bot = new Bot();
            
            autoBopper.initialize(bot);
            autoBopper.lastRoomMetadata = {
                "upvotes" : 10,
                "downvotes" : 0,
                "listeners" : 100,
                "votelog" : [["xxxxxxxxxxxxxxxxxxxxxxxx", "up"]]
            };
        });
        
        it('should load with default off and threshold of 75', function () {
            
            assert.equal(autoBopper.isEnabled(), false);
            assert.equal(autoBopper.getThreshold(), 75);
            
        });
        
        it('should bind new API methods to the parent bot', function () {
            
            assert.equal(autoBopper.isEnabled, bot.isAutoBopEnabled);
            assert.equal(autoBopper.getThreshold, bot.getAutoBopThreshold);
            
            assert.equal(bot.isAutoBopEnabled(), false);
            assert.equal(bot.getAutoBopThreshold(), 75);
            
        });
        
        it('should report it is are enabled after it is enabled', function () {
            
            bot.enableAutoBop(60);
            
            assert.equal(bot.isAutoBopEnabled(), true);
            
        });
        
        it('should report a new threshold if enabled with a new threshold', function () {
            
            bot.enableAutoBop(60);
            
            assert.equal(bot.getAutoBopThreshold(), 60);
            
        });
        
        it('should report it is disabled if it is disabled after being enabled', function () {
            
            bot.enableAutoBop(90);
            
            bot.disableAutoBop();
            
            assert.equal(bot.isAutoBopEnabled(), false);
            
        });
        
        it('should maintain its old threshold value if disabled', function () {
            
            bot.enableAutoBop(90);
            
            bot.disableAutoBop();
            
            assert.equal(bot.getAutoBopThreshold(), 90);
            
        });
        
        it('should not react to the "update_votes" event when it is not enabled', function () {
            
            bot.bot.emit('update_votes', null, {
                "command" : "update_votes",
                "room" : {
                    "metadata" : {
                        "upvotes" : 10,
                        "downvotes" : 0,
                        "listeners" : 188,
                        "votelog" : [["xxxxxxxxxxxxxxxxxxxxxxxx", "up"]]
                    }
                },
                "success" : true
            });
            
            sinon.assert.notCalled(bot.startBopping);
            
        });
        
        it('should not react to the "update_votes" event when it is enabled and the threshold is not high enough', function () {
            
            bot.enableAutoBop();
            
            bot.bot.emit('update_votes', null, {
                "command" : "update_votes",
                "room" : {
                    "metadata" : {
                        "upvotes" : 10,
                        "downvotes" : 0,
                        "listeners" : 188,
                        "votelog" : [["xxxxxxxxxxxxxxxxxxxxxxxx", "up"]]
                    }
                },
                "success" : true
            });
            
            sinon.assert.notCalled(bot.startBopping);
            
        });
        
        it('should not react to the "roomChanged" event when it is enabled and the threshold is not high enough', function () {
            
            bot.enableAutoBop();
            
            bot.bot.emit('roomChanged', null, {
                "room" : {
                    "metadata" : {
                        "upvotes" : 10,
                        "downvotes" : 0,
                        "listeners" : 188,
                        "votelog" : [["xxxxxxxxxxxxxxxxxxxxxxxx", "up"]]
                    }
                },
                "success" : true
            });
            
            sinon.assert.notCalled(bot.startBopping);
            
        });
        
        it('should start bopping if the "update_votes" event happens when is enabled and the threshold is met', function () {
            
            bot.enableAutoBop(75);
            
            bot.bot.emit('update_votes', null, {
                "command" : "update_votes",
                "room" : {
                    "metadata" : {
                        "upvotes" : 76,
                        "downvotes" : 0,
                        "listeners" : 100,
                        "votelog" : [["xxxxxxxxxxxxxxxxxxxxxxxx", "up"]]
                    }
                },
                "success" : true
            });
            
            sinon.assert.calledOnce(bot.startBopping);
            
        });
        
        it('should start bopping if the "roomChanged" event happens when is enabled and the threshold is met', function () {
            
            bot.enableAutoBop(75);
            
            bot.bot.emit('roomChanged', null, {
                "room" : {
                    "metadata" : {
                        "upvotes" : 76,
                        "downvotes" : 0,
                        "listeners" : 100,
                        "votelog" : [["xxxxxxxxxxxxxxxxxxxxxxxx", "up"]]
                    }
                },
                "success" : true
            });
            
            sinon.assert.calledOnce(bot.startBopping);
            
        });
        
        describe('meetsThreshold()', function () {
            
            it('should return true when the upvotes / listeners is greater than or equal to the configured threshold', function () {
                var result = autoBopper.meetsThreshold({
                        "upvotes" : 141,
                        "downvotes" : 0,
                        "listeners" : 188,
                        "votelog" : [["xxxxxxxxxxxxxxxxxxxxxxxx", "up"]]
                    });
                
                assert.equal(result, true);
            });
            
            it('should return false when the upvotes / listeners is less than the configured threshold', function () {
                var result = autoBopper.meetsThreshold({
                        "upvotes" : 140,
                        "downvotes" : 0,
                        "listeners" : 188,
                        "votelog" : [["xxxxxxxxxxxxxxxxxxxxxxxx", "up"]]
                    });
                
                assert.equal(result, false);
            });
            
        });
        
    });
    
}).call(this, require('assert'), require('sinon'), require('events'), require('util'),
    require('../lib/mixins/autobop'));
