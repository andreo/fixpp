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
                message: "",
                persistent: false
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

                this.listenTo(this.model, 'remove', this.remove);
            },

            events: {
                'click #submit': 'submit',
                'click #persistent': 'submit',
                'paste #fix-message': 'delayedSubmit',
                'paste #separator': 'delayedSubmit',
            },

            submit: function () {
                this.model.set({
                    separator: this.$('#separator').val(),
                    message: this.$('#fix-message').val(),
                    persistent: this.$('#persistent').is(':checked')
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
