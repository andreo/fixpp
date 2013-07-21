define(
    [
        "jquery"
        , "backbone"
        , "underscore"
        , "handlebars"
        , "text!./InputForm.html"
    ],
    function (
        $
        , Backbone
        , _
        , Handlebars
        , templateText
    ) {
        var Model = Backbone.Model.extend({
            defaults: {
                separator: "",
                message: ""
            }
        });

        var View = Backbone.View.extend({
            template: Handlebars.compile(templateText),
            model: Model,

            render: function () {
                var html = this.template(this.model.attributes);
                this.$el.html(html);
                return this;
            },

            initialise: function () {
                _.bindAll(this);
            },

            events: {
                'click #submit': 'submit',
                'paste #fix-message': 'delayedSubmit',
                'paste #separator': 'delayedSubmit',
            },

            submit: function () {
                this.model.set({
                    separator: $('#separator').val(),
                    message: $('#fix-message').val()
                });

                this.model.trigger('prettyPrint');
            },

            delayedSubmit: function () {
                setTimeout(this.submit, 100);
            }
        });

        return {
            Model: Model,
            View: View
        };
    });
