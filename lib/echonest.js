(function (uuid, querystring, _) {
    
    var echonest = {};
    
    var STATUS_CODES = {
        UNKNOWN_ERROR : -1,
        SUCESSS : 0,
        MISSING_API_KEY : 1,
        NOT_ALLOWED : 2,
        RATE_LIMIT_EXCEEDED : 3,
        MISSING_PARAMETER : 4,
        INVALID_PARAMETER : 5
    };
    
    echonest.defaults = {
        hostname : 'developer.echonest.com',
        basePath : '/api/v4/'
    };
    
    var api = {};
    
    function apiMethod(method, url) {
        return function (data, callback) {
            return this.request(method, url, data, callback);
        };
    }
    
    function apiSuite(basePath, methods) {
        var result = {};
        _.each(methods, function (method) {
            result[method] = apiMethod('GET', basePath + method);
        });
        return result;
    }
    
    api.artist = apiSuite('artist/', ['biographies', 'blogs', 'familiarity', 'hotttnesss', 'images',
                'list_terms', 'news', 'profile', 'reviews', 'search', 'extract', 'songs', 'similar',
                'suggest', 'terms', 'top_hottt', 'top_terms', 'twitter', 'urls', 'video']);
    api.song = apiSuite('song/', ['search', 'profile', 'identify']);
    api.track = apiSuite('track/', ['analyze', 'profile', 'upload']);
    api.playlist = apiSuite('playlist/', ['basic', 'static', 'dynamic', 'static_info']);
    api.playlist.dynamic = apiSuite('playlist/dynamic/', ['create', 'restart', 'next', 'feedback',
                'steer', 'delete']);
    
    echonest.Client = function (options) {
        if (!(this instanceof echonest.Client)) {
            return new echonest.Client(options);
        }
        _.extend(this, echonest.defaults, options);
        this.baseParams = {
            api_key : this.api_key,
            format : 'json'
        };
        this.bindApi(api);
    };
    
    echonest.Client.prototype.log = function () {
        if (this.logger) {
            this.logger.log.apply(this.logger, arguments);
        }
    };
    
    echonest.Client.prototype.bindApi = function (api, context) {
        if (!context) {
            context = this;
        }
        _.each(api, function (value, key) {
            if (_.isFunction(value)) {
                context[key] = _.bind(value, this);
            } else if (_.isObject(value)) {
                context[key] = {};
                this.bindApi(value, context[key]);
            }
        }, this);
    };
    
    echonest.Client.prototype.getUrl = function (path, data) {
        return this.basePath + path + '?' + querystring.stringify(_.extend({}, this.baseParams, data));
    };
    
    echonest.Client.prototype.request = function (method, path, data, callback) {
        var self = this;
        var requestId = uuid.v4();
        var request = this.http.request({
                method : method,
                hostname : this.hostname,
                path : this.getUrl(path, data)
            }, function (response) {
                var responseText = '';
                response.setEncoding('utf8');
                
                self.log('info', 'response recieved', {
                    requestId : requestId,
                    'x-ratelimit-remaining' : response.headers['x-ratelimit-remaining'],
                    'x-ratelimit-limit' : response.headers['x-ratelimit-limit'],
                    'x-ratelimit-used' : response.headers['x-ratelimit-used'],
                    statusCode : response.statusCode
                });
                
                if (_.isFunction(callback)) {
                    if (response.statusCode >= 400) {
                        callback({
                            statusCode : response.statusCode
                        });
                    } else {
                        response.on('data', function (data) {
                            responseText += data;
                        });
                        response.on('end', function () {
                            try {
                                callback(null, JSON.parse(responseText));
                            } catch (e) {
                                callback(e);
                            }
                        });
                    }
                }
            });
        
        this.log('info', method + ' ' + request.path, {
            requestId : requestId
        });
        request.end();
        return request;
    };
    
    module.exports = echonest;
    
}).call(this, require('node-uuid'), require('querystring'), require('underscore'));
