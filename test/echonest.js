(function (util, events, assert, echonest) {
    
    describe('echonest', function () {
        
        function MockResponse(options) {
            this.statusCode = options.statusCode;
            this.headers = options.headers;
            this.setEncoding = function (encoding) {
                this.encoding = 'utf8';
            };
            events.EventEmitter.call(this);
        }
        util.inherits(MockResponse, events.EventEmitter);
        
        function MockRequest(path) {
            this.path = path;
            this.end = function () {
                this.ended = true;
            };
        }
        
        it('should have valid defaults', function () {
            assert.equal(echonest.defaults.hostname, 'developer.echonest.com');
            assert.equal(echonest.defaults.basePath, '/api/v4/');
        });
        
        describe('Client', function () {
            
            var testApiKey = '123456';
            var http;
            var client;
            
            beforeEach(function () {
                http = {};
                http.request = function (args, callback) {
                    http.callback = callback;
                    return new MockRequest(args.path);
                };
                http.end = function () {
                    http.endCalled = true;
                };
                
                client = new echonest.Client({
                        http : http,
                        api_key : testApiKey
                    });
            });
            
            it('should return http responses it makes for api calls', function () {
                
                var request = client.song.search({
                        title : 'Midnight City',
                        artist : 'M83'
                    });
                
                assert.ok(request instanceof MockRequest,
                    'response.end() should have been called');
            });
            
            it('should return the parsed data the api service call returns', function (done) {
                
                client.song.search({
                    title : 'Midnight City',
                    artist : 'M83'
                }, function (error, response) {
                    assert.equal(error, null);
                    assert.deepEqual(response, {foo : 'bar'});
                    done();
                });
                
                var response = new MockResponse({
                        statusCode : 200,
                        headers : {
                            'x-ratelimit-remaining' : '45',
                            'x-ratelimit-limit' : '44',
                            'x-ratelimit-used' : '43'
                        }
                    });
                http.callback(response);
                
                response.emit('data', '{');
                response.emit('data', '"foo": "bar"');
                response.emit('data', '}');
                response.emit('end');
            });
            
            it('should return an error for service responses with status 4xx', function (done) {
                
                client.song.search({
                    title : 'Midnight City',
                    artist : 'M83'
                }, function (error, response) {
                    assert.ok(typeof response === 'undefined');
                    assert.deepEqual(error, {statusCode : 400});
                    done();
                });
                
                var response = new MockResponse({
                        statusCode : 400,
                        headers : {
                            'x-ratelimit-remaining' : '0',
                            'x-ratelimit-limit' : '2',
                            'x-ratelimit-used' : '43'
                        }
                    });
                http.callback(response);
                
                response.emit('data', '{');
                response.emit('data', '"foo": "bar"');
                response.emit('data', '}');
                response.emit('end');
            });
            
        });
    });
    
}).call(this, require('util'), require('events'), require('assert'), require('../lib/echonest'));
