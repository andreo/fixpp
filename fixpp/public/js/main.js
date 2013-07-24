
requirejs.config({
    baseUrl: './js/',
    paths: {
        jquery: 'lib/jquery-1.9.1',
        backbone: 'lib/backbone',
        underscore: 'lib/underscore',
        vkbeautify: 'lib/vkbeautify.0.99.00.beta',
        hljs: 'lib/highlight.js/highlight.pack',
        handlebars: 'lib/handlebars',
        text: 'lib/text',
        'jquery.json': 'lib/jquery.json-2.4'
    },
    shim: {
        'jquery.json': {
            deps: ['jquery']
        },
        underscore: {
            exports: '_'
        },
        backbone: {
            deps: ['jquery', 'underscore'],
            exports: 'Backbone'
        },
        vkbeautify: {
            exports: 'vkbeautify'
        },
        hljs: {
            exports: 'hljs'
        },
        handlebars: {
            exports: 'Handlebars'
        }
    }
});

requirejs(
    [
        'jquery'
        , 'fixpp/Fixpp/Fixpp'
        , 'jquery.json'
    ],
    function ($, Fixpp) {
        Fixpp.start();
    });
