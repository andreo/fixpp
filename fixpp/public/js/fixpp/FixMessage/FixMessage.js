
define(
    [
        "jquery"
        , "backbone"
        , "underscore"
        , "handlebars"
        , "fixpp/PlainText/PlainText"
        , "fixpp/PrettyPrint/PrettyPrint"
        , "text!./FixMessage.html"
    ],
    function ($, Backbone, _, Handlebars, PlainText, PrettyPrint, templateText) {

	var Model = Backbone.Model.extend({
	    defaults: {
		dictionary: '',
		message: ''
	    }
	});

	var View = Backbone.View.extend({

	    template: Handlebars.compile(templateText),

            model: Model,

            render: function () {
                this.$el.html(this.template(this.model.attributes));
                var renderType = $('#render-type', this.$el).val();
                this.renderWithType(renderType);
                return this;
            },

            renderMap: {
                text: PlainText,
                pretty: PrettyPrint
            },

            initialize: function () {
                _.bindAll(this);
            },

            events: {
                'click #collapse-button': 'collapse',
                'change #render-type': 'changeRenderType'
            },

            collapse: function () {
                $('.formatted-message', this.$el).slideToggle();
            },

            changeRenderType: function (evt) {
                var type = $(evt.target).val();
                this.renderWithType(type);
            },

            renderWithType: function (type) {
                var module = this.renderMap[type] || this.renderMap.pretty;
                var view = new module.View(
                    {
                        model: this.model.get('json'),
                        el: $('.formatted-message', this.$el)
                    });
                view.render();
            }
	});

	return {
	    Model: Model,
	    View: View
	};
    });
