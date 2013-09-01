define(
    [
        "jquery"
        , "backbone"
        , "underscore"
        , "fixpp/Fixpp/Fixpp"
    ],
    function ($, Backbone, _, Fixpp) {
        return function () {

            var model = new Fixpp.Model();

            var Router = Backbone.Router.extend({

                routes: {
                    '': 'local',
                    '/': 'local',
                    'local': 'local',
                    'new': 'new',
                    'fixmessage/:hash': 'fixmessage'
                },

                local: function () {
                    model.load();
                },

                new: function () {
                    model.reset();
                },

                fixmessage: function (hash) {
                    model.loadFixmessage(hash);
                }
            });

            var router = new Router();
            Backbone.history.start();
            model.on('change:state', function (state) {
                if (state == 'succeeded') {
                    var hash = this.get('hash');
                    if (hash) {
                        Backbone.history.navigate('#fixmessage/'+hash, { route: false });
                    }
                    else {
                        Backbone.history.navigate('#local', { route: false });
                    }
                }
            });

            var view = new Fixpp.View({
                el: $('body'),
                model: model
            });
            view.render();
        }
    }
);
