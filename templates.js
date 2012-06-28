var templates = (function (_, Handlebars) {
    
    var registeredTemplates = {};
    
    var templates = {};
    
    templates.register = function (templateText, name) {
        registeredTemplates[name] = Handlebars.compile(templateText);
    };
    
    templates.render = function (name, argument) {
        var template = registeredTemplates[name];
        if (template) {
            return template(argument);
        }
    };
    
    templates.load = function (templateHash) {
        _.each(templateHash, templates.register);
    };
    
    function addIng(verb) {
        if (verb.match(/[^i]e$/)) {
            return verb.replace(/e$/, 'ing');
        }
        if (verb.match(/[pm]$/)) {
            return verb + verb[verb.length - 1] + 'ing';
        }
        if (verb.match(/[^e]$/)) {
            return verb + 'ing';
        }
        return verb + '-ing';
    }
    
    Handlebars.registerHelper('mention', function (item) {
        return '@' + item;
    });
    
    Handlebars.registerHelper('addIng', addIng);
    
    exports.templates = templates;

    return templates;
    
}).call(this, require('underscore'), require('handlebars'));
