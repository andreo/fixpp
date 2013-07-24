define(
    [
        "jquery"
        , "backbone"
        , "underscore"
        , "handlebars"
        , "fixpp/InputForm/InputForm"
        , "fixpp/FixMessage/FixMessage"
        , "text!./templates/Fixpp.html"
        , "text!./templates/FixError.html"
        , "text!./templates/NoFixMessagesFound.html"
    ],
    function ($, Backbone, _, Handlebars, InputForm, FixMessage, FixppText, FixErrorText, NoFixMessagesFoundText) {

        var fixErrorTemplate = Handlebars.compile(FixErrorText);
        var noFixMessagesFoundTemplate = Handlebars.compile(NoFixMessagesFoundText);
        
        var FixMessageList = Backbone.Collection.extend({
            model: FixMessage.Model
        });

        var Model = Backbone.Model.extend({
            initialize: function() {
                this.set('input', new InputForm.Model());
                this.set('result', new FixMessageList());
            }
        });

        var View = Backbone.View.extend({
            
            template: Handlebars.compile(FixppText),
            
            model: Model,
            
            initialize: function () {
                _.bindAll(this);
                this.model.get('input').on('prettyPrint', this.prettyPrint);
                this.model.get('result').on('add', this.appendMessage);
                this.model.get('result').on('reset', this.renderMessages);
                this.messageList = undefined;
            },

            render: function () {
                this.$el.html(this.template());
                var inputForm = new InputForm.View({
                    el: $('.input-form', this.$el),
                    model: this.model.get('input')
                });
                inputForm.render();
            },

            renderMessage: function (message) {
                var messageForm = new FixMessage.View({
                    tagName: 'li',
                    className: 'message',
                    model: message
                });
                return messageForm.render().el;
            },

            appendMessage: function (message) {
                var messages = $('.messages', this.$el);
                messages.append(this.renderMessage(message));
            },

            renderMessages: function (messages) {
                $('#result', this.$el).html('<ul class="messages"></ul>');
                var list = $('.messages', this.$el);
                // TODO: is messages.models an array?????
                for (var i = 0; i < messages.models.length; i++) {
                    var msgEl = $(this.renderMessage(messages.models[i]));
                    msgEl.hide();
                    list.append(msgEl);
                    msgEl.fadeIn("slow");
                }
            },

            prettyPrint: function () {
                this.model.get('result').reset();
                
                $.ajax({
                    type: "POST",
                    url: "/fixpp",
                    processData: false,
                    data: $.toJSON(this.model.get('input').attributes),
                    contentType: "application/json",
                    dataType: "json"
                })
                    .done(this.onData)
                    .fail(this.onFail);
            },

            onData: function (response) {
                var resultData;
                if (response.status == "ok") {
                    var list = response.data;
                    if (list.length == 0) {
                        resultData = noFixMessagesFoundTemplate();
                    }
                    else {
                        this.model.get('result').reset(list);
                        localStorage.setItem('fixpp', $.toJSON(this.model.toJSON()));
                        return ;
                    }
                }
                else {
                    resultData = fixErrorTemplate(response);
                }

                $('#result', this.$el)
                    .append(resultData)
                    .fadeIn("slow");
            },

            onFail: function () {
                $('#result', this.$el)
                    .append(fixErrorTemplate({
                        status: "error",
                        error: "HTTP request failed"
                    }))
                    .fadeIn("slow");
            }
        });

        // TODO: refactor model loading routine
        function loadModel(key) {
            var data = localStorage.getItem(key);
            if (data) {
                data = JSON.parse(data);
                return new Model({
                    input: new InputForm.Model(data.input),
                    result: new FixMessageList(data.result)
                });
            }
            else {
                return new Model();
            }
        }

        return {
            Model: Model,
            View: View,
            start: function () {
                var view = new View({
                    el: $('#main-view'),
                    model: loadModel('fixpp')
                });
                main.render();
            }
        };
    });
