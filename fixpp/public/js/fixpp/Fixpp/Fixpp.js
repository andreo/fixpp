define(
    [
        "jquery"
        , "backbone"
        , "underscore"
        , "handlebars"
        , "fixpp/InputForm/InputForm"
        , "fixpp/FixMessage/FixMessage"
        , "text!./Fixpp.html"
    ],
    function ($, Backbone, _, Handlebars, InputForm, FixMessage, FixppText) {

        var FixMessageList = Backbone.Collection.extend({
            model: FixMessage.Model
        });

        function loadModel(key, model) {
            var value = localStorage.getItem(key);
            if (value) {
                model.set(JSON.parse(value));
            }
        }

        function saveModel(key, model) {
            localStorage.setItem(key, $.toJSON(model.toJSON()));
        }

        var Model = Backbone.Model.extend({
            defaults: {
                state: 'start'
            },

            initialize: function() {
                this.inputForm = new InputForm.Model();
                this.messageList = new FixMessageList();

                _.bindAll(this);

                var self = this;
                this.listenTo(this.inputForm, 'submit', function () {
                    self.set('state', 'submitting');
                });
                this.listenTo(this, 'change:state', this.onStateChange);
            },

            reset: function () {
                this.inputForm.clear();
                this.messageList.reset();
                this.clear();
            },

            serialize: function(foo) {
                foo("fixpp.InputForm", this.inputForm);
                foo("fixpp.FixMessageList", this.messageList);
                // foo("fixpp.Main", this);
            },

            load: function () {
                this.serialize(loadModel);
            },

            save: function() {
                this.serialize(saveModel);
            },

            updateModel: function (model) {
                this.messageList.reset(model.data);
                this.set('state', model.status == 'ok' ? 'succeeded' : 'error');
            },

            onStateChange: function (fixpp, state) {
                if (state == 'succeeded') {
                    Backbone.history.navigate('#local', { route: false });
                    this.save();
                }
                else if (state == 'submitting') {
                    this.submitting();
                }
            },

            submitting: function () {
                this.messageList.reset();
                $.ajax({
                    type: "POST",
                    url: "/fixpp",
                    processData: false,
                    data: $.toJSON(this.inputForm.toJSON()),
                    contentType: "application/json",
                    dataType: "json"
                })
                    .done(this.onData)
                    .fail(this.onError);
            },

            onData: function (response) {
                if (response.data.length == 0) {
                    response.data = [{error: "ERROR: no FIX messages found" }];
                }
                this.updateModel(response);
            },

            onError: function () {
                response.data = [{error: "HTTP request failed"}];
                this.updateModel(response);
            },

        });

        var View = Backbone.View.extend({
            
            template: Handlebars.compile(FixppText),
            
            initialize: function () {
                _.bindAll(this);

                this.listenTo(this.model, 'remove', this.remove);

                this.listenTo(this.model.messageList, {
                    'add': this.appendMessage,
                    'reset': this.renderMessages
                });
            },

            render: function () {
                this.$el.html(this.template());
                var inputForm = new InputForm.View({
                    el: this.$('.input-form'),
                    model: this.model.inputForm
                });
                inputForm.render();

                this.renderMessages(this.model.messageList);

                return this;
            },

            renderMessage: function (message) {
                var messageForm = new FixMessage.View({
                    tagName: 'li',
                    model: message
                });
                return messageForm.render().el;
            },

            appendMessage: function (message) {
                var messages = this.$('.messages');
                messages.append(this.renderMessage(message));
            },

            renderMessages: function (messages) {
                this.$('#result').html('<ul class="messages"></ul>');
                var list = this.$('.messages');
                // TODO: is messages.models an array?????
                for (var i = 0; i < messages.models.length; i++) {
                    var msgEl = $(this.renderMessage(messages.models[i]));
                    msgEl.hide();
                    list.append(msgEl);
                    msgEl.fadeIn("slow");
                }
            },
        });

        return {
            Model: Model,
            View: View,
            start: function () {

                var model = new Model();

                var Router = Backbone.Router.extend({

                    routes: {
                        '': 'local',
                        '/': 'local',
                        'local': 'local',
                        'new': 'new',
                        'persistent/:hash': 'persistent'
                    },

                    local: function () {
                        model.load();
                    },

                    new: function () {
                        model.reset();
                    },

                    persistent: function (hash) {
                    }
                });

                var router = new Router();
                Backbone.history.start();

                var view = new View({
                    el: $('body'),
                    model: model
                });
                view.render();
            }
        };
    });
