var LyricsWikiClient = (function (_, uuid, querystring) {
    
    function LyricsWikiClient(options) {
        _.extend(this, LyricsWikiClient.defaults, options);
    }
    
    LyricsWikiClient.defaults = {
        hostname : 'lyrics.wikia.com',
        basePath : '/api.php'
    };
    
    LyricsWikiClient.prototype.getUrl = function (path, data) {
        return this.basePath + path + '?' + querystring.stringify(data);
    };
    
    LyricsWikiClient.prototype.request = function (method, path, data, callback) {
        
        var self = this;
        var requestId = uuid.v4();
        var request = this.http.request({
                method : method,
                hostname : this.hostname,
                path : this.getUrl(path, data)
            }, function (response) {
                var responseText = '';
                response.setEncoding('utf8');
                
                self.logger.info('response recieved', {
                    requestId : requestId,
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
                            var text = responseText
                                .replace(/song = /, '')
                                .replace(/\'/g, '"')
                                .replace(/\\"/g, '\'');
                            try {
                                callback(null, JSON.parse(text));
                            } catch (e) {
                                callback(e);
                            }
                        });
                    }
                }
            });
        
        this.logger.info(method + ' ' + request.path, {
            requestId : requestId
        });
        request.end();
        return request;
    };
    
    _.each(['getSong'], function (func) {
        LyricsWikiClient.prototype[func] = function (options, callback) {
            var data = _.extend({
                    fmt : 'json',
                    func : func
                }, options);
            return this.request('GET', this.basePath, data, callback);
        };
    });
    
    return LyricsWikiClient;
    
}).call(this, require('underscore'), require('node-uuid'), require('querystring'));

module.exports = LyricsWikiClient;
