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
                var html = this.template(this.model.toJSON());
                this.$el.html(html);
                return this;
            },

            initialize: function () {
                _.bindAll(this);
            },

            events: {
                'click #submit': 'submit',
                'paste #fix-message': 'delayedSubmit',
                'paste #separator': 'delayedSubmit',
            },

            submit: function () {
                this.model.set({
                    separator: this.$('#separator').val(),
                    message: this.$('#fix-message').val()
                });

                this.model.trigger('submit');
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
