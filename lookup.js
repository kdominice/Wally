var WordPOS = require('wordpos'),
    wordpos = new WordPOS();
var _ = require('underscore');


    
    function addIng(verb) {
        if (verb.match(/[^i]e$/)) {
            return verb.replace(/e$/, 'ing');
        }
        if (verb.match(/[pm]$/)) {
            return verb + verb[verb.length - 1] + 'ing'
        }
        if (verb.match(/[^e]$/)) {
            return verb + 'ing'
        }
        return verb + '-ing';
    }
    
    console.log(['bop', 'dance', 'mosh', 'rock', 'jam', 'dougie', 'breakdance', 'headbang']);
    
    console.log(_.map(['bop', 'dance', 'mosh', 'rock', 'jam', 'dougie', 'breakdance', 'headbang'], addIng));