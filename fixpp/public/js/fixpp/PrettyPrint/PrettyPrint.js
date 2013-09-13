define(
    ["jquery", "backbone", "vkbeautify", "hljs", "./PrettyPrintTemplate"],
    function ($, Backbone, vkbeautify, hljs, template) {

	function pprintXml(e) {
	    try {
		var text = $(e).text();
		var prettyXml = vkbeautify.xml(text, 4);
		$(e).text(prettyXml);
	    }
	    catch (error) {
		console.log(error);
	    }
	}

	function highlight(e) {
	    try {
		hljs.highlightBlock(e);
	    }
	    catch (error) {
		console.log(error);
	    }
	}
	
	var View = Backbone.View.extend({
	    
	    template: template,
	    
	    render: function () {
		this.$el.html(this.template(this.model).string);
		this.$('.fix-tag-value').each(
		    function (i, e) {
			pprintXml(e);
			highlight(e);
		    });
		return this;
	    }
	});

	return { View: View };
    });
