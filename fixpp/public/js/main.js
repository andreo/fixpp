
requirejs.config({
    baseUrl: './js/',
    paths: {
	jquery: 'lib/jquery-1.9.1',
	backbone: 'lib/backbone',
	underscore: 'lib/underscore',
	vkbeautify: 'lib/vkbeautify.0.99.00.beta',
	hljs: 'lib/highlight.js/highlight.pack',
	handlebars: 'lib/handlebars',
	text: 'lib/text'
    },
    shim: {
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
	'jquery',
	'fixpp/TestModel'
    ],
    function ($, Model) {
	// 'fixpp/PlainText/PlainText',
	// 'fixpp/PrettyPrint/PrettyPrint'
	var view = window.location.hash.substring(1);
	requirejs(
	    [view],
	    function (View) {
		var view = new View.View({
		    model: Model,
		    el: $('body')
		});
		view.render();
	    });
    });
