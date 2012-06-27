/**
 * exports object based version, if you need to make a
 * circular dependency or need compatibility with
 * commonjs-like environments that are not Node.
 */
(function (define) {
    //The 'fn' is optional, but recommended if this is
    //a popular web library that is used mostly in
    //non-AMD/Node environments. However, if want
    //to make an anonymous module, remove the 'id'
    //below, and remove the id use in the define shim.
    define('fn', function (require, exports) {
        //If have dependencies, get them here
        var _ = require('underscore');
        
        var fn = {},
        transforms = {},
        matchers = {};
        
        // transforms are functions that return functions that transform an object.
        // useful for passing to things like map().
        transforms.property = _.memoize(function (propertyName) {
                return function (object) {
                    return object[propertyName];
                };
            });
        
        transforms.modelAttribute = _.memoize(function (attributeName) {
                return function (object) {
                    return object.get(attributeName);
                };
            });
        
        transforms.not = _.memoize(function () {
                return function (object) {
                    return !object;
                };
            });
        
        transforms.negate = _.memoize(function () {
                return function (object) {
                    return -object;
                };
            });
        
        transforms.toInteger = _.memoize(function () {
                return function (object) {
                    return parseInt(object, 10);
                };
            });
        
        // matchers are functions return functions that compare an object to a set of conditions.
        // userful for passing to bulk filtering functions.
        // should support partial application.
        matchers.eq = function (value, other) {
            if (arguments.length > 1) {
                return value === other;
            }
            return function (object) {
                return matchers.eq(value, object);
            };
        };
        
        matchers.neq = function (value, other) {
            if (arguments.length > 1) {
                return value !== other;
            }
            return function (object) {
                return matchers.neq(value, object);
            };
        };
        
        matchers['undefined'] = _.memoize(function (other) {
                if (arguments.length > 0) {
                    return _.isUndefined(other);
                }
                return function (object) {
                    return matchers['undefined'](object);
                };
            });
        
        matchers.defined = _.memoize(function (other) {
                if (arguments.length > 0) {
                    return !_.isUndefined(other);
                }
                return function (object) {
                    return matchers.defined(object);
                };
            });
        
        // do the mapping
        _.each(transforms, function (transform, transformName) {
            fn[transformName] = _.memoize(function () {
                    var result = transform.apply(this, arguments);
                    _.each(matchers, function (matcher, matcherName) {
                        result[matcherName] = function () {
                            var createdMatcher = matcher.apply(this, arguments);
                            return function (object) {
                                return createdMatcher(result(object));
                            };
                        };
                    });
                    return result;
                });
        });
        
        fn.transforms = transforms;
        
        //Attach properties to exports.
        exports.fn = fn;
        
        return fn;
    });
    
}).call(this, typeof define === 'function' && define.amd ? define : function (id, factory) {
    
    if (typeof exports !== 'undefined') {
        //commonjs
        factory(require, exports);
    } else {
        //Create a global function. Only works if
        //the code does not have dependencies, or
        //dependencies fit the call pattern below.
        factory(function (value) {
            console.log(value);
            return window[value];
        }, (window[id] = {}));
    }
});
