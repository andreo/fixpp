
define(
    [
        "jquery"
        , "backbone"
        , "underscore"
        , "handlebars"
        , "fixpp/PlainText/PlainText"
        , "fixpp/PrettyPrint/PrettyPrint"
        , "text!./FixMessage.html"
        , "text!./Error.html"
    ],
    function ($, Backbone, _, Handlebars, PlainText, PrettyPrint, templateText, errorTemplateText) {

	var Model = Backbone.Model.extend({
	    defaults: {
		dictionary: '',
		json: ''
	    }
	});

	var View = Backbone.View.extend({

	    template: {
                ok: Handlebars.compile(templateText),
                error: Handlebars.compile(errorTemplateText)
            },

            model: Model,

            render: function () {
                if (this.model.get('error')) {
                    this.$el.html(this.template.error(this.model.toJSON()));
                }
                else {
                    this.$el.html(this.template.ok(this.model.toJSON()));
                    var renderType = this.$('#render-type').val();
                    this.renderWithType(renderType);
                }
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
                this.$('.formatted-message').slideToggle();
            },

            changeRenderType: function (evt) {
                var type = $(evt.target).val();
                this.renderWithType(type);
            },

            renderWithType: function (type) {
                var module = this.renderMap[type] || this.renderMap.pretty;

                if (this.view) {
                    this.view.remove();
                }
                var subView = new module.View(
                    {
                        model: this.model.get('json'),
                    });
                subView.listenTo(this, 'remove', subView.remove);
                subView.render();

                this.$('.formatted-message').append(subView.el);

                this.view = subView;
            }
	});

	return {
	    Model: Model,
	    View: View
	};
    });
