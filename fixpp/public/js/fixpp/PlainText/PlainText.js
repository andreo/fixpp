
define(
    [
	'jquery',
	'backbone',
	'./BuildPlainText'
    ],
    function ($, Backbone, template) {

	var View = Backbone.View.extend({
	    template: template,
	    render: function () {
		this.$el.html(template(this.model));
		return this;
	    }
	});

	return { View: View };
    });
